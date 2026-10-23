// vocab-tools.js - hands-on tools for the Vocab topics that are about rules more than things.
// Each tool sits in the topic's step 2 (where other topics have a memory palace):
//   4  Numbers & Scale Units  -> Number builder
//   5  The Calendar & Timeline -> Calendar
//   14 Les Couleurs            -> Colour dresser
// (6, Telling Time, has the clock in clock.js, and 10, Nationalités, has the World map in nationalites.js;
//  both register themselves here too.)
//   VocabTools[themeId] = { name, next, mount(el, { say }) }
//   VocabTools.numberFr(n) -> French words for 0 <= n < 1 000 000 000 (traditional spelling)
(function () {
const T = window.VocabTools = window.VocabTools || {};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const plain = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s-]+/g, ' ').trim();

const CSS = `
.vt{display:grid;gap:16px}
.vt-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;align-items:start}
@media (max-width:860px){.vt-grid{grid-template-columns:minmax(0,1fr)}}
.vt-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px;display:grid;gap:10px}
.vt-label{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#4f46e5}
.vt-big{font-size:clamp(1.5rem,4vw,2.2rem);font-weight:900;line-height:1.15;color:#0f172a;overflow-wrap:anywhere}
.vt-mid{font-size:1.15rem;font-weight:700;color:#334155}
.vt-small{font-size:14px;color:#64748b}
.vt-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.vt-btn{font-weight:700;font-size:15px;border:1px solid #e2e8f0;background:#fff;color:#0f172a;border-radius:12px;padding:8px 14px;min-height:44px;cursor:pointer}
.vt-btn.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.vt-btn[aria-pressed="true"]{background:#eef2ff;border-color:#6366f1;color:#3730a3}
.vt-btn:focus-visible,.vt-day:focus-visible,.vt-sw:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
.vt-input{font-size:1.6rem;font-weight:800;width:100%;max-width:16rem;padding:8px 12px;border:2px solid #c7d2fe;border-radius:12px;font-variant-numeric:tabular-nums}
.vt-text{font-size:1.05rem;width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:12px}
.vt-chips{display:flex;flex-wrap:wrap;gap:8px}
.vt-chip{border-radius:12px;padding:8px 12px;background:#f1f5f9;display:grid;gap:2px}
.vt-chip b{font-size:1.05rem;color:#0f172a}.vt-chip span{font-size:12px;color:#475569;font-variant-numeric:tabular-nums}
.vt-chip.c0{background:#eef2ff}.vt-chip.c1{background:#ecfdf5}.vt-chip.c2{background:#fff7ed}.vt-chip.c3{background:#fdf2f8}
.vt-note{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:10px 12px;font-size:15px;color:#1e293b}
.vt-fb{font-weight:800}.vt-fb.ok{color:#047857}.vt-fb.no{color:#be123c}
.vt-opt{text-align:left;font-size:16px;font-weight:600;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:10px 14px;min-height:48px;cursor:pointer}
.vt-opt.ok{background:#ecfdf5;border-color:#059669}.vt-opt.no{background:#fff1f2;border-color:#e11d48}
.vt-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
.vt-dow{text-align:center;font-size:12px;font-weight:800;color:#64748b;text-transform:lowercase;padding:4px 0}
.vt-day{min-height:48px;border:1px solid #e2e8f0;background:#fff;border-radius:10px;font-weight:700;font-size:16px;cursor:pointer;font-variant-numeric:tabular-nums}
.vt-day.we{background:#f8fafc;color:#64748b}.vt-day.today{border:2px solid #4f46e5}
.vt-day.on{background:#4f46e5;color:#fff;border-color:#4f46e5}.vt-day.right{background:#059669;color:#fff}.vt-day.wrong{background:#e11d48;color:#fff}
.vt-day.blank{visibility:hidden}
.vt-sws{display:flex;flex-wrap:wrap;gap:8px}
.vt-sw{width:48px;height:48px;border-radius:999px;border:3px solid #fff;box-shadow:0 0 0 1px #cbd5e1;cursor:pointer}
.vt-sw[aria-pressed="true"]{box-shadow:0 0 0 3px #4f46e5}
.vt-thing{font-size:28px;min-width:56px;min-height:56px;border:1px solid #e2e8f0;background:#fff;border-radius:12px;cursor:pointer}
.vt-thing[aria-pressed="true"]{border:2px solid #4f46e5;background:#eef2ff}
.vt-show{display:flex;align-items:center;gap:16px}
.vt-blob{width:96px;height:96px;border-radius:24px;display:flex;align-items:center;justify-content:center;font-size:56px;border:1px solid #cbd5e1;flex:none}
`;
function css() { if (!document.getElementById('vt-css')) { const s = document.createElement('style'); s.id = 'vt-css'; s.textContent = CSS; document.head.appendChild(s); } }

