import test from 'node:test';
import assert from 'node:assert/strict';
import {radarContact, withinUsbReach} from '../src/components/libraryObjective.ts';
import {CATCH_DURATION} from '../src/components/libraryPursuit.ts';
test('radar rotates targets with the player and clamps remote contacts to the rim',()=>{
 assert.equal(radarContact(0,0,0,0,-10).x,50);
 assert(radarContact(0,0,0,0,-10).y<50);
 assert(radarContact(0,0,Math.PI/2,-10,0).y<50);
 assert(radarContact(0,0,0,10,0).x>50);
 const far=radarContact(0,0,0,300,400);assert(Math.abs(Math.hypot(far.x-50,far.y-50)-43)<1e-8);assert.equal(far.distance,500);
});
test('USB reach requires the lectern floor and actual proximity; respawn lasts three seconds',()=>{
 assert(withinUsbReach(5,4.5,-2,5.345,4.5,-1.5));
 assert(!withinUsbReach(5,0,-2,5.345,4.5,-1.5));
 assert(!withinUsbReach(5,4.5,-5,5.345,4.5,-1.5));
 assert.equal(CATCH_DURATION,3);
});
