import { t as tr } from "../i18n/language";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { sfx } from "./sound";
type Clip = { idle: string; frames: { art: string; duration: number }[] };
let cached: Promise<Clip> | undefined;
export function CourtJudge({ children, reaction, smacks = false }: { children: ReactNode; reaction?: number | null; smacks?: boolean }) {
  const [clip, setClip] = useState<Clip | null>(null);
  const [frame, setFrame] = useState(-1);
  const [width, setWidth] = useState(400);
  const [failed, setFailed] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let dead = false;
    cached ??= fetch("/case/judge-ascii.json?v=2").then(r => { if(!r.ok) throw Error("Judge unavailable"); return r.json() as Promise<Clip>; }).catch(e => { cached=undefined; throw e; });
    cached.then(c => { if(!dead)setClip(c); }).catch(() => { if(!dead)setFailed(true); });
    return () => { dead=true; };
  }, []);
  useEffect(() => {
    const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
    if(viewport.current) observer.observe(viewport.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if(reaction == null || !clip || matchMedia("(prefers-reduced-motion: reduce)").matches) { setFrame(-1); return; }
    let timer: ReturnType<typeof setTimeout>;
    let index=0;
    const advance=()=>{
      if(index>=clip.frames.length){setFrame(-1);return;}
      setFrame(index);
      if (smacks && [2, 4, 7, 9, 12].includes(index)) sfx.gavelHit();
      timer=setTimeout(advance,clip.frames[index++].duration);
    };
    advance();
    return () => clearTimeout(timer);
  }, [reaction, clip, smacks]);
  return <div className="mb-5 rounded border border-orange-700/40 bg-black p-4">
    <div className="flex items-center justify-between font-mono text-[9px] tracking-widest text-orange-600"><span>{tr("THE PEOPLE v. WELLINGTON")}</span><span>{tr("COURT IN SESSION")}</span></div>
    <div ref={viewport} role="img" aria-label="Orange ASCII judge, reacting when a charge is selected" className="mx-auto my-4 w-full max-w-lg overflow-hidden">
      <pre aria-hidden className="m-0 text-orange-400" style={{fontFamily:'"Courier New", monospace',fontSize:width/(160*0.6),lineHeight:1.2,fontWeight:700,minHeight:width*49/80}}>{(frame>=0 ? clip?.frames[frame]?.art : clip?.idle) ?? (failed ? tr("[ COURT IN SESSION ]") : tr("[ CONNECTING TO COURT… ]"))}</pre>
    </div>
    <div className="border-t border-orange-900 pt-3"><p className="mb-2 font-mono text-[9px] tracking-widest text-orange-600">{tr("THE JUDGE")}</p><p className="font-serif text-lg leading-relaxed text-orange-200">{children}</p></div>
  </div>;
}
