# Landing page + hosting (first build, 2026-10-06)

Live: **https://cybernlaw.veneito.dev**. Repo: private `veneito/Cyber-And-Law-Society-Website`.

## Stack
Vite + React + TypeScript + Tailwind v4 + lucide-react (lucide has no brand icons, so socials use generic icons + labels).

## Content
- **Everything** (copy, links, images) lives in `src/config/site.ts`. Components never hardcode club details.
- A link set to `"#"` is hidden. An image set to `null` falls back (initials / shield).
- Join button: sign-up form if set, else Discord, else scrolls to #contact.
- Assets in `public/assets/`: `logo.webp` (crest, white background, shown in a white circle), `banner.webp` (hero), `flyer.webp` (contact section).
- Sections: hero (banner, `>` headline with a blinking cursor), Three disciplines (Cybersecurity/Law/Philosophy), What We Do (5 activities), Events, Officers, FAQ, Ready to join.

## Look
Black, terminal green (`green-400`), white. JetBrains Mono (Google Fonts) for the headline and labels. The cursor blinks even with reduced motion (user's choice; ~1/sec, safe).

## Navigation
- Header nav: Home (`/`), About, Events, Officers, FAQ, Play. Logo also links to `/`.
- `main.tsx` sets `history.scrollRestoration = "manual"` and scrolls to top on load (or to the `#section` in the URL), so Back from /play lands at the top.

## Hosting
- Mint PC `vene-serverlinux` (same as the Family dashboard), clone at `~/cls-site`.
- `cls-site.service` runs `deploy/serve.mjs` (no deps, blocks `../`, SPA fallback, no-cache HTML) on 127.0.0.1:3001.
- `cls-site-update.timer` runs `deploy/update.sh` every 5 min: fetch, fast-forward, `npm ci`, build, restart. Log: `~/cls-site/update.log`.
- Cloudflare Tunnel `family-dashboard` → Published application routes: `cybernlaw.veneito.dev` → `http://localhost:3001`. **No Access gate** (public site).
- **Deploy = push to main.** No Cloudflare API token / GitHub Actions (user's choice).
- One-time setup: `bash ~/cls-site/deploy/setup.sh` (needs sudo password).

## Files
`src/config/site.ts`, `src/App.tsx`, `src/components/*`, `src/index.css`, `index.html`, `deploy/*`.
