-- 11_environment_words.sql
-- Grows the Environment & Climate topic (theme 31) with the words from the TCF environment list
-- and the climate word list: 61 new entries (source = 'topic', no frequency Rank, so the
-- frequency sets are unchanged), plus links to 16 words already in the 5,000-word list.
-- The app groups the topic into 11 chapters of about 10 words, each with a short story
-- (js/chapters-data.js). Also gives « émission » its environment meaning.
-- Run 04–07 first. Safe to run more than once. 11_undo_environment_words.sql removes it.

-- 1. New words, with an example sentence each
do $$ begin
insert into "French-schema".vocabulary_bank
       (id, "French", "Article", "Noun_Gender", "Part_of_Speech", "English", "SentenceFR", "SentenceEN", source)
overriding system value
select (select coalesce(max(id), 0) from "French-schema".vocabulary_bank) + row_number() over (order by n.n),
       n.french, n.article, n.gender, n.pos, n.english, n.ex_fr, n.ex_en, 'topic'
from (values
(1, 'changement climatique', 'le', 'm', 'nm', 'climate change', 'Le changement climatique touche tous les pays.', 'Climate change affects every country.'),
(2, 'réchauffement climatique', 'le', 'm', 'nm', 'global warming', 'Le réchauffement climatique fait fondre les glaciers.', 'Global warming is melting the glaciers.'),
(3, 'effet de serre', 'l''', 'm', 'nm', 'greenhouse effect', 'L''effet de serre retient la chaleur autour de la Terre.', 'The greenhouse effect keeps heat around the Earth.'),
(4, 'gaz à effet de serre', 'les', 'm', 'nmpl', 'greenhouse gases', 'Les voitures émettent des gaz à effet de serre.', 'Cars give off greenhouse gases.'),
(5, 'empreinte carbone', 'l''', 'f', 'nf', 'carbon footprint', 'Prendre l''avion augmente ton empreinte carbone.', 'Flying increases your carbon footprint.'),
(6, 'neutralité carbone', 'la', 'f', 'nf', 'carbon neutrality', 'La France vise la neutralité carbone en 2050.', 'France is aiming for carbon neutrality by 2050.'),
(7, 'fonte des glaciers', 'la', 'f', 'nf', 'melting of the glaciers', 'La fonte des glaciers s''accélère chaque été.', 'The glaciers melt faster every summer.'),
(8, 'montée des eaux', 'la', 'f', 'nf', 'rising sea levels', 'La montée des eaux menace les villes côtières.', 'Rising sea levels threaten coastal towns.'),
(9, 'événements météorologiques extrêmes', 'les', 'm', 'nmpl', 'extreme weather events', 'Les événements météorologiques extrêmes sont de plus en plus fréquents.', 'Extreme weather events are more and more frequent.'),
(10, 'pollution de l''air', 'la', 'f', 'nf', 'air pollution', 'La pollution de l''air est forte dans les grandes villes.', 'Air pollution is high in big cities.'),
(11, 'déforestation', 'la', 'f', 'nf', 'deforestation', 'La déforestation détruit l''habitat des orangs-outans.', 'Deforestation destroys the orangutans'' habitat.'),
(12, 'perte de biodiversité', 'la', 'f', 'nf', 'loss of biodiversity', 'La perte de biodiversité inquiète les scientifiques.', 'The loss of biodiversity worries scientists.'),
(13, 'écosystème', 'l''', 'm', 'nm', 'ecosystem', 'Une forêt est un écosystème fragile.', 'A forest is a fragile ecosystem.'),
(14, 'espèces en danger', 'les', 'f', 'nfpl', 'endangered species', 'Le tigre fait partie des espèces en danger.', 'The tiger is one of the endangered species.'),
(15, 'faune et la flore', 'la', 'f', 'nf', 'wildlife and plants', 'Ce parc protège la faune et la flore.', 'This park protects the wildlife and plants.'),
(16, 'habitat naturel', 'l''', 'm', 'nm', 'natural habitat', 'L''ours a perdu son habitat naturel.', 'The bear has lost its natural habitat.'),
(17, 'disparition des espèces', 'la', 'f', 'nf', 'extinction of species', 'La disparition des espèces s''accélère.', 'Species are dying out faster and faster.'),
(18, 'préservation', 'la', 'f', 'nf', 'preservation', 'La préservation des océans est urgente.', 'Preserving the oceans is urgent.'),
(19, 'réserve naturelle', 'la', 'f', 'nf', 'nature reserve', 'On a vu des flamants roses dans la réserve naturelle.', 'We saw flamingos in the nature reserve.'),
(20, 'reboisement', 'le', 'm', 'nm', 'reforestation', 'Le reboisement aide à lutter contre l''érosion.', 'Reforestation helps fight erosion.'),
(21, 'énergies renouvelables', 'les', 'f', 'nfpl', 'renewable energies', 'Les énergies renouvelables remplacent peu à peu le charbon.', 'Renewable energies are slowly replacing coal.'),
(22, 'énergie solaire', 'l''', 'f', 'nf', 'solar energy', 'Nos panneaux produisent de l''énergie solaire.', 'Our panels produce solar energy.'),
(23, 'énergie éolienne', 'l''', 'f', 'nf', 'wind energy', 'L''énergie éolienne vient des éoliennes.', 'Wind energy comes from wind turbines.'),
(24, 'combustibles fossiles', 'les', 'm', 'nmpl', 'fossil fuels', 'Le pétrole et le charbon sont des combustibles fossiles.', 'Oil and coal are fossil fuels.'),
(25, 'sobriété énergétique', 'la', 'f', 'nf', 'using less energy', 'La sobriété énergétique, c''est baisser le chauffage d''un degré.', 'Using less energy means turning the heating down a degree.'),
(26, 'tri sélectif', 'le', 'm', 'nm', 'waste sorting', 'Le tri sélectif est obligatoire dans ma ville.', 'Sorting waste is compulsory in my town.'),
(27, 'compostage', 'le', 'm', 'nm', 'composting', 'Avec le compostage, les épluchures deviennent de l''engrais.', 'With composting, peelings become fertiliser.'),
(28, 'déchets plastiques', 'les', 'm', 'nmpl', 'plastic waste', 'Les déchets plastiques finissent souvent dans la mer.', 'Plastic waste often ends up in the sea.'),
(29, 'plastique à usage unique', 'le', 'm', 'nm', 'single-use plastic', 'Les pailles en plastique à usage unique sont interdites.', 'Single-use plastic straws are banned.'),
(30, 'zéro déchet', 'le', 'm', 'nm', 'zero waste', 'Elle vit en zéro déchet depuis deux ans.', 'She has lived zero-waste for two years.'),
(31, 'gaspillage alimentaire', 'le', 'm', 'nm', 'food waste', 'Le gaspillage alimentaire coûte cher aux familles.', 'Food waste costs families a lot.'),
(32, 'consommation responsable', 'la', 'f', 'nf', 'responsible consumption', 'La consommation responsable, c''est acheter moins, mais mieux.', 'Responsible consumption means buying less, but better.'),
(33, 'circuit court', 'le', 'm', 'nm', 'buying local, short supply chain', 'J''achète mes légumes en circuit court, directement au producteur.', 'I buy my vegetables locally, straight from the farmer.'),
(34, 'd''occasion', null, null, 'phrase', 'second-hand', 'J''ai acheté un vélo d''occasion.', 'I bought a second-hand bike.'),
(35, 'économie circulaire', 'l''', 'f', 'nf', 'circular economy', 'Dans l''économie circulaire, on répare et on réutilise.', 'In a circular economy, things are repaired and reused.'),
(36, 'agriculture biologique', 'l''', 'f', 'nf', 'organic farming', 'L''agriculture biologique n''utilise pas de pesticides chimiques.', 'Organic farming uses no chemical pesticides.'),
(37, 'écoblanchiment', 'l''', 'm', 'nm', 'greenwashing', 'Cette publicité « verte », c''est de l''écoblanchiment.', 'This "green" advert is greenwashing.'),
(38, 'transports en commun', 'les', 'm', 'nmpl', 'public transport', 'Je prends les transports en commun pour aller au travail.', 'I take public transport to work.'),
(39, 'transports propres', 'les', 'm', 'nmpl', 'clean transport', 'La ville investit dans les transports propres.', 'The city is investing in clean transport.'),
(40, 'covoiturage', 'le', 'm', 'nm', 'carpooling', 'Grâce au covoiturage, on partage les frais d''essence.', 'With carpooling, we share the cost of petrol.'),
(41, 'autopartage', 'l''', 'm', 'nm', 'car-sharing', 'Avec l''autopartage, plus besoin d''acheter une voiture.', 'With car-sharing, there''s no need to buy a car.'),
(42, 'piste cyclable', 'la', 'f', 'nf', 'cycle lane', 'Une nouvelle piste cyclable longe le canal.', 'A new cycle lane runs along the canal.'),
(43, 'dégrader', null, null, 'v', 'to damage, to degrade', 'La pollution dégrade les monuments.', 'Pollution damages monuments.'),
(44, 'développement durable', 'le', 'm', 'nm', 'sustainable development', 'Le développement durable pense aux générations futures.', 'Sustainable development thinks of future generations.'),
(45, 'transition écologique', 'la', 'f', 'nf', 'ecological transition', 'La transition écologique demande des efforts de tous.', 'The ecological transition needs everyone''s effort.'),
(46, 'réseaux d''eau', 'les', 'm', 'nmpl', 'water supply networks', 'Les réseaux d''eau perdent beaucoup d''eau à cause des fuites.', 'Water networks lose a lot of water through leaks.'),
(47, 'écoresponsabilité', 'l''', 'f', 'nf', 'eco-responsibility', 'L''écoresponsabilité devient un critère pour les entreprises.', 'Eco-responsibility is becoming a criterion for companies.'),
(48, 'geste écoresponsable', 'un', 'm', 'nm', 'an eco-friendly action', 'Éteindre la lumière est un geste écoresponsable simple.', 'Switching off the light is a simple eco-friendly action.'),
(49, 'lutter contre', null, null, 'v', 'to fight against', 'Nous devons lutter contre le gaspillage.', 'We must fight against waste.'),
(50, 'sensibiliser', null, null, 'v', 'to raise awareness', 'Cette vidéo sensibilise les jeunes au tri.', 'This video makes young people aware of sorting waste.'),
(51, 'sensibilisation', 'la', 'f', 'nf', 'awareness-raising', 'Une campagne de sensibilisation commence à l''école.', 'An awareness campaign is starting at school.'),
(52, 'taxer', null, null, 'v', 'to tax', 'Le gouvernement veut taxer les vols courts.', 'The government wants to tax short flights.'),
(53, 'taxe carbone', 'la', 'f', 'nf', 'carbon tax', 'La taxe carbone rend l''essence plus chère.', 'The carbon tax makes petrol more expensive.'),
(54, 'prendre conscience de', null, null, 'phrase', 'to become aware of', 'Il faut prendre conscience de l''urgence climatique.', 'We must become aware of the climate emergency.'),
(55, 'passer à l''action', null, null, 'phrase', 'to take action', 'Assez de discours : il est temps de passer à l''action.', 'Enough talk: it''s time to take action.'),
(56, 'faire sa part', null, null, 'phrase', 'to do your part', 'Chacun peut faire sa part, même avec de petits gestes.', 'Everyone can do their part, even with small actions.'),
(57, 'montrer l''exemple', null, null, 'phrase', 'to lead by example', 'Les élus doivent montrer l''exemple.', 'Elected officials must lead by example.'),
(58, 'à long terme', null, null, 'phrase', 'in the long term', 'À long terme, les énergies renouvelables coûtent moins cher.', 'In the long term, renewable energies cost less.'),
(59, 'à court terme', null, null, 'phrase', 'in the short term', 'À court terme, ce projet coûte cher.', 'In the short term, this project is expensive.'),
(60, 'générations futures', 'les', 'f', 'nfpl', 'future generations', 'Nous devons protéger la planète pour les générations futures.', 'We must protect the planet for future generations.'),
(61, 'il est urgent de', null, null, 'phrase', 'it is urgent to', 'Il est urgent de réduire nos émissions.', 'It is urgent to cut our emissions.')
) as n(n, french, article, gender, pos, english, ex_fr, ex_en)
where not exists (
    select 1 from "French-schema".vocabulary_bank v
    where v.source = 'topic' and v."French" = n.french
);
end $$;

