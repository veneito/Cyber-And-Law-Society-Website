import { useEffect, useRef, useState } from "react";
import { sfx } from "./sound";

// Judge behind the bench. The gavel is raised in one frame and flat on the block in the other.
const JUDGE = String.raw`
        _________
       /  _   _  \
      |  (o) (o)  |
      |     ^     |
       \  \___/  /
     ___/'-----'\___
    /  |         |  \
   /   |  JUDGE  |   \
  |    |_________|    |
`;
const UP = String.raw`
                  ___
                 |___|=.
                      \ \
                       \ \
` + JUDGE + String.raw`
  ======================
  |        BENCH       |
`;
const SLAM = String.raw`


` + JUDGE + String.raw`
  ======================
  |  BENCH   _[===]=>  |
`;

// Plays a gavel slam, then calls onDone. The text appears with the slam.
export function Gavel({ text, sub, onDone }: { text: string; sub: string; onDone: () => void }) {
  const [hit, setHit] = useState(false);
  const done = useRef(onDone); // latest callback, so a parent re-render never restarts the timers
  useEffect(() => { done.current = onDone; });
  useEffect(() => {
    const a = setTimeout(() => { setHit(true); sfx.slam(); }, 800);
    const b = setTimeout(() => done.current(), 2800);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  return (
    <div className="q-fade pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4">
      <div key={String(hit)} className={`text-center ${hit ? "q-shake" : ""}`}>
        <pre className="font-mono text-xs leading-tight text-amber-300 sm:text-sm" aria-hidden>{hit ? SLAM : UP}</pre>
        <p className={`mt-4 font-mono text-2xl font-extrabold tracking-widest text-amber-300 sm:text-3xl ${hit ? "" : "opacity-0"}`} style={{ textShadow: "0 0 18px #fbbf24" }}>{text}</p>
        <p className={`mt-2 text-sm text-neutral-400 ${hit ? "" : "opacity-0"}`}>{sub}</p>
      </div>
    </div>
  );
}
