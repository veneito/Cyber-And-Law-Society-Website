# Landing page + hosting (first build, 2026-10-06)

Live: **https://cybernlaw.grenudo.dev** (moved 2026-10-18 from cybernlaw.veneito.dev). Repo: public `veneito/Cyber-And-Law-Society-Website` (was private until 2026-10-18).

## Stack
Vite + React + TypeScript + Tailwind v4 + lucide-react (lucide has no brand icons, so socials use generic icons + labels).

## Content
- **Everything** (copy, links, images) lives in `src/config/site.ts`. Components never hardcode club details.
- A link set to `"#"` is hidden. An image set to `null` falls back (initials / shield).
- Join button: sign-up form if set, else Discord, else scrolls to #contact.
- Assets in `public/assets/`: `logo.webp` (crest, white background, shown in a white circle), `banner-cls-hologram.webp` (hero: green holographic Lady Justice crest banner, set 2026-10-10; replaced the original `banner-cls.webp`, which is kept in the repo unused. A Lady Justice Gemini banner was tried on 2026-10-06 and reverted; it is in git history at f36e824/e1a49bc. Give future banners a new filename so browsers do not show a cached copy), `flyer.webp` (contact section).
- Sections: hero (on phones, under `md`, the banner is a 20rem-tall centre crop (sides cut off) with the buttons below it; from `md` up the whole banner shows at its natural height (capped to one screen, so the section is exactly as tall as the image, no empty band) with only the Join / Explore buttons over its bottom edge; the pill, `>` headline with blinking cursor and subheadline sit in an intro block right below it. Without a banner, the hero falls back to text + buttons on the green grid), Three disciplines (Cybersecurity/Law/Philosophy), What We Do (5 activities), Events, Officers, FAQ, Ready to join.

## Look

- Metadata Scavenger Hunt: Revamped is scheduled for October 29, 2026 at Marx Library Meeting Room 181. Its `promoVideo` field is an empty placeholder: the card shows "Promo video coming soon" until a URL is added, then displays a "Watch the promo video" link.
Black, terminal green (`green-400`), white. Inter (Google Fonts) for body text so it looks the same on every device; JetBrains Mono for the headline and labels. Club name is "Cyber & Law Society" everywhere (site.ts `name`, tab titles). The cursor blinks even with reduced motion (user's choice; ~1/sec, safe).

## Navigation
- Header spans the full screen width (`lg:px-10`, no max-w). Shows "CLS" on phones, full name from `md` up.
- In-page `#section` links scroll without changing the URL (click handler in `main.tsx`), so a refresh starts at the top.
- Header nav: Home (`/`), About, Events, Officers, FAQ, Play. Logo also links to `/`.
- `main.tsx` sets `history.scrollRestoration = "manual"` and scrolls to top on load (or to the `#section` in the URL), so Back from /play lands at the top.

## Hosting
- Mint PC `grenudo-B550M-DS3H-AC` (user `grenudo`, on the brother's Tailscale account, `100.69.35.72`), clone at `~/cls-site`. Pulls from GitHub via a read-only deploy key (`~/.ssh/cls_deploy`, ssh alias `github-cls`). The Discord bot (`cls-bot`) still runs on the old PC `vene-serverlinux`.
- `cls-site.service` runs `deploy/serve.mjs` (no deps, blocks `../`, SPA fallback for page paths only; missing files with an extension or under /assets/ get an uncached 404, because Cloudflare once cached the HTML fallback as a year-long "image") on 127.0.0.1:3001.
- `cls-site-update.timer` runs `deploy/update.sh` every 5 min: fetch, fast-forward, `npm ci`, build, restart. Log: `~/cls-site/update.log`.
- Cloudflare Tunnel `cls-site` (brother's Cloudflare account, which owns grenudo.dev) → published route `cybernlaw.grenudo.dev` → `http://localhost:3001`. **No Access gate** (public site).
- **Deploy = push to main.** No Cloudflare API token / GitHub Actions (user's choice).
- One-time setup: `bash ~/cls-site/deploy/setup.sh` (needs sudo password).

## Files
`src/config/site.ts`, `src/App.tsx`, `src/components/*`, `src/index.css`, `index.html`, `deploy/*`.

## Hero banner fit (2026-10-10)
- Banner `<img>` uses `object-contain object-top` on black (was `object-cover`, which cropped the crest title on wide screens).
- Hero `#top` sections have `scroll-mt-16` so anchor jumps land below the sticky nav.

## Hero network

2026-10-22: Hero banner now uses `banner-cls-binary-v3.svg`: the existing crest composition with cleaned binary panels, plus real monospace SVG text containing only valid 8-bit binary strings. Larger glyphs and panel-specific row widths fill each box with consistent insets; subdued green keeps the digits behind the crest. The cleaned raster artwork is embedded as WebP so the asset remains self-contained when used as an image. New filename avoids the immutable asset cache. Original `banner-cls-hologram.webp` is retained.
`src/components/Network.tsx`: canvas of drifting green nodes joined by lines over the hero banner; nodes near the cursor/touch link to it and are pushed away. Pointer-events none, pauses off-screen, static with reduced motion. Only used when a banner is set.

## Contact hologram (2026-10-22)
- The section reveal starts with a fully closed clip mask; its previous negative top inset exposed the raised model's head before the section became visible. The completed reveal still leaves room for glows.
- Replaces the flyer beside “Ready to join?” with the approved Lady Justice network, holding a custom shield and bacteriophage on her scales. No crest/title decorations.
- `JusticeHologram.tsx` loads the existing Three.js dependency and `lady-justice-network-v1.json` only on entering the viewport. The 101,672-byte data file contains 1,765 segments and 646 junctions, rendered in two draw calls. No original high-resolution sculpt or Blender file ships to visitors.
- Capped at 30 fps and 1.5 device pixel ratio; pauses off-screen/in background tabs, respects reduced motion, disposes GPU resources on unmount. Slow 32-second full turn with subtle float/pointer parallax; static WebP fallback for unavailable WebGL. Enlarged framing and raised desktop position align the figure alongside the contact copy.
- Model path, accessible description and source/license links live in `siteConfig.hologram`. Credit beneath the figure names Kenny Maguire Studio, links the original Lady Justice and CC BY 4.0, and identifies our changes. New copy includes Spanish translations.
- Blender working files remain local under `artifacts/`; only the exported network and fallback image belong in `public/assets/`.
- Local production-browser sample: JavaScript heap was 9.1 MiB before visiting contact and 10.4 MiB with the hologram loaded (garbage collection makes individual readings fluctuate). These exclude browser process/GPU/image memory. Model buffers contain about 49 KiB of float data. Three.js is a separate deferred chunk, about 187 kB gzipped; the static WebP fallback is 39.9 kB and only loads if WebGL fails.
