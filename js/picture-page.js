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
    scene: `<defs><pattern id="pp-tile" width="34" height="34" patternUnits="userSpaceOnUse"><rect width="34" height="34" fill="#F7F1E3"/><path d="M34 0V34H0" fill="none" stroke="#E6DCC6" stroke-width="1.5"/></pattern></defs>
      <rect width="680" height="335" fill="url(#pp-tile)"/>
      <rect x="450" y="24" width="200" height="170" rx="6" fill="#fff" stroke="#C9B48F" stroke-width="6"/><rect x="456" y="30" width="188" height="158" fill="#BFE3F7"/><circle cx="600" cy="70" r="20" fill="#FFE27A"/><path d="M456,160 Q520,120 580,150 Q620,135 644,150 L644,188 L456,188Z" fill="#9DD18C"/><line x1="550" y1="30" x2="550" y2="188" stroke="#C9B48F" stroke-width="5"/><line x1="456" y1="109" x2="644" y2="109" stroke="#C9B48F" stroke-width="5"/>
      <rect x="20" y="132" width="380" height="10" rx="3" fill="#9C6B3F"/><rect x="40" y="142" width="8" height="18" fill="#7A5134"/><rect x="372" y="142" width="8" height="18" fill="#7A5134"/>
      <rect y="330" width="680" height="16" fill="#9AA3AE"/><rect y="346" width="680" height="70" fill="#C98F5A"/>
      <rect y="416" width="680" height="144" fill="#E9D2AE"/><rect y="416" width="680" height="6" fill="#D6B98C"/>
      <rect x="30" y="316" width="210" height="16" rx="5" fill="#D9A86A"/>`,
    items: [
        { key: 'huile', fr: "l'huile", g: 'f', en: 'oil', x: 70, ly: 162, d: `<path d="M60,128 L60,82 Q60,72 66,66 L66,52 L74,52 L74,66 Q80,72 80,82 L80,128Z" fill="#E6D35A" stroke="#B9A73A" stroke-width="2"/><rect x="65" y="44" width="10" height="9" fill="#8B5E34"/><rect x="62" y="95" width="16" height="18" fill="#fff" opacity=".7"/>` },
        { key: 'sel', fr: 'le sel', g: 'm', en: 'salt', x: 148, ly: 162, d: `<path d="M136,130 L138,98 Q148,88 158,98 L160,130Z" fill="#fff" stroke="#9AA3AE" stroke-width="2"/><g fill="#555"><circle cx="144" cy="96" r="1.6"/><circle cx="148" cy="93" r="1.6"/><circle cx="152" cy="96" r="1.6"/></g>` },
        { key: 'sucre', fr: 'le sucre', g: 'm', en: 'sugar', x: 226, ly: 162, d: `<rect x="204" y="80" width="44" height="50" rx="8" fill="#E9F4FB" stroke="#9AB7CC" stroke-width="2"/><rect x="200" y="72" width="52" height="12" rx="4" fill="#C0392B"/><g fill="#fff" stroke="#ccc"><rect x="210" y="110" width="12" height="12"/><rect x="226" y="112" width="12" height="12"/><rect x="216" y="97" width="12" height="12"/></g>` },
        { key: 'lait', fr: 'le lait', g: 'm', en: 'milk', x: 318, ly: 162, d: `<path d="M296,130 L296,72 L308,56 L330,56 L342,72 L342,130Z" fill="#fff" stroke="#7FA6C9" stroke-width="2"/><path d="M296,72 L342,72" stroke="#7FA6C9" stroke-width="2"/><rect x="296" y="94" width="46" height="22" fill="#5DA9F0"/><path d="M304,108 q6,-8 12,0 q6,-8 12,0" stroke="#fff" stroke-width="2" fill="none"/>` },
        { key: 'pain', fr: 'le pain', g: 'm', en: 'bread', x: 108, ly: 364, d: `<ellipse cx="108" cy="308" rx="72" ry="13" fill="#D99A4E"/><ellipse cx="108" cy="305" rx="68" ry="9" fill="#E8B26A"/><g stroke="#B9783A" stroke-width="3" stroke-linecap="round"><line x1="70" y1="304" x2="82" y2="300"/><line x1="98" y1="304" x2="110" y2="300"/><line x1="126" y1="304" x2="138" y2="300"/></g>` },
        { key: 'couteau', fr: 'le couteau', g: 'm', en: 'knife', x: 210, ly: 397, d: `<path d="M170,322 L215,312 Q228,310 230,316 L176,328Z" fill="#C9D1DA" stroke="#8D97A3" stroke-width="1.5"/><rect x="226" y="309" width="34" height="10" rx="4" fill="#333" transform="rotate(-8,226,309)"/>` },
        { key: 'fromage', fr: 'le fromage', g: 'm', en: 'cheese', x: 290, ly: 364, d: `<path d="M250,330 L330,330 L330,300 Z" fill="#F7C948" stroke="#D9A82A" stroke-width="2"/><path d="M250,330 L330,300 L330,290 L258,322Z" fill="#FFDC6E"/><g fill="#E0AE30"><circle cx="300" cy="320" r="4"/><circle cx="318" cy="312" r="3"/><circle cx="312" cy="324" r="2.5"/></g>` },
        { key: 'assiette', fr: "l'assiette", g: 'f', en: 'plate', x: 400, ly: 397, d: `<ellipse cx="400" cy="320" rx="62" ry="14" fill="#fff" stroke="#AEB6C0" stroke-width="2"/><ellipse cx="400" cy="320" rx="44" ry="9" fill="#F3F5F7"/>` },
        { key: 'poisson', fr: 'le poisson', g: 'm', en: 'fish', x: 400, ly: 364, d: `<g transform="translate(372,318) scale(.8) translate(-372,-318)"><path d="M372,318 Q392,302 418,316 L432,306 L430,328 L418,320 Q392,334 372,318Z" fill="#8FB3C9" stroke="#5F8299" stroke-width="1.5"/><circle cx="381" cy="315" r="2.2" fill="#222"/></g>` },
        { key: 'verre', fr: 'le verre', g: 'm', en: 'glass', x: 500, ly: 364, d: `<path d="M484,268 L516,268 L512,330 L488,330Z" fill="#E8F6FD" stroke="#8BB9D2" stroke-width="2" opacity=".95"/><path d="M486,290 L514,290 L512,328 L488,328Z" fill="#9ED8F5" opacity=".7"/>` },
        { key: 'œuf', fr: "l'œuf", g: 'm', en: 'egg', x: 600, ly: 397, d: `<ellipse cx="582" cy="318" rx="13" ry="16" fill="#F4E7D3" stroke="#D2BFA2" stroke-width="1.5"/><ellipse cx="606" cy="318" rx="13" ry="16" fill="#F6EEE2" stroke="#D2BFA2" stroke-width="1.5"/><ellipse cx="596" cy="306" rx="12" ry="15" fill="#EEDDC4" stroke="#D2BFA2" stroke-width="1.5"/>` },
        { key: 'viande', fr: 'la viande', g: 'f', en: 'meat', x: 72, ly: 512, d: `<path d="M30,470 Q34,440 70,438 Q112,436 116,462 Q118,486 76,488 Q36,490 30,470Z" fill="#B83B3B" stroke="#F3E0D0" stroke-width="6"/><path d="M60,452 Q76,446 92,456" stroke="#E79393" stroke-width="3" fill="none"/>` },
        { key: 'poulet', fr: 'le poulet', g: 'm', en: 'chicken', x: 188, ly: 512, d: `<ellipse cx="190" cy="466" rx="48" ry="26" fill="#D9963F"/><ellipse cx="184" cy="458" rx="36" ry="15" fill="#E8B060"/><g fill="#C9832E"><ellipse cx="146" cy="474" rx="16" ry="10"/><ellipse cx="234" cy="474" rx="16" ry="10"/></g><g fill="#fff"><circle cx="134" cy="478" r="5"/><circle cx="246" cy="478" r="5"/></g>` },
        { key: 'légume', fr: 'le légume', g: 'm', en: 'vegetable', x: 300, ly: 512, d: `<path d="M260,486 L300,446 L306,452 L268,490Z" fill="#F08A24"/><g stroke="#3E9A57" stroke-width="3"><line x1="302" y1="448" x2="314" y2="430"/><line x1="304" y1="450" x2="320" y2="440"/></g><circle cx="322" cy="470" r="16" fill="#3E9A57"/><circle cx="336" cy="462" r="13" fill="#4FAF66"/><circle cx="330" cy="478" r="12" fill="#3E9A57"/><rect x="326" y="482" width="6" height="12" fill="#7FB36C"/>` },
        { key: 'pomme', fr: 'la pomme', g: 'f', en: 'apple', x: 408, ly: 512, d: `<path d="M408,452 Q426,440 436,458 Q442,480 424,492 Q414,496 408,490 Q402,496 392,492 Q374,480 380,458 Q390,440 408,452Z" fill="#D63A3A"/><path d="M408,452 Q410,440 416,434" stroke="#6B4A2F" stroke-width="3" fill="none"/><path d="M412,442 Q424,432 430,440 Q420,446 412,442Z" fill="#3E9A57"/><ellipse cx="394" cy="464" rx="5" ry="8" fill="#fff" opacity=".35"/>` },
        { key: 'beurre', fr: 'le beurre', g: 'm', en: 'butter', x: 506, ly: 512, d: `<rect x="470" y="476" width="76" height="14" rx="3" fill="#fff" stroke="#ccc"/><path d="M478,476 L478,456 L536,456 L536,476Z" fill="#F7E07A" stroke="#D9C04A" stroke-width="1.5"/><path d="M478,456 L486,448 L544,448 L536,456Z" fill="#FBEA95" stroke="#D9C04A" stroke-width="1.5"/><path d="M536,456 L544,448 L544,468 L536,476Z" fill="#EBD06A" stroke="#D9C04A" stroke-width="1.5"/>` },
        { key: 'crème', fr: 'la crème', g: 'f', en: 'cream', x: 612, ly: 512, d: `<path d="M588,456 L636,456 L630,492 L594,492Z" fill="#fff" stroke="#9AA3AE" stroke-width="2"/><rect x="584" y="450" width="56" height="9" rx="3" fill="#7FA6C9"/><path d="M592,470 L632,470" stroke="#7FA6C9" stroke-width="5"/>` },
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
      <div class="pp-panel" id="pp-pn" aria-live="polite"></div></div>`;
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
