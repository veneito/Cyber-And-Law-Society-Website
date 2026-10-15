import { useEffect, useState } from "react";

export type HackState = {
  kind: "dots" | "qte" | "quiz" | "memory" | "unscramble" | "math" | "sequence" | "decode";
  data: { points?: { id: number; x: number; y: number }[]; keys?: string; question?: string; sequence?: number[] };
  issuedAt: number;
};

const PADS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308"];

export function Hack({ hack, onSolve }: { hack: HackState; onSolve: (solution: string | string[]) => Promise<boolean> }) {
  const [now, setNow] = useState(() => Date.now());
  const [answer, setAnswer] = useState("");
  const [next, setNext] = useState(1);
  const [bad, setBad] = useState(false);
  const [mem, setMem] = useState<{ stage: "ready" | "show" | "input"; lit: number; entered: number[] }>({ stage: "ready", lit: -1, entered: [] });
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 200); return () => clearInterval(i); }, []);
  const secs = Math.max(0, Math.floor((now - hack.issuedAt) / 1000));

  const submit = async (s: string | string[]) => {
    const ok = await onSolve(s);
    if (!ok) { setBad(true); setAnswer(""); setNext(1); setMem({ stage: "ready", lit: -1, entered: [] }); }
  };
  const points = hack.data.points ?? [];
  const byId = [...points].sort((a, b) => a.id - b.id);
  const keys = hack.data.keys ?? "";
  const seq = hack.data.sequence ?? [];

  const playSequence = () => {
    setBad(false);
    setMem({ stage: "show", lit: -1, entered: [] });
    seq.forEach((pad, i) => {
      setTimeout(() => setMem((m) => ({ ...m, lit: pad })), 500 + i * 700);
      setTimeout(() => setMem((m) => ({ ...m, lit: -1 })), 500 + i * 700 + 450);
    });
    setTimeout(() => setMem({ stage: "input", lit: -1, entered: [] }), 500 + seq.length * 700);
  };
  const press = (pad: number) => {
    if (mem.stage !== "input") return;
    const entered = [...mem.entered, pad];
    setMem({ ...mem, entered });
    if (entered.length === seq.length) submit(entered.map(String));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-md rounded-xl border border-red-500/60 bg-neutral-950 p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-400">You have been hacked</p>
        <p className="mt-1 text-white">Bea F. Wellington locked your screen. Solve this to get back in.</p>
        <p className="mt-1 font-mono text-xs text-neutral-500">{secs}s. Under 20s: +20 points. Over 60s: -20 points.</p>
        {bad && <p className="mt-2 text-sm text-red-400">Not right. Try again.</p>}

        {hack.kind === "dots" && (
          <>
            <p className="mt-4 text-sm text-neutral-400">Connect the dots in number order.</p>
            <svg viewBox="0 0 100 100" className="mt-2 w-full rounded border border-neutral-800 bg-black">
              {byId.slice(0, next - 1).map((p, i, a) => i > 0 && <line key={p.id} x1={a[i - 1].x} y1={a[i - 1].y} x2={p.x} y2={p.y} stroke="#4ade80" strokeWidth="1" />)}
              {points.map((p) => (
                <g key={p.id} className="cursor-pointer" onClick={() => {
                  if (p.id !== next) return;
                  setBad(false);
                  if (next === points.length) submit(byId.map((d) => String(d.id)));
                  else setNext(next + 1);
                }}>
                  <circle cx={p.x} cy={p.y} r={5} fill={p.id < next ? "#4ade80" : "#171717"} stroke="#4ade80" strokeWidth="0.8" />
                  <text x={p.x} y={p.y + 1.6} textAnchor="middle" fontSize="5" fill={p.id < next ? "#000" : "#4ade80"} fontFamily="monospace">{p.id}</text>
                </g>
              ))}
            </svg>
          </>
        )}

        {hack.kind === "qte" && (
          <>
            <p className="mt-4 text-sm text-neutral-400">Type this sequence, fast.</p>
            <p className="mt-2 text-center font-mono text-3xl tracking-[0.3em] text-green-300">{keys}</p>
            <input autoFocus value={answer}
              onChange={(e) => { setBad(false); setAnswer(e.target.value.toUpperCase()); if (e.target.value.length >= keys.length) submit(e.target.value); }}
              className="mt-3 w-full rounded border border-neutral-700 bg-black px-3 py-2 text-center font-mono text-xl tracking-[0.3em] text-white" />
          </>
        )}

        {hack.kind === "memory" && (
          <>
            <p className="mt-4 text-sm text-neutral-400">Watch the pattern, then repeat it.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {PADS.map((c, i) => (
                <button key={c} onClick={() => press(i)} aria-label={`Pad ${i + 1}`} className="h-20 rounded-lg border border-neutral-700"
                  style={{ background: c, opacity: mem.lit === i ? 1 : 0.3 }} />
              ))}
            </div>
            {mem.stage === "ready" && <button onClick={playSequence} className="mt-3 rounded-lg bg-green-400 px-5 py-2 font-semibold text-black hover:bg-green-300">Show pattern</button>}
            {mem.stage === "input" && <p className="mt-3 text-sm text-neutral-400">{mem.entered.length} of {seq.length}</p>}
          </>
        )}

        {["quiz", "unscramble", "math", "sequence", "decode"].includes(hack.kind) && (
          <>
            <p className="mt-4 break-words text-white">{hack.data.question}</p>
            <input autoFocus value={answer} onChange={(e) => { setBad(false); setAnswer(e.target.value); }} onKeyDown={(e) => e.key === "Enter" && submit(answer)}
              className="mt-3 w-full rounded border border-neutral-700 bg-black px-3 py-2 text-white" placeholder="Your answer" />
            <button onClick={() => submit(answer)} className="mt-3 rounded-lg bg-green-400 px-5 py-2 font-semibold text-black hover:bg-green-300">Submit</button>
          </>
        )}
      </div>
    </div>
  );
}
