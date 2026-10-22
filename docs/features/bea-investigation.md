# Bea F. Wellington Investigation: Handoff

## Scene reliability and debrief survey (2026-10-21)
Preview menu includes a complete survey demo with browser validation and a simulated confirmation; it sends no API request or saved response. Close and reopen resets the demo.
Location, USB recovery and drive verification animations trigger explicitly from successful building/key/unlock actions; removed the old sonar branch that suppressed USB artwork. The opening arrest asset is reduced from 1.25MB to ~140KB under a new filename. Arrest timers wait for the current artwork, show a real loading/failure placeholder, clamp frame indexes, and prefetch the next clip.

Victory/timeout now includes an optional one-response-per-team survey: enjoyment, difficulty and learning ratings (1–5), plus up to 500 characters of feedback. POST /api/case/survey requires a known finished/timed-out team, validates input, persists only the first response as an optional `survey` field in the private team state, and exposes only `surveySubmitted` to clients. Scores/leaderboards do not expose responses. Coordinate this additive private-state/API change with the server owner before merging. No email/export integration is configured. Run `node tests/case-survey.test.mjs` for isolated validation/persistence checks.

## Ambient click ripple (2026-10-21)
Clicks now produce small damped code wavelets (96px maximum radius, 1.1s lifetime), with subtle glyph displacement and stable characters instead of a large bright sonar ring. Limited to six overlapping primary-pointer ripples; existing reduced-motion behavior is preserved.

## Evidence and mission panels (2026-10-21)
Evidence dossier uses numbered exhibit cards, verified/encrypted labels and readable sentence-case decoded quotations. Mission Control separates team, score and clock with six evidence progress segments. Shared leaderboard wraps team names, separates status/progress from score and highlights the current team. Cosmetic only; original solved messages and scoring remain unchanged.

## ASCII accusation courtroom (2026-10-21)
Judge clarity/reaction pass: regenerated still and clip at 160×49 with stronger contrast/sharpening. Reaction counter replays on crime selection and correct evidence attachment (same crime/evidence index rule as final server validation), then returns to idle. Final scoring remains server-controlled.
Judge portrait now uses the user-provided minion still and GIF converted to orange 112×34 ASCII: still at idle, 23-frame (~2.25s) reaction played once on selecting a specific crime, then idle again. Judge dialogue and headings use orange. Clip is lazy-fetched and timer cancels when leaving the scene; reduced motion keeps the still.
Final accusation screen now uses a full-screen courtroom layout. An ASCII judge explicitly requests specific charges, repeats the selected accusation and asks for supporting evidence. A left-hand terminal clipboard lists only the team's actual decoded messages, with exhibit labels and filed status. During evidence attachment the clipboard is clickable; messages already used by other charges remain unavailable. Existing charge options/decoys, matching validation, review and scoring are retained. Mobile stacks the clipboard below the judge/charge controls.

## Courtroom legal review (2026-10-21)
Legal checks use an amber/green tribunal interface with scales, serif case heading, separate rule/facts exhibits and explicit Submit ruling. The network deception + data theft counting question supports selecting charge cards and submitting their count through the existing server option index. Other questions retain their exact options with select-then-submit behavior. Existing server lockout appears as Objection sustained. No questions, answers or scoring changed. Preview menu has a standalone courtroom example.

## Decoder training gates (2026-10-21)
Symbol unlock now uses `☿ ♀ ♌ ☽` (OPEN), matching the A–Z glyph mapping in `deploy/make-ciphers.mjs` and the supplied printed key, with text-style glyph rendering.
Each decoder now starts locked behind a short related training cipher: Julius Caesar/Roman dispatch with interactive alphabet dial; alphabet-number archive; progressively shifted lock word; and symbol-key command. Each has an optional clue and retry feedback. Successful unlocks persist in sessionStorage for the current browser tab; this is an instructional frontend gate and does not modify live game answers, scores or team state.

## First-person library prototype (2026-10-21)
Hallway photo perspective pass: narrowed vertical camera FOV from 75° to 55°, retained 1.65m eye height, and reduced provisional storey spacing from 4.2m to 3.2m for a more natural corridor ceiling-to-eye ratio. Stairs and double-height balcony walls derive from the same storey constant. This is a visual estimate from the supplied corridor photo, not a measured camera calibration.
Ceiling/access/balcony pass: added dark storey ceilings (hidden during top-down inspection), with the lower ceiling following the upper slab and leaving the stairwell/balcony cutouts open. Marked west/east balcony recesses have guard-height upper boundaries and double-height lower exterior walls, with roof caps above. Collision excludes inferred gray-hatched office/maintenance/CAE polygons; public rooms are separately traced. Closed staff boundaries no longer generate public door openings. Room 171 and south stair enclosure are notches in the first-floor office polygon. Verify gray extent and door access against the actual PDF before publishing.

