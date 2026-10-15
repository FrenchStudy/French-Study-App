-- 99_undo.sql
-- Removes the shared text library created by 01_texts.sql, including the texts in it.
-- Only run it if you want to start over.

drop policy if exists "Signed-in users read the library" on "French-schema".library_texts;
drop policy if exists "Students add their own texts" on "French-schema".library_texts;
drop table if exists "French-schema".library_texts;
