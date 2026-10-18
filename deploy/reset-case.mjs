// Wipes ALL team progress on the live site (clocks, scores, solved evidence). Run before the event:
//   node deploy/reset-case.mjs                 (live site)
//   node deploy/reset-case.mjs http://localhost:5173
// Reads adminKey from data/case-config.json (copy that file to the Mint PC first, so the server knows the key).
import { readFileSync } from "node:fs";

const base = process.argv[2] || "https://cybernlaw.grenudo.dev";
const { adminKey } = JSON.parse(readFileSync(new URL("../data/case-config.json", import.meta.url), "utf8"));
if (!adminKey) { console.error("No adminKey in data/case-config.json. Run: node deploy/make-ciphers.mjs"); process.exit(1); }
const r = await fetch(`${base}/api/case/reset`, { method: "POST", body: JSON.stringify({ key: adminKey }) });
console.log(r.ok ? `All progress wiped on ${base}.` : `Failed (${r.status}). Is the updated config on the server?`);
process.exit(r.ok ? 0 : 1);
