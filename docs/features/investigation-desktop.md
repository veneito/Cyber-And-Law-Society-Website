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

Desktop background is pure black. The decorative wallpaper layer uses a 1.2 contrast filter to clip the image’s baked-in dark green background to black while retaining its green ASCII artwork.

The browser is branded Water Dog, with a small SVG dog curled around a water droplet (water-dog-v3.svg), shared by desktop, dock, overview, browser toolbar and new tab.



The Water Dog new-tab page also shows a pinned Circle tile with its logo above the label Circle - Social Media Platform; clicking it opens the same feed as the bookmarks-bar shortcut.

Circle uses a near-black purple background. Search suggests accounts after two letters, with alphabetically mixed suspect and similar-name fictional profiles. All suggestions open profiles; unrelated accounts have empty post grids. Search matching ignores case and accents and accepts multiple name words. Validation: tests/circle-search.test.mjs.

Water Dog has page zoom controls in its toolbar (75–200%, in 25% steps). Clicking the percentage resets to 100%. Only page content scales; browser controls stay reachable and content remains scrollable. Zoom stays selected while navigating within the open browser.

Browser sizing correction: replaced page zoom controls with a title-bar maximize/restore button. Maximized Water Dog fills the simulated desktop beneath its top panel; restoring returns its previous position and size. Dragging and resizing are disabled while maximized.

Wallpaper replaced with DemicubeWallpaper: a slowly rotating 32-vertex six-dimensional demicube projected into 3D and displayed as blue dots on black, matching the supplied dot-only reference. Canvas is capped at 30fps and 2x pixel density, pauses in hidden tabs, respects reduced motion, and cleans up on unmount. No extra dependencies or image assets.

Wallpaper correction: green line-only 5-demicube wireframe (16 vertices, 80 edges), with a fixed 3D projection. Rotates rigidly around its vertical axis with a slight fixed tilt, positioned on the right of the desktop. No dots, face fills or higher-dimensional morphing.

Symmetry refinement: use a regular icosahedral wireframe with 12 equidistant-from-center vertices and 30 equal-length edges. Orthographic projection prevents near-side perspective stretching during rotation; replaces the irregular higher-dimensional projection.

Network web: every vertex now connects to every other vertex (66 connections). Internal chords are thinner and dimmer than the 30 outer edges; all connections follow the same rule, preserving full rotational symmetry.

Added thin green circular molecule-style nodes at the 12 structural vertices. Radius and brightness vary subtly with depth; black interiors separate nodes from crossing lines.

Interior chord intersections now have matching circular nodes as well. Intersections are calculated in 3D and deduplicated, preserving symmetry and keeping nodes attached during rotation.

Added two broad, extremely faint drifting light fields behind the wireframe for depth while preserving the nearly black empty desktop. Uses the existing animation lifecycle and reduced-motion handling.

Filler accounts now have deterministic ASCII-style portrait avatars and everyday scene posts (landscapes, coffee, cats and books) in the suspects' dark/lilac/gray palette. Feed accounts have browsable profiles, and similar-name search accounts each have a filler post. Existing suspect images and evidence captions are preserved. Images are generated as local SVG text without downloads. Validated by circle-ascii.test.mjs, type check and production build.

Social brand renamed from Circle to Glimmr. A lilac/pink rounded camera mark with a sparkle replaces the circle across bookmarks, the pinned shortcut and the social header. Simulated addresses now use glimmr.social; no real navigation occurs.

User-supplied photo update: 14 unique images converted to dense lilac/gray SVG ASCII via tools/make-glimmr-ascii.py, with square cover crops and fixed text widths so artwork fills the post frame. The otter reference's black bars are removed before cropping. Fourteen feed posts and filler profile posts use these assets with photo-specific captions, descriptions and comments. Three repeated waterfall attachments are represented once. Working originals remain local under artifacts/glimmr-photo-sources. Suspect evidence is unchanged. Type check, search tests and build pass; browser-rendered red panda artwork inspected.

All filler accounts now share the supplied black-and-green wireframe-person logo converted to green ASCII text and circularly cropped without its white background. Suspect avatars are unchanged. Asset: glimmr-default-avatar-ascii-v1.svg; reproducible with tools/make-glimmr-avatar.py.

