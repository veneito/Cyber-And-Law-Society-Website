import { useEffect, useRef } from "react";
import { CyberLock, CyberLocation, CyberUsb } from "./CyberArt";
import { sfx } from "./sound";

export type StepKind = "photo" | "sonar" | "drive" | "ciphers";

const TITLE: Record<StepKind, [string, string]> = {
  photo: ["LOCATION CONFIRMED", "The photo was taken at the Marx Library."],
  sonar: ["USB RECOVERED", "Bea’s digital signature is on the drive."],
  drive: ["ACCESS GRANTED", "Bea's digital signature verified."],
  ciphers: ["ALL EVIDENCE DECODED", "Six messages. Six crimes. Time to accuse."],
};

// One unique animation per completed step.
function Art({ kind }: { kind: StepKind }) {
  if (kind === "photo") return <CyberLocation />;
  if (kind === "sonar") return <CyberUsb />;
  if (kind === "drive") return <CyberLock />;
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
    if (kind === "drive") sfx.unlock();
    else sfx.chime({ photo: 0, sonar: 1, drive: 2, ciphers: 3 }[kind]);
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
