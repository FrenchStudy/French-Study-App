# Work & School video (Vocab theme 27): Léa at school (a memory), at university, looking for a job, at the job
# interview and on her first day at the office. Whole sentences, one clear voice (Piper siwis), each person a
# little higher or lower; Q is the boss on the phone. Writes timeline.json and audio.wav.
import json, subprocess, wave, os, re, numpy as np
D = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 22050, 30
PIPER = D + '/piper/piper'
MODEL = D + '/voices/fr-siwis-medium/fr-siwis-medium.onnx'
# P the teacher, K Camille, B the boss (Q on the phone), C Sophie, a colleague
VOICE = {'L': (1.0, 1.06), 'P': (0.94, 1.06), 'K': (1.1, 1.02), 'B': (0.9, 1.06), 'Q': (0.9, 1.06), 'C': (0.88, 1.14)}

SCENES = [
 ('ecole', "Souvenir · à l'école", [
   ('beat', 3.6, 'path'),
   ('P', "Bonjour les **élèves** ! Sortez vos **cahiers** et vos **stylos**.", "Good morning, children! Take out your exercise books and your pens.", [('cahiers', 'cahier'), ('stylos', 'stylo')]),
   ('P', "Le **cours** d'aujourd'hui, c'est l'**histoire**. Regardez le **tableau** !", "Today's lesson is history. Look at the board!", [('histoire', 'hist'), ('tableau', 'board')]),
   ('L', "Madame, l'histoire, c'est ma **matière** préférée !", "Miss, history is my favourite subject!", [('matière', 'matiere')]),
   ('P', "Très bien, Léa ! Et ce soir, faites vos **devoirs**.", "Very good, Léa! And this evening, do your homework.", [('devoirs', 'hw')]),
   ('beat', 1.4, 'bell'),
   ('L', "Midi ! On va à la **cantine** !", "Midday! Let's go to the canteen!", [('cantine', 'canteen')]),
   ('beat', 1.0, None),
 ]),
 ('fac', "À l'université · juin", [
   ('beat', 1.6, 'walk'),
   ('K', "Salut, Léa ! Tu es **étudiante** en quoi ?", "Hi, Léa! What are you studying?", []),
   ('L', "**Je suis étudiante en** tourisme. J'**étudie** beaucoup : demain, je **passe un examen** !", "I'm a tourism student. I study a lot: tomorrow I'm taking an exam!", [('étudie', 'study'), ('passe', 'exam')]),
   ('K', "Tu **apprends** vite. Tu vas **réussir** !", "You learn fast. You're going to pass!", [('réussir', 'pass')]),
   ('beat', 2.2, 'results'),
   ('L', "Une bonne **note** : seize sur vingt ! J'ai réussi, je n'ai pas **échoué** !", "A good mark: sixteen out of twenty! I passed, I didn't fail!", [('note', 'note'), ('échoué', 'fail')]),
   ('K', "Bravo ! Maintenant, tu as ton **diplôme** !", "Well done! Now you have your degree!", [('diplôme', 'diploma')]),
   ('beat', 1.0, None),
 ]),
 ('emploi', 'Chercher un emploi · lundi', [
   ('beat', 1.4, 'sit'),
   ('L', "Je suis au **chômage**. Je dois **chercher un emploi**.", "I'm unemployed. I have to look for a job.", [('chômage', 'jobless')]),
   ('L', "Voilà une annonce : une **entreprise** de voyages cherche une assistante. J'envoie mon **CV** !", "Here's an ad: a travel company is looking for an assistant. I'll send my CV!", [('annonce', 'ad'), ('CV', 'cv')]),
   ('beat', 1.8, 'ring'),
   ('Q', "Allô, madame Morel ? Vous êtes libre demain, à dix heures ?", "Hello, Ms Morel? Are you free tomorrow, at ten?", [('Allô', 'phone')]),
   ('L', "Oui, bien sûr ! Merci ! … **J'ai un entretien demain !**", "Yes, of course! Thank you! … I've got an interview tomorrow!", [('entretien', 'interview')]),
   ('beat', 1.0, None),
 ]),
 ('entretien', "L'entretien · mardi 10 h", [
   ('beat', 1.6, 'walk'),
   ('B', "Bonjour ! Je suis la **patronne** de l'entreprise. Quel est votre **métier** ?", "Hello! I'm the boss of the company. What's your job?", [('patronne', 'boss'), ('métier', 'job')]),
   ('L', "Je suis assistante. Je **travaille** bien, et je parle anglais.", "I'm an assistant. I work well, and I speak English.", [('travaille', 'work')]),
   ('B', "Le **travail** est **à plein temps**. Ou **à temps partiel**, si vous préférez.", "The job is full time. Or part time, if you prefer.", [('plein', 'full'), ('partiel', 'part')]),
   ('L', "À plein temps, s'il vous plaît. Et le **salaire** ?", "Full time, please. And the salary?", [('plein', 'pick_full'), ('salaire', 'salary')]),
   ('B', "Vous **gagnez** deux mille euros par mois. Voici le **contrat** !", "You earn two thousand euros a month. Here's the contract!", [('gagnez', 'earn'), ('contrat', 'contract')]),
   ('beat', 1.6, 'shake'),
 ]),
 ('bureau', 'Au bureau · premier jour', [
   ('beat', 1.6, 'walk'),
   ('C', "Bienvenue ! Je suis Sophie, ta **collègue**. Voici ton **bureau**.", "Welcome! I'm Sophie, your colleague. Here's your desk.", [('collègue', 'coll'), ('bureau', 'desk')]),
   ('L', "Merci ! **Je travaille chez** Voyages Soleil : c'est génial !", "Thank you! I work at Voyages Soleil: it's great!", [('chez', 'chez')]),
   ('C', "À onze heures, il y a une **réunion** avec la patronne.", "At eleven there's a meeting with the boss.", [('réunion', 'meeting')]),
   ('C', "Et en août, on a trois semaines de **vacances** !", "And in August we have three weeks' holiday!", [('vacances', 'holiday')]),
   ('L', "Super ! Et toi, tu travailles ici depuis longtemps ?", "Great! And you, have you worked here for long?", []),
   ('C', "Trente ans ! L'année prochaine, je pars à la **retraite**.", "Thirty years! Next year, I'm retiring.", [('retraite', 'retire')]),
   ('beat', 2.4, 'bye'),
 ]),
]

