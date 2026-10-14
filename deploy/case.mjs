// Bea F. Wellington case API. No dependencies.
//   POST /api/case/start      {code}                    -> team state (starts that team's 90 min clock)
//   POST /api/case/answer     {code, stage, answer}     -> {ok, evidence, points} | lockout / wrong
//   POST /api/case/accuse     {code, picks:{crime:evidence}} -> checklist of crimes with attached evidence
//   GET  /api/case/state?code=                          -> team state
//   GET  /api/case/scoreboard                           -> [{name, score, solved, accused}] (poll for live updates)
// Answers, team codes and evidence text live in a config file outside git (see case-config.example.json).
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const CONFIG_FILE = process.env.CASE_CONFIG || fileURLToPath(new URL("../data/case-config.json", import.meta.url));
const STATE_FILE = process.env.CASE_STATE || fileURLToPath(new URL("../data/case-state.json", import.meta.url));
const EVENT_MS = 90 * 60_000;
const STAGE_POINTS = 150, MAX_TIME_BONUS = 100, ACCUSE_BONUS = 300, WRONG_EVIDENCE = 10;
const LOCK_BASE_S = 15, LOCK_MAX_S = 120;

let config, state;
const norm = (s) => String(s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

function loadConfig() {
  if (config) return config;
  if (!existsSync(CONFIG_FILE)) return null;
  config = JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
  config.answers = config.answers.map(norm);
  return config;
}

function loadState() {
  if (state) return state;
  try {
    state = JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch {
    state = {};
  }
  return state;
}

function save() {
  mkdirSync(dirname(STATE_FILE), { recursive: true });
  writeFileSync(STATE_FILE + ".tmp", JSON.stringify(state));
  renameSync(STATE_FILE + ".tmp", STATE_FILE);
}

function send(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

const team = (code) => {
  const name = loadConfig()?.teams?.[code];
  return name ? (loadState()[code] ??= { name, startedAt: null, score: 0, solved: {}, misses: 0, lockedUntil: 0, accused: false }) : null;
};

const view = (t, now = Date.now()) => ({
  name: t.name,
  startedAt: t.startedAt,
  endsAt: t.startedAt && t.startedAt + EVENT_MS,
  score: t.score,
  solved: t.solved, // stage -> evidence text
  lockedFor: Math.max(0, Math.ceil((t.lockedUntil - now) / 1000)),
  accused: t.accused,
});

function readBody(req, cb, fail) {
  let raw = "";
  req.on("data", (c) => {
    raw += c;
    if (raw.length > 2000) req.destroy();
  });
  req.on("end", () => {
    try {
      cb(JSON.parse(raw));
    } catch {
      fail();
    }
  });
}

// Returns true if the request was handled.
export function handleCase(req, res) {
  const url = new URL(req.url, "http://x");
  if (!url.pathname.startsWith("/api/case/")) return false;
  const route = url.pathname.slice("/api/case/".length);
  if (!loadConfig()) return send(res, 503, { error: "not configured" }), true;

  if (route === "scoreboard" && req.method === "GET") {
    const rows = Object.values(loadState())
      .filter((t) => t.startedAt)
      .map((t) => ({ name: t.name, score: t.score, solved: Object.keys(t.solved).length, accused: t.accused }))
      .sort((a, b) => b.score - a.score);
    return send(res, 200, rows), true;
  }
  if (route === "state" && req.method === "GET") {
    const t = team(url.searchParams.get("code"));
    return send(res, t ? 200 : 403, t ? view(t) : { error: "unknown team" }), true;
  }
  if (!["start", "answer", "accuse"].includes(route) || req.method !== "POST")
    return send(res, 404, { error: "not found" }), true;

  readBody(req, (body) => {
    const t = team(body.code);
    if (!t) return send(res, 403, { error: "unknown team" });
    const now = Date.now();

    if (route === "start") {
      t.startedAt ??= now;
      save();
      return send(res, 200, view(t, now));
    }
    if (!t.startedAt) return send(res, 409, { error: "not started" });
    if (now > t.startedAt + EVENT_MS) return send(res, 410, { error: "time is up", ...view(t, now) });
    if (t.lockedUntil > now) return send(res, 429, { error: "locked", ...view(t, now) });

    if (route === "answer") {
      const stage = Number(body.stage);
      const { answers, evidence } = config;
      if (!Number.isInteger(stage) || stage < 0 || stage >= answers.length) return send(res, 400, { error: "stage" });
      if (t.solved[stage] !== undefined) return send(res, 200, { ok: true, repeat: true, ...view(t, now) });
      if (norm(body.answer) !== answers[stage]) {
        t.misses++;
        t.lockedUntil = now + Math.min(LOCK_BASE_S * 2 ** (t.misses - 1), LOCK_MAX_S) * 1000;
        save();
        return send(res, 200, { ok: false, ...view(t, now) });
      }
      const bonus = Math.round(MAX_TIME_BONUS * Math.max(0, 1 - (now - t.startedAt) / EVENT_MS));
      t.misses = 0;
      t.score += STAGE_POINTS + bonus;
      t.solved[stage] = evidence[stage];
      save();
      return send(res, 200, { ok: true, points: STAGE_POINTS + bonus, ...view(t, now) });
    }

    // accuse: picks maps each ticked crime to the evidence entry attached to it.
    if (t.accused) return send(res, 200, { ok: true, repeat: true, ...view(t, now) });
    const picks = body.picks && typeof body.picks === "object" ? body.picks : {};
    const n = config.answers.length;
    let wrong = 0;
    for (const [crime, ev] of Object.entries(picks)) {
      if (!(Number(crime) in t.solved) || Number(ev) !== Number(crime) || !(Number(ev) in t.solved)) wrong++;
    }
    t.score = Math.max(0, t.score - wrong * WRONG_EVIDENCE);
    const complete = wrong === 0 && Object.keys(picks).length === n;
    if (complete) {
      t.accused = true;
      t.score += ACCUSE_BONUS;
    }
    save();
    send(res, 200, { ok: complete, wrong, ...view(t, now) });
  }, () => send(res, 400, { error: "bad json" }));
  return true;
}
