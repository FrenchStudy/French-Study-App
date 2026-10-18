#!/usr/bin/env bash
# Builds the site to publish: a copy of the app with the Supabase address and public key
# written into config.js. They come from the environment (GitHub repository secrets).
#   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_ANON_KEY=... bash tools/build-site.sh [out-dir]
set -euo pipefail
OUT="${1:-_site}"
: "${SUPABASE_URL:?Add the SUPABASE_URL repository secret}"
: "${SUPABASE_ANON_KEY:?Add the SUPABASE_ANON_KEY repository secret}"
cd "$(dirname "$0")/.."
rm -rf "$OUT" && mkdir -p "$OUT"
tar --exclude=./.git --exclude=./.github --exclude=./supabase --exclude=./tools --exclude="./$OUT" -cf - . | tar -xf - -C "$OUT"
python3 - "$OUT/config.js" <<'PY'
import os, re, sys
p = sys.argv[1]
url, key = os.environ['SUPABASE_URL'].strip().rstrip('/'), os.environ['SUPABASE_ANON_KEY'].strip()
if not re.fullmatch(r'https://[a-z0-9-]+\.supabase\.co', url):
    sys.exit('SUPABASE_URL should look like https://xxxx.supabase.co')
if not re.fullmatch(r'[A-Za-z0-9._-]{20,}', key):
    sys.exit('SUPABASE_ANON_KEY does not look like a Supabase key')
if key.startswith('sb_secret_') or '"role":"service_role"' in key:
    sys.exit('That is a secret key. Use the anon / publishable key.')
s = open(p, encoding='utf-8', newline='').read()
if '__SUPABASE_URL__' not in s or '__SUPABASE_ANON_KEY__' not in s:
    sys.exit('config.js has no placeholders to fill')
open(p, 'w', encoding='utf-8', newline='').write(s.replace('__SUPABASE_URL__', url).replace('__SUPABASE_ANON_KEY__', key))
print('config.js filled in')
PY
