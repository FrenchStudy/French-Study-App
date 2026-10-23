-- 08_undo_names_and_address.sql
-- Removes the links that 08_names_and_address.sql added. The words themselves stay in vocabulary_bank.

delete from "French-schema".word_themes w
using "French-schema".vocabulary_bank v
where v.id = w.word_id
  and ((w.theme_id = 1 and lower(trim(v."French")) in ('prénom', 'nom de famille'))
    or (w.theme_id = 4 and lower(trim(v."French")) in ('adresse', 'numéro', 'rue', 'code postal', 'ville')));

-- You should see 0
select count(*) as links_left
from "French-schema".word_themes w
join "French-schema".vocabulary_bank v on v.id = w.word_id
where (w.theme_id = 1 and lower(trim(v."French")) in ('prénom', 'nom de famille'))
   or (w.theme_id = 4 and lower(trim(v."French")) in ('adresse', 'numéro', 'rue', 'code postal', 'ville'));
