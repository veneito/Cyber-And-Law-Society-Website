import { DemicubeWallpaper } from "./DemicubeWallpaper";
import { Maximize2, Copy, Power, Volume2, Wifi } from "lucide-react";
import { FakeBrowser } from "./FakeBrowser";
import { FilesApp } from "./FilesApp";
import { TorApp } from "./TorApp";
import { VpnApp } from "./VpnApp";
import { useEffect, useState, type ReactNode } from "react";
import { t as tr } from "../i18n/language";

// Relations below are placeholders for the last three; edit freely.
const PEOPLE: [string, string][] = [
  ["Julieta Dubois", "the missing woman, a physician assistant"],
  ["Chris P. Bacon", "one of her patients"],
  ["Enrique Iglesias", "a former coworker"],
  ["Tim Cheese", "her neighbor"],
  ["El Chiguire", "a friend of hers"],
  ["Raphael Pierre", "her ex-boyfriend"],
];

// Placeholder apps: swap `body` for the real activity content.
const APPS: { id: string; icon: ReactNode; title: string; body: ReactNode; w?: number; h?: number; hidden?: boolean }[] = [
  { id: "browser", icon: <img src="/assets/water-dog-v3.svg" alt="" className="h-[1em] w-[1em] object-contain contrast-[1.2] mix-blend-screen" />, title: "Water Dog", w: 640, h: 460, body: <FakeBrowser /> },
  { id: "readme", icon: "☰", title: "README.txt", w: 560, h: 440, body: (
    <div className="space-y-3 font-mono text-green-200">
      <p>{tr("You are an investigator searching for the location of a missing woman.")}</p>
      <p>{tr("Use social media to pinpoint her last known locations and uncover the information that will lead you to her.")}</p>
      <p>{tr("You already have suspicious flash drives found in her room. They are locked and need passwords.")}</p>
      <p className="pt-1 text-green-400">{tr("PEOPLE OF INTEREST")}</p>
      <ul className="space-y-1 text-neutral-300">
        {PEOPLE.map(([name, relation]) => <li key={name}><b className="text-green-200">{name}</b> {"-"} {tr(relation)}</li>)}
      </ul>
    </div>
  ) },
  { id: "files", icon: "▤", title: "Files", body: <FilesApp /> },
  { id: "terminal", icon: ">_", title: "Terminal", body: <p className="font-mono text-green-300">$ <span className="cursor">█</span></p> },
  { id: "notes", icon: "✎", title: "Notes", body: <p>{tr("Nothing here yet.")}</p> },
  { id: "vpn", icon: "⛨", title: "VPN", w: 360, h: 380, body: <VpnApp /> },
  // Hidden apps have no desktop icon; they open from another app (tor.exe on the USB).
  { id: "tor", icon: <img src="/assets/tor-icon-v1.webp" alt="" className="h-[1em] w-[1em] object-contain contrast-[1.2] mix-blend-screen" />, title: "Tor Browser", w: 640, h: 420, hidden: true, body: <TorApp /> },
];

type Win = { x: number; y: number; min: boolean; maximized?: boolean };

export function ActivityPage() {
  const [started, setStarted] = useState(false);
  return started ? <Desktop /> : (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-black px-4 text-center">
      <a href="/" className="absolute left-4 top-4 font-mono text-xs text-neutral-500 hover:text-green-400">← {tr("Back to site")}</a>
      <p className="font-mono text-sm uppercase tracking-widest text-green-400">{tr("Cyber and Law Society")}</p>
      <h1 className="font-mono text-3xl font-bold uppercase text-white sm:text-5xl">{tr("Activity")}</h1>
      <p className="max-w-md text-neutral-400">{tr("You will be taken to a virtual desktop. Start when your team is ready.")}</p>
      <button autoFocus onClick={() => { document.documentElement.requestFullscreen?.().catch(() => {}); setStarted(true); }} className="rounded-lg border border-green-400 bg-black px-8 py-3 font-mono text-sm uppercase tracking-wide text-green-200 shadow-[0_0_24px_rgba(74,222,128,0.25)] hover:bg-green-950">{tr("Start activity")}</button>
    </main>
  );
}

