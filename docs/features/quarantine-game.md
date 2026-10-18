# Quarantine mini-game (2026-10-06)

Minesweeper with viruses as the mines; players "quarantine" suspected viruses with a green shield. Live at `/play`.

## Page — `play/index.html` + `PlayPage` in `src/App.tsx`
- Separate Vite page (multi-page input in `vite.config.ts`); `App` renders `PlayPage` when the path is `/play`.
- Nav links use `/#section` so they work from `/play`. "Play" nav item → `/play`.
- Page animations: decoding heading + blinking cursor, staggered rise-in, scrolling grid background, drifting red bugs.

## Game — `src/components/Quarantine.tsx`
- Levels: easy 9×9/10, medium 12×12/22, hard 14×18/45. First click is always safe (viruses seeded after it).
- Click = scan; right-click / long-press / "Quarantine mode" toggle = shield. Clicking a satisfied number opens its neighbors.
- Animations (CSS `q-*` in `index.css`): diagonal board boot + scanline on new game, reveal ripple from click, pop-ins, loss shake + pulsing hit virus, win glow + spinning shield wave. All off under reduced motion.

## Leaderboard — `deploy/leaderboard.mjs`
- `GET/POST /api/leaderboard`, top 10 per level, stored in `data/leaderboard.json` on the server (gitignored, survives deploys).
- Used by `deploy/serve.mjs` in production and by a Vite plugin in dev.
- Checks: name sanitized to 16 chars, minimum plausible times (2s/5s/10s), 1 post per IP per 10s (`cf-connecting-ip`). Times are client-reported, so a determined person could fake one.
- To wipe scores: delete `~/cls-site/data/leaderboard.json` on the live server (the brother's Mint PC) and restart `cls-site`.
- POST returns `{ board, rank }` (rank -1 if outside top 10). Errors: 429 `cooldown` + `retryIn`, 400 `name`, 400 `time`; the client shows a specific message for each. Names allow Unicode letters/numbers plus ` ._-` (same `cleanName` rule on client and server).

## End of game
- Result strip between the controls and the board (no overlay), so the revealed board stays visible. Win: name box + Save score; loss: time lasted + Play again.
- Timer shows whole seconds while playing, exact time (2 decimals) once over.

## Impeccable critique (2026-10-06) — 22/40
Done: clarify (leaderboard copy/errors), layout (result strip). Remaining, see TODO.md.
