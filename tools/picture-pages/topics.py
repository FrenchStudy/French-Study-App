# Builds the picture pages of Professions (11), Survival 50 (17), Clothing (19), Body (20), Technology (28),
# Animals & Nature (29) and Sport (32) into js/picture-page.js.   Run: python3 tools/picture-pages/topics.py
# Most objects are Microsoft Fluent Emoji 3D pictures (MIT), saved as media/pictures/fe-<name>.webp;
# the rest are drawn here in the same soft style (DRAW below). The body and the landscape are drawn scenes.
import os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')

# ---------------- drawings in a 120 x 120 box ----------------
def lg(id_, a, b, vertical=False):
    return f'<linearGradient id="{id_}" x1="0" y1="0" x2="{0 if vertical else 1}" y2="{1 if vertical else 0}"><stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient>'
def card(fill1, fill2, inner, gid):
    return f'<defs>{lg(gid, fill1, fill2)}</defs><rect x="8" y="26" width="104" height="68" rx="10" fill="url(#{gid})"/><rect x="8" y="26" width="104" height="68" rx="10" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="2"/>' + inner
DRAW = {
 'plate': '<defs><radialGradient id="dw-pl" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#F1F4F8"/><stop offset="1" stop-color="#C9D3DE"/></radialGradient></defs><ellipse cx="60" cy="74" rx="54" ry="20" fill="#B8C2CE" opacity=".45"/><ellipse cx="60" cy="68" rx="54" ry="20" fill="url(#dw-pl)" stroke="#C3CCD7" stroke-width="1.5"/><ellipse cx="60" cy="67" rx="34" ry="11" fill="#F7F9FB" stroke="#DCE3EA"/>',
 'glass': '<defs>' + lg('dw-gl', '#D7EEF9', '#C3E2F2') + lg('dw-wa', '#9BD6F6', '#4FA9E3', True) + '</defs><path d="M34,18 L86,18 L80,104 Q60,110 40,104Z" fill="url(#dw-gl)" stroke="#9CC7DE" stroke-width="2"/><path d="M37,46 L83,46 L79,102 Q60,107 41,102Z" fill="url(#dw-wa)" opacity=".85"/><path d="M44,24 L48,96" stroke="#fff" stroke-opacity=".8" stroke-width="5" stroke-linecap="round"/>',
 'bottle': '<defs>' + lg('dw-bo', '#7CC4EE', '#3E8CC9') + '</defs><path d="M50,8 h20 v14 q14,8 14,24 v58 q0,8 -8,8 h-32 q-8,0 -8,-8 v-58 q0,-16 14,-24z" fill="url(#dw-bo)" opacity=".9"/><rect x="48" y="2" width="24" height="10" rx="3" fill="#2B6CB0"/><rect x="36" y="56" width="48" height="26" rx="4" fill="#fff" opacity=".85"/><path d="M42,40 V100" stroke="#fff" stroke-opacity=".6" stroke-width="5" stroke-linecap="round"/>',
 'towel': '<defs>' + lg('dw-tw', '#F7A9B8', '#E07A8F', True) + '</defs><rect x="22" y="10" width="76" height="100" rx="8" fill="url(#dw-tw)"/><rect x="22" y="84" width="76" height="8" fill="#fff" opacity=".7"/><rect x="22" y="22" width="76" height="6" fill="#fff" opacity=".5"/><path d="M14,10 H106" stroke="#94A3B8" stroke-width="6" stroke-linecap="round"/>',
 'register': '<defs>' + lg('dw-rg', '#9AA6B4', '#64748B', True) + '</defs><rect x="14" y="54" width="92" height="52" rx="8" fill="url(#dw-rg)"/><rect x="24" y="20" width="60" height="30" rx="5" fill="#1E293B"/><text x="54" y="42" text-anchor="middle" font-size="16" font-weight="800" fill="#4ADE80">12,50</text>' + ''.join(f'<rect x="{26 + c * 18}" y="{62 + r * 13}" width="14" height="9" rx="2" fill="#E2E8F0"/>' for c in range(4) for r in range(3)) + '<rect x="10" y="104" width="100" height="8" rx="3" fill="#475569"/>',
 'exit': '<rect x="6" y="28" width="108" height="64" rx="10" fill="#16A34A"/><text x="60" y="68" text-anchor="middle" font-size="22" font-weight="900" fill="#fff">SORTIE</text><path d="M18,82 h20" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M30,76 l8,6 l-8,6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>',
 'plan': '<rect x="10" y="12" width="100" height="96" rx="6" fill="#F4F1E8" stroke="#D6CFBE" stroke-width="2"/><path d="M10,46 H110 M10,80 H110 M42,12 V108 M80,12 V108" stroke="#fff" stroke-width="7"/><path d="M10,46 H110 M42,12 V108" stroke="#FCD34D" stroke-width="3"/><rect x="50" y="54" width="22" height="18" fill="#A7D7A0"/><path d="M90,26 q-10,0 -10,10 q0,8 10,18 q10,-10 10,-18 q0,-10 -10,-10z" fill="#E11D48"/><circle cx="90" cy="36" r="4" fill="#fff"/>',
 'transport': card('#38BDF8', '#2563EB', '<text x="60" y="58" text-anchor="middle" font-size="15" font-weight="900" fill="#fff">PASS</text><circle cx="96" cy="78" r="9" fill="#fff" opacity=".85"/><text x="96" y="83" text-anchor="middle" font-size="12" font-weight="900" fill="#2563EB">M</text><rect x="18" y="72" width="44" height="6" rx="3" fill="#fff" opacity=".7"/>', 'dw-tc'),
 'licence': card('#F9A8D4', '#EC4899', '<rect x="16" y="36" width="30" height="36" rx="4" fill="#FCE7F3"/><circle cx="31" cy="49" r="7" fill="#9D174D" opacity=".6"/><path d="M21,68 q10,-12 20,0" fill="#9D174D" opacity=".6"/><path d="M60,46 h42 M60,58 h34" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M62,82 h30 l-4,-8 h-22z" fill="#fff"/><circle cx="68" cy="84" r="4" fill="#9D174D"/><circle cx="86" cy="84" r="4" fill="#9D174D"/>', 'dw-lc'),
 'address': '<defs>' + lg('dw-en', '#FFFFFF', '#E2E8F0', True) + '</defs><rect x="8" y="26" width="104" height="70" rx="6" fill="url(#dw-en)" stroke="#CBD5E1" stroke-width="2"/><path d="M8,30 L60,64 L112,30" fill="none" stroke="#CBD5E1" stroke-width="2"/><rect x="84" y="32" width="18" height="20" rx="2" fill="#F87171"/><path d="M34,74 h52 M34,84 h38" stroke="#334155" stroke-width="4" stroke-linecap="round"/>',
 'wallet': '<defs>' + lg('dw-wl', '#8B5A35', '#5E3B21', True) + '</defs><rect x="10" y="30" width="100" height="66" rx="10" fill="url(#dw-wl)"/><rect x="18" y="22" width="70" height="20" rx="4" fill="#4ADE80"/><rect x="70" y="50" width="40" height="26" rx="8" fill="#6B4428"/><circle cx="86" cy="63" r="5" fill="#F2C94C"/>',
 'fork': '<defs>' + lg('dw-fk', '#E5E7EB', '#9CA3AF') + '</defs><path d="M56,58 h8 v52 q0,6 -4,6 q-4,0 -4,-6z" fill="url(#dw-fk)"/><path d="M44,10 v32 q0,16 16,16 q16,0 16,-16 v-32" fill="none" stroke="url(#dw-fk)" stroke-width="6" stroke-linecap="round"/><path d="M55,10 v26 M65,10 v26" stroke="#B6BCC6" stroke-width="5" stroke-linecap="round"/>',
 'chemise': '<defs>' + lg('dw-ch', '#BFDBFE', '#93C5FD', True) + '</defs><path d="M38,14 L22,20 L6,44 L22,56 L30,46 L30,110 L90,110 L90,46 L98,56 L114,44 L98,20 L82,14 Q60,26 38,14Z" fill="url(#dw-ch)" stroke="#60A5FA" stroke-width="1.5"/><path d="M38,14 L52,30 L60,22 L68,30 L82,14" fill="#fff" stroke="#60A5FA" stroke-width="1.5"/><path d="M60,26 V108" stroke="#60A5FA" stroke-width="1.5"/>' + ''.join(f'<circle cx="64" cy="{40 + k * 16}" r="2.2" fill="#fff"/>' for k in range(5)),
 'pull': '<defs>' + lg('dw-pu', '#F87171', '#DC2626', True) + '</defs><path d="M40,14 L18,22 L6,72 L20,76 L30,48 L30,108 L90,108 L90,48 L100,76 L114,72 L102,22 L80,14 Q60,30 40,14Z" fill="url(#dw-pu)"/><path d="M40,14 Q60,30 80,14" fill="none" stroke="#991B1B" stroke-width="4"/><path d="M30,100 H90 M8,68 L20,72 M112,68 L100,72" stroke="#991B1B" stroke-width="4"/>',
 'pantalon': '<defs>' + lg('dw-pa', '#9CA3AF', '#4B5563', True) + '</defs><path d="M32,8 H88 L96,114 H66 L60,40 L54,114 H24Z" fill="url(#dw-pa)"/><rect x="32" y="8" width="56" height="10" fill="#374151"/><path d="M60,18 V38" stroke="#374151" stroke-width="2"/>',
 'jupe': '<defs>' + lg('dw-ju', '#C084FC', '#9333EA', True) + '</defs><path d="M36,24 H84 L106,102 Q60,112 14,102Z" fill="url(#dw-ju)"/><rect x="34" y="16" width="52" height="12" rx="3" fill="#7E22CE"/><path d="M48,30 L40,104 M60,30 V108 M72,30 L80,104" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>',
 'veste': '<defs>' + lg('dw-ve', '#A3E635', '#4D7C0F', True) + '</defs><path d="M40,12 L20,20 L8,96 L24,98 L30,52 L30,110 L58,110 L58,40 L46,22Z M80,12 L100,20 L112,96 L96,98 L90,52 L90,110 L62,110 L62,40 L74,22Z" fill="url(#dw-ve)"/><path d="M40,12 L58,40 M80,12 L62,40" stroke="#365314" stroke-width="3"/><circle cx="52" cy="66" r="3" fill="#365314"/><circle cx="52" cy="84" r="3" fill="#365314"/><rect x="34" y="78" width="14" height="4" fill="#365314" opacity=".6"/>',
 'ceinture': '<defs>' + lg('dw-ce', '#92400E', '#78350F', True) + '</defs><path d="M6,52 Q60,38 114,52 L114,70 Q60,56 6,70Z" fill="url(#dw-ce)"/><rect x="46" y="40" width="30" height="36" rx="5" fill="none" stroke="#F2C94C" stroke-width="6"/><path d="M60,46 V70" stroke="#F2C94C" stroke-width="4"/>' + ''.join(f'<circle cx="{88 + k * 8}" cy="{57 - k * 0.3}" r="2" fill="#451A03"/>' for k in range(3)),
 'cabine': '<rect x="14" y="10" width="92" height="104" rx="4" fill="#E2E8F0"/><path d="M14,12 H106" stroke="#64748B" stroke-width="5" stroke-linecap="round"/><path d="M18,14 q6,46 0,96 h40 q-8,-50 0,-96z" fill="#E11D48"/><path d="M58,14 q8,46 0,96" stroke="#9F1239" stroke-width="2" fill="none"/><path d="M28,16 q4,44 0,92 M44,16 q-4,44 0,92" stroke="#fff" stroke-opacity=".3" stroke-width="3" fill="none"/><rect x="72" y="22" width="26" height="40" rx="4" fill="#BFE3F7" stroke="#94A3B8"/><circle cx="85" cy="90" r="4" fill="#94A3B8"/>',
 'rayon': '<rect x="10" y="8" width="100" height="106" rx="4" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/>' + ''.join(f'<rect x="10" y="{36 + r * 34}" width="100" height="5" fill="#94A3B8"/>' for r in range(3)) + ''.join(f'<rect x="{16 + c * 24}" y="{14 + r * 34}" width="18" height="22" rx="3" fill="{col}"/>' for r, row in enumerate([['#F87171', '#60A5FA', '#FBBF24', '#34D399'], ['#A78BFA', '#F472B6', '#60A5FA', '#F87171'], ['#34D399', '#FBBF24', '#A78BFA', '#60A5FA']]) for c, col in enumerate(row)),
 'soldes': '<path d="M14,40 L54,10 H106 V70 L66,100 L14,100Z" fill="#E11D48"/><circle cx="92" cy="24" r="6" fill="#fff"/><text x="58" y="66" text-anchor="middle" font-size="22" font-weight="900" fill="#fff" transform="rotate(-8,58,60)">SOLDES</text>',
 'reduction': '<circle cx="60" cy="60" r="48" fill="#F59E0B"/><circle cx="60" cy="60" r="40" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="6 5"/><text x="60" y="70" text-anchor="middle" font-size="30" font-weight="900" fill="#fff">-30 %</text>',
 'taille': '<path d="M20,30 L50,10 H104 V60 L74,80 H20Z" fill="#FDE68A" stroke="#D97706" stroke-width="2"/><circle cx="92" cy="24" r="5" fill="#fff" stroke="#D97706"/><text x="58" y="60" text-anchor="middle" font-size="34" font-weight="900" fill="#92400E">M</text><text x="60" y="106" text-anchor="middle" font-size="15" font-weight="700" fill="#64748B">S · M · L</text>',
 'pointure': '<path d="M14,78 q0,-22 18,-22 l22,-26 q10,-6 18,0 l10,26 q30,4 30,22 v12 h-98z" fill="#F97316"/><rect x="14" y="90" width="98" height="10" rx="4" fill="#fff" stroke="#E5E7EB"/><circle cx="62" cy="64" r="18" fill="#fff"/><text x="62" y="71" text-anchor="middle" font-size="19" font-weight="900" fill="#C2410C">38</text>',
 'tablets': '<rect x="14" y="30" width="92" height="60" rx="10" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>' + ''.join(f'<circle cx="{32 + c * 28}" cy="{48 + r * 24}" r="9" fill="#fff" stroke="#CBD5E1" stroke-width="2"/><path d="M{26 + c * 28},{48 + r * 24} h12" stroke="#CBD5E1" stroke-width="2"/>' for c in range(3) for r in range(2)),
 'at': '<circle cx="60" cy="60" r="50" fill="#EEF2FF"/><text x="60" y="88" text-anchor="middle" font-size="84" font-weight="800" fill="#4F46E5">@</text>',
 'whistle': '<defs>' + lg('dw-wh', '#E5E7EB', '#9CA3AF', True) + '</defs><circle cx="48" cy="66" r="30" fill="url(#dw-wh)" stroke="#6B7280" stroke-width="2"/><rect x="56" y="38" width="54" height="22" rx="6" fill="url(#dw-wh)" stroke="#6B7280" stroke-width="2"/><circle cx="48" cy="66" r="10" fill="#4B5563"/><path d="M22,48 q-12,-20 6,-34" stroke="#EF4444" stroke-width="4" fill="none"/><rect x="82" y="72" width="20" height="28" rx="3" fill="#FACC15" transform="rotate(12,92,86)"/>',
 'field': '<rect x="6" y="18" width="108" height="84" rx="6" fill="#4ADE80"/>' + ''.join(f'<rect x="{6 + k * 27}" y="18" width="13.5" height="84" fill="#22C55E"/>' for k in range(4)) + '<rect x="12" y="24" width="96" height="72" fill="none" stroke="#fff" stroke-width="3"/><path d="M60,24 V96" stroke="#fff" stroke-width="3"/><circle cx="60" cy="60" r="12" fill="none" stroke="#fff" stroke-width="3"/><rect x="12" y="46" width="12" height="28" fill="none" stroke="#fff" stroke-width="3"/><rect x="96" y="46" width="12" height="28" fill="none" stroke="#fff" stroke-width="3"/>',
 'score': '<rect x="10" y="22" width="100" height="70" rx="10" fill="#1E293B"/><text x="60" y="72" text-anchor="middle" font-size="36" font-weight="900" fill="#FDE047">2 - 1</text><rect x="22" y="92" width="10" height="20" fill="#475569"/><rect x="88" y="92" width="10" height="20" fill="#475569"/>',
 'jump': '<rect x="56" y="70" width="8" height="40" fill="#94A3B8"/><rect x="40" y="66" width="40" height="8" rx="3" fill="#E11D48"/><path d="M14,104 Q60,0 106,104" fill="none" stroke="#6366F1" stroke-width="4" stroke-dasharray="7 6"/><circle cx="60" cy="30" r="9" fill="#F59E0B"/><path d="M60,39 l-4,14 M56,53 l-14,-4 M56,53 l12,6 M58,44 l-12,-8 M58,44 l14,-8" stroke="#F59E0B" stroke-width="5" stroke-linecap="round"/><path d="M8,110 H112" stroke="#94A3B8" stroke-width="3"/>',
 'metro_sign': '<rect x="54" y="50" width="12" height="62" fill="#64748B"/><circle cx="60" cy="40" r="32" fill="#FACC15" stroke="#1E3A8A" stroke-width="5"/><text x="60" y="54" text-anchor="middle" font-size="40" font-weight="900" fill="#1E3A8A">M</text>',
 'coach': '<rect x="22" y="14" width="64" height="88" rx="6" fill="#B45309"/><rect x="30" y="24" width="48" height="70" rx="3" fill="#fff"/><rect x="42" y="8" width="24" height="12" rx="3" fill="#9CA3AF"/><path d="M38,40 h32 M38,52 h24 M38,64 h30" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/><circle cx="96" cy="86" r="14" fill="#D1D5DB" stroke="#6B7280" stroke-width="2"/><rect x="98" y="70" width="18" height="10" rx="3" fill="#D1D5DB" stroke="#6B7280" stroke-width="2"/><path d="M84,80 q-10,-14 -18,-10" stroke="#EF4444" stroke-width="3" fill="none"/>',
}

