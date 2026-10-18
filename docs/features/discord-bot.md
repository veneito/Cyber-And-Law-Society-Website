# Discord bot (Lady Justice)

Invite card on the site's Discord link reads "Lady Justice invited you to join" because the invite was created by a bot, not a person.

- Discord app/bot: "Lady Justice" (application id 1558662871305687121), added to the Cyber & Law Society server with only Create Instant Invite. Install settings: Guild Install has scopes `applications.commands` + `bot`.
- `deploy/create-invite.mjs`: one-off script, makes a permanent invite as the bot (`DISCORD_BOT_TOKEN=... node deploy/create-invite.mjs`). Current invite: https://discord.gg/ZKsKn9WNvX, used in `links.discord` in `src/config/site.ts`.
- `deploy/bot.mjs`: presence-only gateway client (online, "Watching Justice for all"). No commands, no join handling.
- `deploy/install-bot.sh`: one-time systemd install as `cls-bot`. **Since 2026-10-18 the bot still runs on Vene's old server (`vene-serverlinux`), not on the live site's PC.** Run it in only one place; to move it, stop the old copy first. Reads `DISCORD_BOT_TOKEN` from git-ignored `~/cls-site/.env`.
- `lady-justice-avatar.png`: face crop of the Lady Justice art for the bot avatar (upload on the Bot tab).
- The token is never in the repo. If it leaks, Reset Token on the Bot tab, update `.env`, `sudo systemctl restart cls-bot`.
- The invite does not need the bot online; `cls-bot` only keeps it showing online.
