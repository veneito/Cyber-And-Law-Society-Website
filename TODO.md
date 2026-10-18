# TODO

## Waiting on the club
- [x] Officers added (see docs/features/officers.md). Still need: Professor Wang photo → `image` in site.ts
- [ ] Real bios from Alfred and Andrew (current ones are invented placeholders in `officers`)
- [ ] Oct 22 Metadata Scavenger Hunt: add location/time
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
- [ ] Upload `lady-justice-avatar.png` as the bot avatar (Developer Portal → Bot tab)
- [ ] Confirm the bot shows online in the server; optional: welcome message / auto-role on join

## Bea F. Wellington investigation (see docs/features/bea-investigation.md)
- [ ] Game is built end to end (see the doc); remaining open decisions are in its "Still open" list
- [ ] Not yet watched start to finish in a real run: arrest sequence after FOUND GUILTY, the ringing before each call, and the new arrest frames on phones (frame JSON is 1 to 3 MB each)
- [ ] Record `end-call.mp3` and the other missing call audio if any are still absent
- [ ] Get Marx Library floor plans (requested) and pick the flash-drive hiding spot

## Flash drive prep (see docs/features/flash-drive-prep.md)
- [x] tools/PrepDrive.ps1 works on a real drive
- [x] Prep all 9 team drives (done)

## Ideas
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
