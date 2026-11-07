// ✨ « AI writes a new … for you »: the same card on Reading, Listening, Writing and Speaking.
// Tabs: 📖 Library (what is already in the app; the page puts it in) · AI Topics (🎲 Any topic, a theme, or your own
// subject) · AI My lessons (your last Vocab topic and Grammar lesson). The level is picked each time and never stored;
// the tab is remembered. The page writes the thing itself in opts.write({ subject, focus, level, format }).
(function () {
    const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const LEVEL_NAME = { A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate', B2: 'Upper intermediate', C1: 'Advanced', C2: 'Mastery' };
    const THEMES = [['🏠', 'Daily life'], ['👨‍👩‍👧', 'Family and friends'], ['🍽️', 'Food'], ['✈️', 'Travel'], ['🏡', 'Home'], ['💼', 'Work'],
        ['🎓', 'Studies'], ['🩺', 'Health and sport'], ['🎨', 'Free time'], ['🛍️', 'Shopping'], ['🤖', 'Technology'], ['🌍', 'Environment'], ['🎭', 'Culture and media'], ['🏛️', 'Society']];
    const ABOUTS = ['library', 'theme', 'lessons'];
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
    const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } };

    const CSS = `.mk-chip{min-height:44px;padding:0 14px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;font-weight:700;color:#334155}
.mk-chip:hover{border-color:#a5b4fc}.mk-chip[aria-pressed="true"]{background:#4f46e5;border-color:#4f46e5;color:#fff}
.mk-sel{min-height:48px;width:100%;padding:0 10px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;font-weight:800;color:#334155;font-size:1rem}
.mk-sel.on{border-color:#4f46e5;color:#3730a3;background:#eef2ff}
.mk-ai{display:inline-block;font-size:.75rem;line-height:1;font-weight:900;letter-spacing:.02em;padding:3px 4px;border-radius:6px;background:linear-gradient(90deg,#7c3aed,#4f46e5);color:#fff;vertical-align:2px}
.mk-pill{display:inline-flex;align-items:center;gap:4px;min-height:40px;padding:0 12px;border-radius:999px;border:1px solid #c7d2fe;background:#fff;font-weight:600;color:#334155}
.mk-pill[aria-pressed="true"]{background:#4f46e5;border-color:#4f46e5;color:#fff}`;

    function mount(host, opts) {
        if (!document.getElementById('mk-css')) { const st = document.createElement('style'); st.id = 'mk-css'; st.textContent = CSS; document.head.appendChild(st); }
        const o = Object.assign({ key: 'page', noun: 'text', title: '✨ AI writes a new text for you', sub: 'Every text is new, made for you in seconds.',
            verb: 'write', busyText: '', formats: [], anyFormat: '', freeNoun: 'texts', topicsHint: 'Pick a topic, or type your own:', ownPlaceholder: '✏️ …or type your own subject, e.g. a night train to Nice',
            library: null, write: async () => {} }, opts);
        const tabCls = 'mk-tab flex-1 sm:flex-none flex items-center justify-center gap-1.5 min-h-[44px] px-0.5 sm:px-0 border-b-2 border-transparent text-slate-500 hover:text-slate-800 whitespace-nowrap';
        host.classList.add('bg-white', 'border-2', 'border-indigo-200', 'rounded-2xl', 'shadow-sm');
        host.innerHTML = `<div class="px-4 sm:px-5 pt-4">
                <h2 class="text-lg font-black text-slate-900">${esc(o.title)}</h2>
                <p class="text-sm text-slate-500">${esc(o.sub)}</p>
            </div>
            <nav class="flex gap-0 sm:gap-6 px-2 sm:px-5 mt-2 text-sm font-semibold overflow-hidden shadow-[inset_0_-1px_0_#e2e8f0]" role="tablist" aria-label="Where it comes from">
                <button type="button" role="tab" data-about="library" class="${tabCls}">📖 Library</button>
                <button type="button" role="tab" data-about="theme" class="${tabCls}"><span class="mk-ai">AI</span> Topics</button>
                <button type="button" role="tab" data-about="lessons" class="${tabCls}"><span class="mk-ai">AI</span> My lessons</button>
            </nav>
            <div class="p-4 sm:p-5 space-y-4">
                <div data-mk="lessons" class="hidden space-y-2 text-sm text-slate-700"></div>
                <div data-mk="theme" class="hidden space-y-2">
                    <p class="text-sm text-slate-600">${esc(o.topicsHint)}</p>
                    <div data-mk="themes" class="flex flex-wrap gap-2" role="group" aria-label="Topic"></div>
                    <input data-mk="own" type="text" maxlength="80" placeholder="${esc(o.ownPlaceholder)}" class="w-full min-h-[44px] px-3 text-base bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div data-mk="ai" class="space-y-3">
                    <div class="grid grid-cols-2 gap-2 sm:max-w-md">
                        <select data-mk="level" class="mk-sel" aria-label="Level"><option value="">Level…</option>${LEVELS.map(l => `<option value="${l}" title="${LEVEL_NAME[l]}">${l}</option>`).join('')}</select>
                        <select data-mk="format" class="mk-sel" aria-label="Format"><option value="">Any format</option>${o.formats.map(f => `<option>${esc(f)}</option>`).join('')}</select>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                        <button data-mk="go" type="button" class="w-full sm:w-auto min-h-[52px] px-6 rounded-xl font-black text-base"></button>
                        <span data-mk="free" class="hidden text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800"></span>
                    </div>
                    <p data-mk="error" class="hidden text-sm text-rose-700"></p>
                </div>
                <div data-mk="library" class="hidden"></div>
            </div>`;
        const q = (k) => host.querySelector(`[data-mk="${k}"]`);
        if (o.library) q('library').appendChild(o.library);
        const saved = lsGet(o.key + '_about', '');
        const mk = { about: ABOUTS.includes(saved) ? saved : saved === 'random' ? 'theme' : '', theme: '🎲', allThemes: false, level: '', format: '', vocab: null, grammar: null, busy: false, changing: false };

        function lessonPicks() {
            const R = typeof RecentLessons !== 'undefined' ? RecentLessons : { list: () => [] };
            const v = R.list('vocab'), g = R.list('grammar');
            if (!mk.vocab || !v.some(x => String(x.id) === String(mk.vocab))) mk.vocab = v[0] ? String(v[0].id) : '';
            if (!g.some(x => String(x.id) === String(mk.grammar))) mk.grammar = g[0] ? String(g[0].id) : '';
            return { v, g, vocab: v.find(x => String(x.id) === mk.vocab), grammar: g.find(x => String(x.id) === mk.grammar) };
        }
        function render() {
            const L = lessonPicks(), hasLessons = !!(L.vocab || L.grammar);
            if (!mk.about) mk.about = hasLessons ? 'lessons' : 'library';
            host.querySelectorAll('.mk-tab').forEach(b => { const on = b.dataset.about === mk.about; b.setAttribute('aria-selected', on);
                ['border-indigo-600', 'text-indigo-700'].forEach(c => b.classList.toggle(c, on)); ['border-transparent', 'text-slate-500', 'hover:text-slate-800'].forEach(c => b.classList.toggle(c, !on)); });
            q('lessons').classList.toggle('hidden', mk.about !== 'lessons');
            q('theme').classList.toggle('hidden', mk.about !== 'theme');
            q('ai').classList.toggle('hidden', mk.about === 'library');
            q('library').classList.toggle('hidden', mk.about !== 'library');
            if (mk.about === 'lessons') {
                const pill = (x, kind) => `<button type="button" class="mk-pill" data-pick="${kind}" data-id="${esc(x.id)}" aria-pressed="${String(x.id) === (kind === 'vocab' ? mk.vocab : mk.grammar)}">${kind === 'vocab' ? '📖' : '✍️'} ${esc(x.title)}</button>`;
                q('lessons').innerHTML = !hasLessons
                    ? `<p class="rounded-xl bg-indigo-50 border border-indigo-100 p-3">Open a <a class="font-semibold text-indigo-700 underline" href="vocab.html">Vocab topic</a> or a <a class="font-semibold text-indigo-700 underline" href="lesson.html">Grammar lesson</a> first: the AI will use its words and its grammar.</p>`
                    : mk.changing
                        ? `<div class="space-y-2">${L.v.length ? `<div class="text-xs font-bold uppercase tracking-wide text-slate-500">Words from</div><div class="flex flex-wrap gap-2">${L.v.slice(0, 6).map(x => pill(x, 'vocab')).join('')}</div>` : ''}
                           ${L.g.length ? `<div class="text-xs font-bold uppercase tracking-wide text-slate-500">Grammar</div><div class="flex flex-wrap gap-2">${L.g.slice(0, 6).map(x => pill(x, 'grammar')).join('')}</div>` : ''}
                           <button type="button" data-mk-done class="min-h-[40px] px-3 font-bold text-indigo-700">✓ Done</button></div>`
                        : `<p class="text-slate-600">The AI uses what you studied last:</p><div class="flex flex-wrap items-center gap-2">${L.vocab ? `<span class="mk-pill">📖 <b>${esc(L.vocab.title)}</b></span>` : ''}${L.grammar ? `<span class="mk-pill">✍️ <b>${esc(L.grammar.title)}</b></span>` : ''}
                           ${L.v.length + L.g.length > 1 ? '<button type="button" data-mk-change class="min-h-[40px] px-1 font-semibold text-indigo-700 underline">Change</button>' : ''}</div>`;
            }
            const own = q('own').value.trim();
            if (mk.about === 'theme') {
                const list = mk.allThemes ? THEMES : THEMES.slice(0, 6);
                q('themes').innerHTML = `<button type="button" class="mk-chip" data-theme="🎲" aria-pressed="${mk.theme === '🎲' && !own}">🎲 Any topic</button>`
                    + list.map(([e, n]) => `<button type="button" class="mk-chip" data-theme="${esc(n)}" aria-pressed="${mk.theme === n && !own}">${e} ${esc(n)}</button>`).join('')
                    + (mk.allThemes ? '' : `<button type="button" class="mk-chip text-slate-500" data-mk-more>+ ${THEMES.length - 6} more</button>`);
            }
            q('level').classList.toggle('on', !!mk.level);
            const subjectLabel = mk.about === 'lessons' ? (hasLessons ? 'my lessons' : '') : (own || (mk.theme === '🎲' ? 'any topic' : mk.theme));
            const ready = mk.level && subjectLabel, go = q('go');
            go.disabled = !ready || mk.busy;
            go.className = 'w-full sm:w-auto min-h-[52px] px-6 rounded-xl font-black text-base ' + (ready ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-200 text-slate-500');
            go.innerHTML = mk.busy ? esc(o.busyText || `✨ AI is writing your ${o.noun}…`) : !mk.level ? 'Pick a level to start' : !subjectLabel ? 'Open a lesson first'
                : `✨ AI, ${esc(o.verb)} my ${esc(o.noun)} · ${mk.level}<span class="hidden sm:inline"> · ${esc(subjectLabel)}</span>`;
            renderFree();
        }
        // Free AI uses: shown to students on the free plan (the count comes from the AI server)
        function renderFree() {
            const qt = (typeof LocalStore !== 'undefined' && LocalStore.get('ai_quota', null)) || null, el = q('free');
            if (!qt || qt.unlimited || qt.free == null) { el.classList.add('hidden'); return; }
            el.classList.remove('hidden');
            el.textContent = qt.used === 0 ? `🎁 ${qt.free} free ${o.freeNoun} from your lessons · ${qt.left} left` : `🎁 Free AI uses · ${qt.left} left`;
        }
        async function go() {
            const L = lessonPicks(), own = q('own').value.trim();
            let subject, focus = null;
            if (mk.about === 'lessons') {
                subject = L.vocab ? L.vocab.title : 'everyday life';
                focus = { words: L.vocab ? L.vocab.words || [] : [], grammar: L.grammar ? `${L.grammar.title}${L.grammar.rule ? ' (' + L.grammar.rule + ')' : ''}` : '',
                    label: [L.vocab && L.vocab.title, L.grammar && L.grammar.title].filter(Boolean).join(' · ') };
            } else if (own) subject = own;
            else {
                // 🎲 Any topic: a random area. In every case the AI picks the exact angle, so a theme never gives the same thing twice
                const area = mk.theme === '🎲' ? THEMES[Math.floor(Math.random() * THEMES.length)][1] : mk.theme;
                subject = area;
                focus = { note: 'Choose the exact topic yourself, inside this area: something specific and interesting, not the obvious one.', label: (mk.theme === '🎲' ? '🎲 ' : '') + area };
            }
            mk.busy = true; render(); q('error').classList.add('hidden');
            try { await o.write({ subject, focus, level: mk.level, format: mk.format || o.anyFormat, formatName: mk.format }); }
            catch (err) {
                q('error').textContent = err && (err.code === 'signin' || /sign in/i.test(err.message || '')) ? `Sign in to get your free AI ${o.freeNoun}. Meanwhile, the 📖 Library works without AI.` : (err && err.message) || 'Something went wrong. Please try again.';
                q('error').classList.remove('hidden');
            }
            mk.busy = false; render();
        }
        host.addEventListener('click', (e) => {
            const ab = e.target.closest('[data-about]');
            if (ab) { mk.about = ab.dataset.about; mk.changing = false; lsSet(o.key + '_about', mk.about); render(); return; }
            const th = e.target.closest('[data-theme]');
            if (th) { mk.theme = th.dataset.theme; q('own').value = ''; render(); return; }
            if (e.target.closest('[data-mk-more]')) { mk.allThemes = true; render(); return; }
            if (e.target.closest('[data-mk-change]')) { mk.changing = true; render(); return; }
            if (e.target.closest('[data-mk-done]')) { mk.changing = false; render(); return; }
            const pk = e.target.closest('[data-pick]');
            if (pk) { if (pk.dataset.pick === 'vocab') mk.vocab = pk.dataset.id; else mk.grammar = pk.dataset.id; render(); return; }
        });
        q('own').addEventListener('input', render);
        q('level').addEventListener('change', () => { mk.level = q('level').value; render(); });
        q('format').addEventListener('change', () => { mk.format = q('format').value; });
        q('go').addEventListener('click', go);
        render();
        // the free AI uses left, for the badge (signed-in students on the free plan)
        try {
            if (typeof Account !== 'undefined' && typeof AIServer !== 'undefined') Account.session().then(ss => { if (ss) AIServer.quota().then(r => { if (r) { LocalStore.set('ai_quota', { ...r, at: Date.now() }); renderFree(); } }).catch(() => {}); }).catch(() => {});
        } catch (e) { /* no account: no badge */ }
        // Open the card from elsewhere on the page: set({ about: 'theme', own: 'a subject', level: 'B1', scroll: false })
        function set(x) {
            if (x.about && ABOUTS.includes(x.about)) mk.about = x.about;
            if (x.own != null) q('own').value = x.own;
            if (x.level && LEVELS.includes(x.level)) { mk.level = x.level; q('level').value = x.level; }
            mk.changing = false; render();
            if (x.scroll !== false) host.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return { render, renderFree, set, state: mk };
    }
    window.AIMaker = { mount, THEMES, LEVELS };
})();
