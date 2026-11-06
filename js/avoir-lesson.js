// avoir-lesson.js - grammar topic « avoir / être expressions », the part to play with:
//   1 Léa's day: tap a moment; her face changes and French says j'ai soif (I have thirst) where English says « I am »;
//     switch the person (je, tu, il…) and the no (je n'ai pas…); tired, happy, late stay with être
//   2 How old? add candles to the cake: j'ai vingt-cinq ans (never « je suis 25 »)
//   3 Where does it hurt? tap a part of the body: j'ai mal à la tête, au dos (à + le = au), aux dents
// then the practice (grammar-practice.js): Choose, Build, Spot the mistake.
// window.AvoirLesson.mount(el, { say, done })
(function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const P = (n) => `media/pictures/fe-${n}.webp`;
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// [the moment, picture, verb, what comes after (feminine form for être), English]
const MOMENTS = [
    ['après le sport', 'cup-with-straw', 'avoir', 'soif', 'thirsty'],
    ['à midi', 'face-savoring-food', 'avoir', 'faim', 'hungry'],
    ['dans la neige', 'cold-face', 'avoir', 'froid', 'cold'],
    ['en plein soleil', 'hot-face', 'avoir', 'chaud', 'hot'],
    ['pendant l\'orage', 'fearful-face', 'avoir', 'peur', 'afraid'],
    ['à minuit', 'yawning-face', 'avoir', 'sommeil', 'sleepy'],
    ['après le travail', 'downcast-face-with-sweat', 'être', ['fatigué', 'fatiguée', 'fatigués'], 'tired'],
    ['le week-end', 'grinning-face', 'être', ['content', 'contente', 'contents'], 'happy'],
];
// [subject, avoir, être, the English subject, who: m / f / pl]
const PEOPLE = [['je', 'ai', 'suis', 'I', 'f'], ['tu', 'as', 'es', 'you', 'm'], ['Hugo', 'a', 'est', 'Hugo', 'm'], ['Léa', 'a', 'est', 'Léa', 'f'], ['nous', 'avons', 'sommes', 'we', 'pl'], ['vous', 'avez', 'êtes', 'you', 'pl'], ['ils', 'ont', 'sont', 'they', 'pl']];
const EN_BE = { I: 'am', you: 'are', Hugo: 'is', 'Léa': 'is', we: 'are', they: 'are' };
const EN_HAVE = { I: 'have', you: 'have', Hugo: 'has', 'Léa': 'has', we: 'have', they: 'have' };
const ARTOF = { soif: 'la', faim: 'la', froid: 'le', chaud: 'le', peur: 'la', sommeil: 'le' };
const NOUN_EN = { soif: 'thirst', faim: 'hunger', froid: 'cold', chaud: 'heat', peur: 'fear', sommeil: 'sleepiness' };
// the body: [part with its article, how « à » joins it, English]
const BODY = [['la tête', 'à la tête', 'my head'], ['le dos', 'au dos', 'my back'], ['le ventre', 'au ventre', 'my stomach'], ['la gorge', 'à la gorge', 'my throat'], ['l\'oreille', 'à l\'oreille', 'my ear'], ['les dents', 'aux dents', 'my teeth'], ['les pieds', 'aux pieds', 'my feet']];
const JOIN = { 'au dos': 'à + le dos → au dos', 'au ventre': 'à + le ventre → au ventre', 'aux dents': 'à + les dents → aux dents', 'aux pieds': 'à + les pieds → aux pieds' };

// numbers 1-99 in French words (for the cake)
const U = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const T = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante' };
function fr(n) {
    if (n <= 16) return U[n];
    if (n < 20) return 'dix-' + U[n - 10];
    if (n < 70) { const t = Math.floor(n / 10), u = n % 10; return T[t] + (u === 0 ? '' : u === 1 ? ' et un' : '-' + U[u]); }
    if (n < 80) return n === 71 ? 'soixante et onze' : 'soixante-' + fr(n - 60);
    if (n === 80) return 'quatre-vingts';
    return 'quatre-vingt-' + fr(n - 80);
}

const ITEMS = {
    choose: [
        { q: 'J\'___ faim.', en: 'I am hungry.', opts: ['ai', 'suis', 'as', 'es'], a: 'ai', why: 'Hunger, thirst, fear, age: which verb does French use?', hint: 'French says <b>j\'ai faim</b> (I have hunger).' },
        { q: 'Elle ___ dix ans.', en: 'She is ten.', opts: ['a', 'est', 'as', 'ai'], a: 'a', why: 'For age, French « has » the years.', hint: 'Age takes <b>avoir</b>: elle <b>a</b> dix ans.' },
        { q: 'Nous ___ fatigués.', en: 'We are tired.', opts: ['sommes', 'avons', 'êtes', 'ont'], a: 'sommes', why: 'Tired is an adjective, like in English.', hint: 'Tired, happy, late stay with <b>être</b>: nous <b>sommes</b> fatigués.' },
        { q: 'Tu ___ raison.', en: 'You are right.', opts: ['as', 'es', 'a', 'est'], a: 'as', why: 'Right and wrong are things you « have » in French.', hint: '<b>avoir raison</b>, <b>avoir tort</b>: tu <b>as</b> raison.' },
        { q: 'J\'ai mal ___ dos.', en: 'My back hurts.', opts: ['au', 'à le', 'à la', 'aux'], a: 'au', why: '« le dos »: what do à + le make?', hint: '<b>à + le = au</b>: j\'ai mal <b>au</b> dos.' },
        { q: 'J\'ai ___ faim.', en: 'I am very hungry.', opts: ['très', 'beaucoup', 'trop de', 'bien'], a: 'très', why: 'Which word makes faim stronger?', hint: '<b>très</b>: j\'ai très faim (not beaucoup).' },
        { q: 'Je ___ d\'accord.', en: 'I agree.', opts: ['suis', 'ai', 'fais', 'vais'], a: 'suis', why: 'This one is « to be » in French too.', hint: '<b>être d\'accord</b>: je <b>suis</b> d\'accord.' },
    ],
    build: [
        { en: 'I am not hungry.', tiles: ['Je', 'n\'ai', 'pas', 'faim.'], trap: 'suis', why: 'Hunger takes avoir, and the no goes round it.', hint: 'je <b>n\'ai pas</b> faim.' },
        { en: 'She is ten.', tiles: ['Elle', 'a', 'dix', 'ans.'], trap: 'est', why: 'Age takes avoir.', hint: 'elle <b>a</b> dix ans.' },
        { en: 'We are afraid.', tiles: ['Nous', 'avons', 'peur.'], trap: 'sommes', why: 'Fear takes avoir.', hint: 'nous <b>avons</b> peur.' },
        { en: 'My head hurts.', tiles: ['J\'ai', 'mal', 'à', 'la', 'tête.'], trap: 'ma', why: 'French says « I have pain at the head », with la, not ma.', hint: 'j\'ai mal <b>à la</b> tête.' },
        { en: 'I need a coffee.', tiles: ['J\'ai', 'besoin', 'd\'', 'un', 'café.'], trap: 'de', why: 'de before a vowel becomes d\'.', hint: 'j\'ai besoin <b>d\'</b>un café.' },
        { en: 'You are right.', tiles: ['Tu', 'as', 'raison.'], trap: 'es', why: 'Right is something you « have ».', hint: 'tu <b>as</b> raison.' },
    ],
    spot: [
        { words: ['Je', 'suis', 'faim.'], bad: 1, fix: 'ai', say: 'J\'ai faim.', hint: 'Hunger takes <b>avoir</b>: j\'ai faim.', look: 'Look at the verb.' },
        { words: ['Il', 'est', 'vingt-cinq', 'ans.'], bad: 1, fix: 'a', hint: 'Age takes <b>avoir</b>: il <b>a</b> vingt-cinq ans.', look: 'Look at the verb.' },
        { words: ['J\'ai', 'beaucoup', 'faim.'], bad: 1, fix: 'très', hint: '<b>très</b> faim, not beaucoup.', look: 'Which word makes faim stronger?' },
        { words: ['J\'ai', 'mal', 'à le', 'dos.'], bad: 2, fix: 'au', hint: '<b>à + le = au</b>.', look: 'Look at the little words before dos.' },
        { words: ['Je', 'ne suis pas', 'soif.'], bad: 1, fix: 'n\'ai pas', say: 'Je n\'ai pas soif.', hint: 'Thirst takes <b>avoir</b>: je <b>n\'ai pas</b> soif.', look: 'Look at the verb inside the no.' },
        { words: ['Nous', 'avons', 'fatigués.'], bad: 1, fix: 'sommes', hint: 'Tired stays with <b>être</b>: nous <b>sommes</b> fatigués.', look: 'Is « fatigués » a thing you have, or what you are?' },
    ],
};

const CSS = `
.av{display:grid;gap:16px}
.av-sec{display:grid;gap:10px}
.av-sec h3{margin:0;font-size:var(--fs-lg);font-weight:900;color:#0f172a}.av-sec h3 small{display:block;font-size:var(--fs-sm);font-weight:600;color:#64748b;margin-top:2px}
.av-chips{display:flex;flex-wrap:wrap;gap:6px}
.av-w{border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:6px 12px;min-height:44px;font:inherit;font-size:var(--fs-base);font-weight:800;color:#0f172a;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.av-w img{width:28px;height:28px}
.av-w[aria-pressed="true"]{background:#4f46e5;border-color:#4f46e5;color:#fff}
.av-w.sm{font-size:var(--fs-sm);min-height:40px;padding:4px 10px}
.av-stage{display:grid;grid-template-columns:120px minmax(0,1fr);gap:14px;align-items:center;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;padding:12px}
@media(max-width:520px){.av-stage{grid-template-columns:84px minmax(0,1fr)}}
.av-face{width:100%;aspect-ratio:1;object-fit:contain;transition:transform .35s}
.av-face.pop{transform:scale(1.12)}
.av-fr{font-size:var(--fs-2xl);font-weight:900;color:#0f172a;line-height:1.2}
.av-v{color:#fff;border-radius:8px;padding:0 6px}.av-v.avoir{background:#4f46e5}.av-v.etre{background:#0891b2}
.av-en{font-size:var(--fs-base);color:#475569;margin-top:4px}
.av-en s{color:#be123c}
.av-tag{display:inline-block;margin-top:6px;font-size:var(--fs-sm);font-weight:800;border-radius:999px;padding:2px 10px}
.av-tag.avoir{color:#3730a3;background:#eef2ff;border:1px solid #c7d2fe}.av-tag.etre{color:#155e75;background:#ecfeff;border:1px solid #a5f3fc}
.av-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.av-cake{display:grid;grid-template-columns:auto minmax(0,1fr);gap:14px;align-items:center;border-radius:16px;background:#fff7ed;border:1px solid #fed7aa;padding:12px}
.av-cake img{width:88px;height:88px}
.av-n{min-width:56px;text-align:center;font-size:var(--fs-2xl);font-weight:900;color:#9a3412}
.av-wrong{font-size:var(--fs-sm);color:#be123c;margin-top:4px}
.av-join{display:inline-block;margin-left:8px;font-size:var(--fs-sm);font-weight:800;color:#0891b2;background:#ecfeff;border:1px solid #a5f3fc;border-radius:999px;padding:2px 10px;vertical-align:middle}
.av-out{border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;font-size:var(--fs-xl);font-weight:800;color:#0f172a;min-height:52px}
.av-out small{display:block;font-size:var(--fs-sm);font-weight:400;color:#64748b;margin-top:2px}
.av-c{background:#4f46e5;color:#fff;border-radius:6px;padding:0 6px}`;

function mount(root, { say, done }) {
    if (!document.getElementById('av-css')) { const s = document.createElement('style'); s.id = 'av-css'; s.textContent = CSS; document.head.appendChild(s); }
    root.innerHTML = `<div class="av">
      <section class="av-sec"><h3>1 · Léa's day <small>Tap a moment. English says « I am thirsty »; French says « I have thirst ». Then change the person or make it a no.</small></h3>
        <div class="av-chips" role="group" aria-label="Moments">${MOMENTS.map((m, i) => `<button type="button" class="av-w" data-m="${i}" aria-pressed="${i === 0}"><img src="${P(m[1])}" alt="">${esc(m[0])}</button>`).join('')}</div>
        <div class="av-row"><div class="av-chips" role="group" aria-label="Person">${PEOPLE.map((p, i) => `<button type="button" class="av-w sm" data-p="${i}" aria-pressed="${i === 0}">${esc(p[0])}</button>`).join('')}</div>
          <button type="button" class="av-w sm" id="av-neg" aria-pressed="false">ne … pas</button></div>
        <div class="av-stage"><img class="av-face" id="av-face" src="${P(MOMENTS[0][1])}" alt=""><div aria-live="polite"><div class="av-fr" id="av-fr"></div><div class="av-en" id="av-en"></div><div id="av-tag"></div></div></div>
      </section>
      <section class="av-sec"><h3>2 · How old? <small>Add or take away candles. Age takes avoir: j'ai … ans.</small></h3>
        <div class="av-cake"><img src="${P('birthday-cake')}" alt=""><div><div class="av-row"><button type="button" class="av-w" id="av-minus" aria-label="One year less">−</button><span class="av-n" id="av-n">25</span><button type="button" class="av-w" id="av-plus" aria-label="One year more">+</button><button type="button" class="av-w sm" id="av-ten">+10</button></div>
          <div class="av-fr" id="av-age" aria-live="polite" style="margin-top:6px"></div><div class="av-wrong" id="av-agew"></div></div></div>
      </section>
      <section class="av-sec"><h3>3 · Where does it hurt? <small>avoir mal à + the part of the body. With le and les, à joins: au dos, aux dents.</small></h3>
        <div class="av-chips" role="group" aria-label="Body">${BODY.map((b, i) => `<button type="button" class="av-w" data-b="${i}" aria-pressed="false">${esc(b[0])}</button>`).join('')}</div>
        <div class="av-out" id="av-hurt" aria-live="polite">Où as-tu mal ? <small>Where does it hurt? Tap a part of the body.</small></div>
      </section>
    </div>`;
    const $ = (s) => root.querySelector(s);
    let mi = 0, pi = 0, neg = false;
    function draw(speak) {
        const [, pic, verb, after, en] = MOMENTS[mi], [subj, av, et, enS, who] = PEOPLE[pi];
        const v = verb === 'avoir' ? av : et;
        const word = Array.isArray(after) ? after[who === 'f' ? 1 : who === 'pl' ? 2 : 0] : after;
        const elide = /^[aeiouéêh]/i.test(v);
        const s1 = subj === 'je' && elide && !neg ? 'J\'' : subj.charAt(0).toUpperCase() + subj.slice(1) + ' ';
        const vHtml = `<span class="av-v ${verb === 'avoir' ? 'avoir' : 'etre'}">${neg ? `${elide ? 'n\'' : 'ne '}${esc(v)} pas` : esc(v)}</span>`;
        const plain = `${s1}${neg ? `${elide ? 'n\'' : 'ne '}${v} pas` : v} ${word}.`;
        $('#av-fr').innerHTML = `${esc(s1)}${vHtml} ${esc(word)}.`;
        const enNot = neg ? ' not' : '';
        $('#av-en').innerHTML = verb === 'avoir'
            ? `${esc(cap(enS))} ${EN_BE[enS]}${enNot} ${esc(en)} → in French: ${esc(enS)} <b>${EN_HAVE[enS]}</b>${neg ? ' no' : ''} ${NOUN_EN[word]}`
            : `${esc(cap(enS))} ${EN_BE[enS]}${enNot} ${esc(en)}: here French uses <b>être</b> too.`;
        $('#av-tag').innerHTML = verb === 'avoir' ? `<span class="av-tag avoir">avoir · no article: j'ai ${esc(word)}, not j'ai ${ARTOF[word]} ${esc(word)}</span>` : `<span class="av-tag etre">être · the adjective agrees: ${esc(word)}</span>`;
        const face = $('#av-face'); face.src = P(pic); face.classList.remove('pop'); void face.offsetWidth; face.classList.add('pop');
        if (speak) say(plain);
    }
    root.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { mi = Number(b.dataset.m); root.querySelectorAll('[data-m]').forEach(o => o.setAttribute('aria-pressed', o === b)); draw(true); }));
    root.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => { pi = Number(b.dataset.p); root.querySelectorAll('[data-p]').forEach(o => o.setAttribute('aria-pressed', o === b)); draw(true); }));
    $('#av-neg').addEventListener('click', (e) => { neg = !neg; e.currentTarget.setAttribute('aria-pressed', neg); draw(true); });
    draw(false);
    // the cake
    let age = 25;
    const drawAge = (speak) => {
        $('#av-n').textContent = age;
        const t = `J'ai ${fr(age)} an${age > 1 ? 's' : ''}.`;
        $('#av-age').innerHTML = `J'<span class="av-v avoir">ai</span> ${esc(fr(age))} an${age > 1 ? 's' : ''}.`;
        $('#av-agew').innerHTML = `<s>Je suis ${age}</s>: never with être.`;
        if (speak) say(t);
    };
    $('#av-plus').addEventListener('click', () => { age = Math.min(99, age + 1); drawAge(true); });
    $('#av-minus').addEventListener('click', () => { age = Math.max(1, age - 1); drawAge(true); });
    $('#av-ten').addEventListener('click', () => { age = age + 10 > 99 ? 1 : age + 10; drawAge(true); });
    drawAge(false);
    // the body
    root.querySelectorAll('[data-b]').forEach(b => b.addEventListener('click', () => {
        const [part, with_, en] = BODY[Number(b.dataset.b)];
        root.querySelectorAll('[data-b]').forEach(o => o.setAttribute('aria-pressed', o === b));
        const [, pre, rest] = with_.match(/^(à la |au |aux |à l')(.*)$/);
        const plural = part.startsWith('les ');
        $('#av-hurt').innerHTML = `J'ai mal <span class="av-c">${esc(pre.trim())}</span>${pre.endsWith("'") ? '' : ' '}${esc(rest)}.${JOIN[with_] ? `<span class="av-join">${esc(JOIN[with_])}</span>` : ''}<small>${esc(en[0].toUpperCase() + en.slice(1))} ${plural ? 'hurt' : 'hurts'}.</small>`;
        say(`J'ai mal ${with_}.`);
    }));
    // 4 practice
    const pr = document.createElement('section');
    pr.className = 'av-sec';
    pr.innerHTML = '<h3>4 · Practise <small>From easy to harder. A wrong answer gets a hint and another try.</small></h3><div></div>';
    root.querySelector('.av').appendChild(pr);
    window.GrammarPractice.mount(pr.lastElementChild, { items: ITEMS, say, done });
}
window.AvoirLesson = { mount };
})();
