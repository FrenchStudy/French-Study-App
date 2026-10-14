-- 01_profiles.sql
-- Accounts: lets each student save their level and goal, and keeps role and premium status
-- under your control. Safe to run more than once. Contains no DROP or DELETE.

-- 1. New profile columns
alter table "French-schema".profiles add column if not exists display_name text;
alter table "French-schema".profiles add column if not exists level        text;   -- A1, A2, B1, B2, C1, C2
alter table "French-schema".profiles add column if not exists goal         text;   -- travel, work, exam, fun
alter table "French-schema".profiles add column if not exists onboarded_at timestamptz;
alter table "French-schema".profiles add column if not exists updated_at   timestamptz default now();

-- 2. New accounts are students without premium unless you change them
do $$
begin
    if exists (select 1 from information_schema.columns
               where table_schema = 'French-schema' and table_name = 'profiles' and column_name = 'role' and column_default is null) then
        alter table "French-schema".profiles alter column role set default 'student';
    end if;
    if exists (select 1 from information_schema.columns
               where table_schema = 'French-schema' and table_name = 'profiles' and column_name = 'is_premium' and column_default is null) then
        alter table "French-schema".profiles alter column is_premium set default false;
    end if;
end $$;

-- 3. Each student can see and edit only their own profile
alter table "French-schema".profiles enable row level security;
do $$
begin
    if not exists (select 1 from pg_policies where schemaname = 'French-schema' and tablename = 'profiles' and policyname = 'Students read own profile') then
        create policy "Students read own profile" on "French-schema".profiles
            for select to authenticated using (auth.uid() = id);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'French-schema' and tablename = 'profiles' and policyname = 'Students create own profile') then
        create policy "Students create own profile" on "French-schema".profiles
            for insert to authenticated with check (auth.uid() = id);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'French-schema' and tablename = 'profiles' and policyname = 'Students update own profile') then
        create policy "Students update own profile" on "French-schema".profiles
            for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
    end if;
end $$;

-- 4. Students may only write these columns, so they can never make themselves admin or premium.
--    (You can still change role and is_premium in the Supabase table editor.)
revoke insert, update on "French-schema".profiles from anon, authenticated;
grant usage on schema "French-schema" to anon, authenticated;
grant select on "French-schema".profiles to authenticated;
grant insert (id, email, display_name, level, goal, onboarded_at, updated_at) on "French-schema".profiles to authenticated;
grant update (display_name, level, goal, onboarded_at, updated_at) on "French-schema".profiles to authenticated;

-- 5. Create a profile automatically when someone signs up.
--    If anything goes wrong here, sign-up still succeeds (the app creates the profile later).
create or replace function "French-schema".create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    begin
        insert into "French-schema".profiles (id, email) values (new.id, new.email)
        on conflict (id) do nothing;
    exception when others then
        null;
    end;
    return new;
end $$;

do $$
begin
    if not exists (select 1 from pg_trigger where tgname = 'french_create_profile_on_signup') then
        create trigger french_create_profile_on_signup
            after insert on auth.users
            for each row execute function "French-schema".create_profile_for_new_user();
    end if;
end $$;

-- 6. Profiles for people who already have an account
do $$
begin
    insert into "French-schema".profiles (id, email)
    select u.id, u.email from auth.users u
    on conflict (id) do nothing;
exception when others then
    raise notice 'Existing users were not copied: %', sqlerrm;
end $$;

select count(*) as profiles, count(level) as with_level from "French-schema".profiles;
