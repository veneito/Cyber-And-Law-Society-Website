import assert from 'node:assert/strict';
import { notifySurvey } from '../deploy/survey-discord.mjs';
const survey={enjoyment:5,difficulty:3,learning:4,feedback:'@everyone feedback',submittedAt:Date.now()};
const originalFetch=globalThis.fetch;
const originalToken=process.env.DISCORD_BOT_TOKEN;
const originalChannel=process.env.CASE_SURVEY_CHANNEL_ID;
try {
  delete process.env.DISCORD_BOT_TOKEN;delete process.env.CASE_SURVEY_CHANNEL_ID;
  globalThis.fetch=async()=>{throw Error('Unconfigured notification must not send');};
  assert.equal(await notifySurvey('Test',survey),'unconfigured');
  process.env.DISCORD_BOT_TOKEN='test-only-not-a-real-token';process.env.CASE_SURVEY_CHANNEL_ID='123456789012345678';
  let calls=0;
  globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'https://discord.com/api/v10/channels/123456789012345678/messages');const body=JSON.parse(options.body);assert.deepEqual(body.allowed_mentions,{parse:[]});assert.equal(body.embeds[0].fields[4].value,survey.feedback);assert.equal(body.embeds[0].fields[0].value,'Test');return {ok:true,status:200};};
  assert.equal(await notifySurvey('Test',survey),'sent');assert.equal(calls,1);
  globalThis.fetch=async()=>({ok:false,status:403});assert.equal(await notifySurvey('Test',survey),'failed');
  console.log('Discord survey tests passed using mocked requests only.');
} finally {
  globalThis.fetch=originalFetch;
  if(originalToken===undefined)delete process.env.DISCORD_BOT_TOKEN;else process.env.DISCORD_BOT_TOKEN=originalToken;
  if(originalChannel===undefined)delete process.env.CASE_SURVEY_CHANNEL_ID;else process.env.CASE_SURVEY_CHANNEL_ID=originalChannel;
}
