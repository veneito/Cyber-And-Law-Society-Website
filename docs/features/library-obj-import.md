# Exported Marx Library in the sonar game

The sonar scene now loads the user's Roblox OBJ geometry instead of rebuilding an approximate floor plan. `LibraryExplore.tsx` preserves the first-person controls, floor inspection, and existing ping/recover callbacks. Players start inside **room 181**, facing its hallway doorway.

## Assets and coordinates

- Browser assets: `public/assets/library/marx-library-e65fedd1e9.*`.
- Reusable model: `marx-library-e65fedd1e9.glb` (7.45 MB), with 10,923 exported objects merged by material into 83 meshes, 154,324 triangles.
- Separate compact collision and green-outline buffers: 1.44 MB and 1.36 MB. No raw OBJ download is required in the browser.
- OBJ positions/orientation are preserved. One Roblox stud becomes 0.25 metres, and original y=3 becomes game y=0. Second-floor level is y=4.5. The exported workspace baseplate and spawn pads are omitted; building geometry is retained.
- Spawn: original Roblox `(76, 3, -126)`, inside room 181. Camera eye height is 1.65 metres.
- The GLB retains material colors and glass transparency. PNG texture maps, Roblox SurfaceGui text, scripts, interactions, and invisible parts do not survive this conversion; the active game deliberately uses green surfaces/outlines. The original OBJ and MTL remain untouched in the user's Downloads folder.

## Re-exporting

Using the existing Node/Three.js dependencies, no new packages:

```powershell
node tools/convert-library.mjs path/to/marxlibrary.obj path/to/marxlibrary.mtl public/assets/library
```

The source and converter hashes produce new asset filenames, avoiding immutable Cloudflare caches. Update `LIBRARY_MANIFEST` in `src/components/libraryAsset.ts` to the emitted JSON filename. Never overwrite an already deployed asset URL. Keep original working exports and screenshots on easystore; do not commit the large source OBJ or personal downloads.

## Walking and sonar

Collision triangles come from the OBJ; small visual details such as book bundles and chair legs are excluded from collision only. A two-metre spatial grid limits queries to nearby triangles. Supported-floor rays and a capsule-shaped torso stop walls/furniture from being crossed and allow climbing the exported stair treads without copying Roblox scripts or invisible ramps. No jumping or falling off unsupported edges.

The second-floor bird-book lectern is the physical anchor mapped onto the existing legacy sonar coordinate `(312,175)`, at 20 API units/metre. Floor one and stair transitions cannot complete the search. No server config, API, saved team state, or target coordinates were changed. The live target must still be checked with the owner if the server configuration differs from `(312,175)`.

Preview: `/case/wellington/?preview&lang=en`, then **Explore Marx Library (first-person prototype)**. This uses the existing isolated preview callback and does not submit team progress.

Validation: `node --test tests/library-import.test.mjs` covers GLB integrity, bounded geometry, room 181 spawn/exit, wall/floor blocking, and an actual movement path from room 181 up the curved stairs to within recovery range of the lectern. Browser checks covered successful loading, visible movement, both top-down floors, mobile layout, failed-download retry, and clean browser errors. Screenshots remain local in `artifacts/library/`.

This change needs the other maintainer's review before merging because it replaces the case game's sonar frontend. No server/deploy/data files are part of this change.

## Polygon hologram appearance (2026-10-24)

`libraryHologram.ts` supplies two shared materials (opaque geometry and glass). A fragment shader projects an antialiased square grid (horizontal and vertical lines only) directly onto the existing surfaces; brighter architectural edges retain occlusion so walls do not become an unreadable X-ray. Nearly black faces, muted floor polygons, surface-angle rim accents, and distance fog create the green polygon hologram style. Floor inspection clipping is supported. No additional textures, mesh copies, render passes, bloom framebuffers, or asset downloads are introduced. Shared materials are disposed once on unmount.

A headless Edge/SwiftShader before/after sample, after garbage collection, measured 40.6 MiB and 40.3 MiB of JavaScript heap respectively. These are single samples, exclude GPU/process memory, and are not a claim of reduced memory usage. Browser checks cover both first-person and clipped plan shader variants without console errors; walking and imported geometry are unchanged.

## Animated hunter and sprint (2026-10-24)

The supplied anxious-dog Blender source is exported read-only by `tools/export-library-chaser.py` to a 263 KB GLB: one skinned mesh, 57 bones, Idle/Walk/Catch clips, no textures. `tools/build-library-navigation.mjs` produces a 1.16 MB graph with 20,373 nodes, including collision-validated paths over all five stairs. Runtime route searches reuse typed arrays and replan every 1.5 seconds.

The dog moves at 3.2 m/s, above walking (2.8 m/s) and below sprinting (5 m/s). Hold Shift or the on-screen sprint control; diagonal movement remains normalized. No stamina limit. Catching requires proximity, matching floor and an unobstructed walking path. After the catch animation, the player restarts in room 181 and the dog returns upstairs with nine seconds of grace. Search signal resets; unrelated case progress is preserved. Pending pings from the previous attempt are ignored, and recovery requires a fresh nearby signal. Overview and hidden tabs pause pursuit; reduced-motion settings disable animation and camera shake.

