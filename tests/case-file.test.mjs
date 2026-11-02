import assert from 'node:assert/strict';
import { FIELDS, CHARGES, setAnswer, confirmedFields, nextLead, devFillCaseFile, exhibitProves } from '../src/components/caseFile.ts';
import { markSeen } from '../src/components/caseSeen.ts';
import { archiveProgress } from '../src/components/archivePuzzle.ts';
globalThis.window = new EventTarget();

// Only the opening lines are open at first, and the notes point at the first missing one.
assert.equal(nextLead().id, 'a-victim');
setAnswer('a-victim', 'Julieta Dubois'); setAnswer('a-suspect', 'raphael');
assert.deepEqual(confirmedFields().map(f => f.id), ['a-victim', 'a-suspect']);
assert.equal(nextLead().id, 'a-place');

// A correct answer does not count until the evidence is unlocked, and wrong answers never count.
setAnswer('b-deity', 'Solace');
assert.ok(!confirmedFields().some(f => f.id === 'b-deity'));
markSeen('drive');
assert.ok(confirmedFields().some(f => f.id === 'b-deity'));
setAnswer('c-1', 'virgil'); markSeen('hollow');
assert.ok(!confirmedFields().some(f => f.id === 'c-1'));
setAnswer('c-1', ' vesper ');
assert.ok(confirmedFields().some(f => f.id === 'c-1'));
archiveProgress.carved = true;
setAnswer('e-issued', '2026-10-29T03:14:00Z');
assert.ok(confirmedFields().some(f => f.id === 'e-issued'));

// Every example answer matches its own pattern, and every charge is answerable from a real field.
devFillCaseFile();
archiveProgress.visited = archiveProgress.traced = archiveProgress.imported = archiveProgress.verified = archiveProgress.decrypted = true;
assert.ok(FIELDS.every(f => f.match.test(f.example.toLowerCase().replace(/[^a-z0-9]/g, ''))));
for (const charge of CHARGES) assert.ok(charge.proof.every(id => FIELDS.some(f => f.id === id)));
// A fact that is true but irrelevant must not win a charge.
assert.equal(exhibitProves(CHARGES[0], 'g-accounts'), true);
assert.equal(exhibitProves(CHARGES[0], 'a-suspect'), false);
assert.equal(exhibitProves(CHARGES[2], 'g-gps'), false);
console.log('Case file unlocks, answer checks and trial exhibits passed.');
