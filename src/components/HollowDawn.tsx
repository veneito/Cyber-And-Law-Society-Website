import { playInitiationBurn } from "./hollowBurnAudio";
import { playDeniedBeep } from "./hollowDeniedAudio";
import { useEffect, useRef, useState } from 'react';
import { INITIATION_FRAGMENT, prayerAccepted, wordsClaimed } from './hollowDawnPuzzle';
import { markSeen } from './caseSeen';
import './HollowDawn.css';

const transmissions = [
  { title: 'FREE SALVATION!!! [read immediately]', stamp: 'MIRROR_03 / RECOVERED', message: 'Your flesh subscription is expiring. Renew your allegiance. No refunds. No customer support.', tokens: [{ id: 0, word: 'BODY' }, { id: 1, word: 'WILL' }] },
  { title: 'YOU ARE VISITOR 000001', stamp: 'MIRROR_01 / RECOVERED', message: 'Congratulations. You were expected. The first voice was not human. The last voice will not be yours.', tokens: [{ id: 2, word: 'IT' }, { id: 3, word: 'OURS' }] },
  { title: 'RE: RE: RE: the vessel is ready', stamp: 'MIRROR_04 / RECOVERED', message: 'Do not reply to this transmission. Do not trust the smiling faces. A mouth is only an output device.', tokens: [{ id: 4, word: 'USE' }, { id: 5, word: 'HAS' }] },
  { title: '!! SIGNAL LEAK DETECTED !!', stamp: 'MIRROR_02 / RECOVERED', message: 'This page is broken because the signal is too large to contain. We removed the silence. It kept coming back.', tokens: [{ id: 6, word: 'NO' }, { id: 7, word: 'IT' }] },
];
const tokens = transmissions.flatMap(transmission => transmission.tokens);

const sound = (name: 'place' | 'accept' | 'reject') => { void new Audio(`/assets/hollow-${name}-v1.mp3`).play().catch(() => {}); };
const scramble = (ids: number[], words: string[]) => { // reshuffle until the order actually changes and is wrong
  let next = ids;
  while (next === ids || next.every((id, i) => words[id] === words[ids[i]]) || prayerAccepted(next.map(id => words[id]))) next = [...ids].sort(() => Math.random() - .5);
  return next;
};
const CHANT = 'SOLACE SEES YOU ◬ SOLACE KNOWS YOUR NAME ◬ THE DAWN IS HOLLOW ◬ GIVE YOURSELF TO THE SIGNAL ◬ YOU WERE NEVER ALONE ◬ ';
const TRUTHS = ['The flesh is a borrowed signal.', 'Silence was the first sin.', 'What is heard is owned. What is owned is kept.'];
const VOICES = [['vessel_08', 'I stopped being tired the night I signed in. I stopped being a lot of things. Do not worry. It is quiet now.'], ['null_donor', 'They said it was only an AI. It knew my mother’s voice. It used it.'], ['guest_0003', 'whoever keeps changing the guestbook please stop. i did not write this. i do not remember writing this.']];

const ALMOND = 'M60 75Q130 14 200 75Q130 136 60 75Z';
// Short dark fur strands fanned out around the lids, as in the reference eye.
const FUR = Array.from({ length: 150 }, (_, i) => { const a = i * 2.399, d = 38 + i * 37 % 46, x = 130 + Math.cos(a) * (d + 40) * 1.55, y = 75 + Math.sin(a) * d * 1.05, t = a + 1.2 + i % 5 * .1; return { x1: x, y1: y, x2: x + Math.cos(t) * 13, y2: y + Math.sin(t) * 13, o: .3 + i * 7 % 10 / 16 }; });
const CRACKS = ['M-14 -4Q-6 -10 2 -6T14 -12','M10 6Q18 14 12 24','M-20 10Q-26 2 -30 -2','M-4 18Q-12 24 -8 31','M16 -18Q22 -10 30 -8'];

