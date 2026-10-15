// js/lesson-kit.js - the Grammar course (lesson.html) and the hands-on lessons used by Vocab topics.
// Needs: js/ai.js (escapeHtml, speakFrench), js/conjugate.js, js/lessons-data.js,
// and js/lessons-index.js (theme titles for "See also" links).
//
// The Grammar course is the 78 grammar lessons plus the 44 verb (conjugation) lessons:
// a verb lesson that teaches the same thing as a grammar lesson is shown inside it ("Verb forms"),
// the others are their own lessons (id "v6"), placed where they belong in each level.
//
// LessonKit.mount(rootElement, {
//     section: 'grammar',
//     pagePath: 'lesson.html', param: 'g',   // deep link: lesson.html?g=33
//     keepParams: { tab: 'lessons' },         // extra URL params to keep (optional)
//     intro: '<p>…</p>',                     // HTML shown above the list (optional)
//     onViewChange: (isLessonOpen) => {}      // e.g. hide the page's own tabs (optional)
// }) -> { open(id, push), showList(push), route(params) }

window.currentPracticeTarget = '';   // used by the clock and weather widgets in two interactive lessons

const LessonKit = (function () {
    const db = window.mySupabase;
    const C = window.Conjugator;
    const L = window.LESSONS || { grammar: {}, grammarLevels: [], conjugation: {}, conjugationLevels: [] };

    // Interactive lessons (hand-built pages in content/)
    const INTERACTIVE = [
        { id: 'lalphabet', emoji: '🔤', title: "L'alphabet", blurb: 'The alphabet and spelling out loud.', level: 'A1', path: 'content/vocab/lalphabet.html' },
        { id: 'nombres', emoji: '🔢', title: 'Les nombres', blurb: 'Numbers from 0 upwards, with audio.', level: 'A1', path: 'content/vocab/nombres.html', theme: 4 },
        { id: 'noms-prenoms', emoji: '🪪', title: 'Noms et prénoms', blurb: 'First names, surnames and introducing yourself.', level: 'A1', path: 'content/vocab/noms-prenoms.html' },
        { id: 'ladresse', emoji: '🏠', title: "L'adresse", blurb: 'Saying and understanding an address.', level: 'A1', path: 'content/vocab/ladresse.html' },
        { id: 'objets-personnels', emoji: '🎒', title: 'Objets personnels', blurb: 'Everyday personal objects.', level: 'A1', path: 'content/vocab/objets-personnels.html', theme: 17 },
        { id: 'objets-classe', emoji: '✏️', title: 'Objets de la classe', blurb: 'Classroom objects.', level: 'A1', path: 'content/vocab/objets-classe.html' },
        { id: 'nationalites', emoji: '🌍', title: 'Les nationalités', blurb: 'Countries and nationalities.', level: 'A1', path: 'content/vocab/nationalites.html', theme: 10, grammar: [27] },
        { id: 'professions', emoji: '👩‍⚕️', title: 'Les professions', blurb: 'Jobs, with and without an article.', level: 'A1', path: 'content/vocab/professions.html', theme: 11, grammar: [11] },
        { id: 'famille-proche', emoji: '👨‍👩‍👧', title: 'La famille', blurb: 'An interactive family tree.', level: 'A1', path: 'content/vocab/famille-proche.html', theme: 9 },
        { id: 'lheure-prix', emoji: '⏰', title: "L'heure et les prix", blurb: 'Telling the time and prices, with a practice clock.', level: 'A1', path: 'content/vocab/lheure-prix.html', theme: 6, widget: 'clock' },
        { id: 'meteo-date-jours', emoji: '⛅', title: 'Météo, date et jours', blurb: 'Weather, days and dates, with a sentence builder.', level: 'A1', path: 'content/vocab/meteo-date-jours.html', theme: 8, widget: 'meteo' },
        { id: 'loisirs-hobbies', emoji: '⚽', title: 'Les loisirs', blurb: 'Hobbies and free time.', level: 'A1', path: 'content/vocab/loisirs-hobbies.html', theme: 26 },
        // Grammar practice pages, shown inside their grammar topics
        { id: 'articles-definis-indefinis-partitifs', emoji: '📰', title: 'Les articles', blurb: 'le, un, du: definite, indefinite and partitive.', level: 'A1', path: 'content/grammar/articles-definis-indefinis-partitifs.html', embedIn: [2, 3] },
        { id: 'prepositions-temps-lieu', emoji: '📍', title: 'Prépositions de temps et de lieu', blurb: 'à, en, dans, depuis, pendant...', level: 'A2', path: 'content/grammar/prepositions-temps-lieu.html', embedIn: [10, 28] }
    ];
    const VOCAB_LESSONS = INTERACTIVE.filter(x => !x.embedIn);

    // ---------- The Grammar course ----------
    // Verb lessons merged into the grammar lesson that teaches the same thing
    const MERGE = { 5: [4, 5], 13: [9], 14: [8], 15: [11, 12], 16: [13], 17: [15], 18: [7], 23: [14], 24: [16],
        32: [19], 33: [18], 35: [21], 36: [24], 39: [23], 40: [22], 42: [20], 45: [31], 47: [27], 48: [26],
        49: [28], 50: [30], 52: [32], 59: [29] };
    // Teaching order per level: numbers are grammar lessons, "vN" are verb lessons of their own
    const ORDER = [
        [1, 2, 3, 4, 'v1', 'v2', 5, 'v3', 'v6', 6, 7, 8, 9, 10, 11, 12, 13, 14],
        ['v10', 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 'v17', 25, 26, 27, 28, 29, 30, 31],
        [32, 33, 34, 35, 'v25', 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
        [47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 'v33'],
        ['v34', 'v35', 61, 62, 63, 64, 65, 66, 67, 'v39', 68, 'v36', 'v37', 'v38', 69, 70, 'v40'],
        [71, 'v43', 72, 73, 'v41', 74, 75, 76, 77, 'v42', 'v44', 78]
    ];
    const COURSE_LEVELS = ORDER.map((ids, i) => [(L.grammarLevels[i] || [`Level ${i + 1}`])[0], ids]);
    const COURSE_IDS = ORDER.flat();
    const isVerbId = (id) => typeof id === 'string' && /^v\d+$/.test(id);
    // Where each old conjugation lesson now lives
    const CONJ_HOME = {};
    Object.entries(MERGE).forEach(([g, cs]) => cs.forEach(c => { CONJ_HOME[c] = Number(g); }));
    COURSE_IDS.filter(isVerbId).forEach(id => { CONJ_HOME[Number(id.slice(1))] = id; });
    const courseCache = {};
    function courseGet(id) {
        if (courseCache[id]) return courseCache[id];
        let t = null;
        if (isVerbId(id)) {
            const c = L.conjugation[Number(id.slice(1))];
            if (c) t = { ...c, verbs: true, forms: [] };
        } else if (L.grammar[id]) {
            const forms = (MERGE[id] || []).map(c => L.conjugation[c]).filter(Boolean);
            t = { ...L.grammar[id], verbs: forms.length > 0, forms };
        }
        if (t) { t.n = COURSE_IDS.indexOf(id) + 1; courseCache[id] = t; }
        return t;
    }
    const courseIdOf = (raw) => /^v\d+$/.test(String(raw)) ? String(raw) : Number(raw);

    // Where each kind of lesson lives
    const URLS = {
        grammar: (id) => `lesson.html?g=${encodeURIComponent(id)}`,
        conjugation: (n) => `lesson.html?g=${encodeURIComponent(CONJ_HOME[n] || 'v' + n)}`,
        interactive: (id) => `vocab.html?lesson=${encodeURIComponent(id)}`,
        theme: (n) => `vocab.html?topic=theme:${encodeURIComponent(n)}`,
        verb: (v) => `conjugations.html?verb=${encodeURIComponent(v)}`
    };

    const SECTIONS = {
        grammar: { name: 'Grammar', prefix: 'g', levels: () => COURSE_LEVELS, get: courseGet }
    };

    // ---------- Helpers ----------
    const plain = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const toText = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent.trim(); };
    const levelCode = (name) => String(name).split(':')[0];
    if (!window.speakText) window.speakText = (text) => speakFrench(String(text || '').replace(/\(e\)|\(s\)/g, ''));

    // ---------- Progress: this device, plus user_progress when logged in ----------
    const store = {
        get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    };
    let done = store.get('lessons_done', {});
    // Verb lessons keep their old progress key (c:6), so earlier ticks still count
    const doneKey = (section, id) => isVerbId(id) ? `c:${id.slice(1)}` : `${SECTIONS[section].prefix}:${id}`;
    const isDone = (section, id) => !!done[doneKey(section, id)];
    async function setDone(section, id, value) {
        done = store.get('lessons_done', {});
        if (value) done[doneKey(section, id)] = true; else delete done[doneKey(section, id)];
        store.set('lessons_done', done);
        if (value && typeof Activity !== 'undefined') Activity.record();
        try {
            const { data: { user } } = await db.auth.getUser();
            if (!user) return;
            await db.from('user_progress').upsert({
                user_id: user.id, module_type: isVerbId(id) ? 'lesson-conjugation' : 'lesson-' + section,
                module_id: isVerbId(id) ? id.slice(1) : String(id),
                completed: value, updated_at: new Date()
            }, { onConflict: 'user_id, module_type, module_id' });
        } catch (err) {
            console.warn('Progress saved on this device only.', err);
        }
    }

    // ---------- Search: every word must match; French and English grammar names are treated alike ----------
    const SYNONYMS = [['subjonc', 'subjunc'], ['imparf', 'imperf'], ['pronom', 'pronoun'], ['passif', 'passive'],
        ['gerondif', 'gerund'], ['plus-que-parfait', 'pluperfect'], ['passe compose', 'perfect'], ['nombre', 'number'],
        ['heure', 'time'], ['famille', 'family']];
    const queryWords = (raw) => plain(raw).replace(/^(le|la|les|l')\s*/, '').split(/\s+/).filter(Boolean);
    function matches(text, words) {
        const hay = plain(text);
        return words.every(w => hay.includes(w) ||
            SYNONYMS.some(([a, b]) => (w.startsWith(a) && hay.includes(b)) || (w.startsWith(b) && hay.includes(a))));
    }

    // ---------- Lesson building blocks ----------
    function card(title, inner, extra = '') {
        return `<section class="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 ${extra}">
            ${title ? `<h2 class="text-sm font-bold uppercase tracking-wide text-slate-500">${title}</h2>` : ''}${inner}</section>`;
    }

    function dataTable(t) {
        const fr = new Set(t.fr || []);
        const head = t.head && t.head.some(h => h) ? `<thead><tr>${t.head.map(h => `<th class="text-left px-3 py-2 font-semibold text-slate-600 bg-slate-50">${h}</th>`).join('')}</tr></thead>` : '';
        const body = t.rows.map(r => `<tr class="border-t border-slate-100">${r.map((cell, i) => {
            const isFr = fr.has(i) && String(cell).trim();
            const nowrap = i === 0 && toText(cell).length <= 16 ? ' whitespace-nowrap' : '';
            return isFr
                ? `<td class="px-3 py-2 align-top${nowrap}"><button type="button" data-say="${escapeHtml(toText(cell))}" class="text-left font-semibold text-slate-900 hover:text-indigo-700">${cell}</button></td>`
                : `<td class="px-3 py-2 align-top text-slate-600${nowrap}">${cell}</td>`;
        }).join('')}</tr>`).join('');
        return `<figure class="space-y-1">
            ${t.cap ? `<figcaption class="text-sm font-bold text-slate-800">${escapeHtml(t.cap)}</figcaption>` : ''}
            <div class="overflow-x-auto border border-slate-200 rounded-xl"><table class="w-full text-sm">${head}<tbody>${body}</tbody></table></div>
        </figure>`;
    }

    function verbTable(t) {
        const verbs = t.verbs.map(v => C.find(v)).filter(Boolean);
        const tense = C.tenses.find(x => x.key === t.tense);
        const cols = verbs.map(v => C.forms(v, t.tense));
        const rows = cols[0] || [];
        const body = rows.map((r0, i) => `<tr class="border-t border-slate-100">
            <td class="px-3 py-2 text-slate-500 whitespace-nowrap">${escapeHtml(r0.cp)}</td>
            ${cols.map((col, j) => {
                const r = col[i];
                return r ? `<td class="px-3 py-2 whitespace-nowrap"><button type="button" data-say="${escapeHtml(r.say)}" class="text-left font-semibold text-slate-900 hover:text-indigo-700">${C.highlight(verbs[j], t.tense, i, r.cf)}</button></td>` : '<td></td>';
            }).join('')}</tr>`).join('');
        return `<figure class="space-y-1">
            <figcaption class="text-sm font-bold text-slate-800">${escapeHtml(t.cap || '')}${tense ? ` <span class="font-normal text-slate-500">· ${escapeHtml(tense.name)}</span>` : ''}</figcaption>
            <div class="overflow-x-auto border border-slate-200 rounded-xl"><table class="w-full text-sm">
                <thead><tr><th class="bg-slate-50"></th>${verbs.map(v => `<th class="text-left px-3 py-2 font-semibold text-slate-600 bg-slate-50"><a class="hover:text-indigo-700" href="${URLS.verb(v.disp)}">${escapeHtml(v.disp)}</a></th>`).join('')}</tr></thead>
                <tbody>${body}</tbody></table></div>
        </figure>`;
    }

    // "See also" in the cheat sheet points at lessons by their old numbers ("Grammar topics 15 to 17",
    // "Conjugaison sheet topic 21", "Vocab Blocks 9 and 11"). Turn it into links named after each lesson or topic,
    // and keep the sentences that are plain notes ("Types 3 and mixed are at B2.").
    const themeTitle = (n) => ((window.LESSON_INDEX || {}).themes || {})[n];
    const link = (href, text) => `<a class="text-indigo-700 font-semibold hover:underline" href="${href}">${escapeHtml(text)}</a>`;
    const REF = /(Grammar topics?|Conjugaison (?:sheet )?topics?|Vocab (?:sheet )?Blocks?|Blocks?|topics?)|(?<![A-Za-z\/\d])(\d+)(?:\s+to\s+(\d+))?(?![\d\/])/g;
    function seeAlsoParts(text, fromVerbs, out) {
        String(text || '').split(/;\s+|\.\s+(?=[A-Z])/).forEach(clause => {
            let kind = null, found = false;
            if (/verb finder/.test(clause)) { out.verbTables = true; found = true; }
            if (/Vocab sheet/.test(clause)) found = true;
            for (const m of clause.matchAll(REF)) {
                if (m[1]) {
                    kind = /^Grammar/.test(m[1]) ? 'g' : /^Conjugaison/.test(m[1]) ? 'c' : /Block/.test(m[1]) ? 'v' : (fromVerbs ? 'c' : 'g');
                    continue;
                }
                if (!kind) continue;
                found = true;
                const a = Number(m[2]), z = m[3] ? Number(m[3]) : a;
                for (let n = a; n <= z; n++) {
                    if (kind === 'v') out.themes.push(n);
                    else out.lessons.push(kind === 'c' ? CONJ_HOME[n] : n);
                }
            }
            const note = clause.trim().replace(/\.$/, '');
            if (!found && note) out.notes.push(note + '.');
        });
        return out;
    }
    function seeAlsoHtml(id, t) {
        const out = seeAlsoParts(t.see, isVerbId(id), { lessons: [], themes: [], notes: [], verbTables: false });
        (t.forms || []).forEach(f => seeAlsoParts(f.see, true, out));
        const lessons = [...new Set(out.lessons)].filter(x => x !== undefined && x !== id && courseGet(x)).sort((a, b) => courseGet(a).n - courseGet(b).n);
        const themes = [...new Set(out.themes)].filter(n => themeTitle(n));
        const rows = [];
        if (lessons.length || out.verbTables) rows.push(`<div><span class="font-semibold text-slate-700">Related lessons:</span> ${[
            ...lessons.map(x => link(URLS.grammar(x), `${courseGet(x).n}. ${courseGet(x).title}`)),
            ...(out.verbTables ? [link('conjugations.html', 'Verb tables')] : [])].join(' · ')}</div>`);
        if (themes.length) rows.push(`<div><span class="font-semibold text-slate-700">Vocab topics:</span> ${themes.map(n => link(URLS.theme(n), themeTitle(n))).join(' · ')}</div>`);
        const notes = [...new Set(out.notes)];
        if (notes.length) rows.push(`<p class="text-slate-500">${notes.map(escapeHtml).join(' ')}</p>`);
        return rows.length ? `<section class="lk-see text-sm text-slate-600 space-y-1.5 border-t border-slate-200 pt-4"><h2 class="text-sm font-bold uppercase tracking-wide text-slate-500">See also</h2>${rows.join('')}</section>` : '';
    }

    function examplesBlock(ex) {
        return `<ul class="divide-y divide-slate-100">${ex.map(([fr, en]) => `
            <li class="py-2 flex items-start gap-3">
                <button type="button" data-say="${escapeHtml(fr)}" class="shrink-0 w-10 h-10 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700" aria-label="Listen">🔊</button>
                <span><span class="block text-base text-slate-900">${escapeHtml(fr)}</span><span class="block text-sm text-slate-500">${escapeHtml(en)}</span></span>
            </li>`).join('')}</ul>`;
    }

    function drillBlock(drill) {
        return `<ol class="space-y-2">${drill.map(([qn, ans], i) => `
            <li class="border border-slate-100 rounded-xl p-3">
                <div class="text-base text-slate-900"><span class="text-slate-400 font-bold mr-1">${i + 1}.</span>${qn}</div>
                <button type="button" data-reveal class="mt-2 min-h-[40px] px-3 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg">Show answer</button>
                <div class="hidden mt-2 text-base font-semibold text-emerald-800">${ans}
                    <button type="button" data-say="${escapeHtml(toText(ans))}" class="ml-1 text-indigo-600 text-sm" aria-label="Listen">🔊</button></div>
            </li>`).join('')}</ol>
            <button type="button" data-reveal-all class="min-h-[44px] px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl">Show all answers</button>`;
    }

    // Grammar topics 2, 3, 10 and 28 have a hand-built practice page shown inside them
    function embeddedPractice(section, id) {
        if (section !== 'grammar') return '';
        return INTERACTIVE.filter(x => (x.embedIn || []).includes(id)).map(x =>
            card(`▶️ Interactive practice: ${escapeHtml(x.title)}`,
                `<div data-interactive="${x.id}" class="text-base"><p class="text-sm text-indigo-600 animate-pulse">Loading…</p></div>`,
                'border-emerald-200')).join('');
    }

    function lessonParts(t, ruleTitle) {
        const parts = [];
        if (t.rule && t.rule.length) parts.push(card(ruleTitle, t.rule.map(p => `<p class="text-base text-slate-800 leading-relaxed">${p}</p>`).join('')));
        if (t.tables && t.tables.length) parts.push(card('Tables', t.tables.map(tb => tb.tense ? verbTable(tb) : dataTable(tb)).join('') +
            '<p class="text-xs text-slate-400">Tap any French word to hear it.</p>'));
        if (t.likes && t.likes.length) parts.push(card('Verbs that follow the same pattern', t.likes.map(g => `
            <div><div class="text-sm font-semibold text-slate-700 mb-1">${escapeHtml(g.label)}</div>
            <div class="flex flex-wrap gap-1.5">${g.verbs.map(v => `<a href="${URLS.verb(v)}" class="text-sm px-2 py-1 bg-slate-100 hover:bg-indigo-100 rounded-lg text-slate-700">${escapeHtml(v)}</a>`).join('')}</div></div>`).join('')));
        if (t.ex && t.ex.length) parts.push(card('Examples', examplesBlock(t.ex)));
        if (t.watch) parts.push(card('⚠️ Watch out', `<div class="text-base text-amber-900 leading-relaxed">${t.watch}</div>`, 'bg-amber-50 border-amber-200'));
        return parts;
    }

    function topicBody(section, id, t) {
        const parts = lessonParts(t, 'The rule');
        parts.push(embeddedPractice(section, id));
        if (t.drill && t.drill.length) parts.push(card('Practice', drillBlock(t.drill)));
        // The verb forms that go with this lesson
        (t.forms || []).forEach(f => {
            parts.push(`<h2 class="pt-4 text-xl font-black text-slate-900 flex items-center gap-2"><span class="text-xs font-bold uppercase tracking-wide text-violet-700 bg-violet-50 px-2 py-1 rounded-full">Verb forms</span>${escapeHtml(f.title)}</h2>`);
            parts.push(...lessonParts(f, 'How to form it'));
            if (f.drill && f.drill.length) parts.push(card('Practice the forms', drillBlock(f.drill)));
        });
        parts.push(seeAlsoHtml(id, t));
        return parts.join('');
    }

    // Fill every [data-interactive] placeholder with its lesson page
    async function loadInteractive(container) {
        for (const box of container.querySelectorAll('[data-interactive]')) {
            const item = INTERACTIVE.find(x => x.id === box.dataset.interactive);
            if (!item) continue;
            try {
                const res = await fetch(item.path);
                if (!res.ok) throw new Error(res.status);
                box.innerHTML = await res.text();
                if (item.widget === 'clock') bindClockModuleEvents(box);
                if (item.widget === 'meteo') bindMeteoModuleEvents(box);
            } catch (err) {
                box.innerHTML = '<p class="text-sm text-rose-700">This lesson could not be loaded. Check your connection and try again.</p>';
            }
        }
    }

    // Tell phone users when a table continues off-screen
    function markWideTables(container) {
        container.querySelectorAll('.overflow-x-auto').forEach(box => {
            if (box.scrollWidth > box.clientWidth + 4 && !box.nextElementSibling?.classList.contains('swipe-hint')) {
                box.insertAdjacentHTML('afterend', '<p class="swipe-hint text-xs text-slate-400 text-right">Swipe sideways to see more →</p>');
            }
        });
    }

    // ---------- Widgets used by two interactive lessons ----------
    function bindClockModuleEvents(container) {
        const hourInput = container.querySelector("#fc-hour");
        const minInput = container.querySelector("#fc-min");
        const outputCurrent = container.querySelector("#fc-out-current");

        if (!hourInput || !minInput || !outputCurrent) return;

        const hours = ["", "une heure", "deux heures", "trois heures", "quatre heures", "cinq heures", "six heures", "sept heures", "huit heures", "neuf heures", "dix heures", "onze heures", "douze heures"];
        const numbers = ["zéro", "une", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf", "vingt", "vingt et un", "vingt-deux", "vingt-trois", "vingt-quatre", "vingt-cinq", "vingt-six", "vingt-sept", "vingt-huit", "vingt-neuf", "trente", "trente et un", "trente-deux", "trente-trois", "trente-quatre", "trente-cinq", "trente-six", "trente-sept", "trente-huit", "trente-neuf", "quarante", "quarante et un", "quarante-deux", "quarante-trois", "quarante-quatre", "quarante-cinq", "quarante-six", "quarante-sept", "quarante-huit", "quarante-neuf", "cinquante", "cinquante et un", "cinquante-deux", "cinquante-trois", "cinquante-quatre", "cinquante-cinq", "cinquante-six", "cinquante-sept", "cinquante-huit", "cinquante-neuf"];

        function getPeriod(hour) {
            if (hour >= 5 && hour < 12) return "du matin";
            if (hour >= 12 && hour < 18) return "de l'après-midi";
            return "du soir";
        }

        function updateClock() {
            let h = parseInt(hourInput.value, 10);
            let m = parseInt(minInput.value, 10);

            if (isNaN(h)) h = 0;
            if (isNaN(m)) m = 0;

            h = Math.max(0, Math.min(23, h));
            m = Math.max(0, Math.min(59, m));

            if (h === 0 && m === 0) {
                outputCurrent.textContent = "Il est minuit pile.";
                currentPracticeTarget = outputCurrent.textContent;
                return;
            }
            if (h === 12 && m === 0) {
                outputCurrent.textContent = "Il est midi pile.";
                currentPracticeTarget = outputCurrent.textContent;
                return;
            }

            let h12 = h % 12;
            if (h12 === 0) h12 = 12;

            let timeStr = "";
            if (m === 0) {
                timeStr = `${hours[h12]} pile ${getPeriod(h)}`;
            } else if (m === 15) {
                timeStr = `${hours[h12]} et quart ${getPeriod(h)}`;
            } else if (m === 30) {
                timeStr = `${hours[h12]} et demie ${getPeriod(h)}`;
            } else if (m === 45) {
                let nextHour = (h12 % 12) + 1;
                let nextPeriod = (nextHour === 1 && h >= 11 && h < 12) ? "de l'après-midi" : getPeriod(h);
                timeStr = `${hours[nextHour]} moins le quart ${nextPeriod}`;
            } else if (m > 45) {
                let nextHour = (h12 % 12) + 1;
                let diff = 60 - m;
                timeStr = `${hours[nextHour]} moins ${numbers[diff]} ${getPeriod(h)}`;
            } else {
                timeStr = `${hours[h12]} ${numbers[m]} ${getPeriod(h)}`;
            }

            outputCurrent.textContent = `Il est ${timeStr}.`;
            currentPracticeTarget = outputCurrent.textContent;
        }

        ['input', 'change', 'keyup'].forEach(evt => {
            hourInput.addEventListener(evt, updateClock);
            minInput.addEventListener(evt, updateClock);
        });

        updateClock();
    }

    function bindMeteoModuleEvents(container) {
        const daySelect = container.querySelector("#meteo-day");
        const monthSelect = container.querySelector("#meteo-month");
        const condSelect = container.querySelector("#meteo-condition");
        const output = container.querySelector("#meteo-output");

        if (!daySelect || !monthSelect || !condSelect || !output) return;

        function updateMeteo() {
            const dayText = daySelect.value;
            const monthText = monthSelect.value;
            const condText = condSelect.value;
            
            const vowelMonths = ['avril', 'août', 'octobre'];
            const prefix = vowelMonths.includes(monthText.toLowerCase()) ? "d'" : "de ";
            
            const result = `Aujourd'hui, nous sommes ${dayText} ${prefix}${monthText} et ${condText.toLowerCase()}.`;
            output.textContent = result;
            currentPracticeTarget = result;
        }

        daySelect.addEventListener("change", updateMeteo);
        monthSelect.addEventListener("change", updateMeteo);
        condSelect.addEventListener("change", updateMeteo);
        updateMeteo();
    }

    // ---------- Clicks inside any lesson browser ----------
    document.addEventListener('click', (e) => {
        const say = e.target.closest('.lk-root [data-say]');
        if (say) { speakText(say.dataset.say); return; }
        const rev = e.target.closest('.lk-root [data-reveal]');
        if (rev) { rev.nextElementSibling.classList.remove('hidden'); rev.remove(); return; }
        const all = e.target.closest('.lk-root [data-reveal-all]');
        if (all) {
            all.closest('.lk-view').querySelectorAll('[data-reveal]').forEach(b => { b.nextElementSibling.classList.remove('hidden'); b.remove(); });
            all.remove();
        }
    });

    // ---------- Level colours (full class names so the CSS build keeps them) ----------
    const LEVEL_STYLE = {
        A1: { solid: 'bg-emerald-500', soft: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-400', ring: 'ring-emerald-200', grad: 'from-emerald-400 to-teal-500', bar: 'bg-emerald-500', stroke: '#10b981' },
        A2: { solid: 'bg-teal-500', soft: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-400', ring: 'ring-teal-200', grad: 'from-teal-400 to-cyan-500', bar: 'bg-teal-500', stroke: '#14b8a6' },
        B1: { solid: 'bg-sky-500', soft: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-400', ring: 'ring-sky-200', grad: 'from-sky-400 to-blue-500', bar: 'bg-sky-500', stroke: '#0ea5e9' },
        B2: { solid: 'bg-indigo-500', soft: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-400', ring: 'ring-indigo-200', grad: 'from-indigo-400 to-violet-500', bar: 'bg-indigo-500', stroke: '#6366f1' },
        C1: { solid: 'bg-purple-500', soft: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-400', ring: 'ring-purple-200', grad: 'from-purple-400 to-fuchsia-500', bar: 'bg-purple-500', stroke: '#a855f7' },
        C2: { solid: 'bg-rose-500', soft: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-400', ring: 'ring-rose-200', grad: 'from-rose-400 to-orange-400', bar: 'bg-rose-500', stroke: '#f43f5e' }
    };
    const styleOf = (code) => LEVEL_STYLE[code] || LEVEL_STYLE.A1;

    // ---------- The lesson browser: a learning path, one level at a time ----------
    function mount(root, opts) {
        const section = opts.section;
        const sec = SECTIONS[section];
        const param = opts.param;
        const keep = opts.keepParams || {};
        const pageTitle = document.title;
        const LEVEL_KEY = 'lk_level_' + section;
        let current = null;
        let level = store.get(LEVEL_KEY, null);

        root.classList.add('lk-root');
        root.innerHTML = `
            <div class="lk-list space-y-4">
                ${opts.intro || ''}
                <div class="flex flex-col md:flex-row md:items-center gap-3">
                    <div class="lk-levels flex gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto" role="tablist" aria-label="Level"></div>
                    <input type="search" class="lk-search md:ml-auto w-full md:w-72 text-base md:text-sm px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="${escapeHtml(opts.searchPlaceholder || 'Search, e.g. subjonctif')}">
                </div>
                <div class="lk-results hidden space-y-5"></div>
                <div class="lk-pathview space-y-4">
                    <div class="lk-banner"></div>
                    <div class="lk-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"></div>
                </div>
            </div>
            <article class="lk-view hidden">
                <div class="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
                    <div class="space-y-4 min-w-0">
                        <div class="flex items-center justify-between gap-2">
                            <button type="button" class="lk-back min-h-[44px] px-1 text-sm font-semibold text-slate-600 hover:text-indigo-600">← All lessons</button>
                            <span class="lk-crumb text-xs font-bold px-2 py-1 rounded-full"></span>
                        </div>
                        <header class="space-y-1">
                            <h1 class="lk-title text-2xl lg:text-3xl font-black text-slate-900 leading-tight"></h1>
                            <p class="lk-blurb text-base text-slate-600"></p>
                        </header>
                        <div class="lk-body space-y-4"></div>
                        <button type="button" class="lk-done min-h-[48px] px-5 rounded-xl font-bold"></button>
                        <div class="grid grid-cols-2 gap-2">
                            <button type="button" class="lk-prev min-h-[56px] text-left px-3 py-2 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-sm disabled:opacity-40"></button>
                            <button type="button" class="lk-next min-h-[56px] text-right px-3 py-2 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-sm disabled:opacity-40"></button>
                        </div>
                    </div>
                    <aside class="lk-side hidden lg:block lg:sticky lg:top-4 lg:self-start"></aside>
                </div>
            </article>`;
        const q = (cls) => root.querySelector('.lk-' + cls);
        const levels = () => sec.levels();
        const ids = () => levels().flatMap(([, list]) => list);
        const toId = courseIdOf;
        const levelEntry = (id) => levels().find(([, list]) => list.includes(id));
        const levelOf = (id) => { const lv = levelEntry(id); return lv ? levelCode(lv[0]) : ''; };
        const url = (id) => {
            const p = new URLSearchParams(keep);
            if (id !== undefined) p.set(param, id);
            const s = p.toString();
            return opts.pagePath + (s ? '?' + s : '');
        };
        const scrollTop = () => { const sc = root.closest('.overflow-y-auto'); if (sc) sc.scrollTop = 0; else window.scrollTo(0, 0); };
        const nodeLabel = (id, t) => (t && t.n) || id;

        // Default level: the one you saved, else the first with unfinished lessons
        function currentLevel() {
            const all = levels();
            const found = all.find(([name]) => levelCode(name) === level);
            if (found) return found;
            return all.find(([, list]) => list.some(id => !isDone(section, id))) || all[0];
        }

        function renderLevels(activeName) {
            const single = levels().length < 2;   // one level: nothing to choose
            q('levels').classList.toggle('hidden', single);
            q('search').classList.toggle('md:ml-auto', !single);
            q('levels').innerHTML = levels().map(([name, list]) => {
                const code = levelCode(name);
                const n = list.filter(id => isDone(section, id)).length;
                const on = name === activeName;
                return `<button type="button" role="tab" aria-selected="${on}" data-level="${code}" class="shrink-0 px-3.5 py-1.5 rounded-lg text-sm font-bold transition ${on ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
                    ${code}<span class="ml-1.5 text-xs font-semibold ${on ? styleOf(code).text : 'text-slate-400'}">${n}/${list.length}</span>
                </button>`;
            }).join('');
        }

        function nextUp(list) { return list.find(id => !isDone(section, id)); }

        function renderPath() {
            done = store.get('lessons_done', {});
            const [name, list] = currentLevel();
            const code = levelCode(name);
            const st = styleOf(code);
            renderLevels(name);
            const n = list.filter(id => isDone(section, id)).length;
            const nxt = nextUp(list);
            const pct = list.length ? Math.round(n / list.length * 100) : 0;
            const levelTitle = String(name).split(':').slice(1).join(':').trim();

            // Continue banner: progress for this level and the next lesson
            q('banner').innerHTML = `
                <div class="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div class="sm:w-72 shrink-0">
                        <div class="text-xs font-bold uppercase tracking-wide ${st.text}">${escapeHtml(sec.name)} · ${code}${levelTitle ? ' · ' + escapeHtml(levelTitle) : ''}</div>
                        <div class="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full ${st.bar} rounded-full" style="width:${pct}%"></div></div>
                        <div class="mt-1 text-xs font-semibold text-slate-500">${n} of ${list.length} done</div>
                    </div>
                    ${nxt !== undefined ? `
                    <div class="flex-1 min-w-0 sm:border-l sm:border-slate-100 sm:pl-4">
                        <div class="text-xs font-bold text-slate-500">Continue with</div>
                        <div class="font-bold text-slate-900 truncate">${escapeHtml(sec.get(nxt).title)}</div>
                    </div>
                    <a href="${url(nxt)}" data-open="${escapeHtml(String(nxt))}" class="lk-start shrink-0 inline-flex items-center justify-center min-h-[44px] px-5 rounded-xl ${st.solid} text-white font-bold hover:opacity-90">Start →</a>`
                    : `<div class="flex-1 font-bold text-emerald-700">Level ${code} complete! 🎉</div>`}
                </div>`;

            // Lesson cards
            q('grid').innerHTML = list.map(id => {
                const t = sec.get(id);
                const d = isDone(section, id);
                const isNext = id === nxt;
                const status = d ? '<span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Done</span>'
                    : isNext ? `<span class="text-xs font-bold ${st.text} ${st.soft} px-2 py-0.5 rounded-full">Next</span>` : '';
                return `<a href="${url(id)}" data-open="${escapeHtml(String(id))}" class="lk-card group flex gap-3 bg-white border ${isNext ? st.border + ' ring-2 ' + st.ring : 'border-slate-200'} hover:border-indigo-400 hover:shadow-md transition rounded-2xl p-4">
                    <span class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black ${d ? 'bg-emerald-50 text-emerald-700' : st.soft + ' ' + st.text}">${escapeHtml(String(nodeLabel(id, t)))}</span>
                    <span class="min-w-0 flex-1">
                        <span class="flex items-start justify-between gap-2"><span class="font-bold text-slate-900 leading-snug group-hover:text-indigo-700">${escapeHtml(t.title)}</span>${status}</span>
                        <span class="block text-sm text-slate-500 leading-snug mt-0.5 line-clamp-2">${escapeHtml(t.blurb || '')}</span>
                        ${t.verbs ? `<span class="inline-block mt-2 text-[11px] font-bold uppercase tracking-wide text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">${t.forms.length ? '+ verb forms' : 'Verbs'}</span>` : ''}
                    </span>
                </a>`;
            }).join('');
        }

        // Search: a plain list of matches across all levels
        function renderResults(words) {
            const html = levels().map(([levelName, list]) => {
                const items = list.map(id => ({ id, t: sec.get(id) }))
                    .filter(({ t }) => t && matches([t.title, t.blurb || '', ...(t.forms || []).map(f => f.title)].join(' '), words));
                if (!items.length) return '';
                return `<section class="space-y-2">
                    <h2 class="text-base font-black text-slate-900">${escapeHtml(levelName)}</h2>
                    <div class="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden lg:grid lg:grid-cols-2 lg:divide-y-0 lg:gap-px lg:bg-slate-100">
                        ${items.map(({ id, t }) => {
                            const d = isDone(section, id);
                            return `<a href="${url(id)}" data-open="${escapeHtml(String(id))}" class="flex items-start gap-3 p-3 bg-white hover:bg-indigo-50/60 min-h-[56px]">
                                <span class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${d ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}">${d ? '✓' : escapeHtml(String(nodeLabel(id, t)))}</span>
                                <span class="min-w-0"><span class="block font-bold text-slate-900">${escapeHtml(t.title)}</span>
                                <span class="block text-sm text-slate-500">${escapeHtml(t.blurb || '')}</span></span></a>`;
                        }).join('')}
                    </div></section>`;
            }).join('');
            q('results').innerHTML = html || '<p class="text-sm text-slate-500">No lessons match your search.</p>';
        }

        function renderList() {
            done = store.get('lessons_done', {});
            const words = queryWords(q('search').value.trim());
            q('results').classList.toggle('hidden', !words.length);
            q('pathview').classList.toggle('hidden', !!words.length);
            if (words.length) renderResults(words); else renderPath();
        }

        function renderSide(id) {
            const [name, list] = levelEntry(id);
            const st = styleOf(levelCode(name));
            q('side').innerHTML = `
                <div class="bg-white border border-slate-200 rounded-2xl p-3">
                    <div class="text-xs font-bold uppercase tracking-wide ${st.text} px-1 pb-2">${escapeHtml(name)}</div>
                    <div class="max-h-[70vh] overflow-y-auto divide-y divide-slate-100">
                        ${list.map(x => `<a href="${url(x)}" data-open="${escapeHtml(String(x))}" class="flex items-center gap-2 px-1 py-2 text-sm rounded-lg ${x === id ? `${st.soft} font-bold text-slate-900` : 'text-slate-700 hover:bg-slate-50'}">
                            <span class="shrink-0 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${isDone(section, x) ? 'bg-emerald-500 text-white' : x === id ? `${st.solid} text-white` : 'bg-slate-100 text-slate-600'}">${isDone(section, x) ? '✓' : escapeHtml(String(nodeLabel(x, sec.get(x))))}</span>
                            <span class="truncate">${escapeHtml(sec.get(x).title)}</span></a>`).join('')}
                    </div>
                </div>`;
        }

        async function open(rawId, push) {
            const id = toId(rawId);
            const t = sec.get(id);
            if (!t) { showList(false); return; }
            current = id;
            level = levelOf(id);
            store.set(LEVEL_KEY, level);
            if (push) history.pushState({}, '', url(id));
            q('list').classList.add('hidden');
            q('view').classList.remove('hidden');
            if (opts.onViewChange) opts.onViewChange(true);
            scrollTop();
            const st = styleOf(level);
            q('crumb').className = `lk-crumb text-xs font-bold px-2 py-1 rounded-full ${st.soft} ${st.text}`;
            q('crumb').textContent = `${sec.name} · ${level}`;
            q('title').textContent = `${t.n}. ${t.title}`;
            q('blurb').textContent = t.blurb || '';
            document.title = `${t.title} - ${sec.name}`;
            q('body').innerHTML = topicBody(section, id, t);
            markWideTables(q('body'));
            renderFooter();
            await loadInteractive(q('body'));
        }

        function renderFooter() {
            const d = isDone(section, current);
            const btn = q('done');
            btn.textContent = d ? '✓ Done (tap to undo)' : 'Mark as done';
            btn.className = 'lk-done min-h-[48px] px-5 rounded-xl font-bold ' + (d ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-600 hover:bg-emerald-700 text-white');
            const list = ids();
            const i = list.indexOf(current);
            const prev = list[i - 1], next = list[i + 1];
            const label = (x) => escapeHtml(sec.get(x).title);
            q('prev').disabled = prev === undefined;
            q('prev').innerHTML = prev === undefined ? '' : `<span class="block text-xs text-slate-400">← Previous</span><span class="block font-semibold text-slate-800">${label(prev)}</span>`;
            q('next').disabled = next === undefined;
            q('next').innerHTML = next === undefined ? '' : `<span class="block text-xs text-slate-400">Next →</span><span class="block font-semibold text-slate-800">${label(next)}</span>`;
            q('prev').onclick = () => prev !== undefined && open(prev, true);
            q('next').onclick = () => next !== undefined && open(next, true);
            renderSide(current);
        }

        function showList(push) {
            current = null;
            if (push) history.pushState({}, '', url());
            q('view').classList.add('hidden');
            q('list').classList.remove('hidden');
            if (opts.onViewChange) opts.onViewChange(false);
            document.title = pageTitle;
            renderList();
        }

        function route(params) {
            const raw = params.get(param);
            if (raw && sec.get(toId(raw))) open(raw, false);
            else showList(false);
        }

        q('search').addEventListener('input', renderList);
        q('back').addEventListener('click', () => showList(true));
        q('done').addEventListener('click', async () => { await setDone(section, current, !isDone(section, current)); renderFooter(); });
        root.addEventListener('click', (e) => {
            const lv = e.target.closest('[data-level]');
            if (lv) { level = lv.dataset.level; store.set(LEVEL_KEY, level); renderPath(); return; }
            const item = e.target.closest('[data-open]');
            if (item) { e.preventDefault(); open(item.dataset.open, true); return; }
            // Links to another lesson of this same section open in place
            const a = e.target.closest('.lk-body a[href]');
            if (a) {
                const href = a.getAttribute('href');
                const [path, query] = href.split('?');
                if (path === opts.pagePath && query) {
                    const p = new URLSearchParams(query);
                    if (p.get(param) && sec.get(toId(p.get(param)))) { e.preventDefault(); open(p.get(param), true); }
                }
            }
        });

        return { open, showList, route, renderList, search: (text) => { q('search').value = text; renderList(); } };
    }

    return { mount, INTERACTIVE, VOCAB_LESSONS, URLS, plain, loadInteractive, CONJ_HOME, COURSE_LEVELS, courseGet, isDone: (id) => { done = store.get('lessons_done', {}); return isDone('grammar', id); } };
})();
