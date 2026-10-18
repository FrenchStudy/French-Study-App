-- 01_topics_to_c2.sql
-- Adds topic cards so every level from A1 to C2 has some, in Reading and in Listening.
-- Before: reading_topics only had B2, listening_topics stopped at C1 (2 topics).
-- Each topic is added once: running the file again changes nothing.
-- Undo: 99_undo.sql.

-- ---------- Reading: broad themes, like the B2 ones ----------
insert into "French-schema".reading_topics (id, level, category, title, description)
overriding system value
select (select coalesce(max(id), 0) from "French-schema".reading_topics) + row_number() over (order by n.n),
       n.level, n.category, n.title, n.description
from (values
(1,  'A1', 'Moi et ma famille', 'Moi et ma famille', 'Introducing yourself, family members and pets.'),
(2,  'A1', 'Ma maison', 'Ma maison', 'Rooms, furniture and where things are.'),
(3,  'A1', 'Les courses', 'Les courses', 'Shops, food, quantities and prices.'),
(4,  'A1', 'Ma journée', 'Ma journée', 'Daily routine, times and days of the week.'),
(5,  'A2', 'Vacances & Voyages', 'Vacances & Voyages', 'Holidays, transport, hotels and postcards.'),
(6,  'A2', 'Au restaurant', 'Au restaurant', 'Menus, ordering, tastes and reviews.'),
(7,  'A2', 'La ville', 'La ville', 'Places in town, directions and neighbourhoods.'),
(8,  'A2', 'Loisirs & Sport', 'Loisirs & Sport', 'Hobbies, clubs, matches and weekends.'),
(9,  'B1', 'Le monde du travail', 'Le monde du travail', 'Jobs, interviews, colleagues and workplace life.'),
(10, 'B1', 'Santé au quotidien', 'Santé au quotidien', 'Healthy habits, sleep, food and the doctor.'),
(11, 'B1', 'Environnement', 'Environnement', 'Recycling, energy and local green initiatives.'),
(12, 'B1', 'Médias & Réseaux', 'Médias & Réseaux', 'News, social media and online life.'),
(13, 'B1', 'Études & Formation', 'Études & Formation', 'School, university, exchanges and learning languages.'),
(14, 'C1', 'Sciences & Éthique', 'Sciences & Éthique', 'Bioethics, research choices and scientific controversies.'),
(15, 'C1', 'Langue & Identité', 'Langue & Identité', 'Languages, accents, Francophonie and belonging.'),
(16, 'C1', 'Démocratie & Participation', 'Démocratie & Participation', 'Voting, citizen assemblies, trust in institutions.'),
(17, 'C1', 'Travail & Sens', 'Travail & Sens', 'Meaningful work, career changes and the future of work.'),
(18, 'C1', 'Art & Société', 'Art & Société', 'Public art, museums, censorship and the role of artists.'),
(19, 'C2', 'Philosophie & Morale', 'Philosophie & Morale', 'Freedom, happiness, duty and justice: classic questions today.'),
(20, 'C2', 'Littérature & Création', 'Littérature & Création', 'Writers, styles, literary prizes and the act of writing.'),
(21, 'C2', 'Mémoire & Histoire', 'Mémoire & Histoire', 'Collective memory, commemorations and rewriting the past.'),
(22, 'C2', 'Pouvoir & Langage', 'Pouvoir & Langage', 'Rhetoric, political speech, euphemism and propaganda.'),
(23, 'C2', 'Science & Incertitude', 'Science & Incertitude', 'Doubt, expertise, risk and how science handles the unknown.')
) as n(n, level, category, title, description)
where not exists (
    select 1 from "French-schema".reading_topics r where r.level = n.level and r.title = n.title
);

-- ---------- Listening: situations you would hear ----------
insert into "French-schema".listening_topics (id, level, category, title, description)
overriding system value
select (select coalesce(max(id), 0) from "French-schema".listening_topics) + row_number() over (order by n.n),
       n.level, n.category, n.title, n.description
from (values
(1, 'C1', 'Débats & Opinions', 'Débat radio sur la semaine de quatre jours', 'Two guests disagree on productivity, well-being and the economy.'),
(2, 'C1', 'Sciences & Technologie', 'Conférence sur la mémoire et le cerveau', 'A neuroscientist explains how we remember and why we forget.'),
(3, 'C2', 'Chroniques & Humour', 'Chronique humoristique sur les travers de la langue', 'A witty radio column on jargon, clichés and verbal tics.'),
(4, 'C2', 'Culture & Littérature', 'Table ronde sur le roman et l''histoire', 'Writers and historians debate fiction, truth and memory.'),
(5, 'C2', 'Justice & Société', 'Plaidoirie d''une avocate devant la cour', 'A closing speech in court: rhetoric, emotion and legal argument.'),
(6, 'C2', 'Philosophie & Idées', 'Émission philosophique sur le libre arbitre', 'A radio programme on free will, choice and responsibility.')
) as n(n, level, category, title, description)
where not exists (
    select 1 from "French-schema".listening_topics l where l.level = n.level and l.title = n.title
);

-- Keep the id counters ahead of the new rows (does nothing if id has no counter).
select setval(pg_get_serial_sequence('"French-schema".reading_topics', 'id'), (select max(id) from "French-schema".reading_topics));
select setval(pg_get_serial_sequence('"French-schema".listening_topics', 'id'), (select max(id) from "French-schema".listening_topics));

select 'reading' as skill, level, count(*) as topics from "French-schema".reading_topics group by level
union all
select 'listening', level, count(*) from "French-schema".listening_topics group by level
order by 1, 2;
