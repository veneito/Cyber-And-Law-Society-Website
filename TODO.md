- [x] Have officer send the symbol-key PDF in a movable, resizable desktop window with minimize/maximize/close/reopen and zoom controls.
- [x] Make online USB recovery explicit in event rules, simulation and officer dispatch; no physical drive or library visit needed.
- [x] Promote the timed online case on the homepage; archive October 29; require club Discord membership and bind one final-score attempt per Discord account.
- [ ] Owner: configure Discord OAuth credentials and callback, coordinate with Vene and review PR before deploying the live event. See docs/features/live-case-event.md.
- [x] Show a detailed bird-emblem lectern and USB in officer dispatch.
- [x] Add officer dispatch, floor/item direction prompts and virtual USB retrieval; match terminal backgrounds to the black site theme.
- [x] Show a PowerShell-style team assignment cutscene before naming a new investigation team.
- [x] Assign online investigation teams sequentially and verify the recovered virtual USB without physical drives or printed slips.
- [ ] Coordinate online registration/API change with Vene before merging; deploy through reviewed PR.
# TODO

## Waiting on the club
- [x] Officers added (see docs/features/officers.md). Still need: Professor Wang photo → `image` in site.ts
- [ ] Real bios from Alfred and Andrew (current ones are invented placeholders in `officers`)
- [x] Oct 29, 2026 Metadata Scavenger Hunt: location set to Marx Library Meeting Room 181
- [ ] Oct 29 Metadata Scavenger Hunt: confirm time and add promotional video URL (`upcomingEvents[0].promoVideo`)
- [ ] Phage chase: user reported the last catch not clickable (not reproduced); view the carousel, hero, glow and win screen in a browser (never visually checked this chat)
- [ ] Event dates/locations → `upcomingEvents`
- [ ] Sign-up form link (Google Form?) → `links.joinForm`
- [ ] LinkedIn / X / GitHub if they have them

## Officer application (see docs/features/officer-application.md)
- [ ] Verify a domain in Resend if applications should email more than one officer
- [ ] Past meetings: add more entries/photos as meetings happen
- [ ] Phone check of the bug hunt (thumbnail size/position at 375px)

## Quarantine game — remaining Impeccable fixes (from 2026-10-06 critique)
- [ ] /impeccable harden — Android long-press double-toggles the flag (onContextMenu re-flags); confirm before switching level mid-game; maybe label leaderboard "honor system"
- [ ] /impeccable adapt — size cells to screen width on phones (44px targets), Hard mode without sideways scroll, header row overflows by 24px
- [ ] /impeccable audit — keyboard/screen reader: one Tab stop + arrow keys, F to flag, row/column labels, move focus to result strip
- [ ] /impeccable polish — final pass, then re-run /impeccable critique to compare score
- [ ] Add .impeccable/ and .claude/ to .gitignore

## Discord bot (see docs/features/discord-bot.md)
- [x] Prepare Lady Justice survey notifications for #ticket-bot using server-only credentials
- [ ] Server owner: configure CASE_SURVEY_CHANNEL_ID for #ticket-bot, grant Lady Justice channel permissions, restart site and verify delivery
- [ ] Upload `lady-justice-avatar.png` as the bot avatar (Developer Portal → Bot tab)
- [ ] Confirm the bot shows online in the server; optional: welcome message / auto-role on join

