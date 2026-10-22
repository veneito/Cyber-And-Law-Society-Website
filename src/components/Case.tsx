import { useCallback, useEffect, useRef, useState } from "react";
import { Arrest } from "./Arrest";
import { Countdown, Helix, Rain } from "./Ambient";
import { Briefing, FoundBuilding, Portrait, ToCourt, EndCall } from "./Briefing";
import { Decoders } from "./Decoders";
import { Hack, type HackState } from "./Hack";
import { Sonar } from "./Sonar";
import { soundOn, setSound } from "./sound";
import { StepDone, type StepKind } from "./StepDone";
import { LawCheck, type LawState } from "./LawCheck";
import { Gavel, preloadGavel } from "./Gavel";
import { GameOver } from "./GameOver";
import { Preview } from "./Preview";
import { playUnlock } from "./unlock";
import { CourtJudge } from "./CourtJudge";
import { PhotoRestore } from "./PhotoRestore";
import { Leaderboard, Victory, mmss, useScoreboard } from "./Victory";

// What Bea did, in cipher order. Players attach the decoded message that proves each one.
const CRIMES = [
  "Set up a fake Wi-Fi network to steal logins",
  "Sold the stolen logins to a buyer",
  "Locked the university servers for ransom",
  "Threatened an IT employee into silence",
  "Hid the ransom money trail",
  "Framed a student and wiped the logs",
];

type TeamState = {
  name: string; startedAt: number | null; endsAt: number | null; score: number;
  phase: "photo" | "sonar" | "drive" | "ciphers"; found: boolean;
  solved: Record<string, string>; lockedFor: number; accused: boolean;
  ciphers: { text: string }[]; hack: HackState | null;
  law: LawState | null; finishedAt: number | null; crimeOrder: number[]; evOrder: number[];
  pts: { base: number; time: number; hack: number; penalty: number; accuse: number };
};

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

function Scoreboard({ me }: { me: string }) {
  return <Leaderboard board={useScoreboard()} me={me} />;
}

function Gate({ onCode }: { onCode: (c: string) => void }) {
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  const [counting, setCounting] = useState(false);
  const [briefing, setBriefing] = useState(false);
  const [name, setName] = useState("");
  const [naming, setNaming] = useState(false);
  const [checking, setChecking] = useState(false);
  const go = async () => {
    if (checking || !v.trim()) return;
    setChecking(true);
    setErr("");
    // The state call checks the code without starting the clock; the clock starts once the case opens.
    try {
      const { status } = await api("state?code=" + encodeURIComponent(v.trim()));
      if (status === 200) setNaming(true);
      else setErr(status === 503 ? "Case not open yet." : "Unknown team code.");
    } catch {
      setErr("Could not check your team code. Please try again.");
    } finally {
      setChecking(false);
    }
  };
  return (
    <div className="relative mt-8 min-h-[26rem]">
      <Helix />
      <div className="relative">
        {naming ? (
          <form className="grid max-w-md gap-3" onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || briefing) return;
            setName(name.trim());
            setBriefing(true);
          }}>
            <label htmlFor="case-team-name" className="text-neutral-400">Choose your team name to begin the briefing.</label>
            <input id="case-team-name" autoFocus required value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder="Team name" className={field} disabled={briefing} />
            <button type="submit" disabled={!name.trim() || briefing} className={`${btn} justify-self-start`}>Begin briefing</button>
            <p className="text-sm text-neutral-500">Your 90 minutes begin after the intro.</p>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); void go(); }}>
            <p className="text-neutral-400">Enter your team code to continue. Your 90 minutes begin after the intro.</p>
            <div className="mt-3 flex max-w-md gap-2">
              <input aria-label="Team code" required value={v} onChange={(e) => setV(e.target.value)} placeholder="TEAM CODE" className={`${field} font-mono`} disabled={checking} />
              <button type="submit" disabled={checking || !v.trim()} className={btn}>{checking ? "Checking…" : "Continue"}</button>
            </div>
          </form>
        )}
        {err && <p role="alert" className="mt-2 text-sm text-red-400">{err}</p>}
      </div>
      {briefing && !counting && <Briefing onDone={() => setCounting(true)} />}
      {counting && <Countdown onDone={async () => { await api("start", { code: v.trim(), name }); onCode(v.trim()); }} />}
    </div>
  );
}

