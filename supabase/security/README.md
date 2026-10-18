# Security check for the public key

`config.js` contains the Supabase **anon** key. It is meant to be public: every visitor's browser
needs it to talk to the database. It is safe only if every table has Row Level Security (RLS) and
the right permissions. These two files check that and fix it.

| File | What it does | You should see |
| --- | --- | --- |
| `01_check.sql` | Read-only. Lists every table with `rls_on`, its policies, and what visitors and students may do | Run it first and keep the result |
| `02_lock_down.sql` | Word lists and topics: readable by everyone, changeable by nobody through the app. Backups: closed. Any table still without RLS gets it. New tables start closed | Every row `rls_on = true`, and `visitors_can_change = false` |

Run them in the Supabase SQL editor like the other files. Both are safe to run more than once.

Never put the **service_role** (or `sb_secret_…`) key in the app. It ignores RLS and must stay in
Supabase (the AI Edge Function reads it from its own settings).
