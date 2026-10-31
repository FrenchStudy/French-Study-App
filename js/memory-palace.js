// memory-palace.js - the "Memory palace" step in Vocab.
// Each topic with a palace is a place cut open (a house, a station, a street of shops), drawn as rooms of big
// picture tiles: every word sits in the room where it happens, with its 3D picture (js/palace-icons.js,
// media/palace/; Microsoft Fluent Emoji, MIT). On a phone the rooms stack, three tiles to a row.
// Modes: Explore (tap anything), Walk through (room by room, in order; each stop is read out, "Play the walk" moves on
// by itself), Quiz (names hidden: find the object).
//
//   MemoryPalace.has(themeId)                      -> true if that topic has a palace
//   MemoryPalace.mount(el, themeId, words, opts)   -> draws it into el
//       words: the deck's words ({ key, fr, en, gender, pos })
//       opts.say(text): speak French; opts.grade(word, ok): record a quiz answer
//
// Palace data: zones are rooms (x, y, w, h in the scene's own units); items are objects
// { k: word key, e: emoji, z: zone id, l: one line linking the object to the word }.
// A zone with k is itself a word (la cuisine): its name tag can be tapped too.
// Words that are not in the deck are skipped, so a palace never shows a word the topic lacks.
(function () {
const PALACES = {};   // the palaces are in palaces-data.js and palaces-data-2.js

// ---------- small helpers ----------
const NS = 'http://www.w3.org/2000/svg';
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function mk(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
}
const CSS = `
.mp-top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px}
.mp-title{font-weight:900;font-size:1.25rem;color:#0f172a}
.mp-modes{display:flex;gap:4px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:4px}
.mp-modes button{font-weight:700;font-size:14px;color:#475569;background:transparent;border:0;border-radius:9px;padding:8px 12px;min-height:40px;cursor:pointer}
.mp-modes button[aria-pressed="true"]{background:#4f46e5;color:#fff}
.mp-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:16px;align-items:start}
@media (max-width:1023px){.mp-grid{grid-template-columns:minmax(0,1fr)}}
.mp-scene{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:12px}
.mp-frame{background:#334155;border-radius:14px;padding:10px}
.mp-frame.street{background:#cbd5e1}
.mp-roof{height:52px;background:#334155;clip-path:polygon(2% 100%,50% 0,98% 100%);display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px}
.mp-sign{background:#fff;border-radius:8px;padding:3px 14px;font-weight:900;font-size:14px;color:#1e293b;white-space:nowrap}
.mp-street{text-align:center;font-weight:900;font-size:18px;color:#475569;padding:10px 0 2px}
.mp-floor{display:flex;gap:10px;margin-bottom:10px}.mp-floor:last-child{margin-bottom:0}
.mp-room{background:#fff;border-radius:10px;padding:10px 10px 12px;min-width:0;border-bottom:8px solid #e2e8f0}
.mp-rh{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;min-height:30px}
.mp-rn{font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#64748b}
.mp-ren{font-size:12px;color:#94a3b8;text-align:right}
.mp-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:8px}
@media (max-width:640px){.mp-floor{flex-direction:column}.mp-tiles{grid-template-columns:repeat(3,minmax(0,1fr))}.mp-scene{padding:6px}.mp-frame{padding:6px}}
.mp-hint{display:none}
.mp-lock,.mp-lock body{overflow:hidden}
.mp-hint{font-size:13px;color:#64748b;margin-top:6px}
.mp-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px;display:grid;gap:10px}
@media (min-width:1024px){.mp-card{position:sticky;top:12px}}
@media (max-width:1023px){.mp-card{position:sticky;bottom:8px;z-index:5;box-shadow:0 -6px 24px rgba(15,23,42,.18);max-height:46vh;overflow:auto;padding:12px;gap:8px}.mp-card .mp-big{font-size:1.4rem}}
.mp-eyebrow{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#4f46e5}
.mp-big{font-size:1.75rem;font-weight:900;line-height:1.15;overflow-wrap:anywhere}
.mp-en{font-size:1.1rem;font-weight:700;color:#047857}
.mp-link{background:#eef2ff;border-radius:12px;padding:10px 12px;color:#1e293b}
.mp-hook{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:10px 12px;color:#1e293b;font-size:15px}
.mp-row{display:flex;flex-wrap:wrap;gap:8px}
.mp-btn{font-weight:700;font-size:15px;border:1px solid #e2e8f0;background:#fff;color:#0f172a;border-radius:12px;padding:10px 14px;min-height:44px;cursor:pointer}
.mp-btn.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.mp-btn:disabled{opacity:.45;cursor:default}
.mp-muted{font-size:14px;color:#64748b}
.mp-fb{font-weight:700}.mp-fb.ok{color:#047857}.mp-fb.no{color:#be123c}
.mp-m{color:#0369a1}.mp-f{color:#e11d48}
.mp-modes button:focus-visible,.mp-btn:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
.mp-spot{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:2px;background:#f8fafc;border:2px solid #e2e8f0;border-radius:14px;padding:8px 4px;cursor:pointer;font:inherit;color:inherit;min-height:124px;transition:border-color .15s,background .15s,transform .15s}
.mp-spot:hover{border-color:#a5b4fc}
.mp-spot,.mp-tag{scroll-margin-top:84px}
.mp-spot:focus-visible,.mp-tag:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
.mp-spot img{width:64px;height:64px;object-fit:contain;display:block}
.mp-spot .em{font-size:46px;line-height:64px;height:64px;display:block}
.mp-spot .ar{font-size:12px;color:#64748b;min-height:15px;line-height:15px}
.mp-spot .wd{font-size:15px;font-weight:800;line-height:1.15;text-align:center;color:#0f172a;overflow-wrap:anywhere}
.mp-spot .wd.m,.mp-tag.m{color:#0369a1}.mp-spot .wd.f,.mp-tag.f{color:#e11d48}
.mp-spot.on{border-color:#4f46e5;background:#eef2ff;transform:scale(1.04)}
.mp-spot.right{border-color:#059669;background:#ecfdf5}.mp-spot.wrong{border-color:#e11d48;background:#fff1f2}
.mp-tag{font:inherit;font-weight:800;font-size:14px;border:2px solid #cbd5e1;background:#f1f5f9;color:#0f172a;border-radius:999px;padding:4px 12px;min-height:32px;cursor:pointer}
.mp-tag.on{border-color:#4f46e5;background:#eef2ff}.mp-tag.right{border-color:#059669}.mp-tag.wrong{border-color:#e11d48}
.mp-quiz .mp-spot:not(.done) .ar,.mp-quiz .mp-spot:not(.done) .wd,.mp-quiz .mp-tag:not(.done) .lbl{visibility:hidden}
.mp-quiz .mp-tag:not(.done)::after{content:'?';font-weight:900;color:#64748b}
@media (max-width:640px){.mp-spot{min-height:112px;padding:6px 2px}.mp-spot img{width:56px;height:56px}.mp-spot .em{font-size:40px;line-height:56px;height:56px}.mp-spot .wd{font-size:14px}}
@media (prefers-reduced-motion:reduce){.mp-spot{transition:none}.mp-spot.on{transform:none}}
`;
function injectCss() {
    if (document.getElementById('mp-css')) return;
    const s = document.createElement('style'); s.id = 'mp-css'; s.textContent = CSS; document.head.appendChild(s);
}

// ---------- the step ----------
function mount(root, themeId, deckWords, opts = {}) {
    const P = PALACES[themeId];
    P.items = P.items.map(it => Array.isArray(it) ? { k: it[0], e: it[1], z: it[2], l: it[3] } : it);
    if (!P || !root) return;
    injectCss();
    const say = opts.say || (() => {});
    const grade = opts.grade || (() => {});
    const byKey = Object.fromEntries((deckWords || []).map(w => [w.key, w]));
    const items = P.items.filter(it => byKey[it.k]).map(it => ({ ...it, w: byKey[it.k] }));
    const tags = P.zones.filter(z => z.k && byKey[z.k] && !items.some(it => it.k === z.k)).map(z => ({ k: z.k, z: z.id, tag: true, w: byKey[z.k], e: '' }));
    const all = items.concat(tags);
    // walking order: zone by zone, the room name first
    const order = [];
    P.zones.forEach(z => { tags.filter(t => t.z === z.id).forEach(t => order.push(t)); items.filter(it => it.z === z.id).forEach(it => order.push(it)); });
    const zoneOf = Object.fromEntries(P.zones.map(z => [z.id, z]));
    const gc = (w) => w.gender === 'm' ? 'm' : w.gender === 'f' ? 'f' : '';

    root.innerHTML = `
        <div class="mp-top">
            <div><div class="mp-eyebrow">Memory palace</div><div class="mp-title">${esc(P.title)}</div></div>
            <div class="mp-tools">
                <div class="mp-modes" role="group" aria-label="Palace mode">
                    <button type="button" data-m="explore" aria-pressed="true">Explore</button>
                    <button type="button" data-m="walk" aria-pressed="false">Walk through</button>
                    <button type="button" data-m="quiz" aria-pressed="false">Quiz</button>
                </div>
            </div>
        </div>
        <div class="mp-grid">
            <div><div class="mp-scene"></div><p class="mp-hint">Tap a picture to see and hear the word. Each room is a place where the words happen.</p></div>
            <div class="mp-card" aria-live="polite"></div>
        </div>`;
    const sceneBox = root.querySelector('.mp-scene');
    const card = root.querySelector('.mp-card');
    const spots = new Map();
    function hookUp(el, it) {
        el.addEventListener('click', () => pick(it));
        spots.set(it, el);
    }
    const icon = (e) => {
        const f = window.PALACE_ICONS && PALACE_ICONS[e];
        return f ? `<img src="media/palace/${f}.webp" alt="" loading="lazy" decoding="async">` : `<span class="em" aria-hidden="true">${esc(e || '•')}</span>`;
    };
    // floors: rooms side by side when they sit at the same height in the old picture
    const zs = P.zones.slice().sort((a, b) => a.y - b.y || a.x - b.x), floors = [];
    zs.forEach(z => { const f = floors[floors.length - 1]; if (f && Math.abs(f[0].y - z.y) < 40) f.push(z); else floors.push([z]); });
    floors.forEach(f => f.sort((a, b) => a.x - b.x));
    const b = P.backdrop || {};
    const frame = document.createElement('div');
    frame.className = 'mp-frame' + (b.street ? ' street' : '');
    floors.forEach(f => {
        const fl = document.createElement('div'); fl.className = 'mp-floor';
        f.forEach(z => {
            const its = items.filter(it => it.z === z.id), tag = tags.find(t => t.z === z.id);
            if (!its.length && !tag) return;
            const room = document.createElement('section');
            room.className = 'mp-room';
            room.style.flex = `${z.w} 1 0`;
            if (z.shop) room.style.borderTop = `8px solid ${z.shop}`;
            const head = document.createElement('div'); head.className = 'mp-rh';
            if (tag) {
                const t = document.createElement('button');
                t.type = 'button'; t.className = 'mp-tag ' + gc(tag.w); t.setAttribute('aria-label', `${tag.w.fr}: ${tag.w.en}`);
                t.innerHTML = `<span class="lbl">${esc(tag.w.fr)}</span>`;
                head.appendChild(t); hookUp(t, tag);
            } else head.insertAdjacentHTML('beforeend', `<span class="mp-rn">${esc(z.fr)}</span>`);
            head.insertAdjacentHTML('beforeend', `<span class="mp-ren">${esc(z.en)}</span>`);
            room.appendChild(head);
            const tiles = document.createElement('div'); tiles.className = 'mp-tiles';
            its.forEach(it => {
                const w = it.w, m = /^(le\/la |le |la |les |l['’]|un |une )(.*)$/i.exec(w.fr);
                const el = document.createElement('button');
                el.type = 'button'; el.className = 'mp-spot'; el.setAttribute('aria-label', `${w.fr}: ${w.en}`);
                el.innerHTML = `${icon(it.e)}<span class="ar">${esc(m ? m[1].trim() : '')}</span><span class="wd ${gc(w)}">${esc(m ? m[2] : w.fr)}</span>`;
                tiles.appendChild(el); hookUp(el, it);
            });
            room.appendChild(tiles);
            fl.appendChild(room);
        });
        if (fl.children.length) frame.appendChild(fl);
    });
    if (b.roof || b.sign) {
        const roof = document.createElement('div'); roof.className = 'mp-roof';
        roof.innerHTML = `<span class="mp-sign">${esc(b.sign || P.title)}</span>`;
        sceneBox.appendChild(roof);
    }
    sceneBox.appendChild(frame);
    if (b.street) sceneBox.insertAdjacentHTML('beforeend', `<div class="mp-street">${esc(b.streetName || '')}</div>`);

    // ---------- modes ----------

    let mode = 'explore', quiz = null;
    const modeBtns = root.querySelectorAll('.mp-modes button');
    modeBtns.forEach(b => b.addEventListener('click', () => setMode(b.dataset.m)));
    function clearMarks() { spots.forEach(g => g.classList.remove('on', 'right', 'wrong', 'done')); }
    function highlight(it) {
        spots.forEach(g => g.classList.remove('on'));
        if (!it) return;
        const g = spots.get(it); g.classList.add('on');
        // on a phone the word card sits at the bottom of the screen, so the tile goes to the top half
        const r = g.getBoundingClientRect(), narrow = window.innerWidth < 1024;
        const limit = narrow ? window.innerHeight * 0.5 : window.innerHeight;
        if (r.top < 70 || r.bottom > limit) g.scrollIntoView({ block: narrow ? 'start' : 'center', behavior: 'smooth' });
    }
    // Auto walk: speaks each stop and moves on by itself until paused
    let autoTimer = null;
    const AUTO_MS = 3200;
    function stopAuto() { clearTimeout(autoTimer); autoTimer = null; }
    function setMode(m) {
        stopAuto();
        mode = m;
        modeBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.m === m));
        sceneBox.classList.toggle('mp-quiz', m === 'quiz');
        clearMarks();
        if (m === 'explore') intro();
        if (m === 'walk') show(0, true);
        if (m === 'quiz') startQuiz();
    }
    function intro() {
        card.innerHTML = `<div class="mp-eyebrow">How it works</div>
            <div class="mp-big">Walk the rooms</div>
            <p class="mp-muted">Each of the ${all.length} words sits in the place where it happens. Walk through once, then close your eyes and walk it again in your head, naming each object in French.</p>
            <p class="mp-muted"><b class="mp-m">Blue</b> = masculine, <b class="mp-f">red</b> = feminine.</p>
            <div class="mp-row"><button type="button" class="mp-btn pri" data-a="walk">Start the walk →</button></div>`;
        card.querySelector('[data-a="walk"]').addEventListener('click', () => setMode('walk'));
    }
    function wordHtml(it) {
        const z = zoneOf[it.z], w = it.w;
        const hook = window.WordMemory && WordMemory.hook(w);
        return `<div class="mp-eyebrow">${esc(z.fr)} · ${esc(z.en)}</div>
            <div class="mp-big mp-${gc(w) || 'n'}">${esc(w.fr)}</div>
            <div class="mp-en">${esc(w.en)}</div>
            ${it.l ? `<div class="mp-link">${it.e} ${esc(it.l)}</div>` : ''}
            ${hook ? `<div class="mp-hook">💡 ${WordMemory.hookHtml(hook)}</div>` : ''}`;
    }
    function show(i, walking) {
        const it = walking ? order[i] : i;
        highlight(it);
        if (walking && autoTimer) clearTimeout(autoTimer);   // a tap on the picture replaces the pending step
        const auto = walking && autoTimer !== null;
        card.innerHTML = wordHtml(it) + `<div class="mp-row">
            <button type="button" class="mp-btn" data-a="say">🔊 Listen</button>
            ${walking ? `<button type="button" class="mp-btn" data-a="prev" ${i === 0 ? 'disabled' : ''}>← Back</button>
                         <button type="button" class="mp-btn pri" data-a="next">${i === order.length - 1 ? 'Finish' : 'Next →'}</button>` : ''}
            </div>${walking ? `<div class="mp-row"><button type="button" class="mp-btn" data-a="auto" aria-pressed="${auto}">${auto ? (window.MEDIA_ICON ? MEDIA_ICON.pause(16) + ' Pause' : 'Pause') : (window.MEDIA_ICON ? MEDIA_ICON.play(16) + ' Play the walk' : '▶ Play the walk')}</button></div>
            <p class="mp-muted">Stop ${i + 1} of ${order.length}${auto ? ' · moving on by itself' : ''}</p>` : ''}`;
        card.querySelector('[data-a="say"]').addEventListener('click', () => say(it.w.fr));
        if (walking) {
            // Each stop reads its word out as soon as you reach it
            say(it.w.fr);
            const next = () => {
                if (!root.isConnected || !card.offsetParent) return stopAuto();   // left the palace: stop talking
                if (i === order.length - 1) { stopAuto(); walkDone(); } else show(i + 1, true);
            };
            card.querySelector('[data-a="prev"]').addEventListener('click', () => { stopAuto(); show(Math.max(0, i - 1), true); });
            card.querySelector('[data-a="next"]').addEventListener('click', () => { if (autoTimer !== null) { clearTimeout(autoTimer); autoTimer = 0; } next(); });
            card.querySelector('[data-a="auto"]').addEventListener('click', () => {
                if (autoTimer !== null) { stopAuto(); show(i, true); return; }
                autoTimer = 0; next();
            });
            if (autoTimer !== null) autoTimer = setTimeout(next, AUTO_MS);
        }
    }
    function walkDone() {
        highlight(null);
        card.innerHTML = `<div class="mp-eyebrow">Walk finished</div><div class="mp-big">Now close your eyes</div>
            <p class="mp-muted">Picture the place room by room and name each object in French. Then test yourself: the names disappear and you find the objects.</p>
            <div class="mp-row"><button type="button" class="mp-btn pri" data-a="quiz">Take the quiz</button><button type="button" class="mp-btn" data-a="again">Walk again</button></div>`;
        card.querySelector('[data-a="quiz"]').addEventListener('click', () => setMode('quiz'));
        card.querySelector('[data-a="again"]').addEventListener('click', () => setMode('walk'));
    }
    function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
    function startQuiz() { quiz = { list: shuffle(all), k: 0, score: 0, tries: 0 }; ask(); }
    function ask() {
        highlight(null);
        if (quiz.k >= quiz.list.length) {
            const n = quiz.list.length;
            card.innerHTML = `<div class="mp-eyebrow">Quiz done</div><div class="mp-big">${quiz.score} / ${n}</div>
                <p class="mp-muted">${quiz.score >= n * 0.85 ? 'Excellent: the place is in your head. Words found first time move up in your reviews.' : 'Walk through once more, then try again. It gets easier each time.'}</p>
                <div class="mp-row"><button type="button" class="mp-btn pri" data-a="again">Try again</button><button type="button" class="mp-btn" data-a="walk">Walk through</button></div>`;
            card.querySelector('[data-a="again"]').addEventListener('click', () => setMode('quiz'));
            card.querySelector('[data-a="walk"]').addEventListener('click', () => setMode('walk'));
            return;
        }
        const it = quiz.list[quiz.k];
        quiz.tries = 0;
        card.innerHTML = `<div class="mp-eyebrow">Find it</div><div class="mp-big">${esc(it.w.en)}</div>
            <p class="mp-muted">Tap the object (or room name) that means this. Names stay hidden until you find them.</p>
            <p class="mp-fb" id="mp-fb"></p><p class="mp-muted">Score ${quiz.score} · ${quiz.k + 1} of ${quiz.list.length}</p>`;
    }
    function quizTap(it) {
        const want = quiz.list[quiz.k];
        if (it === want) {
            const first = quiz.tries === 0;
            if (first) quiz.score++;
            grade(it.w, first);
            const g = spots.get(it); g.classList.add('right', 'done');
            say(it.w.fr);
            card.innerHTML = wordHtml(it) + `<p class="mp-fb ok">${first ? 'Right first time!' : 'Found it.'}</p>
                <div class="mp-row"><button type="button" class="mp-btn" data-a="say">🔊 Listen</button><button type="button" class="mp-btn pri" data-a="next">Next →</button></div>
                <p class="mp-muted">Score ${quiz.score} · ${quiz.k + 1} of ${quiz.list.length}</p>`;
            card.querySelector('[data-a="say"]').addEventListener('click', () => say(it.w.fr));
            card.querySelector('[data-a="next"]').addEventListener('click', () => { g.classList.remove('right'); quiz.k++; ask(); });
            highlight(it);
        } else {
            quiz.tries++;
            const g = spots.get(it); g.classList.add('wrong'); setTimeout(() => g.classList.remove('wrong'), 600);
            const fb = card.querySelector('#mp-fb'), z = zoneOf[want.z];
            if (fb) { fb.className = 'mp-fb no'; fb.textContent = quiz.tries >= 2 ? `Hint: look in ${z.fr} (${z.en}).` : 'Not that one. Try again.'; }
        }
    }
    function pick(it) {
        if (mode === 'quiz') { if (!spots.get(it).classList.contains('done')) quizTap(it); return; }
        if (mode === 'walk') { show(order.indexOf(it), true); return; }
        show(it, false);
        say(it.w.fr);
    }
    intro();
}

// more palaces live in js/palaces-data.js (loaded before this file)
Object.assign(PALACES, window.PALACE_DATA || {});

window.MemoryPalace = {
    has: (id) => !!PALACES[id],
    css: injectCss,   // other step-2 tools (the World map) reuse these styles
    mount,
    _data: PALACES   // for tests
};
})();
