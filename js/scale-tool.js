// scale-tool.js - slider tools in step 2 of Vocab topics whose words sit on a line rather than in a room:
// 3 Connectors (Le lien, L'échelle, Ce qui suit, Le texte: data in connectors-data.js; a story timeline for d'abord… enfin), 12 Personality (opposites), 13 Emotions (how strong), 16 Opposites, 44 Ideas & Opinions (how sure),
// 54 Formal French and 56 Slang (register: familier · courant · soutenu), 55 Precise verbs (weak → strong).
// The words are in scale-data.js. Each topic has tabs; each tab has Explore (slide or tap: the word, an example,
// said aloud when you land on it) and Check yourself (10 questions; right first time moves the word up a box).
//   VocabTools[themeId] = { name, next, mount(el, { say, grade, words }) }
(function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const plain = (s) => String(s).toLowerCase().replace(/[.!?…\s]+$/g, '').replace(/\s+/g, ' ').trim();
const LEVEL_EN = { familier: 'slang, with friends', courant: 'everyday, with anyone', soutenu: 'formal, letters and offices' };

const CSS = `
.st{display:grid;gap:12px;max-width:820px}
.st-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
/* tabs in groups (Connectors): the group buttons, then the tabs of the open group */
.st .st-grp{font-weight:800}.st .st-grp[aria-pressed="true"]{background:#0f172a;border-color:#0f172a;color:#fff}
.st-tab[hidden]{display:none}
.st-btn{font-weight:700;font-size:var(--fs-base);border:1px solid #e2e8f0;background:#fff;color:#0f172a;border-radius:12px;padding:8px 14px;min-height:44px;cursor:pointer}
.st-btn.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.st-btn[aria-pressed="true"]{background:#eef2ff;border-color:#6366f1;color:#3730a3}
.st-tab[aria-selected="true"]{background:#4f46e5;border-color:#4f46e5;color:#fff}
.st-btn:focus-visible,.st-chip:focus-visible,.st-opt:focus-visible,.st-stop:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
.st-snd{margin-left:auto;display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);color:#475569;cursor:pointer;min-height:44px}
.st-snd input{width:18px;height:18px;accent-color:#4f46e5}
.st-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px;display:grid;gap:10px}
.st-hint{font-size:var(--fs-sm);color:#64748b;margin:0}
.st-chips{display:flex;flex-wrap:wrap;gap:6px}
.st-chip{border:1px solid #e2e8f0;background:#f8fafc;border-radius:999px;padding:6px 12px;min-height:38px;font-size:var(--fs-sm);color:#334155;cursor:pointer}
.st-chip[aria-pressed="true"]{background:#eef2ff;border-color:#6366f1;color:#3730a3;font-weight:800}
.st-track{position:relative;margin:48px 12px 46px}
.st input[type=range]{width:100%;height:30px;margin:0;cursor:pointer}
.st-stop{position:absolute;transform:translateX(-50%);background:none;border:0;cursor:pointer;font-size:var(--fs-sm);color:#64748b;white-space:nowrap;padding:4px}
.st-stop.first{transform:none}.st-stop.last{transform:translateX(-100%)}
.st-stop.up{bottom:30px}.st-stop.down{top:30px}
.st-stop.on{font-weight:900}
.st-ends{display:flex;justify-content:space-between;gap:10px;font-size:var(--fs-sm);color:#64748b;margin:-36px 12px 6px}
.st-poles{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin:6px 4px 0}
.st-pole{font-size:var(--fs-xl);font-weight:900;color:#94a3b8;transition:color .2s,transform .2s;cursor:pointer;background:none;border:0;padding:4px}
.st-pole.on{transform:scale(1.08)}
.st-mid{font-size:var(--fs-sm);color:#94a3b8}
.st-out{border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;background:#f8fafc;min-height:76px}
.st-big{font-size:var(--fs-2xl);font-weight:900;cursor:pointer}
.st-en{font-size:var(--fs-sm);color:#475569}
.st-ex{margin-top:8px;font-size:var(--fs-base);color:#0f172a;cursor:pointer}.st-ex div{font-size:var(--fs-sm);color:#64748b}
.st-note{margin-top:8px;font-size:var(--fs-sm);line-height:1.5;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:8px 10px;color:#1e293b}
.st-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
.st-group{border-radius:14px;padding:10px;display:grid;gap:6px;align-content:start}
.st-group h4{margin:0;font-size:var(--fs-base);font-weight:900;color:#fff}
.st-group small{color:#fff;opacity:.9;font-size:var(--fs-xs);margin-top:-4px}
.st-rule{background:rgba(255,255,255,.18);color:#fff;border-radius:8px;padding:6px 8px;font-size:var(--fs-sm);line-height:1.4}
.st-group .st-chip{background:#fff;border-color:transparent;text-align:left;border-radius:10px}
.st-q{font-size:var(--fs-xl);font-weight:900;color:#0f172a}
.st-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
@media (max-width:560px){.st-opts{grid-template-columns:1fr}}
.st-opt{text-align:left;font-size:var(--fs-base);font-weight:700;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:10px 14px;min-height:50px;cursor:pointer;color:#0f172a}
.st-opt.ok{background:#ecfdf5;border-color:#059669}.st-opt.no{background:#fff1f2;border-color:#e11d48}
.st-fb{font-weight:800;margin:0}.st-fb.ok{color:#047857}.st-fb.no{color:#be123c}
.st-small{font-size:var(--fs-sm);color:#64748b}
.st-trap,.st-means{margin-top:6px;font-size:var(--fs-base)}.st-trap span,.st-means span{font-size:var(--fs-xs);font-weight:800;text-transform:uppercase;letter-spacing:.04em;margin-right:6px}
.st-trap span{color:#be123c}.st-trap s{color:#be123c}.st-means span{color:#047857}.st-means b{color:#047857}

.st-roles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;align-items:start}
.st-role{border-radius:12px;padding:8px 10px;display:flex;flex-wrap:wrap;gap:5px;align-content:flex-start;color:#fff}.st-role h4,.st-role small,.st-role .st-det{flex-basis:100%}.st-role.wide{grid-column:span 2}@media(max-width:520px){.st-roles{grid-template-columns:1fr}.st-role.wide{grid-column:auto}}
.cl-sent{font-size:var(--fs-xl);line-height:1.6;color:#0f172a;padding:12px 14px;border:1px solid #e2e8f0;border-radius:12px;background:#fff}
.cl-step{font-weight:800;color:#334155;font-size:var(--fs-sm);margin-top:4px}
.cl-links{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}
.cl-link{display:grid;grid-template-columns:auto 1fr;gap:0 8px;align-items:center;text-align:left;border:2px solid #e2e8f0;border-left:6px solid var(--c);background:#fff;border-radius:12px;padding:8px 10px;min-height:52px;cursor:pointer;font:inherit}
.cl-link span{grid-row:span 2;font-size:var(--fs-xl);display:flex}.cl-link span svg{width:32px;height:32px}.cl-link b{font-size:var(--fs-base);color:#0f172a}.cl-link small{font-size:var(--fs-xs);color:#64748b;line-height:1.2}
.cl-link.ok{border-color:var(--c);background:#f0fdf4}.cl-link.no{opacity:.45}.cl-link:disabled{cursor:default}
.st-chip.no{opacity:.45;text-decoration:line-through}.st-chip.ok{background:#ecfdf5;border-color:#059669}
.cl-legend{display:flex;flex-wrap:wrap;gap:12px;font-size:var(--fs-sm);color:#334155;font-weight:700}.cl-legend span::before{content:'';display:inline-block;width:12px;height:12px;border-radius:4px;background:var(--c);margin-right:5px;vertical-align:-1px}
.cl-roles{display:grid;gap:10px}
.cl-role{border:1px solid #e2e8f0;border-top:5px solid var(--c);border-radius:12px;padding:10px 12px;background:#fff}
.cl-role h4{margin:0 0 6px;font-size:var(--fs-base);font-weight:900;color:var(--c)}.cl-role h4 small{font-size:var(--fs-xs);color:#64748b;font-weight:600}
.cl-lad{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:6px 0}.cl-lad .st-det{flex-basis:100%}
.cl-arr{color:#94a3b8;font-weight:900}
.cl-rung{display:inline-flex;flex-direction:column;align-items:flex-start;border-radius:10px;border-left:5px solid var(--t);line-height:1.15}.cl-rest[hidden]{display:none}.cl-rung small{font-size:var(--fs-xs);font-weight:700;color:var(--t)}
.cl-more{border:0;background:none;color:#4f46e5;font-weight:800;font-size:var(--fs-sm);padding:6px 0;cursor:pointer}
.cl-rules{margin:0;padding:10px 12px 10px 28px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;font-size:var(--fs-sm);color:#334155;display:grid;gap:4px}
.cl-now{display:grid;gap:6px;justify-items:center;text-align:center;padding:8px}
.cl-word{font-size:var(--fs-3xl);font-weight:900;color:#0f172a;border:2px dashed #cbd5e1;background:#fff;border-radius:16px;padding:10px 22px;cursor:pointer}
.cl-bins{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}@media(min-width:640px){.cl-bins{grid-template-columns:repeat(4,1fr)}}
.cl-bin{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;border:2px solid var(--c);border-top-width:6px;background:#fff;border-radius:12px;padding:8px 10px;min-height:96px;cursor:pointer;font:inherit}
.cl-bin b{color:var(--c);font-size:var(--fs-base)}.cl-bin small{color:#64748b;font-size:var(--fs-xs)}.cl-bin.no{opacity:.5}
.cl-got{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.cl-got span{font-size:var(--fs-xs);font-weight:700;background:#f1f5f9;border-radius:6px;padding:2px 6px;color:#334155}
.cl-text{font-size:var(--fs-lg);line-height:1.9;color:#0f172a;padding:12px 14px;border:1px solid #e2e8f0;border-radius:12px;background:#fff}
.cl-hole{display:inline-block;min-width:44px;text-align:center;border-bottom:2px solid #cbd5e1;color:#94a3b8;font-size:var(--fs-sm);font-weight:800;margin:0 2px}
.cl-hole.now{border-color:#4f46e5;color:#4f46e5;background:#eef2ff;border-radius:6px 6px 0 0}
.cl-fill{font-weight:800;color:#047857;background:#ecfdf5;border-radius:6px;padding:0 2px}
.st-say{margin-top:12px;padding:12px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;display:grid;gap:8px}.st-say .en{font-size:var(--fs-base);font-weight:700;color:#0f172a}.st-say .fr{font-size:var(--fs-base);color:#047857;font-weight:700}
.st-role h4{margin:0;font-size:var(--fs-sm);font-weight:900}.st-role small{font-size:var(--fs-xs);opacity:.9;margin-top:-4px}
.st-role .st-chip{background:#fff;border-color:transparent;border-radius:10px;font-weight:800;color:#0f172a}
.st-join{border:1px solid #e2e8f0;border-radius:14px;padding:14px;background:#f8fafc;display:grid;gap:12px}
.st-sent{font-size:var(--fs-xl);font-weight:700;line-height:1.6;color:#0f172a}
.st-gap{display:inline-block;min-width:96px;border-bottom:3px dashed #94a3b8;text-align:center;color:#94a3b8;margin:0 6px;font-weight:900}
.st-gap.ok{border-bottom-style:solid;color:#fff;border-radius:8px;padding:0 8px}
.st-gap.no{border-bottom-color:#e11d48;color:#e11d48}
.st-seq{position:relative;display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:4px 0 0}
.st-seq-line{position:absolute;left:10%;right:10%;top:38px;height:6px;border-radius:3px;background:#e2e8f0}
.st-seq-fill{height:100%;border-radius:3px;background:#4f46e5;transition:width .4s}
.st-node{position:relative;display:grid;justify-items:center;gap:4px;background:none;border:0;cursor:pointer;padding:0;font:inherit}
.st-node .n{width:76px;height:76px;border-radius:50%;background:#fff;border:3px solid #cbd5e1;display:grid;place-items:center;transition:border-color .2s,transform .2s}
.st-node .n img{width:52px;height:52px;object-fit:contain}
.st-node .k{font-size:var(--fs-base);font-weight:900;color:#334155}.st-node .e{font-size:var(--fs-xs);color:#64748b}
.st-node .num{position:absolute;top:-4px;left:calc(50% + 22px);width:24px;height:24px;border-radius:50%;background:#94a3b8;color:#fff;font-size:var(--fs-sm);font-weight:900;display:grid;place-items:center}
.st-node.on .n{border-color:#4f46e5;transform:scale(1.08)}.st-node.on .k{color:#4f46e5}.st-node.on .num{background:#4f46e5}
.st-node.done .n{border-color:#a5b4fc}
.st-mid{text-align:center;font-size:var(--fs-sm);color:#4f46e5;font-weight:700;margin-top:-2px}
.st-story{display:grid;gap:6px}
.st-line{display:flex;gap:10px;align-items:center;font-size:var(--fs-base);color:#0f172a;cursor:pointer;opacity:.25;transition:opacity .3s}
.st-line.shown{opacity:1}.st-line b{color:#4f46e5}.st-line small{display:block;font-size:var(--fs-sm);color:#64748b}
.st-line img{width:34px;height:34px;object-fit:contain;flex:none}
@media (max-width:560px){.st-node .n{width:54px;height:54px}.st-node .n img{width:36px;height:36px}.st-seq-line{top:27px}.st-node .k{font-size:var(--fs-sm)}.st-node .e{display:none}.st-node .num{left:calc(50% + 14px);width:20px;height:20px;font-size:var(--fs-xs)}.st-sent{font-size:var(--fs-lg)}}
.st-det{background:#fff;border-radius:10px;padding:10px 12px;display:grid;gap:6px;color:#0f172a;box-shadow:0 2px 8px rgba(0,0,0,.12);animation:st-pop .18s ease-out}
.st-det .w{font-size:var(--fs-xl);font-weight:900}.st-det .en{font-size:var(--fs-sm);color:#475569}
.st-det .ex{font-size:var(--fs-base);line-height:1.45;cursor:pointer}.st-det .ex div{font-size:var(--fs-sm);color:#64748b}
.st-det mark{background:#FEF08A;color:inherit;border-radius:4px;padding:0 2px;font-weight:800}
.st-det .st-note{margin-top:0}
.st-det .st-row{gap:6px}.st-det .st-btn{min-height:38px;padding:6px 10px;font-size:var(--fs-sm)}
.st-chip.open{font-weight:900;box-shadow:inset 0 0 0 2px currentColor}
@keyframes st-pop{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.st-det{animation:none}}
.st-phone{display:none}
@media (max-width:600px){.st-phone{display:flex}.st-stop{display:none}.st-track{margin:16px 4px 10px}.st-ends{margin:-6px 4px 6px}}`;
function css() { if (!document.getElementById('st-css')) { const s = document.createElement('style'); s.id = 'st-css'; s.textContent = CSS; document.head.appendChild(s); } }

function mount(T, root, { say, grade, words }) {
    css();
    let tabI = 0, mode = 'explore', timer = null;
    const GROUPS = [...new Set(T.tabs.map(t => t.group).filter(Boolean))];
    root.innerHTML = `<div class="st">
      ${GROUPS.length ? `<div class="st-row" role="group" aria-label="Parts">${GROUPS.map((g, i) => `<button type="button" class="st-btn st-grp" data-g="${i}" aria-pressed="${i === 0}">${esc(g)}</button>`).join('')}</div>` : ''}
      <div class="st-row" role="tablist" aria-label="Scales">${T.tabs.map((t, i) => `<button type="button" role="tab" class="st-btn st-tab" data-t="${i}" aria-selected="${i === 0}"${GROUPS.length && t.group !== GROUPS[0] ? ' hidden' : ''}>${esc(t.title)}</button>`).join('')}</div>
      <div class="st-row"><button type="button" class="st-btn" data-m="explore" aria-pressed="true">Explore</button><button type="button" class="st-btn" data-m="check" aria-pressed="false">Check yourself</button>
        <label class="st-snd"><input type="checkbox" id="st-snd" checked> Sound on</label></div>
      <div class="st-card" id="st-body" aria-live="polite"></div></div>`;
    const $ = (s) => root.querySelector(s), body = $('#st-body'), snd = $('#st-snd');
    const speak = (t) => { if (snd.checked && root.isConnected) say(t); };
    const later = (t) => { clearTimeout(timer); timer = setTimeout(() => speak(t), 380); };
    snd.addEventListener('change', () => { if (!snd.checked && window.speechSynthesis) speechSynthesis.cancel(); });
    const wordFor = (key) => key && (words || []).find(x => plain(x.fr) === plain(key) || plain(x.key || '') === plain(key));
    const mark = (key, ok) => { const w = wordFor(key); if (w && grade) grade(w, ok); };
    const box = (fr, en, ex, note, color) => `<span class="st-big" style="color:${color}">${esc(fr)}</span><div class="st-en">${esc(en)}</div>`
        + (ex ? `<div class="st-ex" data-say="${esc(ex[0])}">${esc(ex[0])}<div>${esc(ex[1])}</div></div>` : '') + (note ? `<div class="st-note">${esc(note)}</div>` : '');
    const wire = (el, all) => { el.querySelector('.st-big')?.addEventListener('click', () => speak(all)); el.querySelectorAll('.st-ex').forEach(x => x.addEventListener('click', () => speak(x.dataset.say))); };

    // a slider with labelled stops (scale, register); stops: [{ p, lab }]; onLand(i, auto)
    function slider(stops, color, onLand, start) {
        const tr = document.createElement('div'); tr.className = 'st-track';
        tr.innerHTML = `<input type="range" min="0" max="100" style="accent-color:${color}" aria-label="Slide">`;
        const sl = tr.querySelector('input');
        const chips = document.createElement('div'); chips.className = 'st-chips st-phone';
        const labs = stops.map((s, i) => {
            const b = document.createElement('button'); b.type = 'button';
            b.className = 'st-stop ' + (i % 2 ? 'down' : 'up') + (s.p < 6 ? ' first' : s.p > 94 ? ' last' : '');
            b.style.left = s.p + '%'; b.textContent = s.lab; b.addEventListener('click', () => { sl.value = s.p; go(true, true, true); });
            tr.appendChild(b);
            const c = document.createElement('button'); c.type = 'button'; c.className = 'st-chip'; c.textContent = s.lab;
            c.addEventListener('click', () => { sl.value = s.p; go(true, true, true); }); chips.appendChild(c);
            return [b, c];
        });
        let cur = -1;
        function go(snap, auto, again) {
            let k = 0; stops.forEach((s, i) => { if (Math.abs(s.p - sl.value) < Math.abs(stops[k].p - sl.value)) k = i; });
            if (snap) sl.value = stops[k].p;
            if (k === cur && !again) return;
            cur = k; labs.forEach(([b, c], i) => { b.classList.toggle('on', i === k); b.style.color = i === k ? color : ''; c.setAttribute('aria-pressed', i === k); });
            sl.setAttribute('aria-valuetext', stops[k].lab);
            onLand(k, auto);
        }
        sl.addEventListener('input', () => go(false, true)); sl.addEventListener('change', () => go(true, true));
        sl.addEventListener('keydown', (e) => { const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]; if (!d) return; e.preventDefault(); const k = Math.max(0, Math.min(stops.length - 1, cur + d)); sl.value = stops[k].p; go(true, true); });
        sl.value = stops[start || 0].p;
        return { tr, chips, go };
    }

    // ---------------- Explore ----------------
    function exploreScale(t) {
        body.innerHTML = `<p class="st-hint">${esc(t.hint)}</p><div id="st-sl"></div><div class="st-ends"><span>← ${esc(t.left)}</span><span>${esc(t.right)} →</span></div><div class="st-out"></div>`;
        const out = body.querySelector('.st-out');
        const s = slider(t.stops.map(x => ({ p: x.p, lab: x.lab || x.fr })), t.color, (k, auto) => {
            const x = t.stops[k], all = x.fr + '. ' + x.ex[0];
            out.innerHTML = box(x.fr, x.en, x.ex, x.note, t.color); wire(out, all); if (auto) later(all);
        }, Math.floor(t.stops.length / 2));
        const host = body.querySelector('#st-sl'); host.append(s.tr, s.chips); s.go(true, false);
    }
    function explorePairs(t) {
        body.innerHTML = `<p class="st-hint">${esc(t.hint)}</p><div class="st-chips" id="st-pairs"></div>
          <div class="st-poles"><button type="button" class="st-pole" data-end="0"></button><span class="st-mid"></span><button type="button" class="st-pole" data-end="100"></button></div>
          <div class="st-track" style="margin:8px 12px 10px"><input type="range" min="0" max="100" value="0" aria-label="Slide between the two words" style="accent-color:#4f46e5"></div>
          <div class="st-out"></div>`;
        const sl = body.querySelector('input'), out = body.querySelector('.st-out'), poles = body.querySelectorAll('.st-pole'), mid = body.querySelector('.st-mid');
        let P = null, side = null;
        const pick = (i) => {
            P = t.pairs[i]; side = null;
            body.querySelectorAll('#st-pairs .st-chip').forEach((c, j) => c.setAttribute('aria-pressed', j === i));
            poles[0].textContent = P.a[0]; poles[1].textContent = P.b[0];
            if (t.mid === false && P.mid === undefined) P.mid = false;
            mid.textContent = P.mid === false ? '' : '↔';
            sl.value = 0; land(true, false);
        };
        function land(snap, auto) {
            const v = Number(sl.value), canMid = P.mid !== false;
            let s = v < 35 ? 'a' : v > 65 ? 'b' : canMid ? 'm' : (v < 50 ? 'a' : 'b');
            if (snap) sl.value = s === 'a' ? 0 : s === 'b' ? 100 : 50;
            poles[0].classList.toggle('on', s === 'a'); poles[1].classList.toggle('on', s === 'b');
            poles[0].style.color = s === 'a' ? '#0369a1' : ''; poles[1].style.color = s === 'b' ? '#e11d48' : '';
            if (s === side) return; side = s;
            const first = (w) => w.split(' · ')[0];
            if (s === 'm') {
                const fr = `ni ${first(P.a[0])} ni ${first(P.b[0])}`;
                out.innerHTML = box(fr, `neither ${P.a[1].split(',')[0]} nor ${P.b[1].split(',')[0]}`, null, null, '#64748b'); wire(out, fr); if (auto) later(fr);
                return;
            }
            const w = s === 'a' ? P.a : P.b, all = w[0].replace(/ · /g, ', ') + '. ' + w[2];
            out.innerHTML = box(w[0], w[1], [w[2], w[3]], P.note, s === 'a' ? '#0369a1' : '#e11d48'); wire(out, all); if (auto) later(all);
        }
        body.querySelector('#st-pairs').innerHTML = t.pairs.map((p, i) => `<button type="button" class="st-chip" data-i="${i}">${esc(p.a[0].split(' · ')[0])} ↔ ${esc(p.b[0].split(' · ')[0])}</button>`).join('');
        body.querySelectorAll('#st-pairs .st-chip').forEach(c => c.addEventListener('click', () => { pick(Number(c.dataset.i)); land(true, true); later(P.a[0].replace(/ · /g, ', ') + '. ' + P.a[2]); }));
        poles.forEach(b => b.addEventListener('click', () => { sl.value = b.dataset.end; side = null; land(true, true); }));
        sl.addEventListener('input', () => land(false, true)); sl.addEventListener('change', () => land(true, true));
        sl.addEventListener('keydown', (e) => { const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]; if (!d) return; e.preventDefault(); sl.value = Math.max(0, Math.min(100, Number(sl.value) + d * (P.mid === false ? 100 : 50))); land(true, true); });
        pick(0);
    }
    // the example opens right under the word you tap, with the word marked in the sentence, so what you hear is
    // what you see; 🔊 buttons replay the word or the sentence
    const markWord = (sentence, fr) => {
        const forms = String(fr).split(/\s*(?:\/|…)\s*/).map(f => f.replace(/[\s?!.…]+$/, '')).flatMap(f => f.endsWith('que') ? [f, f.replace(/que$/, 'qu')] : f.endsWith(' de') ? [f, f.replace(/de$/, 'du'), f.replace(/de$/, 'des'), f.replace(/de$/, 'd')] : f.endsWith(' à') ? [f, f.replace(/à$/, 'au'), f.replace(/à$/, 'aux')] : [f]).filter(Boolean).sort((a, b) => b.length - a.length);
        const e = esc(sentence);
        for (const f of forms) {
            const re = new RegExp('(^|[^\\p{L}])(' + esc(f).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "(?:'|&#39;)") + ')(?=[^\\p{L}]|$)', 'iu');
            if (re.test(e)) return e.replace(re, '$1<mark>$2</mark>');
        }
        return e;
    };
    function openDetail(chip, w, color, en) {
        const host = chip.parentElement;
        host.querySelectorAll('.st-det').forEach(d => d.remove());
        host.querySelectorAll('.st-chip.open').forEach(c => c.classList.remove('open'));
        if (chip.dataset.open === '1') { chip.dataset.open = ''; chip.setAttribute('aria-expanded', 'false'); return; }   // tap again: close
        host.querySelectorAll('.st-chip').forEach(c => { c.dataset.open = ''; c.setAttribute('aria-expanded', 'false'); });
        chip.dataset.open = '1'; chip.classList.add('open'); chip.setAttribute('aria-expanded', 'true');
        const d = document.createElement('div'); d.className = 'st-det';
        d.innerHTML = `<div><span class="w" style="color:${color}">${esc(w.fr)}</span> <span class="en">${esc(en)}</span></div>`
            + (w.ex ? `<div class="ex" data-say="${esc(w.ex[0])}">${markWord(w.ex[0], w.fr)}<div>${esc(w.ex[1])}</div></div>` : '')
            + (w.note ? `<div class="st-note">${esc(w.note)}</div>` : '')
            + `<div class="st-row"><button type="button" class="st-btn" data-sw>🔊 ${esc(w.fr)}</button>${w.ex ? '<button type="button" class="st-btn" data-ss>🔊 Sentence</button>' : ''}</div>`;
        chip.insertAdjacentElement('afterend', d);
        d.querySelector('[data-sw]').addEventListener('click', () => speak(w.fr));
        d.querySelector('[data-ss]')?.addEventListener('click', () => speak(w.ex[0]));
        d.querySelector('.ex')?.addEventListener('click', () => speak(w.ex[0]));
        speak(w.ex ? w.fr.replace(/[\s?!.…]+$/, '') + '. ' + w.ex[0] : w.fr);
        const r = d.getBoundingClientRect(); if (r.bottom > innerHeight) d.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    function exploreGroups(t) {
        body.innerHTML = `<p class="st-hint">${esc(t.hint)}</p><div class="st-groups">${t.groups.map((g, gi) => `<div class="st-group" style="background:${g.color}"><h4>${esc(g.name)}</h4><small>${esc(g.en)}${g.q ? ` · <b>${esc(g.q)}</b>` : ''}</small>${g.rule ? `<div class="st-rule">${esc(g.rule)}</div>` : ''}${g.words.map((w, wi) => `<button type="button" class="st-chip" data-g="${gi}" data-w="${wi}" aria-expanded="false">${esc(w.fr)}</button>`).join('')}</div>`).join('')}</div>`;
        body.querySelectorAll('.st-group .st-chip').forEach(c => c.addEventListener('click', () => {
            const g = t.groups[Number(c.dataset.g)], w = g.words[Number(c.dataset.w)];
            body.querySelectorAll('.st-group .st-det').forEach(d => { if (d.parentElement !== c.parentElement) d.remove(); });
            body.querySelectorAll('.st-group .st-chip').forEach(x => { if (x.parentElement !== c.parentElement) { x.dataset.open = ''; x.classList.remove('open'); } });
            openDetail(c, w, g.color, `${w.en} · ${g.name}`);
        }));
    }
    function exploreRegister(t) {
        body.innerHTML = `<p class="st-hint">${esc(t.hint)}</p><div class="st-chips" id="st-sets"></div><div id="st-sl"></div><div class="st-out"></div>`;
        const out = body.querySelector('.st-out'), host = body.querySelector('#st-sl');
        const colors = ['#d97706', '#059669', '#4f46e5'];
        const pick = (i, auto) => {
            const S = t.sets[i];
            body.querySelectorAll('#st-sets .st-chip').forEach((c, j) => c.setAttribute('aria-pressed', j === i));
            const avail = S.w.map((w, k) => w ? { k, p: k * 50, lab: t.levels[k] } : null).filter(Boolean);
            const keyLevel = S.w.findIndex(w => w && plain(w[0]).includes(plain(S.key.split(' / ')[0])));
            const startI = Math.max(0, avail.findIndex(a => a.k === keyLevel));
            const s = slider(avail, '#4f46e5', (j, a) => {
                const k = avail[j].k, w = S.w[k], all = w[0] + '. ' + w[1];
                out.innerHTML = box(w[0], `${t.levels[k]} (${LEVEL_EN[t.levels[k]]}) · ${S.en}`, [w[1], w[2]], k === keyLevel ? S.note : null, colors[k]); wire(out, all); if (a) later(all);
            }, startI);
            host.innerHTML = ''; host.append(s.tr, s.chips); s.go(true, auto);
        };
        body.querySelector('#st-sets').innerHTML = t.sets.map((S, i) => `<button type="button" class="st-chip" data-i="${i}">${esc(S.key)}</button>`).join('');
        body.querySelectorAll('#st-sets .st-chip').forEach(c => c.addEventListener('click', () => pick(Number(c.dataset.i), true)));
        pick(0, false);
    }

    function exploreCards(t) {
        body.innerHTML = `<p class="st-hint">${esc(t.hint)}</p><div class="st-chips" id="st-cards">${t.items.map((x, i) => `<button type="button" class="st-chip" data-i="${i}">${esc(x.fr)}</button>`).join('')}</div><div class="st-out"></div>`;
        const out = body.querySelector('.st-out');
        const pick = (i, auto) => {
            const x = t.items[i], all = x.fr + '. ' + x.ex[0];
            body.querySelectorAll('#st-cards .st-chip').forEach((c, j) => c.setAttribute('aria-pressed', j === i));
            out.innerHTML = `<span class="st-big" style="color:#4f46e5">${esc(x.fr)}</span>`
                + (x.trap ? `<div class="st-trap"><span>${esc(t.label1)}</span> <s>${esc(x.trap)}</s></div>` : '')
                + `<div class="st-means"><span>${esc(t.label2)}</span> <b>${esc(x.means)}</b></div>`
                + `<div class="st-ex" data-say="${esc(x.ex[0])}">${esc(x.ex[0])}<div>${esc(x.ex[1])}</div></div>` + (x.note ? `<div class="st-note">${esc(x.note)}</div>` : '');
            wire(out, all); if (auto) speak(all);
        };
        body.querySelectorAll('#st-cards .st-chip').forEach(c => c.addEventListener('click', () => pick(Number(c.dataset.i), true)));
        pick(0, false);
    }

    // ---- Relier: the roles of the small words, then join two halves of a sentence ----
    function exploreJoiner(t) {
        const all = t.roles.flatMap(r => r.words.map(w => ({ r, w })));
        const roleOf = (fr) => all.find(x => x.w.fr === fr);
        let order = shuffle(t.items), k = 0;
        body.innerHTML = `<p class="st-hint">${esc(t.hint)}</p><div class="st-roles">${t.roles.map((r, ri) => `<div class="st-role${r.words.length >= 10 ? ' wide' : ''}" style="background:${r.color}"><h4>${r.icon || ''} ${esc(r.name)}</h4><small>${esc(r.en)}</small>${r.words.map((w, wi) => `<button type="button" class="st-chip" data-r="${ri}" data-w="${wi}">${esc(w.fr)}</button>`).join('')}</div>`).join('')}</div>
            <div class="st-join"><div class="st-small" style="font-weight:800;color:#334155">Join the two halves</div><div class="st-sent" id="st-sent"></div>
            <div class="st-chips" id="st-pick"></div>
            <p class="st-fb" id="st-jfb"></p><div class="st-row"><button type="button" class="st-btn" id="st-jnext">Another sentence →</button></div></div>
            ${t.say ? `<div class="st-say"><div class="st-small" style="font-weight:800;color:#334155">Say it in French</div><div class="en" id="st-say-en"></div><div class="st-small" id="st-say-use"></div>
            <div class="fr" id="st-say-fr" hidden></div><div class="st-row"><button type="button" class="st-btn pri" id="st-say-show">Show the French</button><button type="button" class="st-btn" id="st-say-next">Another sentence →</button></div></div>` : ''}`;
        body.querySelectorAll('.st-role .st-chip').forEach(c => c.addEventListener('click', () => {
            const r = t.roles[Number(c.dataset.r)], w = r.words[Number(c.dataset.w)];
            body.querySelectorAll('.st-role .st-det').forEach(d => { if (d.parentElement !== c.parentElement) d.remove(); });
            body.querySelectorAll('.st-role .st-chip').forEach(x => { if (x.parentElement !== c.parentElement) { x.dataset.open = ''; x.classList.remove('open'); } });
            openDetail(c, w, r.color, `${w.en} · ${r.name}`);
        }));
        // a capital after a full stop or at the start; no space before a comma; que + vowel = qu'
        const capAt = (it) => !it.a || /[.!?]$/.test(it.a);
        const fillOf = (it, w) => { let f = elide(w, it.b); return capAt(it) ? f.charAt(0).toUpperCase() + f.slice(1) : f; };
        const glue = (f, b) => /'$/.test(f) || /^,/.test(b) ? '' : ' ';
        const sentence = (it, fill, cls, col) => {
            const f = fill ? fillOf(it, fill) : '';
            const gap = `<span class="st-gap ${cls || ''}" style="${col ? 'background:' + col + ';border-color:' + col : ''}">${f ? esc(f) : '?'}</span>`;
            return (it.a ? esc(it.a) + ' ' : '') + gap + (f ? glue(f, it.b) : /^,/.test(it.b) ? '' : ' ') + esc(it.b);
        };
        const full = (it, w) => { const f = fillOf(it, w); return (it.a ? it.a + ' ' : '') + f + glue(f, it.b) + it.b; };
        // the choices: the right words and a few from other groups
        const choicesFor = (it) => {
            const roles = new Set(all.filter(x => it.w.includes(x.w.fr)).map(x => x.r));
            const others = [...new Set(shuffle(all.filter(x => !roles.has(x.r) && !it.w.includes(x.w.fr))).map(x => x.w.fr))].slice(0, Math.max(3, 6 - it.w.length));
            return shuffle([...it.w, ...others]);
        };
        const showItem = () => {
            const it = order[k % order.length];
            body.querySelector('#st-sent').innerHTML = sentence(it);
            body.querySelector('#st-jfb').textContent = '';
            const pickBox = body.querySelector('#st-pick');
            pickBox.innerHTML = choicesFor(it).map(fr => `<button type="button" class="st-chip" data-fr="${esc(fr)}">${esc(fr)}</button>`).join('');
            pickBox.querySelectorAll('.st-chip').forEach(c => c.addEventListener('click', () => choose(c)));
        };
        const choose = (c) => {
            const it = order[k % order.length], w = c.dataset.fr, fb = body.querySelector('#st-jfb'), x = roleOf(w);
            if (it.w.includes(w)) {
                body.querySelector('#st-sent').innerHTML = sentence(it, w, 'ok', x.r.color) + `<div class="st-small" style="font-weight:400">${esc(it.en)}</div>`;
                fb.className = 'st-fb ok';
                const also = it.w.filter(o => o !== w);
                fb.textContent = `${x.r.icon || ''} ${w} = ${x.w.en} (${x.r.name.toLowerCase()})` + (also.length ? ` · ${also.map(o => '« ' + o + ' »').join(', ')} ${also.length > 1 ? 'work' : 'works'} too.` : '');
                speak(full(it, w));
                body.querySelectorAll('#st-pick .st-chip').forEach(b => { b.disabled = true; });
            } else {
                c.disabled = true; fb.className = 'st-fb no';
                fb.textContent = `Not « ${w} »: it means ${x.w.en} (${x.r.name.toLowerCase()}). What links these two ideas?`;
            }
        };
        body.querySelector('#st-jnext').addEventListener('click', () => { k++; showItem(); });
        showItem();
        if (t.say) {
            const S = shuffle(t.say); let si = 0;
            const show = () => {
                const [en, fr, use] = S[si % S.length];
                body.querySelector('#st-say-en').textContent = en;
                body.querySelector('#st-say-use').textContent = `Use « ${use} ». Say it out loud, then check.`;
                const out = body.querySelector('#st-say-fr'); out.hidden = true; out.innerHTML = markWord(fr, use);
                body.querySelector('#st-say-show').textContent = 'Show the French';
            };
            body.querySelector('#st-say-show').addEventListener('click', (e) => {
                const out = body.querySelector('#st-say-fr'), fr = S[si % S.length][1];
                out.hidden = false; e.target.textContent = '🔊 Hear it again'; speak(fr);
            });
            body.querySelector('#st-say-next').addEventListener('click', () => { si++; show(); });
            show();
        }
    }
    // ---- Dans l'ordre: a numbered timeline that tells a story step by step ----
    function exploreSequence(t) {
        let si = 0, at = -1, play = null;
        const stop = () => { clearTimeout(play); play = null; const b = body.querySelector('#st-play'); if (b) b.textContent = '▶ Play the story'; };
        body.innerHTML = `<p class="st-hint">${esc(t.hint)}</p><div class="st-chips" id="st-stories">${t.stories.map((S, i) => `<button type="button" class="st-chip" data-s="${i}">${esc(S.title)}</button>`).join('')}</div>
            <div class="st-seq"><div class="st-seq-line"><div class="st-seq-fill" style="width:0%"></div></div>${t.steps.map((st, i) => `<button type="button" class="st-node" data-i="${i}"><span class="num">${i + 1}</span><span class="n"></span><span class="k">${esc(st.fr)}</span><span class="e">${esc(st.en)}</span></button>`).join('')}</div>
            <div class="st-mid">⟵ ensuite · puis · après: the middle steps, in any order ⟶</div>
            <div class="st-row"><button type="button" class="st-btn pri" id="st-play">▶ Play the story</button><button type="button" class="st-btn" id="st-reset">Start again</button></div>
            <div class="st-out st-story" id="st-story"></div>${t.note ? `<div class="st-note">${esc(t.note)}</div>` : ''}
            ${t.more ? `<div class="st-small" style="font-weight:800;color:#334155;margin-top:12px">In a list or an essay</div><div class="st-chips" id="st-more">${t.more.map((w, i) => `<button type="button" class="st-chip" data-m="${i}" aria-expanded="false">${esc(w.fr)}</button>`).join('')}</div>` : ''}`;
        body.querySelectorAll('#st-more .st-chip').forEach(c => c.addEventListener('click', () => { const w = t.more[Number(c.dataset.m)]; openDetail(c, w, '#4f46e5', w.en); }));
        const draw = () => {
            const S = t.stories[si];
            body.querySelectorAll('#st-stories .st-chip').forEach((c, i) => c.setAttribute('aria-pressed', i === si));
            body.querySelectorAll('.st-node').forEach((n, i) => {
                n.classList.toggle('on', i === at); n.classList.toggle('done', i < at);
                n.querySelector('.n').innerHTML = `<img src="media/pictures/${S.lines[i][0]}.webp" alt="">`;
            });
            body.querySelector('.st-seq-fill').style.width = (at < 0 ? 0 : at / (t.steps.length - 1) * 100) + '%';
            body.querySelector('#st-story').innerHTML = S.lines.map((L, i) => {
                const w = t.steps[i].fr, txt = esc(L[1]).replace(new RegExp('^(' + w.replace(/'/g, '(?:\'|&#39;)') + ')', 'i'), '<b>$1</b>');
                return `<div class="st-line ${i <= at ? 'shown' : ''}" data-i="${i}"><img src="media/pictures/${L[0]}.webp" alt=""><div>${txt}<small>${esc(L[2])}</small></div></div>`;
            }).join('');
            body.querySelectorAll('.st-line').forEach(l => l.addEventListener('click', () => { stop(); go(Number(l.dataset.i)); }));
        };
        const go = (i) => { at = i; draw(); speak(t.stories[si].lines[i][1]); };
        body.querySelectorAll('.st-node').forEach(n => n.addEventListener('click', () => { stop(); go(Number(n.dataset.i)); }));
        body.querySelectorAll('#st-stories .st-chip').forEach(c => c.addEventListener('click', () => { stop(); si = Number(c.dataset.s); at = -1; draw(); }));
        body.querySelector('#st-reset').addEventListener('click', () => { stop(); at = -1; draw(); });
        body.querySelector('#st-play').addEventListener('click', (e) => {
            if (play) return stop();
            e.target.textContent = '⏸ Pause';
            const step = () => { if (!root.isConnected || !body.querySelector('.st-seq')) return stop(); if (at >= t.steps.length - 1) { stop(); return; } go(at + 1); play = setTimeout(step, 2800); };
            if (at >= t.steps.length - 1) at = -1;
            play = 0; step();
        });
        draw();
    }

    // ================= Connectors (Topic 3): learn them by what they do =================
    // Data: window.CONNECTORS (js/connectors-data.js, made by tools/connectors/connectors.py)
    const C = window.CONNECTORS || { roles: [], items: [], say: [], texts: [], follows: {}, bins: [], rules: [], tags: {} };
    const roleBy = (name) => C.roles.find(r => r.name === name);
    const wordBy = (fr) => { for (const r of C.roles) { const w = r.words.find(x => x.fr === fr); if (w) return { r, w }; } return null; };
    const TAG_COL = { s: '#94a3b8', e: '#059669', w: '#2563eb', f: '#7c3aed' };
    // the sentence of a join item, with the gap (or the word in it)
    const joinHtml = (it, fill, col) => {
        if (!fill) return (it.a ? esc(it.a) + ' ' : '') + '<span class="st-gap">?</span>' + (/^,/.test(it.b) ? '' : ' ') + esc(it.b);
        const all = joinSay(it, fill), f = all.slice(it.a ? it.a.length + 1 : 0, all.length - it.b.length).trim();
        return (it.a ? esc(it.a) + ' ' : '') + `<span class="st-gap ok" style="background:${col};border-color:${col}">${esc(f)}</span>` + (/'$/.test(f) || /^,/.test(it.b) ? '' : ' ') + esc(it.b);
    };
    const gapText = (it) => (it.a ? it.a + ' ___' : '___') + (/^,/.test(it.b) ? '' : ' ') + it.b;

    // ---- Le lien: what is the link between the two ideas? Then which word says it? ----
    function exploreLink(t) {
        const order = shuffle(C.items); let k = 0;
        const show = () => {
            const it = order[k % order.length], R = roleBy(it.role);
            body.innerHTML = `<p class="st-hint">${esc(t.hint)}</p>
                <div class="cl-sent" id="cl-sent">${joinHtml(it)}</div>
                <div class="cl-step">1 · What is the link between the two ideas?</div>
                <div class="cl-links">${C.roles.map(r => `<button type="button" class="cl-link" data-r="${esc(r.name)}" style="--c:${r.color}"><span>${window.ConnectorLessons ? ConnectorLessons.badge(r.name) : r.icon}</span><b>${esc(r.name)}</b><small>${esc(r.en)}</small></button>`).join('')}</div>
                <p class="st-fb" id="cl-fb1"></p><div id="cl-two"></div>`;
            let done1 = false;
            body.querySelectorAll('.cl-link').forEach(b => b.addEventListener('click', () => {
                if (done1) return;
                const ok = b.dataset.r === it.role, fb = body.querySelector('#cl-fb1');
                if (!ok) { b.classList.add('no'); b.disabled = true; fb.className = 'st-fb no'; fb.textContent = `Not « ${b.dataset.r} ». Read the two ideas again: what does the second one do?`; return; }
                done1 = true; b.classList.add('ok');
                body.querySelectorAll('.cl-link').forEach(x => { if (x !== b) x.disabled = true; });
                fb.className = 'st-fb ok'; fb.textContent = `${R.icon} ${R.name}: ${R.link}.`;
                stepTwo(it, R);
            }));
        };
        const stepTwo = (it, R) => {
            const conf = roleBy(R.confuse), right = it.w.slice(0, 3);
            const near = shuffle(conf.ladders.flat().map(x => x.fr).filter(f => !it.w.includes(f))).slice(0, 2);
            const other = shuffle(C.roles.filter(r => r !== R && r !== conf).flatMap(r => r.ladders.flat().map(x => x.fr))).slice(0, 1);
            const opts = shuffle([...right, ...near, ...other]);
            const two = body.querySelector('#cl-two');
            two.innerHTML = `<div class="cl-step">2 · Which word says it?</div><div class="st-chips">${opts.map(f => `<button type="button" class="st-chip" data-fr="${esc(f)}">${esc(f)}</button>`).join('')}</div><p class="st-fb" id="cl-fb2"></p>`;
            two.querySelectorAll('.st-chip').forEach(c => c.addEventListener('click', () => {
                const f = c.dataset.fr, fb = two.querySelector('#cl-fb2');
                if (!it.w.includes(f)) {
                    c.disabled = true; c.classList.add('no'); const x = wordBy(f);
                    fb.className = 'st-fb no'; fb.textContent = x ? `Not « ${f} »: it means ${x.w.en} (${x.r.name.toLowerCase()}).` : `Not « ${f} ».`; return;
                }
                two.querySelectorAll('.st-chip').forEach(b => { b.disabled = true; });
                c.classList.add('ok');
                body.querySelector('#cl-sent').innerHTML = joinHtml(it, f, R.color) + `<div class="st-small" style="font-weight:400">${esc(it.en)}</div>`;
                const also = it.w.filter(o => o !== f);
                fb.className = 'st-fb ok'; fb.textContent = `${f} = ${(wordBy(f) || { w: { en: '' } }).w.en}` + (also.length ? ` · ${also.map(o => '« ' + o + ' »').join(', ')} ${also.length > 1 ? 'work' : 'works'} too.` : '');
                two.insertAdjacentHTML('beforeend', '<div class="st-row"><button type="button" class="st-btn pri" id="cl-next">Next sentence →</button></div>');
                two.querySelector('#cl-next').addEventListener('click', () => { k++; show(); });
                speak(joinSay(it, f));
            }));
        };
        show();
    }

    // ---- L'échelle: words that mean the same, from spoken to formal; the rest under « more » ----
    function exploreLadder(t) {
        body.innerHTML = `<p class="st-hint">${esc(t.hint)}</p>
            <div class="cl-legend">${Object.entries(C.tags).map(([k, v]) => `<span style="--c:${TAG_COL[k]}">${esc(v)}</span>`).join('')}</div>
            <div class="cl-roles">${C.roles.map((r, ri) => {
                const inL = new Set(r.ladders.flat().map(x => x.fr));
                const rest = r.words.filter(w => !inL.has(w.fr));
                return `<div class="cl-role" style="--c:${r.color}"><h4>${r.icon} ${esc(r.name)} <small>${esc(r.en)}</small></h4>
                    ${r.ladders.map(L => `<div class="cl-lad">${L.map((x, i) => `${i ? '<span class="cl-arr" aria-hidden="true">→</span>' : ''}<button type="button" class="st-chip cl-rung" data-r="${ri}" data-fr="${esc(x.fr)}" style="--t:${TAG_COL[x.tag]}" aria-expanded="false">${esc(x.fr)}<small>${esc(C.tags[x.tag])}</small></button>`).join('')}</div>`).join('')}
                    ${rest.length ? `<button type="button" class="cl-more" data-more="${ri}">+ ${rest.length} more</button><div class="cl-lad cl-rest" hidden>${rest.map(w => `<button type="button" class="st-chip" data-r="${ri}" data-fr="${esc(w.fr)}" aria-expanded="false">${esc(w.fr)}</button>`).join('')}</div>` : ''}
                </div>`;
            }).join('')}</div>`;
        body.querySelectorAll('.cl-role .st-chip').forEach(c => c.addEventListener('click', () => {
            const r = C.roles[Number(c.dataset.r)], w = r.words.find(x => x.fr === c.dataset.fr), was = c.dataset.open === '1';
            // one example open at a time, under the whole line (so the line stays in one piece)
            body.querySelectorAll('.cl-roles .st-det').forEach(d => d.remove());
            body.querySelectorAll('.cl-role .st-chip').forEach(x => { if (x !== c) { x.dataset.open = ''; x.classList.remove('open'); x.setAttribute('aria-expanded', 'false'); } });
            openDetail(c, w, r.color, `${w.en} · ${r.name}`);
            if (!was) { const d = c.parentElement.querySelector('.st-det'); if (d) c.parentElement.after(d); }
        }));
        body.querySelectorAll('.cl-more').forEach(b => b.addEventListener('click', () => {
            const box = b.nextElementSibling; box.hidden = !box.hidden;
            const n = box.querySelectorAll('.st-chip').length; b.textContent = box.hidden ? `+ ${n} more` : '− fewer';
        }));
    }

    // ---- Ce qui suit: which grammar comes after the connector? Sort them into four boxes ----
    const binOf = (fr) => Object.keys(C.follows).find(k => C.follows[k].includes(fr));
    function exploreFollows(t) {
        let deck, i, score;
        const start = () => { deck = shuffle(Object.values(C.follows).flat()).slice(0, 12); i = 0; score = 0; draw(); };
        const draw = () => {
            if (i >= deck.length) {
                body.querySelector('#cl-now').innerHTML = `<div class="st-q">${score} / ${deck.length} right first time</div><div class="st-row"><button type="button" class="st-btn pri" id="cl-again">Sort 12 more</button></div>`;
                body.querySelector('#cl-again').addEventListener('click', start); return;
            }
            const f = deck[i], x = wordBy(f); let tries = 0;
            body.querySelector('#cl-now').innerHTML = `<div class="st-small">${i + 1} / ${deck.length}</div><button type="button" class="cl-word" id="cl-word">${esc(f)}</button><div class="st-small">${esc(x ? x.w.en : '')} · which box?</div><div id="cl-after"></div>`;
            body.querySelector('#cl-word').addEventListener('click', () => speak(f));
            body.querySelectorAll('.cl-bin').forEach(b => { b.disabled = false; b.classList.remove('no'); b.onclick = () => {
                const right = binOf(f), ok = b.dataset.b === right, B = C.bins.find(z => z.id === right);
                if (!ok) { tries++; b.disabled = true; b.classList.add('no'); body.querySelector('#cl-after').innerHTML = `<p class="st-fb no">Not that box. Try again.</p>`; return; }
                if (!tries) score++;
                body.querySelectorAll('.cl-bin').forEach(z => { z.disabled = true; });
                b.querySelector('.cl-got').insertAdjacentHTML('beforeend', `<span>${esc(f)}</span>`);
                body.querySelector('#cl-after').innerHTML = `<p class="st-fb ok">${tries ? 'Yes.' : 'Right first time!'} ${esc(f)} ${esc(B.name)}</p>`
                    + (x ? `<div class="st-ex" data-say="${esc(x.w.ex[0])}">${markWord(x.w.ex[0], f)}<div>${esc(x.w.ex[1])}</div></div>` : '')
                    + `<div class="st-row"><button type="button" class="st-btn pri" id="cl-nx">Next →</button></div>`;
                body.querySelector('#cl-after .st-ex')?.addEventListener('click', () => speak(x.w.ex[0]));
                body.querySelector('#cl-nx').addEventListener('click', () => { i++; draw(); });
                if (x) speak(x.w.ex[0]);
            }; });
        };
        body.innerHTML = `<p class="st-hint">${esc(t.hint)}</p>
            <ul class="cl-rules">${C.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
            <div class="cl-now" id="cl-now"></div>
            <div class="cl-bins">${C.bins.map(b => `<button type="button" class="cl-bin" data-b="${b.id}" style="--c:${b.color}"><b>${esc(b.name)}</b><small>${esc(b.ex)}</small><span class="cl-got"></span></button>`).join('')}</div>`;
        start();
    }

    // ---- Le texte: connectors carry a whole text; then say sentences in French ----
    function exploreText(t) {
        let ti = 0;
        body.innerHTML = `<p class="st-hint">${esc(t.hint)}</p>
            <div class="st-chips" id="cl-texts">${C.texts.map((x, i) => `<button type="button" class="st-chip" data-x="${i}">${esc(x.title)} · ${esc(x.level)}</button>`).join('')}</div>
            <div class="cl-text" id="cl-text"></div><div class="st-chips" id="cl-opts"></div><p class="st-fb" id="cl-tfb"></p><div id="cl-tend"></div>
            ${C.say.length ? `<div class="st-say"><div class="st-small" style="font-weight:800;color:#334155">Say it in French</div><div class="en" id="st-say-en"></div><div class="st-small" id="st-say-use"></div>
            <div class="fr" id="st-say-fr" hidden></div><div class="st-row"><button type="button" class="st-btn pri" id="st-say-show">Show the French</button><button type="button" class="st-btn" id="st-say-next">Another sentence →</button></div></div>` : ''}`;
        const run = () => {
            const X = C.texts[ti], gaps = X.parts.filter(p => typeof p !== 'string'), got = [];
            body.querySelectorAll('#cl-texts .st-chip').forEach((c, i) => c.setAttribute('aria-pressed', i === ti));
            body.querySelector('#cl-tend').innerHTML = ''; body.querySelector('#cl-tfb').textContent = '';
            const plainText = () => { let g = 0; return X.parts.map(p => typeof p === 'string' ? p : (got[g++] || p.ok[0])).join(''); };
            const draw = () => {
                let g = 0;
                body.querySelector('#cl-text').innerHTML = `<div class="st-small">${esc(X.kind)}</div>` + X.parts.map(p => {
                    if (typeof p === 'string') return esc(p);
                    const n = g++;
                    return n < got.length ? `<span class="cl-fill">${esc(got[n])}</span>` : `<span class="cl-hole${n === got.length ? ' now' : ''}">${n + 1}</span>${p.ok[0].endsWith("'") ? ' ' : ''}`;
                }).join('');
                const opts = body.querySelector('#cl-opts');
                if (got.length >= gaps.length) {
                    opts.innerHTML = '';
                    body.querySelector('#cl-tend').innerHTML = `<div class="st-row"><button type="button" class="st-btn pri" id="cl-listen">🔊 Listen to the whole text</button><button type="button" class="st-btn" id="cl-en">Show the English</button>${ti < C.texts.length - 1 ? '<button type="button" class="st-btn" id="cl-nexttext">Next text →</button>' : ''}</div><p class="st-small" id="cl-entext" hidden>${esc(X.en)}</p>`;
                    body.querySelector('#cl-listen').addEventListener('click', () => speak(plainText()));
                    body.querySelector('#cl-en').addEventListener('click', () => { const e = body.querySelector('#cl-entext'); e.hidden = !e.hidden; });
                    body.querySelector('#cl-nexttext')?.addEventListener('click', () => { ti++; run(); });
                    return;
                }
                const G = gaps[got.length];
                opts.innerHTML = shuffle([G.ok[0], ...G.no]).map(o => `<button type="button" class="st-chip" data-o="${esc(o)}">${esc(o)}</button>`).join('');
                opts.querySelectorAll('.st-chip').forEach(c => c.addEventListener('click', () => {
                    const o = c.dataset.o, fb = body.querySelector('#cl-tfb');
                    if (!G.ok.includes(o)) {
                        c.disabled = true; c.classList.add('no'); const x = wordBy(o.toLowerCase().replace(/qu'$/, 'que')) || wordBy(o.toLowerCase());
                        fb.className = 'st-fb no'; fb.textContent = `Not « ${o.replace(/'$/, 'e')} »` + (x ? `: it means ${x.w.en}.` : '.') + ' What is the link here?'; return;
                    }
                    got.push(o); fb.className = 'st-fb ok';
                    fb.textContent = `✓ ${o.replace(/qu'$/, 'que')}` + (G.ok.length > 1 ? ` (${G.ok.filter(z => z !== o).map(z => '« ' + z + ' »').join(', ')} works too)` : '');
                    speak(o.replace(/qu'$/, 'que')); draw();
                }));
            };
            draw();
        };
        body.querySelectorAll('#cl-texts .st-chip').forEach(c => c.addEventListener('click', () => { ti = Number(c.dataset.x); run(); }));
        run();
        if (C.say.length) {
            const S = shuffle(C.say); let si = 0;
            const show = () => {
                const [en, fr, use] = S[si % S.length];
                body.querySelector('#st-say-en').textContent = en;
                body.querySelector('#st-say-use').textContent = `Use « ${use} ». Say it out loud, then check.`;
                const out = body.querySelector('#st-say-fr'); out.hidden = true; out.innerHTML = markWord(fr, use);
                body.querySelector('#st-say-show').textContent = 'Show the French';
            };
            body.querySelector('#st-say-show').addEventListener('click', (e) => { body.querySelector('#st-say-fr').hidden = false; e.target.textContent = '🔊 Hear it again'; speak(S[si % S.length][1]); });
            body.querySelector('#st-say-next').addEventListener('click', () => { si++; show(); });
            show();
        }
    }

    // ---------------- Check yourself ----------------
    // que + vowel = qu' (parce qu'il), si + il(s) = s'il
    const elide = (w, b) => /que$/.test(w) && /^[aeiouhéèêà]/i.test(b) ? w.replace(/que$/, 'qu\'') : w === 'si' && /^ils?\b/.test(b) ? 's\'' : w;
    // a join item read as one sentence (capital after a full stop, qu' before a vowel, no space before a comma)
    const joinSay = (it, w) => {
        let f = elide(w, it.b);
        if (!it.a || /[.!?]$/.test(it.a)) f = f.charAt(0).toUpperCase() + f.slice(1);
        return (it.a ? it.a + ' ' : '') + f + (/'$/.test(f) || /^,/.test(it.b) ? '' : ' ') + it.b;
    };
    function questions(t) {
        const CL = window.ConnectorLessons;
        if (CL && CL.types.includes(t.type)) return CL.questions(t.type, { speak, joinSay, markWord });
        const Q = [];
        if (t.type === 'scale') {
            const st = t.stops.filter((s, i, a) => a.findIndex(x => x.fr === s.fr) === i);
            for (let n = 0; n < 10; n++) {
                const [x, y] = shuffle(st).slice(0, 2); if (x.p === y.p) continue;
                const hi = x.p > y.p ? x : y;
                Q.push({ q: t.ask, opts: shuffle([x.fr, y.fr]), a: hi.fr, key: hi.key, why: `${hi.fr} (${hi.en}) is further towards « ${t.right} ».`, say: hi.fr });
            }
        } else if (t.type === 'pairs') {
            for (const P of shuffle(t.pairs).slice(0, 10)) {
                const flip = t.oneWay ? false : Math.random() < 0.4, from = flip ? P.b : P.a, to = flip ? P.a : P.b;
                // wrong answers: words from other pairs that share no word with this one (chaud / froid and chaud / frais)
                const words = new Set([P.a[0], P.b[0]]);
                const others = [...new Set(shuffle(t.pairs.filter(x => x !== P && !words.has(x.a[0]) && !words.has(x.b[0]))).map(x => (Math.random() < .5 ? x.a : x.b)[0]))].filter(o => o !== to[0]).slice(0, 3);
                Q.push({ q: (t.ask || 'Le contraire de « {w} » ?').replace('{w}', from[0]), opts: shuffle([to[0], ...others]), a: to[0], key: P.key, key2: P.extraB ? null : P.keyB, why: `${P.a[0]} (${P.a[1]}) ↔ ${P.b[0]} (${P.b[1]})`, say: `${from[0]}, ${to[0]}`.replace(/ · /g, ', ') });
            }
        } else if (t.type === 'groups') {
            const all = t.groups.flatMap(g => g.words.map(w => ({ g, w })));
            for (const { g, w } of shuffle(all).slice(0, 10))
                Q.push({ q: `${w.fr}: ${t.ask}`, opts: t.groups.map(x => x.name), a: g.name, key: w.key, why: `${w.fr} = ${w.en}. ${w.ex[0]}`, say: w.ex[0] });
        } else if (t.type === 'joiner') {
            const conn = t.roles.flatMap(r => r.words.map(w => ({ r, w })));
            for (const it of shuffle(t.items).slice(0, 10)) {
                const right = it.w[0], x = conn.find(c => c.w.fr === right);
                const roles = new Set(conn.filter(c => it.w.includes(c.w.fr)).map(c => c.r));
                const others = [...new Set(shuffle(conn.filter(c => !roles.has(c.r) && !it.w.includes(c.w.fr))).map(c => c.w.fr))].slice(0, 3);
                const gap2 = (it.a ? it.a + ' ___' : '___') + (/^,/.test(it.b) ? '' : ' ') + it.b;
                Q.push({ q: `« ${gap2} »`, opts: shuffle([right, ...others]), a: right, key: x.w.key, why: `${right} = ${x.w.en} (${x.r.name.toLowerCase()}). ${it.en}` + (it.w.length > 1 ? ` « ${it.w.slice(1).join(' », « ')} » ${it.w.length > 2 ? 'work' : 'works'} too.` : ''), say: joinSay(it, right) });
            }
        } else if (t.type === 'sequence') {
            const mid = t.steps.slice(1, -1).map(s => s.fr);
            for (const S of t.stories) S.lines.forEach((L, i) => {
                const st = t.steps[i], rest = L[1].slice(st.fr.length).replace(/^,?\s*/, '');
                const wrong = i === 0 || i === t.steps.length - 1
                    ? shuffle([t.steps[i === 0 ? t.steps.length - 1 : 0].fr, ...shuffle(mid).slice(0, 1), 'mais']).slice(0, 3)
                    : [t.steps[0].fr, t.steps[t.steps.length - 1].fr, shuffle(['mais', 'si', 'ou'])[0]];
                Q.push({ q: `${S.title}, step ${i + 1} of ${t.steps.length}: « ___ ${rest} »`, opts: shuffle([st.fr, ...wrong.filter(w => w !== st.fr)]), a: st.fr, key: st.key, why: `${st.fr} = ${st.en}. ${L[1]}` + (mid.includes(st.fr) ? ' (Ensuite, puis and après can swap.)' : ''), say: L[1] });
            });
        } else if (t.type === 'link') {
            for (const [n, it] of shuffle(C.items).slice(0, 10).entries()) {
                const R = roleBy(it.role), right = it.w[0], key = (wordBy(right) || { w: {} }).w.key;
                if (n % 2 === 0) {
                    const others = shuffle(C.roles.filter(r => r !== R)).slice(0, 3);
                    if (!others.some(r => r.name === R.confuse)) others[0] = roleBy(R.confuse);
                    Q.push({ q: `What is the link? « ${gapText(it)} »`, opts: shuffle([R, ...others]).map(r => `${r.icon} ${r.name}`), a: `${R.icon} ${R.name}`, key, why: `${R.name}: ${R.link}. ${joinSay(it, right)}`, say: joinSay(it, right) });
                } else {
                    const conf = roleBy(R.confuse);
                    const others = [...new Set(shuffle(conf.ladders.flat().map(x => x.fr).concat(shuffle(C.roles.filter(r => r !== R)).slice(0, 2).flatMap(r => r.ladders[0].map(x => x.fr)))))].filter(f => !it.w.includes(f)).slice(0, 3);
                    Q.push({ q: `« ${gapText(it)} »`, opts: shuffle([right, ...others]), a: right, key, why: `${right}: ${R.link}. ${it.en}` + (it.w.length > 1 ? ` « ${it.w.slice(1).join(' », « ')} » ${it.w.length > 2 ? 'work' : 'works'} too.` : ''), say: joinSay(it, right) });
                }
            }
        } else if (t.type === 'ladder') {
            const L = C.roles.flatMap(r => r.ladders.map(l => ({ r, l }))).filter(x => x.l.length > 1);
            for (let n = 0; n < 10; n++) {
                const { r, l } = shuffle(L)[0];
                if (n % 2 === 0) {
                    const [i, j] = shuffle([...l.keys()]).slice(0, 2).sort((a, b) => a - b), hi = l[j].fr;
                    if (l[i].tag === l[j].tag) { n--; continue; }
                    Q.push({ q: `Which one is more formal? (${r.name})`, opts: shuffle([l[i].fr, hi]), a: hi, key: wordBy(hi).w.key, why: `${l.map(x => `${x.fr} (${C.tags[x.tag].toLowerCase()})`).join(' → ')}`, say: hi });
                } else {
                    const top = l[l.length - 1].fr, low = l[0].fr;
                    const others = [...new Set(shuffle(L.filter(x => x.l !== l)).map(x => x.l[0].fr))].filter(f => f !== low).slice(0, 3);
                    Q.push({ q: `The everyday word for « ${top} »?`, opts: shuffle([low, ...others]), a: low, key: wordBy(low).w.key, why: `${l.map(x => `${x.fr} (${C.tags[x.tag].toLowerCase()})`).join(' → ')}`, say: `${top}, ${low}` });
                }
            }
        } else if (t.type === 'follows') {
            for (const f of shuffle(Object.values(C.follows).flat()).slice(0, 10)) {
                const B = C.bins.find(b => b.id === binOf(f)), x = wordBy(f);
                Q.push({ q: `« ${f} » + …?`, opts: C.bins.map(b => b.name), a: B.name, key: x && x.w.key, why: `${f} ${B.name}` + (x ? `: ${x.w.ex[0]}` : ''), say: x ? x.w.ex[0] : f });
            }
        } else if (t.type === 'text') {
            const all = C.texts.flatMap(X => { let g = 0; const gaps = X.parts.filter(p => typeof p !== 'string');
                return gaps.map((G, gi) => { g = 0; const full = X.parts.map(p => typeof p === 'string' ? p : (g++ === gi ? (p.ok[0].endsWith("'") ? '___ ' : '___') : p.ok[0])).join('');
                    const s = full.split(/(?<=[.!?])\s+/).find(z => z.includes('___')); return { G, s, X }; }); });
            for (const { G, s, X } of shuffle(all).slice(0, 10))
                Q.push({ q: `${X.title}: « ${s} »`, opts: shuffle([G.ok[0], ...G.no]), a: G.ok[0], key: G.key, why: s.replace(/___ ?/, G.ok[0].endsWith("'") ? G.ok[0] : G.ok[0] + (/___ /.test(s) ? ' ' : '')) + (G.ok.length > 1 ? ` (« ${G.ok.slice(1).join(' », « ')} » works too.)` : ''), say: s.replace(/___ ?/, G.ok[0].endsWith("'") ? G.ok[0] : G.ok[0] + (/___ /.test(s) ? ' ' : '')) });
        } else if (t.type === 'cards') {
            for (const x of shuffle(t.items).slice(0, 10)) {
                const others = [...new Set(shuffle(t.items.filter(y => y !== x)).map(y => y.means))].filter(m => m !== x.means && m !== x.trap).slice(0, x.trap ? 2 : 3);
                Q.push({ q: `« ${x.fr} » ${t.ask || 'means…'}`, opts: shuffle([x.means, ...(x.trap ? [x.trap] : []), ...others]), a: x.means, key: x.key, why: (x.trap ? `Not « ${x.trap} ». ` : '') + `${x.fr} = ${x.means}. ${x.ex[0]}`, say: x.ex[0] });
            }
        } else if (t.type === 'register') {
            const keyLevel = (S) => S.w.findIndex(w => w && plain(w[0]).includes(plain(S.key.split(' / ')[0])));
            for (const S of shuffle(t.sets).slice(0, 10)) {
                const k = keyLevel(S), target = k === 1 ? (S.w[0] ? 0 : 2) : 1;
                const right = S.w[target][0], others = [...new Set(shuffle(t.sets.filter(x => x !== S && x.w[target])).map(x => x.w[target][0]))].filter(o => o !== right).slice(0, 3);
                Q.push({ q: `Le mot ${t.levels[target]} pour « ${S.w[k][0]} » ?`, opts: shuffle([right, ...others]), a: right, key: S.key, why: `${t.levels[k]}: ${S.w[k][0]} → ${t.levels[target]}: ${right} (${S.en})`, say: `${S.w[k][0]}, ${right}` });
            }
        }
        return Q;
    }
    function check(t) {
        const Q = questions(t); let i = 0, score = 0;
        const ask = () => {
            if (i >= Q.length) {
                body.innerHTML = `<div class="st-q">${score} / ${Q.length} right first time</div><p class="st-small">The ones you missed come back in Practise and Test.</p><div class="st-row"><button type="button" class="st-btn pri" id="st-ag">Again</button></div>`;
                body.querySelector('#st-ag').addEventListener('click', () => check(t)); return;
            }
            const q = Q[i]; let tries = 0, done = false;
            body.innerHTML = `<p class="st-small">${i + 1} / ${Q.length}</p><div class="st-q">${esc(q.q)}</div><div class="st-opts">${q.opts.map((o, j) => `<button type="button" class="st-opt" data-j="${j}">${esc(o)}</button>`).join('')}</div><p class="st-fb" id="st-fb"></p><div id="st-after"></div>`;
            body.querySelectorAll('.st-opt').forEach(b => b.addEventListener('click', () => {
                if (done) return;
                const pick = q.opts[Number(b.dataset.j)], fb = body.querySelector('#st-fb');
                if (pick !== q.a) { if (!tries) { mark(q.key, false); if (q.key2) mark(q.key2, false); } tries++; b.classList.add('no'); b.disabled = true; fb.className = 'st-fb no'; fb.textContent = 'Not that one. Try again.'; return; }
                done = true; b.classList.add('ok');
                if (!tries) { score++; mark(q.key, true); if (q.key2) mark(q.key2, true); }
                fb.className = 'st-fb ok'; fb.textContent = tries ? 'Yes, that one.' : 'Right first time!';
                speak(q.say);
                body.querySelector('#st-after').innerHTML = `<div class="st-note">${esc(q.why)}</div><div class="st-row" style="margin-top:10px"><button type="button" class="st-btn pri" id="st-nx">Next →</button></div>`;
                body.querySelector('#st-nx').addEventListener('click', () => { i++; ask(); });
            }));
        };
        ask();
    }

    function show() {
        clearTimeout(timer);
        const t = T.tabs[tabI];
        root.querySelectorAll('.st-tab').forEach((b, i) => b.setAttribute('aria-selected', i === tabI));
        root.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === mode));
        if (mode === 'check') return check(t);
        const CL = window.ConnectorLessons;
        if (CL && CL.types.includes(t.type)) return CL.explore(t.type, body, { speak, joinSay, markWord });
        ({ scale: exploreScale, pairs: explorePairs, groups: exploreGroups, register: exploreRegister, cards: exploreCards, joiner: exploreJoiner, sequence: exploreSequence, link: exploreLink, ladder: exploreLadder, follows: exploreFollows, text: exploreText })[t.type](t);
    }
    root.querySelectorAll('.st-tab').forEach(b => b.addEventListener('click', () => { tabI = Number(b.dataset.t); show(); }));
    root.querySelectorAll('.st-grp').forEach(b => b.addEventListener('click', () => {
        const g = GROUPS[Number(b.dataset.g)];
        root.querySelectorAll('.st-grp').forEach(x => x.setAttribute('aria-pressed', x === b));
        root.querySelectorAll('.st-tab').forEach(t => { t.hidden = T.tabs[Number(t.dataset.t)].group !== g; });
        tabI = T.tabs.findIndex(t => t.group === g); show();
    }));
    root.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.m; show(); }));
    show();
}

window.VocabTools = window.VocabTools || {};
for (const [id, T] of Object.entries(window.SCALE_DATA || {}))
    window.VocabTools[id] = { name: T.name, next: T.next, mount: (el, opts) => mount(T, el, opts) };
})();
