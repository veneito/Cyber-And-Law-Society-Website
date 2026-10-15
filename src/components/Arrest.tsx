import { useEffect, useRef, useState } from "react";
import { sfx } from "./sound";

// ASCII scene of Bea being caught. Played for every team when it finishes its own accusation.
const SCENES: { art: string; caption: string; ms: number; sound?: () => void }[] = [
  {
    ms: 1500, caption: "Bea F. Wellington, mid-hack...",
    art: String.raw`
          O
         /|\      ___________
         / \     |  $ $ $ $  |
      ___|_|___  |_ L A P T O P_|
     [ typing... ]`,
  },
  {
    ms: 1700, caption: "FREEZE! YOU ARE UNDER ARREST!", sound: sfx.siren,
    art: String.raw`
   *WEE-OOH*   *WEE-OOH*
      _____________
     |   POLICE    |
     |_____________|
          \O/
           |
          / \
`,
  },
  {
    ms: 1300, caption: "Click.",
    art: String.raw`
          O
         /|\
        (o)-(o)
         / \
     [ cuffed ]`,
  },
  {
    ms: 700, caption: "",
    art: String.raw`
  ||    ||    ||    ||    ||
  ||    ||    ||    ||    ||
  ||    ||    ||    ||    ||`,
  },
  {
    ms: 700, caption: "",
    art: String.raw`
  ||    ||    ||    ||    ||
  ||    ||    O     ||    ||
  ||    ||    ||    ||    ||
  ||    ||    ||    ||    ||
  ||    ||    ||    ||    ||`,
  },
  {
    ms: 2300, caption: "BEA F. WELLINGTON: BUSTED", sound: () => { sfx.slam(); setTimeout(sfx.jingle, 350); },
    art: String.raw`
  ||====||====||====||====||
  ||    ||    ||    ||    ||
  ||    ||    O     ||    ||
  ||    ||   /|\    ||    ||
  ||====||====||====||====||`,
  },
];

export function Arrest({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const done = useRef(onDone); // latest callback, so a parent re-render never restarts the timers
  useEffect(() => { done.current = onDone; });
  useEffect(() => {
    SCENES[i].sound?.();
    if (i >= SCENES.length - 1) {
      const t = setTimeout(() => done.current(), SCENES[i].ms);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setI(i + 1), SCENES[i].ms);
    return () => clearTimeout(t);
  }, [i]);
  const s = SCENES[i], last = i === SCENES.length - 1;
  return (
    <div className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black p-4 ${i === 1 ? "siren-flash" : ""}`}>
      <pre key={i} className="q-fade min-h-[11rem] font-mono text-xs leading-tight text-green-400 sm:text-base">{s.art}</pre>
      <p key={`c${i}`} className={`q-rise mt-6 font-mono tracking-widest ${last ? "stamp-slam text-3xl font-extrabold text-red-500" : "text-sm text-neutral-300"}`}>{s.caption}</p>
      <button onClick={onDone} className="absolute bottom-6 right-6 font-mono text-xs text-neutral-600 hover:text-white">skip</button>
    </div>
  );
}
