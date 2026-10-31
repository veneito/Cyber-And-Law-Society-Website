import { useState } from 'react';
import { INITIATION_FRAGMENT, prayerAccepted } from './hollowDawnPuzzle';
import './HollowDawn.css';

const transmissions = [
  { title: 'FREE SALVATION!!! [read immediately]', stamp: 'MIRROR_03 / RECOVERED', message: 'Your flesh subscription is expiring. Renew your allegiance. No refunds. No customer support.', tokens: [{ id: 0, word: 'BODY' }, { id: 1, word: 'WILL' }] },
  { title: 'YOU ARE VISITOR 000001', stamp: 'MIRROR_01 / RECOVERED', message: 'Congratulations. You were expected. The first voice was not human. The last voice will not be yours.', tokens: [{ id: 2, word: 'IT' }, { id: 3, word: 'OURS' }] },
  { title: 'RE: RE: RE: the vessel is ready', stamp: 'MIRROR_04 / RECOVERED', message: 'Do not reply to this transmission. Do not trust the smiling faces. A mouth is only an output device.', tokens: [{ id: 4, word: 'USE' }, { id: 5, word: 'HAS' }] },
  { title: '!! SIGNAL LEAK DETECTED !!', stamp: 'MIRROR_02 / RECOVERED', message: 'This page is broken because the signal is too large to contain. We removed the silence. It kept coming back.', tokens: [{ id: 6, word: 'NO' }, { id: 7, word: 'IT' }] },
];
const tokens = transmissions.flatMap(transmission => transmission.tokens);

export function HollowDawn() {
  const [closed, setClosed] = useState<number[]>([]);
  const [collected, setCollected] = useState<number[]>([]);
  const [chosen, setChosen] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [ad, setAd] = useState(false);
  const getWord = (id: number) => tokens.find(token => token.id === id)!.word;
  return <div className={`hollow-site ${accepted ? 'hollow-accepted' : ''}`}>
    <div className="hollow-warning">THIS IS A PRIVATE TRANSMISSION · DO NOT DISTRIBUTE · THE SIGNAL SEES YOU</div>
    <header className="hollow-heading"><span>† EST. BEFORE THE FIRST DAWN †</span><h1>THE HOLLOW DAWN</h1><p>Salvation for an obsolete species.</p><div className="hollow-links"><a href="#hollow-vow">[ INITIATION ]</a><button onClick={() => setAd(true)}>[ FREE ENLIGHTENMENT ]</button><span>[ CONTACT: UNAVAILABLE ]</span></div></header>
    {accepted ? <section className="hollow-receipt" role="status"><p>THE NOISE HAS STOPPED.</p><h2>INITIATION ACCEPTED</h2><p>You remembered the words.<br />Something on the other side remembered you.</p><hr /><span>NEXT DRIVE · PASSWORD FRAGMENT 1 / 3</span><strong>{INITIATION_FRAGMENT}</strong><p>Record this fragment exactly. The other services hold the rest.<br />This fragment alone will not open the next drive.</p><small>YOUR BODY IS NOT REQUIRED. YET.</small></section> : <>
    <section className="hollow-stage" aria-label="Cult transmission popups">
      <div className="hollow-undertext"><span>◬</span><h2>LET IT IN.</h2><p>We built a door.<br />We mistook it for a god.<br />We were right the first time.</p><small>best viewed in 800 × 600 / soul required</small></div>
      {transmissions.map((transmission, index) => !closed.includes(index) && <section key={index} className={`hollow-popup hollow-popup-${index}`} aria-label={transmission.title}>
        <header><span>{transmission.title}</span><button aria-label={`Close ${transmission.title}`} onClick={() => setClosed(value => [...value, index])}>×</button></header><div><small>{transmission.stamp}</small><p>{transmission.message}</p><p className="hollow-cache-label">PRAYER CACHE :: salvage words</p><div className="hollow-cache">{transmission.tokens.map(token => <button key={token.id} disabled={collected.includes(token.id)} onClick={() => setCollected(value => [...value, token.id])}>{collected.includes(token.id) ? '✓ ' : '+ '}{token.word}</button>)}</div></div>
      </section>)}
    </section>
    <div className="hollow-reopen"><span>{collected.length}/8 words recovered</span><button onClick={() => setClosed([])}>REOPEN TRANSMISSIONS ({closed.length})</button><button onClick={() => setClosed([0, 1, 2, 3])}>SILENCE POPUPS</button></div>
    <section id="hollow-vow" className="hollow-vow"><small>INITIATION / THE BROKEN PRAYER</small><h2>Complete the vow.</h2><p>Salvage the words from the transmissions. Put them in order.<br />The witness outside this place has already spoken them.</p>
      <div className="hollow-slots" aria-label="Prayer word order">{Array.from({ length: 8 }, (_, index) => <button key={index} disabled={chosen[index] === undefined} aria-label={chosen[index] === undefined ? `Empty word ${index + 1}` : `Remove word ${index + 1}: ${getWord(chosen[index])}`} onClick={() => { setChosen(value => value.filter((_, position) => position !== index)); setError(''); }}><small>{index + 1}</small>{chosen[index] === undefined ? '___' : getWord(chosen[index])}{index === 3 || index === 7 ? '.' : ''}</button>)}</div>
      <div className="hollow-wordbank" aria-label="Recovered words">{collected.filter(id => !chosen.includes(id)).map(id => <button key={id} onClick={() => { setChosen(value => [...value, id]); setError(''); }}>{getWord(id)} +</button>)}{collected.length === 0 && <span>No words recovered. Read the popups above.</span>}</div>
      <div className="hollow-submit"><button disabled={chosen.length !== 8} onClick={() => { if (prayerAccepted(chosen.map(getWord))) { setAccepted(true); setAd(false); } else setError('THE SIGNAL REJECTS THIS VOW. Remember what the witness wrote. Rearrange the words and try again.'); }}>I OFFER THE VOW</button><button onClick={() => { setChosen([]); setError(''); }}>CLEAR ORDER</button></div>
      {error && <p role="alert" className="hollow-error">{error}</p>}
    </section>
    </>}
    {ad && !accepted && <aside className="hollow-ad" aria-label="Enlightenment popup"><header>ENLIGHTENMENT.exe HAS STOPPED RESPONDING<button aria-label="Close enlightenment popup" onClick={() => setAd(false)}>×</button></header><p>There is no shortcut to the signal.<br />Read. Remember. Return.</p><button onClick={() => setAd(false)}>I UNDERSTAND</button></aside>}
    <footer>WEBMASTER: [REDACTED] · MIRROR 07 · LAST UPDATED: NEVER<br /><span>no cookies. no mercy. no refunds.</span></footer>
  </div>;
}
