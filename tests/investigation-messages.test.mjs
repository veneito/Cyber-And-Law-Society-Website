import assert from 'node:assert/strict';
import { messageClock } from './message-clock.mjs';
import { deliverRaphaelDm, hasRaphaelDm, raphaelMessages, raphaelTyping } from '../src/components/investigationMessages.ts';
const clock=messageClock();let opens=0;window.addEventListener('raphael-dm',()=>opens++);
deliverRaphaelDm();deliverRaphaelDm();clock.advance(2999);assert.equal(hasRaphaelDm(),false);
clock.advance(1);assert.equal(raphaelMessages().length,1);assert.equal(raphaelTyping(),true);assert.equal(opens,1);
clock.advance(2499);assert.equal(raphaelMessages().length,1);clock.advance(1);assert.equal(raphaelMessages().length,2);
clock.advance(5000);assert.equal(raphaelMessages().length,4);assert.equal(raphaelTyping(),false);assert.equal(opens,1);
clock.restore();console.log('Raphael 3-second arrival and 2.5-second bubble checks passed.');
