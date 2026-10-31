# Money video (Vocab theme 24): Léa's card does not work in a café, she uses the cash machine and the bank, changes
# euros into dollars for a trip, and lends money to Camille. Whole sentences, one clear voice (Piper siwis), each
# person a little higher or lower. Writes timeline.json and audio.wav.
import json, subprocess, wave, os, re, numpy as np
D = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 22050, 30
PIPER = D + '/piper/piper'
MODEL = D + '/voices/fr-siwis-medium/fr-siwis-medium.onnx'
# W waitress, B bank adviser, C bureau de change, K Camille
VOICE = {'L': (1.0, 1.06), 'W': (1.12, 1.0), 'B': (0.92, 1.08), 'C': (1.05, 1.04), 'K': (1.1, 1.02)}

SCENES = [
 ('cafe', 'Au café · 10 h', [
   ('beat', 1.8, 'walk'),
   ('W', "Un café et un croissant : quatre euros cinquante, s'il vous plaît.", "A coffee and a croissant: four euros fifty, please.", [('quatre', 'price')]),
   ('L', "**Vous acceptez les cartes ?**", "Do you take cards?", [('cartes', 'q_card')]),
   ('W', "Oui, **sans contact**.", "Yes, contactless.", [('contact', 'tap')]),
   ('beat', 1.6, 'pay'),
   ('L', "Oh non… **ma carte ne marche pas.**", "Oh no… my card doesn't work.", []),
   ('L', "Bon, voilà un **billet** de cinq euros.", "OK, here's a five-euro note.", [('billet', 'note')]),
   ('W', "Voici votre monnaie : une **pièce** de cinquante **centimes**.", "Here's your change: a fifty-cent coin.", [('pièce', 'coin')]),
   ('L', "**Le service est compris ?**", "Is service included?", [('service', 'q_serv')]),
   ('W', "Oui, le service est compris, et la **TVA** aussi.", "Yes, service is included, and VAT too.", [('service', 'serv'), ('TVA', 'tva')]),
   ('L', "Alors, **gardez la monnaie** : c'est votre **pourboire** !", "Then keep the change: it's your tip!", [('gardez', 'tip')]),
   ('W', "Merci beaucoup, madame !", "Thank you very much, madam!", []),
   ('beat', 1.0, None),
 ]),
 ('banque', 'À la banque · 11 h', [
   ('beat', 1.8, 'walk'),
   ('L', "Bonjour ! **Où est le distributeur ?** **Je voudrais retirer de l'argent.**", "Hello! Where is the cash machine? I'd like to take out some money.", [('distributeur', 'q_atm')]),
   ('B', "Il est à l'entrée. Tapez votre **code**, et regardez votre **solde**.", "It's at the entrance. Type your PIN, and look at your balance.", [('code', 'code'), ('solde', 'solde')]),
   ('beat', 4.2, 'atm'),
   ('L', "Et je voudrais faire un **virement** à mon amie. Je dois lui **virer** cent euros.", "And I'd like to make a transfer to my friend. I have to send her a hundred euros.", [('virement', 'vir')]),
   ('B', "C'est facile, sur votre **compte** en ligne, et il n'y a pas de **frais**.", "It's easy, on your account online, and there are no fees.", [('compte', 'compte'), ('frais', 'frais')]),
   ('L', "Parfait. Et je voudrais **déposer** ce chèque.", "Perfect. And I'd like to pay in this cheque.", [('déposer', 'depot')]),
   ('B', "Très bien. Et un jour, pour acheter un appartement, je vous fais un **prêt** !", "Very good. And one day, to buy a flat, I'll give you a loan!", [('prêt', 'pret')]),
   ('beat', 1.0, None),
 ]),
 ('change', 'Au bureau de change · 14 h', [
   ('beat', 1.8, 'walk'),
   ('L', "Bonjour ! Je pars à New York. **Je voudrais changer de l'argent.**", "Hello! I'm going to New York. I'd like to change some money.", [('York', 'ny'), ('changer', 'chg')]),
   ('C', "Des **euros** en **dollars** ? Bien sûr.", "Euros into dollars? Of course.", [('euros', 'eur'), ('dollars', 'usd')]),
   ('L', "**Quel est le taux de change ?**", "What's the exchange rate?", []),
   ('C', "Un euro, c'est un dollar dix. Pour deux cents euros, deux cent vingt dollars.", "One euro is one dollar ten. For two hundred euros, two hundred and twenty dollars.", [('Un euro', 'rate'), ('deux cents', 'calc')]),
   ('L', "Et les musées de New York, c'est cher ?", "And are the New York museums expensive?", [('musées', 'museum')]),
   ('C', "Le **tarif**, c'est trente dollars. Mais certains musées sont **gratuits** !", "The price is thirty dollars. But some museums are free!", [('tarif', 'tarif'), ('gratuits', 'free')]),
   ('beat', 1.0, None),
 ]),
 ('soir', 'Le soir · avec Camille', [
   ('beat', 1.6, 'sit'),
   ('K', "Tu as **dépensé** beaucoup d'argent aujourd'hui ?", "Did you spend a lot of money today?", [('dépensé', 'spend')]),
   ('L', "Oui ! Maintenant, je dois **économiser** pour New York.", "Yes! Now I have to save for New York.", [('économiser', 'save')]),
   ('K', "Moi, je n'ai plus d'argent… Tu peux me **prêter** vingt euros ?", "I've got no money left… Can you lend me twenty euros?", [('prêter', 'lend')]),
   ('L', "D'accord. Voilà vingt euros.", "All right. Here's twenty euros.", [('Voilà', 'give')]),
   ('K', "Merci ! J'**emprunte** vingt euros, alors je te **dois** vingt euros.", "Thanks! I'm borrowing twenty euros, so I owe you twenty euros.", [('emprunte', 'borrow'), ('dois', 'owe')]),
   ('L', "Tu me les rends samedi !", "You'll give them back on Saturday!", []),
   ('beat', 2.4, 'bye'),
 ]),
]

