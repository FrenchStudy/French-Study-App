-- 15_more_connectors.sql
-- Adds 110 connectors to the topic Connectors & Small Words (theme 3), after its 31 words, in the order of the
-- Learn chapters (js/chapters-data.js). Made by tools/connectors/connectors.py.
-- A connector already in vocabulary_bank is reused: our own list ('core') first, then the C1 list ('advanced'),
-- never a noun (so « or » is the connector, not « gold »). The others are added as new entries
-- (source = 'advanced', no frequency Rank, so the frequency sets are unchanged), with an example sentence.
-- Safe to run more than once. 15_undo_more_connectors.sql removes the topic links again.

do $$
declare
  base int;
  missing text;
begin
  create temp table more_conn (n int, french text, pos text, english text, ex_fr text, ex_en text, word_id bigint) on commit drop;
  insert into more_conn (n, french, pos, english, ex_fr, ex_en) values
    (1, 'de plus', 'adv', 'what''s more, moreover', 'Il est doué. De plus, il est très motivé.', 'He is talented. What''s more, he is very motivated.'),
    (2, 'en outre', 'adv', 'furthermore, moreover', 'L''analyse est précise. En outre, elle est complète.', 'The analysis is precise. Furthermore, it is complete.'),
    (3, 'par ailleurs', 'adv', 'besides, also', 'Le budget est serré. Par ailleurs, nous devons recruter.', 'The budget is tight. Besides, we need to recruit.'),
    (4, 'non seulement… mais aussi', 'conj', 'not only… but also', 'Elle est non seulement intelligente, mais aussi très gentille.', 'She is not only intelligent but also very kind.'),
    (5, 'quant à', 'prep', 'as for', 'J''aime le bleu ; quant à Paul, il préfère le rouge.', 'I like blue; as for Paul, he prefers red.'),
    (6, 'de la même façon', 'adv', 'in the same way, similarly', 'Il a travaillé dur. De la même façon, elle s''est beaucoup investie.', 'He worked hard. In the same way, she put a lot into it.'),
    (7, 'soit… soit', 'conj', 'either… or', 'Il viendra soit aujourd''hui, soit demain.', 'He will come either today or tomorrow.'),
    (8, 'l''un ou l''autre', 'pro', 'one or the other', 'Je prends l''un ou l''autre, ça m''est égal.', 'I''ll take one or the other, I don''t mind.'),
    (9, 'd''un côté… de l''autre', 'adv', 'on one side… on the other', 'D''un côté, j''accepte ; de l''autre, j''ai des doutes.', 'On one side I accept; on the other, I have doubts.'),
    (10, 'd''un autre côté', 'adv', 'on the other hand', 'Il fait froid. D''un autre côté, c''est très beau.', 'It''s cold. On the other hand, it''s very beautiful.'),
    (11, 'c''est-à-dire', 'adv', 'that is to say, i.e.', 'J''ai besoin d''un véhicule, c''est-à-dire d''une voiture.', 'I need a vehicle, that is to say a car.'),
    (12, 'autrement dit', 'adv', 'in other words', 'Il est parti, autrement dit, il nous a laissés seuls.', 'He left; in other words, he left us alone.'),
    (13, 'en d''autres termes', 'adv', 'in other words', 'C''est un succès, en d''autres termes, un triomphe.', 'It is a success; in other words, a triumph.'),
    (14, 'en fait', 'adv', 'in fact, actually', 'Je pensais qu''il était riche. En fait, il a des dettes.', 'I thought he was rich. In fact, he has debts.'),
    (15, 'en réalité', 'adv', 'in reality, actually', 'Il semble heureux. En réalité, il est inquiet.', 'He seems happy. In reality, he is worried.'),
    (16, 'en effet', 'adv', 'indeed (because…)', 'Il ne viendra pas ce soir. En effet, il est malade.', 'He won''t come tonight: he is indeed ill.'),
    (17, 'effectivement', 'adv', 'indeed, that''s right', 'Vous aviez raison : effectivement, le magasin est fermé.', 'You were right: indeed, the shop is closed.'),
    (18, 'par exemple', 'adv', 'for example', 'J''aime les fruits, par exemple les pommes.', 'I like fruit, for example apples.'),
    (19, 'notamment', 'adv', 'notably, in particular', 'J''ai beaucoup d''amis, notamment Pierre et Marie.', 'I have many friends, notably Pierre and Marie.'),
    (20, 'en particulier', 'adv', 'in particular', 'J''aime la cuisine italienne, en particulier les pâtes.', 'I like Italian food, in particular pasta.'),
    (21, 'entre autres', 'adv', 'among other things', 'Il a étudié plusieurs langues, entre autres l''espagnol et l''italien.', 'He studied several languages, among others Spanish and Italian.'),
    (22, 'c''est le cas de', 'adv', 'this is the case for', 'Beaucoup d''élèves sont absents ; c''est le cas de Paul.', 'Many pupils are absent; this is the case for Paul.'),
    (23, 'c''est ainsi que', 'conj', 'this is how', 'Il a travaillé sans relâche. C''est ainsi qu''il a réussi.', 'He worked tirelessly. This is how he succeeded.'),
    (24, 'cependant', 'adv', 'however', 'Elle est riche. Cependant, elle est modeste.', 'She is rich. However, she is modest.'),
    (25, 'pourtant', 'adv', 'yet, and yet', 'Il a beaucoup révisé ; pourtant, il a raté l''examen.', 'He revised a lot; yet he failed the exam.'),
    (26, 'toutefois', 'adv', 'however, nevertheless', 'Le plan est risqué. Toutefois, il peut réussir.', 'The plan is risky. Nevertheless, it can succeed.'),
    (27, 'néanmoins', 'adv', 'nevertheless', 'Il a fait des erreurs. Néanmoins, je lui fais confiance.', 'He made mistakes. Nonetheless, I trust him.'),
    (28, 'bien que', 'conj', 'although', 'Bien qu''il soit malade, il est allé travailler.', 'Although he is ill, he went to work.'),
    (29, 'quoique', 'conj', 'although', 'Elle travaille encore, quoiqu''elle soit fatiguée.', 'She is still working, although she is tired.'),
    (30, 'même si', 'conj', 'even if, even though', 'Je viendrai, même si je suis en retard.', 'I will come, even if I am late.'),
    (31, 'certes', 'adv', 'admittedly… but', 'Certes, il est rapide, mais il se fatigue vite.', 'Admittedly he is fast, but he tires quickly.'),
    (32, 'malgré', 'prep', 'despite', 'Malgré la pluie, nous sommes sortis.', 'Despite the rain, we went out.'),
    (33, 'en dépit de', 'prep', 'in spite of', 'Il a réussi en dépit de ses difficultés.', 'He succeeded in spite of his difficulties.'),
    (34, 'en revanche', 'adv', 'on the other hand', 'Le quartier est bruyant. En revanche, il est très bien desservi.', 'The area is noisy. On the other hand, it has very good transport links.'),
    (35, 'au contraire', 'adv', 'on the contrary', 'Ce n''était pas un échec ; au contraire, c''était une réussite.', 'It wasn''t a failure; on the contrary, it was a success.'),
    (36, 'à l''inverse', 'adv', 'conversely', 'Les prix ont baissé. À l''inverse, la demande a augmenté.', 'Prices have fallen. Conversely, demand has risen.'),
    (37, 'contrairement à', 'prep', 'unlike, contrary to', 'Contrairement à ce qu''il avait dit, il est venu.', 'Contrary to what he had said, he came.'),
    (38, 'tandis que', 'conj', 'whereas', 'Mon frère est blond, tandis que je suis brun.', 'My brother is blond, whereas I am dark-haired.'),
    (39, 'alors que', 'conj', 'whereas', 'Il travaille, alors que nous nous reposons.', 'He is working, whereas we are resting.'),
    (40, 'au lieu de', 'prep', 'instead of', 'Il est resté au lieu de partir.', 'He stayed instead of leaving.'),
    (41, 'or', 'conj', 'yet, now (a new fact)', 'Il voulait partir. Or, il devait travailler ce week-end.', 'He wanted to leave. Yet he had to work this weekend.'),
    (42, 'sauf', 'prep', 'except', 'J''ai lu tous les livres, sauf le dernier.', 'I have read all the books except the last one.'),
    (43, 'à part', 'prep', 'apart from', 'J''aime tout le monde, à part lui.', 'I like everyone apart from him.'),
    (44, 'mis à part', 'prep', 'apart from', 'Tout est bon, mis à part le dessert.', 'Everything is good, apart from the dessert.'),
    (45, 'excepté', 'prep', 'except', 'Tous sont venus, excepté Paul.', 'Everyone came except Paul.'),
    (46, 'hormis', 'prep', 'except for', 'Personne n''était là, hormis le directeur.', 'No one was there except for the director.'),
    (47, 'en dehors de', 'prep', 'apart from, outside', 'En dehors du travail, il se passionne pour la musique.', 'Apart from work, he is passionate about music.'),
    (48, 'à défaut de', 'prep', 'for lack of', 'À défaut de preuves, l''accusé a été libéré.', 'For lack of evidence, the accused was released.'),
    (49, 'comme', 'conj', 'as, since', 'Comme il pleuvait, nous sommes restés à la maison.', 'As it was raining, we stayed at home.'),
    (50, 'puisque', 'conj', 'since (as you know)', 'Puisque tu sais nager, aide-moi.', 'Since you can swim, help me.'),
    (51, 'étant donné que', 'conj', 'given that', 'Étant donné que vous avez de l''expérience, vous êtes choisi.', 'Given that you have experience, you are chosen.'),
    (52, 'vu que', 'conj', 'seeing that', 'Vu qu''il est tard, on devrait partir.', 'Seeing that it''s late, we should leave.'),
    (53, 'attendu que', 'conj', 'whereas, considering that', 'Attendu que les faits sont établis, le tribunal rend son jugement.', 'Considering that the facts are established, the court gives its judgment.'),
    (54, 'du fait que', 'conj', 'due to the fact that', 'L''erreur vient du fait qu''il n''a pas vérifié.', 'The mistake comes from the fact that he didn''t check.'),
    (55, 'dans la mesure où', 'conj', 'insofar as', 'Vous êtes responsable, dans la mesure où vous saviez.', 'You are responsible, insofar as you knew.'),
    (56, 'sous prétexte que', 'conj', 'on the pretext that', 'Il est parti sous prétexte qu''il était malade.', 'He left on the pretext that he was ill.'),
    (57, 'grâce à', 'prep', 'thanks to', 'Il a réussi grâce à son travail.', 'He succeeded thanks to his work.'),
    (58, 'à cause de', 'prep', 'because of', 'Le train est en retard à cause de la grève.', 'The train is late because of the strike.'),
    (59, 'en raison de', 'prep', 'due to', 'La route est fermée en raison de la neige.', 'The road is closed due to the snow.'),
    (60, 'par suite de', 'prep', 'as a result of', 'Il a été absent par suite d''une maladie.', 'He was absent as a result of an illness.'),
    (61, 'sous la pression de', 'prep', 'under pressure from', 'Il a démissionné sous la pression de sa hiérarchie.', 'He resigned under pressure from his superiors.'),
    (62, 'par', 'prep', 'out of (a feeling)', 'Elle a agi par peur.', 'She acted out of fear.'),
    (63, 'ainsi', 'adv', 'thus, so', 'Il a réussi. Ainsi, il a obtenu une promotion.', 'He succeeded. Thus he got a promotion.'),
    (64, 'par conséquent', 'adv', 'consequently', 'Le plan a échoué. Par conséquent, nous devons recommencer.', 'The plan failed. Consequently, we must start again.'),
    (65, 'en conséquence', 'adv', 'as a result', 'Le budget est dépassé. En conséquence, le projet est annulé.', 'The budget has been exceeded. As a result, the project is cancelled.'),
    (66, 'conséquemment', 'adv', 'consequently', 'Il a triché. Conséquemment, il a été sanctionné.', 'He cheated. Consequently, he was punished.'),
    (67, 'de ce fait', 'adv', 'as a result', 'Il a triché ; de ce fait, il a été renvoyé.', 'He cheated; as a result, he was expelled.'),
    (68, 'si bien que', 'conj', 'so much so that', 'Il a beaucoup plu, si bien que la route est inondée.', 'It rained a lot, so much so that the road is flooded.'),
    (69, 'c''est pourquoi', 'adv', 'that''s why', 'Il a menti, c''est pourquoi je ne lui parle plus.', 'He lied, that''s why I don''t talk to him any more.'),
    (70, 'c''est pour cette raison que', 'conj', 'that''s the reason why', 'Il est compétent ; c''est pour cette raison que je l''ai choisi.', 'He is competent; that''s the reason why I chose him.'),
    (71, 'd''où', 'prep', 'hence', 'Il y a eu un accident, d''où les embouteillages.', 'There was an accident, hence the traffic jams.'),
    (72, 'en conclusion', 'adv', 'in conclusion', 'En conclusion, la preuve est irréfutable.', 'In conclusion, the evidence is irrefutable.'),
    (73, 'pour conclure', 'adv', 'to conclude', 'Pour conclure, le projet a atteint ses objectifs.', 'To conclude, the project has met its objectives.'),
    (74, 'en résumé', 'adv', 'in short, to sum up', 'En résumé, nous devons agir vite.', 'In short, we must act quickly.'),
    (75, 'en définitive', 'adv', 'ultimately, in the end', 'En définitive, il a obtenu son diplôme.', 'In the end, he got his degree.'),
    (76, 'en un mot', 'adv', 'in a word', 'La soirée était animée, les invités étaient joyeux. En un mot, un succès.', 'The evening was lively, the guests were happy. In a word, a success.'),
    (77, 'finalement', 'adv', 'in the end', 'Il a beaucoup hésité, mais finalement il a dit oui.', 'He hesitated a lot, but in the end he said yes.'),
    (78, 'au cas où', 'conj', 'in case', 'Au cas où vous seriez en retard, appelez-nous.', 'In case you are late, call us.'),
    (79, 'dans le cas où', 'conj', 'in the event that', 'Dans le cas où il pleuvrait, nous resterions à la maison.', 'In the event that it rains, we would stay at home.'),
    (80, 'dans l''hypothèse où', 'conj', 'assuming that, if ever', 'Dans l''hypothèse où il refuserait, que ferions-nous ?', 'If he were to refuse, what would we do?'),
    (81, 'à condition que', 'conj', 'provided that', 'Je t''aide, à condition que tu m''écoutes.', 'I will help you, provided that you listen to me.'),
    (82, 'à moins que', 'conj', 'unless', 'Je pars, à moins que tu ne m''arrêtes.', 'I am leaving, unless you stop me.'),
    (83, 'en admettant que', 'conj', 'assuming that', 'En admettant qu''il ait raison, que faire ?', 'Assuming that he is right, what should we do?'),
    (84, 'en supposant que', 'conj', 'supposing that', 'En supposant que le train soit à l''heure, nous arriverons à midi.', 'Supposing the train is on time, we will arrive at noon.'),
    (85, 'à supposer que', 'conj', 'supposing that', 'À supposer qu''il soit d''accord, nous pouvons commencer.', 'Supposing he agrees, we can start.'),
    (86, 'probablement', 'adv', 'probably', 'Il viendra probablement demain.', 'He will probably come tomorrow.'),
    (87, 'sans doute', 'adv', 'probably', 'Il a sans doute oublié la réunion.', 'He has probably forgotten the meeting.'),
    (88, 'apparemment', 'adv', 'apparently', 'Apparemment, il est malade.', 'Apparently, he is ill.'),
    (89, 'pour que', 'conj', 'so that', 'Je parle lentement pour que tu comprennes.', 'I speak slowly so that you understand.'),
    (90, 'afin que', 'conj', 'so that, in order that', 'Je parle fort afin que tu m''entendes.', 'I speak loudly so that you can hear me.'),
    (91, 'de peur que', 'conj', 'for fear that', 'Elle se cache de peur qu''on ne la voie.', 'She is hiding for fear that someone might see her.'),
    (92, 'de crainte que', 'conj', 'for fear that', 'Il se tait de crainte qu''on ne se moque de lui.', 'He keeps quiet for fear that people will laugh at him.'),
    (93, 'en vue de', 'prep', 'with a view to', 'Il travaille en vue de sa promotion.', 'He is working with a view to his promotion.'),
    (94, 'quand', 'conj', 'when', 'Je t''appellerai quand j''arriverai.', 'I will call you when I arrive.'),
    (95, 'lorsque', 'conj', 'when', 'Lorsque je suis arrivé, il dormait.', 'When I arrived, he was asleep.'),
    (96, 'dès que', 'conj', 'as soon as', 'Dès que j''ai le temps, je le fais.', 'As soon as I have time, I do it.'),
    (97, 'aussitôt que', 'conj', 'as soon as', 'Aussitôt qu''il arrive, dis-le-moi.', 'As soon as he arrives, tell me.'),
    (98, 'pendant que', 'conj', 'while', 'Il a cuisiné pendant que nous parlions.', 'He cooked while we were talking.'),
    (99, 'au moment où', 'conj', 'at the moment when', 'Il est arrivé au moment où nous partions.', 'He arrived at the moment when we were leaving.'),
    (100, 'avant que', 'conj', 'before', 'Finis tes devoirs avant qu''il ne revienne.', 'Finish your homework before he comes back.'),
    (101, 'après que', 'conj', 'after', 'Je partirai après que tu auras fini.', 'I will leave after you have finished.'),
    (102, 'depuis', 'prep', 'since, for', 'Je l''attends depuis deux heures.', 'I have been waiting for him for two hours.'),
    (103, 'depuis que', 'conj', 'since', 'Je suis heureux depuis que tu es là.', 'I have been happy since you''ve been here.'),
    (104, 'dès lors que', 'conj', 'from the moment that', 'Dès lors qu''il a signé, il était engagé.', 'From the moment he signed, he was committed.'),
    (105, 'en même temps que', 'prep', 'at the same time as', 'Elle est arrivée en même temps que moi.', 'She arrived at the same time as me.'),
    (106, 'tout d''abord', 'adv', 'first of all', 'Tout d''abord, vérifions les faits.', 'First of all, let''s check the facts.'),
    (107, 'premièrement / deuxièmement', 'adv', 'firstly / secondly', 'Premièrement, lisez le texte. Deuxièmement, répondez aux questions.', 'Firstly, read the text. Secondly, answer the questions.'),
    (108, 'en premier lieu / en second lieu', 'adv', 'in the first place / secondly', 'En premier lieu, signez le contrat.', 'In the first place, sign the contract.'),
    (109, 'en dernier lieu', 'adv', 'lastly', 'En dernier lieu, nous ferons le bilan.', 'Lastly, we will review the results.'),
    (110, 'd''une part… d''autre part', 'adv', 'on the one hand… on the other', 'D''une part, la méthode est rapide ; d''autre part, elle coûte cher.', 'On the one hand, the method is fast; on the other, it is expensive.');

  -- 1. Reuse a connector that is already in the word bank (not a noun)
  update more_conn m set word_id = (
    select v.id from "French-schema".vocabulary_bank v
    where lower(trim(v."French")) = lower(m.french)
      and coalesce(v."Part_of_Speech", '') not in ('nm', 'nf', 'n', 'nm,nf', 'nf,nm')
      and v.source in ('core', 'advanced')
    order by (v.source = 'core') desc, v.id
    limit 1);

  -- 2. Add the others
  insert into "French-schema".vocabulary_bank
         (id, "French", "Article", "Noun_Gender", "Part_of_Speech", "English", "SentenceFR", "SentenceEN", source)
  overriding system value
  select (select coalesce(max(id), 0) from "French-schema".vocabulary_bank) + row_number() over (order by m.n),
         m.french, null, null, m.pos, m.english, m.ex_fr, m.ex_en, 'advanced'
  from more_conn m
  where m.word_id is null;

  update more_conn m set word_id = (
    select v.id from "French-schema".vocabulary_bank v
    where v.source = 'advanced' and v."French" = m.french
    order by v.id limit 1)
  where m.word_id is null;

  select string_agg(french, ', ') into missing from more_conn where word_id is null;
  if missing is not null then
    raise exception 'Could not find or add: %. Nothing was changed.', missing;
  end if;

  -- 3. Link them to the topic, after the words it already has
  select coalesce(max(sort_order), 0) into base from "French-schema".word_themes
   where theme_id = 3 and word_id not in (select word_id from more_conn);
  insert into "French-schema".word_themes (theme_id, word_id, sort_order)
  select 3, m.word_id, base + m.n from more_conn m
  on conflict (theme_id, word_id) do nothing;
end $$;

-- Keep the id counter ahead of the new rows (does nothing if id has no counter).
select setval(pg_get_serial_sequence('"French-schema".vocabulary_bank', 'id'), (select max(id) from "French-schema".vocabulary_bank));

-- You should see one row: Connectors & Small Words with 141 words
select t.id, t.title, count(*) as words_in_topic
from "French-schema".themes t
join "French-schema".word_themes w on w.theme_id = t.id
where t.id = 3
group by t.id, t.title;
