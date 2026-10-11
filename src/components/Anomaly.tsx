import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Phage } from "./Phage";

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

// Quiet rising chime made with the browser's audio; skipped with reduced motion or if audio is unavailable.
function winSound() {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = new AudioContext();
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * 0.11;
      o.type = "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + 0.55);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch { /* no sound is fine */ }
}

function WinScreen({ secs, onRestart, onClose, onHide }: { secs: number | null; onRestart: () => void; onClose: () => void; onHide: () => void }) {
  const burst = useMemo(() => Array.from({ length: 36 }, () => {
    const a = Math.random() * 6.283, d = 90 + Math.random() * 190;
    return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, delay: Math.random() * 0.15 };
  }), []);
  const lines = ["> Anomaly isolated", `> Patches applied: ${QUESTIONS.length}/${QUESTIONS.length}`, ...(secs != null ? [`> Time to patch: ${secs}s`] : [])];
  const last = 0.5 + lines.length * 0.45;
  return (
    <div role="dialog" aria-modal="true" aria-label="Bug fixed" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="win-box relative w-full max-w-lg rounded-xl border border-green-400/70 bg-neutral-950 p-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl" aria-hidden><div className="win-scan" /></div>
        <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
          {burst.map((p, i) => (
            <span key={i} className="win-p" style={{ "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, animationDelay: `${0.25 + p.delay}s` } as React.CSSProperties} />
          ))}
        </div>
        <div className="relative font-mono text-sm text-green-400">
          {lines.map((l, i) => <p key={l} className="win-line" style={{ animationDelay: `${0.5 + i * 0.45}s` }}>{l}</p>)}
          <p className="win-line mt-3 text-2xl font-bold text-green-300 [text-shadow:0_0_14px_#4ade80]" style={{ animationDelay: `${last}s` }}>&gt; Bug fixed. Nice work.</p>
        </div>
        <p className="win-line relative mt-3 text-neutral-400" style={{ animationDelay: `${last + 0.3}s` }}>Head back to the officer page to fill out the application.</p>
        <div className="win-line relative mt-5 flex gap-3" style={{ animationDelay: `${last + 0.5}s` }}>
          <a href="/become-an-officer?from=win" onClick={onHide} className="rounded-lg bg-green-400 px-4 py-2 font-semibold text-black hover:bg-green-300">Apply</a>
          <button onClick={onRestart} className="rounded-lg border border-neutral-700 px-4 py-2 text-white hover:border-green-400">Restart the bug</button>
          <button onClick={onClose} className="px-2 text-sm text-neutral-500 hover:text-white">Close</button>
          <button onClick={onHide} className="px-2 text-sm text-neutral-500 hover:text-white">Hide bug</button>
        </div>
      </div>
    </div>
  );
}

// Looping boss music synthesised in the browser (no audio files): kick, bassline and a minor arpeggio, kept quiet.
function bossMusic() {
  try {
    const ctx = new AudioContext();
    ctx.resume();
    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    const STEP = 0.2; // 150 bpm eighth notes
    const BASS = [55, 55, 0, 55, 65.41, 0, 55, 0, 73.42, 73.42, 0, 73.42, 65.41, 0, 61.74, 0];
    const ARP = [220, 261.63, 329.63, 261.63, 220, 293.66, 349.23, 293.66];
    const tone = (type: OscillatorType, f: number, t: number, len: number, vol: number, cutoff = 4000) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = type; o.frequency.value = f; lp.frequency.value = cutoff;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.connect(lp).connect(g).connect(master);
      o.start(t); o.stop(t + len + 0.02);
    };
    let step = 0, next = ctx.currentTime + 0.05;
    const timer = setInterval(() => {
      while (next < ctx.currentTime + 0.4) {
        const b = BASS[step % 16];
        if (b) tone("sawtooth", b, next, STEP * 0.9, 0.07, 500);
        if (step % 4 === 0) { // kick: a sine that drops in pitch
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.frequency.setValueAtTime(140, next); o.frequency.exponentialRampToValueAtTime(40, next + 0.12);
          g.gain.setValueAtTime(0.12, next); g.gain.exponentialRampToValueAtTime(0.0001, next + 0.16);
          o.connect(g).connect(master); o.start(next); o.stop(next + 0.18);
        }
        if (step % 2 === 1) tone("triangle", ARP[(step >> 1) % 8] * (step % 32 >= 16 ? 2 : 1), next, STEP * 0.8, 0.03);
        next += STEP; step++;
      }
    }, 100);
    return {
      mute: (m: boolean) => { master.gain.value = m ? 0 : 0.5; },
      stop: () => { clearInterval(timer); ctx.close(); },
    };
  } catch { return null; /* no music is fine */ }
}

