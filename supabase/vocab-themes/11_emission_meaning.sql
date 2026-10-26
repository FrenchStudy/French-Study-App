-- 11_emission_meaning.sql
-- « émission » had only its TV meaning ("programme"). In the Environment & Climate topic it means
-- emission (les émissions de CO₂), so it gets both meanings and an example about CO₂.
-- Safe to run more than once. To undo, run the update at the bottom of this file.

update "French-schema".vocabulary_bank set "English" = 'emission; programme (TV, radio)',
       "SentenceFR" = 'Il faut réduire les émissions de CO₂.', "SentenceEN" = 'We must cut CO₂ emissions.'
 where source = 'core' and "French" = 'émission';

-- You should see one row with the new meaning
select "French", "English", "SentenceFR" from "French-schema".vocabulary_bank
 where source = 'core' and "French" = 'émission';

-- Undo:
-- update "French-schema".vocabulary_bank set "English" = 'programme (TV, radio)',
--        "SentenceFR" = 'Cette émission est très populaire.', "SentenceEN" = 'This programme is very popular.'
--  where source = 'core' and "French" = 'émission';
