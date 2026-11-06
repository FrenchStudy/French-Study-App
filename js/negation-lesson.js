// negation-lesson.js - grammar topic « Basic negation: ne ... pas », the part to play with:
//   1 The sandwich: pick a sentence and tap « Make it a no »; ne and pas slide in round the verb
//     (je + aime → je n'aime: ne before a vowel becomes n'; ne before le in « je ne le vois pas »; pas after the first verb)
//   2 un, une, des, du → de: tap a card to turn it into a no (j'ai un chat → je n'ai pas de chat); le / la stay (je n'aime pas le thé)
//   3 How people say it: the ne often drops when people speak (je sais pas); write it, though
// then the practice (grammar-practice.js): Choose, Build, Spot the mistake.
// window.NegationLesson.mount(el, { say, done })
(function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// each sentence: the yes and the no as tiles [key, text, kind] (kind: v = the verb, n = ne / pas, x = a word that changes)
const SENT = [
    { label: 'Je parle français.', en: ['I speak French.', 'I don\'t speak French.'],
      yes: [['s', 'Je'], ['v', 'parle', 'v'], ['o', 'français.']],
      no: [['s', 'Je'], ['ne', 'ne', 'n'], ['v', 'parle', 'v'], ['pas', 'pas', 'n'], ['o', 'français.']], note: '<b>ne</b> before the verb, <b>pas</b> after it.' },
    { label: 'J\'aime le thé.', en: ['I like tea.', 'I don\'t like tea.'],
      yes: [['s', 'J\'', 'x'], ['v', 'aime', 'v'], ['o', 'le thé.']],
      no: [['s2', 'Je', 'x'], ['ne', 'n\'', 'n'], ['v', 'aime', 'v'], ['pas', 'pas', 'n'], ['o', 'le thé.']], note: 'Before a vowel, <b>ne</b> becomes <b>n\'</b>: je <b>n\'</b>aime. And j\' opens up again: je.' },
    { label: 'Elle est fatiguée.', en: ['She is tired.', 'She isn\'t tired.'],
      yes: [['s', 'Elle'], ['v', 'est', 'v'], ['o', 'fatiguée.']],
      no: [['s', 'Elle'], ['ne', 'n\'', 'n'], ['v', 'est', 'v'], ['pas', 'pas', 'n'], ['o', 'fatiguée.']], note: '<b>est</b> starts with a vowel: elle <b>n\'</b>est pas.' },
    { label: 'Je le vois.', en: ['I see him.', 'I don\'t see him.'],
      yes: [['s', 'Je'], ['p', 'le'], ['v', 'vois.', 'v']],
      no: [['s', 'Je'], ['ne', 'ne', 'n'], ['p', 'le'], ['v', 'vois', 'v'], ['pas', 'pas.', 'n']], note: 'A little pronoun (le, la, lui) stays glued to the verb: <b>ne</b> goes before it.' },
    { label: 'Je veux partir.', en: ['I want to leave.', 'I don\'t want to leave.'],
      yes: [['s', 'Je'], ['v', 'veux', 'v'], ['i', 'partir.']],
      no: [['s', 'Je'], ['ne', 'ne', 'n'], ['v', 'veux', 'v'], ['pas', 'pas', 'n'], ['i', 'partir.']], note: 'Two verbs: the sandwich goes round the <b>first</b> one; the second stays as it is.' },
    { label: 'Nous avons faim.', en: ['We are hungry.', 'We aren\'t hungry.'],
      yes: [['s', 'Nous'], ['v', 'avons', 'v'], ['o', 'faim.']],
      no: [['s', 'Nous'], ['ne', 'n\'', 'n'], ['v', 'avons', 'v'], ['pas', 'pas', 'n'], ['o', 'faim.']], note: 'nous <b>n\'</b>avons pas faim.' },
];
// [yes, no, English, the article that changes]
const CARDS = [
    ['J\'ai un chat.', 'Je n\'ai pas de chat.', 'a cat', 'un → de'],
    ['J\'ai une voiture.', 'Je n\'ai pas de voiture.', 'a car', 'une → de'],
    ['J\'ai des frères.', 'Je n\'ai pas de frères.', 'brothers', 'des → de'],
    ['Il y a du pain.', 'Il n\'y a pas de pain.', 'bread', 'du → de'],
    ['J\'ai de l\'argent.', 'Je n\'ai pas d\'argent.', 'money', 'de l\' → d\''],
    ['J\'aime le thé.', 'Je n\'aime pas le thé.', 'tea, with aimer', 'le stays'],
];
const SPOKEN = [['Je ne sais pas.', 'Je sais pas.', 'I don\'t know.'], ['Ce n\'est pas grave.', 'C\'est pas grave.', 'It doesn\'t matter.'], ['Je n\'aime pas ça.', 'J\'aime pas ça.', 'I don\'t like that.']];

const ITEMS = {
    choose: [
        { q: 'Je ___ parle pas anglais.', en: 'I don\'t speak English.', opts: ['ne', 'n\'', 'pas', 'non'], a: 'ne', why: 'What goes before the verb in a no?', hint: '<b>ne</b> before the verb, pas after it.' },
        { q: 'Elle ___aime pas le café.', en: 'She doesn\'t like coffee.', opts: ['n\'', 'ne', 'pas', 'non'], a: 'n\'', why: '« aime » starts with a vowel.', hint: 'Before a vowel: <b>n\'</b>aime.' },
        { q: 'Il n\'a pas ___ voiture.', en: 'He has no car.', opts: ['de', 'une', 'la', 'des'], a: 'de', why: 'What does une become after pas?', hint: 'After pas, un / une / des become <b>de</b>.' },
        { q: 'Je n\'aime pas ___ thé.', en: 'I don\'t like tea.', opts: ['le', 'de', 'du', 'un'], a: 'le', why: 'Liking or not liking: does le change?', hint: 'With aimer, <b>le</b> stays: je n\'aime pas le thé.' },
        { q: 'Je ne veux pas ___.', en: 'I don\'t want to leave.', opts: ['partir', 'pars', 'part', 'partons'], a: 'partir', why: 'After veux, which form does the second verb take?', hint: 'The second verb stays as it is: <b>partir</b>.' },
        { q: 'Il n\'y a pas ___ argent.', en: 'There is no money.', opts: ['d\'', 'de', 'de l\'', 'des'], a: 'd\'', why: 'de before a vowel…', hint: '<b>d\'</b>argent: de before a vowel.' },
        { q: '« Je n\'aime pas le froid. » « Moi ___. »', en: '« Me neither. »', opts: ['non plus', 'aussi', 'pas', 'non'], a: 'non plus', why: 'Aussi agrees with a yes. And with a no?', hint: '<b>moi non plus</b> = me neither.' },
    ],
    build: [
        { en: 'I don\'t understand.', tiles: ['Je', 'ne', 'comprends', 'pas.'], trap: 'non', why: 'The no is a sandwich round the verb.', hint: 'je <b>ne</b> comprends <b>pas</b>.' },
        { en: 'She isn\'t tired.', tiles: ['Elle', 'n\'', 'est', 'pas', 'fatiguée.'], trap: 'ne', why: '« est » starts with a vowel.', hint: 'elle <b>n\'</b>est pas.' },
        { en: 'I don\'t want to leave.', tiles: ['Je', 'ne', 'veux', 'pas', 'partir.'], trap: 'pars', why: 'The second verb stays as it is.', hint: 'ne veux pas <b>partir</b>.' },
        { en: 'We have no car.', tiles: ['Nous', 'n\'', 'avons', 'pas', 'de', 'voiture.'], trap: 'une', why: 'What does une become after pas?', hint: 'pas <b>de</b> voiture.' },
        { en: 'I don\'t see him.', tiles: ['Je', 'ne', 'le', 'vois', 'pas.'], trap: 'non', why: 'ne goes before the little pronoun.', hint: 'je <b>ne le</b> vois pas.' },
        { en: 'There is no metro.', tiles: ['Il', 'n\'', 'y', 'a', 'pas', 'de', 'métro.'], trap: 'du', why: 'After pas: de.', hint: 'il n\'y a pas <b>de</b> métro.' },
    ],
    spot: [
        { words: ['Je', 'ne', 'aime', 'pas', 'le thé.'], bad: 1, fix: 'n\'', say: 'Je n\'aime pas le thé.', hint: 'Before a vowel: <b>n\'</b>aime.', look: 'Look at the word before « aime ».' },
        { words: ['Il', 'n\'a', 'pas', 'une', 'voiture.'], bad: 3, fix: 'de', hint: 'After pas, une becomes <b>de</b>.', look: 'Look at the word after pas.' },
        { words: ['Nous', 'ne', 'sommes', 'fatigués.'], bad: 3, fix: 'pas fatigués.', say: 'Nous ne sommes pas fatigués.', hint: 'The sandwich needs both: <b>ne</b> … <b>pas</b>.', look: 'Something is missing after the verb.' },
        { words: ['Je', 'n\'aime', 'pas', 'de', 'chocolat.'], bad: 3, fix: 'le', hint: 'With aimer, <b>le</b> stays: je n\'aime pas le chocolat.', look: 'With aimer, does the article change?' },
        { words: ['Je', 'ne', 'veux', 'partir pas.'], bad: 3, fix: 'pas partir.', say: 'Je ne veux pas partir.', hint: 'pas goes after the <b>first</b> verb.', look: 'Where does pas go with two verbs?' },
        { words: ['Il', 'n\'y a', 'pas', 'des', 'pommes.'], bad: 3, fix: 'de', hint: 'After pas, des becomes <b>de</b>.', look: 'Look at the word after pas.' },
    ],
};

const CSS = `
.ng{display:grid;gap:16px}
.ng-sec{display:grid;gap:10px}
.ng-sec h3{margin:0;font-size:var(--fs-lg);font-weight:900;color:#0f172a}.ng-sec h3 small{display:block;font-size:var(--fs-sm);font-weight:600;color:#64748b;margin-top:2px}
.ng-chips{display:flex;flex-wrap:wrap;gap:6px}
.ng-w{border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:6px 12px;min-height:44px;font:inherit;font-size:var(--fs-base);font-weight:800;color:#0f172a;cursor:pointer}
.ng-w[aria-pressed="true"]{background:#4f46e5;border-color:#4f46e5;color:#fff}
.ng-w.big{font-size:var(--fs-lg);padding:8px 16px}
.ng-w.no[aria-pressed="true"]{background:#e11d48;border-color:#e11d48}
.ng-stage{border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;padding:16px 12px;display:grid;gap:10px}
.ng-line{display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-height:64px}
.ng-t{display:inline-flex;align-items:center;justify-content:center;height:52px;padding:0 12px;border-radius:12px;background:#fff;border:2px solid #cbd5e1;font-size:var(--fs-2xl);font-weight:900;color:#0f172a;white-space:nowrap}
.ng-t.v{border-color:#0891b2;background:#ecfeff;color:#155e75}
.ng-t.n{border-color:#e11d48;background:#e11d48;color:#fff}
.ng-t.x{border-color:#d97706;background:#fffbeb;color:#92400e}
.ng-t.in{animation:ng-in .55s cubic-bezier(.3,1.4,.5,1)}
@keyframes ng-in{0%{transform:translateY(-26px) scale(.4);opacity:0}100%{transform:none;opacity:1}}
.ng-en{font-size:var(--fs-base);color:#475569}
.ng-note{font-size:var(--fs-base);color:#1e293b}
.ng-key{display:flex;flex-wrap:wrap;gap:10px;font-size:var(--fs-sm);color:#475569}
.ng-key span::before{content:'';display:inline-block;width:12px;height:12px;border-radius:4px;margin-right:4px;vertical-align:-1px;background:var(--c)}
.ng-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}@media(max-width:640px){.ng-cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
.ng-card{border:2px solid #a7f3d0;background:#ecfdf5;border-radius:14px;padding:10px;min-height:88px;text-align:left;font:inherit;cursor:pointer;display:grid;gap:4px;align-content:start}
.ng-card b{font-size:var(--fs-lg);color:#065f46}
.ng-card small{font-size:var(--fs-sm);color:#475569}
.ng-card .tag{justify-self:start;font-size:var(--fs-xs);font-weight:800;border-radius:999px;padding:1px 8px;background:#fff;color:#334155;border:1px solid #e2e8f0}
.ng-card.off{border-color:#fecdd3;background:#fff1f2}.ng-card.off b{color:#9f1239}
.ng-card.keep.off .tag{background:#0891b2;color:#fff;border-color:#0891b2}
.ng-card.off .tag{background:#e11d48;color:#fff;border-color:#e11d48}
.ng-spoken{display:grid;gap:6px}
.ng-sp{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;align-items:center;border:1px solid #e2e8f0;border-radius:12px;padding:8px 10px;background:#fff}
@media(max-width:520px){.ng-sp{grid-template-columns:1fr}}
.ng-sp button{font:inherit;text-align:left;border:0;background:none;cursor:pointer;padding:4px;min-height:40px;font-size:var(--fs-lg);font-weight:800;color:#0f172a}
.ng-sp button small{display:block;font-size:var(--fs-xs);font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#64748b}
.ng-sp s{color:#e11d48;text-decoration-thickness:2px}
@media (prefers-reduced-motion:reduce){.ng-t.in{animation:none}}`;

function mount(root, { say, done }) {
    if (!document.getElementById('ng-css')) { const s = document.createElement('style'); s.id = 'ng-css'; s.textContent = CSS; document.head.appendChild(s); }
    root.innerHTML = `<div class="ng">
      <section class="ng-sec"><h3>1 · The sandwich <small>Pick a sentence, then tap « Make it a no »: ne and pas slide in round the verb.</small></h3>
        <div class="ng-chips" role="group" aria-label="Sentences">${SENT.map((s, i) => `<button type="button" class="ng-w" data-s="${i}" aria-pressed="${i === 0}">${esc(s.label)}</button>`).join('')}</div>
        <div class="ng-stage"><div class="ng-line" id="ng-line" aria-live="polite"></div><div class="ng-en" id="ng-en"></div>
          <div class="ng-chips"><button type="button" class="ng-w big no" id="ng-no" aria-pressed="false">Make it a no</button></div>
          <div class="ng-note" id="ng-note"></div>
          <div class="ng-key" aria-hidden="true"><span style="--c:#0891b2">the verb</span><span style="--c:#e11d48">ne … pas</span><span style="--c:#d97706">changes</span></div></div>
      </section>
      <section class="ng-sec"><h3>2 · un, une, des → de <small>Tap a card to turn it into a no. After pas, un, une, des and du become de; le and la stay.</small></h3>
        <div class="ng-cards">${CARDS.map((c, i) => `<button type="button" class="ng-card${c[3] === 'le stays' ? ' keep' : ''}" data-c="${i}" aria-pressed="false"><b>${esc(c[0])}</b><small>${esc(c[2])}</small><span class="tag">${esc(c[3])}</span></button>`).join('')}</div>
      </section>
      <section class="ng-sec"><h3>3 · How people say it <small>When people speak, the ne often drops. You will hear it everywhere; write the full ne … pas.</small></h3>
        <div class="ng-spoken">${SPOKEN.map(s => `<div class="ng-sp"><button type="button" data-say="${esc(s[0])}"><small>Written</small>${esc(s[0])}</button><button type="button" data-say="${esc(s[1])}"><small>Spoken · ${esc(s[2])}</small>${esc(s[1])}</button></div>`).join('')}</div>
      </section>
    </div>`;
    const $ = (s) => root.querySelector(s);
    let si = 0, neg = false, shown = new Set();
    function draw(speak) {
        const S = SENT[si], tiles = neg ? S.no : S.yes;
        const was = shown; shown = new Set(tiles.map(t => t[0]));
        $('#ng-line').innerHTML = tiles.map(([k, txt, kind]) => `<span class="ng-t ${kind || ''}${was.size && !was.has(k) ? ' in' : ''}">${esc(txt)}</span>`).join('');
        const plain = tiles.map(t => t[1]).join(' ').replace(/' /g, '\'').replace(/ \./, '.');
        $('#ng-en').textContent = S.en[neg ? 1 : 0];
        $('#ng-note').innerHTML = neg ? S.note : '';
        $('#ng-no').textContent = neg ? 'Make it a yes' : 'Make it a no';
        $('#ng-no').setAttribute('aria-pressed', neg);
        if (speak) say(plain);
    }
    root.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { si = Number(b.dataset.s); neg = false; shown = new Set(); root.querySelectorAll('[data-s]').forEach(o => o.setAttribute('aria-pressed', o === b)); draw(true); }));
    $('#ng-no').addEventListener('click', () => { neg = !neg; draw(true); });
    draw(false);
    root.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => {
        const c = CARDS[Number(b.dataset.c)], off = !b.classList.contains('off');
        b.classList.toggle('off', off); b.setAttribute('aria-pressed', off);
        b.querySelector('b').textContent = off ? c[1] : c[0];
        say(off ? c[1] : c[0]);
    }));
    // the written / spoken lines carry data-say: the lesson page speaks them when tapped
    const pr = document.createElement('section');
    pr.className = 'ng-sec';
    pr.innerHTML = '<h3>4 · Practise <small>From easy to harder. A wrong answer gets a hint and another try.</small></h3><div></div>';
    root.querySelector('.ng').appendChild(pr);
    window.GrammarPractice.mount(pr.lastElementChild, { items: ITEMS, say, done });
}
window.NegationLesson = { mount };
})();
