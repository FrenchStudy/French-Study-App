-- 99_undo.sql
-- Removes what 01_profiles.sql added. The new columns are kept, so no student data is lost;
-- delete them yourself in the table editor if you really want to.
drop trigger if exists french_create_profile_on_signup on auth.users;
drop function if exists "French-schema".create_profile_for_new_user();
drop policy if exists "Students read own profile" on "French-schema".profiles;
drop policy if exists "Students create own profile" on "French-schema".profiles;
drop policy if exists "Students update own profile" on "French-schema".profiles;
grant insert, update on "French-schema".profiles to authenticated;
