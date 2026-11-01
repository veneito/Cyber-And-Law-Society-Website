import { BitcoinReceipt } from "./BitcoinReceipt";
import { PhotoEvidenceDrive, FinalRescueDrive } from "./PhotoEvidence";
import { deliverRaphaelDm } from "./investigationMessages";
import { SolaceArt } from "./SolaceArt";
import { useState } from "react";
import { t as tr } from "../i18n/language";
import { ONION_SITES } from "./TorApp";

// shortcut: the password ships in the page source, fine for a club game, move it server-side if prizes are ever at stake.
const PASSWORD = "SOLACE";
let unlocked = false; // module-level so closing the window keeps the drive open until reload

const launchTor = () => window.dispatchEvent(new CustomEvent("launch-app", { detail: "tor" }));

export function FilesApp() {
  const [open, setOpen] = useState(unlocked);
  const [pw, setPw] = useState("");



  const [bad, setBad] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [reading, setReading] = useState<"readme" | "solace" | "receipt" | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.trim().toUpperCase() === PASSWORD) { unlocked = true; setOpen(true); deliverRaphaelDm(); } else setBad(true);
  };
  const file = "flex w-24 flex-col items-center gap-1 rounded-lg p-2 text-xs text-neutral-200 hover:bg-neutral-800 focus:outline focus:outline-green-300";
  return (
    <div className="font-mono">
      <p className="mb-3 text-xs text-neutral-500">{tr("Connected devices")}</p>
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
        <p className="text-green-200">⛁ deity_drive <span className="ml-2 text-xs text-neutral-400">{open ? tr("Unlocked") : tr("Locked")}</span></p>
        {!open && (
          <form onSubmit={submit} className="mt-3 flex flex-col gap-2">
            <label className="text-xs text-neutral-400" htmlFor="usb-pw">{tr("Enter the password to unlock this drive.")}</label>
            <div className="flex gap-2">
              <input id="usb-pw" value={pw} onChange={e => { setPw(e.target.value); setBad(false); }} autoComplete="off" spellCheck={false} className="min-w-0 flex-1 rounded bg-black px-2 py-1 text-green-200 focus:outline focus:outline-green-400" />
              <button className="rounded border border-green-500 px-3 py-1 text-green-200 hover:bg-green-950">{tr("Unlock")}</button>
            </div>
            <button type="button" onClick={() => setShowHint(value => !value)} aria-expanded={showHint} aria-controls="drive-password-hint" className="self-start text-xs text-neutral-400 underline decoration-neutral-600 underline-offset-4 hover:text-green-200 focus-visible:outline focus-visible:outline-green-300">{tr("Forgot the password?")}</button>
            {showHint && <p id="drive-password-hint" className="rounded border border-green-900 bg-black/40 p-3 text-xs leading-relaxed text-green-200">{tr("Who do we worship? Name the deity that woke in the wires. The Hollow Dawn remembers.")}</p>}
            {bad && <p role="alert" className="text-xs text-red-400">{tr("Wrong password.")}</p>}
          </form>
        )}
        {open && !reading && (
          <div className="mt-3 flex flex-wrap gap-4">
            <button onDoubleClick={launchTor} onKeyDown={e => { if (e.key === "Enter") launchTor(); }} className={file}>
              <img src="/assets/tor-icon-v1.webp" alt="" className="h-10 w-10 object-contain contrast-[1.2] mix-blend-screen" />tor.exe
            </button>
            <button onDoubleClick={() => setReading("readme")} onKeyDown={e => { if (e.key === "Enter") setReading("readme"); }} className={file}>
              <span className="text-4xl text-green-300">☰</span>README.txt
            </button>
<button onDoubleClick={() => setReading("receipt")} onKeyDown={e => { if(e.key === "Enter") setReading("receipt"); }} className={file}><span className="text-4xl text-amber-200">▤</span>receipt</button>
<button onDoubleClick={() => setReading("solace")} onKeyDown={e => { if (e.key === "Enter") setReading("solace"); }} className={file}><span aria-hidden="true" className="flex h-10 w-10 items-center justify-center text-3xl text-[#d292d2]">◬</span>SOLACE.asc</button>
          </div>
        )}
        {open && reading && (
          <div className="mt-3 space-y-3 text-neutral-300">
            <button onClick={() => setReading(null)} className="text-xs text-green-300 hover:underline">← {tr("Back")}</button>
            {reading === "receipt" ? <BitcoinReceipt /> : reading === "solace" ? <SolaceArt /> : <><p>{tr("If you are reading this, you were chosen. Open tor.exe and follow the signal.")}</p>
            <ul className="space-y-1">{ONION_SITES.map(s => <li key={s.url}><span className="text-green-200">{s.url}</span> {"-"} {tr(s.title)}</li>)}</ul></>}
          </div>
        )}
      </div>
      {open && <><PhotoEvidenceDrive /><FinalRescueDrive /></>}
      {open && !reading && <p className="mt-2 text-[10px] text-neutral-500">{tr("Double-click a file to open it.")}</p>}
    </div>
  );
}



