# Builds the voices, the timeline (timeline.json) and the mixed sound track (audio.wav) for the weather video.
import json, subprocess, wave, os, numpy as np
D = os.path.dirname(os.path.abspath(__file__))
SR = 22050
FPS = 24
VOICE = {'L': (D + '/voices/fr-siwis-medium/fr-siwis-medium.onnx', 1.12), 'H': (D + '/voices/fr-gilles-low/fr-gilles-low.onnx', 1.08)}

# scene: id, caption, lines. line: speaker, subtitle FR (**word** = vocab), EN, segments [(text, event)]
SCENES = [
 ('studio1', 'La météo', [
   ('L', "Bonjour et bienvenue à la **météo** !", "Hello and welcome to the weather forecast!", [("Bonjour et bienvenue à la météo !", None)]),
   ('L', "Aujourd'hui, on fait le tour de l'année : **printemps**, **été**, **automne**, **hiver**.", "Today we're going round the year: spring, summer, autumn, winter.",
    [("Aujourd'hui, on fait le tour de l'année :", None), ("printemps,", 'ic0'), ("été,", 'ic1'), ("automne,", 'ic2'), ("hiver.", 'ic3')]),
 ]),
 ('spring', 'Au printemps · Paris', [
   ('H', "Salut Léa ! **Il fait quel temps** à Paris ?", "Hi Léa! What's the weather like in Paris?", [("Salut Léa ! Il fait quel temps à Paris ?", None)]),
   ('L', "**Il fait doux.** **Il y a du soleil.**", "It's mild. It's sunny.", [("Il fait doux.", None), ("Il y a du soleil.", 'sunny')]),
   ('H', "**Quelle est la température ?**", "What's the temperature?", [("Quelle est la température ?", None)]),
   ('L', "**Il fait vingt degrés.**", "It's twenty degrees.", [("Il fait vingt degrés.", 'thermo')]),
   ('L', "Mais regarde le **ciel** : un **nuage**… deux… **Il y a des nuages !**", "But look at the sky: one cloud… two… It's cloudy!",
    [("Mais regarde le ciel :", 'look'), ("un nuage.", 'cloud1'), ("deux.", 'cloud2'), ("Il y a des nuages !", 'clouds')]),
   ('L', "Oh non, **il pleut** ! Où est mon **parapluie** ?", "Oh no, it's raining! Where's my umbrella?", [("Oh non, il pleut !", 'rain'), ("Où est mon parapluie ?", 'umbrella')]),
 ]),
 ('summer', 'En été · Nice', [
   ('L', "**Il fait beau**, **il fait chaud**… mais l'air est lourd. **Il fait lourd.**", "It's nice, it's hot… but the air is heavy. It's muggy.",
    [("Il fait beau,", None), ("il fait chaud.", 'hot'), ("Mais l'air est lourd.", 'haze'), ("Il fait lourd.", None)]),
   ('L', "**Il y a un orage !** Un **orage** d'été, c'est fort !", "There's a storm! A summer storm is strong!", [("Il y a un orage !", None), ("Un orage d'été, c'est fort !", None)]),
 ]),
 ('autumn', 'En automne · près de Lyon', [
   ('L', "**Il fait frais.** **Il y a du brouillard** : on ne voit rien !", "It's cool. It's foggy: you can't see a thing!",
    [("Il fait frais.", None), ("Il y a du brouillard :", 'fog'), ("on ne voit rien !", 'fogthick')]),
   ('L', "**Il fait gris**, **il y a du vent**… **Il fait mauvais.**", "It's grey, it's windy… The weather is bad.",
    [("Il fait gris,", 'grey'), ("il y a du vent.", 'wind'), ("Il fait mauvais.", None)]),
 ]),
 ('winter', 'En hiver · les Alpes', [
   ('H', "**Quel temps fait-il** à la montagne ?", "What's the weather like in the mountains?", [("Quel temps fait-il à la montagne ?", None)]),
   ('L', "**Il fait froid !** **Il neige.** Regarde la **neige** !", "It's cold! It's snowing. Look at the snow!", [("Il fait froid !", None), ("Il neige.", 'snow'), ("Regarde la neige !", None)]),
   ('L', "Et la nuit, **il gèle**.", "And at night, it freezes.", [("Et la nuit,", 'night'), ("il gèle.", 'frost')]),
 ]),
 ('studio2', 'La météo', [
   ('L', "Et chez vous ? **Soleil**, **pluie**, **vent** ou neige ?", "And where you are? Sun, rain, wind or snow?",
    [("Et chez vous ?", None), ("Soleil,", 't0'), ("pluie,", 't1'), ("vent,", 't2'), ("ou neige ?", 't3')]),
   ('L', "Regardez la météo, et n'oubliez pas votre parapluie ! À demain !", "Watch the forecast, and don't forget your umbrella! See you tomorrow!",
    [("Regardez la météo,", None), ("et n'oubliez pas votre parapluie !", 'umbrella'), ("À demain !", 'wave')]),
 ]),
]
# extra moments that are not speech: (scene id, after line index, seconds of pause, event)
BEATS = {('spring', -1): (1.6, 'ring'), ('spring', 4): (1.4, 'rainstart'), ('summer', 0): (2.2, 'storm'), ('autumn', 1): (0.6, None), ('winter', 0): (0.3, None)}

