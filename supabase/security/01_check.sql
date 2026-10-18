-- 01_check.sql
-- Read-only security check: lists every table in "French-schema" with
--   rls_on           Row Level Security switched on (should be true everywhere)
--   policies         how many RLS policies the table has
--   visitors_can     what a visitor who is not signed in (role anon) may do
--   students_can     what a signed-in student (role authenticated) may do
-- Changes nothing.

select c.relname as table_name,
       c.relrowsecurity as rls_on,
       (select count(*) from pg_policies p where p.schemaname = n.nspname and p.tablename = c.relname) as policies,
       concat_ws(' ',
         case when has_table_privilege('anon', c.oid, 'select') then 'read' end,
         case when has_table_privilege('anon', c.oid, 'insert') then 'add' end,
         case when has_table_privilege('anon', c.oid, 'update') then 'change' end,
         case when has_table_privilege('anon', c.oid, 'delete') then 'delete' end) as visitors_can,
       concat_ws(' ',
         case when has_table_privilege('authenticated', c.oid, 'select') then 'read' end,
         case when has_table_privilege('authenticated', c.oid, 'insert') then 'add' end,
         case when has_table_privilege('authenticated', c.oid, 'update') then 'change' end,
         case when has_table_privilege('authenticated', c.oid, 'delete') then 'delete' end) as students_can
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'French-schema' and c.relkind in ('r', 'p')
order by c.relrowsecurity, c.relname;
