export const CASE_EVENT = {
  title: 'Bea F. Wellington Case File',
  opensAt: '2026-11-01T16:45:00-06:00',
  closesAt: '2026-11-13T16:45:00-06:00',
  discord: 'https://discord.gg/ZKsKn9WNvX',
};
export function eventStatus(now = Date.now()) {
  return now < Date.parse(CASE_EVENT.opensAt) ? 'upcoming' : now >= Date.parse(CASE_EVENT.closesAt) ? 'closed' : 'live';
}
export function attemptEndsAt(startedAt) {
  return Math.min(startedAt + 90 * 60_000, Date.parse(CASE_EVENT.closesAt));
}
