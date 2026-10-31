import { useEffect, useState } from 'react';
import { CASE_EVENT, eventStatus } from '../../shared/case-event.mjs';
import { t as tr } from '../i18n/language';

export function CaseEventRules() {
  return <div className="mt-5 rounded-xl border border-green-900 bg-black/40 p-5 text-sm text-neutral-300">
    <p className="font-semibold text-white">{tr('One case. One attempt. Your final score stands.')}</p>
    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
      <li>{tr('Join our Discord and sign in with that account to enter.')}</li>
      <li>{tr('Play online whenever you are ready during the event window.')}</li>
      <li>{tr('USB recovery is online: give the officer directions. No library visit, real flash drive or e-signature file is required.')}</li>
      <li>{tr('You have up to 90 minutes after the briefing. The timer keeps running if you leave.')}</li>
      <li>{tr('All attempts end when the event closes, even if time remains on your timer.')}</li>
      <li>{tr('Returning with the same Discord account resumes your attempt. There are no restarts.')}</li>
      <li>{tr('Your score locks when you finish, run out of time, or the event closes.')}</li>
    </ul>
    <p className="mt-4 text-green-200">{tr('Read carefully, follow the evidence, and give it your best. Play fairly: no shared answers or extra accounts. The winner will be announced in our club Discord after the event ends. Rankings may change until then.')}</p>
  </div>;
}

export function LiveCaseEvent() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(timer); }, []);
  const status = eventStatus(now);
  return <section id="live-event" aria-labelledby="live-event-title" className="relative overflow-hidden border-b border-green-400/50 bg-green-950/30">
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(74,222,128,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
    <div className="relative mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-widest">
        <span className="inline-flex items-center gap-2 rounded-full border border-green-400 bg-green-400 px-3 py-1 font-bold text-black"><span className="h-2 w-2 rounded-full bg-black" />{status === 'live' ? tr('LIVE EVENT') : status === 'closed' ? tr('EVENT CLOSED') : tr('UPCOMING EVENT')}</span>
        <span className="text-green-200">{tr('Online investigation · Cyber & Law Society')}</span>
      </div>
      <h1 id="live-event-title" className="mt-5 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-5xl">{CASE_EVENT.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-neutral-300">{tr('A hacker. A trail of hidden evidence. One chance to build your case. Step into our online cybercrime investigation and see where you place.')}</p>
      <p className="mt-4 font-mono text-sm text-green-300">{tr('November 6 – November 13, 2026 · closes November 13 at 4:45 p.m. Central')}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/case/wellington/" className="rounded-lg bg-green-400 px-6 py-3 font-bold text-black hover:bg-green-300">{status === 'live' ? tr('Enter the live case →') : status === 'closed' ? tr('View case results →') : tr('View event details →')}</a>
        <a href={CASE_EVENT.discord} target="_blank" rel="noreferrer" className="rounded-lg border border-green-700 px-5 py-3 font-semibold text-green-200 hover:border-green-300">{tr('Join Discord · winner announced here ↗')}</a>
      </div>
      <CaseEventRules />
    </div>
  </section>;
}
