# Builds the voices, the timeline (timeline.json) and the mixed sound track (audio.wav) for the weather video.
import json, subprocess, wave, os, numpy as np
D = os.path.dirname(os.path.abspath(__file__))
SR = 22050
FPS = 24
VOICE = {'L': (D + '/voices/fr-siwis-medium/fr-siwis-medium.onnx', 1.1), 'H': (D + '/voices/fr-gilles-low/fr-gilles-low.onnx', 1.08)}

# scene: id, caption, lines. line: speaker, subtitle FR (**word** = vocab), EN, segments [(text, event)]
SCENES = [
 ('matin', 'Le petit-déjeuner · 8 h', [
   ('H', "Bonjour madame ! Qu'est-ce que je vous sers ?", "Good morning! What can I get you?", [("Bonjour madame ! Qu'est-ce que je vous sers ?", None)]),
   ('L', "**Je voudrais** un **café crème** et un **jus d'orange**, s'il vous plaît.", "I would like a white coffee and an orange juice, please.", [("Je voudrais un café crème", 'cafe'), ("et un jus d'orange, s'il vous plaît.", 'jus')]),
   ('H', "Avec du **pain**, du **beurre** et de la **confiture** ?", "With bread, butter and jam?", [("Avec du pain,", 'pain'), ("du beurre", 'beurre'), ("et de la confiture ?", 'confiture')]),
   ('L', "Oui, très bien. Le café **sans sucre**, s'il vous plaît.", "Yes, fine. The coffee without sugar, please.", [("Oui, très bien.", None), ("Le café sans sucre, s'il vous plaît.", 'nosucre')]),
 ]),
 ('midi', 'Le déjeuner · 12 h 30', [
   ('L', "Bonjour ! Une **table pour deux**, s'il vous plaît. Mon amie arrive.", "Hello! A table for two, please. My friend is on her way.", [("Bonjour ! Une table pour deux, s'il vous plaît.", 'table'), ("Mon amie arrive.", None)]),
   ('H', "Voici **la carte**. La **formule**, c'est une **entrée** et un **plat principal**.", "Here is the menu. The set menu is a starter and a main course.", [("Voici la carte.", 'carte'), ("La formule, c'est une entrée", 'entree'), ("et un plat principal.", 'plat')]),
   ('L', "**Qu'est-ce que vous me conseillez ?** **Je suis végétarienne.**", "What do you recommend? I am vegetarian.", [("Qu'est-ce que vous me conseillez ?", None), ("Je suis végétarienne.", 'vege')]),
   ('H', "Alors, pas de **poulet**, pas de **poisson** : je vous conseille les **pâtes** aux légumes.", "So no chicken, no fish: I recommend the vegetable pasta.", [("Alors, pas de poulet,", 'nopoulet'), ("pas de poisson :", 'nopoisson'), ("je vous conseille les pâtes aux légumes.", 'pates')]),
   ('L', "Parfait, **je vais prendre** les pâtes. Et **de l'eau gazeuse**.", "Perfect, I'll have the pasta. And some sparkling water.", [("Parfait, je vais prendre les pâtes.", None), ("Et de l'eau gazeuse.", 'eau')]),
 ]),
 ('gouter', 'Le goûter · 16 h', [
   ('H', "Et pour le **goûter** ? Un **chocolat chaud** ? Une **tarte** ?", "And for an afternoon snack? A hot chocolate? A tart?", [("Et pour le goûter ?", None), ("Un chocolat chaud ?", 'choco'), ("Une tarte ?", 'tarte')]),
   ('L', "Un chocolat chaud et une **glace** à la **fraise**, **sur place**.", "A hot chocolate and a strawberry ice cream, to have here.", [("Un chocolat chaud", 'choco2'), ("et une glace à la fraise,", 'glace'), ("sur place.", 'surplace')]),
   ('H', "Et un **gâteau** **à emporter** ?", "And a cake to take away?", [("Et un gâteau à emporter ?", 'gateau')]),
   ('L', "Non merci. **C'était délicieux !** **L'addition**, s'il vous plaît.", "No thank you. It was delicious! The bill, please.", [("Non merci.", 'nogateau'), ("C'était délicieux !", None), ("L'addition, s'il vous plaît.", 'addition')]),
   ('H', "Voilà, madame. Bonne journée !", "Here you are, madam. Have a nice day!", [("Voilà, madame.", 'receipt'), ("Bonne journée !", 'wave')]),
 ]),
]
BEATS = {('matin', -1): (0.4, None), ('midi', -1): (0.3, None), ('gouter', -1): (0.3, None)}

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

# ---- sound effects: a quiet café murmur under everything, a cup on a saucer when the drinks come ----
rng = np.random.default_rng(3)
def lowpass(x, k):
    c = np.cumsum(np.concatenate([[0], x])); return (c[k:] - c[:-k]) / k
sfx = np.zeros(n, np.float32)
mur = lowpass(rng.standard_normal(n + 400), 60)[:n]; mur = mur / np.max(np.abs(mur))
mur *= 0.6 + 0.4 * np.sin(np.arange(n) / SR * 2 * np.pi * 0.17)
sfx += mur * 0.05
def clink(st, v=0.25):
    i = int(st * SR); L = int(0.35 * SR); t_ = np.arange(L) / SR
    x = (np.sin(2 * np.pi * 2200 * t_) + 0.6 * np.sin(2 * np.pi * 3300 * t_)) * np.exp(-t_ * 18)
    x = x[: n - i]; sfx[i:i + len(x)] += x * v
for e, tt, s in timeline['events']:
    if e in ('cafe', 'jus', 'eau', 'choco2'): clink(tt + 0.6)
mix = voice * 0.95 + sfx
mix = mix / max(1.0, float(np.max(np.abs(mix))) / 0.95)
with wave.open(D + '/audio.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
json.dump(timeline, open(D + '/timeline.json', 'w'), ensure_ascii=False)
print('total', round(total, 1), 's;', len(timeline['subs']), 'subtitles;', len(timeline['events']), 'events')
for s in timeline['scenes']: print(s['id'], s['start'], s['end'])
