import { t as tr } from "../i18n/language";
const CLOSED = [
"          ╭───────────╮",
"         ╱ ╭─────────╮ ╲",
"        ║  │         │  ║",
"        ║  │         │  ║",
"        ║  │         │  ║",
"    ╔═══╩══╧═════════╧══╩═══╗",
"    ║ ▪ ┌─────────────────┐ ║",
"    ║ ──┤ ░▒▓ ENCRYPT ▓▒░ ├─║",
"    ║   │  ╭───────────╮  │ ║",
"    ║ ══╪══│    ◉      │══╪═║",
"    ║   │  │    ║      │  │ ║",
"    ║ ──┤  ╰────╨──────╯  ├─║",
"    ║ ░ │  0F:A7 // 256   │ ░║",
"    ║ ▪ └─────────────────┘ ║",
"    ╚══╤══════╤══════╤══════╝",
"       ┴      ┴      ┴",
].join("\n");
const OPEN = [
"             ╭───────────╮",
"            ╱ ╭─────────╮ ╲",
"           ║  │         │  ║",
"           ║  │         ╰──╯",
"           ║  │",
"    ╔══════╩══╧═════════════╗",
"    ║ ▪ ┌─────────────────┐ ║",
"    ║ ──┤ ░▒▓ VERIFIED ▓▒░├─║",
"    ║   │  ╭───────────╮  │ ║",
"    ║ ══╪══│   ╲   ╱   │══╪═║",
"    ║   │  │    ╲╱     │  │ ║",
"    ║ ──┤  ╰───────────╯  ├─║",
"    ║ ░ │  AUTH // CLEAR  │ ░║",
"    ║ ▪ └─────────────────┘ ║",
"    ╚══╤══════╤══════╤══════╝",
"       ┴      ┴      ┴",
].join("\n");

// Shared static markup keeps every success lock identical, including the API-driven overlay.
export const LOCK_MARKUP = `<div class="cyber-lock" aria-hidden="true"><div class="cyber-art-label">AUTH // DECRYPTING</div><div class="cyber-lock-frames"><pre class="cyber-lock-closed">${CLOSED}</pre><pre class="cyber-lock-open">${OPEN}</pre></div><div class="cyber-decrypt-track"><span></span></div><div class="cyber-art-label">[ SIGNATURE ACCEPTED ]</div></div>`;

export function CyberLock() {
  return <div dangerouslySetInnerHTML={{ __html: LOCK_MARKUP }} />;
}

export function CyberLocation() {
  return <div className="cyber-location mx-auto w-64 border border-green-800 bg-black p-3 font-mono text-green-400" aria-hidden>
    <div className="flex justify-between text-[9px] tracking-widest"><span>{tr("GEO // TRACE")}</span><span>{tr("FIX ACQUIRED")}</span></div>
    <svg viewBox="0 0 240 110" className="mt-2 w-full">
      <defs><pattern id="geo-grid" width="15" height="15" patternUnits="userSpaceOnUse"><path d="M15 0H0V15" stroke="#14532d" strokeWidth="0.5" fill="none" /></pattern></defs>
      <rect width="240" height="110" fill="url(#geo-grid)" />
      <path d="M20 80H60V25H110V65H165V35H220 M80 110V85H145V10" stroke="#166534" strokeWidth={"2"} fill="none" />
      <g className="cyber-crosshair"><circle cx="120" cy="55" r="27" stroke="#4ade80" fill="#052e1666" strokeDasharray="3 3" /><path d="M120 18V42M120 68V92M83 55H107M133 55H157" stroke="#86efac" /><rect x="116" y="51" width="8" height="8" fill="#bbf7d0" /></g>
      <path className="cyber-geo-scan" d="M0 0V110" stroke="#86efac" strokeWidth={"1"} />
    </svg>
    <p className="mt-2 text-[10px] tracking-widest">{tr("[ MARX LIBRARY :: VERIFIED ]")}</p>
  </div>;
}

export function CyberUsb() {
  return <div className="cyber-usb mx-auto w-64 font-mono text-green-300" aria-hidden>
    <p className="cyber-art-label">{tr("DEVICE // RECOVERED")}</p>
    <pre className="cyber-usb-art">{[
"          ┌─────────────┐",
"          │ ┌──┐  ┌──┐ │",
"          │ │  │  │  │ │",
"          │ └──┘  └──┘ │",
"          │ ▥▥▥▥▥▥▥▥▥▥ │",
"      ╔═══╧═════════════╧═══╗",
"      ║ ▪ ┌─────────────┐ ▪ ║",
"      ║ ──┤  WELLINGTON ├── ║",
"      ║   │ ┌─────────┐ │   ║",
"      ║ ══╪═╡ ▥▥▥▥▥▥▥ ╞═╪══ ║",
"      ║   │ │ SIG.CORE│ │   ║",
"      ║ ──┤ └─┬─┬─┬─┘ ├── ║",
"      ║   │   │ │ └─○  │   ║",
"      ║   │   │ └───◇  │   ║",
"      ║   │   └─────●  │   ║",
"      ║ ▪ └─────────────┘ ▪ ║",
"      ║   ▰▰ USB 3.0 ▰▰    ║",
"      ╚═══════╤═══╤════════╝",
"              ╰───╯",
].join("\n")}</pre>
    <div className="cyber-decrypt-track"><span /></div>
    <p className="cyber-art-label">{tr("[ DIGITAL SIGNATURE DETECTED ]")}</p>
  </div>;
}
