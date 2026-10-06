import { useEffect, useRef, useState } from "react";

// Matrix-style intro: code pours down, then the black backdrop dissolves to reveal the page.
// Plays once per browser session; click or any key skips; skipped under reduced motion.

const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789$#{}<>/=+*";
const ACCENT = "#4ade80"; // green-400, matches site accent
const DURATION = 4200;
const DISSOLVE_START = 1200;
const STORAGE_KEY = "cls-intro-played";

function shouldPlay() {
  // ?intro forces a replay (handy for testing).
  if (new URLSearchParams(location.search).has("intro")) return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return !sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return true;
  }
}

export function CodeRain() {
  const [active, setActive] = useState(shouldPlay);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage unavailable */
    }

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const size = w < 640 ? 14 : 18;
    const cols = Math.ceil(w / size);
    // Stagger starts above the screen so the code "pours" in from the top.
    const drops = Array.from({ length: cols }, () => -Math.random() * 25);
    const speeds = Array.from({ length: cols }, () => 0.6 + Math.random() * 0.6);
    ctx.font = `${size}px "JetBrains Mono", monospace`;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let raf = 0;
    let last = 0;
    const start = performance.now();

    const frame = (now: number) => {
      const t = now - start;
      if (t >= DURATION) return finish();

      // Fade previous glyphs into trails (canvas stays transparent; backdrop provides the black).
      if (now - last > 33) {
        last = now;
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";

        for (let i = 0; i < cols; i++) {
          const y = drops[i] * size;
          if (y > 0) {
            const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
            ctx.fillStyle = Math.random() < 0.08 ? "#eafff0" : ACCENT;
            ctx.fillText(ch, i * size, y);
          }
          drops[i] += speeds[i];
        }
      }

      // Dissolve: backdrop fades out, then the rain itself fades in the last stretch.
      const d = Math.min(1, Math.max(0, (t - DISSOLVE_START) / (DURATION - DISSOLVE_START)));
      backdropRef.current!.style.opacity = String(1 - d);
      canvas.style.opacity = String(d < 0.5 ? 1 : 1 - (d - 0.5) * 2);

      raf = requestAnimationFrame(frame);
    };

    const finish = () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      setActive(false);
    };

    raf = requestAnimationFrame(frame);
    window.addEventListener("keydown", finish);
    window.addEventListener("pointerdown", finish);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
    };
  }, [active]);

  if (!active) return null;
  return (
    <div className="fixed inset-0 z-[100] cursor-pointer" aria-hidden>
      <div ref={backdropRef} className="absolute inset-0 bg-black" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
