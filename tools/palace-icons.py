# python3 tools/palace-icons.py /path/to/fluentui-emoji
# Makes js/palace-icons.js and media/palace/*.webp: the Microsoft Fluent Emoji 3D picture (MIT) for every emoji used
# in the memory palaces (js/palaces-data*.js). The emoji is matched by the "glyph" in each asset's metadata.json;
# a few with no 3D picture get a close one (EXTRA); anything still missing is drawn as a plain emoji by the app.
import json, glob, os, re, subprocess, sys
from PIL import Image
FE = sys.argv[1]
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTRA = {'👪': 'People hugging', '👭': 'People hugging', '🧑‍🤝‍🧑': 'Busts in silhouette'}
used = json.loads(subprocess.run(['node', '-e', """
const w = {}, vm = require('vm'), fs = require('fs');
for (const f of ['js/palaces-data.js', 'js/palaces-data-2.js']) vm.runInNewContext(fs.readFileSync(f, 'utf8'), { window: w });
const s = new Set(); for (const P of Object.values(w.PALACE_DATA || {})) for (const it of P.items) s.add(Array.isArray(it) ? it[1] : it.e);
console.log(JSON.stringify([...s]));"""], cwd=R, capture_output=True, text=True, check=True).stdout)
strip = lambda s: ''.join(c for c in s.replace('️', '') if not 0x1F3FB <= ord(c) <= 0x1F3FF)
idx = {}
for m in glob.glob(f'{FE}/assets/*/metadata.json'):
    idx[strip(json.load(open(m)).get('glyph', ''))] = os.path.basename(os.path.dirname(m))
out = {}
os.makedirs(f'{R}/media/palace', exist_ok=True)
for e in used:
    name = EXTRA.get(e) or idx.get(strip(e))
    if not name: print('no picture for', e); continue
    png = (glob.glob(f'{FE}/assets/{name}/3D/*.png') + glob.glob(f'{FE}/assets/{name}/Default/3D/*.png'))[0]
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    dst = f'{R}/media/palace/{slug}.webp'
    if not os.path.exists(dst):
        im = Image.open(png).convert('RGBA'); im.thumbnail((128, 128), Image.LANCZOS); im.save(dst, 'WEBP', quality=82, method=6)
    out[e] = slug
open(f'{R}/js/palace-icons.js', 'w').write('// palace-icons.js - the 3D picture for each emoji used in the memory palaces (Microsoft Fluent Emoji 3D, MIT).\n'
    '// Made by tools/palace-icons.py; media/palace/<name>.webp. Emoji not listed are drawn as plain emoji.\n'
    'window.PALACE_ICONS = ' + json.dumps(out, ensure_ascii=False, sort_keys=True) + ';\n')
print(len(out), 'pictures')
