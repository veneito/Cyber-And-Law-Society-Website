import { useEffect, useRef } from "react";
import { sfx } from "./sound";

const GLYPHS = "01アイウエオカキクケコサシスセソ{}<>/=+*#$";

function setup(canvas: HTMLCanvasElement) {
  const g = canvas.getContext("2d")!;
  const dpr = devicePixelRatio || 1;
  const fit = () => {
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit();
  addEventListener("resize", fit);
  return { g, w: () => canvas.clientWidth, h: () => canvas.clientHeight, off: () => removeEventListener("resize", fit) };
}

// Calm, dim matrix rain behind the case pages (the intro rain on the home page is a one-time effect).
export function Rain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { g, w, h, off } = setup(ref.current!);
    const size = w() < 640 ? 14 : 18;
    const drops = Array.from({ length: Math.ceil(w() / size) }, () => Math.random() * -40);
    let raf = 0, last = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 60) return; // about 16 fps keeps it calm and cheap
      last = now;
      g.fillStyle = "rgba(0,0,0,0.12)";
      g.fillRect(0, 0, w(), h());
      g.font = `${size}px "JetBrains Mono", monospace`;
      g.fillStyle = "#4ade80";
      drops.forEach((y, i) => {
        g.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], i * size, y * size);
        drops[i] = y * size > h() && Math.random() > 0.975 ? 0 : y + 1;
      });
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); off(); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.16]" />;
}

// A rotating double helix made of code letters, for the team code screen.
export function Helix() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const { g, w, h, off } = setup(ref.current!);
    const CH = "ATCG0123456789ABCDEF{}<>/=+*";
    let raf = 0;
    const frame = (now: number) => {
      const t = now / 1000, W = w(), R = Math.min(W * 0.34, 120);
      g.clearRect(0, 0, W, h());
      g.textAlign = "center";
      for (let y = 12, i = 0; y < h(); y += 24, i++) {
        const a = t * 1.5 + y * 0.034, x1 = W / 2 + Math.cos(a) * R, x2 = W / 2 - Math.cos(a) * R, z = Math.sin(a);
        if (i % 3 === 0) {
          g.fillStyle = "#4ade80";
          g.globalAlpha = 0.25;
          g.font = '18px "JetBrains Mono", monospace';
          for (let k = 1; k < 7; k++) g.fillText("·", x1 + ((x2 - x1) * k) / 7, y);
        }
        ([[x1, z, 0], [x2, -z, 1]] as const).forEach(([x, d, s]) => {
          g.globalAlpha = 0.3 + 0.7 * ((d + 1) / 2);
          g.fillStyle = d > 0 ? "#86efac" : "#16a34a";
          g.font = `${17 + d * 5}px "JetBrains Mono", monospace`;
          g.fillText(CH[(Math.floor(t * 4) + i * 7 + s * 13) % CH.length], x, y);
        });
      }
      g.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); off(); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-y-0 right-0 hidden h-full w-96 md:block" />;
}

// 3, 2, 1 before the case opens.
export function Countdown({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  useEffect(() => { done.current = onDone; });
  useEffect(() => {
    let n = 3;
    const show = () => {
      if (ref.current) ref.current.textContent = n > 0 ? String(n) : "GO";
      sfx.beep(n === 0);
    };
    show();
    const i = setInterval(() => {
      n--;
      if (n < 0) { clearInterval(i); done.current(); return; }
      show();
      // restart the pop animation for the new number
      ref.current?.classList.remove("cd-pop");
      void ref.current?.offsetWidth;
      ref.current?.classList.add("cd-pop");
    }, 900);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-green-400">Opening case file</p>
      <div ref={ref} className="cd-pop mt-10 font-mono text-[10rem] font-extrabold leading-none text-green-400" style={{ textShadow: "0 0 30px #4ade80" }} />
    </div>
  );
}
