-- 02_lock_down.sql
-- Makes sure the public key in config.js can only do what the app needs.
--   * Word lists and topics (vocabulary_bank, themes, word_themes, listening_topics,
--     reading_topics): everyone may read them, nobody may change them through the app.
--   * Backup and work tables: nobody may read or change them through the app.
--   * Any other table without Row Level Security gets it switched on.
-- You (SQL editor, table editor) and the AI Edge Function are not affected.
-- Accounts, progress, library and AI usage keep the rules set up by their own files.
-- Safe to run more than once. Run 01_check.sql before and after to compare.

do $$
declare t text;
begin
  -- 1. Content everyone may read
  foreach t in array array['vocabulary_bank', 'themes', 'word_themes', 'listening_topics', 'reading_topics'] loop
    if to_regclass(format('%I.%I', 'French-schema', t)) is not null then
      execute format('alter table %I.%I enable row level security', 'French-schema', t);
      execute format('revoke insert, update, delete, truncate on %I.%I from anon, authenticated', 'French-schema', t);
      execute format('grant select on %I.%I to anon, authenticated', 'French-schema', t);
      if not exists (select 1 from pg_policies where schemaname = 'French-schema' and tablename = t and cmd = 'SELECT'
                     and roles && array['public', 'anon']::name[]) then
        execute format('create policy %I on %I.%I for select using (true)', 'Everyone can read ' || t, 'French-schema', t);
      end if;
    end if;
  end loop;

  -- 2. Backups and work tables: closed to the app
  for t in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'French-schema' and c.relkind = 'r'
             and (c.relname like '%backup%' or c.relname like '%import%') loop
    execute format('alter table %I.%I enable row level security', 'French-schema', t);
    execute format('revoke all on %I.%I from anon, authenticated', 'French-schema', t);
  end loop;

  -- 3. Anything else still without Row Level Security: switch it on (no policy means no access)
  for t in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'French-schema' and c.relkind = 'r' and not c.relrowsecurity loop
    execute format('alter table %I.%I enable row level security', 'French-schema', t);
    raise notice 'Row Level Security switched on for %', t;
  end loop;
end $$;

-- 4. New tables made later start closed to the app until you open them on purpose
alter default privileges in schema "French-schema" revoke all on tables from anon, authenticated;

-- The result: every row should show rls_on = true
select c.relname as table_name, c.relrowsecurity as rls_on,
       has_table_privilege('anon', c.oid, 'select') as visitors_can_read,
       has_table_privilege('anon', c.oid, 'insert') or has_table_privilege('anon', c.oid, 'update')
         or has_table_privilege('anon', c.oid, 'delete') as visitors_can_change
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'French-schema' and c.relkind = 'r'
order by c.relname;
