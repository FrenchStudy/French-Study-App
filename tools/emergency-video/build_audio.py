# Emergency video (Vocab theme 25): Léa's bag is stolen, she reports it at the police station, she finds a cyclist
# lying in the street and calls 15, and there is a fire in a café. Whole sentences, one clear voice (Piper siwis),
# each person a little higher or lower; S is the 15 operator on the phone. Writes timeline.json and audio.wav.
import json, subprocess, wave, os, re, numpy as np
D = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 22050, 30
PIPER = D + '/piper/piper'
MODEL = D + '/voices/fr-siwis-medium/fr-siwis-medium.onnx'
# P a passer-by, F a police officer, S the 15 operator (on the phone), W a waitress
VOICE = {'L': (1.0, 1.06), 'P': (0.9, 1.1), 'F': (0.95, 1.04), 'S': (1.08, 1.02), 'W': (1.12, 1.0)}

SCENES = [
 ('vol', 'Dans la rue · samedi 15 h', [
   ('beat', 2.0, 'walk'),
   ('beat', 1.6, 'grab'),
   ('L', "Hé ! **Au voleur** ! **Arrêtez** !", "Hey! Stop thief! Stop!", [('Arrêtez', 'shout')]),
   ('P', "**Attention**, madame ! Le vélo !", "Look out, madam! The bike!", [('Attention', 'bike')]),
   ('L', "Oh… Madame, **pouvez-vous m'aider ?** **On m'a volé mon sac.**", "Oh… Madam, can you help me? My bag has been stolen.", [('volé', 'stolen')]),
   ('P', "Vite, **appelez la police** ! C'est le dix-sept, ou le **cent douze**.", "Quick, call the police! It's 17, or 112.", [('dix-sept', 'n17'), ('cent douze', 'n112')]),
   ('L', "Où est le **commissariat** ?", "Where is the police station?", [('commissariat', 'q_com')]),
   ('P', "Au bout de la rue, à droite.", "At the end of the street, on the right.", [('droite', 'dir')]),
   ('beat', 1.2, 'leave'),
 ]),
 ('police', 'Au commissariat · 15 h 30', [
   ('beat', 2.0, 'walk'),
   ('L', "Bonjour. On m'a volé mon sac, et **j'ai perdu mon passeport** : il était dans le sac !", "Hello. My bag was stolen, and I've lost my passport: it was in the bag!", [('passeport', 'passport')]),
   ('F', "Votre nom, votre adresse et votre numéro de téléphone, s'il vous plaît.", "Your name, your address and your phone number, please.", [('Votre', 'fast')], 0.74),
   ('L', "Euh… **Parlez-vous anglais ?** **Je ne parle pas bien français.**", "Er… Do you speak English? I don't speak French well.", [('anglais', 'english')]),
   ('F', "Non, désolée.", "No, sorry.", []),
   ('L', "Alors, **parlez plus lentement, s'il vous plaît.**", "Then speak more slowly, please.", []),
   ('F', "Votre adresse… et votre téléphone.", "Your address… and your phone.", [('adresse', 'slow')], 1.4),
   ('L', "**Mon adresse est** douze, rue de la Paix. **Mon numéro de téléphone est** le zéro six, douze, trente-quatre, cinquante-six, soixante-dix-huit.", "My address is 12 rue de la Paix. My phone number is 06 12 34 56 78.", [('adresse', 'addr'), ('numéro', 'tel')]),
   ('F', "Merci. Pour le passeport, allez à l'**ambassade** ou au **consulat**.", "Thank you. For the passport, go to the embassy or the consulate.", [('ambassade', 'embassy')]),
   ('beat', 1.2, None),
 ]),
 ('accident', 'Dans la rue · 19 h', [
   ('beat', 1.4, 'walk'),
   ('beat', 1.8, 'crash'),
   ('L', "Monsieur ? Monsieur ! **Au secours** ! **À l'aide** ! **Appelez une ambulance** !", "Sir? Sir! Help! Help! Call an ambulance!", [('secours', 'help')]),
   ('beat', 1.2, 'call'),
   ('L', "Allô, le quinze ? **Il y a eu un accident.** **Quelqu'un est inconscient.**", "Hello, is that 15? There's been an accident. Someone is unconscious.", [('accident', 'acc'), ('inconscient', 'uncon')]),
   ('S', "Est-ce qu'il respire ?", "Is he breathing?", [('respire', 'q_breath')]),
   ('L', "Oui, il respire.", "Yes, he's breathing.", [('Oui', 'breath')]),
   ('S', "D'accord. J'envoie une ambulance. Où êtes-vous ?", "All right. I'm sending an ambulance. Where are you?", [('ambulance', 'send')]),
   ('L', "Rue Victor-Hugo, devant la pharmacie.", "Rue Victor-Hugo, in front of the chemist's.", []),
   ('beat', 3.4, 'ambulance'),
 ]),
 ('feu', 'Au café · 21 h', [
   ('beat', 2.4, 'smoke'),
   ('W', "**Au feu** ! **Il y a un incendie** dans la cuisine !", "Fire! There's a fire in the kitchen!", [('incendie', 'fire')]),
   ('L', "**Appelez les pompiers** ! Le dix-huit !", "Call the fire brigade! 18!", [('pompiers', 'call18')]),
   ('W', "Tout le monde dehors ! Prenez la **sortie de secours** !", "Everybody out! Take the emergency exit!", [('sortie', 'exit')]),
   ('beat', 2.6, 'out'),
   ('W', "Je… **je ne peux pas respirer**…", "I… I can't breathe…", [('respirer', 'cough')], 1.3),
   ('L', "Respirez doucement. Ça va aller.", "Breathe slowly. It's going to be all right.", [('Respirez', 'calm')]),
   ('L', "Aïe ! Ma main… **je suis blessée**.", "Ow! My hand… I'm hurt.", [('Aïe', 'hurt')]),
   ('W', "Allez à la **pharmacie de garde**, ou à l'**hôpital le plus proche**.", "Go to the duty chemist's, or to the nearest hospital.", [('pharmacie', 'pharma'), ('hôpital', 'hosp')]),
   ('beat', 2.6, 'bye'),
 ]),
]

