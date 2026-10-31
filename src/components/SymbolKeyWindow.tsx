import { useEffect, useRef, useState } from 'react';
import { t as tr } from '../i18n/language';

const PREVIEW = import.meta.env.DEV && location.search.includes('preview') ? '?preview=1' : '';
const PDF = '/api/case/symbol-key.pdf' + PREVIEW;
const PAGE = '/api/case/symbol-key.png' + PREVIEW;

export function SymbolKeyWindow({ available }: { available: boolean }) {
  return available ? <SymbolKeyDesktop /> : null;
}

function SymbolKeyDesktop() {
  const [mode, setMode] = useState<'open' | 'minimized' | 'closed'>('open');
  const [maximized, setMaximized] = useState(false);
  const [position, setPosition] = useState(() => ({ x: Math.max(8, window.innerWidth - 664), y: Math.min(80, Math.max(8, window.innerHeight - 260)) }));
  const [zoom, setZoom] = useState(100);
  const [dragging, setDragging] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const titlebar = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const keepOnScreen = (x: number, y: number) => {
    const rect = panel.current?.getBoundingClientRect();
    setPosition({ x: Math.max(8, Math.min(x, window.innerWidth - (rect?.width ?? 300) - 8)), y: Math.max(8, Math.min(y, window.innerHeight - 80)) });
  };
  useEffect(() => {
    const resize = () => {
      const rect = panel.current?.getBoundingClientRect();
      setPosition(old => ({ x: Math.max(8, Math.min(old.x, window.innerWidth - (rect?.width || 300) - 8)), y: Math.max(8, Math.min(old.y, window.innerHeight - 80)) }));
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  const hide = (next: 'minimized' | 'closed') => { setMode(next); launcher.current?.focus(); };
  return <>
    <button ref={launcher} onClick={() => { setMode('open'); requestAnimationFrame(() => titlebar.current?.focus()); }} className="fixed bottom-5 right-5 z-40 rounded-lg border border-green-400 bg-black px-4 py-3 font-mono text-sm text-green-200 shadow-lg hover:bg-green-950" aria-label={tr('Open officer attachment: symbol key PDF')}>
      ▤ {tr('Symbol key')} {mode === 'minimized' ? '—' : mode === 'closed' ? '↗' : ''}
    </button>
    <div ref={panel} role="dialog" aria-modal="false" aria-label={tr('Officer attachment: symbol cipher key')} hidden={mode !== 'open'} onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); hide('closed'); } }}
      className="fixed z-45 flex flex-col overflow-hidden rounded-lg border border-green-500 bg-neutral-950 text-green-200 shadow-[0_20px_80px_rgba(0,0,0,0.8)]"
      style={maximized ? { inset: 8, display: mode === 'open' ? 'flex' : 'none' } : { left: position.x, top: position.y, width: 'min(640px, calc(100vw - 16px))', height: 'min(660px, calc(100dvh - 104px))', minWidth: 'min(280px, calc(100vw - 16px))', minHeight: 240, maxWidth: 'calc(100vw - 16px)', maxHeight: 'calc(100dvh - 16px)', resize: 'both', display: mode === 'open' ? 'flex' : 'none' }}>
      <div ref={titlebar} tabIndex={0} aria-label={tr('Move symbol key window with arrow keys or drag its title bar')} className="flex shrink-0 touch-none select-none items-center justify-between gap-2 border-b border-green-800 bg-green-950 px-3 py-2 font-mono text-xs focus:outline focus:outline-green-300"
        style={{ cursor: maximized ? 'default' : dragging ? 'grabbing' : 'grab' }}
        onDoubleClick={e => { if (!(e.target as HTMLElement).closest('button')) setMaximized(v => !v); }}
        onPointerDown={e => {
          if (maximized || (e.target as HTMLElement).closest('button') || e.button !== 0) return;
          e.preventDefault();e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, left: position.x, top: position.y };setDragging(true);
        }}
        onPointerMove={e => { const start = drag.current; if (start) keepOnScreen(start.left + e.clientX - start.x, start.top + e.clientY - start.y); }}
        onPointerUp={e => { drag.current = null;setDragging(false); if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }}
        onPointerCancel={() => { drag.current = null;setDragging(false); }}
        onKeyDown={e => {
          if (maximized || e.target !== e.currentTarget) return;
          const moves: Record<string, [number, number]> = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
          const move = moves[e.key];if (move) { e.preventDefault();keepOnScreen(position.x + move[0], position.y + move[1]); }
        }}>
        <span className="min-w-0 truncate">▤ {tr('Officer attachment · Symbol key')}</span>
        <div className="flex shrink-0 gap-1">
          <button aria-label={tr('Minimize symbol key')} title={tr('Minimize')} onClick={() => hide('minimized')} className="rounded px-3 py-2 hover:bg-green-800">—</button>
          <button aria-label={maximized ? tr('Restore symbol key size') : tr('Maximize symbol key')} title={maximized ? tr('Restore') : tr('Maximize')} onClick={() => setMaximized(v => !v)} className="rounded px-3 py-2 hover:bg-green-800">{maximized ? '❐' : '□'}</button>
          <button aria-label={tr('Close symbol key')} title={tr('Close')} onClick={() => hide('closed')} className="rounded px-3 py-2 hover:bg-red-900 hover:text-white">×</button>
        </div>
      </div>
      <div className="shrink-0 border-b border-neutral-700 px-3 py-2 text-xs text-neutral-300">
        <p>{tr('Officer: USB recovered. I found the symbol cipher key on the drive. Sending you the file now.')}</p>
        <a href={PDF} target="_blank" rel="noreferrer" className="mt-1 inline-block text-green-300 underline">{tr('Open PDF in a new tab')}</a>
        <a href={PDF} download="symbol-key.pdf" className="ml-4 inline-block text-green-300 underline">{tr('Download PDF')}</a>
      </div>
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-700 px-3 py-1 text-xs">
        <span>{tr('PDF preview · 1 page')}</span>
        <div className="flex items-center gap-1">
          <button aria-label={tr('Zoom out')} disabled={zoom <= 50} onClick={() => setZoom(v => Math.max(50, v - 25))} className="rounded px-3 py-2 hover:bg-green-950 disabled:opacity-40">−</button>
          <button aria-label={tr('Fit page width')} onClick={() => setZoom(100)} className="rounded px-2 py-2 hover:bg-green-950">{zoom}%</button>
          <button aria-label={tr('Zoom in')} disabled={zoom >= 250} onClick={() => setZoom(v => Math.min(250, v + 25))} className="rounded px-3 py-2 hover:bg-green-950">+</button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-neutral-800 p-2" tabIndex={0} aria-label={tr('Symbol cipher key PDF page')}>
        <img src={PAGE} alt={tr('Symbol key for letters A through Z, from the officer’s PDF. Use Open PDF in a new tab to view the original.')} className="mx-auto block h-auto max-w-none bg-white" style={{ width: zoom + '%' }} draggable={false} />
      </div>
      <p className="shrink-0 px-3 py-2 text-[10px] text-neutral-400">{tr('Drag the title bar to move. Use the corner to resize. Reopen anytime with Symbol key.')}</p>
    </div>
  </>;
}
