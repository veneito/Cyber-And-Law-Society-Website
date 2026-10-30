import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
try { process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url))); } catch { /* Credentials are configured by the owner. */ }
const FILE = process.env.CASE_AUTH_FILE || fileURLToPath(new URL('../data/case-auth.json', import.meta.url));
const pending = new Map(), rates = new Map();
let sessions;
const digest = value => createHash('sha256').update(value).digest('hex');
const token = () => randomBytes(32).toString('hex');
export const discordReady = () => ['DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET', 'DISCORD_GUILD_ID', 'DISCORD_REDIRECT_URI'].every(key => !!process.env[key]);
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
  res.setHeader('Set-Cookie', name + '=' + value + '; HttpOnly; SameSite=Lax; Path=/api/case; Max-Age=' + seconds + (process.env.DISCORD_REDIRECT_URI?.startsWith('https://') ? '; Secure' : ''));
}
export function caseParticipant(req) {
  const session = load()[digest(cookie(req, 'case_session'))];
  return session && session.expiresAt > Date.now() ? session.user : null;
}
function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body));
}
function redirect(res, destination) {
  res.writeHead(302, { Location: destination, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });res.end();
}
async function discord(path, access) {
  const response = await fetch('https://discord.com/api/v10' + path, { headers: { Authorization: 'Bearer ' + access }, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(response.status === 404 ? 'membership' : 'discord');
  return response.json();
}
export function handleCaseAuth(req, res) {
  const url = new URL(req.url, 'http://local');
  const route = url.pathname.slice('/api/case/'.length);
  if (!['auth', 'callback', 'session'].includes(route)) return false;
  if (req.method !== 'GET') { json(res, 405, { error: 'method not allowed' }); return true; }
  if (route === 'session') { json(res, 200, { user: caseParticipant(req), configured: discordReady() }); return true; }
  if (!discordReady()) { redirect(res, '/case/wellington/?signin=unavailable'); return true; }
  if (route === 'auth') {
    const now = Date.now(), ip = req.headers?.['cf-connecting-ip'] || req.socket?.remoteAddress || 'local';
    for (const [key, value] of pending) if (value.expiresAt <= now) pending.delete(key);
    for (const [key, value] of rates) if (value.until <= now) rates.delete(key);
    const rate = rates.get(ip) || { count: 0, until: now + 60_000 };
    if (++rate.count > 10) { json(res, 429, { error: 'Please wait a minute before signing in again.' }); return true; }
    rates.set(ip, rate);
    const state = token(); pending.set(digest(state), { expiresAt: now + 10 * 60_000 });
    setCookie(res, 'case_oauth', state, 600);
    const authorize = new URL('https://discord.com/oauth2/authorize');
    authorize.search = new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID, redirect_uri: process.env.DISCORD_REDIRECT_URI, response_type: 'code', scope: 'identify guilds.members.read', state }).toString();
    redirect(res, authorize.href);return true;
  }
  void (async () => {
    const state = url.searchParams.get('state') || '', key = digest(state), entry = pending.get(key);
    if (!state || cookie(req, 'case_oauth') !== state || !entry || entry.expiresAt <= Date.now()) return redirect(res, '/case/wellington/?signin=expired');
    pending.delete(key);setCookie(res, 'case_oauth', '', 0);
    if (url.searchParams.has('error') || !url.searchParams.get('code')) return redirect(res, '/case/wellington/?signin=cancelled');
    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID, client_secret: process.env.DISCORD_CLIENT_SECRET, grant_type: 'authorization_code', code: url.searchParams.get('code'), redirect_uri: process.env.DISCORD_REDIRECT_URI }),
    });
    if (!response.ok) throw new Error('discord');
    const access = (await response.json()).access_token;
    if (typeof access !== 'string') throw new Error('discord');
    const user = await discord('/users/@me', access);
    const member = await discord('/users/@me/guilds/' + process.env.DISCORD_GUILD_ID + '/member', access);
    if (!/^\d{5,30}$/.test(user.id) || member.user?.id !== user.id || member.pending) return redirect(res, '/case/wellington/?signin=membership');
    const session = token(), now = Date.now();
    for (const [key, value] of Object.entries(load())) if (value.expiresAt <= now) delete sessions[key];
    sessions[digest(session)] = { user: { id: user.id, name: String(user.global_name || user.username || 'Participant').slice(0, 80) }, expiresAt: now + 30 * 86400_000 };
    save();setCookie(res, 'case_session', session, 30 * 86400);redirect(res, '/case/wellington/');
  })().catch(error => redirect(res, '/case/wellington/?signin=' + (error.message === 'membership' ? 'membership' : 'failed')));
  return true;
}
