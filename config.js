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
