import { t as tr } from "../i18n/language";
import { useEffect, useRef, useState } from "react";

type Frame = { art: string; duration: number };
let clip: Promise<Frame[]> | undefined;

export function AsciiRunner({ onReset }: { onReset: () => void }) {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [failed, setFailed] = useState(false);
  const [width, setWidth] = useState(160);
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    clip ??= fetch("/case/subway-ascii.json?v=2").then(r => { if (!r.ok) throw Error("Clip unavailable"); return r.json() as Promise<Frame[]>; }).catch(error => { clip = undefined; throw error; });
    clip.then(data => { if (!cancelled) setFrames(data); }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
    if (viewport.current) observer.observe(viewport.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || !frames.length) return;
    const timer = setTimeout(() => setIndex(i => (i + 1) % frames.length), frames[index].duration);
    return () => clearTimeout(timer);
  }, [frames, index, playing]);
  return <div className="runner-reveal">
    <p className="text-[9px] tracking-[0.2em] text-neutral-500">{tr("ALL RELAYS VERIFIED")}</p>
    <h2 className="mt-2 text-xs tracking-wider">{tr("BONUS FEED // UNLOCKED")}</h2>
    <div ref={viewport} className="relative mt-4 overflow-hidden rounded border border-neutral-800 bg-black" role="img" aria-label="Subway Surfers rendered as animated green ASCII art">
      <pre aria-hidden className="m-0 text-green-300" style={{ fontFamily: '"Courier New", monospace', fontSize: width / (112 * 0.6), lineHeight: 1.2, minHeight: width * (100 / 56), fontWeight: 700 }}>{frames[index]?.art ?? (failed ? tr("FEED UNAVAILABLE") : tr("CONNECTING…"))}</pre>
    </div>
    <div className="mt-3 flex gap-2"><button disabled={!frames.length} aria-pressed={playing} onClick={() => setPlaying(!playing)} className="flex-1 rounded border border-neutral-800 py-2 text-[10px] hover:border-green-400">{playing ? tr("Pause feed") : tr("Play feed")}</button><button onClick={onReset} className="flex-1 rounded border border-neutral-800 py-2 text-[10px] hover:border-green-400">{tr("Reset relays")}</button></div>
  </div>;
}
