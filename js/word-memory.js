// word-memory.js - free memory aids for Vocab (no AI, no network).
//   WordMemory.picture(word)  -> an emoji for words you can picture, or ''
//   WordMemory.tips(word)     -> [{ kind, text }]: false friends, look-alikes, gender by ending
// A word is { key, en, gender, pos } as built in vocab.html.
(function () {
// Pictures: word key -> emoji. "n:", "v:" or "a:" in front means only for that kind of word
// (son = sound, not son = his).
const PICS = {"abeille":"🐝","accident":"💥","acheter":"🛍️","acteur":"🎭","acteur / actrice":"🎭","addition":"🧾","ado":"🧑","adolescent":"🧑","adresse":"🏠","adulte":"🧑","afrique":"🌍","agenda":"📔","agneau":"🐑","agriculteur":"🧑‍🌾","agriculteur / agricultrice":"🧑‍🌾","agriculture":"🚜","aide":"🆘","aigle":"🦅","aiguille":"🪡","ail":"🧄","aile":"🪽","alcool":"🍷","aller-retour":"🎫","allergie":"🤧","allumette":"🔥","amande":"🌰","ambulance":"🚑","amende":"🎫","ami":"🧑‍🤝‍🧑","amie":"🧑‍🤝‍🧑","amitié":"🤝","amour":"❤️","amoureux":"😍","amoureux / amoureuse":"😍","ampoule":"💡","amérique":"🌎","an":"📅","ananas":"🍍","ancêtre":"👴","animal":"🐾","animal de compagnie":"🐕","anniversaire":"🎂","année":"📅","août":"🌻","appareil":"📱","appareil photo":"📷","appartement":"🏢","appel":"📞","appeler":"📞","application":"📱","apprendre":"📚","après-midi":"🌤️","apéritif":"🥂","arachide":"🥜","araignée":"🕷️","arbitre":"🧑‍⚖️","arbre":"🌳","arc-en-ciel":"🌈","architecte":"📐","argent":"💰","argenté / argentée":"🥈","arme":"⚔️","armoire":"🚪","arrivée":"🛬","arroser":"🚿","arrêt":"🛑","art":"🎨","artiste":"🧑‍🎨","ascenseur":"🛗","asie":"🌏","aspirateur":"🧹","assiette":"🍽️","assurance":"🛡️","astronaute":"🧑‍🚀","atelier":"🛠️","athlète":"🏃","attendre":"⏳","atterrissage":"🛬","aube":"🌅","auberge":"🏨","aubergine":"🍆","aujourd'hui":"📅","auteur":"✍️","autobus":"🚌","autocar":"🚌","automne":"🍂","autoroute":"🛣️","avalanche":"🏔️","avenir":"🔮","averse":"🌧️","avertissement":"⚠️","avion":"✈️","avocat":"🧑‍⚖️","avocat / avocate":"🧑‍⚖️","avocate":"🧑‍⚖️","avril":"🌷","aéroport":"🛫","bacon":"🥓","bagage":"🧳","bagnole":"🚗","bague":"💍","baguette":"🥖","baie":"🌊","baignoire":"🛁","bain":"🛁","balai":"🧹","balayer":"🧹","balcon":"🏢","baleine":"🐋","balle":"⚽","ballon":"⚽","banane":"🍌","banlieue":"🏘️","banque":"🏦","bar":"🍸","barbe":"🧔","barrage":"🌊","basket":"🏀","baskets":"👟","bateau":"⛵","batterie":"🔋","beauté":"💄","belgique":"🇧🇪","beurre":"🧈","bibliothèque":"🏛️","bicyclette":"🚲","bijou":"💍","billet":"🎫","biscuit":"🍪","bise":"💋","bière":"🍺","blanc":"⚪","blanc / blanche":"⚪","blessure":"🩹","bleu":"🔵","bleu / bleue":"🔵","bleuet":"🫐","blouson":"🧥","blé":"🌾","boire":"🥤","bois":"🪵","boisson":"🥤","bol":"🥣","bonbon":"🍬","bonheur":"😊","bonnet":"🧶","bosser":"💼","botte":"👢","bottes":"👢","bouche":"👄","boucherie":"🥩","bouchon":"🍾","boucle d'oreille":"💎","bouffer":"🍽️","bougie":"🕯️","bouillir":"♨️","bouilloire":"☕","boulanger":"🥖","boulanger / boulangère":"🥖","boulangerie":"🥖","boulot":"💼","bouquet":"💐","bourse":"🎓","boussole":"🧭","bouteille":"🍾","boutique":"🏪","bouton":"🔘","boîte":"📦","branche":"🌿","bras":"💪","brique":"🧱","briquet":"🔥","brise":"🍃","brocoli":"🥦","brosse":"🖌️","brosse à dents":"🪥","brouillard":"🌫️","bruit":"🔊","brume":"🌫️","brûler":"🔥","brûlure":"🔥","bureau":"🏢","bus":"🚌","but":"🥅","bâiller":"🥱","bâtiment":"🏢","bâtir":"🏗️","bébé":"👶","bénir":"🙏","bénévole":"🤝","béquille":"🩼","bûche":"🪵","bœuf":"🥩","cadeau":"🎁","café":"☕","cahier":"📓","caisse":"🛒","caissier":"🛒","calculatrice":"🧮","calendrier":"📅","calme":"😌","camion":"🚚","campagne":"🌄","camping":"🏕️","caméra":"📷","canada":"🇨🇦","canapé":"🛋️","canard":"🦆","canicule":"🥵","capitale":"🏙️","carburant":"⛽","carnet":"📓","carotte":"🥕","carrefour":"🚦","carte":"🗺️","carte bancaire":"💳","carte d'identité":"🪪","carte de crédit":"💳","carte postale":"💌","cartes":"🃏","carton":"📦","cascade":"💦","casquette":"🧢","casserole":"🍲","castor":"🦫","catastrophe":"💥","cathédrale":"⛪","cauchemar":"😱","cave":"🍷","ceinture":"👖","centre commercial":"🛍️","cerf":"🦌","cerf-volant":"🪁","cerise":"🍒","cerveau":"🧠","chaise":"🪑","chalet":"🏡","chaleur":"🔥","chambre":"🛏️","champ":"🌾","champignon":"🍄","champion":"🏆","chance":"🍀","chanson":"🎵","chant":"🎶","chanter":"🎤","chanteur":"🧑‍🎤","chanteur / chanteuse":"🧑‍🎤","chanteuse":"🧑‍🎤","chantier":"🏗️","chapeau":"👒","charbon":"⛏️","chargeur":"🔌","chariot":"🛒","chasser":"🏹","chat":"🐈","chaton":"🐱","chaud":"🥵","chaud / froid":"🥵","chauffage":"♨️","chauffeur":"🚗","chaussette":"🧦","chaussettes":"🧦","chaussure":"👞","chaussures":"👟","chaîne":"⛓️","chef":"🧑‍💼","chemin":"🛤️","chemise":"👔","cheval":"🐎","cheveu":"💇","cheveux":"💇","cheville":"🦶","chien":"🐕","chiffre":"🔢","chimie":"🧪","chiot":"🐶","chirurgien":"🧑‍⚕️","chocolat":"🍫","chocolat chaud":"☕","choix":"🤔","chose":"📦","chou":"🥬","chuchoter":"🤫","château":"🏰","chèque":"💸","chèvre":"🐐","chêne":"🌳","cicatrice":"🩹","cidre":"🍏","ciel":"🌌","cigarette":"🚬","cinéma":"🎦","circulation":"🚦","cirque":"🎪","ciseaux":"✂️","citron":"🍋","classe":"🧑‍🏫","clavier":"⌨️","climat":"🌡️","climatisation":"❄️","clinique":"🏥","clou":"📌","clé":"🔑","clé usb":"💾","cochon":"🐖","code postal":"📮","coiffeur":"💇","coiffure":"💇","coin":"📐","colis":"📦","colle":"🧴","collier":"📿","colline":"⛰️","collège":"🏫","collègue":"🧑‍💼","colocataire":"🧑‍🤝‍🧑","colorier":"🖍️","colère":"😠","combattre":"🥊","commande":"📦","commissariat":"🚓","compagnie":"🏢","comprimé":"💊","comptable":"🧮","compter":"🔢","compétition":"🏁","comédien":"🎭","concert":"🎵","concombre":"🥒","conducteur":"🚗","conduire":"🚗","confiture":"🍓","congélateur":"🧊","congés":"🏖️","construire":"🏗️","contagieux":"🦠","content":"😊","content / contente":"😊","continent":"🌍","contrat":"📝","contrôle":"📝","contrôleur":"🎫","conversation":"💬","copain":"🧑‍🤝‍🧑","copine":"🧑‍🤝‍🧑","coq":"🐓","coquillage":"🐚","corbeille":"🧺","corde":"🪢","corps":"🧍","costume":"🤵","coton":"🧵","cou":"🦒","couchette":"🛏️","coude":"💪","coudre":"🪡","couette":"🛏️","couleur":"🎨","coupe":"🏆","couper":"✂️","couple":"💑","courgette":"🥒","courir":"🏃","couronne":"👑","courriel":"📧","courrier":"✉️","cours":"🧑‍🏫","course":"🏁","course à pied":"🏃","cousin":"🧑","cousine":"🧑","couteau":"🔪","couverture":"🛏️","crainte":"😨","cravate":"👔","crayon":"✏️","crevette":"🦐","crier":"📢","crime":"🚔","croissant":"🥐","croix":"✝️","crème":"🍦","crépuscule":"🌇","crêpe":"🥞","cuillère":"🥄","cuir":"👞","cuire":"🧑‍🍳","cuisine":"🍳","cuisiner":"🧑‍🍳","cuisinier":"🧑‍🍳","cuisinier / cuisinière":"🧑‍🍳","cuisinière":"🍳","cv":"📄","céréales":"🥣","côte":"🏖️","cœur":"❤️","danger":"⚠️","danse":"💃","danser":"💃","danseur":"💃","danseur / danseuse":"💃","date":"📅","dauphin":"🐬","demain":"📅","demi-heure":"🕧","dent":"🦷","dentifrice":"🪥","dentiste":"🦷","dents":"🦷","dessert":"🍰","dessin":"✏️","dessiner":"✏️","destination":"📍","devoirs":"📝","diable":"😈","diagnostic":"🩺","diamant":"💎","dictionnaire":"📕","dieu":"🙏","dimanche":"📅","dinde":"🦃","diplôme":"🎓","dire":"💬","directeur / directrice":"🧑‍💼","distributeur":"🏧","docteur":"🧑‍⚕️","document":"📄","doigt":"☝️","dollar":"💵","don":"🎁","données":"📊","dormir":"😴","doré":"🥇","doré / dorée":"🥇","dossier":"📁","douane":"🛃","douche":"🚿","douleur":"🤕","douzaine":"🥚","drap":"🛏️","drapeau":"🚩","droite":"➡️","drôle":"😂","dune":"🏜️","décembre":"🎄","déchet":"🗑️","décollage":"🛫","découverte":"🔍","déguisement":"🎭","déjeuner":"🍽️","démocratie":"🗳️","déménagement":"📦","dépanneur":"🏪","départ":"🛫","désert":"🏜️","détective":"🕵️","développeur":"💻","dîner":"🍽️","eau":"💧","eau gazeuse":"🫧","embarquement":"🛫","embouteillage":"🚗","embrasser":"💋","empire":"👑","emploi":"💼","en colère":"😠","enfance":"🧒","enfant":"🧒","ennemi":"😠","enquête":"🔍","enregistrer":"🎙️","enseignant":"🧑‍🏫","enseigner":"🧑‍🏫","entendre":"👂","entraîneur":"📣","entreprise":"🏢","entretien":"🤝","entrée":"🚪","enveloppe":"✉️","environnement":"🌍","envoyer":"📤","escalader":"🧗","escalier":"🪜","espace":"🚀","espoir":"🌈","espèces":"💵","essence":"⛽","estomac":"🤢","euro":"💶","europe":"🇪🇺","examen":"📝","excursion":"🚌","exposition":"🖼️","expédier":"📤","fabrique":"🏭","facteur":"📮","facture":"🧾","faim":"😋","faire la cuisine":"🧑‍🍳","falaise":"🪨","famille":"👪","farine":"🌾","fatigué":"😴","fatigué / fatiguée":"😴","fauteuil":"🛋️","fauteuil roulant":"🦽","femme":"👩","fenêtre":"🪟","fer":"🔩","ferme":"🚜","fermer":"🔒","fermier":"🧑‍🌾","festival":"🎪","feu":"🔥","feu d'artifice":"🎆","feu rouge":"🚦","feuille":"🍃","fiancé":"💍","ficelle":"🧵","fichier":"📁","fier / fière":"😤","fil":"🧵","file d'attente":"👥","fille":"👧","film":"🎬","filmer":"🎬","fils":"👦","fin":"n:🏁","fièvre":"🤒","fleur":"🌸","fleuve":"🏞️","fonctionnaire":"🧑‍💼","fontaine":"⛲","football":"⚽","football (le foot)":"⚽","formulaire":"📝","fort":"a:💪","fort / faible":"💪","forêt":"🌲","foule":"👥","four":"♨️","fourchette":"🍴","fourmi":"🐜","fracture":"🦴","fraise":"🍓","framboise":"🍓","france":"🇫🇷","frapper":"🚪","fredonner":"🎵","frein":"🛑","fric":"💰","frigo":"🧊","fringues":"👕","frites":"🍟","froid":"🥶","fromage":"🧀","front":"🙂","frontière":"🛂","fruit":"🍎","fruits de mer":"🦐","frère":"👦","fumée":"💨","fâché":"😠","fâché / fâchée":"😠","février":"❄️","fête":"🎉","gagner":"🏆","galerie":"🖼️","galet":"🪨","gant":"🧤","gants":"🧤","garage":"🚗","gare":"🚉","garçon":"👦","gauche":"⬅️","gaufre":"🧇","gaz":"🔥","gendarme":"👮","genou":"🦵","gens":"👥","geste":"👋","girafe":"🦒","givre":"❄️","glace":"🍨","glacier":"🏔️","globe":"🌍","gomme":"🧽","gorge":"🗣️","gouvernement":"🏛️","goût":"👅","goûter":"🧁","graine":"🌱","grand-mère":"👵","grand-père":"👴","grands-parents":"👴","grenier":"🏠","grenouille":"🐸","grignoter":"🍿","grimper":"🧗","grippe":"🤧","gris":"🩶","gris / grise":"🩶","grotte":"🕳️","groupe":"👥","grève":"🪧","grêle":"🌨️","guerre":"⚔️","guichet":"🎫","guide":"🧭","guitare":"🎸","gym":"🏋️","gymnastique":"🤸","gâteau":"🎂","gérant":"🧑‍💼","haricot":"🫘","hasard":"🎲","haut-parleur":"📢","herbe":"🌱","heure":"🕐","heures supplémentaires":"⏰","heureux":"😊","heureux / heureuse":"😊","hiberner":"🐻","hier":"📅","histoire":"📜","hiver":"❄️","hockey":"🏒","homard":"🦞","homme":"👨","horaire":"🕒","horizon":"🌅","horloge":"🕰️","huile":"🫒","humour":"😂","huître":"🦪","hélicoptère":"🚁","héros":"🦸","hôpital":"🏥","hôte":"🏠","hôtel":"🏨","idée":"💡","image":"🖼️","immeuble":"🏢","imperméable":"🧥","imprimante":"🖨️","incendie":"🔥","infection":"🦠","infirmier":"🧑‍⚕️","infirmier / infirmière":"🧑‍⚕️","infirmière":"🧑‍⚕️","informaticien":"💻","infos":"📰","ingrédient":"🧂","ingénieur":"🧑‍🔧","inondation":"🌊","inquiet":"😟","inquiet / inquiète":"😟","insecte":"🐛","instruire":"🧑‍🏫","internet":"🌐","invention":"💡","invitation":"💌","invité":"🧑","jalousie":"😒","jambe":"🦵","jambon":"🍖","janvier":"⛄","jardin":"🏡","jardiner":"🧑‍🌾","jaune":"🟡","jean":"👖","jeu":"🎲","jeudi":"📅","jeune":"🧒","jeune / vieux":"🧒","joie":"😄","joue":"😊","jouer":"🎲","jouet":"🧸","joueur":"⚽","jour":"📅","journal":"📰","journaliste":"📰","journée":"📅","joyeux":"😊","juge":"🧑‍⚖️","juillet":"🏖️","juin":"☀️","jumeau":"👯","jumelle":"👯","jupe":"👗","jus":"🧃","justice":"⚖️","kilo":"⚖️","kilomètre":"📏","kiwi":"🥝","laboratoire":"🧪","lac":"🏞️","laine":"🧶","lait":"🥛","laitue":"🥬","lampe":"💡","langage":"🗣️","langue":"🗣️","lanterne":"🏮","lapin":"🐇","lard":"🥓","larme":"💧","larmes":"😢","lavabo":"🚰","lave-vaisselle":"🍽️","laver":"🧼","lecteur":"📖","lecture":"📖","lent":"🐌","lettre":"✉️","levure":"🍞","leçon":"📚","liberté":"🕊️","librairie":"📚","lien":"🔗","ligne":"📏","linge":"🧺","lion":"🦁","lire":"📖","liste":"📋","lit":"🛏️","litre":"🧴","livraison":"🚚","livre":"📖","logiciel":"💻","loi":"⚖️","loisir":"🎨","loup":"🐺","loupe":"🔍","loyer":"🏠","luciole":"✨","luge":"🛷","lumière":"💡","lundi":"📅","lune":"🌙","lunettes":"👓","lunettes de soleil":"🕶️","lutter":"🥊","lycée":"🏫","lèvre":"👄","légume":"🥦","machine":"⚙️","madame":"👩","magasin":"🏪","magazine":"📰","mai":"🌸","mail":"📧","mail / l'e-mail":"📧","maillot de bain":"🩱","main":"✋","mairie":"🏛️","maison":"🏠","malade":"🤒","maladie":"🤒","maman":"👩","manger":"🍽️","mangue":"🥭","manifestation":"🪧","manteau":"🧥","maquillage":"💄","marche":"🚶","marcher":"🚶","marché":"🧺","mardi":"📅","mari":"🤵","mariage":"💒","marron":"🟤","mars":"🌱","marteau":"🔨","marée":"🌊","masque":"😷","match":"🏟️","matelas":"🛏️","mathématiques":"➗","matin":"🌅","maïs":"🌽","melon":"🍈","mensonge":"🤥","menton":"🙂","menu":"📋","mer":"🌊","mercredi":"📅","message":"💬","messe":"⛪","micro":"🎤","micro-ondes":"📻","midi":"🕛","miel":"🍯","militaire":"💂","milliard":"💰","million":"💰","minuit":"🕛","minute":"⏱️","miroir":"🪞","mise à jour":"🔄","mode":"👗","mois":"📅","moitié":"½","monde":"🌍","monnaie":"🪙","monsieur":"👨","montagne":"⛰️","montre":"⌚","monument":"🗽","morceau":"🧩","mort":"💀","mosquée":"🕌","mot":"💬","mot de passe":"🔑","moteur":"⚙️","moto":"🏍️","mouche":"🪰","mouette":"🐦","mouillé":"💧","mourir":"💀","moustache":"🥸","moustique":"🦟","moutarde":"🌭","mouton":"🐑","mur":"🧱","muscle":"💪","musculation":"🏋️","musicien":"🎻","musicien / musicienne":"🎻","musique":"🎵","musée":"🏛️","mère":"👩","mètre":"📏","mécanicien":"🧑‍🔧","mécanicien / mécanicienne":"🧑‍🔧","médaille":"🏅","médecin":"🧑‍⚕️","médecine":"💊","médicament":"💊","ménage":"🧹","métal":"🔩","métro":"🚇","météo":"🌦️","nager":"🏊","naissance":"👶","nana":"👧","natation":"🏊","nature":"🌳","naviguer":"⛵","navire":"🚢","neige":"❄️","neiger":"❄️","nettoyer":"🧽","neveu":"👦","nez":"👃","nid":"🪺","nièce":"👧","noir":"a:⚫","noir / noire":"⚫","noix":"🌰","nombre":"🔢","nord":"⬆️","notification":"🔔","nourriture":"🍽️","nouvelles":"📰","novembre":"🍂","noël":"🎄","nuage":"☁️","nuit":"🌙","numéro":"🔢","objet":"📦","octobre":"🎃","océan":"🌊","odeur":"👃","oignon":"🧅","oiseau":"🐦","olive":"🫒","ombre":"🌳","omelette":"🍳","oncle":"👨","ongle":"💅","opération":"🏥","or":"n:🥇","orage":"⛈️","orange":"🍊","orchestre":"🎻","ordinateur":"💻","ordinateur portable":"💻","ordonnance":"📝","oreille":"👂","oreiller":"🛏️","orignal":"🫎","orteil":"🦶","os":"🦴","ouest":"⬅️","ouragan":"🌀","ours":"🐻","outil":"🔧","ouvrier":"👷","ouvrir":"🔓","page":"📄","paiement":"💳","pain":"🍞","paix":"🕊️","palais":"🏰","panier":"🧺","panne":"🔧","panneau":"🪧","pansement":"🩹","pantalon":"👖","papa":"👨","papier":"📄","papier toilette":"🧻","papillon":"🦋","paquet":"📦","parapluie":"☂️","parc":"🏞️","parent":"👪","parents":"👪","parfum":"🌸","parking":"🅿️","parlement":"🏛️","parler":"🗣️","parole":"💬","parti":"🗳️","passager":"💺","passeport":"🛂","passé":"📜","pastèque":"🍉","patient":"n:🤒","patienter":"⏳","patin":"⛸️","patiner":"⛸️","patron":"🧑‍💼","patron / la patronne":"🧑‍💼","patronne":"🧑‍💼","patte":"🐾","payer":"💳","pays":"🗺️","paysage":"🏞️","paysan":"🧑‍🌾","peau":"🖐️","peigne":"🪮","peindre":"🎨","peintre":"🧑‍🎨","peinture":"🖼️","pelouse":"🌱","penser":"🤔","pensée":"💭","pente":"⛷️","permis":"🪪","personne":"n:🧑","petit ami":"💑","petit pois":"🫛","petit-déjeuner":"🍳","petit-fils":"👦","petite amie":"💑","petite-fille":"👧","petits-enfants":"👧","peuple":"👥","peur":"😨","pharmacie":"💊","pharmacien":"💊","photo":"📸","photographe":"📸","photographier":"📸","physique":"n:⚛️","piano":"🎹","pied":"🦶","pierre":"🪨","pigeon":"🕊️","pile":"🔋","pilote":"🧑‍✈️","piloter":"✈️","pilule":"💊","pin":"🌲","pinceau":"🖌️","pique-nique":"🧺","piqûre":"💉","piscine":"🏊","pièce d'identité":"🪪","piéton":"🚶","placard":"🚪","place":"💺","plage":"🏖️","plan":"🗺️","plancher":"🟫","plante":"🪴","planter":"🌱","planète":"🪐","plastique":"🧴","plat":"n:🍽️","plateau":"🍽️","pleurer":"😢","pleuvoir":"🌧️","plombier":"🔧","pluie":"🌧️","plume":"🪶","plâtre":"🦴","pneu":"🛞","poche":"👖","poids":"⚖️","poignet":"⌚","poire":"🍐","poisson":"🐟","poitrine":"🫁","poivre":"🌶️","poivron":"🌶️","police":"👮","policier":"👮","policier / policière":"👮","politique":"🏛️","pollution":"🏭","pomme":"🍎","pomme de terre":"🥔","pompier":"🧑‍🚒","pont":"🌉","porc":"🥓","port":"⚓","portable":"📱","porte":"🚪","porte-monnaie":"👛","portefeuille":"👛","poste":"📮","pot":"🍲","potager":"🥕","poubelle":"🗑️","pouce":"👍","poule":"🐔","poulet":"🍗","poumon":"🫁","poupée":"🪆","pourboire":"💰","poutine":"🍟","poème":"📜","poète":"✍️","poêle":"🍳","prairie":"🌾","presse":"📰","prier":"🙏","printemps":"🌷","prise":"🔌","prison":"⛓️","prix":"🏷️","prière":"🙏","problème":"⚠️","procès":"⚖️","prof":"🧑‍🏫","professeur":"🧑‍🏫","promener":"🚶","promesse":"🤞","propre":"🧼","propre / sale":"🧼","pré":"🌾","préoccupé":"😟","président":"🧑‍💼","public":"n:👥","publicité":"📢","puits":"🪣","pull":"🧶","pyjama":"🩳","pâtes":"🍝","pâtisserie":"🍰","père":"👨","pétrole":"🫒","pêche":"🍑","pêcher":"🎣","pêcheur":"🎣","quai":"🚉","quartier":"🏘️","question":"❓","queue":"🐈","québec":"⚜️","rabais":"🏷️","racine":"🌱","radio":"📻","raisin":"🍇","ramer":"🚣","randonnée":"🥾","rapide":"🏎️","rapide / lent":"🏎️","rapidité":"🏎️","rasoir":"🪒","recette":"📖","recyclage":"♻️","regard":"👀","regarder":"👀","reine":"👸","religion":"🛐","renard":"🦊","rencontre":"👥","rendez-vous":"📅","rentrée":"🎒","repas":"🍽️","repos":"😌","requin":"🦈","respirer":"🫁","responsable":"🧑‍💼","restaurant":"🍽️","retard":"⏰","retraité":"👴","rez-de-chaussée":"🏢","reçu":"🧾","rhume":"🥶","rhume / enrhumé":"🥶","riche":"💰","riche / pauvre":"💰","rideau":"🪟","rire":"😂","rive":"🏞️","rivière":"🏞️","riz":"🍚","robe":"👗","robinet":"🚰","rocher":"🪨","roi":"🤴","roman":"📕","rond-point":"🔄","rose":"🌹","rosée":"💧","roue":"🛞","rouge":"🔴","rouler":"🚗","route":"🛣️","ruban":"🎀","rue":"🏘️","rugby":"🏉","ruine":"🏛️","ruisseau":"🏞️","rumeur":"🗣️","règle":"📏","réalisateur":"🎬","récolte":"🌾","récréation":"🛝","rédiger":"✍️","réfléchir":"🤔","réfrigérateur":"🧊","réparer":"🔧","réponse":"💬","réseau":"🌐","réservation":"📅","réunion":"👥","réveil":"⏰","révolution":"✊","rêve":"💭","sable":"🏖️","sac":"👜","sac poubelle":"🗑️","sac à dos":"🎒","sac à main":"👜","saint":"😇","saison":"🍂","salade":"🥗","salaire":"💵","sale":"🦨","salle de bain":"🛁","salle de bains":"🛁","salon":"🛋️","samedi":"📅","sandale":"👡","sandwich":"🥪","sang":"🩸","santé":"🩺","sapin":"🌲","sauce":"🥫","saucisse":"🌭","saumon":"🐟","saut":"🦘","sauter":"🦘","savon":"🧼","science":"🔬","sciences":"🔬","scientifique":"🧑‍🔬","scooter":"🛵","score":"🔢","scène":"🎭","se baigner":"🏊","se laver":"🧼","se lever":"⏰","se réveiller":"⏰","seau":"🪣","sec":"🏜️","seconde":"⏱️","secret":"🤫","secrétaire":"🧑‍💼","sel":"🧂","sel / le poivre":"🧂","semaine":"📅","septembre":"🍎","serpent":"🐍","serrure":"🔒","serveur":"🧑‍🍳","serveur / serveuse":"🧑‍🍳","serveuse":"🧑‍🍳","serviette":"🧻","shampooing":"🧴","short":"🩳","signature":"✍️","silence":"🤫","singe":"🐒","sirop":"🍯","sirop d'érable":"🍁","site":"🌐","site web":"🌐","siècle":"📜","ski":"⛷️","skier":"⛷️","sms":"💬","soie":"🧵","soif":"🥤","soir":"🌆","soirée":"🌆","sol":"🟫","soldat":"💂","solde":"🏷️","soleil":"☀️","sommeil":"😴","sommet":"🏔️","son":"n:🔊","songer":"🤔","sonnette":"🔔","sorcière":"🧙","sortie":"🚪","souffle":"🌬️","soupe":"🍲","sourcil":"🤨","sourire":"😊","souris":"🐁","spectacle":"🎭","spectateur":"👀","sport":"⚽","stade":"🏟️","stage":"💼","stagiaire":"🧑‍🎓","star":"⭐","station":"🚉","station-service":"⛽","stationnement":"🅿️","statue":"🗽","steak":"🥩","stylo":"🖊️","succès":"🏆","sucre":"🍬","sucré":"🍬","sud":"⬇️","sueur":"💦","suisse":"🇨🇭","supermarché":"🛒","surpris":"😮","surpris / surprise":"😮","surprise":"😮","symptôme":"🤒","sécheresse":"🏜️","sœur":"👧","t-shirt":"👕","tabac":"🚬","table":"🍽️","tableau":"🖼️","tailler":"✂️","tante":"👩","tapis":"🧶","tarte":"🥧","tasse":"☕","taureau":"🐂","taxi":"🚕","technologie":"💻","tee-shirt":"👕","temple":"🛕","température":"🌡️","tempête":"⛈️","tennis":"🎾","tente":"⛺","terrain":"⚽","terrasse":"☀️","terre":"🌍","texto":"💬","thermomètre":"🌡️","thon":"🐟","thé":"🍵","théâtre":"🎭","ticket":"🎫","ticket de caisse":"🧾","tigre":"🐅","timbre":"📮","timide":"😳","tiroir":"🗄️","tissu":"🧵","toilettes":"🚽","toit":"🏠","tomate":"🍅","tomber":"🍂","tonnerre":"🌩️","tortue":"🐢","touche":"⌨️","tourisme":"🗺️","touriste":"📸","tournevis":"🪛","tousser":"😷","toux":"😷","tracer":"✏️","traducteur":"🗣️","train":"🚆","trajet":"🧳","tram":"🚊","tramway":"🚊","tranche":"🍕","travail":"💼","travailler":"💼","travailleur":"👷","traversier":"⛴️","traîneau":"🛷","tremblement de terre":"🌋","tribunal":"⚖️","triste":"😢","tristesse":"😢","trombone":"📎","trophée":"🏆","trottinette":"🛵","trottoir":"🚶","truc":"📦","trésor":"💰","tuer":"💀","tulipe":"🌷","tuque":"🧶","télé":"📺","télécommande":"📺","téléphone":"📱","téléphone portable":"📱","téléphoner":"📞","télétravail":"🏠","télévision":"📺","témoin":"👀","tête":"🙂","uniforme":"👔","univers":"🌌","université":"🎓","urgence":"🚨","urgences":"🚑","usine":"🏭","vacances":"🏖️","vaccin":"💉","vache":"🐄","vague":"n:🌊","vaisselle":"🍽️","valise":"🧳","vallée":"🏞️","vedette":"⭐","vendeur":"🧑‍💼","vendre":"🏷️","vendredi":"📅","vent":"💨","vente":"🏷️","ventre":"🫃","verglas":"🧊","verre":"🥛","verrouiller":"🔒","vert":"🟢","vert / verte":"🟢","veste":"🧥","viande":"🥩","victoire":"🏆","vidéo":"📹","vie":"🌱","vieillard":"👴","vieillesse":"👴","vieux":"👴","vieux / vieille":"👴","village":"🏘️","ville":"🏘️","vin":"🍷","vinaigre":"🫗","violet":"🟣","violet / violette":"🟣","violon":"🎻","virement":"💸","virus":"🦠","vis":"🔩","visa":"🛂","visage":"🙂","vitamine":"💊","vitesse":"🏎️","voir":"👀","voisin":"🏘️","voisine":"🏘️","voiture":"🚗","voix":"🗣️","vol":"✈️","volant":"🚗","volcan":"🌋","voler":"✈️","voleur":"🦹","vote":"🗳️","voter":"🗳️","voyage":"🧳","voyager":"🧳","vue":"👀","véhicule":"🚗","vélo":"🚲","vérité":"✅","vétérinaire":"🐾","vêtement":"👕","vêtements":"👕","wagon":"🚃","week-end":"📅","wifi":"📶","yaourt":"🥛","yeux":"👀","yoga":"🧘","zoo":"🦁","zéro":"0️⃣","âge":"🎂","âme":"👼","âne":"🫏","écharpe":"🧣","échec":"❌","échecs":"♟️","échelle":"🪜","éclair":"⚡","école":"🏫","écouter":"👂","écouteurs":"🎧","écran":"🖥️","écrire":"✍️","écrivain":"✍️","écureuil":"🐿️","édifice":"🏢","église":"⛪","élection":"🗳️","électricien":"⚡","électricité":"⚡","élève":"🧑‍🎓","éléphant":"🐘","émission":"📺","énergie":"⚡","éolienne":"🌬️","épaule":"💪","épicerie":"🛒","épinard":"🥬","éponge":"🧽","épreuve":"📝","équipe":"👥","érable":"🍁","étage":"🏢","étagère":"📚","étang":"🦆","états-unis":"🇺🇸","étoile":"⭐","étranger":"🌍","étudiant":"🧑‍🎓","étudiant / étudiante":"🧑‍🎓","étudier":"📚","été":"n:☀️","évier":"🚰","événement":"🎉","île":"🏝️","œil":"👁️","œil / les yeux":"👁️","œuf":"🥚","œuvre":"🖼️"};

// Memory tips logic (no data except the false-friend list and gender rules).
// Kept in its own file so it can be tested in node and pasted into js/word-memory.js.

const FALSE_FRIENDS = {
    'actuellement': ['actually', 'currently, at the moment'],
    'actuel': ['actual', 'current, present-day'],
    'assister': ['assist', 'attend (assister à un cours)'],
    'attendre': ['attend', 'wait (for)'],
    'blesser': ['bless', 'injure, hurt'],
    'bras': ['bra', 'arm'],
    'cave': ['cave', 'cellar'],
    'chance': ['chance', 'luck (avoir de la chance = to be lucky)'],
    'collège': ['college', 'middle school (in France)'],
    'commander': ['command', 'order (food, goods)'],
    'conférence': ['conference', 'lecture, talk'],
    'crayon': ['crayon', 'pencil'],
    'déception': ['deception', 'disappointment'],
    'déçu': ['deceived', 'disappointed'],
    'demander': ['demand', 'ask'],
    'éventuellement': ['eventually', 'possibly, if need be'],
    'éventuel': ['eventual', 'possible'],
    'excité': ['excited', 'over-excited, worked up (use: j\'ai hâte)'],
    'formidable': ['formidable', 'great, wonderful'],
    'gentil': ['gentle', 'kind, nice'],
    'grand': ['grand', 'big, tall'],
    'habit': ['habit', 'outfit (habits = clothes)'],
    'injure': ['injure', 'insult'],
    'journée': ['journey', 'day (the whole day)'],
    'lecture': ['lecture', 'reading'],
    'librairie': ['library', 'bookshop (a library is une bibliothèque)'],
    'location': ['location', 'renting, rental'],
    'magasin': ['magazine', 'shop (a magazine is un magazine)'],
    'monnaie': ['money', 'change, currency (money is l\'argent)'],
    'occasion': ['occasion', 'opportunity, bargain (d\'occasion = second-hand)'],
    'passer': ['pass (an exam)', 'take, sit (an exam). To pass is réussir'],
    'phrase': ['phrase', 'sentence'],
    'préservatif': ['preservative', 'condom'],
    'prétendre': ['pretend', 'claim (to pretend is faire semblant)'],
    'professeur': ['professor', 'teacher (any level)'],
    'rester': ['rest', 'stay'],
    'résumer': ['resume', 'sum up (to resume is reprendre)'],
    'sensible': ['sensible', 'sensitive (sensible = raisonnable)'],
    'sympathique': ['sympathetic', 'nice, friendly'],
    'sympa': ['sympathetic', 'nice, friendly'],
    'supporter': ['support', 'put up with, stand'],
    'travailler': ['travel', 'work (to travel is voyager)'],
    'user': ['use', 'wear out (to use is utiliser)'],
    'veste': ['vest', 'jacket'],
    'raisin': ['raisin', 'grapes (a raisin is un raisin sec)'],
    'achever': ['achieve', 'finish, complete'],
    'agenda': ['agenda', 'diary, planner'],
    'avertissement': ['advertisement', 'warning (an advert is une publicité)'],
    'balance': ['balance', 'scales (for weighing)'],
    'car': ['car', 'because (a car is une voiture)'],
    'chair': ['chair', 'flesh (a chair is une chaise)'],
    'coin': ['coin', 'corner (a coin is une pièce)'],
    'course': ['course', 'race, errand (des courses = shopping)'],
    'déranger': ['derange', 'disturb, bother'],
    'disposer': ['dispose of', 'have available, arrange'],
    'douche': ['douche', 'shower'],
    'engagement': ['engagement (to marry)', 'commitment'],
    'entrée': ['entrée (main course)', 'starter, entrance'],
    'essence': ['essence', 'petrol, gasoline'],
    'figure': ['figure', 'face'],
    'four': ['four', 'oven'],
    'hasard': ['hazard', 'chance (par hasard = by chance)'],
    'large': ['large', 'wide (large = grand)'],
    'lard': ['lard', 'bacon, fat'],
    'médecin': ['medicine', 'doctor (medicine is la médecine or un médicament)'],
    'mobile': ['mobile phone', 'motive, moving (a mobile phone is un portable)'],
    'pièce': ['piece', 'room, coin, play (a piece is un morceau)'],
    'place': ['place', 'square, seat, space (a place is un endroit)'],
    'préservatifs': ['preservatives', 'condoms'],
    'propre': ['proper', 'clean, own'],
    'rentable': ['rentable', 'profitable'],
    'retirer': ['retire', 'withdraw, take off (to retire is prendre sa retraite)'],
    'robe': ['robe', 'dress'],
    'sale': ['sale', 'dirty (a sale is des soldes)'],
    'slip': ['slip', 'underpants, briefs'],
    'stage': ['stage', 'internship, course (a stage is une scène)'],
    'tirer': ['tire', 'pull, shoot (to tire is fatiguer)'],
    'vacances': ['vacancies', 'holidays'],
    'bougie': ['bogey', 'candle'],
    'but': ['but', 'goal, aim (but = mais)'],
    'coucher': ['couch', 'go to bed, put to bed'],
    'déguster': ['disgust', 'taste, savour'],
    'dresser': ['dress', 'put up, train (an animal). To dress is s\'habiller'],
    'fabrique': ['fabric', 'factory (fabric is le tissu)'],
    'issue': ['issue', 'exit, outcome'],
    'joli': ['jolly', 'pretty'],
    'patron': ['patron', 'boss'],
    'pain': ['pain', 'bread'],
    'prune': ['prune', 'plum (a prune is un pruneau)'],
    'recette': ['receipt', 'recipe, takings (a receipt is un reçu)'],
    'rude': ['rude', 'harsh, tough'],
    'surnom': ['surname', 'nickname (a surname is un nom de famille)'],
    'trouble': ['trouble', 'blurred, cloudy'],
    'vers': ['verse', 'towards (also: line of poetry)'],
    'vilain': ['villain', 'naughty, ugly'],
};

// Gender rules by ending: [ending, gender, example, exceptions]
const GENDER_RULES = [
    ['tion', 'f', 'la nation', []],
    ['sion', 'f', 'la télévision', []],
    ['ion', 'f', 'la région', []],
    ['aison', 'f', 'la maison', []],
    ['té', 'f', 'la liberté', ['été', 'côté', 'comité', 'pâté', 'traité', 'député', 'thé', 'café', 'pré', 'marché', 'degré', 'fossé', 'invité', 'député', 'congé', 'blé', 'curé', 'doigté', 'arrêté', 'résumé', 'canapé', 'bébé', 'clé', 'musée']],
    ['ure', 'f', 'la voiture', ['mercure', 'murmure', 'parjure', 'augure']],
    ['ette', 'f', 'la fourchette', ['squelette']],
    ['ence', 'f', 'la différence', ['silence']],
    ['ance', 'f', 'la chance', []],
    ['ade', 'f', 'la salade', ['stade', 'grade', 'jade']],
    ['ée', 'f', 'la journée', ['musée', 'lycée', 'trophée', 'apogée', 'pygmée', 'mausolée', 'scarabée', 'athénée']],
    ['ie', 'f', 'la vie', ['génie', 'incendie', 'parapluie', 'foie', 'sosie', 'messie', 'amphibie']],
    ['ise', 'f', 'la valise', []],
    ['esse', 'f', 'la jeunesse', []],
    ['ière', 'f', 'la lumière', ['cimetière']],
    ['ment', 'm', 'le moment', ['jument']],
    ['age', 'm', 'le fromage', ['page', 'plage', 'image', 'cage', 'rage', 'nage', 'page']],
    ['eau', 'm', 'le bateau', ['eau', 'peau']],
    ['isme', 'm', 'le tourisme', []],
    ['oir', 'm', 'le miroir', []],
    ['ier', 'm', 'le papier', []],
    ['et', 'm', 'le billet', []],
    ['at', 'm', 'le chocolat', []],
    ['as', 'm', 'le repas', []],
    ['ail', 'm', 'le travail', []],
    ['eil', 'm', 'le soleil', []],
    ['in', 'm', 'le jardin', ['fin', 'main', 'faim']],
    ['on', 'm', 'le crayon', ['maison', 'raison', 'saison', 'leçon', 'boisson', 'chanson', 'façon', 'prison', 'liaison', 'trahison', 'cuisson', 'moisson', 'rançon', 'garnison', 'cloison', 'comparaison', 'conjugaison', 'combinaison', 'livraison', 'guérison', 'floraison', 'démangeaison', 'terminaison', 'toison', 'cargaison', 'pamoison', 'boisson']],
];

// People nouns made from verbs (un invité, une invitée) follow the person, not the ending
const GENDER_SKIP = new Set(['retraité', 'invité', 'député', 'arrière', 'employé', 'salarié', 'accusé', 'délégué', 'allié', 'blessé', 'réfugié', 'fiancé', 'marié', 'associé', 'abonné']);

const strip = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Gender tip for a single noun, or null
function genderTip(key, gender) {
    if (gender !== 'm' && gender !== 'f') return null;
    const k = String(key).trim().toLowerCase();
    if (!k || /[\s-]/.test(k) || /^[A-ZÀ-Ý]/.test(key) || GENDER_SKIP.has(k)) return null;   // one plain word, not a name
    for (const [end, g, ex, exc] of GENDER_RULES) {
        if (!k.endsWith(end) || k === end) continue;
        const noun = g === 'f' ? 'feminine' : 'masculine';
        if (gender === g && !exc.includes(k)) return { ok: true, text: `Most nouns ending in -${end} are ${noun}` + (ex.endsWith(' ' + k) ? '.' : `, like ${ex}.`) };
        if (gender !== g) return { ok: false, text: `Careful: most nouns ending in -${end} are ${noun}, but this one is ${gender === 'f' ? 'feminine' : 'masculine'}.` };
        return null;
    }
    return null;
}

// French endings -> English endings, for spotting words that look like English
const SUFFIXES = [
    ['ité', 'ity'], ['té', 'ty'], ['ique', 'ic'], ['ique', 'ical'], ['ique', 'ics'], ['eux', 'ous'], ['euse', 'ous'], ['eur', 'or'], ['eur', 'er'], ['iste', 'ist'],
    ['isme', 'ism'], ['ie', 'y'], ['aire', 'ary'], ['oire', 'ory'], ['if', 'ive'], ['ive', 'ive'], ['el', 'al'], ['elle', 'al'],
    ['er', 'e'], ['er', ''], ['ir', ''], ['re', 'er'], ['é', 'ed'], ['ée', 'ed'], ['ment', 'ly'], ['iser', 'ize'], ['iser', 'ise'], ['ifier', 'ify'],
    ['ant', 'ant'], ['ent', 'ent'], ['ence', 'ence'], ['ance', 'ance'], ['ion', 'ion'], ['e', ''], ['', 'e'], ['eur', 'our'], ['ette', 'et'], ['u', 'ue'], ['in', 'ine'], ['ain', 'an'],
];
function lev(a, b) {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
        const cur = [i];
        for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = cur;
    }
    return prev[n];
}
function englishGlosses(en) {
    return String(en || '').toLowerCase().replace(/\(.*?\)/g, '').split(/[,;/]/)
        .map(g => g.trim().replace(/^(to|a|an|the) /, '').replace(/[!?.…]/g, '').trim()).filter(g => g && !/\s/.test(g));
}
// The English word this French word looks like, or ''
function lookalike(key, en) {
    const k0 = String(key || '').trim().toLowerCase().replace(/^(se |s')/, '');
    if (!k0 || /\s/.test(k0) || k0.length < 4) return '';
    const fr = strip(k0).replace(/œ/g, 'oe');
    for (const g of englishGlosses(en)) {
        if (g.length < 4) continue;
        if (fr === g) return g;
        for (const [a, b] of SUFFIXES) {
            if (fr.endsWith(a) && g.endsWith(b) && fr.slice(0, fr.length - a.length) === g.slice(0, g.length - b.length) && fr.length - a.length >= 3) return g;
        }
        // nearly the same spelling (one or two letters apart), only for longer words
        const d = lev(fr, g);
        if (g.length >= 6 && d <= 2 && d / g.length <= 0.25 && fr.slice(0, 3) === g.slice(0, 3)) return g;
    }
    return '';
}

// All the tips for one word: [{ kind: 'false'|'alike'|'gender', text }]
function tipsFor(key, en, gender) {
    const out = [];
    const ff = FALSE_FRIENDS[key];
    if (ff) out.push({ kind: 'false', text: `False friend: not "${ff[0]}". It means ${ff[1]}.` });
    else {
        const g = lookalike(key, en);
        if (g) out.push({ kind: 'alike', text: strip(key) === g ? `Same word in English: ${g} (say it the French way).` : `Looks like English: ${g}.` });
    }
    const gt = genderTip(key, gender);
    if (gt) out.push({ kind: gt.ok ? 'gender' : 'gender-x', text: gt.text });
    return out;
}


const KIND = (pos) => { const p = String(pos || ''); return /noun/.test(p) ? 'n' : /verb/.test(p) ? 'v' : /adjective/.test(p) ? 'a' : p ? 'x' : ''; };

window.WordMemory = {
    picture(w) {
        const v = w && PICS[w.key];
        if (!v) return '';
        const m = /^([nva]):(.*)$/.exec(v);
        if (!m) return v;
        const kind = KIND(w.pos);
        return !kind || kind === m[1] ? m[2] : '';
    },
    tips(w) {
        if (!w) return [];
        const kind = KIND(w.pos);
        return tipsFor(w.key, w.en, kind === 'n' || !kind ? w.gender : '');
    }
};
})();
