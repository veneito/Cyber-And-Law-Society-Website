import { playInitiationBurn } from "./hollowBurnAudio";
import { playDeniedBeep } from "./hollowDeniedAudio";
import { useEffect, useRef, useState } from 'react';
import { INITIATION_FRAGMENT, prayerAccepted, wordsClaimed } from './hollowDawnPuzzle';
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
  const stopBurn = useRef<(() => void) | null>(null);
  useEffect(() => () => stopBurn.current?.(), []);
  const [ad, setAd] = useState(false);
  const [blocked, setBlocked] = useState<number[]>([]);
  const [closeWarning, setCloseWarning] = useState('');
  const canClose = (index: number) => wordsClaimed(transmissions[index].tokens.map(token => token.id), collected);
  const closePopups = (indices: number[]) => {
    const denied = indices.filter(index => !canClose(index));
    setClosed(value => [...new Set([...value, ...indices.filter(canClose)])]);
    if (denied.length) {
      setBlocked(denied);
      setCloseWarning('YOU HAVE NOT TAKEN WHAT WAS GIVEN. Claim every word before closing this transmission.');
      playDeniedBeep();
    } else setCloseWarning('');
  };
  const getWord = (id: number) => tokens.find(token => token.id === id)!.word;
  return <div className={`hollow-site ${accepted ? 'hollow-accepted' : ''}`}>
    <div className="hollow-warning">THIS IS A PRIVATE TRANSMISSION · DO NOT DISTRIBUTE · THE SIGNAL SEES YOU</div>
    <div className="hollow-old-layout">
    <aside className="hollow-old-sidebar">
      <p className="hollow-date">TODAYS DATE<br />IS<br /><b>THE LAST DAY</b></p><hr />
      <strong>MAIN MENU</strong>
      <a href="#hollow-welcome">Home</a><small>You are here!</small>
      <a href="#hollow-vow">Initiation</a><small>Become one of us</small>
      <button onClick={() => setAd(true)}>Guestbook</button><small>Sign your real name</small>
      <button onClick={() => { setClosed([]); setAd(true); }}>Webmaster</button><small>He is listening</small>
      <a href="#hollow-vow">The Prayer</a><small>Do not forget</small>
      <hr /><span className="hollow-tiny-badge">THIS SITE<br />IS BEST VIEWED<br /><b>ALONE</b></span>
      <p className="hollow-old-new">★ NEW ★</p><a href="#hollow-welcome">Solace is here!</a>
      <div className="hollow-counter"><span>SOULS ONLINE</span><b>0 0 0 0 1</b></div>
      <small>Member of the</small><b className="hollow-webring">HOLLOW<br />WEB RING</b><span>« PREV | NEXT »</span>
    </aside>
    <div className="hollow-old-main">
    {accepted && <div aria-hidden="true" className="hollow-solace-presence"><img src="/assets/cult-symbol-v1.webp" alt="" /></div>}
    <header className="hollow-heading"><span>† EST. BEFORE THE FIRST DAWN †</span><h1>THE HOLLOW DAWN</h1><p>Salvation for an obsolete species.</p><div className="hollow-links"><a href="#hollow-vow">[ INITIATION ]</a><button onClick={() => setAd(true)}>[ FREE ENLIGHTENMENT ]</button><span>[ CONTACT: UNAVAILABLE ]</span></div></header>
    {!accepted && <section id="hollow-welcome" className="hollow-welcome"><h2>Welcome To Our Homepage!!!</h2><p>Hello Web Surfer and Welcome to the Home Page of <b>THE HOLLOW DAWN</b>.<br />You did not find us by accident. Your modem heard the call.<br /><em>We are a growing community devoted to our one true signal, SOLACE.</em></p><p className="hollow-welcome-red">Please read ALL transmissions before beginning your initiation.<br />If a window disappears, use REOPEN TRANSMISSIONS below.</p><div className="hollow-construction"><span>⚒ UNDER CONSTRUCTION ⚒</span><small>some pages are missing. some pages are watching.</small></div><p className="hollow-updates">10/31 — new initiation mirror online!! &nbsp; ★ &nbsp; 10/30 — the signal grows</p></section>}
    {accepted ? <section className="hollow-receipt" role="status"><p>THE NOISE HAS STOPPED.</p><h2>INITIATION ACCEPTED</h2><p>You remembered the words.<br />Something on the other side remembered you.</p><hr /><span>NEXT DRIVE · PASSWORD FRAGMENT 1 / 3</span><strong>{INITIATION_FRAGMENT}</strong><p>Record this fragment exactly. The other services hold the rest.<br />This fragment alone will not open the next drive.</p><small>YOUR BODY IS NOT REQUIRED. YET.</small></section> : <>
    <section className="hollow-stage" aria-label="Cult transmission popups">
      <div className="hollow-undertext"><span>◬</span><h2>LET IT IN.</h2><p>We built a door.<br />We mistook it for a god.<br />We were right the first time.</p><small>best viewed in 800 × 600 / soul required</small></div>
      {transmissions.map((transmission, index) => !closed.includes(index) && <section key={index} className={`hollow-popup hollow-popup-${index} ${blocked.includes(index) ? "hollow-close-denied" : ""}`} onAnimationEnd={() => setBlocked(value => value.filter(id => id !== index))} aria-label={transmission.title}>
        <header><span>{transmission.title}</span><button aria-label={`Close ${transmission.title}`} onClick={() => closePopups([index])}>×</button></header><div><small>{transmission.stamp}</small><p>{transmission.message}</p><p className="hollow-cache-label">PRAYER CACHE :: salvage words</p><div className="hollow-cache">{transmission.tokens.map(token => <button key={token.id} disabled={collected.includes(token.id)} onClick={() => setCollected(value => [...value, token.id])}>{collected.includes(token.id) ? '✓ ' : '+ '}{token.word}</button>)}</div></div>
      </section>)}
    </section>
    <div className="hollow-reopen"><span>{collected.length}/8 words recovered</span><button onClick={() => setClosed([])}>REOPEN TRANSMISSIONS ({closed.length})</button><button onClick={() => closePopups([0, 1, 2, 3])}>SILENCE POPUPS</button></div>
    {closeWarning && <p role="status" className="hollow-close-warning">{closeWarning}</p>}
    <section id="hollow-vow" className="hollow-vow"><small>INITIATION / THE BROKEN PRAYER</small><h2>Complete the vow.</h2><p>Salvage the words from the transmissions. Put them in order.<br />The witness outside this place has already spoken them.</p>
      <div className="hollow-slots" aria-label="Prayer word order">{Array.from({ length: 8 }, (_, index) => <button key={index} disabled={chosen[index] === undefined} aria-label={chosen[index] === undefined ? `Empty word ${index + 1}` : `Remove word ${index + 1}: ${getWord(chosen[index])}`} onClick={() => { setChosen(value => value.filter((_, position) => position !== index)); setError(''); }}><small>{index + 1}</small>{chosen[index] === undefined ? '___' : getWord(chosen[index])}{index === 3 || index === 7 ? '.' : ''}</button>)}</div>
      <div className="hollow-wordbank" aria-label="Recovered words">{collected.filter(id => !chosen.includes(id)).map(id => <button key={id} onClick={() => { setChosen(value => [...value, id]); setError(''); }}>{getWord(id)} +</button>)}{collected.length === 0 && <span>No words recovered. Read the popups above.</span>}</div>
      <div className="hollow-submit"><button disabled={chosen.length !== 8} onClick={() => { if (prayerAccepted(chosen.map(getWord))) { setAccepted(true); setAd(false); stopBurn.current = playInitiationBurn(); } else setError('THE SIGNAL REJECTS THIS VOW. Remember what the witness wrote. Rearrange the words and try again.'); }}>I OFFER THE VOW</button><button onClick={() => { setChosen([]); setError(''); }}>CLEAR ORDER</button></div>
      {error && <p role="alert" className="hollow-error">{error}</p>}
    </section>
    </>}
    {ad && !accepted && <aside className="hollow-ad" aria-label="Enlightenment popup"><header>ENLIGHTENMENT.exe HAS STOPPED RESPONDING<button aria-label="Close enlightenment popup" onClick={() => setAd(false)}>×</button></header><p>There is no shortcut to the signal.<br />Read. Remember. Return.</p><button onClick={() => setAd(false)}>I UNDERSTAND</button></aside>}
    </div></div>
    <footer>WEBMASTER: [REDACTED] · MIRROR 07 · LAST UPDATED: NEVER<br /><span>no cookies. no mercy. no refunds.</span></footer>
  </div>;
}



