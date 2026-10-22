import { t as tr } from "../i18n/language";
import { sfx } from "./sound";
import { CallConsoles } from "./CallConsoles";
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
  [0.7, tr("Rookie. Can you hear me? Good. Keep your eyes on the screen.")],
  [6.9, tr("I'll make this quick. We don't have much time.")],
  [11.1, tr("Her name is Bea F. Wellington.")],
  [14.0, tr("Hacker. Dangerous.")],
  [18.1, tr("She set up a fake open Wi-Fi network. Made it look like the University of South Alabama.")],
  [24.1, tr("Students and staff connected. Every login they typed, she stole.")],
  [30.95, tr("Then she used those logins to plant ransomware on the university's computers.")],
  [37.4, tr("And now she's gone.")],
  [40.2, tr("Your mission: track Bea F. Wellington down.")],
  [43.65, tr("Follow her trail. Find the evidence.")],
  [45.0, tr("Prove what she did.")],
  [48.0, tr("And finally, bring her to justice.")],
  [53.25, tr("But listen carefully. She knows you're coming. She'll fight back. Expect her to counterhack you.")],
  [59.1, tr("When she does, stay calm. Think fast. Don't let her win.")],
  [63.5, tr("This is your moment, rookie. The whole team is counting on you.")],
  [68.0, tr("Good luck, soldier.")],
];

export const Briefing = ({ onDone }: { onDone: () => void }) => <Codec src="/case/briefing.mp3" lines={LINES} onDone={onDone} />;

// Found the building: Chris congratulates the team. Timed to /case/found-building.mp3 from its pauses.
export const BUILDING_LINES: Line[] = [
  [0.0, tr("Well done, rookie.")],
  [1.6, tr("You found the building.")],
  [3.4, tr("The Marx Library.")],
  [4.9, tr("Bea was there.")],
  [6.35, tr("But the building is only the start.")],
  [9.0, tr("Now it's time to find the precise location.")],
  [12.2, tr("Something is hidden inside.")],
  [14.15, tr("Search every corner.")],
  [15.55, tr("Good luck.")],
];
export const FoundBuilding = ({ onDone }: { onDone: () => void }) => <Codec src="/case/found-building.mp3" lines={BUILDING_LINES} onDone={onDone} />;

// All six messages decoded: Chris sends the team to court. Timed to /case/to-court.mp3 from its pause.
export const COURT_LINES: Line[] = [
  [0.0, tr("You got all the evidence.")],
  [1.75, tr("Now let's take this porker to court.")],
];
export const ToCourt = ({ onDone }: { onDone: () => void }) => <Codec src="/case/to-court.mp3" lines={COURT_LINES} onDone={onDone} />;

// After the arrest: Chris wraps up the case. Timed to /case/end-call.mp3 from its pauses.
export const END_LINES: Line[] = [
  [0.35, tr("Great work, detectives.")],
  [2.25, tr("Bea F. Wellington is behind bars. The university is safe.")],
  [6.05, tr("Case closed.")],
];
export const EndCall = ({ onDone }: { onDone: () => void }) => <Codec src="/case/end-call.mp3" lines={END_LINES} onDone={onDone} />;

