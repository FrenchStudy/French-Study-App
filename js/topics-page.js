// js/topics-page.js - the list part of the Reading and Listening pages: level tabs, the topics for
// that level (your reading_topics / listening_topics tables + the built-in texts), more texts, and
// "Make your own". Opening a topic reuses a text already written for it (free); only the first
// student to open a topic spends an AI use, and the text is then saved for everyone.
// Needs js/library.js. The page supplies openText(id, push) and loading(topic | null).

window.TopicsPage = (function () {
    const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const LEVEL_STYLE = {
        A1: ['text-emerald-700', 'bg-emerald-50'], A2: ['text-teal-700', 'bg-teal-50'], B1: ['text-sky-700', 'bg-sky-50'],
        B2: ['text-indigo-700', 'bg-indigo-50'], C1: ['text-purple-700', 'bg-purple-50']
    };
    const esc = (x) => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    let cfg = null, topics = [], lib = {}, kind = null, busy = false;
    const store = () => LIB.store;

    function currentLevel() {
        const saved = store().get(cfg.page + '_level', null);
        if (LEVELS.includes(saved)) return saved;
        const lv = (typeof LocalStore !== 'undefined' ? LocalStore.get('fs_profile', {}) : {}).level;
        return LEVELS.includes(lv) ? lv : lv === 'C2' ? 'C1' : 'A1';
    }
    const result = (id) => LIB.results()[cfg.page + ':' + id];
    const libFor = (lv) => lib[lv] || [];
    const topicsFor = (lv) => topics.filter(t => t.level === lv);
    const versionsOf = (topic) => LIB.versions(topic, libFor(topic.level), cfg.page);
    const bestResult = (topic) => versionsOf(topic).map(v => result(v.id)).filter(Boolean).sort((a, b) => b.score / b.total - a.score / a.total)[0];
    // Library texts and your own texts at this level that don't belong to a topic of this page
    function extrasFor(lv) {
        const inTopic = new Set(topicsFor(lv).flatMap(t => versionsOf(t).map(v => v.id)));
        const seen = new Set();
        return [...LIB.mine().filter(t => t.level === lv), ...libFor(lv).filter(t => !t.topic || !t.skill || t.skill === cfg.page)]
            .filter(t => !inTopic.has(t.id) && !seen.has(t.id) && seen.add(t.id))
            .filter(t => !t.topic || !topicsFor(lv).some(x => x.title.toLowerCase() === t.topic.toLowerCase()));
    }
    function topicOf(text) {
        if (!text) return null;
        return topics.find(t => versionsOf(t).some(v => v.id === text.id)) || null;
    }

    // ---------- List ----------
    function render() {
        const level = currentLevel();
        const root = document.getElementById('list-view');
        const tabs = LEVELS.map(lv => {
            const list = topicsFor(lv);
            const n = list.filter(bestResult).length;
            const on = lv === level;
            return `<button type="button" role="tab" aria-selected="${on}" data-level="${lv}" class="shrink-0 px-3.5 py-1.5 rounded-lg text-sm font-bold transition ${on ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
                ${lv}<span class="ml-1.5 text-xs font-semibold ${on ? LEVEL_STYLE[lv][0] : 'text-slate-400'}">${n}/${list.length}</span></button>`;
        }).join('');
        const st = LEVEL_STYLE[level];
        const list = topicsFor(level);
        const card = (t) => {
            const vs = versionsOf(t), r = bestResult(t);
            const status = r ? `<span class="shrink-0 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">✓ ${r.score}/${r.total}</span>`
                : vs.length ? '' : '<span class="shrink-0 text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full" title="The AI writes this text the first time someone opens it">✨ New</span>';
            const first = vs[0];
            const meta = first ? [first.kind, cfg.meta(first)].filter(Boolean).join(' · ') + (vs.length > 1 ? ` · ${vs.length} versions` : '') : 'Written for you when you open it';
            // A topic that is only a theme (title = category): show the text's own headline instead
            const theme = t.category && t.title.toLowerCase() === t.category.toLowerCase();
            const heading = theme ? (first ? first.title : t.description || t.title) : t.title;
            return `<a href="${cfg.page}.html?topic=${encodeURIComponent(t.key)}" data-topic="${esc(t.key)}" class="group flex flex-col gap-1.5 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition rounded-2xl p-4">
                <span class="flex items-center justify-between gap-2">
                    <span class="text-[11px] font-bold uppercase tracking-wide ${st[0]} ${st[1]} px-2 py-0.5 rounded-full truncate">${esc(t.category || 'General')}</span>${status}
                </span>
                <span class="font-bold text-slate-900 group-hover:text-indigo-700 leading-snug">${cfg.icon || ''}${esc(heading)}</span>
                <span class="text-xs text-slate-500">${esc(meta)}</span>
            </a>`;
        };
        const extras = extrasFor(level);
        const extraCard = (t) => {
            const r = result(t.id);
            return `<a href="${cfg.page}.html?text=${encodeURIComponent(t.id)}" data-text="${esc(t.id)}" class="group flex items-center gap-3 bg-white border border-slate-200 hover:border-indigo-400 transition rounded-xl px-3 py-2.5">
                <span class="shrink-0 text-[11px] font-bold uppercase tracking-wide ${t.source === 'mine' ? 'text-violet-700 bg-violet-50' : 'text-amber-700 bg-amber-50'} px-2 py-0.5 rounded-full">${t.source === 'mine' ? 'Yours' : 'Library'}</span>
                <span class="min-w-0 flex-1 truncate font-semibold text-slate-800 group-hover:text-indigo-700">${esc(t.title)}</span>
                ${r ? `<span class="shrink-0 text-xs font-bold text-emerald-700">✓ ${r.score}/${r.total}</span>` : ''}
            </a>`;
        };
        const chip = (on) => `min-h-[36px] px-3 rounded-full text-sm font-semibold border transition ${on ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'}`;
        const open = root.querySelector('#make-own') ? root.querySelector('#make-own').open : false;
        const keep = { subj: (root.querySelector('#own-subject') || {}).value || '', paste: (root.querySelector('#paste-text') || {}).value || '' };
        root.innerHTML = `
            <div>
                <h1 class="text-2xl font-black text-slate-900">${esc(cfg.title)}</h1>
                <p class="text-sm text-slate-500 mt-1">${esc(cfg.intro)} <a href="${cfg.classic}" class="ml-1 font-semibold text-indigo-700 hover:underline">Open the old version</a></p>
            </div>
            <div id="levels" class="flex w-max max-w-full gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto" role="tablist" aria-label="Level">${tabs}</div>
            <section class="space-y-2">
                <div class="flex items-baseline justify-between gap-2">
                    <h2 class="text-sm font-bold uppercase tracking-wide text-slate-500">Topics for ${level}</h2>
                    <span id="lib-note" class="text-xs text-slate-400">${LIB.libraryReady() === false ? 'Shared library not set up yet' : ''}</span>
                </div>
                <div id="topic-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">${list.length ? list.map(card).join('') : `<p class="text-sm text-slate-500">No topics at ${level} yet. Make your own below.</p>`}</div>
                <p id="topic-error" class="hidden text-sm text-rose-700"></p>
            </section>
            ${extras.length ? `<section class="space-y-2">
                <h2 class="text-sm font-bold uppercase tracking-wide text-slate-500">More ${esc(cfg.nounPl)} at ${level}</h2>
                <div id="extra-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">${extras.map(extraCard).join('')}</div>
            </section>` : ''}
            <details id="make-own" class="bg-white border border-slate-200 rounded-2xl" ${open ? 'open' : ''}>
                <summary class="cursor-pointer list-none p-4 flex items-center justify-between gap-3">
                    <span><span class="font-black text-slate-900">✨ Make your own</span>
                    <span class="block sm:inline sm:ml-2 text-sm text-slate-500">Any subject you like, or a text you paste.</span></span>
                    <span class="chev text-slate-400 transition" aria-hidden="true">▾</span>
                </summary>
                <div class="px-4 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div class="space-y-3">
                        <label class="block"><span class="text-sm font-semibold text-slate-700">Subject</span>
                            <input id="own-subject" type="text" maxlength="80" value="${esc(keep.subj)}" placeholder="${esc(cfg.subjectHint)}" class="mt-1.5 w-full text-base md:text-sm px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"></label>
                        <div><div class="text-sm font-semibold text-slate-700 mb-1.5">Type of ${esc(cfg.noun)}</div>
                            <div id="kinds" class="flex flex-wrap gap-1.5">${cfg.kinds.map(k => `<button type="button" data-kind="${esc(k)}" class="${chip(k === kind)}">${esc(k)}</button>`).join('')}</div></div>
                        <button id="gen-btn" type="button" class="min-h-[44px] px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl">${esc(cfg.genLabel)}</button>
                        <p class="text-xs text-slate-400">Uses one AI use. It is shared with other students at ${level}.</p>
                        <p id="gen-error" class="hidden text-sm text-rose-700"></p>
                    </div>
                    <div class="space-y-3 flex flex-col">
                        <label class="block flex-1"><span class="text-sm font-semibold text-slate-700">Or paste a French text</span>
                            <textarea id="paste-text" rows="5" maxlength="6000" lang="fr" placeholder="Collez votre texte ici…" class="mt-1.5 w-full text-base md:text-sm p-3 bg-white border border-slate-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500">${esc(keep.paste)}</textarea></label>
                        <button id="paste-btn" type="button" class="self-start min-h-[44px] px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl">${esc(cfg.pasteLabel)}</button>
                        <p class="text-xs text-slate-400">Stays on this device. The AI adds questions and a translation.</p>
                        <p id="paste-error" class="hidden text-sm text-rose-700"></p>
                    </div>
                </div>
            </details>`;
    }
    const showErr = (id, msg) => { const el = document.getElementById(id); if (el) { el.textContent = msg; el.classList.remove('hidden'); } };

    // ---------- Opening a topic ----------
    async function openTopic(key, push, fresh) {
        const topic = topics.find(t => t.key === key);
        if (!topic || busy) return;
        if (!lib[topic.level]) lib[topic.level] = await LIB.loadLibrary(topic.level);
        const vs = versionsOf(topic);
        if (vs.length && !fresh) { cfg.openText(vs[0].id, push); return; }
        busy = true;
        cfg.loading(topic);
        try {
            const t = await LIB.generate({ topic: topic.title, level: topic.level, purpose: cfg.page });
            if (t.source === 'library') lib[t.level] = [...libFor(t.level).filter(x => x.id !== t.id), t];
            busy = false;
            cfg.openText(t.id, push || fresh);
        } catch (err) {
            busy = false;
            cfg.loading(null);
            if (fresh) cfg.versionError(err.message);
            else { cfg.showList(false); showErr('topic-error', err.message); }
        }
    }

    // The version bar under a text's title: "Version 1 of 2  ‹ ›  ✨ New version"
    function versionBar(text) {
        const topic = topicOf(text);
        if (!topic) return '';
        const vs = versionsOf(topic);
        const i = vs.findIndex(v => v.id === text.id);
        const nav = (j, label, aria) => j >= 0 && j < vs.length
            ? `<button type="button" data-version="${esc(vs[j].id)}" aria-label="${aria}" class="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 font-bold">${label}</button>`
            : `<span class="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 text-slate-300 font-bold inline-flex items-center justify-center" aria-hidden="true">${label}</span>`;
        return `<div class="flex flex-wrap items-center gap-2 text-sm">
            ${vs.length > 1 ? `${nav(i - 1, '‹', 'Previous version')}<span class="font-semibold text-slate-600">Version ${i + 1} of ${vs.length}</span>${nav(i + 1, '›', 'Next version')}` : ''}
            <button type="button" data-new-version="${esc(topic.key)}" class="min-h-[36px] px-3 rounded-lg text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50">✨ New version</button>
            <span class="text-xs text-slate-400">A different ${esc(cfg.noun)} on the same topic. Uses one AI use.</span>
            <span data-version-error class="hidden w-full text-sm text-rose-700"></span>
        </div>`;
    }

    // ---------- Make your own ----------
    async function generateOwn() {
        const subject = document.getElementById('own-subject').value.trim();
        if (!subject) { showErr('gen-error', 'Type a subject first, e.g. ' + cfg.subjectHint.replace(/^e\.g\. /, '') + '.'); document.getElementById('own-subject').focus(); return; }
        const btn = document.getElementById('gen-btn');
        btn.disabled = true; btn.textContent = 'Writing…';
        try {
            const t = await LIB.generate({ subject, kind, level: currentLevel(), purpose: cfg.page });
            document.getElementById('own-subject').value = '';
            if (t.source === 'library') lib[t.level] = [...libFor(t.level), t];
            cfg.openText(t.id, true);
        } catch (err) { showErr('gen-error', err.message); }
        btn.disabled = false; btn.textContent = cfg.genLabel;
    }
    async function pasteOwn() {
        const el = document.getElementById('paste-text');
        const fr = el.value.trim();
        if (fr.length < 40) { showErr('paste-error', 'Paste a longer text (at least a few sentences).'); return; }
        const btn = document.getElementById('paste-btn');
        btn.disabled = true; btn.textContent = 'Preparing questions…';
        const t = await LIB.fromPasted(fr, currentLevel());
        el.value = '';
        btn.disabled = false; btn.textContent = cfg.pasteLabel;
        cfg.openText(t.id, true);
    }

    async function loadLevel(lv) {
        lib[lv] = await LIB.loadLibrary(lv);
        if (cfg.isList()) render(); else cfg.refreshVersions();
    }

    function init(options) {
        cfg = options;
        topics = LIB.cachedTopics(cfg.page);
        document.getElementById('list-view').addEventListener('click', (e) => {
            const lv = e.target.closest('[data-level]');
            if (lv) { store().set(cfg.page + '_level', lv.dataset.level); render(); if (!lib[lv.dataset.level]) loadLevel(lv.dataset.level); return; }
            const tp = e.target.closest('[data-topic]');
            if (tp && !e.metaKey && !e.ctrlKey) { e.preventDefault(); openTopic(tp.dataset.topic, true); return; }
            const tx = e.target.closest('[data-text]');
            if (tx && !e.metaKey && !e.ctrlKey) { e.preventDefault(); cfg.openText(tx.dataset.text, true); return; }
            const k = e.target.closest('[data-kind]');
            if (k) { kind = kind === k.dataset.kind ? null : k.dataset.kind; render(); return; }
            if (e.target.closest('#gen-btn')) generateOwn();
            if (e.target.closest('#paste-btn')) pasteOwn();
        });
        document.addEventListener('click', async (e) => {
            const v = e.target.closest('[data-version]');
            if (v) { cfg.openText(v.dataset.version, true); return; }
            const nv = e.target.closest('[data-new-version]');
            if (nv) { nv.disabled = true; nv.textContent = 'Writing…'; openTopic(nv.dataset.newVersion, true, true); }
        });
        LIB.loadTopics(cfg.page).then(list => {
            topics = list;
            if (cfg.startTopic) { const key = cfg.startTopic; cfg.startTopic = null; if (topics.some(t => t.key === key)) { openTopic(key, false); return; } cfg.showList(false); return; }
            if (cfg.isList()) render(); else cfg.refreshVersions();
        });
        loadLevel(currentLevel());
    }

    return { init, render, currentLevel, openTopic, versionBar, topicOf, findTopic: (key) => topics.find(t => t.key === key), LEVEL_STYLE, libFor };
})();
