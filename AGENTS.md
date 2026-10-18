# Cyber and Law Society website: how we work

Two people (Vene and his brother) work on this repo, using Claude Code and ChatGPT/Codex. Read this before changing anything. Claude Code reads it via `CLAUDE.md`.

## The site
- React + TypeScript + Vite. Content is config-driven: edit `src/config/site.ts` for text, officers, events and links before touching components.
- A small Node server, `deploy/serve.mjs` (no dependencies), serves `dist/` and the API routes in `deploy/*.mjs` (applications, leaderboard, the case game).
- Live at https://cybernlaw.grenudo.dev.
- Per-feature notes live in `docs/features/`. Open tasks live in `TODO.md`.

## Deploying (read this)
- **`main` is protected on GitHub: changes need a pull request with 1 approval from the other person (Vene can bypass as admin). The repo is public, so never commit secrets or private data.**
- **Pushing to `main` deploys to the live site.** The server pulls `main` every 5 minutes, runs `npm ci`, builds and restarts. The server only runs `vite build` (no type-check), and a failed build can leave the site half-built, so a bad push can take the live site down.
- So: work on a branch, open a pull request, and merge to `main` only when `npm run build` and `npm run lint` pass locally. Do not push straight to `main` unless you have told the other person.
- Check the result at the live URL about 5 minutes after merging. The server's log is `~/cls-site/update.log`.
- Cloudflare caches `/assets/*` for a year and nobody can purge it. Give replaced images a new filename, and never request an asset URL before it is deployed.

## Run it locally
```
npm ci
npm run dev      # Vite dev server
npm run build    # type-check + build; must pass before merging
npm run lint
```

## Secrets and data: never commit
- `.env*` and `data/` are git-ignored and must stay that way. They hold the Discord webhook and bot token, the Resend key, and saved officer applications. They exist only on the server.
- Never paste keys, tokens or applicant data into code, docs, commits or chat. If one leaks, rotate it.
- You do not need them to work on the front end. The application form and case game API will not fully work locally without them.

## Working rules
- Small, focused commits with plain messages. One change per pull request where you can.
- Before starting a feature, check `TODO.md` and `docs/features/` so you and the other person do not build the same thing.
- When you finish something, update the matching `docs/features/*.md` note and tick or add the line in `TODO.md`.
- Match the code around you: naming, comment density, existing components. Do not add dependencies for a few lines of code.
- Tell the other person before changing `deploy/*.mjs`, the case game, or anything that touches `data/`. A change in the file format or the API affects live game state.

## Server and Discord bot (owner only)
- The website runs on the brother's Linux Mint PC. The Discord bot (`deploy/bot.mjs`) currently runs on a different machine and must run in only one place at a time.
- Only the server owners touch the server, Cloudflare and Tailscale. If a task needs a server change, write it down in `TODO.md` for them.
