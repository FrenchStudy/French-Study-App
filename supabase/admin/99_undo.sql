-- 99_undo.sql
-- Removes the dashboard function created by 01_dashboard.sql. No data is touched.
drop function if exists "French-schema".admin_dashboard();
