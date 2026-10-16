// config.js - shared configuration for every page.
// Load it right after the Supabase SDK:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="config.js"></script>

// The anon key is public by design; Row Level Security protects the data.
const SUPABASE_URL = 'https://bkawfexaikntyivqvetk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYXdmZXhhaWtudHlpdnF2ZXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMDU3ODAsImV4cCI6MjEwMjc4MTc4MH0.8YYkD8pzn97DeqA-o83KoGQ4yHb6WT1HB4DcoPPAMwA';
const SUPABASE_SCHEMA = 'French-schema';

if (!window.mySupabase && window.supabase) {
    window.mySupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        db: { schema: SUPABASE_SCHEMA }
    });
}

// AI settings saved from admin.html
const CONFIG = {
    getApiKey() {
        return localStorage.getItem('ai_api_key') || '';
    },
    getModelName() {
        return localStorage.getItem('ai_model_name') || 'openai/gpt-oss-120b';
    },
    getApiUrl() {
        return localStorage.getItem('ai_api_url') || 'https://api.groq.com/openai/v1/chat/completions';
    }
};

// ---------- AI through the server ----------
// Every AI request goes to the AI Edge Function, which holds the Groq key and counts each
// student's free uses (supabase/functions/ai). Until that function is deployed, the key saved
// on the Admin page in this browser is used directly, as before.
// Supabase keeps a function's address from when it was first created, so the app tries each of
// these names and remembers the one that answers ("smooth-handler" was an earlier deployment).
const AI_FUNCTION_NAMES = ['ai', 'smooth-handler'];
const AIServer = {
    missing: false,     // true once no function name answered (not deployed yet)
    problem: '',        // why, for the Admin page
    async request(body) {
        if (this.missing) return { notDeployed: true };
        let session = null;
        try { ({ data: { session } } = await window.mySupabase.auth.getSession()); } catch (e) {}
        if (!session) {
            if (CONFIG.getApiKey()) return { notDeployed: true };   // not signed in, but this browser has the Admin key
            return { status: 401, data: { error: 'Please sign in to use the AI features.', code: 'signin' } };
        }
        let known = '';
        try { known = sessionStorage.getItem('fs_ai_fn') || ''; } catch (e) {}
        const names = known ? [known, ...AI_FUNCTION_NAMES.filter(n => n !== known)] : AI_FUNCTION_NAMES;
        const problems = [];
        for (const name of names) {
            let res;
            try {
                res = await (AIServer._fetch || fetch)(SUPABASE_URL + '/functions/v1/' + name, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token, 'apikey': SUPABASE_ANON_KEY },
                    body: JSON.stringify(body)
                });
            } catch (err) {
                problems.push(`${name}: could not be reached (not deployed, or blocked before it started; check "Enforce JWT verification" is off)`);
                continue;
            }
            if (res.status === 404) { problems.push(`${name}: not found`); continue; }
            try { sessionStorage.setItem('fs_ai_fn', name); } catch (e) {}
            let data = {};
            try { data = await res.json(); } catch (e) {}
            if (!res.ok && data && !data.error) data.error = data.msg || data.message || `The AI service returned an error (${res.status}).`;
            if (!res.ok) this.problem = `${name} answered with ${res.status}: ${data.error}`;
            if (data && data.quota) LocalStore.set('ai_quota', { ...data.quota, at: Date.now() });
            return { ok: res.ok, status: res.status, data, fn: name };
        }
        this.problem = problems.join(' · ');
        if (CONFIG.getApiKey()) { this.missing = true; return { notDeployed: true }; }
        if (problems.every(p => p.endsWith('not found'))) return { status: 404, data: { error: 'AI is not set up yet. Please try again later.', code: 'setup' } };
        return { status: 0, data: { error: 'Could not reach the AI service. Check your connection and try again in a moment.' } };
    },
    // Free uses left, or null when unknown (not signed in, function not deployed)
    async quota() {
        const r = await this.request({ quota: true });
        return r.ok && r.data.quota ? r.data.quota : null;
    }
};
// Older pages (Reading, Listening, Translator, the classic pages) call Groq directly with the key
// from the Admin page. When this browser has no key they send "Bearer server": route those to the
// Edge Function and answer in the same shape.
(function () {
    const nativeFetch = window.fetch.bind(window);
    AIServer._fetch = nativeFetch;
    window.fetch = async function (input, init) {
        const auth = init && init.headers && (init.headers.Authorization || init.headers.authorization);
        if (auth !== 'Bearer server') return nativeFetch(input, init);
        let body = {};
        try { body = JSON.parse(init.body); } catch (e) {}
        const page = (location.pathname.split('/').pop() || 'page').replace('.html', '');
        const r = await AIServer.request({ messages: body.messages, temperature: body.temperature, json: !!body.response_format, feature: page });
        if (r.notDeployed) return new Response(JSON.stringify({ error: { message: 'AI is not set up yet: add the Groq API key on the Admin page, or deploy the AI function.' } }), { status: 503 });
        const ok = r.ok && r.data && r.data.choices;
        return new Response(JSON.stringify(ok ? { choices: r.data.choices } : { error: { message: (r.data && r.data.error) || 'AI error' } }), { status: ok ? 200 : (r.status || 500) });
    };
})();

