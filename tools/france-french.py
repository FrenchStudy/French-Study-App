"""France French wording for the exam bank (content/tcf/*.json).
Only French fields change (not *_en). The Canadian setting, places and dollars stay; cégep stays."""
import json, glob, os, re, sys
from collections import Counter

DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'content', 'tcf') + os.sep
EN = re.compile(r'(^|\.)(en|title_en|prompt_en|answer_en)(\.|\[|$)')
SKIP_KEYS = {'rx', 'key', 'slug', 'id', 'task', 'emoji'}

# Québec "dîner" = lunch: in these questions' answers it becomes "déjeuner" (checked against the English)
LUNCH = {('agriculture', 3), ('agriculture', 35), ('avenir', 46), ('cadre-de-vie', 18), ('education', 45),
         ('loisirs', 18), ('psychologie', 6), ('temps', 7), ('temps', 34), ('travail', 7)}
# Québec's own childcare network, described as such: keep "garderies"
KEEP_GARDERIE = {('politique', 51)}

RULES = [
    # breakfast (Québec "déjeuner")
    (r"\bun bon déjeuner\b", "un bon petit-déjeuner"),
    # supper -> dîner (lunch "dîner" was handled before these run)
    (r"\bsouper\b", "dîner"), (r"\bSouper\b", "Dîner"), (r"\bsoupers\b", "dîners"),
    # e-mail
    (r"\bce courriel\b", "cet e-mail"), (r"\bCe courriel\b", "Cet e-mail"),
    (r"\bde courriels\b", "d'e-mails"), (r"\bde courriel\b", "d'e-mail"),
    (r"\ble courriel\b", "l'e-mail"), (r"\bLe courriel\b", "L'e-mail"),
    (r"\bdu courriel\b", "de l'e-mail"), (r"\bau courriel\b", "à l'e-mail"),
    (r"\bcourriels\b", "e-mails"), (r"\bcourriel\b", "e-mail"),
    (r"\bCourriels\b", "E-mails"), (r"\bCourriel\b", "E-mail"),
    # week-end
    (r"\bbonne fin de semaine\b", "bon week-end"), (r"\bBonne fin de semaine\b", "Bon week-end"),
    (r"\bbelle fin de semaine\b", "beau week-end"),
    (r"\bcette fin de semaine\b", "ce week-end"), (r"\bCette fin de semaine\b", "Ce week-end"),
    (r"\bla fin de semaine\b", "le week-end"), (r"\bLa fin de semaine\b", "Le week-end"),
    (r"\bune fin de semaine\b", "un week-end"), (r"\ben fin de semaine\b", "en week-end"),
    (r"\bma fin de semaine\b", "mon week-end"), (r"\bta fin de semaine\b", "ton week-end"), (r"\bsa fin de semaine\b", "son week-end"),
    (r"\b(notre|votre|chaque) fin de semaine\b", r"\1 week-end"),
    (r"\bde fin de semaine\b", "de week-end"),
    (r"\bfins de semaine\b", "week-ends"),
    # bus
    (r"\ben autobus\b", "en car"), (r"\bl'autobus scolaire\b", "le car scolaire"),
    (r"\bde l'autobus\b", "du bus"), (r"\bà l'autobus\b", "au bus"),
    (r"\bl'autobus\b", "le bus"), (r"\bL'autobus\b", "Le bus"), (r"\bd'autobus\b", "de bus"),
    (r"\bautobus\b", "bus"), (r"\bAutobus\b", "Bus"),
    # flats
    (r"\bLes frais de condo\b", "Les charges de copropriété"),
    (r"\bimmeuble (?:à|de) condos\b", "immeuble en copropriété"),
    (r"\ben condo\b", "en copropriété"),
    (r"\bpour un condo, les frais de copropriété\b", "pour un appartement, les charges de copropriété"),
    (r"\bdes condos, un parc\b", "des appartements, un parc"),
    (r"\bfrais de copropriété\b", "charges de copropriété"),
    (r"\bcondos\b", "appartements"), (r"\bcondo\b", "appartement"),
    # childcare (garderie -> crèche, same gender)
    (r"\bgarderies\b", "crèches"), (r"\bgarderie\b", "crèche"), (r"\bGarderie\b", "Crèche"),
    # corner shop
    (r"\bseulement des dépanneurs\b", "seulement des supérettes"),
    (r"\bau dépanneur du coin\b", "à l'épicerie du coin"),
    (r"\bau dépanneur d'en face\b", "à la supérette d'en face"),
    (r"\bdépanneurs\b", "supérettes"), (r"\bdépanneur\b", "supérette"),
    # groceries (Québec "l'épicerie" = the food shopping)
    (r"\b(le|Le) (coût|prix) de l'épicerie\b", r"\1 \2 des courses"),
    (r"\bl'épicerie, le loyer et l'essence coûtent\b", "les courses, le loyer et l'essence coûtent"),
    (r"\bles loyers et l'épicerie aussi\b", "les loyers et les courses aussi"),
    (r"\bL'épicerie aussi a beaucoup augmenté\b", "Les courses aussi ont beaucoup augmenté"),
    (r"\bde l'épicerie qui coûte cher\b", "des courses qui coûtent cher"),
    (r"\béconomiser à l'épicerie\b", "économiser sur les courses"),
    (r"\bproduits à l'épicerie\b", "produits au supermarché"),
    (r"\bfaire l'épicerie\b", "faire les courses"),
    # school years (primary) and degrees
    (r"\ben deuxième année, commence\b", "en CE1, commence"),
    (r"\bAdam, en troisième année\b", "Adam, en CE2"),
    (r"\bla classe de deuxième année de ma fille\b", "la classe de CE1 de ma fille"),
    (r"\bMa fille est en deuxième année\b", "Ma fille est en CE1"),
    (r"\bEn troisième secondaire\b", "En troisième"),
    (r"\bexiste déjà en cinquième secondaire\b", "existe déjà au lycée"),
    (r"\ble baccalauréat en droit\b", "la licence en droit"),
    (r"\baprès le baccalauréat\b", "après la licence"),
    # media and phones
    (r"\bbalados\b", "podcasts"), (r"\bbalado\b", "podcast"),
    (r"\bdes textos\b", "des SMS"), (r"\bun texto\b", "un SMS"), (r"\btextos?\b", "SMS"),
    (r"\bdans le clavardage\b", "dans le chat"),
    (r"\btéléphone cellulaire\b", "téléphone portable"), (r"\bcellulaire\b", "portable"),
    # shopping, holidays, misc
    (r"\bapplications de magasinage\b", "applications de shopping"),
    (r"\bBon magasinage\b", "Bon shopping"),
    (r"\bUn camp de jour\b", "Un centre de loisirs"), (r"\bcamps? de jour\b", "centre de loisirs"),
    (r"\bbleuets\b", "myrtilles"),
    (r"\bc'est le temps de la famille\b", "place à la famille"),
    (r"\bSalut la gang\b", "Salut tout le monde"),
    (r"\bun médecin de famille\b", "un médecin traitant"), (r"\bmédecin de famille\b", "médecin traitant"),
]
ALREADY = re.compile(r"\bdéjeuner\b")   # lunch already changed in this text
COMPILED = [(re.compile(p), r) for p, r in RULES]
used = Counter()

