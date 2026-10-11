import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number };

const LINK = 130; // px: nodes closer than this get joined
const REACH = 170; // px: nodes this close to the cursor link to it
const PUSH = 90; // px: nodes this close to the cursor drift away from it
const GREEN = "74,222,128";

/** Drifting green node network; nodes link to each other and react to the cursor or a touch. Sits over its parent and ignores clicks. */
export function Network() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, nodes: Node[] = [], raf = 0, visible = true;
    const mouse = { x: -1e4, y: -1e4 };

    const resize = () => {
      const r = canvas.parentElement!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.round((w * h) / 9000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      }));
      if (still) draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) line(a.x, a.y, b.x, b.y, (1 - d / LINK) * 0.45);
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < REACH) line(a.x, a.y, mouse.x, mouse.y, (1 - dm / REACH) * 0.8);
      }
      ctx.shadowColor = `rgb(${GREEN})`;
      ctx.shadowBlur = 6;
      ctx.fillStyle = `rgba(${GREEN},0.95)`;
      for (const n of nodes) { ctx.beginPath(); ctx.arc(n.x, n.y, 1.8, 0, 6.283); ctx.fill(); }
      ctx.shadowBlur = 0;
    };
    const line = (x1: number, y1: number, x2: number, y2: number, alpha: number) => {
      ctx.strokeStyle = `rgba(${GREEN},${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    };

    const step = () => {
      raf = requestAnimationFrame(step);
      if (!visible) return;
      for (const n of nodes) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < PUSH && d > 0) { n.x += (dx / d) * (1 - d / PUSH) * 2; n.y += (dy / d) * (1 - d / PUSH) * 2; }
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.x = Math.max(0, Math.min(w, n.x)); n.y = Math.max(0, Math.min(h, n.y));
      }
      draw();
    };

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const leave = () => { mouse.x = mouse.y = -1e4; };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", leave); // a lifted finger stops pulling lines
    window.addEventListener("blur", leave);
    document.addEventListener("pointerleave", leave);
    resize();
    if (!still) raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", leave);
      window.removeEventListener("blur", leave);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
