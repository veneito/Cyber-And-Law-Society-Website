import { useState } from "react";

const shift = (c: string, n: number) => String.fromCharCode(((c.charCodeAt(0) - 65 + n) % 26 + 26) % 26 + 65);
const mapLetters = (s: string, f: (c: string, i: number) => string) => {
  let i = 0;
  return s.toUpperCase().replace(/[A-Z]/g, (c) => f(c, i++));
};

const input = "w-full rounded border border-neutral-700 bg-black px-2 py-1 font-mono text-sm text-white";
const Box = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <details className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3">
    <summary className="cursor-pointer font-mono text-sm text-white">{title}</summary>
    <div className="mt-3 space-y-2 text-sm">{children}</div>
  </details>
);

function Caesar() {
  const [t, setT] = useState("");
  return (
    <Box title="Shift decoder">
      <p className="text-neutral-400">Paste text. Every possible shift is listed; look for the one that reads as English.</p>
      <input className={input} value={t} onChange={(e) => setT(e.target.value)} placeholder="Ciphertext" />
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
      <p className="text-neutral-400">Turns numbers into letters. Separate letters with dashes and words with slashes.</p>
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
      <p className="text-neutral-400">Each letter shifts by a bit more than the one before. Try different starting shifts and step sizes.</p>
      <input className={input} value={t} onChange={(e) => setT(e.target.value)} placeholder="Ciphertext" />
      <div className="flex gap-3 text-neutral-400">
        <label>Start <input type="number" min={0} max={25} value={start} onChange={(e) => setStart(+e.target.value)} className={`${input} w-16`} /></label>
        <label>Step <input type="number" min={0} max={25} value={step} onChange={(e) => setStep(+e.target.value)} className={`${input} w-16`} /></label>
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
      <p className="text-neutral-400">Paste the symbols, then assign a letter to each one using your key sheet.</p>
      <input className={input} value={t} onChange={(e) => setT(e.target.value)} placeholder="Paste symbols" />
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
      <h2 className="font-mono text-sm uppercase tracking-wide text-white">Decoder tools</h2>
      <p className="text-xs text-neutral-500">Nobody tells you which cipher is which. Try each tool.</p>
      <Caesar />
      <Numbers />
      <Stepping />
      <Symbols />
    </aside>
  );
}
