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

// Wire every Logout button (id="logoutBtn" or data-logout) on page load,
// and show the Admin links only to admins.
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#logoutBtn, [data-logout]').forEach((btn) => {
        btn.addEventListener('click', logout);
    });
    const adminLinks = document.querySelectorAll('a[href="admin.html"]');
    let role = '';
    try { role = sessionStorage.getItem('fs_role') || ''; } catch (e) {}
    adminLinks.forEach(a => { a.style.display = role === 'admin' ? '' : 'none'; });
    if (adminLinks.length && window.mySupabase) {
        Account.profile().then(({ profile }) => {
            adminLinks.forEach(a => { a.style.display = profile && profile.role === 'admin' ? '' : 'none'; });
        });
    }
});
