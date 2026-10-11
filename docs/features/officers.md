# Officers

- Data: `officers` in `src/config/site.ts` (name, role, major, image, email, bio). `image: null` shows an initials placeholder.
- Current order: Jon (President, Criminal Justice), Alfred (VP, Information Technology), Andrew (Co-President, Digital Forensics), Professor Wang (Advisor, no photo yet).
- Photos: `public/assets/officers/<name>.jpg`.
- Group banner: `officersPhoto` in `site.ts` (`group1.jpg`), rendered above the cards in the "Meet the officers" section of `src/App.tsx`. Remove the field to hide it.
- Unused: no color group shot kept (clashed with the theme).

## Carousel
- `OfficerCarousel` + `OfficerCard` in `src/App.tsx`: coverflow of square cards (centre large and glowing, sides tilted, dimmed, fading beyond two steps). Click a side card, use the arrows/dots, arrow keys or swipe to move; it does not loop. Click the centre card for the pop-up.
- Prev/next buttons are holographic green circles with a sideways T4 bacteriophage icon (`Phage`, head points the way the arrow goes). They sit outside the overflow-hidden stage so their glow isn't clipped; on phones they sit under the card beside the dots.
- Section reveal clip-path (`.materialize-body` in `index.css`) extends 4rem past the sides so glows near the edges aren't cut off.
- Not checked in the browser: the pane was blocked by a popup during this work, so spacing/phone layout were only type-checked.

## Officer pop-up
- Each card (`OfficerCard` in `src/App.tsx`) is a button that opens a native `<dialog>` via `showModal()`: focus trap, Escape and focus restore come free; a click on the dialog element itself counts as a backdrop click.
- Fade in/out is CSS transitions (`@starting-style` + `allow-discrete`) in `src/index.css`; older browsers close instantly. Reduced motion disables it.
- Name and "role · major" use `DecodeText` (same scramble as section headings), replayed on each open.
- Bio fades in word by word (`.bio-word`, 0.06s per word, `animationDelay` in `OfficerCard`).
- `bio` optional: omitted = sample placeholder text, `""` = no bio (Professor Wang). Alfred's and Andrew's bios are invented fluff, to be replaced by the real ones.
- `email` renders as an outlined green button (`mailto:`), matching "Become an officer". Emails are public on the site.
