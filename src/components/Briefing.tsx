import { useEffect, useRef, useState } from "react";
import baconArt from "./bacon.txt?raw";
import rookieArt from "./rookie.txt?raw";
import happyArt from "./bacon-happy.txt?raw";
import angryArt from "./bacon-angry.txt?raw";
import scaredArt from "./bacon-scared.txt?raw";

// Subtitles for /case/briefing.mp3: [seconds into the audio, text], from where the pauses fall in the recording.
// Re-time by hand if the recording changes.
const LEAD = 0.4; // show each line this many seconds before its time, so text never trails the voice
export type Line = [number, string];
const LINES: Line[] = [
  [0.7, "Rookie. Can you hear me? Good. Keep your eyes on the screen."],
  [6.9, "I'll make this quick. We don't have much time."],
  [11.1, "Her name is Bea F. Wellington."],
  [14.0, "Hacker. Dangerous."],
  [18.1, "She set up a fake open Wi-Fi network. Made it look like the University of South Alabama."],
  [24.1, "Students and staff connected. Every login they typed, she stole."],
  [30.95, "Then she used those logins to plant ransomware on the university's computers."],
  [37.4, "And now she's gone."],
  [40.2, "Your mission: track Bea F. Wellington down."],
  [43.65, "Follow her trail. Find the evidence."],
  [45.0, "Prove what she did."],
  [48.0, "And finally, bring her to justice."],
  [53.25, "But listen carefully. She knows you're coming. She'll fight back. Expect her to counterhack you."],
  [59.1, "When she does, stay calm. Think fast. Don't let her win."],
  [63.5, "This is your moment, rookie. The whole team is counting on you."],
  [68.0, "Good luck, soldier."],
];

export const Briefing = ({ onDone }: { onDone: () => void }) => <Codec src="/case/briefing.mp3" lines={LINES} onDone={onDone} />;

// Found the building: Chris congratulates the team. Timed to /case/found-building.mp3 from its pauses.
export const BUILDING_LINES: Line[] = [
  [0.0, "Well done, rookie."],
  [1.6, "You found the building."],
  [3.4, "The Marx Library."],
  [4.9, "Bea was there."],
  [6.35, "But the building is only the start."],
  [9.0, "Now it's time to find the precise location."],
  [12.2, "Something is hidden inside."],
  [14.15, "Search every corner."],
  [15.55, "Good luck."],
];
export const FoundBuilding = ({ onDone }: { onDone: () => void }) => <Codec src="/case/found-building.mp3" lines={BUILDING_LINES} onDone={onDone} />;

// All six messages decoded: Chris sends the team to court. Timed to /case/to-court.mp3 from its pause.
export const COURT_LINES: Line[] = [
  [0.0, "You got all the evidence."],
  [1.75, "Now let's take this porker to court."],
];
export const ToCourt = ({ onDone }: { onDone: () => void }) => <Codec src="/case/to-court.mp3" lines={COURT_LINES} onDone={onDone} />;

// After the arrest: Chris wraps up the case. Timed to /case/end-call.mp3 from its pauses.
export const END_LINES: Line[] = [
  [0.35, "Great work, detectives."],
  [2.25, "Bea F. Wellington is behind bars. The university is safe."],
  [6.05, "Case closed."],
];
export const EndCall = ({ onDone }: { onDone: () => void }) => <Codec src="/case/end-call.mp3" lines={END_LINES} onDone={onDone} />;

