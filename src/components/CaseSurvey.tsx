import { useState } from "react";
import portrait from "./chiguire.txt?raw";
import { t } from "../i18n/language";
import { sfx } from "./sound";
export function CaseSurvey({ code, submitted = false, preview = false }: { code: string; submitted?: boolean; preview?: boolean }) {
  const [open, setOpen] = useState(!submitted);
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(submitted);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const questions = [["enjoyment", "How much did you enjoy the investigation?", "Not much", "Loved it"], ["difficulty", "How challenging was it?", "Too easy", "Too hard"], ["learning", "How much did you learn?", "Very little", "A lot"]];
  const question=questions[step];
  if(!open) return <button onClick={()=>setOpen(true)} className="mt-6 rounded border border-green-700 bg-black px-4 py-3 text-sm text-green-300">{t(sent?'View survey confirmation':'Talk to El Chigüire')}</button>;
  return <aside aria-label={t("Debrief with El Chigüire")} className="fixed bottom-20 right-4 z-[45] max-h-[calc(100dvh_-_6rem)] sm:bottom-4 sm:max-h-[90dvh] w-[calc(100vw_-_2rem)] max-w-md overflow-y-auto rounded-xl border border-green-400/60 bg-black/95 p-5 shadow-[0_0_60px_#000]">
    <div className="flex items-center justify-between"><p className="font-mono text-[9px] tracking-widest text-green-600">{t("DEBRIEF // OPTIONAL")}</p><button aria-label={t("Close survey")} onClick={()=>setOpen(false)} className="px-2 text-neutral-400 hover:text-white">×</button></div>
    <div className="mx-auto mt-3 flex aspect-square w-40 items-center justify-center overflow-hidden rounded-lg border border-green-400/70 bg-black" role="img" aria-label={t("El Chigüire, a capybara rendered in green ASCII")}>
      <pre aria-hidden className="m-0 shrink-0 text-green-400" style={{fontFamily:'"Courier New",monospace',fontSize:160/(88*0.6),lineHeight:1.2,fontWeight:700}}>{portrait}</pre>
    </div>
    <p className="mt-2 text-center font-mono text-sm text-green-200">El Chigüire</p>
    <p className="text-center font-mono text-[9px] tracking-widest text-neutral-500">{t("YOUR DEBRIEF GUIDE")}</p>
    {sent ? <><p role="status" className="mt-4 rounded border border-green-900 p-4 text-sm text-green-200">{t(preview?"Preview complete—no response was saved.":"Thank you—your feedback has been saved.")}</p><button onClick={()=>setOpen(false)} className="mt-4 rounded border border-green-700 px-4 py-2 text-green-300">{t("Back to results")}</button></> : <form onSubmit={async e=>{
      e.preventDefault();if(busy)return;
      if(step<3){if(!ratings[question[0]])return;setStep(step+1);sfx.beep(true);return;}
      setBusy(true);setError("");
      if(preview){setSent(true);setBusy(false);return;}
      try{const r=await fetch('/api/case/survey',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,...ratings,feedback})});if(!r.ok)throw Error('Could not save your feedback. Please try again.');setSent(true);}
      catch(err){setError(err instanceof Error?err.message:'Could not save feedback.');}finally{setBusy(false);}
    }}>
      <div className="mt-4 rounded border border-green-800/70 p-4" aria-live="polite"><p className="font-mono text-[9px] text-green-600">{t("QUESTION")} {step+1}/4</p><p className="mt-2 text-base leading-relaxed text-green-200">{step===0&&<span>{t("Hi! I’m El Chigüire. Before you go, a few quick questions.")} </span>}{t(step<3?question[1]:"What should we improve?")}</p></div>
      {step<3 ? <fieldset key={step} disabled={busy} className="mt-4"><legend className="sr-only">{t(question[1])}</legend><div className="flex gap-2">{[1,2,3,4,5].map(n=><label key={n} className={`flex h-12 flex-1 cursor-pointer items-center justify-center rounded border font-mono text-sm ${ratings[question[0]]===n?'border-green-400 bg-green-950 text-green-100':'border-neutral-800 text-neutral-400'}`}><input type="radio" required name={question[0]} value={n} checked={ratings[question[0]]===n} onChange={()=>{setRatings(old=>({...old,[question[0]]:n}));sfx.wireSelect();}} className="mr-1 accent-green-400"/>{n}</label>)}</div><div className="mt-2 flex justify-between text-xs text-neutral-500"><span>{t(question[2])}</span><span>{t(question[3])}</span></div></fieldset> : <label className="mt-4 block text-sm text-neutral-400">{t("Comments (optional)")}<textarea disabled={busy} maxLength={500} value={feedback} onChange={e=>setFeedback(e.target.value)} className="mt-2 min-h-24 w-full rounded border border-neutral-700 bg-black p-3 text-green-100" /></label>}
      {error&&<p role="alert" className="mt-3 text-sm text-red-300">{t(error)}</p>}
      <div className="mt-4 flex justify-between gap-2"><button type="button" disabled={busy} onClick={()=>step>0?setStep(step-1):setOpen(false)} className="rounded border border-neutral-800 px-4 py-2 text-sm text-neutral-400">{t(step>0?'Back':'Skip survey')}</button><button disabled={busy} className="rounded border border-green-500 px-5 py-2 text-sm text-green-200">{t(busy?'Saving…':step<3?'Next':'Submit feedback')}</button></div>
      <p className="mt-4 text-[10px] leading-relaxed text-neutral-600">{t("Optional · one response per team · does not affect your score. Feedback is shared with club organizers through Discord. Please don’t include personal information.")}</p>
    </form>}
  </aside>;
}
