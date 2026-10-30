import { useEffect, useState } from "react";
import { t as tr } from "../i18n/language";

export function TeamAssignment({ team, onDone }: { team: string; onDone: () => void }) {
  const [reduced] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [progress, setProgress] = useState(reduced ? 100 : 0);
  useEffect(() => {
    const timers = reduced ? [] : [12, 36, 58, 76, 92, 100].map((value, i) =>
      window.setTimeout(() => setProgress(value), 350 + i * 450));
    timers.push(window.setTimeout(onDone, reduced ? 500 : 3400));
    return () => timers.forEach(clearTimeout);
  }, [onDone, reduced]);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-5 font-mono text-green-300" role="status" aria-label={tr("Assigning your team")}>
    <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-green-900 bg-black shadow-2xl">
      <div className="border-b border-green-900 bg-neutral-950 px-4 py-2 text-xs text-slate-200">Windows PowerShell · WELLINGTON CASE</div>
      <div className="space-y-5 p-5 text-sm sm:p-8">
        <p className="text-white">PS C:\Wellington&gt; Initialize-Investigation</p>
        <p className="text-slate-300">&gt; {tr("Team assignment confirmed.")}</p>
        <p className="text-xl font-bold text-white sm:text-3xl">{tr("You are")} {team}.</p>
        <p>{tr("Loading investigation…")} {progress}%</p>
        <div role="progressbar" aria-label={tr("Loading investigation…")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="h-3 border border-green-300/40 bg-black/40 p-0.5">
          <div className="h-full bg-green-300" style={{ width: progress + "%" }} />
        </div>
        <p aria-hidden="true" className="text-xs text-green-200">[{"█".repeat(Math.floor(progress / 5)).padEnd(20, "·")}] {progress}%</p>
        <p className="text-slate-300">&gt; {progress === 100 ? tr("Ready. Opening team setup…") : tr("Preparing your case file…")} <span aria-hidden="true">▌</span></p>
      </div>
    </div>
  </div>;
}
