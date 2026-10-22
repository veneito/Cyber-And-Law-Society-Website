import { t as tr } from "../i18n/language";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Skull } from "./Skull";
import { Portrait } from "./Briefing";
import { InteractiveHack } from "./InteractiveHack";
import { BreachIntro } from "./BreachIntro";
import { sfx } from "./sound";

export type HackState = {
  kind: "dots" | "memory" | "wires" | "firewall" | "rings";
  data: { points?: { id: number; x: number; y: number }[]; keys?: string; question?: string; sequence?: number[] };
  issuedAt: number;
};

const PADS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308"];

export function Hack({ hack, onSolve, mood }: { mood?: "happy" | "angry" | "scared"; hack: HackState; onSolve: (solution: string | string[]) => Promise<boolean> }) {
  const [now, setNow] = useState(() => Date.now());
  const [next, setNext] = useState(1);
  const [bad, setBad] = useState(false);
  const [dotMessage, setDotMessage] = useState("");
  const [pressedPad, setPressedPad] = useState(-1);
  const padTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const memoryTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => memoryTimers.current.forEach(clearTimeout), []);
  useEffect(() => () => clearTimeout(padTimer.current), []);
  const dotBusy = useRef(false);
  const dotTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(dotTimer.current), []);
  const [mem, setMem] = useState<{ stage: "ready" | "show" | "input"; lit: number; entered: number[] }>({ stage: "ready", lit: -1, entered: [] });
  const [glitching, setGlitching] = useState(true); // the screen breaks for a moment before the skull appears
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 200); return () => clearInterval(i); }, []);
  useEffect(() => {
    // Shake the app root, not the body: a transformed body would pin fixed overlays to the top of the page.
    const root = document.getElementById("root");
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) root?.classList.add("glitch-shake");
    sfx.glitch();
    const shake = setTimeout(() => root?.classList.remove("glitch-shake"), 220);
    const t = setTimeout(() => { setGlitching(false); }, 2600);
    return () => { clearTimeout(t); clearTimeout(shake); root?.classList.remove("glitch-shake"); };
  }, []);
  const secs = Math.max(0, Math.floor((now - hack.issuedAt) / 1000));

  const submit = async (s: string | string[]) => {
    const ok = await onSolve(s);
    if (!ok) { setBad(true); setNext(1); setMem({ stage: "ready", lit: -1, entered: [] }); }
  };
  const points = hack.data.points ?? [];
  const byId = [...points].sort((a, b) => a.id - b.id);
  const seq = hack.data.sequence ?? [];
  const connect = (id: number) => {
    if (dotBusy.current || id < next) return;
    if (id !== next) { sfx.circuitBlocked(); setDotMessage(`Signal blocked. Find node ${next}.`); return; }
    sfx.circuitNode(id);
    setBad(false);
    setNext(next + 1);
    setDotMessage(id === points.length ? tr("Circuit restored. Releasing lock…") : `Node ${id} secured. Connect node ${id + 1}.`);
    if (id === points.length) {
      dotBusy.current = true;
      dotTimer.current = setTimeout(async () => {
        try { await submit(byId.map((d) => String(d.id))); }
        catch { setNext(1); setDotMessage(tr("Connection interrupted. Reconnect the circuit.")); }
        finally { dotBusy.current = false; }
      }, 450);
    }
  };

  const playSequence = () => {
    memoryTimers.current.forEach(clearTimeout);
    memoryTimers.current = [];
    sfx.memoryReady();
    setBad(false);
    setMem({ stage: "show", lit: -1, entered: [] });
    seq.forEach((pad, i) => {
      memoryTimers.current.push(setTimeout(() => { sfx.memoryPad(pad); setMem((m) => ({ ...m, lit: pad })); }, 500 + i * 700));
      memoryTimers.current.push(setTimeout(() => setMem((m) => ({ ...m, lit: -1 })), 500 + i * 700 + 450));
    });
    memoryTimers.current.push(setTimeout(() => setMem({ stage: "input", lit: -1, entered: [] }), 500 + seq.length * 700));
  };
  const press = (pad: number) => {
    if (mem.stage !== "input") return;
    sfx.memoryPad(pad);
    setPressedPad(pad);
    clearTimeout(padTimer.current);
    padTimer.current = setTimeout(() => setPressedPad(-1), 180);
    const entered = [...mem.entered, pad];
    setMem({ ...mem, entered });
    if (entered.length === seq.length) submit(entered.map(String));
  };

  if (glitching) {
    return createPortal(
      <BreachIntro />,
      document.body,
    );
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/90 p-4">
      <div className="fixed right-6 top-1/2 hidden -translate-y-1/2 lg:block"><Portrait label="Chris P. Bacon" sub="FBI" mood={mood} /></div>
      <div className="my-auto w-full max-w-md rounded-xl border border-red-500/60 bg-neutral-950 p-6">
        <Skull />
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-red-400">{tr("You have been hacked")}</p>
        <p className="mt-1 text-white">{tr("Bea F. Wellington locked your screen. Solve this to get back in.")}</p>
        <p className="mt-1 font-mono text-xs text-neutral-500">{secs}{tr("s. Under 20s: +20 points. Over 60s: -20 points.")}</p>
        {bad && <p className="mt-2 text-sm text-red-400">{tr("Not right. Try again.")}</p>}

        {hack.kind === "dots" && (
          <>
            <div className="mt-4 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-red-300"><span>{tr("Reroute the breach")}</span><span>{Math.min(next - 1, points.length)}/{points.length}{tr("nodes")}</span></div>
            <p className="mt-2 text-sm text-neutral-400">{tr("Connect the numbered nodes in order to restore access.")}</p>
            <div className="mt-3 h-1 overflow-hidden rounded bg-red-950"><div className="h-full bg-red-400 transition-[width] duration-200" style={{ width: `${points.length ? (next - 1) / points.length * 100 : 0}%` }} /></div>
            <svg viewBox="0 0 100 100" aria-label="Breach circuit: connect nodes in number order" className="mt-3 w-full rounded-lg border border-red-900/70 bg-black" style={{ backgroundImage: "radial-gradient(circle at center, #450a0a55, transparent 75%), linear-gradient(#ef44440a 1px, transparent 1px), linear-gradient(90deg, #ef44440a 1px, transparent 1px)", backgroundSize: "100% 100%, 8% 8%, 8% 8%" }}>
              {byId.slice(0, next - 1).map((p, i, a) => i > 0 && <g key={p.id} className="breach-link"><line x1={a[i - 1].x} y1={a[i - 1].y} x2={p.x} y2={p.y} stroke="#ef4444" strokeWidth="2.5" opacity="0.2" /><line x1={a[i - 1].x} y1={a[i - 1].y} x2={p.x} y2={p.y} stroke="#fca5a5" strokeWidth="0.6" /><line className="breach-signal" x1={a[i - 1].x} y1={a[i - 1].y} x2={p.x} y2={p.y} stroke="#fff1f2" strokeWidth="0.9" strokeDasharray="2 5" /></g>)}
              {points.map((p) => (
                <g key={p.id} role="button" tabIndex={p.id === next ? 0 : -1} aria-label={`Node ${p.id}${p.id < next ? ', connected' : p.id === next ? ', connect next' : ''}`} className="breach-node cursor-pointer outline-none" onClick={() => connect(p.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); connect(p.id); } }}>
                  <circle cx={p.x} cy={p.y} r={7} fill="transparent" />
                  {p.id === next && <circle className="breach-target" cx={p.x} cy={p.y} r={6.5} fill="none" stroke="#f87171" strokeWidth="0.45" strokeDasharray="1.5 1" />}
                  <circle className="breach-core" cx={p.x} cy={p.y} r={5} fill={p.id < next ? "#dc2626" : "#1c0808"} stroke={p.id === next ? "#fecaca" : "#ef4444"} strokeWidth={p.id === next ? 0.9 : 0.55} />
                  <text pointerEvents="none" x={p.x} y={p.y + 1.6} textAnchor="middle" fontSize="4.5" fill={p.id < next ? "#fff1f2" : "#fca5a5"} fontFamily="monospace">{p.id}</text>
                </g>
              ))}
            </svg>
            <p role="status" className="mt-3 min-h-10 font-mono text-xs text-red-300">{tr(dotMessage) || "Find the pulsing node 1. Reconnect the circuit."}</p>
          </>
        )}

        {hack.kind === "memory" && (
          <>
            <div className="mt-4 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-red-300"><span>{tr("Signal memory")}</span><span>{mem.stage === "show" ? tr("Receiving…") : mem.stage === "input" ? tr("Transmit pattern") : tr("Stand by")}</span></div>
            <p className="mt-2 text-sm text-neutral-400">{tr("Watch the pattern, then repeat it.")}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {PADS.map((c, i) => (
                <button key={c} onClick={() => press(i)} disabled={mem.stage !== "input"} aria-label={`Pad ${i + 1}, ${["red", "green", "blue", "yellow"][i]}`} className="memory-pad relative h-24 overflow-hidden rounded-lg border text-left transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white enabled:cursor-pointer disabled:cursor-default" data-lit={mem.lit === i || pressedPad === i}
                  style={{ color: c, borderColor: mem.lit === i || pressedPad === i ? c : `${c}66`, backgroundColor: mem.lit === i || pressedPad === i ? `${c}88` : `${c}16`, boxShadow: mem.lit === i || pressedPad === i ? `inset 0 0 28px ${c}66, 0 0 18px ${c}55` : `inset 0 0 20px ${c}0a` }}>
                  <span aria-hidden className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: `linear-gradient(${c}66 1px, transparent 1px), linear-gradient(90deg, ${c}66 1px, transparent 1px)`, backgroundSize: "14px 14px" }} />
                  <span className="absolute left-3 top-2 font-mono text-[10px] tracking-widest">CH / 0{i + 1}</span>
                  <span aria-hidden className="absolute inset-0 flex items-center justify-center font-mono text-3xl">{["◇", "⊕", "⌁", "▱"][i]}</span>
                  <span className="absolute bottom-2 left-3 font-mono text-[9px] tracking-widest">{mem.lit === i ? tr("SIGNAL IN") : pressedPad === i ? tr("SENT") : mem.stage === "input" ? tr("READY") : tr("LISTEN")}</span>
                  <span aria-hidden className="absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full bg-current" />
                </button>
              ))}
            </div>
            {mem.stage === "ready" && <button onClick={playSequence} className="mt-3 rounded-lg bg-red-500 px-5 py-2 font-semibold text-white hover:bg-red-400">{tr("Show pattern")}</button>}
            {mem.stage === "input" && <div className="mt-3 flex items-center gap-2" role="status" aria-label={`${mem.entered.length} of ${seq.length} signals entered`}>{seq.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded ${i < mem.entered.length ? "bg-red-400" : "bg-red-950"}`} />)}<span className="font-mono text-xs text-red-300">{mem.entered.length}/{seq.length}</span></div>}
          </>
        )}

        {["wires", "firewall", "rings"].includes(hack.kind) && <InteractiveHack hack={hack} onSolve={onSolve} />}

      </div>
    </div>
  );
}
