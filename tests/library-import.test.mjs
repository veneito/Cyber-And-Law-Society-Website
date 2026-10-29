import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Vector3 } from 'three';
import { collisionGeometry, LibraryWalking, LIBRARY_MANIFEST } from '../src/components/libraryAsset.ts';

const directory = new URL('../public/assets/library/', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL(LIBRARY_MANIFEST.split('/').at(-1), directory), 'utf8'));
const bytes = fs.readFileSync(new URL(manifest.collision, directory));
const walking = new LibraryWalking(collisionGeometry(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));

test('converted model is a complete binary glTF and excludes the Roblox baseplate', () => {
  const glb = fs.readFileSync(new URL(manifest.model, directory));
  assert.equal(glb.subarray(0, 4).toString(), 'glTF');
  assert.equal(glb.readUInt32LE(8), glb.length);
  assert(manifest.stats.objects > 10000);
  assert(manifest.bounds.max[0] - manifest.bounds.min[0] < 50);
  assert.deepEqual(manifest.floors, [0, 4.5]);
});

test('room 181 spawn is grounded, unobstructed, and can exit through its real doorway', () => {
  const player = new Vector3(...manifest.spawn.position);
  const floor = walking.floorAt(player.x, player.z, player.y);
  assert(floor !== null);
  assert(walking.canStand(player.x, floor, player.z));
  for (let i = 0; i < 300; i++) assert(walking.move(player, -0.025, 0), `Blocked leaving room 181 at ${player.toArray()}`);
  assert(player.x < 12.5);
  assert(Math.abs(player.y) < 0.01);
});

test('walls, furniture, and leaving supported floor block movement', () => {
  assert.equal(walking.canStand(103.5 * 0.25, 0, -125 * 0.25), false);
  assert.equal(walking.floorAt(1000, 1000, 0), null);
  assert.equal(walking.move(new Vector3(...manifest.spawn.position), 1000, 0), false);
  assert.throws(() => collisionGeometry(new ArrayBuffer(4)), /Invalid/);
});

test('walk from room 181 through the hall and up the exported curved stairs', () => {
  const player = new Vector3(...manifest.spawn.position);
  function go(x, z) {
    const steps = Math.ceil(Math.hypot(x - player.x, z - player.z) / 0.035);
    const dx = (x - player.x) / steps, dz = (z - player.z) / steps;
    for (let i = 0; i < steps; i++) assert(walking.move(player, dx, dz), `Blocked at ${player.toArray()} going to ${x}, ${z}`);
  }
  go(11.625, -31.5);
  go(11.625, -8);
  const cx = 15.15 * 0.25, cz = -16.6 * 0.25, radius = 15.95 * 0.25;
  const start = -19 * Math.PI / 180, finish = -161 * Math.PI / 180;
  go(8.7, -8);
  go(8.7, -4.5);
  go(8, -4.5);
  go(cx + radius * Math.cos(start), cz + radius * Math.sin(start));
  for (let i = 1; i <= 280; i++) {
    const a = start + (finish - start) * i / 280;
    go(cx + radius * Math.cos(a), cz + radius * Math.sin(a));
  }
  go(-0.25, -4.5);
  go(-0.25, -3.4);
  go(5.125, -3.4);
  go(5.125, -2.5);
  assert(Math.abs(player.y - 4.5) < 0.02);
  assert(Math.hypot(player.x - manifest.sonarAnchor[0], player.z - manifest.sonarAnchor[1]) < 1.1);
});
