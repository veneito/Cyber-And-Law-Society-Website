export function radarContact(px: number, pz: number, yaw: number, x: number, z: number) {
  const dx = x - px, dz = z - pz;
  const distance = Math.hypot(dx, dz), scale = 43 / Math.max(50, distance);
  return { x: 50 + (Math.cos(yaw) * dx - Math.sin(yaw) * dz) * scale,
    y: 50 + (Math.sin(yaw) * dx + Math.cos(yaw) * dz) * scale, distance };
}
export function withinUsbReach(px: number, py: number, pz: number, x: number, floor: number, z: number) {
  return Math.abs(py - floor) < 0.2 && Math.hypot(px - x, pz - z) <= 1.5;
}

export function sonarFeedback(rawStrength: number) {
  // Extend audible range from roughly 10.5 m to 24.5 m in the existing API scale.
  const strength = Math.max(0, Math.min(1, (rawStrength - 0.3) / 0.7));
  const close = strength >= 0.72;
  const volume = close ? 0.045 + 0.06 * (strength - 0.72) / 0.28 : 0.012 + 0.033 * strength / 0.72;
  return { strength, close, volume };
}
