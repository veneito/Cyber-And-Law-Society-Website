# Animations (2026-10-06)

## Intro code rain — `src/components/CodeRain.tsx`
- Matrix-style rain (katakana/digits/symbols, `green-400`) pours from the top, then the black backdrop fades to reveal the page.
- ~4.2s total (`DURATION`), fade starts at 1.2s (`DISSOLVE_START`). Click/any key skips. Scroll locked while playing.
- Once per browser session (`sessionStorage` key `cls-intro-played`). Skipped under reduced motion.
- `?intro` in the URL forces it to play (also overrides reduced motion) — use for testing; the Claude preview pane has reduced motion on.

## Scroll-in "generation" — `src/components/Materialize.tsx`
- Every `<Section>` (About, Events, Officers, FAQ, Contact) builds when it enters view: eyebrow + title decode from random glyphs, body draws top-down behind a glowing green scanline (CSS in `index.css`, `.materialize`).
- One-time per section. Hero not affected.
- Kill switch: `ENABLED = false` in Materialize.tsx. Reduced motion → static (unless `?intro`).