// ===================== Numbers =====================
const U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const TENS = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante' };
// 0-99, with "final" telling whether nothing follows (quatre-vingts takes an s only then)
function under100(n, final = true) {
    if (n < 20) return U[n];
    const t = Math.floor(n / 10), u = n % 10;
    if (t <= 6) return TENS[t] + (u === 0 ? '' : u === 1 ? ' et un' : '-' + U[u]);
    if (t === 7) return 'soixante' + (u === 1 ? ' et onze' : '-' + U[10 + u]);
    if (t === 8) return u === 0 ? (final ? 'quatre-vingts' : 'quatre-vingt') : 'quatre-vingt-' + U[u];
    return 'quatre-vingt-' + U[10 + u];
}
function under1000(n, final = true) {
    const h = Math.floor(n / 100), r = n % 100;
    if (!h) return under100(r, final);
    const head = h === 1 ? 'cent' : U[h] + (r === 0 && final ? ' cents' : ' cent');
    return r ? head + ' ' + under100(r, final) : head;
}
function numberFr(n) {
    n = Math.floor(Math.abs(Number(n) || 0));
    if (n === 0) return 'zéro';
    const parts = [];
    const mil = Math.floor(n / 1e6), th = Math.floor(n / 1000) % 1000, rest = n % 1000;
    if (mil) parts.push(mil === 1 ? 'un million' : under1000(mil) + ' millions');
    if (th) parts.push(th === 1 ? 'mille' : under1000(th, false) + ' mille');
    if (rest) parts.push(under1000(rest));
    return parts.join(' ');
}
T.numberFr = numberFr;
// the pieces of a number, for the colour blocks
function pieces(n) {
    const out = [];
    const mil = Math.floor(n / 1e6), th = Math.floor(n / 1000) % 1000, rest = n % 1000;
    if (mil) out.push([mil === 1 ? 'un million' : under1000(mil) + ' millions', `${mil} × 1 000 000`]);
    if (th) out.push([th === 1 ? 'mille' : under1000(th, false) + ' mille', `${th} × 1 000`]);
    if (rest || !out.length) {
        const h = Math.floor(rest / 100), r = rest % 100;
        if (h) out.push([h === 1 ? 'cent' : U[h] + (r === 0 ? ' cents' : ' cent'), h === 1 ? '100' : `${h} × 100`]);
        if (r || !out.length) {
            const t = Math.floor(r / 10), u = r % 10;
            if (t === 7) out.push(['soixante', '60'], [u === 1 ? 'et onze' : U[10 + u], u === 1 ? '+ 11' : `+ ${10 + u}`]);
            else if (t === 8) out.push([u === 0 ? 'quatre-vingts' : 'quatre-vingt', '4 × 20'], ...(u ? [[U[u], `+ ${u}`]] : []));
            else if (t === 9) out.push(['quatre-vingt', '4 × 20'], [U[10 + u], `+ ${10 + u}`]);
            else out.push([under100(r), String(r)]);
        }
    }
    return out;
}
function numberNotes(n) {
    const notes = [], r = n % 100, s = String(n);
    if (r >= 70 && r < 100) notes.push('70 to 99 count in twenties: 70 = <b>soixante-dix</b> (60 + 10), 80 = <b>quatre-vingts</b> (4 × 20), 90 = <b>quatre-vingt-dix</b> (4 × 20 + 10). In Belgium and Switzerland: <b>septante</b>, <b>nonante</b> (and <b>huitante</b> in parts of Switzerland).');
    if ([21, 31, 41, 51, 61, 71].includes(r)) notes.push('<b>et</b> joins the 1 in 21, 31, 41, 51, 61 and 71 only: vingt <b>et</b> un, but quatre-vingt-un.');
    if (r === 80 || /quatre-vingts/.test(numberFr(n))) notes.push('<b>quatre-vingts</b> takes an s only when nothing follows it: quatre-vingts, but quatre-vingt-trois.');
    if (n % 100 === 0 && Math.floor(n / 100) % 10 > 1 && n < 1000) notes.push('<b>cents</b> takes an s when nothing follows: deux cents, but deux cent un.');
    if (n >= 1000) notes.push('<b>mille</b> never takes an s and you never say "un mille": mille, deux mille. In numbers, French puts a space for thousands: ' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + '.');
    if (n >= 1e6) notes.push('<b>million</b> is a noun: un million, deux millions, and "un million <b>d</b>\'euros".');
    return notes;
}