# ---------------- grid scenes ----------------
def pic(slug):
    return slug if slug.endswith('.webp') else f'fe-{slug}.webp'
def tile_art(it, cx, top):
    if 'draw' in it:
        return f'<g transform="translate({cx - 60},{top})">{DRAW[it["draw"]]}</g>'
    p = it['pic'] if isinstance(it['pic'], list) else [it['pic']]
    if len(p) == 1:
        return f'<image href="media/pictures/{pic(p[0])}" x="{cx - 60}" y="{top}" width="120" height="120"/>'
    return ''.join(f'<image href="media/pictures/{pic(s)}" x="{cx - 64 + k * 48:g}" y="{top + 24}" width="80" height="80"/>' for k, s in enumerate(p[:2]))

def grid(title, bg, tile, items, cols=5):
    W, M, G, TH = 900, 16, 12, 204
    TW = (W - 2 * M - G * (cols - 1)) / cols
    rows = (len(items) + cols - 1) // cols
    H = M * 2 + rows * TH + (rows - 1) * G
    scene = f'<rect width="{W}" height="{H}" fill="{bg}"/>'
    out = []
    for i, it in enumerate(items):
        r, c = divmod(i, cols)
        x0, y0 = M + c * (TW + G), M + r * (TH + G)
        cx = x0 + TW / 2
        scene += f'<rect x="{x0:g}" y="{y0}" width="{TW:g}" height="{TH}" rx="16" fill="{tile}"/>'
        w = dict(it); w['x'] = round(cx, 1); w['ly'] = y0 + 150
        w['d'] = tile_art(it, cx, y0 + 10)
        if 'fs' not in w and (max(len(t) for t in (w.get('lines') or [w['fr']])) > 18): w['fs'] = 14   # long labels a little smaller (14 is the smallest that stays 12px on a phone)
        out.append(w)
    return dict(title=title, w=W, h=H, minw=560, scene=scene, items=out)