## Bea F. Wellington investigation (see docs/features/bea-investigation.md)
- [x] Import the exported Roblox OBJ into sonar with original geometry, room 181 spawn, and tested stairs/collision (2026-10-24; see docs/features/library-obj-import.md)
- [x] Give the sonar environment a green polygon hologram finish without new geometry or texture buffers (2026-10-24)
- [ ] Other maintainer: review the OBJ sonar frontend and verify the live target before merging
- [x] Restore location/USB step animations and wait for arrest artwork before scene timers start
- [x] Add optional end-of-game survey with validated private persistence and duplicate protection
- [ ] Verify arrest and step transitions end to end; coordinate survey state/API addition and response retrieval with server owner before merging
- [x] Shrink ambient click effects into soft water-like code ripples
- [x] Gate all four decoder tools behind related training ciphers, including a Julius Caesar dispatch and shift dial
- [x] First-person two-floor green/black library blockout with walking, central stair flight and radar; add isolated preview
- [ ] Walk through the library blockout in-browser, refine doorways and plan proportions, verify live sonar target mapping with owner before merging
- [x] Add a quick photo tile restoration game before the original evidence download; shrink photo and add green border
- [x] Add unlocking success animation and capped spreading error windows for failed Release lock attempts
- [x] Replace six text/quiz hacks with crossed wires, firewall grid and lock rings; keep dots and memory
- [ ] Review the revised hack roster and server selection with the other maintainer before merging
- [x] Restyle connect-the-dots as a red breach circuit with target, progress and connection feedback
- [x] Add playable local previews of all eight hack types at `/case/wellington/?preview`
- [x] Validate team code first, then require a team name before playing the intro
- [x] Add finer strand rails, cross-links and glowing nodes to the decorative team-code helix
- [ ] Game is built end to end (see the doc); remaining open decisions are in its "Still open" list
- [ ] Not yet watched start to finish in a real run: arrest sequence after FOUND GUILTY, the ringing before each call, and the new arrest frames on phones (frame JSON is 1 to 3 MB each)
- [ ] Record `end-call.mp3` and the other missing call audio if any are still absent
- [ ] Get Marx Library floor plans (requested) and pick the flash-drive hiding spot

## Investigation desktop (see docs/features/investigation-desktop.md)
- [x] GNOME-style desktop at `/activity` with Start button, fullscreen, README, Circle social network, locked `deity_drive`, Tor (needs VPN) and VPN apps
- [ ] Build the .onion sites and their cyber puzzles; add the second USB and password
- [ ] Confirm relations for Enrique, Tim and El Chiguire and write their real posts
- [ ] Add Spanish strings to `src/i18n/es.json`
- [ ] Pull request: needs the other maintainer's review before merging

## Flash drive prep (see docs/features/flash-drive-prep.md)
- [x] tools/PrepDrive.ps1 works on a real drive
- [x] Prep all 9 team drives (done)

## Ideas
- [x] Close the initial section reveal mask so the hologram head cannot peek through before the contact content appears (2026-10-22).
- [x] Fix the case Activities back-link displaying the HTML arrow code in English (2026-10-22).
- [x] Add short personalized officer bio intros for Jon, Alfred, Andrew, and Michelle; Professor Wang opens directly (2026-10-22).
- [x] Clean malformed binary digits in the hero artwork and replace them with crisp monospace vector text (2026-10-22).
- [x] Replace the contact poster with the Lady Justice 3D network and custom scale symbols; include model attribution and lazy, paused rendering (2026-10-22).
- [ ] Crest logo with a transparent background (looks better on black)
- [ ] Consider a shorter intro or skip hint if visitors find 4s long
- [ ] Hero buttons still sit in the centered max-w-6xl column; maybe align with the full-width header
- [ ] Full-screen banner crops the artwork on phones; consider showing the whole image (object-contain or a phone-specific crop) on narrow screens
- [ ] Quarantine game: server-side game validation if leaderboard cheating becomes a problem
- [ ] Quarantine game: moderation for leaderboard names (currently only character filtering)
- [x] Allow passwordless `sudo systemctl restart cls-site` on the server so update.sh's restart step runs
- [x] Verified server dashboard update flow with a throwaway footer change (pushed and reverted, 2026-10-07)