// Logout: signs the user out of Supabase, then returns to the login page.
async function logout() {
    try { sessionStorage.removeItem('fs_role'); localStorage.removeItem('fs_profile'); } catch (e) {}
    try {
        if (window.mySupabase) await window.mySupabase.auth.signOut();
    } catch (err) {
        console.error('Logout error:', err);
    }
    window.location.href = 'login.html';
}

// Small storage helpers that never throw (private windows can block storage)
const LocalStore = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
};

// The signed-in student and their profile (level, goal, name).
// Saved in the profiles table, with a copy on this device so pages work before the SQL is run.
const Account = {
    EDITABLE: ['display_name', 'level', 'goal', 'onboarded_at'],
    local() { return LocalStore.get('fs_profile', {}); },
    async session() {
        try {
            const { data } = await window.mySupabase.auth.getSession();
            return data ? data.session : null;
        } catch (e) { return null; }
    },
    async profile() {
        const local = this.local();
        const session = await this.session();
        if (!session) return { user: null, profile: local };
        let profile = { ...local };
        try {
            const { data, error } = await window.mySupabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
            if (!error && data) {
                Object.keys(data).forEach(k => { if (data[k] !== null && data[k] !== undefined) profile[k] = data[k]; });
                try { sessionStorage.setItem('fs_role', data.role || ''); } catch (e) {}
            }
        } catch (e) { /* profiles not reachable: use the device copy */ }
        if (!profile.display_name && session.user.user_metadata) profile.display_name = session.user.user_metadata.display_name || session.user.user_metadata.full_name || '';
        const keep = {};
        this.EDITABLE.forEach(k => { if (profile[k]) keep[k] = profile[k]; });
        LocalStore.set('fs_profile', { ...local, ...keep });
        return { user: session.user, profile };
    },
    async save(fields) {
        const clean = {};
        this.EDITABLE.forEach(k => { if (fields[k] !== undefined) clean[k] = fields[k]; });
        LocalStore.set('fs_profile', { ...this.local(), ...clean });
        const session = await this.session();
        if (!session) return;
        const db = window.mySupabase;
        const row = { ...clean, updated_at: new Date().toISOString() };
        try {
            const { data, error } = await db.from('profiles').update(row).eq('id', session.user.id).select('id');
            if (error) throw error;
            if (!data || !data.length) {
                const ins = await db.from('profiles').insert({ id: session.user.id, email: session.user.email, ...row });
                if (ins.error) throw ins.error;
            }
        } catch (e) {
            console.warn('Profile saved on this device only (run supabase/accounts/01_profiles.sql).', e.message || e);
        }
    },
    isOnboarded(profile) { return !!(profile && profile.level); }
};

// Days you practised, for the streak on the Today screen (kept on this device for now)
const Activity = {
    key: 'fs_activity',
    day(d = new Date()) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    record() {
        const days = LocalStore.get(this.key, {});
        const today = this.day();
        days[today] = (days[today] || 0) + 1;
        const keys = Object.keys(days).sort();
        keys.slice(0, Math.max(0, keys.length - 400)).forEach(k => delete days[k]);
        LocalStore.set(this.key, days);
    },
    today() { return LocalStore.get(this.key, {})[this.day()] || 0; },
    streak() {
        const days = LocalStore.get(this.key, {});
        const d = new Date();
        if (!days[this.day(d)]) d.setDate(d.getDate() - 1);   // today not started yet: count up to yesterday
        let n = 0;
        while (days[this.day(d)]) { n += 1; d.setDate(d.getDate() - 1); }
        return n;
    }
};

