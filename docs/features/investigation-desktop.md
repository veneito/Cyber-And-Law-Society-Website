# Investigation desktop (`/activity`)

A GNOME-style virtual desktop (`src/components/ActivityDesktop.tsx`) behind a "Start activity" button, which also asks for fullscreen. Black and green site theme, wallpaper `public/assets/desktop-wallpaper-v1.png` (use a new filename if replaced, Cloudflare caches `/assets/*`). Linked from the Activities page ("Find the missing woman" card).

## Apps
- **README.txt**: player-facing scenario plus the people of interest and their relation to the victim (the list is `PEOPLE` in `ActivityDesktop.tsx`; relations for Enrique, Tim and El Chiguire are placeholders).
- **Browser** (`FakeBrowser.tsx`): Circle, an Instagram-style fake social network in the victim photo's black/lilac palette. The home feed is strangers only; players must search a name to reach a profile (all words must match, accents ignored). All profile data and posts live in `PEOPLE` and `POSTS` in that file.
- **Files** (`FilesApp.tsx`): one locked USB, `deity_drive`, password `SOLACE`. Unlocked it holds `README.txt` (the .onion links) and `tor.exe`. The password is client-side and visible in the source.
- **Tor Browser** (`TorApp.tsx`): hidden app, only opens from `tor.exe`. The three .onion sites are listed in `ONION_SITES` and are placeholders ("not built yet").
- **VPN** (`VpnApp.tsx`): connect/disconnect with a server pick. Tor refuses every address until the VPN is connected, and disconnecting kicks Tor back to the blocked notice.
- **Terminal, Notes**: empty placeholders.

## Cast
- Julieta Dubois, the victim, a physician assistant (`julieta.dubois`). Three posts: her and Raphael in Kauai, Hawaii (her last known location), a family photo and a graduation photo.
- Raphael Pierre, her ex-boyfriend, last on the list (`raphael.pierre`). Two posts: the Kauai photo with her, and a cult post naming the AI deity Solace and the cult, the Hollow Dawn.
- Chris P. Bacon, one of her patients. One post thanking her.
- Enrique Iglesias, Tim Cheese, El Chiguire: one placeholder post each.

## Progression (designer notes, not shown to players)
1. Read the README.
2. Browse Circle by searching names.
3. Work out the last person who had contact with her: her ex, Raphael.
4. Investigate his profile; find out he is in a cult.
5. Decipher the first flash drive password (SOLACE).
6. That drive holds "deep-web"-style links tied to the cult.
7. Connect the VPN, then open the links in Tor. Those sites hold cyber puzzles whose answer is the next USB password.
8. Continued later.

## Still open
- The .onion sites and their puzzles, and the second USB.
- Real photos for the filler feed posts; captions for the last three suspects.
- Spanish text (`src/i18n/es.json`) for the new strings.
- Images total roughly 4 MB; shrink if load time matters.
