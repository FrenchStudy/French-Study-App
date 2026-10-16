#!/bin/sh
# Rebuilds css/app.css from the classes used in the pages (run after changing any page's classes).
# Needs the Tailwind CSS v3 standalone program: https://github.com/tailwindlabs/tailwindcss/releases/tag/v3.4.17
# (download tailwindcss-<your system> from that page, rename it to "tailwindcss" and make it executable).
cd "$(dirname "$0")/.." || exit 1
TW="${TAILWIND:-./tailwindcss}"
"$TW" -c tailwind.config.js -i css/tailwind.src.css -o css/app.css --minify
