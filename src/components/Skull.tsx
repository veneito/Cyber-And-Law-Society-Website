import { useEffect, useState } from "react";
import { sfx } from "./sound";

// Upper skull, then the jaw: shut, or dropped open with fangs and a dark gap, so the mouth appears to laugh.
const TOP = String.raw`
        ___.-"""""""-.___
      .'  \  |  /  \  |  '.
     /   _ \_|_/ __ \_|_/  \
    |   / (@@@) \  / (@@@) \ |
    |   \ (@@@) /  \ (@@@) / |
     \    '---'  /\  '---'  /
      \     .   /  \   .   /
       '.    \ / || \ /  .'
         |  .:|_|_|_|_|:.  |`;
const SHUT = String.raw`
         |  |-|-|-|-|-|-|  |
          '-.___________.-'`;
const OPEN = String.raw`
         |  \/\/\/\/\/\/\/  |
         |                  |
         |   .   ' ,  .    |
         |  /\/\/\/\/\/\/\  |
          '-.___________.-'`;

export function Skull() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const jaw = setInterval(() => setOpen((o) => !o), 230);
    sfx.laugh();
    const laugh = setInterval(sfx.laugh, 3200);
    return () => { clearInterval(jaw); clearInterval(laugh); };
  }, []);
  return (
    <div className="skull-pop text-center" aria-hidden>
      <pre style={{ minHeight: "17.25em" }} className={`skull-glow inline-block text-left font-mono text-[11px] leading-[1.15] text-red-500 sm:text-base ${open ? "skull-shake" : ""}`}>{TOP + (open ? OPEN : SHUT)}</pre>
      <p className="font-mono text-sm tracking-[0.4em] text-red-500">{open ? "HA HA HA HA" : "ha ha ha"}</p>
    </div>
  );
}
