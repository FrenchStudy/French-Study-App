-- 06_undo_c1_c2.sql
-- Removes the C1 and C2 Vocab topics (ids 45–56) and the words 06_c1_c2_themes.sql added.
-- Words that were already in vocabulary_bank are kept.

delete from "French-schema".word_themes where theme_id between 45 and 56;
delete from "French-schema".themes where id between 45 and 56;
delete from "French-schema".vocabulary_bank where source = 'advanced';

select count(*) as themes_left from "French-schema".themes;
