# Transport video (Vocab theme 22): Léa buys a train ticket in Paris, takes the train to Lyon, finds her flight home
# cancelled and drives back to Paris. Whole sentences, one clear voice (Piper siwis), each person a little higher
# or lower; station and airport announcements sound like a loudspeaker. Writes timeline.json and audio.wav.
import json, subprocess, wave, os, re, numpy as np
D = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 22050, 30
PIPER = D + '/piper/piper'
MODEL = D + '/voices/fr-siwis-medium/fr-siwis-medium.onnx'
# who: (pitch, speed). G ticket office, C ticket inspector, E airport check-in, R car hire, K Camille on the phone, A announcements
VOICE = {'L': (1.0, 1.08), 'G': (0.93, 1.06), 'C': (1.06, 1.04), 'E': (1.13, 1.04), 'R': (0.9, 1.08), 'K': (1.1, 1.02), 'A': (0.97, 1.12)}

SCENES = [
 ('gare', 'À la gare · vendredi 9 h', [
   ('beat', 2.2, 'walk'),
   ('L', "Bonjour ! Un **billet pour Lyon, s'il vous plaît.**", "Hello! A ticket to Lyon, please.", [('billet', 'ask')]),
   ('G', "Un **aller simple** ou un **aller-retour** ?", "One-way or return?", [('aller simple', 'opt_simple'), ('aller-retour', 'opt_ar')]),
   ('L', "Un aller simple. Je rentre **en avion**.", "One-way. I'm coming back by plane.", [('aller simple', 'pick_simple'), ('avion', 'plane')]),
   ('G', "En **première** ou en **seconde classe** ?", "First or second class?", [('première', 'opt_1'), ('seconde', 'opt_2')]),
   ('L', "En seconde. Et je voudrais **réserver** une **place** côté fenêtre.", "Second. And I'd like to book a window seat.", [('seconde', 'pick_2'), ('place', 'seat')]),
   ('G', "Voilà : place quarante-deux, côté fenêtre.", "Here you are: seat 42, by the window.", [('Voilà', 'ticket')]),
   ('L', "**À quelle heure part le prochain train ?**", "What time does the next train leave?", [('heure', 'board')]),
   ('G', "À dix heures. Regardez l'**horaire**, là-bas.", "At ten. Look at the timetable, over there.", [('horaire', 'board_hl')]),
   ('L', "Et **de quelle voie part le train ?**", "And which platform does the train leave from?", []),
   ('G', "**Voie** trois. Bon voyage !", "Platform three. Have a good trip!", [('Voie', 'voie3')]),
   ('beat', 1.2, None),
 ]),
 ('train', 'Dans le train · 10 h 20', [
   ('beat', 1.6, 'platform'),
   ('A', "Le train pour Lyon **a du retard**. **Départ** à dix heures vingt.", "The train to Lyon is delayed. Departure at 10:20.", [('retard', 'late'), ('Départ', 'dep')]),
   ('L', "Oh non, un **retard** ! Bon, je **composte** mon billet.", "Oh no, a delay! Right, I'll validate my ticket.", [('composte', 'compost')]),
   ('L', "Allez, je **monte** !", "Right, I'm getting on!", [('monte', 'climb')]),
   ('beat', 1.8, 'ride'),
   ('C', "Bonjour madame. Votre billet, s'il vous plaît.", "Hello madam. Your ticket, please.", [('billet', 'check')]),
   ('L', "Voilà. Le train est **direct**, ou **il faut changer ?**", "Here. Is the train direct, or do I have to change?", [('direct', 'q_direct')]),
   ('C', "C'est direct. Lyon, c'est le **terminus**.", "It's direct. Lyon is the last stop.", [('terminus', 'term')]),
   ('beat', 4.2, 'window'),
   ('A', "Lyon Part-Dieu, **terminus** du train. **Correspondance** pour Grenoble, voie sept.", "Lyon Part-Dieu, end of the line. Connection for Grenoble, platform seven.", [('Correspondance', 'corr')]),
   ('L', "C'est ici ! Je **descends**.", "This is it! I'm getting off.", [('descends', 'getoff')]),
   ('beat', 1.8, None),
 ]),
 ('aero', "À l'aéroport · dimanche 18 h", [
   ('beat', 2.0, 'walk'),
   ('L', "Bonsoir ! L'**enregistrement** pour le **vol** de Paris, c'est ici ?", "Good evening! Is the check-in for the Paris flight here?", [('enregistrement', 'desk')]),
   ('E', "Oui, madame. Vous avez un **bagage** ?", "Yes, madam. Do you have a bag?", [('bagage', 'bagq')]),
   ('L', "Oui, une valise.", "Yes, a suitcase.", [('valise', 'bag')]),
   ('E', "Voici votre carte. **Porte d'embarquement** douze.", "Here is your boarding pass. Boarding gate twelve.", [('Voici', 'pass'), ('Porte', 'gate')]),
   ('beat', 2.4, 'wait'),
   ('A', "Mesdames et messieurs, le **vol** pour Paris **est annulé**, à cause du brouillard.", "Ladies and gentlemen, the flight to Paris is cancelled because of the fog.", [('annulé', 'cancel')]),
   ('L', "Quoi ? Mon vol est annulé ? Bon… je vais louer une voiture.", "What? My flight is cancelled? Right… I'll hire a car.", [('louer', 'idea')]),
   ('beat', 1.2, None),
 ]),
 ('route', 'Sur la route · dimanche soir', [
   ('beat', 1.6, 'walk'),
   ('L', "Bonsoir ! Une **location de voiture** pour Paris, s'il vous plaît.", "Good evening! A hire car to Paris, please.", []),
   ('R', "Voici les clés. Prenez l'**autoroute**, c'est tout droit !", "Here are the keys. Take the motorway, it's straight ahead!", [('clés', 'keys'), ('autoroute', 'motorway')]),
   ('beat', 2.6, 'drive'),
   ('L', "Il me faut de l'**essence**. Voilà une **station-service** !", "I need petrol. There's a petrol station!", [('essence', 'fuel'), ('station', 'station')]),
   ('beat', 3.2, 'fill'),
   ('K', "Allô, Léa ? Tu rentres **en avion** ?", "Hello, Léa? Are you coming back by plane?", [('Allô', 'phone')]),
   ('L', "Non, mon vol est annulé ! Je rentre **en voiture**, par l'autoroute.", "No, my flight is cancelled! I'm coming back by car, on the motorway.", []),
   ('K', "En voiture ? Bon courage !", "By car? Good luck!", [('courage', 'hangup')]),
   ('beat', 2.4, 'paris'),
   ('L', "Paris ! Je laisse la voiture au **parking**…", "Paris! I'm leaving the car in the car park…", [('parking', 'park')]),
   ('L', "…et je rentre à la maison **à vélo** !", "…and I'm going home by bike!", [('vélo', 'bike')]),
   ('beat', 3.0, 'bye'),
 ]),
]

