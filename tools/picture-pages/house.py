# Builds PAGES[15] (La Maison & Les Pièces) for js/picture-page.js: three scenes drawn in SVG,
# furniture from media/pictures (Microsoft Fluent Emoji 3D, MIT). Run: python3 tools/picture-pages/house.py
# It replaces the block between "// ---------------- 15 " and the next "// ---------------- " in js/picture-page.js.
import os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')

def img(f, cx, bottom, sz):
    return f'<image href="media/pictures/{f}.webp" x="{cx - sz / 2:g}" y="{bottom - sz:g}" width="{sz}" height="{sz}"/>'

def room(x0, x1, y0, y1, fill, extra=''):
    return f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="{fill}"/>' + extra

def item(key, fr, g, en, x, ly, d, lines=None, fs=None, pl=False, nobox=False):
    return dict(key=key, fr=fr, g=g, en=en, x=x, ly=ly, d=d, lines=lines, fs=fs, pl=pl, nobox=nobox)

# ---------------- scene 1: la maison (a house cut open) ----------------
WALL = '#CDB89A'
s1_scene = f'''<defs><linearGradient id="h-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE3F7"/><stop offset="1" stop-color="#E9F6FD"/></linearGradient>
 <linearGradient id="h-earth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9C7550"/><stop offset="1" stop-color="#7A5636"/></linearGradient></defs>
 <rect width="900" height="474" fill="url(#h-sky)"/><circle cx="855" cy="58" r="26" fill="#FFE27A"/>
 <rect y="474" width="900" height="166" fill="url(#h-earth)"/><rect y="466" width="900" height="10" fill="#7CC36A"/>
 <rect x="170" y="190" width="592" height="284" fill="{WALL}"/><rect x="170" y="476" width="580" height="126" fill="#8E8A84"/>
 <rect x="182" y="320" width="556" height="8" fill="#A8916F"/>'''

stairs = '<path d="M288,470 L392,330 L392,470Z" fill="#B98B5E"/>' + ''.join(
    f'<path d="M{288 + k * 13},{470 - k * 17.5} h13 v{17.5}" fill="none" stroke="#8C6440" stroke-width="2"/>' for k in range(8))
