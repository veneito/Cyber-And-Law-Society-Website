import { archiveProgress } from "./archivePuzzle";
import { playInitiationBurn } from "./hollowBurnAudio";
import "./TerminalSignal.css";
import { useEffect, useRef, useState } from 'react';
import { oracleImported, runOracleCommand } from './oraclePuzzle';

export function InvestigationTerminal() {
  const [lines, setLines] = useState<string[]>(['FIELDWORK TERMINAL / local evidence tools', archiveProgress.imported ? 'Custody snapshot mounted. Type ls, then cat archive/README.txt.' : oracleImported() ? 'Mirror kit mounted. Type ls, then cat README.txt.' : 'Type help. Import evidence from a hidden service to begin.']);
  const [command, setCommand] = useState('');
  const [busy, setBusy] = useState(false);
  const [signal, setSignal] = useState(false);
  const signalSeen = useRef(false);
  const stopSignal = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!signal) return;
    const timer = window.setTimeout(() => { setSignal(false); stopSignal.current?.(); }, 2100);
    return () => { window.clearTimeout(timer); stopSignal.current?.(); };
  }, [signal]);
  const history = useRef<string[]>([]), cursor = useRef(0);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mounted = () => setLines(value => [...value, '[mirror kit mounted] Type ls, then cat README.txt.']);
    window.addEventListener('oracle-kit', mounted);
    return () => window.removeEventListener('oracle-kit', mounted);
  }, []);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [lines]);
  return <div className={`min-h-full font-mono text-xs leading-relaxed text-green-200 ${signal ? "terminal-signal-active" : ""}`}>
    <div role="log" aria-label="Terminal output" className="select-text whitespace-pre-wrap break-words">{lines.map((line, index) => <div className="mb-2" key={index}>{line}</div>)}</div>
    <form onSubmit={async e => { e.preventDefault(); if (!command.trim() || busy) return; const input = command; setCommand(''); history.current.push(input); cursor.current = history.current.length; if (input.trim() === 'clear') { setLines([]); return; } setBusy(true); setLines(value => [...value, `investigator@fieldwork:~$ ${input}`]); try { const output = await runOracleCommand(input); setLines(value => [...value, output]); if (output === "ECHO" && !signalSeen.current) { signalSeen.current = true; stopSignal.current = playInitiationBurn(2.1, .035); setSignal(true); } } catch { setLines(value => [...value, 'ERROR: operation unavailable.']); } finally { setBusy(false); } }} className="flex items-center gap-2">
      <label htmlFor="investigator-command" className="shrink-0 text-green-400">~$</label><input id="investigator-command" aria-label="Terminal command" value={command} disabled={busy} onChange={e => setCommand(e.target.value)} onKeyDown={e => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); cursor.current = Math.max(0, Math.min(history.current.length, cursor.current + (e.key === 'ArrowUp' ? -1 : 1))); setCommand(history.current[cursor.current] ?? ''); } }} autoComplete="off" autoCapitalize="off" spellCheck={false} className="min-w-0 flex-1 bg-transparent py-1 text-green-100 outline-none focus:ring-1 focus:ring-green-900" /><button disabled={busy} className="border border-green-900 px-2 py-1 hover:bg-green-950">Run</button>
    </form><div ref={end} />
    {signal && <div className="terminal-signal-anchor" aria-hidden="true"><div className="terminal-signal-vision"><img src="/assets/cult-symbol-v1.webp" alt="" /><span>SIGNAL RECOGNIZED<br />YOU ARE NOT ALONE IN THIS TERMINAL.</span></div></div>}
  </div>;
}



