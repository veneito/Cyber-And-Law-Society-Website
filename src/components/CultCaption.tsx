import { useEffect, useState } from 'react';
import './CultGlitch.css';

export function CultCaption({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let tick = 0;
    const timer = window.setInterval(() => {
      tick++;
      if (document.hidden || motion.matches || tick % 36 > 3) { setDisplay(text); return; }
      const glyphs = '▓▒░⍙⌁⏣⋔⨳ЖѮΨ҂';
      setDisplay([...text].map((letter, index) => /[\p{L}]/u.test(letter) && (index + tick) % 4 === 0 ? glyphs[(index * 7 + tick) % glyphs.length] : letter).join(''));
    }, 110);
    return () => clearInterval(timer);
  }, [text]);
  return <><span className="sr-only">{text}</span><span aria-hidden="true" className="cult-cursed-caption">{display}</span><span aria-hidden="true" className="cult-screen-interference" /></>;
}