def fix(s, slug, idx):
    if idx is not None and (slug, idx) in LUNCH:
        # only where the text still says "souper" for the evening meal or has no "souper" at all
        # (once "souper" is changed, the "dîner" left is the evening meal: running this again changes nothing)
        s2 = re.sub(r"\bdîner\b", "déjeuner", s) if not ALREADY.search(s) else s
        if s2 != s: used['dîner→déjeuner (lunch)'] += 1; s = s2
    keep = idx is not None and (slug, idx) in KEEP_GARDERIE
    for rx, rep in COMPILED:
        if keep and 'garderie' in rx.pattern: continue
        s2, n = rx.subn(rep, s)
        if n: used[rx.pattern] += n; s = s2
    return s

def walk(x, slug, path, idx):
    if isinstance(x, str):
        return x if EN.search(path) else fix(x, slug, idx)
    if isinstance(x, list):
        return [walk(v, slug, f'{path}[{i}]', idx) for i, v in enumerate(x)]
    if isinstance(x, dict):
        return {k: (v if k in SKIP_KEYS else walk(v, slug, f'{path}.{k}' if path else k, idx)) for k, v in x.items()}
    return x

changed = 0
for f in sorted(glob.glob(DIR + '*.json')):
    if f.endswith('index.json'): continue
    raw = open(f, encoding='utf-8').read()
    d = json.loads(raw); slug = os.path.basename(f)[:-5]
    out = dict(d)
    out['words'] = walk(d.get('words', []), slug, 'words', None)
    out['prompts'] = [walk(p, slug, f'prompts[{i}]', i) for i, p in enumerate(d['prompts'])]
    for k in d:
        if k not in ('words', 'prompts'): out[k] = d[k]
    out = {k: out[k] for k in d}   # same key order
    compact = ',' not in raw[:200] or '\n' not in raw.strip()
    text = json.dumps(out, ensure_ascii=False, separators=(',', ':')) if '\n' not in raw.strip() else json.dumps(out, ensure_ascii=False, indent=2)
    if raw.endswith('\n'): text += '\n'
    if text != raw: changed += 1; open(f, 'w', encoding='utf-8').write(text)
print('files changed', changed)
for k, v in used.most_common(): print(v, k)
