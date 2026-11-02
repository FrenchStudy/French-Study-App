# tools/connectors/connectors.py - the connectors of Topic 3 (Connectors & Small Words), in one place.
#   python3 tools/connectors/connectors.py
# Writes:
#   tools/connectors/out/roles.js     -> the "Relier" tab (roles, join items, say-it sentences): replaces that tab in js/scale-data.js (theme 3)
#   tools/connectors/out/order.js     -> the "more:" words of the "Dans l'ordre" tab (same file)
#   tools/connectors/out/chapters.js  -> the new Learn chapters, after the first three of theme 3 in js/chapters-data.js
# (out/ is not kept in git: paste the parts in by hand after a change, then run the Vocab tests.)
#   supabase/vocab-themes/15_more_connectors.sql (+ 15_undo_more_connectors.sql) -> the word list in Supabase
# France French only. A word that does two jobs (comme, alors que, tandis que, aussi) is listed in each group,
# but is one word in the word list (dup=True on the second listing).
import json, os, re

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(R, 'tools', 'connectors', 'out')

# name, English, colour, icon
ROLES = [
    ('Ajouter', 'and, what\'s more', '#059669', '➕'),
    ('Préciser', 'that is, in fact, for example', '#0891b2', '🔎'),
    ('Opposer', 'but, however, except', '#e11d48', '↔️'),
    ('Choisir', 'or, either… or', '#7c3aed', '🔀'),
    ('Expliquer', 'because, since', '#d97706', '💡'),
    ('Conclure', 'so, therefore, to sum up', '#0369a1', '➡️'),
    ('Condition', 'if, unless, probably', '#0f766e', '❓'),
    ('But', 'so that, in order to', '#9333ea', '🎯'),
    ('Temps', 'when, while, as soon as', '#475569', '⏱️'),
]

# role, French (as shown), English, part of speech, note, example FR, example EN
# old=True: already in Topic 3 (kept as it was); dup=True: shown again in another group, one word in the list
W = []
def w(role, fr, en, pos, note, ex_fr, ex_en, old=False, dup=False, key=None):
    W.append(dict(role=role, fr=fr, en=en, pos=pos, note=note, ex=[ex_fr, ex_en], old=old, dup=dup, key=key or fr))

# ---- Ajouter ----
w('Ajouter', 'et', 'and', 'conj', '', 'J\'ai un frère et une sœur.', 'I have a brother and a sister.', old=True)
w('Ajouter', 'aussi', 'also, too', 'adv', '', 'Moi aussi !', 'Me too!', old=True)
w('Ajouter', 'de plus', 'what\'s more, moreover', 'adv', 'Semi-formal. At the start, followed by a comma.', 'Il est doué. De plus, il est très motivé.', 'He is talented. What\'s more, he is very motivated.')
w('Ajouter', 'en outre', 'furthermore, moreover', 'adv', 'Formal, mostly written. At the start of the sentence.', 'L\'analyse est précise. En outre, elle est complète.', 'The analysis is precise. Furthermore, it is complete.')
w('Ajouter', 'par ailleurs', 'besides, also', 'adv', 'Semi-formal: adds a point on a slightly different subject.', 'Le budget est serré. Par ailleurs, nous devons recruter.', 'The budget is tight. Besides, we need to recruit.')
w('Ajouter', 'non seulement… mais aussi', 'not only… but also', 'conj', 'Puts weight on the second fact. Formal variant: « non seulement… mais encore ».', 'Elle est non seulement intelligente, mais aussi très gentille.', 'She is not only intelligent but also very kind.')
w('Ajouter', 'quant à', 'as for', 'prep', 'Neutral: turns to another person or thing. Quant à + le = quant au.', 'J\'aime le bleu ; quant à Paul, il préfère le rouge.', 'I like blue; as for Paul, he prefers red.')
w('Ajouter', 'de la même façon', 'in the same way, similarly', 'adv', 'Semi-formal: the next idea mirrors the one before.', 'Il a travaillé dur. De la même façon, elle s\'est beaucoup investie.', 'He worked hard. In the same way, she put a lot into it.')

# ---- Préciser ----
w('Préciser', 'c\'est-à-dire', 'that is to say, i.e.', 'adv', 'Neutral, usually in the middle of the sentence. Written c.-à-d.', 'J\'ai besoin d\'un véhicule, c\'est-à-dire d\'une voiture.', 'I need a vehicle, that is to say a car.')
w('Préciser', 'autrement dit', 'in other words', 'adv', 'Neutral: says the same thing more simply.', 'Il est parti, autrement dit, il nous a laissés seuls.', 'He left; in other words, he left us alone.')
w('Préciser', 'en d\'autres termes', 'in other words', 'adv', 'Semi-formal synonym of autrement dit.', 'C\'est un succès, en d\'autres termes, un triomphe.', 'It is a success; in other words, a triumph.')
w('Préciser', 'en fait', 'in fact, actually', 'adv', 'Neutral: corrects what you thought or said.', 'Je pensais qu\'il était riche. En fait, il a des dettes.', 'I thought he was rich. In fact, he has debts.')
w('Préciser', 'en réalité', 'in reality, actually', 'adv', 'Semi-formal: what is really true, against how it looks.', 'Il semble heureux. En réalité, il est inquiet.', 'He seems happy. In reality, he is worried.')
w('Préciser', 'en effet', 'indeed (because…)', 'adv', 'Semi-formal: confirms or explains what was just said. Not « in effect ».', 'Il ne viendra pas ce soir. En effet, il est malade.', 'He won\'t come tonight: he is indeed ill.')
w('Préciser', 'effectivement', 'indeed, that\'s right', 'adv', 'Neutral: agrees that something is true.', 'Vous aviez raison : effectivement, le magasin est fermé.', 'You were right: indeed, the shop is closed.')
w('Préciser', 'par exemple', 'for example', 'adv', 'Neutral, very common.', 'J\'aime les fruits, par exemple les pommes.', 'I like fruit, for example apples.')
w('Préciser', 'notamment', 'notably, in particular', 'adv', 'Semi-formal: one example among others.', 'J\'ai beaucoup d\'amis, notamment Pierre et Marie.', 'I have many friends, notably Pierre and Marie.')
w('Préciser', 'en particulier', 'in particular', 'adv', 'Semi-formal: picks out one thing.', 'J\'aime la cuisine italienne, en particulier les pâtes.', 'I like Italian food, in particular pasta.')
w('Préciser', 'entre autres', 'among other things', 'adv', 'Neutral: the example is one of several.', 'Il a étudié plusieurs langues, entre autres l\'espagnol et l\'italien.', 'He studied several languages, among others Spanish and Italian.')
w('Préciser', 'comme', 'such as, like', 'conj', 'Here: introduces an example, + noun.', 'J\'aime les animaux comme les chats.', 'I like animals such as cats.', dup=True)
w('Préciser', 'c\'est le cas de', 'this is the case for', 'adv', 'Semi-formal: gives an example that fits.', 'Beaucoup d\'élèves sont absents ; c\'est le cas de Paul.', 'Many pupils are absent; this is the case for Paul.')
w('Préciser', 'c\'est ainsi que', 'this is how', 'conj', 'Formal, + indicatif.', 'Il a travaillé sans relâche. C\'est ainsi qu\'il a réussi.', 'He worked tirelessly. This is how he succeeded.')

