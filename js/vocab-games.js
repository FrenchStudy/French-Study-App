// vocab-games.js - the games in a Vocab topic's "Games" step, next to the tests (vocab.html).
// Everything runs in the browser from the topic's words, stories and example sentences: no AI.
//   VocabGames.available(type, ctx)  -> true, or a sentence saying why the game can't run
//   VocabGames.start(type, box, ctx) -> draws the game in box
// ctx: { pool: words to practise first, all: every word of the topic, chapters: [{ story }] or null,
//        speak(text, rate), grade(word, ok), picture(word), genderClass(word), done() }
(function () {
const STYLE = `
.vg-board{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.vg-col{display:flex;flex-direction:column;gap:8px;min-width:0}
.vg-tile{min-height:52px;padding:8px 12px;border:1px solid #e2e8f0;background:#fff;border-radius:12px;font-size:16px;text-align:left;
  overflow-wrap:anywhere;cursor:pointer;transition:background .15s,border-color .15s,opacity .3s}
.vg-tile:hover{border-color:#818cf8}
.vg-tile.sel{background:#eef2ff;border-color:#6366f1;box-shadow:0 0 0 2px #c7d2fe}
.vg-tile.ok{background:#ecfdf5;border-color:#10b981;opacity:.45;cursor:default}
.vg-tile.bad{background:#fff1f2;border-color:#f43f5e;animation:vg-shake .3s}
@keyframes vg-shake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.vg-gap{display:inline-block;min-width:4.5em;border-bottom:3px solid #6366f1;color:#4338ca;font-weight:800;text-align:center}
.vg-gap.ok{border-color:#10b981;color:#047857}.vg-gap.bad{border-color:#f43f5e;color:#be123c}
.vg-line{min-height:60px;padding:8px;border:2px dashed #cbd5e1;border-radius:14px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.vg-chips{display:flex;flex-wrap:wrap;gap:6px}
.vg-chip{min-height:44px;padding:6px 12px;border:1px solid #cbd5e1;background:#fff;border-radius:10px;font-size:17px;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}
.vg-chip.lift{opacity:.3}
.vg-ghost{position:fixed;z-index:80;pointer-events:none;transform:translate(-50%,-60%) rotate(-2deg);box-shadow:0 8px 20px rgba(15,23,42,.25);background:#eef2ff;border-color:#6366f1;cursor:grabbing}
.vg-line.drop{border-color:#6366f1;background:rgba(238,242,255,.6)}
.vg-chip:hover{border-color:#6366f1}
.vg-chip.used{visibility:hidden}
.vg-line .vg-chip{background:#eef2ff;border-color:#a5b4fc}
.vg-line .vg-chip.at{border-color:#4f46e5;box-shadow:0 0 0 2px #c7d2fe}
.vg-caret{width:3px;align-self:stretch;min-height:36px;background:#4f46e5;border-radius:2px;animation:vg-blink 1s steps(1) infinite}
@keyframes vg-blink{50%{opacity:.2}}
.vg-big{min-height:64px;font-size:18px;font-weight:800;border-radius:14px;cursor:pointer;border:2px solid transparent}
.vg-m{background:#e0f2fe;color:#075985;border-color:#7dd3fc}.vg-m:hover{background:#bae6fd}
.vg-f{background:#ffe4e6;color:#9f1239;border-color:#fda4af}.vg-f:hover{background:#fecdd3}
.vg-mic{min-height:64px;padding:0 24px;font-size:18px;font-weight:800;border-radius:16px;background:#4f46e5;color:#fff;cursor:pointer;border:0}
.vg-mic.on{background:#e11d48;animation:vg-pulse 1s infinite}
@keyframes vg-pulse{50%{box-shadow:0 0 0 8px rgba(225,29,72,.2)}}
.vg-tile:focus-visible,.vg-chip:focus-visible,.vg-big:focus-visible,.vg-mic:focus-visible{outline:3px solid #a5b4fc;outline-offset:2px}
@media (prefers-reduced-motion:reduce){.vg-tile.bad,.vg-mic.on,.vg-caret{animation:none}}
`;
let cssDone = false;
const injectCss = () => { if (cssDone) return; cssDone = true; const s = document.createElement('style'); s.textContent = STYLE; document.head.appendChild(s); };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plain = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’]/g, "'");
const bare = (s) => plain(s).replace(/[«»"“”…?!.,;:()\-]/g, ' ').replace(/\s+/g, ' ').trim();
const ARTICLE = /^(le |la |les |l['’]|un |une |des )/i;
// Number words are stored as "7 · sept": the digit would give the answer away, so games show the word only.
// Meanings lose their notes in brackets ("one (m / f)") for the same reason.
const NUM = /^\s*(\d[\d\s]*)\s*·\s*/;
const frOf = (w) => w.fr.replace(NUM, '');
const enOf = (w) => w.en.replace(/\s*\([^)]*\)/g, '').trim() || w.en;
const noArticle = (fr) => fr.replace(NUM, '').split(' / ')[0].replace(ARTICLE, '').trim();
// Speech recognition writes "sept" as "7": turn digits back into French words before comparing
const UNITS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const TENS = { 20: 'vingt', 30: 'trente', 40: 'quarante', 50: 'cinquante', 60: 'soixante' };
function numWords(n) {
    if (n < 17) return UNITS[n];
    if (n < 20) return 'dix-' + UNITS[n - 10];
    if (n < 70) { const t = n - n % 10, u = n % 10; return TENS[t] + (u === 0 ? '' : u === 1 ? ' et un' : '-' + UNITS[u]); }
    if (n < 80) return n === 71 ? 'soixante et onze' : 'soixante-' + numWords(n - 60);
    if (n < 100) return n === 80 ? 'quatre-vingts' : 'quatre-vingt-' + numWords(n - 80);
    if (n < 1000) { const h = Math.floor(n / 100), r = n % 100; return (h === 1 ? 'cent' : UNITS[h] + ' cent' + (r ? '' : 's')) + (r ? ' ' + numWords(r) : ''); }
    if (n < 1000000) { const t = Math.floor(n / 1000), r = n % 1000; return (t === 1 ? 'mille' : numWords(t) + ' mille') + (r ? ' ' + numWords(r) : ''); }
    return String(n);
}
const digitsToWords = (s) => String(s).replace(/\d+(?:[\s\u202f]\d{3})*/g, d => numWords(Number(d.replace(/\D/g, ''))));
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const uniqBy = (arr, f) => { const seen = new Set(); return arr.filter(x => { const k = f(x); if (seen.has(k)) return false; seen.add(k); return true; }); };
const STORY_MARK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const storyPlain = (fr) => fr.replace(STORY_MARK, (m, text) => text);
const BTN = 'min-h-[48px] px-5 font-bold rounded-xl';

const head = (i, n, score) => `<div class="text-sm text-slate-500">Question ${i + 1} of ${n} · Score ${score}</div>`;
function finish(box, ctx, big, line, again) {
    box.innerHTML = `<div class="text-center space-y-3">
        <div class="text-3xl">🏁</div>
        <p class="text-xl font-black text-slate-900">${esc(big)}</p>
        <p class="text-base text-slate-600">${esc(line)}</p>
        <button type="button" data-vg-again class="${BTN} bg-indigo-600 hover:bg-indigo-700 text-white">Play again</button></div>`;
    box.querySelector('[data-vg-again]').addEventListener('click', again);
    if (ctx.done) ctx.done();
}
const feedback = (ok, html) => `<div class="rounded-xl p-3 text-base ${ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}">${html}</div>`;
const nextBtn = (label) => `<button type="button" data-vg-next class="mt-3 ${BTN} bg-slate-900 text-white">${label || 'Next →'}</button>`;

// ---------- Sentences from the topic: story lines with their marked words, and example sentences ----------
function sentences(ctx) {
    const byKey = new Map(ctx.all.map(w => [w.key, w]));
    const byLower = new Map(ctx.all.map(w => [w.key.toLowerCase(), w]));
    const out = [];
    (ctx.chapters || []).forEach(c => (c.story || []).forEach(([fr, en]) => {
        const marks = [];
        fr.replace(STORY_MARK, (m, text, key) => { const w = byKey.get(key || text) || byLower.get((key || text).toLowerCase()); if (w) marks.push({ w, text }); return m; });
        out.push({ fr: storyPlain(fr), en: en || '', marks });
    }));
    ctx.all.forEach(w => {
        if (!w.exFr) return;
        const form = noArticle(w.fr);
        const at = form.length > 1 ? w.exFr.toLowerCase().indexOf(form.toLowerCase()) : -1;
        const ok = at >= 0 && !/[\p{L}]/u.test(w.exFr[at - 1] || '') && !/[\p{L}]/u.test(w.exFr[at + form.length] || '');
        out.push({ fr: w.exFr, en: w.exEn || '', marks: ok ? [{ w, text: w.exFr.slice(at, at + form.length) }] : [] });
    });
    return uniqBy(out, s => s.fr);
}
const rank = (ctx) => { const r = new Map(); ctx.pool.forEach((w, i) => r.set(w.key, i)); return (w) => r.has(w.key) ? r.get(w.key) : 1e6; };

// ---------- Match pairs: join each French word to its meaning, against the clock ----------
function matchWords(ctx) { return uniqBy(uniqBy(ctx.pool, w => plain(frOf(w))), w => plain(enOf(w))); }
function match(box, ctx) {
    const words = matchWords(ctx).slice(0, 6);
    const left = shuffle(words), right = shuffle(words);
    const missed = new Set(); let selL = null, selR = null, found = 0, mistakes = 0;
    const t0 = Date.now();
    box.innerHTML = `<div class="flex items-center justify-between text-sm text-slate-500"><span>Tap a French word, then its meaning.</span><span data-vg-time aria-live="off">0:00</span></div>
        <div class="vg-board">
            <div class="vg-col">${left.map(w => `<button type="button" class="vg-tile font-bold ${ctx.genderClass(w)}" data-l="${esc(w.key)}">${esc(frOf(w))}</button>`).join('')}</div>
            <div class="vg-col">${right.map(w => `<button type="button" class="vg-tile" data-r="${esc(w.key)}">${esc(enOf(w))}</button>`).join('')}</div>
        </div><p class="text-sm text-slate-500" data-vg-status aria-live="polite"></p>`;
    const timeEl = box.querySelector('[data-vg-time]');
    const clock = () => { const s = Math.round((Date.now() - t0) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
    const tick = setInterval(() => { if (!box.isConnected || !box.querySelector('[data-vg-time]')) return clearInterval(tick); timeEl.textContent = clock(); }, 1000);
    const tile = (side, key) => box.querySelector(`[data-${side}="${CSS.escape(key)}"]`);
    const check = () => {
        if (!selL || !selR) return;
        const a = tile('l', selL), b = tile('r', selR);
        if (selL === selR) {
            const w = words.find(x => x.key === selL);
            [a, b].forEach(x => { x.classList.remove('sel'); x.classList.add('ok'); x.disabled = true; });
            ctx.speak(frOf(w), 0.9); found += 1;
            box.querySelector('[data-vg-status]').textContent = `${frOf(w)} = ${w.en}`;
        } else {
            mistakes += 1; missed.add(selL);
            [a, b].forEach(x => { x.classList.remove('sel'); x.classList.add('bad'); setTimeout(() => x.classList.remove('bad'), 450); });
        }
        selL = selR = null;
        if (found === words.length) {
            clearInterval(tick);
            words.forEach(w => ctx.grade(w, !missed.has(w.key)));
            finish(box, ctx, `${clock()} · ${mistakes} ${mistakes === 1 ? 'mistake' : 'mistakes'}`,
                mistakes ? 'Words you matched wrongly will come back sooner in Flashcards. Try to beat your time!' : 'Perfect! Try to beat your time.', () => match(box, ctx));
        }
    };
    box.querySelectorAll('[data-l]').forEach(b => b.addEventListener('click', () => {
        box.querySelectorAll('[data-l]').forEach(x => x.classList.remove('sel'));
        selL = b.dataset.l; b.classList.add('sel'); ctx.speak(frOf(words.find(x => x.key === selL)), 0.9); check();
    }));
    box.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => {
        box.querySelectorAll('[data-r]').forEach(x => x.classList.remove('sel'));
        selR = b.dataset.r; b.classList.add('sel'); check();
    }));
}

// ---------- Le ou la ? : the gender of each noun, shown without its article ----------
function genderWords(ctx) {
    return ctx.pool.filter(w => (w.gender === 'm' || w.gender === 'f') && /^(le |la |l['’]|un |une )/i.test(w.fr) && !w.fr.includes(' / ') && noArticle(w.fr).length > 1);
}
function gender(box, ctx) {
    const items = shuffle(genderWords(ctx).slice(0, 20)).slice(0, 10);
    let i = 0, score = 0;
    const show = () => {
        if (i >= items.length) return finish(box, ctx, `${score} / ${items.length}`, 'Tip: words ending in -tion, -té, -ure and -ence are usually feminine; -ment, -age and -isme usually masculine.', () => gender(box, ctx));
        const w = items[i];
        box.innerHTML = `${head(i, items.length, score)}
            <p class="text-base text-slate-600">Masculine or feminine?</p>
            <p class="text-3xl font-black text-slate-900 break-words">${esc(noArticle(w.fr))}</p>
            <div class="grid grid-cols-2 gap-2">
                <button type="button" class="vg-big vg-m" data-g="m">le · un</button>
                <button type="button" class="vg-big vg-f" data-g="f">la · une</button>
            </div><div data-vg-fb></div>`;
        box.querySelectorAll('[data-g]').forEach(b => b.addEventListener('click', () => {
            if (box.querySelector('[data-vg-next]')) return;
            const ok = b.dataset.g === w.gender; if (ok) score += 1;
            ctx.speak(w.fr, 0.9);
            const art = w.gender === 'm' ? 'un' : 'une';
            box.querySelector('[data-vg-fb]').innerHTML = feedback(ok, `${ok ? 'Correct!' : 'Not quite.'} <b class="${ctx.genderClass(w)}">${esc(w.fr)}</b> · ${art} ${esc(noArticle(w.fr))} · ${w.gender === 'm' ? 'masculine' : 'feminine'}
                <span class="block text-sm text-slate-600 mt-1">${esc(w.en)}</span>`) + nextBtn();
            box.querySelector('[data-vg-next]').addEventListener('click', () => { i += 1; show(); });
            box.querySelector('[data-vg-next]').focus();
        }));
    };
    show();
}

// ---------- Fill the gap: the topic's sentences with one word missing ----------
function gapItems(ctx) {
    const r = rank(ctx);
    const items = [];
    sentences(ctx).forEach(s => s.marks.forEach(m => {
        const at = s.fr.indexOf(m.text);
        if (at >= 0) items.push({ w: m.w, before: s.fr.slice(0, at), after: s.fr.slice(at + m.text.length), answer: m.text, en: s.en });
    }));
    return uniqBy(shuffle(items).sort((a, b) => r(a.w) - r(b.w)), x => x.w.key);
}
function gap(box, ctx) {
    const all = gapItems(ctx);
    const items = shuffle(all.slice(0, 10));
    let i = 0, score = 0;
    const show = () => {
        if (i >= items.length) return finish(box, ctx, `${score} / ${items.length}`, 'Correct answers moved those words up a box; missed words will come back sooner in Flashcards.', () => gap(box, ctx));
        const it = items[i];
        const others = uniqBy(shuffle(all.filter(x => x.w.key !== it.w.key).map(x => x.answer).concat(ctx.all.map(w => noArticle(w.fr)))), plain)
            .filter(a => plain(a) !== plain(it.answer)).slice(0, 3);
        const options = shuffle([it.answer, ...others]);
        box.innerHTML = `${head(i, items.length, score)}
            <p class="text-base text-slate-600">Which word goes in the gap?</p>
            <p class="text-xl leading-relaxed text-slate-900" lang="fr">${esc(it.before)}<span class="vg-gap" data-vg-gap>?</span>${esc(it.after)}</p>
            ${it.en ? `<button type="button" data-vg-hint class="text-sm font-semibold text-indigo-700 hover:underline">Show the English</button><p class="hidden text-base text-slate-500" data-vg-en>${esc(it.en)}</p>` : ''}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${options.map((o, n) => `<button type="button" data-opt="${n}" class="min-h-[52px] text-left text-base px-4 py-2 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl">${esc(o)}</button>`).join('')}</div>
            <div data-vg-fb></div>`;
        const hint = box.querySelector('[data-vg-hint]');
        if (hint) hint.addEventListener('click', () => { box.querySelector('[data-vg-en]').classList.remove('hidden'); hint.remove(); });
        box.querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', () => {
            if (box.querySelector('[data-vg-next]')) return;
            const chosen = options[Number(b.dataset.opt)], ok = plain(chosen) === plain(it.answer);
            if (ok) score += 1;
            b.classList.add(ok ? 'bg-emerald-100' : 'bg-rose-100', ok ? 'border-emerald-500' : 'border-rose-500');
            const g = box.querySelector('[data-vg-gap]'); g.textContent = it.answer; g.classList.add(ok ? 'ok' : 'bad');
            ctx.grade(it.w, ok);
            ctx.speak(it.before + it.answer + it.after, 0.9);
            box.querySelector('[data-vg-fb]').innerHTML = feedback(ok, `${ok ? 'Correct!' : `It was: <b>${esc(it.answer)}</b>`}
                <span class="block text-sm text-slate-600 mt-1">${esc(it.w.fr)} = ${esc(it.w.en)}${it.en ? ` · ${esc(it.en)}` : ''}</span>`) + nextBtn();
            box.querySelector('[data-vg-next]').addEventListener('click', () => { i += 1; show(); });
            box.querySelector('[data-vg-next]').focus();
        }));
    };
    show();
}

// ---------- Build the sentence: put the words of a sentence back in order ----------
const END_PUNCT = /\s*([.!?…]+)$/;
function buildItems(ctx) {
    const r = rank(ctx);
    return uniqBy(sentences(ctx).filter(s => s.en).map(s => {
        const text = s.fr.trim(), end = (text.match(END_PUNCT) || ['', ''])[1];
        const words = text.replace(END_PUNCT, '').split(/\s+/).filter(Boolean);
        const key = s.marks.length ? Math.min(...s.marks.map(m => r(m.w))) : 1e7;
        return { fr: text, en: s.en, words, end, key };
    }).filter(s => s.words.length >= 4 && s.words.length <= 11), s => s.fr).sort((a, b) => a.key - b.key);
}
function build(box, ctx) {
    const items = shuffle(buildItems(ctx).slice(0, 12)).slice(0, 6);
    let i = 0, score = 0;
    const show = () => {
        if (i >= items.length) return finish(box, ctx, `${score} / ${items.length}`, 'Building sentences trains word order: where adjectives, pronouns and "ne … pas" go.', () => build(box, ctx));
        const it = items[i];
        let order = shuffle(it.words.map((t, n) => n));
        if (order.every((n, k) => n === k) && order.length > 1) order = order.slice(1).concat(order[0]);
        const placed = [];
        box.innerHTML = `${head(i, items.length, score)}
            <p class="text-base text-slate-600">Put the words in order to say:</p>
            <p class="text-lg font-bold text-slate-900">${esc(it.en)}</p>
            <div class="vg-line" data-vg-line aria-label="Your sentence"></div>
            <p class="text-sm text-slate-500" data-vg-tip>Drag the words into place, or tap them. To put a word between two others, drag it there, or tap the word it should go before. Drag a word out to send it back.</p>
            <div class="vg-chips" data-vg-chips>${order.map(n => `<button type="button" class="vg-chip" data-chip="${n}" lang="fr">${esc(it.words[n])}</button>`).join('')}</div>
            <div class="flex flex-wrap gap-2">
                <button type="button" data-vg-check class="${BTN} bg-indigo-600 hover:bg-indigo-700 text-white">Check</button>
                <button type="button" data-vg-clear class="${BTN} bg-slate-100 text-slate-700 font-semibold">Start over</button>
            </div><div data-vg-fb></div>`;
        const line = box.querySelector('[data-vg-line]');
        let at = null;   // the next word goes before placed[at]; null: at the end
        const draw = () => {
            line.innerHTML = placed.map((n, k) => (k === at ? '<span class="vg-caret" aria-hidden="true"></span>' : '') +
                `<button type="button" class="vg-chip${k === at ? ' at' : ''}" data-back="${k}" lang="fr" aria-pressed="${k === at}">${esc(it.words[n])}</button>`).join('') +
                (placed.length ? `<span class="text-lg">${esc(it.end)}</span>` : '<span class="text-sm text-slate-400 px-2">Tap the words below</span>');
            box.querySelectorAll('[data-chip]').forEach(c => c.classList.toggle('used', placed.includes(Number(c.dataset.chip))));
            line.querySelectorAll('[data-back]').forEach(c => c.addEventListener('click', () => {
                if (done || justDragged(c)) return;
                const k = Number(c.dataset.back);
                if (at === k) { placed.splice(k, 1); at = null; } else at = k;   // first tap: add before it; second tap: send it back
                draw();
            }));
        };
        // The browser also sends a click to the word you just dragged: ignore that one
        let done = false, dropped = { el: null, t: 0 };
        const justDragged = (el) => dropped.el === el && Date.now() - dropped.t < 500;
        box.querySelectorAll('[data-chip]').forEach(c => c.addEventListener('click', () => {
            if (done || justDragged(c)) return;
            const n = Number(c.dataset.chip);
            if (placed.includes(n)) return;
            if (at === null) placed.push(n); else { placed.splice(at, 0, n); at += 1; }
            draw();
        }));
        box.querySelector('[data-vg-clear]').addEventListener('click', () => { if (done) return; placed.length = 0; at = null; draw(); });

        // Drag and drop (mouse, finger or pen): drag a word into the sentence at any place, move it, or drag it out
        let drag = null;
        const lineChips = () => [...line.querySelectorAll('[data-back]')].filter(c => !drag || c !== drag.chip);
        const overLine = (x, y) => { const r = line.getBoundingClientRect(); return x >= r.left - 16 && x <= r.right + 16 && y >= r.top - 16 && y <= r.bottom + 16; };
        const dropIndex = (x, y) => {
            const chips = lineChips();
            for (let j = 0; j < chips.length; j++) {
                const r = chips[j].getBoundingClientRect();
                if (y < r.top || (y <= r.bottom && x < r.left + r.width / 2)) return j;
            }
            return chips.length;
        };
        const showMarker = (idx) => {
            line.querySelectorAll('.vg-caret').forEach(m => m.remove());
            if (idx === null) return;
            const m = document.createElement('span'); m.className = 'vg-caret'; m.setAttribute('aria-hidden', 'true');
            const chips = lineChips();
            line.insertBefore(m, chips[idx] || line.querySelector('[data-back]:last-of-type')?.nextSibling || line.firstChild);
        };
        const onMove = (e) => {
            if (!drag || e.pointerId !== drag.id) return;
            if (!drag.on) {
                if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 6) return;
                drag.on = true; at = null;
                line.querySelectorAll('.vg-chip.at').forEach(c => c.classList.remove('at'));
                drag.ghost = drag.chip.cloneNode(true); drag.ghost.classList.add('vg-ghost'); drag.ghost.removeAttribute('data-back'); drag.ghost.removeAttribute('data-chip');
                document.body.appendChild(drag.ghost); drag.chip.classList.add('lift');
            }
            e.preventDefault();
            drag.ghost.style.left = e.clientX + 'px'; drag.ghost.style.top = e.clientY + 'px';
            const over = overLine(e.clientX, e.clientY);
            line.classList.toggle('drop', over);
            showMarker(over ? dropIndex(e.clientX, e.clientY) : null);
        };
        const onUp = (e) => {
            if (!drag || e.pointerId !== drag.id) return;
            document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); document.removeEventListener('pointercancel', onUp);
            const d = drag; drag = null;
            if (!d.on) return;   // a tap: the click handlers do the work
            d.ghost.remove(); line.classList.remove('drop'); dropped = { el: d.chip, t: Date.now() };
            const arr = placed.slice();
            if (d.fromLine) arr.splice(d.k, 1);
            if (e.type === 'pointerup' && overLine(e.clientX, e.clientY)) arr.splice(dropIndex(e.clientX, e.clientY), 0, d.n);
            placed.splice(0, placed.length, ...arr);
            draw();
        };
        // Listen on this question's own elements (the box itself is reused by the next game)
        const onDown = (e) => {
            if (done || drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
            const chip = e.target.closest('.vg-chip');
            if (!chip || chip.classList.contains('used') || !box.contains(chip)) return;
            const fromLine = chip.hasAttribute('data-back');
            const k = fromLine ? Number(chip.dataset.back) : null;
            drag = { chip, fromLine, k, n: fromLine ? placed[k] : Number(chip.dataset.chip), x0: e.clientX, y0: e.clientY, on: false, ghost: null, id: e.pointerId };
            document.addEventListener('pointermove', onMove, { passive: false }); document.addEventListener('pointerup', onUp); document.addEventListener('pointercancel', onUp);
        };
        line.addEventListener('pointerdown', onDown);
        box.querySelector('[data-vg-chips]').addEventListener('pointerdown', onDown);
        box.querySelector('[data-vg-check]').addEventListener('click', () => {
            if (done) return;
            if (placed.length < it.words.length) { box.querySelector('[data-vg-fb]').innerHTML = '<p class="text-sm text-slate-600">Use all the words first.</p>'; return; }
            done = true; at = null; draw(); box.querySelector('[data-vg-tip]')?.remove();
            // Two identical words (e.g. "de … de") can swap places: compare the text, not the positions
            const ok = placed.map(n => it.words[n]).join(' ') === it.words.join(' ');
            if (ok) score += 1;
            ctx.speak(it.fr, 0.9);
            box.querySelector('[data-vg-fb]').innerHTML = feedback(ok, `${ok ? 'Correct!' : 'Not quite. The sentence is:'}<span class="block text-lg font-semibold mt-1" lang="fr">${esc(it.fr)}</span>`) + nextBtn();
            box.querySelector('[data-vg-check]').remove(); box.querySelector('[data-vg-clear]').remove();
            box.querySelector('[data-vg-next]').addEventListener('click', () => { i += 1; show(); });
            box.querySelector('[data-vg-next]').focus();
        });
        draw();
    };
    show();
}

// ---------- Say it: see the meaning, say the French word; the browser's speech recognition checks it ----------
const Rec = () => window.SpeechRecognition || window.webkitSpeechRecognition;
function sayWords(ctx) { return uniqBy(ctx.pool.filter(w => w.en && noArticle(w.fr).length > 1), w => plain(enOf(w))); }
function heardOk(w, alts) {
    const forms = frOf(w).split(' / ').flatMap(f => [bare(f), bare(f.replace(ARTICLE, ''))]).filter(Boolean);
    return alts.some(a => { const h = ` ${bare(digitsToWords(a))} `; return forms.some(f => h.includes(` ${f} `)); });
}
function say(box, ctx) {
    const items = shuffle(sayWords(ctx).slice(0, 16)).slice(0, 8);
    let i = 0, score = 0, rec = null;
    const show = () => {
        if (i >= items.length) return finish(box, ctx, `${score} / ${items.length}`, 'Saying words out loud makes them stick, and trains your accent.', () => say(box, ctx));
        const w = items[i], pic = ctx.picture ? ctx.picture(w) : '';
        let tries = 0, settled = false;
        box.innerHTML = `${head(i, items.length, score)}
            <p class="text-base text-slate-600">Say this in French:</p>
            ${pic ? `<p class="text-6xl leading-none" aria-hidden="true">${pic}</p>` : ''}
            <p class="text-2xl font-black text-slate-900">${esc(enOf(w))}</p>
            <div class="flex flex-wrap items-center gap-2">
                <button type="button" class="vg-mic" data-vg-mic>🎤 Tap and speak</button>
                <button type="button" data-vg-skip class="${BTN} bg-slate-100 text-slate-700 font-semibold">I don't know</button>
            </div>
            <p class="text-base text-slate-600" data-vg-heard aria-live="polite"></p><div data-vg-fb></div>`;
        const mic = box.querySelector('[data-vg-mic]'), heard = box.querySelector('[data-vg-heard]');
        const settle = (ok) => {
            if (settled) return; settled = true;
            if (ok) score += 1;
            ctx.grade(w, ok);
            ctx.speak(frOf(w), 0.9);
            box.querySelector('[data-vg-skip]')?.remove(); mic.remove();
            box.querySelector('[data-vg-fb]').innerHTML = feedback(ok, `${ok ? 'Correct!' : 'The word is:'} <b class="${ctx.genderClass(w)}">${esc(frOf(w))}</b>
                <button type="button" data-vg-hear class="ml-2 text-sm font-semibold text-indigo-700 hover:underline">🔊 Hear it again</button>`) + nextBtn();
            box.querySelector('[data-vg-hear]').addEventListener('click', () => ctx.speak(frOf(w), 0.8));
            box.querySelector('[data-vg-next]').addEventListener('click', () => { i += 1; show(); });
            box.querySelector('[data-vg-next]').focus();
        };
        mic.addEventListener('click', () => {
            if (rec) { rec.stop(); return; }
            const R = Rec();
            rec = new R(); rec.lang = 'fr-FR'; rec.interimResults = false; rec.maxAlternatives = 5;
            mic.classList.add('on'); mic.textContent = '● Listening… tap to stop'; heard.textContent = '';
            rec.onresult = (e) => {
                const alts = Array.from(e.results[0] || []).map(a => a.transcript);
                tries += 1;
                if (heardOk(w, alts)) { heard.textContent = `I heard: “${alts[0]}”`; settle(true); return; }
                heard.textContent = `I heard: “${alts[0] || '…'}”. ${tries < 3 ? 'Try again!' : ''}`;
                if (tries >= 3) settle(false);
            };
            rec.onerror = (e) => {
                heard.textContent = e.error === 'not-allowed' || e.error === 'service-not-allowed'
                    ? 'The microphone is blocked. Allow it in your browser to play this game.'
                    : e.error === 'no-speech' ? "I didn't hear anything. Tap and speak a bit louder." : 'Listening stopped. Tap to try again.';
            };
            rec.onend = () => { rec = null; if (mic.isConnected) { mic.classList.remove('on'); mic.textContent = '🎤 Tap and speak'; } };
            try { rec.start(); } catch (err) { rec = null; mic.classList.remove('on'); heard.textContent = 'Listening could not start. Tap to try again.'; }
        });
        box.querySelector('[data-vg-skip]').addEventListener('click', () => { if (rec) rec.abort(); settle(false); });
    };
    show();
}

const GAMES = {
    match: { need: (ctx) => matchWords(ctx).length >= 4 || 'This topic needs at least 4 words for Match pairs.', run: match },
    gender: { need: (ctx) => genderWords(ctx).length >= 4 || 'This topic has too few nouns with le or la for this game.', run: gender },
    gap: { need: (ctx) => gapItems(ctx).length >= 4 || 'This topic has too few example sentences for Fill the gap.', run: gap },
    build: { need: (ctx) => buildItems(ctx).length >= 3 || 'This topic has too few sentences with a translation for Build the sentence.', run: build },
    say: { need: (ctx) => !Rec() ? "Your browser can't listen to speech. Say it works in Chrome and Edge."
        : sayWords(ctx).length >= 4 || 'This topic needs at least 4 words for Say it.', run: say }
};
window.VocabGames = {
    has: (type) => !!GAMES[type],
    available(type, ctx) { const g = GAMES[type]; return g ? g.need(ctx) : 'Unknown game.'; },
    // Games that can't work with this topic's words are hidden; "Say it" stays and explains instead
    hidden(type, ctx) { return type !== 'say' && GAMES[type] && GAMES[type].need(ctx) !== true; },
    start(type, box, ctx) {
        injectCss();
        const ok = this.available(type, ctx);
        if (ok !== true) { box.innerHTML = `<p class="text-base text-slate-600">${esc(ok)}</p>`; return; }
        box.innerHTML = '';
        GAMES[type].run(box, ctx);
    }
};
})();
