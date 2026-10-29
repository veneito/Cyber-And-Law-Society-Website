import { t as tr } from "../i18n/language";
import { useEffect, useRef, useState } from "react";
import { sfx } from "./sound";

// ASCII scene of Bea being caught. Played for every team when it finishes its own accusation.
// ASCII Animator exports play inside their scenes (the typing loops; the others play once and hold on the last frame): the handcuffs ("Click.") and the jail cell (under the BUSTED stamp).
const ANIMS: Record<string, { url: string; fps: number; n: number; loop?: boolean }> = {
  hack: { url: "/case/hack-frames-v2.json", fps: 12, n: 5, loop: true }, // Bea typing; loops for the whole scene
  car: { url: "/case/car-frames.json", fps: 14, n: 28 },
  cuffs: { url: "/case/cuffs-frames.json", fps: 7, n: 9 },
  jail: { url: "/case/jail-frames.json", fps: 8, n: 23 },
};
type Anim = "hack" | "car" | "cuffs" | "jail";
const animMs = (a: Anim) => Math.round((ANIMS[a].n / ANIMS[a].fps) * 1000);
const loaded: Partial<Record<Anim, Promise<string[]>>> = {};
export const preloadAnim = (a: Anim) => (loaded[a] ??= fetch(ANIMS[a].url, { signal: AbortSignal.timeout(10000) }).then((r) => { if (!r.ok) throw new Error(tr("Scene unavailable")); return r.json() as Promise<string[]>; }).catch(error => { delete loaded[a]; throw error; }));

const SCENES: { art: string; caption: string; ms: number; sound?: () => void; anim?: Anim }[] = [
  {
    ms: 2000, caption: tr("Bea F. Wellington, mid-hack..."), sound: sfx.type, art: "", anim: "hack",
  },
  {
    ms: animMs("car"), caption: tr("A siren, somewhere down the street..."), sound: sfx.approach, art: "", anim: "car",
  },
  {
    ms: 2400, caption: tr("Click."), sound: sfx.cuff, art: "", anim: "cuffs",
  },
  { ms: animMs("jail"), caption: "", art: "", anim: "jail" },
  {
    ms: 3000, caption: tr("BEA F. WELLINGTON: BUSTED"), sound: () => { sfx.slam(); setTimeout(sfx.jingle, 350); },
    art: "", anim: "jail",
  },
];

const ARREST_SCENE = 2; // "Click." (cuffed): Bea says "I want to talk to my lawyer" here; it lasts about as long as the next scenes

export function Arrest({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [anims, setAnims] = useState<Partial<Record<Anim, string[]>>>({});
  const [jf, setJf] = useState(0);
  const [failed, setFailed] = useState<Partial<Record<Anim, boolean>>>({});
  const s = SCENES[i], last = i === SCENES.length - 1;
  const frames = s.anim ? anims[s.anim] : undefined;
  const done = useRef(onDone); // latest callback, so a parent re-render never restarts the timers
  useEffect(() => { done.current = onDone; });
  const voice = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => voice.current?.pause(), []); // skipping or finishing cuts the voice
  useEffect(() => {
    if (s.anim && !frames && !failed[s.anim]) return;
    SCENES[i].sound?.();
    if (i === ARREST_SCENE) { voice.current = new Audio("/case/talk-layer.mp3"); voice.current.play().catch(() => {}); }
    if (i >= SCENES.length - 1) {
      const t = setTimeout(() => done.current(), SCENES[i].ms);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setI(i + 1), SCENES[i].ms);
    return () => clearTimeout(t);
  }, [i, frames, s.anim, failed]);
  useEffect(() => {
    if(!s.anim) return;
    const kind=s.anim;let cancelled=false;
    preloadAnim(kind).then(f=>{if(!cancelled)setAnims(old=>({...old,[kind]:f}));}).catch(()=>{if(!cancelled)setFailed(old=>({...old,[kind]:true}));});
    return()=>{cancelled=true;};
  }, [s.anim]);
  useEffect(() => {
    if (!s.anim || last || !frames) return;
    setJf(0);
    const t = setInterval(() => setJf((n) => (ANIMS[s.anim!].loop ? (n + 1) % frames.length : Math.min(n + 1, frames.length - 1))), 1000 / ANIMS[s.anim!].fps);
    return () => clearInterval(t);
  }, [i, frames]); // eslint-disable-line react-hooks/exhaustive-deps
  const frame = frames?.[last ? frames.length - 1 : Math.min(jf, frames.length - 1)];
  useEffect(() => {
    const next = SCENES[i + 1]?.anim;
    if (frames && next) void preloadAnim(next).catch(() => {});
  }, [i, frames]);
  // Same sizing as the exported player: char width 0.6em, line height 0.6em; scaled to fit the width and the height (the cuffs art is tall).
  const lines = frames ? frames[0].split("\n") : [""];
  const cols = Math.max(1, ...lines.map((l) => l.length));
  const fs = Math.min(Math.min(900, window.innerWidth * 0.95) / (cols * 0.6), (window.innerHeight - 140) / (lines.length * 0.6));
  return (
    <div className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black p-4 ${i === 1 ? "siren-flash" : ""}`}>
      {s.anim && !frames ? <div role="status" className="flex h-64 w-full max-w-xl items-center justify-center border border-green-900 bg-black font-mono text-sm text-green-500">{failed[s.anim] ? tr("SCENE UNAVAILABLE") : tr("DECRYPTING CASE FOOTAGE…")}</div> : s.anim
        // The art is dark ink on white: invert it, then multiply onto green so it reads green-on-black.
        ? <div className="isolate overflow-hidden rounded-lg border-2 border-green-400 bg-green-400"><pre aria-hidden className="m-0 bg-white font-mono text-black" style={{ fontSize: fs, lineHeight: 0.6, filter: "invert(1) brightness(2.5)", mixBlendMode: "multiply" }}>{frame}</pre></div>
        : <pre key={i} className="q-fade min-h-[11rem] font-mono text-xs leading-tight text-green-400 sm:text-base">{s.art}</pre>}
      {last ? <div className="arrest-verdict mt-5 w-full max-w-xl border border-green-400/60 bg-black p-4 font-mono sm:p-5">
        <div className="flex justify-between border-b border-green-900 pb-2 text-[9px] tracking-[0.2em] text-green-600"><span>{tr("FBI // CASE WELLINGTON")}</span><span>{tr("STATUS UPDATED")}</span></div>
        <div className="mt-4 flex items-center gap-4">
          <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center border border-green-500/50 text-2xl text-green-300">✓</span>
          <div><p className="text-[10px] tracking-[0.2em] text-neutral-500">{tr("SUBJECT IDENTIFIED")}</p><p className="mt-1 text-sm tracking-wider text-green-200 sm:text-lg">BEA F. WELLINGTON</p></div>
        </div>
        <div className="mt-4 flex items-center justify-between border-y border-green-900 py-3"><span className="text-[10px] tracking-widest text-green-600">{tr("[ ARREST CONFIRMED ]")}</span><span className="text-xl font-bold tracking-[0.2em] text-green-300 sm:text-2xl">{tr("BUSTED")}</span></div>
        <p className="mt-3 text-[9px] tracking-[0.15em] text-neutral-500">{tr("IN CUSTODY // THREAT CONTAINED // CASE CLOSED")}</p>
      </div> : <p key={`c${i}`} className="q-rise mt-6 font-mono text-sm tracking-widest text-neutral-300">{s.caption}</p>}
      <button onClick={onDone} className="absolute bottom-6 right-6 font-mono text-xs text-neutral-600 hover:text-white">{"skip"}</button>
    </div>
  );
}
