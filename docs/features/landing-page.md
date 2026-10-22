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
`src/components/Network.tsx`: canvas of drifting green nodes joined by lines over the hero banner; nodes near the cursor/touch link to it and are pushed away. Pointer-events none, pauses off-screen, static with reduced motion. Only used when a banner is set.