def I(key, fr, g, en, art, **k):
    d = dict(key=key, fr=fr, g=g, en=en, **k)
    if art.startswith('draw:'): d['draw'] = art[5:]
    elif ',' in art: d['pic'] = art.split(',')
    else: d['pic'] = art
    return d
def P(key, m, f, en, art, **k):    # a job: both forms, each in its colour
    return I(key, f'{m} / {f}', 'm', en, art, lines=[m, f], lc=['m', 'f'], **k)

# ---------------- 11 Professions ----------------
T11 = dict(name='Picture', next='Explore the jobs', title='Les métiers', scenes=[
 grid('En ville', '#F3EFE6', '#FFFFFF', [
    P('boulanger / boulangère', 'le boulanger', 'la boulangère', 'baker', 'baguette-bread'),
    P('boucher / bouchère', 'le boucher', 'la bouchère', 'butcher', 'cut-of-meat'),
    P('vendeur / vendeuse', 'le vendeur', 'la vendeuse', 'shop assistant', 'shopping-bags'),
    P('serveur / serveuse', 'le serveur', 'la serveuse', 'waiter, waitress', 'person-in-tuxedo'),
    P('coiffeur / coiffeuse', 'le coiffeur', 'la coiffeuse', 'hairdresser', 'woman-getting-haircut'),
    P('pharmacien / pharmacienne', 'le pharmacien', 'la pharmacienne', 'pharmacist', 'pill'),
    P('facteur / factrice', 'le facteur', 'la factrice', 'postman, postwoman', 'postbox'),
    P('policier / policière', 'le policier', 'la policière', 'police officer', 'man-police-officer,woman-police-officer'),
    P('cuisinier / cuisinière', 'le cuisinier', 'la cuisinière', 'cook', 'man-cook'),
    P('mécanicien / mécanicienne', 'le mécanicien', 'la mécanicienne', 'mechanic', 'woman-mechanic'),
    P('agriculteur / agricultrice', "l'agriculteur", "l'agricultrice", 'farmer', 'man-farmer'),
 ]),
 grid('Au travail', '#EEF2FF', '#FFFFFF', [
    I('médecin', 'le médecin', 'm', 'doctor', 'woman-health-worker,stethoscope', note='Masculine even for a woman: elle est médecin.'),
    P('infirmier / infirmière', "l'infirmier", "l'infirmière", 'nurse', 'man-health-worker,syringe'),
    I('professeur', 'le professeur', 'm', 'teacher', 'woman-teacher', note='Also: la professeure, le / la prof.'),
    P('étudiant / étudiante', "l'étudiant", "l'étudiante", 'student', 'man-student'),
    P('avocat / avocate', "l'avocat", "l'avocate", 'lawyer', 'balance-scale'),
    I('comptable', 'le / la comptable', 'm', 'accountant', 'abacus', lines=['le comptable', 'la comptable'], lc=['m', 'f']),
    I('ingénieur', "l'ingénieur", 'm', 'engineer', 'woman-technologist', note="Also: l'ingénieure."),
    P('employé / employée', "l'employé", "l'employée", 'employee, office worker', 'man-office-worker'),
    P('directeur / directrice', 'le directeur', 'la directrice', 'director, manager', 'briefcase'),
    P('écrivain / écrivaine', "l'écrivain", "l'écrivaine", 'writer', 'writing-hand'),
    P('traducteur / traductrice', 'le traducteur', 'la traductrice', 'translator', 'globe-showing-europe-africa'),
    P('acteur / actrice', "l'acteur", "l'actrice", 'actor, actress', 'performing-arts'),
    P('chanteur / chanteuse', 'le chanteur', 'la chanteuse', 'singer', 'woman-singer'),
    P('danseur / danseuse', 'le danseur', 'la danseuse', 'dancer', 'man-dancing'),
    P('musicien / musicienne', 'le musicien', 'la musicienne', 'musician', 'violin'),
 ]),
])

