// config.js - Dynamic configuration shared across the suite
const CONFIG = {
    // Pulls the live API key saved by the admin, with a clean fallback if not set yet
    getApiKey() {
        return localStorage.getItem('ai_api_key') || '';
    },
    // Pulls the active model saved by the admin
    getModelName() {
        return localStorage.getItem('ai_model_name') || 'openai/gpt-oss-120b';
    },
    getApiUrl() {
        return 'https://api.groq.com/openai/v1/chat/completions';
    }
};