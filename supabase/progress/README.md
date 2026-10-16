# Progress saved in each student's account

The app already saves progress in the browser. This table also keeps it in the student's account:
lessons done, and scores for Reading, Listening, Writing and Speaking. It survives clearing the
browser, and is the base for having progress follow you from laptop to phone.

## Run the SQL (1 minute)

Supabase → **SQL Editor** → **New query** → paste `01_user_progress.sql` → **Run**.
You should see `progress_rows = 0`. It removes nothing, so no "destructive" warning.

From then on, rows appear in **Table Editor → user_progress** as students work.

## Who can see what

- Each student can read, add and update **only their own** rows.
- Nobody can delete progress from the app, and visitors who are not signed in see nothing.
- You (in the Supabase dashboard) see everything.

## Start over

`99_undo.sql` removes the table and all saved progress. Progress kept in each browser is not affected.