# ---- Opposer ----
w('Opposer', 'mais', 'but', 'conj', '', 'C\'est cher, mais c\'est bon.', 'It is expensive, but it is good.', old=True)
w('Opposer', 'cependant', 'however', 'adv', 'Formal. At the start, followed by a comma.', 'Elle est riche. Cependant, elle est modeste.', 'She is rich. However, she is modest.')
w('Opposer', 'pourtant', 'yet, and yet', 'adv', 'Neutral: the second fact is a surprise.', 'Il a beaucoup révisé ; pourtant, il a raté l\'examen.', 'He revised a lot; yet he failed the exam.')
w('Opposer', 'toutefois', 'however, nevertheless', 'adv', 'Formal synonym of cependant.', 'Le plan est risqué. Toutefois, il peut réussir.', 'The plan is risky. Nevertheless, it can succeed.')
w('Opposer', 'néanmoins', 'nevertheless', 'adv', 'Formal and strong.', 'Il a fait des erreurs. Néanmoins, je lui fais confiance.', 'He made mistakes. Nonetheless, I trust him.')
w('Opposer', 'bien que', 'although', 'conj', 'Formal · + subjonctif.', 'Bien qu\'il soit malade, il est allé travailler.', 'Although he is ill, he went to work.')
w('Opposer', 'quoique', 'although', 'conj', 'Formal · + subjonctif. One word (quoi que = whatever). In books: quoiqu\'elle fût fatiguée.', 'Elle travaille encore, quoiqu\'elle soit fatiguée.', 'She is still working, although she is tired.')
w('Opposer', 'même si', 'even if, even though', 'conj', 'Neutral · + indicatif (never the subjonctif).', 'Je viendrai, même si je suis en retard.', 'I will come, even if I am late.')
w('Opposer', 'certes… mais', 'admittedly… but', 'adv', 'Formal: you grant a point, then argue back.', 'Certes, il est rapide, mais il se fatigue vite.', 'Admittedly he is fast, but he tires quickly.', key='certes')
w('Opposer', 'malgré', 'despite', 'prep', '+ noun or pronoun: malgré la pluie, malgré moi.', 'Malgré la pluie, nous sommes sortis.', 'Despite the rain, we went out.')
w('Opposer', 'en dépit de', 'in spite of', 'prep', 'Formal synonym of malgré, + noun.', 'Il a réussi en dépit de ses difficultés.', 'He succeeded in spite of his difficulties.')
w('Opposer', 'en revanche', 'on the other hand', 'adv', 'Semi-formal: sets two facts side by side.', 'Le quartier est bruyant. En revanche, il est très bien desservi.', 'The area is noisy. On the other hand, it has very good transport links.')
w('Opposer', 'au contraire', 'on the contrary', 'adv', 'Neutral: the exact opposite of what was said.', 'Ce n\'était pas un échec ; au contraire, c\'était une réussite.', 'It wasn\'t a failure; on the contrary, it was a success.')
w('Opposer', 'à l\'inverse', 'conversely', 'adv', 'Formal.', 'Les prix ont baissé. À l\'inverse, la demande a augmenté.', 'Prices have fallen. Conversely, demand has risen.')
w('Opposer', 'contrairement à', 'unlike, contrary to', 'prep', '+ noun or pronoun.', 'Contrairement à ce qu\'il avait dit, il est venu.', 'Contrary to what he had said, he came.')
w('Opposer', 'tandis que', 'whereas', 'conj', '+ indicatif. Also means « while » for time.', 'Mon frère est blond, tandis que je suis brun.', 'My brother is blond, whereas I am dark-haired.')
w('Opposer', 'alors que', 'whereas', 'conj', '+ indicatif. Also means « while » for time.', 'Il travaille, alors que nous nous reposons.', 'He is working, whereas we are resting.')
w('Opposer', 'au lieu de', 'instead of', 'prep', '+ noun or infinitive.', 'Il est resté au lieu de partir.', 'He stayed instead of leaving.')
w('Opposer', 'or', 'yet, now (a new fact)', 'conj', 'Formal: brings in a fact that changes the reasoning. Not « gold » here.', 'Il voulait partir. Or, il devait travailler ce week-end.', 'He wanted to leave. Yet he had to work this weekend.')
w('Opposer', 'sauf', 'except', 'prep', 'Neutral, very common.', 'J\'ai lu tous les livres, sauf le dernier.', 'I have read all the books except the last one.')
w('Opposer', 'à part', 'apart from', 'prep', 'Neutral, spoken.', 'J\'aime tout le monde, à part lui.', 'I like everyone apart from him.')
w('Opposer', 'mis à part', 'apart from', 'prep', 'Semi-formal.', 'Tout est bon, mis à part le dessert.', 'Everything is good, apart from the dessert.')
w('Opposer', 'excepté', 'except', 'prep', 'Formal.', 'Tous sont venus, excepté Paul.', 'Everyone came except Paul.')
w('Opposer', 'hormis', 'except for', 'prep', 'Formal, mostly written.', 'Personne n\'était là, hormis le directeur.', 'No one was there except for the director.')
w('Opposer', 'en dehors de', 'apart from, outside', 'prep', '+ noun.', 'En dehors du travail, il se passionne pour la musique.', 'Apart from work, he is passionate about music.')
w('Opposer', 'à défaut de', 'for lack of', 'prep', '+ noun: what is missing.', 'À défaut de preuves, l\'accusé a été libéré.', 'For lack of evidence, the accused was released.')

# ---- Choisir ----
w('Choisir', 'ou', 'or', 'conj', 'Ou (or) has no accent; où (where) has one.', 'Thé ou café ?', 'Tea or coffee?', old=True)
w('Choisir', 'soit… soit', 'either… or', 'conj', 'Neutral: two choices, only one is possible.', 'Il viendra soit aujourd\'hui, soit demain.', 'He will come either today or tomorrow.')
w('Choisir', 'l\'un ou l\'autre', 'one or the other', 'pro', 'Agrees with the noun: l\'une ou l\'autre solution.', 'Je prends l\'un ou l\'autre, ça m\'est égal.', 'I\'ll take one or the other, I don\'t mind.')
w('Choisir', 'd\'un côté… de l\'autre', 'on one side… on the other', 'adv', 'Semi-formal: two sides of a choice.', 'D\'un côté, j\'accepte ; de l\'autre, j\'ai des doutes.', 'On one side I accept; on the other, I have doubts.')
w('Choisir', 'd\'un autre côté', 'on the other hand', 'adv', 'Neutral: the other side of the question.', 'Il fait froid. D\'un autre côté, c\'est très beau.', 'It\'s cold. On the other hand, it\'s very beautiful.')

