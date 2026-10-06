import { Bug, RotateCcw, Shield, ShieldCheck, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Cell = { virus: boolean; open: boolean; flag: boolean; n: number };
type Status = "ready" | "playing" | "won" | "lost";

const LEVELS = {
  easy: { rows: 9, cols: 9, viruses: 10 },
  medium: { rows: 12, cols: 12, viruses: 22 },
  hard: { rows: 14, cols: 18, viruses: 45 },
} as const;
type Level = keyof typeof LEVELS;

const NUM_COLORS = ["", "text-green-300", "text-cyan-300", "text-yellow-300", "text-orange-400", "text-red-400", "text-pink-400", "text-purple-400", "text-white"];

const blank = (rows: number, cols: number): Cell[] =>
  Array.from({ length: rows * cols }, () => ({ virus: false, open: false, flag: false, n: 0 }));

function neighbors(i: number, rows: number, cols: number) {
  const r = Math.floor(i / cols), c = i % cols, out: number[] = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if ((dr || dc) && nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push(nr * cols + nc);
    }
  return out;
}

// Viruses are seeded after the first click so the first scan is always safe.
function seed(cells: Cell[], safe: number, rows: number, cols: number, count: number) {
  const banned = new Set([safe, ...neighbors(safe, rows, cols)]);
  const pool = cells.map((_, i) => i).filter((i) => !banned.has(i));
  for (let k = 0; k < count && pool.length; k++) {
    const j = Math.floor(Math.random() * pool.length);
    cells[pool.splice(j, 1)[0]].virus = true;
  }
  cells.forEach((cell, i) => (cell.n = neighbors(i, rows, cols).filter((j) => cells[j].virus).length));
}

export function Quarantine() {
  const [level, setLevel] = useState<Level>("easy");
  const { rows, cols, viruses } = LEVELS[level];
  const [cells, setCells] = useState(() => blank(rows, cols));
  const [status, setStatus] = useState<Status>("ready");
  const [flagMode, setFlagMode] = useState(false);
  const [time, setTime] = useState(0);
  const [hit, setHit] = useState(-1);
  const [origin, setOrigin] = useState(0);
  const pressTimer = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);

  const reset = (l: Level = level) => {
    setLevel(l);
    setCells(blank(LEVELS[l].rows, LEVELS[l].cols));
    setStatus("ready");
    setTime(0);
    setHit(-1);
    setOrigin(0);
  };

  // Reveal ripples outward from the clicked cell.
  const delay = (i: number) =>
    Math.max(Math.abs(Math.floor(i / cols) - Math.floor(origin / cols)), Math.abs((i % cols) - (origin % cols))) * 30;

  useEffect(() => {
    if (status !== "playing") return;
    const id = window.setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const over = status === "won" || status === "lost";

  function open(i: number) {
    if (over || cells[i].flag) return;
    const next = cells.map((c) => ({ ...c }));
    setOrigin(i);
    if (status === "ready") {
      seed(next, i, rows, cols, viruses);
      setStatus("playing");
    }
    // Chord: clicking an open number with enough quarantines opens its neighbors.
    let targets = [i];
    if (next[i].open) {
      const around = neighbors(i, rows, cols);
      if (around.filter((j) => next[j].flag).length !== next[i].n) return;
      targets = around.filter((j) => !next[j].flag && !next[j].open);
    }
    for (const t of targets) {
      if (next[t].virus) {
        next.forEach((c) => c.virus && (c.open = true));
        setHit(t);
        setCells(next);
        setStatus("lost");
        return;
      }
      const stack = [t];
      while (stack.length) {
        const k = stack.pop()!;
        if (next[k].open || next[k].flag) continue;
        next[k].open = true;
        if (next[k].n === 0) stack.push(...neighbors(k, rows, cols));
      }
    }
    if (next.every((c) => c.virus || c.open)) {
      next.forEach((c) => c.virus && (c.flag = true));
      setStatus("won");
    }
    setCells(next);
  }

  function flag(i: number) {
    if (over || cells[i].open) return;
    setCells(cells.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)));
  }

  const flags = cells.filter((c) => c.flag).length;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex w-full max-w-3xl flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-neutral-800 p-1 font-mono text-xs">
          {(Object.keys(LEVELS) as Level[]).map((l) => (
            <button
              key={l}
              onClick={() => reset(l)}
              className={`rounded-md px-3 py-1.5 uppercase ${l === level ? "bg-green-400 text-black" : "text-neutral-400 hover:text-white"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 font-mono text-sm">
          <span className="flex items-center gap-1.5 text-red-400"><Bug className="h-4 w-4" aria-hidden />{viruses - flags}</span>
          <span className="flex items-center gap-1.5 text-neutral-300"><Timer className="h-4 w-4" aria-hidden />{time}s</span>
          <button
            onClick={() => setFlagMode(!flagMode)}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs ${flagMode ? "border-green-400 bg-green-400/15 text-green-300" : "border-neutral-700 text-neutral-400"}`}
            aria-pressed={flagMode}
          >
            <Shield className="h-3.5 w-3.5" aria-hidden /> Quarantine mode
          </button>
          <button onClick={() => reset()} className="rounded-md border border-neutral-700 p-1.5 text-neutral-300 hover:text-white" aria-label="New game">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={`relative max-w-full overflow-x-auto rounded-xl border border-green-400/30 ${status === "lost" ? "q-shake" : ""} ${status === "won" ? "q-win" : ""}`}><div className="rounded-xl bg-neutral-950 p-2 shadow-[0_0_40px_-12px_#4ade80]">
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} onContextMenu={(e) => e.preventDefault()}>
          {cells.map((c, i) => (
            <button
              key={i}
              onClick={() => {
                if (longPressed.current) return void (longPressed.current = false);
                flagMode && !c.open ? flag(i) : open(i);
              }}
              onContextMenu={(e) => { e.preventDefault(); flag(i); }}
              onTouchStart={() => {
                longPressed.current = false;
                pressTimer.current = window.setTimeout(() => { longPressed.current = true; flag(i); }, 400);
              }}
              onTouchEnd={() => clearTimeout(pressTimer.current)}
              onTouchMove={() => clearTimeout(pressTimer.current)}
              className={`grid h-8 w-8 select-none place-items-center rounded-sm font-mono text-sm font-bold sm:h-9 sm:w-9 ${
                c.open
                  ? c.virus
                    ? i === hit ? "bg-red-500/80" : "bg-red-500/20"
                    : "q-reveal bg-neutral-900"
                  : "bg-neutral-800 transition hover:scale-105 hover:bg-neutral-700 active:scale-95"
              }`}
              style={c.open && !c.virus ? { animationDelay: `${delay(i)}ms` } : undefined}
              aria-label={c.open ? (c.virus ? "virus" : `${c.n}`) : c.flag ? "quarantined" : "unscanned"}
            >
              {c.flag && !(c.open && c.virus) ? (
                <ShieldCheck key="f" className="q-pop h-5 w-5 text-green-400 drop-shadow-[0_0_6px_#4ade80]" aria-hidden />
              ) : c.open ? (
                c.virus ? <Bug className={`h-5 w-5 text-red-300 ${i === hit ? "q-pulse" : "q-pop"}`} style={{ animationDelay: `${delay(i)}ms` }} aria-hidden /> : c.n > 0 && <span className={`q-pop ${NUM_COLORS[c.n]}`} style={{ animationDelay: `${delay(i)}ms` }}>{c.n}</span>
              ) : null}
            </button>
          ))}
        </div>
        </div>
        {over && (
          <div className="absolute inset-0 grid place-items-center rounded-xl bg-black/70 backdrop-blur-sm">
            <div className="q-pop text-center">
              <p className={`font-mono text-2xl font-extrabold ${status === "won" ? "text-green-400" : "text-red-400"}`}>
                {status === "won" ? "> SYSTEM SECURED" : "> SYSTEM INFECTED"}
              </p>
              <p className="mt-2 text-sm text-neutral-300">
                {status === "won" ? `All ${viruses} viruses quarantined in ${time}s.` : "A virus got loose. Try again?"}
              </p>
              <button onClick={() => reset()} className="mt-4 rounded-lg bg-green-400 px-4 py-2 font-semibold text-black hover:bg-green-300">
                Play again
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Click to scan a file. Right-click, long-press, or use Quarantine mode to lock down a suspected virus with our shield.
      </p>
    </div>
  );
}