s1 = [
    item('maison', 'la maison', 'f', 'house', 75, 150, img('maison', 75, 128, 110)),
    item('toit', 'le toit', 'm', 'roof', 690, 112,
         '<path d="M150,196 L460,52 L770,196Z M214,188 L460,96 L706,188Z" fill-rule="evenodd" fill="#B5543A"/><path d="M150,196 L460,52 L770,196" fill="none" stroke="#8E3E29" stroke-width="5" stroke-linejoin="round"/>'),
    item('grenier', 'le grenier', 'm', 'attic', 460, 162,
         '<path d="M214,188 L460,96 L706,188Z" fill="#EBDDC6"/><rect x="560" y="164" width="34" height="24" fill="#C79A64"/><rect x="598" y="170" width="26" height="18" fill="#B38655"/><rect x="300" y="168" width="30" height="20" fill="#C79A64"/>'),
    item('premier étage', 'le premier étage', 'm', 'first floor', 85, 254,
         '<rect x="12" y="200" width="146" height="118" rx="12" fill="#EEF2FF" stroke="#A5B4FC" stroke-width="2"/><path d="M158,259 L170,259" stroke="#A5B4FC" stroke-width="2"/>', fs=13),
    item('rez-de-chaussée', 'le rez-de-chaussée', 'm', 'ground floor', 85, 395,
         '<rect x="12" y="330" width="146" height="138" rx="12" fill="#EEF2FF" stroke="#A5B4FC" stroke-width="2"/><path d="M158,399 L170,399" stroke="#A5B4FC" stroke-width="2"/>', fs=13),
    item('chambre', 'la chambre', 'f', 'bedroom', 287, 224,
         room(182, 330, 198, 320, '#F6E7EF', '<rect x="252" y="292" width="70" height="24" rx="5" fill="#8FB3D9"/><rect x="252" y="284" width="20" height="12" rx="4" fill="#fff"/>')),
    item('fenêtre', 'la fenêtre', 'f', 'window', 218, 282,
         '<rect x="193" y="210" width="50" height="50" rx="3" fill="#BFE3F7" stroke="#fff" stroke-width="5"/><path d="M218,212 V258 M195,235 H241" stroke="#fff" stroke-width="3"/>', fs=14),
    item('salle de bains', 'la salle de bains', 'f', 'bathroom', 457, 222,
         room(392, 522, 198, 320, '#E3F2FB', '<path d="M410,296 h70 v6 q0,14 -14,14 h-42 q-14,0 -14,-14z" fill="#fff" stroke="#9CC7DE" stroke-width="2"/>'), lines=['la salle', 'de bains'], fs=14),
    item('toilettes', 'les toilettes', 'f', 'toilet', 562, 222,
         room(526, 600, 198, 320, '#EAF4EA', '<rect x="552" y="270" width="22" height="18" rx="3" fill="#fff" stroke="#AAB" stroke-width="1.5"/><path d="M548,292 h30 q0,22 -15,22 q-15,0 -15,-22z" fill="#fff" stroke="#AAB" stroke-width="1.5"/>'), lines=['les', 'toilettes'], fs=14, pl=True),
    item('bureau', 'le bureau', 'm', 'study, office', 669, 224,
         room(604, 738, 198, 320, '#FFF4DE', '<rect x="640" y="290" width="70" height="6" fill="#8C6440"/><rect x="646" y="296" width="5" height="22" fill="#8C6440"/><rect x="700" y="296" width="5" height="22" fill="#8C6440"/><rect x="660" y="268" width="30" height="20" rx="2" fill="#334155"/>'), fs=14),
    item('entrée', "l'entrée", 'f', 'entrance hall', 230, 344, room(182, 284, 328, 470, '#F3EAD9'), fs=14),
    item('porte', 'la porte', 'f', 'door', 230, 374,
         '<rect x="208" y="394" width="44" height="74" rx="3" fill="#8C5A35"/><rect x="214" y="400" width="32" height="28" rx="2" fill="#A06A42"/><circle cx="244" cy="434" r="3.5" fill="#F2C94C"/>', fs=14),
    item('couloir', 'le couloir', 'm', 'corridor, hallway', 322, 344, room(288, 392, 328, 470, '#EFE6D6'), fs=14),
    item('escalier', "l'escalier", 'm', 'stairs', 362, 456, stairs, fs=13, nobox=True),
    item('salon', 'le salon', 'm', 'living room', 472, 346,
         room(396, 552, 328, 470, '#E8F0FB', '<rect x="420" y="430" width="100" height="30" rx="8" fill="#6F8FCF"/><rect x="420" y="416" width="100" height="18" rx="7" fill="#88A6E0"/>')),
    item('salle à manger', 'la salle à manger', 'f', 'dining room', 602, 346,
         room(556, 650, 328, 470, '#FBEEDD', '<rect x="572" y="436" width="62" height="6" fill="#8C6440"/><rect x="576" y="442" width="5" height="26" fill="#8C6440"/><rect x="625" y="442" width="5" height="26" fill="#8C6440"/>'), lines=['la salle', 'à manger'], fs=14),
    item('cuisine', 'la cuisine', 'f', 'kitchen', 694, 346,
         room(654, 738, 328, 470, '#F1F7E8', '<rect x="664" y="430" width="64" height="38" fill="#fff" stroke="#AAB" stroke-width="1.5"/><circle cx="680" cy="438" r="4" fill="#556"/><circle cx="712" cy="438" r="4" fill="#556"/>'), fs=14),
    item('mur', 'le mur', 'm', 'wall', 806, 296,
         '<rect x="738" y="190" width="24" height="284" fill="#C46A4A"/>' + ''.join(f'<path d="M738,{y} H762" stroke="#E8D3C0" stroke-width="2"/><path d="M{750 if (y // 12) % 2 else 744},{y} V{y + 12}" stroke="#E8D3C0" stroke-width="2"/>' for y in range(190, 470, 12))),
    item('sous-sol', 'le sous-sol', 'm', 'basement', 330, 540, room(182, 516, 484, 596, '#B4B0A9', '<rect x="210" y="560" width="40" height="30" fill="#A07A50"/><rect x="420" y="566" width="50" height="24" fill="#A07A50"/>')),
    item('cave', 'la cave', 'f', 'cellar', 628, 540,
         room(520, 738, 484, 596, '#8A7E70', ''.join(f'<circle cx="{x}" cy="{y}" r="5" fill="#5B1F2A"/>' for x in range(560, 720, 16) for y in (566, 580)))),
    item('jardin', 'le jardin', 'm', 'garden', 826, 246,
         '<rect x="758" y="230" width="142" height="240" fill="#BFE3F7" fill-opacity="0.01"/><rect x="758" y="440" width="142" height="30" fill="#8FD07B"/><rect x="862" y="350" width="14" height="94" fill="#7A5134"/><circle cx="869" cy="330" r="30" fill="#4FAF66"/><circle cx="852" cy="350" r="20" fill="#3E9A57"/><circle cx="772" cy="456" r="4" fill="#F48FB1"/><circle cx="790" cy="460" r="4" fill="#FFD54A"/><circle cx="890" cy="458" r="4" fill="#fff"/>'),
    item('terrasse', 'la terrasse', 'f', 'terrace, patio', 800, 404,
         '<rect x="752" y="450" width="94" height="18" fill="#C9A06E"/><path d="M752,456 H846 M752,462 H846" stroke="#A9814F" stroke-width="1.5"/><rect x="792" y="432" width="20" height="4" fill="#fff"/><rect x="800" y="436" width="4" height="14" fill="#fff"/><path d="M780,430 Q802,412 824,430Z" fill="#E8574A"/><rect x="801" y="424" width="2" height="12" fill="#666"/>', fs=14),
    item('piscine', 'la piscine', 'f', 'swimming pool', 830, 556,
         '<rect x="768" y="484" width="124" height="44" rx="6" fill="#4FB6E8" stroke="#E9F6FD" stroke-width="5"/><path d="M780,500 q10,-6 20,0 q10,6 20,0 q10,-6 20,0 q10,6 20,0 q10,-6 20,0" stroke="#BFE9FB" stroke-width="3" fill="none"/>', fs=14),
]

