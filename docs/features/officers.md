# Officers

- Data: `officers` in `src/config/site.ts` (name, role, major, image, email, bio). `image: null` shows an initials placeholder.
- Current order: Jon (President, Criminal Justice), Alfred (VP, Information Technology), Andrew (Co-President, Digital Forensics), Professor Wang (Advisor, no photo yet).
- Photos: `public/assets/officers/<name>.jpg`.
- Group banner: `officersPhoto` in `site.ts` (`group1.jpg`), rendered above the cards in the "Meet the officers" section of `src/App.tsx`. Remove the field to hide it.
- Unused: no color group shot kept (clashed with the theme).

## Officer pop-up
- Each card (`OfficerCard` in `src/App.tsx`) is a button that opens a native `<dialog>` via `showModal()`: focus trap, Escape and focus restore come free; a click on the dialog element itself counts as a backdrop click.
- Fade in/out is CSS transitions (`@starting-style` + `allow-discrete`) in `src/index.css`; older browsers close instantly. Reduced motion disables it.
- Name and "role · major" use `DecodeText` (same scramble as section headings), replayed on each open.
- Bio fades in word by word (`.bio-word`, 0.06s per word, `animationDelay` in `OfficerCard`).
- `bio` optional: omitted = sample placeholder text, `""` = no bio (Professor Wang). Alfred's and Andrew's bios are invented fluff, to be replaced by the real ones.
- `email` renders as an outlined green button (`mailto:`), matching "Become an officer". Emails are public on the site.
