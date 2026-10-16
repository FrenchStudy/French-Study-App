-- 01_dashboard.sql
-- The numbers for the Admin page dashboard: students, activity, AI use, library.
-- Students' own data stays private (each student can still only see their own rows). This function
-- runs with the database owner's rights so it can count across all accounts, but it checks first
-- that the person calling it is an admin, and it only returns totals plus the latest sign-ups.
-- Safe to run more than once (it replaces the function); it changes no data.

create or replace function "French-schema".admin_dashboard()
returns jsonb
language plpgsql
security definer
set search_path = "French-schema", pg_temp
as $$
declare
    result jsonb := '{}'::jsonb;
    free_uses int := 5;   -- keep in line with the FREE_USES secret of the AI function
begin
    if not exists (select 1 from profiles where id = auth.uid() and lower(trim(coalesce(role, ''))) = 'admin') then
        raise exception 'Only admins can see the dashboard.' using errcode = '42501';
    end if;

    -- Students
    result := result || jsonb_build_object(
        'students',        (select count(*) from profiles),
        'new_7d',          (select count(*) from profiles where created_at >= now() - interval '7 days'),
        'onboarded',       (select count(*) from profiles where onboarded_at is not null),
        'premium',         (select count(*) from profiles where is_premium is true),
        'admins',          (select count(*) from profiles where lower(trim(coalesce(role, ''))) = 'admin'),
        'by_level',        (select coalesce(jsonb_object_agg(k, n), '{}'::jsonb) from (select coalesce(nullif(level, ''), 'Not set') k, count(*) n from profiles group by 1) s),
        'by_goal',         (select coalesce(jsonb_object_agg(k, n), '{}'::jsonb) from (select coalesce(nullif(goal, ''), 'Not set') k, count(*) n from profiles group by 1) s),
        'signups_by_day',  (select coalesce(jsonb_object_agg(d, n), '{}'::jsonb) from (select to_char(created_at::date, 'YYYY-MM-DD') d, count(*) n from profiles where created_at >= current_date - 13 group by 1) s),
        'latest',          (select coalesce(jsonb_agg(x order by x->>'created_at' desc), '[]'::jsonb) from (
                                select jsonb_build_object('name', display_name, 'email', email, 'level', level, 'goal', goal, 'premium', is_premium, 'created_at', created_at) x
                                from profiles order by created_at desc nulls last limit 8) s)
    );

    -- Activity (progress saved in the accounts)
    if to_regclass('"French-schema".user_progress') is not null then
        result := result || jsonb_build_object(
            'active_today',  (select count(distinct user_id) from user_progress where updated_at >= current_date),
            'active_7d',     (select count(distinct user_id) from user_progress where updated_at >= now() - interval '7 days'),
            'lessons_done',  (select count(*) from user_progress where module_type like 'lesson-%' and completed),
            'skills_done',   (select coalesce(jsonb_object_agg(k, n), '{}'::jsonb) from (select module_type k, count(*) n from user_progress
                                where module_type in ('reading', 'listening', 'writing', 'speaking', 'speaking-scene', 'dictation') group by 1) s)
        );
    end if;

    -- AI use (one row per AI activity)
    if to_regclass('"French-schema".ai_usage') is not null then
        result := result || jsonb_build_object(
            'free_uses',      free_uses,
            'ai_today',       (select count(*) from ai_usage where created_at >= current_date),
            'ai_7d',          (select count(*) from ai_usage where created_at >= now() - interval '7 days'),
            'ai_30d',         (select count(*) from ai_usage where created_at >= now() - interval '30 days'),
            'ai_calls_30d',   (select coalesce(sum(calls), 0) from ai_usage where created_at >= now() - interval '30 days'),
            'ai_by_day',      (select coalesce(jsonb_object_agg(d, n), '{}'::jsonb) from (select to_char(created_at::date, 'YYYY-MM-DD') d, count(*) n from ai_usage where created_at >= current_date - 13 group by 1) s),
            'ai_by_feature',  (select coalesce(jsonb_object_agg(k, n), '{}'::jsonb) from (select coalesce(nullif(feature, ''), 'other') k, count(*) n from ai_usage where created_at >= now() - interval '30 days' group by 1) s),
            'at_free_limit',  (select count(*) from (select u.user_id from ai_usage u join profiles p on p.id = u.user_id
                                where p.is_premium is not true and lower(trim(coalesce(p.role, ''))) <> 'admin' group by u.user_id having count(*) >= free_uses) s),
            'top_ai_users',   (select coalesce(jsonb_agg(x order by (x->>'uses')::int desc), '[]'::jsonb) from (
                                select jsonb_build_object('name', p.display_name, 'email', p.email, 'premium', p.is_premium, 'uses', count(*)) x
                                from ai_usage u left join profiles p on p.id = u.user_id
                                where u.created_at >= now() - interval '30 days' group by p.display_name, p.email, p.is_premium order by count(*) desc limit 5) s)
        );
    end if;

    -- Shared Reading/Listening library
    if to_regclass('"French-schema".library_texts') is not null then
        result := result || jsonb_build_object(
            'library_total',    (select count(*) from library_texts),
            'library_by_level', (select coalesce(jsonb_object_agg(level, n), '{}'::jsonb) from (select level, count(*) n from library_texts group by 1) s)
        );
    end if;

    return result || jsonb_build_object('generated_at', now());
end;
$$;

revoke all on function "French-schema".admin_dashboard() from public, anon;
grant execute on function "French-schema".admin_dashboard() to authenticated;

-- Check: the function exists (calling it here, as the database owner, would say "Only admins")
select proname as function_name from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'French-schema' and proname = 'admin_dashboard';
