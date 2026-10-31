# Café video, take 2: whole sentences (no cut-up lines), one clear voice (Piper siwis) for both women,
# Chloé a little higher. Writes timeline.json (lines, events, mouth amplitude per frame) and audio.wav.
import json, subprocess, wave, os, re, numpy as np
D = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 22050, 30
PIPER = D + '/piper/piper'
MODEL = D + '/voices/fr-siwis-medium/fr-siwis-medium.onnx'

# a line: ('L' or 'C', subtitle FR (**word** = topic word), EN, [(text that triggers, event), ...])
# a beat: ('beat', seconds, event)   -- an action with no speech
SCENES = [
 ('matin', 'Le petit-déjeuner · 8 h', [
   ('beat', 2.2, 'arrive'),
   ('C', "Bonjour madame ! Qu'est-ce que je vous sers ?", "Good morning! What can I get you?", []),
   ('L', "**Je voudrais** un **café crème** et un **jus d'orange**, s'il vous plaît.", "I'd like a white coffee and an orange juice, please.", [('café crème', 'n_cafe'), ("jus d'orange", 'n_jus')]),
   ('C', "Avec du **pain**, du **beurre** et de la **confiture** ?", "With bread, butter and jam?", [('pain', 'n_pain'), ('beurre', 'n_beurre'), ('confiture', 'n_confiture')]),
   ('L', "Oui, très bien. Le café **sans sucre**, s'il vous plaît.", "Yes, fine. The coffee without sugar, please.", [('sans sucre', 'n_sucre')]),
   ('C', "Très bien, j'arrive !", "Very good, I'll be right back!", []),
   ('beat', 5.6, 'serve'),
   ('L', "Merci beaucoup !", "Thank you very much!", []),
   ('beat', 1.2, None),
 ]),
 ('midi', 'Le déjeuner · 12 h 30', [
   ('beat', 1.8, 'enter'),
   ('L', "Bonjour ! Une **table pour deux**, s'il vous plaît. Mon amie arrive.", "Hello! A table for two, please. My friend is on her way.", [('table pour deux', 'n_table')]),
   ('C', "Bien sûr. Par ici, madame.", "Of course. This way, madam.", []),
   ('beat', 2.4, 'sit'),
   ('C', "Voici **la carte**. La **formule**, c'est une **entrée** et un **plat principal**.", "Here is the menu. The set menu is a starter and a main course.", [('Voici', 'menu'), ('entrée', 'n_entree'), ('plat principal', 'n_plat')]),
   ('L', "**Qu'est-ce que vous me conseillez ?** **Je suis végétarienne.**", "What do you recommend? I'm vegetarian.", [('végétarienne', 'n_vege')]),
   ('C', "Alors, pas de **poulet**, pas de **poisson** : je vous conseille les **pâtes** aux légumes.", "So no chicken, no fish: I recommend the vegetable pasta.", [('poulet', 'n_poulet'), ('poisson', 'n_poisson'), ('pâtes', 'n_pates')]),
   ('L', "Parfait, **je vais prendre** les pâtes. Et **de l'eau gazeuse**, s'il vous plaît.", "Perfect, I'll have the pasta. And some sparkling water, please.", [('eau gazeuse', 'n_eau')]),
   ('beat', 5.6, 'serve'),
   ('L', "Merci ! Ça a l'air délicieux.", "Thank you! It looks delicious.", []),
   ('beat', 1.2, None),
 ]),
 ('gouter', 'Le goûter · 16 h', [
   ('beat', 2.0, 'arrive'),
   ('C', "Et pour le **goûter** ? Un **chocolat chaud** ? Une **tarte** ?", "And for an afternoon snack? A hot chocolate? A tart?", [('chocolat chaud', 's_choco'), ('tarte', 's_tarte')]),
   ('L', "Un chocolat chaud et une **glace** à la **fraise**, **sur place**.", "A hot chocolate and a strawberry ice cream, to have here.", [('chocolat chaud', 'n_choco'), ('glace', 'n_glace'), ('sur place', 'n_surplace')]),
   ('beat', 4.6, 'serve'),
   ('L', "Mmm… merci !", "Mmm… thank you!", []),
   ('beat', 1.6, None),
   ('C', "Et un **gâteau** **à emporter** ?", "And a cake to take away?", [('gâteau', 's_gateau')]),
   ('L', "Non merci. **C'était délicieux !** **L'addition**, s'il vous plaît.", "No thank you. It was delicious! The bill, please.", [('Non merci', 'no_gateau'), ('délicieux', 'happy'), ("L'addition", 'n_addition')]),
   ('beat', 3.6, 'bill'),
   ('C', "Voilà, madame. Bonne journée !", "Here you are, madam. Have a nice day!", []),
   ('beat', 2.4, 'bye'),
 ]),
]

