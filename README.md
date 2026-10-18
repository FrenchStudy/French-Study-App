# French-Study-App

A browser-based French learning suite backed by Supabase (schema `French-schema`) and Groq AI.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Home: greeting and progress, the 8 sections, and a Continue row (next flashcards, grammar, conjugation and goal) |
| `login.html` | Sign in, create account, forgot password, Google |
| `welcome.html` | First-time setup: goal, level or a 14-question placement test (A1–C2) |
| `reset.html` | Choose a new password from the reset email |
| `lesson.html` | Grammar: one course of 97 lessons (A1–C2), the 78 grammar lessons plus the verb lessons; practice is typed and checked, and a lesson is marked done when you get 75% right |
| `vocab.html` | Vocabulary by topic (56 themes A1–C2 once `supabase/vocab-themes/06` is run, plus 4 basics): Learn (hands-on lesson and words), Practise (flashcards), Test (quiz); Review of due words; the 5,000 most common words in sets of 50 (our own list, from `supabase/vocab-themes/07`) |
| `conjugations.html` | Conjugations: verb tables for 296 verbs in 12 tenses, and Practice (fill in the six forms); no AI |
| `reading.html` | Reading: texts by level A1–C2 (built-in, shared library, your `reading_topics`), a new AI text by subject and type, or paste your own; tap any word for its meaning and add it to Vocab; questions with explanations |
| `listening.html` | Listening: recordings by level A1–C2 (its own built-in recordings, shared library, your `listening_topics`); sentence-by-sentence player, questions, transcript and dictation |
| `writing.html` | Writing: a new AI question from a subject and format, your own posted question, or 30 ready-made tasks (A1–C2); checklist, word bank, model answer or AI sample reply; AI corrections shown inside your text. |
| `speaking.html` | Speaking: Conversation (12 AI characters or your own scene, voice or text, hints, report), Shadowing (7 tracks, listen and repeat with a word check, no AI) and Exam task (AI task or your own question, speak with a timer, score and corrections). |
| `terms.html`, `privacy.html` | Terms of use and Privacy policy (Canada: PIPEDA and Quebec Law 25), linked in every page's footer and at sign-up; brand, contact email and province come from `SITE` in `config.js` |
| `translator.html` | Translator French ⇄ English with grammar notes, a tutor chat and Save to Vocab; one visit counts as one AI use |
| `admin.html` | Admins only: AI status and a dashboard (students, activity, AI use); needs `supabase/admin/01_dashboard.sql` |

## Shared configuration

`config.js` holds the Supabase URL, anon key and schema, creates the shared client
(`window.mySupabase`), and exposes AI settings through `CONFIG`. It also provides `Account`
(the signed-in student's profile), `Activity` (days practised, for the streak), draws the shared
page header into `<header id="app-header">`, and hides Admin links from everyone except admins. Every page that
talks to Supabase loads it right after the Supabase SDK.

## Shared scripts (`js/`)

| File | Purpose |
| --- | --- |
| `lessons-index.js` | Course order and topic titles/levels only, for Home (generated) |
| `ai.js` | `askAI()` for every AI call (through the server, see `AIServer` in config.js), `escapeHtml()`, `speakFrench()` |
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
