// One-off: creates a permanent invite as the bot, so the invite card shows the bot as the inviter.
// Usage: DISCORD_BOT_TOKEN=... node deploy/create-invite.mjs
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) throw new Error("Set DISCORD_BOT_TOKEN");

const api = async (path, opts = {}) => {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    ...opts,
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
};

const [guild] = await api("/users/@me/guilds");
if (!guild) throw new Error("Bot is not in any server");
const channels = await api(`/guilds/${guild.id}/channels`);
const channel = channels.find((c) => c.type === 0); // first text channel
if (!channel) throw new Error("No text channel found");

const invite = await api(`/channels/${channel.id}/invites`, {
  method: "POST",
  body: JSON.stringify({ max_age: 0, max_uses: 0, unique: true }),
});
console.log(`Server: ${guild.name}  Channel: #${channel.name}`);
console.log(`https://discord.gg/${invite.code}`);