# ---------------- 17 Survival 50 ----------------
T17 = dict(name='Picture', next='Explore the everyday things', title='Les objets de tous les jours', scenes=[
 grid('Papiers et sacs', '#F3EFE6', '#FFFFFF', [
    I("carte d'identité", "la carte d'identité", 'f', 'identity card', 'identification-card'),
    I('permis de conduire', 'le permis de conduire', 'm', 'driving licence', 'draw:licence'),
    I('carte bancaire', 'la carte bancaire', 'f', 'bank card', 'credit-card'),
    I('formulaire', 'le formulaire', 'm', 'form', 'clipboard'),
    I('adresse', "l'adresse", 'f', 'address', 'draw:address'),
    I('numéro de téléphone', 'le numéro de téléphone', 'm', 'phone number', 'telephone-receiver', lines=['le numéro', 'de téléphone']),
    I('code', 'le code', 'm', 'code, PIN', 'input-numbers'),
    I('mot de passe', 'le mot de passe', 'm', 'password', 'locked-with-key'),
    I('réservation', 'la réservation', 'f', 'booking', 'spiral-calendar'),
    I('valise', 'la valise', 'f', 'suitcase', 'luggage'),
    I('sac', 'le sac', 'm', 'bag', 'handbag'),
    I('sac à dos', 'le sac à dos', 'm', 'backpack', 'backpack'),
    I('portefeuille', 'le portefeuille', 'm', 'wallet', 'draw:wallet'),
    I('porte-monnaie', 'le porte-monnaie', 'm', 'purse (for coins)', 'purse'),
    I('clé', 'la clé', 'f', 'key', 'key'),
    I('portable', 'le portable', 'm', 'mobile phone', 'mobile-phone'),
 ]),
 grid('À table et à la maison', '#EAF4EA', '#FFFFFF', [
    I('assiette', "l'assiette", 'f', 'plate', 'draw:plate'),
    I('couteau', 'le couteau', 'm', 'knife', 'couteau.webp'),
    I('fourchette', 'la fourchette', 'f', 'fork', 'draw:fork'),
    I('cuillère', 'la cuillère', 'f', 'spoon', 'spoon'),
    I('verre', 'le verre', 'm', 'glass', 'draw:glass'),
    I('tasse', 'la tasse', 'f', 'cup', 'hot-beverage'),
    I('bouteille', 'la bouteille', 'f', 'bottle', 'draw:bottle'),
    I('poubelle', 'la poubelle', 'f', 'bin', 'wastebasket'),
    I('savon', 'le savon', 'm', 'soap', 'soap'),
    I('brosse à dents', 'la brosse à dents', 'f', 'toothbrush', 'toothbrush'),
    I('serviette', 'la serviette', 'f', 'towel; napkin', 'draw:towel'),
 ]),
 grid("L'argent et les transports", '#EEF2FF', '#FFFFFF', [
    I('argent', "l'argent", 'm', 'money', 'money-bag'),
    I('espèces', 'les espèces', 'f', 'cash', 'euro-banknote', pl=True),
    I('monnaie', 'la monnaie', 'f', 'change, coins', 'coin'),
    I('caisse', 'la caisse', 'f', 'till, checkout', 'draw:register'),
    I('prix', 'le prix', 'm', 'price', 'label'),
    I('reçu', 'le reçu', 'm', 'receipt', 'receipt'),
    I('facture', 'la facture', 'f', 'bill, invoice', 'page-with-curl'),
    I('distributeur', 'le distributeur', 'm', 'cash machine', 'atm-sign'),
    I('ticket', 'le ticket', 'm', 'ticket (bus, metro)', 'ticket'),
    I('billet', 'le billet', 'm', 'ticket (train, show)', 'admission-tickets', note='Also a banknote: un billet de 10 euros.'),
    I('carte de transport', 'la carte de transport', 'f', 'travel pass', 'draw:transport', lines=['la carte', 'de transport']),
    I('plan', 'le plan', 'm', 'map (of a town)', 'draw:plan'),
    I('carte', 'la carte', 'f', 'map (of a country)', 'world-map', note='Also: a card, a menu.'),
    I('métro', 'le métro', 'm', 'underground, metro', 'metro'),
    I('bus', 'le bus', 'm', 'bus', 'bus'),
    I('gare', 'la gare', 'f', 'train station', 'station'),
    I('station', 'la station', 'f', 'station (metro)', 'draw:metro_sign'),
    I('arrêt', "l'arrêt", 'm', 'stop (bus)', 'bus-stop'),
    I('quai', 'le quai', 'm', 'platform', 'railway-track'),
    I('sortie', 'la sortie', 'f', 'exit', 'draw:exit'),
 ]),
])

# ---------------- 19 Clothing & Shopping ----------------
T19 = dict(name='Picture', next='Explore the clothes', title='Les vêtements', scenes=[
 grid('Les vêtements', '#FDF2F8', '#FFFFFF', [
    I('vêtements', 'les vêtements', 'm', 'clothes', 'womans-clothes', pl=True),
    I('chemise', 'la chemise', 'f', 'shirt', 'draw:chemise'),
    I('pull', 'le pull', 'm', 'jumper, sweater', 'draw:pull'),
    I('pantalon', 'le pantalon', 'm', 'trousers', 'draw:pantalon'),
    I('jean', 'le jean', 'm', 'jeans', 'jeans'),
    I('jupe', 'la jupe', 'f', 'skirt', 'draw:jupe'),
    I('robe', 'la robe', 'f', 'dress', 'dress'),
    I('costume', 'le costume', 'm', 'suit', 'person-in-tuxedo'),
    I('veste', 'la veste', 'f', 'jacket', 'draw:veste'),
    I('manteau', 'le manteau', 'm', 'coat', 'coat'),
    I('chaussures', 'les chaussures', 'f', 'shoes', 'mans-shoe', pl=True),
    I('baskets', 'les baskets', 'f', 'trainers', 'running-shoe', pl=True),
    I('bottes', 'les bottes', 'f', 'boots', 'womans-boot', pl=True),
    I('chaussettes', 'les chaussettes', 'f', 'socks', 'socks', pl=True),
    I('chapeau', 'le chapeau', 'm', 'hat', 'womans-hat'),
    I('écharpe', "l'écharpe", 'f', 'scarf', 'scarf'),
    I('gants', 'les gants', 'm', 'gloves', 'gloves', pl=True),
    I('ceinture', 'la ceinture', 'f', 'belt', 'draw:ceinture'),
    I('lunettes de soleil', 'les lunettes de soleil', 'f', 'sunglasses', 'sunglasses', pl=True, lines=['les lunettes', 'de soleil']),
 ]),
 grid('Au magasin', '#FFF7ED', '#FFFFFF', [
    I('magasin', 'le magasin', 'm', 'shop', 'convenience-store'),
    I('centre commercial', 'le centre commercial', 'm', 'shopping centre', 'department-store', lines=['le centre', 'commercial']),
    I('rayon', 'le rayon', 'm', 'department, aisle', 'draw:rayon'),
    I("cabine d'essayage", "la cabine d'essayage", 'f', 'fitting room', 'draw:cabine', lines=['la cabine', "d'essayage"]),
    I('taille', 'la taille', 'f', 'size (clothes)', 'draw:taille'),
    I('pointure', 'la pointure', 'f', 'size (shoes)', 'draw:pointure'),
    I('soldes', 'les soldes', 'f', 'the sales', 'draw:soldes', pl=True),
    I('réduction', 'la réduction', 'f', 'discount', 'draw:reduction'),
    I('payer par carte / en espèces', 'payer par carte / en espèces', 'x', 'pay by card / in cash', 'credit-card,euro-banknote', lines=['par carte', 'en espèces'], lc=['x', 'x']),
    I('remboursement', 'le remboursement', 'm', 'refund', 'money-bag'),
 ]),
])

