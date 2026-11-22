# tools/by-ear/build.py - writes content/by-ear/{verbs,words,lexique}.json from the three "by ear" study pages
# (French Verbs by Ear, French Words A1-C2 by Ear, Mon lexique TCF). The app shows English-only memory hooks,
# so the hooks that lean on Hindi or Marathi sound-alikes are replaced by the English ones below.
#   python3 tools/by-ear/build.py VERBS.json WORDS.json LEXIQUE.json
import json, os, re, sys
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(R, 'content', 'by-ear')

VERB_HOOKS = {
    'mettre': 'You MET the box and PUT it down. Also comMIT, adMIT, transMIT: put across. mettre means put.',
    'croire': 'CREDO, CREED, CREDIBLE: what you BELIEVE. croire means believe.',
    'jouer': 'A JOUst was a game: you PLAY with JOY. jouer means play.',
    'perdre': 'PERDition means being lost. perdre means lose.',
    'ajouter': 'a-JOO-tay: ADD a JOT to the list. ajouter means add.',
    'tirer': 'You PULL a heavy load until you TIRE; a sniper fires (tire) a shot. tirer means pull, shoot.',
    'acheter': 'ash-TAY: "a CHIT, eh?": you get a chit (receipt) when you BUY. acheter means buy.',
    'mourir': 'MORtal and MORtuary. mourir means die.',
    'attirer': 'ATTRACT: a + tirer (pull) = pull towards.',
    'lutter': 'You STRUGGLE and FIGHT to keep your LOOT. (la lutte means wrestling)',
    'gérer': 'A manager keeps the GEARS turning. gérer means manage; un gérant is a manager.',
    'asseoir': 'aSSEOIR sounds like "a seat": s\'asseoir means sit down; assis means seated.',
    'briser': 'A BREEZE that BREAKS the glass. briser means break, smash.',
    'arracher': 'a-ra-SHAY: a RASH pull: you tear a plant out. arracher means pull out, tear up.',
    'gêner': 'Something GÊNANT GNAWS at you. gêner means bother, embarrass.',
    'soucier': 'SOUCI sounds like "so see": you keep looking because you CARE. (souci means worry)',
    'vieillir': 'vieux means old: think VETERAN. vieillir means grow old.',
    'parier': 'PARI-mutuel betting: parier means bet.',
    'étirer': 'é + tirer (pull): pull it out, stretch.',
}
WORD_HOOKS = {
    'de rien': '"of nothing": rien = nothing. It\'s nothing.',
    'Ça va bien, merci.': '"It goes well, thanks": ça va = it goes.',
    'Ça va ?': '"It goes?": how\'s it going?',
    "que / qu'": 'QUEstion starts with "que": que asks what.',
    'quoi': '"kwa": a duck asking "what?": quack, quoi?',
    'quand': '"kahn": QUAND and WHEN come from the same Latin word, quando.',
    'pourquoi': 'pour (for) + quoi (what) = "for what?" = why.',
    'quel / quelle': '"kel": QUALity: which one? quel = which.',
    "Qu'est-ce que c'est ?": '"What is it that it is?" Kes-kuh-say: what\'s this?',
    'Quand est-ce que… ?': 'quand (when) + est-ce que (question marker).',
    "C'est quoi ?": '"It\'s what?" quoi = what.',
    'en dehors de': 'dehors = outside: out of the DOORS.',
    '1 · un / une': '"uhn": UNit, UNIty: one.',
    '4 · quatre': '"katr": QUARTER = four.',
    '5 · cinq': '"sank": SINK five fingers in water.',
    '20 · vingt': '"van": a VAN with twenty seats.',
    '1 000 000 000 · un milliard': 'A MILLIARD is a thousand millions = a billion.',
    'la rue': '"roo": a ROUTE through town = street.',
    'jeudi': 'JUPITER\'s (Jove\'s) day = Thursday.',
    'mercredi': 'MERCURY\'s day = Wednesday.',
    'vendredi': 'VENUS\'s day = Friday.',
    'samedi': 'SATURday (sabbath) = Saturday.',
    'hier': '"yair": "YESTERDAY? YEAH, here!"',
    'jamais': '"zha-MAY": JAMAIS = never in MAY.',
    'le ciel': '"syel": CELestial = sky.',
    'la mère': 'MATERnal: mère = mother.',
    'vert / verte': '"vair": VERDANT green.',
    'kaki': 'KHAKI: the same dusty green-brown.',
    "l'assiette": '"a-SYET": ASSIETTE sounds like "a set" plate.',
    'le thé': 'TEA ("tay").',
    'porter / mettre': 'porter = wear (carry, PORTER) / mettre = put on (you MET the hat on your head).',
    'le pyjama': 'PYJAMAS: the same word.',
    'le nez': 'NOSE ("nay").',
    'la peau': '"poh": a POUCH of skin.',
    'la douane': '"dwan": from Arabic "diwan" (office): the customs office.',
    'jouer': VERB_HOOKS['jouer'], 'ajouter': VERB_HOOKS['ajouter'], 'acheter': VERB_HOOKS['acheter'],
    'gérer': VERB_HOOKS['gérer'], 'croire': VERB_HOOKS['croire'],
    'le pote': '"pot": a mate you share a POT with = buddy.',
    'la nana': '"na-NA": a girl (slang). Not grandma!',
}
BAD_CASE = re.compile(r'\bteer\b')   # the Hindi word, not the stressed syllable TEER
BAD = re.compile(r'hindi|marathi|\bmitti\b|\bjodn?e?\b|\bkhara\b|\bmarna\b|\bkya\b|\bkab\b|\bjuaa\b|\bparda\b|\bgherna\b|\baasan\b|\bbikhar\b|\bsoch\b|\bkal\b', re.I)

def bad(t): return bool(BAD.search(t) or BAD_CASE.search(t))

def base(v): return v[3:] if v.startswith('se ') else v[2:] if v.startswith("s'") else v

def main(vp, wp, lp):
    os.makedirs(OUT, exist_ok=True)
    V = json.load(open(vp, encoding='utf-8'))
    keep = ['o', 'r', 'l', 'v', 'e', 't', 'm', 'a', 'pp', 'p', 'en', 'rf', 'im', 'fu', 'co', 'su', 'ip', 'pic', 'n']
    out = []
    for d in V:
        if base(d['v']) in VERB_HOOKS and d.get('m'): d['m'] = VERB_HOOKS[base(d['v'])]
        out.append({k: d[k] for k in keep if k in d and d[k] not in ('', None)})
    W = json.load(open(wp, encoding='utf-8'))
    for d in W['words']:
        if d['v'] in WORD_HOOKS: d['m'] = WORD_HOOKS[d['v']]
    X = json.load(open(lp, encoding='utf-8'))
    left = [d['v'] for d in out if bad(d.get('m', ''))] + [d['v'] for d in W['words'] if bad(d.get('m', ''))] \
        + [d['fr'] for d in X['words'] if any(bad(h) for h in d.get('h', []))]
    if left: sys.exit('Hooks still using Hindi or Marathi: ' + ', '.join(left))
    def dump(obj, name):
        open(os.path.join(OUT, name), 'w', encoding='utf-8').write(json.dumps(obj, ensure_ascii=False, separators=(',', ':')))
    dump(out, 'verbs.json'); dump(W, 'words.json'); dump(X, 'lexique.json')
    print('verbs', len(out), 'words', len(W['words']), 'lexique', len(X['words']))

if __name__ == '__main__': main(*sys.argv[1:4])
