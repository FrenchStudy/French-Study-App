// tcf.js - the exam preparation question bank: shown in Writing and Speaking (TCF.browser), explained on exam.html.
// The questions follow the TCF Canada tasks; several also match TEF Canada sections (TASKS[k].exams).
// Content: content/tcf/index.json (the themes) and content/tcf/<slug>.json (one theme:
// its words and its 40 prompts with sample answers, from the TCF theme packs).
//
//   TCF.TASKS                       -> the task types (W1… S3) with their labels, length and checklist
//   await TCF.index()               -> { themes: [{ slug, fr, en, emoji, words, tasks }] }
//   await TCF.theme(slug)           -> { slug, fr, en, emoji, words: [...], prompts: [...] }
//   TCF.matches(theme, text)        -> theme words found in a text: [{ start, end, w }], longest first, no overlaps
//   TCF.highlight(theme, text)      -> escaped HTML with the theme words marked (tap to see the meaning)
//   TCF.wordsFor(theme, prompt, n)  -> the words its texts use, then more from the same group (up to n)
//   TCF.glossHtml(words)            -> a small list of words with meanings
//   TCF.writingTask / speakingTask  -> a task object for writing.html / speaking.html
(function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const TASKS = {
    W2: { kind: 'writing', label: 'Writing 2 · Experience or advice', short: 'Writing 2', exams: 'TCF writing task 2', words: [120, 150],
        what: 'Tell an experience or give advice: an introduction, two or three developed points, a conclusion.',
        consigne: 'Rédigez un texte de 120 à 150 mots.',
        include: ['An introduction that sets the scene', 'Two or three developed points with examples', 'A conclusion', 'Use some of the theme words'] },
    W3: { kind: 'writing', label: 'Writing 3 · Summary and opinion', short: 'Writing 3', exams: 'TCF writing task 3 · TEF writing section B (opinion part)', words: [120, 180],
        what: 'Two short documents with opposite views. Part 1: sum them up in your own words (about 50 words). Part 2: give your argued opinion (about 100 words).',
        consigne: 'Partie 1 : résumez les deux documents en 40 à 60 mots. Partie 2 : donnez votre opinion en 80 à 120 mots.',
        include: ['Part 1: a neutral summary of both documents, in your own words', 'Part 2: your opinion with two arguments', 'Linking words (d\'abord, cependant, en revanche, donc…)', 'Use some of the theme words'] },
    S2: { kind: 'speaking', label: 'Speaking 2 · Role-play', short: 'Speaking 2', exams: 'TCF speaking task 2 · TEF speaking section A', seconds: [180, 330],
        what: 'Role-play: the examiner plays the other person and you ask the questions. Greet and explain why you are calling, vary your questions, react to the answers, then close politely.',
        consigne: 'Posez des questions à l\'examinateur pour obtenir les informations dont vous avez besoin.',
        include: ['Greet and explain why you are calling', 'Ask 8–10 questions in different forms (est-ce que, inversion, quel…)', 'React to the answers', 'Close politely'] },
    S3: { kind: 'speaking', label: 'Speaking 3 · Opinion', short: 'Speaking 3', exams: 'TCF speaking task 3 · TEF speaking section B (arguing)', seconds: [120, 270],
        what: 'Give and defend an opinion: state your position, give two arguments with examples, concede a point, conclude. Then answer the examiner\'s challenge.',
        consigne: 'Donnez votre opinion et justifiez-la avec des arguments et des exemples.',
        include: ['State your position first', 'Two arguments with examples', 'Concede a point (certes…, mais…)', 'Conclude clearly'] },
};
TASKS.W1 = { kind: 'writing', label: 'Writing 1 · Short message', short: 'Writing 1', exams: 'TCF writing task 1', words: [60, 120],
    what: 'A short message (email, note, post) to describe, tell or invite.', consigne: 'Rédigez un message de 60 à 120 mots.',
    include: ['Greeting and closing suited to the reader', 'Answer every point of the task', 'Use some of the theme words'] };
TASKS.S1 = { kind: 'speaking', label: 'Speaking 1 · Interview', short: 'Speaking 1', exams: 'TCF speaking task 1', seconds: [60, 120],
    what: 'Guided interview: the examiner asks about you, your life and your plans.', consigne: 'Répondez aux questions de l\'examinateur.',
    include: ['Answer in full sentences', 'Give details and examples', 'Use some of the theme words'] };
const ORDER = ['W1', 'W2', 'W3', 'S1', 'S2', 'S3'];   // the bank shows only the tasks a theme has

let indexP = null;
const themes = {};
const index = () => indexP || (indexP = fetch('content/tcf/index.json').then(r => { if (!r.ok) throw new Error('Could not load the question bank.'); return r.json(); }));
function theme(slug) {
    if (!themes[slug]) themes[slug] = fetch(`content/tcf/${encodeURIComponent(slug)}.json`).then(r => {
        if (!r.ok) throw new Error('Could not load this theme.');
        return r.json();
    }).then(t => {
        t.words.forEach((w, i) => { w.i = i; try { w.re = new RegExp(w.rx, 'giu'); } catch (e) { w.re = null; } });
        t.prompts.forEach(p => { p.theme = t.slug; });
        return t;
    }).catch(err => { delete themes[slug]; throw err; });
    return themes[slug];
}

// Theme words in a text: longest matches first, no overlaps
function matches(t, text) {
    const found = [];
    t.words.forEach(w => {
        if (!w.re) return;
        w.re.lastIndex = 0;
        let m;
        while ((m = w.re.exec(text))) {
            if (!m[0]) { w.re.lastIndex++; continue; }
            found.push({ start: m.index, end: m.index + m[0].length, w });
        }
    });
    found.sort((a, b) => (b.end - b.start) - (a.end - a.start) || a.start - b.start);
    const kept = [];
    found.forEach(f => { if (!kept.some(k => f.start < k.end && k.start < f.end)) kept.push(f); });
    return kept.sort((a, b) => a.start - b.start);
}
const genderCls = (w) => w.g === 'm' ? 'tcf-m' : w.g === 'f' ? 'tcf-f' : 'tcf-x';
function highlight(t, text) {
    let html = '', at = 0;
    matches(t, text).forEach(({ start, end, w }) => {
        html += esc(text.slice(at, start));
        html += `<button type="button" class="tcf-w ${genderCls(w)}" data-tcf-word="${w.i}" title="${esc(w.fr)} = ${esc(w.en)}">${esc(text.slice(start, end))}</button>`;
        at = end;
    });
    return html + esc(text.slice(at));
}
const promptText = (p) => [...p.prompt, ...p.answer, p.followup || ''].join('\n');
// The theme words this prompt uses, in order, then words from the same group(s) up to n
function wordsFor(t, p, n = 12) {
    const used = [];
    matches(t, promptText(p)).forEach(({ w }) => { if (!used.includes(w)) used.push(w); });
    if (!n && used.length) return used.map(w => Object.assign({}, w, { _inText: true }));   // n = 0: only the words its texts use
    if (!n) n = 8;
    if (used.length >= n) return used.slice(0, n).map(w => Object.assign({}, w, { _inText: true }));
    const groups = {};
    used.forEach(w => { groups[w.group] = (groups[w.group] || 0) + 1; });
    const top = Object.keys(groups).sort((a, b) => groups[b] - groups[a]);
    const extra = t.words.filter(w => !used.includes(w))
        .sort((a, b) => (top.includes(a.group) ? top.indexOf(a.group) : 99) - (top.includes(b.group) ? top.indexOf(b.group) : 99) || a.i - b.i);
    return used.concat(extra).slice(0, Math.max(n, used.length)).map((w, k) => Object.assign({}, w, { _inText: k < used.length }));
}
function glossHtml(words) {
    return words.map(w => `<button type="button" data-tcf-say="${esc(w.fr)}" class="tcf-gloss text-left flex items-baseline gap-2 px-3 py-2 rounded-xl ${w._inText ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-100'} hover:border-indigo-300">
        <span class="font-semibold ${w.g === 'm' ? 'text-sky-700' : w.g === 'f' ? 'text-rose-600' : 'text-slate-900'}">${esc(w.fr)}</span><span class="text-sm text-slate-600">${esc(w.en)}</span></button>`).join('');
}
// "Theme words in this answer", or related theme words when the answer uses none
function answerWordsHtml(t, p, tone = 'amber') {
    const list = wordsFor(t, p, 0);
    const used = list.some(w => w._inText);
    return `<div class="border-t border-${tone}-200 pt-3 space-y-1.5"><h3 class="text-xs font-bold uppercase tracking-wide text-${tone}-900">${used ? 'Theme words in this answer' : 'Theme words you could use'}</h3>
        <div class="grid sm:grid-cols-2 gap-1.5">${glossHtml(list)}</div></div>`;
}
const answerText = (p) => p.answer.map(x => x.replace(/^- /, '• ')).join('\n');
const answerTextEn = (p) => (p.answer_en || []).map(x => x.replace(/^- /, '• ')).join('\n');
// The English of a sample answer, hidden until "English" is tapped (empty when there is none)
function answerEnHtml(p, tone = 'amber') {
    if (!(p.answer_en || []).length) return '';
    const li = (x) => /^- /.test(x);
    let html = '', inList = false;
    p.answer_en.forEach(x => {
        if (li(x) && !inList) { html += '<ul class="list-disc pl-5 space-y-0.5">'; inList = true; }
        if (!li(x) && inList) { html += '</ul>'; inList = false; }
        html += li(x) ? `<li>${esc(x.slice(2))}</li>` : `<p>${esc(x)}</p>`;
    });
    if (inList) html += '</ul>';
    return `<div data-tcf-en hidden class="space-y-2 text-sm text-slate-600 leading-relaxed border-t border-${tone}-200 pt-3">${html}
        ${p.followup_en ? `<p class="italic">${esc(p.followup_en)}</p>` : ''}</div>`;
}

// Task objects for the Writing and Speaking pages
function taskBase(t, p) {
    const T = TASKS[p.task];
    return { id: `tcf-${t.slug}-${p.id}`, tcf: { theme: t.slug, prompt: p.id }, level: 'B2', type: T.label, kindLabel: T.label,
        subject: t.en, title: p.title, include: T.include.slice(), bank: wordsFor(t, p, 12).map(w => [w.fr, w.en]) };
}
function writingTask(t, p) {
    const T = TASKS[p.task];
    const fr = p.task === 'W3' ? `${p.prompt.join('\n')}\n\n${T.consigne}` : `${p.prompt.join('\n')}\n${T.consigne}`;
    const en = (p.prompt_en || []).length ? `${p.prompt_en.join('\n')}\n\n${T.what}` : T.what;
    return Object.assign(taskBase(t, p), { fr, en, words: T.words.slice(), model: answerText(p) });
}
function speakingTask(t, p) {
    const T = TASKS[p.task];
    const fr = p.task === 'S3' ? `${p.title}\n${T.consigne}` : `${p.prompt.join('\n')}\n${T.consigne}`;
    const en = p.task === 'S3' ? `${p.title_en || ''}\n\n${T.what}` : (p.prompt_en || []).length ? `${p.prompt_en.join('\n')}\n\n${T.what}` : T.what;
    return Object.assign(taskBase(t, p), { fr, en: en.trim(), kind: p.task === 'S2' ? 'interaction' : 'opinion', seconds: T.seconds.slice(),
        sample: { fr: answerText(p), en: answerTextEn(p) }, followup: p.followup || '' });
}
// "tcf-<slug>-<W2.1>" -> { slug, id }
function parseId(id) {
    const m = /^tcf-(.+)-([WS]\d\.\d+)$/.exec(String(id || ''));
    return m ? { slug: m[1], id: m[2] } : null;
}
async function taskFromId(id) {
    const ref = parseId(id); if (!ref) return null;
    const t = await theme(ref.slug);
    const p = t.prompts.find(x => x.id === ref.id); if (!p) return null;
    return TASKS[p.task].kind === 'writing' ? writingTask(t, p) : speakingTask(t, p);
}
// Highlight colours and the tap-to-see-meaning bubble, for any page
function injectCss() {
    if (document.getElementById('tcf-css')) return;
    const s = document.createElement('style'); s.id = 'tcf-css';
    s.textContent = `.tcf-w{font:inherit;color:inherit;background:#fef3c7;border-radius:.3em;padding:0 .15em;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px;cursor:pointer}
.tcf-w.tcf-m{text-decoration-color:#0284c7}.tcf-w.tcf-f{text-decoration-color:#e11d48}.tcf-w.tcf-x{text-decoration-color:#64748b}
.tcf-w:hover,.tcf-w:focus-visible{background:#fde68a;outline:none}
.tcf-tip{position:fixed;z-index:80;max-width:min(22rem,calc(100vw - 2rem));background:#0f172a;color:#f8fafc;border-radius:.75rem;padding:.5rem .75rem;font-size:.9rem;line-height:1.35;box-shadow:0 10px 25px rgb(0 0 0/.2)}
.tcf-tip b{display:block}`;
    document.head.appendChild(s);
}
// Tap a marked word: hear it and see its meaning in a small bubble
function wire(root, getTheme, say) {
    injectCss();
    root.addEventListener('click', (e) => {
        const g = e.target.closest('[data-tcf-say]');
        if (g) { say && say(g.dataset.tcfSay); return; }
        const b = e.target.closest('[data-tcf-word]'); if (!b) return;
        const t = getTheme(); const w = t && t.words[Number(b.dataset.tcfWord)]; if (!w) return;
        say && say(w.fr);
        let tip = document.getElementById('tcf-tip');
        if (!tip) { tip = document.createElement('div'); tip.id = 'tcf-tip'; tip.className = 'tcf-tip'; tip.setAttribute('role', 'status'); document.body.appendChild(tip); }
        tip.innerHTML = `<b>${esc(w.fr)}</b>${esc(w.en)}`;
        const r = b.getBoundingClientRect();
        tip.style.left = Math.max(8, Math.min(r.left, innerWidth - tip.offsetWidth - 8)) + 'px';
        tip.style.top = (r.bottom + 6 + tip.offsetHeight > innerHeight ? r.top - tip.offsetHeight - 6 : r.bottom + 6) + 'px';
        tip.hidden = false;
        clearTimeout(wire.t); wire.t = setTimeout(() => { tip.hidden = true; }, 4000);
    });
}

// ---------- The exam questions inside Writing and Speaking ----------
// TCF.browser(root, { kind: 'writing' | 'speaking', href: (taskId) => url })
// Pick a task type and a theme, see its questions (with English), open one. The choice is remembered.
const BR_KEY = 'exam_browser';
const readPick = () => { try { return JSON.parse(localStorage.getItem(BR_KEY)) || {}; } catch (e) { return {}; } };
const savePick = (v) => { try { localStorage.setItem(BR_KEY, JSON.stringify(v)); } catch (e) {} };
// Questions practised: a written text checked, or a speaking answer recorded (task ids "tcf-…")
function practised() {
    const ids = new Set();
    ['writing_results', 'writing_drafts', 'speak_results'].forEach(k => {
        try { Object.keys(JSON.parse(localStorage.getItem(k)) || {}).forEach(id => { if (id.startsWith('tcf-')) ids.add(id); }); } catch (e) {}
    });
    return ids;
}
const lengthOf = (T) => T.words ? `${T.words[0]}–${T.words[1]} words` : `${Math.round(T.seconds[0] / 60)}–${Math.round(T.seconds[1] / 60 * 2) / 2} min`;
async function browser(root, opts) {
    injectCss();
    const kinds = ORDER.filter(k => TASKS[k].kind === opts.kind);
    const all = readPick(), pick = all[opts.kind] || {};
    let task = kinds.includes(pick.task) ? pick.task : kinds[0];
    let slug = all.theme || null, showEn = !!all.en, cur = null;
    const q = new URLSearchParams(location.search);
    if (kinds.includes(q.get('t'))) task = q.get('t');
    if (q.get('theme')) slug = q.get('theme');
    root.innerHTML = '<p class="text-sm text-slate-400 animate-pulse">Loading the questions…</p>';
    let ix;
    try { ix = await index(); } catch (e) { root.innerHTML = `<p class="text-sm text-rose-700">${esc(e.message)}</p>`; return; }
    if (!ix.themes.some(t => t.slug === slug)) slug = ix.themes[0].slug;
    const save = () => { const a = readPick(); a[opts.kind] = { task }; a.theme = slug; a.en = showEn; savePick(a); };

    const chip = (on) => `min-h-[40px] px-3 rounded-xl text-sm font-semibold border text-left transition ${on ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'}`;
    async function draw() {
        save();
        const T = TASKS[task];
        root.innerHTML = `
            <div class="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <div class="flex flex-wrap gap-2" role="tablist" aria-label="Task">${kinds.map(k => `<button type="button" data-br-task="${k}" role="tab" aria-selected="${k === task}" class="${chip(k === task)}">
                    <span class="block leading-tight">${esc(TASKS[k].label)}</span><span class="block text-xs font-medium ${k === task ? 'text-indigo-100' : 'text-slate-400'}">${lengthOf(TASKS[k])}</span></button>`).join('')}</div>
                <p class="text-sm text-slate-600">${esc(T.what)}</p>
                <div class="flex flex-wrap items-center gap-2">
                    <label class="text-sm font-semibold text-slate-700" for="br-theme">Theme</label>
                    <select id="br-theme" class="flex-1 min-w-[12rem] max-w-md text-base sm:text-sm px-3 py-2.5 bg-white border border-slate-200 rounded-xl">${ix.themes.map(t => `<option value="${esc(t.slug)}" ${t.slug === slug ? 'selected' : ''}>${t.emoji} ${esc(t.fr)} · ${esc(t.en)}</option>`).join('')}</select>
                    <button type="button" data-br-en aria-pressed="${showEn}" class="min-h-[40px] px-3 rounded-xl text-sm font-semibold border ${showEn ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'}">${showEn ? '✓ English shown' : 'Show English'}</button>
                    <a href="exam.html" class="text-sm font-semibold text-indigo-600 hover:underline px-1">How the exam works</a>
                </div>
            </div>
            <div id="br-list" class="grid grid-cols-1 md:grid-cols-2 gap-3"><p class="text-sm text-slate-400 animate-pulse">Loading…</p></div>
            <details id="br-words" class="bg-white border border-slate-200 rounded-2xl group"></details>`;
        let th;
        try { th = cur && cur.slug === slug ? cur : await theme(slug); } catch (e) { root.querySelector('#br-list').innerHTML = `<p class="text-sm text-rose-700">${esc(e.message)}</p>`; return; }
        cur = th;
        const done = practised();
        const list = th.prompts.filter(p => p.task === task);
        root.querySelector('#br-list').innerHTML = list.map((p, i) => {
            const id = `tcf-${th.slug}-${p.id}`;
            const fr = p.task === 'S3' ? '' : p.prompt.join(' ');
            const en = p.task === 'S3' ? '' : (p.prompt_en || []).join(' ');
            return `<a href="${esc(opts.href(id))}" class="group flex flex-col gap-1 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition rounded-2xl p-4">
                <span class="flex items-center justify-between gap-2"><span class="text-[11px] font-bold uppercase tracking-wide text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">${esc(TASKS[task].short)} · ${i + 1}</span>
                ${done.has(id) ? '<span class="shrink-0 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Practised</span>' : ''}</span>
                <span lang="fr" class="font-bold text-slate-900 leading-snug group-hover:text-indigo-700">${esc(p.title)}</span>
                ${showEn && p.title_en ? `<span class="text-sm text-slate-500 leading-snug">${esc(p.title_en)}</span>` : ''}
                ${fr ? `<span lang="fr" class="text-sm text-slate-600 leading-snug line-clamp-3">${esc(fr)}</span>` : ''}
                ${showEn && en ? `<span class="text-sm text-slate-500 italic leading-snug line-clamp-3">${esc(en)}</span>` : ''}
            </a>`;
        }).join('') || '<p class="text-sm text-slate-500">No questions of this type for this theme yet.</p>';
        root.querySelector('#br-words').innerHTML = `
            <summary class="list-none cursor-pointer flex items-center justify-between gap-2 p-4 [&::-webkit-details-marker]:hidden">
                <span class="font-bold text-slate-900">${th.emoji} Theme words <span class="font-semibold text-slate-400">(${th.words.length})</span></span>
                <span class="text-sm font-semibold text-indigo-600 group-open:hidden">Show</span><span class="text-sm font-semibold text-indigo-600 hidden group-open:inline">Hide</span></summary>
            <div class="px-4 pb-4 space-y-3">
                <a href="vocab.html?topic=tcf:${encodeURIComponent(th.slug)}" class="inline-flex items-center min-h-[40px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold">🗂️ Learn them in Vocab</a>
                <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5">${glossHtml(th.words)}</div>
            </div>`;
    }
    root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-br-task]');
        if (b) { task = b.dataset.brTask; draw(); return; }
        if (e.target.closest('[data-br-en]')) { showEn = !showEn; draw(); }
    });
    root.addEventListener('change', (e) => { if (e.target.id === 'br-theme') { slug = e.target.value; draw(); } });
    if (opts.say) root.addEventListener('click', (e) => { const g = e.target.closest('[data-tcf-say]'); if (g) opts.say(g.dataset.tcfSay); });
    await draw();
}
// Where a bank question lives: its page, and the list it belongs to
const taskPage = (id) => { const r = parseId(id); return r && r.id[0] === 'S' ? 'speaking.html' : 'writing.html'; };
const listHref = (id) => { const r = parseId(id); if (!r) return 'exam.html'; return r.id[0] === 'S' ? `speaking.html?mode=prep&t=${r.id.slice(0, 2)}&theme=${encodeURIComponent(r.slug)}` : `writing.html?tab=prep&t=${r.id.slice(0, 2)}&theme=${encodeURIComponent(r.slug)}`; };

window.TCF = { browser, practised, listHref, taskPage, answerEnHtml, answerTextEn,  answerWordsHtml, TASKS, ORDER, index, theme, matches, highlight, wordsFor, glossHtml, writingTask, speakingTask, taskFromId, parseId, wire, injectCss, answerText };
})();