function Desktop() {
  // Array order = stacking order; the last window is on top.
  const [open, setOpen] = useState<[string, Win][]>([]);
  const [overview, setOverview] = useState(false);
  const [messageNotice, setMessageNotice] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const notify = () => {
      const browserWidth = Math.min(640, window.innerWidth - 16);
      setOpen(windows => {
        const browser = windows.find(([id]) => id === 'browser');
        return [...windows.filter(([id]) => id !== 'browser'), ['browser', { ...browser?.[1], x: Math.max(8, window.innerWidth - browserWidth - 16), y: 48, min: false, maximized: false }]];
      });
      setMessageNotice(true);
      clearTimeout(timer);
      timer = setTimeout(() => setMessageNotice(false), 5500);
    };
    window.addEventListener('raphael-dm', notify);
    return () => { window.removeEventListener('raphael-dm', notify); clearTimeout(timer); };
  }, []);
  const [solaceReleased, setSolaceReleased] = useState(false);
  useEffect(() => { const release = () => setSolaceReleased(true); window.addEventListener("release-solace", release); return () => window.removeEventListener("release-solace", release); }, []);
  const [now, setNow] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(i); }, []);

  const patch = (id: string, p: Partial<Win>) => setOpen(o => o.map(([k, w]) => k === id ? [k, { ...w, ...p }] : [k, w]));
  const focus = (id: string) => setOpen(o => { const hit = o.find(([k]) => k === id); return hit ? [...o.filter(([k]) => k !== id), hit] : o; });
  const launch = (id: string) => {
    setOverview(false);
    const hit = open.find(([k]) => k === id);
    if (hit) { patch(id, { min: false }); focus(id); }
    else setOpen(o => [...o, [id, { x: 120 + o.length * 28, y: 56 + o.length * 28, min: false }]]);
  };
  const top = open[open.length - 1];
  useEffect(() => {
    const onLaunch = (e: Event) => launch((e as CustomEvent<string>).detail);
    window.addEventListener("launch-app", onLaunch);
    return () => window.removeEventListener("launch-app", onLaunch);
  });

  return (
    <div className="relative h-dvh overflow-hidden bg-black text-neutral-200">
      {solaceReleased ? <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black">
        <svg width="0" height="0" className="absolute"><defs><filter id="solace-green"><feColorMatrix type="matrix" values="0.15 0.5 0.05 0 -0.06  0.3 1.05 0.1 0 -0.09  0.2 0.7 0.07 0 -0.065  0 0 0 1 0" /></filter></defs></svg>
        <img src="/assets/cult-symbol-v1.webp" alt="" className="solace-wallpaper-burn h-full w-full object-contain" style={{ filter: "url(#solace-green)", mixBlendMode: "screen" }} />
        <img src="/assets/cult-symbol-v1.webp" alt="" className="solace-wallpaper-ember absolute inset-0 h-full w-full object-contain" style={{ filter: "url(#solace-green) brightness(2) drop-shadow(0 0 4px #7bf1a8)", mixBlendMode: "screen" }} />
      </div> : <DemicubeWallpaper />}
      {/* Desktop icons: double-click to open, like GNOME's desktop */}
      <div className="absolute left-3 top-12 flex flex-col gap-2">
        {APPS.filter(a => !a.hidden).map(a => (
          <button key={a.id} onDoubleClick={() => launch(a.id)} onKeyDown={e => { if (e.key === "Enter") launch(a.id); }} className="flex w-20 flex-col items-center gap-1 rounded-xl p-2 text-xs text-neutral-100 [text-shadow:0_1px_3px_#000] hover:bg-white/10 focus:bg-white/10 focus:outline focus:outline-green-300">
            <span className="text-3xl text-green-300">{a.icon}</span>{tr(a.title)}
          </button>
        ))}
      </div>

      {/* GNOME-style top bar */}
      <header className="absolute inset-x-0 top-0 z-50 grid h-8 grid-cols-3 items-center bg-black px-2 font-sans text-xs font-medium text-neutral-200">
        <button onClick={() => setOverview(v => !v)} aria-pressed={overview} className={`justify-self-start rounded-full px-3 py-1 hover:bg-neutral-800 ${overview ? "bg-neutral-800 text-green-300" : ""}`}>{tr("Activities")}</button>
        <span className="justify-self-center rounded-full px-3 py-1">{now.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
        <span className="flex items-center gap-3 justify-self-end rounded-full px-3 py-1 text-neutral-300" aria-hidden="true"><Wifi size={14} /><Volume2 size={14} /><Power size={14} /></span>
      </header>

      {/* Dock */}
      <nav aria-label={tr("Dock")} className="absolute bottom-3 left-1/2 z-40 flex -translate-x-1/2 gap-2 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-2 backdrop-blur">
        {APPS.filter(a => !a.hidden || open.some(([k]) => k === a.id)).map(a => {
          const w = open.find(([k]) => k === a.id)?.[1];
          return (
            <button key={a.id} onClick={() => w && !w.min && top?.[0] === a.id ? patch(a.id, { min: true }) : launch(a.id)} aria-label={tr(a.title)} title={tr(a.title)}
              className={`relative flex h-11 w-11 items-center justify-center rounded-xl text-xl text-green-300 hover:bg-neutral-800 focus:outline focus:outline-green-300 ${w && !w.min ? "bg-neutral-800" : ""}`}>
              {a.icon}
              {w && <span className="absolute -bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-green-400" />}
            </button>
          );
        })}
      </nav>

      {open.map(([id, w]) => {
        const app = APPS.find(a => a.id === id)!;
        return (
          <section key={id} hidden={w.min} onPointerDown={() => focus(id)} aria-label={tr(app.title)}
            className={`absolute flex flex-col overflow-hidden rounded-xl border bg-neutral-950 shadow-[0_20px_80px_rgba(0,0,0,0.8)] ${top?.[0] === id ? "border-green-500/60" : "border-neutral-800"}`}
            style={w.maximized ? { left: 0, top: 32, width: "100%", height: "calc(100dvh - 32px)", resize: "none", zIndex: 45 } : { left: w.x, top: w.y, width: `min(${app.w ?? 520}px, calc(100vw - 16px))`, height: app.h ?? 320, resize: "both" }}>
            <div className="relative flex h-10 shrink-0 cursor-grab touch-none select-none items-center justify-center bg-neutral-900 text-sm font-semibold text-neutral-100"
              onPointerDown={e => {
                if (w.maximized || (e.target as HTMLElement).closest("button") || e.button !== 0) return;
                const sx = e.clientX - w.x, sy = e.clientY - w.y;
                const move = (m: PointerEvent) => patch(id, { x: Math.max(0, m.clientX - sx), y: Math.max(32, Math.min(m.clientY - sy, window.innerHeight - 60)) });
                const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
                window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
              }}>
              {tr(app.title)}
              <span className="absolute right-2 flex gap-2">
                <button aria-label={tr("Minimize")} onClick={() => patch(id, { min: true })} className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-xs hover:bg-neutral-700">—</button>
                {(id === "browser" || id === "tor") && <button aria-label={w.maximized ? "Restore browser window" : "Maximize browser window"} title={w.maximized ? "Restore" : "Maximize"} onClick={() => patch(id, { maximized: !w.maximized })} className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700">{w.maximized ? <Copy size={12} /> : <Maximize2 size={12} />}</button>}
                <button aria-label={tr("Close")} onClick={() => setOpen(o => o.filter(([k]) => k !== id))} className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-xs hover:bg-red-700 hover:text-white">×</button>
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4 text-sm text-neutral-300">{app.body}</div>
          </section>
        );
      })}

      {messageNotice && <div role="status" className="absolute bottom-20 right-4 z-[60] flex items-center gap-3 rounded-xl border border-[#704975] bg-[#211526] px-5 py-4 shadow-[0_8px_35px_#0009]"><img src="/assets/glimmr-logo-v1.svg" alt="" className="h-8 w-8" /><div><p className="text-sm font-semibold text-[#f1d4e9]">new message</p><p className="text-xs text-[#bca4b8]">raphael.pierre · Glimmr</p></div><button aria-label="Dismiss notification" onClick={() => setMessageNotice(false)} className="ml-3 rounded px-2 py-1 text-neutral-400 hover:text-white">×</button></div>}
      {/* Activities overview: app grid */}
      {overview && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-8 bg-black/85 pt-8 backdrop-blur-sm" onClick={() => setOverview(false)}>
          <div className="flex gap-8" onClick={e => e.stopPropagation()}>
            {APPS.filter(a => !a.hidden).map(a => (
              <button key={a.id} onClick={() => launch(a.id)} className="flex w-24 flex-col items-center gap-2 rounded-2xl p-3 text-sm text-neutral-200 hover:bg-neutral-900 focus:outline focus:outline-green-300">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-3xl text-green-300">{a.icon}</span>{tr(a.title)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

