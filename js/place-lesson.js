// place-lesson.js - grammar topic « Prepositions of place and il y a », the part to play with:
//   1 Where is the cat?  tap a place word; the cat moves there and the sentence changes (à côté du canapé: de + le = du)
//   2 What is in the fridge?  tap a food to put it in or take it out: il y a du lait / il n'y a pas de lait
// then the practice (grammar-practice.js): Choose, Build, Spot the mistake.
// window.PlaceLesson.mount(el, { say, done })
(function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const P = (n) => `media/pictures/fe-${n}.webp`;

// [place words, rest of the sentence, English, cat centre %, top %, width % (the cat is square: its height is 2.5 × its width in % of the room), layer]
const SPOTS = [
    ['sous', 'la table', 'under the table', 37, 57, 10, 3],
    ['sur', 'la table', 'on the table', 37, 9, 10, 3],
    ['devant', 'la table', 'in front of the table', 37, 59, 12.5, 4],
    ['derrière', 'la table', 'behind the table', 44, 55, 8, 1],
    ['entre', 'la table et le canapé', 'between the table and the sofa', 58, 62, 8, 3],
    ['à côté du', 'canapé', 'next to the sofa', 94, 59.5, 9, 3, 'de + le canapé → du canapé'],
    ['dans', 'la boîte', 'in the box', 10, 42, 8, 2],
];
// [French with its article, the food, the picture, the partitive]
const FOOD = [
    ['du lait', 'lait', 'glass-of-milk', 'du'], ['du fromage', 'fromage', 'cheese-wedge', 'du'], ['du beurre', 'beurre', 'butter', 'du'],
    ['de la salade', 'salade', 'green-salad', 'de la'], ['de l\'eau', 'eau', 'droplet', 'de l\''],
    ['des œufs', 'œufs', 'egg', 'des'], ['des pommes', 'pommes', 'red-apple', 'des'], ['des carottes', 'carottes', 'carrot', 'des'],
];
const deW = (f) => (/^[aeiouhéœ]/i.test(f[1]) ? 'd\'' : 'de ') + f[1];

const ITEMS = {
    choose: [
        { q: 'Le chat est ___ la table.', en: 'The cat is under the table.', opts: ['sous', 'sur', 'dans', 'devant'], a: 'sous', why: 'Under or on?', hint: '<b>sous</b> = under, <b>sur</b> = on.' },
        { q: 'La lampe est ___ la table.', en: 'The lamp is on the table.', opts: ['sur', 'sous', 'entre', 'chez'], a: 'sur', why: 'On or under?', hint: '<b>sur</b> = on.' },
        { q: 'La banque est à côté ___ parc.', en: 'The bank is next to the park.', opts: ['du', 'de le', 'de la', 'des'], a: 'du', why: '« parc » is masculine (le parc). What do de + le make?', hint: '« le parc »: <b>de + le = du</b>.' },
        { q: 'La poste est près ___ gare.', en: 'The post office is near the station.', opts: ['de la', 'du', 'de le', 'des'], a: 'de la', why: '« gare » is feminine (la gare). Does de + la change?', hint: '« la gare »: <b>de + la</b> does not change.' },
        { q: 'Il n\'y a pas ___ pain.', en: 'There is no bread.', opts: ['de', 'du', 'des', 'le'], a: 'de', why: 'It is a no: what do du / de la / des become after pas?', hint: 'After a no, du / de la / des become <b>de</b>.' },
        { q: 'Il y a ___ fleurs dans le jardin.', en: 'There are flowers in the garden.', opts: ['des', 'de', 'les', 'du'], a: 'des', why: 'There are several flowers, and it is not a no.', hint: 'More than one, « some »: <b>des</b>.' },
        { q: 'Je suis ___ ma sœur.', en: 'I am at my sister\'s.', opts: ['chez', 'à', 'dans', 'sur'], a: 'chez', why: "How do you say « at someone's home »?", hint: 'At someone\'s home: <b>chez</b> + the person.' },
    ],
    build: [
        { en: 'There is no milk.', tiles: ['Il', 'n\'y a', 'pas', 'de', 'lait.'], trap: 'du', why: 'It is a no: what comes after pas?', hint: 'After a no: <b>pas de</b>.' },
        { en: 'The park is next to the museum.', tiles: ['Le', 'parc', 'est', 'à côté', 'du', 'musée.'], trap: 'de le', why: 'de + le join into one word.', hint: '<b>de + le = du</b>.' },
        { en: 'I am having dinner at my parents\'.', tiles: ['Je', 'dîne', 'chez', 'mes', 'parents.'], trap: 'à la maison de', why: 'French has one little word for « at someone\'s ».', hint: 'At someone\'s home: <b>chez</b>.' },
        { en: 'There are two cats.', tiles: ['Il', 'y', 'a', 'deux', 'chats.'], trap: 'sont', why: 'il y a does not change for more than one.', hint: '<b>il y a</b> never changes, even for more than one.' },
        { en: 'The station is opposite the hotel.', tiles: ['La', 'gare', 'est', 'en face', 'de', 'l\'hôtel.'], trap: 'du', why: '« l\'hôtel » takes l\': does de + l\' change?', hint: '« l\'hôtel »: <b>de + l\'</b> does not change.' },
        { en: 'Is there a bank?', tiles: ['Est-ce', 'qu\'il', 'y', 'a', 'une', 'banque ?'], trap: 'est', why: 'The question starts with Est-ce qu\'il y a.', hint: 'Ask with <b>Est-ce qu\'il y a</b> …?' },
    ],
    spot: [
        { words: ['Il', 'n\'y a', 'pas', 'du', 'pain.'], bad: 3, fix: 'de', hint: 'After a no: <b>pas de</b>.', look: 'Look at the word after pas.' },
        { words: ['La banque', 'est', 'à côté', 'de le', 'parc.'], bad: 3, fix: 'du', hint: '<b>de + le = du</b>.', look: 'Look at the little words before parc.' },
        { words: ['Je', 'suis', 'à la maison de', 'ma sœur.'], bad: 2, fix: 'chez', hint: 'At someone\'s home: <b>chez</b>.', look: 'How do you say « at someone\'s »?' },
        { words: ['Il', 'y', 'sont', 'deux', 'chats.'], bad: 2, fix: 'a', hint: '<b>il y a</b> never changes.', look: 'il y a never changes.' },
        { words: ['J\'habite', 'près', 'du', 'gare.'], bad: 2, fix: 'de la', hint: '« la gare » is feminine: <b>de la</b> gare.', look: 'Is « gare » masculine or feminine?' },
        { words: ['Il', 'n\'y a', 'pas', 'des', 'magasins.'], bad: 3, fix: 'de', hint: 'After a no: <b>pas de</b>, even for more than one.', look: 'Look at the word after pas.' },
    ],
};

const CSS = `
.pl{display:grid;gap:16px}
.pl-sec{display:grid;gap:10px}
.pl-sec h3{margin:0;font-size:var(--fs-lg);font-weight:900;color:#0f172a}.pl-sec h3 small{display:block;font-size:var(--fs-sm);font-weight:600;color:#64748b;margin-top:2px}
.pl-words{display:flex;flex-wrap:wrap;gap:6px}
.pl-w{border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:6px 12px;min-height:44px;font:inherit;font-size:var(--fs-base);font-weight:800;color:#0f172a;cursor:pointer}
.pl-w[aria-pressed="true"]{background:#4f46e5;border-color:#4f46e5;color:#fff}
.pl-room{position:relative;width:100%;aspect-ratio:5/2;border-radius:16px;overflow:hidden;background:linear-gradient(#eef2ff 0 78%,#e7d8c6 78%)}
.pl-room img,.pl-room svg,.pl-cat{position:absolute;display:block}
.pl-table{left:20%;top:30%;width:34%;height:52%;z-index:2}
.pl-sofa{left:62%;bottom:18%;width:26%;z-index:2}
.pl-box{left:3%;bottom:18%;width:14%;height:30%}.pl-box.back{z-index:1}.pl-box.front{z-index:5}
.pl-cat{width:10%;transition:left .7s cubic-bezier(.4,0,.2,1),top .7s cubic-bezier(.4,0,.2,1),width .7s;transform:translate(-0%,0)}
.pl-out{border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;font-size:var(--fs-xl);font-weight:800;color:#0f172a;min-height:52px}
.pl-out small{display:block;font-size:var(--fs-sm);font-weight:400;color:#64748b;margin-top:2px}
.pl-c{background:#4f46e5;color:#fff;border-radius:6px;padding:0 6px}
.pl-join{display:inline-block;margin-left:8px;font-size:var(--fs-sm);font-weight:800;color:#0891b2;background:#ecfeff;border:1px solid #a5f3fc;border-radius:999px;padding:2px 10px;vertical-align:middle}
.pl-fridge{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:14px;align-items:start}@media(max-width:700px){.pl-fridge{grid-template-columns:1fr}}
.pl-frig{border:4px solid #cbd5e1;border-radius:18px;background:#f8fafc;padding:10px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;min-height:180px;align-content:start}
.pl-food{border:2px dashed transparent;background:transparent;border-radius:12px;padding:4px;cursor:pointer;font:inherit;display:grid;justify-items:center;gap:2px;font-size:var(--fs-sm);font-weight:700;color:#334155;min-height:44px}
.pl-food img{width:44px;height:44px;object-fit:contain;transition:opacity .3s,filter .3s}
.pl-food.out img{opacity:.25;filter:grayscale(1)}.pl-food.out{border-color:#cbd5e1;color:#94a3b8}
.pl-say{display:grid;gap:8px}
.pl-line{border-radius:12px;padding:8px 12px;font-size:var(--fs-lg);font-weight:700}
.pl-line.yes{background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46}.pl-line.no{background:#fff1f2;border:1px solid #fecdd3;color:#9f1239}
.pl-line small{display:block;font-size:var(--fs-sm);font-weight:400;color:#475569}
.pl-strike{text-decoration:line-through;opacity:.6;margin-right:4px}
@media (prefers-reduced-motion:reduce){.pl-cat{transition:none}}`;

// an open box: its back flaps behind the cat, its front in front, so « dans la boîte » shows the cat inside
const BOX = `<svg class="pl-box back" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M8,22 L30,2 L92,2 L82,22 Z" fill="#c08552"/></svg><svg class="pl-box front" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M82,22 L98,8 L98,84 L82,100 Z" fill="#a86b3c"/><rect x="2" y="22" width="80" height="78" fill="#d39a62"/><path d="M2,22 L-6,40 L60,40 L82,22 Z" fill="#e2ad78" opacity=".0"/><rect x="2" y="22" width="80" height="8" fill="#b7794a"/></svg>`;
const TABLE = `<svg class="pl-table" viewBox="0 0 200 140" preserveAspectRatio="none" aria-hidden="true"><rect x="6" y="6" width="188" height="16" rx="6" fill="#b45309"/><rect x="6" y="18" width="188" height="6" fill="#92400e"/><rect x="18" y="22" width="12" height="114" rx="4" fill="#92400e"/><rect x="170" y="22" width="12" height="114" rx="4" fill="#92400e"/><rect x="40" y="22" width="9" height="104" rx="4" fill="#a16207" opacity=".6"/><rect x="151" y="22" width="9" height="104" rx="4" fill="#a16207" opacity=".6"/></svg>`;

function mount(root, { say, done }) {
    if (!document.getElementById('pl-css')) { const s = document.createElement('style'); s.id = 'pl-css'; s.textContent = CSS; document.head.appendChild(s); }
    root.innerHTML = `<div class="pl">
      <section class="pl-sec"><h3>1 · Where is the cat? <small>Tap a place word: the cat goes there and you hear the sentence.</small></h3>
        <div class="pl-words" role="group" aria-label="Place words">${SPOTS.map((s, i) => `<button type="button" class="pl-w" data-s="${i}" aria-pressed="false">${esc(s[0])}</button>`).join('')}</div>
        <div class="pl-room" aria-hidden="true">${TABLE}<img class="pl-sofa" src="${P('couch-and-lamp')}" alt="">${BOX}<img class="pl-cat" src="${P('cat')}" alt="" style="left:54%;top:62%;width:8%;z-index:3"></div>
        <div class="pl-out" id="pl-out" aria-live="polite">Où est le chat ? <small>Where is the cat? Tap a word above.</small></div>
      </section>
      <section class="pl-sec"><h3>2 · What is in the fridge? <small>Tap a food to take it out or put it back. After a no, du, de la and des become <b>de</b>.</small></h3>
        <div class="pl-fridge"><div class="pl-frig" role="group" aria-label="The fridge">${FOOD.map((f, i) => `<button type="button" class="pl-food${i % 3 === 2 ? ' out' : ''}" data-f="${i}" aria-pressed="${i % 3 !== 2}"><img src="${P(f[2])}" alt="">${esc(f[1])}</button>`).join('')}</div>
        <div class="pl-say" id="pl-say" aria-live="polite"></div></div>
      </section>
    </div>`;
    const $ = (s) => root.querySelector(s);
    const cat = $('.pl-cat');
    root.querySelectorAll('.pl-w').forEach(b => b.addEventListener('click', () => {
        const [w, rest, en, x, y, size, layer, join] = SPOTS[Number(b.dataset.s)];
        root.querySelectorAll('.pl-w').forEach(o => o.setAttribute('aria-pressed', o === b));
        cat.style.left = (x - size / 2) + '%'; cat.style.top = y + '%'; cat.style.width = size + '%'; cat.style.zIndex = layer;
        const sent = `Le chat est ${w} ${rest}.`;
        $('#pl-out').innerHTML = `Le chat est <span class="pl-c">${esc(w)}</span> ${esc(rest)}.${join ? `<span class="pl-join">${esc(join)}</span>` : ''}<small>The cat is ${esc(en)}.</small>`;
        say(sent);
    }));
    // the fridge: what is in it, and what is not
    const drawFridge = () => {
        const btns = [...root.querySelectorAll('.pl-food')];
        const inn = btns.filter(b => !b.classList.contains('out')).map(b => FOOD[b.dataset.f]);
        const out = btns.filter(b => b.classList.contains('out')).map(b => FOOD[b.dataset.f]);
        const list = (a) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' et ' + a[a.length - 1];
        $('#pl-say').innerHTML = (inn.length ? `<div class="pl-line yes">Dans le frigo, il y a ${list(inn.map(f => `<b>${esc(f[0])}</b>`))}.<small>There is / there are … (il y a never changes)</small></div>` : '<div class="pl-line no">Le frigo est vide ! <small>The fridge is empty.</small></div>')
            + (out.length ? `<div class="pl-line no">Il n'y a pas ${list(out.map(f => `<span class="pl-strike">${esc(f[3])}</span><b>${esc(deW(f))}</b>`))}.<small>There is no … : du, de la, des → de</small></div>` : '');
    };
    root.querySelectorAll('.pl-food').forEach(b => b.addEventListener('click', () => {
        const f = FOOD[b.dataset.f];
        b.classList.toggle('out'); b.setAttribute('aria-pressed', !b.classList.contains('out'));
        drawFridge();
        say(b.classList.contains('out') ? `Il n'y a pas ${deW(f)}.` : `Il y a ${f[0]}.`);
    }));
    drawFridge();
    // 3 practice
    const pr = document.createElement('section');
    pr.className = 'pl-sec';
    pr.innerHTML = '<h3>3 · Practise <small>From easy to harder. A wrong answer gets a hint and another try.</small></h3><div></div>';
    root.querySelector('.pl').appendChild(pr);
    window.GrammarPractice.mount(pr.lastElementChild, { items: ITEMS, say, done });
}
window.PlaceLesson = { mount };
})();
