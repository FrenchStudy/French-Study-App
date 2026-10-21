-- 01_contact.sql
-- A contact form instead of a public email address: messages are saved in contact_messages.
-- Anyone can send a message (signed in or not). Nobody can read messages through the app,
-- except admins through the admin_messages() function on the Admin page.
-- Safe to run more than once. Contains no DROP of data.

create table if not exists "French-schema".contact_messages (
    id          uuid primary key default gen_random_uuid(),
    created_at  timestamptz not null default now(),
    user_id     uuid default auth.uid(),
    email       text check (email is null or length(email) <= 200),
    topic       text not null default 'question'
                check (topic in ('question', 'privacy', 'problem', 'idea', 'other')),
    message     text not null check (length(message) between 1 and 3000),
    handled     boolean not null default false
);

alter table "French-schema".contact_messages enable row level security;
revoke all on "French-schema".contact_messages from anon, authenticated;
grant insert (email, topic, message) on "French-schema".contact_messages to anon, authenticated;

do $$
begin
    if not exists (select 1 from pg_policies where schemaname = 'French-schema'
                   and tablename = 'contact_messages' and policyname = 'Anyone can send a message') then
        create policy "Anyone can send a message" on "French-schema".contact_messages
            for insert to anon, authenticated with check (true);
    end if;
end $$;

-- Admins read the latest messages (newest first) and can mark them handled
create or replace function "French-schema".admin_messages(mark_handled uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = "French-schema", pg_temp
as $$
begin
    if not exists (select 1 from profiles where id = auth.uid() and lower(trim(coalesce(role, ''))) = 'admin') then
        raise exception 'Only admins can read messages.' using errcode = '42501';
    end if;
    if mark_handled is not null then
        update contact_messages set handled = true where id = mark_handled;
    end if;
    return coalesce((
        select jsonb_agg(m order by m.created_at desc)
        from (select id, created_at, email, topic, message, handled, user_id is not null as signed_in
              from contact_messages order by created_at desc limit 100) m
    ), '[]'::jsonb);
end $$;

revoke all on function "French-schema".admin_messages(uuid) from public, anon;
grant execute on function "French-schema".admin_messages(uuid) to authenticated;

select count(*) as messages_so_far from "French-schema".contact_messages;
