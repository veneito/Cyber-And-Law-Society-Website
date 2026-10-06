// Quarantine mini-game leaderboard API. No dependencies.
//   GET  /api/leaderboard          -> { easy: [...], medium: [...], hard: [...] }
//   POST /api/leaderboard {name, level, ms}
// Scores live in a JSON file outside git (data/leaderboard.json by default).
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const FILE = process.env.LEADERBOARD_FILE || fileURLToPath(new URL("../data/leaderboard.json", import.meta.url));
const LEVELS = ["easy", "medium", "hard"];
const MIN_MS = { easy: 2000, medium: 5000, hard: 10000 }; // faster than this is not a real game
const KEEP = 10;
const COOLDOWN_MS = 10_000;

let board;
const lastPost = new Map();

function load() {
  if (board) return board;
  try {
    board = JSON.parse(readFileSync(FILE, "utf8"));
  } catch {
    board = {};
  }
  for (const l of LEVELS) board[l] ??= [];
  return board;
}

function save() {
  mkdirSync(dirname(FILE), { recursive: true });
  writeFileSync(FILE + ".tmp", JSON.stringify(board));
  renameSync(FILE + ".tmp", FILE);
}

function send(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

// Returns true if the request was handled.
export function handleLeaderboard(req, res) {
  const path = new URL(req.url, "http://x").pathname;
  if (path !== "/api/leaderboard") return false;

  if (req.method === "GET") return send(res, 200, load()), true;
  if (req.method !== "POST") return send(res, 405, { error: "method not allowed" }), true;

  const ip = req.headers["cf-connecting-ip"] || req.socket.remoteAddress;
  const now = Date.now();
  const wait = COOLDOWN_MS - (now - (lastPost.get(ip) ?? 0));
  if (wait > 0) return send(res, 429, { error: "cooldown", retryIn: Math.ceil(wait / 1000) }), true;

  let raw = "";
  req.on("data", (c) => {
    raw += c;
    if (raw.length > 1000) req.destroy();
  });
  req.on("end", () => {
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return send(res, 400, { error: "bad json" });
    }
    // Keep in sync with cleanName() in src/components/Quarantine.tsx.
    const name = String(body.name ?? "").replace(/[^\p{L}\p{N} ._-]/gu, "").trim().slice(0, 16);
    const { level } = body;
    const ms = Math.round(Number(body.ms));
    if (!name) return send(res, 400, { error: "name" });
    if (!LEVELS.includes(level) || !Number.isFinite(ms) || ms < MIN_MS[level] || ms > 3_600_000)
      return send(res, 400, { error: "time" });

    lastPost.set(ip, now);
    const list = load()[level];
    const entry = { name, ms, date: new Date(now).toISOString().slice(0, 10) };
    list.push(entry);
    list.sort((a, b) => a.ms - b.ms);
    list.length = Math.min(list.length, KEEP);
    save();
    send(res, 200, { board, rank: list.indexOf(entry) }); // rank is -1 if it missed the top 10
  });
  return true;
}
