// Bea F. Wellington case API. No dependencies.
// Each team moves through phases: photo -> sonar -> drive -> ciphers. The server enforces the order.
//   POST /api/case/start     {code}                     -> team state (starts that team's 90 min clock)
//   POST /api/case/building  {code, answer}             -> photo phase: name the building
//   POST /api/case/ping      {code, x, y}               -> sonar phase: {strength, found}
//   POST /api/case/key       {code}                     -> sonar phase: "Key Obtained" (needs found)
//   POST /api/case/unlock    {code, sig}                -> drive phase: flash-drive signature check
//   POST /api/case/answer    {code, stage, answer}      -> ciphers phase
//   POST /api/case/law       {code, choice}             -> law check asked after each cipher; blocks everything until answered
//   POST /api/case/accuse    {code, picks:{crime:evidence}}
//   POST /api/case/hack      {code, solution}           -> solve Bea's hack puzzle
//   POST /api/case/reset     {key}                      -> wipes all team progress (needs config.adminKey; no ssh or restart)
//   GET  /api/case/state?code=   GET /api/case/scoreboard
// Answers, team codes, sigs, sonar target and evidence live in a config file outside git (see case-config.example.json).
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LAW } from "./law.mjs";

const CONFIG_FILE = process.env.CASE_CONFIG || fileURLToPath(new URL("../data/case-config.json", import.meta.url));
const STATE_FILE = process.env.CASE_STATE || fileURLToPath(new URL("../data/case-state.json", import.meta.url));
const EVENT_MS = 90 * 60_000;
const STAGE_POINTS = 150, MAX_TIME_BONUS = 100, ACCUSE_BONUS = 300, WRONG_EVIDENCE = 10;
const LOCK_BASE_S = 15, LOCK_MAX_S = 120;
const HACK_AFTER_WRONG = 1, HACK_GAP_MS = [8 * 60_000, 12 * 60_000]; // hack after every miss, and roughly every 10 min
const HACK_FAST_MS = 20_000, HACK_SLOW_MS = 60_000, HACK_POINTS = 20;
const SONAR_W = 820, SONAR_H = 820, FOUND_RADIUS = 22, SONAR_RANGE = 700; // plan units, see src/components/floorplan.ts

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
  if (!name) return null;
  // Spread over the defaults so a record saved by an older version still gets any new fields.
  return (loadState()[code] = {
    name, startedAt: null, score: 0, solved: {}, misses: 0, lockedUntil: 0, accused: false,
    phase: "photo", found: false, hack: null, law: null, nextHackAt: 0,
    finishedAt: null, kindBag: [], lastKind: null,
    pts: { base: 0, time: 0, hack: 0, penalty: 0, accuse: 0 }, // score breakdown for the victory screen
    crimeOrder: shuffle([...Array(loadConfig().answers.length).keys()]), // per-team display order for the accusation
    evOrder: shuffle([...Array(loadConfig().answers.length).keys()]),
    ...loadState()[code],
  });
};

// ---- Bea's hack puzzles. Generated fresh each time; kinds rotate so none repeats until all have appeared. ----
const KINDS = ["dots", "memory", "wires", "firewall", "rings"];
const shuffle = (a) => {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};
const int = (a, b) => Math.floor(rand(a, b + 1));

