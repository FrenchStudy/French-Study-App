// by-ear-kit.js - the parts shared by the three « by ear » lists: Conjugations → Verbs (2,062 verbs),
// Vocab → Words by ear (2,007 words, A1–C2) and Exam → Mon lexique TCF (1,066 words).
//   ByEar.load(url)                       the list's JSON (content/by-ear/*.json), loaded once
//   ByEar.chips(el, groups, state, count, onChange)
//                                         rows of filter chips; an empty choice means « all ». The first tap in a row picks only that
//                                         chip, later taps add or remove chips. count(groupKey, value) gives the number shown on a chip.
//   new ByEar.Player({ steps, onItem, onDone })
//                                         the Play list: reads each item aloud (French and English voices), one after another, with
//                                         pause, stop, previous and next on a bar at the bottom of the screen
//   ByEar.say(text, lang)                 one word or sentence, now
//   ByEar.norm(text)                      lower case without accents, for searching
// The styles are added to the page once (no Tailwind build needed); text sizes stay on the app's scale (12 14 16 18 px).
(function () {
'use strict';
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’]/g, "'").trim();

const CSS = `
.be-chips{display:flex;flex-direction:column;gap:8px}
.be-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.be-row-lbl{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#64748b;min-width:7.5rem}
.be-chip{min-height:36px;padding:0 12px;border-radius:999px;border:1px solid #e2e8f0;background:#fff;color:#334155;font-size:14px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.be-chip:hover{border-color:#a5b4fc}
.be-chip[aria-pressed="true"]{background:#eef2ff;border-color:#818cf8;color:#3730a3}
.be-chip .n{font-size:12px;font-weight:600;color:#94a3b8}
.be-chip[aria-pressed="true"] .n{color:#6366f1}
.be-list{background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden}
.be-item{border-top:1px solid #e2e8f0;padding:12px 16px}
.be-item:first-child{border-top:0}
.be-item.be-now{background:#fefce8;box-shadow:inset 4px 0 0 #f59e0b}
.be-item.be-done .be-word{color:#94a3b8}
.be-top{display:grid;grid-template-columns:28px 40px minmax(140px,200px) 140px minmax(0,1fr) 40px;gap:12px;align-items:start}
.be-chev{width:28px;height:28px;border-radius:8px;border:0;background:none;color:#64748b;cursor:pointer;display:grid;place-items:center;font-size:16px}
.be-chev:hover{background:#f1f5f9}
.be-chev svg{transition:transform .15s}
.be-item.be-open .be-chev svg{transform:rotate(90deg)}
.be-num{font-size:12px;color:#94a3b8;padding-top:6px;font-variant-numeric:tabular-nums}
.be-word{font-size:18px;font-weight:800;color:#0f172a;line-height:1.3;display:flex;align-items:center;gap:8px}
.be-word > span{min-width:0}
.be-mean{display:block;font-size:14px;color:#64748b;font-weight:400;margin-top:2px}
.be-spk{flex:none;width:32px;height:32px;border-radius:50%;border:1px solid #e2e8f0;background:#fff;color:#4f46e5;display:inline-grid;place-items:center;cursor:pointer}
.be-spk:hover{background:#eef2ff}
.be-spk.main{background:#4f46e5;border-color:#4f46e5;color:#fff}
.be-tags{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding-top:2px}
.be-tag{font-size:12px;font-weight:700;border-radius:6px;padding:1px 7px;background:#f1f5f9;color:#475569;white-space:nowrap}
.be-tag.er{background:#e0e7ff;color:#3730a3}.be-tag.ir{background:#dcfce7;color:#166534}.be-tag.re{background:#e0f2fe;color:#075985}.be-tag.irr{background:#fee2e2;color:#b91c1c}
.be-tag.rf{background:#f3e8ff;color:#6b21a8}.be-tag.yes{background:#dcfce7;color:#166534}.be-tag.close{background:#fef3c7;color:#92400e}.be-tag.ff{background:#ffe4e6;color:#9f1239}
.be-lvl{font-size:12px;color:#64748b}
.be-hook{display:flex;align-items:center;gap:10px;font-size:14px;color:#334155;line-height:1.45;min-width:0}
.be-pic{flex:none;font-size:24px;line-height:1;min-width:44px;height:40px;padding:0 6px;display:inline-grid;place-items:center;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif}
.be-empty{color:#94a3b8;font-style:italic}
.be-learn{width:36px;height:36px;border-radius:50%;border:1px solid #e2e8f0;background:#fff;color:#cbd5e1;cursor:pointer;display:grid;place-items:center}
.be-learn[aria-pressed="true"]{background:#dcfce7;border-color:#86efac;color:#15803d}
.be-detail{margin:12px 0 4px 80px}
.be-ex{font-size:14px;color:#334155;margin-top:6px}.be-ex i{color:#64748b}
.be-more{width:100%;min-height:48px;border:0;border-top:1px solid #e2e8f0;background:#f8fafc;color:#4338ca;font-size:14px;font-weight:700;cursor:pointer}
.be-more:hover{background:#eef2ff}
.be-bar{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:6px;background:#0f172a;color:#fff;border-radius:999px;padding:6px 8px 6px 16px;box-shadow:0 10px 30px rgba(15,23,42,.35);max-width:calc(100vw - 24px)}
.be-bar .lbl{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:46vw;margin-right:6px}
.be-bar .lbl small{font-size:12px;color:#94a3b8;font-weight:400;margin-left:6px}
.be-bar button{width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#fff;cursor:pointer;display:grid;place-items:center}
.be-bar button:hover{background:rgba(255,255,255,.22)}
.be-bar button.pri{background:#4f46e5}
@media (max-width: 767px){
  .be-top{grid-template-columns:28px minmax(0,1fr) 40px;gap:4px 10px}
  .be-num{display:none}
  .be-top > .be-w{grid-column:2}
  .be-top > .be-learn{grid-column:3;grid-row:1}
  .be-top > .be-tags{grid-column:2 / -1;flex-direction:row;flex-wrap:wrap}
  .be-top > .be-hook{grid-column:2 / -1}
  .be-detail{margin-left:0}
  .be-row-lbl{min-width:100%}
  .be-bar{bottom:10px}
}`;
function addCss() {
    if (document.getElementById('be-css')) return;
    const s = document.createElement('style'); s.id = 'be-css'; s.textContent = CSS; document.head.appendChild(s);
}

