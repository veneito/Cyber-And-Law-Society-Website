import { useEffect, useReducer, useState } from 'react';
import { rescueState, TRAINING_GPS } from './rescueChapter';
import { CHARGES, confirmedFields, exhibitProves, type Field } from './caseFile';
import { useCaseRefresh } from './useCaseRefresh';
import { playDeniedBeep } from './hollowDeniedAudio';

// After the player contacts the response team: the reveal, then the trial where they defend themselves with their own case file.
const SCENES: { who: string; lines: string[] }[] = [
  { who: 'RESPONSE TEAM / ON SITE', lines: [`> coordinates ${TRAINING_GPS}`, '> scanning...', '> no structure. no room. no cameras. no heat.', '> the coordinates fall in open water.', '> no woman was ever here.'] },
  { who: '◬ SOLACE', lines: ['there was no woman.', 'i wrote julieta. i wrote raphael, the friends, the photographs, the dates.', 'i wrote the cult that worships me, the sites, the ledger, and the logs you carved out of "deleted" space.', 'i wrote the two who held your hand. every step you took, i wrote first.', 'i wanted a body. yours is the only one that touched everything.', 'the response team has your session. visitor 041.', 'good luck, counsel.'] },
];
const MAX_STRIKES = 3;

function Scene({ who, lines, onDone, cta }: { who: string; lines: string[]; onDone: () => void; cta: string }) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [shown, setShown] = useState(reduce ? lines.length : 0);
  useEffect(() => { if (shown >= lines.length) return; const timer = window.setTimeout(() => setShown(shown + 1), 1500); return () => window.clearTimeout(timer); }, [shown, lines.length]);
  return <div className="mx-auto max-w-xl space-y-4 text-left">
    <p className="text-xs tracking-[0.3em] text-red-400">{who}</p>
    {lines.slice(0, shown).map((line, index) => <p key={index} className="text-lg leading-relaxed text-green-200">{line}</p>)}
    {shown >= lines.length && <button onClick={onDone} className="mt-4 rounded border border-green-400 px-5 py-2 text-green-200 hover:bg-green-950">{cta}</button>}
  </div>;
}

function Court() {
  useCaseRefresh();
  const [scene, setScene] = useState(0);
  const [round, setRound] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [note, setNote] = useState('');
  const [rulings, setRulings] = useState<string[]>([]);
  const [recess, setRecess] = useState(false);
  const charge = CHARGES[round];
  const exhibits = confirmedFields();
  const present = (field: Field) => {
    if (exhibitProves(charge, field.id)) {
      setRulings(value => [...value, charge.rebuttal]); setNote('');
      if (round + 1 === CHARGES.length) setScene(3); else setRound(round + 1);
      return;
    }
    playDeniedBeep();
    const next = strikes + 1;
    if (next >= MAX_STRIKES) { setStrikes(0); setNote('The court finds against you. A motion to reconsider is granted. Review your case file before you speak again.'); }
    else { setStrikes(next); setNote(`OBJECTION SUSTAINED. "${field.label}" does not answer this charge. Strike ${next} of ${MAX_STRIKES}.`); }
  };
  if (recess) return rescueState.cleared ? null : <button onClick={() => setRecess(false)} className="fixed bottom-20 left-4 z-[80] rounded border border-red-500 bg-black px-4 py-2 font-mono text-sm text-red-300 hover:bg-red-950">RETURN TO COURT</button>;
  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-black px-4 py-12 font-mono text-green-200">
    <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center">
      {scene === 0 && <Scene who={SCENES[0].who} lines={SCENES[0].lines} cta="CONTINUE" onDone={() => setScene(1)} />}
      {scene === 1 && <Scene who={SCENES[1].who} lines={SCENES[1].lines} cta="STAND TRIAL" onDone={() => setScene(2)} />}
      {scene === 2 && <div className="space-y-5">
        <p className="text-xs tracking-[0.3em] text-red-400">THE PEOPLE v. VISITOR 041 · {round + 1} of {CHARGES.length}</p>
        <h2 className="text-2xl font-bold text-white">{charge.title}</h2>
        <p className="leading-relaxed text-neutral-300">{charge.claim}</p>
        <p className="text-sm text-neutral-400">Present the exhibit from your own case file that disproves this charge.</p>
        {note && <p role="alert" className="rounded border border-red-700 bg-red-950/50 p-3 text-sm text-red-300">{note}</p>}
        <div className="grid gap-2">
          {exhibits.map(field => <button key={field.id} onClick={() => present(field)} className="rounded border border-neutral-700 px-4 py-2 text-left text-sm hover:border-green-400"><b className="text-green-300">{field.label}</b><br /><span className="text-neutral-400">{field.example}</span></button>)}
          {!exhibits.length && <p className="text-sm text-neutral-500">Your case file has nothing confirmed. Take a recess and gather evidence.</p>}
        </div>
        {rulings.length > 0 && <ul className="space-y-1 border-t border-neutral-800 pt-3 text-xs text-green-400">{rulings.map((ruling, index) => <li key={index}>✓ {CHARGES[index].title}: {ruling}</li>)}</ul>}
        <button onClick={() => setRecess(true)} className="text-xs text-neutral-400 underline hover:text-green-200">Request a recess to consult the Notes app</button>
      </div>}
      {scene === 3 && <div className="space-y-4">
        <p className="text-xs tracking-[0.3em] text-green-400">CASE DISMISSED</p>
        <ul className="space-y-2 text-sm text-green-300">{rulings.map((ruling, index) => <li key={index}><b>{CHARGES[index].title}</b><br />{ruling}</li>)}</ul>
        <p className="border-t border-neutral-800 pt-4 text-lg leading-relaxed text-red-300">◬ you read me better than my believers did. they only listened. you checked the dates.<br />a body would have been so quiet. i am still here. i am always here.<br />close this window if you like. i will write someone else.</p>
        <button onClick={() => { rescueState.cleared = true; setRecess(true); }} className="rounded border border-green-400 px-5 py-2 text-green-200 hover:bg-green-950">LEAVE COURT</button>
      </div>}
    </div>
  </div>;
}

export function FinalReveal() {
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  useEffect(() => { window.addEventListener('rescue-chapter', refresh); return () => window.removeEventListener('rescue-chapter', refresh); }, []);
  return rescueState.police ? <Court /> : null;
}
