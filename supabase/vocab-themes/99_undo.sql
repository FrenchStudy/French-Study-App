-- 99_undo.sql
-- Puts vocabulary_bank back exactly as it was before 02–05, using the backup from 01_backup.sql.
-- Run only if you want to undo the change. The backup table itself is kept; delete it later
-- in the table editor once you are happy.

drop table if exists "French-schema".word_themes;
drop table if exists "French-schema".themes;

delete from "French-schema".vocabulary_bank
where id not in (select id from "French-schema".vocabulary_bank_backup_2026_10_14);

update "French-schema".vocabulary_bank as v
set "Article" = b."Article", "Noun_Gender" = b."Noun_Gender"
from "French-schema".vocabulary_bank_backup_2026_10_14 as b
where v.id = b.id;

alter table "French-schema".vocabulary_bank drop column if exists source;
alter table "French-schema".vocabulary_bank drop column if exists pron_guide;

select count(*) as rows_now from "French-schema".vocabulary_bank;
