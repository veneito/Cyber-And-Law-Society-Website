// Bea F. Wellington case API. No dependencies.
// Each team moves through phases: photo -> sonar -> drive -> ciphers. The server enforces the order.
//   POST /api/case/start     {code}                     -> team state (starts that team's 90 min clock)
//   POST /api/case/building  {code, answer}             -> photo phase: name the building
//   POST /api/case/ping      {code, x, y}               -> sonar phase: {strength, found}
//   POST /api/case/key       {code}                     -> sonar phase: "Key Obtained" (needs found)
//   POST /api/case/unlock    {code, sig}                -> drive phase: flash-drive signature check
//   POST /api/case/answer    {code, stage, answer}      -> ciphers phase
//   POST /api/case/accuse    {code, picks:{crime:evidence}}
//   POST /api/case/hack      {code, solution}           -> solve Bea's hack puzzle
//   GET  /api/case/state?code=   GET /api/case/scoreboard
// Answers, team codes, sigs, sonar target and evidence live in a config file outside git (see case-config.example.json).
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const CONFIG_FILE = process.env.CASE_CONFIG || fileURLToPath(new URL("../data/case-config.json", import.meta.url));
const STATE_FILE = process.env.CASE_STATE || fileURLToPath(new URL("../data/case-state.json", import.meta.url));
const EVENT_MS = 90 * 60_000;
const STAGE_POINTS = 150, MAX_TIME_BONUS = 100, ACCUSE_BONUS = 300, WRONG_EVIDENCE = 10;
const LOCK_BASE_S = 15, LOCK_MAX_S = 120;
const HACK_AFTER_WRONG = 0.2, HACK_GAP_MS = [8 * 60_000, 12 * 60_000]; // random hack after a miss, and roughly every 10 min
const HACK_FAST_MS = 20_000, HACK_SLOW_MS = 60_000, HACK_POINTS = 20;
const SONAR_W = 600, SONAR_H = 400, FOUND_RADIUS = 14;

let config, state;
const norm = (s) => String(s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

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
  return name ? (loadState()[code] ??= {
    name, startedAt: null, score: 0, solved: {}, misses: 0, lockedUntil: 0, accused: false,
    phase: "photo", found: false, hack: null, nextHackAt: 0,
  }) : null;
};

// ---- Bea's hack puzzles. The solution never leaves the server. ----
const QUIZ = [
  ["What does the S in HTTPS stand for?", ["secure"]],
  ["Which attack tricks someone into giving up a password by pretending to be a trusted sender? (one word)", ["phishing"]],
  ["What is 7 + 8 x 2?", ["23"]],
  ["Next number: 2, 4, 8, 16, ?", ["32"]],
  ["What is binary 101 in decimal?", ["5"]],
  ["What does the A in 2FA stand for?", ["authentication"]],
  ["Next letter: A, C, E, G, ?", ["i"]],
  ["Trying every possible password is a ___ force attack.", ["brute"]],
  ["How many letters are in the English alphabet?", ["26"]],
  ["What is 15 minus 9, times 3?", ["18"]],
];
const KEYS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function makeHack(now) {
  const kind = pick(["dots", "qte", "quiz"]);
  const h = { kind, issuedAt: now };
  if (kind === "dots") {
    const n = 6;
    const ids = [...Array(n).keys()].map((i) => i + 1).sort(() => Math.random() - 0.5);
    h.data = { points: ids.map((id) => ({ id, x: Math.round(rand(8, 92)), y: Math.round(rand(8, 92)) })) };
    h.solution = [...Array(n).keys()].map((i) => String(i + 1)).join(","); // click the dots in number order
  } else if (kind === "qte") {
    const keys = Array.from({ length: 6 }, () => pick([...KEYS])).join("");
    h.data = { keys };
    h.solution = keys;
  } else {
    const [q, a] = pick(QUIZ);
    h.data = { question: q };
    h.solution = a;
  }
  return h;
}

// Called after every state read or write; starts a hack on the random timer or after a wrong answer.
function maybeHack(t, now, afterWrong) {
  if (t.hack || !t.startedAt || now > t.startedAt + EVENT_MS) return;
  if (!t.nextHackAt) t.nextHackAt = now + rand(...HACK_GAP_MS);
  if ((afterWrong && Math.random() < HACK_AFTER_WRONG) || now >= t.nextHackAt) {
    t.hack = makeHack(now);
    t.nextHackAt = now + rand(...HACK_GAP_MS);
  }
}

function wrong(t, now) {
  t.misses++;
  t.lockedUntil = now + Math.min(LOCK_BASE_S * 2 ** (t.misses - 1), LOCK_MAX_S) * 1000;
  maybeHack(t, now, true);
}