# ---- Expliquer (cause) ----
w('Expliquer', 'parce que', 'because', 'conj', 'Neutral · + indicatif. Can start a sentence when it answers « Pourquoi ? ».', 'Je reste ici parce qu\'il pleut.', 'I am staying here because it is raining.', old=True, key='parce que / parce qu\'')
w('Expliquer', 'car', 'because, for (written)', 'conj', 'Car never starts a sentence; parce que can answer « pourquoi ? ».', 'Le magasin est fermé, car c\'est dimanche.', 'The shop is closed, as it is Sunday.', old=True)
w('Expliquer', 'comme', 'as, since', 'conj', 'Always at the start of the sentence · + indicatif.', 'Comme il pleuvait, nous sommes restés à la maison.', 'As it was raining, we stayed at home.')
w('Expliquer', 'puisque', 'since (as you know)', 'conj', 'Neutral: a cause the listener already knows.', 'Puisque tu sais nager, aide-moi.', 'Since you can swim, help me.')
w('Expliquer', 'étant donné que', 'given that', 'conj', 'Formal · + indicatif.', 'Étant donné que vous avez de l\'expérience, vous êtes choisi.', 'Given that you have experience, you are chosen.')
w('Expliquer', 'vu que', 'seeing that', 'conj', 'Spoken, less formal than étant donné que.', 'Vu qu\'il est tard, on devrait partir.', 'Seeing that it\'s late, we should leave.')
w('Expliquer', 'attendu que', 'whereas, considering that', 'conj', 'Legal or very formal French.', 'Attendu que les faits sont établis, le tribunal rend son jugement.', 'Considering that the facts are established, the court gives its judgment.')
w('Expliquer', 'du fait que', 'due to the fact that', 'conj', 'Formal · + indicatif.', 'L\'erreur vient du fait qu\'il n\'a pas vérifié.', 'The mistake comes from the fact that he didn\'t check.')
w('Expliquer', 'dans la mesure où', 'insofar as', 'conj', 'Formal · + indicatif.', 'Vous êtes responsable, dans la mesure où vous saviez.', 'You are responsible, insofar as you knew.')
w('Expliquer', 'sous prétexte que', 'on the pretext that', 'conj', '+ indicatif: a reason you do not believe.', 'Il est parti sous prétexte qu\'il était malade.', 'He left on the pretext that he was ill.')
w('Expliquer', 'grâce à', 'thanks to', 'prep', '+ noun: a good cause.', 'Il a réussi grâce à son travail.', 'He succeeded thanks to his work.')
w('Expliquer', 'à cause de', 'because of', 'prep', '+ noun: often a bad cause.', 'Le train est en retard à cause de la grève.', 'The train is late because of the strike.')
w('Expliquer', 'en raison de', 'due to', 'prep', 'Formal, + noun (announcements).', 'La route est fermée en raison de la neige.', 'The road is closed due to the snow.')
w('Expliquer', 'par suite de', 'as a result of', 'prep', 'Formal, + noun.', 'Il a été absent par suite d\'une maladie.', 'He was absent as a result of an illness.')
w('Expliquer', 'sous la pression de', 'under pressure from', 'prep', '+ noun.', 'Il a démissionné sous la pression de sa hiérarchie.', 'He resigned under pressure from his superiors.')
w('Expliquer', 'par', 'out of (a feeling)', 'prep', 'Par + a feeling: par peur, par amour, par curiosité.', 'Elle a agi par peur.', 'She acted out of fear.')

# ---- Conclure (consequence and conclusion) ----
w('Conclure', 'donc', 'so, therefore', 'conj', '', 'Il est malade, donc il reste à la maison.', 'He is ill, so he is staying at home.', old=True)
w('Conclure', 'alors', 'so, then', 'adv', 'Spoken and neutral.', 'Il fait beau, alors on sort.', 'The weather is nice, so we are going out.', old=True)
w('Conclure', 'ainsi', 'thus, so', 'adv', 'Formal. At the start, followed by a comma.', 'Il a réussi. Ainsi, il a obtenu une promotion.', 'He succeeded. Thus he got a promotion.')
w('Conclure', 'aussi', 'so (formal, + inversion)', 'adv', 'At the start of a clause, aussi means « so » and the verb comes before the subject.', 'Il a insisté ; aussi suis-je parti.', 'He insisted, so I left.', dup=True)
w('Conclure', 'par conséquent', 'consequently', 'adv', 'Formal. At the start of the sentence.', 'Le plan a échoué. Par conséquent, nous devons recommencer.', 'The plan failed. Consequently, we must start again.')
w('Conclure', 'en conséquence', 'as a result', 'adv', 'Formal synonym of par conséquent.', 'Le budget est dépassé. En conséquence, le projet est annulé.', 'The budget has been exceeded. As a result, the project is cancelled.')
w('Conclure', 'conséquemment', 'consequently', 'adv', 'Very formal; par conséquent is more common.', 'Il a triché. Conséquemment, il a été sanctionné.', 'He cheated. Consequently, he was punished.')
w('Conclure', 'de ce fait', 'as a result', 'adv', 'Semi-formal.', 'Il a triché ; de ce fait, il a été renvoyé.', 'He cheated; as a result, he was expelled.')
w('Conclure', 'si bien que', 'so much so that', 'conj', '+ indicatif.', 'Il a beaucoup plu, si bien que la route est inondée.', 'It rained a lot, so much so that the road is flooded.')
w('Conclure', 'c\'est pourquoi', 'that\'s why', 'adv', 'Neutral, very common.', 'Il a menti, c\'est pourquoi je ne lui parle plus.', 'He lied, that\'s why I don\'t talk to him any more.')
w('Conclure', 'c\'est pour cette raison que', 'that\'s the reason why', 'conj', 'Neutral, a little stronger than c\'est pourquoi.', 'Il est compétent ; c\'est pour cette raison que je l\'ai choisi.', 'He is competent; that\'s the reason why I chose him.')
w('Conclure', 'd\'où', 'hence', 'prep', 'Formal, + noun.', 'Il y a eu un accident, d\'où les embouteillages.', 'There was an accident, hence the traffic jams.')
w('Conclure', 'en conclusion', 'in conclusion', 'adv', 'Formal: the start of the last paragraph.', 'En conclusion, la preuve est irréfutable.', 'In conclusion, the evidence is irrefutable.')
w('Conclure', 'pour conclure', 'to conclude', 'adv', 'Formal synonym of en conclusion.', 'Pour conclure, le projet a atteint ses objectifs.', 'To conclude, the project has met its objectives.')
w('Conclure', 'en résumé', 'in short, to sum up', 'adv', 'Semi-formal: sums up the main points.', 'En résumé, nous devons agir vite.', 'In short, we must act quickly.')
w('Conclure', 'en définitive', 'ultimately, in the end', 'adv', 'Formal: the final outcome, all things considered.', 'En définitive, il a obtenu son diplôme.', 'In the end, he got his degree.')
w('Conclure', 'en un mot', 'in a word', 'adv', 'Neutral: a very short summary.', 'La soirée était animée, les invités étaient joyeux. En un mot, un succès.', 'The evening was lively, the guests were happy. In a word, a success.')
w('Conclure', 'finalement', 'in the end', 'adv', 'Neutral: the outcome, often not the expected one.', 'Il a beaucoup hésité, mais finalement il a dit oui.', 'He hesitated a lot, but in the end he said yes.')