function makeHack(t, now) {
  t.kindBag = (t.kindBag ?? []).filter((kind) => KINDS.includes(kind));
  if (!t.kindBag.length) { // refill; never start a new round with the kind that just ran
    t.kindBag = shuffle(KINDS);
    if (t.kindBag[0] === t.lastKind) t.kindBag.push(t.kindBag.shift());
  }
  const kind = t.kindBag.shift();
  t.lastKind = kind;
  const h = { kind, issuedAt: now };
  if (kind === "dots") {
    const n = int(5, 8);
    const slots = shuffle([...Array(9).keys()]).slice(0, n);
    h.data = { points: slots.map((slot, i) => ({ id: i + 1, x: 15 + slot % 3 * 34 + int(-4, 4), y: 15 + Math.floor(slot / 3) * 34 + int(-4, 4) })) };
    h.solution = [...Array(n).keys()].map((i) => i + 1).join(","); // click the dots in number order
  } else if (kind === "memory") {
    const sequence = Array.from({ length: int(5, 6) }, () => int(0, 3));
    h.data = { sequence };
    h.solution = sequence.join(",");
  } else if (kind === "wires") {
    const ports = shuffle([0, 1, 2, 3]);
    h.data = { sequence: ports };
    h.solution = [0, 1, 2, 3].map((id) => ports.indexOf(id)).join(",");
  } else if (kind === "rings") {
    h.data = { sequence: Array.from({ length: 3 }, () => int(1, 7)) };
    h.solution = "0,0,0";
  } else {
    const cells = Array(9).fill(1);
    for (let i = 0; i < 7; i++) {
      const pos = int(0, 8);
      for (const n of [pos, pos - 3, pos + 3, ...(pos % 3 > 0 ? [pos - 1] : []), ...(pos % 3 < 2 ? [pos + 1] : [])])
        if (n >= 0 && n < 9) cells[n] ^= 1;
    }
    if (cells.every((v) => v === 1)) cells[0] = cells[1] = cells[3] = 0;
    h.data = { sequence: cells };
    h.solution = Array(9).fill(1).join(",");
  }
  return h;
}

// Called after every state read or write; starts a hack on the random timer or after a wrong answer.
function maybeHack(t, now, afterWrong) {
  if (t.hack && !KINDS.includes(t.hack.kind)) t.hack = makeHack(t, now);
  if (t.hack || t.finishedAt || !t.startedAt || now > t.startedAt + EVENT_MS) return;
  const timed = t.phase === "ciphers"; // the random timer starts once the flash-drive key is entered
  if (timed && !t.nextHackAt) t.nextHackAt = now + rand(...HACK_GAP_MS);
  if ((afterWrong && Math.random() < HACK_AFTER_WRONG) || (timed && now >= t.nextHackAt)) {
    t.hack = makeHack(t, now);
    if (timed) t.nextHackAt = now + rand(...HACK_GAP_MS);
  }
}

function wrong(t, now) {
  t.misses++;
  t.lockedUntil = now + Math.min(LOCK_BASE_S * 2 ** (t.misses - 1), LOCK_MAX_S) * 1000;
  maybeHack(t, now, true);
}

const label = (t) => (t.custom ? `${t.custom} (${t.name})` : t.name); // "Pandas (Team 1)"

