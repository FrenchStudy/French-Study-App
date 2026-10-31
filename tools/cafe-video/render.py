# python3 render.py stills t1 t2 ...  -> stills/<t>.jpg      python3 render.py video  -> cafe.mp4
# One encoded file per scene (frames piped straight into ffmpeg), joined with the concat demuxer, then the sound.
import json, sys, os, subprocess
from playwright.sync_api import sync_playwright
D = os.path.dirname(os.path.abspath(__file__)); TL = json.load(open(D + '/timeline.json')); FPS = 30
mode = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1280, 'height': 720})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + D + '/scene.html'); pg.evaluate('tl => window.load(tl)', TL)
    if mode == 'stills':
        os.makedirs(D + '/stills', exist_ok=True)
        for t in sys.argv[2:]:
            pg.evaluate(f'render({float(t)})')
            if os.environ.get('NOSUB'): pg.evaluate("document.getElementById('sub').style.opacity=0")
            pg.screenshot(path=f'{D}/stills/{t}.jpg', type='jpeg', quality=92)
    else:
        parts = []
        for i, sc in enumerate(TL['scenes']):
            out = f'{D}/part{i}.mp4'; tmp = out + '.tmp.mp4'
            ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                                   '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p', '-r', str(FPS), tmp], stdin=subprocess.PIPE)
            f0, f1 = round(sc['start'] * FPS), round(sc['end'] * FPS)
            for f in range(f0, f1):
                pg.evaluate(f'render({f / FPS})'); ff.stdin.write(pg.screenshot(type='jpeg', quality=92))
            ff.stdin.close()
            if ff.wait() == 0: os.replace(tmp, out); parts.append(out)
            else: sys.exit('scene failed')
        open(D + '/parts.txt', 'w').write(''.join(f"file '{x}'\n" for x in parts))
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', D + '/parts.txt', '-c', 'copy', D + '/video.mp4'], check=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', D + '/video.mp4', '-i', D + '/audio.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', D + '/cafe.mp4'], check=True)
    print('errors', errs[:3]); b.close()
