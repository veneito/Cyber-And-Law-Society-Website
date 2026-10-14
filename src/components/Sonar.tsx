import { useEffect, useRef, useState } from "react";

// PLACEHOLDER layout: rough schematic, replace with traced Marx Library plans (the target itself lives on the server).
const W = 600, H = 400;
const ROOMS = [
  { x: 20, y: 20, w: 200, h: 140, label: "Reading Room" },
  { x: 240, y: 20, w: 160, h: 140, label: "Stacks A" },
  { x: 420, y: 20, w: 160, h: 140, label: "Stacks B" },
  { x: 20, y: 180, w: 120, h: 200, label: "Study Rooms" },
  { x: 160, y: 180, w: 260, h: 90, label: "Front Desk" },
  { x: 160, y: 290, w: 260, h: 90, label: "Computer Lab" },
  { x: 440, y: 180, w: 140, h: 200, label: "Archives" },
];

type Ping = (x: number, y: number) => Promise<{ strength: number; found: boolean } | null>;

export function Sonar({ onPing, onKey }: { onPing: Ping; onKey: () => void }) {
  const [started, setStarted] = useState(false);
  const [pos, setPos] = useState({ x: 100, y: 300 });
  const [heat, setHeat] = useState(0);
  const [found, setFound] = useState(false);
  const [pings, setPings] = useState<number[]>([]);
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

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!started || found) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H });
  };

  const begin = () => {
    audio.current = new AudioContext(); // needs a user gesture
    setStarted(true);
  };

  return (
    <div>
      {!started ? (
        <button onClick={begin} className="rounded-lg bg-green-400 px-5 py-3 font-semibold text-black hover:bg-green-300">
          Begin investigation
        </button>
      ) : (
        <p className="font-mono text-sm text-green-400">
          {found ? "SIGNAL FOUND. Something is hidden here." : `Signal strength ${Math.round(heat * 100)}%. Drag or tap to scan.`}
        </p>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        onPointerDown={move}
        onPointerMove={(e) => e.buttons && move(e)}
        className="mt-4 w-full max-w-2xl touch-none rounded-xl border border-neutral-800 bg-neutral-950"
      >
        {ROOMS.map((r) => (
          <g key={r.label}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="#404040" />
            <text x={r.x + 8} y={r.y + 18} fill="#737373" fontSize="12" fontFamily="monospace">{r.label}</text>
          </g>
        ))}
        {started && (
          <>
            <circle cx={pos.x} cy={pos.y} r={6} fill={found ? "#f87171" : "#4ade80"} />
            <circle cx={pos.x} cy={pos.y} r={30 + heat * 60} fill="#4ade80" opacity={0.05 + heat * 0.25} />
            {pings.map((id) => (
              <circle key={id} cx={pos.x} cy={pos.y} r={8} fill="none" stroke="#4ade80" strokeWidth="2">
                <animate attributeName="r" from="8" to={40 + heat * 80} dur="0.9s" fill="freeze" />
                <animate attributeName="opacity" from="0.9" to="0" dur="0.9s" fill="freeze" />
              </circle>
            ))}
          </>
        )}
      </svg>
      {found && (
        <button onClick={onKey} className="mt-4 rounded-lg bg-green-400 px-6 py-3 font-semibold text-black hover:bg-green-300">
          Key Obtained
        </button>
      )}
    </div>
  );
}
