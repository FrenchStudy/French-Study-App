-- 12_france_french_examples.sql
-- The app now uses France French. Three example sentences said « par courriel »; they now say
-- « par e-mail », as people do in France. « courriel » stays in the word list (it is the official
-- word, used in Québec and in French official texts), with a note in its meaning.
-- Québec-only words (dépanneur, bleuet, tuque, cégep) are already marked "(Quebec)" and are not changed.
-- Safe to run more than once. To undo, run the updates at the bottom of this file.

update "French-schema".vocabulary_bank set "SentenceFR" = 'Nous communiquons surtout par e-mail.'
 where source = 'core' and "French" = 'communiquer';
update "French-schema".vocabulary_bank set "SentenceFR" = 'Contactez-nous par e-mail.'
 where source = 'core' and "French" = 'contacter';
update "French-schema".vocabulary_bank set "SentenceFR" = 'Envoyez votre CV par e-mail.'
 where source = 'core' and "French" = 'CV';
update "French-schema".vocabulary_bank set "English" = 'email (official word; in France people usually say un e-mail or un mail)'
 where source = 'core' and "French" = 'courriel';

-- You should see the four rows with the new text
select "French", "English", "SentenceFR" from "French-schema".vocabulary_bank
 where source = 'core' and "French" in ('communiquer', 'contacter', 'CV', 'courriel');

-- Undo:
-- update "French-schema".vocabulary_bank set "SentenceFR" = 'Nous communiquons surtout par courriel.' where source = 'core' and "French" = 'communiquer';
-- update "French-schema".vocabulary_bank set "SentenceFR" = 'Contactez-nous par courriel.' where source = 'core' and "French" = 'contacter';
-- update "French-schema".vocabulary_bank set "SentenceFR" = 'Envoyez votre CV par courriel.' where source = 'core' and "French" = 'CV';
-- update "French-schema".vocabulary_bank set "English" = 'email' where source = 'core' and "French" = 'courriel';
