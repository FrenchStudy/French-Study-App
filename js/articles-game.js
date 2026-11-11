// articles-game.js - the « Play » part of grammar lesson 2 (articles, partitive and à / de):
// rounds of 10 sentences with a gap and 4 answers, mixed from places, countries, cities, people and articles.
// Beside the question (below it on a phone): the lesson's table, to · from in each cell; after each answer
// the cell (or note) with the rule lights up. Best score per mode is kept on this device.
// window.ArticlesGame.mount(el, { say })
(function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const options = (right, pool) => shuffle([right, ...shuffle(pool.filter(x => x !== right)).slice(0, 3)]);
const vowel = (w) => /^[aeiouyéèêâîôûh]/i.test(w);
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

// ---------- The questions: { rule, tag, before, after, a, opts, why, en } ----------
const PLACES = [
    ['cinéma', 'm', 'cinema'], ['marché', 'm', 'market'], ['parc', 'm', 'park'], ['musée', 'm', 'museum'], ['supermarché', 'm', 'supermarket'], ['bureau', 'm', 'office'], ['stade', 'm', 'stadium'], ['restaurant', 'm', 'restaurant'],
    ['banque', 'f', 'bank'], ['gare', 'f', 'station'], ['plage', 'f', 'beach'], ['pharmacie', 'f', 'pharmacy'], ['boulangerie', 'f', 'bakery'], ['poste', 'f', 'post office'], ['piscine', 'f', 'pool'], ['bibliothèque', 'f', 'library'],
    ['école', 'v', 'school'], ['hôpital', 'v', 'hospital'], ['hôtel', 'v', 'hotel'], ['aéroport', 'v', 'airport'], ['université', 'v', 'university'], ['église', 'v', 'church'],
    ['toilettes', 'p', 'toilets'], ['magasins', 'p', 'shops'], ['urgences', 'p', 'emergency room']
];
const TO = { m: 'au', f: 'à la', v: "à l'", p: 'aux' }, FROM = { m: 'du', f: 'de la', v: "de l'", p: 'des' };
const WHY_TO = { m: 'Masculine: à + le sticks → <b>au</b>.', f: 'Feminine: <b>à la</b> never changes.', v: "Starts with a vowel or h: <b>à l'</b>.", p: 'Plural: à + les sticks → <b>aux</b>.' };
const WHY_FROM = { m: 'Masculine: de + le sticks → <b>du</b>.', f: 'Feminine: <b>de la</b> never changes.', v: "Starts with a vowel or h: <b>de l'</b>.", p: 'Plural: de + les sticks → <b>des</b>.' };
function placeQ() {
    const [w, g, en] = pick(PLACES);
    if (Math.random() < 0.5) return { rule: 'place-' + g, tag: 'Place · to', before: 'Je vais ', after: ' ' + w + '.', a: TO[g], opts: options(TO[g], ['au', 'à la', "à l'", 'aux', 'à le', 'en']), why: WHY_TO[g], en: `I'm going to the ${en}.` };
    const [verb, eng] = pick([['Je reviens', "I'm coming back"], ['Je sors', "I'm leaving"], ['Elle rentre', "She's coming back"]]);
    return { rule: 'place-' + g, tag: 'Place · from', before: verb + ' ', after: ' ' + w + '.', a: FROM[g], opts: options(FROM[g], ['du', 'de la', "de l'", 'des', 'de le', 'de']), why: WHY_FROM[g], en: `${eng} from the ${en}.` };
}
const INDEF = [['fête', 'f', 'a party'], ['réunion', 'f', 'a meeting'], ['soirée', 'f', 'an evening party'], ['concert', 'm', 'a concert'], ['restaurant', 'm', 'a restaurant'], ['match', 'm', 'a match'], ['entretien', 'm', 'an interview']];
function indefQ() {
    const [w, g, en] = pick(INDEF), art = g === 'm' ? 'un' : 'une';
    if (Math.random() < 0.5) return { rule: 'place-a' + g, tag: 'Place · a (to)', before: 'Samedi, je vais ', after: ' ' + w + '.', a: 'à ' + art, opts: options('à ' + art, ['à un', 'à une', 'au', 'à la', 'en']), why: `un and une never stick → <b>à ${art}</b>.`, en: `On Saturday I'm going to ${en}.` };
    return { rule: 'place-a' + g, tag: 'Place · a (from)', before: 'Je sors ', after: ' ' + w + '.', a: "d'" + art, opts: options("d'" + art, ["d'un", "d'une", 'du', 'de la', 'de un']), why: `de loses its e before un / une → <b>d'${art}</b>.`, en: `I'm coming out of ${en}.` };
}
const COUNTRIES = [
    ['Canada', 'm', 'Canada'], ['Japon', 'm', 'Japan'], ['Brésil', 'm', 'Brazil'], ['Maroc', 'm', 'Morocco'], ['Portugal', 'm', 'Portugal'], ['Sénégal', 'm', 'Senegal'], ['Mexique', 'mx', 'Mexico'], ['Québec', 'm', 'Quebec (the province)'],
    ['France', 'f', 'France'], ['Inde', 'f', 'India'], ['Italie', 'f', 'Italy'], ['Espagne', 'f', 'Spain'], ['Chine', 'f', 'China'], ['Belgique', 'f', 'Belgium'], ['Suisse', 'f', 'Switzerland'], ['Allemagne', 'f', 'Germany'],
    ['Iran', 'mv', 'Iran'], ['Afghanistan', 'mv', 'Afghanistan'], ['Ontario', 'mv', 'Ontario'],
    ['États-Unis', 'p', 'the United States'], ['Pays-Bas', 'p', 'the Netherlands'], ['Philippines', 'p', 'the Philippines']
];
function countryQ() {
    const [w, g, en] = pick(COUNTRIES), rule = 'country-' + (g === 'mx' ? 'm' : g);
    if (Math.random() < 0.5) {
        const a = g === 'p' ? 'aux' : (g === 'f' || g === 'mv') ? 'en' : 'au';
        const why = g === 'p' ? 'Plural country: <b>aux</b>.' : g === 'f' ? 'Feminine country (ends in -e): <b>en</b>, with no article.' : g === 'mv' ? 'Masculine, but it starts with a vowel: <b>en</b>.' : g === 'mx' ? 'Mexique ends in -e but is <b>masculine</b>: <b>au</b>. One of the exceptions.' : 'Masculine country: <b>au</b> (à + le).';
        return { rule, tag: 'Country · to', before: pick(["J'habite ", 'Je vais ', 'Nous partons ']), after: ' ' + w + '.', a, opts: options(a, ['au', 'en', 'aux', 'à', 'à la']), why, en: `… to / in ${en}.` };
    }
    const a = g === 'p' ? 'des' : g === 'f' ? (vowel(w) ? "d'" : 'de') : g === 'mv' ? "d'" : 'du';
    const why = g === 'p' ? 'Plural country: <b>des</b> (de + les).' : g === 'f' ? (vowel(w) ? "Feminine and a vowel: <b>d'</b>." : 'Feminine country: <b>de</b>, with no article.') : g === 'mv' ? "Masculine with a vowel: <b>d'</b>." : g === 'mx' ? 'Mexique is masculine: <b>du</b>.' : 'Masculine country: <b>du</b> (de + le).';
    return { rule, tag: 'Country · from', before: pick(['Il vient ', 'Elle arrive ', 'Je rentre ']), after: ' ' + w + '.', a, opts: options(a, ['du', 'de', "d'", 'des', 'de la']), why, en: `… from ${en}.` };
}
const CITIES = ['Paris', 'Montréal', 'Toronto', 'Lyon', 'Delhi', 'Vancouver', 'Ottawa', 'Edmonton'];
function cityQ() {
    const w = pick(CITIES);
    if (Math.random() < 0.5) return { rule: 'city', tag: 'City · to', before: pick(['Je vais ', "J'habite ", 'Elle travaille ']), after: ' ' + w + '.', a: 'à', opts: options('à', ['à', 'en', 'au', 'à la']), why: 'A city: always <b>à</b>, with no article.', en: `… to / in ${w}.` };
    const a = vowel(w) ? "d'" : 'de';
    return { rule: 'city', tag: 'City · from', before: pick(['Je viens ', 'Il arrive ']), after: ' ' + w + '.', a, opts: options(a, ['de', "d'", 'du', 'des']), why: vowel(w) ? "A city starting with a vowel: <b>d'</b>." : 'A city: <b>de</b>, with no article.', en: `… from ${w}.` };
}
const PEOPLE = [['Marie', "Marie's"], ['le médecin', "the doctor's"], ['mes parents', "my parents'"], ['ma sœur', "my sister's"], ['le coiffeur', "the hairdresser's"]];
function personQ() {
    const [w, en] = pick(PEOPLE);
    if (Math.random() < 0.5) return { rule: 'person', tag: 'Person · to', before: 'Je vais ', after: ' ' + w + '.', a: 'chez', opts: options('chez', ['chez', 'à', 'au', 'de chez']), why: "Someone's home or shop: <b>chez</b> + the person.", en: `I'm going to ${en}.` };
    return { rule: 'person', tag: 'Person · from', before: 'Je rentre ', after: ' ' + w + '.', a: 'de chez', opts: options('de chez', ['de chez', 'de', 'chez', 'du']), why: "Coming from someone's place: <b>de chez</b>.", en: `I'm coming back from ${en}.` };
}
const ART = [
    { rule: 'def', before: "J'aime ", after: ' café.', a: 'le', pool: ['le', 'du', 'un', 'de'], why: 'Likes and dislikes take <b>le / la / les</b>.', en: 'I like coffee.' },
    { rule: 'def', before: 'Elle adore ', after: ' musique.', a: 'la', pool: ['la', 'de la', 'une', 'de'], why: 'adorer = a like: <b>la</b> musique.', en: 'She loves music.' },
    { rule: 'def', before: 'Je déteste ', after: ' épinards.', a: 'les', pool: ['les', 'des', 'de', 'du'], why: 'Dislikes take <b>les</b>: je déteste les épinards.', en: 'I hate spinach.' },
    { rule: 'indef', before: "J'ai ", after: ' sœur et deux frères.', a: 'une', pool: ['une', 'la', 'de la', 'un'], why: 'One, and new: the indefinite <b>une</b>.', en: 'I have a sister and two brothers.' },
    { rule: 'indef', before: 'Il y a ', after: ' enfants dans le parc.', a: 'des', pool: ['des', 'les', 'de', 'du'], why: 'More than one, « some »: <b>des</b>.', en: 'There are children in the park.' },
    { rule: 'part', before: 'Je bois ', after: ' café.', a: 'du', pool: ['du', 'le', 'de', 'un'], why: 'An amount you drink: partitive <b>du</b>.', en: 'I drink coffee.' },
    { rule: 'part', before: 'Je mange ', after: ' soupe.', a: 'de la', pool: ['de la', 'la', 'de', 'une'], why: 'An amount of something: <b>de la</b>.', en: 'I eat (some) soup.' },
    { rule: 'part', before: 'Il boit ', after: ' eau.', a: "de l'", pool: ["de l'", "l'", 'du', "d'"], why: "Partitive before a vowel: <b>de l'</b>.", en: 'He drinks water.' },
    { rule: 'neg', before: "Je n'ai pas ", after: ' voiture.', a: 'de', pool: ['de', 'une', 'la', 'du'], why: 'After a no, un / une / du / des become <b>de</b>.', en: "I don't have a car." },
    { rule: 'neg', before: 'Il ne boit pas ', after: ' eau.', a: "d'", pool: ["d'", "de l'", 'de', 'du'], why: "After a no: <b>de</b>, and <b>d'</b> before a vowel.", en: "He doesn't drink water." },
    { rule: 'neg', before: "Ce n'est pas ", after: " café, c'est du thé.", a: 'du', pool: ['du', 'de', 'le', 'un'], why: 'The exception: with <b>être</b> the article stays (pas du café).', en: "It isn't coffee, it's tea." },
    { rule: 'neg', before: "J'ai beaucoup ", after: ' amis.', a: "d'", pool: ["d'", 'des', 'de', 'les'], why: "After a quantity: <b>de / d'</b>.", en: 'I have a lot of friends.' },
    { rule: 'neg', before: 'Un verre ', after: " eau, s'il vous plaît.", a: "d'", pool: ["d'", "de l'", 'du', 'de'], why: "After a quantity (un verre): <b>d'</b>.", en: 'A glass of water, please.' },
    { rule: 'place-m', before: 'Je pense ', after: ' voyage.', a: 'au', pool: ['au', 'à le', 'du', 'à'], why: 'penser à + le voyage: à + le sticks → <b>au</b>.', en: "I'm thinking about the trip." },
    { rule: 'place-m', before: 'Il parle ', after: ' film.', a: 'du', pool: ['du', 'de le', 'au', 'de'], why: 'parler de + le film: de + le sticks → <b>du</b>.', en: "He's talking about the film." },
    { rule: 'place-p', before: 'Elle parle ', after: ' enfants.', a: 'aux', pool: ['aux', 'à les', 'des', 'au'], why: 'parler à + les enfants → <b>aux</b>.', en: "She's talking to the children." }
];
const articleQ = () => { const x = pick(ART); return { ...x, tag: 'Articles', opts: options(x.a, x.pool) }; };
const MODES = [
    { id: 'mix', label: 'Mix', make: [placeQ, placeQ, indefQ, countryQ, countryQ, cityQ, personQ, articleQ, articleQ, articleQ] },
    { id: 'places', label: 'Places', make: [placeQ, placeQ, placeQ, indefQ] },
    { id: 'countries', label: 'Countries, cities, people', make: [countryQ, countryQ, countryQ, cityQ, personQ] },
    { id: 'articles', label: 'le, un, du, de', make: [articleQ] }
];

// ---------- The table (to on top, from in grey) ----------
const cell = (key, to, from) => `<td${key ? ` data-rule="${key}"` : ''}><span class="ag-to">${to}</span>${from ? `<span class="ag-fr">${from}</span>` : ''}</td>`;
const st = (w) => `<b class="ag-st">${w}</b>`;
const TABLE = `<table class="ag-t">
    <thead><tr><th></th><th>Masc.</th><th>Fem.</th><th>Vowel</th><th>Plural</th></tr></thead>
    <tbody>
    <tr class="ag-g"><th colspan="5">Noun</th></tr>
    <tr><th>Definite (the)</th>${cell('def', 'le')}${cell('def', 'la')}${cell('def', "l'")}${cell('def', 'les')}</tr>
    <tr><th>Indefinite (a)</th>${cell('indef', 'un')}${cell('indef', 'une')}${cell('indef', 'un / une')}${cell('indef', 'des')}</tr>
    <tr><th>Partitive</th>${cell('part', 'du')}${cell('part', 'de la')}${cell('part', "de l'")}${cell('part', 'des')}</tr>
    <tr class="ag-g"><th colspan="5">Place</th></tr>
    <tr><th>Definite (the)</th>${cell('place-m', st('au'), st('du'))}${cell('place-f', 'à la', 'de la')}${cell('place-v', "à l'", "de l'")}${cell('place-p', st('aux'), st('des'))}</tr>
    <tr><th>Indefinite (a)</th>${cell('place-am', 'à un', "d'un")}${cell('place-af', 'à une', "d'une")}<td><span class="ag-mu">as masc. / fem.</span></td>${cell('', 'à des', 'de')}</tr>
    <tr><th>Partitive</th><td>—</td><td>—</td><td>—</td><td>—</td></tr>
    <tr class="ag-s"><th>Country</th>${cell('country-m', 'au', 'du')}${cell('country-f', 'en', "de / d'")}${cell('country-mv', 'en', "d'")}${cell('country-p', 'aux', 'des')}</tr>
    <tr class="ag-s"><th>City</th>${cell('city', 'à', "de / d'")}<td></td><td></td><td></td></tr>
    <tr class="ag-s"><th>Person</th>${cell('person', 'chez', 'de chez')}<td></td><td></td><td></td></tr>
    </tbody></table>
    <p class="ag-sm">To on top, from in grey. ${st('Pink')} = only le and les stick to à and de.</p>
    <ul class="ag-notes">
        <li data-rule="neg"><b>Becomes de:</b> after a no (pas <b>de</b> pain) and a quantity (un verre <b>d'</b>eau). Not after être: ce n'est pas <b>du</b> café.</li>
        <li data-rule="def"><b>Likes</b> take le (j'aime <b>le</b> café). <b>Amounts</b> take du (je bois <b>du</b> café).</li>
    </ul>`;

const CSS = `
.ag{display:grid;gap:14px}
@media(min-width:900px){.ag{grid-template-columns:minmax(0,1.2fr) minmax(330px,1fr);align-items:start}.ag-rules{position:sticky;top:12px}}
.ag-play{display:grid;gap:12px;min-width:0}
.ag-modes{display:flex;flex-wrap:wrap;gap:6px}
.ag-mode{border:1px solid #e2e8f0;background:#fff;border-radius:999px;padding:6px 12px;min-height:40px;font:inherit;font-size:var(--fs-sm);font-weight:800;color:#0f172a;cursor:pointer}
.ag-mode[aria-pressed="true"]{background:#4f46e5;border-color:#4f46e5;color:#fff}
.ag-bar{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:var(--fs-sm);color:#64748b}.ag-bar b{color:#0f172a}
.ag-card{border:1px solid #e2e8f0;border-radius:14px;padding:14px;display:grid;gap:12px;background:#fff}
.ag-tag{justify-self:start;font-size:var(--fs-xs);font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#4338ca;background:#eef2ff;padding:2px 8px;border-radius:6px}
.ag-q{font-size:var(--fs-xl);font-weight:800;color:#0f172a;line-height:1.4;margin:0}
.ag-gap{display:inline-block;min-width:3em;border-bottom:3px solid #4f46e5;text-align:center;color:#4338ca;padding:0 4px}
.ag-gap.ok{color:#047857;border-color:#059669}.ag-gap.no{color:#be123c;border-color:#e11d48}
.ag-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.ag-b{border:1px solid #e2e8f0;background:#fff;border-radius:12px;min-height:48px;font:inherit;font-size:var(--fs-lg);font-weight:800;color:#0f172a;cursor:pointer}
.ag-b:hover:not(:disabled){border-color:#a5b4fc}.ag-b.ok{background:#ecfdf5;border-color:#059669;color:#065f46}.ag-b.no{background:#fff1f2;border-color:#e11d48;color:#9f1239}
.ag-fb{border-radius:10px;padding:10px 12px;display:grid;gap:4px;font-size:var(--fs-base)}
.ag-fb.ok{background:#ecfdf5;color:#065f46}.ag-fb.no{background:#fff1f2;color:#9f1239}.ag-fb .en{color:#64748b;font-size:var(--fs-sm)}
.ag-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.ag-act{border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:8px 14px;min-height:44px;font:inherit;font-size:var(--fs-base);font-weight:800;color:#0f172a;cursor:pointer}
.ag-act.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.ag-rules{border:1px solid #e2e8f0;border-radius:14px;padding:12px;background:#fff;display:grid;gap:8px;min-width:0;overflow-x:auto}
.ag-t{width:100%;border-collapse:collapse;table-layout:fixed;font-size:var(--fs-sm);line-height:1.25;min-width:300px}
.ag-t th,.ag-t td{text-align:left;padding:3px 6px;border-bottom:1px solid #f1f5f9;vertical-align:top}
.ag-t thead th{font-size:var(--fs-xs);color:#64748b;font-weight:700}.ag-t thead th:first-child{width:30%}
.ag-t tbody th{font-weight:500;color:#64748b}.ag-t td{font-weight:800;color:#0f172a}
.ag-t .ag-g th{font-weight:800;color:#0f172a;padding-top:8px}
.ag-t .ag-s th{font-weight:800;color:#0f172a}.ag-t .ag-s th,.ag-t .ag-s td{border-top:1px solid #e2e8f0}
.ag-to,.ag-fr{display:block}.ag-fr{color:#64748b}.ag-mu{color:#64748b;font-weight:500;font-size:var(--fs-xs)}
.ag-st{background:#ec4899;color:#fff;border-radius:5px;padding:0 5px}
.ag-sm{margin:0;font-size:var(--fs-xs);color:#64748b}
.ag-notes{margin:0;padding-left:1.1em;list-style:disc;display:grid;gap:4px;font-size:var(--fs-sm);color:#334155}
.ag-hl{background:#eef2ff;box-shadow:inset 0 0 0 2px #4f46e5;border-radius:6px}
.ag-rev{display:grid;gap:6px}.ag-rev div{border:1px solid #e2e8f0;border-radius:10px;padding:8px 10px;font-size:var(--fs-sm);color:#334155}
`;

function mount(root, { say } = {}) {
    if (!document.getElementById('ag-css')) { const s = document.createElement('style'); s.id = 'ag-css'; s.textContent = CSS; document.head.appendChild(s); }
    root.innerHTML = `<div class="ag"><div class="ag-play"><div class="ag-modes" role="group" aria-label="What to practise"></div><div class="ag-bar" aria-live="polite"></div><div class="ag-card" aria-live="polite"></div></div><div class="ag-rules">${TABLE}</div></div>`;
    const $ = (sel) => root.querySelector(sel);
    let mode = store.get('ag-mode', 'mix'); if (!MODES.find(m => m.id === mode)) mode = 'mix';
    let round = [], i = 0, score = 0, streak = 0, answered = false, results = [];
    const lit = (key) => { root.querySelectorAll('.ag-hl').forEach(el => el.classList.remove('ag-hl')); if (key) root.querySelectorAll(`[data-rule="${key}"]`).forEach(el => el.classList.add('ag-hl')); };
    const sentence = (q, fill, cls) => `${esc(q.before)}<span class="ag-gap ${cls || ''}">${fill ? esc(fill) : '&nbsp;'}</span>${esc(q.after)}`;
    const full = (q) => (q.before + q.a + q.after).replace(/' /g, "'").replace(/ +/g, ' ');
    function modes() {
        $('.ag-modes').innerHTML = MODES.map(m => `<button type="button" class="ag-mode" data-m="${m.id}" aria-pressed="${m.id === mode}">${m.label}</button>`).join('');
        root.querySelectorAll('.ag-mode').forEach(b => b.addEventListener('click', () => { mode = b.dataset.m; store.set('ag-mode', mode); modes(); start(); }));
    }
    function bar() { $('.ag-bar').innerHTML = `<span>Question <b>${Math.min(i + 1, round.length)}</b> / ${round.length}</span><span>Score <b>${score}</b></span><span>Streak <b>${streak}</b></span><span>Best <b>${store.get('ag-best-' + mode, 0)}</b> / 10</span>`; }
    function start() {
        const m = MODES.find(x => x.id === mode), seen = new Set();
        round = []; let guard = 0;
        while (round.length < 10 && guard++ < 300) { const q = m.make[Math.floor(Math.random() * m.make.length)](); const k = q.before + q.after; if (!seen.has(k)) { seen.add(k); round.push(q); } }
        i = 0; score = 0; streak = 0; results = []; ask();
    }
    function ask() {
        bar(); lit(null);
        if (i >= round.length) return end();
        const q = round[i]; answered = false;
        $('.ag-card').innerHTML = `<span class="ag-tag">${esc(q.tag)}</span><p class="ag-q" lang="fr">${sentence(q)}</p>
            <div class="ag-opts">${q.opts.map((o, k) => `<button type="button" class="ag-b" data-k="${k}" lang="fr">${esc(o)}</button>`).join('')}</div><div class="ag-after"></div>`;
        root.querySelectorAll('.ag-b').forEach(b => b.addEventListener('click', () => choose(Number(b.dataset.k))));
    }
    function choose(k) {
        if (answered) return; answered = true;
        const q = round[i], picked = q.opts[k], ok = picked === q.a;
        results.push({ q, picked, ok }); if (ok) { score++; streak++; } else streak = 0;
        root.querySelectorAll('.ag-b').forEach((b, n) => { b.disabled = true; if (q.opts[n] === q.a) b.classList.add('ok'); else if (n === k) b.classList.add('no'); });
        $('.ag-q').innerHTML = sentence(q, q.a, ok ? 'ok' : 'no');
        lit(q.rule);
        $('.ag-after').innerHTML = `<div class="ag-fb ${ok ? 'ok' : 'no'}"><b>${ok ? pick(['Bravo !', 'Exactement !', 'Parfait !']) : `Not quite: it's « ${esc(q.a)} ».`}</b><span>${q.why}</span><span class="en">${esc(q.en)}</span></div>
            <div class="ag-row" style="margin-top:10px"><button type="button" class="ag-act pri" data-next>${i === round.length - 1 ? 'See my score' : 'Next →'}</button><button type="button" class="ag-act" data-say>🔊 Hear it</button></div>`;
        $('[data-next]').addEventListener('click', () => { i++; ask(); });
        $('[data-say]').addEventListener('click', () => say && say(full(q)));
        $('[data-next]').focus({ preventScroll: true });
        bar();
    }
    function end() {
        const key = 'ag-best-' + mode; if (score > store.get(key, 0)) store.set(key, score);
        const miss = results.filter(r => !r.ok);
        $('.ag-card').innerHTML = `<span class="ag-tag">Round finished</span><p class="ag-q">${score} / 10</p>
            ${miss.length ? `<div class="ag-rev">${miss.map(r => `<div><span lang="fr">${sentence(r.q, r.q.a, 'ok')}</span><br>You chose « ${esc(r.picked)} ». ${r.q.why}</div>`).join('')}</div>` : '<p class="ag-sm">No mistakes. Try another mode.</p>'}
            <div class="ag-row"><button type="button" class="ag-act pri" data-again>Play again</button></div>`;
        $('[data-again]').addEventListener('click', start);
        bar();
    }
    modes(); start();
}
window.ArticlesGame = { mount };
})();
