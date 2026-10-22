import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { HackState } from "./Hack";
import { sfx } from "./sound";

const MARKS = ["◆", "●", "▲", "■"];
const COLORS = ["#fb7185", "#38bdf8", "#fbbf24", "#c084fc"];

export function InteractiveHack({ hack, onSolve }: { hack: HackState; onSolve: (answer: string[]) => Promise<boolean> }) {
  const initial = hack.data.sequence ?? [];
  const [cells, setCells] = useState(initial);
  const [selected, setSelected] = useState<number | null>(null);
  const [connections, setConnections] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [moves, setMoves] = useState(0);
  const [hoverCell, setHoverCell] = useState<number | null>(null);
  const affects = (a: number, b: number) => a === b || Math.abs(a - b) === 3 || (Math.floor(a / 3) === Math.floor(b / 3) && Math.abs(a - b) === 1);
  const [errors, setErrors] = useState<number[]>([]);
  const errorCount = useRef(0);
  const errorTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const closeButton = useRef<HTMLButtonElement>(null);
  const releaseButton = useRef<HTMLButtonElement>(null);
  useEffect(() => () => clearInterval(errorTimer.current), []);
  useEffect(() => { if (errors.length) closeButton.current?.focus(); }, [errors]);
  const spreadErrors = () => {
    clearInterval(errorTimer.current);
    errorCount.current = 1;
    setErrors([1]);
    sfx.accessDenied();
    errorTimer.current = setInterval(() => {
      const id = ++errorCount.current;
      setErrors(old => [...old, id]);
      sfx.errorSpread();
      if (id >= 4) clearInterval(errorTimer.current);
    }, 1400);
  };
  const button = "rounded-lg border border-red-900 bg-red-950/30 p-3 text-white transition hover:border-red-300 focus-visible:outline-2 focus-visible:outline-red-300 disabled:opacity-40";
  const submit = async () => {
    if (busy || errors.length) return;
    setBusy(true);
    sfx.lockCheck();
    try {
      const ok = await onSolve((hack.kind === "wires" ? connections : cells).map(String));
      if (!ok) { setMessage("Still locked. Adjust the circuit and try again."); spreadErrors(); }
    } catch { setMessage("Connection interrupted. Try again."); }
    finally { setBusy(false); }
  };
  return <div className="mt-5">
    {errors.length > 0 && createPortal(<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4" onKeyDown={e => { if (e.key === "Tab") { e.preventDefault(); closeButton.current?.focus(); } }}>
      {errors.map((id, i) => <div key={id} role={i === errors.length - 1 ? "alertdialog" : undefined} aria-modal={i === errors.length - 1 ? true : undefined} aria-label="Access denied" aria-hidden={i !== errors.length - 1 || undefined} className="absolute w-[min(21rem,82vw)] border border-red-400 bg-neutral-950 shadow-[6px_6px_0_#450a0a]" style={{ transform: `translate(${i * 10}px, ${i * 16}px)`, zIndex: i }}>
        <div className="flex items-center justify-between bg-red-900 px-3 py-2 font-mono text-xs text-red-50"><span>ACCESS DENIED · {id}/4</span><span aria-hidden>⚠</span></div>
        <div className="p-5"><p className="text-red-100">Wrong circuit. You’re still locked out.</p><p className="mt-2 text-sm text-neutral-400">Dismiss this error before it spreads.</p><button ref={i === errors.length - 1 ? closeButton : undefined} tabIndex={i === errors.length - 1 ? 0 : -1} className="mt-4 rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-400" onClick={() => {
          sfx.dismissError();
          if (errors.length === 1) { clearInterval(errorTimer.current); setErrors([]); releaseButton.current?.focus(); }
          else setErrors(old => old.filter(n => n !== id));
        }}>Close error</button><p className="mt-3 font-mono text-xs text-red-400">{errors.length} window{errors.length === 1 ? "" : "s"} remaining</p></div>
      </div>)}
    </div>, document.body)}
    {hack.kind === "wires" && <>
      <h2 className="font-mono text-sm uppercase tracking-wider text-red-300">Crossed wires</h2>
      <p className="mt-2 text-sm text-neutral-400">Select a source on the left, then its matching symbol on the right.</p>
      <div className="relative mt-4 grid grid-cols-2 gap-x-24 gap-y-3">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
          {connections.map((port, i) => port !== undefined && <path key={i} d={`M 21 ${12.5 + i * 25} C 45 ${12.5 + i * 25}, 55 ${12.5 + port * 25}, 79 ${12.5 + port * 25}`} stroke={COLORS[i]} strokeWidth="0.7" fill="none" />)}
        </svg>
        {MARKS.map((mark, i) => <div key={mark} className="contents">
          <button disabled={busy} aria-label={`Source ${mark}`} aria-pressed={selected === i} onClick={() => { sfx.wireSelect(); setSelected(i); setMessage(""); }} className={`${button} relative z-10 bg-neutral-950 text-xl`} style={{ color: COLORS[i], borderColor: selected === i ? COLORS[i] : undefined }}>{mark} <span className="text-xs">{connections[i] !== undefined ? "LINKED" : `0${i + 1}`}</span></button>
          <button disabled={busy} aria-label={`Destination ${MARKS[initial[i]]}`} onClick={() => {
            if (selected === null) { sfx.wireReject(); setMessage("Select a source on the left first."); return; }
            if (initial[i] !== selected) { sfx.wireReject(); setMessage("Incompatible port. Match the symbols."); return; }
            sfx.wireConnect();
            setConnections((old) => { const updated = [...old]; updated[selected] = i; return updated; }); setSelected(null); setMessage("Wire secured.");
          }} className={`${button} relative z-10 bg-neutral-950 text-xl`} style={{ color: COLORS[initial[i]] }}>{MARKS[initial[i]]} <span className="text-xs">PORT {i + 1}</span></button>
        </div>)}
      </div>
      <p className="mt-3 font-mono text-xs text-red-300">{connections.filter((n) => n !== undefined).length}/4 wires secured</p>
    </>}
    {hack.kind === "firewall" && <>
      <h2 className="font-mono text-sm uppercase tracking-wider text-red-300">Restore the firewall</h2>
      <p className="mt-2 text-sm text-neutral-400">Turn every cell on. Each press flips that cell and its neighbors above, below, left and right.</p>
      <div className="mt-4 rounded-xl border border-red-900/60 bg-[#0c0606] p-2 sm:p-3">
      <div className="mb-3 flex justify-between font-mono text-[9px] tracking-widest text-red-400"><span>FW // SECTOR 09</span><span>{cells.every(Boolean) ? "SYSTEM STABLE" : "BREACH ACTIVE"}</span></div>
      <div className="grid grid-cols-3 gap-2">{cells.map((on, i) => <button key={i} disabled={busy} aria-label={`Cell ${i + 1}, ${on ? "on" : "off"}; flips adjacent cells`} aria-pressed={!!on} onPointerEnter={() => setHoverCell(i)} onPointerLeave={() => setHoverCell(null)} onFocus={() => setHoverCell(i)} onBlur={() => setHoverCell(null)} className="firewall-cell relative aspect-square overflow-hidden rounded-md border font-mono transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200 disabled:opacity-40" data-online={!!on} data-targeted={hoverCell !== null && affects(i, hoverCell)} onClick={() => {
        sfx.firewallSwitch(!cells[i]);
        setCells((old) => old.map((v, n) => affects(n, i) ? v ^ 1 : v)); setMoves(moves + 1); setMessage("");
      }}>
        <svg viewBox="0 0 100 100" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-40"><path d="M0 22 H24 L36 34 M100 78 H76 L64 66 M22 100 V76 L34 64 M78 0 V24 L66 36" fill="none" stroke="currentColor" strokeWidth="0.7"/><circle cx="24" cy="22" r="2" fill="currentColor"/><circle cx="76" cy="78" r="2" fill="currentColor"/><rect x="32" y="32" width="36" height="36" rx="3" fill="none" stroke="currentColor" strokeWidth="0.7"/></svg>
        <span className="absolute left-2 top-2 text-[8px] tracking-widest">N / 0{i + 1}</span>
        <span aria-hidden className="absolute right-2 top-2 h-1 w-1 rounded-full bg-current" />
        <span className="relative text-lg sm:text-xl">{on ? "⏣" : "×"}</span>
        <span className="absolute inset-x-0 bottom-2 text-[8px] tracking-wider">{on ? "ONLINE" : "OFFLINE"}</span>
        {on && <span aria-hidden className="firewall-scan pointer-events-none absolute inset-x-0 top-0 h-px bg-red-300/40" />}
      </button>)}</div>
      <div className="mt-3 flex gap-1" aria-hidden>{cells.map((on, i) => <span key={i} className={`h-1 flex-1 ${on ? "bg-red-400" : "bg-red-950"}`} />)}</div>
      <p role="status" className="mt-2 font-mono text-[10px] text-red-300">{cells.filter(Boolean).length}/9 online · {moves} moves</p>
      </div>
      <p className="mt-2 min-h-4 font-mono text-[10px] text-neutral-500">{hoverCell === null ? "Select a node to reroute its neighboring cells." : `NODE 0${hoverCell + 1} → ${cells.map((_, i) => affects(i, hoverCell) ? `0${i + 1}` : "").filter(Boolean).join(" / ")}`}</p>
    </>}
    {hack.kind === "rings" && <>
      <h2 className="font-mono text-sm uppercase tracking-wider text-red-300">Break the lock</h2>
      <p className="mt-2 text-sm text-neutral-400">Rotate each ring until its bright marker points straight up. Align all three to release the lock.</p>
      <svg viewBox="0 0 200 200" aria-label="Three lock rings with alignment markers" className="mx-auto mt-3 w-full max-w-64">
        <path d="M100 8 L100 94" stroke="#fca5a5" strokeDasharray="2 4" opacity="0.5" />
        {cells.map((step, i) => <g key={i} style={{ transform: `rotate(${step * 45}deg)`, transformOrigin: "100px 100px", transition: "transform 180ms ease" }}>
          <circle cx="100" cy="100" r={82 - i * 24} fill="none" stroke={step === 0 ? "#fca5a5" : "#7f1d1d"} strokeWidth="9" />
          <circle cx="100" cy={18 + i * 24} r="5" fill="#fff1f2" />
        </g>)}
        <text x="100" y="104" textAnchor="middle" fill="#fca5a5" fontSize="9" fontFamily="monospace">{cells.every(v => v === 0) ? "ALIGNED" : "LOCKED"}</text>
      </svg>
      <div className="grid grid-cols-3 gap-2">{cells.map((_, i) => <button key={i} disabled={busy} className={button} onClick={() => { sfx.ringTurn((cells[i] + 1) % 8 === 0); setCells(old => old.map((n, j) => i === j ? (n + 1) % 8 : n)); setMessage(""); }}>Rotate {i === 0 ? "outer" : i === 1 ? "middle" : "inner"} ↻</button>)}</div>
    </>}
    <p role="status" className="mt-3 min-h-8 text-sm text-red-300">{message}</p>
    <div className="flex gap-2">
      <button ref={releaseButton} disabled={busy} className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-400 disabled:opacity-40" onClick={() => void submit()}>{busy ? "Releasing…" : "Release lock"}</button>
      <button disabled={busy} className={button} onClick={() => { sfx.puzzleReset(); setCells(initial); setConnections([]); setSelected(null); setMoves(0); setMessage(""); }}>Reset puzzle</button>
    </div>
  </div>;
}
