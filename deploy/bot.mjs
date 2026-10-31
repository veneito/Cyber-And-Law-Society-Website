// Keeps the Lady Justice bot online and answers /play with a private one-time code for the case site.
// Needs DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, CASE_BOT_SECRET (same value as the site's) and optionally CASE_SITE_URL.
// shortcut: re-identifies on every disconnect instead of resuming; fine for presence-only.
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) throw new Error("Set DISCORD_BOT_TOKEN");
const { DISCORD_GUILD_ID: guild, CASE_BOT_SECRET: secret, CASE_SITE_URL: site = "https://cybernlaw.grenudo.dev" } = process.env;
const api = (path, method, body) => fetch(`https://discord.com/api/v10${path}`, { method, headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });

async function play(i) {
  const reply = (content) => api(`/interactions/${i.id}/${i.token}/callback`, "POST", { type: 4, data: { content, flags: 64 } }); // 64 = only the player sees it
  const user = i.member?.user;
  // member.pending = still in membership screening
  if (i.guild_id !== guild || !user || i.member.pending) return reply("Join the club server and finish its membership screening, then run /play again.");
  const r = await fetch(`${site}/api/case/bot-code`, { method: "POST", headers: { Authorization: `Bearer ${secret}` }, body: JSON.stringify({ id: user.id, name: user.global_name || user.username }), signal: AbortSignal.timeout(8000) }).catch(() => null);
  if (!r?.ok) return reply("The case site is not ready yet. Try again in a minute or tell an officer.");
  reply(`Your code is **${(await r.json()).code}**. Enter it on the case page within 10 minutes. It works once; don't share it.`);
}

function connect() {
  const ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");
  let seq = null;
  let beat;
  const send = (op, d) => ws.send(JSON.stringify({ op, d }));

  ws.onmessage = ({ data }) => {
    const { op, d, s, t } = JSON.parse(data);
    if (s != null) seq = s;
    if (op === 10) {
      beat = setInterval(() => send(1, seq), d.heartbeat_interval);
      send(2, {
        token,
        intents: 0,
        properties: { os: "linux", browser: "cls-bot", device: "cls-bot" },
        presence: { status: "online", afk: false, activities: [{ name: "Justice for all", type: 3 }] },
      });
    } else if (op === 0 && guild && secret) {
      if (t === "READY") api(`/applications/${d.application.id}/guilds/${guild}/commands`, "PUT", [{ name: "play", description: "Get your one-time code to enter the Bea F. Wellington case" }]);
      if (t === "INTERACTION_CREATE" && d.data?.name === "play") play(d).catch(() => {});
    } else if (op === 7 || op === 9) ws.close();
  };
  ws.onclose = (e) => {
    clearInterval(beat);
    // 4004 = bad token, 4013/4014 = bad intents: retrying will never work
    if ([4004, 4013, 4014].includes(e.code)) throw new Error(`Gateway closed ${e.code}`);
    setTimeout(connect, 5000);
  };
  ws.onerror = () => {};
}
connect();
