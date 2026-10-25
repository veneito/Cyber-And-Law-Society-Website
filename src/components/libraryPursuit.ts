import { Vector3 } from 'three';
import type { LibraryWalking } from './libraryAsset';

export const DOG_SPEED = 3.2;
export const RESPAWN_GRACE = 9;
export const CATCH_DURATION = 3;
export type NavigationData = { positions: number[]; offsets: number[]; neighbors: number[] };

export class LibraryNavigation {
  readonly positions: Float32Array;
  readonly offsets: Uint32Array;
  readonly neighbors: Uint32Array;
  private readonly queue: Int32Array;
  private readonly previous: Int32Array;
  constructor(data: NavigationData) {
    const count = data.positions.length / 3;
    if (!Number.isInteger(count) || count < 1 || count > 50000 || data.offsets.length !== count + 1 || data.offsets[0] !== 0 || data.offsets[count] !== data.neighbors.length || !data.positions.every(Number.isFinite)
      || !data.offsets.every((n, i) => Number.isInteger(n) && n >= (data.offsets[i - 1] ?? 0))
      || !data.neighbors.every(n => Number.isInteger(n) && n >= 0 && n < count)) throw new Error('Invalid library navigation');
    this.positions = new Float32Array(data.positions); this.offsets = new Uint32Array(data.offsets); this.neighbors = new Uint32Array(data.neighbors);
    this.queue = new Int32Array(count); this.previous = new Int32Array(count);
  }
  point(id: number, target = new Vector3()) { return target.fromArray(this.positions, id * 3); }
  nearest(point: Vector3) {
    let best = -1, distance = Infinity;
    for (let i = 0; i < this.positions.length; i += 3) {
      const dy = this.positions[i + 1] - point.y;
      if (Math.abs(dy) > 0.55) continue;
      const d = (this.positions[i] - point.x) ** 2 + (this.positions[i + 2] - point.z) ** 2 + dy * dy;
      if (d < distance) { distance = d; best = i / 3; }
    }
    return best;
  }
  path(start: Vector3, target: Vector3) {
    const from = this.nearest(start), to = this.nearest(target);
    if (from < 0 || to < 0) return [];
    this.previous.fill(-1); this.previous[from] = from; this.queue[0] = from;
    let head = 0, tail = 1;
    while (head < tail && this.previous[to] === -1) {
      const current = this.queue[head++];
      for (let i = this.offsets[current]; i < this.offsets[current + 1]; i++) {
        const next = this.neighbors[i];
        if (this.previous[next] !== -1) continue;
        this.previous[next] = current; this.queue[tail++] = next;
      }
    }
    if (this.previous[to] === -1) return [];
    const path = [to];
    while (path[path.length - 1] !== from) path.push(this.previous[path[path.length - 1]]);
    return path.reverse();
  }
}

export class LibraryPursuit {
  readonly position = new Vector3();
  readonly spawn = new Vector3();
  readonly direction = new Vector3(0, 0, 1);
  grace = RESPAWN_GRACE;
  caught = false;
  moving = false;
  private route: number[] = [];
  private index = 0;
  private replan = 0;
  private readonly waypoint = new Vector3();
  private readonly probe = new Vector3();
  readonly world: LibraryWalking;
  readonly navigation: LibraryNavigation;
  constructor(world: LibraryWalking, navigation: LibraryNavigation, playerStart: Vector3) {
    this.world = world; this.navigation = navigation;
    const id = navigation.nearest(new Vector3(-14, 4.5, -27));
    if (id < 0) throw new Error('Missing safe second-floor hunter spawn');
    navigation.point(id, this.spawn);
    if (navigation.path(this.spawn, playerStart).length < 2) throw new Error('Hunter spawn is disconnected from room 181');
    this.reset();
  }
  reset() {
    this.position.copy(this.spawn); this.grace = RESPAWN_GRACE; this.caught = false; this.moving = false;
    this.route = []; this.index = 0; this.replan = 0;
  }
  canCatch(player: Vector3) {
    if (this.grace > 0 || Math.abs(player.y - this.position.y) > 0.6 || Math.hypot(player.x - this.position.x, player.z - this.position.z) > 0.8) return false;
    // A thin wall or a floor between the two characters must prevent a catch.
    this.probe.copy(this.position);
    const steps = Math.max(1, Math.ceil(this.probe.distanceTo(player) / 0.08));
    const dx = (player.x - this.probe.x) / steps, dz = (player.z - this.probe.z) / steps;
    for (let i = 0; i < steps; i++) if (!this.world.move(this.probe, dx, dz)) return false;
    return Math.abs(this.probe.y - player.y) < 0.3;
  }
  update(dt: number, player: Vector3) {
    this.moving = false;
    if (this.caught) return false;
    if (this.grace > 0) { this.grace = Math.max(0, this.grace - dt); return false; }
    this.replan -= dt;
    if (this.replan <= 0) { this.route = this.navigation.path(this.position, player); this.index = 0; this.replan = 1.5; }
    for (let skip = 0; skip < 3 && this.index < this.route.length; skip++) {
      this.navigation.point(this.route[this.index], this.waypoint);
      const dx = this.waypoint.x - this.position.x, dz = this.waypoint.z - this.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance < 0.05) { this.index++; continue; }
      const step = Math.min(distance, DOG_SPEED * dt);
      if (this.world.move(this.position, dx / distance * step, dz / distance * step)) {
        this.direction.set(dx / distance, 0, dz / distance); this.moving = true;
      } else this.replan = 0;
      break;
    }
    if (this.canCatch(player)) { this.caught = true; return true; }
    return false;
  }
}
