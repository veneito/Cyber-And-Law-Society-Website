import { useEffect, useRef } from "react";
import type { Officer } from "../config/site";

type Shape = { path: string; color: string; fill?: boolean; width?: number };
const GREEN = "#4ade80";
const outline = (path: string, width = 5): Shape => ({ path, color: GREEN, width });
const solid = (path: string, color: string): Shape => ({ path, color, fill: true });

function star(x: number, y: number, radius: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const r = i % 2 ? radius * 0.42 : radius;
    return `${i ? "L" : "M"}${x + Math.cos(a) * r},${y + Math.sin(a) * r}`;
  }).join(" ") + " Z";
}

function flag(philippines: boolean): Shape[] {
  if (philippines) {
    const shapes = [solid("M110 75H490V180H110Z", "#1648a0"), solid("M110 180H490V285H110Z", "#dc3545"),
      solid("M110 75L292 180L110 285Z", "#fff8e8")];
    shapes.push(solid("M190 180m-19 0a19 19 0 1 0 38 0a19 19 0 1 0-38 0", "#f5cf38"));
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      shapes.push({ path: `M${190 + Math.cos(a) * 23} ${180 + Math.sin(a) * 23}L${190 + Math.cos(a) * 35} ${180 + Math.sin(a) * 35}`, color: "#f5cf38", width: 6 });
    }
    for (const [x, y] of [[128, 104], [128, 256], [262, 180]]) shapes.push(solid(star(x, y, 10), "#f5cf38"));
    return shapes;
  }
  const shapes = [solid("M110 75H490V145H110Z", "#f6cf35"), solid("M110 145H490V215H110Z", "#174aa1"), solid("M110 215H490V285H110Z", "#d93647")];
  for (let i = 0; i < 8; i++) {
    const a = Math.PI * (1.15 + i * 0.1);
    shapes.push(solid(star(300 + Math.cos(a) * 73, 216 + Math.sin(a) * 60, 8), "#fffcec"));
  }
  return shapes;
}

const scales = [
  solid("M293 109H307V273H293ZM240 284L256 267H344L360 284ZM225 300L240 284H360L375 300Z", "#113e2d"),
  outline("M293 115V267M307 115V267M256 267H344L360 284H240ZM240 284L225 300H375L360 284M266 278H334", 3),
  outline("M300 49L283 75L300 101L317 75ZM300 60V90M289 75H311", 3),
  outline("M146 130Q164 145 182 125Q218 97 263 115Q285 126 300 107Q315 126 337 115Q382 97 418 125Q436 145 454 130", 5),
  outline("M157 139Q174 150 193 132Q230 112 264 127M336 127Q370 112 407 132Q426 150 443 139", 2),
  outline("M175 137L131 225M175 137V225M175 137L219 225M425 137L381 225M425 137V225M425 137L469 225", 2.5),
  solid("M128 225H222Q210 265 175 269Q140 265 128 225ZM378 225H472Q460 265 425 269Q390 265 378 225Z", "#123e2c"),
  outline("M128 225H222Q210 265 175 269Q140 265 128 225ZM378 225H472Q460 265 425 269Q390 265 378 225ZM137 236H213M387 236H463M152 252H198M402 252H448", 3),
  outline("M300 143L289 158L300 175L311 158ZM300 188L289 203L300 220L311 203Z", 2.5),
];
const computer = [
  outline("M153 89H447V254H153ZM167 104H433V239H167ZM285 254V278M315 254V278M246 281H354", 5),
  outline("M193 140L212 157L193 174M228 175H267M331 133H402M331 154H383M331 175H396M331 196H367", 4),
];
const rod = [
  outline("M181 286Q223 125 395 77M180 285L203 230M395 77Q439 160 420 229Q417 250 401 242Q389 235 401 224", 5),
  outline("M203 239m-20 0a20 20 0 1 0 40 0a20 20 0 1 0-40 0M203 239L221 252M221 252H231", 4),
];
const fingerprint = Array.from({ length: 9 }, (_, i) => {
  const r = 19 + i * 10;
  return outline(`M${300 - r} ${223 + i * 4}C${300 - r - 28} ${83 - i * 2} ${300 + r + 28} ${83 - i * 2} ${300 + r} ${218 + i * 3}Q${300 + r - 12} ${263 + i * 3} ${300 + r - 29} ${276 + i * 2}`, 3.5);
});
const brain = [
  outline("M298 101C269 75 240 88 235 112C205 108 186 133 196 157C169 175 182 207 202 214C195 246 224 267 250 254C263 277 294 267 300 248C310 276 342 274 355 254C384 270 412 247 403 218C430 205 431 174 409 160C424 132 401 106 375 111C367 82 329 76 305 100ZM300 104V248", 5),
  outline("M238 115Q269 119 258 148Q280 147 284 170M199 158Q229 143 240 170Q213 183 223 204M205 214Q237 214 245 236M257 257Q272 227 258 213Q280 208 285 188M374 114Q342 121 351 147Q324 149 318 173M409 161Q376 145 363 173Q392 183 382 205M402 218Q369 211 358 238M353 255Q331 232 345 214Q322 209 317 189", 4),
];

