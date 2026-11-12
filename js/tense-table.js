// tense-table.js - Conjugations › « All tenses »: the basic forms every tense is built from (être, avoir,
// aller, faire, venir, the -ER / -IR / -RE endings, être / avoir in the imparfait and conditionnel), then one verb in
// every tense, in the order of the student's own tense sheet. Colours: green = the ending, violet = taken from the
// basic forms, amber = a stem that changes. Picking a verb highlights the basic column it uses.
// « Hide some to practise » blanks random cells to type in.
// Needs config.js (LocalStore) and js/conjugate.js (Conjugator). window.TenseTable.mount(el)
(function () {
'use strict';
const C = window.Conjugator;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PERSONS = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles'];
const RP = ['me', 'te', 'se', 'nous', 'vous', 'se'];
const VOWEL = /^[aeiouyâàäéèêëîïôöùûüœh]/i;
const END = 'text-emerald-700 font-bold', HELP = 'text-violet-700 font-bold', STEM = 'text-amber-700 font-bold';
const DEFAULT_VERBS = ['parler', 'finir', 'attendre', 'aller'];
const ER_KINDS = ['er', 'e_è', 'é_è', 'll', 'tt', 'yer', 'envoyer'];
const BASIC = ['être', 'avoir', 'aller', 'faire', 'venir'];

// The tenses, in the order of the tense sheet; « from » says what each one is built from
const HALVES = [
    [['pres', 'Présent', ''], ['imp', 'Impératif', 'present, no subject'], ['prog', 'Présent progressif', 'être + en train de + infinitive'],
     ['fp', 'Futur proche', 'aller + infinitive'], ['recent', 'Passé récent', 'venir + de + infinitive'], ['impf', 'Imparfait', 'nous form − ons + ais']],
    [['cond', 'Conditionnel', 'futur stem + ais'], ['fut', 'Futur simple', 'infinitive + ai'], ['cp', 'Conditionnel passé', 'aurais / serais + PP'],
     ['pqp', 'Plus-que-parfait', 'avais / étais + PP'], ['pc', 'Passé composé', 'avoir / être + PP'], ['subj', 'Subjonctif', 'que + ils form − ent + e']]
];

const form = (inf, key, i) => C.forms(C.find(inf), key)[i].cf;
// Which basic column a verb's present uses
function group(v) {
    if (ER_KINDS.includes(v.kind) || v.kind === 'ouv') return 'er';
    if (v.kind === 'ir') return 'ir';
    if (v.kind === 're') return 're';
    if (BASIC.includes(v.disp)) return v.disp;
    return null;
}
function groupNote(v) {
    const g = group(v), name = `<b>${esc(v.disp)}</b>`;
    if (v.kind === 'ouv') return `${name} ends in -ir but takes the <b>-ER</b> endings in the present (j'ouvre, tu ouvres…).`;
    if (g === 'er' || g === 'ir' || g === 're') return `${name} is an <b>-${g.toUpperCase()}</b> verb: its present uses the highlighted endings.`;
    if (g) return `${name} is one of the basic forms: its own column is highlighted.`;
    return `${name} is irregular: learn its present below. The amber letters show where its stem changes.`;
}

// ---------- One cell: { html, text } (null = no form, e.g. the imperative for je) ----------
const plain = (html) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
const wrap = (cls, t) => `<span class="${cls}">${esc(t)}</span>`;
const infFor = (v, i) => v.refl ? (VOWEL.test(v.inf) ? RP[i].slice(0, -1) + "'" : RP[i] + ' ') + v.inf : v.inf;
const ENDS = {
    impf: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'], cond: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'],
    fut: ['ai', 'as', 'a', 'ons', 'ez', 'ont'], subj: ['e', 'es', 'e', 'ions', 'iez', 'ent']
};
const PRES_ENDS = { er: ['e', 'es', 'e', 'ons', 'ez', 'ent'], ir: ['is', 'is', 'it', 'issons', 'issez', 'issent'], re: ['s', 's', '', 'ons', 'ez', 'ent'] };
// The ending in green; a stem that differs from the regular one in amber (viens, viennent, irai)
function ending(v, key, i, f) {
    if (key === 'pres' && v.kind === 'single') return esc(f);   // être, avoir, aller, faire: the whole form is learnt
    const m = v.refl ? f.match(/^((?:me|te|se|nous|vous) |[mts]')/) : null;
    const pre = m ? m[0] : '', body = f.slice(pre.length);
    const end = (key === 'pres' ? PRES_ENDS[group(v)] || ['s', 's', 't', 'ons', 'ez', 'ent'] : ENDS[key] || [])[i];
    if (end == null || !body.endsWith(end) || body.length === end.length) return esc(f);
    const stem = body.slice(0, body.length - end.length);
    const regFut = /re$/.test(v.inf) ? v.inf.slice(0, -1) : v.inf;
    const expected = key === 'pres' && group(v) !== 'ir' ? v.impf : (key === 'fut' || key === 'cond') ? regFut : null;
    const soft = (x) => x.replace(/ç$/, 'c').replace(/ge$/, 'g');
    const changed = expected && soft(stem) !== soft(expected);
    return esc(pre) + (changed ? wrap(STEM, stem) : esc(stem)) + (end ? wrap(END, end) : '');
}
// The past participle with its regular ending in green (parlé, fini, attendu)
function ppHtml(v, pp) {
    const g = group(v), e = { er: 'é', ir: 'i', re: 'u' }[g];
    const core = pp.replace(/\(.*$/, ''), tail = pp.slice(core.length);
    if (e && core.endsWith(e) && core === v.pp) return esc(core.slice(0, -e.length)) + wrap(END, e) + esc(tail);
    return esc(pp);
}
function cell(v, key, i) {
    if (key === 'imp') {
        const k = { 1: 0, 3: 1, 4: 2 }[i];
        const f = k == null ? null : (C.forms(v, 'imp')[k] || {}).cf;
        return f ? { html: esc(f) + ' !', text: f + ' !' } : null;
    }
    if (key === 'prog' || key === 'recent' || key === 'fp') {
        const helper = form({ prog: 'être', recent: 'venir', fp: 'aller' }[key], 'pres', i);
        const inf = infFor(v, i);
        const de = VOWEL.test(inf) ? "d'" : 'de ';
        const mid = key === 'prog' ? ' en train ' + de : key === 'recent' ? ' ' + de : ' ';
        return { html: wrap(HELP, helper) + esc(mid) + esc(inf), text: helper + mid + inf };
    }
    if (key === 'pc' || key === 'pqp' || key === 'cp') {
        const f = C.forms(v, key)[i].cf;
        const aux = C.find(v.aux === 'être' || v.refl ? 'être' : 'avoir');
        const af = C.forms(aux, { pc: 'pres', pqp: 'impf', cp: 'cond' }[key])[i].cf;
        const at = f.indexOf(af);
        if (at < 0) return { html: esc(f), text: f };
        const pp = f.slice(at + af.length).trim();
        return { html: esc(f.slice(0, at)) + wrap(HELP, af) + ' ' + ppHtml(v, pp), text: f };
    }
    const f = C.forms(v, key)[i].cf;
    if (key === 'subj') {
        const que = (i === 0 ? (VOWEL.test(f) ? "que j'" : 'que je ') : ['', 'que tu ', "qu'il ", 'que nous ', 'que vous ', "qu'ils "][i]);
        return { html: esc(que) + ending(v, key, i, f), text: que + f };
    }
    return { html: ending(v, key, i, f), text: f };
}

// ---------- State ----------
const S = {
    verbs: LocalStore.get('tense_table_verbs', DEFAULT_VERBS).filter(x => C.find(x)),
    verb: LocalStore.get('tense_table_verb', 'parler'),
    practise: false, hidden: new Set(), wide: true, el: null
};
if (!S.verbs.length) S.verbs = DEFAULT_VERBS.slice();
if (!S.verbs.includes(S.verb)) S.verb = S.verbs[0];

// ---------- Basic forms ----------
function basicColumns() {
    const pres = (inf) => [0, 1, 2, 3, 4, 5].map(i => form(inf, 'pres', i));
    const both = (key) => [0, 1, 2, 3, 4, 5].map(i => form('être', key, i) + ' / ' + form('avoir', key, i));
    return [
        ...BASIC.map(b => ({ id: b, title: b, cells: pres(b) })),
        { id: 'er', title: '-ER', sub: 'parler', cells: ['-e', '-es', '-e', '-ons', '-ez', '-ent'], sep: true },
        { id: 'ir', title: '-IR', sub: 'finir', cells: ['-is', '-is', '-it', '-issons', '-issez', '-issent'] },
        { id: 're', title: '-RE', sub: 'attendre', cells: ['-s', '-s', '— (none)', '-ons', '-ez', '-ent'] },
        { id: 'impf', title: 'être / avoir', sub: 'imparfait', cells: both('impf'), sep: true },
        { id: 'cond', title: 'être / avoir', sub: 'conditionnel', cells: both('cond') }
    ];
}
function renderBasic(v) {
    const cols = basicColumns(), on = group(v);
    const head = (c) => `${esc(c.title)}${c.sub ? `<span class="block font-normal text-xs text-slate-500">${esc(c.sub)}</span>` : ''}`;
    if (S.wide) {
        const td = (c, x, th) => `<${th ? 'th' : 'td'} class="text-left align-top py-1.5 px-2 border-b border-slate-100 ${c.id === on ? 'bg-emerald-50 text-emerald-800 font-bold' : th ? 'text-slate-900' : 'text-slate-700'}"${c.sep ? ' style="border-left:1px solid #cbd5e1"' : ''}>${x}</${th ? 'th' : 'td'}>`;
        return `<table class="w-full text-sm" style="table-layout:fixed">
            <thead><tr><th class="w-16"></th>${cols.map(c => td(c, head(c), true)).join('')}</tr></thead>
            <tbody>${PERSONS.map((p, i) => `<tr><td class="py-1.5 px-2 border-b border-slate-100 text-slate-500">${p}</td>${cols.map(c => td(c, esc(c.cells[i]))).join('')}</tr>`).join('')}</tbody></table>`;
    }
    // Phone: one small card per column
    return `<div class="grid grid-cols-2 sm:grid-cols-3 gap-2">${cols.map(c => `<div class="rounded-xl border p-2.5 ${c.id === on ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100'}">
        <div class="text-sm font-bold ${c.id === on ? 'text-emerald-800' : 'text-slate-900'} mb-1">${head(c)}</div>
        ${PERSONS.map((p, i) => `<div class="text-sm leading-snug"><span class="text-slate-400">${p}</span> <span class="${c.id === on ? 'text-emerald-800 font-bold' : 'text-slate-700'}">${esc(c.cells[i])}</span></div>`).join('')}</div>`).join('')}</div>`;
}

// ---------- The verb in every tense ----------
function cellHtml(v, key, i) {
    const c = cell(v, key, i);
    if (!c) return '<span class="text-slate-400">—</span>';
    if (S.practise && S.hidden.has(key + i)) return `<input type="text" data-ans="${esc(c.text)}" aria-label="${esc(PERSONS[i])}, ${esc(key)}" autocomplete="off" autocapitalize="off" spellcheck="false" class="w-full px-1.5 py-1 text-sm bg-white border-2 border-slate-200 rounded-lg focus:outline-none" lang="fr">`;
    return c.html;
}
function renderHalf(v, tenses) {
    if (S.wide) {
        return `<table class="w-full text-sm" style="table-layout:fixed">
            <thead><tr><th class="w-16"></th>${tenses.map(([k, name, from]) => `<th class="text-left align-top py-1.5 px-2 border-b border-slate-200 text-slate-900">${esc(name)}${from ? `<span class="block font-normal text-xs text-slate-500 leading-snug">${esc(from)}</span>` : ''}</th>`).join('')}</tr></thead>
            <tbody>${PERSONS.map((p, i) => `<tr><td class="py-1.5 px-2 border-b border-slate-100 text-slate-500 align-top">${p}</td>${tenses.map(([k]) => `<td class="align-top py-1.5 px-2 border-b border-slate-100 text-slate-800">${cellHtml(v, k, i)}</td>`).join('')}</tr>`).join('')}
            <tr><td class="py-1.5 px-2 text-xs text-slate-400 align-top">means</td>${tenses.map(([k]) => `<td class="align-top py-1.5 px-2 text-xs text-slate-500 italic">${esc(C.english(v, k))}</td>`).join('')}</tr></tbody></table>`;
    }
    return tenses.map(([k, name, from]) => `<div class="bg-white border border-slate-200 rounded-xl p-3">
        <div class="text-base font-bold text-slate-900">${esc(name)}</div>
        ${from ? `<div class="text-xs text-slate-500">${esc(from)}</div>` : ''}
        <div class="text-xs text-slate-500 italic mb-2">${esc(C.english(v, k))}</div>
        ${PERSONS.map((p, i) => `<div class="flex items-center gap-2 py-1 border-b border-slate-100 text-sm"><span class="w-16 shrink-0 text-slate-500">${p}</span><span class="flex-1 min-w-0 text-slate-800">${cellHtml(v, k, i)}</span></div>`).join('')}
    </div>`).join('');
}

function pickHidden(v) {
    const all = [];
    HALVES.flat().forEach(([k]) => PERSONS.forEach((p, i) => { if (cell(v, k, i)) all.push(k + i); }));
    for (let n = all.length - 1; n > 0; n--) { const r = Math.floor(Math.random() * (n + 1)); [all[n], all[r]] = [all[r], all[n]]; }
    S.hidden = new Set(all.slice(0, Math.round(all.length / 3)));
}

function render() {
    const el = S.el, v = C.find(S.verb);
    S.wide = matchMedia('(min-width: 1024px)').matches;
    const chip = (x) => `<span class="inline-flex items-center rounded-full border ${x === S.verb ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'}">
        <button type="button" data-verb="${esc(x)}" class="min-h-[40px] px-3 text-sm font-semibold" lang="fr">${esc(x)}</button>${DEFAULT_VERBS.includes(x) ? '' : `<button type="button" data-remove="${esc(x)}" class="min-h-[40px] pr-3 text-slate-400 hover:text-rose-600" aria-label="Remove ${esc(x)}">×</button>`}</span>`;
    el.innerHTML = `
    <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-semibold text-slate-500 mr-1">Your verb</span>
            ${S.verbs.map(chip).join('')}
            <form id="tt-add" class="inline-flex items-center gap-1">
                <input id="tt-new" list="tt-list" placeholder="+ Add a verb" aria-label="Add a verb" autocomplete="off" lang="fr" class="w-40 min-h-[40px] px-3 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2">
                <datalist id="tt-list">${C.verbs.map(x => `<option value="${esc(x.disp)}">`).join('')}</datalist>
            </form>
            <span id="tt-msg" class="text-sm text-rose-600"></span>
        </div>

        <section class="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 space-y-3">
            <h2 class="text-base font-black text-slate-900">Basic forms <span class="font-normal text-sm text-slate-500">· every tense below uses these</span></h2>
            ${renderBasic(v)}
            <p class="text-sm text-slate-600">${groupNote(v)}</p>
        </section>

        <section class="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 space-y-3">
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h2 class="text-base font-black text-slate-900" lang="fr">${esc(v.disp)} <span class="font-normal text-sm text-slate-500" lang="en">${esc(v.gloss || '')}</span></h2>
                <span class="text-sm text-slate-500"><span class="${END}">ending</span> · <span class="${HELP}">from the basic forms</span> · <span class="${STEM}">stem change</span></span>
                <label class="sm:ml-auto inline-flex items-center gap-2 min-h-[40px] text-sm font-semibold text-slate-700"><input type="checkbox" id="tt-practise" class="w-4 h-4 accent-indigo-600" ${S.practise ? 'checked' : ''}> Hide some to practise</label>
            </div>
            ${S.practise ? `<div class="flex flex-wrap items-center gap-2">
                <button type="button" id="tt-check" class="min-h-[40px] px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl">Check</button>
                <button type="button" id="tt-again" class="min-h-[40px] px-4 bg-white border border-slate-200 hover:border-indigo-300 text-sm font-semibold rounded-xl">New blanks</button>
                <span id="tt-score" class="text-sm font-bold text-slate-700"></span></div>` : ''}
            ${HALVES.map(h => S.wide ? `<div>${renderHalf(v, h)}</div>` : `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${renderHalf(v, h)}</div>`).join('')}
        </section>
    </div>`;
}

// Accept (e) and (s) as optional letters: « suis allée » is right for « suis allé(e) »
const norm = (s) => String(s).toLowerCase().replace(/[’]/g, "'").replace(/\s*!\s*$/, '').replace(/\s+/g, ' ').trim();
function isRight(typed, answer) {
    const re = norm(answer).replace(/[.*+?^${}|[\]\\]/g, '\\$&').replace(/\\?\((e|s)\\?\)/g, '$1?');
    return new RegExp('^' + re + '$').test(norm(typed));
}
function check() {
    let right = 0, total = 0;
    S.el.querySelectorAll('input[data-ans]').forEach(inp => {
        total++;
        const ok = isRight(inp.value, inp.dataset.ans);
        if (ok) right++;
        inp.classList.remove('border-slate-200', 'border-emerald-500', 'border-rose-400', 'bg-emerald-50', 'bg-rose-50');
        inp.classList.add(ok ? 'border-emerald-500' : 'border-rose-400', ok ? 'bg-emerald-50' : 'bg-rose-50');
        let hint = inp.nextElementSibling;
        if (!ok) {
            if (!hint) { hint = document.createElement('span'); hint.className = 'block text-xs text-rose-700'; inp.after(hint); }
            hint.textContent = inp.dataset.ans;
        } else if (hint) hint.remove();
    });
    const s = S.el.querySelector('#tt-score');
    if (s) s.textContent = `${right} / ${total} right`;
    if (right && typeof Activity !== 'undefined') Activity.record();
}

function mount(el) {
    S.el = el;
    render();
    el.addEventListener('click', (e) => {
        const pick = e.target.closest('[data-verb]'), rm = e.target.closest('[data-remove]');
        if (pick) { S.verb = pick.dataset.verb; LocalStore.set('tense_table_verb', S.verb); if (S.practise) pickHidden(C.find(S.verb)); render(); }
        else if (rm) {
            S.verbs = S.verbs.filter(x => x !== rm.dataset.remove); LocalStore.set('tense_table_verbs', S.verbs);
            if (S.verb === rm.dataset.remove) S.verb = S.verbs[0];
            render();
        } else if (e.target.id === 'tt-check') check();
        else if (e.target.id === 'tt-again') { pickHidden(C.find(S.verb)); render(); }
    });
    el.addEventListener('change', (e) => {
        if (e.target.id === 'tt-practise') { S.practise = e.target.checked; if (S.practise) pickHidden(C.find(S.verb)); render(); }
        if (e.target.id === 'tt-new') add(e.target.value);
    });
    el.addEventListener('submit', (e) => { if (e.target.id === 'tt-add') { e.preventDefault(); add(el.querySelector('#tt-new').value); } });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input[data-ans]')) { e.preventDefault(); check(); } });
    matchMedia('(min-width: 1024px)').addEventListener('change', render);
}
function add(text) {
    text = String(text || '').trim().toLowerCase();
    if (!text) return;
    const v = C.verbs.find(x => x.disp.toLowerCase() === text) || C.find(text);
    const msg = S.el.querySelector('#tt-msg');
    if (!v) { if (msg) msg.textContent = 'Not a French verb we know. Try an infinitive like « prendre ».'; return; }
    if (!S.verbs.includes(v.disp)) { S.verbs.push(v.disp); LocalStore.set('tense_table_verbs', S.verbs); }
    S.verb = v.disp; LocalStore.set('tense_table_verb', S.verb);
    if (S.practise) pickHidden(v);
    render();
}
window.TenseTable = { mount, cell, isRight };
})();
