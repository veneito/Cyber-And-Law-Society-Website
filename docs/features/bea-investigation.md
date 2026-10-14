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

## Open decisions
- Hashed answers in client JS (fine for a casual club event) vs. server-side checks. `deploy/` already has handlers (`handleApply`, `handleLeaderboard`) that a check could follow.
- One shared drive for all teams, or one per team?
- Number of stages and cipher types (Caesar, Vigenere, hidden image/audio clue, etc.).
- Whether the page is hidden from nav.
- Visual style: noir / evidence-board look vs. the existing site theme.

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