# ---------------- 20 Body & Health: the body is drawn ----------------
SKIN, SKIN2, HAIR = '#F3C9A6', '#E8B48C', '#4A2C1D'
def face_scene():
    # a friendly cartoon face: big shiny eyes, rosy cheeks, a small smile; the skin is shown in a zoom bubble at the side
    s = f'''<rect width="900" height="620" fill="#F1F7FD"/>
 <circle cx="120" cy="90" r="60" fill="#E3EEFA"/><circle cx="800" cy="560" r="80" fill="#E3EEFA"/>
 <defs><radialGradient id="bd-face" cx=".45" cy=".42" r=".65"><stop offset="0" stop-color="#FBE0C8"/><stop offset="1" stop-color="#F0BF98"/></radialGradient>
 <clipPath id="bd-zoom"><circle cx="790" cy="300" r="58"/></clipPath></defs>
 <path d="M282,620 Q286,528 410,508 L490,508 Q614,528 618,620Z" fill="#5BA4D9"/><path d="M410,508 Q450,546 490,508" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>'''
    HAIRL = '#6B4226'
    face = 'M300,262 C300,372 368,444 450,444 C532,444 600,372 600,262 C600,226 596,200 588,182 Q560,206 520,170 Q488,200 446,166 Q404,198 366,170 Q334,200 310,184 C303,206 300,232 300,262Z'
    items = [
        I('tête', 'la tête', 'f', 'head', 'x', d=f'<ellipse cx="450" cy="250" rx="168" ry="196" fill="#000" fill-opacity="0"/><path d="M290,322 C262,190 300,58 450,52 C600,58 638,190 610,322 Q606,300 594,250 L306,250 Q294,300 290,322Z" fill="{HAIR}"/><path d="M340,96 Q400,64 470,72" stroke="{HAIRL}" stroke-width="8" fill="none" stroke-linecap="round" opacity=".6"/>', x=640, ly=78),
        I('visage', 'le visage', 'm', 'face', 'x', d=f'<path d="{face}" fill="url(#bd-face)"/><ellipse cx="360" cy="338" rx="30" ry="18" fill="#F49A9A" opacity=".45"/><ellipse cx="540" cy="338" rx="30" ry="18" fill="#F49A9A" opacity=".45"/>', x=670, ly=196),
        I('oreille', "l'oreille", 'f', 'ear', 'x', d=f'<ellipse cx="300" cy="286" rx="24" ry="34" fill="{SKIN2}"/><path d="M298,266 q-12,20 2,40" stroke="#D29A74" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="600" cy="286" rx="24" ry="34" fill="{SKIN2}"/><path d="M602,266 q12,20 -2,40" stroke="#D29A74" stroke-width="5" fill="none" stroke-linecap="round"/>', x=232, ly=290),
        I('œil / les yeux', "l'œil / les yeux", 'm', 'eye / eyes', 'x', lines=["l'œil", 'les yeux'], lc=['m', 'm'], d=''.join(f'<ellipse cx="{x}" cy="266" rx="30" ry="34" fill="#fff"/><circle cx="{x + 3}" cy="270" r="21" fill="#7A4B2A"/><circle cx="{x + 3}" cy="270" r="11" fill="#2A1A10"/><circle cx="{x + 11}" cy="260" r="7" fill="#fff"/><circle cx="{x - 4}" cy="280" r="3.5" fill="#fff"/><path d="M{x - 30},258 Q{x},226 {x + 30},258" stroke="#3B2416" stroke-width="5" fill="none" stroke-linecap="round"/>' for x in (395, 505)) + f'<path d="M367,216 Q395,202 423,214 M477,214 Q505,202 533,216" stroke="{HAIR}" stroke-width="8" fill="none" stroke-linecap="round"/>', x=170, ly=196),
        I('nez', 'le nez', 'm', 'nose', 'x', d='<ellipse cx="450" cy="312" rx="24" ry="22" fill="#000" fill-opacity="0"/><path d="M436,314 Q450,330 464,314" stroke="#D08E66" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="450" cy="306" rx="12" ry="9" fill="#fff" opacity=".35"/><path d="M642,286 L472,312" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 3"/>', x=680, ly=282),
        I('bouche', 'la bouche', 'f', 'mouth', 'x', d='<path d="M412,356 Q450,402 488,356 Q450,366 412,356Z" fill="#A8323A"/><path d="M432,384 Q450,394 468,384 Q450,376 432,384Z" fill="#F08A96"/>', x=640, ly=372),
        I('dents', 'les dents', 'f', 'teeth', 'x', pl=True, d='<path d="M422,360 Q450,368 478,360 L475,368 Q450,375 425,368Z" fill="#fff"/>', x=232, ly=372),
        I('peau', 'la peau', 'f', 'skin', 'x', d='<path d="M554,342 L734,322" stroke="#94A3B8" stroke-width="2" stroke-dasharray="5 4"/><circle cx="540" cy="338" r="14" fill="none" stroke="#94A3B8" stroke-width="3"/><circle cx="790" cy="300" r="58" fill="#F6D2B4"/><g clip-path="url(#bd-zoom)">' + ''.join(f'<circle cx="{752 + (k * 23) % 78}" cy="{256 + (k * 37) % 90}" r="{2 + k % 3}" fill="#E2A47E" opacity=".7"/>' for k in range(16)) + '<path d="M740,330 q30,-14 60,0 q20,8 44,-4 M736,280 q30,-12 56,0 q22,8 46,-6" stroke="#E7B591" stroke-width="2" fill="none"/></g><circle cx="790" cy="300" r="58" fill="none" stroke="#64748B" stroke-width="7"/><path d="M832,342 l26,26" stroke="#64748B" stroke-width="12" stroke-linecap="round"/>', x=790, ly=398),
        I('cou', 'le cou', 'm', 'neck', 'x', d=f'<path d="M412,428 Q450,456 488,428 L490,512 Q450,530 410,512Z" fill="{SKIN2}"/><ellipse cx="450" cy="454" rx="36" ry="9" fill="#D69A72" opacity=".55"/>', x=640, ly=470),
        I('gorge', 'la gorge', 'f', 'throat', 'x', d='<ellipse cx="450" cy="476" rx="20" ry="14" fill="#E0A27B"/>', x=232, ly=470),
    ]
    # the face sits on top of the head, the parts on top of the face: order matters
    for it in items: it.pop('pic', None)
    leaders = '<g stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 3">' + ''.join(f'<path d="{p}"/>' for p in [
        'M600,80 L566,100', 'M630,200 L592,214', 'M200,204 L364,262', 'M262,292 L276,290', 'M600,374 L490,368', 'M262,376 L424,364', 'M600,472 L490,470', 'M262,474 L430,476']) + '</g>'
    return dict(title='Le visage', w=900, h=620, minw=520, center=True, scene=s + leaders, items=items)