const CATCHES = 3;

// Final stage: a phage runs from section to section down the real page; scroll to find it and click it 3 times.
// It lives in page coordinates (not the window), so it does not follow the visitor. Holds still with reduced motion.
function Chase({ onCaught, onClose, onHide }: { onCaught: () => void; onClose: () => void; onHide: () => void }) {
  const [caught, setCaught] = useState(0);
  const pos = useRef({ x: 50, y: 0, sec: -1 }); // x in % of page width, y in page px
  const [p, setP] = useState({ x: 50, y: 0, r: 0 });
  const [muted, setMuted] = useState(false);
  const music = useRef<ReturnType<typeof bossMusic>>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    music.current = bossMusic();
    return () => { music.current?.stop(); music.current = null; };
  }, []);
  useEffect(() => { music.current?.mute(muted); }, [muted]);

  // Jump to a random point inside a different section than the current one.
  const hop = () => {
    const secs = [...document.querySelectorAll("section")];
    if (!secs.length) return;
    let i = Math.floor(Math.random() * secs.length);
    if (secs.length > 1 && i === pos.current.sec) i = (i + 1) % secs.length;
    const r = secs[i].getBoundingClientRect();
    const x = 8 + Math.random() * 84;
    const y = r.top + window.scrollY + 40 + Math.random() * Math.max(1, r.height - 120);
    const dx = ((x - pos.current.x) / 100) * window.innerWidth, dy = y - pos.current.y;
    pos.current = { x, y, sec: i };
    setP({ x, y, r: (Math.atan2(dy, dx) * 180) / Math.PI + 90 }); // head leads the way it runs
  };

  useEffect(() => {
    hop();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(hop, 3000);
    return () => clearInterval(t);
  }, []);

  const catchIt = () => {
    if (caught + 1 >= CATCHES) return onCaught();
    setCaught(caught + 1);
    hop();
  };

  return createPortal(
    <>
      {/* Fixed banner: the phage itself sits in the page, so the visitor scrolls to hunt it down. */}
      <div role="region" aria-label="Catch the phage" className="fixed left-1/2 top-20 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-green-400/40 bg-black/85 px-4 py-3 text-center backdrop-blur">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-green-400">Final patch {caught}/{CATCHES}</p>
        <h3 className="mt-1 text-lg font-semibold text-white">Catch the bacteriophage!</h3>
        <p className="text-sm text-neutral-400">It runs from section to section. Scroll to find it and click it {CATCHES} times.</p>
        <div className="mt-2 flex justify-center gap-4 text-sm text-neutral-500">
          <button onClick={onClose} className="hover:text-white">Close</button>
          <button onClick={onHide} className="hover:text-white">Hide bug</button>
          <button onClick={() => setMuted(!muted)} className="hover:text-white">{muted ? "Music off" : "Music on"}</button>
        </div>
      </div>
      {/* Health bar rides above the phage (separate from it so it does not rotate) */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-40 transition-all duration-[1500ms] ease-in-out"
        style={{ left: `${p.x}%`, top: p.y, transform: "translate(-50%, -4.75rem)" }}
      >
        <p className="text-center font-mono text-[10px] uppercase tracking-widest text-red-400">T4 Phage</p>
        <div className="mt-0.5 flex w-20 gap-0.5">
          {Array.from({ length: CATCHES }, (_, n) => (
            <span key={n} className={`h-2 flex-1 rounded-sm border border-red-500/70 transition-colors ${n < CATCHES - caught ? "bg-red-500 shadow-[0_0_6px_#ef4444]" : "bg-transparent"}`} />
          ))}
        </div>
      </div>
      <button
        onClick={catchIt}
        aria-label="Catch the phage"
        className="absolute z-40 p-4 text-green-300 transition-all duration-[1500ms] ease-in-out"
        style={{ left: `${p.x}%`, top: p.y, transform: `translate(-50%, -50%) rotate(${p.r}deg)` }}
      >
        <Phage className="phage-run h-20 w-16" />
      </button>
    </>,
    document.body,
  );
}

function Quiz({ onDone, onClose, onHide, onChase }: { onDone: (secs: number) => void; onClose: () => void; onHide: () => void; onChase: () => void }) {
  const start = useRef(Date.now());
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [chase, setChase] = useState(false);
  const q = QUESTIONS[i];
  const pick = (n: number) => {
    if (n !== q.ok) return setWrong(true);
    setWrong(false);
    if (i + 1 === QUESTIONS.length) { setChase(true); onChase(); }
    else setI(i + 1);
  };
  if (chase) return <Chase onCaught={() => onDone(Math.round((Date.now() - start.current) / 1000))} onClose={onClose} onHide={onHide} />;
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
        <div className="mt-2 flex gap-4 text-sm text-neutral-500">
          <button onClick={onClose} className="hover:text-white">Close</button>
          <button onClick={onHide} className="hover:text-white">Hide bug</button>
        </div>
      </div>
    </div>
  );
}