// Codec-style call from Chris P. Bacon. The button click is what unlocks audio.
export function Codec({ src, lines, onDone }: { src: string; lines: Line[]; onDone: () => void }) {
  const audio = useRef<HTMLAudioElement>(null);
  const envelope = useRef<GainNode | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const fadeCall = () => {
    const player = audio.current;
    const node = envelope.current;
    const ctx = audioContext.current;
    if (!player || !node || !ctx) return;
    const remaining = Number.isFinite(player.duration) ? player.duration - player.currentTime : Infinity;
    const level = src === "/case/briefing.mp3" ? 1 : Math.max(0.2, Math.min(1, player.currentTime / 0.8, remaining / 0.8));
    node.gain.setTargetAtTime(level, ctx.currentTime, 0.04);
  };
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
  useEffect(() => (started ? undefined : sfx.ring()), [started]); // rings until the call is answered
  const answer = () => {
    setStarted(true);
    try { // Chris's portrait pulses with the loudness of his voice
      const ctx = new AudioContext();
      audioContext.current = ctx;
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      const gain = ctx.createGain();
      const fade = ctx.createGain();
      fade.gain.value = src === "/case/briefing.mp3" ? 1 : 0.2;
      envelope.current = fade;
      gain.gain.value = src === "/case/briefing.mp3" ? 1 : 3;
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -6;
      limiter.knee.value = 6;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.15;
      ctx.createMediaElementSource(audio.current!).connect(gain);
      gain.connect(fade);
      fade.connect(limiter);
      limiter.connect(an);
      an.connect(ctx.destination);
      const buf = new Uint8Array(an.fftSize);
      let raf = 0, level = 0;
      const frame = () => {
        fadeCall();
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
      stop.current = () => { cancelAnimationFrame(raf); envelope.current = null; audioContext.current = null; void ctx.close(); };
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
      {!started && <div className="codec-incoming flex w-full max-w-md flex-col items-center text-center">
        <p className="font-mono text-[10px] tracking-[0.35em] text-green-600">{tr("ENCRYPTED LINE // 140.85")}</p>
        <div aria-hidden className="codec-phone my-8 flex h-24 w-24 items-center justify-center rounded-full border border-green-400/60 bg-black text-green-300">
          <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth={"2"}><path d="M12 8l7 8-4 6c3 6 6 9 12 12l6-4 8 7c-2 6-6 8-11 6C17 38 9 30 5 18 3 13 6 9 12 8Z" /><path d="M29 8c6 1 10 5 11 11M28 15c3 0 5 2 5 5" /></svg>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-green-400">{tr("Incoming call")}</p>
        <h2 className="mt-4 font-mono text-2xl text-green-300">Chris P. Bacon</h2>
        <p className="mt-2 font-mono text-xs tracking-widest text-neutral-500">{tr("FBI // SECURE CONNECTION")}</p>
        <button onClick={answer} className="mt-8 rounded-lg border border-green-400/60 bg-black px-8 py-3 font-mono text-sm text-green-300 transition hover:bg-green-400/10 focus-visible:outline-2 focus-visible:outline-green-300">{tr("Answer phone")}</button>
      </div>}
      {started && <div className="codec-conversation flex w-full flex-col items-center">
      <CallConsoles onPitchChange={value => {
        if (!audio.current) return;
        audio.current.preservesPitch = false;
        audio.current.playbackRate = 2 ** (((value - 50) * 0.04) / 12);
      }} />
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-green-400">Codec // 140.85</p>
      <div className="mt-6 flex w-full max-w-2xl items-center justify-between gap-4">
        <Portrait label="Chris P. Bacon" sub="FBI" boxRef={box} />
        <div className="flex h-16 flex-1 items-center justify-center gap-1" aria-hidden>
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} className="h-14 w-1.5 rounded bg-green-400 will-change-transform" style={{ transform: "scaleY(0.1)", animation: started ? `codec-bar ${0.5 + (i % 5) * 0.13}s ease-in-out ${i * 0.04}s infinite alternate` : undefined }} />
          ))}
        </div>
        <Portrait label="You" sub={tr("Rookie")} />
      </div>
      <div className="mt-8 min-h-[7rem] w-full max-w-2xl rounded-lg border border-green-400/60 bg-black p-5 text-center">
        {started
          ? <p className="font-mono text-lg text-green-300">{failed ? lines.map((l) => tr(l[1])).join(" ") : tr(lines[line]?.[1] ?? "")}</p>
          : <p className="font-mono text-green-300">{tr("Incoming call from Chris P. Bacon, FBI.")}</p>}
      </div>
      {started && <button onClick={() => { audio.current?.pause(); done.current(); }} className="mt-6 text-xs text-neutral-500 hover:text-white">{failed ? tr("Continue") : tr("Skip")}</button>}
      {debug && <p className="fixed bottom-4 right-4 font-mono text-2xl text-yellow-300">{time.toFixed(1)}</p>}
      </div>}
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
      <p className="mt-2 font-mono text-xs text-white">{tr(label)}</p>
      <p className="font-mono text-[10px] uppercase text-neutral-500">{sub}</p>
    </div>
  );
}
