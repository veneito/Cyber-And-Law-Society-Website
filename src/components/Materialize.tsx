import { useEffect, useRef, useState, type ReactNode } from "react";

// Experimental scroll effect: sections "generate" as they enter the viewport.
// Headings decode from random glyphs; content is drawn in top-down behind a green scanline.
// Flip ENABLED to false to turn the whole effect off.
export const ENABLED = true;

const GLYPHS = "アカサタナハマヤラワ0123456789$#{}<>/=+*";

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches && !new URLSearchParams(location.search).has("intro");
}

function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(() => !ENABLED || reducedMotion());
  useEffect(() => {
    if (seen || !ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen] as const;
}

export function DecodeText({ text, active }: { text: string; active: boolean }) {
  const [out, setOut] = useState(() => (active ? text : text.replace(/\S/g, " ")));
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const fixed = Math.floor(p * text.length);
      setOut(
        text
          .split("")
          .map((c, i) => (i < fixed || c === " " ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join(""),
      );
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, text]);
  return (
    <span aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  );
}

export function Materialize({ children, render }: { children?: ReactNode; render?: (active: boolean) => ReactNode }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const [isStatic] = useState(() => !ENABLED || reducedMotion());
  return (
    <div ref={ref} className={`materialize ${isStatic ? "is-static" : seen ? "is-in" : ""}`}>
      {render ? render(seen) : children}
    </div>
  );
}
