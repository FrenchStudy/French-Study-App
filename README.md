# French-Study-App

A browser-based French learning suite backed by Supabase (schema `French-schema`) and Groq AI.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Home / module launcher |
| `login.html` | Sign in |
| `lesson.html` | Lessons: 78 grammar and 44 conjugation topics (A1–C2) from the cheat sheet, plus 14 interactive lessons in `content/` |
| `vocab.html` | Vocabulary flashcards: 44 themes and 5,000 frequency words (`vocabulary_bank`, `themes`, `word_themes`) |
| `conjugations.html` | Verb conjugation drills |
| `reading.html` | Reading practice (`reading_topics`) |
| `listening.html` | Listening practice (`listening_topics`) |
| `writing.html` | Writing with AI feedback |
| `speaking.html` | Speaking practice and AI roleplay |
| `translator.html` | Translator and analyzer |
| `admin.html` | Save the AI API key, model and URL for this browser |

## Shared configuration

`config.js` holds the Supabase URL, anon key and schema, creates the shared client
(`window.mySupabase`), and exposes AI settings through `CONFIG`. Every page that
talks to Supabase loads it right after the Supabase SDK.

## Shared scripts (`js/`)

| File | Purpose |
| --- | --- |
| `ai.js` | `askAI()` for every AI call, `escapeHtml()`, `speakFrench()` |
| `conjugate.js` | Rule-based conjugation engine (296 verbs, 12 tenses) |
| `cheatsheet-data.js` | Cheat sheet vocab themes (fallback for Vocab) |
| `lessons-data.js` | Cheat sheet grammar and conjugation lessons |

`syllabus.html` now redirects to Lessons. Database changes live in `supabase/`.

## Running locally

Serve the folder with any static server, e.g. `npx serve .`, then open `index.html`.
Set your Groq key on `admin.html` first.