# ---- Condition ----
w('Condition', 'si', 'if', 'conj', 'Si + il = s\'il (s\'il pleut).', 'Si tu veux, on va au cinéma.', 'If you want, we can go to the cinema.', old=True)
w('Condition', 'au cas où', 'in case', 'conj', '+ conditionnel.', 'Au cas où vous seriez en retard, appelez-nous.', 'In case you are late, call us.')
w('Condition', 'dans le cas où', 'in the event that', 'conj', '+ conditionnel.', 'Dans le cas où il pleuvrait, nous resterions à la maison.', 'In the event that it rains, we would stay at home.')
w('Condition', 'dans l\'hypothèse où', 'assuming that, if ever', 'conj', 'Formal · + conditionnel.', 'Dans l\'hypothèse où il refuserait, que ferions-nous ?', 'If he were to refuse, what would we do?')
w('Condition', 'à condition que', 'provided that', 'conj', '+ subjonctif.', 'Je t\'aide, à condition que tu m\'écoutes.', 'I will help you, provided that you listen to me.')
w('Condition', 'à moins que', 'unless', 'conj', '+ subjonctif, often with « ne » (no meaning).', 'Je pars, à moins que tu ne m\'arrêtes.', 'I am leaving, unless you stop me.')
w('Condition', 'en admettant que', 'assuming that', 'conj', 'Formal · + subjonctif.', 'En admettant qu\'il ait raison, que faire ?', 'Assuming that he is right, what should we do?')
w('Condition', 'en supposant que', 'supposing that', 'conj', 'Formal · + subjonctif.', 'En supposant que le train soit à l\'heure, nous arriverons à midi.', 'Supposing the train is on time, we will arrive at noon.')
w('Condition', 'à supposer que', 'supposing that', 'conj', 'Formal · + subjonctif.', 'À supposer qu\'il soit d\'accord, nous pouvons commencer.', 'Supposing he agrees, we can start.')
w('Condition', 'probablement', 'probably', 'adv', 'After the verb: il viendra probablement (never before it).', 'Il viendra probablement demain.', 'He will probably come tomorrow.')
w('Condition', 'sans doute', 'probably', 'adv', 'Careful: it means « probably ». « Without a doubt » is sans aucun doute.', 'Il a sans doute oublié la réunion.', 'He has probably forgotten the meeting.')
w('Condition', 'apparemment', 'apparently', 'adv', 'Neutral, often at the start.', 'Apparemment, il est malade.', 'Apparently, he is ill.')

# ---- But ----
w('But', 'pour que', 'so that', 'conj', '+ subjonctif. Same subject? Use pour + infinitive: je travaille pour réussir.', 'Je parle lentement pour que tu comprennes.', 'I speak slowly so that you understand.')
w('But', 'afin que', 'so that, in order that', 'conj', 'Formal · + subjonctif. Same subject: afin de + infinitive.', 'Je parle fort afin que tu m\'entendes.', 'I speak loudly so that you can hear me.')
w('But', 'de peur que', 'for fear that', 'conj', '+ subjonctif, often with « ne » (no meaning): what you want to avoid.', 'Elle se cache de peur qu\'on ne la voie.', 'She is hiding for fear that someone might see her.')
w('But', 'de crainte que', 'for fear that', 'conj', 'Formal synonym of de peur que · + subjonctif.', 'Il se tait de crainte qu\'on ne se moque de lui.', 'He keeps quiet for fear that people will laugh at him.')
w('But', 'en vue de', 'with a view to', 'prep', 'Semi-formal, + noun or infinitive.', 'Il travaille en vue de sa promotion.', 'He is working with a view to his promotion.')

# ---- Temps ----
w('Temps', 'quand', 'when', 'conj', '+ indicatif. For the future, French uses the future: quand j\'arriverai.', 'Je t\'appellerai quand j\'arriverai.', 'I will call you when I arrive.')
w('Temps', 'lorsque', 'when', 'conj', 'Formal synonym of quand.', 'Lorsque je suis arrivé, il dormait.', 'When I arrived, he was asleep.')
w('Temps', 'comme', 'as (just when)', 'conj', 'Here: something happens during another action, + imparfait.', 'Comme je sortais, j\'ai vu Paul.', 'As I was going out, I saw Paul.', dup=True)
w('Temps', 'dès que', 'as soon as', 'conj', '+ indicatif.', 'Dès que j\'ai le temps, je le fais.', 'As soon as I have time, I do it.')
w('Temps', 'aussitôt que', 'as soon as', 'conj', 'Formal synonym of dès que.', 'Aussitôt qu\'il arrive, dis-le-moi.', 'As soon as he arrives, tell me.')
w('Temps', 'pendant que', 'while', 'conj', '+ indicatif: two things at the same time.', 'Il a cuisiné pendant que nous parlions.', 'He cooked while we were talking.')
w('Temps', 'tandis que', 'while', 'conj', 'Here: at the same time.', 'Elle lisait tandis que je travaillais.', 'She was reading while I was working.', dup=True)
w('Temps', 'alors que', 'while, just as', 'conj', 'Here: at the same time.', 'Il est arrivé alors que je partais.', 'He arrived just as I was leaving.', dup=True)
w('Temps', 'au moment où', 'at the moment when', 'conj', '+ indicatif: the exact moment.', 'Il est arrivé au moment où nous partions.', 'He arrived at the moment when we were leaving.')
w('Temps', 'avant que', 'before', 'conj', '+ subjonctif, often with « ne » (no meaning).', 'Finis tes devoirs avant qu\'il ne revienne.', 'Finish your homework before he comes back.')
w('Temps', 'après que', 'after', 'conj', 'The rule is + indicatif (you will often hear the subjonctif).', 'Je partirai après que tu auras fini.', 'I will leave after you have finished.')
w('Temps', 'depuis', 'since, for', 'prep', '+ a moment or a length of time, with the present: j\'attends depuis…', 'Je l\'attends depuis deux heures.', 'I have been waiting for him for two hours.')
w('Temps', 'depuis que', 'since', 'conj', '+ indicatif.', 'Je suis heureux depuis que tu es là.', 'I have been happy since you\'ve been here.')
w('Temps', 'dès lors que', 'from the moment that', 'conj', 'Formal · + indicatif.', 'Dès lors qu\'il a signé, il était engagé.', 'From the moment he signed, he was committed.')
w('Temps', 'en même temps que', 'at the same time as', 'prep', '+ noun or pronoun.', 'Elle est arrivée en même temps que moi.', 'She arrived at the same time as me.')