## Server move (2026-10-18)
- [x] Site moved to the brother's Mint PC, https://cybernlaw.grenudo.dev (Cloudflare tunnel `cls-site`, auto-pull every 5 min over a read-only deploy key)
- [x] Repo made public, `main` protected (PR + 1 approval), squash merge only; brother added as collaborator
- [x] Vene's server dashboard controls the site over SSH (state, logs, start/stop/restart, Update, case reset and organizer sheet)
- [x] Old copy of the site on Vene's server taken down 2026-10-18: `cls-site.service` stopped and disabled, update timer disabled, `cybernlaw.veneito.dev` route removed. Keep `~/cls-site` there, because the Discord bot runs from it
- [ ] Discord bot stays on Vene's old server for now; move it only after stopping the old copy
- [ ] Remove Vene's Windows PC key (`claude-desktop-itt842f`) from `~grenudo/.ssh/authorized_keys` when no longer needed
- [ ] Dashboard: maintenance mode and rollback are unavailable for the remote site

- [x] Add English/Español interface, Spanish standard evidence and decoder training, translated Chris subtitles with original audio, and centered El Chigüire survey overlay (2026-10-21).
- [ ] Review bilingual case/API changes with the other maintainer before merge; configure survey Discord delivery on the server (see docs/features/discord-bot.md).

- [x] Add animated sonar hunter, safe upstairs reset, and keyboard/touch sprint (2026-10-24); see docs/features/library-obj-import.md.

- [x] Add physical E-to-collect USB, directional hunter/USB radar, and three-second terminal respawn (2026-10-24).

- [x] Integrate supplied growls, near/catch whispers and movement-paced footsteps; show the USB bearing only during sonar pulses (2026-10-24).

- [x] Add Marx Library simulation boot, smaller USB with collection chime, and explicit real-world destination handoff (2026-10-24).

- [x] Replace hack skull with background-free monster ASCII, laughing bounce, and one laugh every three seconds (2026-10-24).

- [x] Subdivide hologram tiles 3×3 with darker faces and physically raised laser grid lines (2026-10-24).

- [x] Extend sonar range and soften distant pings with a quieter near-signal volume cap (2026-10-24).

- [x] Replace the Spanish porker-to-court wording with the clean, emphatic 'villana' (2026-10-25).

- [x] Reuse the officer application Discord webhook for case surveys when no dedicated bot channel is configured (2026-10-25).

- [x] Expand sonar while mouse control is active and restore its size when the USB is collected or Esc releases the mouse (2026-10-25).

- [x] Move the fullscreen USB pickup prompt below the crosshair so the language selector cannot cover it (2026-10-28).

- [x] Anchor USB pickup to the aiming cursor and add capped, directional hunter roars with distance and wall muffling (2026-10-28).

- [x] Make investigation desktop background black, including the wallpaper's baked-in green tint (2026-10-30).

- [x] Brand the investigation browser Water Dog with a curled-dog water droplet icon (2026-10-30).

- [x] Give Circle a dark purple palette and live search suggestions mixing suspects with similar fictional accounts.

- [x] Replace investigation ASCII wallpaper with an animated blue-dot demicube on black.

- [x] Add ASCII-style profile pictures and everyday posts to Circle filler accounts.

- [x] Rebrand the fictional social network as Glimmr with a camera-and-sparkle logo.

- [x] Convert supplied landscape/animal photos to square ASCII posts with matching captions and comments.

- [x] Add double-click likes with pink heart animation and toggleable like buttons.

- [x] Add SOLACE.asc and glowing ASCII deity viewer to the unlocked drive.

- [x] Add immersive 2.5-second browser page loads with address-bar progress indicator.

- [x] Add Glimmr Home/Messages/Your profile navigation and empty investigator profile with seal avatar.

- [x] Trigger Raphael's warning DM and automatically load Messages on first USB unlock.

- [x] Build red Hollow Dawn cult initiation onionsite with popup word collection and broken-prayer puzzle.
- [ ] Build remaining onionsites and next drive; first proposed password fragment is VESPER.