def body_scene():
    # a friendly cartoon person: smiling face, T-shirt, shorts, trainers; on the right the same person from behind
    c, c2, SH = '#5BA4D9', '#4F93C8', '#334155'
    s = '<rect width="900" height="700" fill="#F1F7FD"/><ellipse cx="400" cy="632" rx="120" ry="12" fill="#DCE6F2"/><ellipse cx="780" cy="632" rx="100" ry="11" fill="#DCE6F2"/>'
    legs = lambda: f'<path d="M344,356 h30 v236 q0,10 -10,10 h-10 q-10,0 -10,-10z M426,356 h30 v236 q0,10 -10,10 h-10 q-10,0 -10,-10z" fill="{SKIN}"/>'
    shorts = f'<path d="M334,344 Q400,356 466,344 L472,440 Q446,448 418,440 L404,380 L396,380 L382,440 Q354,448 328,440Z" fill="{SH}"/>'
    shoes = lambda: ''.join(f'<rect x="{x - 15}" y="588" width="30" height="12" rx="4" fill="#fff"/><path d="M{x - 18},600 h32 q{14 * d},0 {20 * d},14 v6 h-{52 if d > 0 else -52} q0,-10 0,-20z" transform="translate(0,0)" fill="#E2524A"/><path d="M{x - 18},614 h{52 * d if d > 0 else 0}" stroke="#fff" stroke-width="3"/>' for x, d in ((359, -1), (441, 1)))
    items = [
        I('corps', 'le corps', 'm', 'body', 'x', d=f'<rect x="300" y="40" width="200" height="640" fill="#000" fill-opacity="0"/>', x=560, ly=56),
        I('épaule', "l'épaule", 'f', 'shoulder', 'x', d=f'<circle cx="338" cy="184" r="28" fill="{c}"/><circle cx="462" cy="184" r="28" fill="{c}"/>', x=230, ly=150),
        I('bras', 'le bras', 'm', 'arm', 'x', d=f'<path d="M318,204 Q302,262 304,326" stroke="{SKIN}" stroke-width="26" stroke-linecap="round" fill="none"/><path d="M482,204 Q498,262 496,326" stroke="{SKIN}" stroke-width="26" stroke-linecap="round" fill="none"/>', x=230, ly=262),
        I('main', 'la main', 'f', 'hand', 'x', d=f'<ellipse cx="303" cy="348" rx="19" ry="21" fill="{SKIN}"/><ellipse cx="320" cy="344" rx="6" ry="11" fill="{SKIN}" transform="rotate(-25,320,344)"/><ellipse cx="497" cy="348" rx="19" ry="21" fill="{SKIN}"/><ellipse cx="480" cy="344" rx="6" ry="11" fill="{SKIN}" transform="rotate(25,480,344)"/>', x=230, ly=358),
        I('doigt', 'le doigt', 'm', 'finger', 'x', d=f'<path d="M290,362 v16 M298,366 v18 M306,366 v17 M314,362 v12 M486,362 v12 M494,366 v17 M502,366 v18 M510,362 v16" stroke="{SKIN}" stroke-width="7" stroke-linecap="round"/><path d="M290,362 v16 M298,366 v18 M306,366 v17 M314,362 v12" stroke="{SKIN2}" stroke-width="1" stroke-linecap="round" opacity=".6"/>', x=230, ly=420),
        I('poitrine', 'la poitrine', 'f', 'chest', 'x', d=f'<path d="M336,170 Q400,154 464,170 Q472,214 470,262 Q400,272 330,262 Q328,214 336,170Z" fill="{c}"/><path d="M380,160 Q400,182 420,160" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>', x=400, ly=0),
        I('cœur', 'le cœur', 'm', 'heart', 'x', d='<image href="media/pictures/fe-anatomical-heart.webp" x="404" y="196" width="50" height="50"/>', x=620, ly=226),
        I('ventre', 'le ventre', 'm', 'belly, stomach', 'x', d=f'<path d="M330,262 Q400,272 470,262 L468,344 Q400,358 332,344Z" fill="{c2}"/><path d="M334,338 Q400,350 466,338" stroke="#3F7FB3" stroke-width="3" fill="none"/>', x=620, ly=316),
        I('jambe', 'la jambe', 'f', 'leg', 'x', d=legs() + shorts, x=230, ly=520),
        I('genou', 'le genou', 'm', 'knee', 'x', d=f'<path d="M350,488 q9,7 18,0 M432,488 q9,7 18,0" stroke="#D29A74" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="359" cy="484" rx="15" ry="12" fill="{SKIN2}" opacity=".45"/><ellipse cx="441" cy="484" rx="15" ry="12" fill="{SKIN2}" opacity=".45"/>', x=620, ly=486),
        I('pied', 'le pied', 'm', 'foot', 'x', d='<rect x="345" y="586" width="28" height="12" rx="4" fill="#fff"/><rect x="427" y="586" width="28" height="12" rx="4" fill="#fff"/><path d="M372,596 L344,596 Q328,598 326,612 Q326,622 336,622 L372,622Z" fill="#E2524A"/><path d="M428,596 L456,596 Q472,598 474,612 Q474,622 464,622 L428,622Z" fill="#E2524A"/><path d="M326,616 H372 M428,616 H474" stroke="#fff" stroke-width="3"/>', x=620, ly=630),
    ]
    face = f'''<defs><radialGradient id="bd-hd" cx=".45" cy=".42" r=".65"><stop offset="0" stop-color="#FBE0C8"/><stop offset="1" stop-color="#F0BF98"/></radialGradient></defs>
 <rect x="388" y="138" width="24" height="26" rx="6" fill="{SKIN2}"/>
 <path d="M348,112 C340,60 368,40 400,40 C432,40 460,60 452,112 Z" fill="{HAIR}"/>
 <ellipse cx="350" cy="104" rx="9" ry="13" fill="{SKIN2}"/><ellipse cx="450" cy="104" rx="9" ry="13" fill="{SKIN2}"/>
 <path d="M352,100 C352,128 372,148 400,148 C428,148 448,128 448,100 C448,88 446,80 443,74 Q430,84 416,70 Q402,84 386,70 Q372,84 357,74 C354,82 352,90 352,100Z" fill="url(#bd-hd)"/>
 <ellipse cx="383" cy="100" rx="8" ry="9" fill="#fff"/><circle cx="384" cy="101" r="5.5" fill="#3B2416"/><circle cx="386" cy="98" r="2" fill="#fff"/>
 <ellipse cx="417" cy="100" rx="8" ry="9" fill="#fff"/><circle cx="418" cy="101" r="5.5" fill="#3B2416"/><circle cx="420" cy="98" r="2" fill="#fff"/>
 <path d="M374,86 q9,-5 18,0 M408,86 q9,-5 18,0" stroke="{HAIR}" stroke-width="3" fill="none" stroke-linecap="round"/>
 <ellipse cx="372" cy="118" rx="8" ry="5" fill="#F49A9A" opacity=".5"/><ellipse cx="428" cy="118" rx="8" ry="5" fill="#F49A9A" opacity=".5"/>
 <path d="M396,112 q4,4 8,0" stroke="#D08E66" stroke-width="2.5" fill="none" stroke-linecap="round"/>
 <path d="M387,124 Q400,138 413,124 Q400,128 387,124Z" fill="#A8323A"/>'''
    # the back, seen from behind, on the right: hair over the whole head, ears, T-shirt, shorts, trainers
    back = (f'<g transform="translate(780,20) scale(.9) translate(-400,0)"><rect x="388" y="138" width="24" height="28" rx="6" fill="{SKIN2}"/>'
            f'<ellipse cx="350" cy="104" rx="9" ry="13" fill="{SKIN2}"/><ellipse cx="450" cy="104" rx="9" ry="13" fill="{SKIN2}"/>'
            f'<path d="M352,104 C346,58 370,40 400,40 C430,40 454,58 448,104 C446,128 430,144 400,146 C370,144 354,128 352,104Z" fill="{HAIR}"/><path d="M380,60 q20,-10 40,4" stroke="#6B4226" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>'
            f'<circle cx="338" cy="184" r="28" fill="{c}"/><circle cx="462" cy="184" r="28" fill="{c}"/>'
            f'<path d="M318,204 Q302,262 304,326 M482,204 Q498,262 496,326" stroke="{SKIN}" stroke-width="26" stroke-linecap="round" fill="none"/>'
            f'<ellipse cx="303" cy="348" rx="19" ry="21" fill="{SKIN}"/><ellipse cx="497" cy="348" rx="19" ry="21" fill="{SKIN}"/>'
            + legs() + shorts +
            '<rect x="345" y="586" width="28" height="12" rx="4" fill="#fff"/><rect x="427" y="586" width="28" height="12" rx="4" fill="#fff"/><rect x="340" y="596" width="38" height="26" rx="10" fill="#E2524A"/><rect x="422" y="596" width="38" height="26" rx="10" fill="#E2524A"/>'
            '<text x="400" y="668" text-anchor="middle" font-size="14" fill="#64748B">de dos (from behind)</text></g>')
    items.insert(1, I('dos', 'le dos', 'm', 'back', 'x', d=f'<g transform="translate(780,20) scale(.9) translate(-400,0)"><path d="M336,170 Q400,154 464,170 Q472,214 470,262 L468,344 Q400,358 332,344 L330,262 Q328,214 336,170Z" fill="#3E86C2"/><path d="M382,164 Q400,170 418,164" stroke="#2F6FA3" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M400,176 V330" stroke="#2F6FA3" stroke-width="2" opacity=".5"/></g>', x=780, ly=262))
    # order: corps (invisible box) first, then the drawn parts; the head and the back figure are scenery
    s += face + back
    for it in items: it.pop('pic', None)
    poit = next(i for i in items if i['key'] == 'poitrine'); poit['x'], poit['ly'] = 620, 196
    leaders = '<g stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 3">' + ''.join(f'<path d="{p}"/>' for p in [
        'M520,60 L466,74', 'M262,150 L314,176', 'M262,262 L306,262', 'M262,358 L284,352', 'M262,420 L288,376', 'M580,196 L462,206', 'M580,226 L452,222', 'M580,316 L466,312', 'M262,520 L342,520', 'M580,486 L456,484', 'M580,630 L474,616']) + '</g>'
    return dict(title='Le corps', w=900, h=700, minw=560, center=True, scene=s + leaders, items=items)

T20 = dict(name='Picture', next='Explore the body', title='Le corps', scenes=[
 face_scene(), body_scene(),
 grid('La santé', '#EAF4EA', '#FFFFFF', [
    I('douleur', 'la douleur', 'f', 'pain', 'face-with-head-bandage'),
    I('blessure / blessé', 'la blessure / blessé', 'f', 'injury / injured', 'adhesive-bandage', lines=['la blessure', 'blessé'], lc=['f', 'x']),
    I('malade', 'malade', 'x', 'ill, sick', 'nauseated-face'),
    I('rhume / enrhumé', 'le rhume / enrhumé', 'm', 'a cold / to have a cold', 'sneezing-face', lines=['le rhume', 'enrhumé'], lc=['m', 'x']),
    I('grippe', 'la grippe', 'f', 'flu', 'face-with-thermometer'),
    I('fièvre', 'la fièvre', 'f', 'fever, temperature', 'thermometer'),
    I('toux', 'la toux', 'f', 'cough', 'face-with-medical-mask'),
    I('rendez-vous', 'le rendez-vous', 'm', 'appointment', 'spiral-calendar'),
    I('urgences', 'les urgences', 'f', 'A&E, emergency room', 'ambulance', pl=True),
    I('hôpital', "l'hôpital", 'm', 'hospital', 'hospital'),
    I('ordonnance', "l'ordonnance", 'f', 'prescription', 'page-with-curl'),
    I('médicament', 'le médicament', 'm', 'medicine', 'pill'),
    I('comprimé', 'le comprimé', 'm', 'tablet, pill', 'draw:tablets'),
 ]),
])
# the body scenes give the item d directly: keep it
for sc in T20['scenes'][:2]:
    for it in sc['items']: it.pop('draw', None)