def plain(s): return re.sub(r'\*\*', '', s)
def synth(text, who, path):
    raw = path + '.raw.wav'
    subprocess.run([PIPER, '-m', MODEL, '--length_scale', '1.08', '--noise_scale', '0.55', '--noise_w', '0.7', '-f', raw], input=text.encode(), check=True, capture_output=True)
    af = 'rubberband=pitch=1.07:formant=preserved' if who == 'C' else 'anull'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', af, '-ar', str(SR), '-ac', '1', path], check=True)
    with wave.open(path) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    nz = np.where(np.abs(a) > 0.01)[0]
    return a[max(0, nz[0] - 300): nz[-1] + 900] if len(nz) else a

os.makedirs(D + '/clips', exist_ok=True)
track, TLd, t = [], {'scenes': [], 'events': [], 'subs': [], 'lines': []}, 0.0
for sid, cap, items in SCENES:
    s0 = t; t += 0.6
    for n, it in enumerate(items):
        if it[0] == 'beat':
            if it[2]: TLd['events'].append([it[2], round(t, 3), sid, it[1]])
            t += it[1]; continue
        who, fr, en, trig = it
        text = plain(fr)
        a = synth(text, who, f'{D}/clips/{sid}_{n}.wav')
        dur = len(a) / SR
        track.append((t, a, who))
        for sub, ev in trig:   # an event lands where its words are in the sentence
            i = text.find(sub); assert i >= 0, (sub, text)
            TLd['events'].append([ev, round(t + dur * (i / max(1, len(text))) + 0.15, 3), sid, 0])
        TLd['lines'].append({'who': who, 'start': round(t, 3), 'end': round(t + dur, 3), 'scene': sid})
        TLd['subs'].append({'who': who, 'fr': fr, 'en': en, 'start': round(t - 0.15, 3), 'end': round(t + dur + 0.35, 3), 'scene': sid})
        t += dur + 0.7
    t += 0.4
    TLd['scenes'].append({'id': sid, 'caption': cap, 'start': round(s0, 3), 'end': round(t, 3)})
total = t
TLd['total'], TLd['fps'] = round(total, 3), FPS

n = int(total * SR) + SR
voice = np.zeros(n, np.float32)
amp = {k: np.zeros(int(total * FPS) + 2) for k in 'LC'}
for st, a, who in track:
    i = int(st * SR); voice[i:i + len(a)] += a
    for f in range(int(st * FPS), int((st + len(a) / SR) * FPS) + 1):
        seg = a[max(0, int(f / FPS * SR) - i): max(0, int((f + 1) / FPS * SR) - i)]
        if len(seg): amp[who][f] = max(amp[who][f], float(np.sqrt(np.mean(seg ** 2))))
for k in amp:
    m = np.percentile(amp[k][amp[k] > 0], 90) if (amp[k] > 0).any() else 1
    amp[k] = np.clip(amp[k] / m, 0, 1)
TLd['amp'] = {k: [round(float(x), 2) for x in v] for k, v in amp.items()}

# a quiet café under everything, a cup on a saucer when things are put on the table
rng = np.random.default_rng(3)
def lowpass(x, k): c = np.cumsum(np.concatenate([[0], x])); return (c[k:] - c[:-k]) / k
mur = lowpass(rng.standard_normal(n + 400), 60)[:n]; mur /= np.max(np.abs(mur))
sfx = mur * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 2 * np.pi * 0.17)) * 0.045
def clink(st, v=0.22):
    i = int(st * SR); L = int(0.35 * SR); tt = np.arange(L) / SR
    x = (np.sin(2 * np.pi * 2200 * tt) + 0.6 * np.sin(2 * np.pi * 3300 * tt)) * np.exp(-tt * 18)
    x = x[: n - i]; sfx[i:i + len(x)] += x * v
for e, tt, s, d in TLd['events']:
    if e == 'serve':
        for k in range(3): clink(tt + 2.6 + k * 0.9)
mix = voice + sfx
mix /= max(1.0, float(np.max(np.abs(mix))) / 0.95)
with wave.open(D + '/audio.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
json.dump(TLd, open(D + '/timeline.json', 'w'), ensure_ascii=False)
print('total', round(total, 1), 's')
for s in TLd['scenes']: print(s['id'], s['start'], s['end'])
