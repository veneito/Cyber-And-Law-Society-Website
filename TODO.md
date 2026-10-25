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
