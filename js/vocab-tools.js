// vocab-tools.js - hands-on tools for the Vocab topics that are about rules more than things.
// Each tool sits in the topic's step 2 (where other topics have a memory palace):
//   4  Numbers & Scale Units  -> Number builder
//   5  The Calendar & Timeline -> Calendar
//   14 Les Couleurs            -> Colour dresser
// (6, Telling Time, has the clock in clock.js, 7, Frequency & Time Adverbs, has the Time line in time-line.js,
//  8, La Météo, has the weather video in weather-video.js, and 10, Nationalités, has the World map in nationalites.js;
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
.vt-sel{font:inherit;font-size:var(--fs-base);font-weight:800;color:#0f172a;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:8px 6px;min-height:44px;min-width:0;cursor:pointer}
.vt{display:grid;gap:16px}
.vt-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;align-items:start}
@media (max-width:860px){.vt-grid{grid-template-columns:minmax(0,1fr)}}
.vt-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px;display:grid;gap:10px}
.vt-label{font-size:var(--fs-xs);font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#4f46e5}
@media(min-width:768px){.vt-big{font-size:var(--fs-3xl)!important}}
.vt-big{font-size:var(--fs-2xl);font-weight:900;line-height:1.15;color:#0f172a;overflow-wrap:anywhere}
.vt-mid{font-size:var(--fs-lg);font-weight:700;color:#334155}
.vt-small{font-size:var(--fs-sm);color:#64748b}
.vt-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.vt-btn{font-weight:700;font-size:var(--fs-base);border:1px solid #e2e8f0;background:#fff;color:#0f172a;border-radius:12px;padding:8px 14px;min-height:44px;cursor:pointer}
.vt-btn.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.vt-btn[aria-pressed="true"]{background:#eef2ff;border-color:#6366f1;color:#3730a3}
.vt-btn:focus-visible,.vt-day:focus-visible,.vt-sw:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
.vt-input{font-size:var(--fs-3xl);font-weight:800;width:100%;min-width:0;max-width:16rem;padding:8px 12px;border:2px solid #c7d2fe;border-radius:12px;font-variant-numeric:tabular-nums}
.vt-text{font-size:var(--fs-base);width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:12px}
.vt-chips{display:flex;flex-wrap:wrap;gap:8px}
.vt-chip{border-radius:12px;padding:8px 12px;background:#f1f5f9;display:grid;gap:2px}
.vt-chip b{font-size:var(--fs-base);color:#0f172a}.vt-chip span{font-size:var(--fs-xs);color:#475569;font-variant-numeric:tabular-nums}
.vt-chip.c0{background:#eef2ff}.vt-chip.c1{background:#ecfdf5}.vt-chip.c2{background:#fff7ed}.vt-chip.c3{background:#fdf2f8}
.vt-note{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:10px 12px;font-size:var(--fs-base);color:#1e293b}
.vt-fb{font-weight:800}.vt-fb.ok{color:#047857}.vt-fb.no{color:#be123c}
.vt-opt{text-align:left;font-size:var(--fs-base);font-weight:600;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:10px 14px;min-height:48px;cursor:pointer}
.vt-opt.ok{background:#ecfdf5;border-color:#059669}.vt-opt.no{background:#fff1f2;border-color:#e11d48}
.vt-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
.vt-dow{text-align:center;font-size:var(--fs-xs);font-weight:800;color:#64748b;text-transform:lowercase;padding:4px 0}
.vt-day{min-height:48px;border:1px solid #e2e8f0;background:#fff;border-radius:10px;font-weight:700;font-size:var(--fs-base);cursor:pointer;font-variant-numeric:tabular-nums}
.vt-day.we{background:#f8fafc;color:#64748b}.vt-day.today{border:2px solid #4f46e5}
.vt-day.on{background:#4f46e5;color:#fff;border-color:#4f46e5}.vt-day.right{background:#059669;color:#fff}.vt-day.wrong{background:#e11d48;color:#fff}
.vt-day.blank{visibility:hidden}
.vt-sws{display:flex;flex-wrap:wrap;gap:8px}
.vt-sw{width:48px;height:48px;border-radius:999px;border:3px solid #fff;box-shadow:0 0 0 1px #cbd5e1;cursor:pointer}
.vt-sw[aria-pressed="true"]{box-shadow:0 0 0 3px #4f46e5}
.vt-thing{font-size:var(--fs-3xl);min-width:56px;min-height:56px;border:1px solid #e2e8f0;background:#fff;border-radius:12px;cursor:pointer}
.vt-thing[aria-pressed="true"]{border:2px solid #4f46e5;background:#eef2ff}
.vt-show{display:flex;align-items:center;gap:16px}
.vt-blob{width:120px;height:120px;border-radius:24px;display:flex;align-items:center;justify-content:center;padding:8px;background:#f8fafc;border:1px solid #e2e8f0;flex:none}
.vt-thing svg{width:36px;height:36px;display:block;margin:auto}
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
            <div class="vt-row" style="flex-wrap:nowrap"><button type="button" class="vt-btn" data-d="-1" aria-label="One less" style="flex:none">−</button>
              <input id="vt-n" class="vt-input" type="number" inputmode="numeric" min="0" max="999999999" value="${n}">
              <button type="button" class="vt-btn" data-d="1" aria-label="One more" style="flex:none">+</button></div>
            <div class="vt-row">${[21, 71, 80, 81, 91, 99, 200, 201, 1000, 2026, 1000000].map(x => `<button type="button" class="vt-btn" data-n="${x}">${x.toLocaleString('fr-FR')}</button>`).join('')}
              <button type="button" class="vt-btn" data-rand>🎲</button></div>
          </div>
          <div class="vt-card" aria-live="polite">
            <div class="vt-label">En français</div><div class="vt-big" id="vt-words"></div>
            <div class="vt-row"><button type="button" class="vt-btn" id="vt-say">🔊 Listen</button></div>
            <div class="vt-chips" id="vt-chips"></div><div id="vt-notes" class="vt"></div>
          </div></div>`;
        const inp = main.querySelector('#vt-n');
        let hide = false;   // after the dice: the French stays hidden until Listen
        const upd = () => {
            n = Math.max(0, Math.min(999999999, Math.floor(Number(inp.value) || 0)));
            main.querySelector('#vt-words').innerHTML = hide ? '<span style="color:#64748b;font-size:.6em">Say it out loud, then tap 🔊 Listen to check.</span>' : esc(numberFr(n));
            main.querySelector('#vt-chips').style.display = main.querySelector('#vt-notes').style.display = hide ? 'none' : '';
            main.querySelector('#vt-chips').innerHTML = pieces(n).map(([w, m], i) => `<div class="vt-chip c${i % 4}"><b>${esc(w)}</b><span>${esc(m)}</span></div>`).join('');
            main.querySelector('#vt-notes').innerHTML = numberNotes(n).map(t => `<div class="vt-note">${t}</div>`).join('');
        };
        inp.addEventListener('input', () => { hide = false; upd(); });
        main.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { hide = false; inp.value = Math.max(0, n + Number(b.dataset.d)); upd(); say(numberFr(n)); }));
        main.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => { hide = false; inp.value = b.dataset.n; upd(); say(numberFr(n)); }));
        // the dice is silent: say the number yourself first, then tap Listen to check
        main.querySelector('[data-rand]').addEventListener('click', () => { inp.value = rand(0, 100) < 60 ? rand(0, 100) : rand(100, 2100); hide = true; upd(); });
        main.querySelector('#vt-say').addEventListener('click', () => { if (hide) { hide = false; upd(); } say(numberFr(n)); });
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
T[4] = { name: 'Number builder', next: 'Build numbers', mount: mountNumbers, wordsInside: true };   // the word tiles follow the builder on the same page

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
    const a = Math.abs(diff), ago = (t) => diff > 0 ? `dans ${t}` : `il y a ${t}`;
    if (a <= 31) return ago(`${numberFr(a)} jours`);
    // further away: months, then years (« dans mille trois cent cinquante jours » helps nobody)
    const months = Math.abs((d.getFullYear() - today.getFullYear()) * 12 + d.getMonth() - today.getMonth());
    if (months < 12) return ago(months <= 1 ? 'un mois' : `${numberFr(months)} mois`);
    const years = Math.floor(months / 12);
    return ago(years === 1 ? 'un an' : `${numberFr(years)} ans`);
}
const relEn = { "avant-hier": 'the day before yesterday', hier: 'yesterday', "aujourd'hui": 'today', demain: 'tomorrow', 'après-demain': 'the day after tomorrow' };

// The calendar page, in four parts that teach before the practice, all at the top of the page (data-place, see vocab.html):
// 1 La semaine, 2 Les mois, 3 Avant, après (hier, demain, la semaine dernière…, then the other words of the topic as tiles:
// data-tiles), 4 La date (the calendar, Find the date, Listen and tap). The day, month and hier/demain cards are the words' cards.
const PIC = (n) => `media/pictures/fe-${n}.webp`;
// Each day is named after a planet (a Roman god); dimanche is « le jour du Seigneur »
const DAY_HOOKS = [
    ['crescent-moon', 'la Lune', 'the Moon'], ['crossed-swords', 'Mars', 'Mars, god of war'], ['wing', 'Mercure', 'Mercury, the winged messenger'],
    ['high-voltage', 'Jupiter', 'Jupiter, god of thunder'], ['sparkling-heart', 'Vénus', 'Venus, goddess of love'], ['ringed-planet', 'Saturne', 'Saturn'],
    ['church', 'le jour du Seigneur', 'the Lord\'s day'],
];
// a picture and a French moment for each month
const MONTH_HOOKS = [
    ['snowman', 'l\'hiver', 'winter'], ['love-letter', 'la Saint-Valentin (le 14)', 'Valentine\'s Day'], ['seedling', 'le printemps (le 20)', 'spring begins'],
    ['fish', 'le poisson d\'avril (le 1er)', 'April Fool\'s Day'], ['bouquet', 'le muguet du 1er mai', 'lily of the valley on May Day'], ['musical-notes', 'la fête de la musique (le 21)', 'the music festival'],
    ['fireworks', 'le 14 juillet', 'Bastille Day'], ['beach-with-umbrella', 'les vacances', 'the holidays'], ['backpack', 'la rentrée', 'back to school'],
    ['grapes', 'les vendanges', 'the grape harvest'], ['fallen-leaf', 'l\'automne', 'autumn'], ['christmas-tree', 'Noël (le 25)', 'Christmas'],
];
const SEASON_OF = ['hiver', 'hiver', 'printemps', 'printemps', 'printemps', 'été', 'été', 'été', 'automne', 'automne', 'automne', 'hiver'];
const SEASON_COL = { hiver: '#0ea5e9', printemps: '#16a34a', été: '#eab308', automne: '#ea580c' };
const CAL_CSS = `
.vc5{display:grid;gap:14px}
.vc5-sec{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:16px;display:grid;gap:12px}
.vc5-sec h3{margin:0;font-size:var(--fs-xl);font-weight:900;color:#0f172a}.vc5-sec h3 small{display:block;font-size:var(--fs-sm);font-weight:600;color:#64748b;margin-top:2px}
.vc5-days{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
@media(max-width:640px){.vc5-days{grid-template-columns:repeat(4,1fr)}}
.vc5-day,.vc5-mon{display:flex;flex-direction:column;align-items:center;gap:2px;border:2px solid #e2e8f0;background:#fff;border-radius:14px;padding:8px 4px;cursor:pointer;font:inherit;text-align:center}
.vc5-day img,.vc5-mon img{width:44px;height:44px}
.vc5-day b,.vc5-mon b{font-size:var(--fs-base);color:#0f172a}.vc5-day small,.vc5-mon small{font-size:var(--fs-xs);color:#64748b;line-height:1.2}
.vc5-day.we{background:#f8fafc}.vc5-day.on,.vc5-mon.on{border-color:#4f46e5;background:#eef2ff}
.vc5-mons{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}
@media(max-width:640px){.vc5-mons{grid-template-columns:repeat(3,1fr)}}
.vc5-mon{border-top:6px solid var(--c)}
.vc5-out{border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;font-size:var(--fs-lg);font-weight:700;color:#0f172a;min-height:48px}
.vc5-out small{display:block;font-size:var(--fs-sm);font-weight:400;color:#64748b}
.vc5-rules{margin:0;padding:0;list-style:none;display:grid;gap:6px}
.vc5-rules li{border-left:5px solid #4f46e5;background:#f8fafc;border-radius:8px;padding:6px 10px;font-size:var(--fs-sm);color:#334155}
.vc5-key{display:flex;flex-wrap:wrap;gap:10px;font-size:var(--fs-xs);font-weight:700;color:#334155}.vc5-key span::before{content:'';display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:4px;vertical-align:-1px;background:var(--c)}
.vc5-line{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.vc5-line.three{grid-template-columns:repeat(3,1fr)}
@media(max-width:640px){.vc5-line{grid-template-columns:repeat(2,1fr)}.vc5-line .now,.vc5-line .tw-wrap:has(>.now){grid-column:1 / -1;order:-1}.vc5-line.three{grid-template-columns:1fr}}
.vc5-rel{border:2px solid #e2e8f0;background:#fff;border-radius:14px;padding:8px;cursor:pointer;font:inherit;text-align:center;display:flex;flex-direction:column;gap:2px}
.vc5-rel b{font-size:var(--fs-base);color:#0f172a}.vc5-rel span{font-size:var(--fs-sm);color:#475569}.vc5-rel small{font-size:var(--fs-xs);color:#64748b}
.vc5-rel.now{border-color:#4f46e5;background:#eef2ff}.vc5-rel.past{background:#fafaf9}
.tw-wrap{display:flex;flex-direction:column;gap:4px;min-width:0}.tw-wrap>button{flex:1}
.vc5-more{display:grid;gap:10px;border-top:1px solid #e2e8f0;padding-top:12px}.vc5-more h4{margin:0;font-size:var(--fs-lg);font-weight:900;color:#0f172a}.vc5-more h4 small{display:block;font-size:var(--fs-sm);font-weight:600;color:#64748b;margin-top:2px}
.vc5-arrow{display:flex;justify-content:space-between;font-size:var(--fs-xs);font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em}
`;
function mountCalendar(root, { say }) {
    css();
    if (!document.getElementById('vc5-css')) { const s = document.createElement('style'); s.id = 'vc5-css'; s.textContent = CAL_CSS; document.head.appendChild(s); }
    const today = new Date(); today.setHours(12, 0, 0, 0);
    let view = new Date(today.getFullYear(), today.getMonth(), 1), sel = new Date(today), mode = 'explore', quiz = null;
    const dnum = (d) => d === 1 ? '1er' : String(d);
    const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
    const short = (d) => `${DAYS[dow(d)]} ${dnum(d.getDate())} ${MONTHS[d.getMonth()]}`;
    const monday = (n) => { const d = addDays(-dow(today) + 7 * n); return d; };
    const range = (n) => { const a = monday(n), b = new Date(a); b.setDate(a.getDate() + 6); return `du ${dnum(a.getDate())}${a.getMonth() !== b.getMonth() ? ' ' + MONTHS[a.getMonth()] : ''} au ${dnum(b.getDate())} ${MONTHS[b.getMonth()]}`; };
    root.innerHTML = `<div class="vc5">
      <section class="vc5-sec" data-place="chapter-1" id="vc5-week">
        <h3>1 · La semaine <small>The days are named after the planets. Tap a day.</small></h3>
        <div class="vc5-days">${DAYS.map((d, i) => `<button type="button" class="vc5-day${i >= 5 ? ' we' : ''}" data-day="${i}" data-word="${d}"><img src="${PIC(DAY_HOOKS[i][0])}" alt=""><b>${d}</b><small>${esc(DAY_HOOKS[i][1])}</small></button>`).join('')}</div>
        <div class="vc5-out" id="vc5-dout">Lundi comme <b>la Lune</b>, mardi comme <b>Mars</b>… <small>Tap a day to hear it with its picture.</small></div>
        <ul class="vc5-rules">
          <li>The French week starts on <b>lundi</b>. Days take <b>no capital letter</b>: lundi, mardi…</li>
          <li><b>lundi</b> = this Monday (Lundi, je vais au cinéma) · <b>le lundi</b> = every Monday (Le lundi, je fais du sport).</li>
          <li>All the days are masculine: <b>un</b> lundi, <b>le</b> week-end.</li>
        </ul>
      </section>
      <section class="vc5-sec" data-place="chapter-1" id="vc5-year">
        <h3>2 · Les mois <small>Twelve months, coloured by season, each with a French moment. Tap a month.</small></h3>
        <div class="vc5-key">${Object.entries(SEASON_COL).map(([s, c]) => `<span style="--c:${c}">${s === 'été' ? "l'été" : s === 'hiver' ? "l'hiver" : s === 'automne' ? "l'automne" : 'le printemps'}</span>`).join('')}</div>
        <div class="vc5-mons">${MONTHS.map((m, i) => `<button type="button" class="vc5-mon" data-mon="${i}" data-word="${m}" style="--c:${SEASON_COL[SEASON_OF[i]]}"><img src="${PIC(MONTH_HOOKS[i][0])}" alt=""><b>${m}</b><small>${esc(MONTH_HOOKS[i][1])}</small></button>`).join('')}</div>
        <div class="vc5-out" id="vc5-mout">Tap a month. <small>You will hear it in a sentence.</small></div>
        <ul class="vc5-rules">
          <li><b>en</b> janvier or <b>au mois de</b> janvier = in January. No capital letter.</li>
          <li>Seasons: <b>au</b> printemps, but <b>en</b> été, <b>en</b> automne, <b>en</b> hiver.</li>
        </ul>
      </section>
      <section class="vc5-sec" data-place="chapter-1" id="vc5-rel">
        <h3>3 · Avant, après <small>From today: yesterday was, tomorrow will be. Tap a card.</small></h3>
        <div class="vc5-arrow"><span>← avant (passé)</span><span>après (futur) →</span></div>
        <div class="vc5-line" id="vc5-days5"></div>
        <div class="vc5-line three" id="vc5-weeks"></div>
        <div class="vc5-line three" id="vc5-years"></div>
        <div class="vc5-out" id="vc5-rout">Tap a card. <small>Listen to the verb: c'était (past), c'est (now), ce sera (future).</small></div>
        <ul class="vc5-rules">
          <li><b>il y a</b> deux jours = two days ago (avant-hier) · <b>dans</b> deux jours = in two days (après-demain).</li>
          <li>la semaine <b>dernière</b> · cette semaine · la semaine <b>prochaine</b>; the same with le mois, l'année.</li>
        </ul>
        <div class="vc5-more"><h4>More words of the topic <small>la semaine, le jour, ce matin… Tick « Know » for the ones you already know.</small></h4><div data-tiles></div></div>
      </section>
      <section class="vc5-sec" data-place="chapter-1" id="vc5-date">
        <h3>4 · La date <small>Le + day + number + month (+ year). Only the 1st is different: le premier.</small></h3>
        <div class="vt-row" role="group" aria-label="Mode">
          <button type="button" class="vt-btn" data-mode="explore" aria-pressed="true">Explore</button>
          <button type="button" class="vt-btn" data-mode="find" aria-pressed="false">Find the date</button>
          <button type="button" class="vt-btn" data-mode="listen" aria-pressed="false">Listen and tap</button>
        </div>
        <div class="vt-grid">
          <div class="vt-card">
            <div class="vt-row" style="justify-content:space-between;flex-wrap:nowrap;gap:6px">
              <button type="button" class="vt-btn" data-m="-1" aria-label="Previous month" style="padding:8px 12px;flex:none">◀</button>
              <div class="vt-row" style="gap:6px;flex-wrap:nowrap;min-width:0">
                <select class="vt-sel" id="vt-msel" aria-label="Month">${MONTHS.map((m, i) => `<option value="${i}">${m}</option>`).join('')}</select>
                <select class="vt-sel" id="vt-ysel" aria-label="Year">${Array.from({ length: 81 }, (_, k) => today.getFullYear() - 60 + k).map(y => `<option value="${y}">${y}</option>`).join('')}</select>
              </div>
              <button type="button" class="vt-btn" data-m="1" aria-label="Next month" style="padding:8px 12px;flex:none">▶</button>
            </div>
            <div class="vt-cal" id="vt-cal"></div>
            <div class="vt-row" style="justify-content:center"><button type="button" class="vt-btn" id="vt-today">Aujourd'hui</button></div>
          </div>
          <div class="vt-card" id="vt-side" aria-live="polite"></div>
        </div>
      </section>
    </div>`;
    const secs = [...root.querySelectorAll('.vc5-sec')];
    // the parts may be moved on the page (between the chapters), so look inside them, not in root
    const Q = (s) => { for (const x of secs) { const e = x.querySelector(s); if (e) return e; } return null; };
    const QA = (s) => secs.flatMap(x => [...x.querySelectorAll(s)]);
    // 1 · days
    QA('.vc5-day').forEach(b => b.addEventListener('click', () => {
        const i = Number(b.dataset.day), [, god, en] = DAY_HOOKS[i];
        QA('.vc5-day').forEach(x => x.classList.toggle('on', x === b));
        Q('#vc5-dout').innerHTML = `<b>${DAYS[i]}</b> → ${esc(god)}<small>${esc(en)}${i === dow(today) ? ' · Aujourd\'hui, c\'est ' + DAYS[i] + ' !' : ''}</small>`;
        say(`${DAYS[i]}. ${i === 6 ? 'Le dimanche, c\'est le jour du Seigneur.' : DAYS[i].charAt(0).toUpperCase() + DAYS[i].slice(1) + ', comme ' + god + '.'}`);
    }));
    // 2 · months
    QA('.vc5-mon').forEach(b => b.addEventListener('click', () => {
        const i = Number(b.dataset.mon), [, moment, en] = MONTH_HOOKS[i], s = SEASON_OF[i];
        QA('.vc5-mon').forEach(x => x.classList.toggle('on', x === b));
        const sent = `En ${MONTHS[i]}, c'est ${moment.replace(/ \(.*\)$/, '')}.`;
        Q('#vc5-mout').innerHTML = `${esc(sent)}<small>${esc(en)} · ${s === 'printemps' ? 'au printemps' : 'en ' + s}</small>`;
        say(`${MONTHS[i]}. ${sent}`);
    }));
    // 4 · before and after
    const DAYS5 = [[-2, 'avant-hier', 'the day before yesterday', "c'était"], [-1, 'hier', 'yesterday', "c'était"], [0, "aujourd'hui", 'today', "c'est"], [1, 'demain', 'tomorrow', 'ce sera'], [2, 'après-demain', 'the day after tomorrow', 'ce sera']];
    Q('#vc5-days5').innerHTML = DAYS5.map(([n, fr, en]) => `<button type="button" class="vc5-rel${n === 0 ? ' now' : n < 0 ? ' past' : ''}" data-rel="d${n}" data-word="${esc(fr)}"><b>${fr}</b><span>${esc(short(addDays(n)))}</span><small>${en}</small></button>`).join('');
    const WEEKS = [[-1, 'la semaine dernière', 'last week', "c'était"], [0, 'cette semaine', 'this week', "c'est"], [1, 'la semaine prochaine', 'next week', 'ce sera']];
    Q('#vc5-weeks').innerHTML = WEEKS.map(([n, fr, en]) => `<button type="button" class="vc5-rel${n === 0 ? ' now' : n < 0 ? ' past' : ''}" data-rel="w${n}" data-word="${esc(fr)}"><b>${fr}</b><span>${esc(range(n))}</span><small>${en}</small></button>`).join('');
    const YEARS = [[-1, "l'année dernière", 'last year', "c'était"], [0, 'cette année', 'this year', "c'est"], [1, "l'année prochaine", 'next year', 'ce sera']];
    Q('#vc5-years').innerHTML = YEARS.map(([n, fr, en]) => `<button type="button" class="vc5-rel${n === 0 ? ' now' : n < 0 ? ' past' : ''}" data-rel="y${n}" data-word="${esc(fr)}"><b>${fr}</b><span>${today.getFullYear() + n}</span><small>${en}</small></button>`).join('');
    QA('.vc5-rel').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.rel, t = k[0], n = Number(k.slice(1));
        QA('.vc5-rel').forEach(x => x.style.outline = x === b ? '3px solid #a5b4fc' : '');
        let fr, verb, what;
        if (t === 'd') { [, fr, , verb] = DAYS5.find(x => x[0] === n); what = dateFr(addDays(n)).replace(/^le /, ''); }
        if (t === 'w') { [, fr, , verb] = WEEKS.find(x => x[0] === n); what = range(n); }
        if (t === 'y') { [, fr, , verb] = YEARS.find(x => x[0] === n); what = numberFr(today.getFullYear() + n); }
        const sent = `${fr.charAt(0).toUpperCase() + fr.slice(1)}, ${verb} ${what}.`;
        Q('#vc5-rout').innerHTML = `${esc(sent)}<small>${n < 0 ? 'past: c\'était' : n > 0 ? 'future: ce sera' : 'now: c\'est'}</small>`;
        say(sent);
    }));
    // 3 · the calendar (Explore, Find the date, Listen and tap)
    const side = Q('#vt-side');
    QA('[data-m]').forEach(b => b.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + Number(b.dataset.m), 1); draw(); sayMonth(); }));
    const msel = Q('#vt-msel'), ysel = Q('#vt-ysel');
    const sayMonth = () => say(`${MONTHS[view.getMonth()]} ${numberFr(view.getFullYear())}`);
    const jump = () => { view = new Date(Number(ysel.value), Number(msel.value), 1); draw(); sayMonth(); if (mode !== 'explore' && quiz) ask(); };
    msel.addEventListener('change', jump); ysel.addEventListener('change', jump);
    Q('#vt-today').addEventListener('click', () => { view = new Date(today.getFullYear(), today.getMonth(), 1); if (mode === 'explore') { sel = new Date(today); explain(); } draw(); say(`Aujourd'hui, c'est ${dateFr(today)}`); });
    QA('[data-mode]').forEach(b => b.addEventListener('click', () => {
        mode = b.dataset.mode; QA('[data-mode]').forEach(x => x.setAttribute('aria-pressed', x === b));
        if (mode === 'explore') { draw(); explain(); } else { quiz = { n: 0, score: 0 }; ask(); }
    }));
    function draw() {
        msel.value = view.getMonth();
        if (![...ysel.options].some(o => Number(o.value) === view.getFullYear())) ysel.insertAdjacentHTML('beforeend', `<option value="${view.getFullYear()}">${view.getFullYear()}</option>`);
        ysel.value = view.getFullYear();
        const first = dow(view), days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
        let h = DAYS.map(d => `<div class="vt-dow">${d.slice(0, 3)}</div>`).join('');
        for (let i = 0; i < first; i++) h += '<div class="vt-day blank" aria-hidden="true"></div>';
        for (let d = 1; d <= days; d++) {
            const date = new Date(view.getFullYear(), view.getMonth(), d);
            const cls = [dow(date) >= 5 ? 'we' : '', date.toDateString() === today.toDateString() ? 'today' : '', mode === 'explore' && date.toDateString() === sel.toDateString() ? 'on' : ''].join(' ');
            h += `<button type="button" class="vt-day ${cls}" data-d="${d}" aria-label="${esc(dateDigits(date))}">${d}</button>`;
        }
        const cal = Q('#vt-cal'); cal.innerHTML = h;
        cal.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => tap(new Date(view.getFullYear(), view.getMonth(), Number(b.dataset.d), 12), b)));
    }
    function explain() {
        const rel = relative(sel, today), isToday = sel.toDateString() === today.toDateString();
        const said = `${isToday ? "Aujourd'hui, c'est" : "C'est"} ${dateFr(sel)} ${numberFr(sel.getFullYear())}.`;
        side.innerHTML = `<div class="vt-label">${esc(rel)}${relEn[rel] ? ' · ' + relEn[rel] : ''}</div>
            <div class="vt-big">${esc(dateDigits(sel))}</div>
            <div class="vt-mid">${esc(said)}</div>
            <div class="vt-row"><button type="button" class="vt-btn" id="vt-say">🔊 Listen</button></div>
            <div class="vt-note">Say <b>le</b> + day + number + month: <i>le ${esc(DAYS[dow(sel)])} ${sel.getDate() === 1 ? 'premier' : sel.getDate()} ${esc(MONTHS[sel.getMonth()])}</i>. Only the 1st is different: <b>le premier</b> mai.</div>
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
        quiz.target = new Date(view.getFullYear(), view.getMonth(), d, 12);
        draw();
        const listen = mode === 'listen';
        side.innerHTML = `<div class="vt-label">${listen ? 'Listen and tap the date' : 'Tap this date'} · ${quiz.n}</div>
            ${listen ? '<div class="vt-row"><button type="button" class="vt-btn pri" id="vt-play">🔊 Play again</button></div>' : `<div class="vt-big">${esc(dateFr(quiz.target))}</div>`}
            <p class="vt-fb" id="vt-fb"></p><p class="vt-small">Score ${quiz.score} / ${quiz.n - 1}</p>`;
        if (listen) { say(dateFr(quiz.target)); side.querySelector('#vt-play').addEventListener('click', () => say(dateFr(quiz.target))); }
    }
    draw(); explain();
}
// wordsInside: the topic's words (chapters) are shown on this page, under each part, instead of a separate step
T[5] = { name: 'Calendar', next: 'Try the calendar', mount: mountCalendar, wordsInside: true };

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
// Simple drawings that take the chosen colour (emoji have fixed colours, so a red dress could not turn green)
function mix(hex, to, k) {
    const n = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const a = n(hex), b = n(to);
    return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, '0')).join('');
}
function yellowish(hex) { const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); return r > 180 && g > 150 && b < 140; }
function shadeHex(hex, shade) { return shade === 'clair' ? mix(hex, '#ffffff', 0.45) : shade === 'foncé' ? mix(hex, '#000000', 0.45) : hex; }
function thingSvg(key, c) {
    const k = mix(c, '#000000', 0.35), lite = /^#f[a-f0-9]f[a-f0-9]f/i.test(c) || c.toLowerCase() === '#ffffff';
    const line = lite ? '#94a3b8' : k, sw = `stroke="${line}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;
    const parts = {
        robe: `<path d="M41 8 L40 22 M59 8 L60 22" fill="none" ${sw}/><path d="M38 21 Q50 27 62 21 L60 44 L40 44 Z" fill="${c}" ${sw}/><path d="M40 44 L60 44 L82 88 Q66 95 50 91 Q34 95 18 88 Z" fill="${c}" ${sw}/><path d="M40 44 L60 44" stroke="${line}" stroke-width="5"/>`,
        pull: `<path d="M32 18 L42 14 Q50 24 58 14 L68 18 L90 50 L78 58 L70 46 L70 88 L30 88 L30 46 L22 58 L10 50 Z" fill="${c}" ${sw}/><path d="M42 14 Q50 24 58 14" fill="none" ${sw}/><path d="M30 82 L70 82 M15 54 L24 49 M85 54 L76 49" fill="none" ${sw}/>`,
        voiture: `<path d="M24 52 L34 32 Q36 28 42 28 L64 28 Q70 28 73 33 L82 52 Z" fill="${c}" ${sw}/><path d="M33 50 L40 34 L52 34 L52 50 Z M57 50 L57 34 L66 34 L74 50 Z" fill="#e0f2fe" stroke="${line}" stroke-width="2"/><path d="M8 54 Q8 50 14 50 L88 50 Q94 50 94 56 L94 70 L8 70 Z" fill="${c}" ${sw}/><circle cx="28" cy="72" r="10" fill="#1e293b"/><circle cx="74" cy="72" r="10" fill="#1e293b"/><circle cx="28" cy="72" r="4" fill="#cbd5e1"/><circle cx="74" cy="72" r="4" fill="#cbd5e1"/><rect x="86" y="55" width="6" height="5" rx="2" fill="#fde68a"/>`,
        sac: `<path d="M34 40 Q34 14 50 14 Q66 14 66 40" fill="none" stroke="${line}" stroke-width="6" stroke-linecap="round"/><path d="M20 40 L80 40 L86 84 Q86 90 80 90 L20 90 Q14 90 14 84 Z" fill="${c}" ${sw}/><path d="M18 52 L82 52" stroke="${line}" stroke-width="2"/><rect x="44" y="47" width="12" height="10" rx="2" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>`,
        chaussures: [0, 50].map(x => `<g transform="translate(${x} 0)"><path d="M4 76 L4 52 Q4 44 12 44 L22 44 Q26 56 38 58 Q46 60 46 68 L46 76 Z" fill="${c}" ${sw}/><path d="M4 76 L46 76 L46 82 Q46 84 44 84 L6 84 Q4 84 4 82 Z" fill="#f8fafc" stroke="${line}" stroke-width="2"/><path d="M24 52 L30 50 M27 57 L33 54" stroke="${line}" stroke-width="2"/></g>`).join(''),
        gants: [[0, 1], [100, -1]].map(([x, f]) => `<g transform="translate(${x} 0) scale(${f} 1)"><path d="M10 86 L10 62 Q4 54 8 46 Q12 44 16 50 L18 54 L18 26 Q18 20 23 20 Q28 20 28 26 L28 18 Q28 12 33 12 Q38 12 38 18 L38 24 Q38 18 43 18 Q47 18 47 24 L47 64 Q47 74 42 78 L42 86 Z" fill="${c}" ${sw}/><path d="M10 80 L42 80" stroke="${line}" stroke-width="2"/></g>`).join(''),
        fleurs: [[26, 40], [50, 26], [74, 42]].map(([x, y]) => `<path d="M${x} ${y} Q${x + (50 - x) * 0.4} ${y + 30} 50 92" fill="none" stroke="#16a34a" stroke-width="3"/>`).join('') + `<path d="M50 80 Q36 70 34 78 Q42 84 50 84 M50 84 Q62 72 68 78 Q60 86 50 86" fill="#22c55e"/>` + [[26, 40], [50, 26], [74, 42]].map(([x, y]) => [0, 72, 144, 216, 288].map(r => `<ellipse cx="${x}" cy="${y - 8}" rx="6" ry="9" fill="${c}" stroke="${line}" stroke-width="1.5" transform="rotate(${r} ${x} ${y})"/>`).join('') + `<circle cx="${x}" cy="${y}" r="5" fill="${yellowish(c) ? '#ea580c' : '#facc15'}"/>`).join(''),
        yeux: [27, 73].map(x => `<path d="M${x - 20} 50 Q${x} 28 ${x + 20} 50 Q${x} 72 ${x - 20} 50 Z" fill="#fff" stroke="#334155" stroke-width="2.5"/><circle cx="${x}" cy="50" r="10" fill="${c}" stroke="${lite ? '#94a3b8' : k}" stroke-width="1.5"/><circle cx="${x}" cy="50" r="4.5" fill="#0f172a"/><circle cx="${x + 3}" cy="46" r="2" fill="#fff"/>`).join(''),
    };
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">${parts[key] || ''}</svg>`;
}
function colourWord(c, t, shade) {
    if (c.inv || shade) return c.m + (shade ? ' ' + shade : '');
    let w = t.g === 'f' ? c.f : c.m;
    if (t.pl && !/[sx]$/.test(w)) w += 's';
    return w;
}
function why(c, t, shade) {
    if (shade) return `With <b>clair</b> (light) or <b>foncé</b> (dark), a colour never changes: ${t.art} ${t.fr} ${c.m} ${shade}.`;
    if (c.inv) return `<b>${c.m}</b> comes from a noun (${c.m === 'orange' ? 'an orange' : c.m === 'marron' ? 'a chestnut' : c.m === 'bordeaux' ? 'the wine' : c.m === 'kaki' ? 'a Hindi word for dust-coloured' : 'the navy'}), so it never changes.`;
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
            <div class="vt-row">${THINGS.map((t, i) => `<button type="button" class="vt-thing" data-t="${i}" aria-pressed="${i === ti}" aria-label="${esc(t.art + ' ' + t.fr)}" title="${esc(t.art + ' ' + t.fr)}">${thingSvg(t.fr, '#94a3b8')}</button>`).join('')}</div>
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
        out.innerHTML = `<div class="vt-show"><div class="vt-blob">${thingSvg(t.fr, shadeHex(c.hex, shade))}</div>
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
            <div class="vt-show"><div class="vt-blob">${thingSvg(t.fr, shadeHex(c.hex, sh))}</div><div class="vt-big">${esc(t.en)}, ${esc((sh === 'clair' ? 'light ' : sh === 'foncé' ? 'dark ' : '') + c.en)}</div></div>
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
