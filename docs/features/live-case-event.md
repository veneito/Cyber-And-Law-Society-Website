# Live Bea F. Wellington event

The homepage promotes the online case above the main club banner, with a Live event navigation link. October 29's Metadata Scavenger Hunt: Revamped is now in Past meetings.

## Window and rules

`shared/case-event.mjs` is the shared schedule: October 30, 2026 at 4:45 p.m. CDT through November 6, 2026 at 4:45 p.m. CST (America/Chicago). The differing UTC offsets account for daylight saving time ending that week. Visitors can start asynchronously while the event is open. Their clock starts after briefing, runs without pausing, and expires at the earlier of 90 minutes or event closing. Score-changing API calls are rejected after completion/expiration. Repeated start calls cannot rename, restart, or change a completed attempt.

Discord sign-in requires `identify` and `guilds.members.read`; the server checks membership of the configured club guild and rejects pending screening. The server reserves one attempt per Discord user ID and returns that same attempt on subsequent registration, including from a fresh browser/session. Existing anonymous/test team codes do not bypass membership or appear on the event board. Scores/results stay readable to their owner after closing. Rankings remain provisional until the event closes; the winner announcement is directed to the club Discord. One Discord account is the enforceable identity; the rules prohibit alternate accounts and shared answers.

## Required owner setup before launch

1. Coordinate the game/API and private state changes with Vene. Follow AGENTS.md's reviewed-PR deployment procedure; do not merge without the required review.
2. Open the club's application in the Discord Developer Portal (or create an application). In OAuth2, register `https://cybernlaw.grenudo.dev/api/case/callback` as a redirect URI. No new bot installation is required for this OAuth flow.
3. In the server's private `.env`, set `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_GUILD_ID`, and `DISCORD_REDIRECT_URI` as illustrated by `.env.example`. The client secret must never be pasted into chat or committed. Copy the club server ID using Discord's Developer Mode. Reuse the existing club invite in `shared/case-event.mjs`.
4. Restart the website after adding environment values. Register the separate localhost callback to test locally; use the HTTPS production callback on the live server.
5. Verify a member can sign in, a nonmember gets the join/screening message, and the same account resumes on another browser. Check the exact event closing time on the deployed page.
6. Do not use the external dashboard's Reset case progress during the live event. The API reset endpoint is disabled for the event, but external deletion of the state file still destroys the attempt ledger. Back up private state before deployment and retain it throughout the event.

If OAuth is not configured, the page explains that entry is being prepared and offers the Discord join link. It does not grant an unverified attempt.

## Private storage and sessions

The existing private `data/case-state.json` stores an optional `participantId` alongside each online team's existing fields. The new `data/case-auth.json` stores hashed random session tokens and Discord ID/display name for 30 days; OAuth access/refresh tokens are not persisted. Both files are ignored by Git. Session cookies are HttpOnly, SameSite=Lax and Secure with an HTTPS redirect URI. OAuth state is single-use, bound to a browser cookie, expires after ten minutes and is cleared on callback. Auth initiation is limited to ten requests per IP per minute. A restart during sign-in requires starting sign-in again; completed sessions persist.

The current synchronous file-backed reservation assumes one Node server process, consistent with the existing deployment. Multiple replicas would require a shared transactional store.

## Validation

`node tests/case-live-event.test.mjs` uses temporary files and mocked Discord responses: no real sign-ins, messages or production writes. It covers membership/screening, OAuth state, cookie settings, account ownership, repeated reservations, immutable start/final scores and the event deadline. Existing registration/survey/Spanish tests explicitly disable event enforcement only when NODE_ENV=test and CASE_EVENT_DISABLED=1, preserving isolated legacy test fixtures. Production must not run with that combination.

Build/type check and lint pass (existing unrelated lint warnings remain). Local browser inspection verifies the prominent homepage announcement, case-entry membership copy and archived October 29 meeting. Real Discord authorization remains unverified until credentials are configured.

Online USB instructions are repeated in the event rules, simulation boot, library scene and officer dispatch. A high-contrast notice explicitly says to remain on the website: no library visit, physical USB or uploaded e-signature file. Players are directed to remember the simulated floor/item, dispatch the officer and verify the recovered USB online.

## Officer symbol-key attachment

Only after successful USB retrieval and server-confirmed signature verification (cipher phase), the officer sends the supplied symbol-key PDF. The dispatch scene alone never grants the attachment; failed verification does not reveal it. The officer explicitly says the key was found on the recovered drive. A nonmodal desktop window opens automatically, stays available throughout the cipher phase (also after refresh), and has a persistent Symbol key launcher. It supports title-bar pointer/touch dragging, arrow-key movement, corner resizing, minimize, maximize/restore, close/Escape, and reopen. Zoom controls scale the one-page key from 50% to 250%. Closing/minimizing preserves position, zoom and page scroll while the component remains mounted.

The supplied PDF is a one-page scanned image. Its exact embedded page image is displayed for reliable browser support, with links to open/download the unmodified original PDF. Both use content-hashed filenames under deploy/case-assets and are served through authenticated API routes only after the account reaches the cipher phase. Guessing the attachment URL before USB verification returns 403. Vite alone supports a local preview override; the production handler ignores that query parameter. The authenticated PDF route responds with application/pdf. The attachment is a player reference, not a secret; score validation remains server-side. A dedicated dev preview is available as Officer attachment: symbol key PDF window.

Validation: supplied page visually inspected, TypeScript/build/lint pass, local browser checks cover page display, minimize, maximize/restore, close/reopen and keyboard movement.
