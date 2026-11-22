// word-list.js - a « by ear » word list: search, filter chips, a topic menu, rows with the meaning and a memory hook,
// a Play list that reads the words aloud, Learned ticks and Copy (for Excel or Sheets). Used by Vocab → Words by ear
// (content/by-ear/words.json) and Exam → Mon lexique TCF (content/by-ear/lexique.json). Needs config.js (LocalStore),
// js/ai.js (MEDIA_ICON) and js/by-ear-kit.js.
//   WordList.mount(el, cfg)
//   cfg = { url, key (LocalStore prefix), noun ('words'), prep(json) → { items, topics },
//           groups: [{ key, label, items: [[value, label]] }], example (true: the Play list can read the example) }
//   item = { id, n (number shown), fr, say, en, tags: [[class, text]], hooks: [text], pic, g: { groupKey: value },
//            topics: [id], detail (HTML shown when the row is opened), ex, exe, key (search text) }
(function () {
'use strict';
const esc = ByEar.esc, norm = ByEar.norm;
const WL_CSS = `
.wl-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.wl-search{flex:1 1 240px;min-width:0;min-height:44px;font-size:16px;padding:0 14px;background:#fff;border:1px solid #cbd5e1;border-radius:12px}
.wl-search:focus{outline:none;box-shadow:0 0 0 2px #6366f1}
.wl-sel{min-height:44px;max-width:100%;font-size:14px;padding:0 10px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;color:#334155}
.wl-btn{min-height:44px;padding:0 14px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;color:#334155;font-size:14px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.wl-btn:hover{border-color:#a5b4fc}
.wl-btn.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.wl-btn[aria-expanded="true"]{background:#eef2ff;border-color:#818cf8;color:#3730a3}
.wl-badge{font-size:12px;background:#4f46e5;color:#fff;border-radius:999px;padding:0 7px;line-height:20px}
.wl-panel{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:14px 16px;display:flex;flex-direction:column;gap:12px}
.wl-panel[hidden]{display:none}
.wl-opts{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;font-size:14px;color:#334155;border-top:1px solid #f1f5f9;padding-top:12px}
.wl-opts label{display:inline-flex;align-items:center;gap:8px;min-height:36px;cursor:pointer}
.wl-opts input{width:16px;height:16px;accent-color:#4f46e5}
.wl-opts select{min-height:36px;font-size:14px;border:1px solid #e2e8f0;border-radius:10px;padding:0 8px;background:#fff}
.wl-count{font-size:14px;color:#64748b;margin:10px 0}
.wl-count b{color:#0f172a}
.wl-count button{border:0;background:none;color:#4338ca;font-weight:700;font-size:14px;cursor:pointer;padding:0 4px}
.wl-hooks{display:flex;flex-direction:column;gap:2px}
.wl-detail{font-size:14px;color:#334155;line-height:1.6;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:10px 14px}
.wl-detail b{color:#0f172a}
.wl-detail .m{color:#64748b}
.wl-toast{position:fixed;left:50%;bottom:84px;transform:translateX(-50%);background:#0f172a;color:#fff;font-size:14px;font-weight:600;padding:10px 16px;border-radius:12px;z-index:70}
`;
function addCss() { if (document.getElementById('wl-css')) return; const s = document.createElement('style'); s.id = 'wl-css'; s.textContent = WL_CSS; document.head.appendChild(s); }

function mount(el, cfg) {
    addCss();
    const K = cfg.key, noun = cfg.noun || 'words';
    const F = Object.assign(Object.fromEntries(cfg.groups.map(g => [g.key, []])), LocalStore.get(K + '_filters', {}));
    const opts = Object.assign({ mean: true, hook: true, ex: false, hideLearned: false, topic: '' }, LocalStore.get(K + '_play', {}));
    const learned = new Set(LocalStore.get(K + '_learned', []));
    let ITEMS = [], TOPICS = [], query = '', shownN = 60, list = [], openId = null, chipsUi = null;
    el.innerHTML = `<div class="space-y-3">
        <div class="wl-bar">
            <input type="search" class="wl-search" data-r="q" placeholder="${esc(cfg.placeholder || 'Search French or English')}" aria-label="Search the ${esc(noun)}">
            <select class="wl-sel" data-r="topic" aria-label="Topic"><option value="">All topics</option></select>
            <button type="button" class="wl-btn" data-r="fbtn" aria-expanded="false">Filters <span class="wl-badge" data-r="badge" hidden></span></button>
            <button type="button" class="wl-btn pri" data-r="play">${MEDIA_ICON.play(16)} Play list</button>
            <button type="button" class="wl-btn" data-r="copy" title="Copy the ${esc(noun)} shown, to paste into Excel or Sheets">Copy</button>
        </div>
        <div class="wl-panel" data-r="panel" hidden>
            <div data-r="chips"></div>
            <div class="wl-opts">
                <span class="font-bold text-slate-700">Play list reads the French, then</span>
                <label><input type="checkbox" data-o="mean"> the meaning</label>
                <label><input type="checkbox" data-o="hook"> the memory hook</label>
                ${cfg.example ? '<label><input type="checkbox" data-o="ex"> the example</label>' : ''}
                <label>Speed <select data-r="rate"><option value="1">Normal</option><option value="0.85">A little slower</option><option value="0.7">Slow</option></select></label>
                <label><input type="checkbox" data-o="hideLearned"> Hide ${esc(noun)} I've ticked as learned</label>
            </div>
        </div>
        <p class="wl-count" data-r="count">Loading the ${esc(noun)}…</p>
        <div class="be-list" data-r="list" role="list"></div>
    </div>`;
    const R = (k) => el.querySelector(`[data-r="${k}"]`);

    const passes = (it, skip) => {
        if (opts.hideLearned && learned.has(it.id)) return false;
        if (opts.topic && !it.topics.includes(opts.topic)) return false;
        return cfg.groups.every(g => g.key === skip || !F[g.key].length || F[g.key].includes(it.g[g.key]));
    };
    function compute() {
        const q = norm(query);
        const base = ITEMS.filter(it => passes(it));
        if (!q) return base;
        const score = (it) => { const fr = norm(it.fr), en = norm(it.en);
            if (fr === q || fr.replace(/^(le |la |les |l'|un |une |des |se |s')/, '') === q) return 0;
            if (fr.startsWith(q) || fr.includes(' ' + q)) return 1; if (en.includes(q)) return 2; if (fr.includes(q)) return 3; if (it.key.includes(q)) return 4; return 9; };
        return base.map(it => [score(it), it]).filter(x => x[0] < 9).sort((a, b) => a[0] - b[0] || a[1].n - b[1].n).map(x => x[1]);
    }
    function row(it) {
        const open = it.id === openId;
        return `<div class="be-item${open ? ' be-open' : ''}${learned.has(it.id) ? ' be-done' : ''}" data-id="${esc(it.id)}" role="listitem">
            <div class="be-top">
                <button type="button" class="be-chev" data-act="open" aria-expanded="${open}" aria-label="More about ${esc(it.fr)}">${ByEar.icons.CHEV}</button>
                <span class="be-num">${it.n}</span>
                <div class="be-w"><div class="be-word"><button type="button" class="be-spk main" data-act="say" aria-label="Hear ${esc(it.fr)}">${ByEar.icons.SPK}</button><span lang="fr">${esc(it.fr)}</span></div><span class="be-mean">${esc(it.en)}</span></div>
                <div class="be-tags">${it.tags.map(([c, t]) => c === 'lvl' ? `<span class="be-lvl">${esc(t)}</span>` : `<span class="be-tag ${c}">${esc(t)}</span>`).join('')}</div>
                <div class="be-hook">${it.pic ? `<span class="be-pic" role="img" aria-label="Picture for ${esc(it.fr)}">${it.pic}</span>` : ''}${it.hooks.length ? `<button type="button" class="be-spk" data-act="hook" aria-label="Hear the memory hook">${ByEar.icons.SPK}</button><span class="wl-hooks">${it.hooks.map(h => `<span>${esc(h)}</span>`).join('')}</span>` : '<span class="be-empty">No hook needed</span>'}</div>
                <button type="button" class="be-learn" data-act="learn" aria-pressed="${learned.has(it.id)}" aria-label="Learned">${ByEar.icons.TICK}</button>
            </div>
            <div class="be-detail"${open ? '' : ' hidden'}>${open ? `<div class="wl-detail">${it.detail}</div>` : ''}</div>
        </div>`;
    }
    function draw() {
        list = compute();
        R('list').innerHTML = list.length ? list.slice(0, shownN).map(row).join('') +
            (list.length > shownN ? `<button type="button" class="be-more" data-act="more">Show ${Math.min(60, list.length - shownN)} more of ${list.length.toLocaleString()} ${esc(noun)}</button>` : '')
            : `<p class="p-4 text-sm text-slate-500">Nothing matches. Try fewer filters or another spelling.</p>`;
        const nf = cfg.groups.reduce((n, g) => n + (F[g.key].length ? 1 : 0), 0) + (opts.hideLearned ? 1 : 0);
        R('badge').hidden = !nf; R('badge').textContent = nf;
        R('count').innerHTML = `Showing <b>${list.length.toLocaleString()}</b> of ${ITEMS.length.toLocaleString()} ${esc(noun)}${nf || query || opts.topic ? ' <button type="button" data-r="clear">Clear search and filters</button>' : ''}`;
        const c = R('clear'); if (c) c.onclick = () => { query = ''; R('q').value = ''; opts.topic = ''; R('topic').value = ''; cfg.groups.forEach(g => F[g.key] = []); opts.hideLearned = false; el.querySelector('[data-o="hideLearned"]').checked = false; save(); chipsUi.redraw(); shownN = 60; draw(); };
    }
    const save = () => { LocalStore.set(K + '_filters', F); LocalStore.set(K + '_play', opts); };

    R('list').addEventListener('click', (e) => {
        const a = e.target.closest('[data-act]');
        if (!a) { if (e.target.closest('.be-w') && !e.target.closest('button')) { const r = e.target.closest('.be-item'); if (r) toggle(r.dataset.id); } return; }
        if (a.dataset.act === 'more') { shownN += 60; draw(); return; }
        const r = a.closest('.be-item'), it = r && ITEMS.find(x => x.id === r.dataset.id); if (!it) return;
        if (a.dataset.act === 'open') toggle(it.id);
        else if (a.dataset.act === 'say') ByEar.say(it.say, 'fr');
        else if (a.dataset.act === 'hook') ByEar.say(it.hooks.join(' '), 'en');
        else if (a.dataset.act === 'ex') ByEar.say(it.ex, 'fr');
        else if (a.dataset.act === 'learn') {
            learned.has(it.id) ? learned.delete(it.id) : learned.add(it.id);
            LocalStore.set(K + '_learned', [...learned]);
            a.setAttribute('aria-pressed', learned.has(it.id)); r.classList.toggle('be-done', learned.has(it.id));
            if (learned.has(it.id) && typeof Activity !== 'undefined') Activity.record();
        }
    });
    function toggle(id) { openId = openId === id ? null : id; draw(); }
    let t = null;
    R('q').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { query = e.target.value; shownN = 60; openId = null; draw(); }, 150); });
    R('topic').addEventListener('change', (e) => { opts.topic = e.target.value; save(); shownN = 60; draw(); if (chipsUi) chipsUi.redraw(); });
    R('fbtn').addEventListener('click', () => { const p = R('panel'); p.hidden = !p.hidden; R('fbtn').setAttribute('aria-expanded', String(!p.hidden)); });
    el.querySelectorAll('[data-o]').forEach(i => { i.checked = !!opts[i.dataset.o]; i.addEventListener('change', () => { opts[i.dataset.o] = i.checked; save(); if (i.dataset.o === 'hideLearned') { shownN = 60; draw(); } }); });
    R('rate').value = String(ByEar.rate());
    R('rate').addEventListener('change', (e) => ByEar.setRate(+e.target.value));

    const player = new ByEar.Player({
        steps: (it) => [[it.say, 'fr']].concat(opts.mean ? [[it.en, 'en']] : [], opts.hook && it.hooks.length ? [[it.hooks.join(' '), 'en']] : [], opts.ex && it.ex ? [[it.ex, 'fr']] : []),
        label: (it) => it.fr,
        onItem: (it, i) => {
            if (i >= shownN) { shownN = Math.ceil((i + 1) / 60) * 60; draw(); }
            el.querySelectorAll('.be-item.be-now').forEach(r => r.classList.remove('be-now'));
            const r = el.querySelector(`.be-item[data-id="${CSS.escape(it.id)}"]`);
            if (r) { r.classList.add('be-now'); r.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        },
        onDone: () => { el.querySelectorAll('.be-item.be-now').forEach(r => r.classList.remove('be-now')); R('play').innerHTML = `${MEDIA_ICON.play(16)} Play list`; }
    });
    R('play').addEventListener('click', () => {
        if (ByEar.Player.current === player) { player.stop(); return; }
        if (!list.length) return;
        const at = openId != null ? Math.max(0, list.findIndex(x => x.id === openId)) : 0;
        player.start(list, at); R('play').innerHTML = `${MEDIA_ICON.stop(16)} Stop`;
    });
    R('copy').addEventListener('click', async () => {
        const q = ByEar.cell;
        const head = ['No.', 'French', 'Meaning', 'Tags', 'Memory hook'].concat(cfg.example ? ['Example', 'Example in English'] : []);
        const text = [head.map(q).join('\t')].concat(list.map(it => [it.n, q(it.fr), q(it.en), q(it.tags.map(x => x[1]).join(' · ')), q(it.hooks.join(' '))]
            .concat(cfg.example ? [q(it.ex || ''), q(it.exe || '')] : []).join('\t'))).join('\n');
        try { await navigator.clipboard.writeText(text); }
        catch (e) { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (x) {} ta.remove(); }
        const tt = document.createElement('div'); tt.className = 'wl-toast'; tt.textContent = `Copied ${list.length.toLocaleString()} ${noun}: paste into Excel or Sheets`; document.body.appendChild(tt); setTimeout(() => tt.remove(), 2200);
    });

    ByEar.load(cfg.url).then(json => {
        const p = cfg.prep(json); ITEMS = p.items; TOPICS = p.topics || [];
        R('topic').innerHTML = `<option value="">All topics (${TOPICS.length})</option>` + TOPICS.map(t => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('');
        if (!TOPICS.some(t => t.id === opts.topic)) opts.topic = '';
        R('topic').value = opts.topic;
        chipsUi = ByEar.chips(R('chips'), cfg.groups, F, (g, v) => ITEMS.filter(it => passes(it, g) && it.g[g] === v).length, () => { save(); shownN = 60; draw(); });
        draw();
    }).catch(err => { R('count').textContent = err.message + ' Reload the page to try again.'; });
    return { stop: () => player.stop() };
}
window.WordList = { mount };
})();
