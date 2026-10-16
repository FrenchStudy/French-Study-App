-- 99_undo.sql
-- Removes the table created by 01_user_progress.sql, including all saved progress.
-- Only run it if you want to start over. Progress kept in each browser is not affected.

drop policy if exists "Students see their own progress" on "French-schema".user_progress;
drop policy if exists "Students save their own progress" on "French-schema".user_progress;
drop policy if exists "Students update their own progress" on "French-schema".user_progress;
drop table if exists "French-schema".user_progress;
