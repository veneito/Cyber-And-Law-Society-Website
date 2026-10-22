import { useState } from "react";
import { sfx } from "./sound";

export function PhotoRestore({ onRestore, disabled }: { onRestore: () => void; disabled: boolean }) {
  const [tiles, setTiles] = useState(() => Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 3)));
  const [restored, setRestored] = useState(false);
  return <div className="mt-4 w-full max-w-md rounded-xl border border-green-400/60 bg-black p-4">
    <div className="flex justify-between font-mono text-[10px] tracking-widest text-green-400"><span>PHOTO // RECOVERY</span><span>{tiles.filter(n => n === 0).length}/4 ALIGNED</span></div>
    <p className="mt-3 text-sm text-neutral-400">Bea scrambled the evidence. Tap each tile to rotate it until all four pieces line up.</p>
    <div className="mt-4 grid grid-cols-2 gap-1 overflow-hidden rounded border border-green-900">
      {tiles.map((rotation, i) => <button key={i} disabled={disabled || restored} aria-label={`Rotate photo tile ${i + 1}, ${rotation === 0 ? "aligned" : "misaligned"}`} className="relative aspect-square overflow-hidden bg-black focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-green-300" onClick={() => {
        const updated = tiles.map((v, n) => n === i ? (v + 1) % 4 : v);
        setTiles(updated); sfx.ringTurn(updated[i] === 0);
        if (updated.every(n => n === 0)) { setRestored(true); sfx.chime(); }
      }}>
        <span aria-hidden className="absolute inset-0 transition-transform duration-200 motion-reduce:transition-none" style={{ backgroundImage: "url('/case/evidence-01.jpg')", backgroundSize: "200% 200%", backgroundPosition: `${i % 2 * 100}% ${Math.floor(i / 2) * 100}%`, transform: `rotate(${rotation * 90}deg)` }} />
        <span className="absolute bottom-1 left-1 bg-black/80 px-1 font-mono text-[9px] text-green-300">0{i + 1} {rotation === 0 ? "✓" : "↻"}</span>
      </button>)}
    </div>
    <p role="status" className="mt-3 font-mono text-xs text-green-400">{restored ? "IMAGE RESTORED // evidence ready" : "Restore the frame to unlock the original file."}</p>
    {restored && <button autoFocus onClick={onRestore} className="mt-3 rounded-lg border border-green-400 px-4 py-2 text-sm text-green-300 hover:bg-green-400/10">Open recovered photo</button>}
  </div>;
}