const cache = {};
function load(url) {
    return cache[url] || (cache[url] = fetch(url).then(r => { if (!r.ok) throw new Error('Could not load the list (' + r.status + ').'); return r.json(); }));
}

// ---------- Filter chips ----------
function chips(el, groups, state, count, onChange) {
    addCss();
    const draw = () => {
        el.innerHTML = `<div class="be-chips">${groups.map(g => `<div class="be-row" data-g="${esc(g.key)}">
            <span class="be-row-lbl">${esc(g.label)}</span>
            <button type="button" class="be-chip" data-all aria-pressed="${!state[g.key].length}">All</button>
            ${g.items.map(([val, label]) => `<button type="button" class="be-chip" data-v="${esc(val)}" aria-pressed="${state[g.key].includes(val)}">${esc(label)} <span class="n">${count ? count(g.key, val) : ''}</span></button>`).join('')}
        </div>`).join('')}</div>`;
    };
    el.onclick = (e) => {
        const b = e.target.closest('.be-chip'); if (!b) return;
        const g = b.closest('.be-row').dataset.g;
        if (b.hasAttribute('data-all')) state[g] = [];
        else {
            const v = b.dataset.v, on = state[g];
            state[g] = on.includes(v) ? on.filter(x => x !== v) : on.concat(v);
        }
        onChange();
        draw();
    };
    draw();
    return { redraw: draw };
}

// ---------- Speech ----------
const VOICE_PREF = { fr: ['fr-FR', 'fr'], en: ['en-IN', 'en-GB', 'en-US', 'en'] };
function voiceFor(lang) {
    const vs = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    for (const want of VOICE_PREF[lang] || [lang]) {
        const v = vs.find(x => (x.lang || '').replace('_', '-') === want) || vs.find(x => (x.lang || '').startsWith(want));
        if (v) return v;
    }
    return null;
}
let rate = LocalStore.get('byear_rate', 1);
function utter(text, lang) {
    return new Promise((resolve) => {
        if (!('speechSynthesis' in window) || !text) return resolve();
        const u = new SpeechSynthesisUtterance(String(text).replace(/^\s*\d[\d\s]*\s*·\s*/, '').replace(/\s+\/\s+/g, ', '));
        u.lang = lang === 'en' ? 'en-GB' : 'fr-FR';
        const v = voiceFor(lang); if (v) { u.voice = v; u.lang = v.lang; }
        u.rate = lang === 'en' ? Math.min(1, rate + 0.05) : rate;
        let done = false; const end = () => { if (!done) { done = true; resolve(); } };
        u.onend = end; u.onerror = end;
        setTimeout(end, 4000 + String(text).length * 160);   // some browsers never fire « end »
        speechSynthesis.speak(u);
    });
}
function say(text, lang = 'fr') {
    if (Player.current) Player.current.stop();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    return utter(text, lang);
}

