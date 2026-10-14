import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { BLOCKED, BOOKSTAND, DIVIDERS, FLOORS, PILLARS, PLAN_H, PLAN_W, SHELVES, START, TABLES, WING, walkable } from "./floorplan";
import type { ViewProps } from "./Sonar3D";

const Sonar3D = lazy(() => import("./Sonar3D"));

type Ping = (x: number, y: number) => Promise<{ strength: number; found: boolean } | null>;

const hasWebGL = () => {
  try { return !!document.createElement("canvas").getContext("webgl"); } catch { return false; }
};

// Flat top-down view of the same plan, used when the browser cannot do WebGL.
function SonarFlat({ pos, heat, pings, found, started, onMove }: ViewProps) {
  const at = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.type === "pointermove" && !e.buttons) return;
    const b = e.currentTarget.getBoundingClientRect();
    onMove(((e.clientX - b.left) / b.width) * PLAN_W, ((e.clientY - b.top) / b.height) * PLAN_H);
  };
  return (
    <svg viewBox={`0 0 ${PLAN_W} ${PLAN_H}`} onPointerDown={at} onPointerMove={at} className="w-full touch-none rounded-xl border border-neutral-800 bg-neutral-950">
      {FLOORS.map((f, i) => <rect key={i} x={f.x} y={f.y} width={f.w} height={f.h} fill="#0b1a12" stroke="#4ade80" strokeOpacity="0.4" />)}
      <polygon points={WING.map((w) => `${w.x},${w.y}`).join(" ")} fill="#0b1a12" stroke="#4ade80" strokeOpacity="0.4" />
      {BLOCKED.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.height ? "#111827" : "#1a0b0b"} stroke={b.height ? "#94a3b8" : "#f87171"} strokeOpacity="0.6" />
          {b.label && <text x={b.x + b.w / 2} y={b.y + b.h / 2} textAnchor="middle" fill="#a3a3a3" fontSize="14" fontFamily="monospace">{b.label}</text>}
        </g>
      ))}
      {SHELVES.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="#1a1408" stroke="#fbbf24" strokeOpacity="0.7" />)}
      {DIVIDERS.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="#94a3b8" />)}
      <rect x={BOOKSTAND.x} y={BOOKSTAND.y} width={BOOKSTAND.w} height={BOOKSTAND.h} fill="#0b1a12" stroke="#4ade80" />
      {PILLARS.map((q, i) => <circle key={i} cx={q.x} cy={q.y} r={14} fill="#111827" stroke="#94a3b8" />)}
      {TABLES.map((q, i) => <circle key={i} cx={q.x} cy={q.y} r={22} fill="#0f1d15" stroke="#4ade80" strokeOpacity="0.4" />)}
      {started && (
        <>
          <circle cx={pos.x} cy={pos.y} r={10} fill={found ? "#f87171" : "#4ade80"} />
          <circle cx={pos.x} cy={pos.y} r={30 + heat * 70} fill="#4ade80" opacity={0.08 + heat * 0.3} />
          {pings.map((id) => (
            <circle key={id} cx={pos.x} cy={pos.y} r={8} fill="none" stroke="#4ade80" strokeWidth="3">
              <animate attributeName="r" from="8" to={50 + heat * 140} dur="0.9s" fill="freeze" />
              <animate attributeName="opacity" from="0.9" to="0" dur="0.9s" fill="freeze" />
            </circle>
          ))}
        </>
      )}
    </svg>
  );
}

export function Sonar({ onPing, onKey }: { onPing: Ping; onKey: () => void }) {
  const [started, setStarted] = useState(false);
  const [pos, setPos] = useState(START);
  const [heat, setHeat] = useState(0);
  const [found, setFound] = useState(false);
  const [pings, setPings] = useState<number[]>([]);
  const [angle, setAngle] = useState(0);
  const [webgl] = useState(hasWebGL);
  const audio = useRef<AudioContext | null>(null);
  const posRef = useRef(pos);
  const heatRef = useRef(0);
  useEffect(() => { posRef.current = pos; }, [pos]);

  useEffect(() => {
    if (!started || found) return;
    let t: number, dead = false;
    const tick = async () => {
      const r = await onPing(posRef.current.x, posRef.current.y);
      if (dead) return;
      if (r) {
        heatRef.current = r.strength;
        setHeat(r.strength);
        if (r.found) { setFound(true); return; }
      }
      const h = heatRef.current, ctx = audio.current;
      if (ctx) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = 300 + h * 900;
        g.gain.setValueAtTime(0.05 + h * 0.25, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.25);
      }
      const id = Date.now();
      setPings((p) => [...p.slice(-3), id]);
      setTimeout(() => setPings((p) => p.filter((x) => x !== id)), 900);
      t = window.setTimeout(tick, 250 + (1 - h) * 1750);
    };
    tick();
    return () => { dead = true; clearTimeout(t); };
  }, [started, found, onPing]);

  const onMove = (x: number, y: number) => {
    if (started && !found && walkable(x, y)) setPos({ x, y }); // shaded areas and rooms are off limits
  };

  const begin = () => {
    audio.current = new AudioContext(); // needs a user gesture
    setStarted(true);
  };

  const view: ViewProps = { pos, heat, pings, found, started, angle, onMove };
  return (
    <div>
      {!started ? (
        <button onClick={begin} className="rounded-lg bg-green-400 px-5 py-3 font-semibold text-black hover:bg-green-300">
          Begin investigation
        </button>
      ) : (
        <p className="font-mono text-sm text-green-400">
          {found ? "SIGNAL FOUND. Something is hidden here." : `Signal strength ${Math.round(heat * 100)}%. Drag or tap on the floor to scan.`}
        </p>
      )}
      <div className="mt-4 max-w-3xl">
        {webgl ? (
          <Suspense fallback={<p className="text-sm text-neutral-500">Loading map...</p>}><Sonar3D {...view} /></Suspense>
        ) : (
          <SonarFlat {...view} />
        )}
        {webgl && (
          <div className="mt-2 flex items-center gap-2 text-sm text-neutral-400">
            <span>Rotate view</span>
            <button onClick={() => setAngle(angle - 30)} className="rounded border border-neutral-700 px-3 py-1 hover:border-green-400" aria-label="Rotate left">&larr;</button>
            <button onClick={() => setAngle(angle + 30)} className="rounded border border-neutral-700 px-3 py-1 hover:border-green-400" aria-label="Rotate right">&rarr;</button>
          </div>
        )}
      </div>
      {found && (
        <button onClick={onKey} className="mt-4 rounded-lg bg-green-400 px-6 py-3 font-semibold text-black hover:bg-green-300">
          Key Obtained
        </button>
      )}
    </div>
  );
}
