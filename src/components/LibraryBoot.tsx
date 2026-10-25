import { t as tr } from '../i18n/language';

export default function LibraryBoot({ progress }: { progress: number }) {
  const message = [
    'PS > ' + tr('Loading simulation of Marx Library…'),
    '> ' + tr('This is a simulation. Your real-world search comes next.'),
    '> ' + tr('Find the item and leave FAST, before Bea finds you…'),
  ].join('\n\n');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  return <div role="status" aria-label={tr('Loading simulation')} className="absolute inset-0 flex items-center justify-center bg-black p-5 font-mono text-green-300">
    <div className="w-full max-w-lg rounded border border-green-900 p-5 text-sm">
      <p className="mb-5 text-xs text-neutral-500">PowerShell // MARX LIBRARY SIMULATION</p>
      <p className="min-h-40 whitespace-pre-wrap">{reduced ? message : message.slice(0, Math.floor(progress * message.length / 0.8))}<span aria-hidden>▌</span></p>
      <div role="progressbar" aria-label={tr('Loading simulation')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(progress * 100)} className="mt-4 h-2 bg-green-950"><div className="h-full bg-green-400" style={{ width: `${progress * 100}%` }} /></div>
      <p className="mt-3 text-right text-xs">{Math.floor(progress * 100)}%</p>
    </div>
  </div>;
}
