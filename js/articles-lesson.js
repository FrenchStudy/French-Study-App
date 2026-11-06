// articles-lesson.js - grammar lesson 2 (articles), the part to play with before typing:
//   1 Watch them join: à + le slide together and become au (à + les = aux, de + le = du, de + les = des);
//     à la, à l', de la, de l' stay as they are.
//   2 Practise, from easy to harder: Choose (tap the right form), Build (put the tiles in order),
//     Spot the mistake (tap the wrong words). Typing comes after, in the lesson's own practice.
// A wrong answer gets a hint and another try. window.ArticlesLesson.mount(el, { say })
(function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// [à or de, article, result, noun, sentence, English, joins?]
const PAIRS = [
    ['à', 'le', 'au', 'marché', 'Je vais au marché.', 'I am going to the market.', true],
    ['à', 'les', 'aux', 'enfants', 'Elle parle aux enfants.', 'She is talking to the children.', true],
    ['de', 'le', 'du', 'cinéma', 'Je reviens du cinéma.', 'I am coming back from the cinema.', true],
    ['de', 'les', 'des', 'voisins', 'C\'est la porte des voisins.', 'It is the neighbours\' door.', true],
    ['à', 'la', 'à la', 'plage', 'Nous allons à la plage.', 'We are going to the beach.', false],
    ['à', 'l\'', 'à l\'', 'école', 'Il est à l\'école.', 'He is at school.', false],
    ['de', 'la', 'de la', 'gare', 'Je viens de la gare.', 'I am coming from the station.', false],
    ['de', 'l\'', 'de l\'', 'hôpital', 'Il sort de l\'hôpital.', 'He is leaving the hospital.', false],
];
const COL = { au: '#2563eb', aux: '#7c3aed', du: '#0891b2', des: '#c026d3', stay: '#64748b' };
// nouns: m (le), f (la), v (l', before a vowel or a silent h), p (les)
const NOUNS = [['marché', 'm'], ['parc', 'm'], ['cinéma', 'm'], ['musée', 'm'], ['bureau', 'm'], ['piscine', 'f'], ['gare', 'f'], ['plage', 'f'], ['boulangerie', 'f'], ['banque', 'f'],
    ['hôtel', 'v'], ['école', 'v'], ['aéroport', 'v'], ['hôpital', 'v'], ['magasins', 'p'], ['toilettes', 'p'], ['urgences', 'p'], ['champs', 'p']];
const FORM = { à: { m: 'au', f: 'à la', v: 'à l\'', p: 'aux' }, de: { m: 'du', f: 'de la', v: 'de l\'', p: 'des' } };
const WRONG = { à: { m: 'à le', p: 'à les' }, de: { m: 'de le', p: 'de les' } };
const ART = { m: 'le', f: 'la', v: 'l\'', p: 'les' };
const join = (form, noun) => form.endsWith('\'') ? form + noun : form + ' ' + noun;
const VERB = { à: ['Je vais', 'I am going to'], de: ['Je reviens', 'I am coming back from'] };
const ruleFor = (p, g) => g === 'm' ? `${p} + le = <b>${FORM[p].m}</b>` : g === 'p' ? `${p} + les = <b>${FORM[p].p}</b>` : g === 'f' ? `${p} + la does not change: <b>${p} la</b>` : `${p} + l' does not change: <b>${p} l'</b>`;
const whyFor = (p, g, noun) => `« ${noun} » takes <b>${ART[g]}</b>${g === 'v' ? ' (it starts with a vowel or a silent h)' : g === 'p' ? ' (plural)' : g === 'm' ? ' (masculine)' : ' (feminine)'}: ${ruleFor(p, g)}.`;

const CSS = `
.al{display:grid;gap:14px}
.al-sec{display:grid;gap:10px}
.al-sec h3{margin:0;font-size:var(--fs-lg);font-weight:900;color:#0f172a}.al-sec h3 small{display:block;font-size:var(--fs-sm);font-weight:600;color:#64748b;margin-top:2px}
.al-pairs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}@media(max-width:640px){.al-pairs{grid-template-columns:repeat(2,1fr)}}
.al-pair{border:2px solid #e2e8f0;background:#fff;border-radius:12px;padding:8px;min-height:48px;font:inherit;font-size:var(--fs-base);font-weight:800;color:#0f172a;cursor:pointer}
.al-pair small{display:block;font-size:var(--fs-xs);font-weight:600;color:#64748b}
.al-pair[aria-pressed="true"]{border-color:#4f46e5;background:#eef2ff}
.al-stage{position:relative;height:120px;border-radius:16px;background:linear-gradient(#f8fafc,#eef2ff);overflow:hidden;display:flex;align-items:center;justify-content:center;gap:10px}
.al-tile{display:inline-flex;align-items:center;justify-content:center;min-width:64px;height:56px;padding:0 14px;border-radius:12px;background:#fff;border:2px solid #cbd5e1;font-size:var(--fs-2xl);font-weight:900;color:#0f172a;transition:transform .6s cubic-bezier(.5,0,.3,1.4),opacity .4s,background .3s,color .3s,border-color .3s}
.al-tile.noun{font-weight:700;color:#334155;border-style:dashed}
.al-tile.res{position:absolute;opacity:0;transform:scale(.4);color:#fff;border:0}
.al-stage.go .al-a{transform:translateX(var(--dx))}.al-stage.go .al-b{transform:translateX(calc(var(--dx) * -1))}
.al-stage.merge .al-a,.al-stage.merge .al-b{opacity:0}.al-stage.merge .al-tile.res{opacity:1;transform:scale(1)}
.al-stage.stay .al-a,.al-stage.stay .al-b{animation:al-bump .5s}
@keyframes al-bump{50%{transform:translateY(-8px)}}
.al-out{border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;font-size:var(--fs-lg);font-weight:700;color:#0f172a;min-height:48px}
.al-out small{display:block;font-size:var(--fs-sm);font-weight:400;color:#64748b}
.al-c{color:#fff;border-radius:6px;padding:0 5px}
.al-tabs{display:flex;flex-wrap:wrap;gap:6px}
.al-tab{border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:8px 14px;min-height:44px;font:inherit;font-size:var(--fs-base);font-weight:800;color:#0f172a;cursor:pointer}
.al-tab[aria-selected="true"]{background:#4f46e5;border-color:#4f46e5;color:#fff}
.al-card{border:1px solid #e2e8f0;border-radius:14px;padding:14px;display:grid;gap:10px;background:#fff}
.al-q{font-size:var(--fs-xl);font-weight:900;color:#0f172a;line-height:1.35}
.al-q .gap{display:inline-block;min-width:70px;border-bottom:3px solid #4f46e5;text-align:center;color:#4338ca}
.al-small{font-size:var(--fs-sm);color:#64748b;margin:0}
.al-opts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}@media(max-width:520px){.al-opts{grid-template-columns:repeat(2,1fr)}}
.al-opt,.al-w,.al-btn{border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:8px 14px;min-height:48px;font:inherit;font-size:var(--fs-lg);font-weight:800;color:#0f172a;cursor:pointer}
.al-opt.no,.al-w.no{background:#fff1f2;border-color:#e11d48;color:#9f1239}.al-opt.ok,.al-w.ok{background:#ecfdf5;border-color:#059669;color:#065f46}
.al-opt:disabled{cursor:default}
.al-btn{font-size:var(--fs-base)}.al-btn.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.al-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.al-line{min-height:58px;border:2px dashed #cbd5e1;border-radius:12px;padding:6px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.al-line:empty::before{content:'Tap the tiles in order';color:#94a3b8;font-size:var(--fs-sm);padding:0 8px}
.al-bank{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-start}
.al-w{font-size:var(--fs-lg)}.al-w.used{visibility:hidden}
.al-sent{display:flex;flex-wrap:wrap;gap:6px}
.al-fb{margin:0;font-size:var(--fs-base);font-weight:700}.al-fb.ok{color:#047857}.al-fb.no{color:#be123c}
.al-hint{font-size:var(--fs-base);color:#1e293b;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:8px 10px}
.al-score{font-size:var(--fs-sm);font-weight:700;color:#475569}
@media (prefers-reduced-motion:reduce){.al-tile{transition:none}.al-stage.stay .al-a,.al-stage.stay .al-b{animation:none}}`;

function mount(root, { say }) {
    if (!document.getElementById('al-css')) { const s = document.createElement('style'); s.id = 'al-css'; s.textContent = CSS; document.head.appendChild(s); }
    root.innerHTML = `<div class="al">
      <section class="al-sec"><h3>1 · Watch them join <small>Tap a pair. With le and les, à and de join into one word; with la and l' nothing changes.</small></h3>
        <div class="al-pairs">${PAIRS.map((p, i) => `<button type="button" class="al-pair" data-p="${i}">${esc(p[0])} + ${esc(p[1])}<small>${p[6] ? '→ ' + esc(p[2]) : 'no change'}</small></button>`).join('')}</div>
        <div class="al-stage" id="al-stage" aria-hidden="true"></div>
        <div class="al-out" id="al-out" aria-live="polite">Tap a pair to see what happens. <small>au, aux, du, des: one word instead of two.</small></div>
      </section>
      <section class="al-sec"><h3>2 · Practise <small>From easy to harder. A wrong answer gets a hint and another try.</small></h3>
        <div class="al-tabs" role="tablist"><button type="button" role="tab" class="al-tab" data-k="choose" aria-selected="true">Choose</button><button type="button" role="tab" class="al-tab" data-k="build" aria-selected="false">Build</button><button type="button" role="tab" class="al-tab" data-k="spot" aria-selected="false">Spot the mistake</button></div>
        <div class="al-card" id="al-card" aria-live="polite"></div>
      </section></div>`;
    const $ = (s) => root.querySelector(s);

    // ---------- 1 Watch them join ----------
    let busy = 0;
    function play(i) {
        const [a, b, res, noun, sent, en, joins] = PAIRS[i];
        root.querySelectorAll('.al-pair').forEach((x, j) => x.setAttribute('aria-pressed', j === i));
        const stage = $('#al-stage'), c = joins ? COL[res] : COL.stay;
        stage.className = 'al-stage';
        stage.innerHTML = `<span class="al-tile al-a">${esc(a)}</span><span class="al-tile al-b">${esc(b)}</span><span class="al-tile res" style="background:${c}">${esc(res)}</span><span class="al-tile noun">${esc(noun)}</span>`;
        const ta = stage.querySelector('.al-a'), tb = stage.querySelector('.al-b'), tr = stage.querySelector('.res');
        const ra = ta.getBoundingClientRect(), rb = tb.getBoundingClientRect(), rs = stage.getBoundingClientRect();
        const mid = (ra.left + rb.right) / 2;
        stage.style.setProperty('--dx', Math.max(0, (rb.left - ra.right) / 2 + 6) + 'px');
        tr.style.left = (mid - rs.left - 40) + 'px'; tr.style.minWidth = '80px';
        clearTimeout(busy);
        requestAnimationFrame(() => {
            if (joins) { stage.classList.add('go'); busy = setTimeout(() => { stage.classList.add('merge'); say(res); }, 650); }
            else { stage.classList.add('stay'); say(res); }
        });
        const mark = sent.replace(new RegExp('(^|\\s)(' + res.replace(/'/g, "'") + ')(?=\\s|[a-zà-ÿ])', 'i'), `$1<span class="al-c" style="background:${c}">$2</span>`);
        $('#al-out').innerHTML = `${a} + ${b} = <b style="color:${c}">${esc(res)}</b>${joins ? '' : ' (no change)'} · ${mark}<small>${esc(en)}</small>`;
        setTimeout(() => say(sent), joins ? 1400 : 900);
    }
    root.querySelectorAll('.al-pair').forEach(b => b.addEventListener('click', () => play(Number(b.dataset.p))));

    // ---------- 2 Practise ----------
    const card = $('#al-card');
    let kind = 'choose', set = [], qi = 0, score = 0, tries = 0;
    const pick = () => { const [noun, g] = NOUNS[Math.floor(Math.random() * NOUNS.length)]; const p = Math.random() < .5 ? 'à' : 'de'; return { noun, g, p }; };
    function makeSet() {
        const seen = new Set(), out = [];
        // each set mixes the four forms of à and de
        while (out.length < 6) { const it = pick(); const k = it.noun + it.p; if (seen.has(k)) continue; seen.add(k); out.push(it); }
        return out;
    }
    const sentence = (it) => `${VERB[it.p][0]} ${join(FORM[it.p][it.g], it.noun)}.`;
    function start(k) {
        kind = k; set = makeSet(); qi = 0; score = 0;
        root.querySelectorAll('.al-tab').forEach(t => t.setAttribute('aria-selected', t.dataset.k === k));
        ask();
    }
    function head() { return `<div class="al-row" style="justify-content:space-between"><span class="al-score">${qi + 1} / ${set.length}</span><span class="al-score">${score} right first time</span></div>`; }
    function after(it, ok) {
        if (ok && !tries) score++;
        say(sentence(it));
        const nextKind = { choose: 'build', build: 'spot', spot: null }[kind];
        const last = qi + 1 >= set.length;
        card.querySelector('#al-after').innerHTML = `<p class="al-fb ok">${tries ? 'Yes, that\'s it.' : 'Right first time!'}</p><div class="al-hint">${whyFor(it.p, it.g, it.noun)}</div>
            <div class="al-row"><button type="button" class="al-btn pri" id="al-next">${last ? 'See my score' : 'Next →'}</button></div>`;
        card.querySelector('#al-next').addEventListener('click', () => { qi++; if (qi >= set.length) done(nextKind); else ask(); });
        card.querySelector('#al-next').focus({ preventScroll: true });
    }
    function done(nextKind) {
        card.innerHTML = `<div class="al-q">${score} / ${set.length} right first time</div>
            <p class="al-small">${score === set.length ? 'Parfait !' : 'A new set mixes other words: try again, or go on.'}</p>
            <div class="al-row"><button type="button" class="al-btn" id="al-again">Again</button>${nextKind ? `<button type="button" class="al-btn pri" id="al-on">Next: ${nextKind === 'build' ? 'Build' : 'Spot the mistake'} →</button>` : '<a class="al-btn pri" href="#lk-type" id="al-type" style="text-decoration:none;display:inline-flex;align-items:center">Now type them ↓</a>'}</div>`;
        card.querySelector('#al-again').addEventListener('click', () => start(kind));
        const on = card.querySelector('#al-on'); if (on) on.addEventListener('click', () => start(nextKind));
        const ty = card.querySelector('#al-type');
        if (ty) ty.addEventListener('click', (e) => { e.preventDefault(); const t = document.querySelector('[data-drill-key] input'); if (t) { t.closest('section').scrollIntoView({ behavior: 'smooth', block: 'start' }); t.focus({ preventScroll: true }); } });
    }
    function ask() {
        tries = 0;
        const it = set[qi];
        if (kind === 'choose') {
            const opts = Object.values(FORM[it.p]);
            card.innerHTML = `${head()}<div class="al-q">${esc(VERB[it.p][0])} <span class="gap">___</span> ${esc(it.noun)}.</div><p class="al-small">${esc(VERB[it.p][1])} … · tap the right form</p>
                <div class="al-opts">${opts.map(o => `<button type="button" class="al-opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><div id="al-hintbox"></div><div id="al-after"></div>`;
            card.querySelectorAll('.al-opt').forEach(b => b.addEventListener('click', () => {
                if (card.querySelector('.al-opt.ok')) return;
                if (b.dataset.o === FORM[it.p][it.g]) { b.classList.add('ok'); card.querySelector('#al-q')?.remove(); card.querySelector('.gap').textContent = FORM[it.p][it.g]; card.querySelector('#al-hintbox').innerHTML = ''; after(it, true); return; }
                tries++; b.classList.add('no'); b.disabled = true;
                card.querySelector('#al-hintbox').innerHTML = `<div class="al-hint">Not that one. Hint: « ${esc(it.noun)} » takes <b>${ART[it.g]}</b>. What do ${it.p} + ${ART[it.g]} make?</div>`;
            }));
            return;
        }
        if (kind === 'build') {
            const form = FORM[it.p][it.g];
            const tiles = [...VERB[it.p][0].split(' '), form, it.noun + '.'];
            const fake = WRONG[it.p][it.g] || (it.g === 'f' ? (it.p === 'à' ? 'au' : 'du') : (it.p === 'à' ? 'à le' : 'de le'));
            const bank = shuffle(tiles.concat(fake).map((t, i) => ({ t, i })));
            card.innerHTML = `${head()}<p class="al-small">Build the sentence: « ${esc(VERB[it.p][0])} … ${esc(it.noun)} » (${esc(VERB[it.p][1])} …). One tile is a trap.</p>
                <div class="al-line" id="al-line"></div><div class="al-bank">${bank.map(b => `<button type="button" class="al-w" data-i="${b.i}">${esc(b.t)}</button>`).join('')}</div>
                <div class="al-row"><button type="button" class="al-btn pri" id="al-check">Check</button><button type="button" class="al-btn" id="al-clear">Start again</button></div><div id="al-hintbox"></div><div id="al-after"></div>`;
            const line = card.querySelector('#al-line'), all = tiles.concat(fake);
            let placed = [];
            const draw = () => { line.innerHTML = placed.map((i, k) => `<button type="button" class="al-w" data-k="${k}">${esc(all[i])}</button>`).join(''); card.querySelectorAll('.al-bank .al-w').forEach(b => b.classList.toggle('used', placed.includes(Number(b.dataset.i)))); };
            card.querySelector('.al-bank').addEventListener('click', (e) => { const b = e.target.closest('.al-w'); if (!b || card.querySelector('#al-after').innerHTML) return; const i = Number(b.dataset.i); if (!placed.includes(i)) { placed.push(i); draw(); } });
            line.addEventListener('click', (e) => { const b = e.target.closest('.al-w'); if (!b || card.querySelector('#al-after').innerHTML) return; placed.splice(Number(b.dataset.k), 1); draw(); });
            card.querySelector('#al-clear').addEventListener('click', () => { if (card.querySelector('#al-after').innerHTML) return; placed = []; draw(); });
            card.querySelector('#al-check').addEventListener('click', () => {
                if (card.querySelector('#al-after').innerHTML) return;
                const got = placed.map(i => all[i]);
                if (got.join(' ') === tiles.join(' ')) { line.querySelectorAll('.al-w').forEach(b => b.classList.add('ok')); card.querySelector('#al-hintbox').innerHTML = ''; after(it, true); return; }
                tries++;
                const bad = got.findIndex((t, k) => t !== tiles[k]);
                if (bad >= 0) line.querySelectorAll('.al-w')[bad].classList.add('no');
                card.querySelector('#al-hintbox').innerHTML = `<div class="al-hint">${got.includes(fake) ? `« ${esc(fake)} » is the trap. ` : bad >= 0 ? 'The red tile is not in its place. ' : 'Some tiles are missing. '}Hint: « ${esc(it.noun)} » takes <b>${ART[it.g]}</b>: ${ruleFor(it.p, it.g)}.</div>`;
            });
            return;
        }
        // spot the mistake: one chunk is wrong (à le, de les, au + feminine…); tap it
        const right = FORM[it.p][it.g];
        const wrong = WRONG[it.p][it.g] || (it.g === 'f' ? (it.p === 'à' ? 'au' : 'du') : (it.p === 'à' ? 'à le' : 'de le'));
        const words = [...VERB[it.p][0].split(' '), wrong, it.noun + '.'];
        card.innerHTML = `${head()}<p class="al-small">One part of this sentence is wrong. Tap it.</p>
            <div class="al-sent">${words.map((w, k) => `<button type="button" class="al-w" data-k="${k}">${esc(w)}</button>`).join('')}</div><div id="al-hintbox"></div><div id="al-after"></div>`;
        card.querySelectorAll('.al-sent .al-w').forEach(b => b.addEventListener('click', () => {
            if (card.querySelector('#al-after').innerHTML) return;
            if (Number(b.dataset.k) === 2) {
                b.classList.add('ok'); b.textContent = `${wrong} → ${right}`;
                card.querySelector('#al-hintbox').innerHTML = '';
                after(it, true); return;
            }
            tries++; b.classList.add('no');
            card.querySelector('#al-hintbox').innerHTML = '<div class="al-hint">That part is fine. Hint: look at the little words before the place: à or de next to le, la, l\' or les.</div>';
        }));
    }
    root.querySelectorAll('.al-tab').forEach(t => t.addEventListener('click', () => start(t.dataset.k)));
    start('choose');
}
window.ArticlesLesson = { mount };
})();
