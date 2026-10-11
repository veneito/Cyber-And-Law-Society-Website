// Keeps the Lady Justice bot online (presence only, no commands). Token comes from the env.
// shortcut: re-identifies on every disconnect instead of resuming; fine for presence-only.
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) throw new Error("Set DISCORD_BOT_TOKEN");

function connect() {
  const ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");
  let seq = null;
  let beat;
  const send = (op, d) => ws.send(JSON.stringify({ op, d }));

  ws.onmessage = ({ data }) => {
    const { op, d, s } = JSON.parse(data);
    if (s != null) seq = s;
    if (op === 10) {
      beat = setInterval(() => send(1, seq), d.heartbeat_interval);
      send(2, {
        token,
        intents: 0,
        properties: { os: "linux", browser: "cls-bot", device: "cls-bot" },
        presence: { status: "online", afk: false, activities: [{ name: "Justice for all", type: 3 }] },
      });
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
