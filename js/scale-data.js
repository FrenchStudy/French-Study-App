// scale-data.js - the words for the slider tools in scale-tool.js (step 2 of Vocab topics 12, 13, 16, 44, 54, 55, 56).
// Four kinds of tab:
//   scale    words placed on one line from left to right (how sure, how strong): stops [{ p (0-100), key, fr, en, ex: [fr, en], note }]
//   pairs    opposites: a slider between two words; the middle is « ni … ni … » unless mid: false
//            pairs [{ key, a: [fr, en, ex fr, ex en], b: [...], note }]
//   groups   words sorted into groups (j'ai… or je suis… ?): groups [{ name, en, color, words: [{ key, fr, en, ex: [fr, en] }] }]
//   register the same idea said three ways: familier · courant · soutenu: sets [{ key, en, w: [[fr, ex fr, ex en] or null x 3] }]
// key = the word as it is in the topic list (so answers count in reviews); a word without key is extra help.
window.SCALE_DATA = {

// ---------------- 16 High-Frequency Opposites ----------------
16: { name: 'Opposites', next: 'Slide between opposites', tabs: [
  { type: 'pairs', title: 'Taille et poids', hint: 'Pick a pair, then slide from one word to the other.', pairs: [
    { key: 'grand / petit', a: ['grand', 'big, tall', 'Paris est une grande ville.', 'Paris is a big city.'], b: ['petit', 'small, short', 'Mon village est petit.', 'My village is small.'] },
    { key: 'long / court', a: ['long', 'long', 'Le film est très long.', 'The film is very long.'], b: ['court', 'short', 'Elle a les cheveux courts.', 'She has short hair.'] },
    { key: 'large / étroit', a: ['large', 'wide', 'La rue est large.', 'The street is wide.'], b: ['étroit', 'narrow', 'Le couloir est étroit.', 'The corridor is narrow.'], note: 'Large means wide, not large: « grand » is large.' },
    { key: 'haut / bas', a: ['haut', 'high', 'Le mur est haut.', 'The wall is high.'], b: ['bas', 'low', 'La table est basse.', 'The table is low.'] },
    { key: 'lourd / léger', a: ['lourd', 'heavy', 'Ma valise est lourde.', 'My suitcase is heavy.'], b: ['léger', 'light', 'Ce sac est léger.', 'This bag is light.'] },
    { key: 'plein / vide', a: ['plein', 'full', 'Le verre est plein.', 'The glass is full.'], b: ['vide', 'empty', 'La bouteille est vide.', 'The bottle is empty.'] },
    { key: 'beaucoup / peu', a: ['beaucoup', 'a lot', "J'ai beaucoup de travail.", 'I have a lot of work.'], b: ['peu', 'little, not much', "J'ai peu de temps.", 'I have little time.'] },
  ] },
  { type: 'pairs', title: 'Comment c\'est ?', hint: 'Pick a pair, then slide.', pairs: [
    { key: 'chaud / froid', a: ['chaud', 'hot', 'Le café est chaud.', 'The coffee is hot.'], b: ['froid', 'cold', "L'eau est froide.", 'The water is cold.'] },
    { key: 'chaud / frais', a: ['chaud', 'warm', 'Il fait chaud aujourd\'hui.', 'It is warm today.'], b: ['frais', 'cool, fresh', 'Le soir, il fait frais.', 'In the evening it is cool.'], note: 'Frais is cool, between chaud and froid. Also fresh: du pain frais.' },
    { key: 'bon / mauvais', a: ['bon', 'good', 'Ce gâteau est bon.', 'This cake is good.'], b: ['mauvais', 'bad', 'Le temps est mauvais.', 'The weather is bad.'] },
    { key: 'meilleur / pire', a: ['meilleur', 'better, best', 'C\'est le meilleur restaurant du quartier.', 'It is the best restaurant in the area.'], b: ['pire', 'worse, worst', 'C\'est la pire journée de la semaine.', 'It is the worst day of the week.'], note: 'Bon → meilleur (never « plus bon »). Mauvais → pire (or plus mauvais).' },
    { key: 'beau / laid', a: ['beau', 'beautiful', 'Quelle belle maison !', 'What a beautiful house!'], b: ['laid', 'ugly', 'Ce bâtiment est laid.', 'This building is ugly.'] },
    { key: 'cher / bon marché', a: ['cher', 'expensive', 'Cet hôtel est cher.', 'This hotel is expensive.'], b: ['bon marché', 'cheap', 'Ces chaussures sont bon marché.', 'These shoes are cheap.'], note: 'Bon marché never changes: une robe bon marché.' },
    { key: 'vrai / faux', mid: false, a: ['vrai', 'true', 'C\'est vrai !', 'It is true!'], b: ['faux', 'false, wrong', 'Cette réponse est fausse.', 'This answer is wrong.'] },
    { key: 'intéressant / ennuyeux', a: ['intéressant', 'interesting', 'Ce livre est intéressant.', 'This book is interesting.'], b: ['ennuyeux', 'boring', 'Le cours est ennuyeux.', 'The class is boring.'] },
    { key: 'propre / sale', a: ['propre', 'clean', 'La cuisine est propre.', 'The kitchen is clean.'], b: ['sale', 'dirty', 'Mes chaussures sont sales.', 'My shoes are dirty.'] },
    { key: 'ouvert / fermé', mid: false, a: ['ouvert', 'open', 'Le magasin est ouvert le dimanche.', 'The shop is open on Sundays.'], b: ['fermé', 'closed', 'La banque est fermée.', 'The bank is closed.'] },
    { key: 'facile / difficile', a: ['facile', 'easy', 'Cet exercice est facile.', 'This exercise is easy.'], b: ['difficile', 'difficult', 'Le français est difficile ?', 'Is French difficult?'] },
    { key: 'possible / impossible', mid: false, a: ['possible', 'possible', 'C\'est possible demain.', 'It is possible tomorrow.'], b: ['impossible', 'impossible', 'C\'est impossible !', 'It is impossible!'] },
    { key: 'libre / occupé', mid: false, a: ['libre', 'free (not busy)', 'Tu es libre ce soir ?', 'Are you free tonight?'], b: ['occupé', 'busy, taken', 'Désolé, je suis occupé.', 'Sorry, I am busy.'], note: 'Libre is free as in not busy. Free of charge is gratuit.' },
    { key: 'riche / pauvre', a: ['riche', 'rich', 'Il est très riche.', 'He is very rich.'], b: ['pauvre', 'poor', 'C\'est un pays pauvre.', 'It is a poor country.'] },
    { key: 'rapide / lent', a: ['rapide', 'fast', 'Le TGV est rapide.', 'The TGV is fast.'], b: ['lent', 'slow', 'Internet est lent ici.', 'The internet is slow here.'] },
    { key: 'fort / faible', a: ['fort', 'strong', 'Il est fort en maths.', 'He is good at maths.'], b: ['faible', 'weak', 'Le signal est faible.', 'The signal is weak.'] },
    { key: 'calme / bruyant', a: ['calme', 'quiet, calm', 'La rue est calme.', 'The street is quiet.'], b: ['bruyant', 'noisy', 'Ce café est bruyant.', 'This café is noisy.'] },
  ] },
  { type: 'pairs', title: 'Âge, ordre, lieu', hint: 'Pick a pair, then slide.', pairs: [
    { key: 'jeune / vieux', a: ['jeune', 'young', 'Il est jeune.', 'He is young.'], b: ['vieux', 'old', 'Mon grand-père est vieux.', 'My grandfather is old.'] },
    { key: 'neuf / vieux', a: ['neuf', 'brand new', 'Ma voiture est neuve.', 'My car is brand new.'], b: ['vieux', 'old', 'Ce vélo est vieux.', 'This bike is old.'], note: 'Neuf: just made, never used. Nouveau: new to me (it can be second-hand).' },
    { key: 'nouveau / ancien', a: ['nouveau', 'new', 'J\'ai un nouveau travail.', 'I have a new job.'], b: ['ancien', 'former; old', 'C\'est mon ancien bureau.', 'It is my old (former) office.'], note: 'Before the noun, ancien means former: mon ancien patron.' },
    { key: 'proche / loin', a: ['proche', 'near, close', 'La gare est proche.', 'The station is close.'], b: ['loin', 'far', 'L\'aéroport est loin.', 'The airport is far.'], note: 'Près de / loin de + place: près de la gare.' },
    { key: 'ici / là-bas', mid: false, a: ['ici', 'here', 'Viens ici !', 'Come here!'], b: ['là-bas', 'over there', 'Le bus est là-bas.', 'The bus is over there.'] },
    { key: 'devant / derrière', mid: false, a: ['devant', 'in front (of)', 'Je t\'attends devant le cinéma.', 'I will wait for you in front of the cinema.'], b: ['derrière', 'behind', 'Le jardin est derrière la maison.', 'The garden is behind the house.'] },
    { key: 'premier / dernier', mid: false, a: ['premier', 'first', 'C\'est mon premier jour.', 'It is my first day.'], b: ['dernier', 'last', 'C\'est le dernier train.', 'It is the last train.'] },
  ] },
] },

// ---------------- 44 Ideas & Opinions ----------------
44: { name: 'Sure or not?', next: 'Slide from doubt to certainty', tabs: [
  { type: 'scale', title: 'Sûr ou pas sûr ?', hint: 'Slide from doubt (left) to certainty (right).', left: 'je doute', right: 'c\'est sûr', color: '#4f46e5', ask: 'Which one is more sure?', stops: [
    { p: 0, key: 'douter', fr: 'douter', en: 'to doubt', ex: ['Je doute qu\'il vienne.', 'I doubt he will come.'], note: 'Douter que + subjonctif. The noun: le doute.' },
    { p: 16, key: 'supposer', fr: 'supposer', en: 'to suppose', ex: ['Je suppose qu\'il est malade.', 'I suppose he is ill.'] },
    { p: 30, key: 'paraître', fr: 'paraître', en: 'to appear; il paraît que = apparently', ex: ['Il paraît que le musée est fermé.', 'Apparently the museum is closed.'], note: 'Il paraît que: someone told me, I have not checked.' },
    { p: 42, key: 'sembler', fr: 'sembler', en: 'to seem', ex: ['Elle semble fatiguée.', 'She seems tired.'] },
    { p: 55, key: 'croire', fr: 'croire', en: 'to believe, to think', ex: ['Je crois qu\'il a raison.', 'I think he is right.'] },
    { p: 66, key: 'penser', fr: 'penser', en: 'to think', ex: ['Je pense que c\'est une bonne idée.', 'I think it is a good idea.'] },
    { p: 78, key: 'estimer', fr: 'estimer', en: 'to consider, to judge', ex: ['J\'estime que le prix est trop élevé.', 'I consider the price too high.'], note: 'Formal: good for a TCF / TEF essay.' },
    { p: 89, key: 'affirmer', fr: 'affirmer', en: 'to state, to assert', ex: ['Le ministre affirme que la loi est juste.', 'The minister states that the law is fair.'] },
    { p: 100, key: 'évidemment', fr: 'évidemment', en: 'obviously', ex: ['Évidemment, c\'est plus cher à Paris.', 'Obviously, it is more expensive in Paris.'] },
  ] },
  { type: 'groups', title: 'Relier les idées', hint: 'Tap a word to hear it. The colour shows what it does.', ask: 'What does this word do?', groups: [
    { name: 'Ajouter', en: 'add an idea', color: '#059669', words: [
      { key: 'également', fr: 'également', en: 'also', ex: ['Il parle anglais et également espagnol.', 'He speaks English and also Spanish.'] },
      { key: 'notamment', fr: 'notamment', en: 'in particular, notably', ex: ['Il aime le sport, notamment le tennis.', 'He likes sport, especially tennis.'] },
      { key: 'surtout', fr: 'surtout', en: 'above all, especially', ex: ['N\'oublie surtout pas ton passeport !', 'Above all, don\'t forget your passport!'] },
    ] },
    { name: 'Opposer', en: 'show a contrast', color: '#e11d48', words: [
      { key: 'cependant', fr: 'cependant', en: 'however', ex: ['C\'est cher ; cependant, c\'est très bon.', 'It is expensive; however, it is very good.'] },
      { key: 'pourtant', fr: 'pourtant', en: 'yet, and yet', ex: ['Il a travaillé ; pourtant, il a échoué.', 'He worked; yet he failed.'] },
      { key: 'néanmoins', fr: 'néanmoins', en: 'nevertheless', ex: ['Le projet est risqué ; néanmoins, il mérite d\'être essayé.', 'The project is risky; nevertheless, it is worth trying.'] },
      { key: 'toutefois', fr: 'toutefois', en: 'however', ex: ['Vous pouvez entrer ; toutefois, il faut un billet.', 'You may come in; however, you need a ticket.'] },
      { key: 'certes', fr: 'certes … mais', en: 'admittedly … but', ex: ['Certes, c\'est loin, mais le voyage en vaut la peine.', 'Admittedly it is far, but the trip is worth it.'] },
    ] },
    { name: 'Conclure', en: 'give a result', color: '#d97706', words: [
      { key: 'donc', fr: 'donc', en: 'so, therefore', ex: ['Il pleut, donc je prends mon parapluie.', 'It is raining, so I take my umbrella.'] },
      { key: 'ainsi', fr: 'ainsi', en: 'thus, in this way', ex: ['Ainsi, nous gagnons du temps.', 'In this way, we save time.'] },
      { key: 'alors', fr: 'alors', en: 'so, then', ex: ['J\'étais fatigué, alors je suis rentré.', 'I was tired, so I went home.'] },
    ] },
  ] },
  { type: 'groups', title: 'Donner son avis', hint: 'Tap a word to hear it.', ask: 'Which group?', groups: [
    { name: 'Ce qu\'on pense', en: 'what you think', color: '#4f46e5', words: [
      { key: 'idée', fr: 'l\'idée', en: 'idea', ex: ['C\'est une bonne idée.', 'It is a good idea.'] },
      { key: 'avis', fr: 'l\'avis', en: 'opinion', ex: ['À mon avis, c\'est trop cher.', 'In my opinion, it is too expensive.'] },
      { key: 'point', fr: 'le point de vue', en: 'point of view', ex: ['De mon point de vue, il a raison.', 'From my point of view, he is right.'] },
      { key: 'pensée', fr: 'la pensée', en: 'thought', ex: ['C\'est une pensée intéressante.', 'It is an interesting thought.'] },
      { key: 'croyance', fr: 'la croyance', en: 'belief', ex: ['C\'est une croyance populaire.', 'It is a popular belief.'] },
    ] },
    { name: 'Pour et contre', en: 'for and against', color: '#059669', words: [
      { key: 'avantage', fr: 'l\'avantage', en: 'advantage', ex: ['Le premier avantage, c\'est le prix.', 'The first advantage is the price.'] },
      { key: 'inconvénient', fr: 'l\'inconvénient', en: 'drawback', ex: ['Le seul inconvénient, c\'est le bruit.', 'The only drawback is the noise.'] },
      { key: 'raison', fr: 'la raison', en: 'reason', ex: ['Pour cette raison, je suis contre.', 'For this reason, I am against it.'] },
      { key: 'but', fr: 'le but', en: 'aim, goal', ex: ['Le but de ce projet est d\'aider les jeunes.', 'The aim of this project is to help young people.'] },
      { key: 'enjeu', fr: 'l\'enjeu', en: 'what is at stake', ex: ['L\'enjeu est important pour la ville.', 'What is at stake matters for the town.'] },
    ] },
    { name: 'Verbes pour dire', en: 'verbs of saying', color: '#d97706', words: [
      { key: 'souligner', fr: 'souligner', en: 'to stress, to underline', ex: ['Je voudrais souligner un point.', 'I would like to stress one point.'] },
      { key: 'reconnaître', fr: 'reconnaître', en: 'to admit', ex: ['Je reconnais que j\'ai eu tort.', 'I admit I was wrong.'] },
      { key: 'prétendre', fr: 'prétendre', en: 'to claim', ex: ['Il prétend qu\'il n\'a rien vu.', 'He claims he saw nothing.'], note: 'Prétendre: claim (maybe not true). Not « pretend » (faire semblant).' },
    ] },
  ] },
] },

// ---------------- 55 Precise Verbs & Nuance ----------------
55: { name: 'Verb scales', next: 'Slide from weak to strong', tabs: [
  { type: 'scale', title: 'Un problème', hint: 'From stopping a problem (left) to making it worse (right).', left: 'ça va mieux', right: 'ça va plus mal', color: '#e11d48', ask: 'Which one makes the problem worse?', stops: [
    { p: 0, key: 'enrayer', fr: 'enrayer', en: 'to halt, to check', ex: ['Il faut enrayer l\'épidémie.', 'The epidemic must be halted.'] },
    { p: 20, key: 'pallier', fr: 'pallier', en: 'to make up for', ex: ['On embauche pour pallier le manque de personnel.', 'We are hiring to make up for the staff shortage.'], note: 'Pallier + direct object: pallier le manque (not « à »).' },
    { p: 38, key: 'atténuer', fr: 'atténuer', en: 'to soften, to reduce', ex: ['Ce médicament atténue la douleur.', 'This medicine reduces the pain.'] },
    { p: 56, key: 'infléchir', fr: 'infléchir', en: 'to change the course of', ex: ['Le gouvernement veut infléchir sa politique.', 'The government wants to shift its policy.'] },
    { p: 76, key: 'entraver', fr: 'entraver', en: 'to hinder', ex: ['La grève entrave la circulation.', 'The strike is hindering traffic.'] },
    { p: 100, key: 'aggraver', fr: 'aggraver', en: 'to make worse', ex: ['Le stress aggrave la maladie.', 'Stress makes the illness worse.'] },
  ] },
  { type: 'scale', title: 'Pour ou contre', hint: 'From approving (left) to attacking (right).', left: 'pour', right: 'contre', color: '#4f46e5', ask: 'Which one is more against?', stops: [
    { p: 0, key: 'entériner', fr: 'entériner', en: 'to ratify, to approve officially', ex: ['Le conseil a entériné la décision.', 'The council ratified the decision.'] },
    { p: 18, key: 'préconiser', fr: 'préconiser', en: 'to recommend', ex: ['Les médecins préconisent le repos.', 'Doctors recommend rest.'] },
    { p: 36, key: 'se targuer de', fr: 'se targuer de', en: 'to boast of', ex: ['Il se targue de parler cinq langues.', 'He boasts of speaking five languages.'] },
    { p: 58, key: 'éluder', fr: 'éluder', en: 'to evade, to dodge', ex: ['Le ministre a éludé la question.', 'The minister dodged the question.'] },
    { p: 80, key: "s'insurger contre", fr: "s'insurger contre", en: 'to rise up against', ex: ['Les habitants s\'insurgent contre le projet.', 'The residents are up in arms against the project.'] },
    { p: 100, key: 'fustiger', fr: 'fustiger', en: 'to lambast', ex: ['La presse fustige le gouvernement.', 'The press lambasts the government.'] },
  ] },
  { type: 'scale', title: 'Prouver', hint: 'From noticing (left) to proving (right).', left: 'on remarque', right: 'c\'est prouvé', color: '#059669', ask: 'Which one is closer to proof?', stops: [
    { p: 0, key: 'déceler', fr: 'déceler', en: 'to detect', ex: ['Le test permet de déceler la maladie.', 'The test can detect the disease.'] },
    { p: 33, key: "s'avérer", fr: "s'avérer", en: 'to turn out (to be)', ex: ['La solution s\'est avérée efficace.', 'The solution turned out to be effective.'] },
    { p: 66, key: 'étayer', fr: 'étayer', en: 'to support (with evidence)', ex: ['Étayez votre opinion par des exemples.', 'Support your opinion with examples.'], note: 'Very useful in TCF / TEF essays.' },
    { p: 100, key: 'corroborer', fr: 'corroborer', en: 'to corroborate', ex: ['Les témoins corroborent sa version.', 'The witnesses corroborate his account.'] },
  ] },
  { type: 'scale', title: 'Peur et attente', hint: 'From thinking about it (left) to fearing it (right).', left: 'on y pense', right: 'on a peur', color: '#d97706', ask: 'Which one shows more fear?', stops: [
    { p: 0, key: 'envisager', fr: 'envisager', en: 'to consider', ex: ['J\'envisage de déménager.', 'I am considering moving.'] },
    { p: 50, key: 'appréhender', fr: 'appréhender', en: 'to dread; to grasp', ex: ['J\'appréhende l\'examen.', 'I am dreading the exam.'], note: 'Also: to grasp (appréhender un problème) or to arrest.' },
    { p: 100, key: 'redouter', fr: 'redouter', en: 'to fear', ex: ['On redoute une nouvelle crise.', 'A new crisis is feared.'] },
  ] },
  { type: 'groups', title: 'Quatre autres', hint: 'Tap a verb to hear it in a sentence.', ask: 'What does this verb do?', groups: [
    { name: 'Faire naître', en: 'bring about', color: '#059669', words: [
      { key: 'susciter', fr: 'susciter', en: 'to arouse, to give rise to', ex: ['Ce film suscite beaucoup d\'intérêt.', 'This film is arousing a lot of interest.'] },
      { key: "s'ingénier à", fr: "s'ingénier à", en: 'to strive to', ex: ['Il s\'ingénie à trouver une solution.', 'He strives to find a solution.'] },
    ] },
    { name: 'Durer ou disparaître', en: 'last or fade', color: '#4f46e5', words: [
      { key: 'pérenniser', fr: 'pérenniser', en: 'to make lasting', ex: ['La ville veut pérenniser ces emplois.', 'The town wants to make these jobs permanent.'] },
      { key: 'éclipser', fr: 'éclipser', en: 'to overshadow', ex: ['Ce succès a éclipsé ses erreurs.', 'This success overshadowed his mistakes.'] },
    ] },
  ] },
] },

// ---------------- 54 Formal & Official French ----------------
54: { name: 'Register slider', next: 'Slide from everyday to formal', tabs: [
  { type: 'register', title: 'Courant → soutenu', hint: 'Pick a word, then slide from everyday French to formal French (letters, forms, offices).', levels: ['familier', 'courant', 'soutenu'], sets: [
    { key: 'suite à', en: 'following', w: [null, ['après', 'Après ton appel, j\'ai réfléchi.', 'After your call, I thought about it.'], ['suite à', 'Suite à votre appel, je vous écris.', 'Following your call, I am writing to you.']] },
    { key: 'ci-joint', en: 'attached', w: [null, ['avec ce mail', 'Je t\'envoie la photo avec ce mail.', 'I am sending you the photo with this email.'], ['ci-joint', 'Veuillez trouver ci-joint mon CV.', 'Please find attached my CV.']] },
    { key: 'justificatif', en: 'proof, supporting document', w: [['un papier', 'Il faut un papier.', 'You need a paper.'], ['une preuve', 'Il faut une preuve que vous habitez ici.', 'You need proof that you live here.'], ['un justificatif', 'Merci de fournir un justificatif de domicile.', 'Please provide proof of address.']] },
    { key: 'solliciter', en: 'to request, to apply for', w: [null, ['demander', 'Je demande un rendez-vous.', 'I am asking for an appointment.'], ['solliciter', 'Je sollicite un entretien.', 'I am requesting an interview.']] },
    { key: 'requête', en: 'request', w: [null, ['la demande', 'Ma demande est simple.', 'My request is simple.'], ['la requête', 'Votre requête a été transmise.', 'Your request has been forwarded.']] },
    { key: "dans l'attente de", en: 'looking forward to', w: [null, ['en attendant', 'En attendant ta réponse…', 'While I wait for your answer…'], ["dans l'attente de", 'Dans l\'attente de votre réponse, je vous prie d\'agréer…', 'Looking forward to your reply, yours faithfully…']] },
    { key: 'veuillez agréer', en: 'yours faithfully (letter ending)', w: [['bises', 'Bises, Léa', 'Love, Léa'], ['cordialement', 'Cordialement, Léa Martin', 'Kind regards, Léa Martin'], ['veuillez agréer', 'Veuillez agréer, Madame, mes salutations distinguées.', 'Yours faithfully.']] },
    { key: 'faire part de', en: 'to inform of', w: [null, ['dire', 'Je te dis ma décision.', 'I am telling you my decision.'], ['faire part de', 'Je vous fais part de ma décision.', 'I am informing you of my decision.']] },
    { key: 'démarche', en: 'step, procedure', w: [null, ['ce qu\'il faut faire', 'Qu\'est-ce qu\'il faut faire ?', 'What do I have to do?'], ['la démarche', 'Quelles sont les démarches à suivre ?', 'What steps must be followed?']] },
    { key: 'préalable', en: 'prior', w: [null, ['avant', 'Il faut réserver avant.', 'You have to book before.'], ['préalable', 'Une réservation préalable est obligatoire.', 'Prior booking is required.']] },
    { key: 'dûment', en: 'duly', w: [null, ['bien', 'Remplis bien le formulaire.', 'Fill in the form properly.'], ['dûment', 'Le formulaire doit être dûment rempli.', 'The form must be duly completed.']] },
    { key: 'habilité', en: 'authorised', w: [null, ['qui a le droit', 'Seul le directeur a le droit de signer.', 'Only the director is allowed to sign.'], ['habilité', 'Seul le directeur est habilité à signer.', 'Only the director is authorised to sign.']] },
    { key: 'délai', en: 'time allowed, deadline', w: [null, ['le temps', 'Tu as combien de temps ?', 'How much time do you have?'], ['le délai', 'Le délai de réponse est de 15 jours.', 'The time allowed for a reply is 15 days.']] },
    { key: 'échéance', en: 'due date', w: [null, ['la date limite', 'La date limite, c\'est lundi.', 'The deadline is Monday.'], ['l\'échéance', 'Le paiement est dû à l\'échéance.', 'Payment is due on the due date.']] },
    { key: 'à compter de', en: 'as from', w: [null, ['à partir de', 'À partir de lundi, je travaille.', 'From Monday I am working.'], ['à compter de', 'À compter du 1er mars, le bureau sera fermé.', 'As from 1 March, the office will be closed.']] },
    { key: 'procéder à', en: 'to carry out', w: [null, ['faire', 'On fait des travaux.', 'We are doing some work.'], ['procéder à', 'Nous allons procéder à des travaux.', 'We will be carrying out works.']] },
    { key: 'accuser réception', en: 'to acknowledge receipt', w: [null, ['dire qu\'on a reçu', 'Dis-moi si tu as reçu mon mail.', 'Tell me if you got my email.'], ['accuser réception', 'Nous accusons réception de votre dossier.', 'We acknowledge receipt of your file.']] },
    { key: 'en vertu de', en: 'under, by virtue of', w: [null, ['selon', 'Selon la loi, c\'est interdit.', 'According to the law, it is forbidden.'], ['en vertu de', 'En vertu de la loi, c\'est interdit.', 'Under the law, it is forbidden.']] },
    { key: 'conformément à', en: 'in accordance with', w: [null, ['comme le dit', 'Comme le dit le règlement…', 'As the rules say…'], ['conformément à', 'Conformément au règlement, …', 'In accordance with the rules, …']] },
    { key: 'sous réserve de', en: 'subject to', w: [null, ['si', 'Tu peux venir si tu as un billet.', 'You can come if you have a ticket.'], ['sous réserve de', 'Entrée sous réserve de places disponibles.', 'Entry subject to availability.']] },
    { key: 'cas échéant', en: 'if need be', w: [null, ['si besoin', 'Appelle-moi si besoin.', 'Call me if need be.'], ['le cas échéant', 'Le cas échéant, contactez le service client.', 'If need be, contact customer service.']] },
    { key: 'il convient de', en: 'it is advisable to', w: [null, ['il faut', 'Il faut arriver à l\'heure.', 'You have to arrive on time.'], ['il convient de', 'Il convient d\'arriver à l\'heure.', 'It is advisable to arrive on time.']] },
    { key: "s'acquitter de", en: 'to pay, to settle', w: [null, ['payer', 'Je dois payer la facture.', 'I have to pay the bill.'], ["s'acquitter de", 'Vous devez vous acquitter de la somme due.', 'You must settle the amount due.']] },
    { key: 'réclamation', en: 'complaint', w: [['un coup de gueule', 'J\'ai poussé un coup de gueule.', 'I had a rant.'], ['se plaindre', 'Je veux me plaindre.', 'I want to complain.'], ['une réclamation', 'Je souhaite déposer une réclamation.', 'I wish to make a complaint.']] },
  ] },
] },

// ---------------- 56 Everyday Slang & Spoken French ----------------
56: { name: 'Register slider', next: 'Slide from slang to standard French', tabs: [
  { type: 'register', title: 'Familier → courant', hint: 'Pick a word, then slide from slang (friends) to everyday French (anyone) to formal French.', levels: ['familier', 'courant', 'soutenu'], sets: [
    { key: 'boulot', en: 'job, work', w: [['le boulot', 'J\'ai trop de boulot.', 'I have too much work.'], ['le travail', 'J\'ai trop de travail.', 'I have too much work.'], ['l\'emploi', 'Il cherche un emploi.', 'He is looking for a job.']] },
    { key: 'bosser', en: 'to work', w: [['bosser', 'Je bosse ce week-end.', 'I am working this weekend.'], ['travailler', 'Je travaille ce week-end.', 'I am working this weekend.'], null] },
    { key: 'galérer', en: 'to struggle', w: [['galérer', 'J\'ai galéré pour trouver un appart.', 'I struggled to find a flat.'], ['avoir du mal', 'J\'ai eu du mal à trouver un appartement.', 'I had trouble finding a flat.'], null] },
    { key: 'se planter', en: 'to get it wrong, to fail', w: [['se planter', 'Je me suis planté à l\'examen.', 'I messed up the exam.'], ['se tromper, échouer', 'J\'ai échoué à l\'examen.', 'I failed the exam.'], null] },
    { key: 'crevé', en: 'exhausted', w: [['crevé', 'Je suis crevé !', 'I am shattered!'], ['fatigué', 'Je suis très fatigué.', 'I am very tired.'], ['épuisé', 'Je suis épuisé.', 'I am exhausted.']] },
    { key: 'avoir la flemme', en: "can't be bothered", w: [['avoir la flemme', 'J\'ai la flemme de cuisiner.', 'I can\'t be bothered to cook.'], ['ne pas avoir envie', 'Je n\'ai pas envie de cuisiner.', 'I don\'t feel like cooking.'], null] },
    { key: 'fric', en: 'money, cash', w: [['le fric', 'Il a plein de fric.', 'He has loads of cash.'], ['l\'argent', 'Il a beaucoup d\'argent.', 'He has a lot of money.'], null] },
    { key: 'truc', en: 'thing', w: [['le truc', 'C\'est quoi, ce truc ?', 'What is this thing?'], ['la chose', 'C\'est quoi, cette chose ?', 'What is this thing?'], ['l\'objet', 'Quel est cet objet ?', 'What is this object?']] },
    { key: 'boulet', en: 'pain in the neck (person)', w: [['un boulet', 'Ce collègue, c\'est un boulet.', 'This colleague is a real drag.'], ['quelqu\'un de pénible', 'Ce collègue est pénible.', 'This colleague is annoying.'], null] },
    { key: 'pote', en: 'mate, friend', w: [['le pote', 'Je sors avec mes potes.', 'I am going out with my mates.'], ['l\'ami', 'Je sors avec mes amis.', 'I am going out with my friends.'], null] },
    { key: 'mec', en: 'guy', w: [['le mec', 'C\'est un mec sympa.', 'He is a nice guy.'], ['l\'homme, le garçon', 'C\'est un homme sympathique.', 'He is a nice man.'], ['le monsieur', 'Ce monsieur est très aimable.', 'This gentleman is very kind.']] },
    { key: 'nana', en: 'girl, woman', w: [['la nana', 'Cette nana est géniale.', 'This girl is great.'], ['la femme, la fille', 'Cette femme est géniale.', 'This woman is great.'], ['la dame', 'Cette dame est très aimable.', 'This lady is very kind.']] },
    { key: 'bagnole', en: 'car', w: [['la bagnole', 'Ma bagnole est en panne.', 'My car has broken down.'], ['la voiture', 'Ma voiture est en panne.', 'My car has broken down.'], ['le véhicule', 'Votre véhicule est mal garé.', 'Your vehicle is badly parked.']] },
    { key: 'fringues', en: 'clothes, gear', w: [['les fringues', 'J\'ai acheté des fringues.', 'I bought some clothes.'], ['les vêtements', 'J\'ai acheté des vêtements.', 'I bought some clothes.'], ['la tenue', 'Une tenue correcte est exigée.', 'Proper dress is required.']] },
    { key: 'bouffer', en: 'to eat', w: [['bouffer', 'On va bouffer ?', 'Shall we grab some food?'], ['manger', 'On va manger ?', 'Shall we eat?'], ['se restaurer', 'Vous pouvez vous restaurer sur place.', 'Food is available on site.']] },
    { key: 'se casser', en: 'to leave, to clear off', w: [['se casser', 'Bon, je me casse !', 'Right, I\'m off!'], ['partir', 'Bon, je pars !', 'Right, I am leaving!'], ['s\'en aller', 'Je dois m\'en aller.', 'I must go.']] },
    { key: 'kiffer', en: 'to love, to be into', w: [['kiffer', 'Je kiffe cette chanson !', 'I love this song!'], ['aimer, adorer', 'J\'adore cette chanson !', 'I love this song!'], ['apprécier', 'J\'apprécie beaucoup cette chanson.', 'I like this song very much.']] },
    { key: 'grave', en: 'totally, really', w: [['grave', 'Il est grave sympa.', 'He is really nice.'], ['vraiment, très', 'Il est vraiment sympa.', 'He is really nice.'], null], note: 'Also normal French: c\'est grave = it is serious.' },
    { key: 'carrément', en: 'totally, absolutely', w: [['carrément', 'Tu viens ? — Carrément !', 'Are you coming? — Absolutely!'], ['tout à fait', 'Tout à fait !', 'Absolutely!'], null] },
    { key: 'ouf', en: 'crazy (verlan of fou)', w: [['ouf', 'C\'est ouf !', 'It is crazy!'], ['fou, incroyable', 'C\'est incroyable !', 'It is incredible!'], null] },
    { key: 'chelou', en: 'weird (verlan of louche)', w: [['chelou', 'Il est chelou, ce type.', 'That guy is weird.'], ['bizarre', 'Cet homme est bizarre.', 'This man is strange.'], null] },
    { key: 'relou', en: 'annoying (verlan of lourd)', w: [['relou', 'T\'es relou !', 'You are annoying!'], ['pénible', 'Tu es pénible !', 'You are annoying!'], null] },
    { key: 'flipper', en: 'to freak out', w: [['flipper', 'Je flippe pour l\'examen.', 'I am freaking out about the exam.'], ['avoir peur, stresser', 'J\'ai peur de l\'examen.', 'I am afraid of the exam.'], null] },
    { key: 'ça me saoule', en: 'it gets on my nerves', w: [['ça me saoule', 'Ce bruit, ça me saoule !', 'This noise is doing my head in!'], ['ça m\'énerve', 'Ce bruit m\'énerve.', 'This noise annoys me.'], null] },
    { key: 'laisse tomber', en: 'forget it', w: [['laisse tomber', 'Laisse tomber, c\'est pas grave.', 'Forget it, it doesn\'t matter.'], ['oublie', 'Oublie, ce n\'est pas grave.', 'Forget it, it doesn\'t matter.'], null] },
  ] },
] },

// ---------------- 12 Personality & Physical Description ----------------
12: { name: 'Opposites', next: 'Slide between opposites', tabs: [
  { type: 'pairs', title: 'Le physique', hint: 'Pick a pair, then slide. The feminine form is in the box.', pairs: [
    { key: 'grand / grande', a: ['grand · grande', 'tall', 'Mon frère est grand.', 'My brother is tall.'], b: ['petit · petite', 'short, small', 'Ma sœur est petite.', 'My sister is short.'], keyB: 'petit / petite' },
    { key: 'mince', a: ['mince', 'slim', 'Elle est mince.', 'She is slim.'], b: ['gros · grosse', 'fat, big', 'Le chat est gros.', 'The cat is fat.'], keyB: 'gros / grosse', note: 'Be kind: « fort » is a polite way to say gros.' },
    { key: 'jeune', a: ['jeune', 'young', 'Il est jeune.', 'He is young.'], b: ['âgé · âgée', 'elderly', 'Ma voisine est âgée.', 'My neighbour is elderly.'], keyB: 'âgé / âgée', note: 'Âgé is more polite than vieux · vieille.' },
    { key: 'beau / belle', a: ['beau · belle', 'beautiful, handsome', 'Elle est très belle.', 'She is very beautiful.'], b: ['laid · laide', 'ugly', 'Ce tableau est laid.', 'This painting is ugly.'], keyB: 'laid / laide', note: 'Joli · jolie = pretty, a bit lighter than beau.' },
  ] },
  { type: 'groups', title: 'Les cheveux', hint: 'Il a les cheveux… / Elle est… Tap to hear.', ask: 'Which group?', groups: [
    { name: 'La couleur', en: 'les cheveux …', color: '#b45309', words: [
      { key: 'blond / blonde', fr: 'blond · blonde', en: 'blond', ex: ['Il a les cheveux blonds.', 'He has blond hair.'] },
      { key: 'brun / brune', fr: 'brun · brune', en: 'dark-haired', ex: ['Elle est brune.', 'She has dark hair.'] },
      { key: 'roux / rousse', fr: 'roux · rousse', en: 'red-haired', ex: ['Ma cousine est rousse.', 'My cousin has red hair.'] },
      { key: 'châtain', fr: 'châtain', en: 'light brown (hair)', ex: ['Il a les cheveux châtains.', 'He has light brown hair.'] },
    ] },
    { name: 'Le visage', en: 'the face', color: '#4f46e5', words: [
      { key: 'chauve', fr: 'chauve', en: 'bald', ex: ['Mon père est chauve.', 'My father is bald.'] },
      { key: 'barbe', fr: 'la barbe', en: 'beard', ex: ['Il a une barbe.', 'He has a beard.'] },
      { key: 'lunettes', fr: 'les lunettes', en: 'glasses', ex: ['Elle porte des lunettes.', 'She wears glasses.'] },
    ] },
  ] },
  { type: 'pairs', title: 'Le caractère', hint: 'Pick a pair, then slide. Some opposites (méchant, bête, égoïste…) are extra words, not in the topic list.', pairs: [
    { key: 'timide', a: ['timide', 'shy', 'Il est timide en classe.', 'He is shy in class.'], b: ['bavard · bavarde', 'chatty', 'Ma voisine est bavarde.', 'My neighbour is chatty.'], keyB: 'bavard / bavarde' },
    { key: 'travailleur / travailleuse', a: ['travailleur · travailleuse', 'hard-working', 'C\'est une élève travailleuse.', 'She is a hard-working pupil.'], b: ['paresseux · paresseuse', 'lazy', 'Le chat est paresseux.', 'The cat is lazy.'], keyB: 'paresseux / paresseuse' },
    { key: 'sérieux / sérieuse', a: ['sérieux · sérieuse', 'serious, reliable', 'C\'est un employé sérieux.', 'He is a reliable employee.'], b: ['drôle', 'funny', 'Mon oncle est très drôle.', 'My uncle is very funny.'], keyB: 'drôle' },
    { key: 'gentil / gentille', a: ['gentil · gentille', 'kind', 'Elle est gentille.', 'She is kind.'], b: ['méchant · méchante', 'nasty, mean', 'Le loup est méchant.', 'The wolf is nasty.'], extraB: true },
    { key: 'sympa', a: ['sympa', 'nice, friendly', 'Ton frère est sympa.', 'Your brother is nice.'], b: ['désagréable', 'unpleasant', 'Le serveur est désagréable.', 'The waiter is unpleasant.'], extraB: true, note: 'Sympa never changes: elle est sympa.' },
    { key: 'intelligent / intelligente', a: ['intelligent · intelligente', 'clever', 'C\'est une fille intelligente.', 'She is a clever girl.'], b: ['bête', 'stupid', 'Ce n\'est pas bête !', 'That is not stupid!'], extraB: true },
    { key: 'généreux / généreuse', a: ['généreux · généreuse', 'generous', 'Ma grand-mère est généreuse.', 'My grandmother is generous.'], b: ['égoïste', 'selfish', 'Il est un peu égoïste.', 'He is a bit selfish.'], extraB: true },
    { key: 'courageux / courageuse', a: ['courageux · courageuse', 'brave', 'Le pompier est courageux.', 'The firefighter is brave.'], b: ['peureux · peureuse', 'fearful', 'Mon chien est peureux.', 'My dog is fearful.'], extraB: true },
    { key: 'honnête', a: ['honnête', 'honest', 'C\'est un homme honnête.', 'He is an honest man.'], b: ['malhonnête', 'dishonest', 'Ce vendeur est malhonnête.', 'This salesman is dishonest.'], extraB: true },
    { key: 'sportif / sportive', a: ['sportif · sportive', 'sporty', 'Ma sœur est très sportive.', 'My sister is very sporty.'], b: ['pas sportif', 'not sporty', 'Moi, je ne suis pas sportif.', 'I am not sporty.'], extraB: true },
  ] },
] },

// ---------------- 13 Emotions & Feelings ----------------
13: { name: 'Feelings', next: 'Slide through feelings', tabs: [
  { type: 'scale', title: 'Triste ou heureux ?', hint: 'From feeling down (left) to happy (right).', left: 'pas bien', right: 'très bien', color: '#059669', ask: 'Which one feels better?', stops: [
    { p: 0, key: "j'ai le cafard.", fr: "j'ai le cafard", en: 'I feel down', ex: ['Le dimanche soir, j\'ai le cafard.', 'On Sunday evenings I feel down.'] },
    { p: 16, key: 'triste', fr: 'triste', en: 'sad', ex: ['Elle est triste depuis son départ.', 'She has been sad since he left.'] },
    { p: 30, key: 'déçu / déçue', fr: 'déçu · déçue', en: 'disappointed', ex: ['Je suis déçu par le film.', 'I am disappointed with the film.'], note: 'Déçu = disappointed. Not deceived (trompé).' },
    { p: 44, key: 'de bonne / mauvaise humeur', fr: 'de mauvaise humeur', en: 'in a bad mood', ex: ['Le matin, il est de mauvaise humeur.', 'In the morning he is in a bad mood.'] },
    { p: 56, key: 'je me sens bien / mal.', fr: 'je me sens bien', en: 'I feel fine', ex: ['Aujourd\'hui, je me sens bien.', 'Today I feel fine.'] },
    { p: 66, key: 'de bonne / mauvaise humeur', fr: 'de bonne humeur', en: 'in a good mood', ex: ['Elle est toujours de bonne humeur.', 'She is always in a good mood.'] },
    { p: 80, key: 'content / contente', fr: 'content · contente', en: 'glad, pleased', ex: ['Je suis content de te voir.', 'I am glad to see you.'] },
    { p: 100, key: 'heureux / heureuse', fr: 'heureux · heureuse', en: 'happy', ex: ['Ils sont très heureux ensemble.', 'They are very happy together.'] },
  ] },
  { type: 'scale', title: 'La colère et la peur', hint: 'From a little (left) to very (right).', left: 'un peu', right: 'très fort', color: '#e11d48', ask: 'Which one is stronger?', stops: [
    { p: 0, key: 'stressé / stressée', fr: 'stressé · stressée', en: 'stressed', ex: ['Je suis stressé avant l\'examen.', 'I am stressed before the exam.'] },
    { p: 22, key: 'énervé / énervée', fr: 'énervé · énervée', en: 'annoyed, wound up', ex: ['Il est énervé à cause du bruit.', 'He is annoyed because of the noise.'] },
    { p: 40, key: 'inquiet / inquiète', fr: 'inquiet · inquiète', en: 'worried', ex: ['Ma mère est inquiète.', 'My mother is worried.'] },
    { p: 60, key: 'fâché / fâchée', fr: 'fâché · fâchée', en: 'cross, angry', ex: ['Elle est fâchée contre moi.', 'She is cross with me.'] },
    { p: 80, key: "j'ai peur.", fr: "j'ai peur", en: 'I am scared', ex: ['J\'ai peur des araignées.', 'I am scared of spiders.'], note: 'Avoir peur: j\'ai peur, not « je suis peur ».' },
    { p: 100, key: 'en colère', fr: 'en colère', en: 'angry, furious', ex: ['Le client est en colère.', 'The customer is angry.'] },
  ] },
  { type: 'scale', title: 'Aimer', hint: 'From hating (left) to loving (right).', left: 'je déteste', right: "j'adore", color: '#db2777', ask: 'Which one is stronger love?', stops: [
    { p: 0, key: 'détester', fr: 'détester', en: 'to hate', ex: ['Je déteste me lever tôt.', 'I hate getting up early.'] },
    { p: 35, key: 'aimer', fr: 'ne pas trop aimer', en: 'not to like much', ex: ['Je n\'aime pas trop le froid.', 'I don\'t much like the cold.'] },
    { p: 65, key: 'aimer', fr: 'aimer', en: 'to like; to love (a person)', ex: ['J\'aime le chocolat.', 'I like chocolate.'], note: 'J\'aime bien quelqu\'un = I like him. Je l\'aime = I love him.' },
    { p: 100, key: 'adorer', fr: 'adorer', en: 'to love, to adore', ex: ['J\'adore voyager !', 'I love travelling!'] },
  ] },
  { type: 'groups', title: "J'ai… ou je suis… ?", hint: 'In French many feelings use avoir, not être. Tap to hear.', ask: "J'ai… or je suis… ?", groups: [
    { name: "J'ai…", en: 'avoir + noun', color: '#4f46e5', words: [
      { key: "j'ai faim.", fr: "j'ai faim", en: 'I am hungry', ex: ['J\'ai faim, on mange ?', 'I am hungry, shall we eat?'] },
      { key: "j'ai soif.", fr: "j'ai soif", en: 'I am thirsty', ex: ['J\'ai soif, je voudrais de l\'eau.', 'I am thirsty, I would like some water.'] },
      { key: "j'ai chaud.", fr: "j'ai chaud", en: 'I am hot', ex: ['J\'ai chaud, j\'ouvre la fenêtre.', 'I am hot, I am opening the window.'] },
      { key: "j'ai froid.", fr: "j'ai froid", en: 'I am cold', ex: ['J\'ai froid, je mets un pull.', 'I am cold, I am putting on a jumper.'] },
      { key: "j'ai sommeil.", fr: "j'ai sommeil", en: 'I am sleepy', ex: ['J\'ai sommeil, je vais me coucher.', 'I am sleepy, I am going to bed.'] },
      { key: "j'ai peur.", fr: "j'ai peur", en: 'I am scared', ex: ['J\'ai peur du noir.', 'I am scared of the dark.'] },
      { key: "j'ai honte.", fr: "j'ai honte", en: 'I am ashamed', ex: ['J\'ai honte de mon erreur.', 'I am ashamed of my mistake.'] },
      { key: "j'ai de la chance.", fr: "j'ai de la chance", en: 'I am lucky', ex: ['J\'ai de la chance aujourd\'hui !', 'I am lucky today!'] },
      { key: "j'ai raison. / j'ai tort.", fr: "j'ai raison · j'ai tort", en: 'I am right · I am wrong', ex: ['Tu as raison, j\'ai tort.', 'You are right, I am wrong.'] },
      { key: "j'ai besoin de…", fr: "j'ai besoin de…", en: 'I need…', ex: ['J\'ai besoin d\'aide.', 'I need help.'] },
      { key: "j'ai envie de…", fr: "j'ai envie de…", en: 'I feel like…', ex: ['J\'ai envie d\'une glace.', 'I feel like an ice cream.'] },
    ] },
    { name: 'Je suis…', en: 'être + adjective', color: '#059669', words: [
      { key: 'fatigué / fatiguée', fr: 'je suis fatigué', en: 'I am tired', ex: ['Je suis fatigué après le travail.', 'I am tired after work.'] },
      { key: 'surpris / surprise', fr: 'je suis surpris', en: 'I am surprised', ex: ['Je suis surpris de te voir ici !', 'I am surprised to see you here!'] },
      { key: 'fier / fière', fr: 'je suis fier', en: 'I am proud', ex: ['Je suis fière de toi.', 'I am proud of you.'] },
      { key: 'seul / seule', fr: 'je suis seul', en: 'I am alone, lonely', ex: ['Ce soir, je suis seule.', 'Tonight I am alone.'] },
      { key: 'amoureux / amoureuse', fr: 'je suis amoureux', en: 'I am in love', ex: ['Il est amoureux de sa voisine.', 'He is in love with his neighbour.'] },
      { key: 'content / contente', fr: 'je suis content', en: 'I am glad', ex: ['Je suis contente de mon travail.', 'I am pleased with my work.'] },
    ] },
  ] },
] },
};
