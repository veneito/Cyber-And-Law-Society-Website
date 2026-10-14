import { useCallback, useEffect, useState } from "react";
import { Decoders } from "./Decoders";
import { Hack, type HackState } from "./Hack";
import { Sonar } from "./Sonar";

const CRIMES = [
  "Evil-twin Wi-Fi",
  "Credential resale",
  "Ransomware attack",
  "Insider blackmail",
  "Payout laundering",
  "Cover-up and framing",
];

type TeamState = {
  name: string; startedAt: number | null; endsAt: number | null; score: number;
  phase: "photo" | "sonar" | "drive" | "ciphers"; found: boolean;
  solved: Record<string, string>; lockedFor: number; accused: boolean;
  ciphers: { text: string }[]; hack: HackState | null;
};
type Row = { name: string; score: number; solved: number; accused: boolean };

const CODE_KEY = "case-code";
const SIG_FILE = "wellington.sig";
const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

async function api(path: string, body?: unknown) {
  const r = await fetch(`/api/case/${path}`, body ? { method: "POST", body: JSON.stringify(body) } : undefined);
  return { status: r.status, data: await r.json() };
}

const btn = "rounded-lg bg-green-400 px-5 py-2 font-semibold text-black hover:bg-green-300 disabled:opacity-40";
const ghost = "rounded-lg border border-neutral-700 px-4 py-2 text-sm text-white hover:border-green-400 disabled:opacity-40";
const field = "min-w-0 flex-1 rounded-lg border border-neutral-700 bg-black px-3 py-2 text-sm text-white";
const h2 = "font-mono text-sm uppercase tracking-wide text-white";

function Scoreboard() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    const load = () => api("scoreboard").then((r) => r.status === 200 && setRows(r.data)).catch(() => {});
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <ol className="mt-3 divide-y divide-neutral-800 rounded-xl border border-neutral-800 text-sm">
      {rows.length === 0 && <li className="p-3 text-neutral-500">No teams yet.</li>}
      {rows.map((r, i) => (
        <li key={r.name} className="flex justify-between p-3">
          <span className="text-neutral-300">{i + 1}. {r.name}{r.accused && " ✓"}</span>
          <span className="font-mono text-green-400">{r.score} <span className="text-neutral-600">({r.solved}/6)</span></span>
        </li>
      ))}
    </ol>
  );
}

function Gate({ onCode }: { onCode: (c: string) => void }) {
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  const go = async () => {
    const code = v.trim();
    const { status } = await api("start", { code });
    if (status === 200) onCode(code);
    else setErr(status === 503 ? "Case not open yet." : "Unknown team code.");
  };
  return (
    <div className="mt-8">
      <p className="text-neutral-400">Enter your team code to start. Your 90 minutes begin when you do.</p>
      <div className="mt-3 flex max-w-md gap-2">
        <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} placeholder="TEAM CODE" className={`${field} font-mono`} />
        <button onClick={go} className={btn}>Start</button>
      </div>
      {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
    </div>
  );
}

function PhotoStep({ send, over }: { send: (route: string, body: object) => Promise<boolean>; over: boolean }) {
  const [v, setV] = useState("");
  return (
    <>
      <h2 className={h2}>Step 1: Last photo of Bea</h2>
      <p className="mt-2 text-sm text-neutral-400">
        Where was this taken? Download the <strong className="text-white">original file</strong>; screenshots and
        photos sent through chat apps lose the hidden data. Then upload it to{" "}
        <a href="https://www.pic2map.com" target="_blank" rel="noreferrer" className="text-green-300 hover:underline">pic2map.com</a>.
      </p>
      <img src="/case/evidence-01.jpg" alt="Last known photo of Bea F. Wellington" className="mt-4 w-full max-w-2xl rounded-xl border border-neutral-800" />
      <a href="/case/evidence-01.jpg" download className={`${ghost} mt-3 inline-block`}>Download original</a>
      <p className="mt-8 text-white">What is the name of the building where this photo was taken?</p>
      <div className="mt-3 flex max-w-md gap-2">
        <input value={v} disabled={over} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send("building", { answer: v })} placeholder="Building name" className={field} />
        <button onClick={() => send("building", { answer: v })} disabled={over} className={btn}>Submit</button>
      </div>
    </>
  );
}