// ---------- The Play list ----------
class Player {
    constructor(opts) { this.o = opts; this.items = []; this.i = 0; this.state = 'stopped'; this.run = 0; }
    start(items, from = 0) {
        if (Player.current && Player.current !== this) Player.current.stop();
        Player.current = this;
        this.items = items; this.i = Math.max(0, Math.min(from, items.length - 1));
        this.state = 'playing'; this.bar(); this.go();
    }
    async go() {
        const run = ++this.run;
        if ('speechSynthesis' in window) speechSynthesis.cancel();
        while (this.state === 'playing' && this.i < this.items.length) {
            const item = this.items[this.i];
            if (this.o.onItem) this.o.onItem(item, this.i);
            this.bar();
            for (const [text, lang] of this.o.steps(item)) {
                if (run !== this.run || this.state !== 'playing') return;
                await utter(text, lang);
                await new Promise(r => setTimeout(r, 250));
            }
            if (run !== this.run || this.state !== 'playing') return;
            await new Promise(r => setTimeout(r, 450));
            if (run !== this.run || this.state !== 'playing') return;
            this.i++;
        }
        if (run === this.run && this.state === 'playing') this.stop();
    }
    pause() { if (this.state !== 'playing') return; this.state = 'paused'; this.run++; if ('speechSynthesis' in window) speechSynthesis.cancel(); this.bar(); }
    resume() { if (this.state !== 'paused') return; this.state = 'playing'; this.bar(); this.go(); }
    toggle() { this.state === 'playing' ? this.pause() : this.resume(); }
    skip(d) { if (this.state === 'stopped') return; this.i = Math.max(0, Math.min(this.items.length - 1, this.i + d)); this.state = 'playing'; this.go(); }
    stop() {
        this.state = 'stopped'; this.run++;
        if ('speechSynthesis' in window) speechSynthesis.cancel();
        if (this.el) { this.el.remove(); this.el = null; }
        if (this.o.onDone) this.o.onDone();
        if (Player.current === this) Player.current = null;
    }
    bar() {
        addCss();
        if (this.state === 'stopped') return;
        if (!this.el) {
            this.el = document.createElement('div');
            this.el.className = 'be-bar'; this.el.setAttribute('role', 'region'); this.el.setAttribute('aria-label', 'Play list');
            this.el.innerHTML = `<span class="lbl"></span>
                <button type="button" data-a="prev" aria-label="Previous">${MEDIA_ICON.prev(18)}</button>
                <button type="button" data-a="toggle" class="pri" aria-label="Pause"></button>
                <button type="button" data-a="stop" aria-label="Stop">${MEDIA_ICON.stop(16)}</button>
                <button type="button" data-a="next" aria-label="Next">${MEDIA_ICON.next(18)}</button>`;
            this.el.addEventListener('click', (e) => {
                const a = e.target.closest('button'); if (!a) return;
                ({ prev: () => this.skip(-1), next: () => this.skip(1), stop: () => this.stop(), toggle: () => this.toggle() })[a.dataset.a]();
            });
            document.body.appendChild(this.el);
        }
        const item = this.items[this.i];
        this.el.querySelector('.lbl').innerHTML = `${esc(this.o.label ? this.o.label(item) : '')}<small>${this.i + 1} / ${this.items.length}</small>`;
        const t = this.el.querySelector('[data-a="toggle"]');
        t.innerHTML = this.state === 'playing' ? MEDIA_ICON.pause(18) : MEDIA_ICON.play(18);
        t.setAttribute('aria-label', this.state === 'playing' ? 'Pause' : 'Resume');
    }
}
Player.current = null;
document.addEventListener('keydown', (e) => {
    const p = Player.current; if (!p || e.target.closest('input,textarea,select')) return;
    if (e.key === 'Escape') p.stop();
    else if (e.key === ' ') { e.preventDefault(); p.toggle(); }
    else if (e.key === 'ArrowRight') p.skip(1);
    else if (e.key === 'ArrowLeft') p.skip(-1);
});

const SPK = '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M2 6h2.5L8 3v10L4.5 10H2z"/><path d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12.3 3.7a6 6 0 0 1 0 8.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
const CHEV = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const TICK = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3.5 8.3 6.6 11.2 12.5 4.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const rateNow = () => rate;
const setRate = (r) => { rate = r; LocalStore.set('byear_rate', r); };

addCss();
window.ByEar = { load, chips, Player, say, norm, esc, icons: { SPK, CHEV, TICK }, rate: rateNow, setRate };
})();
