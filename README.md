# French-Study-App

A browser-based French learning suite backed by Supabase (schema `French-schema`) and Groq AI.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Home / module launcher |
| `login.html` | Sign in |
| `lesson.html` | Grammar: 78 lessons (A1–C2) from the cheat sheet; topics 2, 3, 10 and 28 include their interactive practice |
| `vocab.html` | Vocabulary: flashcards for 44 themes and 5,000 frequency words, plus 12 interactive lessons (Lessons tab) |
| `conjugations.html` | Verb tables for 296 verbs (no AI) and 44 conjugation lessons (Lessons tab) |
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
| `lesson-kit.js` | Shared lesson browser used by Grammar, Conjugations and Vocab |

`syllabus.html` now redirects to Grammar. Database changes live in `supabase/`.

## Running locally

Serve the folder with any static server, e.g. `npx serve .`, then open `index.html`.
Set your Groq key on `admin.html` first.
