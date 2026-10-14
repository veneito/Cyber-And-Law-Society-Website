import { useEffect, useRef, useState } from "react";

// PLACEHOLDER layout: rough schematic, replace with traced Marx Library plans.
// shortcut: target is client-side for the prototype; move the check server-side before the event.
const W = 600, H = 400;
const TARGET = { x: 440, y: 120 };
const ROOMS = [
  { x: 20, y: 20, w: 200, h: 140, label: "Reading Room" },
  { x: 240, y: 20, w: 160, h: 140, label: "Stacks A" },
  { x: 420, y: 20, w: 160, h: 140, label: "Stacks B" },
  { x: 20, y: 180, w: 120, h: 200, label: "Study Rooms" },
  { x: 160, y: 180, w: 260, h: 90, label: "Front Desk" },
  { x: 160, y: 290, w: 260, h: 90, label: "Computer Lab" },
  { x: 440, y: 180, w: 140, h: 200, label: "Archives" },
];

export function Sonar() {
  const [started, setStarted] = useState(false);
  const [pos, setPos] = useState({ x: 100, y: 300 });
  const [found, setFound] = useState(false);
  const [pings, setPings] = useState<number[]>([]);
  const audio = useRef<AudioContext | null>(null);
  const posRef = useRef(pos);
  useEffect(() => { posRef.current = pos; }, [pos]);

  const dist = Math.hypot(pos.x - TARGET.x, pos.y - TARGET.y);
  const heat = Math.max(0, 1 - dist / 500);

  useEffect(() => {
    if (!started || found) return;
    let t: number;
    const tick = () => {
      const d = Math.hypot(posRef.current.x - TARGET.x, posRef.current.y - TARGET.y);
      const h = Math.max(0, 1 - d / 500);
      const ctx = audio.current;
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
    return () => clearTimeout(t);
  }, [started, found]);

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!started || found) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
    setPos({ x, y });
    if (Math.hypot(x - TARGET.x, y - TARGET.y) < 14) setFound(true);
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
          {found ? "SIGNAL FOUND. Check the real spot." : `Signal strength ${Math.round(heat * 100)}%. Drag or tap to scan.`}
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
            <circle cx={pos.x} cy={pos.y} r={6} fill="#4ade80" />
            <circle cx={pos.x} cy={pos.y} r={30 + heat * 60} fill="#4ade80" opacity={0.05 + heat * 0.25} />
            {pings.map((id) => (
              <circle key={id} cx={pos.x} cy={pos.y} r={8} fill="none" stroke="#4ade80" strokeWidth="2">
                <animate attributeName="r" from="8" to={40 + heat * 80} dur="0.9s" fill="freeze" />
                <animate attributeName="opacity" from="0.9" to="0" dur="0.9s" fill="freeze" />
              </circle>
            ))}
          </>
        )}
        {found && <circle cx={TARGET.x} cy={TARGET.y} r={10} fill="#f87171" />}
      </svg>
    </div>
  );
}