def plain(s): return re.sub(r'\*\*', '', s)
def synth(text, who, path, speed=None):
    pitch, ls = VOICE[who]
    raw = path + '.raw.wav'
    subprocess.run([PIPER, '-m', MODEL, '--length_scale', str(speed or ls), '--noise_scale', '0.55', '--noise_w', '0.7', '-f', raw], input=text.encode(), check=True, capture_output=True)
    af = f'rubberband=pitch={pitch}:formant=preserved' if pitch != 1.0 else 'anull'
    if who == 'S': af += ',highpass=f=400,lowpass=f=3000,volume=1.3'
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
        who, fr, en, trig = it[:4]; speed = it[4] if len(it) > 4 else None
        text = plain(fr)
        a = synth(text, who, f'{D}/clips/{sid}_{n}.wav', speed)
        dur = len(a) / SR
        track.append((t, a, who))
        for sub, ev in trig:
            i = text.find(sub); assert i >= 0, (sub, text)
            TLd['events'].append([ev, round(t + dur * (i / max(1, len(text))) + 0.1, 3), sid, 0])
        TLd['lines'].append({'who': who, 'start': round(t, 3), 'end': round(t + dur, 3), 'scene': sid})
        TLd['subs'].append({'who': who, 'fr': fr, 'en': en, 'start': round(t - 0.15, 3), 'end': round(t + dur + 0.35, 3), 'scene': sid})
        t += dur + 0.7
    t += 0.4
    TLd['scenes'].append({'id': sid, 'caption': cap, 'start': round(s0, 3), 'end': round(t, 3)})
