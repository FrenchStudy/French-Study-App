// js/ai.js - one place for every AI call.
// Today it calls Groq with the key saved on the Admin page (via CONFIG in config.js).
// Step 2 of the plan swaps the inside of askAI() for the Supabase Edge Function,
// so pages that use askAI() will not need to change.
//
// askAI(messages, { json: true }) -> parsed object
// askAI(messages)                  -> reply text
// Throws an Error with a readable message on failure.
async function askAI(messages, options = {}) {
    const apiKey = CONFIG.getApiKey();
    if (!apiKey) {
        throw new Error('AI is not set up yet: add the Groq API key on the Admin page.');
    }

    const body = {
        model: CONFIG.getModelName(),
        messages: messages,
        temperature: options.temperature ?? 0.6
    };
    if (options.json) body.response_format = { type: 'json_object' };

    let response;
    try {
        response = await fetch(CONFIG.getApiUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify(body)
        });
    } catch (err) {
        throw new Error('Could not reach the AI service. Check your connection and try again.');
    }

    if (response.status === 429) {
        throw new Error('The AI is busy right now. Please wait a minute and try again.');
    }
    if (!response.ok) {
        throw new Error(`The AI service returned an error (${response.status}).`);
    }

    const data = await response.json();
    const text = (data.choices?.[0]?.message?.content || '').trim();
    if (!options.json) return text;

    try {
        return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (err) {
        throw new Error('The AI reply could not be read. Please try again.');
    }
}

// Escape text before putting it into HTML.
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Speak French text with the best available French voice.
function speakFrench(text, rate = 1) {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = rate;
    const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    const voice = voices.find(v => v.lang === 'fr-FR') || voices.find(v => (v.lang || '').startsWith('fr'));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
}
