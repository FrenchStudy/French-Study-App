# French-Study-App

A browser-based French learning suite backed by Supabase (schema `French-schema`) and Groq AI.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Home: greeting and progress, the 8 sections, and a Continue row (next flashcards, grammar, conjugation and goal) |
| `login.html` | Sign in, create account, forgot password, Google |
| `welcome.html` | First-time setup: goal, level or a 14-question placement test (A1–C2) |
| `reset.html` | Choose a new password from the reset email |
| `lesson.html` | Grammar: one course of 93 lessons (A1–C2), the 78 grammar lessons plus the verb lessons; practice is typed and checked, and a lesson is marked done when you get 75% right |
| `vocab.html` | Vocabulary by topic (56 themes A1–C2 once `supabase/vocab-themes/06` is run, plus 4 basics): Learn (hands-on lesson and words), Practise (flashcards), Test (quiz); Review of due words; the 5,000 most common words in sets of 50 (our own list, from `supabase/vocab-themes/07`) |
| `conjugations.html` | Conjugations: verb tables for 296 verbs in 12 tenses, and Practice (fill in the six forms); no AI |
| `reading.html` | Reading: texts by level A1–C2 (built-in, shared library, your `reading_topics`), a new AI text by subject and type, or paste your own; tap any word for its meaning and add it to Vocab; questions with explanations |
| `listening.html` | Listening: recordings by level A1–C2 (its own built-in recordings, shared library, your `listening_topics`); sentence-by-sentence player, questions, transcript and dictation |
| `writing.html` | Writing: a new AI question from a subject and format, your own posted question, or 30 ready-made tasks (A1–C2); checklist, word bank, model answer or AI sample reply; AI corrections shown inside your text. |
| `speaking.html` | Speaking: Conversation (12 AI characters or your own scene, voice or text, hints, report), Shadowing (7 tracks, listen and repeat with a word check, no AI) and Exam task (AI task or your own question, speak with a timer, score and corrections). |
| `terms.html`, `privacy.html` | Terms of use and Privacy policy (Canada: PIPEDA and Quebec Law 25), linked in every page's footer and at sign-up; brand and date come from `SITE` in `config.js` |
| `contact.html` | Contact form (no email address shown): messages go to the `contact_messages` table, admins read them on the Admin page; needs `supabase/contact/01_contact.sql` |
| `translator.html` | Translator French ⇄ English with grammar notes, a tutor chat and Save to Vocab; one visit counts as one AI use |
| `admin.html` | Admins only: AI status and a dashboard (students, activity, AI use); needs `supabase/admin/01_dashboard.sql` |

## Shared configuration

