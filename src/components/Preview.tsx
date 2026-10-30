import { OfficerUSB } from "./OfficerUSB";
import { TeamAssignment } from "./TeamAssignment";
import { t as tr } from "../i18n/language";
import { useRef, useState } from "react";
import { Arrest } from "./Arrest";
import { Briefing, EndCall, FoundBuilding, ToCourt } from "./Briefing";
import { GameOver } from "./GameOver";
import { Gavel } from "./Gavel";
import { StepDone } from "./StepDone";
import { Hack, type HackState } from "./Hack";
import { playUnlock } from "./unlock";
import { setSound, soundOn, sfx } from "./sound";
import { Sonar } from "./Sonar";
import { LawCheck } from "./LawCheck";
import { CaseSurvey } from "./CaseSurvey";

type Sample = { label: string; kind: HackState["kind"]; data: HackState["data"]; solution: string };
const HACKS: { label: string; kind: HackState["kind"] }[] = [
  { label: tr("Connect the dots"), kind: "dots" }, { label: tr("Memory pattern"), kind: "memory" },
  { label: tr("Crossed wires"), kind: "wires" }, { label: tr("Firewall grid"), kind: "firewall" }, { label: tr("Lock rings"), kind: "rings" },
];
const int = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) { const j = int(0, i); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
function sampleHack(sample: (typeof HACKS)[number]): Sample {
  const { kind } = sample;
  if (kind === "dots") {
    const slots = shuffled(Array.from({ length: 9 }, (_, i) => i)).slice(0, int(5, 8));
    return { ...sample, data: { points: slots.map((slot, i) => ({ id: i + 1, x: 15 + slot % 3 * 34 + int(-4, 4), y: 15 + Math.floor(slot / 3) * 34 + int(-4, 4) })) }, solution: slots.map((_, i) => i + 1).join(",") };
  }
  if (kind === "memory") {
    const sequence = Array.from({ length: int(5, 6) }, () => int(0, 3));
    return { ...sample, data: { sequence }, solution: sequence.join(",") };
  }
  if (kind === "wires") {
    const sequence = shuffled([0, 1, 2, 3]);
    return { ...sample, data: { sequence }, solution: [0, 1, 2, 3].map(n => sequence.indexOf(n)).join(",") };
  }
  if (kind === "rings") return { ...sample, data: { sequence: Array.from({ length: 3 }, () => int(1, 7)) }, solution: "0,0,0" };
  const sequence = Array<number>(9).fill(1);
  const flips = shuffled(Array.from({ length: 9 }, (_, i) => i)).slice(0, int(3, 7));
  for (const pos of flips) for (let n = 0; n < 9; n++) if (n === pos || Math.abs(n - pos) === 3 || (Math.floor(n / 3) === Math.floor(pos / 3) && Math.abs(n - pos) === 1)) sequence[n] ^= 1;
  if (sequence.every(Boolean)) sequence[0] = sequence[1] = sequence[3] = 0;
  return { ...sample, data: { sequence }, solution: Array(9).fill(1).join(",") };
}

// Dev-only cutscene viewer: /case/wellington/?preview. Plays any cutscene without a game.
export function Preview() {
  const [scene, setScene] = useState<string | null>(null);
  const [hack, setHack] = useState<Sample | null>(null);
  const [issuedAt, setIssuedAt] = useState(0);
  const [solved, setSolved] = useState("");
  const [sound, updateSound] = useState(soundOn);
  const previous = useRef<Record<string, string>>({});
  const handleLaunch = (entry: (typeof HACKS)[number]) => {
    let sample = sampleHack(entry);
    while (JSON.stringify(sample.data) === previous.current[entry.kind]) sample = sampleHack(entry);
    previous.current[entry.kind] = JSON.stringify(sample.data);
    setHack(sample); setIssuedAt(Date.now()); setSolved("");
  };
  const end = () => setScene(null);
  const list: [string, string][] = [
    ["team", "Team assignment (PowerShell)"],
    ["officer", "Officer dispatch: fetch team USB"],
    ["briefing", tr("Briefing (before 3-2-1)")], ["building", tr("Found the building")], ["court", tr("To court (before accusation)")],
    ["arrest", tr("Arrest, then closing call")], ["endcall", tr("Closing call only")], ["gameover", tr("Game over")],
    ["gavel1", tr("Gavel: order in the court")], ["gavel2", tr("Gavel: found guilty")],
    ["photo", tr("Step done: photo")], ["sonar", tr("Step done: USB recovered")], ["drive", tr("Step done: drive")], ["ciphers", tr("Step done: evidence")],
  ];
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-mono text-sm uppercase tracking-wide text-green-400">{tr("Case preview (dev only)")}</h1>
      <button onClick={() => setScene("survey")} className="mt-3 block rounded border border-green-700 px-4 py-2 text-green-200">{tr("Try end-of-game survey")}</button>
      {scene === "survey" && <div className="fixed inset-0 z-[80] overflow-y-auto bg-black p-5"><div className="mx-auto max-w-xl"><button onClick={end} className="rounded border border-neutral-700 px-4 py-2 text-sm text-white">{tr("Close survey preview")}</button><p className="mt-4 font-mono text-xs text-neutral-500">{tr("Preview only · submissions aren’t saved. Close and reopen to restart.")}</p><CaseSurvey code="" preview /></div></div>}
      <button onClick={() => setScene("legal")} className="mt-3 block rounded border border-amber-700 px-4 py-2 text-amber-200">{tr("Try courtroom legal check")}</button>
      {scene === "legal" && <><LawCheck law={{ stage: 0, question: "Rule: Pretending to be a trusted network is the offense of deception. Stealing data is a separate offense. Each is counted once per incident.\nFacts: Eve set up a fake network named like the university’s and copied the passwords of 40 students in one incident.\nHow many offenses under the rule?", options: ["1", "2", "3", "40"] }} lock={0} onPick={async choice => { if (choice === 1) setScene("legal-success"); }} /><button onClick={end} className="fixed right-4 top-4 z-[80] rounded border border-neutral-700 bg-black px-3 py-2 text-sm text-white">{tr("Close preview")}</button></>}
      {scene === "legal-success" && <Gavel text={tr("RULING UPHELD")} sub="Two distinct offenses supported by the evidence." onDone={end} />}
      {scene === "library" && <div className="fixed inset-0 z-40 overflow-y-auto bg-black p-5"><div className="mx-auto max-w-5xl"><button onClick={end} className="mb-4 rounded border border-neutral-700 px-4 py-2 text-white">{tr("Close library preview")}</button><Sonar onKey={end} onPing={async (x, y) => { const distance = Math.hypot(x - 312, y - 175); return { strength: Math.max(0, 1 - distance / 700), found: distance < 22 }; }} /></div></div>}
      <button onClick={() => setScene("library")} className="mt-4 block rounded-lg border border-green-700 px-4 py-3 text-green-300">{tr("Explore Marx Library (first-person prototype)")}</button>
      <button aria-pressed={sound} onClick={() => { setSound(!sound); updateSound(!sound); if (!sound) sfx.beep(true); }} className="mt-3 rounded-lg border border-neutral-700 px-3 py-2 text-sm text-white hover:border-red-400">{tr("Sound:")}{sound ? tr("on") : tr("off")}</button>
      <h2 className="mt-6 text-white">{tr("Bea’s hacks")}</h2>
      <p className="mt-2 text-sm text-neutral-400">{tr("Randomized puzzles. No team progress or score is changed. Close and reopen for a fresh challenge.")}</p>
      {solved && <p role="status" className="mt-3 text-sm text-green-300">{solved}{tr("solved. Pick another hack or replay it.")}</p>}
      <div className="mt-4 grid gap-2">
        {HACKS.map((sample) => <button key={sample.kind} onClick={() => handleLaunch(sample)} className="rounded-lg border border-neutral-700 px-4 py-2 text-left text-sm text-white hover:border-green-400">{tr(sample.label)}</button>)}
      </div>
      {hack && <>
        <Hack key={issuedAt} hack={{ kind: hack.kind, data: hack.data, issuedAt }} onSolve={async (answer) => {
          const actual = Array.isArray(answer) ? answer.join(",") : answer;
          const ok = actual.trim().toLowerCase() === hack.solution.toLowerCase();
          if (ok) { await playUnlock(); setSolved(hack.label); setHack(null); }
          return ok;
        }} />
        <button onClick={() => setHack(null)} className="fixed right-4 top-4 z-[60] rounded-lg border border-neutral-600 bg-black px-4 py-2 text-sm text-white">{tr("Close preview")}</button>
      </>}
      <h2 className="mt-8 text-white">{tr("Cutscenes")}</h2>
      <div className="mt-4 grid gap-2">
        {list.map(([id, label]) => (
          <button key={id} onClick={() => setScene(id)} className="rounded-lg border border-neutral-700 px-4 py-2 text-left text-sm text-white hover:border-green-400">{label}</button>
        ))}
      </div>
      {scene === "officer" && <div className="fixed inset-0 z-50 overflow-y-auto bg-black p-5 pt-20"><button onClick={end} className="absolute right-5 top-5 rounded border border-neutral-700 px-4 py-2 text-white">{tr("Close preview")}</button><OfficerUSB onRecover={async () => { setScene("drive"); return true; }} /></div>}
      {scene === "team" && <TeamAssignment team="Team 1" onDone={end} />}
      {scene === "briefing" && <Briefing onDone={end} />}
      {scene === "building" && <FoundBuilding onDone={end} />}
      {scene === "court" && <ToCourt onDone={end} />}
      {scene === "arrest" && <Arrest onDone={() => setScene("endcall")} />}
      {scene === "endcall" && <EndCall onDone={end} />}
      {scene === "gameover" && <GameOver onDone={end} />}
      {scene === "gavel1" && <Gavel text={tr("ORDER IN THE COURT!")} sub="Legal check begins." onDone={end} />}
      {scene === "gavel2" && <Gavel text={tr("FOUND GUILTY.")} sub={tr("Bea F. Wellington, on all counts.")} onDone={end} />}
      {(scene === "photo" || scene === "sonar" || scene === "drive" || scene === "ciphers") && <StepDone key={scene} kind={scene} onDone={end} />}
    </main>
  );
}