// Every visitor gets their own hiding place, kept in localStorage; restarting re-rolls it.
const SPOTS = ["hero", "about", "events", "officers", "faq", "contact", "meetings"] as const;
// The hunt only exists once a visitor has opened the officer page.
const HUNT_KEY = "cls-hunt";
export const startHunt = () => { try { localStorage.setItem(HUNT_KEY, "1"); } catch { /* hunt just won't start */ } };
const huntOn = () => { try { return localStorage.getItem(HUNT_KEY) === "1"; } catch { return false; } };
const HIDE_EVENT = "cls-bug-hide";
const SEED_KEY = "cls-bug-seed";
const RESTART_EVENT = "cls-bug-restart";
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

// "Play again" on the officer page: unfix the bug, re-roll its hiding place and switch the hunt on.
export const resetHunt = () => {
  try { localStorage.removeItem(FIXED_KEY); localStorage.setItem(SEED_KEY, String(newSeed() || 1)); } catch { /* nothing stored */ }
  startHunt();
};

export function Anomaly({ spot }: { spot: (typeof SPOTS)[number] }) {
  const [seed, setSeed] = useState(readSeed);
  const [fixed, setFixed] = useState(isFixed);
  const [flash, setFlash] = useState(false);
  const [open, setOpen] = useState(false);
  const [chasing, setChasing] = useState(false); // the glitch image steps aside while the phage is on the loose
  const [secs, setSecs] = useState<number | null>(null); // time of this session's win; null if it was fixed earlier
  const [hidden, setHidden] = useState(false);
  const here = !hidden && huntOn() && SPOTS[seed % SPOTS.length] === spot;

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

  // Each section has its own Anomaly instance; restart re-rolls the spot for all of them at once.
  useEffect(() => {
    const onRestart = (e: Event) => { setSeed((e as CustomEvent<number>).detail); setFixed(false); };
    const onHide = () => { setOpen(false); setHidden(true); };
    window.addEventListener(RESTART_EVENT, onRestart);
    window.addEventListener(HIDE_EVENT, onHide);
    return () => { window.removeEventListener(RESTART_EVENT, onRestart); window.removeEventListener(HIDE_EVENT, onHide); };
  }, []);

  if (!here) return null;

  const done = (s: number) => {
    try { localStorage.setItem(FIXED_KEY, "1"); } catch { /* gate just won't persist */ }
    setSecs(s);
    winSound(); // only on a fresh win, not when reopening the fixed bug
    setFixed(true);
  };
  // Switches the hunt off until the visitor next opens the officer page (which calls startHunt).
  const hide = () => {
    try { localStorage.removeItem(HUNT_KEY); } catch { /* nothing stored */ }
    window.dispatchEvent(new Event(HIDE_EVENT));
  };
  const restart = () => {
    const n = newSeed() || 1;
    try { localStorage.removeItem(FIXED_KEY); localStorage.setItem(SEED_KEY, String(n)); } catch { /* nothing stored */ }
    setOpen(false);
    window.dispatchEvent(new CustomEvent(RESTART_EVENT, { detail: n }));
  };

  return (
    <div className="relative h-0">
      <button
        onClick={() => { setChasing(false); setOpen(true); }}
        aria-label={fixed ? "Bug fixed" : "Anomaly detected: click to fix the bug"}
        className={`${chasing && open ? "hidden " : ""}absolute z-10 h-28 w-28 overflow-hidden rounded-lg border sm:h-36 sm:w-36 ${fixed ? "border-green-400/50" : "border-red-500/40"}`}
        style={{ left: `${2 + ((seed >> 8) % 60)}%`, top: `-${40 + ((seed >> 16) % 80)}px` }}
      >
        <img src="/assets/meetings/normal.jpg" alt="" className="h-full w-full object-cover" />
        <img src="/assets/meetings/glitch.webp" alt="" className={`absolute inset-0 h-full w-full object-cover ${flash ? "opacity-100" : "opacity-0"}`} />
      </button>
      {open && (fixed ? (
        <WinScreen secs={secs} onRestart={restart} onClose={() => setOpen(false)} onHide={hide} />
      ) : <Quiz onChase={() => setChasing(true)} onDone={done} onClose={() => setOpen(false)} onHide={hide} />)}
    </div>
  );
}
