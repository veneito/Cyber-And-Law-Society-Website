import { SymbolKeyWindow } from "./SymbolKeyWindow";
import { CASE_EVENT } from "../../shared/case-event.mjs";
import { CaseEventRules } from "./LiveCaseEvent";
import { OfficerUSB } from "./OfficerUSB";
import { t as tr } from "../i18n/language";
import { language } from "../i18n/language";
import { useCallback, useEffect, useRef, useState } from "react";
import { TeamAssignment } from "./TeamAssignment";
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
  tr("Set up a fake Wi-Fi network to steal logins"),
  tr("Sold the stolen logins to a buyer"),
  tr("Locked the university servers for ransom"),
  tr("Threatened an IT employee into silence"),
  tr("Hid the ransom money trail"),
  tr("Framed a student and wiped the logs"),
];

type TeamState = {
  surveySubmitted?: boolean;
  name: string; startedAt: number | null; endsAt: number | null; score: number;
  phase: "photo" | "sonar" | "drive" | "ciphers"; found: boolean;
  solved: Record<string, string>; lockedFor: number; accused: boolean;
  ciphers: { text: string }[]; hack: HackState | null;
  law: LawState | null; finishedAt: number | null; crimeOrder: number[]; evOrder: number[];
  pts: { base: number; time: number; hack: number; penalty: number; accuse: number };
};


const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

async function api(path: string, body?: unknown) {
  const r = await fetch(`/api/case/${path}${path.includes("?") ? "&" : "?"}lang=${language}`, body ? { method: "POST", body: JSON.stringify(body) } : undefined);
  return { status: r.status, data: await r.json() };
}

const btn = "rounded-lg bg-green-400 px-5 py-2 font-semibold text-black hover:bg-green-300 disabled:opacity-40";
const ghost = "rounded-lg border border-neutral-700 px-4 py-2 text-sm text-white hover:border-green-400 disabled:opacity-40";
const field = "min-w-0 flex-1 rounded-lg border border-neutral-700 bg-black px-3 py-2 text-sm text-white";
const h2 = "font-mono text-sm uppercase tracking-wide text-white";

function Scoreboard({ me }: { me: string }) {
  return <Leaderboard board={useScoreboard()} me={me} />;
}

function Gate({ onCode, resumeCode = "" }: { onCode: (c: string) => void; resumeCode?: string }) {
  const [v, setV] = useState(resumeCode);
  const [err, setErr] = useState("");
  const [counting, setCounting] = useState(false);
  const [briefing, setBriefing] = useState(false);
  const [name, setName] = useState("");
  const [naming, setNaming] = useState(!!resumeCode);
  const [checking, setChecking] = useState(false);
  const [assigned, setAssigned] = useState("");
  const finishAssignment = useCallback(() => { setAssigned(""); setNaming(true); }, []);
  const go = async () => {
    if (checking) return;
    setChecking(true);
    setErr("");
    // The state call checks the code without starting the clock; the clock starts once the case opens.
    try {
      const { status, data } = v.trim()
        ? await api("state?code=" + encodeURIComponent(v.trim()))
        : await api("register", {});
      if (status === 200) {
        if (data.startedAt && data.code) { onCode(data.code); return; }
        if (data.code) {
          setV(data.code);
          setAssigned(data.name);
        } else setNaming(true);
      }
      else setErr(status === 401 ? tr("Please sign in with Discord again.") : data.error || tr("Case not open yet."));
    } catch {
      setErr(tr("Could not check your team code. Please try again."));
    } finally {
      setChecking(false);
    }
  };
  return (
    <div className="relative mt-8 min-h-[26rem]">
      <Helix />
      {assigned && <TeamAssignment team={assigned} onDone={finishAssignment} />}
      <div className="relative">
        {naming ? (
          <form className="grid max-w-md gap-3" onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || briefing) return;
            setName(name.trim());
            setBriefing(true);
          }}>
            <p className="break-all font-mono text-sm text-green-300">{tr("Team code")}: {v}</p>
            <label htmlFor="case-team-name" className="text-neutral-400">{tr("Choose your leaderboard name to begin the briefing.")}</label>
            <input id="case-team-name" autoFocus required value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder={tr("Team name")} className={field} disabled={briefing} />
            <button type="submit" disabled={!name.trim() || briefing} className={`${btn} justify-self-start`}>{tr("Begin briefing")}</button>
            <p className="text-sm text-neutral-500">{tr("Your timer starts after the briefing and cannot be paused. Your final score is permanent.")}</p>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); void go(); }}>
            <p className="text-neutral-400">{tr("Ready for your one attempt? Your team number will be assigned automatically.")}</p>
            <div className="mt-3 flex max-w-md gap-2">
              <button type="submit" disabled={checking} className={btn}>{checking ? tr("Checking…") : tr("Reserve my attempt")}</button>
            </div>
          </form>
        )}
        {err && <p role="alert" className="mt-2 text-sm text-red-400">{err}</p>}
      </div>
      {briefing && !counting && <Briefing onDone={() => setCounting(true)} />}
      {counting && <Countdown onDone={async () => { try { const result = await api("start", { code: v.trim(), name }); if (result.status === 200) onCode(v.trim()); else { setCounting(false); setBriefing(false); setErr(result.data.error || "Unable to start the case."); } } catch { setCounting(false); setBriefing(false); setErr("Connection interrupted. Please try again."); } }} />}
    </div>
  );
}

