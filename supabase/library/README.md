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

## Link texts to your topics (1 minute)

Supabase → **SQL Editor** → **New query** → paste `02_topics.sql` → **Run**.
You should see two rows, `skill` and `topic`. It removes nothing.

The Reading and Listening pages list the topics from `reading_topics` and `listening_topics` by
level. The first student who opens a topic gets a text written by the AI, and it is saved with the
topic name, so everyone after them gets it straight away for free. Until you run this file, topic
texts stay on the device that asked for them.

To add, rename or move a topic to another level, edit those two tables (columns `title`, `level`,
`category`).

## Load the starting texts (1 minute)

Supabase → **SQL Editor** → **New query** → paste `03_starting_texts.sql` → **Run**.
It adds one hand-written text (with an English translation and 4 questions) for each of the 18
listening topics and 21 reading topics, so no student spends an AI use on the first open. The last
table should show listening A1 4, A2 3, B1 5, B2 4, C1 2 and reading B2 21. Running it again adds
nothing new.

## Start over

`99_undo.sql` removes the table and every text in it.
