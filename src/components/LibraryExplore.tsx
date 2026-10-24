import { t as tr } from '../i18n/language';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sfx } from './sound';
import { EYE_HEIGHT, loadLibrary } from './libraryAsset';

type Props = { onPing: (x: number, y: number) => Promise<{ strength: number; found: boolean } | null>; onKey: () => void };

export default function LibraryExplore({ onPing, onKey }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const live = useRef({ onPing });
  useEffect(() => { live.current = { onPing }; }, [onPing]);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [floor, setFloor] = useState(0);
  const [overview, setOverview] = useState(false);
  const [inspectFloor, setInspectFloor] = useState(0);
  const [heat, setHeat] = useState(0);
  const [found, setFound] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const inspection = useRef({ overview: false, floor: 0 });
  useEffect(() => {
    inspection.current = { overview, floor: inspectFloor };
    if (overview && document.pointerLockElement) document.exitPointerLock();
  }, [overview, inspectFloor]);
  const controls = useRef({ forward: false, back: false, left: false, right: false, turnLeft: false, turnRight: false });
  const state = useRef({ started: false, found: false });
  useEffect(() => { state.current = { started, found }; }, [started, found]);

  useEffect(() => {
    const el = mount.current!;
    const abort = new AbortController();
    let dead = false, raf = 0, last = 0, lastPing = 0, pinging = false;
    let currentFloor = 0, yaw = Math.PI / 2, pitch = 0;
    let asset: Awaited<ReturnType<typeof loadLibrary>> | undefined;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: false }); }
    catch { setError(tr('This exploration needs WebGL. Try a browser with hardware acceleration enabled.')); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    el.appendChild(renderer.domElement); renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute('aria-label', tr('Marx Library first-person exploration'));
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x010503);
    const fog = new THREE.Fog(0x010503, 16, 65); scene.fog = fog;
    const camera = new THREE.PerspectiveCamera(60, 1, 0.05, 100); camera.rotation.order = 'YXZ';
    const planCamera = new THREE.OrthographicCamera(-35, 35, 35, -35, 0.1, 100);
    planCamera.up.set(0, 0, -1);
    const feet = new THREE.Vector3();
    const ceilingClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 2.8);
    const floorClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.1);
    const keys = new Set<string>();
    const clear = () => { keys.clear(); for (const key of Object.keys(controls.current) as (keyof typeof controls.current)[]) controls.current[key] = false; };
    const down = (e: KeyboardEvent) => {
      if ((document.activeElement === renderer.domElement || document.pointerLockElement === renderer.domElement) && ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) { e.preventDefault(); keys.add(e.code); }
    };
    const up = (e: KeyboardEvent) => keys.delete(e.code);
    const look = (e: MouseEvent) => {
      if (document.pointerLockElement === renderer.domElement) { yaw -= e.movementX * 0.002; pitch = THREE.MathUtils.clamp(pitch - e.movementY * 0.002, -1.2, 1.2); }
    };
    const lock = () => { setLocked(document.pointerLockElement === renderer.domElement); clear(); };
    const click = () => {
      if (asset && state.current.started && !state.current.found && !inspection.current.overview) {
        renderer.domElement.focus();
        renderer.domElement.requestPointerLock?.()?.catch(() => { /* On-screen controls remain available. */ });
      }
    };
    const resize = () => {
      const width = Math.max(1, el.clientWidth), height = Math.max(1, el.clientHeight);
      renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix();
      planCamera.left = -28 * width / height; planCamera.right = 28 * width / height; planCamera.top = 28; planCamera.bottom = -28; planCamera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    addEventListener('keydown', down); addEventListener('keyup', up); addEventListener('mousemove', look); addEventListener('blur', clear);
    document.addEventListener('pointerlockchange', lock); renderer.domElement.addEventListener('click', click);
    const release = (loaded: Awaited<ReturnType<typeof loadLibrary>>) => {
      loaded.model.traverse(o => {
        if (o instanceof THREE.Mesh) { o.geometry.dispose(); for (const mat of Array.isArray(o.material) ? o.material : [o.material]) mat.dispose(); }
      });
      loaded.lineGeometry.dispose(); loaded.walking.dispose();
    };
    void loadLibrary(abort.signal).then(loaded => {
      if (dead) { release(loaded); return; }
      asset = loaded;
      const { manifest, model, lineGeometry } = loaded;
      model.traverse(o => {
        if (o instanceof THREE.Mesh) {
          const old = Array.isArray(o.material) ? o.material : [o.material];
          const materials = old.map(m => new THREE.MeshBasicMaterial({ color: 0x04170c, side: THREE.DoubleSide, transparent: m.transparent, opacity: m.transparent ? 0.17 : 1, depthWrite: !m.transparent }));
          o.material = Array.isArray(o.material) ? materials : materials[0];
          old.forEach(m => m.dispose());
        }
      });
      scene.add(model);
      scene.add(new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0x239757, transparent: true, opacity: 0.48 })));
      feet.fromArray(manifest.spawn.position); yaw = manifest.spawn.yaw;
      const ground = loaded.walking.floorAt(feet.x, feet.z, feet.y);
      if (ground === null || !loaded.walking.canStand(feet.x, ground, feet.z)) throw new Error('Room 181 starting point is obstructed');
      feet.y = ground;
      camera.position.copy(feet).y += EYE_HEIGHT; camera.rotation.set(0, yaw, 0);
      const center = new THREE.Vector3().fromArray(manifest.bounds.min).add(new THREE.Vector3().fromArray(manifest.bounds.max)).multiplyScalar(0.5);
      planCamera.position.set(center.x, 60, center.z); planCamera.lookAt(center.x, 0, center.z);
      setFloor(0); setReady(true);
    }).catch(err => { if (!dead && err.name !== 'AbortError') setError(tr('The library map could not be loaded. Please retry.')); });

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.04); last = now;
      const inspect = inspection.current;
      if (asset && state.current.started && !state.current.found && !inspect.overview) {
        const c = controls.current;
        yaw += ((keys.has('ArrowLeft') || c.turnLeft ? 1 : 0) - (keys.has('ArrowRight') || c.turnRight ? 1 : 0)) * dt * 1.6;
        const forward = (keys.has('KeyW') || keys.has('ArrowUp') || c.forward ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') || c.back ? 1 : 0);
        const side = (keys.has('KeyD') || c.right ? 1 : 0) - (keys.has('KeyA') || c.left ? 1 : 0);
        const speed = dt * 2.8 / Math.max(1, Math.hypot(forward, side));
        const dx = (-Math.sin(yaw) * forward + Math.cos(yaw) * side) * speed;
        const dz = (-Math.cos(yaw) * forward - Math.sin(yaw) * side) * speed;
        asset.walking.move(feet, dx, 0); asset.walking.move(feet, 0, dz);
        camera.position.copy(feet).y += EYE_HEIGHT; camera.rotation.set(pitch, yaw, 0);
        const nextFloor = feet.y > asset.manifest.floors[1] - 0.2 ? 1 : 0;
        if (nextFloor !== currentFloor) { currentFloor = nextFloor; setFloor(nextFloor); }
        if (now - lastPing > 650 && !pinging) {
          lastPing = now; pinging = true;
          const upstairs = Math.abs(feet.y - asset.manifest.floors[1]) < 0.2;
          // Keep the existing API coordinate system and its server-only target unchanged.
          const x = upstairs ? (feet.x - asset.manifest.sonarAnchor[0]) * 20 + 312 : 2000;
          const z = upstairs ? (feet.z - asset.manifest.sonarAnchor[1]) * 20 + 175 : 2000;
          void live.current.onPing(x, z).then(r => {
            if (dead || !r) return;
            const strength = Math.max(0, Math.min(1, (r.strength - 0.7) / 0.3)); setHeat(strength);
            if (strength > 0.05) sfx.beep(strength > 0.6);
            if (r.found && upstairs) { state.current.found = true; setFound(true); if (document.pointerLockElement === renderer.domElement) document.exitPointerLock(); }
          }).catch(() => {}).finally(() => { pinging = false; });
        }
      }
      scene.fog = inspect.overview ? null : fog;
      ceilingClip.constant = inspect.floor * 4.5 + 2.8; floorClip.constant = -inspect.floor * 4.5 + 0.1;
      renderer.clippingPlanes = inspect.overview ? [ceilingClip, floorClip] : [];
      renderer.render(scene, inspect.overview ? planCamera : camera);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      dead = true; abort.abort(); cancelAnimationFrame(raf); observer.disconnect(); clear();
      if (document.pointerLockElement === renderer.domElement) document.exitPointerLock();
      removeEventListener('keydown', down); removeEventListener('keyup', up); removeEventListener('mousemove', look); removeEventListener('blur', clear);
      document.removeEventListener('pointerlockchange', lock); renderer.domElement.removeEventListener('click', click);
      if (asset) release(asset);
      scene.children.forEach(o => { if (o instanceof THREE.LineSegments) (o.material as THREE.Material).dispose(); });
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [attempt]);

  const hold = (key: keyof typeof controls.current) => (e: React.PointerEvent<HTMLButtonElement>) => { e.currentTarget.setPointerCapture(e.pointerId); controls.current[key] = true; };
  return <div className="max-w-5xl">
    <div className="mb-3 flex flex-wrap gap-2">
      <button disabled={!ready} aria-pressed={overview} onClick={() => setOverview(!overview)} className="rounded border border-green-600 px-4 py-2 text-sm text-green-300 disabled:opacity-40">{overview ? tr('Return to first person') : tr('Inspect top-down layout')}</button>
      {overview && [0, 1].map(f => <button key={f} aria-pressed={inspectFloor === f} onClick={() => setInspectFloor(f)} className={`rounded border px-4 py-2 text-sm ${inspectFloor === f ? 'border-green-300 text-green-200' : 'border-neutral-700 text-neutral-400'}`}>{tr('Floor')}{f + 1}</button>)}
    </div>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-green-300"><span>{tr('MARX LIBRARY // FLOOR')}{(overview ? inspectFloor : floor) + 1}</span><span>{found ? tr('SIGNAL LOCATED') : `SIGNAL ${Math.round(heat * 100)}%`}</span></div>
    <div className="relative overflow-hidden rounded-xl border border-green-500/60 bg-black">
      <div ref={mount} className="h-[min(65vh,38rem)] min-h-80 w-full" />
      {!ready && !error && <p role="status" className="absolute inset-4 bg-black/80 p-4 font-mono text-green-300">{tr('Loading library…')}</p>}
      {ready && !started && !overview && <button onClick={() => setStarted(true)} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded border border-green-400 bg-black/90 px-6 py-3 font-mono text-green-300">{tr('Begin exploration')}</button>}
      {error && <div role="alert" className="absolute inset-4 bg-black p-4 text-red-300"><p>{error}</p><button onClick={() => { setReady(false); setError(''); setAttempt(n => n + 1); }} className="mt-3 rounded border border-green-700 px-4 py-2 text-green-300">{tr('Retry')}</button></div>}
      {started && !found && !overview && <><span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 text-green-300/60">+</span><div className="pointer-events-none absolute bottom-4 right-4 rounded border border-green-700 bg-black/85 p-3 font-mono text-green-400"><div className="relative mx-auto h-20 w-20 rounded-full border border-green-800"><div className="absolute inset-3 rounded-full border border-green-900" /><div className="absolute inset-7 rounded-full bg-green-400" style={{ opacity: 0.2 + heat * 0.8 }} /><div className="absolute inset-x-0 top-1/2 border-t border-green-900" /></div><p className="mt-2 text-center text-[10px]">{Math.round(heat * 100)}{tr('% // SCANNING')}</p></div></>}
    </div>
    <p className="mt-3 text-sm text-neutral-400">{overview ? tr('TOP-DOWN INSPECTION · North is up · Exploration is paused.') : found ? tr('USB signal located. Recover the device below.') : locked ? tr('WASD to walk · mouse to look · Esc releases mouse. Follow the curved central stairs to floor two.') : tr('Start in room 181. Click the scene for mouse look. WASD to walk, arrow keys to turn.')}</p>
    {started && !found && <div className="mt-3 flex flex-wrap gap-2">{([['forward', tr('Forward')], ['back', tr('Back')], ['left', tr('Strafe left')], ['right', tr('Strafe right')], ['turnLeft', tr('Turn left')], ['turnRight', tr('Turn right')]] as const).map(([key, label]) => <button key={key} className="touch-none rounded border border-green-900 px-3 py-2 text-xs text-green-300" onPointerDown={hold(key)} onPointerUp={() => { controls.current[key] = false; }} onPointerCancel={() => { controls.current[key] = false; }}>{label}</button>)}
    </div>}
    {found && <button onClick={onKey} className="mt-4 rounded-lg bg-green-400 px-5 py-3 font-semibold text-black">{tr('Recover USB')}</button>}
  </div>;
}
