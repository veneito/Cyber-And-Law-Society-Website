import { useEffect, useRef, useState } from "react";
import { siteConfig } from "../config/site";
import { t as tr } from "../i18n/language";

export function JusticeHologram() {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = host.current!;
    const abort = new AbortController();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let started = false, visible = false, disposed = false, frame = 0;
    let render: ((time: number) => void) | undefined;
    let release: (() => void) | undefined;

    const stop = () => { cancelAnimationFrame(frame); frame = 0; };
    let last = 0;
    const tick = (time: number) => {
      frame = 0;
      if (!visible || document.hidden || !render) return;
      if (time - last >= 1000 / 30) { render(time); last = time; }
      if (!reducedMotion.matches) frame = requestAnimationFrame(tick);
    };
    const resume = () => { stop(); if (render) frame = requestAnimationFrame(tick); };
    const init = async () => {
      try {
        const [THREE, response] = await Promise.all([
          import("three"), fetch(siteConfig.hologram.path, { signal: abort.signal }),
        ]);
        if (!response.ok) throw new Error("Hologram unavailable");
        const data: { segments: number[]; points: number[] } = await response.json();
        if (disposed) return;
        if (!data.segments?.length || data.segments.length % 6 || !data.points?.length || data.points.length % 3 ||
            ![...data.segments, ...data.points].every(Number.isFinite)) throw new Error("Invalid hologram data");

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setClearColor(0x000000, 0);
        element.appendChild(renderer.domElement);
        renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
        const scene = new THREE.Scene();
        const model = new THREE.Group();
        scene.add(model);
        const lines = new THREE.BufferGeometry();
        lines.setAttribute("position", new THREE.Float32BufferAttribute(data.segments, 3));
        const vertices = new THREE.BufferGeometry();
        vertices.setAttribute("position", new THREE.Float32BufferAttribute(data.points, 3));
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x32dd89, transparent: true, opacity: 0.74, blending: THREE.AdditiveBlending, depthWrite: false });
        const pointMaterial = new THREE.ShaderMaterial({
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
          uniforms: { pixelRatio: { value: renderer.getPixelRatio() } },
          vertexShader: "uniform float pixelRatio; void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = 4.5 * pixelRatio; }",
          fragmentShader: "void main() { float d = length(gl_PointCoord - vec2(0.5)); if (d > 0.5) discard; gl_FragColor = vec4(0.35, 1.0, 0.65, (1.0 - smoothstep(0.08, 0.5, d)) * 0.95); }",
        });
        model.add(new THREE.LineSegments(lines, lineMaterial), new THREE.Points(vertices, pointMaterial));
        lines.computeBoundingBox();
        const center = lines.boundingBox!.getCenter(new THREE.Vector3());
        model.position.copy(center).negate();
        const pivot = new THREE.Group();
        scene.remove(model); pivot.add(model); scene.add(pivot);
        const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 30);
        camera.up.set(0, 0, 1);
        camera.position.set(0.35, -9, 1); camera.lookAt(0, 0, 0);
        let pointer = 0;
        const move = (event: PointerEvent) => {
          const bounds = element.getBoundingClientRect();
          pointer = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.18;
        };
        const leave = () => { pointer = 0; };
        let turn = 0, previousTime = 0;
        render = (time) => {
          const still = reducedMotion.matches;
          const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.1) : 0;
          previousTime = time;
          if (!still) turn = (turn + delta * Math.PI * 2 / 32) % (Math.PI * 2);
          pivot.rotation.z = still ? 0 : turn + pointer;
          pivot.position.z = still ? 0 : Math.sin(time * 0.0008) * 0.025;
          renderer.render(scene, camera);
        };
        const resize = () => {
          const { width, height } = element.getBoundingClientRect();
          if (!width || !height) return;
          const halfHeight = 1.9;
          camera.left = -halfHeight * width / height; camera.right = -camera.left;
          camera.top = halfHeight; camera.bottom = -halfHeight; camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
          if (visible && !document.hidden) render?.(performance.now());
        };
        const observer = new ResizeObserver(resize); observer.observe(element);
        element.addEventListener("pointermove", move); element.addEventListener("pointerleave", leave);
        const contextLost = (event: Event) => { event.preventDefault(); stop(); setFailed(true); };
        renderer.domElement.addEventListener("webglcontextlost", contextLost);
        release = () => {
          observer.disconnect(); element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", leave);
          renderer.domElement.removeEventListener("webglcontextlost", contextLost);
          lines.dispose(); vertices.dispose(); lineMaterial.dispose(); pointMaterial.dispose();
          renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
        };
        resize(); resume();
      } catch {
        if (!disposed) setFailed(true);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !started) { started = true; void init(); }
      if (visible) resume(); else stop();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", resume);
    reducedMotion.addEventListener("change", resume);
    return () => {
      disposed = true; abort.abort(); stop(); observer.disconnect();
      document.removeEventListener("visibilitychange", resume); reducedMotion.removeEventListener("change", resume);
      release?.();
    };
  }, []);

  return (
    <figure className="mx-auto w-full max-w-[480px] lg:-mt-16">
      <div ref={host} role="img" aria-label={siteConfig.hologram.label} className="relative aspect-[4/5] w-full">
        {failed && <img src={siteConfig.hologram.preview} alt="" className="absolute inset-0 h-full w-full object-contain" />}
      </div>
      <figcaption className="mt-3 text-center text-xs leading-relaxed text-neutral-400">
        {tr("Lady Justice adapted from")} {" "}
        <a href={siteConfig.hologram.source} target="_blank" rel="noreferrer" className="underline decoration-neutral-700 underline-offset-2 hover:text-green-300">{siteConfig.hologram.author}</a>
        {" · "}<a href={siteConfig.hologram.license} target="_blank" rel="noreferrer" className="underline decoration-neutral-700 underline-offset-2 hover:text-green-300">CC BY 4.0</a>.
        <span className="block">{tr("Simplified geometry and hologram styling; custom shield, bacteriophage, and scales.")}</span>
      </figcaption>
    </figure>
  );
}
