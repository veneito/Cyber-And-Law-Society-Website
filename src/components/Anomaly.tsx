import { useEffect, useState } from "react";

export const FIXED_KEY = "cls-bug-fixed";
export const isFixed = () => {
  try { return localStorage.getItem(FIXED_KEY) === "1"; } catch { return false; }
};

const QUESTIONS = [
  { q: "What is phishing?", a: ["A fake message that tricks you into giving up info", "A way to speed up Wi-Fi", "A type of firewall"], ok: 0 },
  { q: "In a criminal case, who has the burden of proof?", a: ["The defendant", "The prosecution", "The jury"], ok: 1 },
  { q: "What does two-factor authentication add?", a: ["A faster login", "A second proof it's really you", "A longer password"], ok: 1 },
  { q: "What does a subpoena do?", a: ["Orders someone to testify or hand over evidence", "Declares a verdict", "Sets bail"], ok: 0 },
  { q: "Which password is the strongest?", a: ["password123", "Jonclub2024", "t9!Rv#4pLq2$"], ok: 2 },
];

function Quiz({ onDone, onClose }: { onDone: () => void; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState(false);
  const q = QUESTIONS[i];
  const pick = (n: number) => {
    if (n !== q.ok) return setWrong(true);
    setWrong(false);
    if (i + 1 === QUESTIONS.length) onDone();
    else setI(i + 1);
  };
  return (
    <div role="dialog" aria-modal="true" aria-label="Fix the bug" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-xl border border-green-400/40 bg-neutral-950 p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-green-400">Patch {i + 1}/{QUESTIONS.length}</p>
        <h3 className="mt-2 text-xl font-semibold text-white">{q.q}</h3>
        <div className="mt-5 flex flex-col gap-3">
          {q.a.map((t, n) => (
            <button key={t} onClick={() => pick(n)} className="rounded-lg border border-neutral-700 px-4 py-3 text-left text-neutral-200 hover:border-green-400">{t}</button>
          ))}
        </div>
        <p className="mt-4 h-5 text-sm text-red-400" role="status">{wrong ? "Patch failed. Try again." : ""}</p>
        <button onClick={onClose} className="mt-2 text-sm text-neutral-500 hover:text-white">Close</button>
      </div>
    </div>
  );
}

// Every visitor gets their own hiding place, kept in localStorage; restarting re-rolls it.
const SPOTS = ["hero", "about", "events", "officers", "faq", "contact", "meetings"] as const;
// The hunt only exists once a visitor has opened the officer page.
export const startHunt = () => { try { localStorage.setItem("cls-hunt", "1"); } catch { /* hunt just won't start */ } };
const huntOn = () => { try { return localStorage.getItem("cls-hunt") === "1"; } catch { return false; } };
const SEED_KEY = "cls-bug-seed";
const newSeed = () => Math.floor(Math.random() * 0x7fffffff);
const readSeed = () => {
  try {
    const v = Number(localStorage.getItem(SEED_KEY));
    if (v) return v;
    const n = newSeed() || 1;
    localStorage.setItem(SEED_KEY, String(n));
    return n;
  } catch { return newSeed() || 1; }
};

export function Anomaly({ spot }: { spot: (typeof SPOTS)[number] }) {
  const [seed, setSeed] = useState(readSeed);
  const [fixed, setFixed] = useState(isFixed);
  const [flash, setFlash] = useState(false);
  const [open, setOpen] = useState(false);
  const here = huntOn() && SPOTS[seed % SPOTS.length] === spot;

  useEffect(() => {
    if (fixed || !here) return;
    let t: number;
    const loop = (on: boolean) => {
      setFlash(on);
      t = window.setTimeout(() => loop(!on), on ? 120 + Math.random() * 300 : 1500 + Math.random() * 4000);
    };
    loop(false);
    return () => clearTimeout(t); // flashes are >1.5s apart, under the 3/sec flash limit, so no reduced-motion bail-out
  }, [fixed, here]);

  if (!here) return null;

  const done = () => {
    try { localStorage.setItem(FIXED_KEY, "1"); } catch { /* gate just won't persist */ }
    setFixed(true);
  };
  const restart = () => {
    const n = newSeed() || 1;
    try { localStorage.removeItem(FIXED_KEY); localStorage.setItem(SEED_KEY, String(n)); } catch { /* nothing stored */ }
    setFixed(false);
    setOpen(false);
    setSeed(n);
  };

  return (
    <div className="relative h-0">
      <button
        onClick={() => setOpen(true)}
        aria-label={fixed ? "Bug fixed" : "Anomaly detected: click to fix the bug"}
        className={`absolute z-10 h-28 w-28 overflow-hidden rounded-lg border sm:h-36 sm:w-36 ${fixed ? "border-green-400/50" : "border-red-500/40"}`}
        style={{ left: `${2 + ((seed >> 8) % 60)}%`, top: `-${40 + ((seed >> 16) % 80)}px` }}
      >
        <img src="/assets/meetings/normal.jpg" alt="" className="h-full w-full object-cover" />
        <img src="/assets/meetings/glitch.webp" alt="" className={`absolute inset-0 h-full w-full object-cover ${flash ? "opacity-100" : "opacity-0"}`} />
      </button>
      {open && (fixed ? (
        <div role="dialog" aria-modal="true" aria-label="Bug fixed" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-xl border border-green-400/40 bg-neutral-950 p-6">
            <p className="font-mono text-sm text-green-400">&gt; Bug fixed. Nice work.</p>
            <p className="mt-2 text-neutral-400">Head back to the officer page to fill out the application.</p>
            <div className="mt-5 flex gap-3">
              <a href="/become-an-officer" className="rounded-lg bg-green-400 px-4 py-2 font-semibold text-black hover:bg-green-300">Apply</a>
              <button onClick={restart} className="rounded-lg border border-neutral-700 px-4 py-2 text-white hover:border-green-400">Restart the bug</button>
              <button onClick={() => setOpen(false)} className="px-2 text-sm text-neutral-500 hover:text-white">Close</button>
            </div>
          </div>
        </div>
      ) : <Quiz onDone={done} onClose={() => setOpen(false)} />)}
    </div>
  );
}
