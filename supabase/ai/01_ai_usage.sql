-- 01_ai_usage.sql
-- Counts AI use per student, for the "5 free AI uses, then subscribe" rule.
-- One row = one activity (a writing check, a new question, a whole conversation...).
-- Only the "ai" Edge Function writes here; students can read their own rows.
-- Safe to run more than once; it removes nothing.

create table if not exists "French-schema".ai_usage (
    user_id    uuid        not null,            -- the student (auth.users id)
    session    text        not null,            -- one activity, e.g. "conv-lx3k2a" or "call-9f8e…"
    feature    text,                            -- writing-check, speaking-chat, … (for your statistics)
    calls      integer     not null default 0,  -- AI requests inside this activity
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, session)
);

create index if not exists ai_usage_user_created on "French-schema".ai_usage (user_id, created_at);

-- Students can see their own usage (the app shows "3 free AI uses left"), nothing else.
alter table "French-schema".ai_usage enable row level security;
do $$
begin
    if not exists (select 1 from pg_policies where schemaname = 'French-schema' and tablename = 'ai_usage' and policyname = 'Students read own AI usage') then
        create policy "Students read own AI usage" on "French-schema".ai_usage
            for select to authenticated using (auth.uid() = user_id);
    end if;
end $$;

revoke all on "French-schema".ai_usage from anon, authenticated;
grant select on "French-schema".ai_usage to authenticated;

-- The Edge Function uses the service role, which needs to read profiles and write ai_usage.
grant usage on schema "French-schema" to service_role;
grant select, insert, update on "French-schema".ai_usage to service_role;
grant select on "French-schema".profiles to service_role;

-- Check: how many activities each account has used so far (empty at first)
select count(*) as accounts_with_ai_use from (select distinct user_id from "French-schema".ai_usage) t;
