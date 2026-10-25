import { t as tr } from '../i18n/language';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sfx, soundOn, setSound } from './sound';
import { LibraryAudio } from './libraryAudio';
import { EYE_HEIGHT, loadLibrary } from './libraryAsset';
import { libraryHologramMaterial } from './libraryHologram';
import { loadLibraryDog } from './libraryDog';
import LibraryBoot from './LibraryBoot';
import LibraryRadar, { LibraryRespawn } from './LibraryRadar';
import { radarContact, withinUsbReach, sonarFeedback } from './libraryObjective';
import { CATCH_DURATION } from './libraryPursuit';

type Props = { onPing: (x: number, y: number) => Promise<{ strength: number; found: boolean } | null>; onKey: () => void };

export default function LibraryExplore({ onPing, onKey }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const live = useRef({ onPing });
  useEffect(() => { live.current = { onPing }; }, [onPing]);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [booting, setBooting] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  useEffect(() => {
    if (!booting) return;
    const start = performance.now();
    const timer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - start) / 3800);
      setBootProgress(progress);
      if (progress === 1) { clearInterval(timer); setBooting(false); setStarted(true); mount.current?.querySelector('canvas')?.focus(); }
    }, 40);
    return () => clearInterval(timer);
  }, [booting]);
  const [locked, setLocked] = useState(false);
  const [floor, setFloor] = useState(0);
  const [overview, setOverview] = useState(false);
  const [inspectFloor, setInspectFloor] = useState(0);
  const [heat, setHeat] = useState(0);
  const [found, setFound] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [caught, setCaught] = useState(false);
  const [grace, setGrace] = useState(9);
  const [respawnProgress, setRespawnProgress] = useState(0);
  const [canCollect, setCanCollect] = useState(false);
  const [radar, setRadar] = useState({ usb: { x: 50, y: 50, distance: 0 }, dog: { x: 50, y: 50, distance: 0 }, dogFloor: 2 });
  const collect = useRef(() => {});
  const audio = useRef<LibraryAudio | null>(null);
  const [audioOn, setAudioOn] = useState(soundOn);
  const completion = useRef<HTMLDivElement>(null);
  useEffect(() => { if (found) completion.current?.focus(); }, [found]);
  const inspection = useRef({ overview: false, floor: 0 });
  useEffect(() => {
    inspection.current = { overview, floor: inspectFloor };
    if (overview && document.pointerLockElement) document.exitPointerLock();
  }, [overview, inspectFloor]);
  const controls = useRef({ forward: false, back: false, left: false, right: false, turnLeft: false, turnRight: false, sprint: false });
  const state = useRef({ started: false, found: false });
  useEffect(() => { state.current = { started, found }; }, [started, found]);

  useEffect(() => {
    const el = mount.current!;
    const abort = new AbortController();
    const soundscape = new LibraryAudio(soundOn); audio.current = soundscape;
    let dead = false, raf = 0, last = 0, lastPing = 0, pinging = false;
    let currentFloor = 0, yaw = Math.PI / 2, pitch = 0;
    let asset: Awaited<ReturnType<typeof loadLibrary>> | undefined;
    let dog: Awaited<ReturnType<typeof loadLibraryDog>> | undefined;
    let catchLeft = 0, runId = 0, shownGrace = -1, lastHud = 0, pickupReady = false, signalConfirmed = false;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: false }); }
    catch { setError(tr('This exploration needs WebGL. Try a browser with hardware acceleration enabled.')); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    el.appendChild(renderer.domElement); renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute('aria-label', tr('Marx Library first-person exploration'));
    const laserLayer = new THREE.Group();
    const laserMaterials: THREE.Material[] = [];
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000201);
    const fog = new THREE.Fog(0x000201, 16, 65); scene.fog = fog;
    const camera = new THREE.PerspectiveCamera(60, 1, 0.05, 100); camera.rotation.order = 'YXZ';
    const planCamera = new THREE.OrthographicCamera(-35, 35, 35, -35, 0.1, 100);
    planCamera.up.set(0, 0, -1);
    const feet = new THREE.Vector3();
    const ceilingClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 2.8);
    const floorClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.1);
    const keys = new Set<string>();
    const usb = new THREE.Group();
    const usbBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.045, 0.26), new THREE.MeshBasicMaterial({ color: 0x75ffbc }));
    const usbPlug = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.035, 0.09), new THREE.MeshBasicMaterial({ color: 0xe6fff4 }));
    usb.scale.setScalar(0.55);
    usbPlug.position.z = -0.17; usb.add(usbBody, usbPlug); usb.name = 'Collectible USB';
    const sight = new THREE.Raycaster(), sightDirection = new THREE.Vector3();
    const pickupAllowed = () => {
      if (!asset || !state.current.started || state.current.found || catchLeft > 0 || inspection.current.overview || !signalConfirmed || document.hidden) return false;
      if (!withinUsbReach(feet.x, feet.y, feet.z, usb.position.x, asset.manifest.floors[1], usb.position.z)) return false;
      sightDirection.copy(usb.position).sub(camera.position);
      const distance = sightDirection.length(); sightDirection.normalize();
      sight.set(camera.position, sightDirection); sight.far = Math.max(0, distance - 0.15);
      return sight.intersectObject(asset.model, true).length === 0;
    };
    collect.current = () => {
      if (!pickupAllowed()) return;
      soundscape.stop(); sfx.chime(); state.current.found = true; setFound(true); setCanCollect(false); usb.visible = false; clear();
      if (document.pointerLockElement === renderer.domElement) document.exitPointerLock();
    };
    const clear = () => { keys.clear(); for (const key of Object.keys(controls.current) as (keyof typeof controls.current)[]) controls.current[key] = false; };
    const down = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && !e.repeat && (document.activeElement === renderer.domElement || document.pointerLockElement === renderer.domElement)) { e.preventDefault(); collect.current(); }
      if ((document.activeElement === renderer.domElement || document.pointerLockElement === renderer.domElement) && ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'].includes(e.code)) { e.preventDefault(); keys.add(e.code); }
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
    const visibility = () => { if (document.hidden) { clear(); soundscape.stop(); } };
    document.addEventListener('visibilitychange', visibility);
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    addEventListener('keydown', down); addEventListener('keyup', up); addEventListener('mousemove', look); addEventListener('blur', clear);
    document.addEventListener('pointerlockchange', lock); renderer.domElement.addEventListener('click', click);
    const release = (loaded: Awaited<ReturnType<typeof loadLibrary>>) => {
      const materials = new Set<THREE.Material>();
      loaded.model.traverse(o => {
        if (o instanceof THREE.Mesh) { o.geometry.dispose(); for (const mat of Array.isArray(o.material) ? o.material : [o.material]) materials.add(mat); }
      });
      materials.forEach(material => material.dispose());
      loaded.lineGeometry.dispose(); loaded.walking.dispose();
    };
    void loadLibrary(abort.signal).then(async loaded => {
      if (dead) { release(loaded); return; }
      asset = loaded;
      const { manifest, model, lineGeometry } = loaded;
      const opaqueHologram = libraryHologramMaterial();
      const glassHologram = libraryHologramMaterial(true);
      const opaqueLasers = libraryHologramMaterial(false, true);
      const glassLasers = libraryHologramMaterial(true, true);
      laserMaterials.push(opaqueLasers, glassLasers);
      model.traverse(o => {
        if (o instanceof THREE.Mesh) {
          const old = Array.isArray(o.material) ? o.material : [o.material];
          const materials = old.map(m => m.transparent ? glassHologram : opaqueHologram);
          const beams = old.map(m => m.transparent ? glassLasers : opaqueLasers);
          const raised = new THREE.Mesh(o.geometry, Array.isArray(o.material) ? beams : beams[0]);
          o.updateWorldMatrix(true, false); raised.matrixAutoUpdate = false; raised.matrix.copy(o.matrixWorld);
          laserLayer.add(raised);
          o.material = Array.isArray(o.material) ? materials : materials[0];
          old.forEach(m => m.dispose());
        }
      });
      scene.add(model, laserLayer);
      // Rest above the exported bird book without changing the imported geometry.
      usb.position.set(manifest.sonarAnchor[0] + 0.22, manifest.floors[1] + 1.18, manifest.sonarAnchor[1]);
      model.updateMatrixWorld(true);
      const bookRay = new THREE.Raycaster(new THREE.Vector3(usb.position.x, manifest.floors[1] + 1.4, usb.position.z), new THREE.Vector3(0, -1, 0), 0, 0.6);
      const bookSurface = bookRay.intersectObject(model, true)[0];
      if (!bookSurface?.face) throw new Error('USB lectern surface is missing');
      const normal = bookSurface.face.normal.clone().transformDirection(bookSurface.object.matrixWorld);
      usb.position.copy(bookSurface.point).addScaledVector(normal, 0.0165);
      usb.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      scene.add(usb);
      scene.add(new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0x39db7b, transparent: true, opacity: 0.78 })));
      feet.fromArray(manifest.spawn.position); yaw = manifest.spawn.yaw;
      const ground = loaded.walking.floorAt(feet.x, feet.z, feet.y);
      if (ground === null || !loaded.walking.canStand(feet.x, ground, feet.z)) throw new Error('Room 181 starting point is obstructed');
      feet.y = ground;
      camera.position.copy(feet).y += EYE_HEIGHT; camera.rotation.set(0, yaw, 0);
      const center = new THREE.Vector3().fromArray(manifest.bounds.min).add(new THREE.Vector3().fromArray(manifest.bounds.max)).multiplyScalar(0.5);
      planCamera.position.set(center.x, 60, center.z); planCamera.lookAt(center.x, 0, center.z);
      const loadedDog = await loadLibraryDog(abort.signal, loaded.walking, feet);
      if (dead) { loadedDog.dispose(); return; }
      dog = loadedDog; scene.add(dog.root);
      setFloor(0); setCaught(false); setReady(true);
    }).catch(err => { if (!dead && err.name !== 'AbortError') setError(tr('The library map could not be loaded. Please retry.')); });

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const elapsed = Math.max(0, (now - last) / 1000);
      const dt = Math.min(elapsed, 0.04); last = now;
      const inspect = inspection.current;
      if (asset && dog && state.current.started && !state.current.found && !inspect.overview && !document.hidden) {
        if (catchLeft > 0) {
          catchLeft = Math.max(0, catchLeft - elapsed);
          if (now - lastHud > 70) { setRespawnProgress(1 - catchLeft / CATCH_DURATION); lastHud = now; }
          dog.animate(dt, true, reducedMotion.matches);
          const shake = reducedMotion.matches ? 0 : Math.sin(now * 0.045) * 0.015;
          camera.rotation.set(pitch + shake, yaw - shake, 0);
          if (catchLeft === 0) {
            feet.fromArray(asset.manifest.spawn.position);
            feet.y = asset.walking.floorAt(feet.x, feet.z, feet.y) ?? feet.y;
            yaw = asset.manifest.spawn.yaw; pitch = 0;
            camera.position.copy(feet).y += EYE_HEIGHT; camera.rotation.set(0, yaw, 0);
            currentFloor = 0; setFloor(0); setHeat(0); setFound(false); state.current.found = false;
            signalConfirmed = false; pickupReady = false; setCanCollect(false); usb.visible = true;
            dog.reset(); soundscape.reset(); setCaught(false); clear(); lastPing = now;
          }
        } else {
          const oldX = feet.x, oldZ = feet.z, oldDogX = dog.pursuit.position.x, oldDogZ = dog.pursuit.position.z;
          const c = controls.current;
          yaw += ((keys.has('ArrowLeft') || c.turnLeft ? 1 : 0) - (keys.has('ArrowRight') || c.turnRight ? 1 : 0)) * dt * 1.6;
          const forward = (keys.has('KeyW') || keys.has('ArrowUp') || c.forward ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') || c.back ? 1 : 0);
          const side = (keys.has('KeyD') || c.right ? 1 : 0) - (keys.has('KeyA') || c.left ? 1 : 0);
          const sprinting = keys.has('ShiftLeft') || keys.has('ShiftRight') || c.sprint;
          const speed = dt * (sprinting ? 5 : 2.8) / Math.max(1, Math.hypot(forward, side));
          const dx = (-Math.sin(yaw) * forward + Math.cos(yaw) * side) * speed;
          const dz = (-Math.cos(yaw) * forward - Math.sin(yaw) * side) * speed;
          asset.walking.move(feet, dx, 0); asset.walking.move(feet, 0, dz);
          camera.position.copy(feet).y += EYE_HEIGHT; camera.rotation.set(pitch, yaw, 0);
          const nextFloor = feet.y > asset.manifest.floors[1] - 0.2 ? 1 : 0;
          if (nextFloor !== currentFloor) { currentFloor = nextFloor; setFloor(nextFloor); }
          if (dog.pursuit.update(dt, feet)) {
            runId++; catchLeft = CATCH_DURATION; setRespawnProgress(0); setCanCollect(false); setCaught(true); setHeat(0); clear(); soundscape.caught();
            if (document.pointerLockElement === renderer.domElement) document.exitPointerLock();
          }
          dog.animate(dt, catchLeft > 0, reducedMotion.matches);
          if (catchLeft === 0) {
            const dogDx = dog.pursuit.position.x - feet.x, dogDz = dog.pursuit.position.z - feet.z;
            const distance = dog.pursuit.position.distanceTo(feet);
            const pan = (Math.cos(yaw) * dogDx - Math.sin(yaw) * dogDz) / Math.max(1, distance);
            soundscape.update(dt, Math.hypot(feet.x - oldX, feet.z - oldZ), Math.hypot(dog.pursuit.position.x - oldDogX, dog.pursuit.position.z - oldDogZ), distance, Math.abs(feet.y - dog.pursuit.position.y), pan, sprinting);
          }
          if (now - lastPing > 650 && !pinging && catchLeft === 0) {
            lastPing = now; pinging = true;
            const requestRun = runId;
            const upstairs = Math.abs(feet.y - asset.manifest.floors[1]) < 0.2;
            // Keep the existing API coordinate system and its server-only target unchanged.
            const x = upstairs ? (feet.x - asset.manifest.sonarAnchor[0]) * 20 + 312 : 2000;
            const z = upstairs ? (feet.z - asset.manifest.sonarAnchor[1]) * 20 + 175 : 2000;
            const inBounds = upstairs && x >= 0 && x <= 820 && z >= 0 && z <= 820;
            void live.current.onPing(inBounds ? x : 820, inBounds ? z : 820).then(r => {
              if (dead || !r || requestRun !== runId || catchLeft > 0) return;
              const feedback = sonarFeedback(r.strength); setHeat(feedback.strength);
              if (feedback.strength > 0.02) sfx.beep(feedback.close, feedback.volume);
              if (r.found && upstairs && r.strength > 1 - 22 / 700) signalConfirmed = true;
            }).catch(() => {}).finally(() => { pinging = false; });
          }
        }
        if (catchLeft === 0 && now - lastHud > 100) {
          lastHud = now;
          const allowed = pickupAllowed();
          if (allowed !== pickupReady) { pickupReady = allowed; setCanCollect(allowed); }
          setRadar({ usb: radarContact(feet.x, feet.z, yaw, usb.position.x, usb.position.z), dog: radarContact(feet.x, feet.z, yaw, dog.pursuit.position.x, dog.pursuit.position.z), dogFloor: dog.pursuit.position.y > 4.3 ? 2 : 1 });
        }
        const remaining = Math.ceil(dog.pursuit.grace);
        if (remaining !== shownGrace) { shownGrace = remaining; setGrace(remaining); }
      }
      if (inspect.overview || document.hidden || state.current.found || !soundOn()) soundscape.stop();
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
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('pointerlockchange', lock); renderer.domElement.removeEventListener('click', click);
      collect.current = () => {}; soundscape.dispose(); if (audio.current === soundscape) audio.current = null;
      usb.traverse(o => { if (o instanceof THREE.Mesh) { o.geometry.dispose(); (o.material as THREE.Material).dispose(); } });
      dog?.dispose();
      laserLayer.clear(); laserMaterials.forEach(material => material.dispose());
      if (asset) release(asset);
      scene.children.forEach(o => { if (o instanceof THREE.LineSegments) (o.material as THREE.Material).dispose(); });
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [attempt]);

  const hold = (key: keyof typeof controls.current) => (e: React.PointerEvent<HTMLButtonElement>) => { e.currentTarget.setPointerCapture(e.pointerId); controls.current[key] = true; };
  return <div className="max-w-5xl">
    <div className="mb-3 flex flex-wrap gap-2">
      <button aria-pressed={audioOn} onClick={() => { const on = !audioOn; setSound(on); setAudioOn(on); if (on) audio.current?.start(); else audio.current?.stop(); }} className="rounded border border-green-900 px-4 py-2 text-sm text-green-300">{tr('Sound:')}{audioOn ? tr('on') : tr('off')}</button>
      <button disabled={!ready || caught || booting} aria-pressed={overview} onClick={() => setOverview(!overview)} className="rounded border border-green-600 px-4 py-2 text-sm text-green-300 disabled:opacity-40">{overview ? tr('Return to first person') : tr('Inspect top-down layout')}</button>
      {overview && [0, 1].map(f => <button key={f} aria-pressed={inspectFloor === f} onClick={() => setInspectFloor(f)} className={`rounded border px-4 py-2 text-sm ${inspectFloor === f ? 'border-green-300 text-green-200' : 'border-neutral-700 text-neutral-400'}`}>{tr('Floor')}{f + 1}</button>)}
    </div>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-green-300"><span>{tr('MARX LIBRARY // FLOOR')}{(overview ? inspectFloor : floor) + 1}</span><span>{found ? tr('USB COLLECTED') : `SIGNAL ${Math.round(heat * 100)}%`}</span></div>
    <div className="relative overflow-hidden rounded-xl border border-green-500/60 bg-black">
      <div ref={mount} className="h-[min(65vh,38rem)] min-h-80 w-full" />
      {!ready && !error && <p role="status" className="absolute inset-4 bg-black/80 p-4 font-mono text-green-300">{tr('Loading library…')}</p>}
      {ready && !started && !booting && !overview && <button onClick={() => { audio.current?.start(); setBootProgress(0); setBooting(true); }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded border border-green-400 bg-black/90 px-6 py-3 font-mono text-green-300">{tr('Begin investigation')}</button>}
      {error && <div role="alert" className="absolute inset-4 bg-black p-4 text-red-300"><p>{error}</p><button onClick={() => { setReady(false); setError(''); setAttempt(n => n + 1); }} className="mt-3 rounded border border-green-700 px-4 py-2 text-green-300">{tr('Retry')}</button></div>}
      {booting && <LibraryBoot progress={bootProgress} />}
      {caught && <LibraryRespawn progress={respawnProgress} />}
      {started && !found && !overview && !caught && <><span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 text-green-300/60">+</span><LibraryRadar {...radar} floor={floor} heat={heat} />
        {canCollect && <button onClick={() => collect.current()} className="absolute bottom-6 left-3 max-w-[45%] rounded border border-emerald-300 bg-black/95 px-3 py-3 font-mono text-sm text-emerald-200">{tr('E · Collect USB')}</button>}</>}
    </div>
    {started && !found && <p className="mt-3 font-mono text-xs text-green-300" role="status">{grace > 0 ? `${tr("Hunter re-forming upstairs:")} ${grace}s` : tr("The hunter is moving. Keep your distance.")}</p>}
    <p className="mt-3 text-sm text-neutral-400">{overview ? tr('TOP-DOWN INSPECTION · North is up · Exploration is paused.') : found ? tr('Simulation complete. Now visit this location in the real Marx Library.') : locked ? tr('WASD to walk · hold Shift to sprint · mouse to look · Esc releases mouse. Follow the curved central stairs to floor two.') : tr('WASD to walk · Shift to sprint · E to collect the USB on the bird-book lectern. Radar points ahead; floor arrows show upstairs/downstairs.')}</p>
    {started && !found && <div className="mt-3 flex flex-wrap gap-2">{([['forward', tr('Forward')], ['back', tr('Back')], ['left', tr('Strafe left')], ['right', tr('Strafe right')], ['turnLeft', tr('Turn left')], ['turnRight', tr('Turn right')], ['sprint', tr('Hold to sprint')]] as const).map(([key, label]) => <button key={key} disabled={caught} className="touch-none rounded border border-green-900 px-3 py-2 text-xs text-green-300 disabled:opacity-40" onPointerDown={hold(key)} onPointerUp={() => { controls.current[key] = false; }} onPointerCancel={() => { controls.current[key] = false; }}>{label}</button>)}
    </div>}
    {found && <div ref={completion} tabIndex={-1} role="status" className="mt-4 rounded-lg border border-green-500 bg-green-950/30 p-5 text-green-100"><h3 className="font-mono text-lg">{tr('SIMULATION COMPLETE')}</h3><p className="mt-3">{tr('You found the location in the simulation. Now go there in person: Marx Library, second floor, at the lectern with the open bird book.')}</p><p className="mt-2 text-sm text-green-300">{tr('The virtual USB is your location clue. Visit the real location to continue the investigation.')}</p><button onClick={onKey} className="mt-4 rounded-lg bg-green-400 px-5 py-3 font-semibold text-black">{tr('Continue to the real-world search')}</button></div>}
  </div>;
}
