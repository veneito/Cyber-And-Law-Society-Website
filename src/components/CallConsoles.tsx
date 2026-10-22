import { useState } from "react";
import { AsciiRunner } from "./AsciiRunner";

const NODES = ["RELAY 01", "RELAY 02", "ARCHIVE", "UPLINK", "GATEWAY", "LOCAL"];

// Optional toys only: these never change the call audio, clues or game state.
export function CallConsoles({ onPitchChange }: { onPitchChange: (value: number) => void }) {
  const [frequency, setFrequency] = useState(50);
  const [scanned, setScanned] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const quality = Math.max(12, 100 - Math.abs(frequency - 67) * 2);
  const panel = "call-console w-[min(15rem,calc((100vw-48rem)/2))] rounded-lg border border-green-400/60 bg-black p-4 font-mono text-green-300";
  return <div className="hidden xl:block">
    <aside aria-label="Optional signal tuner" className={`${panel} fixed left-4 top-1/2 -translate-y-1/2`}>
      <p className="text-[9px] tracking-[0.2em] text-neutral-500">COMMS // AUXILIARY</p>
      <h2 className="mt-2 text-xs tracking-wider">VOICE TUNER</h2>
      <div className="mt-5 flex h-20 items-center justify-center gap-1 border-y border-green-950 py-3" aria-hidden>{Array.from({ length: 20 }, (_, i) => <span key={i} className="w-1 bg-green-400/30 transition-[height] duration-200" style={{ height: `${8 + Math.abs(Math.sin(i * 0.8 + frequency * 0.1)) * quality * 0.55}px` }} />)}</div>
      <label htmlFor="codec-tuner" className="mt-5 block text-[10px] text-neutral-500">VOICE PITCH</label>
      <input id="codec-tuner" type="range" min="0" max="100" value={frequency} aria-valuetext={`${((frequency - 50) * 0.04).toFixed(1)} semitones`} onChange={e => { const value = Number(e.target.value); setFrequency(value); onPitchChange(value); }} className="mt-3 w-full accent-green-300 opacity-60 hover:opacity-100 focus:opacity-100" />
      <div className="mt-3 flex justify-between text-[10px]"><span>LOW</span><span>{frequency === 50 ? "NATURAL" : `${frequency > 50 ? "+" : ""}${((frequency - 50) * 0.04).toFixed(1)} ST`}</span><span>HIGH</span></div>
      <div className="mt-3 h-px bg-neutral-900"><div className="h-full bg-green-400/30 transition-[width]" style={{ width: `${quality}%` }} /></div>
      <button onClick={() => { setFrequency(50); onPitchChange(50); }} className="mt-4 w-full rounded border border-neutral-800 py-2 text-[10px] hover:border-green-400">Reset voice</button>
      <p className="mt-4 border-t border-green-950 pt-3 text-[9px] text-neutral-600">AUX CHANNEL · encrypted</p>
    </aside>
    <aside aria-label="Optional relay scanner" className={`${panel} fixed right-4 top-1/2 -translate-y-1/2`}>
      {scanned.length === 6 ? <AsciiRunner onReset={() => { setScanned([]); setActive(null); }} /> : <div>
      <p className="text-[9px] tracking-[0.2em] text-neutral-500">NETWORK // DIAGNOSTICS</p>
      <h2 className="mt-2 text-xs tracking-wider">RELAY SCANNER</h2>
      <div className="relative mt-4 grid grid-cols-2 gap-3 border border-neutral-900 p-3">
        <div aria-hidden className="pointer-events-none absolute inset-x-1/2 inset-y-4 border-l border-dashed border-neutral-900" />
        {NODES.map((name, i) => <button key={name} aria-pressed={active === i} className={`relative rounded border p-2 text-center text-[8px] transition hover:border-green-300 focus-visible:outline-2 focus-visible:outline-green-300 ${scanned.includes(i) ? "border-green-400/40 bg-black" : "border-neutral-800 bg-black"}`} onClick={() => { setActive(i); setScanned(old => old.includes(i) ? old : [...old, i]); }}><span aria-hidden className="mb-2 block text-base text-green-300/60">{scanned.includes(i) ? "◉" : "◇"}</span>{name}</button>)}
      </div>
      <p role="status" className="mt-4 min-h-9 text-[10px] text-neutral-500">{active === null ? "Select a relay to inspect its connection." : `${NODES[active]} // reachable · link verified`}</p>
      <div className="mt-2 flex justify-between text-[9px]"><span>LINKS CHECKED</span><span>{scanned.length}/6</span></div>
      <button className="mt-3 w-full rounded border border-neutral-800 py-2 text-[10px] hover:border-green-400" onClick={() => { setScanned([]); setActive(null); }}>Reset scan</button>
      <p className="mt-4 border-t border-green-950 pt-3 text-[9px] text-neutral-600">LOCAL DIAGNOSTICS · sandbox</p>
      </div>}
    </aside>
  </div>;
}