// Browsers cannot see a USB plug-in, so "inserting the drive" means picking its folder or file.
function DriveStep({ onSig }: { onSig: (sig: string) => void }) {
  const [text, setText] = useState("");
  const pickFolder = async () => {
    try {
      // @ts-expect-error File System Access API, desktop Chrome/Edge only
      const dir = await window.showDirectoryPicker();
      const file = await (await dir.getFileHandle(SIG_FILE)).getFile();
      onSig(await file.text());
    } catch { /* cancelled, or no signature file on that drive */ }
  };
  const pickFile = async (f?: File) => f && onSig(await f.text());
  const canFolder = "showDirectoryPicker" in window;
  return (
    <>
      <h2 className={h2}>Step 3: The drive</h2>
      <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <p className="font-mono text-xs text-neutral-500">LOCKED</p>
        <p className="mt-1 text-white">Requires Bea F. Wellington&apos;s digital signature.</p>
        <p className="mt-1 text-sm text-neutral-400">Plug in the flash drive you found, then insert it here.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {canFolder && <button onClick={pickFolder} className={btn}>Insert drive</button>}
          <label className={`${ghost} cursor-pointer`}>
            {canFolder ? "or choose the signature file" : `Choose ${SIG_FILE} from the drive`}
            <input type="file" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSig(text)}
            placeholder="No laptop? Type the signature code" className={field} />
          <button onClick={() => onSig(text)} className={ghost}>Submit</button>
        </div>
      </div>
    </>
  );
}