total = t
TLd['total'], TLd['fps'] = round(total, 3), FPS
n = int(total * SR) + SR
voice = np.zeros(n, np.float32)
amp = {k: np.zeros(int(total * FPS) + 2) for k in VOICE}
for st, a, who in track:
    i = int(st * SR); voice[i:i + len(a)] += a
    for f in range(int(st * FPS), int((st + len(a) / SR) * FPS) + 1):
        seg = a[max(0, int(f / FPS * SR) - i): max(0, int((f + 1) / FPS * SR) - i)]
        if len(seg): amp[who][f] = max(amp[who][f], float(np.sqrt(np.mean(seg ** 2))))
for k in amp:
    m = np.percentile(amp[k][amp[k] > 0], 90) if (amp[k] > 0).any() else 1
    amp[k] = np.clip(amp[k] / m, 0, 1)
TLd['amp'] = {k: [round(float(x), 2) for x in v] for k, v in amp.items()}
# background: a street, a quiet police station, an evening street, a café; sirens and a smoke alarm
rng = np.random.default_rng(11)
def lowpass(x, k): c = np.cumsum(np.concatenate([[0], x])); return (c[k:] - c[:-k]) / k
sfx = np.zeros(n, np.float32)
for sc in TLd['scenes']:
    i0, i1 = int(sc['start'] * SR), min(n, int(sc['end'] * SR)); L = i1 - i0
    base = lowpass(rng.standard_normal(L + 400), {'vol': 70, 'police': 60, 'accident': 90, 'feu': 50}[sc['id']])[:L]; base /= np.max(np.abs(base))
    env = np.minimum(1, np.minimum(np.arange(L), L - np.arange(L)) / (0.5 * SR))
    sfx[i0:i1] += base * env * {'vol': 0.04, 'police': 0.02, 'accident': 0.035, 'feu': 0.045}[sc['id']]
def siren(st, d, lo, hi, v, step=0.55):
    i = int(st * SR); tt = np.arange(int(d * SR)) / SR
    f = np.where((tt // step) % 2 == 0, lo, hi)
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.minimum(1, tt / 1.0) * np.minimum(1, (d - tt) / 0.6)
    x = (np.sign(np.sin(ph)) * 0.3 + np.sin(ph)) * env * v
    x = x[: max(0, n - i)]; sfx[i:i + len(x)] += x
def beep(st, k, v=0.05):
    for q in range(k):
        i = int((st + q * 0.6) * SR); tt = np.arange(int(0.25 * SR)) / SR
        x = np.sin(2 * np.pi * 3100 * tt) * v; x = x[: max(0, n - i)]; sfx[i:i + len(x)] += x
def whoosh(st, v=0.15):
    i = int(st * SR); L = int(0.5 * SR); x = lowpass(rng.standard_normal(L + 30), 30)[:L]; x = x / np.max(np.abs(x)) * np.sin(np.linspace(0, np.pi, L)) * v
    x = x[: max(0, n - i)]; sfx[i:i + len(x)] += x
for e, t0, s, d in TLd['events']:
    if e == 'grab': whoosh(t0 + 0.4)
    if e == 'bike': whoosh(t0 + 0.2, 0.12)
    if e == 'crash': whoosh(t0 + 0.5, 0.2)
    if e == 'ambulance': siren(t0 - 0.5, d + 0.4, 435, 580, 0.05)
    if e == 'smoke': beep(t0 + 0.3, 6)
    if e == 'out': siren(t0, d + 1.5, 440, 590, 0.045, 0.45)
mix = voice + sfx
mix /= max(1.0, float(np.max(np.abs(mix))) / 0.95)
with wave.open(D + '/audio.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
json.dump(TLd, open(D + '/timeline.json', 'w'), ensure_ascii=False)
print('total', round(total, 1), 's')
for s in TLd['scenes']: print(s['id'], s['start'], s['end'])
