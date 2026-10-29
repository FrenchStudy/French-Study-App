// js/nationalites.js - topic 10, Les Nationalités & Pays.
//   Nationalites.bind(box): the Learn step's hands-on lesson (content/vocab/nationalites.html): tap-to-hear list of
//     28 countries, the masculine ➔ feminine patterns and a 10-question "Check yourself" round.
//   VocabTools[10]: step 2, the World map, built like a memory palace: Explore (tap a country), Walk through
//     (country by country, read aloud, with "Play the walk"), Quiz (find the country you hear); − / + / ⤢ Enlarge.
// Needs speakFrench from js/ai.js; reuses the memory palace styles (MemoryPalace.css) when they are loaded.
window.Nationalites = (function () {
    // [map name, article, French, English, in/to, nationality m, nationality f ('' = same for both), gender, region, note]
    const C = [
        ['France', 'la', 'France', 'France', 'en France', 'français', 'française', 'f', 'eu'],
        ['United Kingdom', 'le', 'Royaume-Uni', 'the United Kingdom', 'au Royaume-Uni', 'britannique', '', 'm', 'eu'],
        ['England', "l'", 'Angleterre', 'England', 'en Angleterre', 'anglais', 'anglaise', 'f', 'eu', "England is part of the UK, so it shares the UK's shape on the map."],
        ['Ireland', "l'", 'Irlande', 'Ireland', 'en Irlande', 'irlandais', 'irlandaise', 'f', 'eu'],
        ['Spain', "l'", 'Espagne', 'Spain', 'en Espagne', 'espagnol', 'espagnole', 'f', 'eu'],
        ['Portugal', 'le', 'Portugal', 'Portugal', 'au Portugal', 'portugais', 'portugaise', 'm', 'eu'],
        ['Italy', "l'", 'Italie', 'Italy', 'en Italie', 'italien', 'italienne', 'f', 'eu'],
        ['Germany', "l'", 'Allemagne', 'Germany', 'en Allemagne', 'allemand', 'allemande', 'f', 'eu'],
        ['Belgium', 'la', 'Belgique', 'Belgium', 'en Belgique', 'belge', '', 'f', 'eu'],
        ['Switzerland', 'la', 'Suisse', 'Switzerland', 'en Suisse', 'suisse', '', 'f', 'eu'],
        ['Netherlands', 'les', 'Pays-Bas', 'the Netherlands', 'aux Pays-Bas', 'néerlandais', 'néerlandaise', 'pl', 'eu'],
        ['Poland', 'la', 'Pologne', 'Poland', 'en Pologne', 'polonais', 'polonaise', 'f', 'eu'],
        ['Greece', 'la', 'Grèce', 'Greece', 'en Grèce', 'grec', 'grecque', 'f', 'eu'],
        ['Russia', 'la', 'Russie', 'Russia', 'en Russie', 'russe', '', 'f', 'x'],
        ['Turkey', 'la', 'Turquie', 'Turkey', 'en Turquie', 'turc', 'turque', 'f', 'both'],
        ['Canada', 'le', 'Canada', 'Canada', 'au Canada', 'canadien', 'canadienne', 'm', 'x', 'From Quebec: québécois / québécoise.'],
        ['United States of America', 'les', 'États-Unis', 'the United States', 'aux États-Unis', 'américain', 'américaine', 'pl', 'x'],
        ['Mexico', 'le', 'Mexique', 'Mexico', 'au Mexique', 'mexicain', 'mexicaine', 'm', 'x', 'Trap: it ends in -e but is masculine, so au Mexique.'],
        ['Brazil', 'le', 'Brésil', 'Brazil', 'au Brésil', 'brésilien', 'brésilienne', 'm', 'x'],
        ['Argentina', "l'", 'Argentine', 'Argentina', 'en Argentine', 'argentin', 'argentine', 'f', 'x'],
        ['China', 'la', 'Chine', 'China', 'en Chine', 'chinois', 'chinoise', 'f', 'x'],
        ['Japan', 'le', 'Japon', 'Japan', 'au Japon', 'japonais', 'japonaise', 'm', 'x'],
        ['India', "l'", 'Inde', 'India', 'en Inde', 'indien', 'indienne', 'f', 'x'],
        ['Morocco', 'le', 'Maroc', 'Morocco', 'au Maroc', 'marocain', 'marocaine', 'm', 'x'],
        ['Algeria', "l'", 'Algérie', 'Algeria', 'en Algérie', 'algérien', 'algérienne', 'f', 'x'],
        ['Tunisia', 'la', 'Tunisie', 'Tunisia', 'en Tunisie', 'tunisien', 'tunisienne', 'f', 'both'],
        ['Senegal', 'le', 'Sénégal', 'Senegal', 'au Sénégal', 'sénégalais', 'sénégalaise', 'm', 'x'],
        ['Australia', "l'", 'Australie', 'Australia', 'en Australie', 'australien', 'australienne', 'f', 'x']
    ];
    const BY = {}; C.forEach(r => (BY[r[0]] = r));
    const GROUPS = [["L'Europe", ['France', 'United Kingdom', 'England', 'Ireland', 'Spain', 'Portugal', 'Italy', 'Germany', 'Belgium', 'Switzerland', 'Netherlands', 'Poland', 'Greece', 'Russia', 'Turkey']],
        ['Les Amériques', ['Canada', 'United States of America', 'Mexico', 'Brazil', 'Argentina']],
        ["L'Asie et l'Océanie", ['China', 'Japan', 'India', 'Australia']], ["L'Afrique", ['Morocco', 'Algeria', 'Tunisia', 'Senegal']]];
    const full = r => r[1] === "l'" ? "l'" + r[2] : r[1] + ' ' + r[2];
    const fem = r => r[6] || r[5];
    const natSay = r => `il est ${r[5]}. elle est ${fem(r)}.`;
    const natHtml = r => `<span class="nat-m">${r[5]}</span>${r[6] ? ` / <span class="nat-f">${r[6]}</span>` : ''}`;
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const speak = t => { if (typeof speakFrench === 'function') speakFrench(t, 0.9); };
    const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const NS = 'http://www.w3.org/2000/svg';
    const RULES = [
        ['+ e', 'Most nationalities: add an e. The final consonant is then pronounced.', ['français', 'anglais', 'américain', 'espagnol', 'allemand', 'chinois', 'japonais', 'mexicain', 'marocain', 'polonais', 'sénégalais', 'argentin']],
        ['-ien ➔ -ienne', 'Double the n, then add e.', ['italien', 'canadien', 'brésilien', 'indien', 'australien', 'algérien', 'tunisien']],
        ['Already ends in -e', 'No change: il est belge, elle est belge.', ['belge', 'suisse', 'russe', 'britannique']],
        ['Irregular', 'Learn these two by heart.', ['grec', 'turc']]
    ];
    const NAMES = { m: ['Marco', 'Lucas', 'Hiro', 'Raj', 'Pedro', 'Karim', 'Jack', 'Hans', 'Nikos', 'Moussa'], f: ['Sofia', 'Emma', 'Yuki', 'Priya', 'Ana', 'Leïla', 'Olivia', 'Greta', 'Elena', 'Aïcha'] };

    // ================= Step 1: the hands-on lesson =================
    function bind(root) {
        const $ = id => root.querySelector('#' + id);
        if (!$('nat-list')) return;

        $('nat-list').innerHTML = GROUPS.map(([h, ns]) => `<div class="nat-group"><h5>${h}</h5>${ns.map(n => { const r = BY[n];
            return `<div class="nat-li" data-g="${r[7]}">
                <button type="button" class="nat-w cn" data-nat-say="${esc(full(r))}"><span class="art">${r[1]}${r[1] === "l'" ? '' : ' '}</span>${r[2]}</button>
                <button type="button" class="nat-w pp" data-nat-say="${esc(r[4])}">${r[4]}</button>
                <span class="nt"><button type="button" class="nat-w" data-nat-say="${esc(natSay(r))}">${natHtml(r)}</button> <span style="color:var(--muted)">· ${r[3]}</span></span>
            </div>`; }).join('')}</div>`).join('');

        const byM = {}; C.forEach(r => (byM[r[5]] = r));
        $('nat-rules').innerHTML = RULES.map(([h, p, list]) => `<div class="nat-rule"><h5>${h}</h5><p>${p}</p><div class="nat-chips">${list.map(m => {
            const f = fem(byM[m]);
            const shown = f === m ? f : f.startsWith(m) ? `${m}<b>${f.slice(m.length)}</b>` : f;
            return `<button type="button" class="nat-chip" data-nat-say="${esc(`il est ${m}. elle est ${f}.`)}">${m} ➔ ${shown}</button>`;
        }).join('')}</div></div>`).join('');

        // Check yourself: 10 questions
        const ex = $('nat-ex'); let round = [], qi = 0, score = 0, answered = false;
        function natQ(r) {
            const g = Math.random() < .5 ? 'm' : 'f', name = NAMES[g][Math.floor(Math.random() * 10)];
            const right = g === 'm' ? r[5] : fem(r), opts = new Set([right]);
            if (r[6]) opts.add(g === 'm' ? r[6] : r[5]);
            for (const o of shuffle(C)) { if (opts.size >= 4) break; if (o !== r) opts.add(g === 'm' ? o[5] : fem(o)); }
            const il = g === 'm' ? 'Il' : 'Elle';
            return { html: `${name} habite ${r[4]}. ${il} est <span class="gap">?</span>`, opts: shuffle([...opts]), right, done: `${name} habite ${r[4]}. ${il} est ${right}.`,
                why: r[6] ? `${il} ➔ ${right}. Masculine ${r[5]}, feminine ${r[6]}.` : `${r[5]} is the same for il and elle.` };
        }
        function prepQ(r) {
            const [p, ...rest] = r[4].split(' ');
            return { html: `J'habite <span class="gap">?</span> ${rest.join(' ')}.`, opts: ['en', 'au', 'aux'], right: p, done: `J'habite ${r[4]}.`,
                why: p === 'aux' ? `${full(r)} is plural ➔ aux.` : p === 'au' ? `${full(r)} is masculine ➔ au.` : `${full(r)} is feminine${r[1] === "l'" ? ' (and starts with a vowel)' : ''} ➔ en.` };
        }
        function listenQ(r) {
            const g = Math.random() < .5 ? 'm' : 'f', right = g === 'm' ? r[5] : r[6];
            return { listen: right, html: 'Listen. Which word do you hear?', opts: shuffle([r[5], r[6]]), right, done: right,
                why: g === 'f' ? `Feminine: you hear the final consonant of ${r[6]}.` : `Masculine: the final consonant of ${r[5]} is silent.` };
        }
        function makeRound() {
            const pool = shuffle(C);
            return pool.slice(0, 10).map((r, i) => { const k = i % 3; return k === 0 || (k === 2 && !r[6]) ? natQ(r) : k === 1 ? prepQ(r) : listenQ(r); });
        }
        function renderQ() {
            answered = false;
            if (qi >= round.length) {
                ex.innerHTML = `<div class="nat-q">Score : <b>${score} / ${round.length}</b> ${score >= 8 ? '🎉 Excellent !' : score >= 5 ? '👍 Bien !' : '💪 Encore une fois ?'}</div>
                    <button type="button" class="nat-btn" id="nat-again">Play again</button>`;
                return;
            }
            const q = round[qi];
            ex.innerHTML = `<div class="nat-row"><span>Question ${qi + 1} of ${round.length} · Score ${score}</span><span class="nat-meter"><span style="width:${qi / round.length * 100}%"></span></span></div>
                <div class="nat-q">${q.html}</div>
                ${q.listen ? `<button type="button" class="nat-btn ghost" data-nat-say="${esc(q.listen)}">🔊 Play again</button>` : ''}
                <div class="nat-opts">${q.opts.map(o => `<button type="button" class="nat-opt" data-nat-opt="${esc(o)}">${o}</button>`).join('')}</div>
                <div class="nat-fb" id="nat-qfb"></div>
                <button type="button" class="nat-btn" id="nat-qnext" hidden>Next</button>`;
            if (q.listen && started) speak(q.listen);
        }
        function answerQ(o, btn) {
            if (answered) return; answered = true; started = true;
            const q = round[qi], ok = o === q.right, fb = $('nat-qfb');
            if (ok) score++;
            ex.querySelectorAll('.nat-opt').forEach(b => { b.disabled = true; if (b.dataset.natOpt === q.right) b.classList.add('ok'); });
            if (!ok) btn.classList.add('no');
            fb.className = 'nat-fb ' + (ok ? 'ok' : 'no');
            fb.textContent = (ok ? 'Correct ! ' : `Not quite. The answer is « ${q.right} ». `) + q.why;
            speak(q.done);
            $('nat-qnext').hidden = false; $('nat-qnext').focus({ preventScroll: true });
        }
        let started = false;   // no sound until the student has answered once
        function startRound() { round = makeRound(); qi = 0; score = 0; renderQ(); }

        root.addEventListener('click', e => {
            const s = e.target.closest('[data-nat-say]'); if (s) { e.stopPropagation(); speak(s.dataset.natSay); }
            const o = e.target.closest('[data-nat-opt]'); if (o) answerQ(o.dataset.natOpt, o);
            if (e.target.id === 'nat-qnext') { qi++; renderQ(); }
            if (e.target.id === 'nat-again') { started = true; startRound(); }
        });
        startRound();
    }

    // ================= Step 2: the World map =================
    const MAP_CSS = `
.wm-scene{background:#e0ecf7}
.wm-scene svg{display:block;width:100%;min-width:780px;height:auto;touch-action:manipulation}
.wm-c{fill:#f1f3f0;stroke:#b8c2cf;stroke-width:.6;vector-effect:non-scaling-stroke}
.wm-c.v{cursor:pointer}
.wm-c.v[data-g="m"]{fill:#c7d7fb}.wm-c.v[data-g="f"]{fill:#f9cad7}.wm-c.v[data-g="pl"]{fill:#ddd0fb}
.wm-c.v:hover{stroke:#0f172a;stroke-width:1.2}
.wm-c.on[data-g="m"]{fill:#2563eb}.wm-c.on[data-g="f"]{fill:#db2759}.wm-c.on[data-g="pl"]{fill:#7c3aed}
.wm-c.on{stroke:#0f172a;stroke-width:1.8}
.wm-c.right{fill:#059669!important}.wm-c.wrong{fill:#e11d48!important;opacity:.55}
.wm-quiz .wm-c.v:not(.done){fill:#f1f3f0}.wm-quiz .wm-c.v:not(.done):hover{fill:#e2e8f0}
.wm-hit{fill:transparent;cursor:pointer}
.wm-lbl{font-weight:800;fill:#0f172a;paint-order:stroke;stroke:#e0ecf7;stroke-linejoin:round;pointer-events:none;text-anchor:middle;dominant-baseline:middle}
.wm-world .wm-lbl{font-size:8.5px;stroke-width:2.6px}.wm-europe .wm-lbl{font-size:2.15px;stroke-width:.65px}
.wm-world .eu,.wm-europe .noneu{display:none}
.wm-quiz .wm-lbl:not(.done),.wm-small.wm-world .wm-lbl{display:none}
.wm-quiz.wm-small.wm-world .wm-lbl.done{display:none}
.wm-key{display:flex;flex-wrap:wrap;gap:12px;font-size:13px;color:#64748b;margin-top:6px}
.wm-key i{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.wm-lines{display:grid;gap:6px}
.wm-say{font:inherit;text-align:left;cursor:pointer;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:8px 10px;display:flex;gap:10px;align-items:center;color:#0f172a;min-height:44px}
.wm-say:hover{border-color:#6366f1;background:#fff}
.wm-say:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
.wm-say small{display:block;color:#64748b;font-size:12px}
.wm-play{flex:none;width:26px;height:26px;border-radius:50%;background:#059669;display:grid;place-items:center}
.wm-play::after{content:"";border-left:8px solid #fff;border-top:5px solid transparent;border-bottom:5px solid transparent;margin-left:2px}
.nat-m{color:#0369a1;font-weight:700}.nat-f{color:#e11d48;font-weight:700}
.mp-big.mp-pl{color:#7c3aed}
`;
    function mountMap(root, opts = {}) {
        const say = opts.say || speak;
        if (window.MemoryPalace && MemoryPalace.css) MemoryPalace.css();
        if (!document.getElementById('wm-css')) { const s = document.createElement('style'); s.id = 'wm-css'; s.textContent = MAP_CSS; document.head.appendChild(s); }
        root.innerHTML = `
            <div class="mp-top">
                <div><div class="mp-eyebrow">World map</div><div class="mp-title">Les pays du monde</div></div>
                <div class="mp-tools">
                    <div class="mp-modes" role="group" aria-label="Map mode">
                        <button type="button" data-m="explore" aria-pressed="true">Explore</button>
                        <button type="button" data-m="walk" aria-pressed="false">Walk through</button>
                        <button type="button" data-m="quiz" aria-pressed="false">Quiz</button>
                    </div>
                    <div class="mp-modes" role="group" aria-label="Region">
                        <button type="button" data-v="world" aria-pressed="true">World</button>
                        <button type="button" data-v="europe" aria-pressed="false">Europe</button>
                    </div>
                    <div class="mp-zoom" role="group" aria-label="Map size">
                        <button type="button" data-z="-1" aria-label="Smaller">−</button>
                        <span class="mp-zl" aria-live="polite">100%</span>
                        <button type="button" data-z="1" aria-label="Bigger">+</button>
                        <button type="button" class="mp-fullbtn" data-full aria-pressed="false">⤢ Enlarge</button>
                    </div>
                </div>
            </div>
            <div class="mp-grid">
                <div><div class="mp-scene wm-scene"><svg class="wm-world" role="img" aria-label="World map of the countries in this topic"></svg></div>
                    <p class="mp-hint">Tap a coloured country to see and hear it. Use <b>Europe</b> for the small countries, and + and − or ⤢ Enlarge to make the map bigger; slide it sideways on a phone.</p>
                    <div class="wm-key"><span><i style="background:#2563eb"></i>masculine · le · au</span><span><i style="background:#db2759"></i>feminine · la / l' · en</span><span><i style="background:#7c3aed"></i>plural · les · aux</span></div>
                </div>
                <div class="mp-card" aria-live="polite"><p class="mp-muted">Loading the map…</p></div>
            </div>`;
        const sceneBox = root.querySelector('.mp-scene'), svg = root.querySelector('svg'), card = root.querySelector('.mp-card');
        let VIEWS = null, view = 'world', mode = 'explore', quiz = null, autoTimer = null;
        const AUTO_MS = 3200;
        const shapeOf = n => svg.querySelector(`.wm-c[data-n="${CSS.escape(n === 'England' ? 'United Kingdom' : n)}"]`);
        const order = GROUPS.flatMap(([, ns]) => ns);

        // size: zoom steps and a full-screen view (same as the memory palaces)
        const ZOOMS = [1, 1.25, 1.5, 2, 2.5];
        let zi = 0;
        const labelCheck = () => svg.classList.toggle('wm-small', svg.clientWidth < 900);
        function applyZoom(keepCentre) {
            const z = ZOOMS[zi];
            const cx = sceneBox.scrollLeft + sceneBox.clientWidth / 2, cy = sceneBox.scrollTop + sceneBox.clientHeight / 2;
            const oldW = svg.clientWidth || 1, oldH = svg.clientHeight || 1;
            svg.style.width = (z * 100) + '%';
            svg.style.minWidth = Math.round(780 * z) + 'px';
            root.querySelector('.mp-zl').textContent = Math.round(z * 100) + '%';
            root.querySelector('[data-z="-1"]').disabled = zi === 0;
            root.querySelector('[data-z="1"]').disabled = zi === ZOOMS.length - 1;
            if (keepCentre) {
                const kx = svg.clientWidth / oldW, ky = svg.clientHeight / oldH;
                sceneBox.scrollLeft = cx * kx - sceneBox.clientWidth / 2;
                sceneBox.scrollTop = cy * ky - sceneBox.clientHeight / 2;
            }
            labelCheck();
        }
        root.querySelectorAll('[data-z]').forEach(b => b.addEventListener('click', () => { zi = Math.max(0, Math.min(ZOOMS.length - 1, zi + Number(b.dataset.z))); applyZoom(true); }));
        const fullBtn = root.querySelector('[data-full]');
        function setFull(on) {
            root.classList.toggle('mp-full', on);
            document.documentElement.classList.toggle('mp-lock', on);
            fullBtn.setAttribute('aria-pressed', on);
            fullBtn.textContent = on ? '✕ Close' : '⤢ Enlarge';
            if (on && zi === 0 && window.innerWidth < 700) zi = 1;
            applyZoom(false);
            fullBtn.focus();
        }
        fullBtn.addEventListener('click', () => setFull(!root.classList.contains('mp-full')));
        root.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('mp-full')) setFull(false); });
        if (window.ResizeObserver) new ResizeObserver(labelCheck).observe(svg);

        function setView(v) {
            view = v;
            if (VIEWS) svg.setAttribute('viewBox', VIEWS[v].join(' '));
            svg.classList.toggle('wm-world', v === 'world'); svg.classList.toggle('wm-europe', v === 'europe');
            root.querySelectorAll('[data-v]').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v));
        }
        root.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => setView(b.dataset.v)));
        const viewFor = n => BY[n][8] === 'eu' ? 'europe' : BY[n][8] === 'both' ? view : 'world';
        function highlight(n) {
            svg.querySelectorAll('.wm-c.on').forEach(p => p.classList.remove('on'));
            if (!n) return;
            if (viewFor(n) !== view) setView(viewFor(n));
            const p = shapeOf(n); if (!p) return;
            p.classList.add('on');
            if (sceneBox.scrollWidth > sceneBox.clientWidth || sceneBox.scrollHeight > sceneBox.clientHeight) {
                const bb = p.getBBox(), vb = VIEWS[view];
                const px = (bb.x + bb.width / 2 - vb[0]) / vb[2] * svg.clientWidth, py = (bb.y + bb.height / 2 - vb[1]) / vb[3] * svg.clientHeight;
                sceneBox.scrollTo({ left: Math.max(0, px - sceneBox.clientWidth / 2), top: Math.max(0, py - sceneBox.clientHeight / 2), behavior: 'smooth' });
            }
        }

        // cards
        const line = (text, sub, html) => `<button type="button" class="wm-say" data-say="${esc(text)}"><span class="wm-play"></span><span>${html || esc(text)}<small>${sub}</small></span></button>`;
        const gcls = g => g === 'pl' ? 'mp-pl' : 'mp-' + g;
        function countryHtml(n) {
            const rs = n === 'United Kingdom' ? [BY['United Kingdom'], BY.England] : [BY[n]];
            return rs.map(r => `<div class="mp-eyebrow">${esc(r[3])}</div>
                <div class="mp-big ${gcls(r[7])}">${esc(full(r))}</div>
                <div class="wm-lines">${line(full(r), 'the country')}${line(r[4], 'in / to')}${line(natSay(r), r[6] ? 'il est… / elle est…' : 'same for il and elle', natHtml(r))}</div>
                ${r[9] ? `<div class="mp-hook">💡 ${esc(r[9])}</div>` : ''}`).join('<hr style="border:0;border-top:1px solid #e2e8f0;margin:2px 0">');
        }
        function intro() {
            highlight(null);
            card.innerHTML = `<div class="mp-eyebrow">How it works</div>
                <div class="mp-big">Travel the map</div>
                <p class="mp-muted">Each of the ${order.length} countries sits where it really is. Walk through once to hear every country, its <b>en / au / aux</b> and its nationality. Then take the quiz: the names disappear and you find the country you hear.</p>
                <p class="mp-muted"><b class="mp-m">Blue</b> = masculine (<i>au</i>), <b class="mp-f">red</b> = feminine (<i>en</i>), <b style="color:#7c3aed">purple</b> = plural (<i>aux</i>).</p>
                <div class="mp-row"><button type="button" class="mp-btn pri" data-a="walk">Start the walk →</button></div>`;
            card.querySelector('[data-a="walk"]').addEventListener('click', () => setMode('walk'));
        }
        function stopAuto() { clearTimeout(autoTimer); autoTimer = null; }
        function show(n, i) {
            const walking = i !== undefined;
            if (walking && autoTimer) clearTimeout(autoTimer);
            highlight(n);
            const auto = walking && autoTimer !== null;
            card.innerHTML = countryHtml(n) + (walking ? `<div class="mp-row">
                    <button type="button" class="mp-btn" data-a="prev" ${i === 0 ? 'disabled' : ''}>← Back</button>
                    <button type="button" class="mp-btn pri" data-a="next">${i === order.length - 1 ? 'Finish' : 'Next →'}</button>
                    <button type="button" class="mp-btn" data-a="auto" aria-pressed="${auto}">${auto ? (window.MEDIA_ICON ? MEDIA_ICON.pause(16) + ' Pause' : 'Pause') : (window.MEDIA_ICON ? MEDIA_ICON.play(16) + ' Play the walk' : '▶ Play the walk')}</button></div>
                <p class="mp-muted">Stop ${i + 1} of ${order.length}${auto ? ' · moving on by itself' : ''}</p>` : '');
            say(full(BY[n]));
            if (!walking) return;
            const next = () => {
                if (!root.isConnected || !card.offsetParent) return stopAuto();   // left the map: stop talking
                if (i === order.length - 1) { stopAuto(); walkDone(); } else show(order[i + 1], i + 1);
            };
            card.querySelector('[data-a="prev"]').addEventListener('click', () => { stopAuto(); show(order[i - 1], i - 1); });
            card.querySelector('[data-a="next"]').addEventListener('click', () => { if (autoTimer !== null) { clearTimeout(autoTimer); autoTimer = 0; } next(); });
            card.querySelector('[data-a="auto"]').addEventListener('click', () => { if (autoTimer !== null) { stopAuto(); show(n, i); } else { autoTimer = 0; next(); } });
            if (autoTimer !== null) autoTimer = setTimeout(next, AUTO_MS);
        }
        function walkDone() {
            highlight(null);
            card.innerHTML = `<div class="mp-eyebrow">Walk finished</div><div class="mp-big">Now close your eyes</div>
                <p class="mp-muted">Picture the map continent by continent and say each country with <i>en, au</i> or <i>aux</i>. Then test yourself: the names disappear and you find the countries.</p>
                <div class="mp-row"><button type="button" class="mp-btn pri" data-a="quiz">Take the quiz</button><button type="button" class="mp-btn" data-a="again">Walk again</button></div>`;
            card.querySelector('[data-a="quiz"]').addEventListener('click', () => setMode('quiz'));
            card.querySelector('[data-a="again"]').addEventListener('click', () => setMode('walk'));
        }
        // quiz: hear a country, find it
        function ask() {
            highlight(null);
            svg.querySelectorAll('.right,.wrong').forEach(p => p.classList.remove('right', 'wrong'));
            if (quiz.k >= quiz.list.length) {
                const t = quiz.list.length;
                card.innerHTML = `<div class="mp-eyebrow">Quiz done</div><div class="mp-big">${quiz.score} / ${t}</div>
                    <p class="mp-muted">${quiz.score >= t * 0.85 ? 'Excellent: the map is in your head.' : 'Walk through once more, then try again. It gets easier each time.'}</p>
                    <div class="mp-row"><button type="button" class="mp-btn pri" data-a="again">Try again</button><button type="button" class="mp-btn" data-a="walk">Walk through</button></div>`;
                card.querySelector('[data-a="again"]').addEventListener('click', () => setMode('quiz'));
                card.querySelector('[data-a="walk"]').addEventListener('click', () => setMode('walk'));
                return;
            }
            const n = quiz.list[quiz.k], r = BY[n];
            quiz.tries = 0;
            if (viewFor(n) !== view) setView(viewFor(n));
            card.innerHTML = `<div class="mp-eyebrow">Find it</div><div class="mp-big">Où est ${esc(full(r))} ?</div>
                <div class="mp-en">${esc(r[3])}</div>
                <div class="mp-row"><button type="button" class="mp-btn" data-say="${esc(full(r))}">🔊 Listen</button><button type="button" class="mp-btn" data-a="skip">Skip</button></div>
                <p class="mp-fb" id="wm-fb"></p><p class="mp-muted">Score ${quiz.score} · ${quiz.k + 1} of ${quiz.list.length}</p>`;
            card.querySelector('[data-a="skip"]').addEventListener('click', () => { quiz.k++; ask(); });
            say('Où est ' + full(r) + ' ?');
        }
        function quizTap(n) {
            const want = quiz.list[quiz.k], p = shapeOf(n);
            if (n === want) {
                const first = quiz.tries === 0;
                if (first) quiz.score++;
                p.classList.add('right', 'done');
                svg.querySelectorAll(`.wm-lbl[data-n="${CSS.escape(n)}"]`).forEach(t => t.classList.add('done'));
                card.innerHTML = countryHtml(n) + `<p class="mp-fb ok">${first ? 'Right first time!' : 'Found it.'}</p>
                    <div class="mp-row"><button type="button" class="mp-btn pri" data-a="next">Next →</button></div>
                    <p class="mp-muted">Score ${quiz.score} · ${quiz.k + 1} of ${quiz.list.length}</p>`;
                card.querySelector('[data-a="next"]').addEventListener('click', () => { quiz.k++; ask(); });
                say('Oui ! ' + BY[n][4]);
            } else {
                quiz.tries++;
                if (p) { p.classList.add('wrong'); setTimeout(() => p.classList.remove('wrong'), 600); }
                const fb = card.querySelector('#wm-fb'), w = BY[n];
                if (fb) { fb.className = 'mp-fb no'; fb.textContent = w ? `Non, ça, c'est ${full(w)}.` : 'Not that one. Try again.'; }
                if (w) say(`Non, ça, c'est ${full(w)}.`);
            }
        }
        function setMode(m) {
            stopAuto();
            mode = m;
            root.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === m));
            svg.classList.toggle('wm-quiz', m === 'quiz');
            svg.querySelectorAll('.on,.right,.wrong,.done').forEach(p => p.classList.remove('on', 'right', 'wrong', 'done'));
            if (m === 'explore') intro();
            if (m === 'walk') show(order[0], 0);
            if (m === 'quiz') { quiz = { list: shuffle(order.filter(n => n !== 'England')), k: 0, score: 0, tries: 0 }; ask(); }
        }
        root.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.m)));
        card.addEventListener('click', e => { const s = e.target.closest('[data-say]'); if (s) say(s.dataset.say); });
        svg.addEventListener('click', e => {
            const el = e.target.closest('[data-n]'); if (!el || !VIEWS) return;
            const n = el.dataset.n;
            if (mode === 'quiz') { if (quiz && quiz.k < quiz.list.length && !(shapeOf(n) || {}).classList?.contains('done')) quizTap(n); return; }
            if (!BY[n]) return;
            if (mode === 'walk') show(n, order.indexOf(n));
            else show(n);
        });

        fetch('content/vocab/world-map.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(data => {
            if (!root.isConnected) return;
            VIEWS = data.views;
            const NUDGE = { Netherlands: [0, -.9], Belgium: [-.6, .7], Switzerland: [0, .5], England: [2.6, 2.4], 'United Kingdom': [-.6, -3.2] };
            const gC = document.createElementNS(NS, 'g'), gL = document.createElementNS(NS, 'g');
            for (const [n, d] of data.paths) {
                const p = document.createElementNS(NS, 'path');
                p.setAttribute('d', d); p.setAttribute('class', 'wm-c'); p.dataset.n = n;
                if (BY[n]) { p.classList.add('v'); p.dataset.g = BY[n][7]; p.setAttribute('aria-label', full(BY[n])); }
                gC.appendChild(p);
            }
            for (const r of C) {
                const n = r[0], a = data.anchors[n]; if (!a) continue;
                const k = NUDGE[n] || [0, 0], cls = r[8] === 'eu' ? 'eu' : r[8] === 'both' ? 'both' : 'noneu';
                if (n !== 'England') {
                    const hit = document.createElementNS(NS, 'circle');
                    hit.setAttribute('cx', a[0]); hit.setAttribute('cy', a[1]); hit.setAttribute('r', cls === 'eu' ? 1.6 : 6);
                    hit.setAttribute('class', 'wm-hit ' + (cls === 'eu' ? 'eu' : 'noneu')); hit.dataset.n = n;
                    gL.appendChild(hit);
                }
                const t = document.createElementNS(NS, 'text');
                t.setAttribute('x', a[0] + k[0]); t.setAttribute('y', a[1] + k[1]);
                t.setAttribute('class', 'wm-lbl ' + cls); t.dataset.n = n === 'England' ? 'United Kingdom' : n; t.textContent = full(r);
                gL.appendChild(t);
            }
            svg.append(gC, gL);
            setView(view);
            intro();
        }).catch(() => { card.innerHTML = '<p class="mp-fb no">The map could not be loaded. Check your connection and open this step again.</p>'; });
        applyZoom(false);
    }

    (window.VocabTools = window.VocabTools || {})[10] = { name: 'World map', next: 'Explore the world map', mount: mountMap };
    return { bind, mountMap };
})();
