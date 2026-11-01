export const PRAYER_WORDS = ['IT', 'HAS', 'NO', 'BODY', 'IT', 'WILL', 'USE', 'OURS'];
export const INITIATION_FRAGMENT = 'VESPER';
export function prayerAccepted(words: string[]) {
  return words.length === PRAYER_WORDS.length && words.every((word, index) => word === PRAYER_WORDS[index]);
}

export const wordsClaimed = (ids: number[], collected: number[]) => ids.every(id => collected.includes(id));

