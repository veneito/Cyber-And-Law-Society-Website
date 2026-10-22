const WINDOWS = [
  ["CONNECTION ERROR", "Secure connection terminated.", "Reconnecting…"],
  ["ACCESS DENIED", "Your credentials have been revoked.", "Permission override detected"],
  ["FIREWALL FAILURE", "Unknown process bypassed protection.", "Process: WELLINGTON.exe"],
  ["SESSION HIJACKED", "Remote operator has control.", "Local input suspended"],
  ["RECOVERY FAILED", "Unable to restore secure session.", "Error 0xBEA — access locked"],
  ["SECURITY ALERT", "Unauthorized connection established.", "Source: B. F. WELLINGTON"],
  ["ACCESS DENIED", "Administrator privileges overwritten.", "You cannot close this connection"],
  ["SYSTEM LOCKED", "All exits have been sealed.", "Solve the breach to regain access"],
];

export function BreachIntro() {
  return <div className="fixed inset-0 z-50 overflow-hidden bg-black/85" role="status" aria-label="Bea F. Wellington is taking over the case terminal">
    <div aria-hidden className="absolute inset-0 p-6 font-mono text-[10px] leading-6 text-red-500/30 sm:p-12 sm:text-xs">
      {Array.from({ length: 18 }, (_, i) => <p key={i}>[{String(i * 127).padStart(6, "0")}] {i % 3 === 0 ? "WELLINGTON.exe :: overriding session permissions" : i % 3 === 1 ? "ERR :: secure channel unavailable / retry failed" : "ROOT ACCESS :: remote operator connected"}</p>)}
    </div>
    <div aria-hidden className="absolute inset-0">
      {WINDOWS.map(([title, body, detail], i) => <div key={i} className="breach-window absolute w-[min(19rem,76vw)] overflow-hidden border border-red-400 bg-[#120909] shadow-[6px_6px_0_#000,0_0_25px_#ef444422]" style={{ left: `${8 + (i * 23) % 61}%`, top: `${8 + (i * 13) % 58}%`, animationDelay: `${i * 160}ms`, zIndex: i }}>
        <div className="flex items-center justify-between border-b border-red-400 bg-red-900 px-3 py-1.5 font-mono text-[10px] font-bold tracking-wider text-red-50"><span>⚠ {title}</span><span className="border border-red-300/50 px-1">×</span></div>
        <div className="p-4"><p className="font-mono text-sm text-red-100">{body}</p><p className="mt-2 font-mono text-[10px] text-red-400">{detail}</p><div className="mt-4 flex justify-end"><span className="border border-red-800 bg-red-950 px-4 py-1 font-mono text-[10px] text-red-400">RETRY FAILED</span></div></div>
      </div>)}
    </div>
    <div className="breach-takeover absolute inset-x-4 bottom-[8%] z-20 border border-red-400 bg-black/95 p-5 text-center shadow-[0_0_60px_#ef444433] sm:inset-x-auto sm:left-1/2 sm:w-[30rem] sm:-translate-x-1/2">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-400">Remote operator connected</p>
      <p className="mt-2 font-mono text-xl font-bold text-red-100 sm:text-3xl">I’m in. Your move.</p>
      <p className="mt-2 font-mono text-xs text-red-400">— Bea F. Wellington</p>
    </div>
  </div>;
}
