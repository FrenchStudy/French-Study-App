-- 14_add_rarement.sql
-- Adds « rarement » (rarely) to the topic Frequency & Time Adverbs (theme 7), between
-- « de temps en temps » and « jamais ». The word is already in the 5,000-word list.
-- Safe to run more than once. To undo, run the line at the bottom of this file.

insert into "French-schema".word_themes (theme_id, word_id, sort_order)
select 7, v.id, coalesce((select max(sort_order) from "French-schema".word_themes where theme_id = 7), 0) + 1
  from "French-schema".vocabulary_bank v
 where v.source = 'core' and v."French" = 'rarement'
 limit 1
on conflict (theme_id, word_id) do nothing;

-- You should see one row: rarement, rarely
select v."French", v."English" from "French-schema".word_themes w
  join "French-schema".vocabulary_bank v on v.id = w.word_id
 where w.theme_id = 7 and v."French" = 'rarement';

-- Undo:
-- delete from "French-schema".word_themes where theme_id = 7 and word_id in (select id from "French-schema".vocabulary_bank where source = 'core' and "French" = 'rarement');