function CipherStep({ t, send, over }: { t: TeamState; send: (route: string, body: object) => Promise<boolean>; over: boolean }) {
  const [answers, setAnswers] = useState<string[]>(Array(CRIMES.length).fill(""));
  const [picks, setPicks] = useState<Record<number, number | "">>({});
  return (
    <>
      <h2 className={h2}>Step 4: Evidence</h2>
      <ol className="mt-4 space-y-3">
        {CRIMES.map((c, i) => (
          <li key={c} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-xs text-neutral-500">EVIDENCE {i + 1}</span>
              <span className="font-mono text-xs text-neutral-600">{t.solved[i] ? "SOLVED" : "LOCKED"}</span>
            </div>
            {t.solved[i] ? (
              <p className="mt-1 text-neutral-300">{t.solved[i]}</p>
            ) : (
              <>
                {t.ciphers[i] && <p className="mt-2 break-words font-mono text-lg tracking-wide text-green-300" style={{ fontVariantEmoji: "text" }}>{t.ciphers[i].text}</p>}
                <div className="mt-2 flex gap-2">
                  <input value={answers[i]} disabled={over}
                    onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))}
                    onKeyDown={(e) => e.key === "Enter" && send("answer", { stage: i, answer: answers[i] })}
                    placeholder="Decoded message" className={field} />
                  <button onClick={() => send("answer", { stage: i, answer: answers[i] })} disabled={over} className={ghost}>Submit</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>

      <h2 className={`${h2} mt-12`}>Accusation</h2>
      {t.accused ? (
        <p className="mt-3 text-green-300">Bea F. Wellington is accused of all crimes.</p>
      ) : (
        <>
          <p className="mt-2 text-sm text-neutral-400">Tick each crime and attach its evidence. A wrong pairing costs 10 points.</p>
          <ul className="mt-4 space-y-2">
            {CRIMES.map((c, i) => (
              <li key={c} className="flex flex-wrap items-center gap-3 text-sm">
                <input type="checkbox" checked={i in picks} disabled={over}
                  onChange={(e) => setPicks((p) => { const n = { ...p }; if (e.target.checked) n[i] = ""; else delete n[i]; return n; })} />
                <span className="w-44 text-neutral-300">{c}</span>
                {i in picks && (
                  <select value={picks[i]} onChange={(e) => setPicks((p) => ({ ...p, [i]: e.target.value === "" ? "" : Number(e.target.value) }))}
                    className="rounded border border-neutral-700 bg-black px-2 py-1 text-neutral-300">
                    <option value="">Attach evidence...</option>
                    {Object.keys(t.solved).map((k) => <option key={k} value={k}>Evidence {Number(k) + 1}</option>)}
                  </select>
                )}
              </li>
            ))}
          </ul>
          <button onClick={() => send("accuse", { picks: Object.fromEntries(Object.entries(picks).filter(([, v]) => v !== "")) })}
            disabled={over || Object.keys(picks).length === 0} className={`${btn} mt-4`}>Accuse</button>
        </>
      )}
    </>
  );
}

function Game({ code, onLeave }: { code: string; onLeave: () => void }) {
  const [t, setT] = useState<TeamState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [seenAt, setSeenAt] = useState(0);
  const [msg, setMsg] = useState("");

  const apply = useCallback((d: TeamState) => { setT(d); setSeenAt(Date.now()); }, []);
  const poll = useCallback(async () => {
    const r = await api("state?code=" + encodeURIComponent(code));
    if (r.status !== 200) return;
    // A remembered code with no server-side start (e.g. progress was reset) starts the clock instead of showing TIME UP.
    apply(r.data.startedAt ? r.data : (await api("start", { code })).data);
  }, [code, apply]);
  useEffect(() => {
    poll();
    const i = setInterval(poll, 4000); // also how a random hack reaches the player
    return () => clearInterval(i);
  }, [poll]);
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);

  const onPing = useCallback(async (x: number, y: number) => {
    const r = await api("ping", { code, x, y });
    return r.status === 200 ? (r.data as { strength: number; found: boolean }) : null;
  }, [code]);

  if (!t) return null;
  const left = t.endsAt ? t.endsAt - now : 0;
  const over = left <= 0;
  const lock = t.lockedFor && Math.max(0, t.lockedFor - Math.floor(Math.max(0, now - seenAt) / 1000)); // now can lag seenAt

  // Sends a game action; returns whether the server accepted it.
  const send = async (route: string, body: object) => {
    const { status, data } = await api(route, { code, ...body });
    if (data.name) apply(data);
    const ok = data.ok !== false && status === 200;
    const text: Record<string, [string, string]> = {
      building: ["Correct. Moving on.", "Wrong building. Locked out for a moment."],
      unlock: ["Signature accepted.", "Signature rejected. Locked out for a moment."],
      answer: [`Decoded.${data.points ? ` +${data.points} points` : ""}`, "Wrong. Locked out for a moment."],
      accuse: ["Accusation correct. +300 points", `Not quite: ${data.wrong ?? 0} wrong pairing(s), -10 each.`],
      key: ["Key obtained.", "No key yet."],
    };
    setMsg(status === 410 ? "Time is up." : status === 423 ? "" : status === 429 ? "Locked out. Wait." : (text[route]?.[ok ? 0 : 1] ?? ""));
    return ok;
  };

  const solveHack = async (solution: string | string[]) => {
    const { data } = await api("hack", { code, solution });
    if (data.name) apply(data);
    if (data.ok) setMsg(data.delta ? `Back in. ${data.delta > 0 ? "+" : ""}${data.delta} points` : "Back in.");
    return !!data.ok;
  };

  return (
    <div className={`mt-8 grid gap-8 ${t.phase === "ciphers" ? "lg:grid-cols-[16rem_1fr_18rem]" : "lg:grid-cols-[1fr_18rem]"}`}>
      {t.phase === "ciphers" && <div className="order-2 lg:order-none"><Decoders /></div>}
      <section className="order-1 min-w-0 lg:order-none">
        {msg && <p className="mb-4 font-mono text-sm text-green-300">{msg}</p>}
        {lock > 0 && <p className="mb-4 text-sm text-red-400">Locked out for {lock}s after the last wrong answer.</p>}
        {t.phase === "photo" && <PhotoStep send={send} over={over} />}
        {t.phase === "sonar" && (
          <>
            <h2 className={h2}>Step 2: Last known location</h2>
            <p className="mt-2 mb-4 text-sm text-neutral-400">Find the exact spot in the building. The signal grows stronger as you get closer.</p>
            <Sonar onPing={onPing} onKey={() => send("key", {})} />
          </>
        )}
        {t.phase === "drive" && <DriveStep onSig={(sig) => send("unlock", { sig })} />}
        {t.phase === "ciphers" && <CipherStep t={t} send={send} over={over} />}
      </section>
      <aside className="order-first lg:order-none">
        <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div>
            <p className="font-mono text-xs text-neutral-500">{t.name} <button onClick={onLeave} className="ml-2 underline hover:text-white">switch team</button></p>
            <p className="font-mono text-2xl text-green-400">{t.score} pts</p>
          </div>
          <p className={`font-mono text-2xl ${over ? "text-red-400" : "text-white"}`}>{over ? "TIME UP" : clock(left)}</p>
        </div>
        <h2 className={`${h2} mt-6`}>Leaderboard</h2>
        <Scoreboard />
      </aside>
      {t.hack && !over && <Hack key={t.hack.issuedAt} hack={t.hack} onSolve={solveHack} />}
    </div>
  );
}

export function CasePage() {
  const [code, setCode] = useState(() => { try { return localStorage.getItem(CODE_KEY) ?? ""; } catch { return ""; } });
  const set = (c: string) => { try { localStorage.setItem(CODE_KEY, c); } catch { /* private mode */ } setCode(c); };
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <a href="/activities" className="font-mono text-xs text-neutral-500 hover:text-white">&larr; Activities</a>
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-green-400">Case file</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Bea F. Wellington</h1>
      {code ? <Game code={code} onLeave={() => set("")} /> : <Gate onCode={set} />}
    </main>
  );
}