def plain(s): return re.sub(r'\*\*', '', s)
def synth(text, who, path, speed=None):
    pitch, ls = VOICE[who]
    raw = path + '.raw.wav'
    subprocess.run([PIPER, '-m', MODEL, '--length_scale', str(speed or ls), '--noise_scale', '0.55', '--noise_w', '0.7', '-f', raw], input=text.encode(), check=True, capture_output=True)
    af = f'rubberband=pitch={pitch}:formant=preserved' if pitch != 1.0 else 'anull'
    if who == 'A': af += ',highpass=f=350,lowpass=f=3200,aecho=0.8:0.5:45|90:0.3|0.15,volume=1.4'
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
        if who == 'A': t += 1.1   # room for the chime
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
# background: a station hall, a train rolling, an airport, a car engine; a chime before each announcement
rng = np.random.default_rng(7)
def lowpass(x, k): c = np.cumsum(np.concatenate([[0], x])); return (c[k:] - c[:-k]) / k
sfx = np.zeros(n, np.float32)
for sc in TLd['scenes']:
    i0, i1 = int(sc['start'] * SR), min(n, int(sc['end'] * SR)); L = i1 - i0
    base = lowpass(rng.standard_normal(L + 400), {'gare': 60, 'train': 160, 'aero': 50, 'route': 200}[sc['id']])[:L]; base /= np.max(np.abs(base))
    env = np.minimum(1, np.minimum(np.arange(L), L - np.arange(L)) / (0.5 * SR))
    tt = np.arange(L) / SR
    if sc['id'] == 'train': base = base * (0.75 + 0.25 * np.sign(np.sin(2 * np.pi * 1.1 * tt)))   # clickety-clack
    vol = {'gare': 0.04, 'train': 0.06, 'aero': 0.035, 'route': 0.055}[sc['id']]
    sfx[i0:i1] += base * env * vol
def tone(st, f, d, v):
    i = int(st * SR); tt = np.arange(int(d * SR)) / SR
    x = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 3.5) * v
    x = x[: max(0, n - i)]; sfx[i:i + len(x)] += x
for l in TLd['lines']:
    if l['who'] == 'A':
        for k, f in enumerate([523, 659, 784]): tone(l['start'] - 1.15 + k * 0.32, f, 0.9, 0.12)
def thud(st, f=90, v=0.35, d=0.18):
    i = int(st * SR); tt = np.arange(int(d * SR)) / SR
    x = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 30) * v
    x = x[: max(0, n - i)]; sfx[i:i + len(x)] += x
for e, t0, s, d in TLd['events']:
    if e == 'compost': thud(t0 + 0.9, 1400, 0.12, 0.06); thud(t0 + 0.92, 180, 0.25)
    if e == 'bag': thud(t0 + 0.9, 70, 0.4, 0.25)
    if e == 'keys':
        for k in range(4): tone(t0 + 0.3 + k * 0.07, 3000 + k * 400, 0.12, 0.05)
mix = voice + sfx
mix /= max(1.0, float(np.max(np.abs(mix))) / 0.95)
with wave.open(D + '/audio.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
json.dump(TLd, open(D + '/timeline.json', 'w'), ensure_ascii=False)
print('total', round(total, 1), 's')
for s in TLd['scenes']: print(s['id'], s['start'], s['end'])
