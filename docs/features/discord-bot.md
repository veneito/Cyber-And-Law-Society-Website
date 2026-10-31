# Discord bot (Lady Justice)

## Case surveys → #ticket-bot
The website posts saved case surveys via `deploy/survey-discord.mjs`. When both bot token and survey channel are configured, it uses Lady Justice's REST identity. Otherwise it reuses the officer application's existing `DISCORD_WEBHOOK_URL`, sending to the same channel without additional credentials. This does not start/move the Gateway bot. Server owner: set `CASE_SURVEY_CHANNEL_ID` to the numeric ID of **ticket-bot** in the site's private `.env`, alongside the existing `DISCORD_BOT_TOKEN`. Give Lady Justice View Channel, Send Messages and Embed Links permission in that channel. Restrict channel access to organizers if feedback should stay private. Restart the website after configuring; no live server changes were made here.

Surveys remain saved even if Discord is unavailable. The private survey record stores `discordDelivery` (`sent`, `failed` or `unconfigured`); no automatic resend is currently provided. Notifications include team name, three ratings and feedback, with mentions disabled. Browser preview submissions never notify Discord. Verify with a real submission after server configuration; mocked coverage: `node tests/survey-discord.test.mjs`.

Invite card on the site's Discord link reads "Lady Justice invited you to join" because the invite was created by a bot, not a person.

- Discord app/bot: "Lady Justice" (application id 1558662871305687121), added to the Cyber & Law Society server with only Create Instant Invite. Install settings: Guild Install has scopes `applications.commands` + `bot`.
- `deploy/create-invite.mjs`: one-off script, makes a permanent invite as the bot (`DISCORD_BOT_TOKEN=... node deploy/create-invite.mjs`). Current invite: https://discord.gg/ZKsKn9WNvX, used in `links.discord` in `src/config/site.ts`.
- `deploy/bot.mjs`: gateway client (online, "Watching Justice for all") that also answers `/play` with a private one-time code for the case site (see live-case-event.md). Needs `DISCORD_GUILD_ID` and `CASE_BOT_SECRET` in `.env`. No join handling.
- `deploy/install-bot.sh`: one-time systemd install as `cls-bot`. **Since 2026-10-18 the bot still runs on Vene's old server (`vene-serverlinux`), not on the live site's PC.** Run it in only one place; to move it, stop the old copy first. Reads `DISCORD_BOT_TOKEN` from git-ignored `~/cls-site/.env`.
- `lady-justice-avatar.png`: face crop of the Lady Justice art for the bot avatar (upload on the Bot tab).
- The token is never in the repo. If it leaks, Reset Token on the Bot tab, update `.env`, `sudo systemctl restart cls-bot`.
- The invite does not need the bot online; `cls-bot` only keeps it showing online.
