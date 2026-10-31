import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { CASE_EVENT, eventStatus, attemptEndsAt } from '../shared/case-event.mjs';
const root = new URL('../artifacts/', import.meta.url);
fs.mkdirSync(root,{recursive:true});
const dir=fs.mkdtempSync(new URL('live-event-',root));
process.env.CASE_CONFIG=path.join(dir,'config.json');
process.env.CASE_STATE=path.join(dir,'state.json');
process.env.CASE_AUTH_FILE=path.join(dir,'auth.json');
process.env.CASE_BOT_SECRET='test-secret';
delete process.env.CASE_EVENT_DISABLED;
const actualNow=Date.now, actualFetch=globalThis.fetch;
let now=Date.parse(CASE_EVENT.opensAt)+1000;
Date.now=()=>now;
fs.writeFileSync(process.env.CASE_CONFIG,JSON.stringify({teams:{OLD:'Team 9'},answers:['A'],building:['library']}));
fs.writeFileSync(process.env.CASE_STATE,JSON.stringify({FINAL:{participantId:'33333333',onlineTeam:true,name:'Team 3',startedAt:now-1000,finishedAt:now,score:456,solved:{},phase:'ciphers'}}));
const {handleCase}=await import('../deploy/case.mjs');
function request(route,body,cookie='',extra={}) {return new Promise(resolve=>{
 const req=new EventEmitter();req.url='/api/case/'+route;req.method=body===undefined?'GET':'POST';req.headers={cookie,...extra};req.socket={remoteAddress:'test'};
 const headers={};let status;
 handleCase(req,{setHeader(k,v){headers[k.toLowerCase()]=v},writeHead(s,h){status=s;Object.entries(h||{}).forEach(([k,v])=>headers[k.toLowerCase()]=v)},end(text=''){resolve({status,headers,body:headers['content-type']?.includes('application/json') && text ? JSON.parse(text) : text})}});
 if(body!==undefined){req.emit('data',JSON.stringify(body));req.emit('end')}
});}
// The bot mints a one-time code for a Discord id; the player redeems it on the site.
async function signIn(id){
 const minted=await request('bot-code',{id,name:'Tester'},'',{authorization:'Bearer test-secret'});
 return request('login',{code:minted.body.code});
}
try {
 assert.equal(eventStatus(Date.parse(CASE_EVENT.opensAt)-1),'upcoming');
 assert.equal(eventStatus(Date.parse(CASE_EVENT.closesAt)),'closed');
 assert.equal(attemptEndsAt(Date.parse(CASE_EVENT.closesAt)-1000),Date.parse(CASE_EVENT.closesAt));
 assert.equal((await request('register',{})).status,401);
 assert.equal((await request('symbol-key.pdf?preview=1')).status,403);
 assert.equal((await request('start',{code:'OLD'})).status,401);
 assert.equal((await request('bot-code',{id:'11111111'},'',{authorization:'Bearer wrong'})).status,401);
 assert.equal((await request('login',{code:'NOPE1234'})).status,400);
 const once=await request('bot-code',{id:'22222222'},'',{authorization:'Bearer test-secret'});
 assert.equal((await request('login',{code:once.body.code})).status,200);
 assert.equal((await request('login',{code:once.body.code})).status,400);
 const signed=await signIn('11111111'), cookie=signed.headers['set-cookie'].split(';')[0];
 assert.match(signed.headers['set-cookie'],/HttpOnly; SameSite=Lax/);
 const session=await request('session',undefined,cookie);assert.equal(session.body.user.id,'11111111');
 const attempts=await Promise.all(Array.from({length:5},()=>request('register',{},cookie)));
 assert.equal(new Set(attempts.map(x=>x.body.code)).size,1);
 const code=attempts[0].body.code;
 assert.equal((await request('symbol-key.png',undefined,cookie)).status,403);
 assert.equal((await request('entry',undefined,cookie)).body.code,code);
 const newBrowser=await signIn('11111111');
 assert.equal((await request('register',{},newBrowser.headers['set-cookie'].split(';')[0])).body.code,code);
 assert.equal((await request('state?code='+code)).status,401);
 const other=await signIn('22222222'), otherCookie=other.headers['set-cookie'].split(';')[0];
 assert.equal((await request('state?code='+code,undefined,otherCookie)).status,401);
 const first=await request('start',{code,name:'First name'},cookie);
 now+=1000;
 const second=await request('start',{code,name:'Changed'},cookie);
 assert.equal(second.body.startedAt,first.body.startedAt);assert.equal(second.body.name,first.body.name);
 now=first.body.startedAt+90*60_000;
 assert.equal((await request('building',{code,answer:'library'},cookie)).status,410);
 assert.equal((await request('scoreboard')).body.over,false);
 const finalSignIn=await signIn('33333333'), finalCookie=finalSignIn.headers['set-cookie'].split(';')[0];
 assert.equal((await request('register',{},finalCookie)).body.code,'FINAL');
 const attachment=await request('symbol-key.pdf',undefined,finalCookie);assert.equal(attachment.status,200);assert.equal(attachment.headers['content-type'],'application/pdf');assert.equal(attachment.body.subarray(0,4).toString(),'%PDF');
 assert.equal((await request('building',{code:'FINAL',answer:'library'},finalCookie)).status,409);
 assert.equal((await request('start',{code:'FINAL'},finalCookie)).body.score,456);
 const late=await request('register',{},otherCookie);
 now=Date.parse(CASE_EVENT.closesAt)-1000;
 const lateStart=await request('start',{code:late.body.code},otherCookie);
 assert.equal(lateStart.body.endsAt,Date.parse(CASE_EVENT.closesAt));
 now=Date.parse(CASE_EVENT.closesAt);
 assert.equal((await request('building',{code:late.body.code,answer:'library'},otherCookie)).status,410);
 assert.equal((await request('start',{code:late.body.code},otherCookie)).body.startedAt,lateStart.body.startedAt);
 assert.equal((await request('register',{},cookie)).body.code,code);
 assert.equal((await request('state?code=FINAL',undefined,finalCookie)).body.score,456);
 assert.equal((await request('scoreboard')).body.over,true);
 const saved=fs.readFileSync(process.env.CASE_AUTH_FILE,'utf8');assert.ok(!saved.includes(cookie.split('=')[1]));
 console.log('Live event checks passed: bot-issued one-time codes, account ownership, one attempt across sessions, immutable start/final scores, deadline and hashed sessions.');
} finally {Date.now=actualNow;globalThis.fetch=actualFetch;fs.rmSync(dir,{recursive:true,force:true})}
