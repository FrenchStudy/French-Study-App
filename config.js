// config.js - shared configuration for every page.
// Load it right after the Supabase SDK:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="config.js"></script>

// The Supabase address and public key are not stored in GitHub. They are kept as repository
// secrets and written in here when the site is published (.github/workflows/pages.yml runs
// tools/build-site.sh). The key is still public by design: every visitor's browser receives it,
// and Row Level Security protects the data.
const SUPABASE_URL = '__SUPABASE_URL__';
const SUPABASE_ANON_KEY = '__SUPABASE_ANON_KEY__';
const SUPABASE_SCHEMA = 'French-schema';

if (!window.mySupabase && window.supabase) {
    if (/^https:\/\//.test(SUPABASE_URL)) {
        window.mySupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            db: { schema: SUPABASE_SCHEMA }
        });
    } else {
        console.warn('Supabase is not set up in this copy of config.js. Build the site with tools/build-site.sh.');
    }
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
    // Level tabs each page remembers: forgotten when your level changes, so every page opens at the new level
    LEVEL_TABS: ['vocab_level', 'reading_level', 'listening_level', 'writing_level', 'lk_level_grammar'],
    levelChanged(from, to) {
        if (!to || from === to) return;
        try { this.LEVEL_TABS.forEach(k => localStorage.removeItem(k)); } catch (e) {}
    },
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
        if (local.level) this.levelChanged(local.level, keep.level);   // changed on another device
        LocalStore.set('fs_profile', { ...local, ...keep });
        return { user: session.user, profile };
    },
    async save(fields) {
        const clean = {};
        this.EDITABLE.forEach(k => { if (fields[k] !== undefined) clean[k] = fields[k]; });
        this.levelChanged(this.local().level, clean.level);
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
    const flag = '<span class="inline-flex overflow-hidden rounded-[3px] shadow-sm shrink-0" style="width:1.5rem;height:1rem" aria-hidden="true"><span class="flex-1" style="background:#0055a4"></span><span class="flex-1" style="background:#ffffff"></span><span class="flex-1" style="background:#ef4135"></span></span>';
    header.className = 'bg-white border-b border-slate-200 sticky top-0 z-50 shrink-0';
    header.innerHTML = `
        <div class="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
            <a href="index.html" aria-label="Home: Apprendre le Français" class="shrink-0 flex items-center gap-2 font-black text-slate-900 mr-2">${flag}<span class="hidden 2xl:inline">Apprendre le Français</span></a>
            <nav class="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto text-sm font-semibold" style="scrollbar-width:none" aria-label="Main">
                ${APP_NAV.map(([href, label]) => `<a href="${href}" class="shrink-0 px-3 py-1.5 rounded-lg ${href === page ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"${href === page ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
            </nav>
            <a href="admin.html" class="shrink-0 text-sm font-semibold px-2 py-1.5 rounded-lg ${page === 'admin.html' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-indigo-700 hover:bg-slate-100'}"${page === 'admin.html' ? ' aria-current="page"' : ''} style="display:none">Admin</a>
            <button id="logoutBtn" type="button" class="shrink-0 text-sm font-semibold text-slate-600 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-slate-100">Log out</button>
        </div>`;
    // Keyboard users: a "Skip to content" link, shown when it gets focus
    const main = document.querySelector('main');
    if (main && !document.getElementById('skip-link')) {
        if (!main.id) main.id = 'main-content';
        if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
        main.classList.add('focus:outline-none');
        const skip = document.createElement('a');
        skip.id = 'skip-link'; skip.href = '#' + main.id; skip.textContent = 'Skip to content';
        skip.className = 'sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-white focus:text-indigo-700 focus:font-bold focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg';
        header.before(skip);
    }
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
    GuestBanner.show();
});

// ---------- Who runs the site: shown on the legal pages and in the footer ----------
// Leave email empty to use the contact form (contact.html) instead of showing an address.
const SITE = {
    brand: 'Apprendre le Français',
    email: '',                          // e.g. hello@your-domain.com (optional)
    updated: 'October 21, 2026'         // change when the Terms or Privacy policy change
};
const contactHref = (topic) => SITE.email ? 'mailto:' + SITE.email : 'contact.html' + (topic ? '?topic=' + topic : '');
const SiteInfo = {
    fill() {
        document.querySelectorAll('[data-site]').forEach(el => {
            const k = el.dataset.site;
            if (k === 'email-link') { el.textContent = SITE.email || 'our contact form'; el.href = contactHref(el.dataset.topic); }
            else if (SITE[k] !== undefined) el.textContent = SITE[k];
        });
    },
    // Terms · Privacy · Contact at the end of every page
    footer() {
        if (document.getElementById('site-footer')) return;
        const host = document.getElementById('scroller') || document.querySelector('main') || document.body;
        const f = document.createElement('footer');
        f.id = 'site-footer';
        f.className = 'max-w-6xl mx-auto w-full px-4 py-6 text-xs text-slate-500 flex flex-wrap items-center justify-center gap-x-4 gap-y-2';
        f.innerHTML = `<span>© ${new Date().getFullYear()} ${SITE.brand}</span>
            <a href="terms.html" class="hover:text-indigo-700 underline-offset-2 hover:underline">Terms</a>
            <a href="privacy.html" class="hover:text-indigo-700 underline-offset-2 hover:underline">Privacy</a>
            <a href="${contactHref()}" class="hover:text-indigo-700 underline-offset-2 hover:underline">Contact</a>`;
        host.appendChild(f);
    }
};
document.addEventListener('DOMContentLoaded', () => { SiteInfo.fill(); SiteInfo.footer(); });

// ---------- "Please sign in" messages get a Sign in link, wherever a page shows them ----------
const SignInLinks = {
    start() {
        if (!window.MutationObserver || !document.body) return;
        const fix = (root) => {
            const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            const hits = [];
            while (walk.nextNode()) if (/Please sign in to/.test(walk.currentNode.nodeValue)) hits.push(walk.currentNode.parentElement);
            hits.forEach(el => {
                if (!el || el.closest('a, button, textarea, [data-signin]') || el.querySelector('[data-signin]')) return;
                const a = document.createElement('a');
                a.href = 'login.html'; a.dataset.signin = '1'; a.textContent = 'Sign in';
                a.className = 'ml-1 font-bold underline';
                el.append(' ', a);
            });
        };
        new MutationObserver((list) => list.forEach(m => {
            const el = m.target.nodeType === 1 ? m.target : m.target.parentElement;
            if (el && !el.closest('[data-signin]')) fix(el);
        })).observe(document.body, { childList: true, characterData: true, subtree: true });
    }
};
document.addEventListener('DOMContentLoaded', () => SignInLinks.start());

// ---------- Visitors who are not signed in ----------
// Free pages work for everyone; a banner explains what signing in adds, and "Log out" becomes "Sign in".
const GuestBanner = {
    async show() {
        const page = location.pathname.split('/').pop() || 'index.html';
        if (['login.html', 'reset.html', 'welcome.html'].includes(page) || !window.mySupabase) return;
        if (await Account.session()) return;
        const out = document.getElementById('logoutBtn');
        if (out) {
            const a = document.createElement('a');
            a.href = 'login.html'; a.textContent = 'Sign in';
            a.className = 'shrink-0 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg';
            out.replaceWith(a);
        }
        if (['terms.html', 'privacy.html', 'contact.html'].includes(page)) return;   // legal and contact pages: Sign in button, no banner
        let hidden = false;
        try { hidden = sessionStorage.getItem('fs_guest_banner') === 'hidden'; } catch (e) {}
        const header = document.getElementById('app-header');
        if (hidden || !header || document.getElementById('guest-banner')) return;
        const bar = document.createElement('div');
        bar.id = 'guest-banner';
        bar.setAttribute('role', 'status');
        bar.className = 'shrink-0 bg-indigo-50 border-b border-indigo-100 text-indigo-900 text-sm';
        bar.innerHTML = `<div class="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span class="flex-1 min-w-[14rem]">👋 You're trying the app as a guest. Lessons, flashcards and verb tables are free. <b>Sign in to save your progress</b> and to get 5 free AI uses.</span>
            <a href="login.html?mode=signup" class="font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-3 py-1.5">Create a free account</a>
            <a href="login.html" class="font-semibold text-indigo-700 hover:underline">Sign in</a>
            <button type="button" class="w-8 h-8 rounded-lg text-indigo-400 hover:bg-indigo-100 hover:text-indigo-700" aria-label="Hide this message">✕</button></div>`;
        bar.querySelector('button').addEventListener('click', () => { bar.remove(); try { sessionStorage.setItem('fs_guest_banner', 'hidden'); } catch (e) {} });
        header.insertAdjacentElement('afterend', bar);
    }
};

// ---------- Progress that follows you to every device ----------
// Progress lives on this device (localStorage) so pages work offline. When you are signed in, each
// kind of progress is also kept in your account (user_progress, module_type 'state', column data),
// and on another device the two copies are combined so nothing is lost.
const ProgressSync = (function () {
    const byId = (cap) => (a, b) => {   // lists of items with an id: keep both, this device first
        const seen = new Set(), out = [];
        [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])].forEach(x => { if (x && x.id && !seen.has(x.id)) { seen.add(x.id); out.push(x); } });
        return out.slice(0, cap);
    };
    const perKey = (pick) => (a, b) => {
        const out = { ...(b || {}) };
        Object.entries(a || {}).forEach(([k, v]) => { out[k] = k in out ? pick(v, out[k]) : v; });
        return out;
    };
    const latest = perKey((x, y) => ((x && x.at) || 0) >= ((y && y.at) || 0) ? x : y);
    // How to combine the copy on this device (a) with the copy in the account (b)
    const KEYS = {
        lessons_done: perKey((x, y) => x || y),
        vocab_progress: perKey((x, y) => ((x.box || 0) > (y.box || 0) || ((x.box || 0) === (y.box || 0) && (x.due || 0) >= (y.due || 0))) ? x : y),
        vocab_words: perKey((x) => x),
        vocab_hooks: perKey((x) => x),
        vocab_topic_stats: perKey((x, y) => ((x.known || 0) >= (y.known || 0) ? x : y)),
        fs_activity: perKey((x, y) => Math.max(Number(x) || 0, Number(y) || 0)),
        conj_practice: (a, b) => ((a && a.total) || 0) >= ((b && b.total) || 0) ? a : b,
        writing_results: latest,
        writing_drafts: perKey((x) => x),
        writing_samples: perKey((x) => x),
        writing_own: byId(40),
        speak_results: latest,
        speak_samples: perKey((x) => x),
        speak_scenes: perKey((x, y) => String(x) >= String(y) ? x : y),
        speak_shadow: perKey((x, y) => ((x.best || 0) >= (y.best || 0) ? x : y)),
        speak_tasks: byId(30),
        lib_results: latest,
        lib_mine: byId(40)
    };
    const read = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
    const nativeSet = Storage.prototype.setItem;
    let user = null, ready = false, dirty = new Set(), timer = null, applying = false;
    const table = () => window.mySupabase.from('user_progress');

    async function push() {
        timer = null;
        if (!user || !dirty.size) return;
        const keys = [...dirty]; dirty.clear();
        const rows = keys.map(k => ({ user_id: user.id, module_type: 'state', module_id: k, completed: true, data: read(k), updated_at: new Date() }))
            .filter(r => r.data !== null && JSON.stringify(r.data).length < 1400000);
        if (!rows.length) return;
        try {
            const { error } = await table().upsert(rows, { onConflict: 'user_id, module_type, module_id' });
            if (error) keys.forEach(k => dirty.add(k));   // try again on the next change
        } catch (e) { keys.forEach(k => dirty.add(k)); }
    }
    function markDirty(k) {
        if (applying || !(k in KEYS)) return;
        dirty.add(k);
        if (ready && user && !timer) timer = setTimeout(push, 2500);
    }
    // Every save on this device marks that kind of progress for upload
    Storage.prototype.setItem = function (k, v) {
        nativeSet.call(this, k, v);
        try { if (this === window.localStorage) markDirty(k); } catch (e) {}
    };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && timer) { clearTimeout(timer); push(); } });

    async function start() {
        const page = (location.pathname.split('/').pop() || 'index.html');
        if (['login.html', 'reset.html'].includes(page) || !window.mySupabase) return;
        try {
            const { data } = await window.mySupabase.auth.getUser();
            user = data && data.user;
        } catch (e) { user = null; }
        if (!user) return;
        // Someone else's progress on this shared device is not mixed into this account
        const owner = read('fs_progress_owner');
        applying = true;
        if (owner && owner !== user.id) Object.keys(KEYS).forEach(k => localStorage.removeItem(k));
        nativeSet.call(localStorage, 'fs_progress_owner', JSON.stringify(user.id));
        applying = false;
        let rows = [];
        try {
            const { data, error } = await table().select('module_id, data').eq('user_id', user.id).eq('module_type', 'state');
            if (error) { ready = true; return; }   // the table or its data column is not set up yet
            rows = data || [];
        } catch (e) { ready = true; return; }
        let changed = false;
        applying = true;
        const remote = {};
        rows.forEach(r => { if (r.module_id in KEYS) remote[r.module_id] = r.data; });
        Object.keys(KEYS).forEach(k => {
            const local = read(k), cloud = remote[k];
            if (cloud == null && local == null) return;
            const merged = cloud == null ? local : local == null ? cloud : KEYS[k](local, cloud);
            const m = JSON.stringify(merged);
            if (m !== JSON.stringify(local)) { nativeSet.call(localStorage, k, m); changed = true; }
            if (m !== JSON.stringify(cloud)) dirty.add(k);
        });
        applying = false;
        ready = true;
        if (dirty.size) push();
        // Progress arrived from another device: show it (once per visit)
        let shown = false;
        try { shown = sessionStorage.getItem('fs_synced') === '1'; sessionStorage.setItem('fs_synced', '1'); } catch (e) { shown = true; }
        if (changed && !shown) location.reload();
    }
    document.addEventListener('DOMContentLoaded', () => { start(); });
    return { push, start, KEYS };
})();

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
