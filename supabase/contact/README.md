# Contact form

`contact.html` lets anyone write to you without your email address being shown on the site.
Messages are stored in the `contact_messages` table. Visitors can only *send*; nobody can read
messages through the app except admins, on the Admin page (Messages).

| File | What it does | You should see |
| --- | --- | --- |
| `01_contact.sql` | Creates the table, the "send only" rules and `admin_messages()` | `messages_so_far` = 0 |
| `99_undo.sql` | Removes it all (and any messages) | — |

You can also read messages in the Supabase table editor (`contact_messages`).
