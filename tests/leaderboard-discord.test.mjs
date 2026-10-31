import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = new URL('../artifacts/', import.meta.url);
fs.mkdirSync(root, { recursive: true });
const dir = fs.mkdtempSync(new URL('lb-', root));
process.env.CASE_LEADERBOARD_FILE = path.join(dir, 'msg.json');
const { postLeaderboard } = await import('../deploy/leaderboard-discord.mjs');
const rows = [{ name: '@everyone *Pandas* (Team 1)', score: 900, solved: 4, accused: true, active: false, elapsed: 600000 }, { name: 'Owls (Team 2)', score: 300, solved: 2, accused: false, active: true, elapsed: 300000 }];
const real = globalThis.fetch, calls = [];
try {
  delete process.env.DISCORD_BOT_TOKEN; delete process.env.CASE_LEADERBOARD_CHANNEL_ID;
  globalThis.fetch = async () => { throw Error('must not send when unconfigured'); };
  assert.equal(await postLeaderboard(rows, false), 'unconfigured');
  process.env.DISCORD_BOT_TOKEN = 'test-only'; process.env.CASE_LEADERBOARD_CHANNEL_ID = '123456789012345678';
  globalThis.fetch = async (url, o) => { calls.push([o.method, url, JSON.parse(o.body)]); return { ok: true, status: 200, json: async () => ({ id: '999999999999999999' }) }; };
  assert.equal(await postLeaderboard(rows, false), 'sent');
  assert.equal(calls[0][0], 'POST');
  assert.deepEqual(calls[0][2].allowed_mentions, { parse: [] });
  assert.ok(!calls[0][2].embeds[0].description.includes('@everyone'));
  assert.match(calls[0][2].embeds[0].description, /🥇.*[*]900[*][*] pts/);
  assert.equal(await postLeaderboard(rows, true), 'sent');
  assert.equal(calls[1][0], 'PATCH'); assert.ok(calls[1][1].endsWith('/999999999999999999'));
  globalThis.fetch = async () => ({ ok: false, status: 403 });
  assert.equal(await postLeaderboard(rows, false), 'failed');
  console.log('Discord leaderboard tests passed using mocked requests only.');
} finally { globalThis.fetch = real; }
