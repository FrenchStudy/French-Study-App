// tense-table.js - the Conjugations « Verbs » view for one verb: every tense in the order of the student's tense sheet
// in three tables: present; past and conditional; future and subjonctif, and the basic forms every tense is built from at the bottom (être,
// avoir, aller, venir, the -ER / -IR / -RE endings; être / avoir in the imparfait, conditionnel, futur and subjonctif), with the
// column the verb uses highlighted. Colours: green = the ending, violet = from the basic forms (tap to jump to them),
// amber = a stem that changes. Tap a form to hear it. « Hide some to practise » blanks a third of the forms.
// Needs config.js (LocalStore), js/conjugate.js (Conjugator); window.speakText(text) for listening (optional).
// With no verb (« All » in the list): the pattern of every tense for -ER, -IR and -RE, endings only.
// window.TenseTable.mount(el) · .show(verb) · .showStructure() · .setPractise(on)
(function () {
'use strict';
const C = window.Conjugator;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PERSONS = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles'];
const RP = ['me', 'te', 'se', 'nous', 'vous', 'se'];
const VOWEL = /^[aeiouyâàäéèêëîïôöùûüœh]/i;
const END = 'text-emerald-700 font-bold', HELP = 'text-violet-700 font-bold', STEM = 'text-amber-700 font-bold';
const ER_KINDS = ['er', 'e_è', 'é_è', 'll', 'tt', 'yer', 'envoyer'];
const BASIC = ['être', 'avoir', 'aller', 'venir'];   // the verbs the tenses are built from

// The tenses, in the order of the tense sheet; « from » says what each one is built from
// Three tables: the present; the past and the conditional; the future and the subjonctif (each simple tense next to its
// compound partner)
const HALVES = [
    [['pres', 'Présent', ''], ['imp', 'Impératif', 'present, no subject'], ['prog', 'Présent progressif', 'être + en train de + infinitive'],
     ['fp', 'Futur proche', 'aller + infinitive'], ['recent', 'Passé récent', 'venir + de + infinitive']],
    [['pc', 'Passé composé', 'ai / suis + PP'], ['impf', 'Imparfait', 'nous form − ons + ais'], ['pqp', 'Plus-que-parfait', 'avais / étais + PP'],
     ['cond', 'Conditionnel', 'futur stem + ais'], ['cp', 'Conditionnel passé', 'aurais / serais + PP']],
    [['fut', 'Futur simple', 'infinitive + ai'], ['fa', 'Futur antérieur', 'aurai / serai + PP'], ['subj', 'Subjonctif', 'que + ils form − ent + e'],
     ['sp', 'Subjonctif passé', 'que + aie / sois + PP']]
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
const meaning = (v) => String(v && v.gloss || '').replace(/\s*;.*$/, '');
function groupShort(v) {
    const g = group(v);
    if (v.kind === 'ouv') return '-ER endings in the present';
    if (g === 'er' || g === 'ir' || g === 're') return `-${g.toUpperCase()} verb`;
    return g ? 'basic form' : 'irregular';
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
// A helper verb: tap it to see it in the basic forms
const jump = (t) => `<button type="button" data-jump class="${HELP} hover:underline" title="See it in the basic forms">${esc(t)}</button>`;
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
const queFor = (i, f) => i === 0 ? (VOWEL.test(f) ? "que j'" : 'que je ') : ['', 'que tu ', "qu'il ", 'que nous ', 'que vous ', "qu'ils "][i];
// What to say aloud for a form: the pronoun and the form (« je parle », « nous sommes en train de parler »)
function sayFor(key, i, text) {
    if (key === 'imp' || key === 'subj' || key === 'sp') return text.replace(/\s*!$/, '');
    const p = ['je', 'tu', 'il', 'nous', 'vous', 'ils'][i];
    return i === 0 && VOWEL.test(text) ? "j'" + text : p + ' ' + text;
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
        return { html: jump(helper) + esc(mid) + esc(inf), text: helper + mid + inf };
    }
    const AUX_TENSE = { pc: 'pres', pqp: 'impf', cp: 'cond', fa: 'fut', sp: 'subj' };
    if (AUX_TENSE[key]) {
        const f = C.forms(v, key)[i].cf;
        const aux = C.find(v.aux === 'être' || v.refl ? 'être' : 'avoir');
        const af = C.forms(aux, AUX_TENSE[key])[i].cf;
        const que = key === 'sp' ? queFor(i, f) : '';
        const at = f.indexOf(af);
        if (at < 0) return { html: esc(que + f), text: que + f };
        const pp = f.slice(at + af.length).trim();
        return { html: esc(que + f.slice(0, at)) + jump(af) + ' ' + ppHtml(v, pp), text: que + f };
    }
    const f = C.forms(v, key)[i].cf;
    if (key === 'subj') {
        const que = queFor(i, f);
        return { html: esc(que) + ending(v, key, i, f), text: que + f };
    }
    return { html: ending(v, key, i, f), text: f };
}

// ---------- State ----------
const S = { verb: null, structure: false, practise: false, hidden: new Set(), wide: true, el: null };

// ---------- Basic forms ----------
function basicColumns() {
    const pres = (inf) => [0, 1, 2, 3, 4, 5].map(i => form(inf, 'pres', i));
    const both = (key) => [0, 1, 2, 3, 4, 5].map(i => form('être', key, i) + ' / ' + form('avoir', key, i));
    return [
        // 1. the present
        [...BASIC.map(b => ({ id: b, title: b, cells: pres(b) })),
         { id: 'er', title: '-ER', sub: 'parler', cells: ['-e', '-es', '-e', '-ons', '-ez', '-ent'], sep: true },
         { id: 'ir', title: '-IR', sub: 'finir', cells: ['-is', '-is', '-it', '-issons', '-issez', '-issent'] },
         { id: 're', title: '-RE', sub: 'attendre', cells: ['-s', '-s', '— (none)', '-ons', '-ez', '-ent'] }],
        // 2. être / avoir in the tenses that build the compound tenses
        [{ id: 'impf', title: 'Imparfait', sub: '→ plus-que-parfait', cells: both('impf') },
         { id: 'cond', title: 'Conditionnel', sub: '→ conditionnel passé', cells: both('cond') },
         { id: 'fut', title: 'Futur simple', sub: '→ futur antérieur', cells: both('fut') },
         { id: 'subj', title: 'Subjonctif', sub: '→ subjonctif passé', cells: both('subj') }]
    ];
}
function basicTable(cols, on) {
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
function renderBasic(v) {
    const [present, helpers] = basicColumns(), on = v ? group(v) : null;
    return `<h3 class="text-sm font-bold text-slate-700">1. The present</h3>
        ${basicTable(present, on)}
        <h3 class="text-sm font-bold text-slate-700 pt-2">2. être / avoir in other tenses <span class="font-normal text-slate-500">· the helpers for the compound tenses</span></h3>
        ${basicTable(helpers, null)}`;
}

// ---------- The verb in every tense ----------
function cellHtml(v, key, i) {
    const c = cell(v, key, i);
    if (!c) return '<span class="text-slate-400">—</span>';
    if (S.practise && S.hidden.has(key + i)) return `<input type="text" data-ans="${esc(c.text)}" aria-label="${esc(PERSONS[i])}, ${esc(key)}" autocomplete="off" autocapitalize="off" spellcheck="false" class="w-full px-1.5 py-1 text-sm bg-white border-2 border-slate-200 rounded-lg focus:outline-none" lang="fr">`;
    return `<span data-say="${esc(sayFor(key, i, c.text))}" class="cursor-pointer hover:text-indigo-700">${c.html}</span>`;
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

// ---------- « All »: the pattern of every tense for regular -ER, -IR and -RE verbs (endings only, no example verb) ----------
const GROUPS = ['er', 'ir', 're'];
const STRUCT_NOTE = { subj: 'que + ils form − ent + ending', sp: 'que + aie / sois + past participle', pres: 'stem + ending', fut: 'infinitive + ending (-RE drops the e)', cond: 'infinitive + imparfait ending (-RE drops the e)',
    pc: 'avoir + past participle (some verbs take être)', imp: 'present, no subject' };
function structCell(key, g, i) {
    const E = (t) => wrap(END + ' whitespace-nowrap', t), nw = (h) => `<span class="whitespace-nowrap">${h}</span>`;
    const inf = '-' + g, futStem = g === 're' ? '-r' : '-' + g, pp = '-' + { er: 'é', ir: 'i', re: 'u' }[g], iss = g === 'ir' ? 'iss' : '';
    const AUX = { pc: 'pres', pqp: 'impf', cp: 'cond', fa: 'fut', sp: 'subj' };
    switch (key) {
        case 'pres': { const e = PRES_ENDS[g][i]; return e ? E('-' + e) : '—'; }
        case 'imp': { const k = { 1: 0, 3: 1, 4: 2 }[i]; if (k == null) return null; return E('-' + { er: ['e', 'ons', 'ez'], ir: ['is', 'issons', 'issez'], re: ['s', 'ons', 'ez'] }[g][k]) + ' !'; }
        case 'prog': return jump(form('être', 'pres', i)) + ' en train de ' + nw(esc(inf));
        case 'fp': return nw(jump(form('aller', 'pres', i)) + ' ' + esc(inf));
        case 'recent': return jump(form('venir', 'pres', i)) + ' ' + nw('de ' + esc(inf));
        case 'impf': return E('-' + iss + ENDS.impf[i]);
        case 'fut': case 'cond': return nw(esc(futStem) + E(ENDS[key][i]));
        case 'subj': return E('-' + iss + ENDS.subj[i]);   // « que » is in the card's note
        default: if (AUX[key]) return nw(jump(form('avoir', AUX[key], i)) + ' ' + E(pp));
    }
    return null;
}
function renderStructure() {
    return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${HALVES.flat().map(([k, name, from]) => `<div class="bg-white border border-slate-200 rounded-xl p-3">
        <div class="text-base font-bold text-slate-900">${esc(name)}</div>
        <div class="text-xs text-slate-500 mb-2">${esc(STRUCT_NOTE[k] || from)}</div>
        <table class="w-full text-sm" style="table-layout:fixed">
            <thead><tr><th class="w-14"></th>${GROUPS.map(g => `<th class="text-left py-1 px-1 border-b border-slate-200 text-slate-900">-${g.toUpperCase()}</th>`).join('')}</tr></thead>
            <tbody>${PERSONS.map((p, i) => `<tr><td class="py-1 px-1 border-b border-slate-100 text-slate-500 align-top">${p}</td>${GROUPS.map(g => { const c = structCell(k, g, i); return `<td class="py-1 px-1 border-b border-slate-100 text-slate-800 align-top">${c == null ? '<span class="text-slate-400">—</span>' : c}</td>`; }).join('')}</tr>`).join('')}</tbody>
        </table></div>`).join('')}</div>`;
}

function render() {
    const el = S.el, v = S.verb;
    if (!el || (!v && !S.structure)) return;
    S.wide = matchMedia('(min-width: 1024px)').matches;
    if (S.structure) {
        el.innerHTML = `<div class="space-y-4">
            <section class="space-y-3">
                <span class="text-sm text-slate-500"><span class="${END}">ending</span> · <span class="${HELP}">from the basic forms</span> · -er / -ir / -re = the infinitive</span>
                ${renderStructure()}
            </section>
            <section id="tt-basic" class="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 space-y-3">
                <h2 class="text-base font-black text-slate-900">Basic forms <span class="font-normal text-sm text-slate-500">· every tense above uses these</span></h2>
                ${renderBasic(null)}
            </section></div>`;
        return;
    }
    S.wide = matchMedia('(min-width: 1024px)').matches;
    const half = (h) => S.wide ? `<div${h.length < 5 ? ` style="width:${Math.round(h.length / 5 * 100 + 4)}%"` : ''}>${renderHalf(v, h)}</div>` : `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${renderHalf(v, h)}</div>`;
    el.innerHTML = `
    <div class="space-y-4">
        <section class="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 space-y-3">
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span class="text-sm text-slate-500"><span class="${END}">ending</span> · <span class="${HELP}">from the basic forms</span> · <span class="${STEM}">stem change</span> · tap a form to hear it</span>
                ${S.practise ? `<span class="sm:ml-auto flex flex-wrap items-center gap-2">
                    <button type="button" id="tt-check" class="min-h-[40px] px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl">Check</button>
                    <button type="button" id="tt-again" class="min-h-[40px] px-4 bg-white border border-slate-200 hover:border-indigo-300 text-sm font-semibold rounded-xl">New blanks</button>
                    <span id="tt-score" class="text-sm font-bold text-slate-700"></span></span>` : ''}
            </div>
            ${HALVES.map(half).join('')}
        </section>

        <section id="tt-basic" class="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 space-y-3">
            <h2 class="text-base font-black text-slate-900">Basic forms <span class="font-normal text-sm text-slate-500">· every tense above uses these</span></h2>
            ${renderBasic(v)}
            <p class="text-sm text-slate-600">${groupNote(v)}</p>
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
    el.addEventListener('click', (e) => {
        const say = e.target.closest('[data-say]');
        if (e.target.closest('[data-jump]')) el.querySelector('#tt-basic').scrollIntoView({ behavior: 'smooth', block: 'start' });
        else if (say) { if (window.speakText) window.speakText(say.dataset.say); }
        else if (e.target.id === 'tt-check') check();
        else if (e.target.id === 'tt-again') { pickHidden(S.verb); render(); }
    });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input[data-ans]')) { e.preventDefault(); check(); } });
    matchMedia('(min-width: 1024px)').addEventListener('change', render);
}
function showStructure() { S.structure = true; S.verb = null; render(); }
function show(v) { S.structure = false; S.verb = v; if (S.practise) pickHidden(v); render(); }
function setPractise(on) { S.practise = !!on; if (S.practise && S.verb) pickHidden(S.verb); render(); }
window.TenseTable = { mount, show, showStructure, setPractise, cell, isRight, groupShort };
})();
