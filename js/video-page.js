// video-page.js - a short animated video in step 2 of a Vocab topic, with Check yourself under it.
// (The weather video has its own file, weather-video.js; new videos are added here.)
//   Watch: the video, buttons to jump to each part, a few rules to remember
//   Check yourself: questions, some with a still from the video; the wrong answers are the usual mistakes,
//          explained when picked; right first time moves the word up a box
// Videos and pictures are made by tools/<name>-video (people: DiceBear toon-head, CC BY 4.0, Johan Melin;
// food: Microsoft Fluent Emoji, MIT; voices: Piper).
//   VIDEO_PAGES[themeId] = { name, next, dir, chapters: [[label, seconds]], rules: [html], questions: [...] }
//   question: { img?, t? (seconds, for "See it in the video"), q, a, opts: [a + wrong answers], why, wrong?: { answer: why not }, key? }
(function () {
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const plain = (s) => String(s).toLowerCase().replace(/[.!?…\s]+$/g, '').replace(/\s+/g, ' ').trim();

const PAGES = {
// ---------------- 1 Greetings & Politeness ----------------
1: {
    name: 'Greetings video', next: 'Watch the greetings video', dir: 'media/greet/', file: 'greet.mp4',
    credit: 'Léa, Mme Dubois, Mme Martin, Camille and Zoé: DiceBear toon-head (CC BY 4.0, Johan Melin) · pictures: Microsoft Fluent Emoji (MIT) · voice: Piper',
    chapters: [['Le matin · la voisine', 0], ['Au bureau · 9 h', 25.1], ['Le soir · au café', 64.4]],
    rules: [
        '<b>Bonjour</b> all day, to everyone · <b>bonsoir</b> from about 6 pm · <b>bonne nuit</b> only when someone goes to bed.',
        '<b>vous</b> to an adult you don\'t know well, at work, with madame / monsieur · <b>tu</b> to a friend, family, a child.',
        'So: <i>excusez-moi · s\'il vous plaît · comment vous appelez-vous ?</i> (vous) and <i>excuse-moi · s\'il te plaît · comment tu t\'appelles ?</i> (tu).',
        '<b>Merci</b> → <b>de rien</b> (everyday) or <b>je vous en prie</b> (polite, vous).',
        'When you leave: <b>bonne journée</b> (daytime), <b>bonne soirée</b> (evening), <b>à demain</b>, <b>à bientôt</b>, <b>au revoir</b>.',
        'At work you shake hands; friends do <b>la bise</b> (a kiss on each cheek).',
    ],
    questions: [
        { img: 'matin', t: 2.8, q: 'Le matin, Léa voit sa voisine. Elle dit :', a: 'Bonjour, madame Dubois !', opts: ['Bonjour, madame Dubois !', 'Bonsoir, madame Dubois !', 'Bonne nuit, madame Dubois !', 'Salut, Dubois !'], why: 'In the morning and all day: bonjour.', wrong: { 'Bonsoir, madame Dubois !': 'Bonsoir is for the evening.', 'Bonne nuit, madame Dubois !': 'Bonne nuit is only when someone goes to bed.', 'Salut, Dubois !': 'Salut is for friends, and a neighbour is madame Dubois.' }, key: 'bonjour' },
        { t: 4.9, q: 'Vous parlez à une dame que vous ne connaissez pas bien. Vous demandez :', a: 'Comment allez-vous ?', opts: ['Comment allez-vous ?', 'Ça va, toi ?', 'Comment tu vas ?', 'Comment allez-tu ?'], why: 'Vous to an adult you don\'t know well: Comment allez-vous ?', wrong: { 'Ça va, toi ?': 'Toi is tu: for friends.', 'Comment tu vas ?': 'Tu is for friends and family.', 'Comment allez-tu ?': 'Allez goes with vous, not tu.' }, key: 'comment allez-vous ?' },
        { t: 11.4, q: 'Ça ne va pas très bien, mais pas très mal :', a: 'Comme ci, comme ça.', opts: ['Comme ci, comme ça.', 'Ça va bien, merci.', 'Je vous en prie.', 'Bonne journée.'], why: 'Comme ci, comme ça = so-so.', key: 'comme ci, comme ça' },
        { t: 14.6, q: 'Mme Dubois a mal au dos. Léa dit :', a: 'Oh, je suis désolée !', opts: ['Oh, je suis désolée !', 'De rien !', 'Enchantée !', 'Je vous en prie !'], why: 'Désolé · désolée = sorry (about something bad). Léa is a woman: désolée.', key: 'désolé / désolée' },
        { img: 'bureau', t: 34.4, q: '« Je m\'appelle Léa. Mon nom de famille, c\'est Morel. » Morel, c\'est…', a: 'son nom de famille', opts: ['son nom de famille', 'son prénom', 'sa ville', 'son bureau'], why: 'Léa is her prénom (first name). Morel is her nom de famille (surname).', key: 'nom de famille' },
        { t: 38.9, q: 'Léa écrit à une nouvelle collègue : « … de vous rencontrer ! » Léa est une femme, donc elle écrit :', a: 'Enchantée', opts: ['Enchantée', 'Enchanté', 'Enchantés', 'Enchanter'], why: 'A woman writes enchantée (with an extra e), a man enchanté. They sound the same.', key: 'enchanté / enchantée' },
        { t: 45.2, q: 'Mme Martin parle trop vite. Vous dites :', a: 'Parlez plus lentement, s\'il vous plaît.', opts: ['Parlez plus lentement, s\'il vous plaît.', 'Parlez plus vite, s\'il vous plaît.', 'Parle plus lentement, s\'il te plaît.', 'Je parle lentement.'], why: 'Lentement = slowly, and vous with a person at work.', wrong: { 'Parle plus lentement, s\'il te plaît.': 'Parle… s\'il te plaît is tu: for a friend, not a receptionist.', 'Parlez plus vite, s\'il vous plaît.': 'Vite = fast: the opposite!' }, key: 'parlez plus lentement, s\'il vous plaît.' },
        { t: 50.5, q: 'Vous n\'avez pas compris. Vous dites :', a: 'Pardon, je ne comprends pas.', opts: ['Pardon, je ne comprends pas.', 'Pardon, je ne prends pas.', 'Merci, je comprends.', 'Désolée, je ne parle pas.'], why: 'Je ne comprends pas = I don\'t understand.', key: 'je ne comprends pas.' },
        { t: 60.6, q: 'Léa dit « Merci ! » à Mme Martin. Mme Martin répond poliment :', a: 'Je vous en prie.', opts: ['Je vous en prie.', 'S\'il vous plaît.', 'Merci beaucoup.', 'Excusez-moi.'], why: 'Je vous en prie = you\'re welcome (polite, vous). With friends: de rien.', key: 'je vous en prie' },
        { img: 'soir', t: 67.1, q: 'Il est 20 h. Léa arrive au café et voit Camille :', a: 'Bonsoir, Camille !', opts: ['Bonsoir, Camille !', 'Bonjour, Camille !', 'Bonne nuit, Camille !', 'Bonne soirée, Camille !'], why: 'In the evening, when you arrive: bonsoir.', wrong: { 'Bonjour, Camille !': 'At 8 pm, bonsoir is better.', 'Bonne nuit, Camille !': 'Bonne nuit is for going to bed, not for arriving.', 'Bonne soirée, Camille !': 'Bonne soirée is what you say when you leave.' }, key: 'bonsoir' },
        { t: 67.1, q: 'Léa est en retard. À son amie, elle dit :', a: 'Excuse-moi !', opts: ['Excuse-moi !', 'Excusez-moi, madame !', 'De rien !', 'Enchantée !'], why: 'To a friend (tu): excuse-moi. To a stranger (vous): excusez-moi.', key: 'excuse-moi' },
        { t: 81.8, q: 'Léa demande son prénom à une petite fille :', a: 'Comment tu t\'appelles ?', opts: ['Comment tu t\'appelles ?', 'Comment vous appelez-vous ?', 'Comment t\'appelles-vous ?', 'Tu t\'appelles comment, madame ?'], why: 'Tu to a child: Comment tu t\'appelles ?', wrong: { 'Comment vous appelez-vous ?': 'Vous is for adults you don\'t know. To a child: tu.' }, key: 'comment tu t\'appelles ?' },
        { t: 87.7, q: 'Camille propose du sucre. Léa en veut :', a: 'Oui, s\'il te plaît.', opts: ['Oui, s\'il te plaît.', 'Oui, s\'il vous plaît, madame.', 'Non, merci.', 'De rien.'], why: 'Camille is a friend (tu): s\'il te plaît.', key: 's\'il te plaît' },
        { t: 93.7, q: 'On dit « Bonne nuit » quand…', a: 'quelqu\'un va se coucher', opts: ['quelqu\'un va se coucher', 'on arrive le soir', 'on part le matin', 'on rencontre quelqu\'un'], why: 'Bonne nuit = good night, before bed. Arriving in the evening: bonsoir.', key: 'bonne nuit' },
    ],
},
// ---------------- 24 Money & Banking ----------------
24: {
    name: 'Money video', next: 'Watch the money video', dir: 'media/argent/', file: 'argent.mp4',
    credit: 'People: DiceBear toon-head (CC BY 4.0, Johan Melin) · pictures: Microsoft Fluent Emoji (MIT) · voice: Piper',
    chapters: [['Au café', 0], ['À la banque', 34.1], ['Au bureau de change', 68.2], ['Le soir avec Camille', 94.7]],
    rules: [
        '<b>un billet</b> (paper: 5 €, 10 €…) · <b>une pièce</b> (a coin) · 1 € = 100 <b>centimes</b>.',
        '<b>Gardez la monnaie</b> = keep the change: it becomes <b>le pourboire</b> (the tip). In France the service is usually <b>compris</b>.',
        '<b>retirer</b> (take out) ≠ <b>déposer</b> (pay in) · <b>virer</b> / <b>un virement</b> = send money to another account.',
        '<b>prêter</b> = lend (you give) ≠ <b>emprunter</b> = borrow (you receive). <i>Je te dois 20 €</i> = I owe you 20 €.',
        '<b>dépenser</b> = spend ≠ <b>économiser</b> = save · <b>gratuit</b> = free.',
    ],
    questions: [
        { img: 'cafe', t: 6.6, q: 'Vous voulez payer par carte. Vous demandez :', a: 'Vous acceptez les cartes ?', opts: ['Vous acceptez les cartes ?', 'Vous avez une carte ?', 'Je peux carte ?', 'Vous prenez la carte du menu ?'], why: 'Accepter = to accept, to take.', wrong: { 'Vous prenez la carte du menu ?': 'La carte is also the menu: that is not what you mean here.' }, key: 'vous acceptez les cartes ?' },
        { t: 8.7, q: 'Vous posez la carte sur la machine, sans taper le code : c\'est…', a: 'sans contact', opts: ['sans contact', 'sans frais', 'gratuit', 'la monnaie'], why: 'Payer sans contact = contactless.', key: 'sans contact' },
        { t: 12.4, q: 'La machine dit « REFUSÉE ». Vous dites :', a: 'Ma carte ne marche pas.', opts: ['Ma carte ne marche pas.', 'Ma carte ne court pas.', 'Ma carte est gratuite.', 'Ma carte ne parle pas.'], why: 'Marcher = to walk, and also to work (a machine, a card).', key: 'ma carte ne marche pas.' },
        { t: 17.9, q: '50 centimes, en métal, c\'est…', a: 'une pièce', opts: ['une pièce', 'un billet', 'une carte', 'un chèque'], why: 'Une pièce = a coin. Un billet = a note.', key: 'pièce' },
        { t: 21.5, q: 'Vous voulez savoir si le service est dans le prix :', a: 'Le service est compris ?', opts: ['Le service est compris ?', 'Le service est complet ?', 'Le service est gratuit ?', 'Le service est fini ?'], why: 'Compris = included.', key: 'service est compris ?' },
        { t: 23.3, q: 'La taxe dans le prix des achats, c\'est…', a: 'la TVA', opts: ['la TVA', 'le pourboire', 'les frais', 'le solde'], why: 'La TVA = VAT. TTC (toutes taxes comprises) = with VAT.', key: 'tva' },
        { t: 26.6, q: 'Vous laissez les 50 centimes à la serveuse :', a: 'Gardez la monnaie.', opts: ['Gardez la monnaie.', 'Rendez-moi la monnaie.', 'Je garde la monnaie.', 'Donnez-moi la monnaie.'], why: 'Gardez la monnaie = keep the change.', key: 'gardez la monnaie.' },
        { t: 26.6, q: 'L\'argent qu\'on laisse en plus à la serveuse, c\'est…', a: 'le pourboire', opts: ['le pourboire', 'la TVA', 'le prêt', 'le tarif'], why: 'Le pourboire = the tip ("pour boire": for a drink).', key: 'pourboire' },
        { img: 'banque', t: 36.3, q: 'Vous cherchez la machine à billets :', a: 'Où est le distributeur ?', opts: ['Où est le distributeur ?', 'Où est le guichet ?', 'Où est le solde ?', 'Où est le bureau de change ?'], why: 'Le distributeur (de billets) = the cash machine.', key: 'où est le distributeur ?' },
        { t: 36.3, q: 'Au distributeur, vous prenez de l\'argent. Vous…', a: 'retirez de l\'argent', opts: ['retirez de l\'argent', 'déposez de l\'argent', 'prêtez de l\'argent', 'virez de l\'argent'], why: 'Retirer = take out. Déposer = pay in.', key: 'retirer' },
        { t: 41.3, q: 'L\'argent que vous avez sur votre compte, c\'est…', a: 'le solde', opts: ['le solde', 'le code', 'le tarif', 'les frais'], why: 'Le solde = the balance. (Les soldes, plural, are the sales!)', key: 'solde' },
        { t: 50.1, q: 'Léa envoie 100 € de son compte au compte de Camille : c\'est…', a: 'un virement', opts: ['un virement', 'un prêt', 'un pourboire', 'un distributeur'], why: 'Un virement = a bank transfer. Virer = to transfer.', key: 'virement' },
        { t: 58.7, q: 'Vous mettez un chèque sur votre compte. Vous le…', a: 'déposez', opts: ['déposez', 'retirez', 'empruntez', 'dépensez'], why: 'Déposer = to pay in.', key: 'déposer' },
        { t: 61.9, q: 'La banque vous donne de l\'argent pour un appartement, et vous le rendez plus tard : c\'est…', a: 'un prêt', opts: ['un prêt', 'un virement', 'un solde', 'un pourboire'], why: 'Un prêt = a loan.', key: 'prêt' },
        { img: 'change', t: 78.2, q: 'Vous voulez savoir combien de dollars pour un euro :', a: 'Quel est le taux de change ?', opts: ['Quel est le taux de change ?', 'Où est le bureau de change ?', 'Quel est le tarif ?', 'Le service est compris ?'], why: 'Le taux de change = the exchange rate.', key: 'quel est le taux de change ?' },
        { t: 88.4, q: 'Le musée ne coûte rien. Il est…', a: 'gratuit', opts: ['gratuit', 'cher', 'compris', 'sans contact'], why: 'Gratuit = free (no money).', key: 'gratuit' },
        { img: 'soir', t: 99.2, q: 'Léa garde son argent pour New York. Elle…', a: 'économise', opts: ['économise', 'dépense', 'emprunte', 'prête'], why: 'Économiser = to save. Dépenser = to spend.', key: 'économiser' },
        { t: 103.1, q: 'Léa donne 20 € à Camille, qui va les rendre. Léa…', a: 'prête 20 €', opts: ['prête 20 €', 'emprunte 20 €', 'doit 20 €', 'dépense 20 €'], why: 'Prêter = to lend (you give).', key: 'prêter' },
        { t: 109.2, q: 'Camille reçoit 20 € et va les rendre. Camille…', a: 'emprunte 20 €', opts: ['emprunte 20 €', 'prête 20 €', 'économise 20 €', 'dépose 20 €'], why: 'Emprunter = to borrow (you receive).', key: 'emprunter' },
        { t: 109.2, q: '« Je te dois 20 € » veut dire :', a: 'Je vais te rendre 20 €.', opts: ['Je vais te rendre 20 €.', 'Tu vas me rendre 20 €.', 'J\'ai 20 € sur mon compte.', '20 €, c\'est gratuit.'], why: 'Devoir (de l\'argent) = to owe.', key: 'devoir' },
    ],
},
// ---------------- 23 Hotel & Accommodation ----------------
23: {
    name: 'Hotel video', next: 'Watch the hotel video', dir: 'media/hotel/', file: 'hotel.mp4',
    credit: 'People: DiceBear toon-head (CC BY 4.0, Johan Melin) · pictures: Microsoft Fluent Emoji (MIT) · voice: Piper',
    chapters: [["À l'hôtel", 0], ["À la chambre d'hôte", 33.3], ['Dans la chambre', 81.4]],
    rules: [
        '<b>Vous avez une chambre libre ?</b> when you have not booked · <b>J\'ai réservé une chambre au nom de…</b> when you have.',
        '<b>complet</b> = full: no room left.',
        '<b>une chambre simple</b> (one person) · <b>double</b> (one big bed) · <b>des lits jumeaux</b> (two beds).',
        '<b>compris</b> = included in the price · <b>la demi-pension</b> = breakfast + dinner.',
        '<b>la caution</b> = a deposit you get back when you leave (<b>le départ</b>).',
        '<b>en plus</b> = extra: <i>une serviette en plus, un oreiller en plus</i>.',
    ],
    questions: [
        { img: 'hotel', t: 1.9, q: 'Vous avez réservé. À la réception, vous dites :', a: 'J\'ai réservé une chambre au nom de Durand.', opts: ['J\'ai réservé une chambre au nom de Durand.', 'Je voudrais réserver Durand.', 'Vous avez une chambre libre ?', 'Ma chambre s\'appelle Durand.'], why: 'Au nom de… = in the name of…', wrong: { 'Vous avez une chambre libre ?': 'You ask that when you have NOT booked.' }, key: 'j\'ai réservé une chambre au nom de…' },
        { t: 6.1, q: 'Deux lits séparés dans une chambre, ce sont…', a: 'des lits jumeaux', opts: ['des lits jumeaux', 'un lit double', 'une chambre simple', 'des draps'], why: 'Jumeaux = twins: two beds the same.', key: 'lits jumeaux' },
        { t: 13.3, q: 'Vous n\'avez pas réservé. Vous demandez :', a: 'Vous avez une chambre libre ?', opts: ['Vous avez une chambre libre ?', 'Vous avez une chambre complète ?', 'Vous êtes libre ?', 'J\'ai réservé une chambre ?'], why: 'Libre = free, available.', key: 'vous avez une chambre libre ?' },
        { t: 16.8, q: '« L\'hôtel est complet. » Ça veut dire :', a: 'Il n\'y a plus de chambre.', opts: ['Il n\'y a plus de chambre.', 'L\'hôtel est très bien.', 'Le petit-déjeuner est compris.', 'Il y a beaucoup de chambres.'], why: 'Complet = full.', key: 'complet' },
        { t: 20.4, q: 'Un logement pas cher pour les jeunes, avec des dortoirs :', a: 'une auberge de jeunesse', opts: ['une auberge de jeunesse', 'une chambre d\'hôte', 'un hôtel ★★★★★', 'une demi-pension'], why: 'Une auberge de jeunesse = a youth hostel. Une chambre d\'hôte = a room in someone\'s home (a B&B).', key: 'auberge de jeunesse' },
        { img: 'accueil', t: 35.7, q: 'Vous restez du vendredi soir au dimanche matin :', a: 'Je voudrais une chambre pour deux nuits.', opts: ['Je voudrais une chambre pour deux nuits.', 'Je voudrais deux chambres pour une nuit.', 'Je voudrais une nuit pour deux chambres.', 'Je voudrais une chambre de deux jours.'], why: 'Hotels count nights: deux nuits.', key: 'je voudrais une chambre pour deux nuits.' },
        { t: 40, q: 'Une chambre pour une personne, c\'est…', a: 'une chambre simple', opts: ['une chambre simple', 'une chambre double', 'des lits jumeaux', 'une demi-pension'], why: 'Simple = for one. Double = one big bed for two.', key: 'chambre simple / double' },
        { t: 44.3, q: 'Vous voulez voir la mer de la fenêtre :', a: 'Une chambre avec vue sur la mer.', opts: ['Une chambre avec vue sur la mer.', 'Une chambre sur la mer.', 'Une chambre avec mer.', 'Une chambre à la mer.'], why: 'Avec vue sur… = with a view of…', key: 'chambre avec vue sur la mer' },
        { t: 49, q: 'Une nuit coûte 70 €. 70 €, c\'est…', a: 'le prix par nuit', opts: ['le prix par nuit', 'la caution', 'la demi-pension', 'le départ'], why: 'Le prix par nuit = the price per night.', key: 'prix par nuit' },
        { t: 54.8, q: '« Le petit-déjeuner est compris » :', a: 'Il est dans le prix de la chambre.', opts: ['Il est dans le prix de la chambre.', 'Il faut le payer en plus.', 'Il n\'y a pas de petit-déjeuner.', 'Il est à huit heures.'], why: 'Compris = included.', key: 'petit-déjeuner compris' },
        { t: 56.8, q: 'La demi-pension, c\'est…', a: 'la chambre, le petit-déjeuner et le dîner', opts: ['la chambre, le petit-déjeuner et le dîner', 'la moitié de la chambre', 'seulement le petit-déjeuner', 'la chambre sans petit-déjeuner'], why: 'Demi-pension = half board: breakfast and one more meal.', key: 'demi-pension' },
        { t: 62.5, q: 'Vous voulez savoir quand manger le matin :', a: 'À quelle heure est le petit-déjeuner ?', opts: ['À quelle heure est le petit-déjeuner ?', 'Quelle heure est le petit-déjeuner ?', 'À quelle heure est le dîner ?', 'Le petit-déjeuner est compris ?'], why: 'À quelle heure… ? = at what time…?', key: 'à quelle heure est le petit-déjeuner ?' },
        { t: 66, q: 'La caution, c\'est…', a: 'de l\'argent qu\'on vous rend au départ', opts: ['de l\'argent qu\'on vous rend au départ', 'le prix du petit-déjeuner', 'la clé de la chambre', 'le code du wifi'], why: 'Une caution = a deposit: you get it back when you leave.', key: 'caution' },
        { img: 'chambre', t: 86.5, q: 'En été, il fait trop chaud. Vous allumez…', a: 'la climatisation', opts: ['la climatisation', 'le chauffage', 'le sèche-cheveux', 'la couverture'], why: 'La climatisation (la clim) makes the room cold.', key: 'climatisation' },
        { t: 92, q: 'En hiver, il fait froid. Vous allumez…', a: 'le chauffage', opts: ['le chauffage', 'la climatisation', 'le wifi', 'l\'oreiller'], why: 'Le chauffage = the heating (chaud = hot).', key: 'chauffage' },
        { t: 99.4, q: 'Il vous faut une autre serviette :', a: 'Je voudrais une serviette en plus.', opts: ['Je voudrais une serviette en plus.', 'Je voudrais une plus serviette.', 'Je voudrais une serviette de moins.', 'Je voudrais une serviette compris.'], why: 'En plus = extra, one more.', key: 'serviette en plus' },
        { t: 99.4, q: 'Dans le lit, sous la tête :', a: 'un oreiller', opts: ['un oreiller', 'une couverture', 'des draps', 'une serviette'], why: 'Un oreiller = a pillow (oreille = ear!).', key: 'oreiller' },
        { t: 105.7, q: 'La nuit, il fait froid. Sur le lit, vous mettez…', a: 'une couverture', opts: ['une couverture', 'un oreiller', 'un sèche-cheveux', 'une serviette'], why: 'Une couverture = a blanket (it covers you).', key: 'couverture' },
        { t: 113.8, q: 'Sur le lit, sous la couverture, il y a…', a: 'des draps', opts: ['des draps', 'des serviettes', 'des oreillers', 'des cautions'], why: 'Les draps = the sheets.', key: 'draps' },
    ],
},
// ---------------- 22 Transport & Travel ----------------
22: {
    name: 'Transport video', next: 'Watch the transport video', dir: 'media/transport/', file: 'transport.mp4',
    credit: 'People: DiceBear toon-head (CC BY 4.0, Johan Melin) · pictures: Microsoft Fluent Emoji (MIT) · voice: Piper',
    chapters: [['À la gare', 0], ['Dans le train', 35.1], ["À l'aéroport", 77.9], ['Sur la route', 108.5]],
    rules: [
        '<b>en</b> train, en avion, en voiture, en bus (you are inside) · <b>à</b> vélo, à pied, à moto (you are on it).',
        '<b>un aller simple</b> = one way · <b>un aller-retour</b> = a return ticket.',
        '<b>la voie</b> = the platform (the track) your train leaves from: <i>voie 3</i>.',
        '<b>monter</b> dans le train = get on · <b>descendre</b> du train = get off · <b>le terminus</b> = the last stop.',
        '<b>une location</b> de voiture = a car <i>hire</i> (not a "location").',
        '<b>composter</b> = punch a paper ticket in the yellow machine before you get on.',
    ],
    questions: [
        { img: 'gare', t: 2.5, q: 'Au guichet, vous voulez aller à Lyon :', a: 'Un billet pour Lyon, s\'il vous plaît.', opts: ['Un billet pour Lyon, s\'il vous plaît.', 'Un billet de Lyon, s\'il vous plaît.', 'Je voudrais Lyon.', 'Un ticket à Lyon, merci.'], why: 'Un billet pour + the place you go to.', wrong: { 'Un billet de Lyon, s\'il vous plaît.': 'De Lyon = from Lyon. You want to go to Lyon: pour Lyon.' }, key: 'billet pour lyon, s\'il vous plaît.' },
        { t: 6.3, q: 'Léa part en train mais elle rentre en avion. Elle prend…', a: 'un aller simple', opts: ['un aller simple', 'un aller-retour', 'une correspondance', 'un terminus'], why: 'Aller simple = one way. Aller-retour = there and back.', key: 'aller simple' },
        { t: 6.3, q: 'Paris → Lyon → Paris, en train, c\'est…', a: 'un aller-retour', opts: ['un aller-retour', 'un aller simple', 'un direct', 'un départ'], why: 'Aller (go) + retour (return): a return ticket.', key: 'aller-retour' },
        { t: 15, q: 'Vous voulez être sûr d\'avoir une place assise :', a: 'Je voudrais réserver une place.', opts: ['Je voudrais réserver une place.', 'Je voudrais louer une place.', 'Je voudrais composter une place.', 'Je voudrais une plage.'], why: 'Réserver = to book. Une place = a seat. (Une plage is a beach!)', key: 'réserver' },
        { t: 22.7, q: 'Vous voulez savoir l\'heure du train :', a: 'À quelle heure part le prochain train ?', opts: ['À quelle heure part le prochain train ?', 'De quelle voie part le train ?', 'Quelle heure est-il, le train ?', 'Quand le train est-il parti ?'], why: 'À quelle heure part… ? = What time does … leave?', wrong: { 'De quelle voie part le train ?': 'That asks for the platform, not the time.' }, key: 'à quelle heure part le prochain train ?' },
        { t: 30.5, q: '« Voie 3 », c\'est…', a: 'là où part le train', opts: ['là où part le train', 'le numéro de la place', 'l\'heure du départ', 'la classe du billet'], why: 'La voie = the track, the platform the train leaves from.', key: 'voie' },
        { img: 'train', t: 38.2, q: '« Le train a du retard. » Ça veut dire :', a: 'Le train part plus tard.', opts: ['Le train part plus tard.', 'Le train est annulé.', 'Le train part en avance.', 'Le train est direct.'], why: 'Avoir du retard = to be late. Annulé = cancelled: no train at all.', key: 'train a du retard.' },
        { t: 42.6, q: 'Avant de monter, Léa met son billet dans la machine jaune. Elle…', a: 'composte son billet', opts: ['composte son billet', 'réserve son billet', 'descend du train', 'change de train'], why: 'Composter = punch (validate) a paper ticket.', key: 'composter' },
        { t: 54.2, q: 'Le train ne s\'arrête pas avant Lyon et on ne change pas. Il est…', a: 'direct', opts: ['direct', 'en retard', 'annulé', 'complet'], why: 'Direct = no change of train.', key: 'direct' },
        { t: 58.1, q: 'Le dernier arrêt du train, c\'est…', a: 'le terminus', opts: ['le terminus', 'la correspondance', 'le départ', 'la voie'], why: 'Le terminus = the end of the line: everybody gets off.', key: 'terminus' },
        { t: 67, q: 'Pour aller à Grenoble, il faut prendre un autre train à Lyon : c\'est…', a: 'une correspondance', opts: ['une correspondance', 'un terminus', 'un aller simple', 'une annulation'], why: 'Une correspondance = a connection, the next train you change to.', key: 'correspondance' },
        { img: 'aero', t: 80.2, q: 'À l\'aéroport, on donne sa valise et on reçoit sa carte d\'embarquement : c\'est…', a: 'l\'enregistrement', opts: ['l\'enregistrement', 'la douane', 'la porte d\'embarquement', 'le parking'], why: 'L\'enregistrement = check-in.', key: 'enregistrement' },
        { t: 90, q: '« Porte d\'embarquement 12 » : c\'est là où…', a: 'on monte dans l\'avion', opts: ['on monte dans l\'avion', 'on achète un billet', 'on donne sa valise', 'on paie l\'essence'], why: 'La porte d\'embarquement = the boarding gate.', key: 'porte d\'embarquement' },
        { t: 97.3, q: '« Le vol est annulé. » Ça veut dire :', a: 'L\'avion ne part pas.', opts: ['L\'avion ne part pas.', 'L\'avion est en retard.', 'L\'avion est direct.', 'L\'avion part de la porte 12.'], why: 'Annulé = cancelled: the flight does not happen.', key: 'vol est annulé.' },
        { img: 'route', t: 110.4, q: 'Léa prend une voiture pour la journée et la rend après : c\'est…', a: 'une location de voiture', opts: ['une location de voiture', 'une station-service', 'un parking', 'une autoroute'], why: 'Une location = a rental (louer = to rent). It is not a "location"!', key: 'location de voiture' },
        { t: 121.3, q: 'Pour mettre de l\'essence, on va…', a: 'à la station-service', opts: ['à la station-service', 'au parking', 'à la douane', 'à la gare'], why: 'La station-service = the petrol station.', key: 'station-service' },
        { t: 141, q: 'Léa rentre ___ voiture jusqu\'au parking, puis ___ vélo.', a: 'en … à', opts: ['en … à', 'à … en', 'en … en', 'à … à'], why: 'En voiture (inside), à vélo (on it). Same: en train, en avion, à pied.', key: 'à pied / à vélo' },
    ],
},
// ---------------- 18 Café, Food & Ordering ----------------
18: {
    name: 'Café video', next: 'Watch the café video', dir: 'media/cafe/', file: 'cafe.mp4',
    credit: 'Léa and Chloé: DiceBear toon-head (CC BY 4.0, Johan Melin) · food: Microsoft Fluent Emoji (MIT) · voice: Piper',
    chapters: [['Le petit-déjeuner', 0], ['Le déjeuner', 28.3], ['Le goûter', 69.6]],
    rules: [
        '<b>Je voudrais…</b> is the polite way to order. <i>Je veux…</i> sounds rude to a waiter.',
        '<b>Je vais prendre…</b> = I\'ll have… (when you have chosen).',
        '<b>sans</b> + noun, no article: <i>sans sucre, sans lait, sans glaçons</i>.',
        '<b>la carte</b> = the menu · <b>la formule</b> = the set menu · <b>l\'addition</b> = the bill.',
    ],
    questions: [
        { img: 'matin', t: 6, q: 'Qu\'est-ce que Léa commande ?', a: 'Un café crème et un jus d\'orange.', opts: ['Un café crème et un jus d\'orange.', 'Un thé et un croissant.', 'Un chocolat chaud et une glace.', 'Une bière et des frites.'], why: 'Je voudrais un café crème et un jus d\'orange, s\'il vous plaît.', key: 'café crème' },
        { t: 2.6, q: 'La serveuse demande : « Qu\'est-ce que je vous sers ? » Vous répondez :', a: 'Je voudrais un café, s\'il vous plaît.', opts: ['Je voudrais un café, s\'il vous plaît.', 'Je suis un café.', 'Je veux café.', 'Donne-moi un café !'], why: 'Je voudrais… is polite. Je veux… sounds rude, and « donne-moi » uses tu with a stranger.', wrong: { 'Je suis un café.': 'Je suis = I am. You are not a coffee!', 'Je veux café.': 'Je veux sounds rude, and it needs un: un café.', 'Donne-moi un café !': 'Donne-moi uses tu: too familiar with a waitress or a waiter.' }, key: 'je voudrais…' },
        { t: 13.4, q: 'Vous ne voulez pas de sucre dans votre café :', a: 'Sans sucre, s\'il vous plaît.', opts: ['Sans sucre, s\'il vous plaît.', 'Avec du sucre, s\'il vous plaît.', 'Pas sucre.', 'Moins sucre.'], why: 'Sans + noun, with no article: sans sucre.', key: 'sans…' },
        { t: 30.6, q: 'Vous arrivez au café et votre amie arrive bientôt :', a: 'Une table pour deux, s\'il vous plaît.', opts: ['Une table pour deux, s\'il vous plaît.', 'Deux tables, s\'il vous plaît.', 'Une chaise pour deux.', 'Un deux, s\'il vous plaît.'], why: 'Une table pour deux = a table for two people.', key: 'table pour deux, s\'il vous plaît.' },
        { img: 'midi', t: 41.2, q: 'La formule, c\'est…', a: 'une entrée et un plat principal', opts: ['une entrée et un plat principal', 'une boisson et un café', 'le petit-déjeuner', 'un plat et l\'addition'], why: 'Voici la carte. La formule, c\'est une entrée et un plat principal.', key: 'formule' },
        { t: 46.7, q: 'Vous ne mangez ni viande ni poisson :', a: 'Je suis végétarien.', opts: ['Je suis végétarien.', 'Je suis viande.', 'Je n\'ai pas viande.', 'Je suis légume.'], why: 'Je suis végétarien · végétarienne.', key: 'je suis végétarien / végétarienne.' },
        { t: 46.7, q: 'Vous voulez l\'avis de la serveuse :', a: 'Qu\'est-ce que vous me conseillez ?', opts: ['Qu\'est-ce que vous me conseillez ?', 'Qu\'est-ce que vous me commandez ?', 'Où est le conseil ?', 'Vous conseillez quoi, toi ?'], why: 'Conseiller = to recommend. Qu\'est-ce que vous me conseillez ? = What do you recommend?', key: 'qu\'est-ce que vous me conseillez ?' },
        { t: 54.5, q: 'L\'eau avec des bulles, c\'est…', a: 'de l\'eau gazeuse', opts: ['de l\'eau gazeuse', 'de l\'eau plate', 'du lait', 'du jus d\'orange'], why: 'Gazeuse = with bubbles. Plate = still.', key: 'de l\'eau plate / gazeuse' },
        { img: 'gouter', t: 76.4, q: 'Léa mange sa glace…', a: 'sur place', opts: ['sur place', 'à emporter', 'à la maison', 'dans le bus'], why: 'Sur place = here, at the café. À emporter = to take away.', key: 'sur place / à emporter' },
        { t: 90, q: 'Le repas est fini. Vous voulez payer :', a: 'L\'addition, s\'il vous plaît.', opts: ['L\'addition, s\'il vous plaît.', 'La carte, s\'il vous plaît.', 'Le prix, s\'il vous plaît.', 'La note de musique, merci.'], why: 'In a café or a restaurant you ask for l\'addition.', wrong: { 'La carte, s\'il vous plaît.': 'La carte is the menu: you ask for it before you order.' }, key: 'addition, s\'il vous plaît.' },
        { t: 90, q: 'Le repas était très bon :', a: 'C\'était délicieux !', opts: ['C\'était délicieux !', 'J\'étais délicieux !', 'C\'est délicieux hier.', 'C\'était délicat.'], why: 'C\'était délicieux = it was delicious (the meal, not you).', wrong: { 'J\'étais délicieux !': 'J\'étais = I was. You were not delicious!', 'C\'était délicat.': 'Délicat = delicate, tricky. Not the same.' }, key: 'c\'était délicieux.' },
    ],
},
};

const CSS = `
.vp{display:grid;gap:14px;max-width:820px}
.vp-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.vp-btn{font-weight:700;font-size:15px;border:1px solid #e2e8f0;background:#fff;color:#0f172a;border-radius:12px;padding:8px 14px;min-height:44px;cursor:pointer}
.vp-btn.pri{background:#4f46e5;border-color:#4f46e5;color:#fff}
.vp-btn[aria-pressed="true"]{background:#eef2ff;border-color:#6366f1;color:#3730a3}
.vp-btn:focus-visible,.vp-opt:focus-visible,.vp-ch:focus-visible{outline:3px solid #6366f1;outline-offset:2px}
.vp-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:14px;display:grid;gap:10px}
.vp-card[hidden]{display:none}
.vp-video{width:100%;aspect-ratio:16/9;border-radius:12px;background:#3E2723;display:block}
.vp-chs{display:flex;flex-wrap:wrap;gap:6px}
.vp-ch{border:1px solid #e2e8f0;background:#f8fafc;border-radius:999px;padding:6px 12px;min-height:36px;font-size:14px;color:#334155;cursor:pointer}
.vp-small{font-size:13px;color:#64748b}
.vp-rules{display:grid;gap:6px;font-size:15px;color:#1e293b}
.vp-rules div{background:#f8fafc;border-radius:10px;padding:8px 10px}
.vp-img{width:100%;aspect-ratio:16/9;border-radius:12px;display:block;object-fit:cover;background:#e2e8f0}
.vp-q{font-size:1.25rem;font-weight:900;color:#0f172a}
.vp-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
@media (max-width:560px){.vp-opts{grid-template-columns:1fr}}
.vp-opt{text-align:left;font-size:17px;font-weight:600;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:10px 14px;min-height:50px;cursor:pointer;color:#0f172a}
.vp-opt.ok{background:#ecfdf5;border-color:#059669}.vp-opt.no{background:#fff1f2;border-color:#e11d48}
.vp-note{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:10px 12px;font-size:15px;color:#1e293b;line-height:1.5}
.vp-fb{font-weight:800;margin:0}.vp-fb.ok{color:#047857}.vp-fb.no{color:#be123c}`;
function css() { if (!document.getElementById('vp-css')) { const s = document.createElement('style'); s.id = 'vp-css'; s.textContent = CSS; document.head.appendChild(s); } }

function mount(P, root, { say, grade, words }) {
    css();
    root.innerHTML = `<div class="vp">
      <div class="vp-row" role="group" aria-label="Mode"><button type="button" class="vp-btn" data-mode="watch" aria-pressed="true">Watch</button><button type="button" class="vp-btn" data-mode="check" aria-pressed="false">Check yourself</button></div>
      <div class="vp-card" id="vp-watch">
        <video class="vp-video" controls playsinline preload="metadata" poster="${P.dir}poster.jpg" src="${P.dir}${P.file}"></video>
        <div class="vp-chs">${P.chapters.map(([n, t]) => `<button type="button" class="vp-ch" data-t="${t}">${esc(n)}</button>`).join('')}</div>
        <p class="vp-small">Watch once with the English, then once reading only the French. The words of this topic are in yellow.</p>
        <div class="vp-rules">${P.rules.map(r => `<div>${r}</div>`).join('')}</div>
        ${P.credit ? `<p class="vp-small">${esc(P.credit)}</p>` : ''}
      </div>
      <div class="vp-card" id="vp-check" hidden aria-live="polite"></div></div>`;
    const $ = (s) => root.querySelector(s), video = $('video'), watch = $('#vp-watch'), check = $('#vp-check');
    let quiz = null;
    const setMode = (m) => {
        root.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m));
        watch.hidden = m !== 'watch'; check.hidden = m !== 'check';
        if (m === 'check') { video.pause(); if (!quiz) start(); }
    };
    root.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    root.querySelectorAll('.vp-ch').forEach(b => b.addEventListener('click', () => { video.currentTime = Number(b.dataset.t); video.play().catch(() => {}); }));
    const wordFor = (key) => key && (words || []).find(w => plain(w.fr) === plain(key) || plain(w.key || '') === plain(key));
    const mark = (key, ok) => { const w = wordFor(key); if (w && grade) grade(w, ok); };
    function start() { quiz = { order: shuffle(P.questions), i: 0, score: 0 }; ask(); }
    function ask() {
        if (quiz.i >= quiz.order.length) {
            check.innerHTML = `<div class="vp-q">${quiz.score} / ${quiz.order.length} right first time</div><p class="vp-small">The ones you missed come back in Practise and Test.</p><div class="vp-row"><button type="button" class="vp-btn pri" id="vp-again">Again</button></div>`;
            check.querySelector('#vp-again').addEventListener('click', start); return;
        }
        const it = quiz.order[quiz.i], opts = shuffle(it.opts);
        let tries = 0, over = false;
        check.innerHTML = `<p class="vp-small">${quiz.i + 1} / ${quiz.order.length}</p>${it.img ? `<img class="vp-img" src="${P.dir}${it.img}.jpg" alt="A scene from the video">` : ''}
          <div class="vp-q">${esc(it.q)}</div><div class="vp-opts">${opts.map((o, i) => `<button type="button" class="vp-opt" data-i="${i}">${esc(o)}</button>`).join('')}</div><p class="vp-fb" id="vp-fb"></p><div id="vp-after"></div>`;
        check.querySelectorAll('.vp-opt').forEach(b => b.addEventListener('click', () => {
            if (over) return;
            const pick = opts[Number(b.dataset.i)], fb = check.querySelector('#vp-fb');
            if (pick !== it.a) {
                if (!tries) mark(it.key, false);
                tries++; b.classList.add('no'); b.disabled = true; fb.className = 'vp-fb no';
                fb.textContent = (it.wrong && it.wrong[pick]) || 'Not that one. Try again.'; return;
            }
            over = true; b.classList.add('ok');
            if (!tries) { quiz.score++; mark(it.key, true); }
            say(it.a);
            fb.className = 'vp-fb ok'; fb.textContent = tries ? 'Yes, that one.' : 'Right first time!';
            check.querySelector('#vp-after').innerHTML = `<div class="vp-note">${esc(it.why)}</div><div class="vp-row" style="margin-top:10px"><button type="button" class="vp-btn pri" id="vp-next">Next →</button>${it.t !== undefined ? '<button type="button" class="vp-btn" id="vp-see">▶ See it in the video</button>' : ''}</div>`;
            check.querySelector('#vp-next').addEventListener('click', () => { quiz.i++; ask(); });
            const see = check.querySelector('#vp-see');
            if (see) see.addEventListener('click', () => { setMode('watch'); video.currentTime = Math.max(0, it.t - 1); video.play().catch(() => {}); });
        }));
    }
}

window.VideoPages = PAGES;
window.VocabTools = window.VocabTools || {};
for (const [id, P] of Object.entries(PAGES)) window.VocabTools[id] = { name: P.name, next: P.next, mount: (el, opts) => mount(P, el, opts) };
})();
