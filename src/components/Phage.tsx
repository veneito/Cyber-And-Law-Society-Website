// Bacteriophage drawn head-up, tail-down; rotate it so the legs point the way it is heading.
export const Phage = ({ className }: { className: string }) => (
  <svg viewBox="0 0 32 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={`${className} drop-shadow-[0_0_3px_#4ade80]`} aria-hidden>
    {/* T4 phage: elongated faceted head, ringed sheath, base plate, kneed tail fibres */}
    <polygon points="16,1 23,5 23,15 16,19 9,15 9,5" fill="currentColor" fillOpacity="0.15" />
    <path d="M9 5l7 4 7-4M16 9v10" />
    <path d="M12 20.5h8M14 22v9M18 22v9M14 24.5h4M14 27h4M14 29.5h4M11 31h10" />
    <path d="M13 31 7 34 4 39M19 31l6 3 3 5M14.5 31 12 39M17.5 31 20 39" />
  </svg>
);