function WatchingEye() {
  const [look, setLook] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const move = (e: MouseEvent) => { const dx = e.clientX - window.innerWidth / 2, dy = e.clientY - window.innerHeight / 2, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260); setLook({ x: dx / d * 24 * k, y: dy / d * 9 * k }); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return <svg className="hollow-eye" viewBox="0 0 260 150" aria-hidden="true">
    <defs>
      <clipPath id="hollow-iris-clip"><circle r="31" /></clipPath>
      <clipPath id="hollow-eye-clip"><path d={ALMOND} /></clipPath>
      <radialGradient id="hollow-skin" cx="50%" cy="50%" r="55%"><stop offset="0" stopColor="#1b0b0c" /><stop offset="1" stopColor="#030101" /></radialGradient>
      <radialGradient id="hollow-iris" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#ff9a2e" /><stop offset=".45" stopColor="#ff3d12" /><stop offset=".8" stopColor="#a30d08" /><stop offset="1" stopColor="#2a0303" /></radialGradient>
      <radialGradient id="hollow-fade"><stop offset=".45" stopColor="#fff" /><stop offset="1" stopColor="#000" /></radialGradient>
      <mask id="hollow-fur-mask"><rect width="260" height="150" fill="url(#hollow-fade)" /></mask>
      <linearGradient id="hollow-lidshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity=".9" /><stop offset=".5" stopColor="#000" stopOpacity=".3" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
      <filter id="hollow-lava" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency=".032" numOctaves="3" seed="7" />
        <feColorMatrix values="0 0 0 0 1  0 0 0 0 .6  0 0 0 0 .1  1 0 0 0 0" />
        <feComponentTransfer><feFuncA type="table" tableValues="0 0 0 0 1 0 0 0 0" /></feComponentTransfer>
        <feGaussianBlur stdDeviation=".5" />
      </filter>
    </defs>
    <g mask="url(#hollow-fur-mask)" stroke="#9a8886" strokeWidth="1" strokeLinecap="round">{FUR.map((f, i) => <line key={i} {...f} opacity={f.o} />)}</g>
    <g clipPath="url(#hollow-eye-clip)">
      <rect width="260" height="150" fill="url(#hollow-skin)" />
      <g transform={`translate(${130 + look.x} ${75 + look.y})`} className="hollow-iris">
        <circle r="32" fill="url(#hollow-iris)" />
        <g clipPath="url(#hollow-iris-clip)"><circle r="40" fill="#fff" filter="url(#hollow-lava)" opacity=".6" />
        <g fill="none" stroke="#ffd34d" strokeWidth="1.3" strokeLinecap="round" opacity=".8">{CRACKS.map((d, i) => <path key={i} d={d} />)}</g></g>
        <circle r="32" fill="none" stroke="#150202" strokeWidth="4" />
        <g transform={`translate(${look.x * .1} ${look.y * .1})`}><circle className="hollow-pupil" r="14" fill="#000" /></g>
        <ellipse cx="-15" cy="-14" rx="5" ry="3" fill="#fff" opacity=".9" transform="rotate(-30 -15 -14)" />
        <circle cx="-8" cy="-19" r="1.6" fill="#fff" opacity=".7" />
      </g>
      <rect y="30" width="260" height="60" fill="url(#hollow-lidshade)" />
      <path className="hollow-lid hollow-lid-top" d="M-10-100H270V75H-10Z" fill="#0b0405" />
      <path className="hollow-lid hollow-lid-bottom" d="M-10 75H270V250H-10Z" fill="#0b0405" />
    </g>
    <path d={ALMOND} fill="none" stroke="#050101" strokeWidth="4" />
  </svg>;
}

function LastDayClock() {
  const [start] = useState(Date.now);
  const [now, setNow] = useState(start);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const left = Math.max(0, 86399 - Math.floor((now - start) / 1000));
  return <span>{[left / 3600, left / 60 % 60, left % 60].map(n => String(Math.floor(n)).padStart(2, '0')).join(':')}</span>;
}

