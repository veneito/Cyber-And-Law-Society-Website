import { language, t as tr } from "../i18n/language";
import { useState } from "react";
import { sfx } from "./sound";
const PUZZLES: Record<string, [string, string, string, string, string]> = {
  "Shift decoder": [tr("Caesar’s dispatch"), tr("A Roman courier brings Julius Caesar a message. Each letter was shifted forward three places. Recover the city name."), "URPH", "Move each letter back 3: U → R, R → O, P → M, H → E.", "ROME"],
  "Number decoder": [tr("The numbered archive"), tr("Letters are stored as positions in the alphabet. Recover the three-letter word."), "11 · 5 · 25", "A = 1, B = 2, … Z = 26. Count each number separately.", "KEY"],
  "Stepping shift decoder": [tr("The advancing lock"), tr("Each letter moved forward by a different amount: 1, then 2, then 3, then 4. Reverse the shifts."), "M Q F O", "M − 1 = L. Continue with Q − 2, F − 3, O − 4.", "LOCK"],
  "Symbol decoder": [tr("The glyph seal"), tr("Use Bea’s symbol key to reveal the four-letter command. These are the same glyphs used in the evidence cipher."), "☿ ♀ ♌ ☽", "☿ = O    ♀ = P    ♌ = E    ☽ = N", tr("OPEN")],
};
export function DecoderGate({ title, children }: { title: string; children: React.ReactNode }) {
  const key = "decoder-training:" + language + ":" + title;
  const [unlocked, setUnlocked] = useState(() => { try { return sessionStorage.getItem(key) === "1"; } catch { return false; } });
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [dial, setDial] = useState(0);
  const spanish: typeof PUZZLES = {
 "Shift decoder": ["El mensaje de César", "Julio César espera el nombre de una ciudad. Cada letra avanzó tres posiciones. Usa el dial para recuperarlo.", "URPD", "Retrocede tres posiciones por letra: U → R.", "ROMA"],
 "Number decoder": ["El archivo numerado", "Recupera la palabra usando A=1, B=2… Z=26.", "19 · 15 · 12", "La primera letra es S. Cuenta las posiciones de cada letra.", "SOL"],
 "Stepping shift decoder": ["La cerradura progresiva", "Cada letra avanzó 1, 2, 3, 4 y 5 posiciones. Retrocede para recuperar una palabra de cinco letras.", "D N D Z J", "D − 1 = C. Luego N − 2 = L. Continúa aumentando el desplazamiento.", "CLAVE"],
 "Symbol decoder": ["El sello de símbolos", "Traduce la orden de cuatro letras usando la clave de símbolos de Bea.", "♈ ♉ ♃ ♌", "♈ = A    ♉ = B    ♃ = R    ♌ = E", "ABRE"],
};
  const [name, story, cipher, clue, solution] = (language === 'es' ? spanish : PUZZLES)[title];
  return <details className="rounded-lg border border-green-900/60 bg-black/80 p-3">
    <summary className="cursor-pointer font-mono text-sm text-white">{tr(title)} <span className="text-[9px] text-green-500">{unlocked ? tr("ONLINE") : tr("LOCKED")}</span></summary>
    <div className="mt-3 space-y-2 text-sm">{unlocked ? children : <form onSubmit={e => {
      e.preventDefault();
      if (answer.toUpperCase().replace(/[^A-Z]/g, "") === solution) { setUnlocked(true); sfx.unlock(); try { sessionStorage.setItem(key, "1"); } catch { /* unavailable */ } }
      else { setWrong(true); sfx.accessDenied(); }
    }}>
      <h3 className="font-mono text-xs uppercase text-green-300">{name}</h3>
      <p className="mt-3 text-xs leading-relaxed text-neutral-400">{story}</p>
      <p className="mt-3 rounded border border-green-900 p-3 text-center font-mono text-lg tracking-widest text-green-300" style={{ fontVariantEmoji: "text" }}>{cipher}</p>
      {title === "Shift decoder" && <label className="mt-3 block text-xs text-neutral-400">{tr("Alphabet dial: move back")}{dial}<input type="range" min="0" max="25" value={dial} onChange={e => { setDial(Number(e.target.value)); sfx.ringTurn(false); }} className="mt-2 w-full accent-green-400" /><span className="mt-2 block text-center font-mono text-green-300">{[...cipher].map(c => String.fromCharCode((c.charCodeAt(0) - 65 - dial + 26) % 26 + 65)).join("")}</span></label>}
      <label className="mt-3 block text-xs text-neutral-400">{tr("Recovered word")}<input required autoComplete={"off"} value={answer} onChange={e => { setAnswer(e.target.value); setWrong(false); }} className="mt-2 w-full rounded border border-neutral-700 bg-black px-2 py-2 font-mono text-sm text-white" /></label>
      {wrong && <p role="alert" className="mt-2 text-xs text-red-300">{tr("Not quite. Check the cipher rule and try again.")}</p>}
      <button className="mt-3 rounded border border-green-500 px-3 py-2 text-xs text-green-300 hover:bg-green-500/10">{tr("Unlock decoder")}</button>
      <button type="button" onClick={() => setHint(!hint)} aria-expanded={hint} className="ml-3 text-xs text-neutral-500">{hint ? tr("Hide clue") : tr("Show clue")}</button>
      {hint && <p className="mt-3 text-xs leading-relaxed text-green-400">{clue}</p>}
    </form>}</div>
  </details>;
}
