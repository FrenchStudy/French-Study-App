-- 07_drop_old_list_backups.sql
-- Run this only after 07_own_word_list.sql has worked and the Vocab page looks right.
-- It deletes the backup tables that still hold the old frequency list found online.
-- After this, 07_undo_own_word_list.sql and 99_undo.sql can no longer be used.

drop table if exists "French-schema".vocabulary_bank_backup_2026_10_14;
drop table if exists "French-schema".vocabulary_bank_backup_2026_10_18;
drop table if exists "French-schema".word_themes_backup_2026_10_18;

select count(*) as backups_left
from information_schema.tables
where table_schema = 'French-schema' and table_name like '%backup%';
