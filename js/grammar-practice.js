// grammar-practice.js - the Practise part of an interactive grammar lesson, from easy to harder:
//   Choose  pick the right form from 3 or 4         { q, en, opts, a, hint, say }
//   Build   put the tiles in order; one is a trap   { en, tiles, trap, hint }      (the sentence = the tiles joined)
//   Spot    tap the wrong part, see it fixed        { words, bad, fix, hint, say }
// A wrong answer gets a hint and another try; the score counts the answers right first time.
// window.GrammarPractice.mount(el, { items: { choose, build, spot }, say, done })   done(): « Now type them »
(function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const joinTiles = (t) => t.join(' ').replace(/' /g, "'").replace(/ ([.,!?])$/, '$1');
const KINDS = [['choose', 'Choose'], ['build', 'Build'], ['spot', 'Spot the mistake']];

const CSS = `
.gp{display:grid;gap:10px}
.gp-tabs{display:flex;flex-wrap:wrap;gap:6px}
.gp-tab{border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:8px 14px;min-height:44px;font:inherit;font-size:var(--fs-base);font-weight:800;color:#0f172a;cursor:pointer}
.gp-tab[aria-selected="true"]{background:#4f46e5;border-color:#4f46e5;color:#fff}
.gp-tab .n{font-weight:600;opacity:.75;margin-left:4px;font-size:var(--fs-sm)}
.gp-card{border:1px solid #e2e8f0;border-radius:14px;padding:14px;display:grid;gap:10px;background:#fff}
.gp-top{display:flex;justify-content:space-between;font-size:var(--fs-sm);font-weight:700;color:#475569}
.gp-q{font-size:var(--fs-xl);font-weight:900;color:#0f172a;line-height:1.35}
.gp-q .gap{display:inline-block;min-width:64px;border-bottom:3px solid #4f46e5;text-align:center;color:#4338ca}
.gp-en{font-size:var(--fs-sm);color:#64748b;margin:0}
.gp-opts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}@media(max-width:520px){.gp-opts{grid-template-columns:repeat(2,1fr)}}
.gp-b{border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:8px 14px;min-height:48px;font:inherit;font-size:var(--fs-lg);font-weight:800;color:#0f172a;cursor:pointer}
.gp-b.no{background:#fff1f2;border-color:#e11d48;color:#9f1239}.gp-b.ok{background:#ecfdf5;border-color:#059669;color:#065f46}
.gp-b:disabled{cursor:default}.gp-b.used{visibility:hidden}
.gp-act{border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:8px 14px;min-height:44px;font:inherit;font-size:var(--fs-base);font-weight:800;color:#0f172a;cursor:pointer}
.gp-act.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.gp-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.gp-line{min-height:58px;border:2px dashed #cbd5e1;border-radius:12px;padding:6px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.gp-line:empty::before{content:'Tap the tiles in order';color:#94a3b8;font-size:var(--fs-sm);padding:0 8px}
.gp-hint{font-size:var(--fs-base);color:#1e293b;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:8px 10px}
.gp-ok{font-size:var(--fs-base);color:#065f46;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:8px 10px}
.gp-ok b,.gp-hint b{font-weight:800}`;

function mount(root, { items, say, done }) {
    if (!document.getElementById('gp-css')) { const s = document.createElement('style'); s.id = 'gp-css'; s.textContent = CSS; document.head.appendChild(s); }
    const kinds = KINDS.filter(([k]) => (items[k] || []).length);
    root.innerHTML = `<div class="gp"><div class="gp-tabs" role="tablist">${kinds.map(([k, l], i) => `<button type="button" role="tab" class="gp-tab" data-k="${k}" aria-selected="${i === 0}">${i + 1} · ${l}<span class="n">${items[k].length}</span></button>`).join('')}</div><div class="gp-card" aria-live="polite"></div></div>`;
    const card = root.querySelector('.gp-card');
    let kind, set, qi, score, tries;
    const start = (k) => {
        kind = k; set = shuffle(items[k]); qi = 0; score = 0;
        root.querySelectorAll('.gp-tab').forEach(t => t.setAttribute('aria-selected', t.dataset.k === k));
        ask();
    };
    const top = () => `<div class="gp-top"><span>${qi + 1} / ${set.length}</span><span>${score} right first time</span></div>`;
    const box = (html) => { card.querySelector('.gp-fb').innerHTML = html; };
    function right(it, sentence) {
        if (!tries) score++;
        if (sentence) say(sentence);
        const last = qi + 1 >= set.length;
        box(`<div class="gp-ok">${tries ? 'Yes, that\'s it.' : 'Right first time!'}${it.hint ? ' ' + it.hint : ''}</div>
            <div class="gp-row" style="margin-top:8px"><button type="button" class="gp-act pri" data-next>${last ? 'See my score' : 'Next →'}</button></div>`);
        const nx = card.querySelector('[data-next]');
        nx.addEventListener('click', () => { qi++; if (qi >= set.length) finish(); else ask(); });
        nx.focus({ preventScroll: true });
    }
    const wrong = (html) => { tries++; box(`<div class="gp-hint">${html}</div>`); };
    function finish() {
        const i = kinds.findIndex(([k]) => k === kind), next = kinds[i + 1];
        card.innerHTML = `<div class="gp-q">${score} / ${set.length} right first time</div>
            <p class="gp-en">${score === set.length ? 'Parfait !' : 'Try again for a new order, or go on.'}</p>
            <div class="gp-row"><button type="button" class="gp-act" data-again>Again</button>
            ${next ? `<button type="button" class="gp-act pri" data-on>Next: ${next[1]} →</button>` : (done ? '<button type="button" class="gp-act pri" data-type>Now type them ↓</button>' : '')}</div>`;
        card.querySelector('[data-again]').addEventListener('click', () => start(kind));
        card.querySelector('[data-on]')?.addEventListener('click', () => start(next[0]));
        card.querySelector('[data-type]')?.addEventListener('click', () => done());
    }
    function ask() {
        tries = 0;
        const it = set[qi];
        if (kind === 'choose') {
            const [before, after] = it.q.split('___');
            card.innerHTML = `${top()}<div class="gp-q">${esc(before)}<span class="gap">___</span>${esc(after || '')}</div>${it.en ? `<p class="gp-en">${esc(it.en)}</p>` : ''}
                <div class="gp-opts">${shuffle(it.opts).map(o => `<button type="button" class="gp-b" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="gp-fb"></div>`;
            card.querySelectorAll('.gp-opts .gp-b').forEach(b => b.addEventListener('click', () => {
                if (card.querySelector('.gp-opts .ok')) return;
                if (b.dataset.o === it.a) { b.classList.add('ok'); card.querySelector('.gap').textContent = it.a; right(it, it.say || joinTiles([before.trim(), it.a, (after || '').trim()])); return; }
                b.classList.add('no'); b.disabled = true;
                wrong(`Not « ${esc(b.dataset.o)} ». ${it.why || it.hint || ''}`);
            }));
            return;
        }
        if (kind === 'build') {
            const all = it.tiles.concat(it.trap ? [it.trap] : []);
            card.innerHTML = `${top()}<p class="gp-q" style="font-size:var(--fs-lg)">${esc(it.en)}</p><p class="gp-en">Build it in French.${it.trap ? ' One tile is a trap.' : ''}</p>
                <div class="gp-line"></div><div class="gp-row gp-bank">${shuffle(all.map((t, i) => ({ t, i }))).map(b => `<button type="button" class="gp-b" data-i="${b.i}">${esc(b.t)}</button>`).join('')}</div>
                <div class="gp-row"><button type="button" class="gp-act pri" data-check>Check</button><button type="button" class="gp-act" data-clear>Start again</button></div><div class="gp-fb"></div>`;
            const line = card.querySelector('.gp-line');
            let placed = [], over = false;
            const draw = () => { line.innerHTML = placed.map((i, k) => `<button type="button" class="gp-b" data-k="${k}">${esc(all[i])}</button>`).join(''); card.querySelectorAll('.gp-bank .gp-b').forEach(b => b.classList.toggle('used', placed.includes(Number(b.dataset.i)))); };
            card.querySelector('.gp-bank').addEventListener('click', (e) => { const b = e.target.closest('.gp-b'); if (!b || over) return; const i = Number(b.dataset.i); if (!placed.includes(i)) { placed.push(i); draw(); } });
            line.addEventListener('click', (e) => { const b = e.target.closest('.gp-b'); if (!b || over) return; placed.splice(Number(b.dataset.k), 1); draw(); });
            card.querySelector('[data-clear]').addEventListener('click', () => { if (!over) { placed = []; draw(); } });
            card.querySelector('[data-check]').addEventListener('click', () => {
                if (over) return;
                const got = placed.map(i => all[i]);
                if (got.join('|') === it.tiles.join('|')) { over = true; line.querySelectorAll('.gp-b').forEach(b => b.classList.add('ok')); right(it, joinTiles(it.tiles)); return; }
                const bad = got.findIndex((t, k) => t !== it.tiles[k]);
                line.querySelectorAll('.gp-b').forEach((b, k) => b.classList.toggle('no', k === bad));
                wrong(`${it.trap && got.includes(it.trap) ? `« ${esc(it.trap)} » is the trap. ` : bad >= 0 ? 'The red tile is not in its place. ' : 'Some tiles are missing. '}${it.why || it.hint || ''}`);
            });
            return;
        }
        // spot the mistake
        card.innerHTML = `${top()}<p class="gp-en">One part of this sentence is wrong. Tap it.</p>
            <div class="gp-row">${it.words.map((w, k) => `<button type="button" class="gp-b" data-k="${k}">${esc(w)}</button>`).join('')}</div><div class="gp-fb"></div>`;
        let over = false;
        card.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => {
            if (over) return;
            if (Number(b.dataset.k) === it.bad) {
                over = true; b.classList.add('ok'); b.textContent = `${it.words[it.bad]} → ${it.fix}`;
                const fixed = it.words.slice(); fixed[it.bad] = it.fix;
                right(it, it.say || joinTiles(fixed)); return;
            }
            b.classList.add('no');
            wrong(`That part is fine. ${it.look || 'Look at the little words.'}`);
        }));
    }
    root.querySelectorAll('.gp-tab').forEach(t => t.addEventListener('click', () => start(t.dataset.k)));
    start(kinds[0][0]);
}
window.GrammarPractice = { mount };
})();
