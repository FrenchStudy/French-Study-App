# Accounts: sign-up, levels and goals

The app works before you do these steps (levels are then kept on each device), but do them
before you invite students so their level and goal follow them to any device.

## 1. Run the SQL (2 minutes)

In Supabase, open **SQL Editor → New query**, paste `01_profiles.sql`, and click **Run**.

You should see one row: `profiles` (how many accounts exist) and `with_level` (0 at first).

What it does:
- Adds `display_name`, `level`, `goal`, `onboarded_at` and `updated_at` to `profiles`.
- Lets each student read and edit **only their own** profile, and only those columns.
  Students can never change `role` or `is_premium`; you still can, in the table editor.
- Creates a profile automatically when someone signs up (and for everyone who already has an account).

It contains no `DROP`, so Supabase shouldn't show the "destructive" warning.
`99_undo.sql` removes the rules and the trigger if you ever need to (it keeps the data).

## 2. Tell Supabase where the app lives

So the links in confirmation and password-reset emails open your app:

1. **Authentication → URL Configuration**
2. **Site URL**: your app's address, for example `https://frenchstudy.github.io/French-Study-App/`
3. **Redirect URLs**: add these three (use your own address):
   - `https://frenchstudy.github.io/French-Study-App/welcome.html`
   - `https://frenchstudy.github.io/French-Study-App/reset.html`
   - `https://frenchstudy.github.io/French-Study-App/login.html`

## 3. Email confirmation (your choice)

**Authentication → Providers → Email → Confirm email**
- **On** (safer): new students get an email and must click the link before they can sign in.
  The app tells them to check their inbox.
- **Off** (quicker to try): new students go straight to the first-time setup.

Supabase's built-in email sender is limited to a few emails per hour. Before launch, add your own
SMTP sender under **Authentication → Emails → SMTP Settings** (Resend and Brevo have free plans).

## 4. Google sign-in (optional)

Until this is set up, the "Continue with Google" button shows a friendly "not switched on yet" message.

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project, then
   **APIs & Services → Credentials → Create credentials → OAuth client ID** (type: Web application).
2. Under **Authorised redirect URIs**, add the callback URL shown in Supabase at
   **Authentication → Providers → Google** (it looks like `https://<your-project>.supabase.co/auth/v1/callback`).
3. Copy the **Client ID** and **Client secret** into that Supabase Google provider page and switch it on.

## 5. Make yourself admin

In **Table Editor → profiles**, find your row and set `role` to `admin`.
Only admins see the Admin link in the app.
