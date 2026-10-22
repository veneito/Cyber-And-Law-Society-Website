import { t as tr } from "../i18n/language";
import { useState } from "react";
import { Gavel } from "./Gavel";
import { sfx } from "./sound";

export type LawState = { stage: number; question: string; options: string[] };

export function LawCheck({ law, lock, onPick }: { mood?: "happy" | "angry" | "scared"; law: LawState; lock: number; onPick: (choice: number) => void | Promise<unknown> }) {
  const [opening, setOpening] = useState(true);
  const [choice, setChoice] = useState<number | null>(null);
  const [charges, setCharges] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const parts = law.question.split("\n");
  const rule = parts.find(p => p.startsWith("Rule:"))?.replace(/^Rule:\s*/, "");
  const facts = parts.find(p => p.startsWith("Facts:"))?.replace(/^Facts:\s*/, "");
  const ask = parts.filter(p => !p.startsWith("Rule:") && !p.startsWith("Facts:")).join("\n");
  const buildCharges = !!rule && /deception/i.test(rule) && /separate offense/i.test(rule) && law.options.includes("2") && /How many offenses/i.test(ask);
  const selected = buildCharges ? law.options.findIndex(o => Number(o) === charges.length) : choice;
  const canSubmit = selected !== null && selected >= 0 && !busy && lock <= 0;
  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true); setError(""); sfx.lockCheck();
    try { await onPick(selected); }
    catch { setError(tr("The court connection was interrupted. Please submit again.")); }
    finally { setBusy(false); }
  };
  if (opening) return <Gavel text={tr("ORDER IN THE COURT!")} sub={tr("The evidence is ready for legal review.")} onDone={() => setOpening(false)} />;
  return <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/95 p-4">
    <section aria-label={tr("Legal review")} className="my-auto w-full max-w-2xl overflow-hidden rounded-lg border border-amber-600/50 bg-[#080a08] shadow-[0_0_50px_#14532d22]">
      <header className="flex items-center gap-4 border-b border-amber-900/60 bg-black p-5">
        <svg aria-hidden viewBox="0 0 64 64" className="h-12 w-12 shrink-0 text-amber-300" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M32 8v44M15 54h34M10 20h44M17 20 7 39h20L17 20Zm30 0L37 39h20L47 20Z"/><circle cx="32" cy="11" r={"3"} /></svg>
        <div className="flex-1"><p className="font-mono text-[9px] tracking-[0.25em] text-amber-600">{tr("CYBER & LAW SOCIETY // TRIBUNAL")}</p><h2 className="mt-1 font-serif text-2xl tracking-wide text-amber-100">{tr("The People v. Wellington")}</h2><p className="mt-1 font-mono text-[10px] tracking-widest text-neutral-500">{tr("EVIDENCE")}{String(law.stage + 1).padStart(2, "0")}{tr("· LEGAL REVIEW")}</p></div>
      </header>
      <div className="p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded border border-amber-900/50 bg-amber-950/10 p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-amber-500">{tr("§ Applicable rule")}</p><p className="mt-3 text-sm leading-relaxed text-amber-50/80">{tr(rule ?? law.question)}</p></div>
          <div className="rounded border border-green-900/60 bg-green-950/10 p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-green-400">{tr("Exhibit // Established facts")}</p><p className="mt-3 text-sm leading-relaxed text-neutral-300">{tr(facts ?? "Review the evidence presented.")}</p></div>
        </div>
        <p className="mt-5 font-serif text-lg text-white">{tr(ask)}</p>
        {buildCharges ? <>
          <p className="mt-2 text-xs text-neutral-500">{tr("Select each distinct offense supported by the rule. Count incidents, not individual passwords.")}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{[tr("Deception — impersonating a trusted network"), tr("Data theft — copying student passwords")].map((label, i) => <button key={label} aria-pressed={charges.includes(i)} disabled={busy || lock > 0} onClick={() => { setCharges(old => old.includes(i) ? old.filter(n => n !== i) : [...old, i]); sfx.wireSelect(); }} className={`rounded border p-4 text-left text-sm transition disabled:opacity-40 ${charges.includes(i) ? "border-green-400 bg-green-950/30 text-green-200" : "border-neutral-800 bg-black text-neutral-400 hover:border-amber-600"}`}><span className="mb-2 block font-mono text-[10px] tracking-widest text-amber-500">{tr("COUNT")}{String(i+1).padStart(2,"0")} {charges.includes(i) ? tr("// FILED") : tr("// REVIEW")}</span>{tr(label)}</button>)}</div>
          <p role="status" className="mt-3 font-mono text-xs text-green-300">{charges.length}{tr("offense")}{charges.length === 1 ? "" : "s"}{tr("in proposed charges")}</p>
        </> : <div className="mt-4 grid gap-2 sm:grid-cols-2">{law.options.map((option, i) => <button key={i} aria-pressed={choice === i} disabled={busy || lock > 0} onClick={() => { setChoice(i); sfx.wireSelect(); }} className={`flex items-center gap-3 rounded border p-3 text-left text-sm transition disabled:opacity-40 ${choice === i ? "border-green-400 bg-green-950/30 text-green-200" : "border-neutral-800 bg-black text-neutral-300 hover:border-amber-600"}`}><span className="font-mono text-xs text-amber-500">{String.fromCharCode(65+i)}</span>{tr(option)}</button>)}</div>}
        {lock > 0 && <div role="alert" className="mt-4 border-l-2 border-red-500 bg-red-950/20 p-3"><p className="font-mono text-xs tracking-widest text-red-300">{tr("OBJECTION SUSTAINED")}</p><p className="mt-1 text-xs text-neutral-400">{tr("Review the rule and facts. You can revise your submission in")}{lock}s.</p></div>}
        {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-800 pt-4"><span className="font-mono text-[9px] tracking-widest text-neutral-600">{tr("COURT RECORD // AWAITING RULING")}</span><button disabled={!canSubmit} onClick={() => void submit()} className="rounded border border-amber-500/70 bg-amber-950/20 px-5 py-3 font-mono text-xs text-amber-200 hover:bg-amber-900/30 disabled:opacity-30">{busy ? tr("Filing…") : buildCharges ? tr("Submit charges") : tr("Submit ruling")}</button></div>
        <p className="mt-4 text-[10px] text-neutral-600">{tr("Simplified game rules for this activity. Not legal advice.")}</p>
      </div>
    </section>
  </div>;
}