Radar display remaps existing server strength to an effective ~10.5m range (previously ~35m), without moving the server target or changing the found radius. Weak/distant signals stay silent. Browser validation of balcony openings/headroom remains outstanding.
Plan correction pass: `libraryPlan.ts` now records traced floor perimeter polygons and room polygons in reference-image coordinates. Replaced large filled room blocks with thin collision walls and 1.2m doorway openings, bright thresholds and room-name headers. First-floor rooms include 123/171/181, Starbucks, auditorium, maintenance, restrooms, study rooms and office zones; second-floor office/study/CAE blocks are traced separately. Door positions on unclear edges are inferred and need review against the reference.

Central straight ramp replaced by a 40-tread semicircular rising flight around the central elevator, with inner/outer rail posts, annular collision/elevation and a west upper landing. Upper slab has a circular stairwell opening. Ground entry is east, upstairs exit west; direction is an inference from the plan. Original blockout dimensions remain provisional. Browser walk-through of both landings and door alignment remains required before publishing.
Layout inspection: Inspect top-down layout pauses movement and scanning, releases pointer lock, and shows an orthographic north-up plan with Floor 1/Floor 2 selectors. Only the selected storey's geometry is visible; stairs remain visible for reference. Return to first person restores the player's position and exploration fog.
Replaced the active Sonar view with lazy-loaded `LibraryExplore.tsx`, using Three.js primitives and green edges on dark surfaces. Two approximate floor plans are saved under `docs/reference/`. Orange human marker interpreted as body plus clearance: provisional 0.05m per image pixel, ~29m wide envelope and 4.2m storeys. This is a coarse blockout, not a surveyed reconstruction; room doors, curved central circulation, peripheral stairwells and furnishings need refinement.

Starts on floor one near the south entrance. WASD/mouse or on-screen controls move the player; arrows turn; Esc releases pointer lock. Central walkable stair flight runs from z=26 to z=15.5, with upper-floor opening and side-exit constraints. Offices, outer walls and simple columns have collision. Radar uses the existing server ping API; floor one sends distant coordinates to prevent finding the upstairs target from below. Floor-two world (14.4,11.7), corresponding to the red X, maps to legacy sonar (312,175). A live server with different config.sonar coordinates must have its target checked before merge; no live configuration was touched. Recover USB uses the existing key route.

Preview menu includes an isolated library walkthrough with a simulated signal; it does not change team progress. WebGL required; capped device pixel ratio, no textures/shadows, explicit renderer/resource cleanup. Gameplay and layout need browser walkthrough before merge.

## Photo recovery mini-game (2026-10-21)
Photo phase starts with four randomly rotated image quadrants. Rotate each upright, then Open recovered photo reveals the original download and building answer form. This is a frontend activity gate; the original evidence file and its metadata remain untouched. Recovered image is capped at 28rem with a green border. No server state/schema changes.

## Arrest confirmation styling (2026-10-21)
The final BUSTED caption is now a green terminal case-status panel with subject identification, arrest confirmation and custody status, replacing the red tilted stamp. Existing scene timing and audio remain.

## Call side consoles (2026-10-21)
Non-briefing calls have an 800ms fade at both ends, with a 20% minimum gain so opening/closing beeps remain audible. The briefing has no fades. The envelope follows media time, including voice-rate adjustments, before peak compression.
Non-briefing calls receive 3× playback gain (about +9.5 dB) through the Codec Web Audio path, with compression to tame louder peaks. Briefing gain stays at unity. Voice tuning and subtitle timing are unchanged.
Incoming Codec calls now begin on a separate caller-ID screen with phone icon and Answer phone button. Answer starts the existing audio and softly reveals the conversation/side consoles; ringing stops on answer. Shared across all Chris calls. Reduced motion removes reveal and ring-pulse effects.
Side consoles match the dialogue box's black fill and thin green border. Secondary labels are gray, internal borders are dim, waveform/slider accents are subdued and selected relays use outlines rather than bright fills to keep attention on the call.
Left console now tunes actual call audio over ±2 semitones, centered at the original voice, with a Reset voice button. Uses pitch-following playback rate (about 0.89–1.12×), so tempo changes slightly too. Subtitles follow the audio currentTime and remain synchronized. Each call starts at natural pitch.
ASCII feed clarity pass: 112×100 characters per frame, sharpened luminance, stronger contrast and simpler character ramp. Removed glow/scanline overlays from the feed and increased glyph weight for clearer track and character silhouettes.
Checking all six right-side relays reveals an optional green ASCII Subway Surfers feed with a soft 0.9-second cyber fade. `public/case/subway-ascii.json` contains 45 converted frames from the user-provided GIF (4.5-second loop). Playback stays local and silent, pauses with a button, and starts paused for reduced motion. Reset relays returns to the scanner. No game state or call audio changes.
All shared Codec calls include optional desktop side panels at 1280px and wider: a slider-driven carrier waveform/strength tuner and a six-node relay scanner with scan progress and reset. They are silent and independent of call audio, subtitles and game progress. Narrower screens keep the dialogue-focused layout.