def plain(s): return re.sub(r'\*\*', '', s)
def synth(text, who, path, speed=None):
    pitch, ls = VOICE[who]
    raw = path + '.raw.wav'
    subprocess.run([PIPER, '-m', MODEL, '--length_scale', str(speed or ls), '--noise_scale', '0.55', '--noise_w', '0.7', '-f', raw], input=text.encode(), check=True, capture_output=True)
    af = f'rubberband=pitch={pitch}:formant=preserved' if pitch != 1.0 else 'anull'
    if False: af += ',highpass=f=400,lowpass=f=3000,volume=1.3'
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
# background: a café, a bank, a busy bureau de change, a quiet evening; a beep for the card, notes and coins
rng = np.random.default_rng(13)
def lowpass(x, k): c = np.cumsum(np.concatenate([[0], x])); return (c[k:] - c[:-k]) / k
sfx = np.zeros(n, np.float32)
for sc in TLd['scenes']:
    i0, i1 = int(sc['start'] * SR), min(n, int(sc['end'] * SR)); L = i1 - i0
    base = lowpass(rng.standard_normal(L + 400), {'cafe': 60, 'banque': 70, 'change': 55, 'soir': 140}[sc['id']])[:L]; base /= np.max(np.abs(base))
    env = np.minimum(1, np.minimum(np.arange(L), L - np.arange(L)) / (0.5 * SR))
    sfx[i0:i1] += base * env * {'cafe': 0.04, 'banque': 0.02, 'change': 0.035, 'soir': 0.02}[sc['id']]
def tone(st, f, d, v, decay=6):
    i = int(st * SR); tt = np.arange(int(d * SR)) / SR
    x = np.sin(2 * np.pi * f * tt) * np.exp(-tt * decay) * v; x = x[: max(0, n - i)]; sfx[i:i + len(x)] += x
def coin(st, v=0.12):
    for k, f in enumerate([2400, 3300, 2900]): tone(st + k * 0.05, f, 0.3, v, 14)
for e, t0, s, d in TLd['events']:
    if e == 'pay': tone(t0 + 0.6, 1200, 0.18, 0.08, 1); tone(t0 + 0.85, 300, 0.4, 0.1, 2)   # the terminal says no
    if e == 'coin': coin(t0 + 0.4)
    if e == 'atm':
        for k in range(4): tone(t0 + 0.3 + k * 0.28, 1500, 0.1, 0.06, 2)
        tone(t0 + 2.6, 160, 0.9, 0.08, 1)                                                       # notes coming out
    if e == 'save': coin(t0 + 0.6, 0.14)
mix = voice + sfx
mix /= max(1.0, float(np.max(np.abs(mix))) / 0.95)
with wave.open(D + '/audio.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
json.dump(TLd, open(D + '/timeline.json', 'w'), ensure_ascii=False)
print('total', round(total, 1), 's')
for s in TLd['scenes']: print(s['id'], s['start'], s['end'])
