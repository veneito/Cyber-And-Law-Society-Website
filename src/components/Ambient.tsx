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
    const ripples: { x: number; y: number; t: number }[] = [];
    const click = (e: PointerEvent) => { ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() }); };
    addEventListener("pointerdown", click);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 60) return; // about 16 fps keeps it calm and cheap
      last = now;
      g.globalAlpha = 1;
      g.fillStyle = "rgba(0,0,0,0.12)";
      g.fillRect(0, 0, w(), h());
      g.font = `${size}px "JetBrains Mono", monospace`;
      g.fillStyle = "#4ade80";
      g.globalAlpha = 0.3; // canvas opacity is high so ripples can glow; the base rain stays dim
      drops.forEach((y, i) => {
        g.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], i * size, y * size);
        drops[i] = y * size > h() && Math.random() > 0.975 ? 0 : y + 1;
      });
      // a click sends a ring of bright glyphs outward from the cursor
      g.globalAlpha = 0.5;
      g.fillStyle = "#86efac";
      for (let n = ripples.length - 1; n >= 0; n--) {
        const { x, y, t } = ripples[n], r = (now - t) * 0.5;
        if (r > 600) { ripples.splice(n, 1); continue; }
        for (let cx = Math.floor((x - r - size * 2) / size); cx * size < x + r + size * 2; cx++)
          for (let cy = Math.floor((y - r - size * 2) / size); cy * size < y + r + size * 2; cy++)
            if (Math.abs(Math.hypot(cx * size - x, cy * size - y) - r) < size * 1.5)
              g.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], cx * size, cy * size);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); removeEventListener("pointerdown", click); off(); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60" />;
}

// A rotating double helix made of code letters, for the team code screen.
export function Helix() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const { g, w, h, off } = setup(ref.current!);
    const CH = "ATCG0123456789ABCDEF{}<>/=+*";
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0, last = -Infinity;
    const frame = (now: number) => {
      if (!motion.matches) raf = requestAnimationFrame(frame);
      if (now - last < 32 && !motion.matches) return;
      last = now;
      const t = motion.matches ? 0 : now / 1000, W = w(), R = Math.min(W * 0.30, 112);
      g.clearRect(0, 0, W, h());
      g.textAlign = "center";
      g.textBaseline = "middle";
      // Fine paired rails connect the code glyphs into continuous twisting strands.
      for (const front of [false, true]) {
        for (let y = -4; y < h(); y += 4) {
          for (let strand = 0; strand < 2; strand++) {
            const a = t * 0.55 + y * 0.023 + strand * Math.PI;
            const depth = Math.sin(a);
            if (front !== (depth > 0)) continue;
            g.strokeStyle = "#4ade80";
            g.globalAlpha = 0.12 + (depth + 1) * 0.16;
            g.lineWidth = front ? 1 : 0.65;
            for (const offset of [-0.045, 0.045]) {
              g.beginPath();
              g.moveTo(W / 2 + Math.cos(a + offset) * R, y);
              g.lineTo(W / 2 + Math.cos(a + offset + 4 * 0.023) * R, y + 4);
              g.stroke();
            }
          }
        }
      }
      for (let y = 12, i = 0; y < h(); y += 16, i++) {
        const a = t * 0.55 + y * 0.023, x1 = W / 2 + Math.cos(a) * R, x2 = W / 2 - Math.cos(a) * R, z = Math.sin(a);
        {
          g.strokeStyle = "#4ade80";
          g.globalAlpha = 0.18;
          g.lineWidth = 0.65;
          for (const dy of [-2, 2]) {
            g.beginPath(); g.moveTo(x1, y + dy); g.lineTo(x2, y + dy); g.stroke();
          }
          g.fillStyle = "#4ade80";
          g.globalAlpha = 0.35;
          for (let k = 1; k < 8; k++) g.fillRect(x1 + ((x2 - x1) * k) / 8 - 1, y - 1, 2, 2);
        }
        ([[x1, z, 0], [x2, -z, 1]] as const).forEach(([x, d, s]) => {
          g.globalAlpha = 0.3 + 0.7 * ((d + 1) / 2);
          g.fillStyle = d > 0 ? "#86efac" : "#16a34a";
          if (i % 2) {
            g.font = `${14 + d * 4}px "JetBrains Mono", monospace`;
            g.fillText(CH[(i * 7 + s * 13) % CH.length], x, y);
          } else {
            g.shadowColor = "#4ade80";
            g.shadowBlur = d > 0 ? 7 : 0;
            g.beginPath(); g.arc(x, y, 1.8 + d * 0.6, 0, Math.PI * 2); g.fill();
            g.shadowBlur = 0;
          }
          if (i % 8 === 1) {
            g.globalAlpha = 0.3;
            g.font = '8px "JetBrains Mono", monospace';
            g.fillText(i.toString(16).toUpperCase().padStart(3, "0"), x + (x < W / 2 ? -27 : 27), y);
          }
        });
      }
      g.globalAlpha = 1;
    };
    const redraw = () => { cancelAnimationFrame(raf); last = -Infinity; frame(performance.now()); };
    redraw();
    motion.addEventListener("change", redraw);
    addEventListener("resize", redraw);
    return () => { cancelAnimationFrame(raf); off(); motion.removeEventListener("change", redraw); removeEventListener("resize", redraw); };
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
