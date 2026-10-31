import assert from 'node:assert/strict';
import { prayerAccepted, PRAYER_WORDS, INITIATION_FRAGMENT } from '../src/components/hollowDawnPuzzle.ts';
assert.equal(prayerAccepted(PRAYER_WORDS), true);
assert.equal(prayerAccepted([]), false);
assert.equal(prayerAccepted(PRAYER_WORDS.slice(0, 7)), false);
assert.equal(prayerAccepted([...PRAYER_WORDS].reverse()), false);
assert.equal(prayerAccepted([...PRAYER_WORDS, 'OURS']), false);
assert.equal(INITIATION_FRAGMENT, 'VESPER');
console.log('Hollow Dawn prayer checks passed.');
