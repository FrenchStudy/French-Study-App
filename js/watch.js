// watch.js - "Watch" mode in Vocab: a hands-free slideshow of the words, like a short video.
// For each word: the picture and the French word (spoken twice), then the English (spoken too,
// unless turned off), then the example sentence (spoken). Then the next word.
//   WatchMode.open(words, { start, title, story })   words: [{ key, fr, en, gender, exFr, exEn }]
//   story (optional): [[French, English], …], read sentence by sentence after the words
(function () {
const CSS = `
.wm{position:fixed;inset:0;z-index:70;background:#0f172a;color:#f8fafc;display:flex;flex-direction:column;
  padding:calc(env(safe-area-inset-top,0px) + 12px) max(16px,env(safe-area-inset-right,0px)) calc(env(safe-area-inset-bottom,0px) + 12px) max(16px,env(safe-area-inset-left,0px))}
.wm-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
.wm-title{font-weight:800;font-size:14px;color:#cbd5e1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wm-x{font-weight:800;font-size:15px;border:1px solid #334155;background:#1e293b;color:#f8fafc;border-radius:12px;min-height:44px;padding:0 16px;cursor:pointer}
.wm-bar{height:6px;background:#1e293b;border-radius:99px;overflow:hidden;margin-top:10px}
.wm-bar>div{height:100%;background:#818cf8;width:0;transition:width .3s}
.wm-stage{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px;min-height:0;padding:12px 0}
.wm-pic{font-size:clamp(72px,18vw,140px);line-height:1;min-height:1em}
.wm-fr{font-size:clamp(34px,7vw,64px);font-weight:900;line-height:1.1;overflow-wrap:anywhere}
.wm-fr.m{color:#7dd3fc}.wm-fr.f{color:#fda4af}
.wm-en{font-size:clamp(20px,4vw,30px);font-weight:700;color:#6ee7b7;min-height:1.3em;transition:opacity .25s}
.wm-ex{max-width:44rem;font-size:clamp(16px,2.6vw,22px);color:#e2e8f0;min-height:3em;transition:opacity .25s}
.wm-ex i{display:block;font-style:italic}
.wm-ex span{display:block;color:#94a3b8;font-size:.85em;margin-top:4px}
.wm-hide{opacity:0}
.wm-story{font-size:clamp(24px,4.6vw,40px);font-weight:800;line-height:1.25;max-width:44rem}
.wm-ctl{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px}
.wm-ctl button{font-weight:800;font-size:16px;border:1px solid #334155;background:#1e293b;color:#f8fafc;border-radius:14px;min-height:52px;min-width:56px;padding:0 16px;cursor:pointer}
.wm-ctl .wm-play{background:#6366f1;border-color:#6366f1;min-width:120px}
.wm-ctl button[aria-pressed="true"]{background:#312e81;border-color:#818cf8}
.wm-ctl button:focus-visible,.wm-x:focus-visible{outline:3px solid #a5b4fc;outline-offset:2px}
.wm-count{font-size:13px;color:#94a3b8;text-align:center;margin-top:6px;font-variant-numeric:tabular-nums}
@media (prefers-reduced-motion:reduce){.wm-en,.wm-ex,.wm-bar>div{transition:none}}
`;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
                set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } } };

function voiceFor(lang) {
    const vs = (window.speechSynthesis && speechSynthesis.getVoices) ? speechSynthesis.getVoices() : [];
    const base = lang.slice(0, 2);
    return vs.find(v => v.lang === lang) || vs.find(v => (v.lang || '').startsWith(base)) || null;
}
// speak and wait until it has been said (or a safe time has passed)
function speak(text, lang, rate, run) {
    return new Promise(resolve => {
        if (!text) return resolve();
        const fallback = 700 + String(text).length * 70 / rate;
        if (!('speechSynthesis' in window)) return setTimeout(resolve, fallback);
        let done = false;
        const finish = () => { if (!done) { done = true; resolve(); } };
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang; u.rate = rate;
        const v = voiceFor(lang); if (v) u.voice = v;
        u.onend = finish; u.onerror = finish;
        run.cancel = () => { finish(); };
        speechSynthesis.speak(u);
        setTimeout(finish, fallback * 2 + 3000);   // some browsers never fire onend
    });
}
const wait = (ms, run) => new Promise(r => { const t = setTimeout(r, ms); run.cancel = () => { clearTimeout(t); r(); }; });

