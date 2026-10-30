// weather-video.js - step 2 of La Météo & Les Saisons (Vocab theme 8), in place of the memory palace.
//   Watch: a short animated video (media/meteo/meteo.mp4). Léa presents the weather and her friend Hugo
//          phones her through the seasons; French voices, French and English subtitles, every word of the topic.
//   Check yourself: a still from the video, "Quel temps fait-il ?", four answers. The wrong answers are the
//          usual mistakes (il fait du vent / il y a chaud…), so it practises the rule:
//          il fait + how it feels · il y a + a thing you can point at · il pleut / il neige / il gèle: the sky does it.
//          Answers count like the memory palace did: right first time moves the word up a box.
// The video and pictures are made by tools/meteo-video (see its README).
//   VocabTools[8] = { name, next, mount(el, { say, grade, words }) }
(function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const plain = (s) => String(s).toLowerCase().replace(/[.!?…\s]+$/g, '').replace(/\s+/g, ' ').trim();
const DIR = 'media/meteo/';

const CHAPTERS = [['La météo', 0], ['Au printemps · Paris', 10.4], ['En été · Nice', 33.8], ['En automne · Lyon', 46.8], ['En hiver · les Alpes', 56.6], ['À demain !', 67.6]];
const RULE = {
    fait: '<b>Il fait</b> + how it feels: an adjective or a temperature.',
    ya: '<b>Il y a</b> + a thing you can point at, with du, des or un.',
    verb: 'No <i>fait</i>, no <i>il y a</i>: the sky does it, so it is a verb.',
};
const TRAP = {
    'Il fait nuages.': '<i>Les nuages</i> are things you can point at, so: il y a des nuages.',
    'Il fait pluie.': '<i>La pluie</i> is the noun. For rain the sky does it: il pleut.',
    'Il y a chaud.': '<i>Chaud</i> is how it feels, so: il fait chaud.',
    'Il y a lourd.': '<i>Lourd</i> is how it feels, so: il fait lourd.',
    'Il fait orage.': '<i>Un orage</i> is a thing, so: il y a un orage.',
    'Il fait brouillard.': '<i>Le brouillard</i> is a thing you see, so: il y a du brouillard.',
    'Il fait vent.': '<i>Le vent</i> is a thing, so: il y a du vent.',
    'Il fait neige.': '<i>La neige</i> is the noun. The sky does it: il neige.',
};
const Q = [
    { img: 'sun', t: 17.7, a: 'Il y a du soleil.', cat: 'ya', opts: ['Il y a du soleil.', 'Il pleut.', 'Il y a du brouillard.', 'Il neige.'] },
    { img: 'temp', t: 21.4, q: 'Quelle est la température ?', a: 'Il fait vingt degrés.', cat: 'fait', opts: ['Il fait vingt degrés.', 'Il fait trente degrés.', 'Il fait froid.', 'Il neige.'] },
    { img: 'clouds', t: 23.1, a: 'Il y a des nuages.', cat: 'ya', opts: ['Il y a des nuages.', 'Il fait nuages.', 'Il y a du soleil.', 'Il gèle.'] },
    { img: 'rain', t: 29.5, a: 'Il pleut.', cat: 'verb', opts: ['Il pleut.', 'Il fait pluie.', 'Il neige.', 'Il y a du vent.'] },
    { img: 'hot', t: 34.9, a: 'Il fait chaud.', cat: 'fait', opts: ['Il fait chaud.', 'Il y a chaud.', 'Il fait froid.', 'Il gèle.'] },
    { img: 'muggy', t: 36.9, a: 'Il fait lourd.', cat: 'fait', opts: ['Il fait lourd.', 'Il y a lourd.', 'Il neige.', 'Il fait froid.'] },
    { img: 'storm', t: 39.6, a: 'Il y a un orage.', cat: 'ya', opts: ['Il y a un orage.', 'Il fait orage.', 'Il fait beau.', 'Il neige.'] },
    { img: 'fog', t: 48.9, a: 'Il y a du brouillard.', cat: 'ya', opts: ['Il y a du brouillard.', 'Il fait brouillard.', 'Il fait chaud.', 'Il pleut.'] },
    { img: 'wind', t: 51.6, a: 'Il y a du vent.', cat: 'ya', opts: ['Il y a du vent.', 'Il fait vent.', 'Il neige.', 'Il y a du soleil.'] },
    { img: 'snow', t: 60.8, a: 'Il neige.', cat: 'verb', opts: ['Il neige.', 'Il fait neige.', 'Il pleut.', 'Il fait chaud.'] },
    { img: 'frost', t: 64.4, q: 'Et la nuit ?', a: 'Il gèle.', cat: 'verb', opts: ['Il gèle.', 'Il fait chaud.', 'Il y a du soleil.', 'Il fait lourd.'] },
];

const CSS = `
.wv{display:grid;gap:14px;max-width:820px}
.wv-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.wv-btn{font-weight:700;font-size:15px;border:1px solid #e2e8f0;background:#fff;color:#0f172a;border-radius:12px;padding:8px 14px;min-height:44px;cursor:pointer}
.wv-btn.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.wv-btn[aria-pressed="true"]{background:#eef2ff;border-color:#6366f1;color:#3730a3}
.wv-btn:focus-visible,.wv-opt:focus-visible,.wv-ch:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
.wv-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:14px;display:grid;gap:10px}
.wv-card[hidden]{display:none}
.wv-video{width:100%;aspect-ratio:16/9;border-radius:12px;background:#0E1631;display:block}
.wv-chs{display:flex;flex-wrap:wrap;gap:6px}
.wv-ch{border:1px solid #e2e8f0;background:#f8fafc;border-radius:999px;padding:6px 12px;min-height:36px;font-size:14px;color:#334155;cursor:pointer}
.wv-small{font-size:14px;color:#64748b}
.wv-img{width:100%;aspect-ratio:16/9;border-radius:12px;display:block;object-fit:cover;background:#e2e8f0}
.wv-q{font-size:1.35rem;font-weight:900;color:#0f172a}
.wv-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
@media (max-width:560px){.wv-opts{grid-template-columns:1fr}}
.wv-opt{text-align:left;font-size:17px;font-weight:600;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:10px 14px;min-height:50px;cursor:pointer;color:#0f172a}
.wv-opt.ok{background:#ecfdf5;border-color:#059669}.wv-opt.no{background:#fff1f2;border-color:#e11d48}
.wv-note{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:10px 12px;font-size:15px;color:#1e293b;line-height:1.5}
.wv-fb{font-weight:800}.wv-fb.ok{color:#047857}.wv-fb.no{color:#be123c}
.wv-rules{display:grid;gap:6px;font-size:15px;color:#1e293b}
.wv-rules div{background:#f8fafc;border-radius:10px;padding:8px 10px}`;
function css() { if (!document.getElementById('wv-css')) { const s = document.createElement('style'); s.id = 'wv-css'; s.textContent = CSS; document.head.appendChild(s); } }

function mount(root, { say, grade, words }) {
    css();
    root.innerHTML = `<div class="wv">
      <div class="wv-row" role="group" aria-label="Mode">
        <button type="button" class="wv-btn" data-mode="watch" aria-pressed="true">Watch</button>
        <button type="button" class="wv-btn" data-mode="check" aria-pressed="false">Check yourself</button>
      </div>
      <div class="wv-card" id="wv-watch">
        <video class="wv-video" id="wv-v" controls playsinline preload="metadata" poster="${DIR}poster.jpg" src="${DIR}meteo.mp4"></video>
        <div class="wv-chs" aria-label="Jump to a season">${CHAPTERS.map(([n, t]) => `<button type="button" class="wv-ch" data-t="${t}">${esc(n)}</button>`).join('')}</div>
        <p class="wv-small">Watch once with the English, then once reading only the French. The words of this topic are in yellow.</p>
        <div class="wv-rules"><div>${RULE.fait} <i>Il fait beau, il fait chaud.</i></div><div>${RULE.ya} <i>Il y a du soleil, il y a des nuages.</i></div><div>${RULE.verb} <i>Il pleut, il neige, il gèle.</i></div></div>
      </div>
      <div class="wv-card" id="wv-check" hidden aria-live="polite"></div>
    </div>`;
    const $ = (s) => root.querySelector(s);
    const video = $('#wv-v'), watch = $('#wv-watch'), check = $('#wv-check');
    let quiz = null;
    function setMode(m) {
        root.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m));
        watch.hidden = m !== 'watch'; check.hidden = m !== 'check';
        if (m === 'check') { video.pause(); if (!quiz) start(); }
    }
    root.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    root.querySelectorAll('.wv-ch').forEach(b => b.addEventListener('click', () => { video.currentTime = Number(b.dataset.t); video.play().catch(() => {}); }));

    const wordFor = (fr) => (words || []).find(w => plain(w.fr) === plain(fr) || plain(w.key || '') === plain(fr));
    function start() { quiz = { order: shuffle(Q), i: 0, score: 0 }; ask(); }
    function ask() {
        if (quiz.i >= quiz.order.length) return done();
        const it = quiz.order[quiz.i], opts = shuffle(it.opts);
        let tries = 0, over = false;
        check.innerHTML = `<p class="wv-small">${quiz.i + 1} / ${quiz.order.length}</p>
          <img class="wv-img" src="${DIR}${it.img}.jpg" alt="A scene from the weather video">
          <div class="wv-q">${esc(it.q || 'Quel temps fait-il ?')}</div>
          <div class="wv-opts">${opts.map((o, i) => `<button type="button" class="wv-opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>
          <p class="wv-fb" id="wv-fb"></p><div id="wv-after"></div>`;
        check.querySelectorAll('.wv-opt').forEach(b => b.addEventListener('click', () => {
            if (over) return;
            const pick = opts[Number(b.dataset.i)], ok = pick === it.a, fb = check.querySelector('#wv-fb');
            if (!ok) {
                tries++; b.classList.add('no'); b.disabled = true;
                fb.className = 'wv-fb no';
                fb.innerHTML = TRAP[pick] || 'Not that one. Look at the picture again.';
                if (tries === 1) { const w = wordFor(it.a); if (w && grade) grade(w, false); }
                return;
            }
            over = true; b.classList.add('ok');
            if (!tries) quiz.score++;
            const w = wordFor(it.a); if (w && grade && !tries) grade(w, true);
            say(it.a);
            fb.className = 'wv-fb ok'; fb.textContent = tries ? 'Yes, that one.' : 'Right first time!';
            check.querySelector('#wv-after').innerHTML = `<div class="wv-note">${RULE[it.cat]}</div>
              <div class="wv-row" style="margin-top:10px"><button type="button" class="wv-btn pri" id="wv-next">Next →</button><button type="button" class="wv-btn" id="wv-see">▶ See it in the video</button></div>`;
            check.querySelector('#wv-next').addEventListener('click', () => { quiz.i++; ask(); });
            check.querySelector('#wv-see').addEventListener('click', () => { setMode('watch'); video.currentTime = Math.max(0, it.t - 1.5); video.play().catch(() => {}); });
        }));
    }
    function done() {
        const n = quiz.order.length;
        check.innerHTML = `<div class="wv-q">${quiz.score} / ${n} right first time</div>
          <p class="wv-small">${quiz.score === n ? 'Parfait ! You know when to say il fait, il y a or just the verb.' : 'The ones you missed come back in Practise and Test.'}</p>
          <div class="wv-rules"><div>${RULE.fait}</div><div>${RULE.ya}</div><div>${RULE.verb}</div></div>
          <div class="wv-row"><button type="button" class="wv-btn pri" id="wv-again">Again</button></div>`;
        check.querySelector('#wv-again').addEventListener('click', start);
    }
}

window.VocabTools = window.VocabTools || {};
window.VocabTools[8] = { name: 'Weather video', next: 'Watch the weather video', mount };
})();