function PhotoStep({ send, over }: { send: (route: string, body: object) => Promise<boolean>; over: boolean }) {
  const [v, setV] = useState("");
  const [restored, setRestored] = useState(false);
  return (
    <>
      <h2 className={h2}>{tr("Step 1: Last photo of Bea")}</h2>
      {!restored ? <PhotoRestore disabled={over} onRestore={() => setRestored(true)} /> : <>
      <p className="mt-2 text-sm text-neutral-400">{tr("Where was this taken? Download the")}<strong className="text-white">{tr("original file")}</strong>{tr("; screenshots and photos sent through chat apps lose the hidden data. Then upload it to")}{" "}
        <a href="https://www.pic2map.com" target="_blank" rel="noreferrer" className="text-green-300 hover:underline">pic2map.com</a>.
      </p>
      <img src="/case/evidence-01.jpg" alt="Last known photo of Bea F. Wellington" className="mt-4 w-full max-w-md rounded-xl border border-green-400/70" />
      <a href="/case/evidence-01.jpg" download className={`${ghost} mt-3 inline-block`}>{tr("Download original")}</a>
      <p className="mt-8 text-white">{tr("What is the name of the building where this photo was taken?")}</p>
      <div className="mt-3 flex max-w-md gap-2">
        <input value={v} disabled={over} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send("building", { answer: v })} placeholder={tr("Building name")} className={field} />
        <button onClick={() => send("building", { answer: v })} disabled={over} className={btn}>{tr("Submit")}</button>
      </div>
      </>}
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
      <div className="border-b border-green-900 pb-3"><p className="font-mono text-[9px] tracking-[0.25em] text-green-600">{tr("FORENSICS // RECOVERED TRANSMISSIONS")}</p><div className="mt-2 flex justify-between"><h2 className="font-serif text-xl text-green-100">{tr("Evidence dossier")}</h2><span className="font-mono text-xs text-green-400">{Object.keys(t.solved).length}{tr("/6 DECODED")}</span></div></div>
      <ol className="mt-4 space-y-3">
        {CRIMES.map((c, i) => (
          <li key={c} className="rounded border border-green-900/60 bg-[#030805] p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] tracking-widest text-green-600">{tr("EXHIBIT // 0")}{i + 1}</span>
              <span className={`font-mono text-[9px] tracking-widest ${t.solved[i] ? "text-green-400" : "text-amber-500"}`}>{t.solved[i] ? tr("✓ VERIFIED") : tr("ENCRYPTED")}</span>
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
                  <button onClick={() => submit(i)} disabled={over} className={ghost}>{tr("Submit")}</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
      {ready && <button onClick={() => setCalling(true)} className={`${btn} mt-8`}>{tr("Make your accusation")}</button>}
      </div>
      {calling && <ToCourt onDone={() => { setCalling(false); onAccuse(); }} />}
      <div className="mx-auto md:sticky md:top-6"><Portrait label="Chris P. Bacon" sub="FBI" mood={mood} /></div>
      </div>
    </>
  );
}

// Crimes Bea did not commit, mixed into the list as wrong answers (ids 100+; the server counts them as wrong pairings).
const DECOYS = [
  tr("Defaced the university website"),
  tr("Planted a keylogger on the library computers"),
  tr("Sent phishing emails posing as the bursar's office"),
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
        <h2 className="mt-3 text-center font-mono text-xs tracking-widest text-green-300">{tr("DECODED EVIDENCE")}</h2>
        <p className="mt-2 text-center text-[10px] text-neutral-500">{typeof view === "number" ? tr("Select a message to attach to this charge.") : tr("Your recovered messages. Use these to support each charge.")}</p>
        <div className="mt-4 space-y-3">{t.evOrder.filter(k => k in t.solved).map(k => {
          const owner = usedBy(k); const taken = owner !== undefined && owner !== view;
          return <button key={k} disabled={typeof view !== "number" || over || taken} onClick={() => { if(typeof view === "number") attach(view,k); }} className="w-full border-l-2 border-green-800 bg-green-950/10 p-3 text-left enabled:hover:border-green-300 disabled:cursor-default">
            <span className="font-mono text-[9px] tracking-widest text-green-600">{tr("EXHIBIT")}{String(k+1).padStart(2,"0")} {owner !== undefined ? tr("// FILED") : ""}</span>
            <span className="mt-2 block font-mono text-xs leading-relaxed text-green-200/80">{t.solved[k]}</span>
          </button>;
        })}</div>
        <pre aria-hidden className="mt-4 text-center font-mono text-xs text-green-500">{"╚═════════════════════════════╝"}</pre>
      </aside>
      <div className="order-1 min-w-0 lg:order-2">
        <button onClick={view === "list" ? onBack : () => setView("list")} className="font-mono text-xs text-neutral-500 hover:text-white">
          &larr; {view === "list" ? tr("Back to evidence") : tr("Back to the crimes")}
        </button>
        <h2 className={`${h2} my-3`}>{tr("Accusation hearing")}</h2>
        <CourtJudge reaction={judgeReaction || null} smacks={judgeSmacks}>{view === "list" ? tr("Counsel, what offenses do you accuse the defendant of committing? Select a charge, then attach the decoded message that supports it.") : view === "review" ? tr("Present your final charges to the court. Is every accusation supported by the evidence?") : `${tr("You accuse Bea F. Wellington of:")} “${crimeText(view)}.” ${tr("Which decoded message proves this charge, counsel?")}`}</CourtJudge>
        {t.accused ? (
          <p className="mt-3 text-green-300">{tr("Bea F. Wellington is accused of all crimes.")}</p>
        ) : view === "list" ? (
          <>
            <p className="mt-2 text-sm text-neutral-400">{tr("Choose the specific crime you wish to accuse Bea of. The court requires a decoded message for every charge; unsupported allegations must not be filed.")}</p>
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
            <p className="mt-4 font-mono text-xs text-neutral-500">{filed}{tr("charge")}{filed === 1 ? "" : "s"}{tr("filed")}</p>
            <button onClick={() => setView("review")} disabled={filed === 0} className={`${btn} mt-2`}>{tr("Present charges to the judge")}</button>
          </>
        ) : view === "review" ? (
          <>
            <p className="mt-2 text-sm text-neutral-400">{tr("Your case. Check each charge, then accuse. A wrong pairing, or a crime she did not commit, costs 10 points.")}</p>
            <ul className="mt-4 space-y-2">
              {Object.keys(picks).map(Number).map((c) => (
                <li key={c} className={card}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm text-white">{crimeText(c)}</span>
                    <button onClick={() => { setView(c); setJudgeSmacks(false); setJudgeReaction(n => n + 1); }} className="shrink-0 font-mono text-xs text-neutral-500 hover:text-white">{"change"}</button>
                  </div>
                  <p className="mt-1 text-sm text-green-300">{t.solved[picks[c]]}</p>
                </li>
              ))}
            </ul>
            <button onClick={() => send("accuse", { picks })} disabled={over || filed === 0}
              className="group relative mt-6 mb-8 flex w-full items-center gap-4 overflow-hidden rounded-lg border border-orange-500/70 bg-gradient-to-r from-orange-950/60 to-black px-5 py-5 text-left transition hover:border-orange-300 hover:shadow-[0_0_24px_#f9731622] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300 active:translate-y-px disabled:opacity-40">
              <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-orange-500/40 bg-black/50 text-orange-300"><svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m8 7 5-5 9 9-5 5-9-9Zm7 7-9 9m-2 3h16m-18 3h20M22 4l4 4M7 6l-3 3" /></svg></span>
              <span className="min-w-0 flex-1"><span className="block font-mono text-[9px] tracking-[0.2em] text-orange-600">{tr("COURT RECORD // FINAL SUBMISSION")}</span><span className="mt-1 block font-mono text-lg font-semibold tracking-wider text-orange-100 sm:text-xl">{tr("File accusation")}</span><span className="mt-1 block text-xs text-orange-200/50">{tr("Present")}{filed}{tr("supported charge")}{filed === 1 ? "" : "s"}{tr("to the judge")}</span></span>
              <span aria-hidden className="font-mono text-2xl text-orange-400 transition-transform group-enabled:group-hover:translate-x-1">↗</span>
              <span aria-hidden className="absolute bottom-0 left-0 h-px w-1/3 bg-orange-300/70" />
            </button>
          </>
        ) : (
          <>
            <p className="mt-4 font-mono text-xs text-neutral-500">{tr("CHARGE")}</p>
            <div className={`${card} mt-2 border-amber-300/50`}>
              <p className="text-lg text-white">{crimeText(view)}</p>
              <p className="mt-1 text-sm text-neutral-400">{tr("Which decoded message proves it?")}</p>
            </div>
            <div className="mt-4 grid gap-2">
              {t.evOrder.filter((k) => k in t.solved).map((k) => {
                const other = usedBy(k);
                const taken = other !== undefined && other !== view;
                return (
                  <button key={k} onClick={() => attach(view, k)} disabled={over || taken}
                    className={`${card} text-left text-sm text-neutral-200 hover:border-green-400 disabled:opacity-40 ${picks[view] === k ? "border-green-400" : ""}`}>
                    {t.solved[k]}
                    {taken && <span className="ml-2 font-mono text-xs text-neutral-500">{tr("(used for another charge)")}</span>}
                  </button>
                );
              })}
            </div>
            {view in picks && <button onClick={() => detach(view)} className="mt-4 text-sm text-neutral-500 hover:text-white">{tr("Remove this charge")}</button>}
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
      if (!p.all && cur.all) setCele("ciphers");
      if (!p.done && cur.done) setArrest(true);
    }
    setT(d);
    setSeenAt(Date.now());
  }, []);
  const poll = useCallback(async () => {
    const r = await api("state?code=" + encodeURIComponent(code));
    if (r.status === 401 || r.status === 403) { onLeave(); return; } // remembered code no longer exists (e.g. config replaced)
    if (r.status !== 200) return;
    // A remembered code with no server-side start (e.g. progress was reset) starts the clock instead of showing TIME UP.
    if (r.data.startedAt) apply(r.data); else onLeave();
  }, [code, apply, onLeave]);
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
    if (ok && route === "building") setCele("photo");
    if (ok && route === "key") setCele("sonar");
    if (ok && route === "unlock") setCele("drive");
    const text: Record<string, [string, string]> = {
      building: [tr("Correct. Moving on."), tr("Wrong building. Locked out for a moment.")],
      unlock: [tr("Signature accepted."), tr("Signature rejected. Locked out for a moment.")],
      answer: [`Decoded.${data.points ? ` +${data.points} points` : ""}`, tr("Wrong. Locked out for a moment.")],
      accuse: [tr("Accusation correct. +300 points"), `Not quite: ${data.wrong ?? 0} wrong pairing(s), -10 each.`],
      key: [tr("Key obtained."), tr("No key yet.")],
      law: [tr("Correct."), tr("Wrong. Locked out for a moment.")],
    };
    setMsg(status === 410 ? tr("Time is up.") : status === 423 ? "" : status === 429 ? tr("Locked out. Wait.") : (text[route]?.[ok ? 0 : 1] ?? ""));
    if (!ok && status === 200 && route !== "key") wrongSound(); // a wrong answer anywhere, not only on the evidence list
    return ok;
  };

  const solveHack = async (solution: string | string[]) => {
    const { data } = await api("hack", { code, solution });
    if (data.ok) await playUnlock();
    if (data.name) apply(data);
    if (data.ok) { setMood("happy"); new Audio("/case/solveHack.mp3").play().catch(() => {}); }
    if (data.ok) setMsg(data.delta ? `Back in. ${data.delta > 0 ? "+" : ""}${data.delta} points` : tr("Back in."));
    if (!data.ok) wrongSound();
    return !!data.ok;
  };

  return (
    <div className={`mt-8 grid gap-8 ${!done && !over && t.phase === "ciphers" ? "lg:grid-cols-[16rem_1fr_18rem]" : "lg:grid-cols-[1fr_18rem]"}`}>
      <SymbolKeyWindow available={t.phase === "ciphers"} />
      {!done && !over && t.phase === "ciphers" && <div className="order-2 lg:order-none"><Decoders /></div>}
      <section className="order-1 min-w-0 lg:order-none">
        {msg && <p className="mb-4 font-mono text-sm text-green-300">{tr(msg)}</p>}
        {lock > 0 && <p className="mb-4 text-sm text-red-400">{tr("Locked out for")}{lock}{tr("s after the last wrong answer.")}</p>}
        {done && <Victory t={t} code={code} />}
        {over && <Victory t={{ ...t, finishedAt: t.endsAt }} code={code} timeout />}
        {!done && !over && t.phase === "photo" && <PhotoStep send={send} over={over} />}
        {!done && !over && t.phase === "sonar" && (
          <>
            <h2 className={h2}>{tr("Step 2: Last known location")}</h2>
            <p className="mt-2 mb-4 text-sm text-neutral-400">{tr("Find the exact spot in the building. The signal grows stronger as you get closer.")}</p>
            <Sonar onPing={onPing} onKey={() => send("key", {})} />
          </>
        )}
        {!done && !over && t.phase === "drive" && <OfficerUSB onRecover={(location) => send("unlock", { recovered: true, ...location })} />}
        {!done && !over && t.phase === "ciphers" && (accusing ? <AccuseStep t={t} send={send} over={over} mood={mood} onBack={() => setAccusing(false)} /> : <CipherStep t={t} send={send} over={over} mood={mood} setMood={setMood} onAccuse={() => setAccusing(true)} />)}
      </section>
      <aside className="order-first lg:order-none">
        <div className="rounded border border-green-800/60 bg-[#030805] p-4">
          <div className="flex justify-between border-b border-green-950 pb-2 font-mono text-[9px] tracking-widest text-green-600"><span>{tr("MISSION CONTROL")}</span><span>{done ? tr("COMPLETE") : over ? tr("CLOSED") : tr("LIVE")}</span></div>
          <p className="mt-3 break-words text-sm font-medium text-green-100">{t.name}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div><p className="font-mono text-[9px] tracking-widest text-neutral-500">{tr("SCORE")}</p><p className="mt-1 font-mono text-2xl tabular-nums text-green-400">{t.score.toLocaleString()}</p></div>
            <div className="border-l border-green-950 pl-3"><p className="font-mono text-[9px] tracking-widest text-neutral-500">{done ? tr("ELAPSED") : tr("TIME LEFT")}</p><p className={`mt-1 font-mono text-2xl tabular-nums ${over ? "text-red-400" : "text-green-100"}`}>{done ? mmss((t.finishedAt ?? 0) - (t.startedAt ?? 0)) : over ? tr("TIME UP") : clock(left)}</p></div>
          </div>
          <div className="mt-4 flex gap-1" aria-label={`${Object.keys(t.solved).length} of 6 messages decoded`}>{CRIMES.map((_, i) => <span key={i} className={`h-1 flex-1 ${t.solved[i] ? "bg-green-500" : "bg-green-950"}`} />)}</div>
        </div>
        <h2 className={`${h2} mt-6`}>{tr("Leaderboard")}</h2>
        <Scoreboard me={t.name} />
      </aside>
      {verdict && <Gavel text={tr("FOUND GUILTY.")} sub={tr("Bea F. Wellington, on all counts.")} onDone={() => setVerdict(false)} />}
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
  const [entry, setEntry] = useState<{ user: { name: string } | null; configured: boolean; code: string | null; started: boolean; status: string } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [snd, setSnd] = useState(soundOn);
  const leave = useCallback(() => { window.location.reload(); }, []);
  useEffect(() => {
    if (import.meta.env.DEV && location.search.includes("preview")) return;
    let active = true;
    api("entry").then(({ status, data }) => {
      if (!active) return;
      if (status !== 200) { setError("Could not load the event. Please refresh to retry."); return; }
      setEntry(data); if (data.started && data.code) setCode(data.code);
    }).catch(() => { if (active) setError("Could not load the event. Please refresh to retry."); });
    return () => { active = false; };
  }, []);
  if (import.meta.env.DEV && location.search.includes("preview")) return <Preview />;
  const signin = new URLSearchParams(location.search).get("signin");
  return <>
    <Rain />
    <main className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <a href="/" className="font-mono text-xs text-neutral-500 hover:text-white">← {tr("Home")}</a>
        <button onClick={() => { setSound(!snd); setSnd(!snd); }} className="font-mono text-xs text-neutral-500">{tr("sound:")}{snd ? tr("on") : tr("off")}</button>
      </div>
      <p className="mt-6 font-mono text-xs uppercase tracking-widest text-green-400">{entry?.status === "closed" ? tr("Event closed") : entry?.status === "upcoming" ? tr("Upcoming event") : tr("Live event · Online investigation")}</p>
      <h1 className="mt-2 text-3xl font-bold text-white">{CASE_EVENT.title}</h1>
      {!code && <>
        <p className="mt-3 text-neutral-300">{tr("Follow the clues, decode the evidence and bring Bea F. Wellington to justice. Take your time reading the instructions, then give this one attempt your best.")}</p>
        <p className="mt-3 text-sm text-green-300">{tr("Event closes November 6, 2026 at 4:45 p.m. Central. You have up to 90 minutes, or until the event closes, whichever comes first.")}</p>
        <CaseEventRules />
      </>}
      {error && <p role="alert" className="mt-5 text-red-300">{error}</p>}
      {!entry && !error && <p role="status" className="mt-6 text-green-300">{tr("Loading event…")}</p>}
      {entry && !entry.user && <section className="mt-7 max-w-2xl rounded-xl border border-green-800 bg-black p-6">
        <h2 className="text-lg font-bold text-white">{tr("Join the club. Take the case.")}</h2>
        <p className="mt-3 text-neutral-300">{tr("First join our club Discord, then sign in with the same Discord account. We verify server membership and use your account to keep one attempt and one final score. Stay in the server for the winner announcement and future club events.")}</p>
        {signin && <p role="alert" className="mt-4 text-amber-300">{signin === "membership" ? tr("Join the club server and complete any membership screening, then sign in again.") : tr("Sign-in was not completed. Please try again; if it continues, contact a club officer.")}</p>}
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={CASE_EVENT.discord} target="_blank" rel="noreferrer" className={ghost}>{tr("1. Join the club Discord ↗")}</a>
          {entry.configured ? <a href="/api/case/auth" className={btn}>{tr("2. Sign in with Discord")}</a> : <p className="text-sm text-amber-300">{tr("Discord entry is being prepared. Please check back shortly; no attempt has started.")}</p>}
        </div>
      </section>}
      {entry?.user && <p className="mt-5 text-sm text-green-300">{tr("Signed in as")} {entry.user.name}</p>}
      {entry?.user && (code ? <Game code={code} onLeave={leave} /> : entry.status === "live" ? <Gate key={entry.code || "new"} resumeCode={entry.code || ""} onCode={setCode} /> : <p className="mt-6 text-neutral-300">{tr("The event is not open for new attempts. Join Discord for the winner announcement.")}</p>)}
    </main>
  </>;
}