# ---------------- scene 2: l'immeuble (a block of flats) ----------------
s2_scene = '''<defs><linearGradient id="b-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE3F7"/><stop offset="1" stop-color="#EAF6FD"/></linearGradient></defs>
 <rect width="900" height="640" fill="url(#b-sky)"/><rect y="600" width="900" height="40" fill="#9AA3AE"/><rect y="596" width="900" height="6" fill="#C5CCD4"/>
 <circle cx="110" cy="560" r="34" fill="#4FAF66"/><rect x="104" y="566" width="12" height="34" fill="#7A5134"/><circle cx="800" cy="556" r="38" fill="#4FAF66"/><rect x="794" y="566" width="12" height="34" fill="#7A5134"/>'''
FLOORS = {0: 515, 1: 430, 2: 345, 3: 260, 4: 175, 5: 90}   # top of each floor
win = ''
for f, y in FLOORS.items():
    win += f'<rect x="262" y="{y + 8}" width="288" height="69" fill="#F3E3C8"/>'
    if f == 0:
        continue
    for x in (282, 362, 442, 510):
        win += f'<rect x="{x}" y="{y + 22}" width="30" height="38" rx="2" fill="#9CCBEA" stroke="#fff" stroke-width="3"/>'
win += '<rect x="400" y="530" width="60" height="70" rx="3" fill="#6B4A2F"/><rect x="404" y="534" width="24" height="62" fill="#9CCBEA" opacity=".7"/><rect x="432" y="534" width="24" height="62" fill="#9CCBEA" opacity=".7"/>'
for y in FLOORS.values():
    win += f'<rect x="250" y="{y + 77}" width="400" height="8" fill="#B49B78"/>'
