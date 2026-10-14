# French-Study-App

A browser-based French learning suite backed by Supabase (schema `French-schema`) and Groq AI.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Home / module launcher |
| `login.html` | Sign in |
| `syllabus.html` | Curriculum overview |
| `lesson.html` | Grammar and vocab lessons (loads files from `content/`) |
| `vocab.html` | Vocabulary flashcards (`vocabulary_bank`) |
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

## Running locally

Serve the folder with any static server, e.g. `npx serve .`, then open `index.html`.
Set your Groq key on `admin.html` first.
