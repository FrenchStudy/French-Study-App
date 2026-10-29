-- 13_remove_quebec_words.sql
-- The app teaches France French only. Four words of the 5,000-word list are used only in Québec:
-- dépanneur (corner shop), bleuet (blueberry), tuque (woolly hat) and cégep (Québec college).
-- This removes them from the word list and from any topic. épicerie, bonnet and lycée are already in
-- the list; myrtille (blueberry) takes bleuet's place, with its own example.
--
-- What it does:
--   1. Keeps a copy of the four words and their topic links (…_backup_2026_10_29), the first time only.
--   2. Removes their topic links, then the words.
-- Safe to run more than once. To undo, run the block at the bottom of this file.

do $$ begin
  if to_regclass('"French-schema".quebec_words_backup_2026_10_29') is null then
    create table "French-schema".quebec_words_backup_2026_10_29 as
      select * from "French-schema".vocabulary_bank
       where source = 'core' and "French" in ('dépanneur', 'bleuet', 'tuque', 'cégep');
    create table "French-schema".quebec_links_backup_2026_10_29 as
      select w.* from "French-schema".word_themes w
       where w.word_id in (select id from "French-schema".quebec_words_backup_2026_10_29);
  end if;
end $$;

delete from "French-schema".word_themes
 where word_id in (select id from "French-schema".vocabulary_bank
                    where source = 'core' and "French" in ('dépanneur', 'bleuet', 'tuque', 'cégep'));
delete from "French-schema".vocabulary_bank
 where source = 'core' and "French" in ('dépanneur', 'bleuet', 'tuque', 'cégep');

-- myrtille replaces bleuet (same rank in the list)
insert into "French-schema".vocabulary_bank
       (id, "French", "Part_of_Speech", "Article", "Noun_Gender", "English", "SentenceFR", "SentenceEN", pron_guide, source, "Rank")
overriding system value
select (select coalesce(max(id), 0) from "French-schema".vocabulary_bank) + 1,
       'myrtille', 'nf', 'la', 'f', 'blueberry', 'Une tarte aux myrtilles.', 'A blueberry pie.', 'meer-TEE-y', 'core', b."Rank"
  from "French-schema".quebec_words_backup_2026_10_29 b
 where b."French" = 'bleuet'
   and not exists (select 1 from "French-schema".vocabulary_bank where source = 'core' and "French" = 'myrtille');

-- You should see 0 (the words are gone) and 4 (the copy kept for undo)
select (select count(*) from "French-schema".vocabulary_bank
         where source = 'core' and "French" in ('dépanneur', 'bleuet', 'tuque', 'cégep')) as still_in_list,
       (select count(*) from "French-schema".quebec_words_backup_2026_10_29) as kept_in_backup;

-- Undo (puts the four words and their topic links back, and removes myrtille):
-- delete from "French-schema".vocabulary_bank where source = 'core' and "French" = 'myrtille';
-- insert into "French-schema".vocabulary_bank select * from "French-schema".quebec_words_backup_2026_10_29 on conflict do nothing;
-- insert into "French-schema".word_themes select * from "French-schema".quebec_links_backup_2026_10_29 on conflict do nothing;
