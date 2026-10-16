# The Admin dashboard

The Admin page shows your app at a glance: students (by level and goal, new this week, premium),
activity this week, AI use (per day, per feature, who used all their free AI), the shared library,
and lessons and skills completed.

## Turn it on (1 minute)

Supabase → **SQL Editor** → **New query** → paste `01_dashboard.sql` → **Run**.
You should see `function_name = admin_dashboard`. It changes no data.

## Is it private?

Yes. Students' data stays private to each student. The dashboard asks the database for **totals**
through one function, which first checks that the person asking is an admin
(`role = admin` in **profiles**). Anyone else gets "Only admins can see the dashboard". The only
names it shows are the latest sign-ups and the 5 students who used AI the most this month.

## Notes

- "Used all free AI" counts students who are not premium and have used 5 AI activities. If you change
  the `FREE_USES` secret of the AI function, change `free_uses` at the top of `01_dashboard.sql` too
  and run it again.
- `99_undo.sql` removes the function. No data is touched.
