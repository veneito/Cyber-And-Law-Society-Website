export type LawState = { stage: number; question: string; options: string[] };

export function LawCheck({ law, lock, onPick }: { law: LawState; lock: number; onPick: (choice: number) => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/90 p-4">
      <div className="my-auto w-full max-w-lg rounded-xl border border-sky-500/50 bg-neutral-950 p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-sky-400">Legal check</p>
        <p className="mt-1 text-white">The cipher is solved. Now show you understand the law behind it.</p>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-200">{law.question}</p>
        <div className="mt-4 grid gap-2">
          {law.options.map((o, i) => (
            <button key={o} onClick={() => onPick(i)} disabled={lock > 0}
              className="rounded-lg border border-neutral-700 px-4 py-2 text-left text-sm text-white hover:border-sky-400 disabled:opacity-40">
              <span className="mr-2 font-mono text-sky-400">{String.fromCharCode(65 + i)}</span>{o}
            </button>
          ))}
        </div>
        {lock > 0 && <p className="mt-3 text-sm text-red-400">Wrong answer. Locked out for {lock}s, then try again.</p>}
        <p className="mt-4 text-xs text-neutral-600">Simplified game rules for this activity. Not legal advice.</p>
      </div>
    </div>
  );
}