Tests cover export size/clips, connected upstairs spawn, pursuit speed/collision, catches blocked by walls/floors, and repeated safe resets. Review with the other maintainer before merging; server and saved-data formats are unchanged.

## Physical USB and directional radar (2026-10-24)

Signal proximity no longer completes the search. A two-part USB mesh sits just above the existing bird-book lectern; E or the touch pickup button collects it only after a fresh confirmed signal, on floor two, within 1.5 metres and with clear line of sight. The Continue button appears after collection. Collision and server coordinates remain unchanged; the existing key endpoint still advances the case.

The lightweight SVG radar rotates with player heading. The USB direction is a pulsing bearing arc/arrow on the rim, visible only during the first portion of each pulse; no USB dot, square, line to its location, or exact distance is shown. Pulses accelerate as the signal strengthens. The hunter remains a red dot with distance and floor indicators; contacts beyond 50 metres clamp to the rim. This shows bearing, not a route through walls. HUD updates are limited to ten per second; no extra map render or textures. Reduced-motion settings disable the expanding ring while retaining periodic direction cues.

Catches now show a black PowerShell-style screen with typed recovery text and a progress bar for three seconds, then restart in room 181 with the hunter upstairs and its grace period restored. Hidden tabs and inspection pause the game. Tests cover radar orientation/range, pickup floor/range, and respawn duration. Browser checks verified no automatic collection, E pickup with line of sight, a blocked pickup from downstairs, mobile layout, and the full three-second safe reset. The supplied audio is integrated as described below.

## Supplied sound effects (2026-10-24)

Eight versioned MP3s total 231 KB (about 3.3 MiB decoded in a 48 kHz browser). Files load/decode once after sound is enabled by a user gesture; no streaming loops or dependencies. A local Sound toggle uses the existing case-wide mute preference. Four growls alternate at random intervals independently of hunter location; behindu triggers only within nine metres on the same floor, with a randomized cooldown. Player and hunter footsteps use actual distance travelled, so blocked/idle movement stays quiet; sprinting changes stride and pitch. Hunter footsteps attenuate with distance and across floors, and pan relative to player heading.

The catch clip is layered into five quieter, staggered, pitch-shifted stereo voices. Per-clip levels are balanced (the original human steps are unusually quiet), and a master compressor plus a 12-voice cap bounds the mix. Sources stop on mute, hidden tabs, inspection, collection, reset and unmount; abort/close/disconnect cleanup releases audio buffers and nodes. Audio failures leave gameplay usable. Browser checks verify all eight decode, footsteps play, five catch voices are created, mute works, and the bearing arrow alternates visible/hidden in sync with the radar pulse. Unit checks cover ambience/near rules, step timing, catch layers and asset budget. Perceived loudness still depends on the listener’s device; no live deployment was performed.

Footstep mix lowered by about 60% for both player and hunter after listening feedback (2026-10-24); ambience and catch levels are unchanged.

Further listening adjustment: step intervals are about 45% longer (roughly 30% fewer footfalls), clips play more slowly, and footstep gains are halved again. Nearby hunter steps remain slightly louder than player steps, with existing distance attenuation (2026-10-24).

## Simulation introduction and real-world handoff (2026-10-24)

Begin investigation now shows a 3.8-second terminal boot sequence: loading a simulation of Marx Library, then finding the item and leaving before Bea finds the player. The hunt, grace countdown and movement do not start until boot finishes; reduced-motion users see the complete text. The USB model is 55% of its former size and stays aligned with the bird-book surface. Successful collection plays the existing short three-note chime, respecting mute.

Collection focuses a completion panel explaining that this was a virtual location clue and directing players to the real Marx Library, second floor, bird-book lectern. Continue explicitly starts the real-world search. The sonar celebration says LOCATION FOUND instead of USB RECOVERED, and the drive-signature step retains the physical destination/instructions so they are not lost after leaving the simulation. API routes, phase validation and saved state formats are unchanged. Browser checks verified intro/grace timing, smaller USB, collection chime, destination panel, original pickup/reset flow and mobile layout.

## Monster portrait in hack interruptions (2026-10-24)

The old skull is replaced by a 48-column, 32-line ASCII portrait traced from the supplied monster screenshot. Only pixels inside the facial silhouette are represented; the screenshot background and raster image are not shipped. A small CSS laughing bounce runs on each laugh and respects reduced-motion settings.

The supplied 16 KB laugh MP3 plays once every three seconds, with a brief laughing bounce on each play. A single audio element prevents stacked playback, at 24% volume, following the case-wide sound preference. Audio pauses on mute/hidden tabs; all playback and timers stop when the hack closes. Browser checks cover portrait replacement, desktop/mobile sizing, laugh cadence, reduced motion and cleanup.
