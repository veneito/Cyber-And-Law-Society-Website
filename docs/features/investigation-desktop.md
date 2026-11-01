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

Old-web visual pass: Hollow Dawn uses a narrow table-era sidebar, tiled speckle background, beveled borders, serif embossed masthead, mismatched fonts, underlined navigation, guestbook/webmaster decoy links, faux visitor counter, webring badge and under-construction banner. Popups use old desktop-style chrome. Red/light-red palette and prayer mechanics remain. Prayer checks/type check/build pass. This visual pass is local and not yet added to PR #17.

Unclaimed transmission popups now resist close attempts with a short glitch, descending digital beep and claim-the-words warning. Each closes normally after both words are collected. Silence Popups follows the same rule and closes only completed caches. Reduced motion uses a static outline. Prayer/close-rule tests and type check pass.

Accepted-initiation screen: canonical Solace ASCII sigil slowly fades into the site's background over eleven seconds, tinted muted red, while a very quiet filtered burning sound rises and fades once. Receipt remains dark/readable. Sound starts only on successful submission and cleans up on leaving; reduced motion uses a static faint image.

## Solace Speaks: terminal forensics
The second onion service is a blue/light-blue old-web portal with boxed directories, mirror-kit controls, webmaster notes and a starry guestbook panel. Save Mirror Kit imports five virtual text files and launches the desktop Terminal. Terminal supports help, ls, cat, grep, reassemble, base64, hex, xor, sha256, clear and command history; it executes no OS commands and makes no network calls. Terminal can maximize/restore.
Puzzle: locate visitor 041's successful /challenge stream 7A; discard BAD checksums and unrelated traffic; deduplicate identical retransmissions and order valid packets by byte offset. Hash the assembled lowercase hex text and verify against the manifest. Recover current DNS TXT key RUNITw== (ECHO), decrypt repeating-key XOR to fragment=MORROW;nonce=7341, then submit SHA256(7341:041:MORROW) on the site. Correct response reveals MORROW as fragment 2/3. Decoy sessions, expired keys, corrupt bytes and leading-zero visitor formatting are intentional. Operator hint is available. Progress/imports remain in memory until reload; accepted response survives reopening the site. Local-only validation is suitable for this puzzle, not prize security.
Validation: oracle-puzzle.test.mjs covers the full chain, wrong replies, missing/conflicting packets, malformed encodings, virtual file boundaries and command behavior. Type check and build pass. Full visual/gameplay walkthrough remains outstanding.

Terminal crash fix: auto-scroll effect now uses a block body so it never returns the browser's scrollIntoView result as React cleanup. Reproduced black-screen crash in the in-app browser, then verified opening Terminal and executing help after the fix. Oracle tests/type check pass.

Window focus fix: render window elements in stable app order and change only CSS stacking order when focusing. Avoids moving mounted window DOM nodes, preserving nested browser and terminal scroll positions across window switches.

Mr.Mysterious sends a single Glimmr DM when Solace Speaks first mounts, with a bottom-right notice and invitation to reply help. Inbox supports separate Raphael/Mr.Mysterious threads and an actual message composer for the helper. Hints follow verified virtual-terminal progress (import, access-log inspection, packet assembly, integrity check, decoded key, decryption and response hash), offering a clearer second nudge on repeated help without revealing answer values. Conversation and invite survive closing/reopening windows within the page session. No external messages or AI service calls. Mysterious invitation/progression tests, oracle chain tests, type check and build pass.

First terminal output of ECHO triggers a 2.1-second Solace apparition within the terminal, mild jitter/scanlines and a quiet filtered burning sound. Commands/results remain intact; repeated decoding does not retrigger while the terminal remains mounted. Effect and audio clean up on unmount and respect reduced motion.

Mr.Mysterious now uses the supplied portrait converted to dense purple/pink ASCII with a square face-focused crop. His access-log hint explicitly explains that HTTP 200 means success while reminding players to match the visitor and challenge path.

