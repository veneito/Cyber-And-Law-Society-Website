#!/usr/bin/env bash
# One-time on the Mint PC, after adding DISCORD_BOT_TOKEN=... to ~/cls-site/.env:
#   bash ~/cls-site/deploy/install-bot.sh
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
grep -q '^DISCORD_BOT_TOKEN=' "$DIR/.env" || { echo "Add DISCORD_BOT_TOKEN=... to $DIR/.env first"; exit 1; }

sudo tee /etc/systemd/system/cls-bot.service >/dev/null <<UNIT
[Unit]
Description=Lady Justice Discord bot
After=network-online.target

[Service]
User=$(id -un)
WorkingDirectory=$DIR
EnvironmentFile=$DIR/.env
ExecStart=$(command -v node) $DIR/deploy/bot.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now cls-bot
sleep 2
systemctl is-active cls-bot
