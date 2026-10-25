import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { LibraryWalking } from './libraryAsset';
import { LibraryNavigation, LibraryPursuit, type NavigationData } from './libraryPursuit';

export const DOG_MODEL = '/assets/chaser/anxious-dog-87ccc4a809.glb';
export const DOG_NAVIGATION = '/assets/library/library-navigation-9fdf07fef9.json';

export async function loadLibraryDog(signal: AbortSignal, world: LibraryWalking, playerStart: THREE.Vector3) {
  const fetchAsset = async (url: string) => {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error('Could not load library hunter');
    return response;
  };
  const [bytes, navigationData] = await Promise.all([
    fetchAsset(DOG_MODEL).then(r => r.arrayBuffer()),
    fetchAsset(DOG_NAVIGATION).then(r => r.json() as Promise<NavigationData>),
  ]);
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  const gltf = await new GLTFLoader().parseAsync(bytes, '');
  const material = new THREE.MeshBasicMaterial({ color: 0x72ffaa, wireframe: true, transparent: true, opacity: 0.9 });
  gltf.scene.traverse(o => {
    if (o instanceof THREE.Mesh) {
      for (const previous of Array.isArray(o.material) ? o.material : [o.material]) previous.dispose();
      o.material = material; o.frustumCulled = false;
    }
  });
  const mixer = new THREE.AnimationMixer(gltf.scene);
  const actions = Object.fromEntries(gltf.animations.map(clip => [clip.name, mixer.clipAction(clip)]));
  if (!actions.Idle || !actions.Walk || !actions.Catch) throw new Error('Missing dog animations');
  actions.Idle.play(); mixer.update(0);
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse(o => { if (o instanceof THREE.SkinnedMesh) o.computeBoundingBox(); });
  const bounds = new THREE.Box3().setFromObject(gltf.scene);
  const size = bounds.getSize(new THREE.Vector3());
  const scale = 2.1 / size.y;
  const body = new THREE.Group();
  body.scale.setScalar(scale);
  gltf.scene.position.set(-(bounds.min.x + bounds.max.x) / 2, -bounds.min.y, -(bounds.min.z + bounds.max.z) / 2);
  body.add(gltf.scene);
  const root = new THREE.Group(); root.name = 'AnxiousDog'; root.add(body);
  const pursuit = new LibraryPursuit(world, new LibraryNavigation(navigationData), playerStart);
  root.position.copy(pursuit.position);
  let active = 'Idle', stride = 0;
  const animate = (dt: number, caught: boolean, reducedMotion: boolean) => {
    const next = caught ? 'Catch' : pursuit.moving ? 'Walk' : 'Idle';
    if (next !== active) {
      const action = actions[next];
      action.reset(); action.setLoop(next === 'Catch' ? THREE.LoopOnce : THREE.LoopRepeat, next === 'Catch' ? 1 : Infinity);
      action.clampWhenFinished = next === 'Catch'; action.fadeIn(0.2).play(); actions[active].fadeOut(0.2); active = next;
    }
    if (!reducedMotion) mixer.update(dt * (next === 'Walk' ? 1.8 : 1));
    root.position.copy(pursuit.position);
    if (pursuit.moving) {
      const target = Math.atan2(pursuit.direction.x, pursuit.direction.z);
      root.rotation.y += Math.atan2(Math.sin(target - root.rotation.y), Math.cos(target - root.rotation.y)) * Math.min(1, dt * 6);
      stride += dt;
    }
    material.opacity = pursuit.grace > 0 ? 0.35 + Math.min(1, (9 - pursuit.grace) / 3) * 0.55 : 0.9;
    body.position.y = reducedMotion ? 0 : Math.sin(stride * 4) * 0.015;
  };
  const reset = () => {
    pursuit.reset(); mixer.stopAllAction(); actions.Idle.reset().play(); mixer.update(0); active = 'Idle';
    root.position.copy(pursuit.position); body.position.y = 0;
  };
  const dispose = () => {
    mixer.stopAllAction(); mixer.uncacheRoot(gltf.scene);
    gltf.scene.traverse(o => { if (o instanceof THREE.Mesh) o.geometry.dispose(); if (o instanceof THREE.SkinnedMesh) o.skeleton.dispose(); });
    material.dispose(); root.removeFromParent();
  };
  return { root, pursuit, animate, reset, dispose };
}
