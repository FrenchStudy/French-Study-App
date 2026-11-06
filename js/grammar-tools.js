// grammar-tools.js - the « See it » parts of a grammar page, drawn from data (js/grammar-pages.js), then its practice.
// A page is { steps: [ { tool, title, sub, … } ], practice: { choose, build, spot } }. The tools:
//   conj   a verb by person: tap je / tu / il…; the ending lights up, silent endings are marked; a no and a sentence
//          { verbs: [ { inf, en, stem, forms: [6], tail?, silent?: [6 booleans], pasAt?: n or [6] } ], neg?: true, pre?: 'Il faut que' }
//   swap   one sentence before and after a change (make it a no, a question, a pronoun…); new tiles slide in
//          { button: [to b, to a], items: [ { label, en: [a, b], a: [tiles], b: [tiles], note } ], legend?: [[colour, label]] }
//          a tile is [key, text, kind]; kind v (blue), n (red), x (amber), p (violet)
//   sort   one card at a time: tap the box it belongs in   { boxes: [ { k, label, sub } ], cards: [ { t, en, box, why } ] }
//   agree  switch masculine / feminine / plural; what changes lights up   { cols: [labels], rows: [ { forms: [per col], en } ] }
//   join   two words slide together into one, or stay apart   { pairs: [ { a, b, res, stay, ex, en } ] }
//   line   a time line: tap a point   { marks: [ { at (-1 … 1, 0 = now), label, fr, en } ] }
//   flip   cards that turn into their other form when tapped   { cards: [ { a, b, en, tag } ] }
//   pairs  two ways to say it side by side; tap one to hear it   { cap: [left, right], rows: [ { l, r, en } ] }
// window.GrammarTools.mount(el, { page, say, done })
(function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PERSONS = ['je', 'tu', 'il / elle', 'nous', 'vous', 'ils / elles'];
const elides = (w) => /^[aeiouéèêëàâîïôûœh]/i.test(w);
const KIND_C = { v: '#0891b2', n: '#e11d48', x: '#d97706', p: '#7c3aed' };

const CSS = `
.gt{display:grid;gap:18px}
.gt-sec{display:grid;gap:10px}
.gt-sec h3{margin:0;font-size:var(--fs-lg);font-weight:900;color:#0f172a}.gt-sec h3 small{display:block;font-size:var(--fs-sm);font-weight:600;color:#64748b;margin-top:2px}
.gt-chips{display:flex;flex-wrap:wrap;gap:6px}
.gt-w{border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:6px 12px;min-height:44px;font:inherit;font-size:var(--fs-base);font-weight:800;color:#0f172a;cursor:pointer}
.gt-w.sm{font-size:var(--fs-sm);min-height:40px;padding:4px 10px}
.gt-w[aria-pressed="true"]{background:#4f46e5;border-color:#4f46e5;color:#fff}
.gt-w.red[aria-pressed="true"]{background:#e11d48;border-color:#e11d48}
.gt-box{border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;padding:14px 12px;display:grid;gap:10px}
.gt-big{font-size:var(--fs-2xl);font-weight:900;color:#0f172a;line-height:1.25}
.gt-end{color:#e11d48}.gt-mute{color:#94a3b8;text-decoration:underline dotted;text-underline-offset:4px}
.gt-en{font-size:var(--fs-base);color:#475569}
.gt-note{font-size:var(--fs-base);color:#1e293b}
.gt-grid6{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}@media(max-width:520px){.gt-grid6{grid-template-columns:repeat(2,minmax(0,1fr))}}
.gt-cell{border:1px solid #e2e8f0;background:#fff;border-radius:10px;padding:6px 8px;font:inherit;font-size:var(--fs-base);text-align:left;cursor:pointer;min-height:44px;color:#334155}
.gt-cell[aria-pressed="true"]{border-color:#4f46e5;box-shadow:0 0 0 2px #c7d2fe}
.gt-line{display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-height:60px}
.gt-t{display:inline-flex;align-items:center;justify-content:center;height:50px;padding:0 12px;border-radius:12px;background:#fff;border:2px solid #cbd5e1;font-size:var(--fs-xl);font-weight:900;color:#0f172a;white-space:nowrap}
.gt-t.v{border-color:#0891b2;background:#ecfeff;color:#155e75}.gt-t.n{border-color:#e11d48;background:#e11d48;color:#fff}
.gt-t.x{border-color:#d97706;background:#fffbeb;color:#92400e}.gt-t.p{border-color:#7c3aed;background:#f5f3ff;color:#5b21b6}
.gt-t.in{animation:gt-in .55s cubic-bezier(.3,1.4,.5,1)}
@keyframes gt-in{0%{transform:translateY(-24px) scale(.4);opacity:0}100%{transform:none;opacity:1}}
.gt-key{display:flex;flex-wrap:wrap;gap:10px;font-size:var(--fs-sm);color:#475569}
.gt-key span::before{content:'';display:inline-block;width:12px;height:12px;border-radius:4px;margin-right:4px;vertical-align:-1px;background:var(--c)}
.gt-boxes{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:8px}@media(max-width:560px){.gt-boxes{grid-template-columns:1fr}}
.gt-bin{border:2px dashed #cbd5e1;border-radius:14px;background:#fff;padding:8px;display:grid;gap:4px;align-content:start;min-height:96px;font:inherit;text-align:left;cursor:pointer}
.gt-bin b{font-size:var(--fs-base);color:#0f172a}.gt-bin small{font-size:var(--fs-xs);color:#64748b}
.gt-bin.no{border-color:#e11d48;background:#fff1f2}.gt-bin.ok{border-color:#059669;background:#ecfdf5}
.gt-in{font-size:var(--fs-sm);color:#065f46;background:#ecfdf5;border-radius:8px;padding:3px 6px}
.gt-card{border:2px solid #4f46e5;background:#eef2ff;border-radius:14px;padding:12px;font-size:var(--fs-xl);font-weight:900;color:#1e1b4b;text-align:center}
.gt-card small{display:block;font-size:var(--fs-sm);font-weight:400;color:#475569;margin-top:2px}
.gt-fb{font-size:var(--fs-base);border-radius:10px;padding:8px 10px}
.gt-fb.ok{color:#065f46;background:#ecfdf5;border:1px solid #a7f3d0}.gt-fb.no{color:#1e293b;background:#fffbeb;border:1px solid #fde68a}
.gt-rows{display:grid;gap:6px}
.gt-row{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px;align-items:baseline;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:8px 12px;font:inherit;text-align:left;cursor:pointer;min-height:44px}
.gt-row b{font-size:var(--fs-xl);font-weight:900;color:#0f172a}.gt-row small{font-size:var(--fs-sm);color:#64748b}
.gt-hl{color:#e11d48}
.gt-stage{position:relative;height:110px;border-radius:16px;background:linear-gradient(#f8fafc,#eef2ff);overflow:hidden;display:flex;align-items:center;justify-content:center;gap:10px}
.gt-jt{display:inline-flex;align-items:center;justify-content:center;min-width:60px;height:54px;padding:0 14px;border-radius:12px;background:#fff;border:2px solid #cbd5e1;font-size:var(--fs-2xl);font-weight:900;color:#0f172a;transition:transform .6s cubic-bezier(.5,0,.3,1.4),opacity .4s}
.gt-jt.res{position:absolute;opacity:0;transform:scale(.4);color:#fff;border:0;background:#4f46e5}
.gt-stage.go .ja{transform:translateX(var(--dx))}.gt-stage.go .jb{transform:translateX(calc(var(--dx) * -1))}
.gt-stage.merge .ja,.gt-stage.merge .jb{opacity:0}.gt-stage.merge .res{opacity:1;transform:scale(1)}
.gt-stage.stay .ja,.gt-stage.stay .jb{animation:gt-bump .5s}@keyframes gt-bump{50%{transform:translateY(-8px)}}
.gt-tl{position:relative;height:132px;margin:0 30px}
.gt-tl .axis{position:absolute;left:-24px;right:-24px;top:96px;height:4px;border-radius:2px;background:#cbd5e1}
.gt-tl .now{position:absolute;top:84px;width:3px;height:28px;background:#0f172a;left:50%;margin-left:-1px}
.gt-tl .nowl{position:absolute;top:114px;left:50%;transform:translateX(-50%);font-size:var(--fs-xs);font-weight:800;color:#0f172a}
.gt-mk{position:absolute;top:0;left:var(--x);transform:translateX(-50%);border:1px solid #e2e8f0;background:#fff;border-radius:10px;padding:4px 8px;font:inherit;font-size:var(--fs-sm);font-weight:800;color:#0f172a;cursor:pointer;min-height:40px;white-space:nowrap}
.gt-mk.r1{top:44px}
.gt-mk::after{content:'';position:absolute;left:50%;top:100%;width:2px;height:56px;background:#94a3b8}.gt-mk.r1::after{height:12px}.gt-mk.r2::after{height:56px}
.gt-mk.el{transform:translateX(-14px)}.gt-mk.el::after{left:13px}.gt-mk.er{transform:translateX(calc(-100% + 14px))}.gt-mk.er::after{left:auto;right:13px}
@media(max-width:640px){.gt-tl{height:auto;display:flex;flex-direction:column;gap:6px;margin:0;padding:4px 0 4px 16px;border-left:3px solid #cbd5e1}.gt-tl .axis,.gt-tl .now,.gt-tl .nowl,.gt-mk::after{display:none}.gt-mk{position:static;transform:none!important;align-self:flex-start}}   /* phones: the time line runs down the page, past to future */
.gt-mk[aria-pressed="true"]{background:#4f46e5;border-color:#4f46e5;color:#fff}
.gt-flips{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}@media(max-width:640px){.gt-flips{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:400px){.gt-flips{grid-template-columns:1fr}}
.gt-flip{border:2px solid #c7d2fe;background:#eef2ff;border-radius:14px;padding:10px;min-height:84px;text-align:left;font:inherit;cursor:pointer;display:grid;gap:4px;align-content:start}
.gt-flip b{font-size:var(--fs-lg);color:#312e81}.gt-flip small{font-size:var(--fs-sm);color:#475569}
.gt-flip .tag{justify-self:start;font-size:var(--fs-xs);font-weight:800;border-radius:999px;padding:1px 8px;background:#fff;color:#334155;border:1px solid #e2e8f0}
.gt-flip.on{border-color:#f9a8d4;background:#fdf2f8}.gt-flip.on b{color:#9d174d}.gt-flip.on .tag{background:#db2777;color:#fff;border-color:#db2777}
.gt-pr{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;align-items:center;border:1px solid #e2e8f0;border-radius:12px;padding:8px 10px;background:#fff}
@media(max-width:520px){.gt-pr{grid-template-columns:1fr}}
.gt-pr button{font:inherit;text-align:left;border:0;background:none;cursor:pointer;padding:4px;min-height:40px;font-size:var(--fs-lg);font-weight:800;color:#0f172a}
.gt-pr button small{display:block;font-size:var(--fs-xs);font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#64748b}
@media (prefers-reduced-motion:reduce){.gt-t.in,.gt-stage.stay .ja,.gt-stage.stay .jb{animation:none}.gt-jt{transition:none}}`;

// ---------- the tools: each draws into box and wires itself; say(t) speaks only on a tap ----------
const TOOLS = {
    conj(box, st, say) {
        let vi = 0, pi = 0, neg = false;
        box.innerHTML = `${st.verbs.length > 1 ? `<div class="gt-chips" role="group" aria-label="Verbs">${st.verbs.map((v, i) => `<button type="button" class="gt-w" data-v="${i}" aria-pressed="${i === 0}">${esc(v.inf)}<span style="font-weight:500;color:inherit;opacity:.7"> · ${esc(v.en)}</span></button>`).join('')}</div>` : ''}
            <div class="gt-box"><div class="gt-big" aria-live="polite"></div><div class="gt-en"></div>
            <div class="gt-grid6" role="group" aria-label="Person">${PERSONS.map((p, i) => `<button type="button" class="gt-cell" data-p="${i}" aria-pressed="${i === 0}"></button>`).join('')}</div>
            ${st.neg ? '<div class="gt-chips"><button type="button" class="gt-w sm red" data-neg aria-pressed="false">ne … pas</button></div>' : ''}
            ${st.verbs.some(v => v.stem !== undefined) ? `<div class="gt-key"><span style="--c:#e11d48">the ending</span>${st.verbs.some(v => v.silent) ? '<span style="--c:#94a3b8">written, not heard</span>' : ''}</div>` : ''}</div>`;
        const subj = (i, form) => i === 0 && elides(form) && !neg ? 'j\'' : PERSONS[i].split(' / ')[0] + ' ';
        const ending = (v, f, i) => {
            if (v.stem === undefined) return esc(f);   // être, avoir, aller…: learnt as whole words, nothing to mark
            const st0 = v.stem && f.startsWith(v.stem) ? v.stem : '';
            const end = f.slice(st0.length);
            const mute = v.silent && v.silent[i];
            return `${esc(st0)}<span class="${mute ? 'gt-mute' : 'gt-end'}">${esc(end)}</span>`;
        };
        const draw = (speak) => {
            const v = st.verbs[vi], f = v.forms[pi];
            const s = subj(pi, f), ne = neg ? (elides(f) ? 'n\'' : 'ne ') : '';
            // pre: a lead-in such as « Il faut que »: que + il → qu'il, que + j' stays que j'
            const lead = st.pre ? (/que$/.test(st.pre) && /^[aeiouéèêh]/i.test(s) && s !== 'j\'' ? st.pre.slice(0, -1) + '\'' : st.pre + ' ') : '';
            const sCap = lead ? lead + s : s.charAt(0).toUpperCase() + s.slice(1);
            // pasAt: in a compound form (ai mangé), pas goes after that many words: n'ai pas mangé
            const at = Array.isArray(v.pasAt) ? v.pasAt[pi] : v.pasAt;   // a number, or one per person (nous nous étions | levés)
            const cut = neg && at ? f.split(' ') : null, fa = cut ? cut.slice(0, at).join(' ') : f, fb = cut ? cut.slice(at).join(' ') : '';
            box.querySelector('.gt-big').innerHTML = `${esc(sCap)}${neg ? `<span class="gt-end">${esc(ne)}</span>` : ''}${cut ? esc(fa) : ending(v, f, pi)}${neg ? ' <span class="gt-end">pas</span>' : ''}${fb ? ' ' + esc(fb) : ''}${v.tail ? ' ' + esc(v.tail) : ''}.`;
            box.querySelector('.gt-en').innerHTML = v.mute && v.silent ? '' : (v.silent && v.silent[pi] ? 'The grey ending is written but not heard.' : '');
            box.querySelectorAll('[data-p]').forEach((b, i) => { const ff = v.forms[i]; b.innerHTML = i === 0 && elides(ff) ? `j'<b>${ending(v, ff, i)}</b>` : `${esc(PERSONS[i])} <b>${ending(v, ff, i)}</b>`; });
            if (speak) say(`${sCap}${ne}${fa}${neg ? ' pas' : ''}${fb ? ' ' + fb : ''}${v.tail ? ' ' + v.tail : ''}.`);
        };
        box.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => { vi = Number(b.dataset.v); box.querySelectorAll('[data-v]').forEach(o => o.setAttribute('aria-pressed', o === b)); draw(true); }));
        box.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => { pi = Number(b.dataset.p); box.querySelectorAll('[data-p]').forEach(o => o.setAttribute('aria-pressed', o === b)); draw(true); }));
        box.querySelector('[data-neg]')?.addEventListener('click', (e) => { neg = !neg; e.currentTarget.setAttribute('aria-pressed', neg); draw(true); });
        draw(false);
    },
    swap(box, st, say) {
        let si = 0, on = false, shown = new Set();
        box.innerHTML = `<div class="gt-chips" role="group" aria-label="Sentences">${st.items.map((s, i) => `<button type="button" class="gt-w" data-s="${i}" aria-pressed="${i === 0}">${esc(s.label)}</button>`).join('')}</div>
            <div class="gt-box"><div class="gt-line" aria-live="polite"></div><div class="gt-en"></div>
            <div class="gt-chips"><button type="button" class="gt-w red" data-sw aria-pressed="false"></button></div><div class="gt-note"></div>
            ${st.legend ? `<div class="gt-key" aria-hidden="true">${st.legend.map(([k, l]) => `<span style="--c:${KIND_C[k] || k}">${esc(l)}</span>`).join('')}</div>` : ''}</div>`;
        const draw = (speak) => {
            const S = st.items[si], tiles = on ? S.b : S.a, was = shown;
            shown = new Set(tiles.map(t => t[0]));
            box.querySelector('.gt-line').innerHTML = tiles.map(([k, txt, kind]) => `<span class="gt-t ${kind || ''}${was.size && !was.has(k) ? ' in' : ''}">${esc(txt)}</span>`).join('');
            box.querySelector('.gt-en').textContent = S.en[on ? 1 : 0];
            box.querySelector('.gt-note').innerHTML = on ? (S.note || '') : '';
            const b = box.querySelector('[data-sw]'); b.textContent = st.button[on ? 1 : 0]; b.setAttribute('aria-pressed', on);
            if (speak) say(tiles.map(t => t[1]).join(' ').replace(/' /g, '\'').replace(/ ([.?!,])/g, '$1').replace(/- /g, '-'));
        };
        box.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { si = Number(b.dataset.s); on = false; shown = new Set(); box.querySelectorAll('[data-s]').forEach(o => o.setAttribute('aria-pressed', o === b)); draw(true); }));
        box.querySelector('[data-sw]').addEventListener('click', () => { on = !on; draw(true); });
        draw(false);
    },
    sort(box, st, say) {
        let order = st.cards.map((c, i) => i), ci = 0, tries = 0, right = 0;
        const placed = {};
        st.boxes.forEach(b => { placed[b.k] = []; });
        const draw = () => {
            const c = st.cards[order[ci]];
            box.innerHTML = `${c ? `<div class="gt-card" aria-live="polite">${esc(c.t)}${c.en ? `<small>${esc(c.en)}</small>` : ''}</div><p class="gt-en" style="margin:0">Which box? (${ci + 1} / ${st.cards.length})</p>`
                : `<div class="gt-fb ok">All sorted: ${right} / ${st.cards.length} right first time. <button type="button" class="gt-w sm" data-again>Again</button></div>`}
                <div class="gt-boxes" style="--n:${st.boxes.length}">${st.boxes.map(b => `<button type="button" class="gt-bin" data-b="${esc(b.k)}"${c ? '' : ' disabled'}><b>${esc(b.label)}</b>${b.sub ? `<small>${esc(b.sub)}</small>` : ''}${placed[b.k].map(t => `<span class="gt-in">${esc(t)}</span>`).join('')}</button>`).join('')}</div><div class="gt-fbx"></div>`;
            box.querySelector('[data-again]')?.addEventListener('click', () => { ci = 0; right = 0; st.boxes.forEach(b => { placed[b.k] = []; }); order = order.sort(() => Math.random() - .5); draw(); });
            box.querySelectorAll('[data-b]').forEach(bin => bin.addEventListener('click', () => {
                if (!c) return;
                if (bin.dataset.b === c.box) {
                    if (!tries) right++;
                    placed[c.box].push(c.t); say(c.say || c.t);
                    const why = c.why;
                    ci++; tries = 0; draw();
                    if (why) box.querySelector('.gt-fbx').innerHTML = `<div class="gt-fb ok">« ${esc(c.t)} »: ${why}</div>`;
                } else {
                    tries++; bin.classList.add('no');
                    box.querySelector('.gt-fbx').innerHTML = `<div class="gt-fb no">Not that box. ${c.hint || 'Look again at the rule above.'}</div>`;
                }
            }));
        };
        draw();
    },
    agree(box, st, say) {
        let ci = 0;
        const words = (t) => t.split(' ');
        const hl = (form, base) => {   // the letters that differ from the first column, word by word
            const a = words(form), b = words(base);
            return a.map((w, i) => { const o = b[i] || ''; let k = 0; while (k < w.length && k < o.length && w[k] === o[k]) k++; return k === w.length && w.length === o.length ? esc(w) : `${esc(w.slice(0, k))}<span class="gt-hl">${esc(w.slice(k))}</span>`; }).join(' ');
        };
        box.innerHTML = `<div class="gt-chips" role="group" aria-label="Form">${st.cols.map((c, i) => `<button type="button" class="gt-w" data-c="${i}" aria-pressed="${i === 0}">${esc(c)}</button>`).join('')}</div><div class="gt-rows" aria-live="polite"></div>`;
        const draw = (speak) => {
            box.querySelector('.gt-rows').innerHTML = st.rows.map((r, i) => `<button type="button" class="gt-row" data-r="${i}"><b>${st.pre ? `<span style="font-weight:600;color:#64748b">${esc(st.pre[ci])}</span> ` : ''}${ci ? hl(r.forms[ci], r.forms[0]) : esc(r.forms[0])}</b>${r.en ? `<small>${esc(Array.isArray(r.en) ? r.en[ci] : r.en)}</small>` : ''}</button>`).join('');
            box.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => say((st.pre ? st.pre[ci] + ' ' : '') + st.rows[Number(b.dataset.r)].forms[ci])));
            if (speak) say((st.pre ? st.pre[ci] + ' ' : '') + st.rows[0].forms[ci]);   // pre: a grey word before each form (il, elle…), same for every row
        };
        box.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => { ci = Number(b.dataset.c); box.querySelectorAll('[data-c]').forEach(o => o.setAttribute('aria-pressed', o === b)); draw(true); }));
        draw(false);
    },
    join(box, st, say) {
        box.innerHTML = `<div class="gt-chips" role="group" aria-label="Pairs">${st.pairs.map((p, i) => `<button type="button" class="gt-w" data-j="${i}" aria-pressed="false">${esc(p.a)} + ${esc(p.b)}</button>`).join('')}</div>
            <div class="gt-stage" aria-hidden="true"></div><div class="gt-box" aria-live="polite"><div class="gt-note">${esc(st.empty || 'Tap a pair to see what happens.')}</div></div>`;
        let timer = 0;
        box.querySelectorAll('[data-j]').forEach(btn => btn.addEventListener('click', () => {
            const p = st.pairs[Number(btn.dataset.j)];
            box.querySelectorAll('[data-j]').forEach(o => o.setAttribute('aria-pressed', o === btn));
            const stage = box.querySelector('.gt-stage');
            stage.className = 'gt-stage';
            stage.innerHTML = `<span class="gt-jt ja">${esc(p.a)}</span><span class="gt-jt jb">${esc(p.b)}</span><span class="gt-jt res">${esc(p.res)}</span>`;
            const ra = stage.querySelector('.ja').getBoundingClientRect(), rb = stage.querySelector('.jb').getBoundingClientRect(), rs = stage.getBoundingClientRect();
            stage.style.setProperty('--dx', Math.max(0, (rb.left - ra.right) / 2 + 6) + 'px');
            const res = stage.querySelector('.res'); res.style.left = ((ra.left + rb.right) / 2 - rs.left - 40) + 'px'; res.style.minWidth = '80px';
            clearTimeout(timer);
            requestAnimationFrame(() => {
                if (p.stay) { stage.classList.add('stay'); say(p.res); }
                else { stage.classList.add('go'); timer = setTimeout(() => { stage.classList.add('merge'); say(p.res); }, 650); }
            });
            box.querySelector('.gt-box').innerHTML = `<div class="gt-big">${esc(p.a)} + ${esc(p.b)} = <span class="gt-end">${esc(p.res)}</span>${p.stay ? ' <span class="gt-en">(no change)</span>' : ''}</div>${p.ex ? `<div class="gt-note"><b>${esc(p.ex)}</b> ${p.en ? `<span class="gt-en">${esc(p.en)}</span>` : ''}</div>` : ''}`;
            if (p.ex) setTimeout(() => say(p.ex), p.stay ? 900 : 1400);
        }));
    },
    line(box, st, say) {
        box.innerHTML = `<div class="gt-tl"><div class="axis"></div><div class="now"></div>${st.now === '' ? '' : `<div class="nowl">${esc(st.now || 'maintenant')}</div>`}${st.marks.map((m, i) => { const x = 50 + m.at * 50; return `<button type="button" class="gt-mk r${i % 3}${x < 18 ? ' el' : x > 82 ? ' er' : ''}" data-m="${i}" aria-pressed="false" style="--x:${x}%">${esc(m.label)}</button>`; }).join('')}</div>
            <div class="gt-box" aria-live="polite"><div class="gt-note">${esc(st.empty || 'Tap a point on the line.')}</div></div>`;
        box.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => {
            const m = st.marks[Number(b.dataset.m)];
            box.querySelectorAll('[data-m]').forEach(o => o.setAttribute('aria-pressed', o === b));
            box.querySelector('.gt-box').innerHTML = `<div class="gt-big">${m.html || esc(m.fr)}</div>${m.en ? `<div class="gt-en">${esc(m.en)}</div>` : ''}${m.note ? `<div class="gt-note">${m.note}</div>` : ''}`;
            say(m.fr);
        }));
    },
    flip(box, st, say) {
        box.innerHTML = `<div class="gt-flips">${st.cards.map((c, i) => `<button type="button" class="gt-flip" data-f="${i}" aria-pressed="false"><b>${esc(c.a)}</b>${c.en ? `<small>${esc(c.en)}</small>` : ''}${c.tag ? `<span class="tag">${esc(c.tag)}</span>` : ''}</button>`).join('')}</div>`;
        box.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => {
            const c = st.cards[Number(b.dataset.f)], on = !b.classList.contains('on');
            b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
            b.querySelector('b').textContent = on ? c.b : c.a;
            say(on ? c.b : c.a);
        }));
    },
    pairs(box, st) {
        // the buttons carry data-say: the lesson page speaks them when tapped
        box.innerHTML = `<div class="gt-rows">${st.rows.map(r => `<div class="gt-pr"><button type="button" data-say="${esc(r.l)}"><small>${esc(st.cap[0])}</small>${esc(r.l)}</button><button type="button" data-say="${esc(r.r)}"><small>${esc(st.cap[1])}${r.en ? ' · ' + esc(r.en) : ''}</small>${esc(r.r)}</button></div>`).join('')}</div>`;
    },
};

function mount(root, { page, say, done }) {
    if (!document.getElementById('gt-css')) { const s = document.createElement('style'); s.id = 'gt-css'; s.textContent = CSS; document.head.appendChild(s); }
    const steps = page.steps || [];
    root.innerHTML = `<div class="gt">${steps.map((st, i) => `<section class="gt-sec"><h3>${i + 1} · ${esc(st.title)}${st.sub ? ` <small>${st.sub}</small>` : ''}</h3><div data-tool="${i}"></div></section>`).join('')}
        ${page.practice ? `<section class="gt-sec"><h3>${steps.length + 1} · Practise <small>From easy to harder. A wrong answer gets a hint and another try.</small></h3><div data-practice></div></section>` : ''}</div>`;
    steps.forEach((st, i) => { const box = root.querySelector(`[data-tool="${i}"]`); try { TOOLS[st.tool](box, st, say); } catch (e) { box.innerHTML = `<p class="gt-en">This part could not be drawn.</p>`; console.error(e); } });
    if (page.practice) window.GrammarPractice.mount(root.querySelector('[data-practice]'), { items: page.practice, say, done });
}
window.GrammarTools = { mount, TOOLS };
})();
