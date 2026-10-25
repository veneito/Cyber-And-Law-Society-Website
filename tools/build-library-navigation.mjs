import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { Vector3 } from 'three';
import { LIBRARY_MANIFEST, LibraryWalking, collisionGeometry } from '../src/components/libraryAsset.ts';

const dir = new URL('../public/assets/library/', import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL(LIBRARY_MANIFEST.split('/').at(-1), dir), 'utf8'));
const buffer = await fs.readFile(new URL(manifest.collision, dir));
const world = new LibraryWalking(collisionGeometry(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)));
const positions = [], adjacency = [];
const grid = new Map();
const spacing = 0.4;
function add(p) { const id = positions.length; positions.push(p.clone()); adjacency.push(new Set()); return id; }
function traversable(a, b) {
  const p = a.clone();
  const steps = Math.max(1, Math.ceil(a.distanceTo(b) / 0.08));
  const dx = (b.x - a.x) / steps, dz = (b.z - a.z) / steps;
  for (let i = 0; i < steps; i++) if (!world.move(p, dx, dz)) return false;
  return Math.abs(p.y - b.y) < 0.2;
}
function link(a, b) {
  if (traversable(positions[a], positions[b]) && traversable(positions[b], positions[a])) { adjacency[a].add(b); adjacency[b].add(a); return true; }
  return false;
}
for (let floor = 0; floor < 2; floor++) {
  for (let x = Math.floor(manifest.bounds.min[0] / spacing); x <= Math.ceil(manifest.bounds.max[0] / spacing); x++) {
    for (let z = Math.floor(manifest.bounds.min[2] / spacing); z <= Math.ceil(manifest.bounds.max[2] / spacing); z++) {
      const y = world.floorAt(x * spacing, z * spacing, manifest.floors[floor]);
      if (y !== null && Math.abs(y - manifest.floors[floor]) < 0.22 && world.canStand(x * spacing, y, z * spacing)) grid.set(`${floor}:${x}:${z}`, add(new Vector3(x * spacing, y, z * spacing)));
    }
  }
}
console.log('Floor nodes:', positions.length);
for (const [key, id] of grid) {
  const [f, x, z] = key.split(':').map(Number);
  for (const [dx, dz] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    const other = grid.get(`${f}:${x + dx}:${z + dz}`);
    if (other !== undefined) link(id, other);
  }
}
const floorCount = positions.length;
function stairs(name, points) {
  const first = positions.length;
  let previous;
  for (const target of points) {
    if (!previous) {
      const y = world.floorAt(target.x, target.z, target.y);
      assert(y !== null && world.canStand(target.x, y, target.z), `${name} invalid start`);
      previous = new Vector3(target.x, y, target.z); add(previous); continue;
    }
    const a = previous.clone();
    const steps = Math.max(1, Math.ceil(a.distanceTo(target) / 0.08));
    for (let i = 1; i <= steps; i++) {
      const next = a.clone().lerp(target, i / steps);
      assert(world.move(previous, next.x - previous.x, next.z - previous.z), `${name} blocked: ${previous.toArray()} -> ${target.toArray()}`);
      const id = add(previous);
      adjacency[id].add(id - 1); adjacency[id - 1].add(id);
    }
  }
  const end = positions.length;
  let attached = 0;
  for (let id = first; id < end; id++) {
    if (Math.min(Math.abs(positions[id].y), Math.abs(positions[id].y - 4.5)) > 0.22) continue;
    for (let f = 0; f < 2; f++) {
      const cx = Math.round(positions[id].x / spacing), cz = Math.round(positions[id].z / spacing);
      for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) {
        const other = grid.get(`${f}:${cx + dx}:${cz + dz}`);
        if (other !== undefined && positions[id].distanceTo(positions[other]) < 0.75 && link(id, other)) attached++;
      }
    }
  }
  assert(attached > 0, `${name} disconnected`);
  console.log(name, end - first, 'nodes;', attached, 'floor links');
}
const curved = [];
for (let i = 0; i <= 280; i++) {
  const a = (-19 - 142 * i / 280) * Math.PI / 180;
  curved.push(new Vector3((15.15 + 15.95 * Math.cos(a)) / 4, 4.5 * i / 280, (-16.6 + 15.95 * Math.sin(a)) / 4));
}
curved.unshift(new Vector3(8, 0, -4.5));
curved.push(new Vector3(-0.25, 4.5, -4.5), new Vector3(-0.25, 4.5, -3.4));
stairs('curved', curved);
for (const s of [
  { name: 'north', x: 56, z: -70.4, dx: 1, dz: 0, sx: 0, sz: -1, lane: 6.8, run: 20, landing: 5, exit: [49, -77.2] },
  { name: 'office', x: -10.5, z: -87.2, dx: 1, dz: 0, sx: 0, sz: 1, lane: 4.8, run: 11, landing: 3.5, exit: [-20, -82.4] },
  { name: 'west', x: -56.4, z: 38.5, dx: 0, dz: -1, sx: -1, sz: 0, lane: 4.6, run: 7.5, landing: 3, exit: [-51, 40] },
  { name: 'east', x: 89.2, z: 40, dx: 0, dz: -1, sx: 1, sz: 0, lane: 4.6, run: 8, landing: 3, exit: [84, 41.5] },
]) {
  const point = (along, lateral, y) => new Vector3((s.x + s.dx * along + s.sx * lateral) / 4, y, (s.z + s.dz * along + s.sz * lateral) / 4);
  stairs(s.name, [point(-1, 0, 0), point(0, 0, 0), point(s.run, 0, 2.25), point(s.run + s.landing / 2, 0, 2.25), point(s.run + s.landing / 2, s.lane, 2.25), point(s.run, s.lane, 2.25), point(0, s.lane, 4.5), point(-1, s.lane, 4.5), new Vector3(s.exit[0] / 4, 4.5, s.exit[1] / 4)]);
}
const offsets = [0], neighbors = [];
for (const edges of adjacency) { neighbors.push(...edges); offsets.push(neighbors.length); }
const data = { positions: positions.flatMap(p => p.toArray().map(v => Math.round(v * 10000) / 10000)), offsets, neighbors, floorCount };
const json = JSON.stringify(data);
const hash = crypto.createHash('sha256').update(json).digest('hex').slice(0, 10);
await fs.writeFile(new URL(`library-navigation-${hash}.json`, dir), json);
console.log(JSON.stringify({ filename: `library-navigation-${hash}.json`, nodes: positions.length, edges: neighbors.length, bytes: Buffer.byteLength(json) }));
