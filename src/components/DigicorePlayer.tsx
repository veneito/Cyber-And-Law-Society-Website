import { useEffect, useRef, useState } from "react";
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2 } from "lucide-react";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Fake streaming app: one track, everything but play/pause/seek/volume is decoration.
export function DigicorePlayer() {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(0);
  const [volume, setVolume] = useState(0.8);
  useEffect(() => { const el = audio.current; return () => el?.pause(); }, []);
  useEffect(() => { if (audio.current) audio.current.volume = volume; }, [volume]);
  const toggle = () => { const el = audio.current; if (!el) return; if (el.paused) void el.play().catch(() => {}); else el.pause(); };
  return <div className="-m-4 flex h-[calc(100%+2rem)] flex-col justify-between bg-gradient-to-b from-[#1b3a2a] to-[#121212] p-5 font-sans text-white">
    <audio ref={audio} src="/assets/digicore-digital-ripples-v1.mp3" preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); setTime(0); }} onTimeUpdate={e => setTime(e.currentTarget.currentTime)} onLoadedMetadata={e => setLength(e.currentTarget.duration)} />
    <p className="text-xs font-bold uppercase tracking-widest text-neutral-300">Now playing</p>
    <div className="flex flex-col items-center gap-4">
      <div aria-hidden="true" className={`flex aspect-square w-48 max-w-full items-center justify-center rounded-md bg-[conic-gradient(from_200deg,#0ff,#7b2cff,#ff2a8a,#0ff)] text-6xl shadow-[0_12px_40px_#000a] ${playing ? "animate-pulse" : ""}`}><span className="mix-blend-overlay">◬</span></div>
      <div className="text-center"><h2 className="text-xl font-bold">Digicore</h2><p className="text-sm text-neutral-400">Unknown artist</p></div>
    </div>
    <div>
      <input aria-label="Seek" type="range" min={0} max={length || 1} step={0.1} value={time} onChange={e => { const t = Number(e.target.value); if (audio.current) audio.current.currentTime = t; setTime(t); }} className="w-full accent-[#1ed760]" />
      <div className="flex justify-between text-[10px] text-neutral-400"><span>{fmt(time)}</span><span>{fmt(length)}</span></div>
      <div className="mt-2 flex items-center justify-center gap-5 text-neutral-300">
        <Shuffle size={16} aria-hidden="true" /><SkipBack size={20} aria-hidden="true" />
        <button aria-label={playing ? "Pause" : "Play"} onClick={toggle} className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black hover:scale-105">{playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}</button>
        <SkipForward size={20} aria-hidden="true" /><Repeat size={16} aria-hidden="true" />
      </div>
      <label className="mt-3 flex items-center justify-center gap-2 text-neutral-400"><Volume2 size={14} aria-hidden="true" /><input aria-label="Volume" type="range" min={0} max={1} step={0.05} value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-28 accent-[#1ed760]" /></label>
    </div>
  </div>;
}