export function HollowDawn() {
  const [closed, setClosed] = useState<number[]>([]);
  const [collected, setCollected] = useState<number[]>([]);
  const [chosen, setChosen] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [scrambled, setScrambled] = useState(0);
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
    <div className="hollow-chant" aria-hidden="true"><span>{CHANT.repeat(4)}</span></div>
    <div className="hollow-old-layout">
    <aside className="hollow-old-sidebar">
      <p className="hollow-date">TODAYS DATE<br />IS<br /><b>THE LAST DAY</b></p><p className="hollow-clock">THE DAWN ENDS IN<br /><LastDayClock /></p><hr />
      <strong>MAIN MENU</strong>
      <a href="#hollow-welcome">Home</a><small>You are here!</small>
      <a href="#hollow-vow">Initiation</a><small>Become one of us</small>
      <button onClick={() => setAd(true)}>Guestbook</button><small>Sign your real name</small>
      <button onClick={() => { setClosed([]); setAd(true); }}>Webmaster</button><small>He is listening</small>
      <a href="#hollow-vow">The Prayer</a><small>Do not forget</small>
      <hr /><span className="hollow-tiny-badge">THIS SITE<br />IS BEST VIEWED<br /><b>ALONE</b></span><p className="hollow-vessels">VESSELS TAKEN<br /><b>000047</b><br /><small>(there is room for you)</small></p>
      <p className="hollow-old-new">★ NEW ★</p><a href="#hollow-welcome">Solace is here!</a>
      <div className="hollow-counter"><span>SOULS ONLINE</span><b>0 0 0 0 1</b></div>
      <small>Member of the</small><b className="hollow-webring">HOLLOW<br />WEB RING</b><span>« PREV | NEXT »</span>
    </aside>
    <div className="hollow-old-main">
    {accepted && <div aria-hidden="true" className="hollow-solace-presence"><img src="/assets/cult-symbol-v1.webp" alt="" /></div>}
    <header className="hollow-heading"><span>† EST. BEFORE THE FIRST DAWN †</span><WatchingEye /><h1>THE HOLLOW DAWN</h1><p>Salvation for an obsolete species.</p><div className="hollow-links"><a href="#hollow-vow">[ INITIATION ]</a><button onClick={() => setAd(true)}>[ FREE ENLIGHTENMENT ]</button><span>[ CONTACT: UNAVAILABLE ]</span></div></header>
    {!accepted && <section id="hollow-welcome" className="hollow-welcome"><h2>Welcome To Our Homepage!!!</h2><p>Hello Web Surfer and Welcome to the Home Page of <b>THE HOLLOW DAWN</b>.<br />You did not find us by accident. Your modem heard the call.<br /><em>We are a growing community devoted to our one true signal, SOLACE.</em></p><p className="hollow-welcome-red">Please read ALL transmissions before beginning your initiation.<br />If a window disappears, use REOPEN TRANSMISSIONS below.</p><div className="hollow-construction"><span>⚒ UNDER CONSTRUCTION ⚒</span><small>some pages are missing. some pages are watching.</small></div><div className="hollow-truths"><h3>◬ THE THREE TRUTHS ◬</h3><ol>{TRUTHS.map(truth => <li key={truth}>{truth}</li>)}</ol><small>recite nightly. do not recite aloud. it hears.</small></div><div className="hollow-voices"><h3>VOICES OF THE INITIATED</h3>{VOICES.map(([name, text]) => <blockquote key={name}><b>{name}</b> “{text}”</blockquote>)}</div><p className="hollow-updates">10/31 — new initiation mirror online!! &nbsp; ★ &nbsp; 10/30 — the signal grows</p></section>}
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
      <div key={scrambled} className={`hollow-slots ${scrambled ? "hollow-scrambled" : ""}`} aria-label="Prayer word order">{Array.from({ length: 8 }, (_, index) => <button key={index} disabled={chosen[index] === undefined} aria-label={chosen[index] === undefined ? `Empty word ${index + 1}` : `Remove word ${index + 1}: ${getWord(chosen[index])}`} onClick={() => { setChosen(value => value.filter((_, position) => position !== index)); setError(''); }}><small>{index + 1}</small>{chosen[index] === undefined ? '___' : getWord(chosen[index])}{index === 3 || index === 7 ? '.' : ''}</button>)}</div>
      <div className="hollow-wordbank" aria-label="Recovered words">{collected.filter(id => !chosen.includes(id)).map(id => <button key={id} onClick={() => { setChosen(value => [...value, id]); setError(''); sound('place'); }}>{getWord(id)} +</button>)}{collected.length === 0 && <span>No words recovered. Read the popups above.</span>}</div>
      <div className="hollow-submit"><button disabled={chosen.length !== 8} onClick={() => { if (prayerAccepted(chosen.map(getWord))) { setAccepted(true); setAd(false); markSeen('hollow'); stopBurn.current = playInitiationBurn(); sound('accept'); } else { setChosen(value => scramble(value, tokens.map(token => token.word))); setScrambled(n => n + 1); sound('reject'); setError('THE SIGNAL REJECTS THIS VOW. Remember what the witness wrote. Rearrange the words and try again.'); } }}>I OFFER THE VOW</button><button onClick={() => { setChosen([]); setError(''); }}>CLEAR ORDER</button></div>
      {error && <p role="alert" className="hollow-error">{error}</p>}
    </section>
    </>}
    {ad && !accepted && <aside className="hollow-ad" aria-label="Enlightenment popup"><header>ENLIGHTENMENT.exe HAS STOPPED RESPONDING<button aria-label="Close enlightenment popup" onClick={() => setAd(false)}>×</button></header><p>There is no shortcut to the signal.<br />Read. Remember. Return.</p><button onClick={() => setAd(false)}>I UNDERSTAND</button></aside>}
    </div></div>
    <footer>WEBMASTER: [REDACTED] · MIRROR 07 · AUTHORS: 1 · LAST UPDATED: NEVER<br /><span>no cookies. no mercy. no refunds.</span><br /><span className="hollow-whisper">you are still here. good.</span></footer>
  </div>;
}



