# Bea F. Wellington Investigation: Handoff

Planning notes from the first chat. Nothing has been built yet. Start the next chat by reading this file.

## Concept
A criminal-investigation activity (fake person, fake scenario) about **Bea F. Wellington**. Players follow a trail of evidence, solve puzzles and crack ciphers. Attached to the club site, not part of the homepage.

**Location decision:** a subpage on the existing site (e.g. `/case/wellington`). Same React/Vite stack, no separate site needed. It can be left out of the main nav so it stays unlisted.

## Phase 1: Last known location
1. **EXIF/GPS puzzle.** Players download the original photo (must be served as the untouched original file, since Discord/Instagram/most messengers strip EXIF). The page includes a link to **pic2map.com** and a note: "download the original, don't screenshot it". The GPS leads to the **Marx Library** (building level only; GPS can't give floor or shelf).
2. **Sonar-ping scene.** Stylized, interactive floor plan of the Marx Library (SVG or canvas). A hidden target; the ping gets stronger/faster as the player gets closer (interval, ring size, pitch, volume via Web Audio, hot/cold glow).
   - Mobile has no hover, so use tap-to-scan or a draggable scanner dot.
   - Browsers block audio until first interaction, so use a "begin investigation" button.
3. The sonar target corresponds to the **real physical spot** where a **flash drive** is hidden.

## Phase 2: Flash drive as the key
The "continue investigation" button is locked: **"Requires Bea F. Wellington's digital signature"**. Plugging in the drive unlocks the second half.

A browser cannot detect a USB plug-in or read a drive on its own, so fake the "key" feel:
1. **Folder picker (best feel):** "Insert drive" opens `showDirectoryPicker()`. Player selects the drive. The site reads a file such as `wellington.sig`, checks it against a hash, then plays an unlock animation. Desktop Chrome/Edge only.
2. **File picker fallback (all browsers):** player selects the `.sig` file from the drive.
3. **Typed passphrase (phones/lowest tech):** drive holds a text file or printed code.

Plan: try 1, fall back to 2 automatically. The drive can hold more than the signature: decoy documents, or the first cipher of phase two.

**Constraints:**
- Players need laptops (phones generally can't read USB drives). Library/university computers may block USB.
- A copied signature file can be shared. Mitigate with rotating one-time tokens, a different file per team, or a server-side check so the token isn't readable in the page source.

## Floor plans
- The user is requesting real Marx Library floor plans. Trace over those when they arrive; place the target at the exact spot where the drive will be hidden.
- Until then, a **stylized placeholder schematic** (from public descriptions/photos) can be built to develop the sonar mechanic and UI. It must be clearly rough and replaced later.
- Optional: search for the library's public floor guides / virtual tour pages first to make the placeholder less generic.

## Decisions (confirmed)
- **Answer checking: server-side.** Follow the `deploy/` handler pattern (`handleApply`, `handleLeaderboard`); no answers or tokens in client JS.
- **9 flash drives**, one per team, each with its own signature/token.
- **Content types:** photos (EXIF), sonar, ciphers, puzzles, plus a **case file** where players collect everything to work out the answers.
- **Hidden from nav:** yes.
- **Visual style:** mixture of noir/evidence-board and the existing site theme.

- **Case file: structured evidence list** (one entry per solved item, not a free-form board).
- **Ciphers:** Caesar, A1Z26, progressive Caesar (shift increases by 1 for each letter), and a custom symbol cipher (invent the symbols and a key sheet). Each decoded message must contain **evidence of one of Bea's crimes**, which then lands in the case file.

## Draft crimes and plaintexts (fictional; story-level only, no real technique detail)
Chronological story arc, one crime per cipher. Plaintexts are drafts, short enough to encode by hand.

1. **Evil twin Wi-Fi (Caesar).** Bea sets up an open network named like the university's (e.g. "USouthAlabama_Guest"). Students join and she harvests their logins.
   - Plaintext: `THE FAKE NETWORK IS LIVE. THREE HUNDRED LOGINS BY FRIDAY`
2. **Credential resale (A1Z26).** She sells the stolen student and staff logins on a dark-web forum.
   - Plaintext: `SOLD THE LOGINS TO THE BUYER FOR EIGHT BITCOIN`
3. **Ransomware attack (progressive Caesar).** She uses a stolen staff login to lock the campus servers and demands payment.
   - Plaintext: `INSIDE THE SERVERS WITH A STOLEN LOGIN. PAY OR EVERYTHING STAYS LOCKED`
4. **Insider blackmail (symbol).** She threatens an IT employee with leaked personal files unless they keep quiet.
   - Plaintext: `THE IT MAN WILL STAY QUIET OR HIS SECRETS GO PUBLIC`
5. **Payout laundering (extra, any cipher).** She moves the ransom through crypto mixers and shell accounts.
   - Plaintext: `THE MONEY IS CLEAN. NOBODY CAN FOLLOW IT BACK TO ME`
6. **Cover-up (extra, optional finale).** She plants evidence to frame a student and wipes her own logs.
   - Plaintext: `BLAME THE STUDENT. DELETE EVERY LOG BEFORE MONDAY`

Each solved plaintext adds one entry to the case file (crime name, date, one-line summary).

## Confirmed: stages and scoring
- **6 stages**, one per crime above (5 and 6 are no longer optional).
- **Two ways to finish:** just complete the evidence list, or also make the final accusation for bonus points.
- **Final accusation:** player accuses Bea of all 6 crimes (checked server-side). A correct, complete accusation raises their points.
- **Scoring:** points per stage solved + accusation bonus, tallied with time. Most points (more done, faster) wins the whole event. Reuse the `handleLeaderboard` pattern for the ranking.

- **Wrong answers:** short lockout (enforced server-side, per team), no point deduction.
- **Live scoreboard:** every team's points update live while they play, visible to all. Server pushes updates (SSE or short polling off the leaderboard handler).

- **Points:** 150 per stage solved.
- **Lockout:** 15s, growing on repeated misses.
- **Accusation format:** checklist of crimes. Ticking a crime requires attaching its proper evidence entry from the case file; the server checks the pairing.

- **Accusation bonus:** 300. **Time bonus:** small, shrinking over the event.
- **Wrong evidence on a ticked crime:** point deduction instead of lockout.

## Built so far
- `/case/wellington` page: evidence list (locked placeholders) + sonar prototype on a placeholder floor plan (`src/components/Case.tsx`, own `case/wellington/index.html`, added to vite inputs).
- `deploy/case.mjs`: server API (start, answer, accuse, state, scoreboard) with 15s growing lockout, 150/stage + time bonus, 300 accusation bonus, -10 per wrong evidence pairing, 90 min per-team clock. Wired into `serve.mjs` and the vite dev server.
- Real config (9 team codes, answers, evidence text) goes in gitignored `data/case-config.json`; copy `deploy/case-config.example.json`. Without it the API returns 503.
- Page now wired to the API: team code gate, answer boxes, timer, scoreboard poll (5s), accusation checklist (`Case.tsx`; sonar split into `Sonar.tsx`). `data/case-config.json` currently holds TEST values (codes TEST-1, TEST-2); replace before the event.
- Flash-drive gate built: `unlock` route checks a per-team signature (`sigs` in the config; absent = gate off); wrong signature uses the same growing lockout. UI offers folder picker (reads `wellington.sig`), file picker, typed code. Untested with a real drive. Each drive needs a `wellington.sig` file containing that team's `sigs` value.
- Photo section built on the case page: `public/case/evidence-01.jpg` is the real photo (Big_Book.jpg, iPhone original, byte-identical) with GPS 30.6976 N, 88.1789 W. Its EXIF also exposes the device (iPhone 17 Pro Max) and timestamps. Still to check: pic2map.com shows the Marx Library, and the tag survives a download from the live site (Cloudflare).
- Cipher display built: `node deploy/make-ciphers.mjs` encodes the 6 plaintexts (Caesar 7, A1Z26, progressive, symbol, Caesar 11, A1Z26), self-checks round trips, and writes answers/ciphers/evidence into `data/case-config.json` plus the printable symbol key to `data/case-symbol-key.txt` (both gitignored; the key sheet still needs printing and hiding somewhere). Ciphertext is only sent to a team after the drive unlock. Symbols are Unicode zodiac/planet glyphs (render depends on the player's fonts; test on target devices). Progressive cipher: first letter +1, second +2, and so on; hint tells players.
- Real teams generated: `node deploy/make-teams.mjs` (refuses to overwrite without `--force`) writes 9 team codes + signatures into `data/case-config.json`, `data/drives/team-N/wellington.sig` (copy onto flash drive N) and `data/case-team-sheet.txt` (private list of codes). All of `data/` is gitignored, so **the live Mint PC needs these files copied over by hand** (config.json at least) or the live API stays unconfigured. Re-running `make-ciphers.mjs` keeps the teams.
- Not built yet: (cipher display done), EXIF page, real floor plan, cipher encoding.

## New flow (built)
Entry: top menu **Activities** page (`/activities`) lists the Quarantine game and the case file. The case runs as steps on `/case/wellington`; the server enforces the order per team (`phase`), with the timer, score and live leaderboard in a right-hand column on every step:
1. **Photo:** download original, pic2map, then answer "name of the building" (accepted answers in `config.building`; wrong = lockout, no points).
2. **Sonar:** flat placeholder map (3D later, needs real plans). The target lives only on the server (`config.sonar`, x/y on the 600x400 schematic); each ping asks the server for strength. Finding it shows the **Key Obtained** button.
3. **Drive:** flash-drive signature (folder picker, file picker, typed code).
4. **Ciphers:** ciphertext only, **no cipher type hints**. Left sidebar of decoders (shift brute-force list, number decoder, stepping shift, symbol mapper). Accusation as before.
- **Bea hacks:** 20% chance after each wrong answer, plus roughly every 8 to 12 minutes at random. A full-screen puzzle (connect the dots, type the key sequence, or a quick cyber/logic question) blocks all actions until solved. Solved under 20 s: +20 points; over 60 s: -20 points (floor 0); in between: 0. Wrong attempts can retry. Solutions never leave the server. The page polls state every 4 s, which is how a random hack reaches the player.
- Config keys added: `building`, `sonar` (written by `make-ciphers.mjs` if missing). **Copy the updated `data/case-config.json` to the Mint PC and restart** (the live one lacks them, so the building question would reject every answer).

## Floor plan and 3D sonar (built)
- Traced from the user's hand sketch (north up, 2nd floor): `src/components/floorplan.ts` holds the walkable floor, blocked areas (open stairwell/voids, office, study rooms, elevator), shelves, desks, pillars, dividers and the bookstand. One unit = one sketch pixel from the sketch origin; the plan is 820x820.
- `Sonar3D.tsx` (three.js, lazy loaded) draws it as a tilted 3D wireframe view with rotate buttons; `Sonar.tsx` falls back to a flat SVG of the same plan when WebGL is missing (fallback not tested). The scanner can only stand on walkable floor.
- Target = the bookstand marked X in the north wing, `config.sonar = {x: 312, y: 175}` in plan units (server: found radius 22, signal fades over 700 units). It lives only on the server. Caveat: anyone scripting the ping API could triangulate it; accepted for a club event.
- Rough trace, not a survey: check the layout against the real floor before the event and nudge `floorplan.ts` and the target if the bookstand is off.
- Updated config keys: `sonar` changed. **Re-copy `data/case-config.json` to the Mint PC** before the event.

## Flash drive contents
- Each `data/drives/team-N/` folder holds what goes on drive N: `wellington.sig` (that team's signature) plus `symbol-key.png` and `symbol-key.pdf` (printable A4 key sheet for the symbol cipher, evidence 4).
- Regenerate with `python deploy/make-key-sheet.py` (needs Pillow and Windows fonts; uses Segoe UI Symbol, the same glyphs the site shows on Windows). Players on Mac or phones may see slightly different glyph shapes on the site than on the sheet.
- `make-teams.mjs` recreates the team folders, so re-run `make-key-sheet.py` after it.
- Evidence 4 plaintext: THE IT MAN WILL STAY QUIET OR HIS SECRETS GO PUBLIC.

## Randomized puzzles, shuffled accusation, victory (built)
- **Hack puzzles:** 8 kinds (connect dots, type the keys, quiz, memory pads, unscramble, math, number sequence, shifted-letters decode). Each team cycles through a shuffled bag of all 8 before any repeats, never the same kind twice in a row. Numbers, words and key strings are generated per hack; the quiz bank has 18 questions.
- **Accusation:** crimes are worded as what Bea did (not the evidence labels) and shown in a per-team random order; the evidence list is shuffled per team and picked by its text. Evidence shown after solving is now the decoded message itself (config `evidence` = plaintexts), so teams must read and match. Wrong pairing still costs 10.
- **Finish:** a correct full accusation sets `finishedAt` (clock stops, no more hacks, further actions return 409) and the page switches to the victory screen: final score, time, place, score breakdown (stages, time bonuses, hacks, wrong evidence, accusation bonus), winner banner, live leaderboard.
- **Leaderboard/winner:** scoreboard returns `{rows, over}`, ordered by score then faster time. `over` is true when every team that has started has finished or timed out (a team that never starts does not block the announcement; a late starter could change the result).
- **Redeploy:** `evidence` changed in `data/case-config.json`, so re-copy it to the Mint PC, then reset state and restart.

## Law checks (built)
- After every correct cipher the team gets a **legal check**: a full-screen multiple-choice logic puzzle that blocks all other actions until answered (server returns 423 for everything but `law`). Wrong = the usual growing lockout (same puzzle stays); correct = no extra points, just clears the block. A hack puzzle takes priority if both are pending.
- 18 puzzles in `deploy/law.mjs` (3 per crime, in cipher order). Each states a simplified GAME rule plus facts, and the answer follows from the rule alone; the popup says "Simplified game rules, not legal advice". One is picked at random per cipher. Answers stay server-side.
- To add or edit puzzles, edit `deploy/law.mjs` (index `answer` points into `options`); redeploy and restart. No config change needed.

## Animations (built)
- **Team code screen:** animated double helix of code letters on the right (`Ambient.tsx` Helix); a valid code (checked without starting the clock) triggers a 3-2-1-GO countdown, and the clock starts when the case opens.
- **Background:** dim matrix rain behind the case page (`Rain`, about 16 fps; skipped under reduced motion). The home page's code rain is a separate one-time intro.
- **Bea's hack:** the page glitches and shakes with red scanlines and "SYSTEM BREACH" for about 0.9 s, then an ASCII skull pops up with its jaw opening and closing ("HA HA HA") (`Skull.tsx`).
- **Step completion, one unique animation each (`StepDone.tsx`):** photo = map pin drops with ripples ("LOCATION CONFIRMED"), sonar = golden key spins in ("KEY OBTAINED"), drive = padlock opens ("ACCESS GRANTED"), ciphers = six evidence tiles flip to check marks ("ALL EVIDENCE DECODED", after the last law check). Triggered when the state changes, so a page reload does not replay them.
- **Win animation (`Arrest.tsx`):** ASCII scene of Bea hacking, police ("FREEZE"), handcuffs, a cell closing, then "BUSTED" stamped; skippable. Every team plays it when it finishes its own accusation, then the victory screen shows.
- **Sound (`sound.ts`):** synthesized beeps, glitch, laugh, siren, slam, chimes and jingle. Off by default; "sound: off/on" link at the top right of the case page, remembered in the browser.
- Timers in the animation components keep the latest callback in a ref; a parent re-render (the clock ticks every second) must not restart them.

## Still open
- ~~Deduction amount~~ decided: 10 points per wrong pairing (score floors at 0).
- Event length: **max 1h30m (90 min) per team, starting when that team begins** (server records the start time), server-enforced cutoff.
- Time bonus formula, proposed: per stage, up to 100 bonus, decaying linearly to 0 at 90 min from the team's start (so a stage solved at minute 45 earns 150 + 50).
- Symbol cipher: design the glyphs and key.
- Real university network name: use a clearly fictional variant to avoid implying real incidents.

## Suggested next steps
1. Confirm the open decisions above.
2. Build the placeholder floor plan and sonar prototype on a subpage.
3. Build the EXIF photo page (original file download + pic2map link).
4. Build the locked-gate + flash-drive unlock flow.
5. Swap in the real floor plan; place the target at the real hiding spot; test on target browsers.
6. Write phase-two ciphers and the case narrative.

## Not yet checked
- Real library layout (no floor plan seen yet).
- File System Access API behavior on the browsers players will use.
- Whether library computers/networks allow what the activity needs.
