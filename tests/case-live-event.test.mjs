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
process.env.DISCORD_CLIENT_ID='test-client';process.env.DISCORD_CLIENT_SECRET='test-secret';process.env.DISCORD_GUILD_ID='99999999';process.env.DISCORD_REDIRECT_URI='http://localhost/api/case/callback';
delete process.env.CASE_EVENT_DISABLED;
const actualNow=Date.now, actualFetch=globalThis.fetch;
let now=Date.parse(CASE_EVENT.opensAt)+1000;
Date.now=()=>now;
fs.writeFileSync(process.env.CASE_CONFIG,JSON.stringify({teams:{OLD:'Team 9'},answers:['A'],building:['library']}));
fs.writeFileSync(process.env.CASE_STATE,JSON.stringify({FINAL:{participantId:'33333333',onlineTeam:true,name:'Team 3',startedAt:now-1000,finishedAt:now,score:456,solved:{}}}));
globalThis.fetch=async (url, options)=>{
 const address=String(url);
 if(address.endsWith('/oauth2/token'))return {ok:true,json:async()=>({access_token:options.body.get('code')})};
 const id=options.headers.Authorization.slice(7);
 if(address.endsWith('/users/@me')) return {ok:true,json:async()=>({id,username:'Tester'})};
 if(address.endsWith('/member')) return {ok:id!=='44444444',status:404,json:async()=>({user:{id},pending:id==='55555555'})};
 throw new Error('Unexpected network request');
};
const {handleCase}=await import('../deploy/case.mjs');
function request(route,body,cookie='') {return new Promise(resolve=>{
 const req=new EventEmitter();req.url='/api/case/'+route;req.method=body===undefined?'GET':'POST';req.headers={cookie};req.socket={remoteAddress:'test'};
 const headers={};let status;
 handleCase(req,{setHeader(k,v){headers[k.toLowerCase()]=v},writeHead(s,h){status=s;Object.entries(h||{}).forEach(([k,v])=>headers[k.toLowerCase()]=v)},end(text=''){resolve({status,headers,body:text?JSON.parse(text):null})}});
 if(body!==undefined){req.emit('data',JSON.stringify(body));req.emit('end')}
});}
async function signIn(id){
 const auth=await request('auth');assert.equal(auth.status,302);
 const target=new URL(auth.headers.location);assert.equal(target.searchParams.get('scope'),'identify guilds.members.read');
 const cookie=auth.headers['set-cookie'].split(';')[0];
 return request('callback?state='+target.searchParams.get('state')+'&code='+id,undefined,cookie);
}
try {
 assert.equal(eventStatus(Date.parse(CASE_EVENT.opensAt)-1),'upcoming');
 assert.equal(eventStatus(Date.parse(CASE_EVENT.closesAt)),'closed');
 assert.equal(attemptEndsAt(Date.parse(CASE_EVENT.closesAt)-1000),Date.parse(CASE_EVENT.closesAt));
 assert.equal((await request('register',{})).status,401);
 assert.equal((await request('start',{code:'OLD'})).status,401);
 assert.equal((await request('callback?code=11111111&state=invalid')).headers.location,'/case/wellington/?signin=expired');
 assert.match((await signIn('44444444')).headers.location,/membership/);
 assert.match((await signIn('55555555')).headers.location,/membership/);
 const signed=await signIn('11111111'), cookie=signed.headers['set-cookie'].split(';')[0];
 assert.match(signed.headers['set-cookie'],/HttpOnly; SameSite=Lax/);
 const session=await request('session',undefined,cookie);assert.equal(session.body.user.id,'11111111');
 const attempts=await Promise.all(Array.from({length:5},()=>request('register',{},cookie)));
 assert.equal(new Set(attempts.map(x=>x.body.code)).size,1);
 const code=attempts[0].body.code;
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
 console.log('Live event checks passed: Discord membership, OAuth state, account ownership, one attempt across sessions, immutable start/final scores, deadline and hashed sessions.');
} finally {Date.now=actualNow;globalThis.fetch=actualFetch;fs.rmSync(dir,{recursive:true,force:true})}