## Final archive chain
The Faithful Archive is an amber old-web fictional wallet explorer. Receipt HD-884 gives sender, 150000 sat and 2026-10-28 22:14 UTC-05:00. Follow tx-884-a payment to tx-884-b, then its non-returning payment to tx-884-c; decode OP_RETURN using hex to get cinder-relay9x4.onion|RELAY-884. Donor change leads to the forged witness-vault2h7.onion confession mirror. Wallets, funds and transactions are fictional; all input/output/fee values balance.
Real hidden site provides archive/ virtual evidence kit. Verify custodian.txt using sha256file against original manifest, correlate access/auth logs, inspect disk.img using strings, carve vessel.cfg, and read recovered/vessel.cfg. Revoked old.cfg and forged file dates are decoys. Key formula is receipt|issued_at_utc|key_salt, yielding HD-884|2026-10-29T03:14:00Z|EMBER. decrypt archive/sealed.json with that phrase performs genuine PBKDF2-SHA256 (120000 iterations) and AES-256-GCM authentication/decryption. Wrong keys fail closed. Output is saved to recovered/case.txt, reveals fragment CINDER and a fictional narrative lead that Julieta is alive at Relay Station CINDER's north service room. Final story details can be revised.
case_drive is now visible after deity_drive unlock and accepts VESPER-MORROW-CINDER. It displays the recovered case report after decryption. Mr.Mysterious switches to final-archive hints when the archive is visited. Hidden sites retain VPN enforcement and 2.5-second loading. Tests cover transaction conservation, route, time-zone rollover, original/forged hashes, file carving, malformed requests and authenticated decryption; earlier oracle/helper tests, type check, focused lint and build pass.

Browser verification: final site renders after Tor loading, transaction output links traverse the payment chain, hidden custody site loads and Save Snapshot opens Terminal with archive files visible through ls. Full final decryption is exercised by the evidence-chain test.

## Mr.WhiteHat revision
Helper display name is Mr.WhiteHat. Reaching Solace Speaks (or the final archive if reached first) immediately opens his Glimmr conversation with the first message; two more bubbles follow at 0.5-second intervals with a typing indicator. He says he has dealt with the cult before and offers field notes when sent help. Help replies arrive after 0.5 seconds with an openable/downloadable extensive text document, plus progress-aware guidance. The document covers rationale, evidence handling, HTTP 200, packet sequencing/retransmissions, representation-specific hashes, active DNS records, base64, XOR and challenge formatting without solved values or full answer commands. It includes a conceptual appendix for the final archive.
His name in the DM header opens profile mr.whitehat, bio 🇵🇭, existing supplied ASCII portrait and one square purple/pink ASCII post from the new two-person photo, caption exactly me and another whitehat hacker. No filler posts are added to this profile. Timing/typing/attachment and spoiler checks pass; type check/build pass.

WhiteHat messaging/viewer refinement: first greeting remains immediate; subsequent incoming bubbles queue at 2.5-second intervals, each with a quiet synthesized two-tone ping (audio primed by Tor navigation and sending messages). Typing remains visible while replies are queued. Guide attachment opens hidden app WhiteHat PDF Viewer in a separate movable/resizable/minimizable/maximizable desktop window positioned on the left, with chapter navigation, page controls, zoom, dark green hacker document styling and text export. Viewer simulates PDF pages from the guide text; it does not claim to export a real PDF. Timing tests/type check/build pass.

## Offering trace and HatWhiteJr
Wallet explorer restyled as a creepy amber/brown cult surveillance ledger with ritual seal, watcher copy, faint scan texture, and an interactive branching transaction graph. Nodes select real transaction records, retain inspected markers and highlight current selection; arrows connect actual spending relationships, while the unrelated donor stays disconnected. Existing receipt amounts, UTXO branches, fees, decoy and encrypted evidence remain unchanged.
HatWhiteJr sends a one-time instant DM on reaching the wallet archive, then two more bubbles 2.5 seconds apart with typing and pings. Separate conversation responds to help with progress-aware archive guidance and a spoiler-free tracing document, opened in its own HatWhiteJr PDF-style window. Profile hatwhitejr is clickable and searchable, uses the supplied portrait converted to purple/pink ASCII, and has zero posts. Mr.WhiteHat's conversation remains independent. Fixed helper invitation listener cleanup while integrating the new contact. Junior/WhiteHat timing and spoiler tests, final evidence-chain tests, type check, build and focused lint pass.

