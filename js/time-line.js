// time-line.js - the hands-on tool of Frequency & Time Adverbs (Vocab theme 7), in step 2 where other
// topics have a memory palace. One chart, four parts, each with a slider or taps:
//   How often?  one bar from jamais (0%) to toujours (100%); the word, an example and 14 days filled in
//   When?       a time line from the past to the future with maintenant in the middle (+ dernier / prochain)
//   How long?   pendant (finished), depuis (still going), longtemps (a long stretch)
//   Tôt / tard  the sun moves across the day from 6 h to 23 h
// Each word is said (word + example) when the learner lands on it; "Sound on" turns that off.
//   VocabTools[7] = { name, next, mount(el, { say }) }
(function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const OFTEN = [
    { p: 0, fr: 'jamais', lab: 'jamais', en: 'never', d: [], ex: [['Je ne bois jamais de café.', 'I never drink coffee.']] },
    { p: 12, fr: 'rarement', lab: 'rarement', en: 'rarely', d: [9], ex: [['Il prend rarement la voiture : il préfère marcher.', 'He rarely takes the car: he prefers to walk.']] },
    { p: 30, fr: 'de temps en temps', lab: 'de temps en temps', en: 'from time to time', d: [2, 8, 12], ex: [['Nous allons au cinéma de temps en temps.', 'We go to the cinema from time to time.']] },
    { p: 47, fr: 'parfois · quelquefois', lab: 'parfois', en: 'sometimes', d: [1, 4, 8, 10, 13], ex: [['Parfois, elle travaille le samedi.', 'Sometimes she works on Saturdays.']] },
    { p: 68, fr: 'souvent', lab: 'souvent', en: 'often', d: [0, 1, 3, 5, 7, 8, 10, 12, 13], ex: [['Je mange souvent des pâtes.', 'I often eat pasta.']] },
    { p: 85, fr: "d'habitude · normalement", lab: "d'habitude", en: 'usually', d: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 13], ex: [["D'habitude, je me lève à 7 heures.", 'I usually get up at 7.']] },
    { p: 100, fr: 'toujours · tout le temps', lab: 'toujours', en: 'always, all the time', d: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], ex: [["Il arrive toujours à l'heure.", 'He always arrives on time.']] },
];
const WHEN = [
    { p: 3, pos: 'up', fr: 'autrefois', lab: 'autrefois', en: 'in the past, in the old days', ex: [['Autrefois, on écrivait des lettres.', 'In the old days, people wrote letters.']] },
    { p: 15, pos: 'down', fr: 'avant', lab: 'avant', en: 'before', ex: [["Avant, j'habitais à Lyon.", 'Before, I lived in Lyon.']] },
    { p: 22, pos: 'low', fr: 'dernier · dernière', lab: 'dernière', en: 'last (the one just before this one)',
      ex: [["La semaine dernière, j'ai vu mes parents.", 'Last week, I saw my parents.'], ['Le mois dernier, il a commencé un nouveau travail.', 'Last month, he started a new job.']],
      tip: "<b>le</b> mois dernier · <b>la</b> semaine dernière · <b>l'</b>année dernière<br>After the noun it means <b>last</b>, counted back from now. Before the noun it means <b>final</b>: « la dernière semaine des vacances » = the final week of the holidays." },
    { p: 29, pos: 'up', fr: 'récemment', lab: 'récemment', en: 'recently', ex: [["J'ai récemment changé de travail.", 'I recently changed jobs.']] },
    { p: 41, pos: 'down', fr: 'déjà', lab: 'déjà', en: 'already', ex: [["J'ai déjà mangé.", 'I have already eaten.']] },
    { p: 50, pos: 'up', fr: 'maintenant · en ce moment', lab: 'maintenant', en: 'now, at the moment', ex: [['Je pars maintenant.', 'I am leaving now.'], ['En ce moment, je travaille beaucoup.', 'At the moment, I am working a lot.']] },
    { p: 59, pos: 'down', fr: 'tout de suite', lab: 'tout de suite', en: 'right away', ex: [["J'arrive tout de suite !", 'I am coming right away!']] },
    { p: 71, pos: 'up', fr: 'bientôt', lab: 'bientôt', en: 'soon', ex: [['Le train arrive bientôt.', 'The train is arriving soon.']] },
    { p: 77, pos: 'low', fr: 'prochain · prochaine', lab: 'prochaine', en: 'next (the one just after this one)',
      ex: [['La semaine prochaine, je commence un cours de français.', 'Next week, I am starting a French course.'], ["L'année prochaine, nous partons en Italie.", 'Next year, we are going to Italy.']],
      tip: "<b>le</b> mois prochain · <b>la</b> semaine prochaine · <b>l'</b>année prochaine<br>After the noun it means <b>next</b>, counted from now. Before the noun it means next in a series: « la prochaine fois » = next time, « le prochain train » = the next train." },
    { p: 83, pos: 'down', fr: 'pas encore', lab: 'pas encore', en: 'not yet (it has not happened)', ex: [["Je n'ai pas encore fini.", "I haven't finished yet."]] },
    { p: 97, pos: 'up', fr: 'après', lab: 'après', en: 'after, afterwards', ex: [['On se voit après le cours.', 'See you after class.']] },
];
const LONG = [
    { fr: 'pendant', en: 'during, for: a finished stretch before now', bar: [18, 52], ex: [["J'ai habité à Paris pendant trois ans.", "I lived in Paris for three years (I don't live there now)."]] },
    { fr: 'depuis', en: 'since, for: started before now and still going', bar: [40, 70], arrow: true, ex: [["J'habite à Lyon depuis trois ans.", 'I have lived in Lyon for three years (I still live there).']] },
    { fr: 'longtemps', en: '(for) a long time', bar: [4, 96], ex: [["J'ai attendu longtemps.", 'I waited a long time.']] },
];
function dayWord(h) {
    if (h <= 8) return { k: 'a', fr: 'tôt', en: 'early', ex: [[`Je me lève tôt : à ${h} heures.`, `I get up early: at ${h}.`]] };
    if (h >= 21) return { k: 'c', fr: 'tard', en: 'late', ex: [[`Je me couche tard : à ${h} heures.`, `I go to bed late: at ${h}.`]] };
    return { k: 'b', fr: 'ni tôt ni tard', en: 'neither early nor late', ex: [[`À ${h} heures, ce n'est ni tôt ni tard.`, `At ${h}, it is neither early nor late.`]] };
}

