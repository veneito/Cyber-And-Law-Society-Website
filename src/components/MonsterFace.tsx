import { useEffect, useState } from 'react';
import { soundOn } from './sound';
import { MONSTER_FACE, MONSTER_LAUGH } from './monsterFaceArt';

export function MonsterFace() {
  const [laughing, setLaughing] = useState(false);
  useEffect(() => {
    const voice = new Audio(MONSTER_LAUGH);
    voice.preload = 'auto'; voice.volume = 0.24;
    let bounce: ReturnType<typeof setTimeout>;
    const laugh = () => {
      if (document.hidden) return;
      setLaughing(true);
      clearTimeout(bounce);
      bounce = setTimeout(() => setLaughing(false), 1000);
      if (soundOn()) { voice.currentTime = 0; void voice.play().catch(() => {}); }
    };
    const repeat = setInterval(laugh, 3000);
    const quiet = () => { if (document.hidden || !soundOn()) voice.pause(); };
    const mute = setInterval(quiet, 150);
    document.addEventListener('visibilitychange', quiet);
    const first = setTimeout(laugh, 0);
    return () => {
      clearTimeout(first); clearInterval(repeat); clearTimeout(bounce); clearInterval(mute);
      document.removeEventListener('visibilitychange', quiet);
      voice.pause(); voice.removeAttribute('src'); voice.load();
    };
  }, []);
  return <div className="py-3 text-center" aria-hidden>
    <pre className={`monster-face inline-block text-left font-mono text-[8px] leading-none text-red-400 sm:text-[10px] ${laughing ? 'monster-face-laugh' : ''}`}>{MONSTER_FACE}</pre>
  </div>;
}