# ---- Dans l'ordre (the sequence tab): words for a list or an essay ----
ORDER = [
    ('tout d\'abord', 'first of all', 'adv', 'A little more formal than d\'abord.', 'Tout d\'abord, vérifions les faits.', 'First of all, let\'s check the facts.'),
    ('premièrement / deuxièmement', 'firstly / secondly', 'adv', 'Formal lists: then troisièmement…', 'Premièrement, lisez le texte. Deuxièmement, répondez aux questions.', 'Firstly, read the text. Secondly, answer the questions.'),
    ('en premier lieu / en second lieu', 'in the first place / secondly', 'adv', 'Formal (essays, speeches).', 'En premier lieu, signez le contrat.', 'In the first place, sign the contract.'),
    ('en dernier lieu', 'lastly', 'adv', 'Formal: the last point of a list.', 'En dernier lieu, nous ferons le bilan.', 'Lastly, we will review the results.'),
    ('d\'une part… d\'autre part', 'on the one hand… on the other', 'adv', 'Formal: two sides of an argument.', 'D\'une part, la méthode est rapide ; d\'autre part, elle coûte cher.', 'On the one hand, the method is fast; on the other, it is expensive.'),
]

# Join the two halves: a + connector + b (b may start with a comma). w = every connector that fits.
ITEMS = [
    ('J\'ai faim,', 'je mange une pomme.', ['donc', 'alors'], 'I\'m hungry, so I eat an apple.'),
    ('Je reste à la maison', 'il pleut.', ['parce que', 'car'], 'I\'m staying at home because it\'s raining.'),
    ('Tu veux du thé', 'du café ?', ['ou'], 'Do you want tea or coffee?'),
    ('Le restaurant est cher,', 'c\'est très bon.', ['mais'], 'The restaurant is expensive, but it\'s very good.'),
    ('J\'ai un chat', 'un chien.', ['et'], 'I have a cat and a dog.'),
    ('', 'il fait beau demain, on va à la plage.', ['si'], 'If the weather is nice tomorrow, we\'ll go to the beach.'),
    ('Paul parle anglais. Il parle', 'espagnol.', ['aussi'], 'Paul speaks English. He speaks Spanish too.'),
    ('Il est malade,', 'il ne vient pas.', ['donc', 'alors'], 'He is ill, so he isn\'t coming.'),
    ('Je prends un taxi', 'je suis en retard.', ['parce que', 'car'], 'I\'m taking a taxi because I\'m late.'),
    ('Elle est petite,', 'très forte.', ['mais'], 'She is small, but very strong.'),
    ('On mange ici', 'chez toi ?', ['ou'], 'Shall we eat here or at your place?'),
    ('', 'tu as le temps, appelle-moi !', ['si'], 'If you have time, call me!'),
    ('Il est doué.', ', il est très motivé.', ['de plus', 'en outre', 'par ailleurs'], 'He is talented. What\'s more, he is very motivated.'),
    ('J\'aime le bleu ;', 'Paul, il préfère le rouge.', ['quant à'], 'I like blue; as for Paul, he prefers red.'),
    ('J\'ai besoin d\'un véhicule,', 'd\'une voiture.', ['c\'est-à-dire'], 'I need a vehicle, that is to say a car.'),
    ('Je pensais qu\'il était riche.', ', il a des dettes.', ['en fait', 'en réalité'], 'I thought he was rich. In fact, he has debts.'),
    ('J\'aime les fruits,', 'les pommes.', ['par exemple', 'notamment', 'en particulier'], 'I like fruit, for example apples.'),
    ('Elle est riche.', ', elle est modeste.', ['cependant', 'pourtant', 'toutefois', 'néanmoins'], 'She is rich. However, she is modest.'),
    ('', 'la pluie, nous sommes sortis.', ['malgré', 'en dépit de'], 'Despite the rain, we went out.'),
    ('', 'il soit malade, il est allé travailler.', ['bien que', 'quoique'], 'Although he is ill, he went to work.'),
    ('Je viendrai,', 'je suis en retard.', ['même si'], 'I will come, even if I am late.'),
    ('J\'ai lu tous les livres,', 'le dernier.', ['sauf', 'à part', 'mis à part', 'excepté', 'hormis'], 'I have read all the books except the last one.'),
    ('Mon frère est blond,', 'je suis brun.', ['tandis que', 'alors que'], 'My brother is blond, whereas I am dark-haired.'),
    ('', 'il pleuvait, nous sommes restés à la maison.', ['comme', 'puisque'], 'As it was raining, we stayed at home.'),
    ('Il a réussi', 'son travail.', ['grâce à'], 'He succeeded thanks to his work.'),
    ('Le train est en retard', 'la grève.', ['à cause de', 'en raison de'], 'The train is late because of the strike.'),
    ('', 'il est tard, on devrait partir.', ['vu que', 'étant donné que', 'puisque', 'comme'], 'Seeing that it\'s late, we should leave.'),
    ('Le plan a échoué.', ', nous devons recommencer.', ['par conséquent', 'en conséquence', 'de ce fait', 'ainsi'], 'The plan failed. Consequently, we must start again.'),
    ('Il a menti,', 'je ne lui parle plus.', ['c\'est pourquoi', 'donc', 'alors'], 'He lied, that\'s why I don\'t talk to him any more.'),
    ('Il y a eu un accident,', 'les embouteillages.', ['d\'où'], 'There was an accident, hence the traffic jams.'),
    ('', ', le projet a atteint ses objectifs.', ['en conclusion', 'pour conclure', 'en résumé'], 'In conclusion, the project has met its objectives.'),
    ('Je t\'aide,', 'tu m\'écoutes.', ['à condition que'], 'I will help you, provided that you listen to me.'),
    ('', 'vous seriez en retard, appelez-nous.', ['au cas où', 'dans le cas où'], 'In case you are late, call us.'),
    ('Je pars,', 'tu ne m\'arrêtes.', ['à moins que'], 'I am leaving, unless you stop me.'),
    ('Je parle lentement', 'tu comprennes.', ['pour que', 'afin que'], 'I speak slowly so that you understand.'),
    ('Elle se cache', 'on ne la voie.', ['de peur que', 'de crainte que'], 'She is hiding for fear that someone might see her.'),
    ('Je t\'appellerai', 'j\'arriverai.', ['quand', 'dès que', 'lorsque'], 'I will call you when I arrive.'),
    ('Il a cuisiné', 'nous parlions.', ['pendant que', 'tandis que'], 'He cooked while we were talking.'),
    ('Finis tes devoirs', 'il ne revienne.', ['avant que'], 'Finish your homework before he comes back.'),
    ('Je suis heureux', 'tu es là.', ['depuis que'], 'I have been happy since you\'ve been here.'),
    ('Il est arrivé', 'nous partions.', ['au moment où', 'alors que'], 'He arrived at the moment when we were leaving.'),
]

