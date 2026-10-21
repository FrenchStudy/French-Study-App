// clock.js - an interactive clock for learning to tell the time in French.
// Drag the hour and minute hands (or use the buttons); the clock says the time in French,
// the everyday way (trois heures moins le quart du soir) and the 24-hour way (quatorze heures quarante-cinq).
//   FrenchClock.mount(el, { say })   -> draws the clock into el
//   FrenchClock.say(h, m)            -> { everyday, formal } sentences for 0 <= h < 24, 0 <= m < 60
(function () {
// ---------- the French ----------
const UNITS = ['zéro', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const TENS = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante' };
// numbers 0-59, feminine (une heure, vingt et une minutes)
function num(n) {
    if (n < 20) return UNITS[n];
    const t = Math.floor(n / 10), u = n % 10;
    if (u === 0) return TENS[t];
    if (u === 1) return TENS[t] + ' et une';
    return TENS[t] + '-' + UNITS[u];
}
const hourWord = (h) => h === 1 ? 'une heure' : num(h) + ' heures';
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function period(h) { return h < 12 ? 'du matin' : h < 18 ? "de l'après-midi" : 'du soir'; }

function frenchTime(h, m) {
    // 24-hour (formal: timetables, TV, appointments)
    let formal;
    if (h === 0 && m === 0) formal = 'minuit';
    else if (h === 12 && m === 0) formal = 'midi';
    else formal = (h === 0 ? 'zéro heure' : hourWord(h)) + (m ? ' ' + num(m) : '');
    // everyday (12-hour, with quart / demie / moins)
    let hh = h, mm = m, moins = false;
    if (m > 30 && m % 5 === 0) { hh = (h + 1) % 24; mm = 60 - m; moins = true; }
    const base = (hh === 0 ? 'minuit' : hh === 12 ? 'midi' : hourWord(hh % 12 || 12));
    const special = hh === 0 || hh === 12;
    let tail = '';
    if (moins) tail = mm === 15 ? ' moins le quart' : ' moins ' + num(mm);
    else if (mm === 15) tail = ' et quart';
    else if (mm === 30) tail = special ? ' et demi' : ' et demie';   // midi et demi, trois heures et demie
    else if (mm) tail = ' ' + num(mm);
    const everyday = base + tail + (special ? '' : ' ' + period(hh));
    return { everyday: 'Il est ' + everyday + '.', formal: 'Il est ' + formal + '.' };
}
const pad = (n) => String(n).padStart(2, '0');
const digital = (h, m, use24) => use24 ? `${pad(h)}:${pad(m)}` : `${h % 12 || 12}:${pad(m)}`;

// ---------- styles ----------
const CSS = `
.fc{display:grid;grid-template-columns:minmax(0,460px) minmax(0,1fr);gap:20px;align-items:start}
@media (max-width:860px){.fc{grid-template-columns:minmax(0,1fr)}}
.fc-face{width:100%;max-width:460px;height:auto;display:block;margin:0 auto;touch-action:none;user-select:none;-webkit-user-select:none}
.fc-hand{cursor:grab}.fc-hand:active{cursor:grabbing}
.fc-hand:focus{outline:none}.fc-hand:focus-visible .fc-handline{stroke:#4f46e5}
.fc-panel{display:grid;gap:12px}
.fc-say{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px;display:grid;gap:8px}
.fc-label{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#4f46e5}
.fc-big{font-size:1.5rem;font-weight:900;line-height:1.2;color:#0f172a}
.fc-formal{font-size:1.05rem;font-weight:700;color:#334155}
.fc-en{font-size:14px;color:#64748b}
.fc-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.fc-btn{font-weight:700;font-size:15px;border:1px solid #e2e8f0;background:#fff;color:#0f172a;border-radius:12px;padding:8px 14px;min-height:44px;cursor:pointer}
.fc-btn.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.fc-btn[aria-pressed="true"]{background:#eef2ff;border-color:#6366f1;color:#3730a3}
.fc-btn:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
.fc-step{min-width:44px;padding:8px 10px}
.fc-small{font-size:13px;color:#64748b}
.fc-fb{font-weight:800}.fc-fb.ok{color:#047857}.fc-fb.no{color:#be123c}
.fc-opts{display:grid;gap:8px}
.fc-opt{text-align:left;font-size:16px;font-weight:600;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:10px 14px;min-height:48px;cursor:pointer}
.fc-opt.ok{background:#ecfdf5;border-color:#059669}.fc-opt.no{background:#fff1f2;border-color:#e11d48}
.fc-hide{visibility:hidden}
`;
function injectCss() {
    if (document.getElementById('fc-css')) return;
    const s = document.createElement('style'); s.id = 'fc-css'; s.textContent = CSS; document.head.appendChild(s);
}
const NS = 'http://www.w3.org/2000/svg';
function mk(tag, attrs, parent) { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; }
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function mount(root, opts = {}) {
    if (!root) return;
    injectCss();
    const speak = opts.say || (() => {});
    let tot = 9 * 60 + 15;             // minutes since midnight
    let use24 = false, showDigital = true, snap5 = false, showHour = true, showMin = true, showSentence = true;
    let mode = 'free', quiz = null;

    root.innerHTML = `
      <div class="fc">
        <div>
          <svg class="fc-face" viewBox="0 0 500 500" role="img" aria-label="Clock: drag the hands to set the time"></svg>
          <div class="fc-row" style="justify-content:center;margin-top:8px" aria-label="Set the time">
            <button type="button" class="fc-btn fc-step" data-add="-60" aria-label="One hour back">−1 h</button>
            <button type="button" class="fc-btn fc-step" data-add="-5" aria-label="Five minutes back">−5 min</button>
            <button type="button" class="fc-btn fc-step" data-add="5" aria-label="Five minutes on">+5 min</button>
            <button type="button" class="fc-btn fc-step" data-add="60" aria-label="One hour on">+1 h</button>
          </div>
        </div>
        <div class="fc-panel">
          <div class="fc-row" role="group" aria-label="Mode">
            <button type="button" class="fc-btn" data-mode="free" aria-pressed="true">Play</button>
            <button type="button" class="fc-btn" data-mode="set" aria-pressed="false">Set the clock</button>
            <button type="button" class="fc-btn" data-mode="read" aria-pressed="false">Read the clock</button>
            <button type="button" class="fc-btn" data-mode="listen" aria-pressed="false">Listen</button>
          </div>
          <div class="fc-say" aria-live="polite"></div>
          <div class="fc-row" role="group" aria-label="Clock options">
            <button type="button" class="fc-btn" data-opt="hour" aria-pressed="true">Hour hand</button>
            <button type="button" class="fc-btn" data-opt="min" aria-pressed="true">Minute hand</button>
            <button type="button" class="fc-btn" data-opt="digital" aria-pressed="true">Digital</button>
            <button type="button" class="fc-btn" data-opt="24" aria-pressed="false">24 h</button>
            <button type="button" class="fc-btn" data-opt="snap" aria-pressed="false">Steps of 5 min</button>
          </div>
          <p class="fc-small">Drag the hands, or use the buttons under the clock. Going past 12 with the minute hand moves the hour on.</p>
        </div>
      </div>`;
    const svg = root.querySelector('svg');
    const panel = root.querySelector('.fc-say');

    // ---------- face ----------
    const C = 250;
    mk('circle', { cx: C, cy: C, r: 240, fill: '#0f172a' }, svg);
    mk('circle', { cx: C, cy: C, r: 205, fill: '#fff' }, svg);
    for (let i = 0; i < 60; i++) {
        const a = i * 6 * Math.PI / 180, big = i % 5 === 0;
        const r1 = 205, r2 = big ? 186 : 195;
        mk('line', { x1: C + r1 * Math.sin(a), y1: C - r1 * Math.cos(a), x2: C + r2 * Math.sin(a), y2: C - r2 * Math.cos(a), stroke: '#0f172a', 'stroke-width': big ? 5 : 2 }, svg);
        if (big) {   // minute numbers on the black ring
            mk('text', { x: C + 223 * Math.sin(a), y: C - 223 * Math.cos(a) + 6, 'text-anchor': 'middle', style: 'font:800 16px system-ui,sans-serif;fill:#fff' }, svg).textContent = i === 0 ? '00' : i;
        }
    }
    for (let h = 1; h <= 12; h++) {
        const a = h * 30 * Math.PI / 180;
        mk('text', { x: C + 155 * Math.sin(a), y: C - 155 * Math.cos(a) + 19, 'text-anchor': 'middle', style: 'font:900 54px system-ui,sans-serif;fill:#0f172a' }, svg).textContent = h;
    }
    const digBox = mk('rect', { x: C - 74, y: 300, width: 148, height: 62, rx: 14, fill: '#eef2ff' }, svg);
    const dig = mk('text', { x: C, y: 336, 'text-anchor': 'middle', class: 'fc-dig', style: 'font:900 34px system-ui,sans-serif;fill:#0f172a;font-variant-numeric:tabular-nums' }, svg);
    const per = mk('text', { x: C, y: 355, 'text-anchor': 'middle', style: 'font:800 13px system-ui,sans-serif;fill:#4f46e5' }, svg);
    function hand(len, width, color, label) {
        const g = mk('g', { class: 'fc-hand', tabindex: 0, role: 'slider', 'aria-label': label }, svg);
        mk('line', { x1: C, y1: C, x2: C, y2: C - len, stroke: 'transparent', 'stroke-width': 44, 'stroke-linecap': 'round' }, g);   // easy to grab
        mk('line', { class: 'fc-handline', x1: C, y1: C + 18, x2: C, y2: C - len, stroke: color, 'stroke-width': width, 'stroke-linecap': 'round' }, g);
        return g;
    }
    const hourHand = hand(115, 16, '#0f172a', 'Hour hand');
    const minHand = hand(178, 10, '#e11d48', 'Minute hand');
    mk('circle', { cx: C, cy: C, r: 12, fill: '#0f172a' }, svg);
    mk('circle', { cx: C, cy: C, r: 5, fill: '#e11d48' }, svg);

    function draw() {
        const h = Math.floor(tot / 60), m = tot % 60;
        hourHand.setAttribute('transform', `rotate(${((h % 12) + m / 60) * 30} ${C} ${C})`);
        minHand.setAttribute('transform', `rotate(${m * 6} ${C} ${C})`);
        hourHand.style.display = showHour ? '' : 'none';
        minHand.style.display = showMin ? '' : 'none';
        hourHand.setAttribute('aria-valuetext', `${h % 12 || 12} h`);
        minHand.setAttribute('aria-valuetext', `${m} min`);
        const hideDigital = !showDigital || mode === 'read' || mode === 'set' || mode === 'listen';
        dig.textContent = hideDigital ? '' : digital(h, m, use24);
        digBox.style.display = hideDigital ? 'none' : '';
        per.textContent = hideDigital || use24 ? '' : (h < 12 ? 'matin' : h < 18 ? 'après-midi' : 'soir');
        if (mode === 'free') freePanel();
    }

    // ---------- dragging ----------
    function angleAt(e) {
        const r = svg.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width * 500 - C, y = (e.clientY - r.top) / r.height * 500 - C;
        return (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360;
    }
    let drag = null;
    function startDrag(which, e) { if (mode === 'read') return; drag = which; svg.setPointerCapture(e.pointerId); e.preventDefault(); }
    hourHand.addEventListener('pointerdown', (e) => startDrag('h', e));
    minHand.addEventListener('pointerdown', (e) => startDrag('m', e));
    svg.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const a = angleAt(e), step = snap5 ? 5 : 1;
        const h = Math.floor(tot / 60), m = tot % 60;
        if (drag === 'm') {
            let nm = Math.round(a / 6 / step) * step % 60;
            let d = nm - m;
            if (d < -30) d += 60; else if (d > 30) d -= 60;   // crossing 12 moves the hour
            tot = (tot + d + 1440) % 1440;
        } else {
            const hf = a / 30;                                 // 0..12
            let cand = Math.round(hf * 60 / step) * step % 720 + (h >= 12 ? 720 : 0);
            let d = cand - tot;
            if (d > 360) d -= 720; else if (d < -360) d += 720;   // crossing 12 switches morning / evening
            tot = (tot + d + 1440) % 1440;
        }
        draw();
    });
    const endDrag = () => { if (drag) { drag = null; if (mode === 'free') speak(frenchTime(Math.floor(tot / 60), tot % 60).everyday); } };
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', () => { drag = null; });
    // keyboard on the hands
    [[hourHand, 60], [minHand, 1]].forEach(([g, unit]) => g.addEventListener('keydown', (e) => {
        const k = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
        if (!k || mode === 'read') return;
        e.preventDefault();
        tot = (tot + k * (unit === 1 && snap5 ? 5 : unit) + 1440) % 1440; draw();
    }));
    root.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => {
        if (mode === 'read') return;
        tot = (tot + Number(b.dataset.add) + 1440) % 1440; draw();
        if (mode === 'free') speak(frenchTime(Math.floor(tot / 60), tot % 60).everyday);
    }));

    // ---------- options ----------
    root.querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', () => {
        const o = b.dataset.opt;
        if (o === 'hour') showHour = !showHour;
        if (o === 'min') showMin = !showMin;
        if (o === 'digital') showDigital = !showDigital;
        if (o === '24') use24 = !use24;
        if (o === 'snap') { snap5 = !snap5; if (snap5) tot = Math.round(tot / 5) * 5 % 1440; }
        b.setAttribute('aria-pressed', { hour: showHour, min: showMin, digital: showDigital, 24: use24, snap: snap5 }[o]);
        draw();
    }));

    // ---------- panels ----------
    function freePanel() {
        const h = Math.floor(tot / 60), m = tot % 60, t = frenchTime(h, m);
        panel.innerHTML = `<div class="fc-label">Quelle heure est-il ?</div>
            <div class="fc-big">${esc(t.everyday)}</div>
            <div class="fc-formal">24 h: ${esc(t.formal)}</div>
            <div class="fc-en">${digital(h, m, false)} ${h < 12 ? 'am' : 'pm'} · ${pad(h)}:${pad(m)}. The 24-hour way is used for timetables, TV and appointments.</div>
            <div class="fc-row"><button type="button" class="fc-btn" data-s="e">🔊 Everyday</button><button type="button" class="fc-btn" data-s="f">🔊 24 h</button></div>`;
        panel.querySelector('[data-s="e"]').addEventListener('click', () => speak(t.everyday));
        panel.querySelector('[data-s="f"]').addEventListener('click', () => speak(t.formal));
    }
    const rand = (n) => Math.floor(Math.random() * n);
    function randomTime() {   // mostly round numbers, which is what learners meet first
        const h = rand(24), m = Math.random() < 0.7 ? rand(12) * 5 : rand(60);
        return h * 60 + m;
    }
    function setMode(m) {
        mode = m;
        root.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m));
        if (m === 'free') { draw(); return; }
        quiz = { n: 0, score: 0 };
        next();
    }
    root.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));

    function next() {
        quiz.n++;
        quiz.target = randomTime();
        quiz.tries = 0;
        const th = Math.floor(quiz.target / 60), tm = quiz.target % 60, t = frenchTime(th, tm);
        quiz.useFormal = Math.random() < 0.35;
        quiz.text = quiz.useFormal ? t.formal : t.everyday;
        if (mode === 'read') { tot = quiz.target; draw(); readPanel(); return; }
        tot = Math.random() < 0.5 ? 12 * 60 : 0; draw();
        const listen = mode === 'listen';
        panel.innerHTML = `<div class="fc-label">${listen ? 'Listen and set the clock' : 'Set the clock'} · ${quiz.n}</div>
            <div class="fc-big${listen ? ' fc-hide' : ''}" id="fc-q">${esc(quiz.text)}</div>
            ${listen ? '<div class="fc-row"><button type="button" class="fc-btn pri" data-a="play">🔊 Play again</button><button type="button" class="fc-btn" data-a="show">Show the words</button></div>' : ''}
            <p class="fc-small">Move the hands, then check. ${quiz.useFormal ? 'This is 24-hour time.' : '"du matin", "de l\'après-midi" or "du soir" tells you which half of the day (the hour hand goes round twice a day).'}</p>
            <div class="fc-row"><button type="button" class="fc-btn pri" data-a="check">Check</button><button type="button" class="fc-btn" data-a="skip">Show me</button></div>
            <p class="fc-fb" id="fc-fb"></p>
            <p class="fc-small">Score ${quiz.score} / ${quiz.n - 1}</p>`;
        if (listen) {
            speak(quiz.text);
            panel.querySelector('[data-a="play"]').addEventListener('click', () => speak(quiz.text));
            panel.querySelector('[data-a="show"]').addEventListener('click', () => panel.querySelector('#fc-q').classList.remove('fc-hide'));
        }
        panel.querySelector('[data-a="check"]').addEventListener('click', check);
        panel.querySelector('[data-a="skip"]').addEventListener('click', () => { tot = quiz.target; draw(); done(false, 'Here it is.'); });
    }
    function sameTime(a, b) {
        // the 12-hour sentence names the half of the day, so the time must match exactly;
        // without "du matin / du soir" (midi, minuit) the hands alone are enough
        if (a === b) return true;
        const t = frenchTime(Math.floor(b / 60), b % 60).everyday;
        const noPeriod = !/du matin|de l'après-midi|du soir/.test(t);
        return !quiz.useFormal && noPeriod && a % 720 === b % 720;
    }
    function check() {
        if (sameTime(tot, quiz.target)) { if (quiz.tries === 0) quiz.score++; done(true, quiz.tries ? 'Got it!' : 'Right first time!'); return; }
        quiz.tries++;
        const fb = panel.querySelector('#fc-fb');
        const off = Math.abs(tot % 720 - quiz.target % 720) < 1 ? 'Right position, but the other half of the day: drag the hour hand once more round the clock.' : quiz.tries >= 2 ? `Hint: the minute hand points at ${quiz.target % 60} on the outside ring.` : 'Not yet. Try again.';
        fb.className = 'fc-fb no'; fb.textContent = off;
    }
    function done(ok, msg) {
        const th = Math.floor(quiz.target / 60), tm = quiz.target % 60, t = frenchTime(th, tm);
        speak(quiz.text);
        dig.textContent = digital(th, tm, use24); digBox.style.display = '';
        panel.innerHTML = `<div class="fc-label">${ok ? '✅' : '👀'} ${esc(msg)}</div>
            <div class="fc-big">${esc(t.everyday)}</div><div class="fc-formal">24 h: ${esc(t.formal)}</div>
            <div class="fc-row"><button type="button" class="fc-btn pri" data-a="next">Next →</button></div>
            <p class="fc-small">Score ${quiz.score} / ${quiz.n}</p>`;
        panel.querySelector('[data-a="next"]').addEventListener('click', next);
    }
    function readPanel() {
        const th = Math.floor(quiz.target / 60), tm = quiz.target % 60;
        const right = frenchTime(th, tm);
        const choices = new Set([right.everyday]);
        let guard = 0;
        while (choices.size < 4 && guard++ < 50) {
            const delta = [5, 10, 15, 30, 60, -5, -15, -60, 720, 55][rand(10)];
            const o = (quiz.target + delta + 1440) % 1440;
            choices.add(frenchTime(Math.floor(o / 60), o % 60).everyday);
        }
        const list = [...choices].sort(() => Math.random() - 0.5);
        panel.innerHTML = `<div class="fc-label">Read the clock · ${quiz.n}</div>
            <div class="fc-big">Quelle heure est-il ?</div>
            <p class="fc-small">It is ${th < 12 ? 'morning (am)' : th < 18 ? 'afternoon' : 'evening'}.</p>
            <div class="fc-opts">${list.map((c, i) => `<button type="button" class="fc-opt" data-i="${i}">${esc(c)}</button>`).join('')}</div>
            <p class="fc-small">Score ${quiz.score} / ${quiz.n - 1}</p>`;
        panel.querySelectorAll('.fc-opt').forEach(b => b.addEventListener('click', () => {
            if (panel.dataset.answered === String(quiz.n)) return;
            panel.dataset.answered = String(quiz.n);
            const ok = list[Number(b.dataset.i)] === right.everyday;
            if (ok) quiz.score++;
            b.classList.add(ok ? 'ok' : 'no');
            if (!ok) panel.querySelectorAll('.fc-opt').forEach(x => { if (x.textContent === right.everyday) x.classList.add('ok'); });
            speak(right.everyday);
            const row = document.createElement('div'); row.className = 'fc-row';
            row.innerHTML = `<button type="button" class="fc-btn pri">Next →</button><span class="fc-small">24 h: ${esc(right.formal)}</span>`;
            row.querySelector('button').addEventListener('click', next);
            panel.appendChild(row);
        }));
    }
    draw();
}

window.FrenchClock = { mount, say: frenchTime };
// the clock is the hands-on tool of Telling Time (Vocab theme 6)
window.VocabTools = window.VocabTools || {};
window.VocabTools[6] = { name: 'Interactive clock', next: 'Try the interactive clock', mount };
})();
