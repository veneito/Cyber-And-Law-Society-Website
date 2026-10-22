import { useState } from "react";
import { sfx } from "./sound";
const PUZZLES: Record<string, [string, string, string, string, string]> = {
  "Shift decoder": ["Caesar’s dispatch", "A Roman courier brings Julius Caesar a message. Each letter was shifted forward three places. Recover the city name.", "URPH", "Move each letter back 3: U → R, R → O, P → M, H → E.", "ROME"],
  "Number decoder": ["The numbered archive", "Letters are stored as positions in the alphabet. Recover the three-letter word.", "11 · 5 · 25", "A = 1, B = 2, … Z = 26. Count each number separately.", "KEY"],
  "Stepping shift decoder": ["The advancing lock", "Each letter moved forward by a different amount: 1, then 2, then 3, then 4. Reverse the shifts.", "M Q F O", "M − 1 = L. Continue with Q − 2, F − 3, O − 4.", "LOCK"],
  "Symbol decoder": ["The glyph seal", "Use Bea’s symbol key to reveal the four-letter command. These are the same glyphs used in the evidence cipher.", "☿ ♀ ♌ ☽", "☿ = O    ♀ = P    ♌ = E    ☽ = N", "OPEN"],
};
export function DecoderGate({ title, children }: { title: string; children: React.ReactNode }) {
  const key = "decoder-training:" + title;
  const [unlocked, setUnlocked] = useState(() => { try { return sessionStorage.getItem(key) === "1"; } catch { return false; } });
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [dial, setDial] = useState(0);
  const [name, story, cipher, clue, solution] = PUZZLES[title];
  return <details className="rounded-lg border border-green-900/60 bg-black/80 p-3">
    <summary className="cursor-pointer font-mono text-sm text-white">{title} <span className="text-[9px] text-green-500">{unlocked ? "ONLINE" : "LOCKED"}</span></summary>
    <div className="mt-3 space-y-2 text-sm">{unlocked ? children : <form onSubmit={e => {
      e.preventDefault();
      if (answer.toUpperCase().replace(/[^A-Z]/g, "") === solution) { setUnlocked(true); sfx.unlock(); try { sessionStorage.setItem(key, "1"); } catch { /* unavailable */ } }
      else { setWrong(true); sfx.accessDenied(); }
    }}>
      <h3 className="font-mono text-xs uppercase text-green-300">{name}</h3>
      <p className="mt-3 text-xs leading-relaxed text-neutral-400">{story}</p>
      <p className="mt-3 rounded border border-green-900 p-3 text-center font-mono text-lg tracking-widest text-green-300" style={{ fontVariantEmoji: "text" }}>{cipher}</p>
      {title === "Shift decoder" && <label className="mt-3 block text-xs text-neutral-400">Alphabet dial: move back {dial}<input type="range" min="0" max="25" value={dial} onChange={e => { setDial(Number(e.target.value)); sfx.ringTurn(false); }} className="mt-2 w-full accent-green-400" /><span className="mt-2 block text-center font-mono text-green-300">{[...cipher].map(c => String.fromCharCode((c.charCodeAt(0) - 65 - dial + 26) % 26 + 65)).join("")}</span></label>}
      <label className="mt-3 block text-xs text-neutral-400">Recovered word<input required autoComplete="off" value={answer} onChange={e => { setAnswer(e.target.value); setWrong(false); }} className="mt-2 w-full rounded border border-neutral-700 bg-black px-2 py-2 font-mono text-sm text-white" /></label>
      {wrong && <p role="alert" className="mt-2 text-xs text-red-300">Not quite. Check the cipher rule and try again.</p>}
      <button className="mt-3 rounded border border-green-500 px-3 py-2 text-xs text-green-300 hover:bg-green-500/10">Unlock decoder</button>
      <button type="button" onClick={() => setHint(!hint)} aria-expanded={hint} className="ml-3 text-xs text-neutral-500">{hint ? "Hide clue" : "Show clue"}</button>
      {hint && <p className="mt-3 text-xs leading-relaxed text-green-400">{clue}</p>}
    </form>}</div>
  </details>;
}