Filler logo avatar color corrected to purple/pink ASCII (#d292d2), retaining the black circle and unchanged suspect avatars.

Glimmr likes: double-click post media to like and replay a pink heart burst; repeated double-clicks do not inflate counts. Heart button toggles like/unlike with keyboard support. Likes remain consistent between feed/profile views while Water Dog is open and reset on refresh. Animation respects reduced motion. Type check and build pass.

Raphael's cult post (id 9) now adds subtle screen scanline interference and intermittent cursed-character caption bursts. Original caption stays available to assistive technology and returns between bursts. Effect stops when leaving the post, respects reduced motion, and pauses text scrambling in background tabs.

Cult screen effect intensified with a slow seven-second image burn/afterglow, slight heat skew, dark plum screen-edge vignette and drifting interference band. Existing cursed caption retained. No rapid flashes; reduced-motion mode shows a restrained static treatment.

Locked deity_drive now has a Forgot the password? toggle revealing: Who do we worship? Name the deity that woke in the wires. The Hollow Dawn remembers. The hint references Raphael's cult post without spelling out the password.

Unlocked deity_drive includes SOLACE.asc, opened by double-click or Enter. Its atmospheric viewer reuses the canonical cult ASCII sigil with a slow lilac glow, concentric halo, scanlines, ASCII invocation and deity transmission text. Back returns to the file listing; README and Tor behavior retained. Reduced motion disables the pulse. Type check/build pass.

SOLACE.asc: lower ASCII invocation replaced with a breathing release button. Activating it replaces the desktop wireframe wallpaper with the canonical Solace ASCII sigil recolored green on black for the current desktop session. Files and windows remain usable. Release confirms locally and disables itself; reduced motion stops the breathing animation.

Water Dog now simulates a 2.5-second load on initial opening and every page navigation (home, bookmarks, pinned Glimmr shortcut, profiles, search submission, comments' profile links and posts). A green-to-lilac progress bar runs beneath the address bar while a connecting status replaces the page; address updates immediately. New navigation cancels the previous timer and completed pages reset scroll. Likes and live search suggestions remain immediate.

Glimmr now has a left navigation rail: Home returns to the feed, Messages opens an empty inbox, and Your profile opens Investigator with the supplied ASCII seal avatar, magnifying-glass bio and no posts. User account is separate from searchable filler/suspect data. Rail collapses to labeled-accessible icons in narrow browser windows. Build/type check pass.

First successful deity_drive unlock delivers a single scripted Raphael DM, launches/restores Water Dog and loads Messages in 0.6 seconds. Warning starts You don't know what you're getting into and describes Solace's growing power. Empty inbox remains before unlock; the received message survives closing/reopening Water Dog within the page session, with no duplicate delivery. Wrong passwords never trigger it. Reload resets the sandbox. Unit delivery checks and build/type check pass.

DM arrival refinement: wait 0.5 seconds after unlock, open/restore Water Dog on the right, play a gentle two-tone synthesized ping, and show a dismissible bottom-right new message toast for 5.5 seconds. Messages retains its 0.6-second page load. Audio is primed by the unlock gesture and fails gracefully when unavailable. Delayed one-time delivery test, type check and build pass.

Release wallpaper transition: Solace burns in from the center over 3.8 seconds with a soft expanding reveal and a green luminous ASCII edge that fades after forming. Only the wallpaper layers are masked/glowing; windows and desktop UI are unaffected. Reduced motion shows the finished wallpaper immediately.

Release burn-in slowed to nine seconds with a lingering central ignition and stronger luminous rim. A low-volume bitcrushed noise signal and descending drone accompany formation, fade out at nine seconds, and stop if the art viewer unmounts. Audio is synthesized locally and gracefully skipped if unavailable.

## The Hollow Dawn initiation site
First onionsite now renders HollowDawn.tsx inside Tor, preserving VPN enforcement. Red/light-red old-web recruitment design with four overlapping in-page popups, mock advertising, reopen/close controls and word caches. Recover eight distinct tokens (including two IT tokens), click them into the vow IT HAS NO BODY. IT WILL USE OURS., remove/reorder words or clear the order, then submit. Incorrect submissions allow unlimited retries. Correct submission silences popups and displays VESPER, explicitly labeled next-drive password fragment 1/3. Remaining services/drive are still to be built; VESPER is the proposed first fragment. No actual external popups, downloads or navigation. Progress is local to the mounted site and resets if leaving it. Prayer tests and build/type check pass; full browser walkthrough remains outstanding.

Tor now simulates a 2.5-second website load with a lilac progress bar beneath its address field. New requests cancel previous loads; VPN disconnect immediately cancels loading and blocks the page. Completion rechecks VPN state and resets page scroll.
