import { useEffect, useState } from "react";
import { sfx } from "./sound";

// Upper skull, then the jaw: shut, or dropped open with a dark gap, so the mouth appears to laugh.
const TOP = String.raw`
      _.-"""""""-._
    .'             '.
   /   .--.   .--.   \
  |   ( () ) ( () )   |
  |    '--'  _  '--'  |
   \         / \      /
    '.       \_/    .'
      |  |_|_|_|_|_|  |`;
const SHUT = String.raw`
      |  |-|-|-|-|-|  |
       '-._________.-'`;
const OPEN = String.raw`
      |               |
      |               |
      |  |-|-|-|-|-|  |
       '-._________.-'`;

export function Skull() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const jaw = setInterval(() => setOpen((o) => !o), 260);
    sfx.laugh();
    const laugh = setInterval(sfx.laugh, 2200);
    return () => { clearInterval(jaw); clearInterval(laugh); };
  }, []);
  return (
    <div className="skull-pop text-center" aria-hidden>
      <pre className="inline-block text-left font-mono text-[11px] leading-[1.15] text-red-400 sm:text-sm">{TOP + (open ? OPEN : SHUT)}</pre>
      <p className="font-mono text-sm tracking-[0.4em] text-red-500">{open ? "HA HA HA" : "ha ha ha"}</p>
    </div>
  );
}
