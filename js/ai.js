// js/ai.js - one place for every AI call.
// askAI() sends the request to the "ai" Edge Function (see config.js AIServer), which keeps the Groq
// key on the server and counts each student's free uses. Until the function is deployed, it falls
// back to the key saved on the Admin page in this browser.
//
// askAI(messages, { json: true }) -> parsed object
// askAI(messages)                  -> reply text
// options.session: requests with the same session count as ONE use (e.g. a whole conversation)
// options.feature: a short label for the statistics, e.g. 'writing-check'
// Throws an Error with a readable message on failure (err.code = 'quota' when free uses are used up).
async function askAI(messages, options = {}) {
    const server = await AIServer.request({
        messages, json: !!options.json, temperature: options.temperature ?? 0.6,
        session: options.session || '', feature: options.feature || ''
    });
    let text;
    if (server.notDeployed) {
        text = await askGroqDirect(messages, options);
    } else if (server.ok) {
        text = String(server.data.content || '').trim();
    } else {
        const err = new Error((server.data && server.data.error) || `The AI service returned an error (${server.status}).`);
        err.code = server.data && server.data.code;
        throw err;
    }
    if (!options.json) return text;
    try {
        return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (err) {
        throw new Error('The AI reply could not be read. Please try again.');
    }
}

// Before the Edge Function is deployed: call Groq with the key from the Admin page
async function askGroqDirect(messages, options) {
    const apiKey = CONFIG.getApiKey();
    if (!apiKey) throw new Error('AI is not set up yet: the AI function is not deployed and there is no key on the Admin page.');
    const body = { model: CONFIG.getModelName(), messages, temperature: options.temperature ?? 0.6 };
    if (options.json) body.response_format = { type: 'json_object' };
    let response;
    try {
        response = await (AIServer._fetch || fetch)(CONFIG.getApiUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify(body)
        });
    } catch (err) {
        throw new Error('Could not reach the AI service. Check your connection and try again.');
    }
    if (response.status === 429) throw new Error('The AI is busy right now. Please wait a minute and try again.');
    if (!response.ok) throw new Error(`The AI service returned an error (${response.status}).`);
    const data = await response.json();
    return (data.choices?.[0]?.message?.content || '').trim();
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
