import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { EventEmitter } from 'node:events';
import { EVIDENCE_EN, EVIDENCE_ES, normalized, spanishEvidence } from '../shared/evidence.mjs';
const config={teams:Object.fromEntries(EVIDENCE_EN.map((_,i)=>['ES'+i,'Test '+i])),answers:EVIDENCE_EN,evidence:EVIDENCE_EN,ciphers:EVIDENCE_EN.map(text=>({text}))};
const encoded=spanishEvidence(config);assert.equal(encoded.length,6);
const glyphs=[...'♈♉♊♋♌♍♎♏♐♑♒♓☉☽☿♀♂♃♄♅♆♇⚷⚸♁☊'];
for(let stage=0;stage<6;stage++){
 let decoded;
 if(stage===1||stage===5)decoded=encoded[stage].split(' / ').map(w=>w.split('-').map(n=>String.fromCharCode(64+Number(n))).join('')).join(' ');
 else if(stage===3)decoded=[...encoded[stage]].map(c=>c===' '?' ':String.fromCharCode(65+glyphs.indexOf(c))).join('');
 else{let i=0;decoded=[...encoded[stage]].map(c=>{if(c===' ')return c;const shift=stage===2?++i:stage===0?7:11;return String.fromCharCode(((c.charCodeAt(0)-65-shift)%26+26)%26+65);}).join('');}
 assert.equal(decoded,EVIDENCE_ES[stage]);
}
assert.equal(normalized('TÉCNICO'),'TECNICO');
assert.equal(spanishEvidence({...config,answers:['custom event']}),null);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cls-spanish-check-'));
process.env.CASE_CONFIG=path.join(dir,'config.json');process.env.CASE_STATE=path.join(dir,'state.json');delete process.env.DISCORD_BOT_TOKEN;delete process.env.CASE_SURVEY_CHANNEL_ID;
fs.writeFileSync(process.env.CASE_CONFIG,JSON.stringify(config));fs.writeFileSync(process.env.CASE_STATE,JSON.stringify(Object.fromEntries(EVIDENCE_EN.map((_,i)=>['ES'+i,{startedAt:Date.now(),phase:'ciphers'}]))));
const {handleCase}=await import(pathToFileURL(path.resolve('deploy/case.mjs')).href);
function request(body){return new Promise(resolve=>{const req=new EventEmitter();req.url='/api/case/answer?lang=es';req.method='POST';let status;handleCase(req,{writeHead(s){status=s;},end(s){resolve({status,body:JSON.parse(s)});}});req.emit('data',JSON.stringify(body));req.emit('end');});}
for(let i=0;i<6;i++){const result=await request({code:'ES'+i,stage:i,answer:EVIDENCE_ES[i]});assert.equal(result.status,200);assert.equal(result.body.ok,true);assert.equal(result.body.solved[i],EVIDENCE_ES[i]);assert.equal(result.body.ciphers[i].text,encoded[i]);}
const stored=JSON.parse(fs.readFileSync(process.env.CASE_STATE));assert.equal(stored.ES0.solved[0],EVIDENCE_EN[0]);
console.log('Spanish checks passed: six cipher round trips, accent handling, custom-config fallback, six accepted answers and canonical saved evidence.');
