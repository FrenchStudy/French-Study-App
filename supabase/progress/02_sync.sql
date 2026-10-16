-- 02_sync.sql
-- Lets progress follow each student to every device: adds a "data" column to user_progress, where
-- the app keeps one row per kind of progress (words learned, lessons done, scores, streak…).
-- Run it after 01_user_progress.sql. Safe to run more than once; it removes nothing.
-- The security rules from 01 still apply: each student can only read and change their own rows.

alter table "French-schema".user_progress add column if not exists data jsonb;

do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'user_progress_data_size') then
        alter table "French-schema".user_progress
            add constraint user_progress_data_size check (data is null or octet_length(data::text) <= 1500000);
    end if;
end $$;

-- Check: the new column is there
select column_name, data_type from information_schema.columns
where table_schema = 'French-schema' and table_name = 'user_progress' and column_name = 'data';