// One header for every page: <header id="app-header"></header>
const APP_NAV = [
    ['index.html', 'Home'], ['vocab.html', 'Vocab'], ['lesson.html', 'Grammar'], ['conjugations.html', 'Conjugations'],
    ['reading.html', 'Reading'], ['listening.html', 'Listening'], ['writing.html', 'Writing'],
    ['speaking.html', 'Speaking'], ['translator.html', 'Translator']
];
function renderAppHeader() {
    const header = document.getElementById('app-header');
    if (!header) return;
    let page = location.pathname.split('/').pop() || 'index.html';
    if (page === 'writing-classic.html') page = 'writing.html';   // old pages, kept for comparison
    if (page === 'speaking-classic.html') page = 'speaking.html';
    if (page === 'reading-classic.html') page = 'reading.html';
    if (page === 'listening-classic.html') page = 'listening.html';
    const flag = '<span class="inline-flex overflow-hidden rounded-[3px] shadow-sm shrink-0" style="width:1.5rem;height:1rem" role="img" aria-label="French flag"><span class="flex-1" style="background:#0055a4"></span><span class="flex-1" style="background:#ffffff"></span><span class="flex-1" style="background:#ef4135"></span></span>';
    header.className = 'bg-white border-b border-slate-200 sticky top-0 z-50 shrink-0';
    header.innerHTML = `
        <div class="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
            <a href="index.html" class="shrink-0 flex items-center gap-2 font-black text-slate-900 mr-2">${flag}<span class="hidden xl:inline">Apprendre le Français</span></a>
            <nav class="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto text-sm font-semibold" style="scrollbar-width:none" aria-label="Main">
                ${APP_NAV.map(([href, label]) => `<a href="${href}" class="shrink-0 px-3 py-1.5 rounded-lg ${href === page ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"${href === page ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
            </nav>
            <a href="admin.html" class="shrink-0 text-sm font-semibold text-slate-600 hover:text-indigo-700 px-2 py-1.5 rounded-lg hover:bg-slate-100" style="display:none">Admin</a>
            <button id="logoutBtn" type="button" class="shrink-0 text-sm font-semibold text-slate-600 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-slate-100">Log out</button>
        </div>`;
    // Small screens: the menu scrolls sideways, so fade its edge and show the current page
    if (!document.getElementById('app-header-style')) {
        const st = document.createElement('style');
        st.id = 'app-header-style';
        st.textContent = '[role=tablist]{scrollbar-width:none}[role=tablist]::-webkit-scrollbar{display:none}#app-header nav::-webkit-scrollbar{display:none}@media (max-width:1023px){#app-header nav{-webkit-mask-image:linear-gradient(to right,#000 82%,transparent);mask-image:linear-gradient(to right,#000 82%,transparent)}}';
        document.head.appendChild(st);
    }
    const nav = header.querySelector('nav');
    const active = nav.querySelector('[aria-current="page"]');
    if (active) {
        const left = active.getBoundingClientRect().left - nav.getBoundingClientRect().left;
        if (left + active.offsetWidth > nav.clientWidth) nav.scrollLeft = left - 8;
    }
}

// Wire every Logout button (id="logoutBtn" or data-logout) on page load,
// and show the Admin links only to admins.
document.addEventListener('DOMContentLoaded', () => {
    renderAppHeader();
    document.querySelectorAll('#logoutBtn, [data-logout]').forEach((btn) => {
        btn.addEventListener('click', logout);
    });
    const adminLinks = document.querySelectorAll('a[href="admin.html"]');
    let role = '';
    try { role = sessionStorage.getItem('fs_role') || ''; } catch (e) {}
    const isAdmin = (r) => String(r || '').trim().toLowerCase() === 'admin';
    adminLinks.forEach(a => { a.style.display = isAdmin(role) ? '' : 'none'; });
    if (adminLinks.length && window.mySupabase) {
        Account.profile().then(({ profile }) => {
            adminLinks.forEach(a => { a.style.display = profile && isAdmin(profile.role) ? '' : 'none'; });
        });
    }
});

// ---------- Install as an app (phones and computers) ----------
// Registers sw.js (offline copies of the pages) and powers any [data-install] button:
// Android / Chrome / Edge show their install prompt; on iPhone we explain Share > Add to Home Screen.
const InstallApp = (function () {
    let prompt = null;
    const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const ios = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const show = () => document.querySelectorAll('[data-install]').forEach(b => b.classList.toggle('hidden', standalone() || !(prompt || ios())));
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); prompt = e; show(); });
    window.addEventListener('appinstalled', () => { prompt = null; show(); });
    document.addEventListener('click', async (e) => {
        const b = e.target.closest('[data-install]');
        if (!b) return;
        if (prompt) { prompt.prompt(); try { await prompt.userChoice; } catch (err) {} prompt = null; show(); return; }
        if (ios()) alert('To install on iPhone or iPad:\n\n1. Tap the Share button (the square with an arrow) at the bottom of Safari.\n2. Choose "Add to Home Screen".\n3. Tap "Add".\n\nThe app then opens from its own icon, full screen.');
    });
    document.addEventListener('DOMContentLoaded', show);
    return { show, standalone };
})();
