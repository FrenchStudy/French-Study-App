# Progress saved in each student's account

The app already saves progress in the browser. This table also keeps it in the student's account:
lessons done, and scores for Reading, Listening, Writing and Speaking. It survives clearing the
browser, and is the base for having progress follow you from laptop to phone.

## Run the SQL (1 minute)

Supabase → **SQL Editor** → **New query** → paste `01_user_progress.sql` → **Run**.
You should see `progress_rows = 0`. It removes nothing, so no "destructive" warning.

From then on, rows appear in **Table Editor → user_progress** as students work.

## Progress on every device (1 minute)

Then paste `02_sync.sql` → **Run**. You should see one row: `data | jsonb`.
After this, words learned, lessons done, scores, streak, and your own texts and tasks follow each
student to every device they sign in on. The copies are combined, so nothing is lost: for a word
studied on two devices, the higher level wins; for a task done twice, the latest score wins.
If a different person signs in on the same device, they do not get the previous person's progress.

## Who can see what

- Each student can read, add and update **only their own** rows.
- Nobody can delete progress from the app, and visitors who are not signed in see nothing.
- You (in the Supabase dashboard) see everything.

## Start over

`99_undo.sql` removes the table and all saved progress. Progress kept in each browser is not affected.