# ---------------- 28 Technology ----------------
T28 = dict(name='Picture', next='Explore the devices', title='La technologie', scenes=[
 grid('Les appareils', '#EEF2FF', '#FFFFFF', [
    I('ordinateur', "l'ordinateur", 'm', 'computer', 'desktop-computer'),
    I('ordinateur portable', "l'ordinateur portable", 'm', 'laptop', 'laptop', lines=["l'ordinateur", 'portable'], lc=['m', 'm']),
    I('téléphone portable', 'le téléphone portable', 'm', 'mobile phone', 'mobile-phone', lines=['le téléphone', 'portable'], lc=['m', 'm']),
    I('écran', "l'écran", 'm', 'screen', 'television'),
    I('clavier', 'le clavier', 'm', 'keyboard', 'keyboard'),
    I('souris', 'la souris', 'f', 'mouse', 'computer-mouse'),
    I('écouteurs', 'les écouteurs', 'm', 'headphones, earphones', 'headphone', pl=True),
    I('appareil photo', "l'appareil photo", 'm', 'camera', 'camera'),
    I('imprimante', "l'imprimante", 'f', 'printer', 'printer'),
    I('je n\'ai plus de batterie.', "je n'ai plus de batterie", 'x', 'my battery is dead', 'low-battery', lines=["je n'ai plus", 'de batterie'], lc=['x', 'x']),
 ]),
 grid('En ligne', '#F0FDFA', '#FFFFFF', [
    I('site web', 'le site web', 'm', 'website', 'globe-with-meridians'),
    I('réseau', 'le réseau', 'm', 'network, signal', 'antenna-bars'),
    I('fichier', 'le fichier', 'm', 'file', 'file-folder'),
    I('lien', 'le lien', 'm', 'link', 'link'),
    I("mail / l'e-mail", "le mail / l'e-mail", 'm', 'email', 'e-mail', lines=['le mail', "l'e-mail"], lc=['m', 'm']),
    I('pièce jointe', 'la pièce jointe', 'f', 'attachment', 'paperclip'),
    I('sms', 'le SMS', 'm', 'text message', 'speech-balloon'),
    I('appel', "l'appel", 'm', 'call', 'telephone-receiver'),
    I('appel vidéo', "l'appel vidéo", 'm', 'video call', 'video-camera'),
    I('télécharger', 'télécharger', 'x', 'to download', 'inbox-tray'),
    I('@', "l'arobase", 'f', '@ (at)', 'draw:at', note='jean.martin@gmail.com: jean point martin arobase gmail point com'),
 ]),
])

# ---------------- 29 Animals & Nature ----------------
def landscape():
    W, H = 900, 640
    s = f'''<defs><linearGradient id="ls-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2A5A"/><stop offset=".35" stop-color="#7AA7D9"/><stop offset="1" stop-color="#CFE8F7"/></linearGradient>
 <linearGradient id="ls-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3FA0D9"/><stop offset="1" stop-color="#1D6FA8"/></linearGradient></defs>
 <rect width="{W}" height="{H}" fill="url(#ls-sky)"/>'''
    items = [
        I('lune', 'la lune', 'f', 'moon', 'x', d='<circle cx="90" cy="70" r="34" fill="#FFF3C4"/><circle cx="106" cy="60" r="30" fill="#2B3C72"/>', x=150, ly=118),
        I('étoile', "l'étoile", 'f', 'star', 'x', d='<path d="M250,30 l8,18 l20,2 l-15,13 l5,20 l-18,-10 l-18,10 l5,-20 l-15,-13 l20,-2z" fill="#FDE68A"/>', x=250, ly=104),
        I('montagne', 'la montagne', 'f', 'mountain', 'x', d='<path d="M0,330 L150,140 L250,250 L330,170 L470,330Z" fill="#7C8BA3"/><path d="M150,140 L180,178 L160,174 L148,186 L130,172 L122,176Z M330,170 L356,200 L338,198 L326,210 L314,196Z" fill="#fff"/>', x=200, ly=228),
        I('colline', 'la colline', 'f', 'hill', 'x', d='<path d="M440,330 Q560,220 700,330Z" fill="#8FCB72"/>', x=575, ly=296),
        I('campagne', 'la campagne', 'f', 'countryside', 'x', d='<path d="M0,330 H900 V470 H0Z" fill="#A7D88C"/><path d="M0,360 H460 M0,400 H440 M0,440 H420" stroke="#C8E6A8" stroke-width="10"/><rect x="60" y="342" width="34" height="26" fill="#EFE3CF"/><path d="M54,344 L77,326 L100,344Z" fill="#B5543A"/>', x=130, ly=430),
        I('fleuve', 'le fleuve', 'm', 'large river (to the sea)', 'x', d='<path d="M520,330 Q560,380 600,420 Q640,460 700,470 L760,470 Q690,450 650,410 Q610,370 590,330Z" fill="#4FA9E3"/>', x=640, ly=360, fs=14),
        I('rivière', 'la rivière', 'f', 'river', 'x', d='<path d="M250,250 Q300,300 380,330 Q460,360 560,395" stroke="#7CC4EE" stroke-width="12" fill="none" stroke-linecap="round"/>', x=360, ly=316, fs=14),
        I('lac', 'le lac', 'm', 'lake', 'x', d='<ellipse cx="300" cy="420" rx="80" ry="26" fill="#5DB5E8"/><path d="M250,416 q14,-6 28,0 M310,424 q14,-6 28,0" stroke="#BFE6FA" stroke-width="3" fill="none"/>', x=300, ly=426, fs=14),
        I('mer', 'la mer', 'f', 'sea', 'x', d=f'<path d="M0,520 Q450,490 900,520 V{H} H0Z" fill="url(#ls-sea)"/><path d="M40,560 q20,-8 40,0 q20,8 40,0 M300,590 q20,-8 40,0 q20,8 40,0 M620,570 q20,-8 40,0 q20,8 40,0" stroke="#A9DBF7" stroke-width="3" fill="none"/>', x=460, ly=606),
        I('plage', 'la plage', 'f', 'beach', 'x', d='<path d="M460,470 H900 V520 Q680,500 460,500Z" fill="#F3D9A0"/><path d="M530,488 q16,-24 32,0z" fill="#E8574A"/><rect x="545" y="470" width="2" height="20" fill="#666"/>', x=840, ly=494, fs=14),
        I('sable', 'le sable', 'm', 'sand', 'x', d=''.join(f'<circle cx="{620 + (k * 37) % 200}" cy="{480 + (k * 13) % 18}" r="2" fill="#D6B46E"/>' for k in range(24)), x=700, ly=500, fs=14),
        I('île', "l'île", 'f', 'island', 'x', d='<ellipse cx="780" cy="582" rx="70" ry="16" fill="#F3D9A0"/><path d="M780,582 Q776,540 790,520" stroke="#8B5E34" stroke-width="6" fill="none"/><path d="M790,520 q-30,-6 -44,10 M790,520 q24,-14 44,0 M790,520 q-4,-24 -22,-28 M790,520 q10,-22 28,-22" stroke="#2F9E58" stroke-width="8" fill="none" stroke-linecap="round"/>', x=780, ly=620, fs=14),
        I('arbre', "l'arbre", 'm', 'tree', 'x', d='<rect x="404" y="400" width="14" height="60" fill="#7A5134"/><circle cx="411" cy="386" r="34" fill="#3E9A57"/><circle cx="392" cy="402" r="22" fill="#4FAF66"/>', x=411, ly=342, fs=14),
        I('fleur', 'la fleur', 'f', 'flower', 'x', d='<path d="M200,470 v-26" stroke="#3E9A57" stroke-width="4"/>' + ''.join(f'<circle cx="{200 + 9 * __import__("math").cos(k * 1.2566)}" cy="{438 + 9 * __import__("math").sin(k * 1.2566)}" r="7" fill="#F48FB1"/>' for k in range(5)) + '<circle cx="200" cy="438" r="5" fill="#FFD54A"/>', x=200, ly=490, fs=14),
        I('herbe', "l'herbe", 'f', 'grass', 'x', d=''.join(f'<path d="M{100 + k * 9},470 l-4,-18 M{100 + k * 9},470 l4,-14" stroke="#3E9A57" stroke-width="3"/>' for k in range(8)), x=130, ly=490, fs=14),
        I('pierre', 'la pierre', 'f', 'stone', 'x', d='<path d="M40,470 q4,-20 26,-22 q20,-2 26,22z" fill="#9CA3AF"/><path d="M52,456 q10,-6 20,-2" stroke="#D1D5DB" stroke-width="3" fill="none"/>', x=66, ly=490, fs=14),
    ]
    for it in items: it.pop('pic', None)
    return dict(title='Le paysage', w=W, h=H, minw=600, scene=s, items=items)

