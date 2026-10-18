# Officer application

Pages (each is its own Vite entry, see `vite.config.ts`):
- `/meetings` ("Past meetings", button under Events on the home page). Entries live in `siteConfig.pastMeetings` (`src/config/site.ts`); optional `images` per meeting.
- `/become-an-officer`: blurb + "Step one" bug hunt. Opening it starts the hunt (`startHunt()`); the application form shows once the bug is fixed.

Bug hunt (`src/components/Anomaly.tsx`):
- Small flickering photo hidden in one of 7 spots (hero, about, events, officers, faq, contact, meetings page). Spot and offsets come from a per-visitor seed in localStorage (`cls-bug-seed`); only exists after the hunt starts (`cls-hunt`).
- Click -> 5-question law/cyber quiz (wrong answer = retry). Fixed state is `cls-bug-fixed`. After fixing, clicking the photo offers Apply or "Restart the bug" (re-rolls the spot). It's a client-side gate only.
- Quiz now has a final stage (`Chase`): after the 5 questions a phage runs from section to section down the real page (new spot every 3s, portal into `document.body`, page coordinates, so visitors scroll to find it). Click it 3 times (health bar above it, `CATCHES`); the glitch image hides while chasing. Boss music is synthesised in `bossMusic` (WebAudio, with a Music on/off link; skipped under reduced motion). Known report from the user, not reproduced: clicking the phage on the last catch did nothing (a scripted headless-Chrome run completed all three catches fine).
- Win screen (`WinScreen`): glitch-in, scan line, particle burst, typed terminal lines with a "Time to patch" stat, synthesised chime on a fresh win. Buttons: Apply, Restart the bug, Close, Hide bug.
- "Hide bug" (quiz, chase, win screen) clears `cls-hunt` and hides every instance until the officer page is opened from the home page again. Apply on the win screen links to `/become-an-officer?from=win`, which does not restart the hunt. "Play again" on the officer page (`resetHunt`) un-fixes and re-rolls the bug.
- Restart/hide are broadcast to all per-section instances with window events (`cls-bug-restart`, `cls-bug-hide`).
- Flash timing ignores prefers-reduced-motion on purpose (flashes are >1.5s apart).

Application form (`src/components/ApplyForm.tsx`, `deploy/apply.mjs`):
- `POST /api/apply` validates, rate-limits (1/min/IP), appends to `data/applications.jsonl`, posts to Discord, emails via Resend.
- Secrets in git-ignored `.env` (also on the live server at `~/cls-site/.env`): `DISCORD_WEBHOOK_URL`, `RESEND_API_KEY`, `APPLY_EMAIL_TO`, optional `APPLY_EMAIL_FROM`. Missing ones just skip that channel.
- Resend without a verified domain only sends to the account owner's email.
