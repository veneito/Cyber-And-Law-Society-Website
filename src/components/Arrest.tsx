import { useEffect, useRef, useState } from "react";
import { sfx } from "./sound";

// ASCII scene of Bea being caught. Played for every team when it finishes its own accusation.
// The jail cell animation (23 frames, ASCII Animator export) plays once in the second-to-last scene, then holds on its last frame under the BUSTED stamp.
const JAIL_URL = "/case/jail-frames.json";
const JAIL_FPS = 8;
const JAIL_MS = Math.round((23 / JAIL_FPS) * 1000);
let jailFrames: Promise<string[]> | null = null;
export const preloadJail = () => (jailFrames ??= fetch(JAIL_URL).then((r) => r.json() as Promise<string[]>));

const SCENES: { art: string; caption: string; ms: number; sound?: () => void; jail?: boolean }[] = [
  {
    ms: 2000, caption: "Bea F. Wellington, mid-hack...", sound: sfx.type,
    art: String.raw`
   .----------------------------.
   | 01101 $$$ 10110 ACCESS 0110|
   | > transferring funds...    |
   | > covering tracks...  97%  |
   '----------------------------'
          O     ___________
         /|\___|  $ $ $ $  |
         / \    |_L A P T O P_|
      ___|_|___
     [ typing... ]`,
  },
  {
    ms: 1600, caption: "A siren, somewhere down the street...", sound: sfx.approach,
    art: String.raw`
     .  *  .       .   *     .
   .     ~~ WEE-OOH ~~    .
         ____
        / || \     <- headlights
       |_o__o_|
      ~~~~~~~~~~~~~~~~~~~~`,
  },
  {
    ms: 2100, caption: "FREEZE! YOU ARE UNDER ARREST!", sound: sfx.siren,
    art: String.raw`
   *WEE-OOH*       *WEE-OOH*
   _____________________________
  |  [P]  P O L I C E   [P]      |
  |_____________________________|
       O/        \O
      /|          |\      <- badge up
      / \        / \
   [ DETECTIVE ]  [ BEA ]`,
  },
  {
    ms: 1700, caption: "Hands up. Slowly.", sound: () => sfx.beep(),
    art: String.raw`
          \O/
           |        <- laptop abandoned
          / \     ___________
                 | ERROR 404 |
                 |__CLEARED?_|`,
  },
  {
    ms: 1700, caption: "Click.", sound: sfx.cuff,
    art: String.raw`
          O
         /|\
        (o)=(o)      <- cuffs on
         / \
     [ cuffed ]   *click* *click*`,
  },
  {
    ms: 1300, caption: "Evidence logged.", sound: sfx.tick,
    art: String.raw`
   .-------------------.
   | EVIDENCE  #0001   |
   | laptop ........ OK|
   | logs .......... OK|
   | alibi ........ N/A|
   '-------------------'`,
  },
  { ms: JAIL_MS, caption: "", art: "", jail: true },
  {
    ms: 3000, caption: "BEA F. WELLINGTON: BUSTED", sound: () => { sfx.slam(); setTimeout(sfx.jingle, 350); },
    art: "", jail: true,
  },
];

const ARREST_SCENE = 4; // "Click." (cuffed): Bea says "I want to talk to my lawyer" here; it lasts about as long as the next scenes

export function Arrest({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const done = useRef(onDone); // latest callback, so a parent re-render never restarts the timers
  useEffect(() => { done.current = onDone; });
  const voice = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => voice.current?.pause(), []); // skipping or finishing cuts the voice
  useEffect(() => {
    SCENES[i].sound?.();
    if (i === ARREST_SCENE) { voice.current = new Audio("/case/talk-layer.mp3"); voice.current.play().catch(() => {}); }
    if (i >= SCENES.length - 1) {
      const t = setTimeout(() => done.current(), SCENES[i].ms);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setI(i + 1), SCENES[i].ms);
    return () => clearTimeout(t);
  }, [i]);
  const [jail, setJail] = useState<string[] | null>(null);
  const [jf, setJf] = useState(0);
  useEffect(() => { preloadJail().then(setJail).catch(() => {}); }, []);
  const s = SCENES[i], last = i === SCENES.length - 1;
  const jailI = last ? (jail?.length ?? 1) - 1 : jf;
  useEffect(() => {
    if (!s.jail || last || !jail) return;
    setJf(0);
    const t = setInterval(() => setJf((n) => Math.min(n + 1, jail.length - 1)), 1000 / JAIL_FPS);
    return () => clearInterval(t);
  }, [i, jail]); // eslint-disable-line react-hooks/exhaustive-deps
  // Same sizing as the exported player: char width 0.6em, line height 0.6em, scaled to fill the width.
  const cols = jail ? Math.max(...jail[0].split("\n").map((l) => l.length)) : 1;
  const fs = Math.min(900, window.innerWidth * 0.95) / (cols * 0.6);
  return (
    <div className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black p-4 ${i === 1 ? "siren-flash" : ""}`}>
      {s.jail
        // The art is dark ink on white: invert it, then multiply onto green so it reads green-on-black.
        ? <div className="isolate overflow-hidden rounded-lg border-2 border-green-400 bg-green-400"><pre aria-hidden className="m-0 bg-white font-mono text-black" style={{ fontSize: fs, lineHeight: 0.6, filter: "invert(1) brightness(2.5)", mixBlendMode: "multiply" }}>{jail?.[jailI]}</pre></div>
        : <pre key={i} className="q-fade min-h-[11rem] font-mono text-xs leading-tight text-green-400 sm:text-base">{s.art}</pre>}
      <p key={`c${i}`} className={`q-rise mt-6 font-mono tracking-widest ${last ? "stamp-slam text-3xl font-extrabold text-red-500" : "text-sm text-neutral-300"}`}>{s.caption}</p>
      <button onClick={onDone} className="absolute bottom-6 right-6 font-mono text-xs text-neutral-600 hover:text-white">skip</button>
    </div>
  );
}
