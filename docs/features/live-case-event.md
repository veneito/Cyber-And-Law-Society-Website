# Live Bea F. Wellington event

The homepage promotes the online case above the main club banner, with a Live event navigation link. October 29's Metadata Scavenger Hunt: Revamped is now in Past meetings.

## Window and rules

`shared/case-event.mjs` is the shared schedule: November 1, 2026 at 9:00 a.m. CST through November 13, 2026 at 4:45 p.m. CST (America/Chicago). The differing UTC offsets account for daylight saving time ending that week. Visitors can start asynchronously while the event is open. Their clock starts after briefing, runs without pausing, and expires at the earlier of 90 minutes or event closing. Score-changing API calls are rejected after completion/expiration. Repeated start calls cannot rename, restart, or change a completed attempt.

Sign-in uses the Lady Justice bot instead of OAuth: a member runs `/play` in the club server and gets a private (ephemeral) one-time code, valid 10 minutes, which they enter on the case page. The bot rejects members still in screening or from another server, then asks the site (`POST /api/case/bot-code`, shared secret `CASE_BOT_SECRET`) to mint the code; `POST /api/case/login` redeems it for a session cookie. The server reserves one attempt per Discord user ID and returns that same attempt on subsequent registration, including from a fresh browser/session. Existing anonymous/test team codes do not bypass membership or appear on the event board. Scores/results stay readable to their owner after closing. Rankings remain provisional until the event closes; the winner announcement is directed to the club Discord. One Discord account is the enforceable identity; the rules prohibit alternate accounts and shared answers.

## Required owner setup before launch

1. Coordinate the game/API and private state changes with Vene. Follow AGENTS.md's reviewed-PR deployment procedure; do not merge without the required review.
2. Generate a long random `CASE_BOT_SECRET` and put the same value in `.env` on the website PC and on the machine running `deploy/bot.mjs`. Also set `DISCORD_GUILD_ID` (club server ID, via Developer Mode) there. The bot also needs `DISCORD_BOT_TOKEN`; set `CASE_SITE_URL` only if the site is not at https://cybernlaw.grenudo.dev. See `.env.example`. Never paste these into chat or commit them.
3. Restart the website and the bot (`sudo systemctl restart cls-site cls-bot`). Only one copy of the bot may run. On start it registers the `/play` command in the club server. No OAuth app or redirect URL is needed.
4. The bot's invite already has `applications.commands`, so it needs no new permissions.
5. Verify a member can `/play` and sign in, a member in screening is told to finish it, and the same account resumes on another browser. Check the exact event closing time on the deployed page.
6. Do not use the external dashboard's Reset case progress during the live event. The API reset endpoint is disabled for the event, but external deletion of the state file still destroys the attempt ledger. Back up private state before deployment and retain it throughout the event.

If `CASE_BOT_SECRET` is not set, the page explains that entry is being prepared and offers the Discord join link. It does not grant an unverified attempt.

## Private storage and sessions

The existing private `data/case-state.json` stores an optional `participantId` alongside each online team's existing fields. The new `data/case-auth.json` stores hashed random session tokens and Discord ID/display name for 30 days; OAuth access/refresh tokens are not persisted. Both files are ignored by Git. Session cookies are HttpOnly, SameSite=Lax and Secure with an HTTPS redirect URI. one-time codes is single-use, bound to a browser cookie, expires after ten minutes and is cleared on callback. Auth initiation is limited to ten requests per IP per minute. A restart during sign-in requires starting sign-in again; completed sessions persist.

The current synchronous file-backed reservation assumes one Node server process, consistent with the existing deployment. Multiple replicas would require a shared transactional store.

## Validation

`node tests/case-live-event.test.mjs` uses temporary files and mocked Discord responses: no real sign-ins, messages or production writes. It covers membership/screening, one-time codes, cookie settings, account ownership, repeated reservations, immutable start/final scores and the event deadline. Existing registration/survey/Spanish tests explicitly disable event enforcement only when NODE_ENV=test and CASE_EVENT_DISABLED=1, preserving isolated legacy test fixtures. Production must not run with that combination.

Build/type check and lint pass (existing unrelated lint warnings remain). Local browser inspection verifies the prominent homepage announcement, case-entry membership copy and archived October 29 meeting. Real Discord authorization remains unverified until credentials are configured.

Online USB instructions are repeated in the event rules, simulation boot, library scene and officer dispatch. A high-contrast notice explicitly says to remain on the website: no library visit, physical USB or uploaded e-signature file. Players are directed to remember the simulated floor/item, dispatch the officer and verify the recovered USB online.

## Officer symbol-key attachment

Only after successful USB retrieval and server-confirmed signature verification (cipher phase), the officer sends the supplied symbol-key PDF. The dispatch scene alone never grants the attachment; failed verification does not reveal it. The officer explicitly says the key was found on the recovered drive. A nonmodal desktop window opens automatically, stays available throughout the cipher phase (also after refresh), and has a persistent Symbol key launcher. It supports title-bar pointer/touch dragging, arrow-key movement, corner resizing, minimize, maximize/restore, close/Escape, and reopen. Zoom controls scale the one-page key from 50% to 250%. Closing/minimizing preserves position, zoom and page scroll while the component remains mounted.

The supplied PDF is a one-page scanned image. Its exact embedded page image is displayed for reliable browser support, with links to open/download the unmodified original PDF. Both use content-hashed filenames under deploy/case-assets and are served through authenticated API routes only after the account reaches the cipher phase. Guessing the attachment URL before USB verification returns 403. Vite alone supports a local preview override; the production handler ignores that query parameter. The authenticated PDF route responds with application/pdf. The attachment is a player reference, not a secret; score validation remains server-side. A dedicated dev preview is available as Officer attachment: symbol key PDF window.

Validation: supplied page visually inspected, TypeScript/build/lint pass, local browser checks cover page display, minimize, maximize/restore, close/reopen and keyboard movement.
