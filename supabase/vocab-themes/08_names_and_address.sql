-- 08_names_and_address.sql
-- The hands-on lessons "Noms et prénoms" and "L'adresse" are no longer separate Vocab topics.
-- Their words join existing topics instead:
--   Greetings & Politeness (topic 1): prénom, nom de famille
--   Numbers & Scale Units (topic 4):  adresse, numéro, rue, code postal, ville
-- All seven words are already in vocabulary_bank, so this only adds topic links.
-- If a word can't be found, it stops with a message and changes nothing.
-- Safe to run more than once. 08_undo_names_and_address.sql removes the links again.

do $$
declare
  missing text;
begin
  create temp table merge_words (theme_id int, french text, n int) on commit drop;
  insert into merge_words values
    (1, 'prénom', 1), (1, 'nom de famille', 2),
    (4, 'adresse', 1), (4, 'numéro', 2), (4, 'rue', 3), (4, 'code postal', 4), (4, 'ville', 5);

  -- The matching word: our own list first ('core'), then any other entry with that spelling
  alter table merge_words add column word_id bigint;
  update merge_words m set word_id = (
    select v.id from "French-schema".vocabulary_bank v
    where lower(trim(v."French")) = m.french
    order by (v.source = 'core') desc nulls last, v.id
    limit 1);

  select string_agg(french, ', ') into missing from merge_words where word_id is null;
  if missing is not null then
    raise exception 'These words are not in vocabulary_bank: %. Nothing was changed.', missing;
  end if;

  -- Add them at the end of each topic
  insert into "French-schema".word_themes (theme_id, word_id, sort_order)
  select m.theme_id, m.word_id,
         coalesce((select max(sort_order) from "French-schema".word_themes w where w.theme_id = m.theme_id), 0) + m.n
  from merge_words m
  on conflict (theme_id, word_id) do nothing;
end $$;

-- You should see Greetings & Politeness and Numbers & Scale Units, with the new words listed
select t.id, t.title, count(*) as words_in_topic,
       string_agg(v."French", ', ') filter (where lower(v."French") in
         ('prénom', 'nom de famille', 'adresse', 'numéro', 'rue', 'code postal', 'ville')) as added
from "French-schema".themes t
join "French-schema".word_themes w on w.theme_id = t.id
join "French-schema".vocabulary_bank v on v.id = w.word_id
where t.id in (1, 4)
group by t.id, t.title
order by t.id;