function mountNumbers(root, { say }) {
    css();
    let n = 97, mode = 'build', quiz = null, range = 100;
    root.innerHTML = `<div class="vt">
      <div class="vt-row" role="group" aria-label="Mode">
        <button type="button" class="vt-btn" data-mode="build" aria-pressed="true">Build a number</button>
        <button type="button" class="vt-btn" data-mode="listen" aria-pressed="false">Listen and type</button>
        <button type="button" class="vt-btn" data-mode="read" aria-pressed="false">Read and type</button>
        <button type="button" class="vt-btn" data-mode="write" aria-pressed="false">Write it in French</button>
      </div>
      <div class="vt-main"></div></div>`;
    const main = root.querySelector('.vt-main');
    root.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
        mode = b.dataset.mode;
        root.querySelectorAll('[data-mode]').forEach(x => x.setAttribute('aria-pressed', x === b));
        if (mode === 'build') build(); else { quiz = { n: 0, score: 0 }; ask(); }
    }));
    function build() {
        main.innerHTML = `<div class="vt-grid">
          <div class="vt-card">
            <label class="vt-label" for="vt-n">Type a number</label>
            <div class="vt-row"><button type="button" class="vt-btn" data-d="-1" aria-label="One less">−</button>
              <input id="vt-n" class="vt-input" type="number" inputmode="numeric" min="0" max="999999999" value="${n}">
              <button type="button" class="vt-btn" data-d="1" aria-label="One more">+</button></div>
            <div class="vt-row">${[21, 71, 80, 81, 91, 99, 200, 201, 1000, 2026, 1000000].map(x => `<button type="button" class="vt-btn" data-n="${x}">${x.toLocaleString('fr-FR')}</button>`).join('')}
              <button type="button" class="vt-btn" data-rand>🎲</button></div>
          </div>
          <div class="vt-card" aria-live="polite">
            <div class="vt-label">En français</div><div class="vt-big" id="vt-words"></div>
            <div class="vt-row"><button type="button" class="vt-btn" id="vt-say">🔊 Listen</button></div>
            <div class="vt-chips" id="vt-chips"></div><div id="vt-notes" class="vt"></div>
          </div></div>`;
        const inp = main.querySelector('#vt-n');
        const upd = () => {
            n = Math.max(0, Math.min(999999999, Math.floor(Number(inp.value) || 0)));
            main.querySelector('#vt-words').textContent = numberFr(n);
            main.querySelector('#vt-chips').innerHTML = pieces(n).map(([w, m], i) => `<div class="vt-chip c${i % 4}"><b>${esc(w)}</b><span>${esc(m)}</span></div>`).join('');
            main.querySelector('#vt-notes').innerHTML = numberNotes(n).map(t => `<div class="vt-note">${t}</div>`).join('');
        };
        inp.addEventListener('input', upd);
        main.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { inp.value = Math.max(0, n + Number(b.dataset.d)); upd(); say(numberFr(n)); }));
        main.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => { inp.value = b.dataset.n; upd(); say(numberFr(n)); }));
        main.querySelector('[data-rand]').addEventListener('click', () => { inp.value = rand(0, 100) < 60 ? rand(0, 100) : rand(100, 2100); upd(); say(numberFr(n)); });
        main.querySelector('#vt-say').addEventListener('click', () => say(numberFr(n)));
        upd();
    }
    function pick() {
        if (range === 20) return rand(0, 20);
        if (range === 100) return Math.random() < 0.5 ? rand(60, 99) : rand(0, 99);
        if (range === 1000) return rand(100, 999);
        return Math.random() < 0.5 ? rand(1000, 2100) : rand(1000, 999999);
    }
    function ask() {
        quiz.n++; quiz.target = pick(); quiz.tries = 0;
        const t = quiz.target, fr = numberFr(t);
        const prompt = mode === 'listen' ? 'Listen and type the number in digits.'
            : mode === 'read' ? 'Read it and type the number in digits.' : 'Write this number in French words.';
        main.innerHTML = `<div class="vt-card" aria-live="polite">
            <div class="vt-row" role="group" aria-label="Numbers from">${[[20, '0–20'], [100, '0–100'], [1000, '100–999'], [1e6, '1 000+']].map(([v, l]) => `<button type="button" class="vt-btn" data-r="${v}" aria-pressed="${range === v}">${l}</button>`).join('')}</div>
            <div class="vt-label">${prompt} · ${quiz.n}</div>
            ${mode === 'listen' ? '<div class="vt-row"><button type="button" class="vt-btn pri" id="vt-play">🔊 Play again</button></div>'
              : `<div class="vt-big">${esc(mode === 'read' ? fr : t.toLocaleString('fr-FR'))}</div>`}
            <input class="${mode === 'write' ? 'vt-text' : 'vt-input'}" id="vt-ans" ${mode === 'write' ? 'type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="en lettres…"' : 'type="number" inputmode="numeric"'} aria-label="Your answer">
            <div class="vt-row"><button type="button" class="vt-btn pri" id="vt-check">Check</button><button type="button" class="vt-btn" id="vt-show">Show me</button></div>
            <p class="vt-fb" id="vt-fb"></p><p class="vt-small">Score ${quiz.score} / ${quiz.n - 1}</p></div>`;
        main.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => { range = Number(b.dataset.r); quiz.n--; ask(); }));
        if (mode === 'listen') { say(fr); main.querySelector('#vt-play').addEventListener('click', () => say(fr)); }
        const ans = main.querySelector('#vt-ans'); ans.focus();
        const check = () => {
            const v = ans.value.trim();
            const ok = mode === 'write' ? plain(v) === plain(fr) : Number(v.replace(/\s/g, '')) === t && v !== '';
            if (ok) { if (!quiz.tries) quiz.score++; done(true); return; }
            quiz.tries++;
            const fb = main.querySelector('#vt-fb'); fb.className = 'vt-fb no';
            fb.textContent = quiz.tries >= 2 && mode !== 'write' ? `Hint: it starts with ${String(t)[0]} and has ${String(t).length} digits.` : quiz.tries >= 2 ? `Hint: it starts "${fr.split(' ')[0]}".` : 'Not yet. Try again.';
        };
        main.querySelector('#vt-check').addEventListener('click', check);
        ans.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
        main.querySelector('#vt-show').addEventListener('click', () => done(false));
    }
    function done(ok) {
        const t = quiz.target, fr = numberFr(t);
        say(fr);
        main.innerHTML = `<div class="vt-card" aria-live="polite"><div class="vt-label">${ok ? '✅ ' + (quiz.tries ? 'Got it!' : 'Right first time!') : '👀 Here it is'}</div>
            <div class="vt-big">${t.toLocaleString('fr-FR')} = ${esc(fr)}</div>
            <div class="vt-chips">${pieces(t).map(([w, m], i) => `<div class="vt-chip c${i % 4}"><b>${esc(w)}</b><span>${esc(m)}</span></div>`).join('')}</div>
            <div class="vt-row"><button type="button" class="vt-btn pri" id="vt-next">Next →</button></div><p class="vt-small">Score ${quiz.score} / ${quiz.n}</p></div>`;
        main.querySelector('#vt-next').addEventListener('click', ask);
        main.querySelector('#vt-next').focus();
    }
    build();
}
T[4] = { name: 'Number builder', next: 'Build numbers', mount: mountNumbers };