T29 = dict(name='Picture', next='Explore animals and nature', title='Les animaux et la nature', scenes=[
 grid('À la ferme et à la maison', '#EAF4EA', '#FFFFFF', [
    I('chien', 'le chien', 'm', 'dog', 'dog'), I('chat', 'le chat', 'm', 'cat', 'cat'), I('lapin', 'le lapin', 'm', 'rabbit', 'rabbit'),
    I('poisson', 'le poisson', 'm', 'fish', 'fish'), I('oiseau', "l'oiseau", 'm', 'bird', 'bird'), I('cheval', 'le cheval', 'm', 'horse', 'horse'),
    I('vache', 'la vache', 'f', 'cow', 'cow'), I('cochon', 'le cochon', 'm', 'pig', 'pig'), I('mouton', 'le mouton', 'm', 'sheep', 'ewe'),
    I('poule', 'la poule', 'f', 'hen', 'chicken'),
 ]),
 grid('Dans la nature', '#F0F9FF', '#FFFFFF', [
    I('loup', 'le loup', 'm', 'wolf', 'wolf'), I('ours', "l'ours", 'm', 'bear', 'bear'), I('renard', 'le renard', 'm', 'fox', 'fox'),
    I('cerf', 'le cerf', 'm', 'deer', 'deer'), I('singe', 'le singe', 'm', 'monkey', 'monkey'), I('serpent', 'le serpent', 'm', 'snake', 'snake'),
    I('grenouille', 'la grenouille', 'f', 'frog', 'frog'), I('baleine', 'la baleine', 'f', 'whale', 'whale'), I('dauphin', 'le dauphin', 'm', 'dolphin', 'dolphin'),
    I('requin', 'le requin', 'm', 'shark', 'shark'), I('abeille', "l'abeille", 'f', 'bee', 'honeybee'), I('papillon', 'le papillon', 'm', 'butterfly', 'butterfly'),
    I('araignée', "l'araignée", 'f', 'spider', 'spider'), I('mouche', 'la mouche', 'f', 'fly', 'fly'), I('recyclage', 'le recyclage', 'm', 'recycling', 'recycling-symbol'),
 ]),
 landscape(),
])

# ---------------- 32 Sport ----------------
T32 = dict(name='Picture', next='Explore sport', title='Le sport', scenes=[
 grid('Le match', '#EAF4EA', '#FFFFFF', [
    I('football', 'le football', 'm', 'football', 'soccer-ball,goal-net'),
    I('ballon', 'le ballon', 'm', 'ball (big)', 'basketball', note='A big ball you kick or throw: football, basket.'),
    I('balle', 'la balle', 'f', 'ball (small)', 'tennis', note='A small ball: tennis, golf.'),
    I('équipe', "l'équipe", 'f', 'team', 'busts-in-silhouette'),
    I('joueur', 'le joueur', 'm', 'player', 'person-bouncing-ball'),
    I('arbitre', "l'arbitre", 'm', 'referee', 'draw:whistle'),
    I('stade', 'le stade', 'm', 'stadium', 'stadium'),
    I('terrain', 'le terrain', 'm', 'pitch, field', 'draw:field'),
    I('match', 'le match', 'm', 'match, game', 'draw:score'),
    I('but', 'le but', 'm', 'goal', 'goal-net'),
    I('supporter', 'le supporter', 'm', 'fan, supporter', 'raising-hands'),
    I('gagner', 'gagner', 'x', 'to win', '1st-place-medal'),
    I('championnat', 'le championnat', 'm', 'championship', 'trophy'),
    I('médaille', 'la médaille', 'f', 'medal', 'sports-medal'),
 ]),
 grid("L'entraînement", '#FFF7ED', '#FFFFFF', [
    I('entraînement', "l'entraînement", 'm', 'training', 'person-lifting-weights'),
    I('entraîneur', "l'entraîneur", 'm', 'coach', 'draw:coach'),
    I('courir', 'courir', 'x', 'to run', 'person-running'),
    I('marcher', 'marcher', 'x', 'to walk', 'person-walking'),
    I('course', 'la course', 'f', 'race', 'chequered-flag'),
    I('sauter', 'sauter', 'x', 'to jump', 'draw:jump'),
    I('lancer', 'lancer', 'x', 'to throw', 'man-playing-handball'),
    I('vélo', 'le vélo', 'm', 'bike', 'bicycle'),
    I('fatigue', 'la fatigue', 'f', 'tiredness', 'face-with-head-bandage'),
 ]),
])

# ---------------- write into js/picture-page.js ----------------
def js(s): return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
def q(s): return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'
def item_js(w):
    parts = [f"key: {q(w['key'])}", f"fr: {q(w['fr'])}", f"g: '{w['g']}'", f"en: {q(w['en'])}", f"x: {w['x']}", f"ly: {w['ly']}"]
    if w.get('lines'): parts.append('lines: [' + ', '.join(q(t) for t in w['lines']) + ']')
    if w.get('lc'): parts.append('lc: [' + ', '.join(f"'{c}'" for c in w['lc']) + ']')
    for k in ('fs',):
        if w.get(k): parts.append(f'{k}: {w[k]}')
    if w.get('pl'): parts.append('pl: true')
    if w.get('nobox'): parts.append('nobox: true')
    if w.get('note'): parts.append(f"note: {q(w['note'])}")
    parts.append(f"d: `{js(w['d'])}`")
    return '            { ' + ', '.join(parts) + ' },'
def page_js(n, label, T):
    sc = []
    for s in T['scenes']:
        sc.append(f"        {{ title: {q(s['title'])}, w: {s['w']}, h: {s['h']}, minw: {s['minw']}, {'center: true, ' if s.get('center') else ''}scene: `{js(s['scene'])}`, items: [\n" + '\n'.join(item_js(w) for w in s['items']) + '\n        ] },')
    return (f"// ---------------- {n} {label} (made by tools/picture-pages/topics.py) ----------------\n"
            f"PAGES[{n}] = {{\n    name: {q(T['name'])}, next: {q(T['next'])}, title: {q(T['title'])},\n    credit: '3D pictures: Microsoft Fluent Emoji (MIT licence)',\n    scenes: [\n" + '\n'.join(sc) + '\n    ],\n};\n')

PAGES = [(11, 'Professions & Occupations', T11), (17, 'The Survival 50 Nouns', T17), (19, 'Clothing & Shopping', T19), (20, 'Body Parts & Health', T20),
         (28, 'Technology & Communication', T28), (29, 'Animals & Nature', T29), (32, 'Sport & Fitness', T32)]
p = os.path.join(ROOT, 'js', 'picture-page.js')
s = open(p, encoding='utf-8').read()
for n, label, T in PAGES:
    block = page_js(n, label, T)
    m = re.search(r'// -+ ' + str(n) + r' [^\n]*\n.*?(?=\n// -+ |\nconst CSS)', s, re.S)
    if m: s = s[:m.start()] + block.rstrip('\n') + s[m.end():]
    else:
        i = s.index('\nconst CSS'); s = s[:i] + '\n' + block + s[i:]
    # every picture file must exist
    for sc in T['scenes']:
        for w in sc['items']:
            for f in re.findall(r'media/pictures/([^"]+)', w['d']):
                assert os.path.exists(os.path.join(ROOT, 'media', 'pictures', f)), f
    print(n, label, [len(sc['items']) for sc in T['scenes']])
open(p, 'w', encoding='utf-8').write(s)
