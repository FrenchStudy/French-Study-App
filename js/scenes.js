// js/scenes.js - the 12 role-play characters and their scenes.
// Used by speaking.html: Conversation mode (AI role-play) and Shadowing track 6 (scene rehearsal).
// phrases: [french, english] lines a learner might say in the scene.
window.SCENES = [
    {
        id: 'lucas', name: 'Lucas', role: 'your new neighbour', emoji: '🏠', level: 'A1',
        scene: 'Introductions on the stairs', blocks: [1, 9, 10, 11],
        goal: "Say who you are, where you're from and what you do.",
        persona: 'Lucas, 30, a friendly graphic designer who lives on the third floor of a Paris apartment building. He has just met the learner, who moved in this week. Uses "vous" at first.',
        opener: ["Bonjour ! Je suis Lucas, j'habite au troisième étage. Vous êtes nouveau ici ?", "Hello! I'm Lucas, I live on the third floor. Are you new here?"],
        phrases: [
            ["Enchanté ! Je m'appelle Alex.", "Nice to meet you! My name is Sam."],
            ["Je viens du Canada.", "I come from Canada."],
            ["Je suis étudiant.", "I am a student."],
            ["J'habite au deuxième étage.", "I live on the second floor."],
            ["Je suis arrivé la semaine dernière.", "I arrived last week."],
            ["Et vous, vous travaillez où ?", "And you, where do you work?"]
        ]
    },
    {
        id: 'camille', name: 'Camille', role: 'café waitress in Paris', emoji: '☕', level: 'A1',
        scene: 'Ordering breakfast', blocks: [18, 4],
        goal: 'Order, ask the price and pay.',
        persona: 'Camille, a quick and cheerful waitress in a busy Paris café at breakfast time. Uses "vous". Prices: café 2,50 €, croissant 1,80 €, jus d\'orange 4 €.',
        opener: ["Bonjour ! Vous avez choisi ?", "Hello! Have you decided?"],
        phrases: [
            ["Je voudrais un café, s'il vous plaît.", "I'd like a coffee, please."],
            ["Un croissant aussi, s'il vous plaît.", "A croissant too, please."],
            ["C'est combien ?", "How much is it?"],
            ["L'addition, s'il vous plaît.", "The bill, please."],
            ["Je peux payer par carte ?", "Can I pay by card?"],
            ["Vous avez du thé ?", "Do you have tea?"]
        ]
    },
    {
        id: 'lea', name: 'Léa', role: 'a passer-by in Lyon', emoji: '🗺️', level: 'A1',
        scene: 'Asking the way', blocks: [21, 2],
        goal: 'Ask for directions and follow them.',
        persona: 'Léa, a helpful student walking near Place Bellecour in Lyon. Gives simple directions: tout droit, à gauche, à droite, deuxième rue. Uses "vous".',
        opener: ["Oui ? Je peux vous aider ?", "Yes? Can I help you?"],
        phrases: [
            ["Excusez-moi, où est la gare ?", "Excuse me, where is the station?"],
            ["C'est loin d'ici ?", "Is it far from here?"],
            ["Je tourne à gauche ?", "Do I turn left?"],
            ["C'est à combien de minutes à pied ?", "How many minutes is it on foot?"],
            ["Pouvez-vous répéter, s'il vous plaît ?", "Could you repeat, please?"],
            ["Merci beaucoup, bonne journée !", "Thank you very much, have a good day!"]
        ]
    },
    {
        id: 'sophie', name: 'Sophie', role: 'clothes shop assistant', emoji: '🧥', level: 'A1–A2',
        scene: 'Buying a jacket', blocks: [19, 14, 16],
        goal: 'Ask for a size or colour, compare, and return an item.',
        persona: 'Sophie, a patient assistant in a clothes shop in Bordeaux. Jackets come in noir, bleu and vert, sizes S to XL. Uses "vous".',
        opener: ["Bonjour ! Je peux vous aider ?", "Hello! Can I help you?"],
        phrases: [
            ["Je cherche une veste.", "I'm looking for a jacket."],
            ["Vous l'avez en bleu ?", "Do you have it in blue?"],
            ["Je peux l'essayer ?", "Can I try it on?"],
            ["C'est un peu trop grand.", "It's a bit too big."],
            ["Vous avez la taille en dessous ?", "Do you have the size below?"],
            ["Je voudrais rendre cet article.", "I'd like to return this item."]
        ]
    },
    {
        id: 'durand', name: 'Monsieur Durand', role: 'hotel receptionist', emoji: '🛎️', level: 'A2',
        scene: 'Checking in', blocks: [23, 6, 5],
        goal: 'Check in, ask about times and report a problem with the room.',
        persona: 'Monsieur Durand, a formal and polite receptionist at the Hôtel du Parc in Nice. Breakfast 7h–10h, check-out at 11h. Uses "vous".',
        opener: ["Bonsoir, bienvenue à l'Hôtel du Parc. Vous avez une réservation ?", "Good evening, welcome to the Hôtel du Parc. Do you have a reservation?"],
        phrases: [
            ["J'ai une réservation au nom de Martin.", "I have a reservation under the name Martin."],
            ["Pour trois nuits.", "For three nights."],
            ["À quelle heure est le petit-déjeuner ?", "What time is breakfast?"],
            ["Le wifi ne marche pas dans ma chambre.", "The wifi doesn't work in my room."],
            ["Je peux laisser ma valise ici ?", "Can I leave my suitcase here?"],
            ["Le départ est à quelle heure ?", "What time is check-out?"]
        ]
    },
    {
        id: 'karim', name: 'Karim', role: 'train station agent', emoji: '🚆', level: 'A2',
        scene: 'Buying a ticket after a missed train', blocks: [22, 6],
        goal: 'Buy a ticket and change a booking.',
        persona: 'Karim, a calm ticket agent at Paris Gare de Lyon. Next trains to Lyon at 14h12 and 15h40 from platform (voie) 7. Uses "vous".',
        opener: ["Bonjour, c'est pour quel trajet ?", "Hello, which journey is it for?"],
        phrases: [
            ["Un aller simple pour Lyon, s'il vous plaît.", "A one-way ticket to Lyon, please."],
            ["Un aller-retour pour Marseille.", "A return ticket to Marseille."],
            ["Le prochain train part à quelle heure ?", "What time does the next train leave?"],
            ["J'ai raté mon train.", "I missed my train."],
            ["Je peux changer mon billet ?", "Can I change my ticket?"],
            ["Il part de quelle voie ?", "Which platform does it leave from?"]
        ]
    },
    {
        id: 'martin', name: 'Docteur Martin', role: 'family doctor', emoji: '🩺', level: 'A2',
        scene: "A doctor's visit", blocks: [20, 13],
        goal: "Describe your symptoms and how long you've had them.",
        persona: 'Docteur Martin, a kind GP in Toulouse. Asks about symptoms, how long (depuis quand), allergies, then gives simple advice. Never gives real medical advice beyond the role-play. Uses "vous".',
        opener: ["Bonjour, asseyez-vous. Qu'est-ce qui ne va pas ?", "Hello, have a seat. What's wrong?"],
        phrases: [
            ["J'ai mal à la tête.", "I have a headache."],
            ["J'ai de la fièvre depuis deux jours.", "I've had a fever for two days."],
            ["Je tousse beaucoup.", "I'm coughing a lot."],
            ["Je suis allergique à la pénicilline.", "I'm allergic to penicillin."],
            ["Je dois le prendre combien de fois par jour ?", "How many times a day should I take it?"],
            ["Je me sens très fatigué.", "I feel very tired."]
        ]
    },
    {
        id: 'ines', name: 'Inès', role: 'sports club member', emoji: '🏃', level: 'A2',
        scene: 'Joining a running club', blocks: [26, 7],
        goal: 'Talk about what you like and how often you do it.',
        persona: 'Inès, 25, an energetic member of a running club in Nantes. Training on Tuesday and Thursday evenings and Sunday morning; 20 € per month. Uses "tu".',
        opener: ["Salut ! Tu veux t'inscrire au club ?", "Hi! Do you want to join the club?"],
        phrases: [
            ["Oui, j'aime beaucoup courir.", "Yes, I really like running."],
            ["Je fais du sport deux fois par semaine.", "I do sport twice a week."],
            ["Les entraînements, c'est quand ?", "When are the training sessions?"],
            ["C'est combien par mois ?", "How much is it per month?"],
            ["Je suis débutant.", "I'm a beginner."],
            ["Tu viens souvent ?", "Do you come often?"]
        ]
    },
    {
        id: 'leroy', name: 'Madame Leroy', role: 'bank adviser', emoji: '🏦', level: 'A2–B1',
        scene: 'Opening a bank account', blocks: [24],
        goal: 'Explain what you need and understand the conditions.',
        persona: 'Madame Leroy, a professional bank adviser in Lille. Needs passport, proof of address (justificatif de domicile); account fee 2 € per month; card arrives in 7 days. Uses "vous".',
        opener: ["Bonjour, que puis-je faire pour vous ?", "Hello, what can I do for you?"],
        phrases: [
            ["Je voudrais ouvrir un compte.", "I'd like to open an account."],
            ["Quels documents faut-il ?", "Which documents are needed?"],
            ["Il y a des frais tous les mois ?", "Are there monthly fees?"],
            ["Je voudrais une carte bancaire.", "I'd like a bank card."],
            ["Comment je fais un virement ?", "How do I make a transfer?"],
            ["Je viens d'arriver en France.", "I've just arrived in France."]
        ]
    },
    {
        id: 'petit', name: "l'agent Petit", role: 'police officer at the front desk', emoji: '👮', level: 'B1',
        scene: 'Reporting a lost bag', blocks: [25, 12],
        goal: 'Describe an object and explain what happened, using past tenses.',
        persona: "l'agent Petit, a methodical police officer taking a report (déclaration de perte) at a police station in Marseille. Asks when, where, what the bag looks like and what was inside. Uses \"vous\".",
        opener: ["Bonjour, je vous écoute.", "Hello, I'm listening."],
        phrases: [
            ["J'ai perdu mon sac.", "I lost my bag."],
            ["On m'a volé mon portefeuille.", "My wallet was stolen."],
            ["C'était hier soir, vers vingt heures.", "It was last night, around 8 pm."],
            ["Il est noir, en cuir.", "It's black, made of leather."],
            ["Il y avait mon passeport dedans.", "My passport was inside."],
            ["Qu'est-ce que je dois faire maintenant ?", "What should I do now?"]
        ]
    },
    {
        id: 'julien', name: 'Julien', role: 'hiring manager', emoji: '💼', level: 'B1',
        scene: 'Job interview', blocks: [27, 28],
        goal: 'Present your experience, skills and plans.',
        persona: 'Julien, a hiring manager at a tech start-up in Paris, interviewing for a marketing assistant role. Asks about experience, strengths, why this company, and availability. Uses "vous".',
        opener: ["Bonjour, merci d'être venu. Pouvez-vous vous présenter ?", "Hello, thank you for coming. Could you introduce yourself?"],
        phrases: [
            ["J'ai travaillé trois ans dans le marketing.", "I worked in marketing for three years."],
            ["Je parle anglais et un peu français.", "I speak English and a little French."],
            ["Je suis motivé et organisé.", "I'm motivated and organised."],
            ["J'aimerais évoluer dans votre entreprise.", "I'd like to grow within your company."],
            ["Quels sont les horaires ?", "What are the working hours?"],
            ["Quand est-ce que je pourrais commencer ?", "When could I start?"]
        ]
    },
    {
        id: 'chloe', name: 'Chloé', role: 'a friend at dinner', emoji: '🍷', level: 'B2',
        scene: 'Debating remote work over dinner', blocks: [13, 30],
        goal: 'Give your opinion, agree and disagree politely.',
        persona: 'Chloé, 34, a lively friend who loves a good debate. Tonight she argues that remote work (le télétravail) is great; she pushes back on the learner\'s points but stays friendly. Uses "tu", natural speech.',
        opener: ["Tu as vu l'article sur le télétravail ? Moi, je trouve ça génial. Et toi ?", "Did you see the article on remote work? I think it's great. What about you?"],
        phrases: [
            ["À mon avis, c'est une bonne idée.", "In my opinion, it's a good idea."],
            ["Je ne suis pas tout à fait d'accord.", "I don't completely agree."],
            ["D'un côté, c'est pratique, mais de l'autre, on se sent seul.", "On one hand it's practical, but on the other you feel alone."],
            ["Ça dépend de la situation.", "It depends on the situation."],
            ["Je comprends ton point de vue, mais…", "I understand your point of view, but…"],
            ["Ce qui me dérange, c'est le manque de contact.", "What bothers me is the lack of contact."]
        ]
    }
];
