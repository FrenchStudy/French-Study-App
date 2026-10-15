# AI for every student: the server key and 5 free uses

Today the Groq key is saved only in the browser where you typed it on the Admin page, so students
on their own devices can't use any AI feature. These steps put the key on the server, where no one
can see it, and count each student's free uses.

**Until you finish these steps nothing breaks:** the app keeps using the key on your Admin page.

How it counts: one **use** is one AI activity — a writing check, a new question, a sample answer,
or a whole conversation (not each message). Each account gets **5 free uses**; admins and premium
accounts have no free-use limit. Lessons, flashcards, verb tables and Shadowing never use AI.

## 1. Run the SQL (1 minute)

Supabase → **SQL Editor** → **New query** → paste `01_ai_usage.sql` → **Run**.
You should see `accounts_with_ai_use = 0`. It removes nothing, so no "destructive" warning.

## 2. Add the Groq key as a secret (1 minute)

Supabase → **Edge Functions** → **Secrets** (the "Edge Function Secrets" page).
Add **Key** `GROQ_API_KEY`, **Value** your Groq key (`gsk_…`, the one on your Admin page), then **Save**.

Optional secrets (only if you want to change the defaults):

| Key | Default | Meaning |
| --- | --- | --- |
| `FREE_USES` | `5` | AI activities a free account can use in total |
| `DAILY_LIMIT` | `100` | AI activities a premium account can start per day |
| `SESSION_LIMIT` | `40` | AI requests inside one activity (e.g. messages in one conversation) |
| `GROQ_MODEL` | `openai/gpt-oss-120b` | The Groq model |

## 3. Deploy the function (2 minutes)

1. Supabase → **Edge Functions** → **Deploy a new function** → **Via Editor**.
2. Name it exactly **`ai`**.
3. Delete the example code, paste the whole of `supabase/functions/ai/index.ts`, and click **Deploy function**.
   Wait for the success message.

Supabase gives the function its own URL and server key automatically; there is nothing else to fill in.

## 4. Check it works

1. Open the app's **Admin** page: it should say **✅ The AI function is working**.
2. Sign in as a student (or a test account) on another browser or phone, open **Writing**, write a
   few sentences and tap **Check my writing**. Home then shows **✨ 4 free AI uses left**.
3. You can now clear the key from the Admin page if you like; it is no longer needed.

If the Admin page says **not deployed yet**, check the function is named `ai`.
If AI requests fail with "Invalid JWT", open the `ai` function → **Details** and switch off
**Enforce JWT verification** (the function checks who is signed in itself), then try again.

## Premium and admin accounts

In **Table Editor → profiles**, set `is_premium` to `true` for a subscriber, or `role` to `admin`.
The payment step (Stripe) will later set `is_premium` automatically.

## See how much AI is used

**Table Editor → ai_usage**: one row per activity, with the student, the feature
(`writing-check`, `speaking-chat`, …), the number of AI requests and the date.
