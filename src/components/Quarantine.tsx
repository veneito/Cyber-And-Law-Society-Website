import { Bug, RotateCcw, Shield, ShieldCheck, Timer, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Cell = { virus: boolean; open: boolean; flag: boolean; n: number };
type Status = "ready" | "playing" | "won" | "lost";

const LEVELS = {
  easy: { rows: 9, cols: 9, viruses: 10 },
  medium: { rows: 12, cols: 12, viruses: 22 },
  hard: { rows: 14, cols: 18, viruses: 45 },
} as const;
type Level = keyof typeof LEVELS;

type Score = { name: string; ms: number; date: string };
type Board = Record<Level, Score[]>;
const API = "/api/leaderboard";
const NAME_KEY = "cls-quarantine-name";
const fmt = (ms: number) => (ms / 1000).toFixed(2) + "s";

function Leaderboard({ level, board, mine }: { level: Level; board: Board | null; mine: Score | null }) {
  const list = board?.[level] ?? [];
  return (
    <aside className="q-rise w-full rounded-xl border border-neutral-800 bg-neutral-950/80 p-5 lg:w-72" style={{ animationDelay: "0.5s" }}>
      <h2 className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wide text-white">
        <Trophy className="h-4 w-4 text-yellow-300" aria-hidden /> Leaderboard
        <span className="ml-auto text-xs font-normal text-green-400">{level}</span>
      </h2>
      {board === null ? (
        <p className="mt-4 text-sm text-neutral-500">Loading scores…</p>
      ) : list.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">No scores yet. Be the first to secure the system.</p>
      ) : (
        <ol className="mt-4 space-y-1 font-mono text-sm">
          {list.map((s, k) => {
            const me = mine && s.name === mine.name && s.ms === mine.ms && s.date === mine.date;
            return (
              <li
                key={k + s.name + s.ms}
                className={`q-rise flex items-center gap-3 rounded-md px-2 py-1.5 ${me ? "bg-green-400/15 text-green-300 ring-1 ring-green-400/50" : "text-neutral-300"}`}
                style={{ animationDelay: `${k * 50}ms` }}
              >
                <span className={`w-5 text-right ${k === 0 ? "text-yellow-300" : k === 1 ? "text-neutral-300" : k === 2 ? "text-orange-400" : "text-neutral-600"}`}>{k + 1}</span>
                <span className="truncate">{s.name}</span>
                <span className="ml-auto tabular-nums text-neutral-400">{fmt(s.ms)}</span>
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}

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
  const [gameId, setGameId] = useState(0);
  const [finalMs, setFinalMs] = useState(0);
  const [board, setBoard] = useState<Board | null>(null);
  const [mine, setMine] = useState<Score | null>(null);
  const [name, setName] = useState(() => {
    try { return localStorage.getItem(NAME_KEY) ?? ""; } catch { return ""; }
  });
  const [submit, setSubmit] = useState<"idle" | "sending" | "done" | "error">("idle");
  const startedAt = useRef(0);

  useEffect(() => {
    fetch(API).then((r) => r.json()).then(setBoard).catch(() => setBoard({ easy: [], medium: [], hard: [] }));
  }, []);

  async function submitScore(e: React.FormEvent) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean || submit === "sending") return;
    setSubmit("sending");
    try { localStorage.setItem(NAME_KEY, clean); } catch { /* storage unavailable */ }
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: clean, level, ms: finalMs }) });
      if (!r.ok) throw new Error();
      const next: Board = await r.json();
      setBoard(next);
      setMine(next[level].find((s) => s.ms === finalMs) ?? null);
      setSubmit("done");
    } catch {
      setSubmit("error");
    }
  }
  const pressTimer = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);

  const reset = (l: Level = level) => {
    setLevel(l);
    setCells(blank(LEVELS[l].rows, LEVELS[l].cols));
    setStatus("ready");
    setTime(0);
    setHit(-1);
    setOrigin(0);
    setGameId((g) => g + 1);
    setSubmit("idle");
    setMine(null);
  };

  // New boards "boot up" in a diagonal wave.
  const boot = (i: number) => (Math.floor(i / cols) + (i % cols)) * 18;

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
      startedAt.current = performance.now();
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
      setFinalMs(Math.round(performance.now() - startedAt.current));
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
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
    <div className="flex min-w-0 flex-col items-center">
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
          <span className="flex items-center gap-1.5 text-red-400"><Bug className="h-4 w-4" aria-hidden /><span key={flags} className="q-pop inline-block">{viruses - flags}</span></span>
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

      <div className={`relative max-w-full overflow-x-auto rounded-xl border border-green-400/30 ${status === "lost" ? "q-shake" : ""} ${status === "won" ? "q-win" : ""}`}><div className="relative overflow-hidden rounded-xl bg-neutral-950 p-2 shadow-[0_0_40px_-12px_#4ade80]">
        <div key={`scan${gameId}`} className="q-scan pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-green-400 shadow-[0_0_12px_2px_#4ade80]" aria-hidden />
        <div key={gameId} className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} onContextMenu={(e) => e.preventDefault()}>
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
                  : "q-boot bg-neutral-800 transition hover:scale-105 hover:bg-neutral-700 active:scale-95"
              }`}
              style={{ animationDelay: `${c.open ? (c.virus ? 0 : delay(i)) : boot(i)}ms` }}
              aria-label={c.open ? (c.virus ? "virus" : `${c.n}`) : c.flag ? "quarantined" : "unscanned"}
            >
              {c.flag && !(c.open && c.virus) ? (
                <ShieldCheck key="f" className={`h-5 w-5 text-green-400 drop-shadow-[0_0_6px_#4ade80] ${status === "won" ? "q-celebrate" : "q-pop"}`} style={status === "won" ? { animationDelay: `${boot(i)}ms` } : undefined} aria-hidden />
              ) : c.open ? (
                c.virus ? <Bug className={`h-5 w-5 text-red-300 ${i === hit ? "q-pulse" : "q-pop"}`} style={{ animationDelay: `${delay(i)}ms` }} aria-hidden /> : c.n > 0 && <span className={`q-pop ${NUM_COLORS[c.n]}`} style={{ animationDelay: `${delay(i)}ms` }}>{c.n}</span>
              ) : null}
            </button>
          ))}
        </div>
        </div>
        {over && (
          <div className="q-fade absolute inset-0 grid place-items-center rounded-xl bg-black/70 backdrop-blur-sm" style={{ animationDelay: status === "won" ? "0.9s" : "0.6s" }}>
            <div className="q-pop text-center" style={{ animationDelay: status === "won" ? "1s" : "0.7s" }}>
              <p className={`font-mono text-2xl font-extrabold ${status === "won" ? "text-green-400" : "text-red-400"}`}>
                {status === "won" ? "> SYSTEM SECURED" : "> SYSTEM INFECTED"}
              </p>
              <p className="mt-2 text-sm text-neutral-300">
                {status === "won" ? `All ${viruses} viruses quarantined in ${fmt(finalMs)}.` : "A virus got loose. Try again?"}
              </p>
              {status === "won" && submit !== "done" && (
                <form onSubmit={submitScore} className="mt-4 flex justify-center gap-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={16}
                    placeholder="Your name"
                    aria-label="Your name for the leaderboard"
                    className="w-36 rounded-lg border border-neutral-700 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-green-400"
                  />
                  <button disabled={!name.trim() || submit === "sending"} className="rounded-lg border border-green-400 px-3 py-2 text-sm font-semibold text-green-300 hover:bg-green-400/10 disabled:opacity-40">
                    {submit === "sending" ? "Saving…" : "Submit"}
                  </button>
                </form>
              )}
              {submit === "done" && <p className="q-pop mt-3 text-sm text-green-300">{mine ? `You placed #${board![level].indexOf(mine) + 1}!` : "Saved, but not fast enough for the top 10."}</p>}
              {submit === "error" && <p className="mt-3 text-sm text-red-400">Couldn't save your score. Try again in a moment.</p>}
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
    <Leaderboard level={level} board={board} mine={mine} />
    </div>
  );
}