const CSS = `
.tl{display:grid;gap:14px;max-width:760px}
.tl-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px}
.tl-card h3{font-size:17px;font-weight:800;color:#0f172a;margin:0}
.tl-hint{font-size:13px;color:#64748b;margin-top:2px}
.tl-top{display:flex;justify-content:flex-end;font-size:14px;color:#475569}
.tl-top label{display:flex;align-items:center;gap:8px;cursor:pointer;min-height:44px}
.tl-top input{width:18px;height:18px;accent-color:#4f46e5}
.tl-track{position:relative;margin:48px 12px 46px}
.tl-track.when{margin-bottom:76px}
.tl input[type=range]{width:100%;height:30px;margin:0;cursor:pointer}
.tl-f input[type=range]{accent-color:#059669}.tl-w input[type=range]{accent-color:#4f46e5}.tl-t input[type=range]{accent-color:#d97706}
.tl-stop{position:absolute;transform:translateX(-50%);background:none;border:0;cursor:pointer;font-size:13px;color:#64748b;white-space:nowrap;padding:4px;transition:color .2s}
.tl-stop.first{transform:none}.tl-stop.last{transform:translateX(-100%)}
.tl-stop.up{bottom:30px}.tl-stop.down{top:30px}.tl-stop.low{top:58px;font-size:12px;font-style:italic}
.tl-stop.on{font-weight:800}.tl-f .tl-stop.on{color:#047857}.tl-w .tl-stop.on{color:#4338ca}
.tl-stop:focus-visible,.tl-row:focus-visible{outline:3px solid #6366f1;outline-offset:2px;border-radius:8px}
.tl-now{position:absolute;left:50%;top:2px;height:26px;width:3px;margin-left:-1.5px;background:#4f46e5;border-radius:2px;pointer-events:none;opacity:.45}
.tl-ends{display:flex;justify-content:space-between;font-size:12px;color:#64748b;margin:-38px 12px 30px}
.tl-out{border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;min-height:72px;background:#f8fafc}
.tl-big{font-size:1.45rem;font-weight:900;cursor:pointer}
.tl-f .tl-big{color:#047857}.tl-w .tl-big{color:#4338ca}.tl-t .tl-big{color:#b45309}.tl-l .tl-big{color:#047857}
.tl-en{font-size:14px;color:#475569}
.tl-ex{margin-top:8px;font-size:16px;color:#0f172a;cursor:pointer}.tl-ex div{font-size:13px;color:#64748b}
.tl-tip{margin-top:10px;font-size:14px;line-height:1.5;background:#eef2ff;border-radius:10px;padding:8px 10px;color:#1e293b}
.tl-dots{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
.tl-dot{width:16px;height:16px;border-radius:4px;border:1px solid #cbd5e1;transition:background .3s,border-color .3s}
.tl-dot.on{background:#059669;border-color:#059669}
.tl-note{font-size:14px;color:#475569;margin-top:10px;line-height:1.55}
.tl-note b{cursor:pointer;color:#0f172a}
.tl-rows{margin:10px 0}
.tl-row{display:flex;align-items:center;gap:10px;padding:8px 0;cursor:pointer;background:none;border:0;width:100%;text-align:left;color:inherit;min-height:44px}
.tl-row .nm{width:96px;font-weight:800;font-size:15px;color:#334155}.tl-row.on .nm{color:#047857}
.tl-lane{position:relative;flex:1;height:16px}
.tl-bar{position:absolute;top:2px;height:12px;border-radius:6px;background:#059669;opacity:.4;transform-origin:left center;transition:opacity .3s}
.tl-row.on .tl-bar{opacity:1}
.tl-arr{position:absolute;top:7px;height:0;border-top:2px dashed #059669}
.tl-nowl{position:absolute;top:-6px;bottom:-6px;width:0;border-left:2px dashed #4f46e5;pointer-events:none}
.tl-grow{animation:tlgrow .9s ease-out}
@keyframes tlgrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.tl-day{position:relative;height:32px;margin:10px 12px 4px}
.tl-day .ln{position:absolute;left:0;right:0;top:15px;border-top:2px solid #cbd5e1}
.tl-sun{position:absolute;top:5px;width:22px;height:22px;margin-left:-11px;border-radius:50%;background:#f59e0b;transition:left .15s,background .3s}
.tl-chips{display:none;flex-wrap:wrap;gap:6px;margin:4px 0 12px}
.tl-chip{border:1px solid #e2e8f0;background:#fff;border-radius:999px;padding:6px 12px;min-height:36px;font-size:14px;color:#334155;cursor:pointer}
.tl-chip.low{font-style:italic}
.tl-f .tl-chip.on{background:#ecfdf5;border-color:#059669;color:#047857;font-weight:800}
.tl-w .tl-chip.on{background:#eef2ff;border-color:#6366f1;color:#3730a3;font-weight:800}
.tl-chip:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
@media (max-width:600px){
 .tl-track,.tl-track.when{margin:16px 4px 10px}
 .tl-stop{display:none}
 .tl-chips{display:flex}
 .tl-ends{margin:-6px 4px 6px}
 .tl-now{top:-4px;height:38px}
}
@media (prefers-reduced-motion:reduce){.tl *{transition:none!important;animation:none!important}}`;
function css() { if (!document.getElementById('tl-css')) { const s = document.createElement('style'); s.id = 'tl-css'; s.textContent = CSS; document.head.appendChild(s); } }

