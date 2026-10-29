import { t as tr } from "../i18n/language";
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
// Same rule the server applies (deploy/leaderboard.mjs), so what you type is what gets saved.
const cleanName = (s: string) => s.replace(/[^\p{L}\p{N} ._-]/gu, "").slice(0, 16);

type SubmitState =
  | { kind: "idle" | "sending" }
  | { kind: "done"; rank: number }
  | { kind: "error"; message: string };

function errorMessage(status: number, body: { error?: string; retryIn?: number }) {
  if (status === 429) return `Someone on your network just saved a score. Try again in ${body.retryIn ?? 10} seconds.`;
  if (body.error === "name") return tr("Add a name using letters, numbers, spaces, or . - _");
  if (body.error === "time") return tr("This time didn't pass the leaderboard's check, so it wasn't saved.");
  return tr("Couldn't reach the leaderboard. Check your connection and try again.");
}

function Leaderboard({ level, board, mine }: { level: Level; board: Board | null; mine: number }) {
  const list = board?.[level] ?? [];
  return (
    <aside className="q-rise w-full rounded-xl border border-neutral-800 bg-neutral-950/80 p-5 lg:w-72" style={{ animationDelay: "0.5s" }}>
      <h2 className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wide text-white">
        <Trophy className="h-4 w-4 text-yellow-300" aria-hidden />{tr("Leaderboard")}<span className="ml-auto text-xs font-normal text-green-400">{level}</span>
      </h2>
      {board === null ? (
        <p className="mt-4 text-sm text-neutral-500">{tr("Loading scores…")}</p>
      ) : list.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">No {level}{tr("scores yet. Win a game to claim #1.")}</p>
      ) : (
        <ol className="mt-4 space-y-1 font-mono text-sm">
          {list.map((s, k) => {
            const me = k === mine;
            return (
              <li
                key={`${s.name}|${s.ms}|${s.date}`}
                className={`q-rise flex items-center gap-3 rounded-md px-2 py-1.5 ${me ? "bg-green-400/15 text-green-300 ring-1 ring-green-400/50" : "text-neutral-300"}`}
                style={{ animationDelay: `${k * 50}ms` }}
              >
                <span className={`w-5 text-right ${k === 0 ? "text-yellow-300" : k === 1 ? "text-slate-200" : k === 2 ? "text-orange-400" : "text-neutral-600"}`}>{k + 1}</span>
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
  const [mine, setMine] = useState(-1);
  const [name, setName] = useState(() => {
    try { return cleanName(localStorage.getItem(NAME_KEY) ?? ""); } catch { return ""; }
  });
  const [submit, setSubmit] = useState<SubmitState>({ kind: "idle" });
  const startedAt = useRef(0);

  useEffect(() => {
    fetch(API).then((r) => r.json()).then(setBoard).catch(() => setBoard({ easy: [], medium: [], hard: [] }));
  }, []);

  async function submitScore(e: React.FormEvent) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean || submit.kind === "sending") return;
    setSubmit({ kind: "sending" });
    try { localStorage.setItem(NAME_KEY, clean); } catch { /* storage unavailable */ }
    let r: Response;
    try {
      r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: clean, level, ms: finalMs }) });
    } catch {
      return setSubmit({ kind: "error", message: errorMessage(0, {}) });
    }
    const body = await r.json().catch(() => ({}));
    if (!r.ok) return setSubmit({ kind: "error", message: errorMessage(r.status, body) });
    setBoard(body.board);
    setMine(body.rank);
    setSubmit({ kind: "done", rank: body.rank });
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
    setSubmit({ kind: "idle" });
    setMine(-1);
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
        setFinalMs(Math.round(performance.now() - startedAt.current));
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
          <span className="flex items-center gap-1.5 text-red-400" title="Viruses left to quarantine" aria-label={`${viruses - flags} viruses left`}><Bug className="h-4 w-4" aria-hidden /><span key={flags} className="q-pop inline-block">{viruses - flags}</span></span>
          <span className="flex items-center gap-1.5 text-neutral-300"><Timer className="h-4 w-4" aria-hidden /><span className="tabular-nums">{over ? fmt(finalMs) : `${time}s`}</span></span>
          <button
            onClick={() => setFlagMode(!flagMode)}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs ${flagMode ? "border-green-400 bg-green-400/15 text-green-300" : "border-neutral-700 text-neutral-400"}`}
            aria-pressed={flagMode}
          >
            <Shield className="h-3.5 w-3.5" aria-hidden />{tr("Quarantine mode")}</button>
          <button onClick={() => reset()} className="rounded-md border border-neutral-700 p-1.5 text-neutral-300 hover:text-white" aria-label="New game">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {over && (
        <section
          aria-live="polite"
          className={`q-rise mb-4 flex w-full max-w-3xl flex-wrap items-center gap-x-6 gap-y-4 rounded-xl border p-4 ${status === "won" ? "border-green-400/40 bg-green-400/5" : "border-red-400/40 bg-red-500/5"}`}
          style={{ animationDelay: status === "won" ? "0.8s" : "0.5s" }}
        >
          <div className="min-w-0 flex-1 basis-56">
            <p className={`font-mono text-xl font-extrabold ${status === "won" ? "text-green-400" : "text-red-400"}`}>
              {status === "won" ? tr("> SYSTEM SECURED") : tr("> SYSTEM INFECTED")}
            </p>
            <p className="mt-1 text-sm text-neutral-300">
              {status === "won"
                ? `All ${viruses} viruses quarantined in ${fmt(finalMs)}.`
                : `A virus got loose after ${fmt(finalMs)}. The bright red cell is the one you scanned.`}
            </p>
            <div>
              {submit.kind === "done" && (
                <p className="q-pop mt-2 text-sm text-green-300">
                  {submit.rank >= 0
                    ? `Saved. You're #${submit.rank + 1} on the ${level} board.`
                    : `Saved, but it didn't make the top 10. Beat ${fmt(board![level][board![level].length - 1].ms)} to get on the board.`}
                </p>
              )}
              {submit.kind === "error" && <p className="mt-2 text-sm text-red-400">{submit.message}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            {status === "won" && submit.kind !== "done" && (
              <form onSubmit={submitScore}>
                <label htmlFor="q-name" className="block text-xs text-neutral-400">{tr("Name on the")}{level}{"leaderboard"}</label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    id="q-name"
                    value={name}
                    onChange={(e) => setName(cleanName(e.target.value))}
                    maxLength={16}
                    placeholder="e.g. Zoë"
                    autoComplete="nickname"
                    className="w-36 rounded-lg border border-neutral-700 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-green-400"
                  />
                  <button disabled={!name.trim() || submit.kind === "sending"} className="rounded-lg border border-green-400 px-3 py-2 text-sm font-semibold text-green-300 hover:bg-green-400/10 disabled:opacity-40">
                    {submit.kind === "sending" ? tr("Saving…") : tr("Save score")}
                  </button>
                </div>
              </form>
            )}
            <button onClick={() => reset()} className="rounded-lg bg-green-400 px-4 py-2 text-sm font-semibold text-black hover:bg-green-300">{tr("Play again")}</button>
          </div>
        </section>
      )}

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
      </div>
      <p className="mt-4 text-center text-sm text-neutral-500">{tr("Click to scan a file. Right-click, long-press, or use Quarantine mode to lock down a suspected virus with our shield.")}</p>
    </div>
    <Leaderboard level={level} board={board} mine={mine} />
    </div>
  );
}