function open(words, opts = {}) {
    words = (words || []).filter(w => w && w.fr);
    if (!words.length) return;
    if (!document.getElementById('wm-css')) { const s = document.createElement('style'); s.id = 'wm-css'; s.textContent = CSS; document.head.appendChild(s); }
    const settings = Object.assign({ slow: false, english: true, examples: true }, store.get('watch_settings', {}));
    let i = Math.max(0, Math.min(words.length - 1, opts.start || 0)), playing = true, run = { id: 0 }, lock = null;
    const before = document.activeElement;

    const el = document.createElement('div');
    el.className = 'wm'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Watch the words');
    el.innerHTML = `
        <div class="wm-top"><div class="wm-title">▶ Watch · ${esc(opts.title || 'Words')}</div><button type="button" class="wm-x" data-a="close">✕ Close</button></div>
        <div class="wm-bar"><div></div></div>
        <div class="wm-stage" aria-live="polite">
            <div class="wm-pic" aria-hidden="true"></div>
            <div class="wm-fr"></div>
            <div class="wm-en"></div>
            <div class="wm-ex"></div>
        </div>
        <div class="wm-ctl">
            <button type="button" data-a="prev" aria-label="Previous word">⏮</button>
            <button type="button" class="wm-play" data-a="play">⏸ Pause</button>
            <button type="button" data-a="next" aria-label="Next word">⏭</button>
            <button type="button" data-a="slow" aria-pressed="${settings.slow}">🐢 Slow</button>
            <button type="button" data-a="english" aria-pressed="${settings.english}">🇬🇧 English voice</button>
            ${words.some(w => w.exFr) ? `<button type="button" data-a="examples" aria-pressed="${settings.examples}">💬 Examples</button>` : ''}
        </div>
        <div class="wm-count"></div>`;
    document.body.appendChild(el);
    document.documentElement.style.overflow = 'hidden';
    const q = (s) => el.querySelector(s);
    try { navigator.wakeLock && navigator.wakeLock.request('screen').then(l => { lock = l; }).catch(() => {}); } catch (e) { /* not allowed */ }

    function show(w, phase) {
        q('.wm-pic').textContent = (window.WordMemory && WordMemory.picture(w)) || '';
        const fr = q('.wm-fr'); fr.textContent = w.fr; fr.className = 'wm-fr ' + (w.gender === 'm' ? 'm' : w.gender === 'f' ? 'f' : '');
        q('.wm-en').textContent = w.en || '';
        q('.wm-en').classList.toggle('wm-hide', phase < 1);
        const ex = settings.examples && w.exFr;
        q('.wm-ex').innerHTML = ex ? `<i>${esc(w.exFr)}</i><span>${esc(w.exEn || '')}</span>` : '';
        q('.wm-ex').classList.toggle('wm-hide', phase < 2);
        q('.wm-bar>div').style.width = ((i + (phase >= 2 ? 1 : 0.5)) / words.length * 100) + '%';
        q('.wm-count').textContent = `${i + 1} / ${words.length}`;
    }
    async function playFrom(start) {
        const my = ++run.id;
        const alive = () => run.id === my && playing && document.body.contains(el);
        for (i = start; i < words.length; i++) {
            const w = words[i], rate = settings.slow ? 0.7 : 0.95;
            show(w, 0);
            await speak(w.fr, 'fr-FR', rate, run); if (!alive()) return;
            await wait(450, run); if (!alive()) return;
            await speak(w.fr, 'fr-FR', rate * 0.9, run); if (!alive()) return;
            show(w, 1);
            if (settings.english && w.en) { await wait(250, run); if (!alive()) return; await speak(w.en, 'en-GB', 1, run); if (!alive()) return; }
            else { await wait(1100, run); if (!alive()) return; }
            show(w, 2);
            if (settings.examples && w.exFr) { await wait(300, run); if (!alive()) return; await speak(w.exFr, 'fr-FR', rate, run); if (!alive()) return; }
            await wait(settings.slow ? 1400 : 900, run); if (!alive()) return;
        }
        if (opts.story && opts.story.length) {
            const rate = settings.slow ? 0.7 : 0.9;
            for (let n = 0; n < opts.story.length; n++) {
                const [fr, en] = opts.story[n];
                q('.wm-pic').textContent = '📖';
                const el2 = q('.wm-fr'); el2.textContent = fr; el2.className = 'wm-fr wm-story';
                q('.wm-en').textContent = en; q('.wm-en').classList.add('wm-hide');
                q('.wm-ex').innerHTML = ''; q('.wm-ex').classList.add('wm-hide');
                q('.wm-count').textContent = `Story · ${n + 1} / ${opts.story.length}`;
                await speak(fr, 'fr-FR', rate, run); if (!alive()) return;
                q('.wm-en').classList.remove('wm-hide');
                await wait(settings.slow ? 2600 : 1800, run); if (!alive()) return;
            }
        }
        i = words.length - 1;
        playing = false; setPlayBtn();
        q('.wm-count').textContent = `All ${words.length} words done. ⏮ to watch again.`;
    }
    function stopSpeech() { run.id++; try { speechSynthesis.cancel(); } catch (e) {} if (run.cancel) run.cancel(); }
    function setPlayBtn() { q('[data-a="play"]').textContent = playing ? '⏸ Pause' : '▶ Play'; }
    function go(n) { stopSpeech(); i = Math.max(0, Math.min(words.length - 1, n)); if (playing) playFrom(i); else show(words[i], 2); }
    function toggle() {
        playing = !playing; setPlayBtn();
        if (playing) playFrom(i >= words.length - 1 && q('.wm-count').textContent.startsWith('All') ? 0 : i);
        else { stopSpeech(); show(words[i], 2); }
    }
    function close() {
        stopSpeech(); el.remove(); document.documentElement.style.overflow = '';
        document.removeEventListener('keydown', onKey);
        try { lock && lock.release(); } catch (e) {}
        if (before && before.focus) before.focus();
    }
    function onKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === ' ' && e.target.tagName !== 'BUTTON') { e.preventDefault(); toggle(); }
        else if (e.key === 'ArrowRight') go(i + 1);
        else if (e.key === 'ArrowLeft') go(i - 1);
    }
    document.addEventListener('keydown', onKey);
    el.addEventListener('click', (e) => {
        const a = e.target.closest('[data-a]'); if (!a) return;
        const act = a.dataset.a;
        if (act === 'close') close();
        else if (act === 'play') toggle();
        else if (act === 'next') go(i + 1);
        else if (act === 'prev') go(i - 1);
        else {
            settings[act] = !settings[act]; a.setAttribute('aria-pressed', settings[act]); store.set('watch_settings', settings);
            if (act === 'examples' && !playing) show(words[i], 2);
        }
    });
    q('[data-a="play"]').focus();
    playFrom(i);
    return { close };
}

window.WatchMode = { open };
})();
