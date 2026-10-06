#!/usr/bin/env bash
# One-time setup on the Mint PC:
#   gh repo clone veneito/Cyber-And-Law-Society-Website ~/cls-site && bash ~/cls-site/deploy/setup.sh
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
USER_NAME="$(id -un)"
NODE="$(command -v node)"
cd "$DIR"
npm ci --no-audit --no-fund
npx vite build

sudo tee /etc/systemd/system/cls-site.service >/dev/null <<UNIT
[Unit]
Description=Cyber & Law Society website
After=network-online.target

[Service]
User=$USER_NAME
WorkingDirectory=$DIR
Environment=PORT=3001
ExecStart=$NODE $DIR/deploy/serve.mjs
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT

sudo tee /etc/systemd/system/cls-site-update.service >/dev/null <<UNIT
[Unit]
Description=Update Cyber & Law Society website from GitHub

[Service]
Type=oneshot
User=$USER_NAME
WorkingDirectory=$DIR
Environment=PATH=$(dirname "$NODE"):/usr/local/bin:/usr/bin:/bin
ExecStart=/bin/bash -c '$DIR/deploy/update.sh >> $DIR/update.log 2>&1'
UNIT

sudo tee /etc/systemd/system/cls-site-update.timer >/dev/null <<UNIT
[Unit]
Description=Check GitHub for club website updates every 5 minutes

[Timer]
OnBootSec=2min
OnUnitActiveSec=5min

[Install]
WantedBy=timers.target
UNIT

# Let the update script restart the site without a password prompt.
echo "$USER_NAME ALL=(root) NOPASSWD: /usr/bin/systemctl restart cls-site" | sudo tee /etc/sudoers.d/cls-site >/dev/null
sudo chmod 440 /etc/sudoers.d/cls-site

sudo systemctl daemon-reload
sudo systemctl enable --now cls-site cls-site-update.timer
sleep 1
curl -fsS -o /dev/null http://127.0.0.1:3001 && echo "Club site running on http://127.0.0.1:3001"