## Gavel artwork (2026-10-21)
Court cutscenes now use drawn terminal-character artwork: banded gavel head, textured handle and separate stepped sounding block in an amber court-record panel. A swing, rebound and impact ring accompany the existing slam cue. Both court scenes share the same component; reduced motion holds a static gavel. The original frame asset remains available but is no longer fetched.

## Shared cyber completion artwork (2026-10-21)
`CyberArt.tsx` supplies the single ASCII lock animation used by drive verification and every successful hack. Both use the same decryption bar, red-to-green lock frames and unlock sound. The sonar completion now shows a terminal USB drive (USB RECOVERED); photo completion shows a scanned schematic with a targeting reticle. Reduced-motion variants show static completed artwork.

## Randomized previews (2026-10-21)
Preview launches generate fresh dot positions/counts, memory sequences, wire permutations, solvable firewall boards and ring offsets. Immediate duplicate preview layouts are rerolled; Reset puzzle keeps the current board. Live hacks already randomize these fields. Live shuffle now uses Fisher–Yates, and dot placement uses jittered grid slots so nodes cannot overlap. Goal/rules stay consistent while the required interaction sequence varies.

## Hack outcomes (2026-10-21)
Puzzle interaction audio: rising circuit blips for dots, consistent distinct notes for memory playback and input, electrical select/connect/reject cues for wires, on/off switch pitches for firewall cells, mechanical ticks plus alignment tones for rings, and check/reset cues. All use the shared sound preference. Memory playback timers cancel when leaving the puzzle.
Synthesized effects accompany the unlock (latch plus rising chime), denied submission (descending alert), each spreading window (short blip), and dismissal (click). They respect the shared sound preference. The preview menu includes a Sound toggle.
Validated hack successes show a 1.2-second red-to-green unlocking padlock before returning to play (also in preview). Incorrect Release lock submissions open an in-page Access denied dialog that duplicates every 1.4 seconds, up to four total windows per attempt. Dismissing every window stops the timer and restores focus to Release lock. Puzzle progress stays intact; no extra penalty is applied for error windows. Network failures stay retry messages. Timers clean up on unmount; lock motion respects reduced motion.

## Breach intro (2026-10-21)
All hacks open with a 2.6-second simulated takeover: cascading fictional error windows, terminal text and Bea's message, then the puzzle. These are in-page graphics, not browser windows. Root shake lasts 220ms; reduced motion disables shake and window animations. Preview Close remains available.

## Interactive hack roster (2026-10-21)
Firewall grid visuals now use circuit traces, numbered chip nodes, online scan lines and a sector status panel. Hover/focus outlines every affected neighbor and lists its node number. ON/OFF labels remain explicit; reduced motion hides the scans. Puzzle rules are unchanged.
Memory pads use channel labels, distinct symbols, circuit grids and illuminated playback/press states, with an input progress strip and a red Show pattern button. Pads only accept input during the repeat phase.
Replaced speed typing, quiz, unscramble, math, number sequence and decode with Crossed wires (match symbol ports), Firewall grid (flip a cell and its orthogonal neighbors to light all nine) and Lock rings (rotate three markers to the top). Dots and memory remain. All five have local preview samples. Server selection and solution checks use the new roster; saved bags filter retired kinds, and retired active hacks are replaced without resetting team progress. Memory submissions now use the same comma-separated format as the client. No configuration/data schema changes. Coordinate this game/server handler change with the other maintainer before merging.

## Hack previews (2026-10-21)
Connect-the-dots now uses a red circuit grid, pulsing next-node ring, animated signal connections, node-count progress and inline feedback for out-of-order clicks. Completed nodes remain visible for 450ms before the existing solution check; submission is guarded against duplicate final clicks. Keyboard activation and reduced-motion styles are included.

