// picture-page.js - bilingual picture pages: step 2 of Vocab topics about things you can see, in place of
// the memory palace. A drawn scene with each object labelled in French (blue = le, pink = la) and English.
//   Explore  tap an object or its label: hear it, see the meaning and the gender; English labels can be hidden
//   Point    hear a word, tap the object
//   Name it  labels hidden, one object glows, pick its name from four
// Point and Name it count like the memory palace: right first time moves the word up a box.
// Pages: PAGES[themeId] = { name, next, title, w, h, scene (SVG background), items: [{ key, fr, g, en, x, ly, d }] }
//   key = the word in the topic list; fr = what is shown and said (with le / la / l'); x, ly = label position; d = SVG of the object
//   VocabTools[themeId] = { name, next, mount(el, { say, grade, words }) }
(function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const plain = (s) => String(s).toLowerCase().replace(/^(le |la |les |l'|l’)/, '').replace(/[.!?…\s]+$/g, '').trim();
const CO = { m: '#0369a1', f: '#e11d48' };

const PAGES = {};
// ---------------- 35 Cooking & Recipes: la cuisine ----------------
PAGES[35] = {
    name: 'Picture', next: 'Explore the kitchen picture', title: 'La cuisine', w: 680, h: 560,
    credit: '3D pictures: Microsoft Fluent Emoji (MIT licence)',
    scene: `<defs><pattern id="pp-tile" width="34" height="34" patternUnits="userSpaceOnUse"><rect width="34" height="34" fill="#F7F1E3"/><path d="M34 0V34H0" fill="none" stroke="#E6DCC6" stroke-width="1.5"/></pattern></defs>
      <rect width="680" height="335" fill="url(#pp-tile)"/>
      <rect x="450" y="24" width="200" height="170" rx="6" fill="#fff" stroke="#C9B48F" stroke-width="6"/><rect x="456" y="30" width="188" height="158" fill="#BFE3F7"/><circle cx="600" cy="70" r="20" fill="#FFE27A"/><path d="M456,160 Q520,120 580,150 Q620,135 644,150 L644,188 L456,188Z" fill="#9DD18C"/><line x1="550" y1="30" x2="550" y2="188" stroke="#C9B48F" stroke-width="5"/><line x1="456" y1="109" x2="644" y2="109" stroke="#C9B48F" stroke-width="5"/>
      <rect x="20" y="132" width="380" height="10" rx="3" fill="#9C6B3F"/><rect x="40" y="142" width="8" height="18" fill="#7A5134"/><rect x="372" y="142" width="8" height="18" fill="#7A5134"/>
      <rect y="330" width="680" height="16" fill="#9AA3AE"/><rect y="346" width="680" height="70" fill="#C98F5A"/>
      <rect y="416" width="680" height="144" fill="#E9D2AE"/><rect y="416" width="680" height="6" fill="#D6B98C"/>`,
    items: [
        { key: 'huile', fr: "l'huile", g: 'f', en: 'oil', x: 70, ly: 162, d: `<defs><linearGradient id="pp-oil" x1="0" x2="1"><stop offset="0" stop-color="#C9A227"/><stop offset=".45" stop-color="#F6DA6A"/><stop offset="1" stop-color="#B08A18"/></linearGradient></defs><path d="M58,130 Q53,127 53,118 L53,88 Q53,75 64,68 L64,52 L76,52 L76,68 Q87,75 87,88 L87,118 Q87,127 82,130Z" fill="url(#pp-oil)"/><rect x="61" y="40" width="18" height="14" rx="4" fill="#7A4E2D"/><path d="M61,86 Q61,78 67,73" stroke="#fff" stroke-opacity=".6" stroke-width="4" fill="none" stroke-linecap="round"/><line x1="60" y1="92" x2="60" y2="120" stroke="#fff" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/><ellipse cx="72" cy="104" rx="9" ry="7" fill="#6E9E3A"/><path d="M72,97 Q76,92 80,94" stroke="#4E7A26" stroke-width="2" fill="none"/>` },
        { key: 'sel', fr: "le sel", g: 'm', en: 'salt', x: 150, ly: 162, d: `<image href="media/pictures/sel.webp" x="114.0" y="62" width="72" height="72"/>` },
        { key: 'sucre', fr: "le sucre", g: 'm', en: 'sugar', x: 230, ly: 162, d: `<defs><linearGradient id="pp-sug" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DCE3EA"/></linearGradient><linearGradient id="pp-bowl" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7FB2E5"/><stop offset="1" stop-color="#3F7CC0"/></linearGradient></defs><path d="M198,112 L262,112 Q258,132 230,132 Q202,132 198,112Z" fill="url(#pp-bowl)"/><ellipse cx="230" cy="112" rx="32" ry="6" fill="#A9CDF0"/><g stroke="#C9D2DB" stroke-width="1.5"><rect x="208" y="92" width="22" height="22" rx="4" fill="url(#pp-sug)" transform="rotate(-8,219,103)"/><rect x="230" y="94" width="22" height="22" rx="4" fill="url(#pp-sug)" transform="rotate(10,241,105)"/><rect x="219" y="74" width="22" height="22" rx="4" fill="url(#pp-sug)" transform="rotate(4,230,85)"/></g><g fill="#fff"><circle cx="214" cy="97" r="2"/><circle cx="236" cy="99" r="2"/><circle cx="225" cy="79" r="2"/></g>` },
        { key: 'lait', fr: "le lait", g: 'm', en: 'milk', x: 318, ly: 162, d: `<image href="media/pictures/lait.webp" x="278.0" y="56" width="80" height="80"/>` },
        { key: 'pain', fr: "le pain", g: 'm', en: 'bread', x: 75, ly: 364, d: `<image href="media/pictures/pain.webp" x="25.0" y="242" width="100" height="100"/>` },
        { key: 'couteau', fr: "le couteau", g: 'm', en: 'knife', x: 170, ly: 397, d: `<image href="media/pictures/couteau.webp" x="130.0" y="256" width="80" height="80"/>` },
        { key: 'fromage', fr: "le fromage", g: 'm', en: 'cheese', x: 262, ly: 364, d: `<image href="media/pictures/fromage.webp" x="221.0" y="256" width="82" height="82"/>` },
        { key: 'assiette', fr: "l'assiette", g: 'f', en: 'plate', x: 356, ly: 397, d: `<defs><radialGradient id="pp-plate" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F1F4F8"/><stop offset="1" stop-color="#C9D3DE"/></radialGradient></defs><ellipse cx="356" cy="326" rx="50" ry="14" fill="#B8C2CE" opacity=".5"/><ellipse cx="356" cy="320" rx="50" ry="15" fill="url(#pp-plate)" stroke="#C3CCD7" stroke-width="1.5"/><ellipse cx="356" cy="319" rx="32" ry="8.5" fill="#F7F9FB" stroke="#DCE3EA" stroke-width="1.2"/><path d="M322,314 Q336,308 352,307" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>` },
        { key: 'poisson', fr: "le poisson", g: 'm', en: 'fish', x: 450, ly: 364, d: `<image href="media/pictures/poisson.webp" x="409.0" y="256" width="82" height="82"/>` },
        { key: 'verre', fr: "le verre", g: 'm', en: 'glass', x: 540, ly: 397, d: `<defs><linearGradient id="pp-glass" x1="0" x2="1"><stop offset="0" stop-color="#D7EEF9"/><stop offset=".5" stop-color="#F6FCFF"/><stop offset="1" stop-color="#C3E2F2"/></linearGradient><linearGradient id="pp-water" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9BD6F6"/><stop offset="1" stop-color="#4FA9E3"/></linearGradient></defs><path d="M516,262 L564,262 L558,330 Q540,336 522,330Z" fill="url(#pp-glass)" stroke="#9CC7DE" stroke-width="2"/><path d="M519,286 L561,286 L557,328 Q540,333 523,328Z" fill="url(#pp-water)" opacity=".85"/><ellipse cx="540" cy="286" rx="21" ry="4" fill="#BFE6FA"/><path d="M524,268 L528,322" stroke="#fff" stroke-opacity=".8" stroke-width="4" stroke-linecap="round"/>` },
        { key: 'œuf', fr: "l'œuf", g: 'm', en: 'egg', x: 625, ly: 364, d: `<image href="media/pictures/oeuf.webp" x="592.0" y="270" width="66" height="66"/>` },
        { key: 'viande', fr: "la viande", g: 'f', en: 'meat', x: 70, ly: 520, d: `<image href="media/pictures/viande.webp" x="27.0" y="416" width="86" height="86"/>` },
        { key: 'poulet', fr: "le poulet", g: 'm', en: 'chicken', x: 180, ly: 520, d: `<image href="media/pictures/poulet.webp" x="137.0" y="416" width="86" height="86"/>` },
        { key: 'légume', fr: "le légume", g: 'm', en: 'vegetable', x: 295, ly: 520, d: `<image href="media/pictures/brocoli.webp" x="240.0" y="430" width="70" height="70"/><image href="media/pictures/carotte.webp" x="283.0" y="432" width="70" height="70"/>` },
        { key: 'pomme', fr: "la pomme", g: 'f', en: 'apple', x: 410, ly: 520, d: `<image href="media/pictures/pomme.webp" x="371.0" y="422" width="78" height="78"/>` },
        { key: 'beurre', fr: "le beurre", g: 'm', en: 'butter', x: 515, ly: 520, d: `<image href="media/pictures/beurre.webp" x="472.0" y="418" width="86" height="86"/>` },
        { key: 'crème', fr: "la crème", g: 'f', en: 'cream', x: 615, ly: 520, d: `<defs><linearGradient id="pp-pot" x1="0" x2="1"><stop offset="0" stop-color="#DDE3EA"/><stop offset=".5" stop-color="#FFFFFF"/><stop offset="1" stop-color="#CBD3DC"/></linearGradient></defs><path d="M588,458 L642,458 L636,500 Q615,506 594,500Z" fill="url(#pp-pot)" stroke="#B9C3CE" stroke-width="1.5"/><rect x="588" y="470" width="54" height="12" fill="#5B9BD5"/><ellipse cx="615" cy="458" rx="27" ry="7" fill="#F7F3EA" stroke="#E2DACB"/><path d="M600,456 Q606,440 616,446 Q626,438 630,454 Q616,462 600,456Z" fill="#FFFDF7" stroke="#E8E0CF" stroke-width="1.5"/><path d="M608,450 Q615,444 622,449" stroke="#E8E0CF" stroke-width="1.5" fill="none"/><path d="M592,474 L592,496" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>` },
    ],
};

const CSS = `
.pp{display:grid;gap:10px;max-width:820px}
.pp-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.pp-btn{font-weight:700;font-size:15px;border:1px solid #e2e8f0;background:#fff;color:#0f172a;border-radius:12px;padding:8px 14px;min-height:44px;cursor:pointer}
.pp-btn.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.pp-btn[aria-pressed="true"]{background:#eef2ff;border-color:#6366f1;color:#3730a3}
.pp-btn:focus-visible,.pp-opt:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
.pp-en{margin-left:auto;display:flex;align-items:center;gap:8px;font-size:14px;color:#475569;cursor:pointer;min-height:44px}
.pp-en input{width:18px;height:18px;accent-color:#4f46e5}
.pp-leg{font-size:13px;color:#64748b}
.pp-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:10px;overflow:hidden}
.pp-svg{width:100%;height:auto;display:block;border-radius:10px;touch-action:manipulation}
.pp-svg .obj{cursor:pointer;outline:none}
.pp-svg .obj:hover>.shape,.pp-svg .obj:focus-visible>.shape,.pp-svg .obj.hl>.shape{filter:drop-shadow(0 0 6px #6366f1)}
.pp-svg .obj.ok>.shape{filter:drop-shadow(0 0 8px #059669)}
.pp-svg .obj.no>.shape{filter:drop-shadow(0 0 8px #e11d48)}
.pp-svg .lab{cursor:pointer}
.pp-svg .lab text{paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round}
.pp-panel{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:12px 14px;min-height:56px;font-size:15px;color:#1e293b}
.pp-big{font-size:1.3rem;font-weight:900}
.pp-small{font-size:13px;color:#64748b}
.pp-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
@media (max-width:340px){.pp-opts{grid-template-columns:1fr}}
.pp-opt{text-align:left;font-size:17px;font-weight:700;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:10px 14px;min-height:48px;cursor:pointer}
.pp-opt.ok{background:#ecfdf5;border-color:#059669}.pp-opt.no{background:#fff1f2;border-color:#e11d48}
.pp-fb{font-weight:700;color:#be123c}`;
function css() { if (!document.getElementById('pp-css')) { const s = document.createElement('style'); s.id = 'pp-css'; s.textContent = CSS; document.head.appendChild(s); } }

function mount(page, root, { say, grade, words }) {
    css();
    const W = page.items;
    root.innerHTML = `<div class="pp">
      <div class="pp-row" role="group" aria-label="Mode">
        <button type="button" class="pp-btn" data-m="explore" aria-pressed="true">Explore</button>
        <button type="button" class="pp-btn" data-m="point" aria-pressed="false">Point</button>
        <button type="button" class="pp-btn" data-m="name" aria-pressed="false">Name it</button>
        <label class="pp-en"><input type="checkbox" id="pp-en" checked> English</label>
      </div>
      <div class="pp-leg"><b style="color:${CO.m}">blue = le</b> (masculine) · <b style="color:${CO.f}">pink = la</b> (feminine) · before a vowel it is l', and the colour tells you which</div>
      <div class="pp-card"><svg class="pp-svg" viewBox="0 0 ${page.w} ${page.h}" role="img" aria-label="${esc(page.title)}">${page.scene}<g class="objs"></g><g class="labs"></g></svg></div>
      <div class="pp-panel" id="pp-pn" aria-live="polite"></div>
      ${page.credit ? `<p class="pp-small">${esc(page.credit)}</p>` : ''}</div>`;
    const $ = (s) => root.querySelector(s);
    const objs = $('.objs'), labs = $('.labs'), pn = $('#pp-pn');
    objs.innerHTML = W.map((w, i) => `<g class="obj" data-i="${i}" role="button" tabindex="0" aria-label="${esc(w.fr)}"><g class="shape">${w.d}</g></g>`).join('');
    // a bigger tap area: the box around each object, so a tap in a gap (between the carrot and the broccoli) still counts
    objs.querySelectorAll('.obj').forEach(o => {
        try {
            const bb = o.querySelector('.shape').getBBox(), pad = 6;
            o.insertAdjacentHTML('afterbegin', `<rect x="${bb.x - pad}" y="${bb.y - pad}" width="${bb.width + 2 * pad}" height="${bb.height + 2 * pad}" fill="#000" fill-opacity="0"/>`);
        } catch (e) { /* not drawn yet: the shape itself is still tappable */ }
    });
    const el = (i) => objs.querySelector(`[data-i="${i}"]`);
    const clear = () => objs.querySelectorAll('.obj').forEach(o => o.classList.remove('hl', 'ok', 'no'));
    const word = (w) => `<span style="color:${CO[w.g]};font-weight:900">${esc(w.fr)}</span>`;
    const wordFor = (w) => (words || []).find(x => plain(x.fr) === plain(w.key) || plain(x.key || '') === plain(w.key));
    const mark = (w, ok) => { const x = wordFor(w); if (x && grade) grade(x, ok); };
    function drawLabels() {
        const en = $('#pp-en').checked;
        labs.innerHTML = W.map((w, i) => `<g class="lab" data-i="${i}"><text x="${w.x}" y="${w.ly}" text-anchor="middle" font-size="15" font-weight="800" fill="${CO[w.g]}">${esc(w.fr)}</text>${en ? `<text x="${w.x}" y="${w.ly + 15}" text-anchor="middle" font-size="12" fill="#475569">${esc(w.en)}</text>` : ''}</g>`).join('');
        labs.querySelectorAll('.lab').forEach(l => l.addEventListener('click', () => tap(Number(l.dataset.i))));
    }
    let mode = 'explore', q = null;
    function tap(i) {
        const w = W[i];
        if (mode === 'explore') {
            clear(); el(i).classList.add('hl'); say(w.fr);
            pn.innerHTML = `<span class="pp-big">${word(w)}</span> · ${esc(w.en)} <span class="pp-small">(${w.g === 'm' ? 'masculine' : 'feminine'})</span>`;
            return;
        }
        if (mode !== 'point' || q.done) return;
        if (i === q.t) {
            el(i).classList.add('ok'); q.done = true;
            if (!q.tries) { q.score++; mark(w, true); }
            say(w.fr);
            pn.innerHTML = `✅ ${word(w)} · ${esc(w.en)} <div class="pp-row" style="margin-top:8px"><button type="button" class="pp-btn pri" id="pp-nx">Next →</button><span class="pp-small">Score ${q.score} / ${q.n}</span></div>`;
            $('#pp-nx').addEventListener('click', askPoint);
        } else {
            if (!q.tries) mark(W[q.t], false);
            q.tries++; el(i).classList.add('no'); setTimeout(() => el(i).classList.remove('no'), 600);
            $('#pp-fb').textContent = `That is ${w.fr} (${w.en}). Listen again.`;
            say(W[q.t].fr);
        }
    }
    objs.querySelectorAll('.obj').forEach(o => {
        o.addEventListener('click', () => tap(Number(o.dataset.i)));
        o.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(Number(o.dataset.i)); } });
    });
    function next() { if (q.n >= W.length) { finish(); return null; } q.n++; return q.order[q.n - 1]; }
    function finish() {
        clear();
        pn.innerHTML = `<span class="pp-big">${q.score} / ${W.length}</span> right first time. <div class="pp-row" style="margin-top:8px"><button type="button" class="pp-btn pri" id="pp-ag">Again</button></div>`;
        $('#pp-ag').addEventListener('click', () => setMode(mode));
    }
    function askPoint() {
        clear(); const t = next(); if (t === null) return;
        q.t = t; q.tries = 0; q.done = false;
        pn.innerHTML = `<b>Listen and tap.</b> <span class="pp-small">${q.n} / ${W.length}</span><div class="pp-row" style="margin-top:8px"><button type="button" class="pp-btn" id="pp-pl">🔊 Play again</button><span class="pp-fb" id="pp-fb"></span></div>`;
        $('#pp-pl').addEventListener('click', () => say(W[q.t].fr));
        say(W[t].fr);
    }
    function askName() {
        clear(); const t = next(); if (t === null) return;
        q.done = false; el(t).classList.add('hl');
        const opts = shuffle([t, ...shuffle(W.map((_, i) => i).filter(i => i !== t)).slice(0, 3)]);
        pn.innerHTML = `<b>What is the glowing one?</b> <span class="pp-small">${q.n} / ${W.length}</span><div class="pp-opts">${opts.map(i => `<button type="button" class="pp-opt" data-i="${i}">${esc(W[i].fr)}</button>`).join('')}</div><div id="pp-after" style="margin-top:8px"></div>`;
        let tries = 0;
        pn.querySelectorAll('.pp-opt').forEach(b => b.addEventListener('click', () => {
            if (q.done) return;
            const i = Number(b.dataset.i);
            if (i === t) {
                b.classList.add('ok'); q.done = true;
                if (!tries) { q.score++; mark(W[t], true); }
                say(W[t].fr);
                $('#pp-after').innerHTML = `${word(W[t])} · ${esc(W[t].en)} <div class="pp-row" style="margin-top:8px"><button type="button" class="pp-btn pri" id="pp-nx">Next →</button></div>`;
                $('#pp-nx').addEventListener('click', askName);
            } else { if (!tries) mark(W[t], false); tries++; b.classList.add('no'); b.disabled = true; }
        }));
    }
    function setMode(m) {
        mode = m;
        root.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === m));
        clear(); labs.style.display = m === 'explore' ? '' : 'none';
        q = { order: shuffle(W.map((_, i) => i)), n: 0, score: 0 };
        if (m === 'explore') pn.innerHTML = '<span class="pp-small">Tap anything in the picture, or its label, to hear it.</span>';
        else if (m === 'point') askPoint(); else askName();
    }
    root.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.m)));
    $('#pp-en').addEventListener('change', drawLabels);
    drawLabels(); setMode('explore');
}

window.PicturePages = PAGES;
window.VocabTools = window.VocabTools || {};
for (const id of Object.keys(PAGES)) {
    const p = PAGES[id];
    window.VocabTools[id] = { name: p.name, next: p.next, mount: (el, opts) => mount(p, el, opts) };
}
})();
