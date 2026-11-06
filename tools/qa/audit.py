# tools/qa/audit.py - a full check of the app on a phone and a desktop screen, before every pull request.
#   python3 tools/qa/audit.py [--mock FILE] [--out DIR] [--quick] [--workers N]
# The screens are shared out between N browsers that work at the same time (default 4), and each screen waits
# only until the page has finished loading (plus a short pause for animations), so a full check takes minutes.
# Opens every page, every Vocab topic and every step of it (and each tab of the chart tools), and reports:
#   errors       JavaScript errors on the page
#   wide         the page is wider than the screen (sideways scrolling on a phone)
#   tiny         text smaller than 12px (on SVG pictures: the size as drawn on screen)
#   off-scale    text in a size outside the app's scale (12 14 16 18 20 24 30 and the big display sizes)
#   empty        a step that shows nothing
#   inner scroll a box with its own scroll bar inside the page (sideways or up-down), except the page's main scroller and boxes marked data-scroll-ok (the picture pages on a phone: swipe sideways)
#   twice        a word shown twice on the same step (a tool card and a word tile, or two tiles)
#   first screen on a computer, a video (with its controls) does not fit in the first screen
# Needs Python Playwright with Chromium. --mock FILE: a JavaScript file added after config.js that fakes the database:
# topics 31-56 come from the database, so they are checked with it (everything else is checked without it). Writes DIR/report.md, DIR/report.json and a
# screenshot of each problem (DIR defaults to a folder in the system temp directory).
import json, os, subprocess, sys, tempfile, time, argparse
from multiprocessing import Pool
from playwright.sync_api import sync_playwright

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ap = argparse.ArgumentParser()
ap.add_argument('--mock'); ap.add_argument('--out'); ap.add_argument('--quick', action='store_true'); ap.add_argument('--port', type=int, default=8977); ap.add_argument('--workers', type=int, default=4)
A = ap.parse_args()
OUT = A.out or os.path.join(tempfile.gettempdir(), 'fs-audit')
os.makedirs(OUT, exist_ok=True)
B = f'http://localhost:{A.port}/'
SCALE = {12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128}

PAGES = ['index.html', 'vocab.html', 'lesson.html', 'conjugations.html', 'reading.html', 'listening.html', 'writing.html', 'speaking.html',
         'translator.html', 'syllabus.html', 'exam.html', 'welcome.html', 'login.html', 'contact.html', 'terms.html', 'privacy.html',
         'lesson.html?i=lheure-prix', 'lesson.html?i=lalphabet', 'lesson.html?g=2', 'lesson.html?g=10', 'lesson.html?g=12', 'lesson.html?g=6']

CHECK = r"""() => {
  const emojiOnly = (t) => !/[\p{L}\p{N}]/u.test(t);
  const out = { tiny: [], off: [], wide: document.documentElement.scrollWidth > innerWidth + 1 || [...document.querySelectorAll('#scroller')].some(m => m.scrollWidth > m.clientWidth + 1), textLen: 0 };
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const t = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    if (t.length < 2 || emojiOnly(t)) continue;
    out.textLen += t.length;
    let px = parseFloat(cs.fontSize);
    const svg = el.closest('svg');
    if (svg && el instanceof SVGElement) { const m = el.getScreenCTM && el.getScreenCTM(); if (m) px = px * Math.hypot(m.a, m.b); }
    const key = (svg ? 'svg ' : '') + Math.round(px * 10) / 10 + ' ' + t.slice(0, 30);
    if (seen.has(key)) continue; seen.add(key);
    if (px < 11.5) out.tiny.push(key);
    else if (!svg && !SCALE.has(Math.round(px))) out.off.push(key);
  }
  out.scroll = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.id === 'scroller' || el.closest('svg') || el.matches('textarea,select,input,[data-scroll-ok]')) continue;
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const sx = /(auto|scroll)/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 2;
    const sy = /(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2;
    if (sx || sy) out.scroll.push((sx ? '↔ ' : '↕ ') + (el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + [...el.classList].slice(0, 2).join('.')));
  }
  out.scroll = [...new Set(out.scroll)];
  const norm = (t) => String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  // a word tile (its French in bold) and a button of the tool on the same page with the same word, or two tiles alike
  const tiles = [...document.querySelectorAll('#learn-body button[data-say]')].filter(e => e.offsetParent).map(e => norm((e.querySelector('.font-bold') || e).textContent));
  const tool = [...document.querySelectorAll('#learn-body [data-place] button')].filter(e => e.offsetParent).map(e => norm((e.querySelector('b') || e).textContent));
  const shown = tiles.concat([...new Set(tool)]);
  out.twice = [...new Set(shown.filter((t, i) => shown.indexOf(t) !== i))];
  const main = document.querySelector('.vp-video,.wv-video');   // a video's controls must be on the first screen; a picture may start there and go on
  if (main && innerWidth >= 1024) { const r = main.getBoundingClientRect(), top = document.querySelector('#scroller'); const off = top ? top.getBoundingClientRect().top : 0; out.below = r.bottom - off - (top ? top.clientHeight : innerHeight) > 4 ? Math.round(r.bottom) : 0; } else out.below = 0;
  return out;
}""".replace('SCALE', 'new Set(' + json.dumps(sorted(SCALE)) + ')')

