// js/library.js - texts for Reading and Listening, shared by both pages.
// Built-in texts (no AI needed) + the shared library in Supabase (library_texts: every AI text a
// student creates is saved there for others at that level) + texts you paste yourself (kept on
// this device only, since they may come from a book).
// Needs config.js, js/ai.js and js/conjugate.js (for word lookups).
//
// A text: { id, level, subject, kind, title, fr, en, questions: [{ q, options, answer, why }], source }

window.LIB = (function () {
    const db = window.mySupabase;
    const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const store = {
        get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    };
    const plain = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    // ---------- Built-in texts ----------
    const BUILT_IN = [
        {
            id: 'b-a1-marche', level: 'A1', subject: 'Food', kind: 'Story', title: 'Au marché',
            fr: "Le samedi matin, je vais au marché avec ma mère. Il y a beaucoup de monde. Nous achetons des pommes, des tomates et du fromage. Le marchand est très sympa. Il dit : « Bonjour ! Vous voulez goûter ? » Ma mère adore le fromage de chèvre. Après le marché, nous buvons un café en terrasse. J'aime beaucoup le samedi !",
            en: "On Saturday mornings, I go to the market with my mother. There are a lot of people. We buy apples, tomatoes and cheese. The stallholder is very nice. He says: \"Hello! Would you like a taste?\" My mother loves goat's cheese. After the market, we have a coffee on a café terrace. I really like Saturdays!",
            questions: [
                { q: 'When do they go to the market?', options: ['On Saturday morning', 'On Sunday evening', 'On Monday morning'], answer: 0, why: '"Le samedi matin" means on Saturday mornings.' },
                { q: 'What do they buy?', options: ['Apples, tomatoes and cheese', 'Bread and milk', 'Fish and rice'], answer: 0, why: '"Nous achetons des pommes, des tomates et du fromage."' },
                { q: 'What does the mother love?', options: ["Goat's cheese", 'Tomatoes', 'Coffee'], answer: 0, why: '"Ma mère adore le fromage de chèvre."' },
                { q: 'What do they do after the market?', options: ['They have a coffee', 'They go home to cook', 'They go to the cinema'], answer: 0, why: '"Nous buvons un café en terrasse": we have a coffee on a terrace.' }
            ]
        },
        {
            id: 'b-a1-coloc', level: 'A1', subject: 'Family and friends', kind: 'Message', title: 'Ma nouvelle colocataire',
            fr: "Salut Tom !\nJ'ai une nouvelle colocataire. Elle s'appelle Inès. Elle a vingt-cinq ans et elle est espagnole. Elle parle espagnol, anglais et un peu français. Elle travaille dans un hôpital : elle est infirmière. Le soir, nous cuisinons ensemble. Elle fait une très bonne paella ! Le week-end, elle aime faire du vélo.\nÀ bientôt,\nJulie",
            en: "Hi Tom!\nI have a new flatmate. Her name is Inès. She is twenty-five and she is Spanish. She speaks Spanish, English and a little French. She works in a hospital: she is a nurse. In the evening, we cook together. She makes a very good paella! At the weekend, she likes cycling.\nSee you soon,\nJulie",
            questions: [
                { q: 'Who is Inès?', options: ["Julie's new flatmate", "Julie's sister", "Tom's teacher"], answer: 0, why: '"Une colocataire" is a flatmate.' },
                { q: 'How old is Inès?', options: ['25', '35', '15'], answer: 0, why: '"Vingt-cinq ans" = 25 years old.' },
                { q: 'What is her job?', options: ['A nurse', 'A cook', 'A teacher'], answer: 0, why: '"Infirmière" means nurse; she works in a hospital.' },
                { q: 'What do they do in the evening?', options: ['They cook together', 'They go cycling', 'They watch TV'], answer: 0, why: '"Le soir, nous cuisinons ensemble."' }
            ]
        },
        {
            id: 'b-a2-train', level: 'A2', subject: 'Travel', kind: 'Story', title: 'Un week-end à Bordeaux',
            fr: "Le mois dernier, je suis allé à Bordeaux en train pour voir mon frère. Le voyage a duré deux heures. Dans le train, j'ai lu un livre et j'ai regardé le paysage par la fenêtre. Quand je suis arrivé, mon frère m'attendait à la gare. Il faisait beau et chaud, alors nous avons marché jusqu'au centre-ville. Le soir, nous avons dîné dans un petit restaurant près de la rivière. J'ai mangé du poisson et mon frère a pris une entrecôte. C'était un très bon week-end, et je vais revenir à Noël.",
            en: "Last month, I went to Bordeaux by train to see my brother. The journey took two hours. On the train, I read a book and looked at the countryside through the window. When I arrived, my brother was waiting for me at the station. The weather was nice and hot, so we walked to the town centre. In the evening, we had dinner in a small restaurant near the river. I had fish and my brother had a steak. It was a very good weekend, and I'm going to come back at Christmas.",
            questions: [
                { q: 'Why did he go to Bordeaux?', options: ['To see his brother', 'For work', 'For a concert'], answer: 0, why: '"Pour voir mon frère": to see my brother.' },
                { q: 'How long did the journey take?', options: ['Two hours', 'Four hours', 'Thirty minutes'], answer: 0, why: '"Le voyage a duré deux heures."' },
                { q: 'What was the weather like?', options: ['Nice and hot', 'Cold and rainy', 'Windy'], answer: 0, why: '"Il faisait beau et chaud."' },
                { q: 'When will he come back?', options: ['At Christmas', 'Next month', 'In the summer'], answer: 0, why: '"Je vais revenir à Noël" uses the futur proche: I am going to come back at Christmas.' }
            ]
        },
        {
            id: 'b-a2-teletravail', level: 'A2', subject: 'Work', kind: 'Article', title: 'Sophie travaille à la maison',
            fr: "Depuis un an, Sophie travaille à la maison trois jours par semaine. Elle est contente parce qu'elle ne perd plus une heure dans les transports. Le matin, elle se lève à huit heures au lieu de six heures et demie. Elle a installé un petit bureau dans sa chambre. Mais il y a aussi des inconvénients : elle voit moins ses collègues et parfois, elle se sent seule. Alors le mardi et le jeudi, elle va au bureau. Elle déjeune avec son équipe et elle rentre chez elle à pied. Pour Sophie, c'est le bon équilibre.",
            en: "For a year, Sophie has been working from home three days a week. She is happy because she no longer loses an hour commuting. In the morning, she gets up at eight instead of half past six. She has set up a small desk in her bedroom. But there are also downsides: she sees her colleagues less and sometimes she feels lonely. So on Tuesdays and Thursdays, she goes to the office. She has lunch with her team and walks home. For Sophie, it's the right balance.",
            questions: [
                { q: 'How many days a week does Sophie work at home?', options: ['Three', 'Two', 'Five'], answer: 0, why: '"Trois jours par semaine."' },
                { q: 'Why is she happy?', options: ['She no longer loses an hour commuting', 'She earns more money', 'She has a bigger flat'], answer: 0, why: '"Elle ne perd plus une heure dans les transports."' },
                { q: 'What is a downside for her?', options: ['She sees her colleagues less and sometimes feels lonely', 'Her internet is slow', 'She works more hours'], answer: 0, why: '"Elle voit moins ses collègues et parfois, elle se sent seule."' },
                { q: 'What does she do on Tuesdays and Thursdays?', options: ['She goes to the office', 'She works from home', 'She has a day off'], answer: 0, why: '"Le mardi et le jeudi, elle va au bureau."' }
            ]
        },
        {
            id: 'b-b1-jardins', level: 'B1', subject: 'Environment', kind: 'Article', title: 'Les jardins partagés',
            fr: "Dans de nombreuses villes françaises, des habitants transforment des terrains abandonnés en jardins partagés. L'idée est simple : chacun peut venir planter des légumes, des fleurs ou des herbes aromatiques, et la récolte est partagée entre les participants. À Lyon, par exemple, un ancien parking est devenu un jardin où une trentaine de voisins de tous les âges se retrouvent chaque semaine. « Avant, je ne connaissais personne dans mon immeuble », explique Marc, retraité. « Maintenant, j'ai des amis et je mange des tomates que j'ai cultivées moi-même. » Ces jardins ont aussi un rôle écologique : ils accueillent des insectes et rafraîchissent les quartiers pendant l'été. Cependant, ils dépendent souvent de bénévoles, et certains ferment faute de participants.",
            en: "In many French towns, residents are turning abandoned plots of land into shared gardens. The idea is simple: anyone can come and plant vegetables, flowers or herbs, and the harvest is shared among the participants. In Lyon, for example, a former car park has become a garden where around thirty neighbours of all ages meet every week. \"Before, I didn't know anyone in my building,\" explains Marc, a retired man. \"Now I have friends and I eat tomatoes I grew myself.\" These gardens also play an ecological role: they welcome insects and cool neighbourhoods down in summer. However, they often depend on volunteers, and some close for lack of participants.",
            questions: [
                { q: "Qu'est-ce qu'un jardin partagé ?", options: ['Un jardin où chacun peut cultiver et où la récolte est partagée', 'Un jardin privé derrière une maison', 'Un marché de fruits et légumes'], answer: 0, why: '"Chacun peut venir planter… et la récolte est partagée entre les participants."' },
                { q: "Qu'était le jardin de Lyon avant ?", options: ['Un parking', 'Une école', 'Une usine'], answer: 0, why: '"Un ancien parking est devenu un jardin."' },
                { q: "Qu'est-ce que le jardin a changé pour Marc ?", options: ["Il s'est fait des amis", 'Il a trouvé un travail', 'Il a déménagé'], answer: 0, why: '"Maintenant, j\'ai des amis."' },
                { q: 'Quel problème ont certains jardins ?', options: ['Ils manquent de participants', 'Ils coûtent trop cher', 'Ils attirent trop de touristes'], answer: 0, why: '"Certains ferment faute de participants": for lack of participants.' }
            ]
        },
        {
            id: 'b-b1-appartement', level: 'B1', subject: 'Home', kind: 'Dialogue', title: "Un appel à l'agence",
            fr: "— Agence Martin, bonjour.\n— Bonjour, je vous appelle au sujet de l'appartement de la rue Victor-Hugo. Il est toujours disponible ?\n— Oui, tout à fait. C'est un deux-pièces de quarante-cinq mètres carrés, au troisième étage avec ascenseur.\n— Et le loyer, c'est combien ?\n— Huit cent cinquante euros par mois, charges comprises.\n— D'accord. Est-ce qu'on peut avoir des animaux ? J'ai un chat.\n— Oui, les petits animaux sont acceptés.\n— Parfait. Est-ce que je pourrais le visiter cette semaine ?\n— Jeudi à dix-huit heures, ça vous irait ?\n— Ce serait parfait. Je m'appelle Claire Dubois.\n— Très bien, madame Dubois. À jeudi !",
            en: "— Martin Agency, hello.\n— Hello, I'm calling about the flat on rue Victor-Hugo. Is it still available?\n— Yes, absolutely. It's a two-room flat of forty-five square metres, on the third floor with a lift.\n— And how much is the rent?\n— Eight hundred and fifty euros a month, bills included.\n— All right. Are pets allowed? I have a cat.\n— Yes, small pets are accepted.\n— Perfect. Could I visit it this week?\n— Would Thursday at six p.m. suit you?\n— That would be perfect. My name is Claire Dubois.\n— Very good, Ms Dubois. See you on Thursday!",
            questions: [
                { q: "Combien de pièces a l'appartement ?", options: ['Deux', 'Trois', 'Quatre'], answer: 0, why: '"Un deux-pièces" is a flat with two main rooms.' },
                { q: 'Combien coûte le loyer ?', options: ['850 € par mois, charges comprises', '850 € par mois, sans les charges', '580 € par mois'], answer: 0, why: '"Huit cent cinquante euros par mois, charges comprises."' },
                { q: 'Pourquoi Claire parle-t-elle des animaux ?', options: ['Elle a un chat', 'Elle a un chien', "Elle n'aime pas les animaux"], answer: 0, why: '"J\'ai un chat."' },
                { q: 'Quand est la visite ?', options: ['Jeudi à 18 heures', 'Jeudi à 8 heures', 'Samedi à 18 heures'], answer: 0, why: '"Jeudi à dix-huit heures."' }
            ]
        },
        {
            id: 'b-b2-quatre-jours', level: 'B2', subject: 'Work', kind: 'Article', title: 'La semaine de quatre jours',
            fr: "Plusieurs entreprises françaises testent depuis peu la semaine de quatre jours, sans baisse de salaire. Les salariés travaillent un peu plus longtemps chaque jour, mais profitent d'un week-end de trois jours. Selon les premiers bilans, les résultats sont encourageants : moins d'arrêts maladie, des équipes plus motivées et une productivité stable, voire en hausse. Les défenseurs de ce modèle y voient un moyen d'attirer les jeunes talents et de mieux concilier vie professionnelle et vie personnelle. Pourtant, tout le monde n'est pas convaincu. Dans les secteurs où l'on doit accueillir du public tous les jours, comme le commerce ou la santé, l'organisation devient vite un casse-tête. D'autres craignent que des journées plus longues n'augmentent la fatigue. Pour les spécialistes, la réussite dépend surtout de la manière dont la réforme est préparée avec les équipes, plutôt que du nombre de jours lui-même.",
            en: "Several French companies have recently been trialling the four-day week, with no cut in pay. Employees work a little longer each day but enjoy a three-day weekend. According to the first reviews, the results are encouraging: less sick leave, more motivated teams and stable, or even rising, productivity. Supporters of this model see it as a way to attract young talent and to balance work and private life better. Yet not everyone is convinced. In sectors that must serve the public every day, such as retail or healthcare, organising it quickly becomes a headache. Others fear that longer days will increase fatigue. For experts, success depends above all on how the change is prepared with the teams, rather than on the number of days itself.",
            questions: [
                { q: 'En quoi consiste la semaine de quatre jours testée ?', options: ['Quatre jours de travail sans baisse de salaire, avec des journées un peu plus longues', 'Quatre jours de travail pour un salaire plus bas', 'Cinq journées de travail plus courtes'], answer: 0, why: '"Sans baisse de salaire… un peu plus longtemps chaque jour."' },
                { q: "Quel résultat n'est PAS mentionné ?", options: ['Une hausse des salaires', "Moins d'arrêts maladie", 'Des équipes plus motivées'], answer: 0, why: 'The article mentions less sick leave and more motivated teams, but not higher pay.' },
                { q: 'Pourquoi est-ce difficile dans le commerce ou la santé ?', options: ['Il faut accueillir du public tous les jours', 'Les salaires y sont trop bas', 'Les salariés refusent de changer'], answer: 0, why: '"Les secteurs où l\'on doit accueillir du public tous les jours."' },
                { q: 'Selon les spécialistes, de quoi dépend la réussite ?', options: ['De la préparation avec les équipes', 'Du nombre de jours travaillés', "De la taille de l'entreprise"], answer: 0, why: '"La réussite dépend surtout de la manière dont la réforme est préparée avec les équipes."' }
            ]
        },
        {
            id: 'b-b2-tourisme-lent', level: 'B2', subject: 'Travel', kind: 'Blog', title: 'Le tourisme lent',
            fr: "Prendre son temps : voilà la philosophie du « tourisme lent », qui séduit de plus en plus de voyageurs. Plutôt que d'enchaîner cinq villes en une semaine, ses adeptes préfèrent s'installer quelques jours au même endroit, se déplacer à pied, à vélo ou en train, et partager le quotidien des habitants. Pour Léa, qui a traversé la France à vélo l'été dernier, « on voit moins de monuments, mais on vit beaucoup plus de rencontres ». Ce mode de voyage présente aussi un intérêt écologique, puisqu'il limite l'usage de l'avion et de la voiture. Ses détracteurs rappellent toutefois qu'il demande du temps et qu'il n'est pas accessible à tous : avec cinq semaines de congés par an, rares sont ceux qui peuvent partir un mois entier. Le tourisme lent serait-il un luxe ? Ses partisans répondent qu'on peut l'appliquer à petite échelle, même le temps d'un week-end, à quelques kilomètres de chez soi.",
            en: "Taking your time: that's the philosophy of \"slow travel\", which is winning over more and more travellers. Rather than rushing through five cities in a week, its followers prefer to settle in one place for a few days, get around on foot, by bike or by train, and share the daily life of the locals. For Léa, who crossed France by bike last summer, \"you see fewer monuments, but you have many more encounters.\" This way of travelling also has an ecological benefit, since it limits the use of planes and cars. Its critics point out, however, that it takes time and is not open to everyone: with five weeks of holiday a year, few people can go away for a whole month. Is slow travel a luxury? Its supporters reply that it can be practised on a small scale, even for a weekend, a few kilometres from home.",
            questions: [
                { q: 'Que font les adeptes du tourisme lent ?', options: ['Ils restent plusieurs jours au même endroit et se déplacent doucement', 'Ils visitent beaucoup de villes en peu de temps', "Ils voyagent surtout en avion"], answer: 0, why: '"S\'installer quelques jours au même endroit, se déplacer à pied, à vélo ou en train."' },
                { q: "Qu'est-ce que Léa a gagné en voyageant à vélo ?", options: ['Plus de rencontres', 'Plus de monuments', "Plus d'argent"], answer: 0, why: '"On voit moins de monuments, mais on vit beaucoup plus de rencontres."' },
                { q: 'Quelle critique fait-on au tourisme lent ?', options: ["Il demande du temps que beaucoup n'ont pas", 'Il pollue beaucoup', 'Il est ennuyeux'], answer: 0, why: '"Il demande du temps et il n\'est pas accessible à tous."' },
                { q: 'Que répondent ses partisans ?', options: ["On peut le pratiquer à petite échelle, même un week-end près de chez soi", 'Il faut prendre un mois de vacances', "Il faut partir à l'étranger"], answer: 0, why: '"On peut l\'appliquer à petite échelle, même le temps d\'un week-end."' }
            ]
        }
    ].map(t => ({ ...t, skill: 'reading' }))
        // More ready-made texts (js/texts.js): Reading C1–C2, and Listening's own recordings A1–C2
        .concat(((window.EXTRA_TEXTS || {}).reading || []).map(t => ({ ...t, skill: 'reading' })))
        .concat(((window.EXTRA_TEXTS || {}).listening || []).map(t => ({ ...t, skill: 'listening' })))
        .map(t => ({ ...t, source: 'built-in' }));

    // ---------- The shared library (Supabase) and your own texts (this device) ----------
    let libraryReady = null;   // null = unknown, false = table missing
    const fromRow = (r) => ({ id: 'db-' + r.id, level: r.level, subject: r.subject || '', kind: r.kind || '', title: r.title, fr: r.fr, en: r.en || '',
        questions: Array.isArray(r.questions) ? r.questions : [], source: 'library' });
    async function loadLibrary(level) {
        try {
            const { data, error } = await db.from('library_texts').select('id, level, subject, kind, title, fr, en, questions')
                .eq('level', level).order('created_at', { ascending: false }).range(0, 59);
            if (error) { libraryReady = false; return []; }
            libraryReady = true;
            const list = (data || []).map(fromRow);
            const cache = store.get('lib_cache', {});
            list.forEach(t => { cache[t.id] = t; });
            store.set('lib_cache', cache);
            return list;
        } catch (e) { libraryReady = false; return []; }
    }
    // A library text opened from a link, when it is not cached on this device
    async function fetchOne(id) {
        const n = Number(String(id).replace(/^db-/, ''));
        if (!String(id).startsWith('db-') || !n) return null;
        try {
            const { data } = await db.from('library_texts').select('id, level, subject, kind, title, fr, en, questions').eq('id', n).maybeSingle();
            if (!data) return null;
            const t = fromRow(data);
            const cache = store.get('lib_cache', {}); cache[t.id] = t; store.set('lib_cache', cache);
            return t;
        } catch (e) { return null; }
    }
    async function saveToLibrary(t) {
        try {
            const { data: { user } } = await db.auth.getUser();
            if (!user) return null;
            const { data, error } = await db.from('library_texts').insert({
                level: t.level, subject: t.subject, kind: t.kind, title: t.title.slice(0, 120), fr: t.fr, en: t.en || null, questions: t.questions || [], created_by: user.id
            }).select('id').maybeSingle();
            if (error || !data) return null;
            return 'db-' + data.id;
        } catch (e) { return null; }
    }
    const mine = () => store.get('lib_mine', []);
    function keepMine(t) { store.set('lib_mine', [t, ...mine().filter(x => x.id !== t.id)].slice(0, 40)); }
    function find(id) {
        return BUILT_IN.find(t => t.id === id) || mine().find(t => t.id === id) || store.get('lib_cache', {})[id] || null;
    }

    // ---------- New texts from the AI ----------
    const LENGTH = { A1: '70-100', A2: '100-140', B1: '150-200', B2: '200-260', C1: '250-320', C2: '300-380' };
    const cleanQuestions = (qs) => (Array.isArray(qs) ? qs : []).filter(q => q && q.q && Array.isArray(q.options) && q.options.length >= 2)
        .map(q => ({ q: String(q.q), options: q.options.map(String).slice(0, 4), answer: Math.max(0, Math.min(q.options.length - 1, Number(q.answer) || 0)), why: String(q.why || '') })).slice(0, 6);
    async function generate({ subject, kind, level, purpose }) {
        const recent = mine().filter(x => x.subject === subject).slice(0, 5).map(x => x.title);
        const t = await askAI([
            { role: 'system', content: `You write original French ${purpose === 'listening' ? 'listening scripts (written to be read aloud: natural spoken French, short sentences)' : 'reading texts'} for CEFR level ${level} learners, in the style of TV5Monde and DELF exams.
Write about ${LENGTH[level] || '120-160'} words, at ${level} level (vocabulary and grammar of that level), with a concrete situation and real details.
Then write 4 multiple-choice comprehension questions, each with 3 options, in ${['A1', 'A2'].includes(level) ? 'simple English' : 'French'}. Put the correct option FIRST (answer: 0); the app shuffles them.
Reply with JSON only: {"title": "a short French title", "kind": "the type of text in one or two English words, e.g. Dialogue, Announcement", "fr": "the text (use \\n between paragraphs or speakers)", "en": "an English translation",
 "questions": [{"q": "question", "options": ["correct", "wrong", "wrong"], "answer": 0, "why": "one short English explanation quoting the text"}]}` },
            { role: 'user', content: `Subject: ${subject}\nType of text: ${kind}${recent.length ? '\nMake it different from: ' + recent.join('; ') : ''}` }
        ], { json: true, temperature: 0.9, feature: purpose === 'listening' ? 'listening-text' : 'reading-text' });
        if (!t.fr || String(t.fr).length < 40) throw new Error('The AI reply could not be read. Please try again.');
        const text = { id: '', level, subject, kind: String(kind).length > 30 ? String(t.kind || 'Recording').slice(0, 30) : kind, title: String(t.title || subject).slice(0, 120), fr: String(t.fr).trim(), en: String(t.en || '').trim(), questions: cleanQuestions(t.questions), source: 'library' };
        // Share it with everyone at this level; if that fails, keep it on this device
        const dbId = await saveToLibrary(text);
        if (dbId) {
            text.id = dbId;
            const cache = store.get('lib_cache', {}); cache[dbId] = text; store.set('lib_cache', cache);
        } else {
            text.id = 'mine-' + Date.now().toString(36); text.source = 'mine'; keepMine(text);
        }
        const made = store.get('lib_made', []); store.set('lib_made', [text.id, ...made].slice(0, 60));
        return text;
    }
    // A text you paste (from a book, an article…): kept on this device only
    async function fromPasted(fr, level) {
        let text = { id: 'mine-' + Date.now().toString(36), level, subject: 'Your text', kind: 'Your text', title: fr.split(/[.!?\n]/)[0].slice(0, 60) || 'My text', fr: fr.trim(), en: '', questions: [], source: 'mine' };
        try {
            const t = await askAI([
                { role: 'system', content: `A ${level} learner of French pasted a French text. Do not change the text. Reply with JSON only:
{"title": "a short French title", "en": "an English translation", "questions": [4 multiple-choice comprehension questions in ${['A1', 'A2'].includes(level) ? 'simple English' : 'French'}: {"q": "…", "options": ["correct", "wrong", "wrong"], "answer": 0, "why": "short English explanation"}]}` },
                { role: 'user', content: fr.slice(0, 6000) }
            ], { json: true, temperature: 0.3, feature: 'reading-own' });
            text = { ...text, title: String(t.title || text.title).slice(0, 120), en: String(t.en || ''), questions: cleanQuestions(t.questions) };
        } catch (err) { text.note = err.message; }
        keepMine(text);
        return text;
    }

    // ---------- Sentences and words ----------
    function sentences(fr) {
        return String(fr).split(/\n+/).flatMap(par => par.match(/[^.!?…]+(?:[.!?…]+(?:\s*[»"”])?|$)/g) || [par]).map(s => s.trim()).filter(s => /[\p{L}\p{N}]/u.test(s));
    }
    // Every form of the 296 verbs -> infinitive (built once, on the first word tap)
    let verbIndex = null;
    function buildVerbIndex() {
        verbIndex = {};
        const C = window.Conjugator;
        if (!C) return;
        const put = (w, inf) => { const k = plain(w); if (k.length > 1 && !verbIndex[k]) verbIndex[k] = inf; };
        C.verbs.forEach(v => put(v.inf, v.inf));
        ['suis', 'es', 'est', 'sommes', 'êtes', 'sont', 'été', 'étais', 'était', 'étions', 'étiez', 'étaient', 'serai', 'sera', 'serait', 'soit', 'sois']
            .forEach(w => { verbIndex[plain(w)] = 'être'; });
        ['ai', 'as', 'avons', 'avez', 'ont', 'eu', 'avais', 'avait', 'avions', 'aviez', 'avaient', 'aura', 'aurait', 'ait', 'aie']
            .forEach(w => { verbIndex[plain(w)] = 'avoir'; });
        C.verbs.forEach(v => C.tenses.forEach(t => C.forms(v, t.key).forEach(r => {
            // The last word is the verb itself (or its participle in compound tenses)
            const word = String(r.cf).split(/[\s']+/).pop() || '';
            const base = word.replace(/\(e\)|\(s\)/g, '');
            put(base, v.inf);
            if (/\(e\)/.test(word)) { put(base + 'e', v.inf); put(base + 'es', v.inf); }
            if (/\(s\)|s$/.test(word)) put(base.replace(/s$/, '') + 's', v.inf);
        })));
    }
    // Possible dictionary forms of a word as it appears in a text
    function candidates(raw) {
        let w = String(raw).toLowerCase().replace(/[’]/g, "'").replace(/^[^\p{L}]+|[^\p{L}'-]+$/gu, '');
        w = w.replace(/^(l|d|j|qu|n|s|m|t|c|jusqu|lorsqu|puisqu)'/, '');
        if (!w) return [];
        const out = [w];
        const add = (s) => { if (s && s.length > 1 && !out.includes(s)) out.push(s); };
        if (w.endsWith('aux')) add(w.slice(0, -3) + 'al');
        if (/[sx]$/.test(w)) add(w.slice(0, -1));
        if (w.endsWith('es')) add(w.slice(0, -2));
        const base = out[out.length - 1];
        [[/euses?$/, 'eux'], [/ives?$/, 'if'], [/ères?$/, 'er'], [/iennes?$/, 'ien'], [/ennes?$/, 'en'], [/elles?$/, 'el'], [/ales?$/, 'al'], [/es?$/, '']]
            .forEach(([re, rep]) => { if (re.test(w)) add(w.replace(re, rep)); if (re.test(base)) add(base.replace(re, rep)); });
        if (w.includes('-')) add(w.split('-')[0]);
        if (!verbIndex) buildVerbIndex();
        const inf = verbIndex[plain(w)] || verbIndex[plain(w.split('-')[0])];
        if (inf) add(inf);
        return out;
    }
    const POS = { n: 'noun', nm: 'noun (m)', nf: 'noun (f)', v: 'verb', adj: 'adjective', adv: 'adverb', prep: 'preposition', conj: 'conjunction', pro: 'pronoun', det: 'determiner', intj: 'interjection', npr: 'name' };
    const isVerb = (r) => String(r.Part_of_Speech || '').split(',').some(t => /^v/.test(t.trim())) && /(er|ir|re|oir)$/.test(String(r.French));
    const posLabel = (p, fr) => {
        if (fr && isVerb({ Part_of_Speech: p, French: fr })) return 'verb';
        const first = String(p || '').split(',')[0].replace(/\(.*\)|i$|pl$/g, '').trim();
        return POS[first] || POS[first.slice(0, 2)] || POS[first[0]] || '';
    };
    const PREFER_VERB = ['est', 'es', 'suis', 'sont', 'fait', 'faites', 'sens', 'vis', 'vit', 'sors', 'sort', 'pars', 'part', 'mens', 'tiens', 'tient', 'vient', 'viens', 'peux', 'peut', 'doit', 'dois', 'sais', 'sait', 'mets', 'met', 'lit', 'lis', 'dit', 'dis', 'avions'];
    const lookups = store.get('lib_words2', {});   // cache: word -> result
    async function lookupWord(raw) {
        const cands = candidates(raw);
        if (!cands.length) return null;
        if (lookups[cands[0]]) return lookups[cands[0]];
        try {
            const { data } = await db.from('vocabulary_bank').select('French, English, Part_of_Speech, IPA, Article, Noun_Gender').in('French', cands);
            if (data && data.length) {
                const rows = cands.map(c => data.find(r => String(r.French).toLowerCase() === c)).filter(Boolean);
                if (!rows.length) rows.push(data[0]);
                // Common verb forms that are also rare nouns (est = east, sens = sense…): the verb comes first
                const verbFirst = PREFER_VERB.includes(plain(cands[0])) && rows.find(isVerb);
                const best = verbFirst || rows[0];
                const other = rows.find(r => r !== best && String(r.French).toLowerCase() !== String(best.French).toLowerCase());
                const res = { fr: best.French, en: best.English || '', pos: posLabel(best.Part_of_Speech, best.French), ipa: String(best.IPA || '').replace(/^[\[\/]|[\]\/]$/g, ''),
                    article: best.Article || '', gender: best.Noun_Gender || '', base: best.French.toLowerCase() !== cands[0],
                    also: other ? { fr: other.French, en: other.English || '', pos: posLabel(other.Part_of_Speech, other.French) } : null };
                lookups[cands[0]] = res; store.set('lib_words2', lookups);
                return res;
            }
        } catch (e) { /* the word bank is not reachable: fall through to the AI option */ }
        return null;
    }
    // Rare words: ask the AI (all look-ups in one text count as one use)
    async function explainWord(raw, sentence, textId) {
        const r = await askAI([
            { role: 'system', content: 'You help a learner of French with one word in a sentence. Reply with JSON only: {"fr": "the dictionary form (infinitive for verbs, masculine singular for adjectives)", "en": "the English meaning in this sentence", "note": "one short note in English (grammar or usage), or empty"}' },
            { role: 'user', content: `Word: ${raw}\nSentence: ${sentence}` }
        ], { json: true, temperature: 0.2, feature: 'reading-word', session: 'words-' + textId });
        const res = { fr: String(r.fr || raw), en: String(r.en || ''), note: String(r.note || ''), ai: true };
        lookups[candidates(raw)[0]] = res; store.set('lib_words2', lookups);
        return res;
    }
    // Add a word to the Vocab review (it shows up in Vocab > Review)
    function addToReview(word, sentence) {
        // Same key as vocab.html's wordKey(): lower case, no article
        const key = String(word.fr).toLowerCase().replace(/[’]/g, "'").replace(/^(le |la |les |l'|un |une |des )/, '').replace(/\s+/g, ' ').trim();
        const progress = store.get('vocab_progress', {});
        if (!progress[key] || !progress[key].box) { progress[key] = { box: 1, due: Date.now() }; store.set('vocab_progress', progress); }
        const cache = store.get('vocab_words', {});
        const g = word.gender === 'm' || word.gender === 'f' ? word.gender : '';
        const art = String(word.article || '').trim();
        cache[key] = { key, fr: art ? (art.endsWith("'") ? art + word.fr : art + ' ' + word.fr) : word.fr, en: word.en, pron: '', note: word.note || '',
            ipa: word.ipa || '', gender: art ? g : '', pos: word.pos || '', register: '', exFr: sentence || '', exEn: '' };
        store.set('vocab_words', cache);
        return key;
    }
    function inReview(word) {
        const key = String(word.fr).toLowerCase().replace(/^(le |la |les |l'|un |une |des )/, '').trim();
        const p = store.get('vocab_progress', {})[key];
        return !!(p && p.box);
    }

    // ---------- Speech: one sentence at a time, with a callback at the end ----------
    function say(text, rate, onend) {
        if (!('speechSynthesis' in window) || !text) { if (onend) onend(); return; }
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(String(text).replace(/[«»—]/g, ' '));
        u.lang = 'fr-FR';
        u.rate = rate || 1;
        const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
        const voice = voices.find(v => v.lang === 'fr-FR') || voices.find(v => (v.lang || '').startsWith('fr'));
        if (voice) u.voice = voice;
        if (onend) { u.onend = onend; u.onerror = onend; }
        window.speechSynthesis.speak(u);
    }
    function stop() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
    // Can this device read French aloud? Calls back with '' (yes) or a message to show.
    function voiceCheck(cb) {
        if (!('speechSynthesis' in window)) { cb('This browser cannot read text aloud. Try Chrome, Edge or Safari.'); return; }
        let done = false;
        const check = (final) => {
            if (done) return;
            const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
            if (!voices.length && !final) return;   // still loading
            done = true;
            cb(voices.length && !voices.some(v => (v.lang || '').toLowerCase().startsWith('fr'))
                ? 'Your device has no French voice, so the audio may sound English. Add a French voice in your device settings (Speech or Text-to-speech), then reload this page.' : '');
        };
        check(false);
        try { window.speechSynthesis.addEventListener('voiceschanged', () => check(false)); } catch (e) {}
        setTimeout(() => check(true), 2500);
    }

    // ---------- Text with tappable words, and the word card ----------
    // Renders the French text: paragraphs -> sentences (data-s) -> words (data-w)
    function renderText(fr) {
        const esc = (x) => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        let n = 0;
        const html = String(fr).split(/\n+/).filter(p => p.trim()).map(par => '<p>' + sentences(par).map(sen =>
            `<span class="sent" data-s="${n++}">` + sen.split(/([\p{L}][\p{L}'’\-]*)/u).map((part, i) =>
                i % 2 ? `<span class="w" data-w="${esc(part)}" role="button" tabindex="0">${esc(part)}</span>` : esc(part)).join('') + '</span>').join(' ') + '</p>').join('');
        return { html, count: n };
    }
    function allSentences(fr) { return String(fr).split(/\n+/).filter(p => p.trim()).flatMap(sentences); }

    let pop = null, popWord = null;
    function closeWord() { if (pop) pop.classList.add('hidden'); document.querySelectorAll('.w.on').forEach(x => x.classList.remove('on')); }
    async function openWord(el, textId) {
        const esc = (x) => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        if (!pop) {
            pop = document.createElement('div');
            pop.id = 'word-pop';
            pop.setAttribute('role', 'dialog');
            pop.className = 'hidden fixed z-[60] inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 space-y-3';
            document.body.appendChild(pop);
            document.addEventListener('keydown', e => { if (e.key === 'Escape') closeWord(); });
        }
        document.querySelectorAll('.w.on').forEach(x => x.classList.remove('on'));
        el.classList.add('on');
        const raw = el.dataset.w;
        const sentence = (el.closest('.sent') || el).textContent;
        pop.classList.remove('hidden');
        const head = (title, sub) => `<div class="flex items-start justify-between gap-3">
            <div class="min-w-0"><div class="text-xl font-black text-slate-900 break-words">${title}</div>${sub ? `<div class="text-sm text-slate-500">${sub}</div>` : ''}</div>
            <button type="button" data-pop="close" class="shrink-0 w-9 h-9 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">✕</button></div>`;
        const buttons = (extra) => `<div class="flex flex-wrap gap-2">
            <button type="button" data-pop="say-word" class="min-h-[40px] px-3 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg">🔊 Word</button>
            <button type="button" data-pop="say-sent" class="min-h-[40px] px-3 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg">🔊 Sentence</button>${extra || ''}</div>`;
        pop.innerHTML = head(esc(raw), 'Looking it up…');
        const show = (r) => {
            popWord = r;
            const fullFr = r.article ? (r.article.endsWith("'") ? r.article + r.fr : r.article + ' ' + r.fr) : r.fr;
            const added = inReview(r);
            pop.innerHTML = head(esc(fullFr) + (r.ipa ? ` <span class="text-sm font-normal text-slate-400">/${esc(r.ipa)}/</span>` : ''),
                    [r.pos, r.base ? `from “${esc(raw)}”` : '', r.ai ? '✨ explained by AI' : ''].filter(Boolean).join(' · '))
                + `<div class="text-base text-slate-800">${esc(r.en) || '<span class="text-slate-400">No English meaning saved.</span>'}</div>`
                + (r.also ? `<div class="text-sm text-slate-500">Also <b class="text-slate-700">${esc(r.also.fr)}</b>${r.also.pos ? ' (' + esc(r.also.pos) + ')' : ''}: ${esc(r.also.en)}</div>` : '')
                + (r.note ? `<div class="text-sm text-slate-600 bg-slate-50 rounded-lg p-2">${esc(r.note)}</div>` : '')
                + buttons(`<button type="button" data-pop="add" ${added ? 'disabled' : ''} class="min-h-[40px] px-3 text-sm font-bold rounded-lg ${added ? 'text-emerald-700 bg-emerald-50' : 'text-white bg-slate-900 hover:bg-slate-800'}">${added ? '✓ In your review' : '＋ Add to my review'}</button>`);
        };
        const r = await lookupWord(raw);
        if (el.classList.contains('on') === false) return;   // another word was tapped meanwhile
        if (r) return show(r);
        popWord = null;
        pop.innerHTML = head(esc(raw), 'Not in the word bank')
            + `<p class="text-sm text-slate-600">This word is not in the app's word bank (names and rare words often aren't).</p>`
            + buttons(`<button type="button" data-pop="ai" class="min-h-[40px] px-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">✨ Explain it</button>`)
            + `<p class="text-xs text-slate-400">Explaining words in this text uses one AI use in total.</p><p data-pop="err" class="hidden text-sm text-rose-700"></p>`;
        pop.onclickWord = { raw, sentence, show, textId };
    }
    document.addEventListener('click', async (e) => {
        // A tap anywhere else (an answer, a button, the page) closes the word card so it doesn't cover the page
        if (pop && !pop.classList.contains('hidden') && !pop.contains(e.target) && !e.target.closest('.w')) closeWord();
        const b = e.target.closest('[data-pop]');
        if (!b || !pop || !pop.contains(b)) return;
        const act = b.dataset.pop;
        const sel = document.querySelector('.w.on');
        const sentence = sel ? (sel.closest('.sent') || sel).textContent : '';
        if (act === 'close') closeWord();
        if (act === 'say-word' && sel) say(popWord ? popWord.fr : sel.dataset.w, 0.85);
        if (act === 'say-sent') say(sentence, 0.9);
        if (act === 'add' && popWord) { addToReview(popWord, sentence); b.disabled = true; b.textContent = '✓ In your review'; b.className = 'min-h-[40px] px-3 text-sm font-bold rounded-lg text-emerald-700 bg-emerald-50'; }
        if (act === 'ai' && pop.onclickWord) {
            const w = pop.onclickWord;
            b.disabled = true; b.textContent = 'Thinking…';
            try { w.show(await explainWord(w.raw, w.sentence, w.textId)); }
            catch (err) { b.disabled = false; b.textContent = '✨ Explain it'; const m = pop.querySelector('[data-pop="err"]'); m.textContent = err.message; m.classList.remove('hidden'); }
        }
    });

    // ---------- Results ----------
    const results = () => store.get('lib_results', {});
    function saveResult(id, page, score, total) {
        if (typeof Activity !== 'undefined') Activity.record();
        // Keep your best score: a weaker retry does not replace it
        const all = results(), old = all[page + ':' + id];
        if (old && old.total && old.score / old.total > score / total) return;
        all[page + ':' + id] = { score, total, at: Date.now() }; store.set('lib_results', all);
        db.auth.getUser().then(({ data: { user } }) => {
            if (user) db.from('user_progress').upsert({ user_id: user.id, module_type: page, module_id: id, completed: true, score: Math.round(score / total * 20), updated_at: new Date() },
                { onConflict: 'user_id, module_type, module_id' });
        }).catch(() => {});
    }

    // Shuffle options the same way every time for a given text, keeping track of the right one
    function shuffled(q, seed) {
        const idx = q.options.map((_, i) => i);
        let h = 0; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
        for (let i = idx.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
        return idx.map(i => ({ text: q.options[i], right: i === q.answer }));
    }

    return { renderText, allSentences, openWord, closeWord, LEVELS, BUILT_IN, loadLibrary, fetchOne, libraryReady: () => libraryReady, mine, find, generate, fromPasted, sentences, candidates, lookupWord, explainWord,
        addToReview, inReview, say, stop, voiceCheck, results, saveResult, shuffled, plain, store };
})();
