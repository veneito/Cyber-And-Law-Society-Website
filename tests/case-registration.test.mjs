process.env.NODE_ENV="test";process.env.CASE_EVENT_DISABLED="1";
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
const dir=fs.mkdtempSync(path.resolve('artifacts/case-registration-'));
process.env.CASE_CONFIG=path.join(dir,'config.json');
process.env.CASE_STATE=path.join(dir,'state.json');
fs.writeFileSync(process.env.CASE_CONFIG,JSON.stringify({teams:{LEGACY:'Team 9'},sigs:{LEGACY:'OLD-SIG'},answers:['A'],building:['library']}));
const {handleCase}=await import('../deploy/case.mjs');
function request(route,body={}) { return new Promise(resolve=>{
 const req=new EventEmitter(); req.url='/api/case/'+route;req.method='POST';let status;
 handleCase(req,{writeHead(s){status=s},end(s){resolve({status,...JSON.parse(s)})}});
 req.emit('data',JSON.stringify(body));req.emit('end');
});}
try {
 const first=await request('register');assert.equal(first.name,'Team 1');assert.equal(first.startedAt,null);
 const next=await Promise.all(Array.from({length:8},()=>request('register')));
 assert.deepEqual(next.map(t=>t.name),Array.from({length:8},(_,i)=>'Team '+(i+2)));
 assert.equal(new Set([first,...next].map(t=>t.code)).size,9);
 assert.equal(Object.keys(JSON.parse(fs.readFileSync(process.env.CASE_STATE))).length,9);
 assert.equal((await request('start',{code:'LEGACY'})).name,'Team 9');
 const tenth=await request('register');assert.equal(tenth.name,'Team 10');
 await request('start',{code:first.code});
 assert.equal((await request('unlock',{code:first.code,recovered:true,floor:"2nd floor",item:"bird book"})).status,403);
 await request('building',{code:first.code,answer:'library'});
 assert.equal((await request('key',{code:first.code})).status,403);
 await request('ping',{code:first.code,x:312,y:175});
 assert.equal((await request('key',{code:first.code})).phase,'drive');
 assert.equal((await request('unlock',{code:first.code,recovered:true})).status,400);
 assert.equal((await request('unlock',{code:first.code,recovered:true,floor:'first',item:'desk'})).status,400);
 assert.equal((await request('unlock',{code:first.code,recovered:true,floor:"2nd floor",item:"bird book"})).phase,'ciphers');
 console.log('Registration checks passed: first/next team, concurrent reservations, persistence, legacy team and USB phase gates.');
} finally { fs.rmSync(dir,{recursive:true,force:true}); }
