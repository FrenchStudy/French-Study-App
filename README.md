# French-Study-App

A browser-based French learning suite backed by Supabase (schema `French-schema`) and Groq AI.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Home: greeting and progress, the 8 sections, and a Continue row (next flashcards, grammar, conjugation and goal) |
| `login.html` | Sign in, create account, forgot password, Google |
| `welcome.html` | First-time setup: goal, level or a 12-question placement test |
| `reset.html` | Choose a new password from the reset email |
| `lesson.html` | Grammar: one course of 97 lessons (A1–C2), the 78 grammar lessons plus the verb lessons |
| `vocab.html` | Vocabulary by topic (44 themes plus 4 basics): Learn (hands-on lesson and words), Practise (flashcards), Test (quiz); Review of due words; the 5,000 most common words in sets of 50 |
| `conjugations.html` | Conjugations: verb tables for 296 verbs in 12 tenses, and Practice (fill in the six forms); no AI |
| `reading.html` | Reading practice (`reading_topics`) |
| `listening.html` | Listening practice (`listening_topics`) |
| `writing.html` | Writing: a new AI question from a subject and format, your own posted question, or 27 ready-made tasks (A1–C1); checklist, word bank, model answer or AI sample reply; AI corrections shown inside your text. `writing-classic.html` is the previous page, kept for comparison |
| `speaking.html` | Speaking practice and AI roleplay |
| `translator.html` | Translator and analyzer |
| `admin.html` | Save the AI API key, model and URL for this browser |

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
| `ai.js` | `askAI()` for every AI call, `escapeHtml()`, `speakFrench()` |
| `conjugate.js` | Rule-based conjugation engine (296 verbs, 12 tenses) |
| `cheatsheet-data.js` | Cheat sheet vocab themes (fallback for Vocab) |
| `writing-tasks.js` | The built-in writing tasks |
| `lessons-data.js` | Cheat sheet grammar and conjugation lessons |
| `lesson-kit.js` | The Grammar course (which verb lessons merge into which grammar lesson, teaching order) and the hands-on lessons used by Vocab |

`syllabus.html` now redirects to Grammar. Database changes live in `supabase/`; account setup steps are in `supabase/accounts/README.md`.

## Running locally

Serve the folder with any static server, e.g. `npx serve .`, then open `index.html`.
Set your Groq key on `admin.html` first.
