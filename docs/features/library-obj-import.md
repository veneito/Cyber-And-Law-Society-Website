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