// Codec-style call from Chris P. Bacon. The button click is what unlocks audio.
export function Codec({ src, lines, onDone }: { src: string; lines: Line[]; onDone: () => void }) {
  const audio = useRef<HTMLAudioElement>(null);
  const done = useRef(onDone);
  useEffect(() => { done.current = onDone; });
  const [started, setStarted] = useState(false);
  const [line, setLine] = useState(-1);
  const [time, setTime] = useState(0);
  const [failed, setFailed] = useState(false); // audio missing: show the text with a Continue button instead
  const debug = location.search.includes("debug"); // ?debug shows the playback time, for re-timing the subtitles
  const box = useRef<HTMLDivElement>(null);
  const stop = useRef(() => {});
  useEffect(() => () => stop.current(), []);
  const answer = () => {
    setStarted(true);
    try { // Chris's portrait pulses with the loudness of his voice
      const ctx = new AudioContext();
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      ctx.createMediaElementSource(audio.current!).connect(an);
      an.connect(ctx.destination);
      const buf = new Uint8Array(an.fftSize);
      let raf = 0, level = 0;
      const frame = () => {
        an.getByteTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += (v - 128) ** 2;
        level = Math.max(Math.min(1, Math.sqrt(sum / buf.length) / 12), level * 0.85); // quick attack, smooth fall
        if (box.current) {
          box.current.style.transform = `scale(${1 + level * 0.1})`;
          box.current.style.boxShadow = `0 0 ${level * 28}px rgba(74,222,128,${0.2 + level * 0.6})`;
        }
        raf = requestAnimationFrame(frame);
      };
      frame();
      stop.current = () => { cancelAnimationFrame(raf); ctx.close(); };
    } catch { /* no Web Audio: the portrait just stays still */ }
    audio.current?.play().catch(() => {}); // blocked or missing audio: onError shows the text instead
  };
  const tick = () => {
    const t = audio.current?.currentTime ?? 0;
    setLine(lines.filter(([s]) => s - LEAD <= t).length - 1);
    setTime(t);
  };
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black px-4">
      <audio ref={audio} src={src} preload="auto" onError={() => setFailed(true)} onTimeUpdate={tick} onEnded={() => done.current()} />
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-green-400">Codec // 140.85</p>
      <div className="mt-6 flex w-full max-w-2xl items-center justify-between gap-4">
        <Portrait label="Chris P. Bacon" sub="FBI" boxRef={box} />
        <div className="flex h-16 flex-1 items-center justify-center gap-1" aria-hidden>
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} className="h-14 w-1.5 rounded bg-green-400 will-change-transform" style={{ transform: "scaleY(0.1)", animation: started ? `codec-bar ${0.5 + (i % 5) * 0.13}s ease-in-out ${i * 0.04}s infinite alternate` : undefined }} />
          ))}
        </div>
        <Portrait label="You" sub="Rookie" />
      </div>
      <div className="mt-8 min-h-[7rem] w-full max-w-2xl rounded-lg border border-green-400/60 bg-black p-5 text-center">
        {started
          ? <p className="font-mono text-lg text-green-300">{failed ? lines.map((l) => l[1]).join(" ") : lines[line]?.[1] ?? ""}</p>
          : <p className="font-mono text-green-300">Incoming call from Chris P. Bacon, FBI.</p>}
      </div>
      {!started && <button onClick={answer} className="mt-6 rounded-lg bg-green-400 px-6 py-2 font-semibold text-black hover:bg-green-300">Answer call</button>}
      {started && <button onClick={() => { audio.current?.pause(); done.current(); }} className="mt-6 text-xs text-neutral-500 hover:text-white">{failed ? "Continue" : "Skip"}</button>}
      {debug && <p className="fixed bottom-4 right-4 font-mono text-2xl text-yellow-300">{time.toFixed(1)}</p>}
      <style>{`@keyframes codec-bar{from{transform:scaleY(.1)}to{transform:scaleY(1)}}`}</style>
    </div>
  );
}

// Scale monospace art (8px font, 8px lines, 0.6em chars) to fit the 156px inside of the square frame.
const fit = (a: string) => {
  const rows = a.trimEnd().split(/\r?\n/);
  return Math.min(156 / (Math.max(...rows.map((r) => r.length)) * 4.8), 156 / (rows.length * 8));
};

// mood swaps Chris's picture: pleased after a right answer, angry after a wrong one, scared during a hack.
export function Portrait({ label, sub, boxRef, mood }: { label: string; sub: string; boxRef?: React.RefObject<HTMLDivElement | null>; mood?: "happy" | "angry" | "scared" }) {
  const art = label !== "You";
  const pic = art ? (mood === "happy" ? happyArt : mood === "angry" ? angryArt : mood === "scared" ? scaredArt : baconArt) : rookieArt;
  return (
    <div className="w-40 text-center">
      <div ref={boxRef} className={`h-40 w-40 bg-black relative flex items-center justify-center overflow-hidden rounded-lg border-2 border-green-400 font-mono text-4xl text-green-400`}>
        <pre aria-hidden className="absolute left-1/2 top-1/2 text-[8px] leading-[8px]" style={{ transform: `translate(-50%,-50%) scale(${fit(pic)})` }}>{pic}</pre>
      </div>
      <p className="mt-2 font-mono text-xs text-white">{label}</p>
      <p className="font-mono text-[10px] uppercase text-neutral-500">{sub}</p>
    </div>
  );
}