// ===================== Calendar =====================
const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const dow = (d) => (d.getDay() + 6) % 7;    // Monday = 0
const dateFr = (d) => `le ${DAYS[dow(d)]} ${d.getDate() === 1 ? 'premier' : numberFr(d.getDate())} ${MONTHS[d.getMonth()]}`;
const dateDigits = (d) => `le ${DAYS[dow(d)]} ${d.getDate() === 1 ? '1er' : d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
function relative(d, today) {
    const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 864e5);
    const name = { '-2': "avant-hier", '-1': 'hier', 0: "aujourd'hui", 1: 'demain', 2: 'après-demain' }[diff];
    if (name) return name;
    if (diff === 7) return 'dans une semaine (la semaine prochaine)';
    if (diff === -7) return 'il y a une semaine (la semaine dernière)';
    return diff > 0 ? `dans ${numberFr(diff)} jours` : `il y a ${numberFr(-diff)} jours`;
}
const relEn = { "avant-hier": 'the day before yesterday', hier: 'yesterday', "aujourd'hui": 'today', demain: 'tomorrow', 'après-demain': 'the day after tomorrow' };

function mountCalendar(root, { say }) {
    css();
    const today = new Date();
    let view = new Date(today.getFullYear(), today.getMonth(), 1), sel = new Date(today), mode = 'explore', quiz = null;
    root.innerHTML = `<div class="vt">
      <div class="vt-row" role="group" aria-label="Mode">
        <button type="button" class="vt-btn" data-mode="explore" aria-pressed="true">Explore</button>
        <button type="button" class="vt-btn" data-mode="find" aria-pressed="false">Find the date</button>
        <button type="button" class="vt-btn" data-mode="listen" aria-pressed="false">Listen and tap</button>
      </div>
      <div class="vt-grid">
        <div class="vt-card">
          <div class="vt-row" style="justify-content:space-between">
            <button type="button" class="vt-btn" data-m="-1" aria-label="Previous month">◀</button>
            <div class="vt-mid" id="vt-month"></div>
            <button type="button" class="vt-btn" data-m="1" aria-label="Next month">▶</button>
          </div>
          <div class="vt-cal" id="vt-cal"></div>
          <p class="vt-small">French weeks start on <b>lundi</b>. Days and months take no capital letter.</p>
        </div>
        <div class="vt-card" id="vt-side" aria-live="polite"></div>
      </div></div>`;
    const side = root.querySelector('#vt-side');
    root.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + Number(b.dataset.m), 1); draw(); }));
    root.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
        mode = b.dataset.mode; root.querySelectorAll('[data-mode]').forEach(x => x.setAttribute('aria-pressed', x === b));
        if (mode === 'explore') { draw(); explain(); } else { quiz = { n: 0, score: 0 }; ask(); }
    }));
    function draw() {
        root.querySelector('#vt-month').textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;
        const first = dow(view), days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
        let h = DAYS.map(d => `<div class="vt-dow">${d.slice(0, 3)}</div>`).join('');
        for (let i = 0; i < first; i++) h += '<div class="vt-day blank" aria-hidden="true"></div>';
        for (let d = 1; d <= days; d++) {
            const date = new Date(view.getFullYear(), view.getMonth(), d);
            const cls = [dow(date) >= 5 ? 'we' : '', date.toDateString() === today.toDateString() ? 'today' : '', mode === 'explore' && date.toDateString() === sel.toDateString() ? 'on' : ''].join(' ');
            h += `<button type="button" class="vt-day ${cls}" data-d="${d}" aria-label="${esc(dateDigits(date))}">${d}</button>`;
        }
        const cal = root.querySelector('#vt-cal'); cal.innerHTML = h;
        cal.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => tap(new Date(view.getFullYear(), view.getMonth(), Number(b.dataset.d)), b)));
    }
    function explain() {
        const rel = relative(sel, today), isToday = sel.toDateString() === today.toDateString();
        const said = `${isToday ? "Aujourd'hui, c'est" : "C'est"} ${dateFr(sel)} ${numberFr(sel.getFullYear())}.`;
        side.innerHTML = `<div class="vt-label">${esc(rel)}${relEn[rel] ? ' · ' + relEn[rel] : ''}</div>
            <div class="vt-big">${esc(dateDigits(sel))}</div>
            <div class="vt-mid">${esc(said)}</div>
            <div class="vt-row"><button type="button" class="vt-btn" id="vt-say">🔊 Listen</button></div>
            <div class="vt-note">Say <b>le</b> + day + number + month: <i>le ${esc(DAYS[dow(sel)])} ${sel.getDate() === 1 ? 'premier' : sel.getDate()} ${esc(MONTHS[sel.getMonth()])}</i>. Only the 1st is different: <b>le premier</b> (1er). In a month: <b>en ${esc(MONTHS[sel.getMonth()])}</b>. In a year: <b>en ${numberFr(sel.getFullYear())}</b>.</div>
            <div class="vt-small">Quelle est la date ? → On est ${esc(dateFr(sel))}.</div>`;
        side.querySelector('#vt-say').addEventListener('click', () => say(said));
    }
    function tap(date, btn) {
        if (mode === 'explore') { sel = date; draw(); explain(); say(`${dateFr(date)}`); return; }
        if (date.toDateString() === quiz.target.toDateString()) {
            if (!quiz.tries) quiz.score++;
            btn.classList.add('right'); say(dateFr(date));
            side.innerHTML = `<div class="vt-label">✅ ${quiz.tries ? 'Found it!' : 'Right first time!'}</div><div class="vt-big">${esc(dateDigits(date))}</div>
                <div class="vt-row"><button type="button" class="vt-btn pri" id="vt-next">Next →</button></div><p class="vt-small">Score ${quiz.score} / ${quiz.n}</p>`;
            side.querySelector('#vt-next').addEventListener('click', ask);
        } else {
            quiz.tries++; btn.classList.add('wrong'); setTimeout(() => btn.classList.remove('wrong'), 600);
            const fb = side.querySelector('#vt-fb');
            if (fb) { fb.className = 'vt-fb no'; fb.textContent = `That is ${dateDigits(date)}. ${quiz.tries >= 2 ? 'Hint: look in the ' + DAYS[dow(quiz.target)] + ' column.' : 'Try again.'}`; }
        }
    }
    function ask() {
        quiz.n++; quiz.tries = 0;
        const d = rand(1, new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate());
        quiz.target = new Date(view.getFullYear(), view.getMonth(), d);
        draw();
        const listen = mode === 'listen';
        side.innerHTML = `<div class="vt-label">${listen ? 'Listen and tap the date' : 'Tap this date'} · ${quiz.n}</div>
            ${listen ? '<div class="vt-row"><button type="button" class="vt-btn pri" id="vt-play">🔊 Play again</button></div>' : `<div class="vt-big">${esc(dateFr(quiz.target))}</div>`}
            <p class="vt-fb" id="vt-fb"></p><p class="vt-small">Score ${quiz.score} / ${quiz.n - 1}</p>`;
        if (listen) { say(dateFr(quiz.target)); side.querySelector('#vt-play').addEventListener('click', () => say(dateFr(quiz.target))); }
    }
    draw(); explain();
}
T[5] = { name: 'Calendar', next: 'Try the calendar', mount: mountCalendar };

// ===================== Colours =====================
// m, f = masculine and feminine singular; inv = never changes
const COLOURS = [
    { m: 'rouge', f: 'rouge', en: 'red', hex: '#dc2626' }, { m: 'bleu', f: 'bleue', en: 'blue', hex: '#2563eb' },
    { m: 'jaune', f: 'jaune', en: 'yellow', hex: '#facc15' }, { m: 'vert', f: 'verte', en: 'green', hex: '#16a34a' },
    { m: 'noir', f: 'noire', en: 'black', hex: '#0f172a' }, { m: 'blanc', f: 'blanche', en: 'white', hex: '#ffffff' },
    { m: 'gris', f: 'grise', en: 'grey', hex: '#9ca3af' }, { m: 'violet', f: 'violette', en: 'purple', hex: '#7c3aed' },
    { m: 'rose', f: 'rose', en: 'pink', hex: '#f472b6' }, { m: 'beige', f: 'beige', en: 'beige', hex: '#e7d7b8' },
    { m: 'orange', f: 'orange', en: 'orange', hex: '#f97316', inv: true }, { m: 'marron', f: 'marron', en: 'brown', hex: '#7c4a1e', inv: true },
    { m: 'bordeaux', f: 'bordeaux', en: 'burgundy', hex: '#7f1d1d', inv: true }, { m: 'kaki', f: 'kaki', en: 'khaki', hex: '#78794a', inv: true },
    { m: 'bleu marine', f: 'bleu marine', en: 'navy blue', hex: '#1e3a8a', inv: true },
];
const THINGS = [
    { fr: 'robe', art: 'une', g: 'f', pl: false, e: '👗', en: 'a dress' }, { fr: 'pull', art: 'un', g: 'm', pl: false, e: '🧶', en: 'a sweater' },
    { fr: 'voiture', art: 'une', g: 'f', pl: false, e: '🚗', en: 'a car' }, { fr: 'sac', art: 'un', g: 'm', pl: false, e: '👜', en: 'a bag' },
    { fr: 'chaussures', art: 'des', g: 'f', pl: true, e: '👟', en: 'shoes' }, { fr: 'gants', art: 'des', g: 'm', pl: true, e: '🧤', en: 'gloves' },
    { fr: 'fleurs', art: 'des', g: 'f', pl: true, e: '🌷', en: 'flowers' }, { fr: 'yeux', art: 'des', g: 'm', pl: true, e: '👀', en: 'eyes' },
];
function colourWord(c, t, shade) {
    if (c.inv || shade) return c.m + (shade ? ' ' + shade : '');
    let w = t.g === 'f' ? c.f : c.m;
    if (t.pl && !/[sx]$/.test(w)) w += 's';
    return w;
}
function why(c, t, shade) {
    if (shade) return `With <b>clair</b> (light) or <b>foncé</b> (dark), a colour never changes: ${t.art} ${t.fr} ${c.m} ${shade}.`;
    if (c.inv) return `<b>${c.m}</b> comes from a thing (${c.m === 'orange' ? 'an orange' : c.m === 'marron' ? 'a chestnut' : c.m === 'bordeaux' ? 'the wine' : c.m === 'kaki' ? 'a fruit' : 'the navy'}), so it never changes.`;
    const parts = [];
    if (t.g === 'f') parts.push(c.f === c.m ? `<b>${c.m}</b> already ends in -e, so it stays the same for a feminine word` : `<b>${t.fr}</b> is feminine: ${c.m} → <b>${c.f}</b>`);
    else parts.push(`<b>${t.fr}</b> is masculine: <b>${c.m}</b>`);
    if (t.pl) parts.push(/[sx]$/.test(t.g === 'f' ? c.f : c.m) ? 'it already ends in -s, so no extra s' : 'plural: add <b>-s</b>');
    return parts.join('; ') + '. The colour goes <b>after</b> the noun.';
}

function mountColours(root, { say }) {
    css();
    let ci = 3, ti = 0, shade = '', mode = 'dress', quiz = null;
    root.innerHTML = `<div class="vt">
      <div class="vt-row" role="group" aria-label="Mode">
        <button type="button" class="vt-btn" data-mode="dress" aria-pressed="true">Colour things</button>
        <button type="button" class="vt-btn" data-mode="quiz" aria-pressed="false">Pick the right ending</button>
      </div><div class="vt-main"></div></div>`;
    const main = root.querySelector('.vt-main');
    root.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
        mode = b.dataset.mode; root.querySelectorAll('[data-mode]').forEach(x => x.setAttribute('aria-pressed', x === b));
        if (mode === 'dress') dress(); else { quiz = { n: 0, score: 0 }; ask(); }
    }));
    function dress() {
        main.innerHTML = `<div class="vt-grid">
          <div class="vt-card">
            <div class="vt-label">1. Choose a thing</div>
            <div class="vt-row">${THINGS.map((t, i) => `<button type="button" class="vt-thing" data-t="${i}" aria-pressed="${i === ti}" aria-label="${esc(t.art + ' ' + t.fr)}">${t.e}</button>`).join('')}</div>
            <div class="vt-label">2. Choose a colour</div>
            <div class="vt-sws">${COLOURS.map((c, i) => `<button type="button" class="vt-sw" data-c="${i}" aria-pressed="${i === ci}" aria-label="${esc(c.m)}" title="${esc(c.m)}" style="background:${c.hex}"></button>`).join('')}</div>
            <div class="vt-row" role="group" aria-label="Shade">${[['', 'Normal'], ['clair', 'Light (clair)'], ['foncé', 'Dark (foncé)']].map(([v, l]) => `<button type="button" class="vt-btn" data-s="${v}" aria-pressed="${shade === v}">${l}</button>`).join('')}</div>
          </div>
          <div class="vt-card" aria-live="polite" id="vt-out"></div></div>`;
        main.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => { ti = Number(b.dataset.t); dress(); speakOut(); }));
        main.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => { ci = Number(b.dataset.c); dress(); speakOut(); }));
        main.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { shade = b.dataset.s; dress(); speakOut(); }));
        const t = THINGS[ti], c = COLOURS[ci], phrase = `${t.art} ${t.fr} ${colourWord(c, t, shade)}`;
        const out = main.querySelector('#vt-out');
        out.innerHTML = `<div class="vt-show"><div class="vt-blob" style="background:${c.hex}${shade === 'clair' ? ';filter:brightness(1.35) saturate(.7)' : shade === 'foncé' ? ';filter:brightness(.6)' : ''}">${t.e}</div>
            <div><div class="vt-big">${esc(phrase)}</div><div class="vt-mid">${esc(t.en)}, ${esc((shade === 'clair' ? 'light ' : shade === 'foncé' ? 'dark ' : '') + c.en)}</div></div></div>
            <div class="vt-row"><button type="button" class="vt-btn" id="vt-say">🔊 Listen</button></div>
            <div class="vt-note">${why(c, t, shade)}</div>`;
        out.querySelector('#vt-say').addEventListener('click', speakOut);
    }
    function speakOut() { const t = THINGS[ti]; say(`${t.art} ${t.fr} ${colourWord(COLOURS[ci], t, shade)}`); }
    function ask() {
        quiz.n++;
        const t = THINGS[rand(0, THINGS.length - 1)], c = COLOURS[rand(0, COLOURS.length - 1)], sh = Math.random() < 0.15 ? (Math.random() < 0.5 ? 'clair' : 'foncé') : '';
        const right = `${t.art} ${t.fr} ${colourWord(c, t, sh)}`;
        const forms = new Set([right]);
        [c.m, c.f, c.m + 's', c.f + 's', c.m + (sh ? ' ' + sh : ''), c.f + 'e', c.f + (sh ? ' ' + sh + 's' : 's')].forEach(f => forms.add(`${t.art} ${t.fr} ${f}`));
        forms.add(`${t.art} ${c.f} ${t.fr}`);   // colour in front: wrong place
        const opts = shuffle([right, ...shuffle([...forms].filter(x => x !== right)).slice(0, 3)]);
        main.innerHTML = `<div class="vt-card" aria-live="polite"><div class="vt-label">Which is right? · ${quiz.n}</div>
            <div class="vt-show"><div class="vt-blob" style="background:${c.hex}">${t.e}</div><div class="vt-big">${esc(t.en)}, ${esc((sh === 'clair' ? 'light ' : sh === 'foncé' ? 'dark ' : '') + c.en)}</div></div>
            <div class="vt">${opts.map((o, i) => `<button type="button" class="vt-opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>
            <p class="vt-small">Score ${quiz.score} / ${quiz.n - 1}</p></div>`;
        let answered = false;
        main.querySelectorAll('.vt-opt').forEach(b => b.addEventListener('click', () => {
            if (answered) return; answered = true;
            const ok = opts[Number(b.dataset.i)] === right;
            if (ok) quiz.score++;
            b.classList.add(ok ? 'ok' : 'no');
            if (!ok) main.querySelectorAll('.vt-opt').forEach(x => { if (x.textContent === right) x.classList.add('ok'); });
            say(right);
            const card = main.querySelector('.vt-card');
            card.insertAdjacentHTML('beforeend', `<div class="vt-note">${why(c, t, sh)}</div><div class="vt-row"><button type="button" class="vt-btn pri" id="vt-next">Next →</button></div>`);
            card.querySelector('#vt-next').addEventListener('click', ask);
        }));
    }
    dress();
}
T[14] = { name: 'Colour dresser', next: 'Colour things in French', mount: mountColours };
})();
