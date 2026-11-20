# Product screenshots

Status: capture pending. No genuine current application captures were verified during package creation. Do not use marketing artwork as a screenshot.

Capture these workflows using synthetic demo data: Member accounts, transactions, admin approvals.

Save desktop captures to `desktop/` and mobile captures to `mobile/`. Use names such as `01-dashboard-desktop-en-v01.png`. Suggested web capture sizes: 1440×900 desktop and 390×844 mobile. Capture native mobile workflows on the actual emulator/device; browser viewport captures are not native Android captures.

Start the app using its repository instructions, then run `python3 marketing/scripts/capture-screenshot.py URL NAME --device desktop` from the repository root. This helper requires Google Chrome or Chromium, captures a public page, and does not authenticate or seed data. For signed-in workflows, use browser developer tools or the app test tooling with a demo account.

Before release, inspect for personal information, account balances, tokens, debug overlays, old UI and loading states. Record route, viewport, app revision and capture date in `sources/screenshot-log.md`.
