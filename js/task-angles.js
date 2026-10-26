// js/task-angles.js - specific angles for the AI writing and speaking tasks.
// The subject chips ("Travel", "Work"…) are too broad on their own: the AI fell back to bland
// questions such as "Give your opinion about public transport". Each new task now gets one concrete
// angle from these lists, so it is about a real situation or a real debate, as in the DELF and TCF.
// "basic" angles are personal, everyday situations (used from A1 to A2);
// "debate" angles are proposals or controversies to take a position on (used from B1 to C2).
window.TASK_ANGLES = {
    'Yourself': {
        basic: ['your first day in a new city', 'a typical weekend for you', 'a skill you are proud of', 'the person you were five years ago', 'your favourite place to relax', 'what you want to learn this year'],
        debate: ['social media profiles show a fake version of ourselves', 'personality tests used by employers to choose candidates', 'should people share their salary openly with friends', 'being an only child versus growing up with siblings', 'starting a new life abroad after 40', 'a "digital detox" week without a smartphone']
    },
    'Family and friends': {
        basic: ['organising a birthday party for a friend', 'a family tradition you love', 'a friend who is moving abroad', 'inviting your neighbours to dinner', 'a holiday with your grandparents', 'a gift for your brother or sister'],
        debate: ['grandparents looking after grandchildren every day', 'young adults living with their parents until 30', 'friendships that exist only online', 'parents tracking their teenagers by phone', 'a four-day week to spend more time with family', 'adult children paying for their parents\' care home']
    },
    'Daily life': {
        basic: ['your morning routine on a busy day', 'a problem with your neighbour\'s noise', 'losing your keys or your phone', 'a new bakery opening in your street', 'a day when everything went wrong', 'sharing housework with flatmates'],
        debate: ['shops open on Sundays', 'cash disappearing in favour of card and phone payments', 'banning cars from the city centre', 'a compulsory "right to disconnect" from work emails at night', 'free public transport in your city', 'self-checkout tills replacing cashiers']
    },
    'Food': {
        basic: ['a dish from your country you would cook for a French friend', 'ordering at a restaurant with a food allergy', 'a picnic with friends', 'your favourite market', 'learning to cook a new recipe', 'a meal that went badly'],
        debate: ['a tax on sugary drinks', 'vegetarian-only menus one day a week in school canteens', 'banning fast-food advertising aimed at children', 'eating insects as a source of protein', 'home delivery apps and the end of cooking', 'buying only local and seasonal food']
    },
    'Travel': {
        basic: ['planning a weekend trip by train', 'a lost suitcase at the airport', 'booking a hotel room by phone', 'your best holiday memory', 'visiting a French-speaking city for the first time', 'a camping trip in the rain'],
        debate: ['banning short domestic flights when a train takes under 3 hours', 'a tourist tax to fight overtourism in Venice or Paris', 'free public transport paid for by local taxes', 'short-term rentals like Airbnb pushing locals out of city centres', 'travelling alone rather than with a group', 'a "flight quota" limiting each person\'s flights per year']
    },
    'Home': {
        basic: ['describing your ideal flat', 'moving into a new home', 'a problem with your landlord', 'decorating your room', 'finding a flatmate', 'a neighbour asking for help'],
        debate: ['co-living: sharing a house with strangers as an adult', 'capping rents in big cities', 'tiny houses as a solution to the housing crisis', 'banning gas boilers in new homes', 'living in the countryside and working remotely', 'empty second homes taxed more heavily']
    },
    'Work': {
        basic: ['your first job or a summer job', 'a job interview', 'asking your boss for a day off', 'a colleague who helped you', 'your ideal job', 'a day at work that went wrong'],
        debate: ['the four-day working week', 'working from home full time', 'employers checking candidates\' social media', 'a universal basic income', 'artificial intelligence replacing office jobs', 'raising the retirement age']
    },
    'Studies': {
        basic: ['your first day at a new school', 'preparing for an exam', 'a teacher who inspired you', 'a student exchange abroad', 'joining a language course', 'choosing what to study'],
        debate: ['banning phones in schools', 'free university for everyone', 'a gap year before university', 'school uniforms', 'online courses replacing classroom teaching', 'students using AI to write their homework']
    },
    'Health and sport': {
        basic: ['joining a sports club', 'a visit to the doctor', 'your plan to sleep better', 'a running race with friends', 'a healthy week of meals', 'a small accident during sport'],
        debate: ['compulsory daily sport at school', 'smartwatches tracking our health data', 'banning smoking on beaches and terraces', 'paying people to stay healthy with lower insurance', 'professional athletes\' very high salaries', 'hosting the Olympic Games: worth the cost for a city?']
    },
    'Free time': {
        basic: ['a new hobby you want to try', 'a concert or festival you went to', 'your plans for a free Saturday', 'joining a volunteer group', 'a board game evening', 'a book or film you recommend'],
        debate: ['children\'s screen time limits', 'video games as a sport at the Olympics', 'volunteering made compulsory for young people', 'free entry to all museums', 'reading paper books versus e-books', 'holidays without the internet']
    },
    'Shopping': {
        basic: ['returning a shirt that does not fit', 'shopping at a market', 'buying a present for a friend', 'a sale at your favourite shop', 'buying a second-hand bike', 'a problem with an online order'],
        debate: ['fast fashion and the price of cheap clothes', 'banning Black Friday advertising', 'second-hand shopping becoming the norm', 'a "right to repair" for phones and appliances', 'small shops versus online giants', 'buy-now-pay-later and young people\'s debt']
    },
    'Technology': {
        basic: ['your phone breaks the day before a trip', 'helping a grandparent use a smartphone', 'an app you use every day', 'buying a new computer', 'a video call with family abroad', 'a week without the internet'],
        debate: ['a minimum age of 15 for social networks', 'facial recognition cameras in public places', 'artificial intelligence in hospitals', 'self-driving cars on our roads', 'children having a smartphone before 12', 'paying for news and apps instead of seeing ads']
    },
    'Environment': {
        basic: ['sorting your rubbish at home', 'a clean-up day in your neighbourhood', 'cycling to work or school', 'saving water and energy at home', 'a park or garden you like', 'a very hot summer in your town'],
        debate: ['a ban on single-use plastic', 'a carbon tax on petrol', 'eating less meat for the climate', 'wind turbines near villages', 'nuclear power as a climate solution', 'banning private jets']
    },
    'Culture and media': {
        basic: ['a film you saw recently', 'a museum visit', 'your favourite singer or band', 'a festival in your town', 'how you get the news', 'a book you could not stop reading'],
        debate: ['subtitled versus dubbed films', 'public money for the arts', 'fake news on social media and who should stop it', 'streaming platforms and the future of cinemas', 'quotas for French songs on the radio', 'returning museum objects to their countries of origin']
    },
    'Society': {
        basic: ['helping an elderly neighbour', 'a new community garden', 'welcoming a newcomer to your town', 'a local election in your town', 'a charity you support', 'a change you would like in your neighbourhood'],
        debate: ['lowering the voting age to 16', 'compulsory civic service for young people', 'remote villages losing their schools and doctors', 'making voting compulsory', 'speed cameras and lower speed limits in towns', 'citizens\' assemblies deciding local laws']
    }
};

// One angle for a subject and level, avoiding the ones already used (null for a subject typed by the student).
window.pickTaskAngle = function (subject, level, used = []) {
    const set = window.TASK_ANGLES[subject];
    if (!set) return null;
    const list = ['A1', 'A2'].includes(level) ? set.basic : set.debate;
    const fresh = list.filter(a => !used.includes(a));
    const pool = fresh.length ? fresh : list;
    return pool[Math.floor(Math.random() * pool.length)];
};

// True when the AI wrote a vague "give your opinion about X" task with no situation to react to.
window.isGenericTask = function (t) {
    const s = `${t.en || ''} ${t.fr || ''}`.toLowerCase();
    return /(why|whether) you like or dislike|like or dislike it|give your (personal )?opinion (about|on) (using |the )?[a-z ]{0,30}\./.test(s)
        || /pourquoi vous (l'|les )?aimez ou (ne l'|ne les )?aimez pas|donnez votre (avis|opinion) sur (l'utilisation d)?[^.,]{0,30}\./.test(s);
};
