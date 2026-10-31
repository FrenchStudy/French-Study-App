// video-page.js - a short animated video in step 2 of a Vocab topic, with Check yourself under it.
// (The weather video has its own file, weather-video.js; new videos are added here.)
//   Watch: the video, buttons to jump to each part, a few rules to remember
//   Check yourself: questions, some with a still from the video; the wrong answers are the usual mistakes,
//          explained when picked; right first time moves the word up a box
// Videos and pictures are made by tools/<name>-video (people: DiceBear toon-head, CC BY 4.0, Johan Melin;
// food: Microsoft Fluent Emoji, MIT; voices: Piper).
//   VIDEO_PAGES[themeId] = { name, next, dir, chapters: [[label, seconds]], rules: [html], questions: [...] }
//   question: { img?, t? (seconds, for "See it in the video"), q, a, opts: [a + wrong answers], why, wrong?: { answer: why not }, key? }
(function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const plain = (s) => String(s).toLowerCase().replace(/[.!?…\s]+$/g, '').replace(/\s+/g, ' ').trim();

const PAGES = {
// ---------------- 1 Greetings & Politeness ----------------
1: {
    name: 'Greetings video', next: 'Watch the greetings video', dir: 'media/greet/', file: 'greet.mp4',
    credit: 'Léa, Mme Dubois, Mme Martin, Camille and Zoé: DiceBear toon-head (CC BY 4.0, Johan Melin) · pictures: Microsoft Fluent Emoji (MIT) · voice: Piper',
    chapters: [['Le matin · la voisine', 0], ['Au bureau · 9 h', 25.1], ['Le soir · au café', 64.4]],
    rules: [
        '<b>Bonjour</b> all day, to everyone · <b>bonsoir</b> from about 6 pm · <b>bonne nuit</b> only when someone goes to bed.',
        '<b>vous</b> to an adult you don\'t know well, at work, with madame / monsieur · <b>tu</b> to a friend, family, a child.',
        'So: <i>excusez-moi · s\'il vous plaît · comment vous appelez-vous ?</i> (vous) and <i>excuse-moi · s\'il te plaît · comment tu t\'appelles ?</i> (tu).',
        '<b>Merci</b> → <b>de rien</b> (everyday) or <b>je vous en prie</b> (polite, vous).',
        'When you leave: <b>bonne journée</b> (daytime), <b>bonne soirée</b> (evening), <b>à demain</b>, <b>à bientôt</b>, <b>au revoir</b>.',
        'At work you shake hands; friends do <b>la bise</b> (a kiss on each cheek).',
    ],
    questions: [
        { img: 'matin', t: 2.8, q: 'Le matin, Léa voit sa voisine. Elle dit :', a: 'Bonjour, madame Dubois !', opts: ['Bonjour, madame Dubois !', 'Bonsoir, madame Dubois !', 'Bonne nuit, madame Dubois !', 'Salut, Dubois !'], why: 'In the morning and all day: bonjour.', wrong: { 'Bonsoir, madame Dubois !': 'Bonsoir is for the evening.', 'Bonne nuit, madame Dubois !': 'Bonne nuit is only when someone goes to bed.', 'Salut, Dubois !': 'Salut is for friends, and a neighbour is madame Dubois.' }, key: 'bonjour' },
        { t: 4.9, q: 'Vous parlez à une dame que vous ne connaissez pas bien. Vous demandez :', a: 'Comment allez-vous ?', opts: ['Comment allez-vous ?', 'Ça va, toi ?', 'Comment tu vas ?', 'Comment allez-tu ?'], why: 'Vous to an adult you don\'t know well: Comment allez-vous ?', wrong: { 'Ça va, toi ?': 'Toi is tu: for friends.', 'Comment tu vas ?': 'Tu is for friends and family.', 'Comment allez-tu ?': 'Allez goes with vous, not tu.' }, key: 'comment allez-vous ?' },
        { t: 11.4, q: 'Ça ne va pas très bien, mais pas très mal :', a: 'Comme ci, comme ça.', opts: ['Comme ci, comme ça.', 'Ça va bien, merci.', 'Je vous en prie.', 'Bonne journée.'], why: 'Comme ci, comme ça = so-so.', key: 'comme ci, comme ça' },
        { t: 14.6, q: 'Mme Dubois a mal au dos. Léa dit :', a: 'Oh, je suis désolée !', opts: ['Oh, je suis désolée !', 'De rien !', 'Enchantée !', 'Je vous en prie !'], why: 'Désolé · désolée = sorry (about something bad). Léa is a woman: désolée.', key: 'désolé / désolée' },
        { img: 'bureau', t: 34.4, q: '« Je m\'appelle Léa. Mon nom de famille, c\'est Morel. » Morel, c\'est…', a: 'son nom de famille', opts: ['son nom de famille', 'son prénom', 'sa ville', 'son bureau'], why: 'Léa is her prénom (first name). Morel is her nom de famille (surname).', key: 'nom de famille' },
        { t: 38.9, q: 'Léa écrit à une nouvelle collègue : « … de vous rencontrer ! » Léa est une femme, donc elle écrit :', a: 'Enchantée', opts: ['Enchantée', 'Enchanté', 'Enchantés', 'Enchanter'], why: 'A woman writes enchantée (with an extra e), a man enchanté. They sound the same.', key: 'enchanté / enchantée' },
        { t: 45.2, q: 'Mme Martin parle trop vite. Vous dites :', a: 'Parlez plus lentement, s\'il vous plaît.', opts: ['Parlez plus lentement, s\'il vous plaît.', 'Parlez plus vite, s\'il vous plaît.', 'Parle plus lentement, s\'il te plaît.', 'Je parle lentement.'], why: 'Lentement = slowly, and vous with a person at work.', wrong: { 'Parle plus lentement, s\'il te plaît.': 'Parle… s\'il te plaît is tu: for a friend, not a receptionist.', 'Parlez plus vite, s\'il vous plaît.': 'Vite = fast: the opposite!' }, key: 'parlez plus lentement, s\'il vous plaît.' },
        { t: 50.5, q: 'Vous n\'avez pas compris. Vous dites :', a: 'Pardon, je ne comprends pas.', opts: ['Pardon, je ne comprends pas.', 'Pardon, je ne prends pas.', 'Merci, je comprends.', 'Désolée, je ne parle pas.'], why: 'Je ne comprends pas = I don\'t understand.', key: 'je ne comprends pas.' },
        { t: 60.6, q: 'Léa dit « Merci ! » à Mme Martin. Mme Martin répond poliment :', a: 'Je vous en prie.', opts: ['Je vous en prie.', 'S\'il vous plaît.', 'Merci beaucoup.', 'Excusez-moi.'], why: 'Je vous en prie = you\'re welcome (polite, vous). With friends: de rien.', key: 'je vous en prie' },
        { img: 'soir', t: 67.1, q: 'Il est 20 h. Léa arrive au café et voit Camille :', a: 'Bonsoir, Camille !', opts: ['Bonsoir, Camille !', 'Bonjour, Camille !', 'Bonne nuit, Camille !', 'Bonne soirée, Camille !'], why: 'In the evening, when you arrive: bonsoir.', wrong: { 'Bonjour, Camille !': 'At 8 pm, bonsoir is better.', 'Bonne nuit, Camille !': 'Bonne nuit is for going to bed, not for arriving.', 'Bonne soirée, Camille !': 'Bonne soirée is what you say when you leave.' }, key: 'bonsoir' },
        { t: 67.1, q: 'Léa est en retard. À son amie, elle dit :', a: 'Excuse-moi !', opts: ['Excuse-moi !', 'Excusez-moi, madame !', 'De rien !', 'Enchantée !'], why: 'To a friend (tu): excuse-moi. To a stranger (vous): excusez-moi.', key: 'excuse-moi' },
        { t: 81.8, q: 'Léa demande son prénom à une petite fille :', a: 'Comment tu t\'appelles ?', opts: ['Comment tu t\'appelles ?', 'Comment vous appelez-vous ?', 'Comment t\'appelles-vous ?', 'Tu t\'appelles comment, madame ?'], why: 'Tu to a child: Comment tu t\'appelles ?', wrong: { 'Comment vous appelez-vous ?': 'Vous is for adults you don\'t know. To a child: tu.' }, key: 'comment tu t\'appelles ?' },
        { t: 87.7, q: 'Camille propose du sucre. Léa en veut :', a: 'Oui, s\'il te plaît.', opts: ['Oui, s\'il te plaît.', 'Oui, s\'il vous plaît, madame.', 'Non, merci.', 'De rien.'], why: 'Camille is a friend (tu): s\'il te plaît.', key: 's\'il te plaît' },
        { t: 93.7, q: 'On dit « Bonne nuit » quand…', a: 'quelqu\'un va se coucher', opts: ['quelqu\'un va se coucher', 'on arrive le soir', 'on part le matin', 'on rencontre quelqu\'un'], why: 'Bonne nuit = good night, before bed. Arriving in the evening: bonsoir.', key: 'bonne nuit' },
    ],
},
// ---------------- 18 Café, Food & Ordering ----------------
18: {
    name: 'Café video', next: 'Watch the café video', dir: 'media/cafe/', file: 'cafe.mp4',
    credit: 'Léa and Chloé: DiceBear toon-head (CC BY 4.0, Johan Melin) · food: Microsoft Fluent Emoji (MIT) · voice: Piper',
    chapters: [['Le petit-déjeuner', 0], ['Le déjeuner', 28.3], ['Le goûter', 69.6]],
    rules: [
        '<b>Je voudrais…</b> is the polite way to order. <i>Je veux…</i> sounds rude to a waiter.',
        '<b>Je vais prendre…</b> = I\'ll have… (when you have chosen).',
        '<b>sans</b> + noun, no article: <i>sans sucre, sans lait, sans glaçons</i>.',
        '<b>la carte</b> = the menu · <b>la formule</b> = the set menu · <b>l\'addition</b> = the bill.',
    ],
    questions: [
        { img: 'matin', t: 6, q: 'Qu\'est-ce que Léa commande ?', a: 'Un café crème et un jus d\'orange.', opts: ['Un café crème et un jus d\'orange.', 'Un thé et un croissant.', 'Un chocolat chaud et une glace.', 'Une bière et des frites.'], why: 'Je voudrais un café crème et un jus d\'orange, s\'il vous plaît.', key: 'café crème' },
        { t: 2.6, q: 'La serveuse demande : « Qu\'est-ce que je vous sers ? » Vous répondez :', a: 'Je voudrais un café, s\'il vous plaît.', opts: ['Je voudrais un café, s\'il vous plaît.', 'Je suis un café.', 'Je veux café.', 'Donne-moi un café !'], why: 'Je voudrais… is polite. Je veux… sounds rude, and « donne-moi » uses tu with a stranger.', wrong: { 'Je suis un café.': 'Je suis = I am. You are not a coffee!', 'Je veux café.': 'Je veux sounds rude, and it needs un: un café.', 'Donne-moi un café !': 'Donne-moi uses tu: too familiar with a waitress or a waiter.' }, key: 'je voudrais…' },
        { t: 13.4, q: 'Vous ne voulez pas de sucre dans votre café :', a: 'Sans sucre, s\'il vous plaît.', opts: ['Sans sucre, s\'il vous plaît.', 'Avec du sucre, s\'il vous plaît.', 'Pas sucre.', 'Moins sucre.'], why: 'Sans + noun, with no article: sans sucre.', key: 'sans…' },
        { t: 30.6, q: 'Vous arrivez au café et votre amie arrive bientôt :', a: 'Une table pour deux, s\'il vous plaît.', opts: ['Une table pour deux, s\'il vous plaît.', 'Deux tables, s\'il vous plaît.', 'Une chaise pour deux.', 'Un deux, s\'il vous plaît.'], why: 'Une table pour deux = a table for two people.', key: 'table pour deux, s\'il vous plaît.' },
        { img: 'midi', t: 41.2, q: 'La formule, c\'est…', a: 'une entrée et un plat principal', opts: ['une entrée et un plat principal', 'une boisson et un café', 'le petit-déjeuner', 'un plat et l\'addition'], why: 'Voici la carte. La formule, c\'est une entrée et un plat principal.', key: 'formule' },
        { t: 46.7, q: 'Vous ne mangez ni viande ni poisson :', a: 'Je suis végétarien.', opts: ['Je suis végétarien.', 'Je suis viande.', 'Je n\'ai pas viande.', 'Je suis légume.'], why: 'Je suis végétarien · végétarienne.', key: 'je suis végétarien / végétarienne.' },
        { t: 46.7, q: 'Vous voulez l\'avis de la serveuse :', a: 'Qu\'est-ce que vous me conseillez ?', opts: ['Qu\'est-ce que vous me conseillez ?', 'Qu\'est-ce que vous me commandez ?', 'Où est le conseil ?', 'Vous conseillez quoi, toi ?'], why: 'Conseiller = to recommend. Qu\'est-ce que vous me conseillez ? = What do you recommend?', key: 'qu\'est-ce que vous me conseillez ?' },
        { t: 54.5, q: 'L\'eau avec des bulles, c\'est…', a: 'de l\'eau gazeuse', opts: ['de l\'eau gazeuse', 'de l\'eau plate', 'du lait', 'du jus d\'orange'], why: 'Gazeuse = with bubbles. Plate = still.', key: 'de l\'eau plate / gazeuse' },
        { img: 'gouter', t: 76.4, q: 'Léa mange sa glace…', a: 'sur place', opts: ['sur place', 'à emporter', 'à la maison', 'dans le bus'], why: 'Sur place = here, at the café. À emporter = to take away.', key: 'sur place / à emporter' },
        { t: 90, q: 'Le repas est fini. Vous voulez payer :', a: 'L\'addition, s\'il vous plaît.', opts: ['L\'addition, s\'il vous plaît.', 'La carte, s\'il vous plaît.', 'Le prix, s\'il vous plaît.', 'La note de musique, merci.'], why: 'In a café or a restaurant you ask for l\'addition.', wrong: { 'La carte, s\'il vous plaît.': 'La carte is the menu: you ask for it before you order.' }, key: 'addition, s\'il vous plaît.' },
        { t: 90, q: 'Le repas était très bon :', a: 'C\'était délicieux !', opts: ['C\'était délicieux !', 'J\'étais délicieux !', 'C\'est délicieux hier.', 'C\'était délicat.'], why: 'C\'était délicieux = it was delicious (the meal, not you).', wrong: { 'J\'étais délicieux !': 'J\'étais = I was. You were not delicious!', 'C\'était délicat.': 'Délicat = delicate, tricky. Not the same.' }, key: 'c\'était délicieux.' },
    ],
},
};

const CSS = `
.vp{display:grid;gap:14px;max-width:820px}
.vp-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.vp-btn{font-weight:700;font-size:15px;border:1px solid #e2e8f0;background:#fff;color:#0f172a;border-radius:12px;padding:8px 14px;min-height:44px;cursor:pointer}
.vp-btn.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.vp-btn[aria-pressed="true"]{background:#eef2ff;border-color:#6366f1;color:#3730a3}
.vp-btn:focus-visible,.vp-opt:focus-visible,.vp-ch:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
.vp-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:14px;display:grid;gap:10px}
.vp-card[hidden]{display:none}
.vp-video{width:100%;aspect-ratio:16/9;border-radius:12px;background:#3E2723;display:block}
.vp-chs{display:flex;flex-wrap:wrap;gap:6px}
.vp-ch{border:1px solid #e2e8f0;background:#f8fafc;border-radius:999px;padding:6px 12px;min-height:36px;font-size:14px;color:#334155;cursor:pointer}
.vp-small{font-size:13px;color:#64748b}
.vp-rules{display:grid;gap:6px;font-size:15px;color:#1e293b}
.vp-rules div{background:#f8fafc;border-radius:10px;padding:8px 10px}
.vp-img{width:100%;aspect-ratio:16/9;border-radius:12px;display:block;object-fit:cover;background:#e2e8f0}
.vp-q{font-size:1.25rem;font-weight:900;color:#0f172a}
.vp-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
@media (max-width:560px){.vp-opts{grid-template-columns:1fr}}
.vp-opt{text-align:left;font-size:17px;font-weight:600;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:10px 14px;min-height:50px;cursor:pointer;color:#0f172a}
.vp-opt.ok{background:#ecfdf5;border-color:#059669}.vp-opt.no{background:#fff1f2;border-color:#e11d48}
.vp-note{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:10px 12px;font-size:15px;color:#1e293b;line-height:1.5}
.vp-fb{font-weight:800;margin:0}.vp-fb.ok{color:#047857}.vp-fb.no{color:#be123c}`;
function css() { if (!document.getElementById('vp-css')) { const s = document.createElement('style'); s.id = 'vp-css'; s.textContent = CSS; document.head.appendChild(s); } }

function mount(P, root, { say, grade, words }) {
    css();
    root.innerHTML = `<div class="vp">
      <div class="vp-row" role="group" aria-label="Mode"><button type="button" class="vp-btn" data-mode="watch" aria-pressed="true">Watch</button><button type="button" class="vp-btn" data-mode="check" aria-pressed="false">Check yourself</button></div>
      <div class="vp-card" id="vp-watch">
        <video class="vp-video" controls playsinline preload="metadata" poster="${P.dir}poster.jpg" src="${P.dir}${P.file}"></video>
        <div class="vp-chs">${P.chapters.map(([n, t]) => `<button type="button" class="vp-ch" data-t="${t}">${esc(n)}</button>`).join('')}</div>
        <p class="vp-small">Watch once with the English, then once reading only the French. The words of this topic are in yellow.</p>
        <div class="vp-rules">${P.rules.map(r => `<div>${r}</div>`).join('')}</div>
        ${P.credit ? `<p class="vp-small">${esc(P.credit)}</p>` : ''}
      </div>
      <div class="vp-card" id="vp-check" hidden aria-live="polite"></div></div>`;
    const $ = (s) => root.querySelector(s), video = $('video'), watch = $('#vp-watch'), check = $('#vp-check');
    let quiz = null;
    const setMode = (m) => {
        root.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m));
        watch.hidden = m !== 'watch'; check.hidden = m !== 'check';
        if (m === 'check') { video.pause(); if (!quiz) start(); }
    };
    root.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    root.querySelectorAll('.vp-ch').forEach(b => b.addEventListener('click', () => { video.currentTime = Number(b.dataset.t); video.play().catch(() => {}); }));
    const wordFor = (key) => key && (words || []).find(w => plain(w.fr) === plain(key) || plain(w.key || '') === plain(key));
    const mark = (key, ok) => { const w = wordFor(key); if (w && grade) grade(w, ok); };
    function start() { quiz = { order: shuffle(P.questions), i: 0, score: 0 }; ask(); }
    function ask() {
        if (quiz.i >= quiz.order.length) {
            check.innerHTML = `<div class="vp-q">${quiz.score} / ${quiz.order.length} right first time</div><p class="vp-small">The ones you missed come back in Practise and Test.</p><div class="vp-row"><button type="button" class="vp-btn pri" id="vp-again">Again</button></div>`;
            check.querySelector('#vp-again').addEventListener('click', start); return;
        }
        const it = quiz.order[quiz.i], opts = shuffle(it.opts);
        let tries = 0, over = false;
        check.innerHTML = `<p class="vp-small">${quiz.i + 1} / ${quiz.order.length}</p>${it.img ? `<img class="vp-img" src="${P.dir}${it.img}.jpg" alt="A scene from the video">` : ''}
          <div class="vp-q">${esc(it.q)}</div><div class="vp-opts">${opts.map((o, i) => `<button type="button" class="vp-opt" data-i="${i}">${esc(o)}</button>`).join('')}</div><p class="vp-fb" id="vp-fb"></p><div id="vp-after"></div>`;
        check.querySelectorAll('.vp-opt').forEach(b => b.addEventListener('click', () => {
            if (over) return;
            const pick = opts[Number(b.dataset.i)], fb = check.querySelector('#vp-fb');
            if (pick !== it.a) {
                if (!tries) mark(it.key, false);
                tries++; b.classList.add('no'); b.disabled = true; fb.className = 'vp-fb no';
                fb.textContent = (it.wrong && it.wrong[pick]) || 'Not that one. Try again.'; return;
            }
            over = true; b.classList.add('ok');
            if (!tries) { quiz.score++; mark(it.key, true); }
            say(it.a);
            fb.className = 'vp-fb ok'; fb.textContent = tries ? 'Yes, that one.' : 'Right first time!';
            check.querySelector('#vp-after').innerHTML = `<div class="vp-note">${esc(it.why)}</div><div class="vp-row" style="margin-top:10px"><button type="button" class="vp-btn pri" id="vp-next">Next →</button>${it.t !== undefined ? '<button type="button" class="vp-btn" id="vp-see">▶ See it in the video</button>' : ''}</div>`;
            check.querySelector('#vp-next').addEventListener('click', () => { quiz.i++; ask(); });
            const see = check.querySelector('#vp-see');
            if (see) see.addEventListener('click', () => { setMode('watch'); video.currentTime = Math.max(0, it.t - 1); video.play().catch(() => {}); });
        }));
    }
}

window.VideoPages = PAGES;
window.VocabTools = window.VocabTools || {};
for (const [id, P] of Object.entries(PAGES)) window.VocabTools[id] = { name: P.name, next: P.next, mount: (el, opts) => mount(P, el, opts) };
})();
