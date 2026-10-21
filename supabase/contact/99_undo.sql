-- 99_undo.sql: removes the contact form table and function (deletes any messages in it).
drop function if exists "French-schema".admin_messages(uuid);
drop table if exists "French-schema".contact_messages;
