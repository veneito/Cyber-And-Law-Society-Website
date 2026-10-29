import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {LibraryAudio, hunterAcoustics} from '../src/components/libraryAudio.ts';import {LIBRARY_AUDIO} from '../src/components/libraryAudioAssets.ts';
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

test('roars stay audible at distance, soften through walls, and cap their gain',()=>{
 const close=hunterAcoustics(0,0,false),far=hunterAcoustics(100,0,false),wall=hunterAcoustics(5,0,true),open=hunterAcoustics(5,0,false),upstairs=hunterAcoustics(5,4.5,false);
 assert(close.volume<=.24);assert(far.volume>=.09);assert(close.volume>far.volume);
 assert(wall.volume<open.volume);assert(wall.volume>=.072);assert(wall.cutoff<open.cutoff);assert.equal(upstairs.cutoff,wall.cutoff);
 for(const distance of [0,1,5,12,50,100,1000])for(const blocked of [true,false]){const mix=hunterAcoustics(distance,0,blocked);assert(mix.volume>=.072 && mix.volume<=.24);}
});

test('active roars track the hunter with HRTF position and smooth wall filtering',()=>{
 const param=()=>({value:0,targets:[],setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;this.targets.push(v);}});
 const node=()=>({connect(next){return next;},disconnect(){}});
 const audio=new LibraryAudio(()=>true);
 const source={...node(),playbackRate:param(),start(){},stop(){}};
 const panner={...node(),positionX:param(),positionY:param(),positionZ:param()};
 const filter={...node(),Q:param(),frequency:param()};
 const gain={...node(),gain:param()};
 audio.ctx={currentTime:0,createBufferSource:()=>source,createGain:()=>gain,createStereoPanner:()=>({...node(),pan:param()}),createBiquadFilter:()=>filter,createPanner:()=>panner};
 audio.master=node();audio.buffers.set('growl1',{duration:2});
 audio.update(0,0,0,8,0,.5,false,{right:4,up:0,ahead:6,occluded:false});audio.play('growl1',.2);
 assert.equal(panner.panningModel,'HRTF');assert.equal(panner.positionX.value,4);assert.equal(panner.positionZ.value,-6);
 audio.update(.1,0,0,8,0,-.5,false,{right:-4,up:2,ahead:-6,occluded:true});
 assert.equal(panner.positionX.value,-4);assert.equal(panner.positionY.value,2);assert.equal(panner.positionZ.value,6);assert.equal(filter.frequency.value,900);assert(gain.gain.value<=.24);
 source.onended();assert.equal(audio.roars.size,0);assert.equal(audio.voices.size,0);
});
