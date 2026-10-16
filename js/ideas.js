// js/ideas.js - ideas that keep the skill pages fresh.
// IDEAS: subjects per level, tagged by goal (travel, work, exam, fun), for the rotating suggestions
// and for new texts when the library runs out. THEMES: one theme a week, shared by the four skills.
window.IDEAS = (function () {
    const T = 'travel', W = 'work', E = 'exam', F = 'fun';
    const BY_LEVEL = {
        A1: [['My morning routine', F], ['Ordering at a café', T], ['A new flatmate', F], ['Asking the way in town', T], ['My family photo', F], ['Buying a train ticket', T],
            ['At the bakery', T], ['My first day at work', W], ['A birthday party', F], ['The weather this week', F], ['My favourite food', F], ['At the hotel reception', T],
            ['Introducing yourself in class', E], ['A message to a friend', E], ['Shopping for clothes', T], ['My town', E], ['Pets', F], ['A weekend at the beach', T],
            ['Booking a doctor\'s appointment', E], ['My office', W], ['Sports I like', F], ['At the market', T], ['A postcard from holiday', E], ['Opening hours and prices', T]],
        A2: [['A trip that went wrong', T], ['Moving to a new city', F], ['A job interview', W], ['Neighbours', F], ['A holiday in the mountains', T], ['Cooking a family recipe', F],
            ['Lost luggage', T], ['A day off work', W], ['Online shopping problems', E], ['A concert or a festival', F], ['Renting a flat', E], ['Learning to drive', F],
            ['A visit to the museum', T], ['Working from home', W], ['A weekend in Paris', T], ['Healthy habits', E], ['A school memory', F], ['Volunteering', E],
            ['Booking a restaurant', T], ['A team meeting', W], ['Changing your plans', E], ['A camping trip', T], ['Second-hand shopping', F], ['Your favourite series', F]],
        B1: [['Social media and friendship', E], ['A difficult customer', W], ['Travelling on a small budget', T], ['City life or country life', E], ['A complaint to a company', E], ['Learning a language abroad', T],
            ['Eating less meat', E], ['A colleague leaves the company', W], ['Night trains', T], ['A charity event', F], ['Noise in the neighbourhood', E], ['The four-day week', W],
            ['A festival in your region', T], ['Phones at school', E], ['Starting a small business', W], ['A sports challenge', F], ['Recycling at home', E], ['A road trip with friends', T],
            ['Video games', F], ['Moving abroad for work', W], ['A cooking competition', F], ['Tourism and local residents', T], ['Public transport strikes', E], ['A lost and found story', F]],
        B2: [['Artificial intelligence at work', W], ['Overtourism', T], ['Fast fashion', E], ['The right to disconnect', W], ['Remote villages coming back to life', T], ['Fake news', E],
            ['Cities and heatwaves', E], ['Changing career at 40', W], ['Cashless payments', E], ['Shared gardens', F], ['Medical deserts', E], ['Night life and noise', F],
            ['Electric cars', T], ['Reality TV', F], ['Gender pay gap', W], ['Repairing instead of throwing away', E], ['Citizens\' assemblies', E], ['Slow travel', T],
            ['Loneliness in cities', E], ['Sport and money', F], ['Influencers and advertising', E], ['Local food and short supply chains', F], ['Housing for students', E], ['Museums in the digital age', F]],
        C1: [['Regulating artificial intelligence', E], ['The future of work', W], ['Energy transition and geopolitics', E], ['Freedom of speech online', E], ['Ethics of tourism', T], ['Urban planning and inequality', E],
            ['The attention economy', E], ['Science and public trust', E], ['Relocating industry', W], ['Cultural heritage and mass tourism', T], ['Universal basic income', E], ['Privacy and surveillance', E],
            ['Translation and machine learning', W], ['Leadership and management styles', W], ['The value of travel in a climate crisis', T], ['Memory and history in public spaces', F], ['Cinema and streaming', F], ['Degrowth', E]]
    };
    const THEMES = [
        { id: 'logement', fr: 'Le logement', en: 'Housing', emoji: '🏠', reading: 'Finding a flat as a student', listening: 'Calling an estate agency about a flat', writing: 'An email to your landlord about a problem in the flat', speaking: 'Visiting a flat to rent' },
        { id: 'voyage', fr: 'Voyager autrement', en: 'Travel', emoji: '🚆', reading: 'Travelling by train across Europe', listening: 'Announcements at a station', writing: 'A review of a trip you took', speaking: 'Changing a ticket at the station' },
        { id: 'travail', fr: 'Le monde du travail', en: 'Work', emoji: '💼', reading: 'A new way of working', listening: 'A team meeting', writing: 'A cover letter for a job', speaking: 'A job interview' },
        { id: 'sante', fr: 'Santé et bien-être', en: 'Health', emoji: '🩺', reading: 'Sleep and screens', listening: 'Booking a doctor\'s appointment', writing: 'Advice to a friend who is stressed', speaking: 'At the pharmacy' },
        { id: 'cuisine', fr: 'À table !', en: 'Food', emoji: '🍽️', reading: 'Eating local and seasonal food', listening: 'Ordering in a restaurant', writing: 'Your favourite recipe', speaking: 'Planning a dinner with friends' },
        { id: 'ville', fr: 'Vivre en ville', en: 'City life', emoji: '🏙️', reading: 'Green spaces in the city', listening: 'A local radio news item', writing: 'A message to the town hall', speaking: 'Asking for directions' },
        { id: 'loisirs', fr: 'Loisirs et passions', en: 'Free time', emoji: '🎨', reading: 'A new hobby that is trending', listening: 'Friends planning the weekend', writing: 'Inviting friends to an event', speaking: 'Talking about your hobbies' },
        { id: 'environnement', fr: 'La planète', en: 'Environment', emoji: '🌱', reading: 'Repairing instead of throwing away', listening: 'A report about recycling', writing: 'Your opinion on banning plastic', speaking: 'A debate about cars in city centres' },
        { id: 'numerique', fr: 'La vie numérique', en: 'Digital life', emoji: '📱', reading: 'Online scams and how to avoid them', listening: 'A call to customer service', writing: 'A complaint about an online order', speaking: 'Explaining a phone problem in a shop' },
        { id: 'etudes', fr: 'Apprendre', en: 'Learning', emoji: '🎓', reading: 'Studying abroad', listening: 'Enrolling at a language school', writing: 'An application for a course', speaking: 'Talking about your studies' },
        { id: 'culture', fr: 'Culture et sorties', en: 'Culture', emoji: '🎭', reading: 'A festival in a small town', listening: 'A museum audio guide', writing: 'A review of a film or a concert', speaking: 'Buying tickets for a show' },
        { id: 'relations', fr: 'Famille et amis', en: 'Relationships', emoji: '💬', reading: 'Living with your parents longer', listening: 'A conversation between neighbours', writing: 'A thank-you message', speaking: 'Organising a family celebration' }
    ];
    // ISO-like week number: the theme changes every Monday
    function weekNo(d = new Date()) {
        const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
        return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7) + t.getUTCFullYear() * 53;
    }
    const thisWeek = () => THEMES[weekNo() % THEMES.length];
    function shuffle(list) { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
    // A fresh handful of suggestions: your goal first, then a random mix; never the same set twice in a row
    function suggestions(level, goal, n = 6) {
        const all = BY_LEVEL[level] || BY_LEVEL.A1;
        const mine = shuffle(all.filter(x => x[1] === goal)), rest = shuffle(all.filter(x => x[1] !== goal));
        const pick = [...mine.slice(0, 2), ...rest].slice(0, n).map(x => x[0]);
        return shuffle(pick);
    }
    const randomIdea = (level, goal) => suggestions(level, goal, 1)[0];
    // ---------- Shared pieces of the skill pages' feed ----------
    const esc = (x) => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
    const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
    // What this week's theme produced on each skill page, per level: theme_texts["logement:B1"] = { reading: id, … }
    function remember(skill, lv, id) { const th = thisWeek(), all = get('theme_texts', {}), k = th.id + ':' + lv; all[k] = { ...(all[k] || {}), [skill]: id }; put('theme_texts', all); }
    const made = (skill, lv) => (get('theme_texts', {})[thisWeek().id + ':' + lv] || {})[skill];
    function markDone(skill, lv) { const th = thisWeek(), all = get('theme_done', {}), k = th.id + ':' + lv; all[k] = { ...(all[k] || {}), [skill]: true }; put('theme_done', all); }
    function isDone(skill, lv) {
        if ((get('theme_done', {})[thisWeek().id + ':' + lv] || {})[skill]) return true;
        const id = made(skill, lv);
        if (!id) return false;
        if (skill === 'writing') return !!get('writing_results', {})[id];
        if (skill === 'speaking') return !!get('speak_results', {})[id];
        return !!get('lib_results', {})[skill + ':' + id];
    }
    function themeCard(page, lv) {
        const th = thisWeek();
        const rows = [['reading', '📖', 'Read'], ['listening', '🎧', 'Listen'], ['writing', '✍️', 'Write'], ['speaking', '🗣️', 'Speak']].map(([sk, ic, label]) => {
            const ok = isDone(sk, lv), here = sk === page;
            return `<a href="${sk}.html?theme=${th.id}" ${here ? 'data-theme-start' : ''} class="flex items-center gap-3 px-3 py-2 rounded-xl ${here ? 'bg-amber-100 hover:bg-amber-200' : 'hover:bg-amber-100/60'} transition">
                <span class="text-lg" aria-hidden="true">${ic}</span>
                <span class="min-w-0 flex-1"><span class="block text-sm font-bold text-slate-900">${label}${here ? ' · here' : ''}</span><span class="block text-xs text-slate-600 truncate">${esc(th[sk])}</span></span>
                <span class="shrink-0 text-sm ${ok ? 'text-emerald-600' : 'text-slate-300'}" aria-label="${ok ? 'done' : 'not done yet'}">${ok ? '✓' : '○'}</span></a>`;
        }).join('');
        return `<section id="theme-card" class="rounded-3xl bg-amber-50 border border-amber-200 p-4 space-y-2">
            <div><div class="text-xs font-bold uppercase tracking-wider text-amber-700">This week's theme</div>
            <div class="text-lg font-black text-slate-900">${th.emoji} ${esc(th.fr)} <span class="text-sm font-semibold text-slate-500">· ${esc(th.en)}</span></div>
            <p class="text-xs text-slate-600">The same theme in all four skills, at your level. A new theme every Monday.</p></div>
            <div class="space-y-0.5">${rows}</div>
        </section>`;
    }
    // The big "Up next for you" card
    function upNextCard({ lv, badge, title, body, bodyLang, meta, note, start, icon }) {
        return `<section id="up-next" class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-5 sm:p-6 flex flex-col gap-3 shadow-lg shadow-indigo-200">
            <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-indigo-100">Up next for you · ${lv}</span>
                ${badge ? `<span class="text-[11px] font-bold uppercase tracking-wide bg-white/15 px-2 py-0.5 rounded-full truncate max-w-[50%]">${esc(badge)}</span>` : ''}
            </div>
            <h2 class="text-xl sm:text-2xl font-black leading-tight">${icon || ''}${esc(title)}</h2>
            ${body ? `<p class="text-sm sm:text-base text-indigo-50 leading-relaxed line-clamp-3" ${bodyLang ? `lang="${bodyLang}"` : ''}>${esc(body)}</p>` : ''}
            ${meta ? `<p class="text-xs text-indigo-200">${esc(meta)}</p>` : ''}
            ${note ? `<p class="text-xs text-indigo-100">${esc(note)}</p>` : ''}
            <div class="flex flex-wrap items-center gap-2 mt-1">
                <button type="button" data-start class="min-h-[48px] px-6 bg-white text-indigo-700 hover:bg-indigo-50 font-black rounded-xl">${start || '▶ Start'}</button>
                <button type="button" data-shuffle class="min-h-[48px] px-4 bg-white/15 hover:bg-white/25 font-bold rounded-xl">🔀 Something else</button>
            </div>
            <p id="topic-error" class="hidden text-sm bg-white text-rose-700 rounded-lg p-2"></p>
        </section>`;
    }
    // A queue that hands out a different item on every visit (and never the same first item twice in a row)
    function queue(key, items, idOf) {
        const q = shuffle(items), last = get('feed_last_' + key, null);
        if (q.length > 1 && idOf(q[0]) === last) q.push(q.shift());
        return q;
    }
    const seen = (key, id) => put('feed_last_' + key, id);

    return { BY_LEVEL, THEMES, thisWeek, suggestions, randomIdea, shuffle, themeCard, upNextCard, remember, made, markDone, isDone, queue, seen, esc };
})();
