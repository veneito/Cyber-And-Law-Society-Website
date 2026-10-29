import { t as tr } from "../i18n/language";
import { useEffect, useRef } from "react";
import { sfx } from "./sound";

// Shown once when a team's 90 minutes run out; the results screen follows.
export function GameOver({ onDone }: { onDone: () => void }) {
  const done = useRef(onDone); // latest callback, so a parent re-render (the clock ticks) never restarts the timer
  useEffect(() => { done.current = onDone; });
  useEffect(() => {
    sfx.siren();
    const a = setTimeout(sfx.slam, 600);
    const b = setTimeout(() => done.current(), 4500);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  return (
    <div onClick={() => done.current()} className="q-fade fixed inset-0 z-[80] flex cursor-pointer flex-col items-center justify-center bg-black px-4 text-center">
      <p className="q-shake font-mono text-5xl font-extrabold tracking-widest text-red-500 sm:text-7xl" style={{ textShadow: "0 0 30px #ef4444" }}>{tr("GAME OVER")}</p>
      <p className="mt-6 font-mono text-sm text-neutral-300">{tr("Time is up. Bea F. Wellington got away.")}</p>
      <p className="mt-10 font-mono text-xs text-neutral-600">{tr("tap to see your results")}</p>
    </div>
  );
}
