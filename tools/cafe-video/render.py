# python3 render.py stills t1 t2 ...   -> stills/<t>.png
# python3 render.py video               -> meteo.mp4
import json, sys, os, subprocess, shutil
from playwright.sync_api import sync_playwright
D = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(D + '/timeline.json'))
mode = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 720})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + D + '/scene.html')
    pg.evaluate('tl => window.load(tl)', TL)
    if mode == 'stills':
        os.makedirs(D + '/stills', exist_ok=True)
        nosub = os.environ.get('NOSUB')
        for t in sys.argv[2:]:
            pg.evaluate(f'render({float(t)})')
            if nosub: pg.evaluate("document.getElementById('sub').style.opacity=0")
            pg.screenshot(path=f'{D}/stills/{t}.png')
    else:
        fr = D + '/frames'; shutil.rmtree(fr, ignore_errors=True); os.makedirs(fr)
        n = int(TL['total'] * TL['fps'])
        for f in range(n):
            pg.evaluate(f'render({f / TL["fps"]})'); pg.screenshot(path=f'{fr}/{f:05d}.jpg', type='jpeg', quality=92)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(TL['fps']), '-i', fr + '/%05d.jpg', '-i', D + '/audio.wav',
                        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest',
                        '-movflags', '+faststart', D + '/cafe.mp4'], check=True)
        print('frames', n)
    print('errors', errs[:5])
    b.close()
