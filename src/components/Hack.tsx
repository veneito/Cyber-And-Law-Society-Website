import { useEffect, useState } from "react";

export type HackState = {
  kind: "dots" | "qte" | "quiz";
  data: { points?: { id: number; x: number; y: number }[]; keys?: string; question?: string };
  issuedAt: number;
};

export function Hack({ hack, onSolve }: { hack: HackState; onSolve: (solution: string | string[]) => Promise<boolean> }) {
  const [now, setNow] = useState(() => Date.now());
  const [answer, setAnswer] = useState("");
  const [next, setNext] = useState(1);
  const [bad, setBad] = useState(false);
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 200); return () => clearInterval(i); }, []);
  const secs = Math.max(0, Math.floor((now - hack.issuedAt) / 1000));

  const submit = async (s: string | string[]) => {
    const ok = await onSolve(s);
    if (!ok) { setBad(true); setAnswer(""); setNext(1); }
  };
  const points = hack.data.points ?? [];
  const byId = [...points].sort((a, b) => a.id - b.id);
  const keys = hack.data.keys ?? "";

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

        {hack.kind === "quiz" && (
          <>
            <p className="mt-4 text-white">{hack.data.question}</p>
            <input autoFocus value={answer} onChange={(e) => { setBad(false); setAnswer(e.target.value); }} onKeyDown={(e) => e.key === "Enter" && submit(answer)}
              className="mt-3 w-full rounded border border-neutral-700 bg-black px-3 py-2 text-white" placeholder="Your answer" />
            <button onClick={() => submit(answer)} className="mt-3 rounded-lg bg-green-400 px-5 py-2 font-semibold text-black hover:bg-green-300">Submit</button>
          </>
        )}
      </div>
    </div>
  );
}