# Say it in French: [English, French, connector to use]
SAY = [
    ('I wake up early and go to the gym before work.', 'Je me lève tôt et je vais à la salle de sport avant le travail.', 'et'),
    ('She bought some fruit and vegetables at the market.', 'Elle a acheté des fruits et des légumes au marché.', 'et'),
    ('We visited Paris and took many beautiful photos.', 'Nous avons visité Paris et nous avons pris beaucoup de belles photos.', 'et'),
    ('He is intelligent and very polite with everyone.', 'Il est intelligent et très poli avec tout le monde.', 'et'),
    ('I like coffee and tea, but I prefer juice in the morning.', 'J\'aime le café et le thé, mais je préfère le jus le matin.', 'et'),
    ('I\'m learning French; moreover, I plan to travel to France next year.', 'J\'apprends le français ; de plus, je compte aller en France l\'année prochaine.', 'de plus'),
    ('The flat is large and bright; in addition, it\'s close to the metro.', 'L\'appartement est grand et lumineux ; de plus, il est près du métro.', 'de plus'),
    ('He works full-time; moreover, he studies in the evening.', 'Il travaille à plein temps ; de plus, il étudie le soir.', 'de plus'),
    ('The restaurant is beautiful; in addition, the food is delicious.', 'Le restaurant est beau ; de plus, la cuisine est délicieuse.', 'de plus'),
    ('She is very kind; moreover, she always helps her friends.', 'Elle est très gentille ; de plus, elle aide toujours ses amis.', 'de plus'),
    ('I prepared dinner, then set the table for the whole family.', 'J\'ai préparé le dîner, puis j\'ai mis la table pour toute la famille.', 'puis'),
    ('She took a shower, then went out to do the shopping.', 'Elle a pris une douche, puis elle est sortie faire les courses.', 'puis'),
    ('We visited the museum, then went for a coffee near the river.', 'Nous avons visité le musée, puis nous sommes allés boire un café près de la rivière.', 'puis'),
    ('He hesitated for a moment, then accepted the offer without asking any questions.', 'Il a hésité un instant, puis il a accepté l\'offre sans poser de questions.', 'puis'),
    ('I woke up early, then read a few pages of a novel before starting work.', 'Je me suis réveillé tôt, puis j\'ai lu quelques pages d\'un roman avant de commencer à travailler.', 'puis'),
    ('He speaks three languages fluently; moreover, he has been learning Japanese for a year.', 'Il parle couramment trois langues ; en outre, il apprend le japonais depuis un an.', 'en outre'),
    ('Furthermore, please note that the train will leave earlier tomorrow morning.', 'En outre, il faut noter que le train partira plus tôt demain matin.', 'en outre'),
    ('The film was long; moreover, the actors performed very poorly.', 'Le film était long ; en outre, les acteurs jouaient très mal.', 'en outre'),
    ('We visited the museum yesterday; besides that, we took part in a painting workshop.', 'Nous avons visité le musée hier ; en outre, nous avons participé à un atelier de peinture.', 'en outre'),
    ('This company offers a good salary; moreover, it provides flexible working hours.', 'Cette entreprise offre un bon salaire ; en outre, elle propose des horaires flexibles.', 'en outre'),
    ('She is not only intelligent but also very kind to everyone.', 'Elle est non seulement intelligente, mais aussi très gentille avec tout le monde.', 'non seulement… mais aussi'),
    ('They not only visited Paris but also spent a week in the south of France.', 'Ils ont non seulement visité Paris, mais ils ont aussi passé une semaine dans le sud de la France.', 'non seulement… mais aussi'),
    ('This restaurant is not only expensive but also always crowded.', 'Ce restaurant est non seulement cher, mais aussi toujours bondé.', 'non seulement… mais aussi'),
    ('He not only forgot his keys but also lost his wallet on the way.', 'Il a non seulement oublié ses clés, mais il a aussi perdu son portefeuille en chemin.', 'non seulement… mais aussi'),
    ('Learning French is not only useful for travel but also important for your career.', 'Apprendre le français est non seulement utile pour voyager, mais aussi important pour sa carrière.', 'non seulement… mais aussi'),
    ('The hotel is very clean; besides, the staff are extremely polite.', 'L\'hôtel est très propre ; par ailleurs, le personnel est extrêmement poli.', 'par ailleurs'),
    ('I\'m not interested in buying this house; moreover, it\'s too far from my office.', 'Acheter cette maison ne m\'intéresse pas ; par ailleurs, elle est trop loin de mon bureau.', 'par ailleurs'),
    ('The project was finished on time; on another note, the client seemed very satisfied.', 'Le projet a été terminé à temps ; par ailleurs, le client a semblé très satisfait.', 'par ailleurs'),
    ('The course is quite expensive; moreover, it requires a lot of personal work.', 'Le cours est assez cher ; par ailleurs, il demande beaucoup de travail personnel.', 'par ailleurs'),
    ('She\'s preparing for her exam; besides, she\'s also working part-time in a café.', 'Elle prépare son examen ; par ailleurs, elle travaille aussi à temps partiel dans un café.', 'par ailleurs'),
    ('As for me, I prefer to stay at home this weekend.', 'Quant à moi, je préfère rester à la maison ce week-end.', 'quant à'),
    ('As for your question, I think it\'s better to wait a few more days.', 'Quant à ta question, je pense qu\'il vaut mieux attendre encore quelques jours.', 'quant à'),
    ('As for my brother, he\'s already left for Canada.', 'Quant à mon frère, il est déjà parti au Canada.', 'quant à'),
    ('As for the weather, it should be sunny tomorrow.', 'Quant à la météo, il devrait faire beau demain.', 'quant à'),
    ('As for our next meeting, I\'ll confirm the time by email.', 'Quant à notre prochaine réunion, je confirmerai l\'heure par e-mail.', 'quant à'),
    ('In the same way, we should treat others with respect if we want to be respected.', 'De la même façon, nous devons traiter les autres avec respect si nous voulons être respectés.', 'de la même façon'),
    ('The teacher explained the second chapter in the same way as the first one.', 'La professeure a expliqué le deuxième chapitre de la même façon que le premier.', 'de la même façon'),
    ('Children learn languages quickly; similarly, they adapt easily to new surroundings.', 'Les enfants apprennent vite les langues ; de la même façon, ils s\'adaptent facilement à un nouvel environnement.', 'de la même façon'),
    ('The company improved its marketing; in the same way, it plans to modernise its customer service.', 'L\'entreprise a amélioré son marketing ; de la même façon, elle prévoit de moderniser son service client.', 'de la même façon'),
    ('He helped his friends with their project; in the same way, they supported him during his exams.', 'Il a aidé ses amis pour leur projet ; de la même façon, ils l\'ont soutenu pendant ses examens.', 'de la même façon'),
]

