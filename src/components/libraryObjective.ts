export function radarContact(px: number, pz: number, yaw: number, x: number, z: number) {
  const dx = x - px, dz = z - pz;
  const distance = Math.hypot(dx, dz), scale = 43 / Math.max(50, distance);
  return { x: 50 + (Math.cos(yaw) * dx - Math.sin(yaw) * dz) * scale,
    y: 50 + (Math.sin(yaw) * dx + Math.cos(yaw) * dz) * scale, distance };
}
export function withinUsbReach(px: number, py: number, pz: number, x: number, floor: number, z: number) {
  return Math.abs(py - floor) < 0.2 && Math.hypot(px - x, pz - z) <= 1.5;
}