const view = (t, now = Date.now()) => ({
  name: t.name,
  startedAt: t.startedAt,
  endsAt: t.startedAt && t.startedAt + EVENT_MS,
  score: t.score,
  phase: t.phase,
  found: t.found,
  solved: t.solved, // stage -> evidence text
  lockedFor: Math.max(0, Math.ceil((t.lockedUntil - now) / 1000)),
  accused: t.accused,
  // ciphertext only in the cipher phase, and never which cipher it is
  ciphers: t.phase === "ciphers" ? (loadConfig().ciphers ?? []).map((c) => ({ text: c.text })) : [],
  hack: t.hack && { kind: t.hack.kind, data: t.hack.data, issuedAt: t.hack.issuedAt },
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

const ROUTES = ["start", "building", "ping", "key", "unlock", "answer", "accuse", "hack"];

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
    if (!t) return send(res, 403, { error: "unknown team" }), true;
    maybeHack(t, Date.now(), false);
    save();
    return send(res, 200, view(t)), true;
  }
  if (!ROUTES.includes(route) || req.method !== "POST") return send(res, 404, { error: "not found" }), true;

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

    if (route === "hack") {
      if (!t.hack) return send(res, 200, { ok: true, ...view(t, now) });
      const sol = t.hack.solution;
      const given = Array.isArray(body.solution) ? body.solution.join(",") : String(body.solution ?? "");
      const good = Array.isArray(sol) ? sol.includes(given.trim().toLowerCase()) : norm(given) === norm(sol);
      if (!good) return send(res, 200, { ok: false, ...view(t, now) }); // retry freely, the clock keeps running
      const took = now - t.hack.issuedAt;
      const delta = took < HACK_FAST_MS ? HACK_POINTS : took > HACK_SLOW_MS ? -HACK_POINTS : 0;
      t.score = Math.max(0, t.score + delta);
      t.hack = null;
      save();
      return send(res, 200, { ok: true, delta, ...view(t, now) });
    }
    if (t.hack) return send(res, 423, { error: "hacked", ...view(t, now) });
    if (t.lockedUntil > now && route !== "ping") return send(res, 429, { error: "locked", ...view(t, now) });

    const need = { building: "photo", ping: "sonar", key: "sonar", unlock: "drive", answer: "ciphers", accuse: "ciphers" }[route];
    if (t.phase !== need) return send(res, 403, { error: "wrong step", ...view(t, now) });

    if (route === "building") {
      const ok = (config.building ?? []).map(norm).includes(norm(body.answer));
      if (ok) t.phase = "sonar";
      else wrong(t, now);
      save();
      return send(res, 200, { ok, ...view(t, now) });
    }
    if (route === "ping") {
      const { x, y } = body;
      const target = config.sonar ?? { x: 440, y: 120 };
      if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x > SONAR_W || y > SONAR_H) return send(res, 400, { error: "position" });
      const d = Math.hypot(x - target.x, y - target.y);
      if (d < FOUND_RADIUS) t.found = true;
      save();
      return send(res, 200, { strength: Math.max(0, 1 - d / 500), found: t.found });
    }
    if (route === "key") {
      if (!t.found) return send(res, 403, { error: "not found yet" });
      t.phase = config.sigs ? "drive" : "ciphers";
      save();
      return send(res, 200, view(t, now));
    }
    if (route === "unlock") {
      const want = norm(config.sigs?.[body.code]);
      if (!want || norm(body.sig) !== want) {
        wrong(t, now); // shares the answer lockout so signatures cannot be brute-forced
        save();
        return send(res, 200, { ok: false, ...view(t, now) });
      }
      t.misses = 0;
      t.phase = "ciphers";
      save();
      return send(res, 200, { ok: true, ...view(t, now) });
    }

    if (route === "answer") {
      const stage = Number(body.stage);
      const { answers, evidence } = config;
      if (!Number.isInteger(stage) || stage < 0 || stage >= answers.length) return send(res, 400, { error: "stage" });
      if (t.solved[stage] !== undefined) return send(res, 200, { ok: true, repeat: true, ...view(t, now) });
      if (norm(body.answer) !== answers[stage]) {
        wrong(t, now);
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
    let bad = 0;
    for (const [crime, ev] of Object.entries(picks)) {
      if (!(Number(crime) in t.solved) || Number(ev) !== Number(crime) || !(Number(ev) in t.solved)) bad++;
    }
    t.score = Math.max(0, t.score - bad * WRONG_EVIDENCE);
    const complete = bad === 0 && Object.keys(picks).length === n;
    if (complete) {
      t.accused = true;
      t.score += ACCUSE_BONUS;
    } else if (bad) maybeHack(t, now, true);
    save();
    send(res, 200, { ok: complete, wrong: bad, ...view(t, now) });
  }, () => send(res, 400, { error: "bad json" }));
  return true;
}
