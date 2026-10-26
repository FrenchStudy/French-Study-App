-- 11_undo_environment_words.sql
-- Removes what 11_environment_words.sql added: its links to the Environment topic and the
-- new words (source = 'topic'), and puts back the old meaning of « émission ».

delete from "French-schema".word_themes where theme_id = 31 and sort_order > 100;
delete from "French-schema".vocabulary_bank where source = 'topic';
update "French-schema".vocabulary_bank set "English" = 'programme (TV, radio)'
 where source = 'core' and "French" = 'émission' and "English" = 'emission; programme (TV, radio)';

-- You should see words_in_topic = 49 and new_words = 0
select (select count(*) from "French-schema".word_themes where theme_id = 31) as words_in_topic,
       (select count(*) from "French-schema".vocabulary_bank where source = 'topic') as new_words;
