# Hotel video (Vocab theme 23): the hotel is full, so Léa finds a room in a chambre d'hôte by the sea, sorts out the
# price and breakfast, then asks for a towel, a pillow and a blanket. Whole sentences, one clear voice (Piper siwis),
# each person a little higher or lower; Q is Mme Leroy on the phone. Writes timeline.json and audio.wav.
import json, subprocess, wave, os, re, numpy as np
D = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 22050, 30
PIPER = D + '/piper/piper'
MODEL = D + '/voices/fr-siwis-medium/fr-siwis-medium.onnx'
# H hotel receptionist, U Mme Durand (a guest), O Mme Leroy (chambre d'hôte), Q Mme Leroy on the phone
VOICE = {'L': (1.0, 1.08), 'H': (1.07, 1.04), 'U': (0.9, 1.18), 'O': (0.95, 1.1), 'Q': (0.95, 1.1)}

SCENES = [
 ('hotel', "À l'hôtel · samedi 20 h", [
   ('beat', 1.6, 'walk'),
   ('U', "Bonsoir ! **J'ai réservé une chambre au nom de** Durand.", "Good evening! I booked a room in the name of Durand.", [('Durand', 'resa')]),
   ('H', "Oui, madame Durand. Chambre douze, avec deux **lits jumeaux**. Voici la clé.", "Yes, Mrs Durand. Room twelve, with twin beds. Here is the key.", [('lits', 'twin'), ('clé', 'key1')]),
   ('beat', 1.8, 'swap'),
   ('L', "Bonsoir ! **Vous avez une chambre libre ?**", "Good evening! Do you have a room free?", [('chambre', 'ask')]),
   ('H', "Désolée, madame, l'**hôtel** est **complet** ce soir.", "Sorry, madam, the hotel is full tonight.", [('complet', 'full')]),
   ('L', "Oh non ! Il y a une **auberge de jeunesse** près d'ici ?", "Oh no! Is there a youth hostel near here?", [('auberge', 'auberge')]),
   ('H', "Elle est complète aussi. Essayez la **chambre d'hôte** de madame Leroy, rue de la Mer.", "It's full too. Try Mrs Leroy's guest house, rue de la Mer.", [('complète', 'auberge_full'), ("chambre d'hôte", 'cdh')]),
   ('L', "Merci beaucoup !", "Thank you very much!", []),
   ('beat', 1.6, 'leave'),
 ]),
 ('accueil', "À la chambre d'hôte · 20 h 30", [
   ('beat', 2.0, 'walk'),
   ('L', "Bonsoir, madame ! **Je voudrais une chambre pour deux nuits.**", "Good evening! I'd like a room for two nights.", [('deux nuits', 'nights')]),
   ('O', "Bien sûr. Une **chambre simple** ou une **chambre double** ?", "Of course. A single room or a double room?", [('simple', 'opt_s'), ('double', 'opt_d')]),
   ('L', "Une chambre simple. **Avec vue sur la mer**, si possible !", "A single room. With a sea view, if possible!", [('simple', 'pick_s'), ('vue', 'sea')]),
   ('O', "Oui, j'ai une chambre avec vue sur la mer. Le **prix par nuit**, c'est soixante-dix euros.", "Yes, I have a room with a sea view. The price per night is seventy euros.", [('prix', 'price')]),
   ('L', "Le **petit-déjeuner** est **compris** ?", "Is breakfast included?", [('compris', 'q_bf')]),
   ('O', "Oui, il est compris. La **demi-pension**, avec le dîner, c'est vingt euros de plus.", "Yes, it's included. Half board, with dinner, is twenty euros more.", [('Oui', 'bf_yes'), ('demi-pension', 'demi')]),
   ('L', "Non merci. **À quelle heure est le petit-déjeuner ?**", "No thank you. What time is breakfast?", [('Non', 'no_demi'), ('heure', 'q_time')]),
   ('O', "De huit heures à dix heures. Il y a une **caution** de cent euros, et le **départ**, c'est avant onze heures.", "From eight to ten. There's a hundred-euro deposit, and you leave before eleven.", [('huit', 'time'), ('caution', 'caution'), ('départ', 'depart')]),
   ('L', "D'accord. Et le **wifi** ?", "All right. And the wifi?", [('wifi', 'wifi')]),
   ('O', "Le code est sur la porte. Voici votre clé, et bienvenue !", "The code is on the door. Here's your key, and welcome!", [('Voici', 'key')]),
   ('beat', 1.4, None),
 ]),
 ('chambre', 'Dans la chambre · 21 h', [
   ('beat', 2.2, 'walk'),
   ('L', "Oh, la belle **vue sur la mer** !", "Oh, what a lovely sea view!", [('vue', 'window')]),
   ('L', "Brr, il fait froid ! Oh non, ça, c'est la **climatisation** !", "Brr, it's cold! Oh no, that's the air conditioning!", [('Brr', 'cold'), ('climatisation', 'ac')]),
   ('L', "Voilà, le **chauffage**.", "There, the heating.", [('chauffage', 'heat')]),
   ('beat', 1.0, 'bath'),
   ('L', "Il y a un **sèche-cheveux**, mais pas de serviette…", "There's a hairdryer, but no towel…", [('sèche', 'dryer'), ('serviette', 'notowel')]),
   ('beat', 1.2, 'phone'),
   ('L', "Allô, madame Leroy ? Je voudrais une **serviette en plus**, s'il vous plaît. Et un autre **oreiller** ?", "Hello, Mrs Leroy? I'd like an extra towel, please. And another pillow?", [('serviette', 'ask_towel'), ('oreiller', 'ask_pillow')]),
   ('Q', "Bien sûr ! J'arrive, avec une **couverture** aussi : la nuit, il fait froid.", "Of course! I'm coming, with a blanket too: it's cold at night.", [('couverture', 'ask_blanket')]),
   ('beat', 2.4, 'knock'),
   ('O', "Voilà ! Et des **draps** propres pour demain.", "Here you are! And clean sheets for tomorrow.", [('Voilà', 'give'), ('draps', 'sheets')]),
   ('L', "Merci, madame ! Bonne nuit !", "Thank you! Good night!", []),
   ('O', "Bonne nuit ! Le petit-déjeuner, c'est à huit heures.", "Good night! Breakfast is at eight.", [('Bonne', 'leave')]),
   ('beat', 2.6, 'bye'),
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
# background: a quiet lobby, the sea through the window; a desk bell, a knock on the door, the phone ringing
rng = np.random.default_rng(9)
def lowpass(x, k): c = np.cumsum(np.concatenate([[0], x])); return (c[k:] - c[:-k]) / k
sfx = np.zeros(n, np.float32)
for sc in TLd['scenes']:
    i0, i1 = int(sc['start'] * SR), min(n, int(sc['end'] * SR)); L = i1 - i0
    base = lowpass(rng.standard_normal(L + 400), {'hotel': 60, 'accueil': 90, 'chambre': 120}[sc['id']])[:L]; base /= np.max(np.abs(base))
    tt = np.arange(L) / SR
    if sc['id'] != 'hotel': base = base * (0.55 + 0.45 * np.sin(2 * np.pi * tt / 6.5) ** 2)   # waves
    env = np.minimum(1, np.minimum(np.arange(L), L - np.arange(L)) / (0.5 * SR))
    sfx[i0:i1] += base * env * {'hotel': 0.03, 'accueil': 0.045, 'chambre': 0.05}[sc['id']]
def tone(st, f, d, v, decay=3.5):
    i = int(st * SR); tt = np.arange(int(d * SR)) / SR
    x = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt)) * np.exp(-tt * decay) * v
    x = x[: max(0, n - i)]; sfx[i:i + len(x)] += x
def knock(st, v=0.4):
    for k in range(3):
        i = int((st + k * 0.22) * SR); tt = np.arange(int(0.08 * SR)) / SR
        x = np.sin(2 * np.pi * 110 * tt) * np.exp(-tt * 60) * v + rng.standard_normal(len(tt)) * np.exp(-tt * 80) * v * 0.3
        x = x[: max(0, n - i)]; sfx[i:i + len(x)] += x
for e, t0, s, d in TLd['events']:
    if e == 'walk' and s == 'hotel': tone(t0 + 0.2, 2600, 1.4, 0.12, 2.5)       # the desk bell
    if e == 'swap': tone(t0 + 0.9, 2600, 1.4, 0.10, 2.5)
    if e == 'phone':
        for k in range(2): tone(t0 + 0.1 + k * 0.5, 880, 0.35, 0.06, 6)
    if e == 'knock': knock(t0 + 0.2)
mix = voice + sfx
mix /= max(1.0, float(np.max(np.abs(mix))) / 0.95)
with wave.open(D + '/audio.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
json.dump(TLd, open(D + '/timeline.json', 'w'), ensure_ascii=False)
print('total', round(total, 1), 's')
for s in TLd['scenes']: print(s['id'], s['start'], s['end'])