VIEWS = {'phone': {'width': 375, 'height': 800}, 'desktop': {'width': 1280, 'height': 900}}
MOCK = (open(os.path.join(R, 'config.js'), encoding='utf-8').read() + '\n' + open(A.mock, encoding='utf-8').read()) if A.mock else None

def settle(pg, ms):
    # until the page has stopped loading (at most 4 s), then a short pause for drawing and animations
    try: pg.wait_for_load_state('networkidle', timeout=4000)
    except Exception: pass
    pg.wait_for_timeout(ms)

def open_ctx(b, mode, vname):
    ctx = b.new_context(viewport=VIEWS[vname])
    if mode == 'mock': ctx.route('**/config.js', lambda r: r.fulfill(body=MOCK, content_type='application/javascript'))
    ctx.route(lambda u: not u.startswith(B), lambda r: r.abort())
    return ctx

def topic_ids(b, mode):
    ctx = open_ctx(b, mode, 'desktop'); pg = ctx.new_page()
    pg.goto(B + 'vocab.html'); settle(pg, 600)
    ids = pg.evaluate("() => TOPICS.filter(t => t.n || t.lesson).map(t => t.id)")
    ctx.close(); return ids

def run_jobs(jobs):
    """One browser: a list of (mode, view, kind, target) → the rows of its screens."""
    rows = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        cur, ctx, pg, errs = None, None, None, []
        for mode, vname, kind, target in jobs:
            if cur != (mode, vname):
                if ctx: ctx.close()
                ctx = open_ctx(b, mode, vname); pg = ctx.new_page(); errs = []
                pg.on('pageerror', lambda e, errs=errs: errs.append(str(e)))
                cur = (mode, vname)
            def check(name, wait):
                settle(pg, wait)
                try: r = pg.evaluate(CHECK)
                except Exception as e: r = {'tiny': [], 'off': [], 'wide': False, 'textLen': 1, 'fail': str(e)}
                row = {'view': vname, 'where': name, 'errors': list(dict.fromkeys(errs)), **r}
                errs.clear()
                if row['errors'] or row['wide'] or row['tiny'] or row.get('fail') or row['textLen'] < 20:
                    f = f"{vname}-{abs(hash(name)) % 10**8}.png"; row['shot'] = f
                    try: pg.screenshot(path=os.path.join(OUT, f))
                    except Exception: pass
                rows.append(row)
            try:
                if kind == 'page':
                    pg.goto(B + target); check(target, 500); continue
                pg.goto(B + 'vocab.html?topic=' + target); settle(pg, 500)
                steps = pg.evaluate("() => [...document.querySelectorAll('.step-tab')].filter(b => !b.classList.contains('hidden')).map(b => b.dataset.step)")
                for st in steps or ['(one step)']:
                    if st != '(one step)':
                        try: pg.click(f'.step-tab[data-step="{st}"]', timeout=3000)
                        except Exception: pass
                    check(f'{target} · {st}', 600)
                    tabs = pg.locator('.st-tab:visible')
                    for i in range(1, tabs.count()):     # the chart tools: every tab
                        try: tabs.nth(i).click(timeout=3000)
                        except Exception: continue
                        check(f'{target} · {st} · tab {i + 1}', 400)
            except Exception as e:
                rows.append({'view': vname, 'where': f'{target}', 'errors': [], 'tiny': [], 'off': [], 'wide': False, 'textLen': 1, 'fail': str(e)[:300]})
        b.close()
    return rows

