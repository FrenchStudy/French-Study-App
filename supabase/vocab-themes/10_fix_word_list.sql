-- 10_fix_word_list.sql
-- Fixes found in a French review of the 5,000-word list (07) and the C1–C2 words (06):
-- wrong articles (le yaourt, le yoga, madame), a wrong gender (un otage is always masculine),
-- a headword in the feminine (ouvrier), example sentences with a grammar slip
-- (Il est fils unique, il est probable qu'il pleuvra, C'est un disciple…),
-- examples that used a different word from the one they illustrate, and two English translations.
-- 07_own_word_list.sql and 06_c1_c2_themes.sql already contain these fixes; this file
-- updates a database where they were run before. It only changes the rows listed below.
-- Safe to run more than once.

-- 62. jour: unnatural example
update "French-schema".vocabulary_bank set "SentenceFR" = 'Je travaille cinq jours par semaine.', "SentenceEN" = 'I work five days a week.'
 where source = 'core' and "Rank" = 62 and "French" in ('jour');

-- 295. plutôt: « préférer plutôt » says the same thing twice
update "French-schema".vocabulary_bank set "SentenceFR" = 'Je prendrai plutôt un thé.', "SentenceEN" = 'I''ll have tea instead.'
 where source = 'core' and "Rank" = 295 and "French" in ('plutôt');

-- 332. madame: « madame » takes no article (« la dame » is the noun)
update "French-schema".vocabulary_bank set "Article" = null
 where source = 'core' and "Rank" = 332 and "French" in ('madame');

-- 610. célébrer: English meaning of the example
update "French-schema".vocabulary_bank set "SentenceEN" = 'The city is celebrating its 400th anniversary.'
 where source = 'core' and "Rank" = 610 and "French" in ('célébrer');

-- 1819. probable: « il est probable que » takes the indicative
update "French-schema".vocabulary_bank set "SentenceFR" = 'Il est probable qu''il pleuvra demain.', "SentenceEN" = 'It will probably rain tomorrow.'
 where source = 'core' and "Rank" = 1819 and "French" in ('probable');

-- 1831. unique: « C'est fils unique » is wrong: « Il est fils unique »
update "French-schema".vocabulary_bank set "SentenceFR" = 'Il est fils unique.'
 where source = 'core' and "Rank" = 1831 and "French" in ('unique');

-- 1912. favori: example used the noun, not the adjective
update "French-schema".vocabulary_bank set "SentenceFR" = 'C''est mon chanteur favori.', "SentenceEN" = 'He''s my favourite singer.'
 where source = 'core' and "Rank" = 1912 and "French" in ('favori');

-- 2250. yaourt: « le yaourt »: no elision before this y
update "French-schema".vocabulary_bank set "Article" = 'le'
 where source = 'core' and "Rank" = 2250 and "French" in ('yaourt');

-- 2644. yoga: « le yoga »: no elision before this y
update "French-schema".vocabulary_bank set "Article" = 'le'
 where source = 'core' and "Rank" = 2644 and "French" in ('yoga');

-- 3001. ouvrière: headword was the feminine form
update "French-schema".vocabulary_bank set "French" = 'ouvrier'
 where source = 'core' and "Rank" = 3001 and "French" in ('ouvrière', 'ouvrier');

-- 4452. disciple: « Il est un disciple » → « C'est un disciple »
update "French-schema".vocabulary_bank set "SentenceFR" = 'C''est un disciple de Freud.'
 where source = 'core' and "Rank" = 4452 and "French" in ('disciple');

-- 4520. otage: « otage » is always masculine
update "French-schema".vocabulary_bank set "Part_of_Speech" = 'nm', "Noun_Gender" = 'm'
 where source = 'core' and "Rank" = 4520 and "French" in ('otage');

-- 4524. pionnier: « Il est un pionnier » → « C'est un pionnier »
update "French-schema".vocabulary_bank set "SentenceFR" = 'C''est un pionnier de l''informatique.'
 where source = 'core' and "Rank" = 4524 and "French" in ('pionnier');

-- 4743. rond: example used « la ronde », not « le rond »
update "French-schema".vocabulary_bank set "SentenceFR" = 'Dessine un rond sur la feuille.', "SentenceEN" = 'Draw a circle on the sheet.'
 where source = 'core' and "Rank" = 4743 and "French" in ('rond');

-- 4786. allemand: example used the language noun, not the adjective
update "French-schema".vocabulary_bank set "SentenceFR" = 'C''est une voiture allemande.', "SentenceEN" = 'It''s a German car.'
 where source = 'core' and "Rank" = 4786 and "French" in ('allemand');

-- 4787. espagnol: example used the language noun, not the adjective
update "French-schema".vocabulary_bank set "SentenceFR" = 'La paella est un plat espagnol.', "SentenceEN" = 'Paella is a Spanish dish.'
 where source = 'core' and "Rank" = 4787 and "French" in ('espagnol');

-- 4790. japonais: example used the language noun, not the adjective
update "French-schema".vocabulary_bank set "SentenceFR" = 'J''adore la cuisine japonaise.', "SentenceEN" = 'I love Japanese food.'
 where source = 'core' and "Rank" = 4790 and "French" in ('japonais');

-- 4792. portugais: example used the language noun, not the adjective
update "French-schema".vocabulary_bank set "SentenceFR" = 'Elle a un passeport portugais.', "SentenceEN" = 'She has a Portuguese passport.'
 where source = 'core' and "Rank" = 4792 and "French" in ('portugais');

-- C1–C2 word « en revanche »: English example punctuation
update "French-schema".vocabulary_bank set "SentenceEN" = 'The film is long; on the other hand, it''s gripping.'
 where source = 'advanced' and "French" = 'en revanche';

-- C1–C2 word « par conséquent »: English example punctuation
update "French-schema".vocabulary_bank set "SentenceEN" = 'The train was late; consequently, I missed the meeting.'
 where source = 'advanced' and "French" = 'par conséquent';

-- You should see 20 rows, each with the corrected values
select "Rank", "Article", "French", "Part_of_Speech", "Noun_Gender", "SentenceFR", "SentenceEN"
from "French-schema".vocabulary_bank
where (source = 'core' and "Rank" in (62, 295, 332, 610, 1819, 1831, 1912, 2250, 2644, 3001, 4452, 4520, 4524, 4743, 4786, 4787, 4790, 4792))
   or (source = 'advanced' and "French" in ('en revanche', 'par conséquent'))
order by source desc, "Rank";
