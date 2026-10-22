import { t as tr } from "../i18n/language";
import { useState } from "react";
import { DecoderGate } from "./DecoderGate";

const shift = (c: string, n: number) => String.fromCharCode(((c.charCodeAt(0) - 65 + n) % 26 + 26) % 26 + 65);
const mapLetters = (s: string, f: (c: string, i: number) => string) => {
  let i = 0;
  return s.toUpperCase().replace(/[A-Z]/g, (c) => f(c, i++));
};

const input = "w-full rounded border border-neutral-700 bg-black px-2 py-1 font-mono text-sm text-white";
const Box = DecoderGate;

function Caesar() {
  const [t, setT] = useState("");
  return (
    <Box title="Shift decoder">
      <p className="text-neutral-400">{tr("Paste text. Every possible shift is listed; look for the one that reads as English.")}</p>
      <input className={input} value={t} onChange={(e) => setT(e.target.value)} placeholder={tr("Ciphertext")} />
      {t && (
        <ul className="max-h-64 space-y-1 overflow-y-auto font-mono text-xs text-green-300">
          {Array.from({ length: 25 }, (_, k) => k + 1).map((n) => (
            <li key={n}><span className="text-neutral-500">{String(n).padStart(2, "0")}</span> {mapLetters(t, (c) => shift(c, -n))}</li>
          ))}
        </ul>
      )}
    </Box>
  );
}

function Numbers() {
  const [t, setT] = useState("");
  const out = t.split(/\s*\/\s*/).map((w) => w.split(/[-,\s]+/).filter(Boolean).map((n) => (+n >= 1 && +n <= 26 ? String.fromCharCode(64 + +n) : "?")).join("")).join(" ");
  return (
    <Box title="Number decoder">
      <p className="text-neutral-400">{tr("Turns numbers into letters. Separate letters with dashes and words with slashes.")}</p>
      <input className={input} value={t} onChange={(e) => setT(e.target.value)} placeholder="e.g. 3-1-20 / 2-1-7" />
      {t && <p className="font-mono text-green-300">{out}</p>}
    </Box>
  );
}

function Stepping() {
  const [t, setT] = useState("");
  const [start, setStart] = useState(1);
  const [step, setStep] = useState(1);
  return (
    <Box title="Stepping shift decoder">
      <p className="text-neutral-400">{tr("Each letter shifts by a bit more than the one before. Try different starting shifts and step sizes.")}</p>
      <input className={input} value={t} onChange={(e) => setT(e.target.value)} placeholder={tr("Ciphertext")} />
      <div className="flex gap-3 text-neutral-400">
        <label>{tr("Start")}<input type="number" min={0} max={25} value={start} onChange={(e) => setStart(+e.target.value)} className={`${input} w-16`} /></label>
        <label>{tr("Step")}<input type="number" min={0} max={25} value={step} onChange={(e) => setStep(+e.target.value)} className={`${input} w-16`} /></label>
      </div>
      {t && <p className="font-mono text-green-300">{mapLetters(t, (c, i) => shift(c, -(start + i * step)))}</p>}
    </Box>
  );
}

function Symbols() {
  const [t, setT] = useState("");
  const [map, setMap] = useState<Record<string, string>>({});
  const glyphs = [...new Set([...t].filter((c) => c.trim()))];
  return (
    <Box title="Symbol decoder">
      <p className="text-neutral-400">{tr("Paste the symbols, then assign a letter to each one using your key sheet.")}</p>
      <input className={input} value={t} onChange={(e) => setT(e.target.value)} placeholder={tr("Paste symbols")} />
      <div className="flex flex-wrap gap-2">
        {glyphs.map((g) => (
          <label key={g} className="flex items-center gap-1 text-lg text-green-300" style={{ fontVariantEmoji: "text" }}>
            {g}<input maxLength={1} value={map[g] ?? ""} onChange={(e) => setMap({ ...map, [g]: e.target.value.toUpperCase() })} className={`${input} w-8 text-center`} />
          </label>
        ))}
      </div>
      {t && <p className="font-mono text-green-300">{[...t].map((c) => (c.trim() ? map[c] || "_" : " ")).join("")}</p>}
    </Box>
  );
}

export function Decoders() {
  return (
    <aside className="space-y-3">
      <h2 className="font-mono text-sm uppercase tracking-wide text-white">{tr("Decoder tools")}</h2>
      <p className="text-xs text-neutral-500">{tr("Solve each training cipher to unlock its decoder.")}</p>
      <Caesar />
      <Numbers />
      <Stepping />
      <Symbols />
    </aside>
  );
}
