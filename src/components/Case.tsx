import { useCallback, useEffect, useState } from "react";
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
  solved: Record<string, string>; lockedFor: number; accused: boolean; unlocked: boolean;
  ciphers: { type: string; text: string; hint: string }[];
};
type Row = { name: string; score: number; solved: number; accused: boolean };

const CODE_KEY = "case-code";
const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

async function api(path: string, body?: unknown) {
  const r = await fetch(`/api/case/${path}`, body ? { method: "POST", body: JSON.stringify(body) } : undefined);
  return { status: r.status, data: await r.json() };
}

function Scoreboard() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    const load = () => api("scoreboard").then((r) => r.status === 200 && setRows(r.data)).catch(() => {});
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <ol className="mt-4 divide-y divide-neutral-800 rounded-xl border border-neutral-800 text-sm">
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
      <div className="mt-3 flex gap-2">
        <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="TEAM CODE" className="rounded-lg border border-neutral-700 bg-black px-3 py-2 font-mono text-white" />
        <button onClick={go} className="rounded-lg bg-green-400 px-5 py-2 font-semibold text-black hover:bg-green-300">Start</button>
      </div>
      {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
    </div>
  );
}

const SIG_FILE = "wellington.sig";

// Browsers cannot see a USB plug-in, so "inserting the drive" means picking its folder or file.
function DriveGate({ onSig }: { onSig: (sig: string) => void }) {
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
    <div className="mt-12 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <p className="font-mono text-xs text-neutral-500">LOCKED</p>
      <p className="mt-1 text-white">Requires Bea F. Wellington&apos;s digital signature.</p>
      <p className="mt-1 text-sm text-neutral-400">Plug in the flash drive you found, then insert it here.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {canFolder && <button onClick={pickFolder} className="rounded-lg bg-green-400 px-5 py-2 font-semibold text-black hover:bg-green-300">Insert drive</button>}
        <label className="cursor-pointer rounded-lg border border-neutral-700 px-4 py-2 text-sm text-white hover:border-green-400">
          {canFolder ? "or choose the signature file" : `Choose ${SIG_FILE} from the drive`}
          <input type="file" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSig(text)}
          placeholder="No laptop? Type the signature code" className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-black px-3 py-2 text-sm text-white" />
        <button onClick={() => onSig(text)} className="rounded-lg border border-neutral-700 px-4 text-sm text-white hover:border-green-400">Submit</button>
      </div>
    </div>
  );
}