-- Keep the id counter ahead of the new rows (does nothing if id has no counter).
select setval(pg_get_serial_sequence('"French-schema".vocabulary_bank', 'id'), (select max(id) from "French-schema".vocabulary_bank));

-- 2. Link them to the topic: the new words, and the ones already in the 5,000-word list.
-- The chapters in the app set the order, so these all go after the topic's first 49 words.
do $$ begin
insert into "French-schema".word_themes (theme_id, word_id, sort_order)
select 31, v.id, 100 + l.n
from (values
(1, 'changement climatique', 'topic'),
(2, 'réchauffement climatique', 'topic'),
(3, 'effet de serre', 'topic'),
(4, 'gaz à effet de serre', 'topic'),
(5, 'empreinte carbone', 'topic'),
(6, 'neutralité carbone', 'topic'),
(7, 'fonte des glaciers', 'topic'),
(8, 'montée des eaux', 'topic'),
(9, 'événements météorologiques extrêmes', 'topic'),
(10, 'pollution de l''air', 'topic'),
(11, 'déforestation', 'topic'),
(12, 'perte de biodiversité', 'topic'),
(13, 'écosystème', 'topic'),
(14, 'espèces en danger', 'topic'),
(15, 'faune et la flore', 'topic'),
(16, 'habitat naturel', 'topic'),
(17, 'disparition des espèces', 'topic'),
(18, 'préservation', 'topic'),
(19, 'réserve naturelle', 'topic'),
(20, 'reboisement', 'topic'),
(21, 'énergies renouvelables', 'topic'),
(22, 'énergie solaire', 'topic'),
(23, 'énergie éolienne', 'topic'),
(24, 'combustibles fossiles', 'topic'),
(25, 'sobriété énergétique', 'topic'),
(26, 'tri sélectif', 'topic'),
(27, 'compostage', 'topic'),
(28, 'déchets plastiques', 'topic'),
(29, 'plastique à usage unique', 'topic'),
(30, 'zéro déchet', 'topic'),
(31, 'gaspillage alimentaire', 'topic'),
(32, 'consommation responsable', 'topic'),
(33, 'circuit court', 'topic'),
(34, 'd''occasion', 'topic'),
(35, 'économie circulaire', 'topic'),
(36, 'agriculture biologique', 'topic'),
(37, 'écoblanchiment', 'topic'),
(38, 'transports en commun', 'topic'),
(39, 'transports propres', 'topic'),
(40, 'covoiturage', 'topic'),
(41, 'autopartage', 'topic'),
(42, 'piste cyclable', 'topic'),
(43, 'dégrader', 'topic'),
(44, 'développement durable', 'topic'),
(45, 'transition écologique', 'topic'),
(46, 'réseaux d''eau', 'topic'),
(47, 'écoresponsabilité', 'topic'),
(48, 'geste écoresponsable', 'topic'),
(49, 'lutter contre', 'topic'),
(50, 'sensibiliser', 'topic'),
(51, 'sensibilisation', 'topic'),
(52, 'taxer', 'topic'),
(53, 'taxe carbone', 'topic'),
(54, 'prendre conscience de', 'topic'),
(55, 'passer à l''action', 'topic'),
(56, 'faire sa part', 'topic'),
(57, 'montrer l''exemple', 'topic'),
(58, 'à long terme', 'topic'),
(59, 'à court terme', 'topic'),
(60, 'générations futures', 'topic'),
(61, 'il est urgent de', 'topic'),
(62, 'canicule', 'core'),
(63, 'recyclage', 'core'),
(64, 'gaspillage', 'core'),
(65, 'biodiversité', 'core'),
(66, 'réduire', 'core'),
(67, 'trier', 'core'),
(68, 'gaspiller', 'core'),
(69, 'préserver', 'core'),
(70, 'émettre', 'core'),
(71, 's''engager', 'core'),
(72, 'interdire', 'core'),
(73, 'polluer', 'core'),
(74, 'recycler', 'core'),
(75, 'économiser', 'core'),
(76, 'restaurer', 'core'),
(77, 'inciter', 'core')
) as l(n, french, src)
join "French-schema".vocabulary_bank v on v."French" = l.french and v.source = l.src
on conflict (theme_id, word_id) do nothing;
end $$;

-- 3. « émission » in this topic means emission (it was only "programme (TV, radio)")
update "French-schema".vocabulary_bank set "English" = 'emission; programme (TV, radio)',
       "SentenceFR" = 'Il faut réduire les émissions de CO₂.', "SentenceEN" = 'We must cut CO₂ emissions.'
 where source = 'core' and "French" = 'émission';

-- You should see words_in_topic = 126 and new_words = 61
select (select count(*) from "French-schema".word_themes where theme_id = 31) as words_in_topic,
       (select count(*) from "French-schema".vocabulary_bank where source = 'topic') as new_words;
