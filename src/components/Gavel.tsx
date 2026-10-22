import { useEffect, useRef, useState } from "react";
import { sfx } from "./sound";

const GAVEL = [
"    ╭─────────╮",
"    ╞═════════╡",
"    │ ▒▒▒▒▒▒▒ │",
"    │ ░░░░░░░ │",
"    │ ░░░░░░░ ├──┬─────────────────╮",
"    │ ░░░░░░░ │▓▓│ ░░░░░░░░░░░░░░░ │",
"    │ ░░░░░░░ ├──┴─────────────────╯",
"    │ ░░░░░░░ │",
"    │ ▒▒▒▒▒▒▒ │",
"    ╞═════════╡",
"    ╰─────────╯",
].join("\n");
const BLOCK = [
"              ╭────────────────────╮",
"          ╭───┴────────────────────┴───╮",
"          │ ░░░░░░░░░░░░░░░░░░░░░░░░░ │",
"        ╭─┴───────────────────────────┴─╮",
"        ╰═══════════════════════════════╯",
].join("\n");

export const preloadGavel = () => Promise.resolve([GAVEL]);

export function Gavel({ text, sub, onDone }: { text: string; sub: string; onDone: () => void }) {
  const [hit, setHit] = useState(false);
  const done = useRef(onDone);
  useEffect(() => { done.current = onDone; });
  useEffect(() => {
    const impact = setTimeout(() => { setHit(true); sfx.slam(); }, 750);
    const end = setTimeout(() => done.current(), 3300);
    return () => { clearTimeout(impact); clearTimeout(end); };
  }, []);
  return <div className="q-fade pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4">
    <div className="w-full max-w-xl text-center">
      <div className="overflow-hidden rounded-lg border border-amber-700/60 bg-[#100b04] px-3 pb-5 pt-4">
        <div className="flex justify-between border-b border-amber-900/60 pb-3 font-mono text-[9px] tracking-[0.2em] text-amber-600"><span>COURT RECORD // ACTIVE</span><span>{hit ? "RULING ENTERED" : "AWAITING ORDER"}</span></div>
        <div className={`gavel-stage relative mx-auto mt-3 h-72 sm:h-80 ${hit ? "gavel-impact" : ""}`} aria-hidden>
          <pre className="gavel-tool absolute left-1/2 m-0 text-left font-mono text-amber-300">{GAVEL}</pre>
          <pre className="gavel-block absolute bottom-0 left-1/2 m-0 text-left font-mono text-amber-600">{BLOCK}</pre>
          {hit && <span className="gavel-impact-ring absolute bottom-8 left-1/2 h-4 w-24 rounded-[50%] border border-amber-300" />}
        </div>
      </div>
      <p className={`mt-4 font-mono text-2xl font-extrabold tracking-widest text-amber-300 sm:text-3xl ${hit ? "" : "opacity-0"}`} style={{ textShadow: "0 0 18px #fbbf2455" }}>{text}</p>
      <p className={`mt-2 text-sm text-neutral-400 ${hit ? "" : "opacity-0"}`}>{sub}</p>
    </div>
  </div>;
}
