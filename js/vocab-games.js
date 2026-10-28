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
.vg-chip{min-height:44px;padding:6px 12px;border:1px solid #cbd5e1;background:#fff;border-radius:10px;font-size:17px;cursor:pointer}
.vg-chip:hover{border-color:#6366f1}
.vg-chip.used{visibility:hidden}
.vg-line .vg-chip{background:#eef2ff;border-color:#a5b4fc}
.vg-big{min-height:64px;font-size:18px;font-weight:800;border-radius:14px;cursor:pointer;border:2px solid transparent}
.vg-m{background:#e0f2fe;color:#075985;border-color:#7dd3fc}.vg-m:hover{background:#bae6fd}
.vg-f{background:#ffe4e6;color:#9f1239;border-color:#fda4af}.vg-f:hover{background:#fecdd3}
.vg-mic{min-height:64px;padding:0 24px;font-size:18px;font-weight:800;border-radius:16px;background:#4f46e5;color:#fff;cursor:pointer;border:0}
.vg-mic.on{background:#e11d48;animation:vg-pulse 1s infinite}
@keyframes vg-pulse{50%{box-shadow:0 0 0 8px rgba(225,29,72,.2)}}
.vg-tile:focus-visible,.vg-chip:focus-visible,.vg-big:focus-visible,.vg-mic:focus-visible{outline:3px solid #a5b4fc;outline-offset:2px}
@media (prefers-reduced-motion:reduce){.vg-tile.bad,.vg-mic.on{animation:none}}
`;
let cssDone = false;
const injectCss = () => { if (cssDone) return; cssDone = true; const s = document.createElement('style'); s.textContent = STYLE; document.head.appendChild(s); };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plain = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’]/g, "'");
const bare = (s) => plain(s).replace(/[«»"“”…?!.,;:()]/g, ' ').replace(/\s+/g, ' ').trim();
const ARTICLE = /^(le |la |les |l['’]|un |une |des )/i;
const noArticle = (fr) => fr.split(' / ')[0].replace(ARTICLE, '').trim();
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
function matchWords(ctx) { return uniqBy(uniqBy(ctx.pool, w => plain(w.fr)), w => plain(w.en)); }
function match(box, ctx) {
    const words = matchWords(ctx).slice(0, 6);
    const left = shuffle(words), right = shuffle(words);
    const missed = new Set(); let selL = null, selR = null, found = 0, mistakes = 0;
    const t0 = Date.now();
    box.innerHTML = `<div class="flex items-center justify-between text-sm text-slate-500"><span>Tap a French word, then its meaning.</span><span data-vg-time aria-live="off">0:00</span></div>
        <div class="vg-board">
            <div class="vg-col">${left.map(w => `<button type="button" class="vg-tile font-bold ${ctx.genderClass(w)}" data-l="${esc(w.key)}">${esc(w.fr)}</button>`).join('')}</div>
            <div class="vg-col">${right.map(w => `<button type="button" class="vg-tile" data-r="${esc(w.key)}">${esc(w.en)}</button>`).join('')}</div>
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
            ctx.speak(w.fr, 0.9); found += 1;
            box.querySelector('[data-vg-status]').textContent = `${w.fr} = ${w.en}`;
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
        selL = b.dataset.l; b.classList.add('sel'); ctx.speak(words.find(x => x.key === selL).fr, 0.9); check();
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
            <div class="vg-chips" data-vg-chips>${order.map(n => `<button type="button" class="vg-chip" data-chip="${n}" lang="fr">${esc(it.words[n])}</button>`).join('')}</div>
            <div class="flex flex-wrap gap-2">
                <button type="button" data-vg-check class="${BTN} bg-indigo-600 hover:bg-indigo-700 text-white">Check</button>
                <button type="button" data-vg-clear class="${BTN} bg-slate-100 text-slate-700 font-semibold">Start over</button>
            </div><div data-vg-fb></div>`;
        const line = box.querySelector('[data-vg-line]');
        const draw = () => {
            line.innerHTML = placed.map((n, k) => `<button type="button" class="vg-chip" data-back="${k}" lang="fr">${esc(it.words[n])}</button>`).join('') + (placed.length ? `<span class="text-lg">${esc(it.end)}</span>` : '<span class="text-sm text-slate-400 px-2">Tap the words below</span>');
            box.querySelectorAll('[data-chip]').forEach(c => c.classList.toggle('used', placed.includes(Number(c.dataset.chip))));
            line.querySelectorAll('[data-back]').forEach(c => c.addEventListener('click', () => { if (done) return; placed.splice(Number(c.dataset.back), 1); draw(); }));
        };
        let done = false;
        box.querySelectorAll('[data-chip]').forEach(c => c.addEventListener('click', () => { if (done) return; const n = Number(c.dataset.chip); if (!placed.includes(n)) { placed.push(n); draw(); } }));
        box.querySelector('[data-vg-clear]').addEventListener('click', () => { if (done) return; placed.length = 0; draw(); });
        box.querySelector('[data-vg-check]').addEventListener('click', () => {
            if (done) return;
            if (placed.length < it.words.length) { box.querySelector('[data-vg-fb]').innerHTML = '<p class="text-sm text-slate-600">Use all the words first.</p>'; return; }
            done = true;
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
function sayWords(ctx) { return uniqBy(ctx.pool.filter(w => w.en && noArticle(w.fr).length > 1), w => plain(w.en)); }
function heardOk(w, alts) {
    const forms = w.fr.split(' / ').flatMap(f => [bare(f), bare(f.replace(ARTICLE, ''))]).filter(Boolean);
    return alts.some(a => { const h = ` ${bare(a)} `; return forms.some(f => h.includes(` ${f} `)); });
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
            <p class="text-2xl font-black text-slate-900">${esc(w.en)}</p>
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
            ctx.speak(w.fr, 0.9);
            box.querySelector('[data-vg-skip]')?.remove(); mic.remove();
            box.querySelector('[data-vg-fb]').innerHTML = feedback(ok, `${ok ? 'Correct!' : 'The word is:'} <b class="${ctx.genderClass(w)}">${esc(w.fr)}</b>
                <button type="button" data-vg-hear class="ml-2 text-sm font-semibold text-indigo-700 hover:underline">🔊 Hear it again</button>`) + nextBtn();
            box.querySelector('[data-vg-hear]').addEventListener('click', () => ctx.speak(w.fr, 0.8));
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
