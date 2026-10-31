# Greetings video (Vocab theme 1): Léa says hello to her neighbour (vous), at a new office (vous),
# and to her friend Camille and Camille's little sister (tu). Whole sentences, one clear voice (Piper siwis),
# each person a little higher or lower. Writes timeline.json and audio.wav.
import json, subprocess, wave, os, re, numpy as np
D = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 22050, 30
PIPER = D + '/piper/piper'
MODEL = D + '/voices/fr-siwis-medium/fr-siwis-medium.onnx'
# who: (pitch, speed): Léa as she is; Mme Dubois lower and slower; Mme Martin a little lower; Camille higher; Zoé (a child) higher still
VOICE = {'L': (1.0, 1.08), 'D': (0.9, 1.22), 'M': (0.95, 1.05), 'K': (1.1, 1.02), 'Z': (1.24, 1.0)}

SCENES = [
 ('matin', 'Le matin · dans la rue', [
   ('beat', 2.4, 'walk'),
   ('L', "**Bonjour**, madame Dubois !", "Good morning, Mrs Dubois!", [('Bonjour', 'hello')]),
   ('D', "Bonjour, Léa ! **Comment allez-vous ?**", "Hello, Léa! How are you?", []),
   ('L', "**Ça va bien, merci.** Et vous ?", "I'm fine, thank you. And you?", []),
   ('D', "Oh, **comme ci, comme ça**… J'ai mal au dos.", "Oh, so-so… My back hurts.", [('mal au dos', 'back')]),
   ('L', "Oh, je suis **désolée** ! **Bonne journée**, madame.", "Oh, I'm sorry! Have a nice day.", []),
   ('D', "**Merci beaucoup**. **Au revoir**, Léa !", "Thank you very much. Goodbye, Léa!", [('Au revoir', 'wave')]),
   ('beat', 2.4, 'leave'),
 ]),
 ('bureau', 'Au bureau · 9 h', [
   ('beat', 2.2, 'walk'),
   ('L', "Bonjour ! **Excusez-moi**, madame…", "Hello! Excuse me, madam…", []),
   ('M', "Bonjour ! Oui ? **Comment vous appelez-vous ?**", "Hello! Yes? What is your name?", []),
   ('L', "**Je m'appelle** Léa. Mon **nom de famille**, c'est Morel.", "My name is Léa. My surname is Morel.", [('Léa', 'prenom'), ('nom de famille', 'nom')]),
   ('M', "**Enchantée**, Léa. Moi, je suis madame Martin.", "Pleased to meet you, Léa. I am Mrs Martin.", [('Enchantée', 'shake')]),
   ('L', "Enchantée, madame.", "Pleased to meet you, madam.", []),
   ('M', "Votre bureau est au troisième étage, à gauche après l'ascenseur, la deuxième porte sur la droite.", "Your office is on the third floor, left after the lift, the second door on the right.", [('Votre', 'fast')], 0.72),
   ('L', "**Pardon**, **je ne comprends pas**. **Parlez plus lentement, s'il vous plaît.**", "Sorry, I don't understand. Speak more slowly, please.", [('Pardon', 'lost')]),
   ('M', "Troisième étage… à gauche… deuxième porte.", "Third floor… on the left… second door.", [('Troisième', 'sign')], 1.45),
   ('L', "Ah, d'accord ! **Merci** !", "Ah, I see! Thank you!", []),
   ('M', "**Je vous en prie.**", "You're welcome.", []),
   ('beat', 1.6, None),
 ]),
 ('soir', 'Le soir · au café', [
   ('beat', 2.4, 'walk'),
   ('L', "**Bonsoir**, Camille ! **Excuse-moi**, je suis en retard.", "Good evening, Camille! Sorry, I'm late.", [('Bonsoir', 'bise')]),
   ('K', "**Salut**, Léa ! Ce n'est pas grave. **Ça va ?**", "Hi, Léa! It doesn't matter. How are you?", []),
   ('L', "Oui, ça va bien. Et toi ?", "Yes, I'm fine. And you?", [('Oui', 'sit')]),
   ('K', "Super ! Voici ma petite sœur.", "Great! This is my little sister.", [('Voici', 'zoe')]),
   ('L', "Salut ! **Comment tu t'appelles ?**", "Hi! What's your name?", []),
   ('Z', "Je m'appelle Zoé !", "My name is Zoé!", []),
   ('K', "Tu veux du sucre ?", "Do you want some sugar?", [('sucre', 'sugar')]),
   ('L', "**Oui**, **s'il te plaît**. Merci !", "Yes, please. Thank you!", []),
   ('K', "**De rien** !", "You're welcome!", []),
   ('beat', 1.8, None),
   ('L', "Bon, il est tard. **Bonne nuit**, Camille ! **À demain** !", "Right, it's late. Good night, Camille! See you tomorrow!", [('Bonne nuit', 'stand')]),
   ('K', "**Bonne soirée** ! **À bientôt** !", "Have a nice evening! See you soon!", [('Bonne', 'wave')]),
   ('beat', 2.4, 'bye'),
 ]),
]

def plain(s): return re.sub(r'\*\*', '', s)
def synth(text, who, path, speed=None):
    pitch, ls = VOICE[who]
    raw = path + '.raw.wav'
    subprocess.run([PIPER, '-m', MODEL, '--length_scale', str(speed or ls), '--noise_scale', '0.55', '--noise_w', '0.7', '-f', raw], input=text.encode(), check=True, capture_output=True)
    af = f'rubberband=pitch={pitch}:formant=preserved' if pitch != 1.0 else 'anull'
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
# background: birds and a little traffic in the street, a quiet office hum, a café in the evening
rng = np.random.default_rng(5)
def lowpass(x, k): c = np.cumsum(np.concatenate([[0], x])); return (c[k:] - c[:-k]) / k
sfx = np.zeros(n, np.float32)
for sc in TLd['scenes']:
    i0, i1 = int(sc['start'] * SR), min(n, int(sc['end'] * SR)); L = i1 - i0
    base = lowpass(rng.standard_normal(L + 400), 80 if sc['id'] != 'soir' else 50)[:L]; base /= np.max(np.abs(base))
    env = np.minimum(1, np.minimum(np.arange(L), L - np.arange(L)) / (0.5 * SR))
    vol = {'matin': 0.035, 'bureau': 0.02, 'soir': 0.045}[sc['id']]
    sfx[i0:i1] += base * env * vol
    if sc['id'] == 'matin':   # a few short bird chirps
        for k in range(6):
            st = i0 + int((1.5 + k * 3.7) * SR); tt = np.arange(int(0.18 * SR)) / SR
            ch = np.sin(2 * np.pi * (3200 + 1400 * np.sin(tt * 60)) * tt) * np.exp(-tt * 18) * 0.05
            sfx[st:st + len(ch)] += ch[: max(0, n - st)]
mix = voice + sfx
mix /= max(1.0, float(np.max(np.abs(mix))) / 0.95)
with wave.open(D + '/audio.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
json.dump(TLd, open(D + '/timeline.json', 'w'), ensure_ascii=False)
print('total', round(total, 1), 's')
for s in TLd['scenes']: print(s['id'], s['start'], s['end'])
