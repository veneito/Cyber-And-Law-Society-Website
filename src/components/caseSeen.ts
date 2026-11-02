// Things the player has opened, for case-file fields whose unlock isn't tracked by a puzzle module.
export const seen = { drive: false, hollow: false, glimmr: false, helpers: false, stream: false };
export function markSeen(key: keyof typeof seen) {
  if (seen[key]) return;
  seen[key] = true;
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('case-progress'));
}
