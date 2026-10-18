# Combine the cheat sheet and the word bank into one word list

These files turn `vocabulary_bank` into the app's single word list and add themes.
Run them in order in the Supabase SQL editor. Each file is safe to run twice, and
`99_undo.sql` puts everything back as it was.

| File | What it does | You should see |
| --- | --- | --- |
| `01_backup.sql` | Copies `vocabulary_bank` to `vocabulary_bank_backup_2026_10_14` | `rows_backed_up` = 5000 |
| `02_fill_gender_and_articles.sql` | Adds `source` and `pron_guide` columns; fills `Noun_Gender` and `Article` from `Part_of_Speech` | `words_with_gender` = 2522, `words_with_article` = 2291 |
| `03_add_cheatsheet_words.sql` | Adds the cheat sheet's pronunciation guide to 448 existing words, and adds 716 new entries (295 words, 421 phrases) with no frequency rank | `cheatsheet_entries` = 716, `total_entries` = 5716 |
| `04_themes.sql` | Creates `themes` and `word_themes` (read-only for app users) and links the cheat sheet's 30 themes | 30 rows, one per theme, with word counts |
| `05_new_themes.sql` | Adds 14 new B1–C1 themes (ids 31–44) from words already in the bank | 14 rows, 33–52 words each |
| `06_c1_c2_themes.sql` | Adds 12 C1–C2 topics (ids 45–56): reuses 102 words already in the bank and adds 198 new ones with example sentences (`source = 'advanced'`) | 12 rows, 24–28 words each |
| `06_undo_c1_c2.sql` | Removes only what `06` added | `themes_left` = 44 |
| `07_own_word_list.sql` | Replaces the 5,000-word frequency list found online with our own 5,000-word list (`source = 'core'`, Rank 1–5000, an example sentence for every word). Moves every topic link to the new words, then deletes the old rows. Backs up both tables first | `core_words` = 5000, `old_frequency_words` = 0, `topic_links` unchanged, `ranks` = 1–5000 |
| `07_undo_own_word_list.sql` | Puts the old list back from the `07` backups | `frequency_words` = 5000 |
| `07_drop_old_list_backups.sql` | Deletes the backup tables that still contain the old list. Run it once the Vocab page looks right | `backups_left` = 0 |
| `99_undo.sql` | Removes the themes, the new entries and the new columns, and restores gender and article from the backup | `rows_now` = 5000 |

Before running `05_new_themes.sql`, look through `05_new_themes_review.csv` (GitHub shows it as a table).
If a word doesn't belong in a theme, delete its line from the `values` list in `05_new_themes.sql`,
or remove it later from the `word_themes` table in the table editor.

## Step by step

1. Open your project at [supabase.com](https://supabase.com/dashboard) and click **SQL Editor** in the left menu.
2. Click **New query**.
3. Open `01_backup.sql` here on GitHub, click the **Copy raw file** button, paste it into the editor, and click **Run**.
4. Check the result at the bottom matches the table above.
5. Repeat steps 2–4 for `02`, `03`, `04`, `05` and `06` (after your review of `05`).
6. Open the app's Vocab page. The deck list now shows the themes from the database, including the
   new groups "B1–B2: Life and society" and "B2–C1: The wider world".

If a step shows an error, stop and send the error message; nothing after it needs to run.
Each file runs as one transaction, so a failed file changes nothing.

## Notes

- The Vocab page works before, during and after these steps: until `04_themes.sql` has run it uses
  the themes built into the app.
- New entries from the cheat sheet have `source = 'cheatsheet'` and no `Rank`, so the frequency decks
  (words 1–50, 51–100…) are unchanged.
- `Article` is only filled for words that are nouns and nothing else, so verbs such as *être* stay bare.
  Where the cheat sheet uses a word as a noun (*la mère*), its article is used.
- These files were tested on a copy of the 5,000-word export with four different `id` column setups.

## Replacing the online list (07)

The first 5,000-word list came from a frequency list published online, so it was replaced with
a list written for this app. Order of steps:

1. Merge the app update that goes with it first (it adds the label for names such as *Noël*).
2. Run `07_own_word_list.sql`. It is long (5 blocks of 1,000 words): run it in one go, or block by
   block from the top. Nothing changes until the last block ("3. Swap the lists"), which either
   completes fully or stops with a message and changes nothing.
3. Open Vocab → "Most common words 1–50" and a few topics to check the words and examples.
4. Run `07_drop_old_list_backups.sql` so no copy of the old list stays in the database.

Good to know:

- The new words have no IPA or Register (those came from the old list). The pronunciation guide
  from the cheat sheet is kept for the 464 words it covered.
- Topic links follow the spelling: *famille* in the Family topic now points to the new *famille*.
  The tests check that every topic keeps exactly the same number of words.
- After `07`, `99_undo.sql` should no longer be used. Use `07_undo_own_word_list.sql` instead
  (until the backups are dropped).
- `07` was tested on the three `id` column setups (identity, serial, plain), after `06`, run twice,
  undone and run again.
