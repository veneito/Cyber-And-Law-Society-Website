import { useEffect, useRef, useState } from "react";
import { sfx } from "./sound";

// ASCII gavel animation (11 frames, dark characters on a light page), exported from ASCII Animator.
const FRAMES_URL = "/case/gavel-frames.json";
const FPS = 11.5;
const HIT = 5; // frame where the gavel lands
let frames: Promise<string[]> | null = null;
export const preloadGavel = () => (frames ??= fetch(FRAMES_URL).then((r) => r.json() as Promise<string[]>));

// Plays the gavel once inside a frame, slams (sound and text) as it lands, then calls onDone.
export function Gavel({ text, sub, onDone }: { text: string; sub: string; onDone: () => void }) {
  const [art, setArt] = useState<string[] | null>(null);
  const [i, setI] = useState(0);
  const done = useRef(onDone); // latest callback, so a parent re-render never restarts the timers
  useEffect(() => { done.current = onDone; });
  useEffect(() => {
    let timer = 0;
    let cancelled = false;
    const end = setTimeout(() => done.current(), 3300);
    preloadGavel().then((f) => {
      if (cancelled) return;
      setArt(f);
      let n = 0;
      timer = window.setInterval(() => {
        n++;
        if (n >= f.length) { clearInterval(timer); return; }
        setI(n);
        if (n === HIT) sfx.slam();
      }, 1000 / FPS);
    }).catch(() => { sfx.slam(); setI(HIT); }); // frames missing: still show the text
    return () => { cancelled = true; clearInterval(timer); clearTimeout(end); };
  }, []);
  const hit = i >= HIT;
  const first = art?.[0] ?? "";
  const cols = Math.max(1, ...first.split("\n").map((l) => l.length));
  // Same character shape as the exported player: width 0.6 em, line height 0.6 em, scaled to fill the frame (36rem, less on small screens).
  const w = Math.min(576, window.innerWidth * 0.9);
  const fs = w / (cols * 0.6);
  return (
    <div className="q-fade pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4">
      <div key={String(hit)} className={`flex flex-col items-center text-center ${hit ? "q-shake" : ""}`}>
        <div className="box-content overflow-hidden rounded-lg border-2 border-amber-400 bg-white" style={{ width: w, height: art ? art[0].split("\n").length * fs * 0.6 : w * 0.41 }}>
          {art && <pre aria-hidden className="m-0 font-mono text-orange-500" style={{ fontSize: fs, lineHeight: 0.6 }}>{art[i]}</pre>}
        </div>
        <p className={`mt-4 font-mono text-2xl font-extrabold tracking-widest text-amber-300 sm:text-3xl ${hit ? "" : "opacity-0"}`} style={{ textShadow: "0 0 18px #fbbf24" }}>{text}</p>
        <p className={`mt-2 text-sm text-neutral-400 ${hit ? "" : "opacity-0"}`}>{sub}</p>
      </div>
    </div>
  );
}
