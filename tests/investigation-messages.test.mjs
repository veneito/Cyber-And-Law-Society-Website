import assert from 'node:assert/strict';
import { hasRaphaelDm, deliverRaphaelDm, RAPHAEL_DM } from '../src/components/investigationMessages.ts';
globalThis.window = new EventTarget();
window.setTimeout = setTimeout;
let launches = 0, deliveries = 0;
window.addEventListener('launch-app', e => { assert.equal(e.detail, 'browser'); launches++; });
window.addEventListener('raphael-dm', () => deliveries++);
assert.equal(hasRaphaelDm(), false);
deliverRaphaelDm();
deliverRaphaelDm();
assert.equal(hasRaphaelDm(), false);
assert.equal(launches, 0);
await new Promise(resolve => setTimeout(resolve, 550));
assert.equal(hasRaphaelDm(), true);
assert.equal(launches, 1);
assert.equal(deliveries, 1);
assert.ok(RAPHAEL_DM.includes('Solace'));
console.log('Raphael first-unlock DM checks passed.');

