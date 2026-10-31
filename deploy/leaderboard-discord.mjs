import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
// Keeps one live leaderboard message in the #wellington-case channel: created once, then edited in place.
// Needs DISCORD_BOT_TOKEN and CASE_LEADERBOARD_CHANNEL_ID; the bot needs View Channel, Send Messages and Embed Links there.
const FILE = process.env.CASE_LEADERBOARD_FILE || fileURLToPath(new URL("../data/leaderboard-message.json", import.meta.url));
const MEDALS = ["🥇", "🥈", "🥉"];
const fmt = (ms) => `${Math.floor(ms / 60_000)}m`;

export async function postLeaderboard(rows, over) {
  const token = process.env.DISCORD_BOT_TOKEN, channel = process.env.CASE_LEADERBOARD_CHANNEL_ID;
  if (!token || !/^\d{16,22}$/.test(channel || "")) return "unconfigured";
  const list = rows.slice(0, 15).map((r, i) => `${MEDALS[i] ?? `**${i + 1}.**`} ${r.name.replace(/[*_`~|>\<@]/g, "")} · **${r.score}** pts · ${r.solved} solved · ${r.accused ? "✅ finished" : r.active ? "🔎 investigating" : "⏱ time up"} · ${fmt(r.elapsed)}`);
  const payload = JSON.stringify({
    allowed_mentions: { parse: [] },
    embeds: [{ title: over ? "Wellington case · final leaderboard" : "Wellington case · live leaderboard", color: 0x22c55e, description: list.join("\n") || "No teams have started yet.", timestamp: new Date().toISOString() }],
  });
  const api = `https://discord.com/api/v10/channels/${channel}/messages`;
  const call = (url, method) => fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bot ${token}` }, body: payload, signal: AbortSignal.timeout(8000) });
  try {
    const saved = existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : {};
    let id = saved.channel === channel ? saved.id : null;
    let response = id ? await call(`${api}/${id}`, "PATCH") : null;
    if (!response?.ok) { // first post, or the message was deleted
      response = await call(api, "POST");
      if (!response.ok) { console.error(`Leaderboard Discord post failed (HTTP ${response.status})`); return "failed"; }
      id = (await response.json()).id;
      mkdirSync(dirname(FILE), { recursive: true });
      writeFileSync(FILE, JSON.stringify({ channel, id }));
    }
    return "sent";
  } catch { console.error("Leaderboard Discord post failed"); return "failed"; }
}
