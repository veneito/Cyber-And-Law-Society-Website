import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Vector3 } from 'three';
import { LibraryWalking, collisionGeometry, LIBRARY_MANIFEST } from '../src/components/libraryAsset.ts';
import { LibraryNavigation, LibraryPursuit, DOG_SPEED, RESPAWN_GRACE } from '../src/components/libraryPursuit.ts';

const manifest = JSON.parse(fs.readFileSync(new URL('../public' + LIBRARY_MANIFEST, import.meta.url), 'utf8'));
const binary = fs.readFileSync(new URL('../public/assets/library/' + manifest.collision, import.meta.url));
const world = new LibraryWalking(collisionGeometry(binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength)));
const navigation = new LibraryNavigation(JSON.parse(fs.readFileSync(new URL('../public/assets/library/library-navigation-9fdf07fef9.json', import.meta.url), 'utf8')));
const player = new Vector3(...manifest.spawn.position);

test('dog export has one small skinned mesh and real idle, walk, catch clips', () => {
  const glb = fs.readFileSync(new URL('../public/assets/chaser/anxious-dog-87ccc4a809.glb', import.meta.url));
  assert(glb.length < 400000);
  const json = JSON.parse(glb.toString('utf8', 20, 20 + glb.readUInt32LE(12)));
  assert.equal(json.meshes.length, 1);
  assert.equal(json.skins.length, 1);
  assert.deepEqual(json.animations.map(a => a.name).sort(), ['Catch', 'Idle', 'Walk']);
  assert(!json.images?.length);
  assert(json.accessors[json.meshes[0].primitives[0].attributes.POSITION].count < 2000);
});

test('dog starts upstairs and can reach room 181 over the connected stair graph', () => {
  const hunter = new LibraryPursuit(world, navigation, player);
  assert.equal(hunter.position.y, 4.5);
  const route = navigation.path(hunter.position, player);
  assert(route.length > 10);
  assert(route.some(id => { const y = navigation.point(id).y; return y > 0.4 && y < 4.1; }));
  assert(DOG_SPEED > 2.8 && DOG_SPEED < 5, "Hunter outruns walking but sprinting can escape");
});

test('faster pursuit actually reaches a stationary player without crossing unsupported geometry', () => {
  const hunter = new LibraryPursuit(world, navigation, player);
  let caught = false;
  for (let seconds = 0; seconds < 160; seconds += 0.05) {
    const previous = hunter.position.clone();
    caught = hunter.update(0.05, player);
    assert(Math.hypot(hunter.position.x - previous.x, hunter.position.z - previous.z) <= DOG_SPEED * 0.05 + 0.001);
    assert(world.canStand(hunter.position.x, hunter.position.y, hunter.position.z));
    if (caught) break;
  }
  assert(caught, 'Hunter should eventually reach a stationary player');
});

test('a catch cannot happen through a wall or between floors', () => {
  const hunter = new LibraryPursuit(world, navigation, player); hunter.grace = 0;
  hunter.position.set(19, 4.5, -31.5);
  assert.equal(hunter.canCatch(player), false);
  hunter.position.set(12.2, 0.00125, -30);
  assert.equal(hunter.canCatch(new Vector3(12.95, 0.00125, -30)), false);
});

test('every reset returns the dog upstairs with a full grace period, preventing spawn camping', () => {
  const hunter = new LibraryPursuit(world, navigation, player);
  for (let run = 0; run < 3; run++) {
    hunter.position.copy(player).add(new Vector3(0.5, 0, 0)); hunter.grace = 0;
    assert(hunter.update(0.01, player));
    hunter.reset();
    assert.equal(hunter.position.y, 4.5);
    assert(hunter.position.distanceTo(player) > 20);
    assert.equal(hunter.grace, RESPAWN_GRACE);
    const spawn = hunter.position.clone();
    assert.equal(hunter.update(RESPAWN_GRACE - 0.01, player), false);
    assert(hunter.position.equals(spawn));
    assert.equal(hunter.canCatch(player), false);
  }
});
