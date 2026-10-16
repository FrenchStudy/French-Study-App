# The shared Reading and Listening library

Every text the AI writes for a student on the Reading or Listening page is saved here, so the next
student at that level can use it **without spending an AI use**. Texts students paste themselves
are not shared; they stay on their own device.

**Until you run this, nothing breaks:** the pages show the 8 built-in texts, and AI texts are kept
on the device that asked for them.

## Run the SQL (1 minute)

Supabase → **SQL Editor** → **New query** → paste `01_texts.sql` → **Run**.
You should see `texts_in_library = 0`. It removes nothing.

Signed-in students can read every text and add new ones (only as themselves). Nobody can change
or remove a text from the app; you can do that in **Table Editor → library_texts**.

## Start over

`99_undo.sql` removes the table and every text in it.
