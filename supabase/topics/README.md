# Topics for every level

The Reading and Listening pages show topic cards from the `reading_topics` and `listening_topics`
tables. Reading only had B2 topics and Listening stopped at C1; this adds topics so every level
from A1 to C2 has some.

| File | What it does | You should see |
| --- | --- | --- |
| `01_topics_to_c2.sql` | Adds 23 reading topics (A1, A2, B1, C1, C2) and 6 listening topics (C1, C2). Existing topics are untouched. | Reading: A1 4, A2 4, B1 5, B2 21, C1 5, C2 5. Listening: A1 4, A2 3, B1 5, B2 4, C1 4, C2 4 |
| `99_undo.sql` | Removes only the topics above | `reading_topics` = 21, `listening_topics` = 18 |

Run it in Supabase → **SQL Editor** → **New query**: paste the file, click **Run**, and check the
result matches the table. Running it twice changes nothing.

A topic's text is written by the AI the first time someone opens it, then shared with everyone at
that level, so each topic uses one AI request once.
