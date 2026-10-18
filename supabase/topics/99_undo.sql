-- 99_undo.sql: removes the topics 01_topics_to_c2.sql added (your original topics stay).
delete from "French-schema".reading_topics where (level, title) in (values
('A1','Moi et ma famille'),('A1','Ma maison'),('A1','Les courses'),('A1','Ma journée'),
('A2','Vacances & Voyages'),('A2','Au restaurant'),('A2','La ville'),('A2','Loisirs & Sport'),
('B1','Le monde du travail'),('B1','Santé au quotidien'),('B1','Environnement'),('B1','Médias & Réseaux'),('B1','Études & Formation'),
('C1','Sciences & Éthique'),('C1','Langue & Identité'),('C1','Démocratie & Participation'),('C1','Travail & Sens'),('C1','Art & Société'),
('C2','Philosophie & Morale'),('C2','Littérature & Création'),('C2','Mémoire & Histoire'),('C2','Pouvoir & Langage'),('C2','Science & Incertitude'));
delete from "French-schema".listening_topics where (level, title) in (values
('C1','Débat radio sur la semaine de quatre jours'),('C1','Conférence sur la mémoire et le cerveau'),
('C2','Chronique humoristique sur les travers de la langue'),('C2','Table ronde sur le roman et l''histoire'),
('C2','Plaidoirie d''une avocate devant la cour'),('C2','Émission philosophique sur le libre arbitre'));
select (select count(*) from "French-schema".reading_topics) as reading_topics, (select count(*) from "French-schema".listening_topics) as listening_topics;
