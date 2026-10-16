// js/topics-page.js - the list part of the Reading and Listening pages, built as a feed so there is
// something new on every visit: "Up next for you" (a random unread text, then unopened topics, then a
// fresh AI idea; 🔀 for something else), this week's theme across the four skills, a subject box with
// rotating ideas, new texts from other students, and all topics below. Opening a topic reuses a text already written for it (free); only the first
// student to open a topic spends an AI use, and the text is then saved for everyone.
// Needs js/library.js and js/ideas.js. The page supplies openText(id, push) and loading(topic | null).

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

    // ---------- The feed: "Up next" (a different piece every visit), the subject box, this week's theme ----------
    const goal = () => ((typeof LocalStore !== 'undefined' ? LocalStore.get('fs_profile', {}) : {}) || {}).goal || '';
    let feed = {}, chips = {}, pasteOpen = false;
    const done = (id) => !!result(id);
    // Texts already written come first (free), in a random order; then topics nobody has opened yet;
    // when those run out, a fresh idea for the AI.
    function buildQueue(lv) {
        const ready = [], fresh = [];
        topicsFor(lv).forEach(t => {
            const vs = versionsOf(t), v = vs.find(x => !done(x.id));
            if (v) ready.push({ type: 'text', id: v.id, topic: t }); else if (!vs.length) fresh.push({ type: 'topic', key: t.key, topic: t });
        });
        extrasFor(lv).filter(t => !done(t.id)).forEach(t => ready.push({ type: 'text', id: t.id }));
        const q = [...IDEAS.shuffle(ready), ...IDEAS.shuffle(fresh)];
        const last = store().get('feed_last_' + cfg.page, null);
        if (q.length > 1 && (q[0].id || q[0].key) === last) q.push(q.shift());   // not the same card as last visit
        return q;
    }
    function current(lv) {
        let f = feed[lv];
        const stamp = libFor(lv).length + ':' + topics.length;
        if (!f || f.stamp !== stamp) {
            const keep = f && f.queue[f.i];
            const q = buildQueue(lv);
            if (keep) { const j = q.findIndex(x => (x.id || x.key) === (keep.id || keep.key)); if (j > 0) q.unshift(q.splice(j, 1)[0]); }
            f = feed[lv] = { queue: q, i: 0, stamp, ideas: f ? f.ideas : {} };
        }
        if (f.i < f.queue.length) return f.queue[f.i];
        if (!f.ideas[f.i]) f.ideas[f.i] = { type: 'idea', subject: IDEAS.randomIdea(lv, goal()) };
        return f.ideas[f.i];
    }
    function upNextCard(lv) {
        const it = current(lv);
        const st = LEVEL_STYLE[lv];
        let badge, title, body, meta, note = '';
        if (it.type === 'text') {
            const t = LIB.find(it.id) || {};
            badge = (it.topic && it.topic.category) || t.kind || 'Text';
            title = t.title || '';
            // Listening: don't give the script away before you listen
            body = cfg.preview === false ? (it.topic && it.topic.description ? it.topic.description : 'Listen first, then answer the questions.') : String(t.fr || '').replace(/\s+/g, ' ').slice(0, 180) + '…';
            meta = [t.kind, cfg.meta(t), t.source === 'library' && !it.topic ? 'from the library' : ''].filter(Boolean).join(' · ');
        } else if (it.type === 'topic') {
            badge = it.topic.category || 'Topic';
            title = it.topic.title;
            body = it.topic.description || '';
            meta = 'Nobody has opened this topic yet';
            note = `✨ The AI writes it when you start (one AI use), then it's saved for everyone.`;
        } else {
            badge = 'Something new';
            title = it.subject;
            body = `A brand-new ${cfg.noun} on this subject, written for your level.`;
            meta = `You've done everything at ${lv}. Nice!`;
            note = '✨ Uses one AI use.';
        }
        return `<section id="up-next" class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-5 sm:p-6 flex flex-col gap-3 shadow-lg shadow-indigo-200">
            <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-indigo-100">Up next for you · ${lv}</span>
                <span class="text-[11px] font-bold uppercase tracking-wide bg-white/15 px-2 py-0.5 rounded-full truncate max-w-[50%]">${esc(badge)}</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black leading-tight">${cfg.icon || ''}${esc(title)}</h2>
            ${body ? `<p class="text-sm sm:text-base text-indigo-50 leading-relaxed line-clamp-3" ${it.type === 'text' && cfg.preview !== false ? 'lang="fr"' : ''}>${esc(body)}</p>` : ''}
            <p class="text-xs text-indigo-200">${esc(meta)}</p>
            ${note ? `<p class="text-xs text-indigo-100">${esc(note)}</p>` : ''}
            <div class="flex flex-wrap items-center gap-2 mt-1">
                <button type="button" data-start class="min-h-[48px] px-6 bg-white text-indigo-700 hover:bg-indigo-50 font-black rounded-xl">${it.type === 'text' ? '▶ Start' : '✨ Start'}</button>
                <button type="button" data-shuffle class="min-h-[48px] px-4 bg-white/15 hover:bg-white/25 font-bold rounded-xl">🔀 Something else</button>
            </div>
            <p id="topic-error" class="hidden text-sm bg-white text-rose-700 rounded-lg p-2"></p>
        </section>`;
    }
    function askBox(lv) {
        if (!chips[lv]) chips[lv] = IDEAS.suggestions(lv, goal());
        const keep = { subj: (document.getElementById('own-subject') || {}).value || '', paste: (document.getElementById('paste-text') || {}).value || '' };
        return `<section class="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-3">
            <h2 class="text-lg font-black text-slate-900">${esc(cfg.ask)}</h2>
            <form id="ask-form" class="flex flex-col sm:flex-row gap-2">
                <input id="own-subject" type="text" maxlength="80" value="${esc(keep.subj)}" placeholder="e.g. ${esc(chips[lv][0])}" class="flex-1 text-base px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white">
                <select id="own-kind" aria-label="Type of ${esc(cfg.noun)}" class="text-sm px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="">Any type</option>${cfg.kinds.map(k => `<option ${k === kind ? 'selected' : ''}>${esc(k)}</option>`).join('')}
                </select>
                <button id="gen-btn" type="submit" class="min-h-[48px] px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl whitespace-nowrap">${esc(cfg.genLabel)}</button>
            </form>
            <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-xs font-semibold text-slate-400 mr-1">Ideas:</span>
                ${chips[lv].map(c => `<button type="button" data-idea="${esc(c)}" class="min-h-[34px] px-3 rounded-full text-sm font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition">${esc(c)}</button>`).join('')}
                <button type="button" data-more-ideas class="min-h-[34px] px-3 rounded-full text-sm font-semibold text-indigo-700 hover:bg-indigo-50" aria-label="Other ideas">🔀 Other ideas</button>
            </div>
            <p class="text-xs text-slate-400">Uses one AI use. What you make is shared with other students at ${lv}.</p>
            <p id="gen-error" class="hidden text-sm text-rose-700"></p>
            <div>
                <button type="button" data-toggle-paste class="text-sm font-semibold text-slate-600 hover:text-indigo-700">📋 ${pasteOpen ? 'Hide' : 'Or paste your own French text'}</button>
                <div id="paste-box" class="${pasteOpen ? '' : 'hidden'} mt-2 space-y-2">
                    <textarea id="paste-text" rows="5" maxlength="6000" lang="fr" placeholder="Collez votre texte ici…" class="w-full text-base md:text-sm p-3 bg-white border border-slate-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500">${esc(keep.paste)}</textarea>
                    <button id="paste-btn" type="button" class="min-h-[44px] px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl">${esc(cfg.pasteLabel)}</button>
                    <span class="text-xs text-slate-400 ml-2">Stays on this device.</span>
                    <p id="paste-error" class="hidden text-sm text-rose-700"></p>
                </div>
            </div>
        </section>`;
    }

    // ---------- Page ----------
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
        // New from other students: the latest library texts at this level that aren't one of the topics
        const fresh = extrasFor(level).filter(t => t.source === 'library').slice(-6).reverse();
        const mineList = LIB.mine().filter(t => t.level === level);
        const small = (t, label, cls) => {
            const r = result(t.id);
            return `<a href="${cfg.page}.html?text=${encodeURIComponent(t.id)}" data-text="${esc(t.id)}" class="group flex items-center gap-3 bg-white border border-slate-200 hover:border-indigo-400 transition rounded-xl px-3 py-2.5">
                <span class="shrink-0 text-[11px] font-bold uppercase tracking-wide ${cls} px-2 py-0.5 rounded-full">${label}</span>
                <span class="min-w-0 flex-1 truncate font-semibold text-slate-800 group-hover:text-indigo-700">${esc(t.title)}</span>
                ${r ? `<span class="shrink-0 text-xs font-bold text-emerald-700">✓ ${r.score}/${r.total}</span>` : ''}
            </a>`;
        };
        root.innerHTML = `
            <div class="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 class="text-2xl font-black text-slate-900">${esc(cfg.title)}</h1>
                    <p class="text-sm text-slate-500 mt-1">${esc(cfg.intro)} <a href="${cfg.classic}" class="ml-1 font-semibold text-indigo-700 hover:underline">Open the old version</a></p>
                </div>
                <div id="levels" class="flex w-max max-w-full gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto" role="tablist" aria-label="Level">${tabs}</div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
                ${upNextCard(level)}
                ${IDEAS.themeCard(cfg.page, level)}
            </div>
            ${askBox(level)}
            ${fresh.length ? `<section class="space-y-2">
                <h2 class="text-sm font-bold uppercase tracking-wide text-slate-500">New from other students</h2>
                <div id="extra-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">${fresh.map(t => small(t, 'New', 'text-amber-700 bg-amber-50')).join('')}</div>
            </section>` : ''}
            ${mineList.length ? `<section class="space-y-2">
                <h2 class="text-sm font-bold uppercase tracking-wide text-slate-500">Your texts</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">${mineList.map(t => small(t, 'Yours', 'text-violet-700 bg-violet-50')).join('')}</div>
            </section>` : ''}
            <section class="space-y-2">
                <div class="flex items-baseline justify-between gap-2">
                    <h2 class="text-sm font-bold uppercase tracking-wide text-slate-500">Explore all topics at ${level}</h2>
                    <span id="lib-note" class="text-xs text-slate-400">${LIB.libraryReady() === false ? 'Shared library not set up yet' : ''}</span>
                </div>
                <div id="topic-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">${list.length ? list.map(card).join('') : `<p class="text-sm text-slate-500">No topics at ${level} yet. Ask for any subject above.</p>`}</div>
            </section>`;
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

    // ---------- Your own subject, an idea from the feed, or this week's theme ----------
    // A subject someone at this level already asked for is reused from the library (free).
    function existingFor(subject, lv) {
        const s = subject.trim().toLowerCase();
        return [...libFor(lv), ...LIB.mine()].find(t => t.level === lv && !t.topic && String(t.subject || '').trim().toLowerCase() === s && (!t.skill || t.skill === cfg.page) && t.source !== 'mine-pasted');
    }
    async function makeSubject(subject, opts = {}) {
        const lv = currentLevel();
        if (!lib[lv]) lib[lv] = await LIB.loadLibrary(lv);
        const have = !opts.fresh && existingFor(subject, lv);
        if (have) { cfg.openText(have.id, true); return have; }
        if (busy) return null;
        busy = true;
        cfg.loading({ title: subject, level: lv });
        try {
            const t = await LIB.generate({ subject, kind: opts.kind || null, level: lv, purpose: cfg.page });
            if (t.source === 'library') lib[lv] = [...libFor(lv), t];
            busy = false;
            cfg.openText(t.id, true);
            return t;
        } catch (err) {
            busy = false;
            cfg.loading(null); cfg.showList(false);
            showErr(opts.errorBox || 'gen-error', err.message);
            return null;
        }
    }
    async function generateOwn() {
        const el = document.getElementById('own-subject');
        const subject = el.value.trim() || el.placeholder.replace(/^e\.g\. /, '');
        const k = document.getElementById('own-kind').value || null;
        kind = k;
        el.value = '';
        await makeSubject(subject, { kind: k, fresh: true });
    }
    async function startTheme() {
        const th = IDEAS.thisWeek(), lv = currentLevel();
        const subject = `${th.en}: ${th[cfg.page]}`;
        const t = await makeSubject(subject, { errorBox: 'topic-error' });
        if (t) IDEAS.remember(cfg.page, lv, t.id);
    }
    function startUpNext() {
        const lv = currentLevel(), it = current(lv);
        store().set('feed_last_' + cfg.page, it.id || it.key || null);
        if (it.type === 'text') cfg.openText(it.id, true);
        else if (it.type === 'topic') openTopic(it.key, true);
        else makeSubject(it.subject, { errorBox: 'topic-error', fresh: true });
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
            if (e.target.closest('[data-start]')) { startUpNext(); return; }
            if (e.target.closest('[data-shuffle]')) {
                const lv = currentLevel(), it = current(lv);
                store().set('feed_last_' + cfg.page, it.id || it.key || null);
                feed[lv].i++; render(); return;
            }
            const th = e.target.closest('[data-theme-start]');
            if (th && !e.metaKey && !e.ctrlKey) { e.preventDefault(); startTheme(); return; }
            const idea = e.target.closest('[data-idea]');
            if (idea) { const el = document.getElementById('own-subject'); el.value = idea.dataset.idea; el.focus(); return; }
            if (e.target.closest('[data-more-ideas]')) { chips[currentLevel()] = IDEAS.suggestions(currentLevel(), goal()); render(); return; }
            if (e.target.closest('[data-toggle-paste]')) { pasteOpen = !pasteOpen; render(); if (pasteOpen) document.getElementById('paste-text').focus(); return; }
            if (e.target.closest('#paste-btn')) pasteOwn();
        });
        document.getElementById('list-view').addEventListener('submit', (e) => {
            if (e.target.id === 'ask-form') { e.preventDefault(); generateOwn(); }
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
            if (cfg.startTheme) { cfg.startTheme = null; startTheme(); return; }
            if (cfg.isList()) render(); else cfg.refreshVersions();
        });
        loadLevel(currentLevel());
    }

    return { init, render, startTheme, currentLevel, openTopic, versionBar, topicOf, findTopic: (key) => topics.find(t => t.key === key), LEVEL_STYLE, libFor };
})();
