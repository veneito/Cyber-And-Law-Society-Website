import { useEffect, useState } from "react";

export type Row = { name: string; score: number; solved: number; accused: boolean; finished: boolean; active: boolean; elapsed: number };
type Board = { rows: Row[]; over: boolean };
export type Finished = {
  name: string; score: number; startedAt: number | null; finishedAt: number | null;
  pts: { base: number; time: number; hack: number; penalty: number; accuse: number };
};

export const mmss = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function useScoreboard(): Board {
  const [board, setBoard] = useState<Board>({ rows: [], over: false });
  useEffect(() => {
    const load = () => fetch("/api/case/scoreboard").then((r) => r.ok && r.json()).then((d) => d && setBoard(d)).catch(() => {});
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);
  return board;
}

const status = (r: Row) => (r.finished ? "finished" : r.active ? "playing" : "time up");

export function Leaderboard({ board, me }: { board: Board; me?: string }) {
  return (
    <ol className="mt-3 divide-y divide-green-950 overflow-hidden rounded border border-green-900/60 bg-[#030805] text-sm">
      {board.rows.length === 0 && <li className="p-3 text-neutral-500">No teams yet.</li>}
      {board.rows.map((r, i) => (
        <li key={r.name} className={`p-3 ${r.name === me ? "border-l-2 border-green-400 bg-green-950/20" : ""}`}>
          <div className="flex items-start gap-2"><span className="font-mono text-[10px] text-green-600">{String(i + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1 break-words text-xs leading-relaxed text-green-100">{r.name}{r.name === me && <span className="ml-2 text-[9px] text-green-500">YOU</span>}</span><span className="shrink-0 font-mono text-sm tabular-nums text-green-400">{r.score.toLocaleString()}</span></div>
          <div className="ml-6 mt-2 flex justify-between font-mono text-[9px] uppercase tracking-wider text-neutral-500"><span>{r.solved}/6 decoded</span><span className={r.active ? "text-green-600" : ""}>{status(r)}</span></div>
        </li>
      ))}
    </ol>
  );
}

export function Victory({ t, timeout }: { t: Finished; timeout?: boolean }) {
  const board = useScoreboard();
  const rank = board.rows.findIndex((r) => r.name === t.name) + 1;
  const winner = board.rows[0];
  const lines: [string, number][] = [
    ["Evidence decoded", t.pts.base],
    ["Time bonuses", t.pts.time],
    ["Hack puzzles", t.pts.hack],
    ["Wrong evidence", t.pts.penalty],
    ["Accusation bonus", t.pts.accuse],
  ];
  return (
    <div>
      <p className={`font-mono text-xs uppercase tracking-[0.2em] ${timeout ? "text-red-400" : "text-green-400"}`}>{timeout ? "Game over" : "Case closed"}</p>
      <h2 className="mt-2 text-3xl font-bold text-white">{timeout ? "Bea F. Wellington got away." : "Bea F. Wellington is caught."}</h2>
      <p className="mt-2 text-neutral-400">{timeout ? "Your 90 minutes are up. Here is how you did." : "Your clock is stopped. Here is how you did."}</p>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        {[["Final score", String(t.score)], ["Time", mmss((t.finishedAt ?? 0) - (t.startedAt ?? 0))], ["Place", rank ? `#${rank} of ${board.rows.length}` : "..."]].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
            <p className="font-mono text-xs text-neutral-500">{k}</p>
            <p className="mt-1 font-mono text-2xl text-green-400">{v}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-8 font-mono text-sm uppercase tracking-wide text-white">Score breakdown</h3>
      <ul className="mt-3 divide-y divide-neutral-800 rounded-xl border border-neutral-800 text-sm">
        {lines.map(([k, v]) => (
          <li key={k} className="flex justify-between p-3"><span className="text-neutral-300">{k}</span><span className={`font-mono ${v < 0 ? "text-red-400" : "text-green-400"}`}>{v > 0 ? "+" : ""}{v}</span></li>
        ))}
        <li className="flex justify-between p-3 font-semibold"><span className="text-white">Total</span><span className="font-mono text-green-400">{t.score}</span></li>
      </ul>

      <div className="mt-8 rounded-xl border border-green-500/40 bg-green-500/5 p-4">
        {board.over && winner ? (
          <p className="text-white">Event over. Winner: <strong className="text-green-300">{winner.name}</strong> with {winner.score} points{winner.name === t.name && ". That's you!"}</p>
        ) : (
          <p className="text-neutral-300">Other teams are still playing. The winner is announced when every team has finished or run out of time. Leading now: <strong className="text-green-300">{winner?.name ?? "..."}</strong>.</p>
        )}
      </div>

      <h3 className="mt-8 font-mono text-sm uppercase tracking-wide text-white">Leaderboard (live)</h3>
      <Leaderboard board={board} me={t.name} />
    </div>
  );
}
