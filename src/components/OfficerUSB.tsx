import { OnlineUSBNotice } from "./OnlineUSBNotice";
import { USBLectern } from "./USBLectern";
import { useEffect, useState } from "react";
import { t as tr } from "../i18n/language";
import { correctFloor, correctItem } from "../../shared/usb-location.mjs";

export function OfficerUSB({ onRecover }: { onRecover: (location: { floor: string; item: string }) => Promise<boolean> }) {
  const [step, setStep] = useState<"floor" | "item" | "fetching" | "ready">("floor");
  const [floor, setFloor] = useState("");
  const [item, setItem] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (step !== "fetching") return;
    const timer = window.setTimeout(() => setStep("ready"), matchMedia("(prefers-reduced-motion: reduce)").matches ? 300 : 2800);
    return () => clearTimeout(timer);
  }, [step]);
  const prompt = step === "floor" ? tr("Which floor is the USB on?") : tr("What item is the USB sitting on?");
  return <section aria-label={tr("Officer dispatch")} className="mx-auto w-full max-w-2xl overflow-hidden rounded-lg border border-green-900 bg-black font-mono text-green-300 shadow-2xl">
    <div className="border-b border-green-900 bg-neutral-950 px-4 py-3 text-xs tracking-widest">PS &gt; {tr("OFFICER DISPATCH // USB RECOVERY")}</div>
    <div className="space-y-5 p-5 sm:p-8">
      <OnlineUSBNotice />
      <p className="text-white">&gt; {tr("Officer sent to fetch your team's USB. Stand by.")}</p>
      <p className="text-sm text-neutral-400">{tr("Tell the officer where you found it in the library simulation.")}</p>
      <USBLectern recovered={step === "ready"} />
      {step !== "floor" && <p className="break-words text-sm">&gt; {tr("Floor confirmed:")} {floor}</p>}
      {(step === "floor" || step === "item") && <form className="space-y-3" onSubmit={e => {
        e.preventDefault();
        if (!(step === "floor" ? correctFloor(floor) : correctItem(item))) {
          setError(step === "floor" ? tr("That floor does not match the signal. Check the simulation and try again.") : tr("The officer cannot locate it there. Describe the item you saw under the USB."));
          return;
        }
        setError(""); setStep(step === "floor" ? "item" : "fetching");
      }}>
        <label htmlFor={"usb-" + step} className="block text-white">{prompt}</label>
        <input key={step} id={"usb-" + step} autoFocus required maxLength={160} autoComplete="off" value={step === "floor" ? floor : item} onChange={e => { if (step === "floor") setFloor(e.target.value); else setItem(e.target.value); setError(""); }} className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-3 text-white focus:border-green-400" />
        <button className="rounded bg-green-400 px-4 py-2 font-semibold text-black hover:bg-green-300">{tr("Send directions")}</button>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      </form>}
      {step === "fetching" && <div role="status" className="space-y-4"><p>&gt; {tr("Directions received. Officer moving to the USB…")}</p><p className="text-white">{tr("Stand by. Retrieving your team's drive…")} ▌</p></div>}
      {step === "ready" && <>
        <p role="status" className="text-white">&gt; {tr("USB secured. Your team's drive is ready for signature verification.")}</p>
        <button disabled={busy} className="rounded bg-green-400 px-4 py-2 font-semibold text-black hover:bg-green-300 disabled:opacity-40" onClick={async () => {
          setBusy(true);setError("");
          try { if (!await onRecover({ floor, item })) setError(tr("Verification failed. Please try again.")); }
          catch { setError(tr("Connection interrupted. Please try again.")); }
          finally { setBusy(false); }
        }}>{busy ? tr("Checking…") : tr("Verify recovered USB")}</button>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      </>}
    </div>
  </section>;
}
