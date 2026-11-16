-- 99_undo.sql
-- Removes the conjugation tables created by 01_conjugations.sql, including the verbs and forms in them.
-- Only run it if you want to start over.

drop policy if exists "Signed-in users read conjugation forms" on "French-schema".conjugation_forms;
drop policy if exists "Signed-in users read conjugation verbs" on "French-schema".conjugation_verbs;
drop table if exists "French-schema".conjugation_forms;
drop table if exists "French-schema".conjugation_verbs;
drop function if exists "French-schema".plain_text(text);
