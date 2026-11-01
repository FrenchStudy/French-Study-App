# python3 tools/people-pages/people.py
# Makes js/people-pages.js: the picture pages of step 2 for Personality & Physical Description (12) and
# Emotions & Feelings (13), and tools/people-pages/faces.json, the faces they need (draw them with
# faces.mjs: DiceBear toon-head, CC BY 4.0, Johan Melin -> media/people/*.svg).
# Every label shows the form that fits the person (Paul est grand, Rose est petite) in blue (masculine)
# or pink (feminine); the note gives both forms. Props are Microsoft Fluent Emoji 3D (media/pictures/fe-*.webp).
import json, os
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FACES = {}

def face(who, m='smile', e='happy', b='happy'):
    name = f'{who}-{m}-{e}-{b}'
    FACES[name] = [name, who, m, e, b]
    return f'media/people/{name}.svg'

GENDER = {'paul': 'm', 'tom': 'm', 'hugo': 'm', 'rose': 'f', 'julie': 'f', 'lea': 'f'}
CLOTHES = {'paul': '#2563eb', 'tom': '#0ea5e9', 'hugo': '#16a34a', 'rose': '#7c3aed', 'julie': '#f97316', 'lea': '#b11f1f'}
NAME = {'paul': 'Paul', 'tom': 'Tom', 'hugo': 'Hugo', 'rose': 'Rose', 'julie': 'Julie', 'lea': 'Léa'}
img = lambda f, x, y, s: f'<image href="{f}" x="{x:.0f}" y="{y:.0f}" width="{s:.0f}" height="{s:.0f}"/>'
pic = lambda n, x, y, s: img(f'media/pictures/fe-{n}.webp', x, y, s)