export function OfficerIntro({ kind, name, onComplete }: { kind: NonNullable<Officer["intro"]>; name: string; onComplete: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const complete = useRef(onComplete);
  useEffect(() => { complete.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { complete.current(); return; }
    const source = kind === "fishing-fingerprint" ? rod : flag(kind === "philippines-computer");
    const destination = kind === "venezuela-scales" ? scales : kind === "philippines-computer" ? computer : kind === "venezuela-brain" ? brain : fingerprint;
    const sourcePaths = source.map(shape => ({ ...shape, geometry: new Path2D(shape.path) }));
    const targetPaths = destination.map(shape => ({ ...shape, geometry: new Path2D(shape.path) }));
    const mask = document.createElement("canvas"), code = document.createElement("canvas");
    mask.width = code.width = 600; mask.height = code.height = 360;
    const maskCtx = mask.getContext("2d"), codeCtx = code.getContext("2d");
    if (!maskCtx || !codeCtx) { complete.current(); return; }
    maskCtx.lineCap = maskCtx.lineJoin = "round";
    for (const shape of targetPaths) {
      maskCtx.fillStyle = maskCtx.strokeStyle = "white";
      maskCtx.lineWidth = (shape.width ?? 5) + 9;
      if (shape.fill) maskCtx.fill(shape.geometry); else maskCtx.stroke(shape.geometry);
    }
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };
    canvas.width = 900; canvas.height = 540;
    ctx.scale(1.5, 1.5);
    let frame = 0, start = 0;
    const draw = (now: number) => {
      if (!start) start = now;
      const elapsed = (now - start) * 2.1;
      const melt = clamp((elapsed - 800) / 1450);
      const fill = smooth((elapsed - 1850) / 1350);
      const finish = smooth((elapsed - 2900) / 650);
      const phase = elapsed < 800 ? "source" : elapsed < 2250 ? "melting" : elapsed < 3550 ? "forming" : "symbol";
      if (canvas.dataset.phase !== phase) canvas.dataset.phase = phase;
      ctx.clearRect(0, 0, 600, 360);
      ctx.lineCap = ctx.lineJoin = "round";
      // A continuous liquid edge eats upward through the smooth vector flag.
      if (melt < 1) {
        ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(600, 0);
        for (let x = 600; x >= 0; x -= 4) {
          const ripple = Math.sin(x * 0.055 + elapsed * 0.004) * 11 + Math.sin(x * 0.12) * 5;
          ctx.lineTo(x, 315 - melt * 270 + ripple * Math.sin(melt * Math.PI));
        }
        ctx.closePath(); ctx.clip();
        for (const shape of sourcePaths) {
          ctx.fillStyle = ctx.strokeStyle = shape.color; ctx.lineWidth = shape.width ?? 5;
          if (shape.fill) ctx.fill(shape.geometry); else ctx.stroke(shape.geometry);
        }
        ctx.restore();
      }
      // Columns of actual binary glyphs flow down from the melting boundary.
      if (melt > 0 && finish < 1) {
        ctx.save(); ctx.font = "12px monospace"; ctx.textAlign = "center";
        const alpha = Math.sin(Math.min(1, melt * 1.25) * Math.PI / 2) * (1 - finish);
        for (let column = 0; column < 31; column++) {
          const x = 120 + column * 12;
          const edge = 315 - melt * 270 + Math.sin(x * 0.055 + elapsed * 0.004) * 11;
          for (let row = 0; row < 7; row++) {
            const travel = ((elapsed * 0.09 + column * 17 + row * 18) % 155);
            const y = edge + travel;
            if (y < 65 || y > 314) continue;
            ctx.fillStyle = `rgba(74,222,128,${alpha * (1 - travel / 180) * 0.85})`;
            ctx.fillText((column + row + Math.floor(elapsed / 160)) % 2 ? "1" : "0", x + Math.sin(column + elapsed * 0.001) * 3, y);
          }
        }
        ctx.restore();
      }
      // The streams refill the symbol from its base upward before its edges resolve.
      if (fill > 0) {
        codeCtx.clearRect(0, 0, 600, 360); codeCtx.globalCompositeOperation = "source-over";
        codeCtx.font = "10px monospace"; codeCtx.fillStyle = "#82ffc0";
        for (let y = 320; y > 320 - fill * 280; y -= 11) for (let x = 120; x < 480; x += 8) {
          codeCtx.fillText((x / 8 + y + Math.floor(elapsed / 190)) % 3 ? "0" : "1", x, y);
        }
        codeCtx.globalCompositeOperation = "destination-in"; codeCtx.drawImage(mask, 0, 0);
        ctx.save(); ctx.globalAlpha = 0.9 - finish * 0.65; ctx.drawImage(code, 0, 0); ctx.restore();
        ctx.save(); ctx.globalAlpha = finish; ctx.shadowColor = GREEN; ctx.shadowBlur = 12;
        for (const shape of targetPaths) {
          ctx.lineWidth = shape.width ?? 5; ctx.fillStyle = ctx.strokeStyle = shape.color;
          if (shape.fill) ctx.fill(shape.geometry); else ctx.stroke(shape.geometry);
        }
        ctx.restore();
      }
      if (elapsed >= 4200) complete.current();
      else frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [kind]);

  return (
    <div className="py-4">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-green-300">{name}</p>
      <canvas ref={ref} aria-hidden className="my-4 aspect-[5/3] w-full" />
    </div>
  );
}