function PhotoStep({ send, over }: { send: (route: string, body: object) => Promise<boolean>; over: boolean }) {
  const [v, setV] = useState("");
  const [restored, setRestored] = useState(false);
  return (
    <>
      <h2 className={h2}>Step 1: Last photo of Bea</h2>
      {!restored ? <PhotoRestore disabled={over} onRestore={() => setRestored(true)} /> : <>
      <p className="mt-2 text-sm text-neutral-400">
        Where was this taken? Download the <strong className="text-white">original file</strong>; screenshots and
        photos sent through chat apps lose the hidden data. Then upload it to{" "}
        <a href="https://www.pic2map.com" target="_blank" rel="noreferrer" className="text-green-300 hover:underline">pic2map.com</a>.
      </p>
      <img src="/case/evidence-01.jpg" alt="Last known photo of Bea F. Wellington" className="mt-4 w-full max-w-md rounded-xl border border-green-400/70" />
      <a href="/case/evidence-01.jpg" download className={`${ghost} mt-3 inline-block`}>Download original</a>
      <p className="mt-8 text-white">What is the name of the building where this photo was taken?</p>
      <div className="mt-3 flex max-w-md gap-2">
        <input value={v} disabled={over} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send("building", { answer: v })} placeholder="Building name" className={field} />
        <button onClick={() => send("building", { answer: v })} disabled={over} className={btn}>Submit</button>
      </div>
      </>}
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

type Send = (route: string, body: object) => Promise<boolean>;

const wrongSound = () => { new Audio("/case/incorrect.mp3").play().catch(() => {}); };

type Mood = "happy" | "angry" | "scared" | undefined;

function CipherStep({ t, send, over, onAccuse, mood, setMood }: { t: TeamState; send: Send; over: boolean; onAccuse: () => void; mood: Mood; setMood: (m: Mood) => void }) {
  const [answers, setAnswers] = useState<string[]>(Array(CRIMES.length).fill(""));
  const [calling, setCalling] = useState(false); // Chris's call between the evidence list and the accusation
  const ready = Object.keys(t.solved).length >= CRIMES.length && !t.law && !t.accused;
  // Chris reacts to each decoded message and keeps that face until the next one.
  const submit = async (stage: number) => {
    const ok = await send("answer", { stage, answer: answers[stage] });
    setMood(ok ? "happy" : "angry");
    if (ok) new Audio("/case/correct.mp3").play().catch(() => {});
  };
  return (
    <>
      <div className="flex flex-col-reverse gap-6 md:flex-row md:items-start">
      <div className="min-w-0 flex-1">
      <div className="border-b border-green-900 pb-3"><p className="font-mono text-[9px] tracking-[0.25em] text-green-600">FORENSICS // RECOVERED TRANSMISSIONS</p><div className="mt-2 flex justify-between"><h2 className="font-serif text-xl text-green-100">Evidence dossier</h2><span className="font-mono text-xs text-green-400">{Object.keys(t.solved).length}/6 DECODED</span></div></div>
      <ol className="mt-4 space-y-3">
        {CRIMES.map((c, i) => (
          <li key={c} className="rounded border border-green-900/60 bg-[#030805] p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] tracking-widest text-green-600">EXHIBIT // 0{i + 1}</span>
              <span className={`font-mono text-[9px] tracking-widest ${t.solved[i] ? "text-green-400" : "text-amber-500"}`}>{t.solved[i] ? "✓ VERIFIED" : "ENCRYPTED"}</span>
            </div>
            {t.solved[i] ? (
              <blockquote className="mt-4 border-l-2 border-green-700 pl-3 text-sm leading-7 text-green-100/80">“{t.solved[i].toLowerCase().replace(/^./, c => c.toUpperCase())}”</blockquote>
            ) : (
              <>
                {t.ciphers[i] && <p className="mt-2 break-words font-mono text-lg tracking-wide text-green-300" style={{ fontVariantEmoji: "text" }}>{t.ciphers[i].text}</p>}
                <div className="mt-2 flex gap-2">
                  <input value={answers[i]} disabled={over}
                    onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))}
                    onKeyDown={(e) => e.key === "Enter" && submit(i)}
                    placeholder="Decoded message" className={field} />
                  <button onClick={() => submit(i)} disabled={over} className={ghost}>Submit</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
      {ready && <button onClick={() => setCalling(true)} className={`${btn} mt-8`}>Make your accusation</button>}
      </div>
      {calling && <ToCourt onDone={() => { setCalling(false); onAccuse(); }} />}
      <div className="mx-auto md:sticky md:top-6"><Portrait label="Chris P. Bacon" sub="FBI" mood={mood} /></div>
      </div>
    </>
  );
}

// Crimes Bea did not commit, mixed into the list as wrong answers (ids 100+; the server counts them as wrong pairings).
const DECOYS = [
  "Defaced the university website",
  "Planted a keylogger on the library computers",
  "Sent phishing emails posing as the bursar's office",
];
const crimeText = (id: number) => (id >= 100 ? DECOYS[id - 100] : CRIMES[id]);

// Its own screen, reached from the evidence list once all six messages are decoded.
// Pick a crime from the list (some are wrong), attach the decoded message that proves it, come back, repeat, then review and accuse.
function AccuseStep({ t, send, over, onBack }: { t: TeamState; send: Send; over: boolean; onBack: () => void; mood: Mood }) {
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [view, setView] = useState<"list" | "review" | number>("list"); // a number is the crime being charged
  const [judgeReaction, setJudgeReaction] = useState(0);
  const [judgeSmacks, setJudgeSmacks] = useState(false);
  const list = [...t.crimeOrder];
  DECOYS.forEach((_, d) => list.splice((t.crimeOrder[d] * 3 + d * 2 + 1) % (list.length + 1), 0, 100 + d)); // stable per team
  const filed = Object.keys(picks).length;
  const usedBy = (k: number) => Object.keys(picks).map(Number).find((c) => picks[c] === k);
  const card = "rounded border border-green-900/60 bg-black/80 p-4";
  const attach = (crime: number, k: number) => { setPicks((p) => ({ ...p, [crime]: k })); if (crime === k && k in t.solved) { setJudgeSmacks(true); setJudgeReaction(n => n + 1); } setView("list"); };
  const detach = (crime: number) => { setPicks((p) => { const q = { ...p }; delete q[crime]; return q; }); setView("list"); };
  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-[#020604] p-4 sm:p-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
      <aside className="order-2 self-start rounded border border-green-700/50 bg-black p-4 lg:sticky lg:top-4 lg:order-1">
        <pre aria-hidden className="text-center font-mono text-xs text-green-500">{"       ╭─── CASE FILE ───╮\n╔══════╧════════════════╧══════╗"}</pre>
        <h2 className="mt-3 text-center font-mono text-xs tracking-widest text-green-300">DECODED EVIDENCE</h2>
        <p className="mt-2 text-center text-[10px] text-neutral-500">{typeof view === "number" ? "Select a message to attach to this charge." : "Your recovered messages. Use these to support each charge."}</p>
        <div className="mt-4 space-y-3">{t.evOrder.filter(k => k in t.solved).map(k => {
          const owner = usedBy(k); const taken = owner !== undefined && owner !== view;
          return <button key={k} disabled={typeof view !== "number" || over || taken} onClick={() => { if(typeof view === "number") attach(view,k); }} className="w-full border-l-2 border-green-800 bg-green-950/10 p-3 text-left enabled:hover:border-green-300 disabled:cursor-default">
            <span className="font-mono text-[9px] tracking-widest text-green-600">EXHIBIT {String(k+1).padStart(2,"0")} {owner !== undefined ? "// FILED" : ""}</span>
            <span className="mt-2 block font-mono text-xs leading-relaxed text-green-200/80">{t.solved[k]}</span>
          </button>;
        })}</div>
        <pre aria-hidden className="mt-4 text-center font-mono text-xs text-green-500">{"╚═════════════════════════════╝"}</pre>
      </aside>
      <div className="order-1 min-w-0 lg:order-2">
        <button onClick={view === "list" ? onBack : () => setView("list")} className="font-mono text-xs text-neutral-500 hover:text-white">
          &larr; {view === "list" ? "Back to evidence" : "Back to the crimes"}
        </button>
        <h2 className={`${h2} my-3`}>Accusation hearing</h2>
        <CourtJudge reaction={judgeReaction || null} smacks={judgeSmacks}>{view === "list" ? "Counsel, what offenses do you accuse the defendant of committing? Select a charge, then attach the decoded message that supports it." : view === "review" ? "Present your final charges to the court. Is every accusation supported by the evidence?" : `You accuse Bea F. Wellington of the following: “${crimeText(view)}.” Which decoded message proves this charge, counsel?`}</CourtJudge>
        {t.accused ? (
          <p className="mt-3 text-green-300">Bea F. Wellington is accused of all crimes.</p>
        ) : view === "list" ? (
          <>
            <p className="mt-2 text-sm text-neutral-400">Choose the specific crime you wish to accuse Bea of. The court requires a decoded message for every charge; unsupported allegations must not be filed.</p>
            <ul className="mt-4 space-y-2">
              {list.map((c) => (
                <li key={c}>
                  <button onClick={() => { setView(c); setJudgeSmacks(false); setJudgeReaction(n => n + 1); }} disabled={over} className={`${card} w-full text-left hover:border-green-400 disabled:opacity-40 ${c in picks ? "border-green-400/60" : ""}`}>
                    <span className="text-sm text-white">{crimeText(c)}</span>
                    {c in picks && <p className="mt-1 text-sm text-green-300">{t.solved[picks[c]]}</p>}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-xs text-neutral-500">{filed} charge{filed === 1 ? "" : "s"} filed</p>
            <button onClick={() => setView("review")} disabled={filed === 0} className={`${btn} mt-2`}>Present charges to the judge</button>
          </>
        ) : view === "review" ? (
          <>
            <p className="mt-2 text-sm text-neutral-400">Your case. Check each charge, then accuse. A wrong pairing, or a crime she did not commit, costs 10 points.</p>
            <ul className="mt-4 space-y-2">
              {Object.keys(picks).map(Number).map((c) => (
                <li key={c} className={card}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm text-white">{crimeText(c)}</span>
                    <button onClick={() => { setView(c); setJudgeSmacks(false); setJudgeReaction(n => n + 1); }} className="shrink-0 font-mono text-xs text-neutral-500 hover:text-white">change</button>
                  </div>
                  <p className="mt-1 text-sm text-green-300">{t.solved[picks[c]]}</p>
                </li>
              ))}
            </ul>
            <button onClick={() => send("accuse", { picks })} disabled={over || filed === 0}
              className="group relative mt-6 mb-8 flex w-full items-center gap-4 overflow-hidden rounded-lg border border-orange-500/70 bg-gradient-to-r from-orange-950/60 to-black px-5 py-5 text-left transition hover:border-orange-300 hover:shadow-[0_0_24px_#f9731622] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300 active:translate-y-px disabled:opacity-40">
              <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-orange-500/40 bg-black/50 text-orange-300"><svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m8 7 5-5 9 9-5 5-9-9Zm7 7-9 9m-2 3h16m-18 3h20M22 4l4 4M7 6l-3 3" /></svg></span>
              <span className="min-w-0 flex-1"><span className="block font-mono text-[9px] tracking-[0.2em] text-orange-600">COURT RECORD // FINAL SUBMISSION</span><span className="mt-1 block font-mono text-lg font-semibold tracking-wider text-orange-100 sm:text-xl">File accusation</span><span className="mt-1 block text-xs text-orange-200/50">Present {filed} supported charge{filed === 1 ? "" : "s"} to the judge</span></span>
              <span aria-hidden className="font-mono text-2xl text-orange-400 transition-transform group-enabled:group-hover:translate-x-1">↗</span>
              <span aria-hidden className="absolute bottom-0 left-0 h-px w-1/3 bg-orange-300/70" />
            </button>
          </>
        ) : (
          <>
            <p className="mt-4 font-mono text-xs text-neutral-500">CHARGE</p>
            <div className={`${card} mt-2 border-amber-300/50`}>
              <p className="text-lg text-white">{crimeText(view)}</p>
              <p className="mt-1 text-sm text-neutral-400">Which decoded message proves it?</p>
            </div>
            <div className="mt-4 grid gap-2">
              {t.evOrder.filter((k) => k in t.solved).map((k) => {
                const other = usedBy(k);
                const taken = other !== undefined && other !== view;
                return (
                  <button key={k} onClick={() => attach(view, k)} disabled={over || taken}
                    className={`${card} text-left text-sm text-neutral-200 hover:border-green-400 disabled:opacity-40 ${picks[view] === k ? "border-green-400" : ""}`}>
                    {t.solved[k]}
                    {taken && <span className="ml-2 font-mono text-xs text-neutral-500">(used for another charge)</span>}
                  </button>
                );
              })}
            </div>
            {view in picks && <button onClick={() => detach(view)} className="mt-4 text-sm text-neutral-500 hover:text-white">Remove this charge</button>}
          </>
        )}
      </div>
      </div>
    </div>
  );
}

function Game({ code, onLeave }: { code: string; onLeave: () => void }) {
  const [t, setT] = useState<TeamState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [seenAt, setSeenAt] = useState(0);
  const [msg, setMsg] = useState("");

  const [cele, setCele] = useState<StepKind | null>(null);
  const [savedMood, setMood] = useState<Mood>(); // Chris's face, shared by the evidence page and the popups
  useEffect(() => { preloadGavel().catch(() => {}); }, []); // so the gavel frames are cached before the first legal check
  const [accusing, setAccusing] = useState(false); // separate accusation screen
  const [endCall, setEndCall] = useState(false); // Chris's closing call after the arrest
  const [call, setCall] = useState(false); // Chris P. Bacon calls after the building is found
  const [arrest, setArrest] = useState(false);
  const [verdict, setVerdict] = useState(false);
  const prev = useRef<{ phase: string; all: boolean; done: boolean; law: boolean } | null>(null);

  const apply = useCallback((d: TeamState) => {
    // Compare with the last state we saw, so each step completion plays its animation once (never on a page reload).
    const cur = { phase: d.phase, all: Object.keys(d.solved).length >= CRIMES.length && !d.law, done: !!d.finishedAt, law: !!d.law };
    const p = prev.current;
    prev.current = cur;
    if (p) {
      if (!p.done && cur.done) setVerdict(true); // verdict before the arrest
      if (p.phase === "sonar" && cur.phase !== "sonar") new Audio("/case/found-key.mp3").play().catch(() => {}); // voice only, no popup; silent until the file exists
      else if (p.phase !== cur.phase) setCele(p.phase as StepKind);
      else if (!p.all && cur.all) setCele("ciphers");
      if (!p.done && cur.done) setArrest(true);
    }
    setT(d);
    setSeenAt(Date.now());
  }, []);
  const poll = useCallback(async () => {
    const r = await api("state?code=" + encodeURIComponent(code));
    if (r.status === 403) { onLeave(); return; } // remembered code no longer exists (e.g. config replaced)
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

  const prevOver = useRef<boolean | null>(null);
  const [showOver, setShowOver] = useState(false);
  const timedOut = !!t && !t.finishedAt && !!t.endsAt && t.endsAt - now <= 0;
  // GAME OVER popup only when the clock runs out while playing, not when a page loads already out of time.
  useEffect(() => {
    if (!t) return;
    if (prevOver.current === false && timedOut) setShowOver(true);
    prevOver.current = timedOut;
  }, [t, timedOut]);
  if (!t) return null;
  const done = !!t.finishedAt;
  const left = t.endsAt ? t.endsAt - now : 0;
  const over = !done && left <= 0;
  const mood: Mood = t.hack && !over && !done ? "scared" : savedMood; // scared during a hack, happy once it is solved
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
      law: ["Correct.", "Wrong. Locked out for a moment."],
    };
    setMsg(status === 410 ? "Time is up." : status === 423 ? "" : status === 429 ? "Locked out. Wait." : (text[route]?.[ok ? 0 : 1] ?? ""));
    if (!ok && status === 200 && route !== "key") wrongSound(); // a wrong answer anywhere, not only on the evidence list
    return ok;
  };

  const solveHack = async (solution: string | string[]) => {
    const { data } = await api("hack", { code, solution });
    if (data.ok) await playUnlock();
    if (data.name) apply(data);
    if (data.ok) { setMood("happy"); new Audio("/case/solveHack.mp3").play().catch(() => {}); }
    if (data.ok) setMsg(data.delta ? `Back in. ${data.delta > 0 ? "+" : ""}${data.delta} points` : "Back in.");
    if (!data.ok) wrongSound();
    return !!data.ok;
  };

  return (
    <div className={`mt-8 grid gap-8 ${!done && !over && t.phase === "ciphers" ? "lg:grid-cols-[16rem_1fr_18rem]" : "lg:grid-cols-[1fr_18rem]"}`}>
      {!done && !over && t.phase === "ciphers" && <div className="order-2 lg:order-none"><Decoders /></div>}
      <section className="order-1 min-w-0 lg:order-none">
        {msg && <p className="mb-4 font-mono text-sm text-green-300">{msg}</p>}
        {lock > 0 && <p className="mb-4 text-sm text-red-400">Locked out for {lock}s after the last wrong answer.</p>}
        {done && <Victory t={t} />}
        {over && <Victory t={{ ...t, finishedAt: t.endsAt }} timeout />}
        {!done && !over && t.phase === "photo" && <PhotoStep send={send} over={over} />}
        {!done && !over && t.phase === "sonar" && (
          <>
            <h2 className={h2}>Step 2: Last known location</h2>
            <p className="mt-2 mb-4 text-sm text-neutral-400">Find the exact spot in the building. The signal grows stronger as you get closer.</p>
            <Sonar onPing={onPing} onKey={() => send("key", {})} />
          </>
        )}
        {!done && !over && t.phase === "drive" && <DriveStep onSig={(sig) => send("unlock", { sig })} />}
        {!done && !over && t.phase === "ciphers" && (accusing ? <AccuseStep t={t} send={send} over={over} mood={mood} onBack={() => setAccusing(false)} /> : <CipherStep t={t} send={send} over={over} mood={mood} setMood={setMood} onAccuse={() => setAccusing(true)} />)}
      </section>
      <aside className="order-first lg:order-none">
        <div className="rounded border border-green-800/60 bg-[#030805] p-4">
          <div className="flex justify-between border-b border-green-950 pb-2 font-mono text-[9px] tracking-widest text-green-600"><span>MISSION CONTROL</span><span>{done ? "COMPLETE" : over ? "CLOSED" : "LIVE"}</span></div>
          <p className="mt-3 break-words text-sm font-medium text-green-100">{t.name}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div><p className="font-mono text-[9px] tracking-widest text-neutral-500">SCORE</p><p className="mt-1 font-mono text-2xl tabular-nums text-green-400">{t.score.toLocaleString()}</p></div>
            <div className="border-l border-green-950 pl-3"><p className="font-mono text-[9px] tracking-widest text-neutral-500">{done ? "ELAPSED" : "TIME LEFT"}</p><p className={`mt-1 font-mono text-2xl tabular-nums ${over ? "text-red-400" : "text-green-100"}`}>{done ? mmss((t.finishedAt ?? 0) - (t.startedAt ?? 0)) : over ? "TIME UP" : clock(left)}</p></div>
          </div>
          <div className="mt-4 flex gap-1" aria-label={`${Object.keys(t.solved).length} of 6 messages decoded`}>{CRIMES.map((_, i) => <span key={i} className={`h-1 flex-1 ${t.solved[i] ? "bg-green-500" : "bg-green-950"}`} />)}</div>
          <button onClick={onLeave} className="mt-4 font-mono text-[9px] text-neutral-600 hover:text-green-300">Switch team ↗</button>
        </div>
        <h2 className={`${h2} mt-6`}>Leaderboard</h2>
        <Scoreboard me={t.name} />
      </aside>
      {verdict && <Gavel text="FOUND GUILTY." sub="Bea F. Wellington, on all counts." onDone={() => setVerdict(false)} />}
      {cele && !arrest && !verdict && <StepDone key={cele} kind={cele} onDone={() => { setCele(null); if (cele === "photo") setCall(true); }} />}
      {call && <FoundBuilding onDone={() => setCall(false)} />}
      {showOver && <GameOver onDone={() => setShowOver(false)} />}
      {arrest && !verdict && <Arrest onDone={() => { setArrest(false); setEndCall(true); }} />}
      {endCall && <EndCall onDone={() => setEndCall(false)} />}
      {t.law && !t.hack && !over && !done && <LawCheck law={t.law} lock={lock} mood={mood} onPick={(choice) => send("law", { choice })} />}
      {t.hack && !over && !done && <Hack key={t.hack.issuedAt} hack={t.hack} mood={mood} onSolve={solveHack} />}
    </div>
  );
}

export function CasePage() {
  const [code, setCode] = useState(() => { try { return localStorage.getItem(CODE_KEY) ?? ""; } catch { return ""; } });
  const set = (c: string) => { try { localStorage.setItem(CODE_KEY, c); } catch { /* private mode */ } setCode(c); };
  const [snd, setSnd] = useState(soundOn);
  if (import.meta.env.DEV && location.search.includes("preview")) return <Preview />;
  return (
    <>
    <Rain />
    <main className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <a href="/activities" className="font-mono text-xs text-neutral-500 hover:text-white">&larr; Activities</a>
        <button onClick={() => { setSound(!snd); setSnd(!snd); }} className="font-mono text-xs text-neutral-500 hover:text-white">sound: {snd ? "on" : "off"}</button>
      </div>
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-green-400">Case file</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Bea F. Wellington</h1>
      {code ? <Game code={code} onLeave={() => set("")} /> : <Gate onCode={set} />}
    </main>
    </>
  );
}