shaft_cab = '<rect x="560" y="90" width="60" height="510" fill="#A7B0BB"/><path d="M590,90 V600" stroke="#8994A1" stroke-width="2"/><rect x="564" y="268" width="52" height="69" rx="3" fill="#E2E8EF" stroke="#64748B" stroke-width="2"/><path d="M590,270 V335" stroke="#64748B" stroke-width="2"/><path d="M584,254 l6,-8 l6,8z" fill="#22C55E"/>'
s2 = [
    item('immeuble', "l'immeuble", 'm', 'block of flats, building', 450, 36,
         '<rect x="250" y="60" width="400" height="540" fill="#E3CFAE"/><rect x="240" y="56" width="420" height="14" rx="3" fill="#B5543A"/>' + win),
    item('ascenseur', "l'ascenseur", 'm', 'lift, elevator', 740, 306,
         shaft_cab + '<path d="M626,302 H690" stroke="#64748B" stroke-width="2" stroke-dasharray="4 3"/>'),
    item('étage', "l'étage", 'm', 'floor (storey)', 185, 360,
         '<rect x="130" y="268" width="110" height="69" rx="12" fill="#EEF2FF" stroke="#A5B4FC" stroke-width="2"/><text x="185" y="315" text-anchor="middle" font-size="34" font-weight="900" fill="#4F46E5">3e</text><path d="M240,302 H250" stroke="#A5B4FC" stroke-width="2"/>'),
    item('appartement', "l'appartement", 'm', 'flat, apartment', 470, 294,
         '<rect x="262" y="268" width="288" height="69" fill="#FFF1B8"/><path d="M352,268 V337 M420,268 V337" stroke="#C9A53A" stroke-width="3"/>', fs=14),
    item('pièce', 'la pièce', 'f', 'room', 307, 294, '<rect x="264" y="270" width="86" height="65" fill="#FFE07A"/>', fs=14),
    item('studio', 'le studio', 'm', 'studio flat', 307, 128, '<rect x="262" y="98" width="92" height="69" fill="#D9F2E1"/><path d="M354,98 V167" stroke="#4FAF66" stroke-width="3"/>', fs=14),
]

# ---------------- scene 3: les meubles (furniture in four rooms) ----------------
def panel(x, y, name, fill):
    return f'<rect x="{x}" y="{y}" width="440" height="290" rx="16" fill="{fill}"/><rect x="{x}" y="{y + 210}" width="440" height="80" fill="#000" fill-opacity=".05"/><text x="{x + 16}" y="{y + 28}" font-size="15" font-weight="700" fill="#64748B">{name}</text>'
s3_scene = (panel(10, 10, 'dans la chambre', '#F6E7EF') + panel(450, 10, 'dans le salon', '#E8F0FB') +
            panel(10, 300, 'dans la salle de bains', '#E3F2FB') + panel(450, 300, 'dans la cuisine', '#F1F7E8') +
            '<rect x="470" y="520" width="400" height="10" fill="#B9C3CE"/><rect x="620" y="530" width="250" height="40" fill="#E2E8EF"/>')
armoire = '''<defs><linearGradient id="h-wood" x1="0" x2="1"><stop offset="0" stop-color="#A9764B"/><stop offset=".5" stop-color="#C99464"/><stop offset="1" stop-color="#9A6A42"/></linearGradient></defs>
 <rect x="300" y="70" width="104" height="176" rx="6" fill="url(#h-wood)" stroke="#7A5134" stroke-width="2"/><path d="M352,74 V242" stroke="#7A5134" stroke-width="2.5"/><rect x="342" y="148" width="4" height="22" rx="2" fill="#F2C94C"/><rect x="358" y="148" width="4" height="22" rx="2" fill="#F2C94C"/><rect x="306" y="246" width="10" height="6" fill="#7A5134"/><rect x="388" y="246" width="10" height="6" fill="#7A5134"/>'''
fauteuil = '''<defs><linearGradient id="h-arm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0A35E"/><stop offset="1" stop-color="#D97A35"/></linearGradient></defs>
 <path d="M672,150 Q672,128 694,128 L740,128 Q762,128 762,150 L762,206 L672,206Z" fill="url(#h-arm)"/><rect x="660" y="180" width="26" height="56" rx="12" fill="#E58A45"/><rect x="748" y="180" width="26" height="56" rx="12" fill="#E58A45"/><rect x="680" y="200" width="74" height="30" rx="10" fill="#F4B47A"/><rect x="668" y="236" width="8" height="12" fill="#7A5134"/><rect x="758" y="236" width="8" height="12" fill="#7A5134"/><path d="M684,140 Q716,132 750,140" stroke="#fff" stroke-opacity=".5" stroke-width="4" fill="none" stroke-linecap="round"/>'''