# Learn chapters (after the 3 existing ones): title, English, the words (by French as shown)
CHAPTERS = [
    ('Ajouter et choisir', 'Adding and choosing', ['de plus', 'en outre', 'par ailleurs', 'non seulement… mais aussi', 'quant à', 'de la même façon', 'soit… soit', 'l\'un ou l\'autre', 'd\'un côté… de l\'autre', 'd\'un autre côté']),
    ('Préciser', 'Saying it more precisely', ['c\'est-à-dire', 'autrement dit', 'en d\'autres termes', 'en fait', 'en réalité', 'en effet', 'effectivement', 'par exemple', 'notamment', 'en particulier', 'entre autres', 'c\'est le cas de', 'c\'est ainsi que']),
    ('Opposer', 'However, although', ['cependant', 'pourtant', 'toutefois', 'néanmoins', 'bien que', 'quoique', 'même si', 'certes… mais', 'malgré', 'en dépit de', 'en revanche', 'au contraire']),
    ('Au contraire, sauf…', 'Contrast and exceptions', ['à l\'inverse', 'contrairement à', 'tandis que', 'alors que', 'au lieu de', 'or', 'sauf', 'à part', 'mis à part', 'excepté', 'hormis', 'en dehors de', 'à défaut de']),
    ('Expliquer : la cause', 'Because, since', ['comme', 'puisque', 'étant donné que', 'vu que', 'attendu que', 'du fait que', 'dans la mesure où', 'sous prétexte que', 'grâce à', 'à cause de', 'en raison de', 'par suite de', 'sous la pression de', 'par']),
    ('Conclure', 'So, therefore, in short', ['ainsi', 'par conséquent', 'en conséquence', 'conséquemment', 'de ce fait', 'si bien que', 'c\'est pourquoi', 'c\'est pour cette raison que', 'd\'où', 'en conclusion', 'pour conclure', 'en résumé', 'en définitive', 'en un mot', 'finalement']),
    ('Condition et but', 'If, unless, so that', ['au cas où', 'dans le cas où', 'dans l\'hypothèse où', 'à condition que', 'à moins que', 'en admettant que', 'en supposant que', 'à supposer que', 'probablement', 'sans doute', 'apparemment', 'pour que', 'afin que', 'de peur que', 'de crainte que', 'en vue de']),
    ('Le temps', 'When, while, as soon as', ['quand', 'lorsque', 'dès que', 'aussitôt que', 'pendant que', 'au moment où', 'avant que', 'après que', 'depuis', 'depuis que', 'dès lors que', 'en même temps que']),
    ('Dans l\'ordre, à l\'écrit', 'Ordering an essay', [o[0] for o in ORDER]),
]

ARTICLE = re.compile(r"^(le |la |les |l['’]|un |une )", re.I)
def word_key(fr):   # the same as wordKey() in vocab.html
    return re.sub(r'\s+', ' ', ARTICLE.sub('', fr.lower().replace('’', "'"))).strip()

def js(s): return json.dumps(s, ensure_ascii=False)
def sq(s): return "'" + s.replace("'", "''") + "'"

