-- 02_topics.sql
-- Links library texts to the topics in reading_topics / listening_topics, so the first text the AI
-- writes for a topic is reused by every student who opens that topic.
-- Run it after 01_texts.sql. Safe to run more than once; it removes nothing.

alter table "French-schema".library_texts add column if not exists topic text;   -- the topic title, or empty for a custom subject
alter table "French-schema".library_texts add column if not exists skill text;   -- 'reading' or 'listening'

create index if not exists library_texts_topic on "French-schema".library_texts (level, skill, topic);

-- Signed-in students can read the topic lists (the pages show them by level)
do $$
declare t text;
begin
    foreach t in array array['reading_topics', 'listening_topics'] loop
        if exists (select 1 from information_schema.tables where table_schema = 'French-schema' and table_name = t) then
            execute format('grant select on "French-schema".%I to authenticated', t);
        end if;
    end loop;
end $$;

-- Check: the new columns are there
select column_name from information_schema.columns
where table_schema = 'French-schema' and table_name = 'library_texts' and column_name in ('topic', 'skill');
