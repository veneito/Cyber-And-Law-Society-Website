import assert from 'node:assert/strict';
import fs from 'node:fs';
import { messageClock } from './message-clock.mjs';
import { inviteJunior,juniorInvited,juniorMessages,juniorTyping,sendJuniorMessage } from '../src/components/juniorMessages.ts';
const clock=messageClock();let invites=0;window.addEventListener('junior-dm',()=>invites++);
inviteJunior();inviteJunior();clock.advance(2999);assert.equal(juniorInvited(),false);clock.advance(1);assert.equal(invites,1);assert.equal(juniorMessages().length,1);assert.equal(juniorTyping(),true);
clock.advance(2500);assert.equal(juniorMessages().length,2);clock.advance(2500);assert.equal(juniorMessages().length,3);assert.equal(juniorTyping(),false);
sendJuniorMessage('help');clock.advance(2500);assert.equal(juniorMessages().at(-1).attachment,true);
const guide=fs.readFileSync(new URL('../public/assets/junior-tracing-notes-v1.txt',import.meta.url),'utf8');for(const answer of ['CINDER','EMBER','cinder-relay9x4','HD-884|'])assert.ok(!guide.includes(answer));
clock.restore();console.log('Junior delayed intro and help timing checks passed.');

const { juniorGuidance } = await import('../src/components/juniorGuidance.ts');
assert.match(juniorGuidance('help time'), /five hours/);
assert.match(juniorGuidance('help change'), /37,000/);
assert.match(juniorGuidance('help trace'), /BELOW the map/);