def main():
    os.makedirs(OUT, exist_ok=True)
    byfr = {}
    for x in W:
        if not x['dup']: byfr[x['fr']] = x
    for o in ORDER:
        byfr[o[0]] = dict(fr=o[0], en=o[1], pos=o[2], note=o[3], ex=[o[4], o[5]], key=o[0], old=False)
    # every item answer and say-it connector must exist
    shown = {x['fr'] for x in W}
    for it in ITEMS:
        for c in it[2]: assert c in shown, ('item', c)
    for s in SAY: assert s[2] in shown or s[2] == 'puis', ('say', s[2])
    seen = set()
    for c in CHAPTERS:
        for f in c[2]:
            assert f in byfr, ('chapter', f); assert f not in seen, ('twice', f); seen.add(f)
    new = [x for x in byfr.values() if not x['old']]
    missing = [x['fr'] for x in new if x['fr'] not in seen]
    assert not missing, ('not in a chapter', missing)

    # ---- the Relier tab ----
    lines = ['  { type: \'joiner\', title: \'Relier\', hint: \'Words that join two ideas, in nine groups. Tap a word to see it in a sentence, then join two halves or say a sentence in French below.\', roles: [']
    for name, en, col, icon in ROLES:
        lines.append(f'    {{ name: {js(name)}, en: {js(en)}, color: {js(col)}, icon: {js(icon)}, words: [')
        for x in [x for x in W if x['role'] == name]:
            o = {'key': word_key(x['key']), 'fr': x['fr'], 'en': x['en'], 'ex': x['ex']}
            if x['note']: o['note'] = x['note']
            lines.append('      ' + js(o) + ',')
        lines.append('    ] },')
    lines.append('  ], items: [')
    for a, b, ws, en in ITEMS:
        lines.append('    ' + js({'a': a, 'b': b, 'w': ws, 'en': en}) + ',')
    lines.append('  ], say: [')
    for en, fr, c in SAY:
        lines.append('    ' + js([en, fr, c]) + ',')
    lines.append('  ] },')
    open(os.path.join(OUT, 'roles.js'), 'w').write('\n'.join(lines) + '\n')
    # words for the Dans l'ordre tab
    more = ['  more: [']
    for o in ORDER:
        more.append('    ' + js({'key': word_key(o[0]), 'fr': o[0], 'en': o[1], 'ex': [o[4], o[5]], 'note': o[3]}) + ',')
    more.append('  ],')
    open(os.path.join(OUT, 'order.js'), 'w').write('\n'.join(more) + '\n')

    # ---- chapters: the story is the examples, with the connector marked ----
    def mark(sentence, fr, key):
        forms = sorted({f.strip() for f in re.split(r'\s*(?:/|…)\s*', fr) if f.strip()}, key=len, reverse=True)
        forms += [f[:-1] + "'" for f in forms if f.endswith('que')]
        forms += [f[:-3] + e for f in forms if f.endswith(' de') for e in (' du', ' des', " d'")]
        forms += [f[:-2] + e for f in forms if f.endswith(' à') for e in (' au', ' aux')]
        for f in forms:
            m = re.search(r'(?<![\w])(' + re.escape(f).replace("qu\\'", "qu'") + r')(?![\w])', sentence, re.I) if not f.endswith("'") else re.search(r'(?<![\w])(' + re.escape(f) + r')', sentence, re.I)
            if m:
                t = m.group(1)
                tag = f'[[{t}]]' if word_key(t) == key else f'[[{t}|{key}]]'
                return sentence[:m.start(1)] + tag + sentence[m.end(1):]
        raise SystemExit(f'cannot mark {fr!r} in {sentence!r}')
    ch = []
    for title, en, frs in CHAPTERS:
        keys = [word_key(byfr[f]['key']) for f in frs]
        story = [[mark(byfr[f]['ex'][0], byfr[f]['fr'], word_key(byfr[f]['key'])), byfr[f]['ex'][1]] for f in frs]
        ch.append('        { title: ' + js(title) + ', en: ' + js(en) + ',\n          keys: ' + js(keys) + ',\n          story: [\n'
                  + ''.join('            ' + js(s) + ',\n' for s in story) + '          ] },')
    open(os.path.join(OUT, 'chapters.js'), 'w').write('\n'.join(ch) + '\n')

    # ---- SQL ----
    rows = []
    n = 0
    for title, en, frs in CHAPTERS:
        for f in frs:
            x = byfr[f]; n += 1
            rows.append(f"    ({n}, {sq(x['key'])}, {sq(x['pos'])}, {sq(x['en'])}, {sq(x['ex'][0])}, {sq(x['ex'][1])})")
    words = ',\n'.join(rows)
    sql = f"""-- 15_more_connectors.sql
-- Adds {n} connectors to the topic Connectors & Small Words (theme 3), after its 31 words, in the order of the
-- Learn chapters (js/chapters-data.js). Made by tools/connectors/connectors.py.
-- A connector already in vocabulary_bank is reused: our own list ('core') first, then the C1 list ('advanced'),
-- never a noun (so « or » is the connector, not « gold »). The others are added as new entries
-- (source = 'advanced', no frequency Rank, so the frequency sets are unchanged), with an example sentence.
-- Safe to run more than once. 15_undo_more_connectors.sql removes the topic links again.

do $$
declare
  base int;
  missing text;
begin
  create temp table more_conn (n int, french text, pos text, english text, ex_fr text, ex_en text, word_id bigint) on commit drop;
  insert into more_conn (n, french, pos, english, ex_fr, ex_en) values
{words};

  -- 1. Reuse a connector that is already in the word bank (not a noun)
  update more_conn m set word_id = (
    select v.id from "French-schema".vocabulary_bank v
    where lower(trim(v."French")) = lower(m.french)
      and coalesce(v."Part_of_Speech", '') not in ('nm', 'nf', 'n', 'nm,nf', 'nf,nm')
      and v.source in ('core', 'advanced')
    order by (v.source = 'core') desc, v.id
    limit 1);

  -- 2. Add the others
  insert into "French-schema".vocabulary_bank
         (id, "French", "Article", "Noun_Gender", "Part_of_Speech", "English", "SentenceFR", "SentenceEN", source)
  overriding system value
  select (select coalesce(max(id), 0) from "French-schema".vocabulary_bank) + row_number() over (order by m.n),
         m.french, null, null, m.pos, m.english, m.ex_fr, m.ex_en, 'advanced'
  from more_conn m
  where m.word_id is null;

  update more_conn m set word_id = (
    select v.id from "French-schema".vocabulary_bank v
    where v.source = 'advanced' and v."French" = m.french
    order by v.id limit 1)
  where m.word_id is null;

  select string_agg(french, ', ') into missing from more_conn where word_id is null;
  if missing is not null then
    raise exception 'Could not find or add: %. Nothing was changed.', missing;
  end if;

  -- 3. Link them to the topic, after the words it already has
  select coalesce(max(sort_order), 0) into base from "French-schema".word_themes
   where theme_id = 3 and word_id not in (select word_id from more_conn);
  insert into "French-schema".word_themes (theme_id, word_id, sort_order)
  select 3, m.word_id, base + m.n from more_conn m
  on conflict (theme_id, word_id) do nothing;
end $$;

-- Keep the id counter ahead of the new rows (does nothing if id has no counter).
select setval(pg_get_serial_sequence('"French-schema".vocabulary_bank', 'id'), (select max(id) from "French-schema".vocabulary_bank));

-- You should see one row: Connectors & Small Words with {31 + n} words
select t.id, t.title, count(*) as words_in_topic
from "French-schema".themes t
join "French-schema".word_themes w on w.theme_id = t.id
where t.id = 3
group by t.id, t.title;
"""
    open(os.path.join(R, 'supabase', 'vocab-themes', '15_more_connectors.sql'), 'w').write(sql)
    frs = ', '.join(sq(byfr[f]['key']) for c in CHAPTERS for f in c[2])
    undo = f"""-- 15_undo_more_connectors.sql
-- Removes the {n} connectors added by 15_more_connectors.sql from the topic Connectors & Small Words (theme 3).
-- The 31 words the topic had before stay. New word-bank entries stay too (harmless: they are in no topic).

delete from "French-schema".word_themes
where theme_id = 3
  and word_id in (select id from "French-schema".vocabulary_bank where "French" in ({frs}))
  and word_id not in (select id from "French-schema".vocabulary_bank where "French" in
      ('et', 'mais', 'ou', 'donc', 'parce que / parce qu''', 'car', 'alors', 'aussi', 'si'));

-- You should see 31
select count(*) as words_in_topic from "French-schema".word_themes where theme_id = 3;
"""
    open(os.path.join(R, 'supabase', 'vocab-themes', '15_undo_more_connectors.sql'), 'w').write(undo)
    print(n, 'new words;', len(W), 'listed in the groups;', len(ITEMS), 'join items;', len(SAY), 'say-it sentences')

main()