`config.js` holds the Supabase schema and placeholders for the URL and anon key, creates the shared client
(`window.mySupabase`), and exposes AI settings through `CONFIG`. It also provides `Account`
(the signed-in student's profile), `Activity` (days practised, for the streak), draws the shared
page header into `<header id="app-header">`, and hides Admin links from everyone except admins. Every page that
talks to Supabase loads it right after the Supabase SDK.

## Publishing

The Supabase URL and anon key are not stored in this repository. `.github/workflows/pages.yml`
publishes the site to GitHub Pages on every change to `main`: it runs `tools/build-site.sh`, which
copies the app (without `supabase/` and `tools/`) and writes the two values from the repository
secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY` into `config.js`. Settings → Pages → Source must be
**GitHub Actions**. To try the app on your own computer, build it the same way:
`SUPABASE_URL=… SUPABASE_ANON_KEY=… bash tools/build-site.sh` and serve the `_site` folder.

## Shared scripts (`js/`)

| File | Purpose |
| --- | --- |
| `lessons-index.js` | Course order and topic titles/levels only, for Home (generated) |
| `ai.js` | `askAI()` for every AI call (through the server, see `AIServer` in config.js), `escapeHtml()`, `speakFrench()` |
| `word-memory.js` | Free memory aids for Vocab: `WordMemory.picture(word)` (emoji for about 1,460 words you can picture) `WordMemory.tips(word)` (false friends, words that look like English, gender by ending) and `WordMemory.hook(word)` (about 780 written memory hooks for the most common words and the A1–A2 topics) |
| `memory-palace.js` | The Memory palace step in Vocab: a place cut open (house, station, street of shops) with each word as an object in its room; Explore, Walk through and Quiz (quiz answers count in reviews). `MemoryPalace.has(themeId)`, `MemoryPalace.mount(el, themeId, words, { say, grade })`. Palace data is in `palaces-data.js` (15 A1–A2 topics: 9, 11, 15, 18–24, 26–29, 32) and `palaces-data-2.js` (18 B1–C2 topics: 31, 33, 34, 36–43, 45–49, 51, 56) |
| `clock.js` | The interactive clock for Telling Time (Vocab theme 6, in the palace step): drag the hands or use ±5 min / ±1 h; shows the time in everyday French (trois heures moins le quart du soir) and 24-hour French; Set the clock, Read the clock and Listen quizzes. `FrenchClock.say(h, m)` gives both sentences |
| `vocab-tools.js` | Hands-on tools in step 2 of topics about rules: Number builder (theme 4: French words for any number, colour blocks for 70–99, rules for et / -s / mille, listen / read / write quizzes), Calendar (theme 5: month grid from lundi, le premier, hier / demain…, find and listen quizzes), Colour dresser (theme 14: agreement, invariable colours, clair / foncé, quiz). Registry `VocabTools[themeId] = { name, next, mount }`; `VocabTools.numberFr(n)` |
| `time-line.js` | The Time line for Frequency & Time Adverbs (theme 7, in the palace step): one chart with sliders for how often (jamais → toujours), when (past → maintenant → future, with dernier / prochain), how long (pendant, depuis, longtemps) and tôt / tard; says each word and an example |
| `weather-video.js` | The weather video for La Météo & Les Saisons (theme 8, in the palace step): a 79-second animated video with French voices (`media/meteo/`), and Check yourself: a still from the video with four answers where the wrong ones are the usual il fait / il y a mistakes; answers count in reviews. Made with `tools/meteo-video/` |
| `picture-page.js` | Bilingual picture pages in step 2 of topics about things you can see: a drawn scene with each object labelled in French (blue = le, pink = la) and English; Explore (tap to hear), Point (hear, tap) and Name it (pick from four); answers count in reviews. `PicturePages[themeId]` holds the scene and objects. Now: Cooking (35, the kitchen) and House (15: three pictures in tabs, the house cut open, the block of flats, the furniture; made by `tools/picture-pages/house.py`). Objects are Microsoft Fluent Emoji 3D pictures (MIT licence, `media/pictures/`, licence file alongside; a credit line shows under the page), with a few drawn in the same soft style where the set has no picture (oil, sugar, plate, glass, cream) |
| `watch.js` | Watch mode in Vocab → Learn: a hands-free slideshow (picture, French spoken twice, English spoken, example spoken), with pause, next/previous, slow, English voice and examples on/off. `WatchMode.open(words, { title })` |
| `conjugate.js` | Rule-based conjugation engine (296 verbs, 12 tenses) |
| `cheatsheet-data.js` | Cheat sheet vocab themes (fallback for Vocab) |
| `writing-tasks.js` | The built-in writing tasks |
| `scenes.js` | The 17 conversation scenes (A1–C2) and their phrases |
| `lessons-data.js` | Cheat sheet grammar and conjugation lessons |
| `texts.js` | Ready-made texts: Reading C1–C2 and Listening's own recordings A1–C2 |
| `lesson-kit.js` | The Grammar course (which verb lessons merge into which grammar lesson, teaching order) and the hands-on lessons used by Vocab |

AI requests go through the `ai` Edge Function (`supabase/functions/ai`), which keeps the Groq key on the server and gives each student 5 free AI activities; setup steps are in `supabase/ai/README.md`. `syllabus.html` now redirects to Grammar. Database changes live in `supabase/`; account setup steps are in `supabase/accounts/README.md`.

## Running locally

Serve the folder with any static server, e.g. `npx serve .`, then open `index.html`.
AI needs the `ai` Edge Function (see `supabase/ai/README.md`). After changing classes in a page, rebuild the stylesheet with `tools/build-css.sh`.
