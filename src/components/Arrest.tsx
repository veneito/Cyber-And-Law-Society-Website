import { useEffect, useRef, useState } from "react";
import { sfx } from "./sound";

// ASCII scene of Bea being caught. Played for every team when it finishes its own accusation.
// ASCII Animator exports play inside their scenes (the typing loops; the others play once and hold on the last frame): the handcuffs ("Click.") and the jail cell (under the BUSTED stamp).
const ANIMS: Record<string, { url: string; fps: number; n: number; loop?: boolean }> = {
  hack: { url: "/case/hack-frames.json", fps: 12, n: 5, loop: true }, // Bea typing; loops for the whole scene
  cuffs: { url: "/case/cuffs-frames.json", fps: 7, n: 9 },
  jail: { url: "/case/jail-frames.json", fps: 8, n: 23 },
};
type Anim = "hack" | "cuffs" | "jail";
const animMs = (a: Anim) => Math.round((ANIMS[a].n / ANIMS[a].fps) * 1000);
const loaded: Partial<Record<Anim, Promise<string[]>>> = {};
export const preloadAnim = (a: Anim) => (loaded[a] ??= fetch(ANIMS[a].url).then((r) => r.json() as Promise<string[]>));

const SCENES: { art: string; caption: string; ms: number; sound?: () => void; anim?: Anim }[] = [
  {
    ms: 2000, caption: "Bea F. Wellington, mid-hack...", sound: sfx.type, art: "", anim: "hack",
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
    ms: 2400, caption: "Click.", sound: sfx.cuff, art: "", anim: "cuffs",
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
  { ms: animMs("jail"), caption: "", art: "", anim: "jail" },
  {
    ms: 3000, caption: "BEA F. WELLINGTON: BUSTED", sound: () => { sfx.slam(); setTimeout(sfx.jingle, 350); },
    art: "", anim: "jail",
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
  const [anims, setAnims] = useState<Partial<Record<Anim, string[]>>>({});
  const [jf, setJf] = useState(0);
  useEffect(() => { (Object.keys(ANIMS) as Anim[]).forEach((a) => preloadAnim(a).then((f) => setAnims((m) => ({ ...m, [a]: f }))).catch(() => {})); }, []);
  const s = SCENES[i], last = i === SCENES.length - 1;
  const frames = s.anim ? anims[s.anim] : undefined;
  useEffect(() => {
    if (!s.anim || last || !frames) return;
    setJf(0);
    const t = setInterval(() => setJf((n) => (ANIMS[s.anim!].loop ? (n + 1) % frames.length : Math.min(n + 1, frames.length - 1))), 1000 / ANIMS[s.anim!].fps);
    return () => clearInterval(t);
  }, [i, frames]); // eslint-disable-line react-hooks/exhaustive-deps
  const frame = frames?.[last ? frames.length - 1 : jf];
  // Same sizing as the exported player: char width 0.6em, line height 0.6em; scaled to fit the width and the height (the cuffs art is tall).
  const lines = frames ? frames[0].split("\n") : [""];
  const cols = Math.max(1, ...lines.map((l) => l.length));
  const fs = Math.min(Math.min(900, window.innerWidth * 0.95) / (cols * 0.6), (window.innerHeight - 140) / (lines.length * 0.6));
  return (
    <div className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black p-4 ${i === 1 ? "siren-flash" : ""}`}>
      {s.anim
        // The art is dark ink on white: invert it, then multiply onto green so it reads green-on-black.
        ? <div className="isolate overflow-hidden rounded-lg border-2 border-green-400 bg-green-400"><pre aria-hidden className="m-0 bg-white font-mono text-black" style={{ fontSize: fs, lineHeight: 0.6, filter: "invert(1) brightness(2.5)", mixBlendMode: "multiply" }}>{frame}</pre></div>
        : <pre key={i} className="q-fade min-h-[11rem] font-mono text-xs leading-tight text-green-400 sm:text-base">{s.art}</pre>}
      <p key={`c${i}`} className={`q-rise mt-6 font-mono tracking-widest ${last ? "stamp-slam text-3xl font-extrabold text-red-500" : "text-sm text-neutral-300"}`}>{s.caption}</p>
      <button onClick={onDone} className="absolute bottom-6 right-6 font-mono text-xs text-neutral-600 hover:text-white">skip</button>
    </div>
  );
}