const view = (t, now = Date.now()) => ({
  name: label(t),
  startedAt: t.startedAt,
  endsAt: t.startedAt && t.startedAt + EVENT_MS,
  score: t.score,
  phase: t.phase,
  found: t.found,
  solved: t.solved, // stage -> evidence text
  lockedFor: Math.max(0, Math.ceil((t.lockedUntil - now) / 1000)),
  accused: t.accused,
  finishedAt: t.finishedAt,
  pts: t.pts,
  crimeOrder: t.crimeOrder,
  evOrder: t.evOrder,
  // ciphertext only in the cipher phase, and never which cipher it is
  ciphers: t.phase === "ciphers" ? (loadConfig().ciphers ?? []).map((c) => ({ text: c.text })) : [],
  hack: t.hack && { kind: t.hack.kind, data: t.hack.data, issuedAt: t.hack.issuedAt },
  law: t.law && { stage: t.law.stage, question: t.law.q, options: t.law.options }, // never the answer
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

const ROUTES = ["start", "building", "ping", "key", "unlock", "answer", "law", "accuse", "hack", "reset"];

// Returns true if the request was handled.
export function handleCase(req, res) {
  const url = new URL(req.url, "http://x");
  if (!url.pathname.startsWith("/api/case/")) return false;
  const route = url.pathname.slice("/api/case/".length);
  if (!loadConfig()) return send(res, 503, { error: "not configured" }), true;

  if (route === "scoreboard" && req.method === "GET") {
    const now = Date.now();
    const started = Object.values(loadState()).filter((t) => t.startedAt);
    const end = (t) => t.finishedAt ?? Math.min(now, t.startedAt + EVENT_MS);
    const rows = started
      .map((t) => ({
        name: label(t), score: t.score, solved: Object.keys(t.solved).length, accused: t.accused,
        finished: !!t.finishedAt, active: !t.finishedAt && now <= t.startedAt + EVENT_MS, elapsed: end(t) - t.startedAt,
      }))
      .sort((a, b) => b.score - a.score || a.elapsed - b.elapsed); // ties go to the faster team
    // Over when every team that has started has finished or run out of time (a team that never starts does not block).
    return send(res, 200, { rows, over: rows.length > 0 && rows.every((r) => !r.active) }), true;
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
    if (route === "reset") {
      // Clears the in-memory state as well as the file; deleting only the file does not work because open pages re-save it.
      if (!config.adminKey || body.key !== config.adminKey) return send(res, 403, { error: "forbidden" });
      state = {};
      save();
      return send(res, 200, { ok: true });
    }
    const t = team(body.code);
    if (!t) return send(res, 403, { error: "unknown team" });
    const now = Date.now();

    if (route === "start") {
      t.startedAt ??= now;
      const custom = String(body.name ?? "").replace(/[^\w .'!&-]/g, "").trim().slice(0, 24);
      if (custom) t.custom = custom;
      save();
      return send(res, 200, view(t, now));
    }
    if (!t.startedAt) return send(res, 409, { error: "not started" });
    if (t.finishedAt) return send(res, 409, { error: "finished", ...view(t, now) });
    if (now > t.startedAt + EVENT_MS) return send(res, 410, { error: "time is up", ...view(t, now) });

    if (route === "hack") {
      if (!t.hack) return send(res, 200, { ok: true, ...view(t, now) });
      const sol = t.hack.solution;
      const given = Array.isArray(body.solution) ? body.solution.join(",") : String(body.solution ?? "");
      const good = Array.isArray(sol) ? sol.includes(given.trim().toLowerCase()) : norm(given) === norm(sol);
      if (!good) return send(res, 200, { ok: false, ...view(t, now) }); // retry freely, the clock keeps running
      const took = now - t.hack.issuedAt;
      const delta = took < HACK_FAST_MS ? HACK_POINTS : took > HACK_SLOW_MS ? -HACK_POINTS : 0;
      const applied = Math.max(delta, -t.score); // score floors at 0
      t.score += applied;
      t.pts.hack += applied;
      t.hack = null;
      save();
      return send(res, 200, { ok: true, delta, ...view(t, now) });
    }
    if (t.hack) return send(res, 423, { error: "hacked", ...view(t, now) });
    if (t.law && route !== "law") return send(res, 423, { error: "law check", ...view(t, now) });
    if (t.lockedUntil > now && route !== "ping") return send(res, 429, { error: "locked", ...view(t, now) });

    const need = { building: "photo", ping: "sonar", key: "sonar", unlock: "drive", answer: "ciphers", law: "ciphers", accuse: "ciphers" }[route];
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
      const target = config.sonar ?? { x: 312, y: 175 };
      if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x > SONAR_W || y > SONAR_H) return send(res, 400, { error: "position" });
      const d = Math.hypot(x - target.x, y - target.y);
      if (d < FOUND_RADIUS) t.found = true;
      save();
      return send(res, 200, { strength: Math.max(0, 1 - d / SONAR_RANGE), found: t.found });
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

    if (route === "law") {
      if (!t.law) return send(res, 200, { ok: true, ...view(t, now) });
      if (Number(body.choice) !== t.law.answer) {
        wrong(t, now);
        save();
        return send(res, 200, { ok: false, ...view(t, now) });
      }
      t.misses = 0;
      t.law = null;
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
      t.pts.base += STAGE_POINTS;
      t.pts.time += bonus;
      t.solved[stage] = evidence[stage];
      t.law = { stage, ...pick(LAW[stage] ?? LAW[0]) }; // a law check must be answered before anything else
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
    const fine = Math.min(t.score, bad * WRONG_EVIDENCE);
    t.score -= fine;
    t.pts.penalty -= fine;
    const complete = bad === 0 && Object.keys(picks).length === n;
    if (complete) {
      t.accused = true;
      t.score += ACCUSE_BONUS;
      t.pts.accuse += ACCUSE_BONUS;
      t.finishedAt = now; // pauses this team's clock; the victory screen takes over
      t.hack = null;
    } else if (bad) maybeHack(t, now, true);
    save();
    send(res, 200, { ok: complete, wrong: bad, ...view(t, now) });
  }, () => send(res, 400, { error: "bad json" }));
  return true;
}
