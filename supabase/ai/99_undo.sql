-- 99_undo.sql
-- Removes the AI usage table created by 01_ai_usage.sql. This deletes the usage counts
-- (so everyone gets their free uses back). Only run it if you want to start over.

drop policy if exists "Students read own AI usage" on "French-schema".ai_usage;
drop table if exists "French-schema".ai_usage;
