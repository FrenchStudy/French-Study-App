// js/connector-lessons.js - teaching tabs for Vocab Topic 3 (Connectors), shown before the exercises in scale-tool.js:
//   signs   Les panneaux: each kind of link is a road sign; a little car obeys it along a sentence (the memory hook)
//   comics  Les histoires: two-panel comics with Léa and Hugo; the connector changes what happens in panel 2 (meaning)
//   dress   Le dress code: the same idea with friends, at work, in writing; Léa changes clothes (formality)
//   doors   Les portes: a verb card walks through a connector's door and comes out the same, changed or as a noun (grammar)
// ConnectorLessons.explore(type, body, ctx) and .questions(type, ctx) are called by scale-tool.js; ctx = { speak, joinSay, markWord }.
// ConnectorLessons.badge(roleName) draws the road sign of a group (used by Le lien).
// Pictures: Microsoft Fluent Emoji 3D (MIT) in media/pictures and media/palace; faces: DiceBear toon-head (CC BY 4.0) in media/people.
window.ConnectorLessons = (function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const PIC = (n) => (n.startsWith('palace:') ? 'media/palace/' + n.slice(7) : 'media/pictures/fe-' + n) + '.webp';
const FACE = (n) => 'media/people/' + n + '.svg';
const C = () => window.CONNECTORS || { roles: [] };
const wordOf = (fr) => { for (const r of C().roles) { const w = r.words.find(x => x.fr === fr); if (w) return w; } return null; };
const keyOf = (fr) => (wordOf(fr) || {}).key || fr;

// ================= The signs (one per group of connectors) =================
const SIGNS = {
    add: { role: 'Ajouter', name: 'Tout droit', en: 'straight on', c: '#059669', what: 'The second idea keeps going in the same direction: it adds something.',
        d: '<path d="M50 80 V34" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M30 46 L50 22 L70 46 Z" fill="#fff"/>',
        words: ['et', 'aussi', 'de plus', 'en outre', 'par ailleurs'] },
    precise: { role: 'Préciser', name: 'La loupe', en: 'zoom in', c: '#0891b2', what: 'Stop and zoom in: the second idea says the first more precisely, or gives an example.',
        d: '<circle cx="44" cy="44" r="18" fill="none" stroke="#fff" stroke-width="9"/><path d="M57 57 L74 74" stroke="#fff" stroke-width="11" stroke-linecap="round"/>',
        words: ['c\'est-à-dire', 'autrement dit', 'en fait', 'en effet', 'par exemple', 'notamment'] },
    uturn: { role: 'Opposer', name: 'Le demi-tour', en: 'U-turn', c: '#1d4ed8', what: 'The second idea turns back against the first. You expect one thing… and the opposite happens.',
        d: '<path d="M38 74 V44 a16 16 0 0 1 32 0 V60" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M56 56 L70 74 L84 56 Z" fill="#fff"/>',
        words: ['mais', 'pourtant', 'cependant', 'bien que', 'malgré', 'sauf'] },
    fork: { role: 'Choisir', name: 'La fourche', en: 'fork in the road', c: '#7c3aed', what: 'The road splits: it is one idea or the other.',
        d: '<path d="M50 80 V56 L32 34 M50 56 L68 34" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 40 L28 22 L42 32 Z M78 40 L72 22 L58 32 Z" fill="#fff"/>',
        words: ['ou', 'soit… soit', 'd\'un côté… de l\'autre'] },
    back: { role: 'Expliquer', name: 'Le rétroviseur', en: 'look back', c: '#d97706', what: 'Look back: the second idea is the cause, something that came first.',
        d: '<path d="M72 64 a20 20 0 1 0 -26 -26" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M30 26 L52 30 L36 46 Z" fill="#fff"/>',
        words: ['parce que', 'car', 'comme', 'puisque', 'grâce à', 'à cause de'] },
    arrive: { role: 'Conclure', name: 'L\'arrivée', en: 'finish line', c: '#be123c', what: 'You arrive: the second idea is the result, or the conclusion.',
        d: '<rect x="34" y="24" width="6" height="56" rx="2" fill="#fff"/><path d="M40 26 h32 v26 h-32 z" fill="#fff"/><path d="M40 26 h8 v9 h-8z M56 26 h8 v9 h-8z M48 35 h8 v8 h-8z M64 35 h8 v8 h-8z M40 43 h8 v9 h-8z M56 43 h8 v9 h-8z" fill="#be123c"/>',
        words: ['donc', 'alors', 'ainsi', 'par conséquent', 'c\'est pourquoi', 'en conclusion'] },
    barrier: { role: 'Condition', name: 'La barrière', en: 'barrier', c: '#0f766e', what: 'The barrier opens only if… : one idea happens only if the other does.',
        d: '<rect x="20" y="44" width="60" height="14" rx="4" fill="#fff"/><path d="M28 44 l10 0 -8 14 -10 0z M48 44 l10 0 -8 14 -10 0z M68 44 l10 0 -8 14 -10 0z" fill="#e11d48"/><rect x="22" y="58" width="6" height="20" fill="#fff"/><rect x="72" y="58" width="6" height="20" fill="#fff"/>',
        words: ['si', 'au cas où', 'à condition que', 'à moins que'] },
    target: { role: 'But', name: 'La cible', en: 'target', c: '#c026d3', what: 'Aim at the target: the second idea is the goal, what you want to happen.',
        d: '<circle cx="50" cy="50" r="25" fill="none" stroke="#fff" stroke-width="7"/><circle cx="50" cy="50" r="10" fill="#fff"/>',
        words: ['pour que', 'afin que', 'de peur que', 'en vue de'] },
    clock: { role: 'Temps', name: 'L\'horloge', en: 'clock', c: '#475569', what: 'Look at the clock: it says when, or that two things happen at the same time.',
        d: '<circle cx="50" cy="50" r="26" fill="none" stroke="#fff" stroke-width="7"/><path d="M50 50 V34 M50 50 L62 58" stroke="#fff" stroke-width="7" stroke-linecap="round"/>',
        words: ['quand', 'lorsque', 'pendant que', 'dès que', 'avant que', 'depuis que'] },
};
const ORDER = ['add', 'precise', 'uturn', 'fork', 'back', 'arrive', 'barrier', 'target', 'clock'];
const signOfRole = (role) => ORDER.find(k => SIGNS[k].role === role);
const signSvg = (k, cls) => `<svg class="${cls || ''}" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" fill="${SIGNS[k].c}" stroke="#fff" stroke-width="4"/><circle cx="50" cy="50" r="47" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1"/>${SIGNS[k].d}</svg>`;
const badge = (role) => { const k = signOfRole(role); return k ? signSvg(k, 'cl-badge') : ''; };
// the sign of a connector (by its group in connectors-data.js)
const signOfWord = (fr) => { for (const r of C().roles) if (r.words.some(w => w.fr === fr)) return signOfRole(r.name); return null; };

// ---- the road scenes: SVG 720 x 300; a car follows a road; events at times (s) ----
const road = (d, id) => `<path ${id ? `id="${id}"` : ''} d="${d}" stroke="#475569" stroke-width="44" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#fff" stroke-width="2.5" fill="none" stroke-dasharray="14 12" opacity=".8"/>`;
const txt = (x, y, s, id, o, a) => `<text class="cl-t" ${id ? `id="${id}"` : ''} x="${x}" y="${y}" font-size="22" font-weight="800" fill="#0f172a" text-anchor="${a || 'start'}" opacity="${o == null ? 1 : o}">${esc(s)}</text>`;
const img = (x, y, n, s, id, o) => `<image ${id ? `id="${id}"` : ''} href="${PIC(n)}" x="${x}" y="${y}" width="${s}" height="${s}" opacity="${o == null ? 1 : o}"/>`;
const post = (x, y, k) => `<g transform="translate(${x} ${y})"><rect x="-3" y="40" width="6" height="20" fill="#94a3b8"/><g class="cl-sg"><svg x="-26" y="-6" width="52" height="52" viewBox="0 0 100 100">${signSvg(k).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg></g></g>`;
const word = (x, y, s, c, id) => { const w = Math.max(96, s.length * 16 + 40); return `<g id="${id || 'cw'}" opacity="0"><rect x="${x - w / 2}" y="${y - 30}" width="${w}" height="42" rx="11" fill="${c}"/><text x="${x}" y="${y}" text-anchor="middle" font-size="27" font-weight="900" fill="#fff">${esc(s)}</text></g>`; };
const CAR = (id) => `<g id="${id}" class="cl-car"><image href="${PIC('palace:automobile')}" x="-24" y="-24" width="48" height="48"/></g>`;

// Each scene: svg (inside the 720 x 300 box), cars [{ car id, path id, frames [[t, length fraction]] }], events [[t, what]], sentence
const SCENES = {
    add: { fr: ['Le café est bon, ', 'et', ' le croissant est délicieux.'], en: 'The coffee is good, and the croissant is delicious.',
        svg: () => road('M40 170 H680', 'p1') + img(60, 70, 'hot-beverage', 56) + txt(124, 110, 'Le café est bon,', 't1')
            + img(420, 70, 'croissant', 56, 'i2', .25) + txt(484, 110, 'le croissant…', 't2', .25) + post(378, 64, 'add') + word(360, 238, 'et', SIGNS.add.c),
        cars: [{ id: 'car1', path: 'p1', frames: [[0, 0], [2.4, .48], [3.1, .5], [5.6, 1]] }],
        events: [[0, 'say1'], [2.4, 'word'], [3.1, 'show2']] },
    precise: { fr: ['J\'aime les fruits, ', 'par exemple', ' les pommes.'], en: 'I like fruit, for example apples.',
        svg: () => road('M40 200 H680', 'p1') + img(50, 20, 'basket', 60) + txt(120, 62, 'J\'aime les fruits,', 't1')
            + post(300, 108, 'precise') + word(300, 270, 'par exemple', SIGNS.precise.c)
            + `<g id="lens" opacity="0" style="transform-origin:540px 120px"><circle cx="540" cy="120" r="78" fill="#fff" stroke="#0891b2" stroke-width="8"/><path d="M596 176 L640 220" stroke="#0891b2" stroke-width="14" stroke-linecap="round"/>${img(492, 66, 'red-apple', 96)}</g>`
            + txt(540, 244, 'les pommes.', 't2', 0, 'middle'),
        cars: [{ id: 'car1', path: 'p1', frames: [[0, 0], [2.2, .36], [4.4, .36], [6.2, 1]] }],
        events: [[0, 'say1'], [2.2, 'word'], [2.6, 'lens'], [3.2, 'show2']] },
    uturn: { fr: ['Il pleut beaucoup, ', 'pourtant', ' je sors me promener.'], en: 'It\'s raining hard, yet I\'m going out for a walk.',
        svg: () => `<g opacity=".6"><path d="M470 80 H690" stroke="#cbd5e1" stroke-width="34" stroke-linecap="round" fill="none" stroke-dasharray="2 14"/>
            <text x="610" y="30" text-anchor="middle" font-size="15" fill="#64748b" font-weight="800">you expect…</text><text x="610" y="52" text-anchor="middle" font-size="15" fill="#64748b">je reste à la maison</text>
            <g transform="translate(694 80)"><circle r="15" fill="#fee2e2" stroke="#e11d48" stroke-width="2"/><path d="M-6 -6 L6 6 M6 -6 L-6 6" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/></g></g>`
            + road('M40 80 H470 A70 70 0 0 1 470 220 H40', 'p1') + img(44, 6, 'cloud-with-rain', 52) + txt(104, 44, 'Il pleut beaucoup,', 't1')
            + img(44, 236, 'person-walking', 50) + txt(104, 272, 'je sors me promener.', 't2', .25) + post(440, 0, 'uturn') + word(366, 157, 'pourtant', SIGNS.uturn.c),
        cars: [{ id: 'car1', path: 'p1', frames: [[0, 0], [2.1, .32], [3.2, .32], [6.5, 1]] }],
        events: [[0, 'say1'], [2.1, 'word'], [4.3, 'show2']] },
    fork: { fr: ['Tu veux du thé ', 'ou', ' du café ?'], en: 'Do you want tea or coffee?',
        svg: () => road('M40 160 H330 C400 160 420 80 520 80 H600', 'p1') + road('M330 160 C400 160 420 240 520 240 H600', 'p2')
            + txt(60, 120, 'Tu veux…', 't1') + img(612, 46, 'teacup-without-handle', 64, 'i1') + txt(560, 40, 'du thé', 't3', 1, 'middle')
            + img(612, 206, 'hot-beverage', 64, 'i2', .3) + txt(560, 296, 'du café ?', 't2', .3, 'middle') + post(300, 50, 'fork') + word(330, 230, 'ou', SIGNS.fork.c),
        cars: [{ id: 'car1', path: 'p1', frames: [[0, 0], [2.2, .5], [3.4, .5], [5.4, 1]] }],
        events: [[0, 'say1'], [2.2, 'word'], [3.4, 'show2']] },
    back: { fr: ['Je reste à la maison ', 'parce qu\'', 'il pleut.'], en: 'I\'m staying at home because it\'s raining.',
        svg: () => road('M40 170 H680', 'p1') + img(616, 64, 'palace:house', 64) + txt(600, 66, 'Je reste à la maison', 't1', 1, 'end')
            + post(660, 186, 'back') + img(52, 64, 'cloud-with-rain', 60, 'i2', .2) + txt(122, 106, 'il pleut.', 't2', .2)
            + `<text id="ago" x="122" y="134" font-size="14" fill="#92400e" font-weight="800" opacity="0">avant · the cause</text>` + word(380, 250, 'parce que', SIGNS.back.c),
        cars: [{ id: 'car1', path: 'p1', frames: [[0, .4], [1.8, .86], [2.8, .86], [5.6, .1]] }],
        events: [[0, 'say1'], [1.8, 'word'], [4.2, 'show2']] },
    arrive: { fr: ['Il a beaucoup travaillé, ', 'donc', ' il a réussi son examen.'], en: 'He worked hard, so he passed his exam.',
        svg: () => road('M40 170 H600', 'p1') + `<g transform="translate(610 120)"><rect x="0" y="0" width="16" height="100" fill="#0f172a"/><path d="M0 0h8v10h-8zM8 10h8v10h-8zM0 20h8v10h-8zM8 30h8v10h-8zM0 40h8v10h-8zM8 50h8v10h-8zM0 60h8v10h-8zM8 70h8v10h-8zM0 80h8v10h-8zM8 90h8v10h-8z" fill="#fff"/></g>`
            + img(60, 70, 'books', 56) + txt(124, 110, 'Il a beaucoup travaillé,', 't1') + img(640, 60, 'trophy', 64, 'i2', .2)
            + img(570, 40, 'party-popper', 48, 'i3', 0) + txt(680, 262, 'il a réussi son examen.', 't2', .2, 'end') + post(486, 70, 'arrive') + word(290, 250, 'donc', SIGNS.arrive.c),
        cars: [{ id: 'car1', path: 'p1', frames: [[0, 0], [2.0, .7], [2.8, .7], [4.6, .97]] }],
        events: [[0, 'say1'], [2.0, 'word'], [4.4, 'show2']] },
    barrier: { fr: ['', 'Si', ' le soleil brille, on va à la plage.'], en: 'If the sun is shining, we go to the beach.',
        svg: () => road('M40 190 H680', 'p1') + `<g transform="translate(380 150)"><rect x="-8" y="-6" width="16" height="70" fill="#64748b"/>
            <g id="arm"><rect x="0" y="-4" width="150" height="16" rx="5" fill="#fff" stroke="#64748b" stroke-width="2"/><path d="M14 -4h16l-10 16h-16zM54 -4h16l-10 16h-16zM94 -4h16l-10 16h-16zM134 -4h14v16h-24z" fill="#e11d48"/></g></g>`
            + img(300, 26, 'sun', 60, 'i1', .25) + txt(230, 110, 'Si le soleil brille,', 't1', .25, 'middle') + img(626, 120, 'beach-with-umbrella', 64, 'i2', .2) + txt(560, 110, 'on va à la plage.', 't2', .2, 'middle')
            + post(80, 70, 'barrier') + word(380, 270, 'si', SIGNS.barrier.c),
        cars: [{ id: 'car1', path: 'p1', frames: [[0, 0], [2.0, .4], [3.8, .4], [6.0, 1]] }],
        events: [[2.0, 'word'], [2.2, 'show1'], [3.0, 'arm'], [3.8, 'show2']] },
    target: { fr: ['Je parle lentement ', 'pour que', ' tu comprennes.'], en: 'I speak slowly so that you understand.',
        svg: () => road('M40 170 H560', 'p1') + `<g id="tgt" style="transform-origin:630px 170px"><circle cx="630" cy="170" r="62" fill="#fff" stroke="#c026d3" stroke-width="10"/><circle cx="630" cy="170" r="40" fill="#fae8ff" stroke="#c026d3" stroke-width="10"/><circle cx="630" cy="170" r="16" fill="#c026d3"/></g>`
            + img(60, 70, 'palace:speaking-head', 56) + txt(124, 110, 'Je parle lentement', 't1') + img(600, 30, 'light-bulb', 60, 'i2', .2) + txt(700, 274, 'tu comprennes.', 't2', .2, 'end')
            + post(420, 70, 'target') + word(330, 250, 'pour que', SIGNS.target.c),
        cars: [{ id: 'car1', path: 'p1', frames: [[0, 0], [1.9, .66], [2.8, .66], [4.4, 1]] }],
        events: [[0, 'say1'], [1.9, 'word'], [4.4, 'tgt'], [4.4, 'show2']] },
    clock: { fr: ['Je cuisine ', 'pendant que', ' tu mets la table.'], en: 'I cook while you set the table.',
        svg: () => road('M150 100 H680', 'p1') + road('M150 220 H680', 'p2') + img(160, 12, 'cooking', 50) + txt(220, 48, 'Je cuisine', 't1')
            + img(160, 236, 'fork-and-knife-with-plate', 50, 'i2', .3) + txt(220, 274, 'tu mets la table.', 't2', .3)
            + `<g transform="translate(70 160)"><circle r="46" fill="#fff" stroke="#475569" stroke-width="7"/><path d="M0 0 V-28" stroke="#475569" stroke-width="6" stroke-linecap="round"/><g id="hand"><path d="M0 0 L22 0" stroke="#e11d48" stroke-width="5" stroke-linecap="round"/></g><circle r="5" fill="#475569"/></g>`
            + word(420, 170, 'pendant que', SIGNS.clock.c),
        cars: [{ id: 'car1', path: 'p1', frames: [[0, 0], [5, 1]] }, { id: 'car2', path: 'p2', frames: [[0, 0], [5, 1]] }],
        events: [[0, 'say1'], [1.4, 'word'], [1.6, 'show2'], [0, 'hand']] },
};

function playScene(svg, S, ctx) {
    const cars = S.cars.map(c => ({ el: svg.querySelector('#' + c.id), path: svg.querySelector('#' + c.path), frames: c.frames }));
    cars.forEach(c => { c.L = c.path.getTotalLength(); });
    const put = (c, f) => {
        const l = Math.max(0, Math.min(c.L, f * c.L)), a = c.path.getPointAtLength(Math.max(0, l - 1)), b = c.path.getPointAtLength(Math.min(c.L, l + 1)), p = c.path.getPointAtLength(l);
        const deg = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;   // the road's direction (the car can reverse)
        c.el.setAttribute('transform', `translate(${p.x} ${p.y}) ` + (Math.cos(deg * Math.PI / 180) >= -0.01 ? `rotate(${deg}) scale(-1 1)` : `rotate(${deg - 180})`));
    };
    const ease = (x) => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const at = (fr, t) => { for (let i = 1; i < fr.length; i++) if (t <= fr[i][0]) { const [t0, a] = fr[i - 1], [t1, b] = fr[i]; return a + (b - a) * ease((t - t0) / Math.max(.001, t1 - t0)); } return fr[fr.length - 1][1]; };
    const set = (sel, o) => svg.querySelectorAll(sel).forEach(e => e.setAttribute('opacity', o));
    const reset = () => {
        set('#cw', 0); ['#t2', '#i2'].forEach(s => set(s, s === '#t2' && S.fr[0] === '' ? .25 : .25));
        if (svg.querySelector('#t1') && S === SCENES.barrier) { set('#t1', .25); set('#i1', .25); }
        if (S === SCENES.precise) { set('#t2', 0); const l = svg.querySelector('#lens'); l.setAttribute('opacity', 0); l.classList.remove('cl-zoom'); }
        if (S === SCENES.back) set('#ago', 0);
        if (S === SCENES.arrive) set('#i3', 0);
        const arm = svg.querySelector('#arm'); if (arm) arm.style.transform = '';
        const tg = svg.querySelector('#tgt'); if (tg) tg.classList.remove('cl-pulse');
        svg.querySelectorAll('.cl-sg').forEach(g => g.classList.remove('cl-pop'));
        cars.forEach(c => put(c, c.frames[0][1]));
    };
    const sayAll = () => ctx.speak(S.fr.join('').replace(/^\s+/, ''));
    const speak = (t) => { if (!quiet) ctx.speak(t); };
    const doEvent = (e) => {
        if (e === 'say1') speak((S.fr[0] || '').trim());
        if (e === 'word') { set('#cw', 1); svg.querySelectorAll('.cl-sg').forEach(g => g.classList.add('cl-pop')); speak(S.fr[1].replace(/'$/, 'e').trim()); }
        if (e === 'show1') { set('#t1', 1); set('#i1', 1); }
        if (e === 'show2') { set('#t2', 1); set('#i2', 1); set('#ago', 1); set('#i3', 1); speak(S.fr[2].trim()); }
        if (e === 'lens') { const l = svg.querySelector('#lens'); l.setAttribute('opacity', 1); l.classList.add('cl-zoom'); }
        if (e === 'arm') { const a = svg.querySelector('#arm'); a.style.transform = 'rotate(-75deg)'; }
        if (e === 'tgt') svg.querySelector('#tgt').classList.add('cl-pulse');
    };
    let raf = 0, timers = [], quiet = false;
    const stop = () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers = []; };
    const play = (q) => {
        stop(); reset(); quiet = !!q;
        const end = Math.max(...cars.map(c => c.frames[c.frames.length - 1][0]));
        S.events.forEach(([t, e]) => timers.push(setTimeout(() => { if (svg.isConnected) doEvent(e); }, t * 1000)));
        const hand = svg.querySelector('#hand'), t0 = performance.now();
        const step = (now) => {
            if (!svg.isConnected) return;
            const t = (now - t0) / 1000;
            cars.forEach(c => put(c, at(c.frames, Math.min(t, end))));
            if (hand) hand.setAttribute('transform', `rotate(${t * 72})`);
            if (t < end) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
    };
    reset();
    return { play, stop, sayAll };
}

function exploreSigns(body, ctx) {
    let si = 0, cur = null;
    body.innerHTML = `<p class="st-hint">Every connector is a road sign. Learn the nine signs first: when you meet a new connector, ask « which sign is it? ».</p>
        <div class="cl-signbar" role="tablist" aria-label="Signs">${ORDER.map((k, i) => `<button type="button" role="tab" data-s="${i}" title="${esc(SIGNS[k].name)}">${signSvg(k)}<span>${esc(SIGNS[k].role)}</span></button>`).join('')}</div>
        <div id="cl-sign"></div>`;
    const show = (i, voice) => {
        if (cur) cur.stop();
        si = (i + ORDER.length) % ORDER.length; const k = ORDER[si], G = SIGNS[k], S = SCENES[k];
        body.querySelectorAll('.cl-signbar button').forEach((b, j) => b.setAttribute('aria-selected', j === si));
        const box = body.querySelector('#cl-sign');
        // the buttons and the other words of the sign come first, then the road: no scrolling to drive again
        box.innerHTML = `<div class="cl-sgrid"><div class="cl-sinfo"><div class="cl-shead">${signSvg(k, 'cl-big')}<div><div class="cl-kick">Sign ${si + 1} of ${ORDER.length} · ${esc(G.role)}</div><h3>${esc(G.name)} <small>${esc(G.en)}</small></h3><p>${esc(G.what)}</p></div></div>
            <div class="st-row cl-ctrl"><button type="button" class="st-btn pri" id="cl-drive">▶ Drive again</button><button type="button" class="st-btn" id="cl-say">🔊 The sentence</button><span class="cl-nav"><button type="button" class="st-btn" id="cl-prev" aria-label="Previous sign">← ${esc(SIGNS[ORDER[(si + 8) % 9]].name)}</button><button type="button" class="st-btn" id="cl-next">Next: ${esc(SIGNS[ORDER[(si + 1) % 9]].name)} →</button></span></div>
            <div class="cl-same"><b>Same sign:</b> ${G.words.map(w => `<button type="button" class="cl-wd" data-w="${esc(w)}" style="--c:${G.c}">${esc(w)}</button>`).join('')}<div class="cl-wdet" id="cl-wdet"></div></div></div>
            <svg class="cl-road" viewBox="0 0 720 300" role="img" aria-label="${esc(S.fr.join(''))}"><defs><filter id="clsh"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity=".18"/></filter></defs>${S.svg()}${S.cars.map(c => CAR(c.id)).join('')}</svg>
            <div class="cl-stext"><div class="cl-sent">${esc(S.fr[0])}<span class="cl-c" style="background:${G.c}">${esc(S.fr[1])}</span>${esc(S.fr[2])}</div><div class="cl-en">${esc(S.en)}</div></div></div>`;
        const svg = box.querySelector('.cl-road');
        svg.querySelectorAll('.cl-car').forEach(c => c.setAttribute('filter', 'url(#clsh)'));
        cur = playScene(svg, S, ctx);
        box.querySelector('#cl-drive').addEventListener('click', () => cur.play());
        box.querySelector('#cl-say').addEventListener('click', () => cur.sayAll());
        box.querySelectorAll('.cl-wd').forEach(b => b.addEventListener('click', () => {
            const w = wordOf(b.dataset.w), d = box.querySelector('#cl-wdet');
            box.querySelectorAll('.cl-wd').forEach(x => x.setAttribute('aria-pressed', x === b));
            d.innerHTML = w ? `<div class="cl-ex">${ctx.markWord(w.ex[0], w.fr)}<small>${esc(w.ex[1])}</small></div>` : '';
            ctx.speak(w ? w.fr.replace(/…/g, ',') + '. ' + w.ex[0] : b.dataset.w);
        }));
        box.querySelector('#cl-prev').addEventListener('click', () => show(si - 1, true));
        box.querySelector('#cl-next').addEventListener('click', () => show(si + 1, true));
        // when the page opens the cars drive without the voice (no page talks before you tap); a sign you pick speaks
        if (voice) box.scrollIntoView({ block: 'start', behavior: 'smooth' });
        setTimeout(() => { if (svg.isConnected) cur.play(!voice); }, 300);
    };
    body.querySelectorAll('.cl-signbar button').forEach(b => b.addEventListener('click', () => show(Number(b.dataset.s), true)));
    show(0, false);
}

// ================= The comics =================
// start: panel 1; ends: the connector changes panel 2. over: 'no' (crossed out) or 'bar' (behind a barrier); past: an earlier moment
const COMICS = [
    { title: 'Léa a faim…', start: { face: 'lea-smile-happy-happy', props: ['shortcake'], cap: 'Léa a faim.' }, ends: [
        { w: 'donc', face: 'lea-laugh-happy-happy', props: ['shortcake', 'fork-and-knife'], cap: '… elle mange le gâteau.', fr: ['Léa a faim, ', 'donc', ' elle mange le gâteau.'], en: 'Léa is hungry, so she eats the cake.' },
        { w: 'pourtant', face: 'lea-smile-happy-raised', props: ['shortcake'], over: 'no', cap: '… elle ne mange pas le gâteau !', fr: ['Léa a faim, ', 'pourtant', ' elle ne mange pas le gâteau.'], en: 'Léa is hungry, yet she does not eat the cake.' },
        { w: 'parce que', past: true, face: 'lea-sad-wide-sad', props: ['alarm-clock', 'fork-and-knife-with-plate'], cap: 'À midi, elle n\'a pas déjeuné.', fr: ['Léa a faim ', 'parce qu\'', 'elle n\'a pas déjeuné.'], en: 'Léa is hungry because she did not have lunch.' },
        { w: 'si', start: 'Léa a faim ?', face: 'lea-agape-humble-neutral', props: ['shortcake'], over: 'bar', cap: '… alors elle mange le gâteau.', fr: ['', 'Si', ' Léa a faim, elle mange le gâteau.'], en: 'If Léa is hungry, she eats the cake.' },
    ] },
    { title: 'Il pleut…', start: { face: 'lea-smile-bow-happy', props: ['cloud-with-rain'], cap: 'Il pleut.' }, ends: [
        { w: 'donc', face: 'lea-smile-happy-happy', props: ['umbrella'], cap: '… Léa prend son parapluie.', fr: ['Il pleut, ', 'donc', ' Léa prend son parapluie.'], en: 'It is raining, so Léa takes her umbrella.' },
        { w: 'pourtant', face: 'lea-laugh-wink-happy', props: ['umbrella'], over: 'no', cap: '… Léa sort sans parapluie !', fr: ['Il pleut, ', 'pourtant', ' Léa sort sans parapluie.'], en: 'It is raining, yet Léa goes out without an umbrella.' },
        { w: 'de plus', face: 'lea-sad-wide-raised', props: ['cold-face'], cap: '… il fait très froid.', fr: ['Il pleut ; ', 'de plus', ', il fait très froid.'], en: 'It is raining; what\'s more, it is very cold.' },
        { w: 'quand', start: 'Il pleut…', face: 'lea-smile-happy-happy', props: ['palace:house'], cap: '… Léa reste à la maison.', fr: ['', 'Quand', ' il pleut, Léa reste à la maison.'], en: 'When it rains, Léa stays at home.' },
    ] },
    { title: 'Hugo commande un café…', start: { face: 'hugo-smile-happy-happy', props: ['hot-beverage'], cap: 'Hugo commande un café…' }, ends: [
        { w: 'et', face: 'hugo-laugh-happy-happy', props: ['hot-beverage', 'croissant'], cap: '… et un croissant.', fr: ['Hugo commande un café ', 'et', ' un croissant.'], en: 'Hugo orders a coffee and a croissant.' },
        { w: 'ou', face: 'hugo-smile-bow-raised', props: ['hot-beverage', 'teacup-without-handle'], cap: 'Un café… ou un thé ?', fr: ['Hugo veut un café ', 'ou', ' un thé ?'], en: 'Does Hugo want a coffee or a tea?' },
        { w: 'c\'est-à-dire', face: 'hugo-smile-happy-happy', props: ['hot-beverage'], zoom: true, cap: '… un petit café très fort.', fr: ['Hugo commande un expresso, ', 'c\'est-à-dire', ' un petit café très fort.'], en: 'Hugo orders an espresso, that is to say a small, very strong coffee.' },
        { w: 'mais', face: 'hugo-sad-humble-raised', props: ['money-with-wings'], over: 'no', cap: '… il n\'a pas d\'argent !', fr: ['Hugo commande un café, ', 'mais', ' il n\'a pas d\'argent.'], en: 'Hugo orders a coffee, but he has no money.' },
    ] },
    { title: 'Le téléphone sonne…', start: { face: 'lea-smile-happy-happy', props: ['telephone-receiver'], cap: 'Le téléphone sonne…' }, ends: [
        { w: 'pendant que', face: 'lea-agape-humble-neutral', props: ['cooking'], cap: '… Léa fait la cuisine.', fr: ['Le téléphone sonne ', 'pendant que', ' Léa fait la cuisine.'], en: 'The phone rings while Léa is cooking.' },
        { w: 'dès que', face: 'lea-smile-happy-happy', props: ['palace:door'], cap: '… Léa rentre.', fr: ['Le téléphone sonne ', 'dès que', ' Léa rentre.'], en: 'The phone rings as soon as Léa gets home.' },
        { w: 'au moment où', face: 'lea-sad-wide-raised', props: ['shower'], cap: '… Léa prend sa douche !', fr: ['Le téléphone sonne ', 'au moment où', ' Léa prend sa douche.'], en: 'The phone rings just as Léa is having a shower.' },
        { w: 'avant que', face: 'lea-smile-bow-happy', props: ['palace:door'], cap: '… Léa parte.', fr: ['Le téléphone sonne ', 'avant que', ' Léa parte.'], en: 'The phone rings before Léa leaves.' },
    ] },
    { title: 'Hugo parle lentement…', start: { face: 'hugo-smile-happy-happy', props: ['palace:speaking-head'], cap: 'Hugo parle lentement…' }, ends: [
        { w: 'pour que', face: 'lea-laugh-happy-happy', props: ['light-bulb'], cap: '… Léa comprenne.', fr: ['Hugo parle lentement ', 'pour que', ' Léa comprenne.'], en: 'Hugo speaks slowly so that Léa understands.' },
        { w: 'parce que', past: true, face: 'hugo-sad-humble-raised', props: ['bed'], cap: 'Il est très fatigué.', fr: ['Hugo parle lentement ', 'parce qu\'', 'il est très fatigué.'], en: 'Hugo speaks slowly because he is very tired.' },
        { w: 'donc', face: 'lea-laugh-happy-happy', props: ['thumbs-up'], cap: '… Léa comprend tout.', fr: ['Hugo parle lentement, ', 'donc', ' Léa comprend tout.'], en: 'Hugo speaks slowly, so Léa understands everything.' },
        { w: 'pourtant', face: 'lea-sad-wide-raised', props: ['thinking-face'], cap: '… Léa ne comprend rien !', fr: ['Hugo parle lentement, ', 'pourtant', ' Léa ne comprend rien.'], en: 'Hugo speaks slowly, yet Léa understands nothing.' },
    ] },
    { title: 'Un pique-nique…', start: { face: 'paul-smile-happy-happy', props: ['basket'], cap: 'On fait un pique-nique…' }, ends: [
        { w: 'si', face: 'lea-smile-happy-happy', props: ['basket'], cap: '… si Léa vient.', fr: ['On fait un pique-nique ', 'si', ' Léa vient.'], en: 'We\'ll have a picnic if Léa comes.' },
        { w: 'à condition que', face: 'paul-laugh-bow-happy', props: ['sun'], over: 'bar', cap: '… à condition qu\'il fasse beau.', fr: ['On fait un pique-nique ', 'à condition qu\'', 'il fasse beau.'], en: 'We\'ll have a picnic provided the weather is nice.' },
        { w: 'à moins que', face: 'paul-sad-humble-sad', props: ['cloud-with-rain'], over: 'no', cap: '… à moins qu\'il pleuve.', fr: ['On fait un pique-nique, ', 'à moins qu\'', 'il pleuve.'], en: 'We\'ll have a picnic, unless it rains.' },
        { w: 'même si', face: 'paul-laugh-bow-happy', props: ['cloud-with-rain', 'umbrella'], cap: '… même s\'il pleut !', fr: ['On fait un pique-nique, ', 'même s\'', 'il pleut !'], en: 'We\'ll have a picnic, even if it rains!' },
    ] },
    { title: 'Léa reste au lit…', start: { face: 'lea-sad-wide-sad', props: ['bed'], cap: 'Léa reste au lit…' }, ends: [
        { w: 'parce que', past: true, face: 'lea-sad-wide-sad', props: ['face-with-thermometer'], cap: 'Elle est malade.', fr: ['Léa reste au lit ', 'parce qu\'', 'elle est malade.'], en: 'Léa stays in bed because she is ill.' },
        { w: 'à cause de', past: true, face: 'lea-sad-wide-raised', props: ['microbe'], cap: 'La grippe !', fr: ['Léa reste au lit ', 'à cause de', ' la grippe.'], en: 'Léa stays in bed because of the flu.' },
        { w: 'donc', face: 'lea-sad-wide-raised', props: ['party-popper'], over: 'no', cap: '… elle rate la fête.', fr: ['Léa reste au lit, ', 'donc', ' elle rate la fête.'], en: 'Léa stays in bed, so she misses the party.' },
        { w: 'pourtant', face: 'lea-laugh-happy-happy', props: ['thumbs-up'], cap: '… elle se sent bien !', fr: ['Léa reste au lit, ', 'pourtant', ' elle se sent bien.'], en: 'Léa stays in bed, yet she feels fine.' },
    ] },
    { title: 'Hugo a réussi son examen…', start: { face: 'hugo-laugh-happy-happy', props: ['graduation-cap'], cap: 'Hugo a réussi son examen…' }, ends: [
        { w: 'grâce à', past: true, face: 'hugo-smile-happy-happy', props: ['books'], cap: 'Ses révisions.', fr: ['Hugo a réussi son examen ', 'grâce à', ' ses révisions.'], en: 'Hugo passed his exam thanks to his revision.' },
        { w: 'parce que', past: true, face: 'hugo-smile-bow-happy', props: ['books', 'alarm-clock'], cap: 'Il a beaucoup travaillé.', fr: ['Hugo a réussi son examen ', 'parce qu\'', 'il a beaucoup travaillé.'], en: 'Hugo passed his exam because he worked hard.' },
        { w: 'donc', face: 'hugo-laugh-wink-happy', props: ['party-popper'], cap: '… il fait la fête !', fr: ['Hugo a réussi son examen, ', 'donc', ' il fait la fête.'], en: 'Hugo passed his exam, so he is celebrating.' },
        { w: 'bien que', face: 'hugo-laugh-wink-happy', props: ['books'], over: 'no', cap: '… sans réviser !', fr: ['Hugo a réussi son examen ', 'bien qu\'', 'il n\'ait pas révisé.'], en: 'Hugo passed his exam although he did not revise.' },
    ] },
];

const panel = (p, e) => {
    const props = p.props.map((n, k) => k === 0 && (e && (e.over || e.zoom))
        ? `<span class="pw${e.zoom ? ' zoom' : ''}"><img class="prop" src="${PIC(n)}" alt="">${e.over === 'no' ? `<img class="no" src="${PIC('palace:prohibited')}" alt="no">` : e.over === 'bar' ? signSvg('barrier', 'bar') : ''}</span>`
        : `<img class="prop" src="${PIC(n)}" alt="">`).join('');
    return `<div class="scene"><img class="face" src="${FACE(p.face)}" alt="">${props}</div><div class="cap">${esc(p.cap)}</div>`;
};
function exploreComics(body, ctx) {
    let ci = 0;
    body.innerHTML = `<p class="st-hint">Each story starts the same way. Tap a connector: the second picture shows what it does to the story.</p>
        <div class="st-chips" id="cl-strips">${COMICS.map((s, i) => `<button type="button" class="st-chip" data-c="${i}">${esc(s.title)}</button>`).join('')}</div><div id="cl-comic"></div>`;
    const draw = () => {
        const S = COMICS[ci]; let cur = 0;
        body.querySelectorAll('#cl-strips .st-chip').forEach((c, i) => c.setAttribute('aria-pressed', i === ci));
        const box = body.querySelector('#cl-comic');
        box.innerHTML = `<div class="cl-strip"><div class="cl-panel" id="cl-p1"></div><div class="cl-join" aria-hidden="true">→</div><div class="cl-panel" id="cl-p2"></div></div>
            <div class="cl-pick">${S.ends.map((e, i) => { const k = signOfWord(e.w); return `<button type="button" data-i="${i}" style="--c:${SIGNS[k].c}" aria-pressed="false">${signSvg(k)}${esc(e.w)}</button>`; }).join('')}</div>
            <div class="cl-sent" id="cl-cs"></div>
            <div class="st-row"><button type="button" class="st-btn" id="cl-csay">🔊 Listen</button><button type="button" class="st-btn" id="cl-cen">Show the English</button>${ci < COMICS.length - 1 ? `<button type="button" class="st-btn pri" id="cl-cnext">Next story →</button>` : ''}</div>
            <div class="cl-en" id="cl-cent" hidden></div>`;
        const show = (i) => {
            cur = i; const e = S.ends[i], k = signOfWord(e.w);
            box.querySelectorAll('.cl-pick button').forEach((b, j) => b.setAttribute('aria-pressed', j === i));
            box.querySelector('#cl-p1').innerHTML = panel(Object.assign({}, S.start, { cap: e.start || S.start.cap }));
            const p2 = box.querySelector('#cl-p2');
            p2.className = 'cl-panel cl-in' + (e.past ? ' past' : '');
            p2.innerHTML = (e.past ? '<span class="tag">avant · earlier</span>' : '') + signSvg(k, 'badge') + panel(e, e);
            void p2.offsetWidth;
            box.querySelector('#cl-cs').innerHTML = `${esc(e.fr[0])}<span class="cl-c" style="background:${SIGNS[k].c}">${esc(e.fr[1])}</span>${esc(e.fr[2])}`;
            const en = box.querySelector('#cl-cent'); en.textContent = e.en; en.hidden = true; box.querySelector('#cl-cen').textContent = 'Show the English';
            ctx.speak(e.fr.join('').trim());
        };
        box.querySelectorAll('.cl-pick button').forEach(b => b.addEventListener('click', () => show(Number(b.dataset.i))));
        box.querySelector('#cl-csay').addEventListener('click', () => ctx.speak(S.ends[cur].fr.join('').trim()));
        box.querySelector('#cl-cen').addEventListener('click', (ev) => { const en = box.querySelector('#cl-cent'); en.hidden = !en.hidden; ev.target.textContent = en.hidden ? 'Show the English' : 'Hide the English'; });
        box.querySelector('#cl-cnext')?.addEventListener('click', () => { ci++; draw(); });
        // panel 2 waits for a choice
        box.querySelector('#cl-p1').innerHTML = panel(S.start);
        box.querySelector('#cl-p2').innerHTML = '<div class="cl-wait">?</div><div class="cap">Pick a connector below</div>';
        box.querySelector('#cl-cs').innerHTML = `${esc(S.start.cap)} …`;
    };
    body.querySelectorAll('#cl-strips .st-chip').forEach(c => c.addEventListener('click', () => { ci = Number(c.dataset.c); draw(); }));
    draw();
}

// ================= The dress code =================
const LOOKS = [
    { id: 'amis', name: 'Avec des amis', en: 'with friends · spoken', body: 't-shirt', prop: 'hot-beverage', bg: '#fef3c7' },
    { id: 'travail', name: 'Au travail', en: 'at work · emails, meetings', body: 'necktie', prop: 'laptop', bg: '#e0f2fe' },
    { id: 'ecrit', name: 'À l\'écrit', en: 'formal · TCF / TEF essays, letters', body: 'coat', prop: 'envelope', hat: true, bg: '#ede9fe' },
];
// [word, sentence, English] for each look
const DRESS = [
    { en: 'but', role: 'Opposer', w: [['mais', 'C\'est cher, mais c\'est super bon !', 'It\'s pricey, but it\'s really good!'], ['cependant', 'Ce restaurant est cher ; cependant, la cuisine est excellente.', 'This restaurant is expensive; however, the food is excellent.'], ['néanmoins', 'Ce projet représente un coût important ; néanmoins, ses bénéfices sont indéniables.', 'This project is costly; nevertheless, its benefits are undeniable.']] },
    { en: 'so', role: 'Conclure', w: [['alors', 'Il pleut, alors on reste à la maison.', 'It\'s raining, so we\'re staying in.'], ['donc', 'Le train est en retard, donc je vais arriver plus tard.', 'The train is late, so I will arrive later.'], ['par conséquent', 'Les ventes ont baissé ; par conséquent, l\'entreprise doit réduire ses coûts.', 'Sales have fallen; consequently, the company must cut its costs.']] },
    { en: 'because', role: 'Expliquer', w: [['vu que', 'Vu qu\'il est tard, je rentre.', 'Seeing that it\'s late, I\'m heading home.'], ['parce que', 'Je suis en retard parce que mon bus n\'est pas passé.', 'I\'m late because my bus didn\'t come.'], ['étant donné que', 'Étant donné que le nombre de places est limité, l\'inscription est obligatoire.', 'Given that places are limited, registration is required.']] },
    { en: 'and, what\'s more', role: 'Ajouter', w: [['et', 'Il est sympa, et il cuisine super bien !', 'He\'s nice, and he cooks really well!'], ['de plus', 'L\'appartement est grand ; de plus, il est près du métro.', 'The flat is big; what\'s more, it\'s near the metro.'], ['en outre', 'Cette mesure est coûteuse ; en outre, son efficacité reste à démontrer.', 'This measure is costly; furthermore, its effectiveness has yet to be shown.']] },
    { en: 'although', role: 'Opposer', w: [['même si', 'Je viens, même si je suis crevé.', 'I\'m coming, even if I\'m shattered.'], ['bien que', 'Bien qu\'il soit malade, il est venu à la réunion.', 'Although he is ill, he came to the meeting.'], ['quoique', 'Quoiqu\'elle soit reconnue, cette méthode reste discutable.', 'Although it is recognised, this method remains debatable.']] },
    { en: 'in case', role: 'Condition', w: [['au cas où', 'Prends un parapluie, au cas où !', 'Take an umbrella, just in case!'], ['dans le cas où', 'Dans le cas où vous seriez absent, prévenez-nous.', 'Should you be absent, let us know.'], ['dans l\'hypothèse où', 'Dans l\'hypothèse où le projet serait refusé, une autre solution serait étudiée.', 'In the event that the project were rejected, another solution would be considered.']] },
    { en: 'because of', role: 'Expliquer', w: [['à cause de', 'On a raté le train à cause des bouchons.', 'We missed the train because of the traffic jams.'], ['en raison de', 'Le magasin est fermé en raison de travaux.', 'The shop is closed due to building work.'], ['par suite de', 'Par suite d\'une erreur technique, le service a été interrompu.', 'As a result of a technical error, the service was interrupted.']] },
    { en: 'to sum up', role: 'Conclure', w: [['en résumé', 'En résumé, c\'était une super soirée !', 'In short, it was a great evening!'], ['en conclusion', 'En conclusion, ce voyage nous a beaucoup appris.', 'In conclusion, this trip taught us a lot.'], ['en définitive', 'En définitive, les avantages l\'emportent sur les inconvénients.', 'In the end, the advantages outweigh the disadvantages.']] },
];
const mark = (s, w, markWord) => markWord(s, w);
function exploreDress(body, ctx) {
    let di = 0, li = 0;
    body.innerHTML = `<p class="st-hint">The same idea dresses differently: a T-shirt with friends, a tie at work, a smart coat and hat in writing. Pick a meaning, then change Léa's clothes.</p>
        <div class="st-chips" id="cl-dsets">${DRESS.map((d, i) => `<button type="button" class="st-chip" data-d="${i}">« ${esc(d.en)} »</button>`).join('')}</div>
        <div class="cl-looks" role="tablist">${LOOKS.map((L, i) => `<button type="button" role="tab" data-l="${i}"><img src="${PIC(L.body)}" alt=""><b>${esc(L.name)}</b><small>${esc(L.en)}</small></button>`).join('')}</div>
        <div class="cl-dress" id="cl-dress"></div>
        <div class="cl-ladder" id="cl-dlad"></div>
        <div class="st-row"><button type="button" class="st-btn pri" id="cl-dall">▶ Play all three</button><button type="button" class="st-btn" id="cl-dnext">Next meaning →</button></div>`;
    let timers = [];
    const draw = (speakIt) => {
        const D = DRESS[di], L = LOOKS[li], [w, s, en] = D.w[li];
        body.querySelectorAll('#cl-dsets .st-chip').forEach((c, i) => c.setAttribute('aria-pressed', i === di));
        body.querySelectorAll('.cl-looks button').forEach((b, i) => b.setAttribute('aria-selected', i === li));
        body.querySelector('#cl-dress').innerHTML = `<div class="cl-stage cl-in" style="background:${L.bg}">
            <div class="cl-who">${L.hat ? `<img class="hat" src="${PIC('top-hat')}" alt="">` : ''}<img class="head" src="${FACE('lea-smile-happy-happy')}" alt="Léa"><img class="body" src="${PIC(L.body)}" alt=""></div>
            <img class="cl-prop" src="${PIC(L.prop)}" alt="">
            <div class="cl-bubble"><div class="cl-where">${esc(L.name)}</div><div class="cl-bs">${ctx.markWord(s, w)}</div><small>${esc(en)}</small></div></div>`;
        body.querySelector('#cl-dlad').innerHTML = D.w.map(([x], i) => `${i ? '<span class="cl-arr">→</span>' : ''}<button type="button" data-l="${i}" class="cl-lw${i === li ? ' on' : ''}"><img src="${PIC(LOOKS[i].body)}" alt="">${esc(x)}</button>`).join('');
        body.querySelectorAll('#cl-dlad button').forEach(b => b.addEventListener('click', () => { stop(); li = Number(b.dataset.l); draw(true); }));
        if (speakIt) ctx.speak(s);
    };
    const stop = () => { timers.forEach(clearTimeout); timers = []; };
    body.querySelectorAll('#cl-dsets .st-chip').forEach(c => c.addEventListener('click', () => { stop(); di = Number(c.dataset.d); li = 0; draw(true); }));
    body.querySelectorAll('.cl-looks button').forEach(b => b.addEventListener('click', () => { stop(); li = Number(b.dataset.l); draw(true); }));
    body.querySelector('#cl-dall').addEventListener('click', () => { stop(); [0, 1, 2].forEach((l, k) => timers.push(setTimeout(() => { if (body.isConnected && body.querySelector('#cl-dress')) { li = l; draw(true); } }, k * 4200))); });
    body.querySelector('#cl-dnext').addEventListener('click', () => { stop(); di = (di + 1) % DRESS.length; li = 0; draw(true); });
    draw(false);
}

// ================= The doors =================
const DOORS = {
    ind: { name: '+ indicatif', fr: 'La porte simple', en: 'the verb stays the same', c: '#0369a1' },
    subj: { name: '+ subjonctif', fr: 'La porte magique', en: 'the verb changes', c: '#e11d48' },
    cond: { name: '+ conditionnel', fr: 'La porte « peut-être »', en: 'the verb goes into the conditionnel', c: '#7c3aed' },
    nom: { name: '+ nom', fr: 'La porte nom', en: 'no verb: a noun', c: '#d97706' },
};
// each connector with « il pleut »: [connector, door, the sentence before, what comes out, after]
const THROUGH = [
    ['même si', 'ind', 'On sort ', 'même s\'il pleut', '.'], ['parce que', 'ind', 'On reste à la maison ', 'parce qu\'il pleut', '.'], ['quand', 'ind', 'On reste à la maison ', 'quand il pleut', '.'],
    ['pendant que', 'ind', 'On lit ', 'pendant qu\'il pleut', '.'], ['puisque', 'ind', '', 'Puisqu\'il pleut', ', on reste à la maison.'],
    ['bien que', 'subj', 'On sort ', 'bien qu\'il pleuve', '.'], ['avant que', 'subj', 'Rentrons ', 'avant qu\'il pleuve', '.'], ['à moins que', 'subj', 'On sort, ', 'à moins qu\'il pleuve', '.'],
    ['pour que', 'subj', 'Le jardinier prie ', 'pour qu\'il pleuve', '.'], ['quoique', 'subj', 'On sort, ', 'quoiqu\'il pleuve', '.'],
    ['au cas où', 'cond', 'Prends un parapluie ', 'au cas où il pleuvrait', '.'], ['dans le cas où', 'cond', '', 'Dans le cas où il pleuvrait', ', le concert serait annulé.'],
    ['malgré', 'nom', 'On sort ', 'malgré la pluie', '.'], ['à cause de', 'nom', 'Le match est annulé ', 'à cause de la pluie', '.'], ['en raison de', 'nom', 'Le concert est annulé ', 'en raison de la pluie', '.'],
    ['grâce à', 'nom', '', 'Grâce à la pluie', ', le jardin est tout vert.'],
];
const FORM = { ind: 'il pleut', subj: 'il pleuve', cond: 'il pleuvrait', nom: 'la pluie' };
const RULES = [
    ['subj', 'After a goal, a condition, « although » or « before »: pour que, à condition que, bien que, avant que.'],
    ['ind', 'After a fact: parce que, quand, même si, après que. (Même si + indicatif, bien que + subjonctif!)'],
    ['cond', 'After « in case »: au cas où, dans le cas où. (Never after si: s\'il pleut.)'],
    ['nom', 'Malgré, grâce à, à cause de, en raison de: no verb, a noun (la pluie, sa maladie).'],
];
function exploreDoors(body, ctx) {
    body.innerHTML = `<p class="st-hint">Watch « il pleut » walk through each connector's door. Some doors let it through unchanged; the magic door changes the verb; the noun door turns it into « la pluie ».</p>
        <div class="cl-doors">${Object.entries(DOORS).map(([k, D]) => `<div class="cl-door" data-door="${k}" style="--c:${D.c}"><div class="frame"><div class="leaf"></div></div><b>${esc(D.name)}</b><small>${esc(D.en)}</small><div class="got"></div></div>`).join('')}</div>
        <div class="cl-walk" id="cl-walk"><span class="cl-card" id="cl-card">il pleut</span></div>
        <div class="cl-sent" id="cl-dsent">Tap a connector below.</div>
        <div class="st-chips" id="cl-cons">${shuffle(THROUGH).map(t => `<button type="button" class="st-chip" data-c="${esc(t[0])}">${esc(t[0])}</button>`).join('')}</div>
        <ul class="cl-rules">${RULES.map(([k, r]) => `<li style="--c:${DOORS[k].c}"><b>${esc(DOORS[k].name)}</b> ${esc(r)}</li>`).join('')}</ul>
        <div class="st-row"><button type="button" class="st-btn pri" id="cl-game">Your turn: which door? →</button></div><div id="cl-gbox"></div>`;
    let busy = false;
    body.querySelectorAll('#cl-cons .st-chip').forEach(c => c.addEventListener('click', () => {
        if (busy) return; busy = true;
        const T = THROUGH.find(t => t[0] === c.dataset.c), D = DOORS[T[1]], door = body.querySelector(`.cl-door[data-door="${T[1]}"]`);
        const card = body.querySelector('#cl-card'), walk = body.querySelector('#cl-walk');
        c.setAttribute('aria-pressed', 'true');
        body.querySelectorAll('.cl-door').forEach(d => d.classList.toggle('on', d === door));
        card.className = 'cl-card'; card.textContent = 'il pleut'; card.style.setProperty('--c', D.c);
        const dr = door.getBoundingClientRect(), wr = walk.getBoundingClientRect();
        card.style.setProperty('--x', (dr.left + dr.width / 2 - wr.left) + 'px');
        void card.offsetWidth; card.classList.add('go');
        door.classList.add('open');
        setTimeout(() => {
            card.textContent = FORM[T[1]]; card.classList.add('changed', T[1]);
            body.querySelector('#cl-dsent').innerHTML = `${esc(T[2])}<span class="cl-c" style="background:${D.c}">${esc(T[3])}</span>${esc(T[4])}`
                + `<div class="cl-en">${esc(T[0])} → ${esc(D.fr)}: ${esc(D.en)}${T[1] === 'ind' ? ' (il pleut stays il pleut)' : ''}.</div>`;
            door.querySelector('.got').insertAdjacentHTML('beforeend', `<span>${esc(T[0])}</span>`);
            ctx.speak(T[2] + T[3] + T[4]);
        }, 1100);
        setTimeout(() => { door.classList.remove('open'); busy = false; }, 2000);
    }));
    body.querySelector('#cl-game').addEventListener('click', () => doorGame(body.querySelector('#cl-gbox'), ctx));
}
function doorGame(box, ctx) {
    const F = (window.CONNECTORS || {}).follows || {};
    const all = shuffle(Object.entries(F).flatMap(([k, ws]) => ws.map(w => [w, k]))).slice(0, 10);
    let i = 0, score = 0;
    const ask = () => {
        if (i >= all.length) { box.innerHTML = `<div class="st-q">${score} / ${all.length} right first time</div><div class="st-row"><button type="button" class="st-btn pri" id="cl-ga">Again</button></div>`; box.querySelector('#cl-ga').addEventListener('click', () => doorGame(box, ctx)); return; }
        const [w, k] = all[i]; let tries = 0;
        box.innerHTML = `<div class="st-small">${i + 1} / ${all.length}</div><div class="cl-gw">${esc(w)}</div><div class="cl-gdoors">${Object.entries(DOORS).map(([d, D]) => `<button type="button" data-d="${d}" style="--c:${D.c}"><b>${esc(D.name)}</b><small>${esc(FORM[d])}</small></button>`).join('')}</div><div id="cl-gfb"></div>`;
        box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        box.querySelectorAll('.cl-gdoors button').forEach(b => b.addEventListener('click', () => {
            if (b.dataset.d !== k) { tries++; b.disabled = true; b.classList.add('no'); box.querySelector('#cl-gfb').innerHTML = '<p class="st-fb no">Not that door. Try again.</p>'; return; }
            if (!tries) score++;
            box.querySelectorAll('.cl-gdoors button').forEach(x => { x.disabled = true; });
            b.classList.add('ok'); const x = wordOf(w);
            box.querySelector('#cl-gfb').innerHTML = `<p class="st-fb ok">${tries ? 'Yes.' : 'Right first time!'} ${esc(w)} ${esc(DOORS[k].name)}</p>` + (x ? `<div class="cl-ex">${ctx.markWord(x.ex[0], w)}<small>${esc(x.ex[1])}</small></div>` : '')
                + '<div class="st-row"><button type="button" class="st-btn pri" id="cl-gn">Next →</button></div>';
            box.querySelector('#cl-gn').addEventListener('click', () => { i++; ask(); });
            if (x) ctx.speak(x.ex[0]);
        }));
    };
    ask();
}

// ================= Check yourself =================
function questions(type, ctx) {
    const Q = [];
    if (type === 'signs') {
        for (const it of shuffle(C().items || []).slice(0, 10)) {
            const k = signOfRole(it.role), others = shuffle(ORDER.filter(x => x !== k)).slice(0, 3), s = ctx.joinSay(it, it.w[0]);
            Q.push({ q: `Which sign? « ${s} »`, opts: shuffle([k, ...others]).map(x => SIGNS[x].name), a: SIGNS[k].name, key: keyOf(it.w[0]), why: `${it.w[0]}: ${SIGNS[k].name} (${SIGNS[k].en}). ${SIGNS[k].what}`, say: s });
        }
    } else if (type === 'comics') {
        for (const S of shuffle(COMICS)) for (const e of shuffle(S.ends).slice(0, 2)) {
            const gap = e.fr[0] + '___' + (/'$/.test(e.fr[1]) ? ' ' : '') + e.fr[2];
            Q.push({ q: `« ${gap.trim()} »`, opts: shuffle(S.ends.map(x => x.w)), a: e.w, key: keyOf(e.w), why: `${e.fr.join('').trim()} ${e.en}`, say: e.fr.join('').trim() });
        }
        Q.splice(10);
    } else if (type === 'dress') {
        for (const D of shuffle(DRESS)) {
            const [a, b, c] = D.w, ask = Math.random() < .5;
            Q.push(ask ? { q: `In a formal letter or an essay, « ${D.en} » is…`, opts: shuffle(D.w.map(x => x[0])), a: c[0], key: keyOf(c[0]), why: `${a[0]} (friends) → ${b[0]} (work) → ${c[0]} (writing). ${c[1]}`, say: c[1] }
                : { q: `With friends, « ${c[0]} » is just…`, opts: shuffle(D.w.map(x => x[0])), a: a[0], key: keyOf(a[0]), why: `${a[0]} (friends) → ${b[0]} (work) → ${c[0]} (writing). ${a[1]}`, say: a[1] });
        }
        for (const D of shuffle(DRESS).slice(0, 2)) { const b = D.w[1]; Q.push({ q: `At work (an email), « ${D.en} » is…`, opts: shuffle(D.w.map(x => x[0])), a: b[0], key: keyOf(b[0]), why: `${D.w.map(x => x[0]).join(' → ')}. ${b[1]}`, say: b[1] }); }
    } else if (type === 'doors') {
        for (const T of shuffle(THROUGH).slice(0, 10))
            Q.push({ q: `${T[0]} + il pleut → ?`, opts: Object.values(FORM).map((f, j) => f), a: FORM[T[1]], key: keyOf(T[0]), why: `${T[2]}${T[3]}${T[4]} (${DOORS[T[1]].name})`, say: T[2] + T[3] + T[4] });
    }
    return Q;
}

const CSS = `
.cl-signbar{display:grid;grid-template-columns:repeat(9,1fr);gap:4px}
.cl-signbar button{border:2px solid transparent;background:#fff;border-radius:12px;padding:4px 2px;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;font:inherit}
.cl-signbar button svg{width:40px;height:40px}.cl-signbar button span{font-size:var(--fs-xs);font-weight:700;color:#475569}
.cl-signbar button[aria-selected="true"]{border-color:#4f46e5;background:#eef2ff}
@media(max-width:640px){.cl-signbar{grid-template-columns:repeat(5,1fr)}.cl-signbar button svg{width:34px;height:34px}}
.cl-shead{display:flex;gap:14px;align-items:center;margin-top:10px}.cl-shead .cl-big{flex:none;width:76px;height:76px}
.cl-shead h3{margin:2px 0;font-size:var(--fs-xl)}.cl-shead h3 small{font-size:var(--fs-sm);color:#64748b;font-weight:600}.cl-shead p{margin:2px 0 0;font-size:var(--fs-base);color:#334155;line-height:1.45}
.cl-kick{font-size:var(--fs-xs);font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#4f46e5}
.cl-road{width:100%;height:auto;max-height:max(240px,calc(100vh - 420px));display:block;margin-top:6px}.cl-ctrl{margin-top:10px}.cl-sgrid{display:grid;gap:8px}
@media(min-width:1024px){.cl-sgrid{grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);grid-template-areas:'info road' 'text road';column-gap:20px;align-items:start}.cl-sinfo{grid-area:info}.cl-sgrid .cl-road{grid-area:road;align-self:center}.cl-stext{grid-area:text}.cl-nav{margin-left:0}}.cl-nav{margin-left:auto;display:flex;flex-wrap:wrap;gap:8px}.cl-road text{font-family:inherit}@media(max-width:640px){.cl-road .cl-t{font-size:28px}}
.cl-sg{transform-box:fill-box;transform-origin:center}.cl-pop{animation:clpop .5s ease-out}
@keyframes clpop{0%{transform:scale(.6)}70%{transform:scale(1.18)}100%{transform:scale(1)}}
#arm{transform-box:fill-box;transform-origin:0 50%;transition:transform .8s ease-in-out}
.cl-zoom{animation:clzoom .6s cubic-bezier(.2,.9,.3,1.3)}@keyframes clzoom{from{transform:scale(.2)}to{transform:scale(1)}}
.cl-pulse{animation:clpulse .9s ease-out 2}@keyframes clpulse{0%{transform:scale(1)}40%{transform:scale(1.12)}100%{transform:scale(1)}}
.cl-sent{font-size:var(--fs-xl);line-height:1.55;font-weight:600;padding:12px 14px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;margin-top:10px;color:#0f172a}
.cl-c{color:#fff;border-radius:8px;padding:1px 8px;white-space:nowrap}
.cl-en{font-size:var(--fs-sm);color:#64748b;margin-top:6px;font-weight:400}
.cl-same{margin-top:10px;font-size:var(--fs-base);color:#334155;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.cl-wd{font:inherit;font-weight:800;font-size:var(--fs-base);color:var(--c);background:#fff;border:2px solid var(--c);border-radius:10px;padding:4px 10px;min-height:40px;cursor:pointer}
.cl-wd[aria-pressed="true"]{background:var(--c);color:#fff}.cl-wdet{flex-basis:100%}
.cl-ex{font-size:var(--fs-base);line-height:1.5;padding:8px 12px;border-left:4px solid #cbd5e1;background:#fff;border-radius:8px;margin-top:6px}.cl-ex small{display:block;font-size:var(--fs-sm);color:#64748b}
.cl-badge{width:26px;height:26px;flex:none}
.cl-strip{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:stretch;margin-top:12px}
.cl-panel{position:relative;border:3px solid #0f172a;border-radius:16px;background:#fffdf5;min-height:220px;padding:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;overflow:hidden}
.cl-panel .scene{display:flex;align-items:flex-end;justify-content:center;gap:4px}
.cl-panel .face{width:120px;height:120px}.cl-panel .prop{width:70px;height:70px}
.cl-panel .cap{font-weight:800;font-size:var(--fs-base);text-align:center;background:#fff;border:2px solid #0f172a;border-radius:10px;padding:4px 10px}
.cl-panel .badge{position:absolute;top:8px;right:8px;width:44px;height:44px}
.cl-panel.past{background:#f5efe0;filter:sepia(.35)}
.cl-panel .tag{position:absolute;top:8px;left:10px;font-size:var(--fs-xs);font-weight:900;letter-spacing:.05em;text-transform:uppercase;color:#92400e}
.cl-panel .pw{position:relative;display:inline-block}
.cl-panel .pw .no{position:absolute;inset:-6px;width:calc(100% + 12px);height:calc(100% + 12px);mix-blend-mode:multiply;opacity:.9}
.cl-panel .pw .bar{position:absolute;right:-16px;bottom:-8px;width:42px;height:42px}
.cl-panel .pw.zoom::after{content:'';position:absolute;inset:-10px;border:5px solid #0891b2;border-radius:50%}
.cl-wait{font-size:64px;font-weight:900;color:#cbd5e1}
.cl-join{display:flex;align-items:center;justify-content:center;font-size:var(--fs-3xl);color:#94a3b8;font-weight:900}
.cl-pick{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.cl-pick button{display:flex;align-items:center;gap:8px;font:inherit;font-weight:800;font-size:var(--fs-base);border:2px solid #e2e8f0;background:#fff;border-radius:14px;padding:6px 14px 6px 6px;min-height:52px;cursor:pointer}
.cl-pick button svg{width:36px;height:36px}.cl-pick button[aria-pressed="true"]{border-color:var(--c);background:color-mix(in srgb,var(--c) 10%,#fff)}
.cl-in{animation:clslide .45s cubic-bezier(.2,.8,.2,1)}@keyframes clslide{from{transform:translateX(40px) rotate(2deg);opacity:0}to{transform:none;opacity:1}}
.cl-looks{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
.cl-looks button{display:flex;flex-direction:column;align-items:center;gap:2px;border:2px solid #e2e8f0;background:#fff;border-radius:14px;padding:8px;cursor:pointer;font:inherit;text-align:center}
.cl-looks button img{width:40px;height:40px}.cl-looks button b{font-size:var(--fs-base)}.cl-looks button small{font-size:var(--fs-xs);color:#64748b;line-height:1.2}
.cl-looks button[aria-selected="true"]{border-color:#4f46e5;background:#eef2ff}
.cl-stage{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;border-radius:18px;padding:16px;margin-top:10px;position:relative;min-height:230px}
.cl-who{position:relative;width:130px;height:220px;margin-top:14px}
.cl-who .head{position:absolute;left:5px;top:20px;width:120px;height:120px;z-index:2}
.cl-who .body{position:absolute;left:15px;top:118px;width:100px;height:100px;z-index:1}
.cl-who .hat{position:absolute;left:29px;top:-26px;width:72px;height:72px;z-index:3}
.cl-prop{position:absolute;right:14px;bottom:10px;width:56px;height:56px;opacity:.9}
.cl-bubble{background:#fff;border:3px solid #0f172a;border-radius:18px;padding:12px 14px;position:relative;font-size:var(--fs-lg);line-height:1.5;font-weight:600}
.cl-bubble::before{content:'';position:absolute;left:-14px;top:40px;border:12px solid transparent;border-right-color:#0f172a;border-left:0}
.cl-bubble small{display:block;font-size:var(--fs-sm);color:#64748b;font-weight:400}.cl-where{font-size:var(--fs-xs);font-weight:900;letter-spacing:.05em;text-transform:uppercase;color:#4f46e5}
.cl-ladder{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:10px}
.cl-lw{display:flex;align-items:center;gap:6px;font:inherit;font-weight:800;font-size:var(--fs-base);border:2px solid #e2e8f0;background:#fff;border-radius:12px;padding:4px 12px 4px 4px;min-height:44px;cursor:pointer}
.cl-lw img{width:30px;height:30px}.cl-lw.on{border-color:#4f46e5;background:#eef2ff}.cl-arr{color:#94a3b8;font-weight:900}
@media(max-width:620px){.cl-strip{grid-template-columns:1fr}.cl-join{transform:rotate(90deg);font-size:var(--fs-xl)}.cl-panel{min-height:190px}.cl-panel .face{width:96px;height:96px}
 .cl-stage{grid-template-columns:1fr;justify-items:center}.cl-bubble::before{display:none}.cl-sent{font-size:var(--fs-lg)}.cl-looks button small{display:none}}
.cl-doors{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px}
.cl-door{display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px}
.cl-door .frame{width:74px;height:104px;border:6px solid var(--c);border-bottom:0;border-radius:40px 40px 0 0;background:#f8fafc;position:relative;perspective:300px;overflow:hidden}
.cl-door .leaf{position:absolute;inset:0;background:color-mix(in srgb,var(--c) 75%,#fff);border-radius:34px 34px 0 0;transform-origin:0 50%;transition:transform .6s ease}
.cl-door .leaf::after{content:'';position:absolute;right:10px;top:52%;width:8px;height:8px;border-radius:50%;background:#fff}
.cl-door.open .leaf{transform:rotateY(-80deg)}.cl-door.on .frame{box-shadow:0 0 0 4px color-mix(in srgb,var(--c) 25%,#fff)}
.cl-door[data-door="subj"] .frame::before{content:'✨';position:absolute;top:-2px;right:2px;z-index:2;font-size:var(--fs-base)}
.cl-door b{color:var(--c);font-size:var(--fs-sm)}.cl-door small{font-size:var(--fs-xs);color:#64748b;line-height:1.2}
.cl-door .got{display:flex;flex-wrap:wrap;justify-content:center;gap:3px;margin-top:2px}.cl-door .got span{font-size:var(--fs-xs);font-weight:700;background:#f1f5f9;border-radius:6px;padding:1px 5px;color:#334155}
@media(max-width:560px){.cl-doors{grid-template-columns:repeat(2,1fr)}}
.cl-walk{position:relative;height:54px;margin-top:6px;border-bottom:3px dashed #cbd5e1}
.cl-card{position:absolute;left:0;top:6px;transform:translateX(0);background:#fff;border:3px solid #0f172a;border-radius:12px;padding:6px 12px;font-weight:900;font-size:var(--fs-lg);white-space:nowrap;transition:transform 1s ease-in-out}
.cl-card.go{transform:translateX(calc(var(--x) - 50%))}
.cl-card.changed{border-color:var(--c);color:var(--c);animation:clpop .5s ease-out}
.cl-rules{margin:12px 0 0;padding:0;list-style:none;display:grid;gap:6px}
.cl-rules li{border-left:5px solid var(--c);background:#f8fafc;border-radius:8px;padding:6px 10px;font-size:var(--fs-base);color:#334155}.cl-rules li b{color:var(--c)}
.cl-gw{font-size:var(--fs-3xl);font-weight:900;text-align:center;margin:6px 0}
.cl-gdoors{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}@media(min-width:640px){.cl-gdoors{grid-template-columns:repeat(4,1fr)}}
.cl-gdoors button{display:flex;flex-direction:column;align-items:flex-start;border:2px solid var(--c);border-top-width:6px;background:#fff;border-radius:12px;padding:8px 10px;min-height:64px;cursor:pointer;font:inherit}
.cl-gdoors button b{color:var(--c)}.cl-gdoors button small{color:#64748b}.cl-gdoors button.no{opacity:.45}.cl-gdoors button.ok{background:color-mix(in srgb,var(--c) 12%,#fff)}
`;
function css() { if (!document.getElementById('cl-css')) { const s = document.createElement('style'); s.id = 'cl-css'; s.textContent = CSS; document.head.appendChild(s); } }
const EXPLORE = { signs: exploreSigns, comics: exploreComics, dress: exploreDress, doors: exploreDoors };
return {
    types: Object.keys(EXPLORE),
    explore(type, body, ctx) { css(); EXPLORE[type](body, ctx); },
    questions, badge, signOfRole, signSvg,
};
})();
