import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';

export const LIBRARY_MANIFEST = '/assets/library/marx-library-e65fedd1e9.json';
export const EYE_HEIGHT = 1.65;
export type LibraryManifest = {
  model: string; collision: string; edges: string;
  bounds: { min: number[]; max: number[] };
  spawn: { position: number[]; yaw: number; room: string };
  floors: number[]; sonarAnchor: number[];
};

export function collisionGeometry(buffer: ArrayBuffer) {
  if (buffer.byteLength < 8 || buffer.byteLength % 4 !== 0) throw new Error('Invalid library collision data');
  const [positionCount, indexCount] = new Uint32Array(buffer, 0, 2);
  if (positionCount % 3 || indexCount % 3 || 8 + 4 * (positionCount + indexCount) !== buffer.byteLength) throw new Error('Invalid library collision lengths');
  const positions = new Float32Array(buffer, 8, positionCount);
  const indices = new Uint32Array(buffer, 8 + positionCount * 4, indexCount);
  if (!positions.every(Number.isFinite) || !indices.every(i => i < positionCount / 3)) throw new Error('Invalid library collision vertices');
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  return geometry;
}

export class LibraryWalking {
  private readonly intersection = new Octree();
  private readonly cells = new Map<string, { triangle: THREE.Triangle; minY: number; maxY: number; walkable: boolean }[]>();
  readonly body = new Capsule(new THREE.Vector3(), new THREE.Vector3(), 0.26);
  private readonly ray = new THREE.Ray(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
  private readonly point = new THREE.Vector3();
  readonly geometry: THREE.BufferGeometry;
  constructor(geometry: THREE.BufferGeometry) {
    this.geometry = geometry;
    const positions = geometry.getAttribute('position');
    const indices = geometry.index!;
    const normal = new THREE.Vector3();
    for (let i = 0; i < indices.count; i += 3) {
      const a = indices.getX(i), b = indices.getX(i + 1), c = indices.getX(i + 2);
      const triangle = new THREE.Triangle();
      triangle.a.fromBufferAttribute(positions, a); triangle.b.fromBufferAttribute(positions, b); triangle.c.fromBufferAttribute(positions, c);
      const points = [triangle.a, triangle.b, triangle.c];
      const entry = { triangle, minY: Math.min(...points.map(p => p.y)), maxY: Math.max(...points.map(p => p.y)), walkable: triangle.getNormal(normal).y > 0.55 };
      for (let x = Math.floor(Math.min(...points.map(p => p.x)) / 2); x <= Math.floor(Math.max(...points.map(p => p.x)) / 2); x++) {
        for (let z = Math.floor(Math.min(...points.map(p => p.z)) / 2); z <= Math.floor(Math.max(...points.map(p => p.z)) / 2); z++) {
          const key = `${x},${z}`;
          if (!this.cells.has(key)) this.cells.set(key, []);
          this.cells.get(key)!.push(entry);
        }
      }
    }
  }
  floorAt(x: number, z: number, previousY: number) {
    this.ray.origin.set(x, previousY + 0.24, z);
    let highest: number | null = null;
    for (const entry of this.cells.get(`${Math.floor(x / 2)},${Math.floor(z / 2)}`) ?? []) {
      if (!entry.walkable || entry.minY > previousY + 0.24 || entry.maxY < previousY - 0.41) continue;
      const t = entry.triangle;
      if (this.ray.intersectTriangle(t.a, t.b, t.c, false, this.point) && this.point.y >= previousY - 0.41) highest = Math.max(highest ?? -Infinity, this.point.y);
    }
    return highest;
  }
  canStand(x: number, y: number, z: number) {
    // Ignore only the bottom step-height band; the full torso still collides with walls and furniture.
    this.body.start.set(x, y + 0.24 + this.body.radius, z);
    this.body.end.set(x, y + EYE_HEIGHT - this.body.radius, z);
    const seen = new Set<THREE.Triangle>();
    for (let cx = Math.floor((x - this.body.radius) / 2); cx <= Math.floor((x + this.body.radius) / 2); cx++) {
      for (let cz = Math.floor((z - this.body.radius) / 2); cz <= Math.floor((z + this.body.radius) / 2); cz++) {
        for (const entry of this.cells.get(`${cx},${cz}`) ?? []) {
          if (entry.minY > y + EYE_HEIGHT || entry.maxY < y + 0.24 || seen.has(entry.triangle)) continue;
          seen.add(entry.triangle);
          const result = this.intersection.triangleCapsuleIntersect(this.body, entry.triangle);
          if (result && result.depth > 0.002) return false;
        }
      }
    }
    return true;
  }
  move(position: THREE.Vector3, dx: number, dz: number) {
    const y = this.floorAt(position.x + dx, position.z + dz, position.y);
    if (y === null || Math.abs(y - position.y) > 0.25 || !this.canStand(position.x + dx, y, position.z + dz)) return false;
    position.set(position.x + dx, y, position.z + dz);
    return true;
  }
  dispose() { this.cells.clear(); this.geometry.dispose(); }
}

export async function loadLibrary(signal: AbortSignal) {
  const response = await fetch(LIBRARY_MANIFEST, { signal });
  if (!response.ok) throw new Error('Could not load the library map');
  const manifest = await response.json() as LibraryManifest;
  if (!manifest.spawn?.position || manifest.floors?.length !== 2 || manifest.sonarAnchor?.length !== 2) throw new Error('Invalid library manifest');
  const base = LIBRARY_MANIFEST.slice(0, LIBRARY_MANIFEST.lastIndexOf('/') + 1);
  const binary = async (name: string) => {
    if (!/^marx-library-[a-f0-9]+\.(?:glb|collision\.bin|edges\.bin)$/.test(name)) throw new Error('Invalid library asset path');
    const res = await fetch(base + name, { signal });
    if (!res.ok) throw new Error('Could not load the library geometry');
    return res.arrayBuffer();
  };
  const [modelData, collisionData, edgeData] = await Promise.all([binary(manifest.model), binary(manifest.collision), binary(manifest.edges)]);
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  const gltf = await new GLTFLoader().parseAsync(modelData, base);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edgeData), 3));
  return { manifest, model: gltf.scene, lineGeometry, walking: new LibraryWalking(collisionGeometry(collisionData)) };
}
