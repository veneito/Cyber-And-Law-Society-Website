import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
try { process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url))); } catch { /* Credentials are configured by the owner. */ }
const FILE = process.env.CASE_AUTH_FILE || fileURLToPath(new URL('../data/case-auth.json', import.meta.url));
const pending = new Map(), rates = new Map();
let sessions;
const digest = value => createHash('sha256').update(value).digest('hex');
const token = () => randomBytes(32).toString('hex');
// The Discord bot (/play) vouches for a member by posting to bot-code with this shared secret; the player then redeems the code via login.
export const discordReady = () => !!process.env.CASE_BOT_SECRET;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function load() {
  if (!sessions) sessions = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : {};
  return sessions;
}
function save() {
  mkdirSync(dirname(FILE), { recursive: true });
  writeFileSync(FILE + '.tmp', JSON.stringify(sessions), { mode: 0o600 });
  renameSync(FILE + '.tmp', FILE);
}
function cookie(req, name) {
  return String(req.headers?.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(name + '='))?.slice(name.length + 1) || '';
}
function setCookie(res, name, value, seconds) {
  res.setHeader('Set-Cookie', name + '=' + value + '; HttpOnly; SameSite=Lax; Path=/api/case; Max-Age=' + seconds + (process.env.CASE_BOT_SECRET && process.env.NODE_ENV !== 'test' ? '; Secure' : ''));
}
export function caseParticipant(req) {
  const session = load()[digest(cookie(req, 'case_session'))];
  return session && session.expiresAt > Date.now() ? session.user : null;
}
function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body));
}
function readJson(req, cb) {
  let raw = '';
  req.on('data', c => { raw += c; if (raw.length > 2000) req.destroy(); });
  req.on('end', () => { try { cb(JSON.parse(raw)); } catch { cb(null); } });
}
export function handleCaseAuth(req, res) {
  const route = new URL(req.url, 'http://local').pathname.slice('/api/case/'.length);
  if (!['bot-code', 'login', 'session'].includes(route)) return false;
  if (req.method !== (route === 'session' ? 'GET' : 'POST')) { json(res, 405, { error: 'method not allowed' }); return true; }
  if (route === 'session') { json(res, 200, { user: caseParticipant(req), configured: discordReady() }); return true; }
  if (!discordReady()) { json(res, 503, { error: 'Discord entry is being prepared.' }); return true; }
  const now = Date.now();
  for (const [key, value] of pending) if (value.expiresAt <= now) pending.delete(key);
  for (const [key, value] of rates) if (value.until <= now) rates.delete(key);
  readJson(req, body => {
    if (route === 'bot-code') {
      const given = Buffer.from(String(req.headers?.authorization || '')), want = Buffer.from('Bearer ' + process.env.CASE_BOT_SECRET);
      if (given.length !== want.length || !timingSafeEqual(given, want)) return json(res, 401, { error: 'unauthorized' });
      if (!/^\d{5,30}$/.test(String(body?.id))) return json(res, 400, { error: 'bad request' });
      const code = Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
      pending.set(code, { expiresAt: now + 10 * 60_000, user: { id: body.id, name: String(body.name || 'Participant').slice(0, 80) } });
      return json(res, 200, { code });
    }
    const ip = req.headers?.['cf-connecting-ip'] || req.socket?.remoteAddress || 'local';
    const rate = rates.get(ip) || { count: 0, until: now + 60_000 };
    rates.set(ip, rate);
    if (++rate.count > 10) return json(res, 429, { error: 'Please wait a minute before trying again.' });
    const code = String(body?.code || '').toUpperCase().replace(/[^A-Z0-9]/g, ''), entry = pending.get(code);
    if (!entry) return json(res, 400, { error: 'That code is wrong or expired. Run /play in the club Discord for a new one.' });
    pending.delete(code);
    const session = token();
    for (const [key, value] of Object.entries(load())) if (value.expiresAt <= now) delete sessions[key];
    sessions[digest(session)] = { user: entry.user, expiresAt: now + 30 * 86400_000 };
    save(); setCookie(res, 'case_session', session, 30 * 86400); json(res, 200, { user: entry.user });
  });
  return true;
}
