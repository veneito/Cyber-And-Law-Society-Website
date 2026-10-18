# Handoff for Codex: Cyber and Law Society website

Attach or point Codex at this file (`docs/HANDOFF-for-codex.md`) at the start of a session. It says what the project is, how two people work on it, and what runs on the machine Codex is probably sitting next to. Read it fully before changing anything. The repo's `AGENTS.md` has the short version of the working rules; this file has the background.

## Who is who
- **Vene** (GitHub `veneito`) owns the repo and built most of the site. He works with Claude Code.
- **His brother** (GitHub `granudinho`) is a collaborator and uses ChatGPT/Codex. He **owns the Linux Mint PC the live site runs on**, and the Cloudflare account that owns the domain `grenudo.dev`.
- The site is for a university club, the Cyber and Law Society. It has a landing page, an officer application form, a meetings page and a multi-team investigation game (the "case").

## The project
- Repo: https://github.com/veneito/Cyber-And-Law-Society-Website (public since 2026-10-18).
- Live: https://cybernlaw.grenudo.dev (moved 2026-10-18 from cybernlaw.veneito.dev, which is being taken down).
- Stack: React + TypeScript + Vite front end. A small dependency-free Node server, `deploy/serve.mjs`, serves `dist/` and the API routes in `deploy/*.mjs` (applications, leaderboard, case game).
- Content is config-driven. Edit `src/config/site.ts` for text, officers, events and links before touching components.
- Per-feature notes are in `docs/features/`. Open work is in `TODO.md`. When you finish something, update the matching note and `TODO.md`.
- Commands: `npm ci`, `npm run dev`, `npm run build` (type-check + build), `npm run lint`.

## The rule that matters most: how changes go live
**Merging into `main` deploys to the live site automatically.** The server pulls `main` every 5 minutes, runs `npm ci` and `npx vite build`, and restarts. It does not type-check, and a failed build can leave the site half-built. A bad merge can take the site down for everyone.

So always:
1. `git checkout main && git pull`
2. `git checkout -b short-task-name`
3. Make the change. Run `npm run build` and `npm run lint`; both must pass.
4. Push the branch and open a pull request. Give it a clear title, because it becomes the commit message.
5. The other person reviews and approves. **GitHub requires 1 approving review before merging into `main`.** Force-pushes and deleting `main` are blocked. Vene, as admin, can bypass this, but he should not.
6. Merge with **Squash and merge**. It is the only merge method the repo allows. The branch deletes itself afterward.
7. About 5 minutes later, check the live site. If a change does not appear, read `~/cls-site/update.log` on the server.

Never push straight to `main`. Never force-push. Do not merge your own PR without the other person's approval, and tell the other person before changing `deploy/*.mjs`, the case game, or anything that touches `data/`.

## Secrets and private data
- The repo is public. Never commit keys, tokens, `.env` files, applicant data or anything from `data/`. `.env*` and `data/` are git-ignored and must stay that way.
- On the server, `~/cls-site/.env` holds the Discord webhook, the Resend email key, the officer email address and the Discord bot token. `~/cls-site/data/` holds saved officer applications (`applications.jsonl`), the case-game config and state, and the leaderboard.
- The front end can be developed without any of these. The application form and case API will not fully work locally.
- If a secret is ever pasted into code, a commit or a chat, rotate it.

## The server (the machine this session may be on)
Linux Mint PC, hostname `grenudo-B550M-DS3H-AC`, user `grenudo`, Tailscale address `100.69.35.72`. Its setup, so you do not break it:
- **Site checkout:** `~/cls-site`, cloned from the repo over SSH using the alias `github-cls` (in `~/.ssh/config`) with a **read-only deploy key** `~/.ssh/cls_deploy`. Do not delete the key or the alias; the auto-pull depends on them.
- **systemd units** (installed in `/etc/systemd/system/`):
  - `cls-site.service` runs `node deploy/serve.mjs` on `127.0.0.1:3001`.
  - `cls-site-update.timer` starts `cls-site-update.service` every 5 minutes. That runs `deploy/update.sh` (fetch, fast-forward, `npm ci`, build, restart) and logs to `~/cls-site/update.log`.
- **sudo rules** in `/etc/sudoers.d/`: `cls-site` (passwordless `systemctl restart cls-site`, used by `update.sh`) and `dashboard-cls` (passwordless start, stop and restart of `cls-site.service`, and a non-blocking start of `cls-site-update.service`, used by Vene's dashboard). Do not remove them.
- **Cloudflare Tunnel** `cls-site`, run as a service by `cloudflared`. It publishes `cybernlaw.grenudo.dev` to `http://localhost:3001`. The tunnel and the domain live in the brother's Cloudflare account. Do not stop `cloudflared` unless you intend the site to go offline.
- **Tailscale:** this PC is on the brother's tailnet and is shared with Vene's family tailnet, so Vene's machines can reach it.
- **Authorized SSH keys** on `grenudo` (`~/.ssh/authorized_keys`) include: Vene's dashboard server (`dashboard@vene-serverlinux`), which controls the site remotely, and Vene's Windows PC (`claude-desktop-itt842f`), used by his Claude Code sessions. Do not remove them without telling Vene. If you want those access routes revoked, say so and agree it with him.

If the site is down, check in this order: `systemctl status cls-site`, `systemctl status cloudflared`, the last lines of `~/cls-site/update.log`, then `curl localhost:3001`.

## Things that are NOT on this machine
- **The Discord bot** ("Lady Justice", `deploy/bot.mjs`, unit `cls-bot.service`) still runs on Vene's old server. This machine's `.env` contains `DISCORD_BOT_TOKEN`, but the bot is not installed here. **Run it in only one place.** If it is moved here, the old copy must be stopped first. Ask Vene.
- **Vene's server dashboard** (a Flask app on his old server) monitors and controls this site over SSH: status, logs, start/stop/restart and Update, plus the case-game "Reset case progress" and "Organizer sheet" buttons. They read `~/cls-site/data/case-config.json` and `deploy/law.json` over SSH. Do not rename or move `~/cls-site`, the unit names `cls-site.service` and `cls-site-update.service`, or those two files without telling Vene, or the dashboard breaks.
- Vene's old server is **not** being shut down. Only the website was moved here. It keeps running his dashboard, the Discord bot and his other sites. The old copy of this website on it is being taken down.

## Cloudflare notes
- Cloudflare caches `/assets/*` for a year and there is no purge token. Give replaced images a **new filename**, and never request an asset URL before it is deployed (a 404 can get cached).
- `deploy/serve.mjs` returns an uncached 404 for missing files with an extension or under `/assets/` for this reason. Keep that behavior.

## Working agreements
- Small, focused commits and PRs. One change per PR where possible.
- Check `TODO.md` and `docs/features/` before starting, so you two do not build the same thing.
- Match the surrounding code: naming, comment density, existing components. Do not add a dependency for a few lines of code.
- Server, Cloudflare, Tailscale and Discord bot changes are for the machine owner (the brother) and Vene to do together. If a task needs one, write it in `TODO.md` or ask, rather than changing it quietly.
- When unsure whether something is safe to do on the live server, stop and ask.

## First steps for a new Codex session
1. Read `AGENTS.md`, this file, `TODO.md` and `docs/features/landing-page.md`.
2. Run `git status` and `git pull` on `main`, and confirm there are no uncommitted changes you did not make.
3. Ask the user what the task is. Then create a branch, make the change, verify it, and open a PR. Do not merge it yourself unless the user says the other person has approved.
