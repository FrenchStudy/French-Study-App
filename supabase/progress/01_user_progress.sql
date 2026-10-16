-- 01_user_progress.sql
-- Saves each student's progress in their account (lessons done, reading/listening/writing/speaking
-- scores), so it is kept even if they clear their browser, and can follow them to another device.
-- The app already tries to save here; until this table exists those saves are skipped.
-- Each student can only see and change their own rows. Safe to run more than once; it removes nothing.

create table if not exists "French-schema".user_progress (
    user_id     uuid        not null default auth.uid(),
    module_type text        not null check (char_length(module_type) <= 40),   -- e.g. lesson-grammar, reading, writing
    module_id   text        not null check (char_length(module_id) <= 120),    -- which lesson, text or task
    completed   boolean     not null default true,
    score       numeric(4,1) check (score between 0 and 20),                   -- out of 20, when there is one
    updated_at  timestamptz not null default now(),
    primary key (user_id, module_type, module_id)
);

alter table "French-schema".user_progress enable row level security;
do $$
begin
    if not exists (select 1 from pg_policies where schemaname = 'French-schema' and tablename = 'user_progress' and policyname = 'Students see their own progress') then
        create policy "Students see their own progress" on "French-schema".user_progress
            for select to authenticated using (user_id = auth.uid());
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'French-schema' and tablename = 'user_progress' and policyname = 'Students save their own progress') then
        create policy "Students save their own progress" on "French-schema".user_progress
            for insert to authenticated with check (user_id = auth.uid());
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'French-schema' and tablename = 'user_progress' and policyname = 'Students update their own progress') then
        create policy "Students update their own progress" on "French-schema".user_progress
            for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
    end if;
end $$;

revoke all on "French-schema".user_progress from anon, authenticated;
grant select, insert, update on "French-schema".user_progress to authenticated;

-- Check: rows saved so far (0 at first)
select count(*) as progress_rows from "French-schema".user_progress;
