-- 09_fix_topic_links.sql
-- Some words have several entries in the word list with the same spelling but a different meaning
-- (avant = "before" and l'avant = "the front"; le dîner = "dinner" and dîner = "to have dinner").
-- When 07_own_word_list.sql moved the topic links to the new list, a few topics got the wrong one:
-- for example Frequency & Time Adverbs showed "l'avant: front" instead of "avant: before".
-- This file points each of those topic words at the right entry, in the same place in the topic.
-- It only changes words that are already in the topic, and it never adds new words.
-- Safe to run more than once.

do $$
declare
  w record;
  target bigint;
  slot int;
begin
  for w in
    select * from (values
      -- (topic, word, kind of word to keep)
      (3, 'si', 'conj'), (3, 'après', 'prep'),
      (7, 'avant', 'prep'), (7, 'après', 'prep'),
      (10, 'suisse', 'adj'),
      (12, 'calme', 'adj'),
      (14, 'orange', 'adj'), (14, 'rose', 'adj'), (14, 'noir', 'adj'),
      (18, 'déjeuner', 'nm'), (18, 'goûter', 'nm'), (18, 'dîner', 'nm'),
      (20, 'malade', 'adj'),
      (22, 'direct', 'adj'),
      (24, 'frais', 'nmpl'), (24, 'prêt', 'nm'), (24, 'devoir', 'v'),
      (30, 'blessé', 'adj'),
      (32, 'santé', 'nf'),
      (35, 'goûter', 'nm'), (35, 'dîner', 'nm'), (35, 'déjeuner', 'nm'),
      (41, 'pouvoir', 'nm'), (41, 'droit', 'nm'),
      (42, 'physique', 'nf'), (42, 'technique', 'nf'),
      (43, 'droit', 'nm'),
      (44, 'logique', 'nf')
    ) as v(theme_id, french, pos)
  loop
    -- the entry we want
    select id into target from "French-schema".vocabulary_bank
     where source = 'core' and lower("French") = w.french and "Part_of_Speech" = w.pos
     order by id limit 1;
    continue when target is null;

    -- where the word sits in the topic now (any entry with that spelling)
    select min(wt.sort_order) into slot
      from "French-schema".word_themes wt
      join "French-schema".vocabulary_bank v on v.id = wt.word_id
     where wt.theme_id = w.theme_id and lower(v."French") = w.french;
    continue when slot is null;   -- the word is not in this topic: leave it alone

    -- Topic 10 has both "la Suisse" (the country) and "suisse" (Swiss): keep the country entry too
    delete from "French-schema".word_themes wt
     using "French-schema".vocabulary_bank v
     where v.id = wt.word_id and wt.theme_id = w.theme_id and lower(v."French") = w.french
       and wt.word_id <> target
       and not (w.theme_id = 10 and v."Part_of_Speech" = 'nf');

    insert into "French-schema".word_themes (theme_id, word_id, sort_order)
    values (w.theme_id, target, slot)
    on conflict (theme_id, word_id) do nothing;
  end loop;
end $$;

-- You should see each word with the meaning that fits its topic (avant: before, dîner: dinner…)
select t.title, v."French", v."Part_of_Speech", v."English"
from "French-schema".word_themes wt
join "French-schema".themes t on t.id = wt.theme_id
join "French-schema".vocabulary_bank v on v.id = wt.word_id
where (wt.theme_id, lower(v."French")) in (
  (3, 'si'), (3, 'après'), (7, 'avant'), (7, 'après'), (10, 'suisse'), (12, 'calme'), (14, 'orange'), (14, 'rose'),
  (14, 'noir'), (18, 'déjeuner'), (18, 'goûter'), (18, 'dîner'), (20, 'malade'), (22, 'direct'), (24, 'frais'),
  (24, 'prêt'), (24, 'devoir'), (30, 'blessé'), (32, 'santé'), (35, 'goûter'), (35, 'dîner'), (35, 'déjeuner'),
  (41, 'pouvoir'), (41, 'droit'), (42, 'physique'), (42, 'technique'), (43, 'droit'), (44, 'logique'))
order by wt.theme_id, v."French";