function mount(root, { say }) {
    css();
    root.innerHTML = `<div class="tl">
      <div class="tl-top"><label><input type="checkbox" id="tl-snd" checked> Sound on</label></div>
      <section class="tl-card tl-f"><h3>How often?</h3><p class="tl-hint">Drag from jamais (0%) to toujours (100%), or tap a word.</p>
        <div class="tl-track" id="tl-t1"><input type="range" min="0" max="100" aria-label="How often"></div>
        <div class="tl-out" id="tl-o1" aria-live="polite"></div></section>
      <section class="tl-card tl-w"><h3>When?</h3><p class="tl-hint">Drag from the past to the future. Maintenant is in the middle.</p>
        <div class="tl-track when" id="tl-t2"><div class="tl-now"></div><input type="range" min="0" max="100" aria-label="When"></div>
        <div class="tl-ends"><span>past</span><span>future</span></div>
        <div class="tl-out" id="tl-o2" aria-live="polite"></div>
        <p class="tl-note"><b data-fr="tout à l'heure. Je l'ai vu tout à l'heure. À tout à l'heure !">tout à l'heure</b> has no single point: a little while ago or in a little while. « Je l'ai vu tout à l'heure. » I saw him a little while ago. « À tout à l'heure ! » See you later!<br>
        <b data-fr="encore. Il pleut encore. Encore une fois !">encore</b> means still, again or more. « Il pleut encore. » It is still raining. « Encore une fois ! » One more time!</p></section>
      <section class="tl-card tl-l"><h3>How long?</h3><p class="tl-hint">Tap a line. The dashed line is now.</p>
        <div class="tl-rows" id="tl-rows"></div>
        <div class="tl-out" id="tl-o3" aria-live="polite"></div></section>
      <section class="tl-card tl-t"><h3>Tôt / tard</h3><p class="tl-hint">Drag across the day, from 6 h to 23 h.</p>
        <div class="tl-day"><div class="ln"></div><div class="tl-sun" id="tl-sun"></div></div>
        <div class="tl-track" style="margin:4px 12px 8px"><input id="tl-hr" type="range" min="6" max="23" step="1" value="7" aria-label="Hour of the day"></div>
        <div class="tl-ends" style="margin:0 12px 12px"><span>6 h · tôt</span><span>tard · 23 h</span></div>
        <div class="tl-out" id="tl-o4" aria-live="polite"></div></section>
    </div>`;
    const $ = (s) => root.querySelector(s);
    const snd = $('#tl-snd');
    let timer = null;
    const speak = (t) => { if (snd.checked && root.isConnected && root.contains(snd)) say(t); };
    const text = (s) => s.fr.replace(/ · /g, ', ') + '. ' + s.ex.map(e => e[0]).join(' ');
    const later = (s) => { clearTimeout(timer); timer = setTimeout(() => speak(text(s)), 380); };
    snd.addEventListener('change', () => { if (!snd.checked && window.speechSynthesis) speechSynthesis.cancel(); });
    root.querySelectorAll('.tl-note b').forEach(b => b.addEventListener('click', () => speak(b.dataset.fr)));

    function show(el, s, extra, auto) {
        el.innerHTML = `<span class="tl-big" role="button" tabindex="0">${esc(s.fr)}</span><div class="tl-en">${esc(s.en)}</div>${extra || ''}`
            + s.ex.map((e, i) => `<div class="tl-ex" data-i="${i}">${esc(e[0])}<div>${esc(e[1])}</div></div>`).join('')
            + (s.tip ? `<div class="tl-tip">${s.tip}</div>` : '');
        el.querySelector('.tl-big').addEventListener('click', () => speak(text(s)));
        el.querySelectorAll('.tl-ex').forEach(x => x.addEventListener('click', () => speak(s.ex[Number(x.dataset.i)][0])));
        if (auto) later(s);
    }
    function slider(trackSel, outSel, S, start, extra) {
        const tr = $(trackSel), sl = tr.querySelector('input'), out = $(outSel);
        let cur = -1;
        const stops = S.map((s, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'tl-stop ' + (s.pos || (i % 2 ? 'down' : 'up')) + (s.p < 5 ? ' first' : s.p > 95 ? ' last' : '');
            b.style.left = s.p + '%'; b.textContent = s.lab;
            b.addEventListener('click', () => { sl.value = s.p; go(true, true, true); });
            tr.appendChild(b); return b;
        });
        // on a phone the words do not fit on the line: they show as a row of buttons under it instead
        const chips = document.createElement('div');
        chips.className = 'tl-chips';
        const chipBtns = S.map((s) => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'tl-chip' + (s.pos === 'low' ? ' low' : ''); b.textContent = s.lab;
            b.addEventListener('click', () => { sl.value = s.p; go(true, true, true); });
            chips.appendChild(b); return b;
        });
        const after = tr.nextElementSibling && tr.nextElementSibling.classList.contains('tl-ends') ? tr.nextElementSibling : tr;
        after.after(chips);
        function go(snap, auto, again) {
            let k = 0;
            S.forEach((s, i) => { if (Math.abs(s.p - sl.value) < Math.abs(S[k].p - sl.value)) k = i; });
            if (snap) sl.value = S[k].p;
            if (k === cur) { if (again) later(S[k]); return; }
            cur = k;
            sl.setAttribute('aria-valuetext', S[k].fr);
            stops.forEach((b, i) => b.classList.toggle('on', i === k));
            chipBtns.forEach((b, i) => { b.classList.toggle('on', i === k); b.setAttribute('aria-pressed', i === k); });
            show(out, S[k], extra ? extra(S[k]) : '', auto);
        }
        sl.setAttribute('aria-valuetext', '');
        sl.value = start;
        sl.addEventListener('input', () => go(false, true));
        sl.addEventListener('change', () => go(true, true));
        // arrow keys go to the next or previous word (one step of 1% would snap back to the same word)
        sl.addEventListener('keydown', (e) => {
            const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
            if (!d) return;
            e.preventDefault();
            const k = Math.max(0, Math.min(S.length - 1, cur + d));
            sl.value = S[k].p; go(true, true);
        });
        go(true, false);
    }
    slider('#tl-t1', '#tl-o1', OFTEN, 47, s => `<div class="tl-dots" aria-label="${s.d.length} days out of 14">${Array.from({ length: 14 }, (_, i) => `<span class="tl-dot${s.d.includes(i) ? ' on' : ''}"></span>`).join('')}</div><div class="tl-en" style="font-size:12px;margin-top:2px">${s.d.length} days out of 14</div>`);
    slider('#tl-t2', '#tl-o2', WHEN, 50);

    const rowsBox = $('#tl-rows'), o3 = $('#tl-o3');
    const rows = LONG.map((s, i) => {
        const r = document.createElement('button');
        r.type = 'button'; r.className = 'tl-row';
        r.innerHTML = `<span class="nm">${esc(s.fr)}</span><span class="tl-lane"><span class="tl-bar" style="left:${s.bar[0]}%;width:${s.bar[1] - s.bar[0]}%"></span>${s.arrow ? '<span class="tl-arr" style="left:70%;width:16%"></span>' : ''}<span class="tl-nowl" style="left:70%"></span></span>`;
        r.addEventListener('click', () => pick(i, true));
        rowsBox.appendChild(r); return r;
    });
    function pick(i, auto) {
        rows.forEach((r, j) => r.classList.toggle('on', j === i));
        const b = rows[i].querySelector('.tl-bar'); b.classList.remove('tl-grow'); void b.offsetWidth; b.classList.add('tl-grow');
        show(o3, LONG[i], '', auto);
    }
    pick(1, false);

    const hr = $('#tl-hr'), sun = $('#tl-sun'), o4 = $('#tl-o4');
    let last = '';
    function day(auto) {
        const h = Number(hr.value), s = dayWord(h);
        sun.style.left = ((h - 6) / 17 * 100) + '%';
        sun.style.background = s.k === 'b' ? '#f59e0b' : s.k === 'a' ? '#fcd34d' : '#92400e';
        if (s.k + h !== last) { last = s.k + h; show(o4, s, `<div class="tl-en" style="margin-top:2px">${h} h</div>`, auto); }
    }
    hr.addEventListener('input', () => day(true));
    day(false);
}

window.VocabTools = window.VocabTools || {};
window.VocabTools[7] = { name: 'Time line', next: 'Try the time line', mount };
})();