def synth(text, who, path):
    model, ls = VOICE[who]
    raw = path + '.raw.wav'
    subprocess.run([D + '/piper/piper', '-m', model, '--length_scale', str(ls), '-f', raw], input=text.encode(), check=True, capture_output=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-ar', str(SR), '-ac', '1', path], check=True)
    with wave.open(path) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    # trim silence at both ends
    nz = np.where(np.abs(a) > 0.01)[0]
    if len(nz): a = a[max(0, nz[0] - 400): nz[-1] + 800]
    return a

os.makedirs(D + '/clips', exist_ok=True)
track = []      # (start, array, speaker)
timeline = {'scenes': [], 'events': [], 'subs': []}
t = 0.0
for sid, cap, lines in SCENES:
    s0 = t
    t += 1.2   # the caption shows first
    if (sid, -1) in BEATS:
        pause, ev = BEATS[(sid, -1)]; timeline['events'].append([ev, round(t, 3), sid]); t += pause
    for li, (who, fr, en, segs) in enumerate(lines):
        l0 = t
        for si, (txt, ev) in enumerate(segs):
            a = synth(txt, who, f'{D}/clips/{sid}_{li}_{si}.wav')
            if ev: timeline['events'].append([ev, round(t, 3), sid])
            track.append((t, a, who)); t += len(a) / SR + 0.22
        timeline['subs'].append({'who': who, 'fr': fr, 'en': en, 'start': round(l0 - 0.1, 3), 'end': round(t + 0.25, 3), 'scene': sid})
        t += 0.45
        if (sid, li) in BEATS:
            pause, ev = BEATS[(sid, li)]
            if ev: timeline['events'].append([ev, round(t, 3), sid])
            t += pause
    t += 0.9
    timeline['scenes'].append({'id': sid, 'caption': cap, 'start': round(s0, 3), 'end': round(t, 3)})
total = t + 0.5
timeline['total'] = round(total, 3)

n = int(total * SR) + 1
voice = np.zeros(n, np.float32)
amp = {'L': np.zeros(int(total * FPS) + 2), 'H': np.zeros(int(total * FPS) + 2)}
for st, a, who in track:
    i = int(st * SR); voice[i:i + len(a)] += a
    for f in range(int(st * FPS), int((st + len(a) / SR) * FPS) + 1):
        seg = a[int(f / FPS * SR) - i: int((f + 1) / FPS * SR) - i]
        if len(seg): amp[who][f] = max(amp[who][f], float(np.sqrt(np.mean(seg ** 2))))
for k in amp:
    m = np.percentile(amp[k][amp[k] > 0], 95) if (amp[k] > 0).any() else 1
    amp[k] = np.clip(amp[k] / m, 0, 1)
timeline['amp'] = {k: [round(float(x), 2) for x in v] for k, v in amp.items()}
timeline['fps'] = FPS

# ---- sound effects ----
rng = np.random.default_rng(7)
def ev_time(name, sid=None):
    for e, tt, s in timeline['events']:
        if e == name and (sid is None or s == sid): return tt
def scene(sid): return next(s for s in timeline['scenes'] if s['id'] == sid)
def lowpass(x, k):
    c = np.cumsum(np.concatenate([[0], x])); return (c[k:] - c[:-k]) / k
sfx = np.zeros(n, np.float32)
def add(st, x, vol):
    i = int(st * SR); x = x[: n - i]; sfx[i:i + len(x)] += x * vol
def fade(x, a=0.4, b=0.6):
    e = np.ones(len(x)); fa, fb = int(a * SR), int(b * SR)
    e[:fa] = np.linspace(0, 1, fa); e[-fb:] = np.linspace(1, 0, fb); return x * e
# phone ring: two short rings, 440 + 480 Hz
tr = ev_time('ring'); tt = np.arange(int(0.4 * SR)) / SR
ring = (np.sin(2 * np.pi * 440 * tt) + np.sin(2 * np.pi * 480 * tt)) * 0.5 * np.minimum(1, np.minimum(tt, 0.4 - tt) * 40)
add(tr, ring, 0.25); add(tr + 0.6, ring, 0.25)
# rain in Paris from the rain beat to the end of the scene
rs, re_ = ev_time('rainstart'), scene('spring')['end']
rain = lowpass(rng.standard_normal(int((re_ - rs) * SR) + 200), 3)[: int((re_ - rs) * SR)]
add(rs, fade(rain, 1.0, 0.8), 0.10)
# summer storm: thunder + rain
ts = ev_time('storm'); se = scene('summer')['end']
rain2 = lowpass(rng.standard_normal(int((se - ts) * SR) + 200), 3)[: int((se - ts) * SR)]
add(ts + 0.3, fade(rain2, 1.2, 0.8), 0.11)
for k, (dt, v) in enumerate([(0.0, 0.55), (2.6, 0.3)]):
    L = int(3.0 * SR); x = np.cumsum(rng.standard_normal(L)); x -= lowpass(np.concatenate([x, np.zeros(2000)]), 2000)[:L]
    x = x / np.max(np.abs(x)); env = np.exp(-np.arange(L) / SR * 1.6) * np.minimum(1, np.arange(L) / (0.03 * SR))
    add(ts + dt, x * env, v)
timeline['events'].append(['flash2', round(ts + 2.6, 3), 'summer'])
# autumn wind
wa, ae = ev_time('wind'), scene('autumn')['end']
L = int((ae - wa) * SR); w = lowpass(rng.standard_normal(L + 400), 40)[:L]; w = w / np.max(np.abs(w))
mod = 0.6 + 0.4 * np.sin(np.arange(L) / SR * 2 * np.pi * 0.35)
add(wa - 0.3, fade(w * mod, 0.8, 0.8), 0.18)

mix = voice * 0.95 + sfx
mix = mix / max(1.0, float(np.max(np.abs(mix))) / 0.95)
with wave.open(D + '/audio.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
json.dump(timeline, open(D + '/timeline.json', 'w'), ensure_ascii=False)
print('total', round(total, 1), 's;', len(timeline['subs']), 'subtitles;', len(timeline['events']), 'events')
for s in timeline['scenes']: print(s['id'], s['start'], s['end'])
