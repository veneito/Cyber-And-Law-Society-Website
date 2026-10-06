# TODO

## Waiting on the club
- [ ] Officer names, roles, majors, photos → `officers` in site.ts, photos in public/assets/officers/
- [ ] Event dates/locations → `upcomingEvents`
- [ ] Sign-up form link (Google Form?) → `links.joinForm`
- [ ] LinkedIn / X / GitHub if they have them

## Quarantine game — remaining Impeccable fixes (from 2026-10-06 critique)
- [ ] /impeccable harden — Android long-press double-toggles the flag (onContextMenu re-flags); confirm before switching level mid-game; maybe label leaderboard "honor system"
- [ ] /impeccable adapt — size cells to screen width on phones (44px targets), Hard mode without sideways scroll, header row overflows by 24px
- [ ] /impeccable audit — keyboard/screen reader: one Tab stop + arrow keys, F to flag, row/column labels, move focus to result strip
- [ ] /impeccable polish — final pass, then re-run /impeccable critique to compare score
- [ ] Add .impeccable/ and .claude/ to .gitignore

## Ideas
- [ ] Crest logo with a transparent background (looks better on black)
- [ ] Consider a shorter intro or skip hint if visitors find 4s long
- [ ] Full-screen banner crops the "CYBER & LAW" artwork on phones; consider showing the whole image (object-contain or a phone-specific crop) on narrow screens
- [ ] Quarantine game: server-side game validation if leaderboard cheating becomes a problem
- [ ] Quarantine game: moderation for leaderboard names (currently only character filtering)
- [x] Allow passwordless `sudo systemctl restart cls-site` on the server so update.sh's restart step runs
