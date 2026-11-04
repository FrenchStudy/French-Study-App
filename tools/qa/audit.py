# tools/qa/audit.py - a full check of the app on a phone and a desktop screen, before every pull request.
#   python3 tools/qa/audit.py [--mock FILE] [--out DIR] [--quick]
# Opens every page, every Vocab topic and every step of it (and each tab of the chart tools), and reports:
#   errors       JavaScript errors on the page
#   wide         the page is wider than the screen (sideways scrolling on a phone)
#   tiny         text smaller than 12px (on SVG pictures: the size as drawn on screen)
#   off-scale    text in a size outside the app's scale (12 14 16 18 20 24 30 and the big display sizes)
#   empty        a step that shows nothing
# Needs Python Playwright with Chromium. --mock FILE: a JavaScript file added after config.js that fakes the database
# (topics 31-56 come from the database; without it they are skipped). Writes DIR/report.md, DIR/report.json and a
# screenshot of each problem (DIR defaults to a folder in the system temp directory).
import json, os, subprocess, sys, tempfile, time, argparse
from playwright.sync_api import sync_playwright

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ap = argparse.ArgumentParser()
ap.add_argument('--mock'); ap.add_argument('--out'); ap.add_argument('--quick', action='store_true'); ap.add_argument('--port', type=int, default=8977)
A = ap.parse_args()
OUT = A.out or os.path.join(tempfile.gettempdir(), 'fs-audit')
os.makedirs(OUT, exist_ok=True)
B = f'http://localhost:{A.port}/'
SCALE = {12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128}

PAGES = ['index.html', 'vocab.html', 'lesson.html', 'conjugations.html', 'reading.html', 'listening.html', 'writing.html', 'speaking.html',
         'translator.html', 'syllabus.html', 'exam.html', 'welcome.html', 'login.html', 'contact.html', 'terms.html', 'privacy.html',
         'lesson.html?i=lheure-prix', 'lesson.html?i=lalphabet']

CHECK = r"""() => {
  const emojiOnly = (t) => !/[\p{L}\p{N}]/u.test(t);
  const out = { tiny: [], off: [], wide: document.documentElement.scrollWidth > innerWidth + 1, textLen: 0 };
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
  return out;
}""".replace('SCALE', 'new Set(' + json.dumps(sorted(SCALE)) + ')')

def main():
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(A.port), '-d', R], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    mock = (open(os.path.join(R, 'config.js'), encoding='utf-8').read() + '\n' + open(A.mock, encoding='utf-8').read()) if A.mock else None
    rows = []
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            for vname, vp in [('phone', {'width': 375, 'height': 800}), ('desktop', {'width': 1280, 'height': 900})]:
                ctx = b.new_context(viewport=vp)
                if mock: ctx.route('**/config.js', lambda r: r.fulfill(body=mock, content_type='application/javascript'))
                ctx.route(lambda u: not u.startswith(B), lambda r: r.abort())
                pg = ctx.new_page(); errs = []
                pg.on('pageerror', lambda e: errs.append(str(e)))
                def check(name, wait=900):
                    pg.wait_for_timeout(wait)
                    try: r = pg.evaluate(CHECK)
                    except Exception as e: r = {'tiny': [], 'off': [], 'wide': False, 'textLen': 1, 'fail': str(e)}
                    row = {'view': vname, 'where': name, 'errors': list(dict.fromkeys(errs)), **r}
                    errs.clear()
                    bad = row['errors'] or row['wide'] or row['tiny'] or row.get('fail') or row['textLen'] < 20
                    if bad:
                        f = f"{vname}-{len(rows)}.png"; row['shot'] = f
                        try: pg.screenshot(path=os.path.join(OUT, f))
                        except Exception: pass
                    rows.append(row)
                for u in PAGES:
                    pg.goto(B + u); check(u, 1500)
                # every Vocab topic and step
                pg.goto(B + 'vocab.html'); pg.wait_for_timeout(1500)
                ids = pg.evaluate("() => TOPICS.filter(t => t.n || t.lesson).map(t => t.id)")
                if A.quick: ids = ids[:6]
                for tid in ids:
                    pg.goto(B + 'vocab.html?topic=' + tid); pg.wait_for_timeout(1500)
                    steps = pg.evaluate("() => [...document.querySelectorAll('.step-tab')].filter(b => !b.classList.contains('hidden')).map(b => b.dataset.step)")
                    for st in steps or ['(one step)']:
                        if st != '(one step)':
                            try: pg.click(f'.step-tab[data-step="{st}"]', timeout=3000)
                            except Exception: pass
                        check(f'{tid} · {st}', 1300)
                        tabs = pg.locator('.st-tab:visible')
                        for i in range(1, tabs.count()):     # the chart tools: every tab
                            try: tabs.nth(i).click(timeout=3000)
                            except Exception: continue
                            check(f'{tid} · {st} · tab {i + 1}', 700)
                ctx.close()
    finally:
        srv.kill()
    json.dump(rows, open(os.path.join(OUT, 'report.json'), 'w'), ensure_ascii=False, indent=1)
    probs = [r for r in rows if r['errors'] or r['wide'] or r['tiny'] or r.get('fail') or r['textLen'] < 20]
    offs = [r for r in rows if r['off']]
    lines = [f'# App check: {len(rows)} screens ({sum(r["view"] == "phone" for r in rows)} on a phone, {sum(r["view"] == "desktop" for r in rows)} on a desktop)', '',
             f'- JavaScript errors: {sum(bool(r["errors"]) for r in rows)} screens', f'- Wider than the screen: {sum(r["wide"] for r in rows)}',
             f'- Text under 12px: {sum(bool(r["tiny"]) for r in rows)}', f'- Text outside the size scale: {len(offs)}', f'- Empty screens: {sum(r["textLen"] < 20 for r in rows)}', '']
    for r in probs:
        lines.append(f'## {r["view"]} · {r["where"]}')
        if r['errors']: lines.append('- errors: ' + '; '.join(r['errors'])[:400])
        if r['wide']: lines.append('- wider than the screen')
        if r['tiny']: lines.append('- small text: ' + ' | '.join(r['tiny'][:6]))
        if r['textLen'] < 20: lines.append('- empty')
        if r.get('shot'): lines.append(f'- screenshot: {r["shot"]}')
        lines.append('')
    if offs:
        lines.append('## Text outside the scale')
        for r in offs[:40]: lines.append(f'- {r["view"]} · {r["where"]}: ' + ' | '.join(r['off'][:4]))
    open(os.path.join(OUT, 'report.md'), 'w').write('\n'.join(lines) + '\n')
    print('\n'.join(lines[:8])); print('report:', os.path.join(OUT, 'report.md'))

main()