frigo = '''<defs><linearGradient id="h-steel" x1="0" x2="1"><stop offset="0" stop-color="#E5EAF0"/><stop offset=".5" stop-color="#FFFFFF"/><stop offset="1" stop-color="#CBD3DC"/></linearGradient></defs>
 <rect x="512" y="340" width="96" height="196" rx="10" fill="url(#h-steel)" stroke="#9AA6B4" stroke-width="2"/><path d="M512,404 H608" stroke="#9AA6B4" stroke-width="2"/><rect x="592" y="360" width="5" height="30" rx="2.5" fill="#94A3B8"/><rect x="592" y="420" width="5" height="44" rx="2.5" fill="#94A3B8"/><path d="M522,352 V396" stroke="#fff" stroke-width="4" stroke-linecap="round"/>'''
placard = '''<rect x="680" y="338" width="170" height="84" rx="6" fill="url(#h-wood)" stroke="#7A5134" stroke-width="2"/><path d="M765,342 V418" stroke="#7A5134" stroke-width="2.5"/><circle cx="756" cy="380" r="4" fill="#F2C94C"/><circle cx="774" cy="380" r="4" fill="#F2C94C"/>'''
s3 = [
    item('lit', 'le lit', 'm', 'bed', 150, 272, img('lit', 150, 252, 160)),
    item('armoire', "l'armoire", 'f', 'wardrobe', 352, 272, armoire),
    item('canapé', 'le canapé', 'm', 'sofa', 560, 272, img('canape', 560, 252, 150)),
    item('fauteuil', 'le fauteuil', 'm', 'armchair', 717, 272, fauteuil),
    item('chaise', 'la chaise', 'f', 'chair', 840, 272, img('chaise', 840, 252, 96)),
    item('baignoire', 'la baignoire', 'f', 'bath, bathtub', 140, 564, img('baignoire', 140, 546, 170)),
    item('douche', 'la douche', 'f', 'shower', 345, 564, img('douche', 345, 546, 160)),
    item('frigo', 'le frigo', 'm', 'fridge', 560, 564, frigo),
    item('placard', 'le placard', 'm', 'cupboard', 765, 446, placard),
]

def js(s): return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
def items_js(L):
    out = []
    for w in L:
        extra = ''
        if w['lines']: extra += ', lines: [' + ', '.join(f'"{t}"' for t in w['lines']) + ']'
        if w['fs']: extra += f", fs: {w['fs']}"
        if w['pl']: extra += ', pl: true'
        if w['nobox']: extra += ', nobox: true'
        out.append(f"            {{ key: '{w['key']}', fr: \"{w['fr']}\", g: '{w['g']}', en: '{w['en']}', x: {w['x']}, ly: {w['ly']}{extra}, d: `{js(w['d'])}` }},")
    return '\n'.join(out)
block = f"""// ---------------- 15 La Maison & Les Pièces: three pictures (made by tools/picture-pages/house.py) ----------------
PAGES[15] = {{
    name: 'Picture', next: 'Explore the house pictures', title: 'La maison',
    credit: '3D furniture: Microsoft Fluent Emoji (MIT licence)',
    scenes: [
        {{ title: 'La maison', w: 900, h: 640, minw: 660, scene: `{js(s1_scene)}`, items: [
{items_js(s1)}
        ] }},
        {{ title: "L'immeuble", w: 900, h: 640, minw: 520, scene: `{js(s2_scene)}`, items: [
{items_js(s2)}
        ] }},
        {{ title: 'Les meubles', w: 900, h: 600, minw: 560, scene: `{js(s3_scene)}`, items: [
{items_js(s3)}
        ] }},
    ],
}};
"""
p = os.path.join(ROOT, 'js', 'picture-page.js')
s = open(p, encoding='utf-8').read()
m = re.search(r'// -+ 15 [^\n]*\n.*?(?=\n// -+ |\nconst CSS)', s, re.S)
if m:
    s = s[:m.start()] + block.rstrip('\n') + s[m.end():]
else:
    i = s.index('\nconst CSS')
    s = s[:i] + '\n' + block + s[i:]
open(p, 'w', encoding='utf-8').write(s)
print('PAGES[15]:', len(s1), len(s2), len(s3), 'objects')
