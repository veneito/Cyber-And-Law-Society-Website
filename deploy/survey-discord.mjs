// Uses the configured survey bot channel, or the existing officer application webhook.
export async function notifySurvey(teamName, survey) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channel = process.env.CASE_SURVEY_CHANNEL_ID;
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  const useBot = !!(token && channel);
  if (!useBot && !webhook) return "unconfigured";
  if (useBot && !/^\d{16,22}$/.test(channel)) return "failed";
  try {
    const response = await fetch(useBot ? `https://discord.com/api/v10/channels/${channel}/messages` : webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(useBot ? { Authorization: `Bot ${token}` } : {}) },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        allowed_mentions: { parse: [] },
        embeds: [{
          title: "Wellington case · survey response",
          color: 0x22c55e,
          fields: [
            { name: "Team", value: String(teamName).slice(0, 200) },
            { name: "Enjoyment", value: `${survey.enjoyment}/5`, inline: true },
            { name: "Difficulty", value: `${survey.difficulty}/5 (1 easy · 5 hard)`, inline: true },
            { name: "Learning", value: `${survey.learning}/5`, inline: true },
            { name: "Feedback", value: survey.feedback || "No comment provided." },
          ],
          timestamp: new Date(survey.submittedAt).toISOString(),
        }],
      }),
    });
    if (!response.ok) { console.error(`Survey Discord delivery failed (HTTP ${response.status})`); return "failed"; }
    return "sent";
  } catch { console.error("Survey Discord delivery failed; response remains saved locally"); return "failed"; }
}