In local development, `/case/wellington/?preview` includes playable samples of all eight hack types, using the real Hack component with local answer checking. Close/reopen to restart; solving returns to the menu. No API requests, team progress or scores are changed. The preview route is gated by `import.meta.env.DEV`.

## Entry flow (2026-10-21)
The entry screen validates the team code first, then prompts for a required team name (up to 24 characters; blank/whitespace-only names cannot continue). Begin briefing plays the existing intro and countdown; the start request still happens after the countdown. Code lookup failures stay on the code screen with a retry message.

## Team-code helix artwork (2026-10-21)
`src/components/Ambient.tsx`: added continuous paired backbone rails, denser double-line cross-links, glowing nodes and small hexadecimal markers. Slower rotation preserves the green terminal style; reduced-motion preference renders a static helix. This is decorative only.

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
- Photo section built on the case page: `public/case/evidence-01.jpg` is the real photo (Big_Book.jpg, iPhone original, then cropped to a 648x648 close-up of two book spines so the room is hard to recognise; EXIF kept, GPS verified) with GPS 30.6976 N, 88.1789 W. Its EXIF also exposes the device (iPhone 17 Pro Max) and timestamps. Still to check: pic2map.com shows the Marx Library, and the tag survives a download from the live site (Cloudflare).
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
- Config keys added: `building`, `sonar` (written by `make-ciphers.mjs` if missing). **Copy the updated `data/case-config.json` to the live server (the brother's Mint PC, `grenudo@100.69.35.72`) and restart** (the live one lacks them, so the building question would reject every answer).

## Floor plan and 3D sonar (built)
- Traced from the user's hand sketch (north up, 2nd floor): `src/components/floorplan.ts` holds the walkable floor, blocked areas (open stairwell/voids, office, study rooms, elevator), shelves, desks, pillars, dividers and the bookstand. One unit = one sketch pixel from the sketch origin; the plan is 820x820.
- `Sonar3D.tsx` (three.js, lazy loaded) draws it as a tilted 3D wireframe view with rotate buttons; `Sonar.tsx` falls back to a flat SVG of the same plan when WebGL is missing (fallback not tested). The scanner can only stand on walkable floor.
- Target = the bookstand marked X in the north wing, `config.sonar = {x: 312, y: 175}` in plan units (server: found radius 22, signal fades over 700 units). It lives only on the server. Caveat: anyone scripting the ping API could triangulate it; accepted for a club event.
- Rough trace, not a survey: check the layout against the real floor before the event and nudge `floorplan.ts` and the target if the bookstand is off.
- Updated config keys: `sonar` changed. **Re-copy `data/case-config.json` to the live server (the brother's Mint PC, `grenudo@100.69.35.72`)** before the event.

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
- **Redeploy:** `evidence` changed in `data/case-config.json`, so re-copy it to the live server (the brother's Mint PC, `grenudo@100.69.35.72`), then reset state and restart.

## Law checks (built)
- After every correct cipher the team gets a **legal check**: a full-screen multiple-choice logic puzzle that blocks all other actions until answered (server returns 423 for everything but `law`). Wrong = the usual growing lockout (same puzzle stays); correct = no extra points, just clears the block. A hack puzzle takes priority if both are pending.
- 18 puzzles in `deploy/law.json` (3 per crime, in cipher order; `law.mjs` loads it, and the organizer dashboard reads the same JSON). Each states a simplified GAME rule plus facts, and the answer follows from the rule alone; the popup says "Simplified game rules, not legal advice". One is picked at random per cipher. Answers stay server-side.
- To add or edit puzzles, edit `deploy/law.json` (index `answer` points into `options`); redeploy and restart. No config change needed.

## Animations (built)
- **Team code screen:** animated double helix of code letters on the right (`Ambient.tsx` Helix); a valid code (checked without starting the clock) triggers a 3-2-1-GO countdown, and the clock starts when the case opens.
- **Background:** dim matrix rain behind the case page (`Rain`, about 16 fps; skipped under reduced motion). The home page's code rain is a separate one-time intro.
- **Bea's hack:** the page glitches and shakes with red scanlines and "SYSTEM BREACH" for about 0.9 s, then an ASCII skull pops up with its jaw opening and closing ("HA HA HA") (`Skull.tsx`).
- **Step completion, one unique animation each (`StepDone.tsx`):** photo = map pin drops with ripples ("LOCATION CONFIRMED"), sonar = golden key spins in ("KEY OBTAINED"), drive = padlock opens ("ACCESS GRANTED"), ciphers = six evidence tiles flip to check marks ("ALL EVIDENCE DECODED", after the last law check). Triggered when the state changes, so a page reload does not replay them.
- **Win animation (`Arrest.tsx`):** five ASCII Animator scenes (frames in `public/case/*-frames.json`): Bea typing (looped), the police car, handcuffs ("I want to talk to my lawyer" plays here), the jail cell, then "BUSTED" stamped; skippable. Every team plays it when it finishes its own accusation, then the victory screen shows.
- **Sound (`sound.ts`):** synthesized beeps, glitch, laugh, siren, slam, chimes and jingle. Off by default; "sound: off/on" link at the top right of the case page, remembered in the browser.
- Timers in the animation components keep the latest callback in a ref; a parent re-render (the clock ticks every second) must not restart them.

## Resetting progress (use this, not rm)
- `node deploy/reset-case.mjs` wipes all team progress on the live site (needs `adminKey`, written into `data/case-config.json` by `make-ciphers.mjs`; copy the config to the live server (the brother's Mint PC, `grenudo@100.69.35.72`) once so the server knows the key). Pass a base URL to target another server.
- Why not `rm data/case-state.json`: the server keeps state in memory and re-saves it on every poll, so any open case page writes the old progress straight back (and a restart then reloads it).
- Open pages with a remembered team code re-create their team and restart its clock on the next poll (every 4 s). Before a reset, close the case pages or click "switch team", and do not reopen them afterwards.

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

## Accusation screen (built)
- The accusation is its own screen (`AccuseStep` in `Case.tsx`), not part of the evidence list. A "Make your accusation" button appears under the evidence list only once all six messages are decoded and the last legal check is cleared; "Back to evidence" returns. Same server rules as before.
- The accusation screen goes one charge at a time (`AccuseStep`): each crime is a card, the team taps the decoded message that proves it (or skips), a progress bar tracks it, and a final review lists every pairing with a red ACCUSE stamp button. Each decoded message can back only one charge. Chris P. Bacon's frame sits beside it.
- Accusation flow update: the screen first lists crimes (the 6 real ones plus 3 decoys Bea did not commit, in a stable per-team order). Tapping one opens its charge page to attach a decoded message, then returns to the list; any crime can be reopened ("change"/"remove"). "Review accusation" leads to the ACCUSE stamp. Decoys are sent as crime ids 100+, which the server counts as wrong pairings (-10, no completion), so no server change was needed. Decoy texts live in `DECOYS` in `Case.tsx`.

## Time up (built)
- When a team's 90 minutes run out while playing, a full-screen GAME OVER (`GameOver.tsx`, siren and slam, tap or 4.5 s to continue) shows once, then a results screen (the victory layout headed "Game over", with score, 90:00 time, place, breakdown and live leaderboard). Step screens, popups and the accusation are hidden. A page that loads already out of time goes straight to the results.

## Arrest animation and call polish (built)
- `Arrest.tsx` is five scenes, each an ASCII Animator export: Bea typing (`hack-frames.json`, loops), police car (`car-frames.json`), handcuffs (`cuffs-frames.json`, "I want to talk to my lawyer" plays here), jail cell (`jail-frames.json`), then BUSTED stamped on the last jail frame. Frames are `fetch`ed as JSON (about 1 to 3 MB each), played once and held, sized to fit the width and height, rendered green-on-black by inverting the dark-ink-on-white export (`filter: invert(1) brightness(2.5)` multiplied onto green). To add or swap one, export from ASCII Animator, convert `frames.js` to a JSON array in `public/case/`, and add it to `ANIMS`.
- The "FOUND GUILTY." gavel (`Gavel` in `Case.tsx`, triggered when `finishedAt` is set) plays first, and the arrest starts after it closes.
- Every incoming call (`Codec` in `Briefing.tsx`) rings (`sfx.ring`, a synthesized two-tone ring that ignores the effects mute) until "Answer call" is clicked.
- The "You" portrait (`rookie.txt`) is a new cat, and Chris's normal portrait (`bacon.txt`) is cropped to its art so both sit centered; the portrait is auto-scaled to the frame, so crop any new art to its bounding box.

## Bilingual interface and El Chigüire debrief (2026-10-21)
- English/Español switch applies to site content, case controls, puzzles, legal checks and subtitles. Language is kept in the URL and browser storage; changing language reloads the page. Chris's recordings remain unchanged.
- Standard evidence has six Spanish cipher messages and Spanish answer validation. Saved evidence remains canonical English for compatibility; custom event configurations retain their own evidence.
- Optional completion survey appears as a one-question-at-a-time overlay with a centered green ASCII capybara portrait. Preview submissions are simulated. Discord delivery setup remains an owner task in the bot notes.
- Coordinate the case API changes with the other maintainer before merging; no live server configuration was changed.
