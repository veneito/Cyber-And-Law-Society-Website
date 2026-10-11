// Officer application API. No dependencies.
//   POST /api/apply {name, email, major, year, role, experience, why}
// Saves to data/applications.jsonl (outside git) and, when configured, also posts to Discord
// (DISCORD_WEBHOOK_URL) and emails the officers via Resend (RESEND_API_KEY, APPLY_EMAIL_TO,
// optional APPLY_EMAIL_FROM). A missing setting just skips that channel.
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Secrets live in a git-ignored .env at the project root (same file on the Mint PC).
try { process.loadEnvFile(fileURLToPath(new URL("../.env", import.meta.url))); } catch { /* no .env: optional channels stay off */ }

const FILE = process.env.APPLICATIONS_FILE || fileURLToPath(new URL("../data/applications.jsonl", import.meta.url));
const COOLDOWN_MS = 60_000;
const LIMITS = { name: 80, email: 120, major: 80, year: 20, role: 80, experience: 800, why: 1200 };
const lastPost = new Map();

function send(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

async function notify(a) {
  const text = [
    `Name: ${a.name}`, `Email: ${a.email}`, `Major: ${a.major}`, `Year: ${a.year}`, `Role: ${a.role}`,
    `Experience: ${a.experience || "-"}`, `Why: ${a.why}`,
  ].join("\n");
  const hook = process.env.DISCORD_WEBHOOK_URL;
  if (hook) {
    await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // allowed_mentions stops applicants from pinging @everyone through the webhook
      body: JSON.stringify({ content: `**New officer application**\n${text}`.slice(0, 1900), allowed_mentions: { parse: [] } }),
    }).catch((e) => console.error("discord webhook failed", e.message));
  }
  const key = process.env.RESEND_API_KEY;
  const to = process.env.APPLY_EMAIL_TO;
  if (key && to) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.APPLY_EMAIL_FROM || "CLS Website <onboarding@resend.dev>",
        to: to.split(",").map((s) => s.trim()),
        reply_to: a.email,
        subject: `Officer application: ${a.name}`,
        text,
      }),
    }).catch((e) => console.error("email failed", e.message));
  }
}

// Returns true if the request was handled.
export function handleApply(req, res) {
  if (new URL(req.url, "http://x").pathname !== "/api/apply") return false;
  if (req.method !== "POST") return send(res, 405, { error: "method not allowed" }), true;

  const ip = req.headers["cf-connecting-ip"] || req.socket.remoteAddress;
  const now = Date.now();
  if (now - (lastPost.get(ip) ?? 0) < COOLDOWN_MS) return send(res, 429, { error: "cooldown" }), true;

  let raw = "";
  req.on("data", (c) => {
    raw += c;
    if (raw.length > 6000) req.destroy();
  });
  req.on("end", async () => {
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return send(res, 400, { error: "bad json" });
    }
    const a = {};
    for (const [k, max] of Object.entries(LIMITS)) a[k] = String(body[k] ?? "").trim().slice(0, max);
    if (!a.name || !a.major || !a.year || !a.role || !a.why || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email))
      return send(res, 400, { error: "missing fields" });

    lastPost.set(ip, now);
    mkdirSync(dirname(FILE), { recursive: true });
    appendFileSync(FILE, JSON.stringify({ ...a, date: new Date(now).toISOString() }) + "\n");
    await notify(a);
    send(res, 200, { ok: true });
  });
  return true;
}
