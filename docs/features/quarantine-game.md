# Quarantine mini-game

Minesweeper-style game in `src/components/Quarantine.tsx`, shown in the `#quarantine` section ("Play" in the nav), just above Contact. Styles in `src/index.css`.

- Viruses = mines. Three levels (`LEVELS`): easy 9×9/10, medium 12×12/22, hard 14×18/45.
- Viruses are seeded after the first click, so the first scan and its neighbors are always safe.
- Flagging quarantines a cell; win by opening every clean cell.

## Deploy notes
- To force a live update right away: `ssh vene@vene-serverlinux 'cd ~/cls-site && bash deploy/update.sh'` (over Tailscale).
- Fixed: `deploy/*.sh` weren't executable, so the 5-min update timer was failing. Now committed with +x.
