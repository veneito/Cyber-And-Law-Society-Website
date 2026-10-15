import { useEffect, useRef } from "react";
import { sfx } from "./sound";

export type StepKind = "photo" | "sonar" | "drive" | "ciphers";

const TITLE: Record<StepKind, [string, string]> = {
  photo: ["LOCATION CONFIRMED", "The photo was taken at the Marx Library."],
  sonar: ["KEY OBTAINED", "You found what Bea hid."],
  drive: ["ACCESS GRANTED", "Bea's digital signature verified."],
  ciphers: ["ALL EVIDENCE DECODED", "Six messages. Six crimes. Time to accuse."],
};

// One unique animation per completed step.
function Art({ kind }: { kind: StepKind }) {
  if (kind === "photo")
    return (
      <div className="relative flex h-40 items-end justify-center">
        <span className="ripple absolute bottom-2 h-16 w-16 rounded-full border-2 border-green-400" />
        <span className="ripple absolute bottom-2 h-16 w-16 rounded-full border-2 border-green-400" style={{ animationDelay: "1s" }} />
        <svg viewBox="0 0 40 56" className="pin-drop relative h-28 w-20" aria-hidden>
          <path d="M20 54C20 54 4 34 4 20a16 16 0 0132 0c0 14-16 34-16 34z" fill="#ef4444" />
          <circle cx="20" cy="20" r="6" fill="#fff" />
        </svg>
      </div>
    );
  if (kind === "sonar")
    return (
      <div className="flex h-40 items-center justify-center [perspective:600px]">
        <svg viewBox="0 0 80 40" className="key-spin h-28 w-56" aria-hidden>
          <circle cx="14" cy="20" r="11" fill="none" stroke="#fbbf24" strokeWidth="4" />
          <circle cx="14" cy="20" r="3" fill="#fbbf24" />
          <path d="M25 20h50M62 20v10M70 20v8" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  if (kind === "drive")
    return (
      <div className="flex h-40 items-center justify-center">
        <svg viewBox="0 0 40 52" className="h-32 w-24" aria-hidden>
          <path className="lock-open" d="M10 24V16a10 10 0 0120 0v8" fill="none" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" />
          <rect x="4" y="24" width="32" height="24" rx="4" fill="#16a34a" />
          <circle cx="20" cy="35" r="4" fill="#052e16" />
        </svg>
      </div>
    );
  return (
    <div className="grid h-40 grid-cols-6 items-center gap-2">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="tile-flip flex h-20 items-center justify-center rounded border border-green-400/60 bg-green-500/10 font-mono text-xl text-green-300" style={{ animationDelay: `${i * 0.22}s` }}>✓</div>
      ))}
    </div>
  );
}

export function StepDone({ kind, onDone }: { kind: StepKind; onDone: () => void }) {
  const done = useRef(onDone); // latest callback, so a parent re-render never restarts the timer
  useEffect(() => { done.current = onDone; });
  useEffect(() => {
    sfx.chime({ photo: 0, sonar: 1, drive: 2, ciphers: 3 }[kind]);
    const t = setTimeout(() => done.current(), 2400);
    return () => clearTimeout(t);
  }, [kind]);
  const [title, sub] = TITLE[kind];
  return (
    <div className="q-fade pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4">
      <div className="w-full max-w-md text-center">
        <Art kind={kind} />
        <p className="q-rise mt-4 font-mono text-3xl font-extrabold tracking-widest text-green-400" style={{ textShadow: "0 0 18px #4ade80", animationDelay: "0.5s" }}>{title}</p>
        <p className="q-rise mt-2 text-sm text-neutral-400" style={{ animationDelay: "0.8s" }}>{sub}</p>
      </div>
    </div>
  );
}