# ---------- grid pages: one person and one or two props per cell ----------
def grid(title, cells, cols=4, cw=190, ch=214):
    rows = (len(cells) + cols - 1) // cols
    w, h = cols * cw + 20, rows * ch + 20
    items = []
    for i, c in enumerate(cells):
        cx, cy = 10 + (i % cols) * cw, 10 + (i // cols) * ch
        who, (m, e, b) = c['who'], c['face']
        d = f'<rect x="{cx + 6}" y="{cy + 6}" width="{cw - 12}" height="{ch - 12}" rx="18" fill="{c.get("bg", "#F8FAFC")}" stroke="#E2E8F0" stroke-width="2"/>'
        d += img(face(who, m, e, b), cx + cw / 2 - 66, cy + 14, 132)
        for k, p in enumerate(c.get('props', [])):   # first prop top right, second top left
            d += pic(p, cx + cw - 64 if k == 0 else cx + 12, cy + 14, 52)
        if c.get('x'):   # crossed out (je déteste les brocolis)
            d += f'<path d="M{cx + cw - 60},{cy + 22} l40,40 M{cx + cw - 20},{cy + 22} l-40,40" stroke="#E11D48" stroke-width="6" stroke-linecap="round"/>'
        g = c.get('g') or GENDER[who]
        it = {'key': c['key'], 'fr': c['fr'], 'g': g, 'en': c['en'], 'x': cx + cw / 2, 'ly': cy + ch - 34, 'd': d}
        if c.get('note'): it['note'] = c['note']
        if c.get('lines'): it['lines'] = c['lines']
        if len(c['fr']) > 15: it['fs'] = 14
        items.append(it)
    return {'title': title, 'w': w, 'h': h, 'minw': min(w, 560), 'scene': f'<rect width="{w}" height="{h}" fill="#FFFFFF"/>', 'items': items}

# ---------- full-body people (Le physique) ----------
def person(who, x, top, size, body_w, legs, face_args=('smile', 'happy', 'happy')):
    """a standing person: head (size) at top, a body body_w wide, legs long; returns (svg, feet y)"""
    col, y0 = CLOTHES[who], top + size * 0.86
    bh = size * 0.95
    s = f'<rect x="{x - body_w / 2:.0f}" y="{y0:.0f}" width="{body_w:.0f}" height="{bh:.0f}" rx="{min(28, body_w / 3):.0f}" fill="{col}"/>'
    s += f'<rect x="{x - body_w / 2 - 14:.0f}" y="{y0 + 10:.0f}" width="16" height="{bh * 0.8:.0f}" rx="8" fill="{col}"/><rect x="{x + body_w / 2 - 2:.0f}" y="{y0 + 10:.0f}" width="16" height="{bh * 0.8:.0f}" rx="8" fill="{col}"/>'
    lw = max(16, body_w * 0.26)
    s += f'<rect x="{x - body_w * 0.3 - lw / 2:.0f}" y="{y0 + bh - 8:.0f}" width="{lw:.0f}" height="{legs:.0f}" rx="6" fill="#334155"/><rect x="{x + body_w * 0.3 - lw / 2:.0f}" y="{y0 + bh - 8:.0f}" width="{lw:.0f}" height="{legs:.0f}" rx="6" fill="#334155"/>'
    feet = y0 + bh - 8 + legs
    s += f'<rect x="{x - body_w * 0.3 - lw / 2 - 6:.0f}" y="{feet - 8:.0f}" width="{lw + 10:.0f}" height="10" rx="5" fill="#1E293B"/><rect x="{x + body_w * 0.3 - lw / 2 - 4:.0f}" y="{feet - 8:.0f}" width="{lw + 10:.0f}" height="10" rx="5" fill="#1E293B"/>'
    s += img(face(who, *face_args), x - size / 2, top, size)
    return s, feet

def physique():
    W, H, floor = 740, 560, 470
    scene = f'<rect width="{W}" height="{H}" fill="#F8FAFC"/><rect y="{floor}" width="{W}" height="{H - floor}" fill="#E2E8F0"/>'
    for k, cm in enumerate(range(80, 200, 20)):   # a height chart on the wall
        y = floor - cm * 2.25
        if y < 20: continue
        scene += f'<path d="M0,{y:.0f} H{W}" stroke="#E2E8F0" stroke-width="2"/>'
    people = [   # who, x, head size, body width, leg length, face
        ('paul', 80, 118, 64, 150, ('smile', 'happy', 'happy')),
        ('tom', 200, 100, 52, 50, ('laugh', 'happy', 'happy')),
        ('hugo', 330, 112, 124, 104, ('laugh', 'happy', 'happy')),
        ('julie', 462, 110, 62, 116, ('smile', 'happy', 'happy')),
        ('rose', 578, 104, 70, 56, ('smile', 'happy', 'happy')),
        ('lea', 680, 108, 60, 110, ('smile', 'bow', 'happy')),
    ]
    drawn, items = {}, []
    for who, x, size, bw, legs, fa in people:
        # stand them on the floor: work out the top from the height of the drawing
        h = size * 0.86 + size * 0.95 - 8 + legs
        top = floor - h
        drawn[who] = (person(who, x, top, size, bw, legs, fa)[0], x, top, size, bw)
    def it(key, fr, en, who, ly, note=None, part=None, g=None, fs=None):
        svg, x, top, size, bw = drawn[who]
        d = svg if part is None else part(x, top, size, bw)
        o = {'key': key, 'fr': fr, 'g': g or GENDER[who], 'en': en, 'x': x, 'ly': ly, 'd': d}
        if note: o['note'] = note
        if fs: o['fs'] = fs
        return o
    body = lambda x, top, size, bw: f'<rect x="{x - bw / 2 - 16:.0f}" y="{top + size * 0.86:.0f}" width="{bw + 32:.0f}" height="{size * 0.95:.0f}" rx="16" fill="#000" fill-opacity="0.001"/>'
    head = lambda x, top, size, bw: f'<circle cx="{x:.0f}" cy="{top + size * 0.45:.0f}" r="{size * 0.42:.0f}" fill="#000" fill-opacity="0.001"/>'
    items = [
        it('grand / grande', 'grand', 'tall', 'paul', floor + 30, 'grand · grande. Paul est grand. Julie est grande aussi.'),
        it('mince', 'mince', 'slim', 'paul', 0, 'Same for him and her: il est mince, elle est mince.', part=body),
        it('petit / petite', 'petit', 'short, small', 'tom', floor + 30, 'petit · petite. Tom est petit. Rose est petite.'),
        it('gros / grosse', 'gros', 'big, heavy', 'hugo', floor + 30, 'gros · grosse. Careful, it can be rude about people: say plutôt « fort » or « rond ».'),
        it('jeune', 'jeune', 'young', 'julie', floor + 30, 'Same for him and her: il est jeune, elle est jeune.'),
        it('beau / belle', 'belle', 'beautiful', 'julie', 0, 'beau · belle (bel before a vowel: un bel homme). Julie est belle.', part=head),
        it('âgé / âgée', 'âgée', 'old (polite)', 'rose', floor + 30, 'âgé · âgée: the polite word for old people. Rose est âgée.'),
        it('vieux / vieille', 'vieille', 'old', 'rose', 0, 'vieux · vieille (vieil before a vowel). For people, « âgé » is kinder.', part=body),
        it('joli / jolie', 'jolie', 'pretty', 'lea', floor + 30, 'joli · jolie. Léa est jolie. Also for things: une jolie robe.'),
    ]
    # the second labels sit on the person: put them beside the body
    for o in items:
        if o['ly'] == 0:
            svg, x, top, size, bw = drawn[{'mince': 'paul', 'belle': 'julie', 'vieille': 'rose'}[o['fr']]]
            o['ly'] = top + size * 0.86 + size * 0.45 if o['fr'] != 'belle' else top - 14
    scene_people = ''.join(drawn[w][0] for w in drawn)
    # each item draws its person again; the scene keeps them all so that labels with a "part" still show the person
    return {'title': 'Le physique', 'w': W, 'h': H, 'minw': 600, 'scene': scene + scene_people, 'items': items}

def cheveux():
    cells = [
        dict(key='brun / brune', fr='brun', en='dark-haired', who='paul', face=('smile', 'happy', 'happy'), note='brun · brune: dark brown or black hair. Paul est brun.'),
        dict(key='blond / blonde', fr='blond', en='blond', who='tom', face=('laugh', 'happy', 'happy'), note='blond · blonde. Tom est blond.'),
        dict(key='roux / rousse', fr='rousse', en='red-haired', who='julie', face=('smile', 'happy', 'happy'), note='roux · rousse. Julie est rousse.'),
        dict(key='châtain', fr='châtain', en='light brown hair', who='lea', face=('smile', 'happy', 'happy'), g='x', note='Same for him and her: Léa est châtain, Paul est châtain.'),
        dict(key='chauve', fr='chauve', en='bald', who='hugo', face=('laugh', 'happy', 'happy'), note='Same for him and her: il est chauve.'),
        dict(key='lunettes', fr='des lunettes', en='glasses', who='rose', face=('smile', 'happy', 'happy'), g='f', note='des lunettes (always plural). Rose porte des lunettes.'),
        dict(key='elle a les cheveux longs.', fr='Elle a les cheveux longs.', en='She has long hair.', who='julie', face=('smile', 'bow', 'happy'), g='x', lines=['Elle a les cheveux', 'longs.']),
        dict(key='barbe', fr='la barbe', en='beard', who='hugo', face=('smile', 'happy', 'happy'), g='f', note='Hugo a une barbe.'),
        dict(key='cheveux', fr='les cheveux', en='hair', who='lea', face=('laugh', 'bow', 'happy'), g='m', note='Always plural: les cheveux. Léa a les cheveux châtains.'),
        dict(key='yeux', fr='les yeux', en='eyes', who='paul', face=('smile', 'wide', 'raised'), g='m', note='un œil, des yeux (one eye, two eyes). Il a les yeux marron.'),
    ]
    page = grid('Les cheveux', cells, cols=4)
    # glasses on Rose, a highlight on the hair, eyes, beard: drawn on top of her face in her own cell
    for it in page['items']:
        if it['fr'] == 'des lunettes':
            x0 = it['x'] - 66; y0 = it['ly'] + 34 - 214 + 6 + 8
            it['d'] += (f'<g fill="none" stroke="#1E293B" stroke-width="4"><circle cx="{x0 + 51:.0f}" cy="{y0 + 74:.0f}" r="14"/><circle cx="{x0 + 81:.0f}" cy="{y0 + 74:.0f}" r="14"/>'
                        f'<path d="M{x0 + 65:.0f},{y0 + 72:.0f} h2"/></g>')
    return page

def caractere():
    C = lambda key, fr, en, who, face, props, note=None, g=None: dict(key=key, fr=fr, en=en, who=who, face=face, props=props, note=note, g=g)
    cells = [
        C('sympa', 'sympa', 'nice, friendly', 'tom', ('smile', 'happy', 'happy'), ['waving-hand'], 'Same for him and her, and very common: il est sympa, elle est sympa.', 'x'),
        C('gentil / gentille', 'gentille', 'kind', 'julie', ('smile', 'bow', 'happy'), ['bouquet'], 'gentil · gentille. Julie est gentille : elle offre des fleurs.'),
        C('drôle', 'drôle', 'funny', 'hugo', ('laugh', 'wink', 'happy'), ['clown-face'], 'Same for him and her: il est drôle, elle est drôle.', 'x'),
        C('timide', 'timide', 'shy', 'rose', ('smile', 'humble', 'sad'), ['see-no-evil-monkey'], 'Same for him and her: il est timide, elle est timide.', 'x'),
        C('sérieux / sérieuse', 'sérieux', 'serious', 'paul', ('smile', 'happy', 'neutral'), ['books'], 'sérieux · sérieuse. Paul est sérieux : il travaille bien.'),
        C('paresseux / paresseuse', 'paresseux', 'lazy', 'tom', ('agape', 'humble', 'neutral'), ['couch-and-lamp', 'zzz'], 'paresseux · paresseuse. Tom est paresseux : il dort sur le canapé.'),
        C('travailleur / travailleuse', 'travailleuse', 'hard-working', 'lea', ('smile', 'happy', 'raised'), ['laptop'], 'travailleur · travailleuse. Léa est travailleuse.'),
        C('intelligent / intelligente', 'intelligente', 'clever', 'rose', ('smile', 'happy', 'raised'), ['light-bulb'], 'intelligent · intelligente. Rose est intelligente.'),
        C('sportif / sportive', 'sportive', 'sporty', 'julie', ('laugh', 'happy', 'happy'), ['soccer-ball'], 'sportif · sportive. Julie est sportive : elle joue au foot.'),
        C('généreux / généreuse', 'généreux', 'generous', 'hugo', ('smile', 'bow', 'happy'), ['wrapped-gift'], 'généreux · généreuse. Hugo est généreux : il offre des cadeaux.'),
        C('bavard / bavarde', 'bavarde', 'chatty', 'lea', ('laugh', 'wink', 'happy'), ['speech-balloon'], 'bavard · bavarde. Léa est bavarde : elle parle beaucoup !'),
        C('courageux / courageuse', 'courageux', 'brave', 'paul', ('smile', 'happy', 'angry'), ['flexed-biceps'], 'courageux · courageuse. Paul est courageux.'),
        C('honnête', 'honnête', 'honest', 'tom', ('smile', 'happy', 'happy'), ['handshake'], 'Same for him and her: il est honnête, elle est honnête.', 'x'),
    ]
    return grid('Le caractère', cells, cols=4)

def emotions():
    E = lambda key, fr, en, who, face, props, note=None, g=None, x=False: dict(key=key, fr=fr, en=en, who=who, face=face, props=props, note=note, g=g, x=x)
    cells = [
        E('content / contente', 'content', 'pleased, happy', 'paul', ('smile', 'happy', 'happy'), ['thumbs-up'], 'content · contente. Il est content.'),
        E('heureux / heureuse', 'heureuse', 'happy', 'lea', ('laugh', 'bow', 'happy'), ['sun'], 'heureux · heureuse: very happy, happy in life.'),
        E('triste', 'triste', 'sad', 'julie', ('sad', 'humble', 'sad'), ['droplet'], 'Same for him and her: il est triste, elle est triste.', 'x'),
        E('fâché / fâchée', 'fâché', 'cross, annoyed', 'tom', ('angry', 'happy', 'angry'), ['anger-symbol'], 'fâché · fâchée. Être fâché avec quelqu’un = to have fallen out with someone.'),
        E('en colère', 'en colère', 'angry', 'hugo', ('angry', 'wide', 'angry'), ['fire'], 'Il est en colère, elle est en colère: it does not change.', 'x'),
        E('fatigué / fatiguée', 'fatiguée', 'tired', 'lea', ('agape', 'humble', 'neutral'), ['zzz'], 'fatigué · fatiguée.'),
        E('stressé / stressée', 'stressé', 'stressed', 'paul', ('sad', 'wide', 'raised'), ['alarm-clock', 'sweat-droplets'], 'stressé · stressée.'),
        E('inquiet / inquiète', 'inquiète', 'worried', 'rose', ('sad', 'wide', 'sad'), ['red-question-mark'], 'inquiet · inquiète.'),
        E('surpris / surprise', 'surprise', 'surprised', 'julie', ('agape', 'wide', 'raised'), ['red-exclamation-mark'], 'surpris · surprise.'),
        E('déçu / déçue', 'déçu', 'disappointed', 'tom', ('sad', 'humble', 'sad'), ['chart-decreasing'], 'déçu · déçue. Not « deceived »!'),
        E('énervé / énervée', 'énervée', 'irritated, wound up', 'lea', ('angry', 'happy', 'angry'), ['collision'], 'énervé · énervée.'),
        E('fier / fière', 'fier', 'proud', 'hugo', ('smile', 'bow', 'raised'), ['trophy'], 'fier · fière.'),
        E('seul / seule', 'seule', 'alone, lonely', 'rose', ('sad', 'humble', 'sad'), ['bust-in-silhouette'], 'seul · seule.'),
        E('amoureux / amoureuse', 'amoureux', 'in love', 'paul', ('laugh', 'bow', 'happy'), ['red-heart'], 'amoureux · amoureuse. Il est amoureux de Julie.'),
    ]
    return grid('Les émotions', cells, cols=4)

def avoir():
    A = lambda key, fr, en, who, face, props, note=None: dict(key=key, fr=fr, en=en, who=who, face=face, props=props, note=note, g='x')
    cells = [
        A("j'ai faim.", "J'ai faim.", "I'm hungry.", 'tom', ('agape', 'happy', 'raised'), ['fork-and-knife-with-plate'], 'With avoir, not être: j’ai faim (not « je suis faim »).'),
        A("j'ai soif.", "J'ai soif.", "I'm thirsty.", 'julie', ('agape', 'happy', 'raised'), ['cup-with-straw'], 'avoir soif = to be thirsty.'),
        A("j'ai chaud.", "J'ai chaud.", "I'm hot.", 'hugo', ('sad', 'humble', 'raised'), ['sun', 'sweat-droplets'], 'J’ai chaud = I feel hot. (« Je suis chaud » means something else!)'),
        A("j'ai froid.", "J'ai froid.", "I'm cold.", 'lea', ('sad', 'wide', 'sad'), ['snowflake'], 'avoir froid = to be cold.'),
        A("j'ai sommeil.", "J'ai sommeil.", "I'm sleepy.", 'paul', ('agape', 'humble', 'neutral'), ['bed'], 'avoir sommeil = to be sleepy.'),
        A("j'ai peur.", "J'ai peur.", "I'm scared.", 'rose', ('agape', 'wide', 'raised'), ['ghost'], 'avoir peur de… = to be afraid of…'),
        A("j'ai honte.", "J'ai honte.", "I'm ashamed.", 'tom', ('sad', 'humble', 'sad'), ['flushed-face'], 'avoir honte = to be ashamed.'),
        A("j'ai de la chance.", "J'ai de la chance.", "I'm lucky.", 'julie', ('laugh', 'bow', 'happy'), ['four-leaf-clover'], 'avoir de la chance = to be lucky.'),
    ]
    return grid("J'ai faim, j'ai froid", cells, cols=4)

def besoin():
    B = lambda key, fr, en, who, face, props, note=None, x=False, lines=None: dict(key=key, fr=fr, en=en, who=who, face=face, props=props, note=note, g='x', x=x, lines=lines)
    cells = [
        B("j'ai raison. / j'ai tort.", "J'ai raison. / J'ai tort.", "I'm right. / I'm wrong.", 'paul', ('smile', 'happy', 'raised'), ['check-mark-button', 'cross-mark'], 'avoir raison ≠ avoir tort.', lines=["J'ai raison.", "J'ai tort."]),
        B("j'ai besoin de…", "J'ai besoin de…", "I need…", 'lea', ('sad', 'wide', 'raised'), ['umbrella-with-rain-drops'], "J'ai besoin d'un parapluie : il pleut !"),
        B("j'ai envie de…", "J'ai envie de…", "I feel like…", 'tom', ('laugh', 'bow', 'happy'), ['ice-cream'], "J'ai envie d'une glace !"),
        B('aimer', "J'aime…", 'to like, to love', 'julie', ('smile', 'bow', 'happy'), ['chocolate-bar'], "aimer: J'aime le chocolat."),
        B('adorer', "J'adore…", 'to love, to adore', 'hugo', ('laugh', 'bow', 'happy'), ['sparkling-heart'], "adorer: stronger than aimer. J'adore la musique !"),
        B('détester', 'Je déteste…', 'to hate', 'rose', ('angry', 'happy', 'angry'), ['broccoli'], 'détester: Je déteste les brocolis !', x=True),
        B('je me sens bien / mal.', 'Je me sens mal.', 'I feel well / unwell.', 'paul', ('sad', 'humble', 'sad'), ['thermometer'], 'Je me sens bien ≠ je me sens mal.'),
        B('de bonne / mauvaise humeur', 'de bonne humeur', 'in a good / bad mood', 'lea', ('laugh', 'happy', 'happy'), ['sun', 'cloud-with-rain'], 'Je suis de bonne humeur ☀ ≠ de mauvaise humeur 🌧'),
        B("j'ai le cafard.", "J'ai le cafard.", "I feel down.", 'julie', ('sad', 'humble', 'sad'), ['cloud-with-rain'], 'avoir le cafard = to feel blue (un cafard is a cockroach!).'),
    ]
    page = grid("J'aime, j'ai besoin", cells, cols=4)
    for it, c in zip(page['items'], cells):
        if c.get('x'):
            x0 = it['x'] + 95 - 64; y0 = it['ly'] + 34 - 214 + 14
            it['d'] += f'<path d="M{x0 - 2:.0f},{y0 + 4:.0f} l52,48 M{x0 + 50:.0f},{y0 + 4:.0f} l-52,48" stroke="#E11D48" stroke-width="6" stroke-linecap="round"/>'
    return page

PAGES = {
    12: {'name': 'Pictures', 'next': 'Explore the people', 'title': 'Il est comment ?', 'legend': '<b style="color:#0369a1">blue</b> = said about a man or a boy (il est grand) · <b style="color:#e11d48">pink</b> = about a woman or a girl (elle est grande) · grey = the same for both. Tap a word to see both forms.', 'credit': 'People: DiceBear toon-head (CC BY 4.0, Johan Melin) · pictures: Microsoft Fluent Emoji (MIT)',
         'scenes': [physique(), cheveux(), caractere()]},
    13: {'name': 'Faces', 'next': 'Explore the faces', 'title': 'Ça va ?', 'legend': '<b style="color:#0369a1">blue</b> = said about a man or a boy (il est grand) · <b style="color:#e11d48">pink</b> = about a woman or a girl (elle est grande) · grey = the same for both. Tap a word to see both forms.', 'credit': 'People: DiceBear toon-head (CC BY 4.0, Johan Melin) · pictures: Microsoft Fluent Emoji (MIT)',
         'scenes': [emotions(), avoir(), besoin()]},
}
for P in PAGES.values():
    for sc in P['scenes']:
        for it in sc['items']:
            it['x'] = round(it['x']); it['ly'] = round(it['ly'])
open(f'{R}/js/people-pages.js', 'w').write(
    '// people-pages.js - made by tools/people-pages/people.py (do not edit by hand).\n'
    '// Step 2 picture pages of Personality & Physical Description (12) and Emotions & Feelings (13), drawn with\n'
    '// people (media/people/*.svg, DiceBear toon-head) and Fluent Emoji props; shown by picture-page.js.\n'
    'window.PICTURE_PAGES_EXTRA = ' + json.dumps(PAGES, ensure_ascii=False, indent=1) + ';\n')
json.dump(sorted(FACES.values()), open(f'{R}/tools/people-pages/faces.json', 'w'), indent=0)
print(len(FACES), 'faces;', sum(len(sc['items']) for P in PAGES.values() for sc in P['scenes']), 'labels')
