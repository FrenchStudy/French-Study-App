-- 03_forms.sql
-- Builds the searchable list of forms from conjugation_verbs. Run it after all four 02_verbs_part files
-- (and again whenever you change a verb). It rebuilds conjugation_forms from scratch each time.
-- Reflexive verbs (se laver) are left out: they share the forms of the plain verb (laver).

delete from "French-schema".conjugation_forms;

-- present, imparfait, futur, conditionnel, subjonctif: six forms each
insert into "French-schema".conjugation_forms (inf, tense, person, form, form_plain)
select v.inf, t.tense, (array['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles'])[f.n::int], f.form,
       "French-schema".plain_text(f.form)
from "French-schema".conjugation_verbs v
cross join (values ('present', 'p'), ('imparfait', 'im'), ('futur', 'f'), ('conditionnel', 'c'), ('subjonctif', 's')) as t(tense, key)
cross join lateral jsonb_array_elements_text(v.forms -> t.key) with ordinality as f(form, n)
where not v.pronominal and f.form <> '';

-- imperatif: tu, nous, vous
insert into "French-schema".conjugation_forms (inf, tense, person, form, form_plain)
select v.inf, 'imperatif', (array['tu', 'nous', 'vous'])[f.n::int], f.form, "French-schema".plain_text(f.form)
from "French-schema".conjugation_verbs v
cross join lateral jsonb_array_elements_text(v.forms -> 'ip') with ordinality as f(form, n)
where not v.pronominal and f.form <> '';

-- participe passe
insert into "French-schema".conjugation_forms (inf, tense, person, form, form_plain)
select v.inf, 'participe_passe', '', v.pp, "French-schema".plain_text(v.pp)
from "French-schema".conjugation_verbs v
where not v.pronominal;

-- Check: verbs and forms (about 2,060 verbs and 66,000 forms), and a test search: "mangeons" should give manger
select (select count(*) from "French-schema".conjugation_verbs) as verbs,
       (select count(*) from "French-schema".conjugation_forms) as forms;
select inf, tense, person, form from "French-schema".conjugation_forms
where form_plain = "French-schema".plain_text('mangeons') order by inf, tense;