def main():
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(A.port), '-d', R], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    t0 = time.time()
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            plain = topic_ids(b, 'plain')
            mocked = [t for t in topic_ids(b, 'mock') if t not in plain] if MOCK else []
            b.close()
        if A.quick: plain, mocked = plain[:6], mocked[:2]
        jobs = []
        for vname in VIEWS:
            jobs += [('plain', vname, 'page', u) for u in PAGES] + [('plain', vname, 'topic', t) for t in plain] + [('mock', vname, 'topic', t) for t in mocked]
        n = max(1, A.workers)
        # each browser takes every n-th job, so phone and computer, light and heavy screens are spread out
        parts = [sorted(jobs[i::n], key=lambda j: (j[0], j[1])) for i in range(n)]
        with Pool(n) as pool:
            rows = [r for part in pool.map(run_jobs, parts) for r in part]
        order = {('page', u): k for k, u in enumerate(PAGES)}
        rows.sort(key=lambda r: (r['view'] != 'phone', r['where']))
    finally:
        srv.kill()
    print(f'{len(rows)} screens in {time.time() - t0:.0f} s with {n} browsers')
    json.dump(rows, open(os.path.join(OUT, 'report.json'), 'w'), ensure_ascii=False, indent=1)
    probs = [r for r in rows if r['errors'] or r['wide'] or r['tiny'] or r.get('fail') or r['textLen'] < 20]
    offs = [r for r in rows if r['off']]
    lines = [f'# App check: {len(rows)} screens ({sum(r["view"] == "phone" for r in rows)} on a phone, {sum(r["view"] == "desktop" for r in rows)} on a desktop)', '',
             f'- JavaScript errors: {sum(bool(r["errors"]) for r in rows)} screens', f'- Wider than the screen: {sum(r["wide"] for r in rows)}',
             f'- Text under 12px: {sum(bool(r["tiny"]) for r in rows)}', f'- Text outside the size scale: {len(offs)}', f'- Empty screens: {sum(r["textLen"] < 20 for r in rows)}',
             f'- Words shown twice on one step: {sum(bool(r.get("twice")) for r in rows)}', f'- Boxes with their own scroll bar: {sum(bool(r.get("scroll")) for r in rows)}', f'- Main picture or video not in the first screen (computer): {sum(bool(r.get("below")) for r in rows)}', '']
    for r in probs:
        lines.append(f'## {r["view"]} · {r["where"]}')
        if r['errors']: lines.append('- errors: ' + '; '.join(r['errors'])[:400])
        if r['wide']: lines.append('- wider than the screen')
        if r['tiny']: lines.append('- small text: ' + ' | '.join(r['tiny'][:6]))
        if r['textLen'] < 20: lines.append('- empty')
        if r.get('shot'): lines.append(f'- screenshot: {r["shot"]}')
        lines.append('')
    tw = [r for r in rows if r.get('twice')]
    if tw:
        lines.append('## Words shown twice')
        for r in tw[:40]: lines.append(f'- {r["view"]} · {r["where"]}: ' + ', '.join(r['twice'][:8]))
        lines.append('')
    sc = [r for r in rows if r.get('scroll') or r.get('below')]
    if sc:
        lines.append('## Inner scroll bars and first screen')
        for r in sc[:80]: lines.append(f'- {r["view"]} · {r["where"]}: ' + ' '.join(r.get('scroll') or []) + (f' · main tool ends at {r["below"]}px' if r.get('below') else ''))
        lines.append('')
    if offs:
        lines.append('## Text outside the scale')
        for r in offs[:40]: lines.append(f'- {r["view"]} · {r["where"]}: ' + ' | '.join(r['off'][:4]))
    open(os.path.join(OUT, 'report.md'), 'w').write('\n'.join(lines) + '\n')
    print('\n'.join(lines[:11])); print('report:', os.path.join(OUT, 'report.md'))

if __name__ == '__main__':
    main()
