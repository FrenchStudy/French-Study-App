// supabase/functions/ai/index.ts - the one door to the AI for every student.
//
// The Groq key lives here as a secret (GROQ_API_KEY), never in the browser.
// The app sends { messages, json, temperature, session, feature } with the student's sign-in token.
// This function checks who it is, counts their use, calls Groq and returns { content, quota }.
//
// What counts as one "use": one activity (session). A writing check, a new question or a sample
// answer is one activity; a whole conversation (many messages) is also one activity.
//
// Limits (all can be changed under Edge Functions > Secrets, no code change needed):
//   FREE_USES       activities a free account can start in total          (default 5)
//   DAILY_LIMIT     activities a premium account can start per day         (default 100)
//   SESSION_LIMIT   AI requests inside one activity                        (default 40)
//   GROQ_MODEL      model name                                             (default openai/gpt-oss-120b)
// Admins (profiles.role = 'admin') have no limits. Premium = profiles.is_premium.
//
// Written without TypeScript-only syntax so the same rules can be tested with Node.

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export function settings(env) {
    const num = (k, d) => { const n = Number(env(k)); return Number.isFinite(n) && n >= 0 ? n : d; };
    return {
        freeUses: num('FREE_USES', 5),
        dailyLimit: num('DAILY_LIMIT', 100),
        sessionLimit: num('SESSION_LIMIT', 40),
        model: env('GROQ_MODEL') || 'openai/gpt-oss-120b',
        groqUrl: env('GROQ_URL') || 'https://api.groq.com/openai/v1/chat/completions',
        groqKey: env('GROQ_API_KEY') || ''
    };
}

const reply = (status, body) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// deps: { env(name), userFromToken(token), store: { profile, used, usedToday, session, start, bump }, groq(body) }
export async function handle(req, deps) {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
    if (req.method !== 'POST') return reply(405, { error: 'Use POST.' });
    const cfg = settings(deps.env);

    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const user = token ? await deps.userFromToken(token) : null;
    if (!user) return reply(401, { error: 'Please sign in to use the AI features.', code: 'signin' });

    let body;
    try { body = await req.json(); } catch (e) { return reply(400, { error: 'The request could not be read.' }); }

    const profile = (await deps.store.profile(user.id)) || {};
    const admin = profile.role === 'admin';
    const premium = !!profile.is_premium;
    const used = await deps.store.used(user.id);
    const quota = { used, free: cfg.freeUses, left: Math.max(0, cfg.freeUses - used), premium, admin, unlimited: admin || premium };

    // "How many free uses are left?" costs nothing
    if (body.quota) return reply(200, { quota });

    const messages = Array.isArray(body.messages) ? body.messages
        .filter(m => m && typeof m.content === 'string' && ['system', 'user', 'assistant'].includes(m.role))
        .map(m => ({ role: m.role, content: m.content.slice(0, 20000) })) : [];
    if (!messages.length) return reply(400, { error: 'Nothing to send to the AI.' });
    if (!cfg.groqKey) return reply(500, { error: 'The AI key is not set on the server yet (GROQ_API_KEY).', code: 'setup' });

    const session = String(body.session || '').slice(0, 80) || ('call-' + crypto.randomUUID());
    const feature = String(body.feature || '').slice(0, 40) || null;
    const existing = await deps.store.session(user.id, session);

    if (existing) {
        if (!admin && existing.calls >= cfg.sessionLimit) {
            return reply(429, { error: 'This activity has reached its length limit. Start a new one to continue.', code: 'session', quota });
        }
    } else if (!admin) {
        if (!premium && used >= cfg.freeUses) {
            return reply(402, { error: `You have used your ${cfg.freeUses} free AI activities. Subscribe to keep using the AI features; lessons, flashcards and shadowing stay free.`, code: 'quota', quota });
        }
        if (premium && (await deps.store.usedToday(user.id)) >= cfg.dailyLimit) {
            return reply(429, { error: 'You have reached today\'s AI limit. It resets tomorrow.', code: 'daily', quota });
        }
    }

    // Ask Groq
    const groqBody = { model: cfg.model, messages, temperature: Math.min(1.5, Math.max(0, Number(body.temperature ?? 0.6) || 0)) };
    if (body.json) groqBody.response_format = { type: 'json_object' };
    let res;
    try {
        res = await deps.groq(cfg, groqBody);
    } catch (e) {
        return reply(502, { error: 'Could not reach the AI service. Please try again.' });
    }
    if (res.status === 429) return reply(503, { error: 'The AI is busy right now. Please wait a minute and try again.', code: 'busy' });
    if (!res.ok) return reply(502, { error: `The AI service returned an error (${res.status}).` });
    const data = await res.json();
    const content = String(data?.choices?.[0]?.message?.content || '').trim();

    // Count it only once the AI has answered
    if (existing) await deps.store.bump(user.id, session);
    else await deps.store.start(user.id, session, feature);
    const nowUsed = existing ? used : used + 1;
    const newQuota = { ...quota, used: nowUsed, left: Math.max(0, cfg.freeUses - nowUsed) };

    // Same shape as Groq/OpenAI too, so older pages can read it unchanged
    return reply(200, { content, quota: newQuota, choices: [{ message: { role: 'assistant', content } }] });
}

// ---------- Supabase wiring (only runs on Supabase) ----------
if (typeof Deno !== 'undefined') {
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const env = (k) => Deno.env.get(k);
    // Supabase provides the server key automatically: older projects as SUPABASE_SERVICE_ROLE_KEY,
    // newer ones in SUPABASE_SECRET_KEYS (a JSON list with a "default" key)
    let serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceKey) { try { serviceKey = JSON.parse(env('SUPABASE_SECRET_KEYS') || '{}').default; } catch (e) { serviceKey = ''; } }
    const db = createClient(env('SUPABASE_URL'), serviceKey, {
        db: { schema: 'French-schema' }, auth: { persistSession: false, autoRefreshToken: false }
    });
    const table = () => db.from('ai_usage');
    const deps = {
        env,
        async userFromToken(token) {
            const { data, error } = await db.auth.getUser(token);
            return error ? null : data.user;
        },
        store: {
            async profile(id) {
                const { data } = await db.from('profiles').select('role, is_premium').eq('id', id).maybeSingle();
                return data;
            },
            async used(id) {
                const { count } = await table().select('session', { count: 'exact', head: true }).eq('user_id', id);
                return count || 0;
            },
            async usedToday(id) {
                const since = new Date(); since.setUTCHours(0, 0, 0, 0);
                const { count } = await table().select('session', { count: 'exact', head: true }).eq('user_id', id).gte('created_at', since.toISOString());
                return count || 0;
            },
            async session(id, session) {
                const { data } = await table().select('calls').eq('user_id', id).eq('session', session).maybeSingle();
                return data;
            },
            async start(id, session, feature) {
                await table().upsert({ user_id: id, session, feature, calls: 1 }, { onConflict: 'user_id,session' });
            },
            async bump(id, session) {
                const { data } = await table().select('calls').eq('user_id', id).eq('session', session).maybeSingle();
                await table().update({ calls: ((data && data.calls) || 0) + 1, updated_at: new Date().toISOString() }).eq('user_id', id).eq('session', session);
            }
        },
        groq: (cfg, body) => fetch(cfg.groqUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.groqKey}` },
            body: JSON.stringify(body)
        })
    };
    Deno.serve((req) => handle(req, deps));
}
