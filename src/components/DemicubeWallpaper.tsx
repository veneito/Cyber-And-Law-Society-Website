import { useEffect, useRef } from 'react';

// Regular icosahedral wireframe: equal edges and every vertex on the same sphere.
const phi = (1 + Math.sqrt(5)) / 2;
const radius = Math.sqrt(1 + phi * phi);
const vertices: number[][] = [];
for (const a of [-1, 1]) for (const b of [-phi, phi]) {
  vertices.push([0, a / radius, b / radius], [a / radius, b / radius, 0], [b / radius, 0, a / radius]);
}
const edgeLength = 2 / radius;
const edges = vertices.flatMap((_, a) => vertices.flatMap((_, b) =>
  b > a ? [[a, b]] : [],
));
// Real 3D chord intersections stay attached to the structure as it rotates.
const interiorNodes: number[][] = [];
const dot = (a: number[], b: number[]) => a.reduce((sum, value, axis) => sum + value * b[axis], 0);
for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) {
  const [a, b] = edges[i], [c, d] = edges[j];
  if (a === c || a === d || b === c || b === d) continue;
  const u = vertices[b].map((value, axis) => value - vertices[a][axis]);
  const v = vertices[d].map((value, axis) => value - vertices[c][axis]);
  const w = vertices[a].map((value, axis) => value - vertices[c][axis]);
  const uu = dot(u, u), uv = dot(u, v), vv = dot(v, v), uw = dot(u, w), vw = dot(v, w);
  const denominator = uu * vv - uv * uv;
  if (Math.abs(denominator) < 1e-8) continue;
  const s = (uv * vw - vv * uw) / denominator, t = (uu * vw - uv * uw) / denominator;
  if (s <= 0.001 || s >= 0.999 || t <= 0.001 || t >= 0.999) continue;
  const point = vertices[a].map((value, axis) => value + s * u[axis]);
  const other = vertices[c].map((value, axis) => value + t * v[axis]);
  if (Math.hypot(...point.map((value, axis) => value - other[axis])) > 1e-6) continue;
  if (!interiorNodes.some(node => Math.hypot(...point.map((value, axis) => value - node[axis])) < 1e-6)) interiorNodes.push(point);
}
export function DemicubeWallpaper() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const context = canvas.getContext('2d');
    if (!context) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, previous = 0, angle = 0;
    function draw() {
      const width = canvas.clientWidth, height = canvas.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      context!.clearRect(0, 0, width, height);
      // Broad, barely visible light fields give the black space depth without clutter.
      const drift = angle * 0.45;
      const hazeX = width * (0.65 + Math.sin(drift) * 0.08);
      const hazeY = height * (0.45 + Math.cos(drift * 0.7) * 0.08);
      const hazeRadius = Math.max(width, height) * 0.58;
      const haze = context!.createRadialGradient(hazeX, hazeY, 0, hazeX, hazeY, hazeRadius);
      haze.addColorStop(0, 'rgba(65, 110, 91, 0.085)');
      haze.addColorStop(0.45, 'rgba(42, 65, 60, 0.035)');
      haze.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context!.fillStyle = haze;
      context!.fillRect(0, 0, width, height);
      const distant = context!.createRadialGradient(width * (0.2 - Math.sin(drift) * 0.05), height * 0.72, 0, width * 0.2, height * 0.72, hazeRadius * 0.7);
      distant.addColorStop(0, 'rgba(79, 91, 111, 0.035)');
      distant.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context!.fillStyle = distant;
      context!.fillRect(0, 0, width, height);
      const size = Math.min(width * 0.26, height * 0.35, 310);
      const centerX = width < 650 ? width * 0.58 : width * 0.72;
      const points = [...vertices, ...interiorNodes].map(([x, y, z]) => {
        const c = Math.cos(angle), s = Math.sin(angle);
        const rx = x * c + z * s, rz = -x * s + z * c;
        const tilt = 0.27;
        const ry = y * Math.cos(tilt) - rz * Math.sin(tilt);
        const depth = y * Math.sin(tilt) + rz * Math.cos(tilt);
        const perspective = 1;
        return { x: centerX + rx * size * perspective, y: height * 0.49 + ry * size * perspective, z: depth };
      });
      context!.strokeStyle = '#7bf1a8';
      context!.lineWidth = 1.25;
      for (const [a, b] of [...edges].sort((a, b) => points[a[0]].z + points[a[1]].z - points[b[0]].z - points[b[1]].z)) {
        const from = points[a], to = points[b];
        const outerEdge = Math.abs(Math.hypot(...vertices[a].map((value, axis) => value - vertices[b][axis])) - edgeLength) < 0.00001;
        context!.lineWidth = outerEdge ? 1.25 : 0.8;
        context!.globalAlpha = Math.max(0.18, Math.min(0.85, 0.48 + (from.z + to.z) * 0.12)) * (outerEdge ? 1 : 0.48);
        context!.beginPath();
        context!.moveTo(from.x, from.y);
        context!.lineTo(to.x, to.y);
        context!.stroke();
      }
      for (const point of [...points].sort((a, b) => a.z - b.z)) {
        const depth = (point.z + 1) / 2;
        const nodeRadius = 2.2 + depth * 1.1;
        context!.globalAlpha = 1;
        context!.fillStyle = '#000';
        context!.beginPath();
        context!.arc(point.x, point.y, nodeRadius, 0, Math.PI * 2);
        context!.fill();
        context!.globalAlpha = 0.45 + depth * 0.5;
        context!.lineWidth = 1.1;
        context!.strokeStyle = '#7bf1a8';
        context!.stroke();
      }
      context!.globalAlpha = 1;
    }
    function tick(time: number) {
      if (time - previous >= 1000 / 30) {
        if (previous) angle += Math.min(time - previous, 100) * 0.00018;
        previous = time;
        draw();
      }
      frame = requestAnimationFrame(tick);
    }
    function resume() {
      cancelAnimationFrame(frame);
      previous = 0;
      draw();
      if (!document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(tick);
    }
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    document.addEventListener('visibilitychange', resume);
    reducedMotion.addEventListener('change', resume);
    resume();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', resume);
      reducedMotion.removeEventListener('change', resume);
    };
  }, []);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}








