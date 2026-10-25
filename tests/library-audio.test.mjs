import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {LibraryAudio} from '../src/components/libraryAudio.ts';import {LIBRARY_AUDIO} from '../src/components/libraryAudioAssets.ts';
const recorder=()=>{const events=[];const audio=new LibraryAudio(()=>true);audio.play=(...args)=>events.push(args);return {audio,events};};
test('growls happen at any range while near whispers require proximity and matching floor',()=>{
 const {audio,events}=recorder();audio.update(8,0,0,100,4.5,0,false);assert(events.some(e=>e[0].startsWith('growl')));assert(!events.some(e=>e[0]==='near'));
 audio.update(1,0,0,5,4.5,0,false);assert(!events.some(e=>e[0]==='near'));
 audio.update(.1,0,0,5,0,.8,false);assert.equal(events.filter(e=>e[0]==='near').length,1);
 audio.update(1,0,0,5,0,.8,false);assert.equal(events.filter(e=>e[0]==='near').length,1);
});
test('steps follow actual distance and do not sound while blocked or idle',()=>{
 const {audio,events}=recorder();for(let i=0;i<20;i++)audio.update(.04,0,0,5,0,0,false);assert.equal(events.length,0);
 audio.update(.04,.8,.9,5,0,-1,false);assert.equal(events.length,0);
 audio.update(.04,.4,.4,5,0,-1,false);assert.equal(events.filter(e=>e[0]==='humanStep').length,1);assert.equal(events.filter(e=>e[0]==='dogStep').length,1);
 assert(events.find(e=>e[0]==='dogStep')[1]>events.find(e=>e[0]==='humanStep')[1]);
 audio.reset();events.length=0;audio.update(.04,.8,0,5,0,0,true);assert.equal(events.length,0);audio.update(.04,.8,0,5,0,0,true);assert.equal(events[0][0],'humanStep');assert.equal(events[0][3],1);
});
test('catch uses five staggered, stereo, differently pitched whispers',()=>{
 const {audio,events}=recorder();audio.caught();assert.equal(events.length,5);assert(events.every(e=>e[0]==='caught'));assert(new Set(events.map(e=>e[3])).size>3);assert(events.some(e=>e[2]<0)&&events.some(e=>e[2]>0));assert(events.every(e=>e[4]<1&&e[1]<=.25));
});
test('all eight audio assets exist, are distinct, and total under 250 KB',()=>{
 const files=Object.values(LIBRARY_AUDIO);assert.equal(new Set(files).size,8);const bytes=files.reduce((sum,url)=>sum+fs.statSync(new URL('../public'+url,import.meta.url)).size,0);assert(bytes<250000);
});
