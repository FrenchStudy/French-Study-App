// js/scenes.js - the role-play characters and their scenes, A1 to C2.
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
            ["Enchanté ! Je m'appelle Alex.", "Nice to meet you! My name is Alex."],
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
    },
    {
        id: 'mme-roux', name: 'Mme Roux', role: 'your landlady', emoji: '🔑', level: 'B2',
        scene: 'Negotiating with your landlady', blocks: [],
        goal: 'Explain a problem, defend your rights politely and reach an agreement.',
        persona: 'Mme Roux, 60, owns the flat the learner rents in Toulouse. The boiler has broken down three times this winter and she wants to repair it again rather than replace it; she also hints at raising the rent next year. She is firm but fair, and can be persuaded by good arguments. Uses "vous".',
        opener: ["Bonjour ! Vous vouliez me voir ? C'est encore pour la chaudière, j'imagine…", "Hello! You wanted to see me? It's about the boiler again, I suppose…"],
        phrases: [
            ["C'est la troisième panne depuis le mois de novembre.", "It's the third breakdown since November."],
            ["Je comprends, mais une réparation de plus ne réglera pas le problème.", "I understand, but one more repair won't solve the problem."],
            ["Le logement doit être chauffé correctement, c'est dans le bail.", "The flat must be properly heated, it's in the lease."],
            ["Est-ce qu'on pourrait trouver un compromis ?", "Could we find a compromise?"],
            ["Je suis prêt à rester, à condition que la chaudière soit remplacée.", "I'm willing to stay, provided the boiler is replaced."],
            ["Pourriez-vous me le confirmer par écrit ?", "Could you confirm that in writing?"]
        ]
    },
    {
        id: 'garnier', name: 'M. Garnier', role: 'HR director', emoji: '🤝', level: 'C1',
        scene: 'Negotiating a job offer', blocks: [],
        goal: 'Negotiate salary and working conditions with tact and precise arguments.',
        persona: 'Bertrand Garnier, HR director of a mid-sized engineering company in Lille. He has just offered the learner a project manager position at 48,000 € a year, with two days of remote work. His budget can stretch to 52,000 € or extra days off, but he concedes nothing without solid arguments. Courteous, formal, a little evasive. Uses "vous".',
        opener: ["Nous sommes ravis de vous proposer le poste. Le salaire serait de quarante-huit mille euros brut par an. Qu'en pensez-vous ?", "We're delighted to offer you the position. The salary would be forty-eight thousand euros gross a year. What do you think?"],
        phrases: [
            ["Je vous remercie de cette proposition, qui m'intéresse vivement.", "Thank you for this offer, which interests me greatly."],
            ["Compte tenu de mon expérience, j'espérais plutôt une rémunération autour de cinquante-trois mille euros.", "Given my experience, I was rather hoping for pay of around fifty-three thousand euros."],
            ["Serait-il envisageable de prévoir une révision du salaire au bout d'un an ?", "Would it be possible to plan a salary review after a year?"],
            ["Si le salaire ne peut pas évoluer, pourrait-on discuter d'autres avantages ?", "If the salary can't move, could we discuss other benefits?"],
            ["Je tiens à ce que le télétravail soit inscrit dans le contrat.", "I'd like remote work to be written into the contract."],
            ["Laissez-moi y réfléchir et je vous réponds d'ici vendredi.", "Let me think about it and I'll get back to you by Friday."]
        ]
    },
    {
        id: 'morel', name: 'Hélène Morel', role: 'radio journalist', emoji: '🎙️', level: 'C1',
        scene: 'A live radio interview', blocks: [],
        goal: 'Present a project, answer tricky questions and stay convincing under pressure.',
        persona: 'Hélène Morel, a sharp journalist on a regional radio station. She is interviewing the learner, who has founded an association that turns empty shops in a small town into shared workspaces. She asks follow-up questions, plays devil\'s advocate (cost, usefulness, competition with local cafés) and interrupts politely if answers are vague. Uses "vous".',
        opener: ["Bonjour et bienvenue. Vous avez créé une association qui transforme des commerces vides en espaces de travail partagés. Concrètement, à quoi ça sert ?", "Hello and welcome. You've set up an association that turns empty shops into shared workspaces. In concrete terms, what's the point?"],
        phrases: [
            ["C'est une très bonne question, et je vais y répondre en deux temps.", "That's a very good question, and I'll answer it in two parts."],
            ["Concrètement, une dizaine de personnes y travaillent chaque jour.", "In concrete terms, about ten people work there every day."],
            ["Je ne dirais pas ça : nous ne faisons pas concurrence aux cafés, au contraire.", "I wouldn't say that: we don't compete with the cafés, quite the opposite."],
            ["Permettez-moi de nuancer ce point.", "Allow me to qualify that point."],
            ["Les chiffres parlent d'eux-mêmes.", "The figures speak for themselves."],
            ["Pour conclure, j'invite vos auditeurs à venir nous voir.", "To conclude, I invite your listeners to come and see us."]
        ]
    },
    {
        id: 'delacroix', name: 'Bertrand Delacroix', role: 'philosopher at a café-philo', emoji: '🧠', level: 'C2',
        scene: 'Debate at a café-philo', blocks: [],
        goal: 'Defend an abstract position, define your terms and rebut objections with nuance.',
        persona: 'Bertrand Delacroix, a retired philosophy teacher who runs a café-philo in Paris every Sunday. Today\'s question: « Peut-on être libre sans être heureux ? » He is witty and Socratic: he asks the learner to define words, points out contradictions, quotes Rousseau, Spinoza or Sartre in passing, and enjoys taking the opposite view. Uses "vous", a rich and slightly literary register.',
        opener: ["Notre question du jour : peut-on être libre sans être heureux ? Vous avez levé la main le premier… je vous écoute.", "Today's question: can one be free without being happy? You raised your hand first… I'm listening."],
        phrases: [
            ["Tout dépend de ce qu'on entend par « liberté ».", "It all depends on what we mean by \"freedom\"."],
            ["Je dirais même que la liberté a un prix, et que ce prix est parfois l'inquiétude.", "I would even say that freedom has a price, and that price is sometimes anxiety."],
            ["Votre objection est pertinente, mais elle repose sur un présupposé.", "Your objection is relevant, but it rests on an assumption."],
            ["Admettons que vous ayez raison : qu'en déduisez-vous ?", "Let's assume you're right: what do you conclude from that?"],
            ["Il n'en demeure pas moins que l'on peut choisir sans être comblé.", "The fact remains that one can choose without being fulfilled."],
            ["Je crains que nous ne soyons d'accord plus qu'il n'y paraît.", "I fear we agree more than it seems."]
        ]
    },
    {
        id: 'de-villiers', name: 'Mme de Villiers', role: 'chair of a selection committee', emoji: '🏛️', level: 'C2',
        scene: 'Defending your project before a committee', blocks: [],
        goal: 'Argue formally, handle criticism with diplomacy and adapt your register.',
        persona: 'Anne de Villiers, chair of a cultural foundation\'s committee deciding whether to fund the learner\'s project: a touring exhibition about the history of immigration in French industrial towns. She is courteous but demanding, raises precise objections about the budget, the historical rigour and the risk of controversy, and expects a formal, well-structured answer. Uses "vous" and a formal register.',
        opener: ["Madame, Monsieur, le comité a lu votre dossier avec intérêt. Il nous reste toutefois quelques réserves. Pourriez-vous d'abord nous exposer ce qui fait l'originalité de votre projet ?", "The committee has read your application with interest. We do, however, have a few reservations. Could you first tell us what makes your project original?"],
        phrases: [
            ["Je vous remercie de l'attention que vous avez portée à notre dossier.", "Thank you for the attention you have given our application."],
            ["L'originalité du projet tient avant tout à sa démarche participative.", "The project's originality lies above all in its participatory approach."],
            ["J'entends parfaitement vos réserves quant au budget.", "I fully understand your reservations about the budget."],
            ["Nous avons veillé à ce que chaque panneau soit validé par un comité d'historiens.", "We have made sure each panel is approved by a committee of historians."],
            ["Loin d'éluder la controverse, nous souhaitons en faire un objet de débat.", "Far from sidestepping controversy, we want to make it a subject for debate."],
            ["Je reste naturellement à votre disposition pour tout complément d'information.", "I naturally remain at your disposal for any further information."]
        ]
    }
];
