-- 07_undo_own_word_list.sql
-- Puts the old frequency list back and removes our own list, using the backups made by 07.
-- Only works while the backups exist (before 07_drop_old_list_backups.sql is run).

do $$ begin
  if to_regclass('"French-schema".vocabulary_bank_backup_2026_10_18') is null then
    raise exception 'The backup from 07 is not there, so there is nothing to undo.';
  end if;

  insert into "French-schema".vocabulary_bank
  overriding system value
  select * from "French-schema".vocabulary_bank_backup_2026_10_18 b
  where b.source = 'frequency'
    and not exists (select 1 from "French-schema".vocabulary_bank v where v.id = b.id);

  delete from "French-schema".vocabulary_bank where source = 'core';

  insert into "French-schema".word_themes (theme_id, word_id, sort_order)
  select theme_id, word_id, sort_order from "French-schema".word_themes_backup_2026_10_18
  on conflict do nothing;
end $$;

select (select count(*) from "French-schema".vocabulary_bank where source = 'frequency') as frequency_words,
       (select count(*) from "French-schema".word_themes) as topic_links;