def plain(s): return re.sub(r'\*\*', '', s)
def synth(text, who, path, speed=None):
    pitch, ls = VOICE[who]
    raw = path + '.raw.wav'
    subprocess.run([PIPER, '-m', MODEL, '--length_scale', str(speed or ls), '--noise_scale', '0.55', '--noise_w', '0.7', '-f', raw], input=text.encode(), check=True, capture_output=True)
    af = f'rubberband=pitch={pitch}:formant=preserved' if pitch != 1.0 else 'anull'
    if who == 'Q': af += ',highpass=f=400,lowpass=f=3000,volume=1.3'
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
# background: a classroom, a university hall, a quiet flat, an office; a school bell, a phone, a handshake
rng = np.random.default_rng(17)
def lowpass(x, k): c = np.cumsum(np.concatenate([[0], x])); return (c[k:] - c[:-k]) / k
sfx = np.zeros(n, np.float32)
for sc in TLd['scenes']:
    i0, i1 = int(sc['start'] * SR), min(n, int(sc['end'] * SR)); L = i1 - i0
    base = lowpass(rng.standard_normal(L + 400), 70)[:L]; base /= np.max(np.abs(base))
    env = np.minimum(1, np.minimum(np.arange(L), L - np.arange(L)) / (0.5 * SR))
    sfx[i0:i1] += base * env * {'ecole': 0.035, 'fac': 0.03, 'emploi': 0.015, 'entretien': 0.015, 'bureau': 0.03}[sc['id']]
def tone(st, f, d, v, decay=4):
    i = int(st * SR); tt = np.arange(int(d * SR)) / SR
    x = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt)) * np.exp(-tt * decay) * v
    x = x[: max(0, n - i)]; sfx[i:i + len(x)] += x
for e, t0, s, d in TLd['events']:
    if e == 'bell':
        for k in range(8): tone(t0 + 0.1 + k * 0.12, 1800, 0.25, 0.05, 8)
    if e == 'ring':
        for k in range(2): tone(t0 + 0.2 + k * 0.6, 880, 0.4, 0.06, 6)
    if e == 'results' or e == 'diploma': tone(t0 + 0.6, 1046, 0.6, 0.05, 3); tone(t0 + 0.75, 1318, 0.8, 0.05, 3)
mix = voice + sfx
mix /= max(1.0, float(np.max(np.abs(mix))) / 0.95)
with wave.open(D + '/audio.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
json.dump(TLd, open(D + '/timeline.json', 'w'), ensure_ascii=False)
print('total', round(total, 1), 's')
for s in TLd['scenes']: print(s['id'], s['start'], s['end'])