Arrival timing update: Raphael's first warning now arrives three seconds after successful USB unlock, split into four bubbles spaced 2.5 seconds apart with typing and individual pings. Mr.WhiteHat and HatWhiteJr now wait three seconds after their respective site first opens before the first greeting; subsequent bubbles/replies retain 2.5-second spacing. Scheduling is one-time even if the site remounts during the delay. Deterministic message-clock tests verify all three sequences.

Tor tabs: + opens a new independent tab; each tab keeps its own address, 2.5-second loading state, page, puzzle state and scroll while switching. Closing the last tab creates a fresh blank tab. VPN disconnect cancels pending loads and blocks every tab. All activity windows now have visible bottom-right resize handles with pointer/touch and arrow-key resizing; dimensions persist across focus and maximize/restore. Build/type check pass.

Junior help accessibility pass: repeated help now gives progressively more concrete wallet-tracing instructions, explains that transaction details are below the map, and introduces SPENT BY output navigation. Focused requests help time, help change and help trace provide worked examples and clear interface directions without exposing the winning route. Tracing document now opens with an A–H click-by-click methodology, unrelated payment/change and time-conversion examples, and a suggested evidence notebook. Focused guidance checks and type check pass.

Notes is now a Notepad-style text editor with editable filename, browser-local autosave, word-wrap toggle, line/column and character status, .txt import/export and Ctrl/Cmd+S export. Notes survive closing/reopening and reload via localStorage; storage failures retain the session draft and display a warning. File import is capped at 1 MB and asks before replacing existing text. Notes can resize/maximize. No evidence is sent to a server.

## Photo evidence / livestream / dispatch chapter
Re-encrypted sealed.json now explicitly identifies CINDER as password fragment 3, explains the combined-key format and includes solace-watch8r3.onion. This hidden Tor route is a fictional live-camera placeholder with timed fake chat and donation activity; no live media/payment connection exists. Its Service index leads to field-operator reconciliation, which accepts only coordinates obtained after verified metadata analysis. Public chat is read-only and gives navigation hints.
case_drive now contains six image placeholders, READ_FIRST.txt, StegoSuite.exe and Metadata.exe. Programs open independent resizable/maximizable windows. StegoSuite simulates trailer/integrity analysis: IMG_0214.png carries the valid original EXIF capsule; IMG_0212.png is a bad-checksum decoy; others are stripped. Metadata Inspector reveals training GPS 12.34567, -45.67890 only after the valid carrier is scanned. All photo/EXIF analysis is simulated until real supplied images replace the placeholders.
Submitting the verified decimal pair through the hidden stream form authorizes dispatch_drive, unlocked with the same coordinates. Contact Police explicitly performs only an in-game action; no emergency call or external report is made. Ending confirms the fictional evidence handoff. State survives window/tab changes within the page session and resets on refresh. Junior guidance covers the new stages. Rescue-chain, existing archive and junior tests pass; type check/build pass; focused lint has only the component-export warning for useRescueUpdate. Full live browser walkthrough remains outstanding.

Ledger discovery correction: page initially shows no transaction records or graph. Exact transaction/wallet queries return all matching cached records; inspected/search-discovered nodes accumulate, and graph links/amounts appear only after both endpoints are discovered. Spending buttons remain the way to follow outputs. Blank/unknown queries expose no records. Search checks and type check pass.

Receipt moved off the archive website into unlocked deity_drive as receipt. Viewer presents a thermal-paper Bitcoin receipt with invoice, local timestamp/offset, selectable sender wallet, matching BTC/satoshi amounts, confirmation status and decorative barcode. Clearly marked fictional. Website empty state and Junior's opening hint/document now direct users to the USB receipt. Type check and ledger tests pass.

Stream revision: ominous black/red theme replaces blue-gray styling. Simulated public chat now has an editable composer and preserves player messages; posting a decimal coordinate pair invokes the same verified-metadata location check and shows the moderator's accepted/rejected reply. Correct verified coordinates authorize dispatch_drive. Existing service form remains an alternate route. Readme, metadata output, background chat and Junior guidance now point to public chat. No messages leave the local activity. Rescue-chain test/type check pass.
