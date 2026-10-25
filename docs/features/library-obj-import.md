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

The lightweight SVG radar rotates with player heading and shows the USB as a mint square with a bearing line, the hunter as a red dot, exact horizontal distances and floor indicators. Contacts beyond 50 metres clamp to the rim. It is a bearing display, not a route through walls. HUD updates are limited to ten per second; no extra map render or textures.

Catches now show a black PowerShell-style screen with typed recovery text and a progress bar for three seconds, then restart in room 181 with the hunter upstairs and its grace period restored. Hidden tabs and inspection pause the game. Tests cover radar orientation/range, pickup floor/range, and respawn duration. Browser checks verified no automatic collection, E pickup with line of sight, a blocked pickup from downstairs, mobile layout, and the full three-second safe reset. No new audio assets have been added.
