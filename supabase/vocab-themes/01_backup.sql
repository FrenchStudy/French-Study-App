-- 01_backup.sql
-- Makes a full copy of vocabulary_bank before anything changes.
-- Safe to run more than once: it never overwrites an existing backup.
create table if not exists "French-schema".vocabulary_bank_backup_2026_10_14 as table "French-schema".vocabulary_bank;

-- Keep the backup private: not readable through the app's public API key.
alter table "French-schema".vocabulary_bank_backup_2026_10_14 enable row level security;
revoke all on "French-schema".vocabulary_bank_backup_2026_10_14 from anon, authenticated;

select count(*) as rows_backed_up from "French-schema".vocabulary_bank_backup_2026_10_14;
