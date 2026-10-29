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
        // Messages written for students are shown as they are; anything technical gets a plain message
        // (the details stay on the Admin page)
        const code = server.data && server.data.code;
        const FOR_STUDENTS = ['signin', 'quota', 'session', 'daily', 'busy'];
        let message = (server.data && server.data.error) || '';
        if (code === 'setup') message = 'The AI is not available right now. Please try again later.';
        else if (!FOR_STUDENTS.includes(code) && !/connection/.test(message)) message = server.status === 429 || server.status === 503
            ? 'The AI is busy right now. Please wait a minute and try again.'
            : 'The AI could not answer just now. Please try again in a moment.';
        const err = new Error(message);
        err.code = code;
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
// Media icons drawn in SVG: the ⏮ ⏸ ⏹ ⏭ characters show as coloured emoji on many phones
const svgIcon = (d, size = 18) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" aria-hidden="true" style="display:inline-block;vertical-align:-0.15em">${d}</svg>`;
const MEDIA_ICON = {
    play: (s) => svgIcon('<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z"/>', s),
    pause: (s) => svgIcon('<rect x="6" y="4" width="4.5" height="16" rx="1.2"/><rect x="13.5" y="4" width="4.5" height="16" rx="1.2"/>', s),
    stop: (s) => svgIcon('<rect x="5" y="5" width="14" height="14" rx="2"/>', s),
    prev: (s) => svgIcon('<rect x="4" y="5" width="3" height="14" rx="1"/><path d="M20 5.5v13a1 1 0 0 1-1.55.83L9 13a1.2 1.2 0 0 1 0-2l9.45-6.33A1 1 0 0 1 20 5.5z"/>', s),
    next: (s) => svgIcon('<rect x="17" y="5" width="3" height="14" rx="1"/><path d="M4 5.5v13a1 1 0 0 0 1.55.83L15 13a1.2 1.2 0 0 0 0-2L5.55 4.67A1 1 0 0 0 4 5.5z"/>', s)
};
window.MEDIA_ICON = MEDIA_ICON;
// "2 · deux" is shown with its digit: say only the word. "un / une" is read as "un, une".
const sayable = (text) => String(text).replace(/^\s*\d[\d\s]*\s*·\s*/, '').replace(/\s+\/\s+/g, ', ');
function speakFrench(text, rate = 1) {
    if (!('speechSynthesis' in window) || !text) return;
    text = sayable(text);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = rate;
    const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    const voice = voices.find(v => v.lang === 'fr-FR') || voices.find(v => (v.lang || '').startsWith('fr'));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
}
