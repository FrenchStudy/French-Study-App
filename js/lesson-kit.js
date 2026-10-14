// js/lesson-kit.js - shared lesson browser used by Grammar (lesson.html),
// Conjugations (Lessons tab) and Vocab (Lessons tab).
// Needs: js/ai.js (escapeHtml, speakFrench), js/conjugate.js, and js/lessons-data.js for grammar/conjugation.
//
// LessonKit.mount(rootElement, {
//     section: 'grammar' | 'conjugation' | 'interactive',
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
        { id: 'lalphabet', title: "L'alphabet", blurb: 'The alphabet and spelling out loud.', level: 'A1', path: 'content/vocab/lalphabet.html' },
        { id: 'nombres', title: 'Les nombres', blurb: 'Numbers from 0 upwards, with audio.', level: 'A1', path: 'content/vocab/nombres.html', theme: 4 },
        { id: 'noms-prenoms', title: 'Noms et prénoms', blurb: 'First names, surnames and introducing yourself.', level: 'A1', path: 'content/vocab/noms-prenoms.html' },
        { id: 'ladresse', title: "L'adresse", blurb: 'Saying and understanding an address.', level: 'A1', path: 'content/vocab/ladresse.html' },
        { id: 'objets-personnels', title: 'Objets personnels', blurb: 'Everyday personal objects.', level: 'A1', path: 'content/vocab/objets-personnels.html', theme: 17 },
        { id: 'objets-classe', title: 'Objets de la classe', blurb: 'Classroom objects.', level: 'A1', path: 'content/vocab/objets-classe.html' },
        { id: 'nationalites', title: 'Les nationalités', blurb: 'Countries and nationalities.', level: 'A1', path: 'content/vocab/nationalites.html', theme: 10, grammar: [27] },
        { id: 'professions', title: 'Les professions', blurb: 'Jobs, with and without an article.', level: 'A1', path: 'content/vocab/professions.html', theme: 11, grammar: [11] },
        { id: 'famille-proche', title: 'La famille', blurb: 'An interactive family tree.', level: 'A1', path: 'content/vocab/famille-proche.html', theme: 9 },
        { id: 'lheure-prix', title: "L'heure et les prix", blurb: 'Telling the time and prices, with a practice clock.', level: 'A1', path: 'content/vocab/lheure-prix.html', theme: 6, widget: 'clock' },
        { id: 'meteo-date-jours', title: 'Météo, date et jours', blurb: 'Weather, days and dates, with a sentence builder.', level: 'A1', path: 'content/vocab/meteo-date-jours.html', theme: 8, widget: 'meteo' },
        { id: 'loisirs-hobbies', title: 'Les loisirs', blurb: 'Hobbies and free time.', level: 'A1', path: 'content/vocab/loisirs-hobbies.html', theme: 26 },
        // Grammar practice pages, shown inside their grammar topics
        { id: 'articles-definis-indefinis-partitifs', title: 'Les articles', blurb: 'le, un, du: definite, indefinite and partitive.', level: 'A1', path: 'content/grammar/articles-definis-indefinis-partitifs.html', embedIn: [2, 3] },
        { id: 'prepositions-temps-lieu', title: 'Prépositions de temps et de lieu', blurb: 'à, en, dans, depuis, pendant...', level: 'A2', path: 'content/grammar/prepositions-temps-lieu.html', embedIn: [10, 28] }
    ];
    const VOCAB_LESSONS = INTERACTIVE.filter(x => !x.embedIn);

    // Where each kind of lesson lives
    const URLS = {
        grammar: (id) => `lesson.html?g=${encodeURIComponent(id)}`,
        conjugation: (id) => `conjugations.html?lesson=${encodeURIComponent(id)}`,
        interactive: (id) => `vocab.html?lesson=${encodeURIComponent(id)}`,
        theme: (n) => `vocab.html?deck=theme:${encodeURIComponent(n)}`,
        verb: (v) => `conjugations.html?verb=${encodeURIComponent(v)}`
    };

    const SECTIONS = {
        grammar: { name: 'Grammar', prefix: 'g', levels: () => L.grammarLevels, get: (id) => L.grammar[id] },
        conjugation: { name: 'Conjugation', prefix: 'c', levels: () => L.conjugationLevels, get: (id) => L.conjugation[id] },
        interactive: {
            name: 'Vocabulary lessons', prefix: 'i',
            levels: () => [['A1: Foundations', VOCAB_LESSONS.map(x => x.id)]],
            get: (id) => INTERACTIVE.find(x => x.id === id)
        }
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
    const doneKey = (section, id) => `${SECTIONS[section].prefix}:${id}`;
    const isDone = (section, id) => !!done[doneKey(section, id)];
    async function setDone(section, id, value) {
        done = store.get('lessons_done', {});
        if (value) done[doneKey(section, id)] = true; else delete done[doneKey(section, id)];
        store.set('lessons_done', done);
        try {
            const { data: { user } } = await db.auth.getUser();
            if (!user) return;
            await db.from('user_progress').upsert({
                user_id: user.id, module_type: 'lesson-' + section, module_id: String(id),
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

    // "Vocab Blocks 9, 11 and 17" / "Grammar topic 4" / "Conjugaison sheet topics 4 and 5" -> links
    function linkSeeAlso(text) {
        let html = escapeHtml(text);
        const linkNums = (str, makeHref) => str.replace(/\d+/g, n => `<a class="text-indigo-700 font-semibold underline" href="${makeHref(n)}">${n}</a>`);
        html = html.replace(/(Vocab (?:sheet )?Blocks?|Block)((?:\s*(?:\d+|,|and))+)/g, (m, word, nums) => word + linkNums(nums, URLS.theme));
        html = html.replace(/(Grammar topics?)((?:\s*(?:\d+|,|and))+)/g, (m, word, nums) => word + linkNums(nums, URLS.grammar));
        html = html.replace(/(Conjugaison (?:sheet )?topics?)((?:\s*(?:\d+|,|and))+)/g, (m, word, nums) => word + linkNums(nums, URLS.conjugation));
        return html;
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

    function topicBody(section, id, t) {
        const parts = [];
        if (t.rule && t.rule.length) parts.push(card('The rule', t.rule.map(p => `<p class="text-base text-slate-800 leading-relaxed">${p}</p>`).join('')));
        if (t.tables && t.tables.length) parts.push(card('Tables', t.tables.map(tb => tb.tense ? verbTable(tb) : dataTable(tb)).join('') +
            '<p class="text-xs text-slate-400">Tap any French word to hear it.</p>'));
        if (t.likes && t.likes.length) parts.push(card('Verbs that follow the same pattern', t.likes.map(g => `
            <div><div class="text-sm font-semibold text-slate-700 mb-1">${escapeHtml(g.label)}</div>
            <div class="flex flex-wrap gap-1.5">${g.verbs.map(v => `<a href="${URLS.verb(v)}" class="text-sm px-2 py-1 bg-slate-100 hover:bg-indigo-100 rounded-lg text-slate-700">${escapeHtml(v)}</a>`).join('')}</div></div>`).join('')));
        if (t.ex && t.ex.length) parts.push(card('Examples', examplesBlock(t.ex)));
        if (t.watch) parts.push(card('⚠️ Watch out', `<div class="text-base text-amber-900 leading-relaxed">${t.watch}</div>`, 'bg-amber-50 border-amber-200'));
        parts.push(embeddedPractice(section, id));
        if (t.drill && t.drill.length) parts.push(card('Practice', drillBlock(t.drill)));
        if (t.see) parts.push(`<p class="text-sm text-slate-600"><span class="font-semibold">See also:</span> ${linkSeeAlso(t.see)}</p>`);
        return parts.join('');
    }

    function interactiveBody(t) {
        const links = [];
        if (t.theme) links.push(`<a href="${URLS.theme(t.theme)}" class="text-indigo-700 font-semibold underline">Flashcards for this theme</a>`);
        (t.grammar || []).forEach(g => links.push(`<a href="${URLS.grammar(g)}" class="text-indigo-700 font-semibold underline">Grammar lesson ${g}${L.grammar[g] ? ': ' + escapeHtml(L.grammar[g].title) : ''}</a>`));
        return `<div data-interactive="${t.id}" class="bg-white border border-slate-200 rounded-2xl p-4 text-base"><p class="text-sm text-indigo-600 animate-pulse">Loading the lesson…</p></div>
            ${links.length ? `<p class="text-sm text-slate-600"><span class="font-semibold">Related:</span> ${links.join(' · ')}</p>` : ''}`;
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

    // ---------- The lesson browser ----------
    function mount(root, opts) {
        const section = opts.section;
        const sec = SECTIONS[section];
        const param = opts.param;
        const keep = opts.keepParams || {};
        const pageTitle = document.title;
        let current = null;

        root.classList.add('lk-root');
        root.innerHTML = `
            <div class="lk-list space-y-4">
                ${opts.intro || ''}
                <input type="search" class="lk-search w-full text-base px-3 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="${escapeHtml(opts.searchPlaceholder || 'Search, e.g. subjonctif')}">
                <div class="lk-groups space-y-5"></div>
            </div>
            <article class="lk-view hidden space-y-4">
                <div class="flex items-center justify-between gap-2">
                    <button type="button" class="lk-back min-h-[44px] px-1 text-sm font-semibold text-slate-600 hover:text-indigo-600">← All ${escapeHtml(sec.name.toLowerCase())}</button>
                    <span class="lk-crumb text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full"></span>
                </div>
                <header class="space-y-1">
                    <h1 class="lk-title text-2xl font-black text-slate-900 leading-tight"></h1>
                    <p class="lk-blurb text-base text-slate-600"></p>
                </header>
                <div class="lk-body space-y-4"></div>
                <button type="button" class="lk-done min-h-[48px] px-5 rounded-xl font-bold"></button>
                <div class="grid grid-cols-2 gap-2">
                    <button type="button" class="lk-prev min-h-[56px] text-left px-3 py-2 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-sm disabled:opacity-40"></button>
                    <button type="button" class="lk-next min-h-[56px] text-right px-3 py-2 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-sm disabled:opacity-40"></button>
                </div>
            </article>`;
        const q = (cls) => root.querySelector('.lk-' + cls);
        const ids = () => sec.levels().flatMap(([, list]) => list);
        const toId = (raw) => section === 'interactive' ? String(raw) : Number(raw);
        const levelOf = (id) => { const lv = sec.levels().find(([, list]) => list.includes(id)); return lv ? levelCode(lv[0]) : ''; };
        const url = (id) => {
            const p = new URLSearchParams(keep);
            if (id !== undefined) p.set(param, id);
            const s = p.toString();
            return opts.pagePath + (s ? '?' + s : '');
        };
        const scrollTop = () => { const sc = root.closest('.overflow-y-auto'); if (sc) sc.scrollTop = 0; else window.scrollTo(0, 0); };

        function renderList() {
            done = store.get('lessons_done', {});
            const words = queryWords(q('search').value.trim());
            const html = sec.levels().map(([levelName, list]) => {
                const items = list.map(id => ({ id, t: sec.get(id) }))
                    .filter(({ t }) => t && (!words.length || matches(t.title + ' ' + (t.blurb || ''), words)));
                if (!items.length) return '';
                const doneCount = list.filter(id => isDone(section, id)).length;
                return `
                <section class="space-y-2">
                    <div class="flex items-baseline justify-between">
                        <h2 class="text-base font-black text-slate-900">${escapeHtml(levelName)}</h2>
                        <span class="text-xs text-slate-500">${doneCount} / ${list.length} done</span>
                    </div>
                    <div class="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                        ${items.map(({ id, t }) => {
                            const d = isDone(section, id);
                            return `
                            <a href="${url(id)}" data-open="${escapeHtml(String(id))}" class="flex items-start gap-3 p-3 hover:bg-indigo-50/60 min-h-[56px]">
                                <span class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${d ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}">${d ? '✓' : (section === 'interactive' ? '▶' : id)}</span>
                                <span class="min-w-0">
                                    <span class="block font-bold text-slate-900">${escapeHtml(t.title)}</span>
                                    <span class="block text-sm text-slate-500">${escapeHtml(t.blurb || '')}</span>
                                </span>
                            </a>`;
                        }).join('')}
                    </div>
                </section>`;
            }).join('');
            q('groups').innerHTML = html || '<p class="text-sm text-slate-500">No lessons match your search.</p>';
        }

        async function open(rawId, push) {
            const id = toId(rawId);
            const t = sec.get(id);
            if (!t) { showList(false); return; }
            current = id;
            if (push) history.pushState({}, '', url(id));
            q('list').classList.add('hidden');
            q('view').classList.remove('hidden');
            if (opts.onViewChange) opts.onViewChange(true);
            scrollTop();
            q('crumb').textContent = `${sec.name} · ${t.level || levelOf(id)}`;
            q('title').textContent = section === 'interactive' ? t.title : `${id}. ${t.title}`;
            q('blurb').textContent = t.blurb || '';
            document.title = `${t.title} - ${sec.name}`;
            q('body').innerHTML = section === 'interactive' ? interactiveBody(t) : topicBody(section, id, t);
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

    return { mount, INTERACTIVE, VOCAB_LESSONS, URLS, plain };
})();
