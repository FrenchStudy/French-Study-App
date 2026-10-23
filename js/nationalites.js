// js/nationalites.js - the interactive parts of the "Les nationalités" hands-on lesson (content/vocab/nationalites.html):
// a tap-to-hear world map with a "Find it" game, the four masculine ➔ feminine patterns, and a 10-question practice round.
// Loaded on demand by lesson-kit.js; needs speakFrench from js/ai.js.
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
    const full = r => r[1] === "l'" ? "l'" + r[2] : r[1] + ' ' + r[2];
    const fem = r => r[6] || r[5];
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const say = t => { if (typeof speakFrench === 'function') speakFrench(t, 0.9); };
    const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const NS = 'http://www.w3.org/2000/svg';
    // Small label shifts so neighbours don't overlap in the Europe view
    const NUDGE = { Netherlands: [0, -.9], Belgium: [-.6, .7], Switzerland: [0, .5], England: [2.6, 2.4], 'United Kingdom': [-.6, -3.2] };
    const RULES = [
        ['+ e', 'Most nationalities: add an e. The final consonant is then pronounced.', ['français', 'anglais', 'américain', 'espagnol', 'allemand', 'chinois', 'japonais', 'mexicain', 'marocain', 'polonais', 'sénégalais', 'argentin']],
        ['-ien ➔ -ienne', 'Double the n, then add e.', ['italien', 'canadien', 'brésilien', 'indien', 'australien', 'algérien', 'tunisien']],
        ['Already ends in -e', 'No change: il est belge, elle est belge.', ['belge', 'suisse', 'russe', 'britannique']],
        ['Irregular', 'Learn these two by heart.', ['grec', 'turc']]
    ];
    const NAMES = { m: ['Marco', 'Lucas', 'Hiro', 'Raj', 'Pedro', 'Karim', 'Jack', 'Hans', 'Nikos', 'Moussa'], f: ['Sofia', 'Emma', 'Yuki', 'Priya', 'Ana', 'Leïla', 'Olivia', 'Greta', 'Elena', 'Aïcha'] };

    function bind(root) {
        const $ = id => root.querySelector('#' + id);
        if (!$('nat-svg')) return;
        let view = 'world', mode = 'explore', target = null, findScore = 0, findTries = 0, findOrder = [];

        // ---------- Map ----------
        const svg = $('nat-svg'), card = $('nat-card'), hint = $('nat-hint');
        let VIEWS = null;
        function setView(v) {
            view = v;
            if (VIEWS) svg.setAttribute('viewBox', VIEWS[v].join(' '));
            svg.classList.toggle('nat-world', v === 'world'); svg.classList.toggle('nat-europe', v === 'europe');
            root.querySelectorAll('[data-nat-view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.natView === v));
        }
        const sizeCheck = () => svg.classList.toggle('nat-small', svg.clientWidth < 560);
        if (window.ResizeObserver) new ResizeObserver(sizeCheck).observe(svg);

        fetch('content/vocab/world-map.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(data => {
            VIEWS = data.views;
            const gC = document.createElementNS(NS, 'g');
            for (const [n, d] of data.paths) {
                const p = document.createElementNS(NS, 'path');
                p.setAttribute('d', d); p.setAttribute('class', 'nat-c'); p.dataset.n = n;
                if (BY[n]) { p.classList.add('v'); p.dataset.g = BY[n][7]; }
                gC.appendChild(p);
            }
            const gL = document.createElementNS(NS, 'g');
            for (const r of C) {
                const n = r[0], a = data.anchors[n]; if (!a) continue;
                const k = NUDGE[n] || [0, 0];
                const cls = r[8] === 'eu' ? 'eu' : r[8] === 'both' ? 'both' : 'noneu';
                if (n !== 'England') {
                    const hit = document.createElementNS(NS, 'circle');
                    hit.setAttribute('cx', a[0]); hit.setAttribute('cy', a[1]);
                    hit.setAttribute('r', cls === 'eu' ? 1.6 : 6);
                    hit.setAttribute('class', 'nat-hit ' + (cls === 'eu' ? 'eu' : 'noneu')); hit.dataset.n = n;
                    gL.appendChild(hit);
                }
                const t = document.createElementNS(NS, 'text');
                t.setAttribute('x', a[0] + k[0]); t.setAttribute('y', a[1] + k[1]);
                t.setAttribute('class', 'nat-lbl ' + cls); t.textContent = full(r);
                gL.appendChild(t);
            }
            svg.append(gC, gL);
            setView(view); sizeCheck();
            hint.textContent = 'Tap a coloured country';
        }).catch(() => {
            hint.textContent = 'The map could not be loaded. Check your connection and reopen the lesson.';
        });

        const line = (text, sub, html) => `<button type="button" class="nat-say" data-nat-say="${esc(text)}"><span class="nat-play"></span><span>${html || esc(text)}${sub ? `<small>${sub}</small>` : ''}</span></button>`;
        const natHtml = r => `<span class="nat-m">${r[5]}</span>${r[6] ? ` / <span class="nat-f">${r[6]}</span>` : ''}`;
        const natSay = r => r[6] ? `il est ${r[5]}. elle est ${r[6]}.` : `il est ${r[5]}. elle est ${r[5]}.`;
        const oneCard = r => `<div class="nat-card-in" data-g="${r[7]}" style="display:grid;gap:8px">
            <div><div class="nat-big"><span class="art">${r[1]}${r[1] === "l'" ? '' : ' '}</span>${r[2]}</div><div class="nat-note">${r[3]}</div></div>
            ${line(full(r), 'the country')}
            ${line(r[4], 'in / to')}
            ${line(natSay(r), r[6] ? 'il est… / elle est…' : 'same for him and her', natHtml(r))}
            ${r[9] ? `<div class="nat-note">${r[9]}</div>` : ''}</div>`;
        function emptyCard() {
            card.innerHTML = `<div class="nat-big" style="font-size:17px">Choisissez un pays</div>
                <p class="nat-note" style="margin:0">Tap a coloured country. Use <b>Europe</b> to reach the small ones.</p>
                <div class="nat-note"><b>en</b> feminine or starts with a vowel · <b>au</b> masculine · <b>aux</b> plural</div>`;
        }
        function select(n) {
            svg.querySelectorAll('.nat-c.sel').forEach(p => p.classList.remove('sel'));
            const shapeName = n === 'England' ? 'United Kingdom' : n;
            const shape = svg.querySelector(`.nat-c[data-n="${CSS.escape(shapeName)}"]`); if (shape) shape.classList.add('sel');
            const rs = (n === 'United Kingdom') ? [BY['United Kingdom'], BY.England] : [BY[n]];
            card.innerHTML = rs.map(oneCard).join('<hr class="nat-sep">');
            say(full(rs[0]));
        }

        // Find it
        function nextFind() {
            if (!findOrder.length) findOrder = shuffle(C.filter(r => r[0] !== 'England').map(r => r[0]));
            target = findOrder.pop();
            svg.querySelectorAll('.right,.wrong').forEach(p => p.classList.remove('right', 'wrong'));
            const r = BY[target];
            if (r[8] === 'eu' && view === 'world') setView('europe');
            if (r[8] !== 'eu' && r[8] !== 'both' && view === 'europe') setView('world');
            card.innerHTML = `<div class="nat-note">Score: ${findScore} / ${findTries}</div>
                <div>Où est…</div><div class="nat-big" data-g="${r[7]}">${full(r)} ?</div>
                ${line(full(r), 'hear it again')}
                <div class="nat-fb" id="nat-ffb"></div>
                <button type="button" class="nat-btn ghost" id="nat-fnext">Skip</button>`;
            say('Où est ' + full(r) + ' ?');
        }
        function answerFind(n) {
            if (!target) return;
            const fb = $('nat-ffb'), r = BY[target];
            const shape = svg.querySelector(`.nat-c[data-n="${CSS.escape(n)}"]`);
            findTries++;
            if (n === target) {
                findScore++; shape && shape.classList.add('right');
                fb.className = 'nat-fb ok'; fb.textContent = `Oui ! On dit « ${r[4]} ».`; say('Oui ! ' + r[4]);
                $('nat-fnext').textContent = 'Next'; target = null;
            } else {
                shape && shape.classList.add('wrong');
                const w = BY[n];
                fb.className = 'nat-fb no'; fb.textContent = w ? `Non, ça, c'est ${full(w)}.` : 'Non, essayez encore.';
                if (w) say(`Non, ça, c'est ${full(w)}.`);
            }
            const sc = card.querySelector('.nat-note'); if (sc) sc.textContent = `Score: ${findScore} / ${findTries}`;
        }
        function setMode(m) {
            mode = m; svg.classList.toggle('nat-find', m === 'find');
            root.querySelectorAll('[data-nat-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.natMode === m));
            svg.querySelectorAll('.sel,.right,.wrong').forEach(p => p.classList.remove('sel', 'right', 'wrong'));
            if (VIEWS) hint.textContent = m === 'find' ? 'Tap the country you hear' : 'Tap a coloured country';
            if (m === 'find') { findScore = 0; findTries = 0; findOrder = []; nextFind(); } else { target = null; emptyCard(); }
        }
        svg.addEventListener('click', e => {
            const el = e.target.closest('[data-n]'); if (!el) return;
            const n = el.dataset.n;
            if (mode === 'find') answerFind(n); else if (BY[n]) select(n);
        });

        // ---------- Patterns ----------
        const byM = {}; C.forEach(r => (byM[r[5]] = r));
        $('nat-rules').innerHTML = RULES.map(([h, p, list]) => `<div class="nat-rule"><h5>${h}</h5><p>${p}</p><div class="nat-chips">${list.map(m => {
            const r = byM[m]; const f = fem(r);
            const stem = f.startsWith(m) && f !== m ? `${m}<b>${f.slice(m.length)}</b>` : f;
            return `<button type="button" class="nat-chip" data-nat-say="${esc(`il est ${m}. elle est ${f}.`)}">${m} ➔ ${f === m ? f : stem}</button>`;
        }).join('')}</div></div>`).join('');

        // ---------- Practice ----------
        const ex = $('nat-ex'); let round = [], qi = 0, score = 0, answered = false;
        function makeRound() {
            const qs = [], pool = shuffle(C);
            for (let i = 0; i < 10; i++) {
                const r = pool[i % pool.length], kind = ['nat', 'prep', 'listen'][i % 3];
                if (kind === 'listen' && !r[6]) { qs.push(natQ(r)); continue; }
                qs.push(kind === 'nat' ? natQ(r) : kind === 'prep' ? prepQ(r) : listenQ(r));
            }
            return qs;
        }
        function natQ(r) {
            const g = Math.random() < .5 ? 'm' : 'f', name = NAMES[g][Math.floor(Math.random() * 10)];
            const right = g === 'm' ? r[5] : fem(r);
            const opts = new Set([right]);
            if (r[6]) opts.add(g === 'm' ? r[6] : r[5]);
            for (const o of shuffle(C)) { if (opts.size >= 4) break; if (o !== r) opts.add(g === 'm' ? o[5] : fem(o)); }
            return { html: `${name} habite ${r[4]}. ${g === 'm' ? 'Il' : 'Elle'} est <span class="gap">?</span>`,
                opts: shuffle([...opts]), right, done: `${name} habite ${r[4]}. ${g === 'm' ? 'Il' : 'Elle'} est ${right}.`,
                why: r[6] ? `${g === 'm' ? 'Il' : 'Elle'} ➔ ${right}. Masculine ${r[5]}, feminine ${r[6]}.` : `${r[5]} is the same for il and elle.` };
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
            if (q.listen) say(q.listen);
        }
        function answerQ(o, btn) {
            if (answered) return; answered = true;
            const q = round[qi], ok = o === q.right, fb = $('nat-qfb');
            if (ok) score++;
            ex.querySelectorAll('.nat-opt').forEach(b => { b.disabled = true; if (b.dataset.natOpt === q.right) b.classList.add('ok'); });
            if (!ok) btn.classList.add('no');
            fb.className = 'nat-fb ' + (ok ? 'ok' : 'no');
            fb.textContent = (ok ? 'Correct ! ' : `Not quite. The answer is « ${q.right} ». `) + q.why;
            say(q.done);
            $('nat-qnext').hidden = false; $('nat-qnext').focus();
        }
        function startRound() { round = makeRound(); qi = 0; score = 0; renderQ(); }

        // ---------- One click handler for the whole lesson ----------
        root.addEventListener('click', e => {
            const s = e.target.closest('[data-nat-say]'); if (s) { e.stopPropagation(); say(s.dataset.natSay); }
            const v = e.target.closest('[data-nat-view]'); if (v) setView(v.dataset.natView);
            const m = e.target.closest('[data-nat-mode]'); if (m) setMode(m.dataset.natMode);
            const o = e.target.closest('[data-nat-opt]'); if (o) answerQ(o.dataset.natOpt, o);
            if (e.target.id === 'nat-fnext') nextFind();
            if (e.target.id === 'nat-qnext') { qi++; renderQ(); }
            if (e.target.id === 'nat-again') startRound();
        });

        emptyCard();
        startRound();
    }
    return { bind };
})();