function Team({ code }: { code: string }) {
  const [t, setT] = useState<TeamState | null>(null);
  const [now, setNow] = useState(Date.now());
  const [msg, setMsg] = useState("");
  const [answers, setAnswers] = useState<string[]>(Array(CRIMES.length).fill(""));
  const [picks, setPicks] = useState<Record<number, number | "">>({});

  const apply = useCallback((d: TeamState) => { setT(d); setNow(Date.now()); }, []);
  useEffect(() => { api("state?code=" + encodeURIComponent(code)).then((r) => r.status === 200 && apply(r.data)); }, [code, apply]);
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);

  if (!t) return null;
  const left = t.endsAt ? t.endsAt - now : 0;
  const over = left <= 0;

  const submit = async (stage: number) => {
    const { status, data } = await api("answer", { code, stage, answer: answers[stage] });
    if (data.name) apply(data);
    setMsg(data.ok ? `Evidence ${stage + 1} decoded. +${data.points} points` : status === 410 ? "Time is up." : status === 429 ? "Locked out. Wait." : "Wrong. Locked out for a moment.");
  };
  const unlock = async (sig: string) => {
    const { data } = await api("unlock", { code, sig });
    if (data.name) apply(data);
    setMsg(data.ok ? "Signature accepted. Investigation unlocked." : "Signature rejected. Locked out for a moment.");
  };
  const accuse = async () => {
    const chosen = Object.fromEntries(Object.entries(picks).filter(([, v]) => v !== ""));
    const { data } = await api("accuse", { code, picks: chosen });
    if (data.name) apply(data);
    setMsg(data.ok ? "Accusation correct. +300 points" : `Not quite: ${data.wrong ?? 0} wrong pairing(s), -10 each.`);
  };

  return (
    <>
      <div className="mt-6 flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
        <div>
          <p className="font-mono text-xs text-neutral-500">{t.name}</p>
          <p className="font-mono text-2xl text-green-400">{t.score} pts</p>
        </div>
        <p className={`font-mono text-2xl ${over ? "text-red-400" : "text-white"}`}>{over ? "TIME UP" : clock(left)}</p>
      </div>
      {msg && <p className="mt-3 font-mono text-sm text-green-300">{msg}</p>}
      {t.lockedFor > 0 && <p className="mt-1 text-sm text-red-400">Locked out for {t.lockedFor}s after the last wrong answer.</p>}

      {!t.unlocked ? <DriveGate onSig={unlock} /> : <>
      <h2 className="mt-12 font-mono text-sm uppercase tracking-wide text-white">Evidence</h2>
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
              {t.ciphers[i] && (
                <div className="mt-2">
                  <p className="break-words font-mono text-lg tracking-wide text-green-300" style={{ fontVariantEmoji: "text" }}>{t.ciphers[i].text}</p>
                  <p className="mt-1 text-xs text-neutral-500">{t.ciphers[i].hint}</p>
                </div>
              )}
              <div className="mt-2 flex gap-2">
                <input value={answers[i]} disabled={over}
                  onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))}
                  onKeyDown={(e) => e.key === "Enter" && submit(i)}
                  placeholder="Decoded message" className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-black px-3 py-2 text-sm text-white" />
                <button onClick={() => submit(i)} disabled={over} className="rounded-lg border border-neutral-700 px-4 text-sm text-white hover:border-green-400 disabled:opacity-40">Submit</button>
              </div>
              </>
            )}
          </li>
        ))}
      </ol>

      <h2 className="mt-12 font-mono text-sm uppercase tracking-wide text-white">Accusation</h2>
      {t.accused ? (
        <p className="mt-3 text-green-300">Bea F. Wellington is accused of all crimes.</p>
      ) : (
        <>
          <p className="mt-2 text-sm text-neutral-400">Tick each crime and attach its evidence. A wrong pairing costs 10 points.</p>
          <ul className="mt-4 space-y-2">
            {CRIMES.map((c, i) => (
              <li key={c} className="flex items-center gap-3 text-sm">
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
          <button onClick={accuse} disabled={over || Object.keys(picks).length === 0}
            className="mt-4 rounded-lg bg-green-400 px-5 py-2 font-semibold text-black hover:bg-green-300 disabled:opacity-40">Accuse</button>
        </>
      )}
      </>}
    </>
  );
}

export function CasePage() {
  const [code, setCode] = useState(() => { try { return localStorage.getItem(CODE_KEY) ?? ""; } catch { return ""; } });
  const set = (c: string) => { try { localStorage.setItem(CODE_KEY, c); } catch { /* private mode */ } setCode(c); };
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-green-400">Case file</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Bea F. Wellington</h1>
      <p className="mt-2 text-neutral-400">Collect evidence of each crime. Every decoded message lands here.</p>

      {code ? <Team code={code} /> : <Gate onCode={set} />}

      <h2 className="mt-12 font-mono text-sm uppercase tracking-wide text-white">Scoreboard</h2>
      <Scoreboard />

      <h2 className="mt-12 font-mono text-sm uppercase tracking-wide text-white">Last photo of Bea</h2>
      <p className="mt-2 text-sm text-neutral-400">
        Where was this taken? Download the <strong className="text-white">original file</strong>; screenshots and
        photos sent through chat apps lose the hidden data. Then upload it to{" "}
        <a href="https://www.pic2map.com" target="_blank" rel="noreferrer" className="text-green-300 hover:underline">pic2map.com</a>.
      </p>
      <img src="/case/evidence-01.jpg" alt="Last known photo of Bea F. Wellington" className="mt-4 w-full max-w-2xl rounded-xl border border-neutral-800" />
      <a href="/case/evidence-01.jpg" download className="mt-3 inline-block rounded-lg border border-neutral-700 px-4 py-2 text-sm text-white hover:border-green-400">Download original</a>

      <h2 className="mt-12 font-mono text-sm uppercase tracking-wide text-white">Last known location</h2>
      <div className="mt-4"><Sonar /></div>
    </main>
  );
}
