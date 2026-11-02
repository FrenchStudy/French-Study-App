// scale-tool.js - slider tools in step 2 of Vocab topics whose words sit on a line rather than in a room:
// 3 Connectors (join two halves; a story timeline for d'abord… enfin), 12 Personality (opposites), 13 Emotions (how strong), 16 Opposites, 44 Ideas & Opinions (how sure),
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
.st-btn{font-weight:700;font-size:15px;border:1px solid #e2e8f0;background:#fff;color:#0f172a;border-radius:12px;padding:8px 14px;min-height:44px;cursor:pointer}
.st-btn.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.st-btn[aria-pressed="true"]{background:#eef2ff;border-color:#6366f1;color:#3730a3}
.st-tab[aria-selected="true"]{background:#4f46e5;border-color:#4f46e5;color:#fff}
.st-btn:focus-visible,.st-chip:focus-visible,.st-opt:focus-visible,.st-stop:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
.st-snd{margin-left:auto;display:flex;align-items:center;gap:8px;font-size:14px;color:#475569;cursor:pointer;min-height:44px}
.st-snd input{width:18px;height:18px;accent-color:#4f46e5}
.st-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px;display:grid;gap:10px}
.st-hint{font-size:14px;color:#64748b;margin:0}
.st-chips{display:flex;flex-wrap:wrap;gap:6px}
.st-chip{border:1px solid #e2e8f0;background:#f8fafc;border-radius:999px;padding:6px 12px;min-height:38px;font-size:14px;color:#334155;cursor:pointer}
.st-chip[aria-pressed="true"]{background:#eef2ff;border-color:#6366f1;color:#3730a3;font-weight:800}
.st-track{position:relative;margin:48px 12px 46px}
.st input[type=range]{width:100%;height:30px;margin:0;cursor:pointer}
.st-stop{position:absolute;transform:translateX(-50%);background:none;border:0;cursor:pointer;font-size:13px;color:#64748b;white-space:nowrap;padding:4px}
.st-stop.first{transform:none}.st-stop.last{transform:translateX(-100%)}
.st-stop.up{bottom:30px}.st-stop.down{top:30px}
.st-stop.on{font-weight:900}
.st-ends{display:flex;justify-content:space-between;gap:10px;font-size:13px;color:#64748b;margin:-36px 12px 6px}
.st-poles{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin:6px 4px 0}
.st-pole{font-size:1.25rem;font-weight:900;color:#94a3b8;transition:color .2s,transform .2s;cursor:pointer;background:none;border:0;padding:4px}
.st-pole.on{transform:scale(1.08)}
.st-mid{font-size:13px;color:#94a3b8}
.st-out{border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;background:#f8fafc;min-height:76px}
.st-big{font-size:1.4rem;font-weight:900;cursor:pointer}
.st-en{font-size:14px;color:#475569}
.st-ex{margin-top:8px;font-size:16px;color:#0f172a;cursor:pointer}.st-ex div{font-size:13px;color:#64748b}
.st-note{margin-top:8px;font-size:14px;line-height:1.5;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:8px 10px;color:#1e293b}
.st-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
.st-group{border-radius:14px;padding:10px;display:grid;gap:6px;align-content:start}
.st-group h4{margin:0;font-size:15px;font-weight:900;color:#fff}
.st-group small{color:#fff;opacity:.9;font-size:12px;margin-top:-4px}
.st-rule{background:rgba(255,255,255,.18);color:#fff;border-radius:8px;padding:6px 8px;font-size:13px;line-height:1.4}
.st-group .st-chip{background:#fff;border-color:transparent;text-align:left;border-radius:10px}
.st-q{font-size:1.25rem;font-weight:900;color:#0f172a}
.st-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
@media (max-width:560px){.st-opts{grid-template-columns:1fr}}
.st-opt{text-align:left;font-size:17px;font-weight:700;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:10px 14px;min-height:50px;cursor:pointer;color:#0f172a}
.st-opt.ok{background:#ecfdf5;border-color:#059669}.st-opt.no{background:#fff1f2;border-color:#e11d48}
.st-fb{font-weight:800;margin:0}.st-fb.ok{color:#047857}.st-fb.no{color:#be123c}
.st-small{font-size:13px;color:#64748b}
.st-trap,.st-means{margin-top:6px;font-size:16px}.st-trap span,.st-means span{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;margin-right:6px}
.st-trap span{color:#be123c}.st-trap s{color:#be123c}.st-means span{color:#047857}.st-means b{color:#047857}

.st-roles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.st-role{border-radius:12px;padding:8px 10px;display:grid;gap:5px;align-content:start;color:#fff}
.st-role h4{margin:0;font-size:14px;font-weight:900}.st-role small{font-size:12px;opacity:.9;margin-top:-4px}
.st-role .st-chip{background:#fff;border-color:transparent;border-radius:10px;font-weight:800;color:#0f172a}
.st-join{border:1px solid #e2e8f0;border-radius:14px;padding:14px;background:#f8fafc;display:grid;gap:12px}
.st-sent{font-size:1.3rem;font-weight:700;line-height:1.6;color:#0f172a}
.st-gap{display:inline-block;min-width:96px;border-bottom:3px dashed #94a3b8;text-align:center;color:#94a3b8;margin:0 6px;font-weight:900}
.st-gap.ok{border-bottom-style:solid;color:#fff;border-radius:8px;padding:0 8px}
.st-gap.no{border-bottom-color:#e11d48;color:#e11d48}
.st-seq{position:relative;display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:4px 0 0}
.st-seq-line{position:absolute;left:10%;right:10%;top:38px;height:6px;border-radius:3px;background:#e2e8f0}
.st-seq-fill{height:100%;border-radius:3px;background:#4f46e5;transition:width .4s}
.st-node{position:relative;display:grid;justify-items:center;gap:4px;background:none;border:0;cursor:pointer;padding:0;font:inherit}
.st-node .n{width:76px;height:76px;border-radius:50%;background:#fff;border:3px solid #cbd5e1;display:grid;place-items:center;transition:border-color .2s,transform .2s}
.st-node .n img{width:52px;height:52px;object-fit:contain}
.st-node .k{font-size:16px;font-weight:900;color:#334155}.st-node .e{font-size:12px;color:#64748b}
.st-node .num{position:absolute;top:-4px;left:calc(50% + 22px);width:24px;height:24px;border-radius:50%;background:#94a3b8;color:#fff;font-size:13px;font-weight:900;display:grid;place-items:center}
.st-node.on .n{border-color:#4f46e5;transform:scale(1.08)}.st-node.on .k{color:#4f46e5}.st-node.on .num{background:#4f46e5}
.st-node.done .n{border-color:#a5b4fc}
.st-mid{text-align:center;font-size:13px;color:#4f46e5;font-weight:700;margin-top:-2px}
.st-story{display:grid;gap:6px}
.st-line{display:flex;gap:10px;align-items:center;font-size:17px;color:#0f172a;cursor:pointer;opacity:.25;transition:opacity .3s}
.st-line.shown{opacity:1}.st-line b{color:#4f46e5}.st-line small{display:block;font-size:13px;color:#64748b}
.st-line img{width:34px;height:34px;object-fit:contain;flex:none}
@media (max-width:560px){.st-node .n{width:54px;height:54px}.st-node .n img{width:36px;height:36px}.st-seq-line{top:27px}.st-node .k{font-size:13px}.st-node .e{display:none}.st-node .num{left:calc(50% + 14px);width:20px;height:20px;font-size:11px}.st-sent{font-size:1.1rem}}
.st-det{background:#fff;border-radius:10px;padding:10px 12px;display:grid;gap:6px;color:#0f172a;box-shadow:0 2px 8px rgba(0,0,0,.12);animation:st-pop .18s ease-out}
.st-det .w{font-size:1.25rem;font-weight:900}.st-det .en{font-size:13px;color:#475569}
.st-det .ex{font-size:16px;line-height:1.45;cursor:pointer}.st-det .ex div{font-size:13px;color:#64748b}
.st-det mark{background:#FEF08A;color:inherit;border-radius:4px;padding:0 2px;font-weight:800}
.st-det .st-note{margin-top:0}
.st-det .st-row{gap:6px}.st-det .st-btn{min-height:38px;padding:6px 10px;font-size:14px}
.st-chip.open{font-weight:900;box-shadow:inset 0 0 0 2px currentColor}
@keyframes st-pop{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.st-det{animation:none}}
.st-phone{display:none}
@media (max-width:600px){.st-phone{display:flex}.st-stop{display:none}.st-track{margin:16px 4px 10px}.st-ends{margin:-6px 4px 6px}}`;
function css() { if (!document.getElementById('st-css')) { const s = document.createElement('style'); s.id = 'st-css'; s.textContent = CSS; document.head.appendChild(s); } }

function mount(T, root, { say, grade, words }) {
    css();
    let tabI = 0, mode = 'explore', timer = null;
    root.innerHTML = `<div class="st">
      <div class="st-row" role="tablist" aria-label="Scales">${T.tabs.map((t, i) => `<button type="button" role="tab" class="st-btn st-tab" data-t="${i}" aria-selected="${i === 0}">${esc(t.title)}</button>`).join('')}</div>
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
        const forms = String(fr).split(/\s*\/\s*/).map(f => f.replace(/[\s?!.…]+$/, '')).flatMap(f => f.endsWith(' que') ? [f, f.replace(/que$/, 'qu')] : [f]).filter(Boolean).sort((a, b) => b.length - a.length);
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
        body.innerHTML = `<p class="st-hint">${esc(t.hint)}</p><div class="st-groups">${t.groups.map((g, gi) => `<div class="st-group" style="background:${g.color}"><h4>${esc(g.name)}</h4><small>${esc(g.en)}</small>${g.rule ? `<div class="st-rule">${esc(g.rule)}</div>` : ''}${g.words.map((w, wi) => `<button type="button" class="st-chip" data-g="${gi}" data-w="${wi}" aria-expanded="false">${esc(w.fr)}</button>`).join('')}</div>`).join('')}</div>`;
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
        body.innerHTML = `<p class="st-hint">${esc(t.hint)}</p><div class="st-roles">${t.roles.map((r, ri) => `<div class="st-role" style="background:${r.color}"><h4>${r.icon || ''} ${esc(r.name)}</h4><small>${esc(r.en)}</small>${r.words.map((w, wi) => `<button type="button" class="st-chip" data-r="${ri}" data-w="${wi}">${esc(w.fr)}</button>`).join('')}</div>`).join('')}</div>
            <div class="st-join"><div class="st-small" style="font-weight:800;color:#334155">Join the two halves</div><div class="st-sent" id="st-sent"></div>
            <div class="st-chips" id="st-pick">${all.map(x => `<button type="button" class="st-chip" data-fr="${esc(x.w.fr)}">${esc(x.w.fr)}</button>`).join('')}</div>
            <p class="st-fb" id="st-jfb"></p><div class="st-row"><button type="button" class="st-btn" id="st-jnext">Another sentence →</button></div></div>`;
        body.querySelectorAll('.st-role .st-chip').forEach(c => c.addEventListener('click', () => {
            const r = t.roles[Number(c.dataset.r)], w = r.words[Number(c.dataset.w)];
            body.querySelectorAll('.st-role .st-det').forEach(d => { if (d.parentElement !== c.parentElement) d.remove(); });
            body.querySelectorAll('.st-role .st-chip').forEach(x => { if (x.parentElement !== c.parentElement) { x.dataset.open = ''; x.classList.remove('open'); } });
            openDetail(c, w, r.color, `${w.en} · ${r.name}`);
        }));
        const sentence = (it, fill, cls, col) => {
            const f = fill && !it.a ? fill.charAt(0).toUpperCase() + fill.slice(1) : fill;
            const gap = `<span class="st-gap ${cls || ''}" style="${col ? 'background:' + col + ';border-color:' + col : ''}">${f ? esc(f) : '?'}</span>`;
            return it.a ? `${esc(it.a)} ${gap} ${esc(it.b)}` : `${gap} ${esc(it.b)}`;
        };
        const full = (it, w) => (it.a ? it.a + ' ' + w + ' ' + it.b : w.charAt(0).toUpperCase() + w.slice(1) + ' ' + it.b).replace(/que i/, 'qu\'i').replace(/que e/, 'qu\'e');
        const showItem = () => {
            const it = order[k % order.length];
            body.querySelector('#st-sent').innerHTML = sentence(it);
            body.querySelector('#st-jfb').textContent = '';
            body.querySelectorAll('#st-pick .st-chip').forEach(c => { c.disabled = false; c.setAttribute('aria-pressed', 'false'); });
        };
        body.querySelectorAll('#st-pick .st-chip').forEach(c => c.addEventListener('click', () => {
            const it = order[k % order.length], w = c.dataset.fr, fb = body.querySelector('#st-jfb'), x = roleOf(w);
            if (it.w.includes(w)) {
                body.querySelector('#st-sent').innerHTML = sentence(it, w === 'parce que' && /^[aeiouhéè]/i.test(it.b) ? 'parce qu\'' : w, 'ok', x.r.color) + `<div class="st-small" style="font-weight:400">${esc(it.en)}</div>`;
                fb.className = 'st-fb ok';
                fb.textContent = `${x.r.icon || ''} ${w} = ${x.w.en} (${x.r.name.toLowerCase()})` + (it.w.length > 1 ? ` · « ${it.w.find(o => o !== w)} » works too.` : '');
                speak(full(it, w));
                body.querySelectorAll('#st-pick .st-chip').forEach(b => { b.disabled = true; });
            } else {
                c.disabled = true; fb.className = 'st-fb no';
                fb.textContent = `Not « ${w} »: it means ${x.w.en} (${x.r.name.toLowerCase()}). What links these two ideas?`;
            }
        }));
        body.querySelector('#st-jnext').addEventListener('click', () => { k++; showItem(); });
        showItem();
    }
    // ---- Dans l'ordre: a numbered timeline that tells a story step by step ----
    function exploreSequence(t) {
        let si = 0, at = -1, play = null;
        const stop = () => { clearTimeout(play); play = null; const b = body.querySelector('#st-play'); if (b) b.textContent = '▶ Play the story'; };
        body.innerHTML = `<p class="st-hint">${esc(t.hint)}</p><div class="st-chips" id="st-stories">${t.stories.map((S, i) => `<button type="button" class="st-chip" data-s="${i}">${esc(S.title)}</button>`).join('')}</div>
            <div class="st-seq"><div class="st-seq-line"><div class="st-seq-fill" style="width:0%"></div></div>${t.steps.map((st, i) => `<button type="button" class="st-node" data-i="${i}"><span class="num">${i + 1}</span><span class="n"></span><span class="k">${esc(st.fr)}</span><span class="e">${esc(st.en)}</span></button>`).join('')}</div>
            <div class="st-mid">⟵ ensuite · puis · après: the middle steps, in any order ⟶</div>
            <div class="st-row"><button type="button" class="st-btn pri" id="st-play">▶ Play the story</button><button type="button" class="st-btn" id="st-reset">Start again</button></div>
            <div class="st-out st-story" id="st-story"></div>${t.note ? `<div class="st-note">${esc(t.note)}</div>` : ''}`;
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

    // ---------------- Check yourself ----------------
    function questions(t) {
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
                const others = shuffle(conn.filter(c => !it.w.includes(c.w.fr))).slice(0, 3).map(c => c.w.fr);
                const gap = it.a ? `${it.a} ___ ${it.b}` : `___ ${it.b}`;
                Q.push({ q: `« ${gap} »`, opts: shuffle([right, ...others]), a: right, key: x.w.key, why: `${right} = ${x.w.en} (${x.r.name.toLowerCase()}). ${it.en}` + (it.w.length > 1 ? ` « ${it.w[1]} » works too.` : ''), say: it.a ? `${it.a} ${right} ${it.b}` : `${right} ${it.b}` });
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
        ({ scale: exploreScale, pairs: explorePairs, groups: exploreGroups, register: exploreRegister, cards: exploreCards, joiner: exploreJoiner, sequence: exploreSequence })[t.type](t);
    }
    root.querySelectorAll('.st-tab').forEach(b => b.addEventListener('click', () => { tabI = Number(b.dataset.t); show(); }));
    root.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.m; show(); }));
    show();
}

window.VocabTools = window.VocabTools || {};
for (const [id, T] of Object.entries(window.SCALE_DATA || {}))
    window.VocabTools[id] = { name: T.name, next: T.next, mount: (el, opts) => mount(T, el, opts) };
})();
