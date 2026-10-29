// Generates 9 team codes and drive signatures into data/case-config.json, plus:
//   data/drives/team-N/wellington.sig   copy each folder's file onto flash drive N
//   data/case-team-sheet.txt            team, code and signature for you (never commit)
// Run: node deploy/make-teams.mjs [--force]   (refuses to replace real teams without --force)
//      node deploy/make-teams.mjs --add 20     keeps existing teams, appends 20 more, and writes
//        data/case-team-codes-A-B.txt (codes page) and data/case-team-keys-A-B.txt (signatures page)
import { randomInt } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const addAt = process.argv.indexOf("--add");
const ADD = addAt > 0 ? Number(process.argv[addAt + 1]) : 0;
const N = ADD || 9;
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L: easy to read aloud and type
const word = (n) => Array.from({ length: n }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
const group = (n) => word(n * 4).match(/.{4}/g).join("-");

const CONFIG = new URL("../data/case-config.json", import.meta.url);
const cfg = existsSync(CONFIG) ? JSON.parse(readFileSync(CONFIG, "utf8")) : {};
const real = Object.keys(cfg.teams ?? {}).some((c) => !c.startsWith("TEST-"));
if (real && !ADD && !process.argv.includes("--force")) {
  console.error("Config already has real teams. Re-run with --force to replace them (drives would stop working).");
  process.exit(1);
}

if (ADD) {
  if (!(ADD > 0)) { console.error("--add needs a number, e.g. --add 20"); process.exit(1); }
  cfg.teams ??= {};
  cfg.sigs ??= {};
} else {
  cfg.teams = {};
  cfg.sigs = {};
}
const first = ADD ? Object.keys(cfg.teams).filter((c) => !c.startsWith("TEST-")).length + 1 : 1;
const last = first + N - 1;
const sheet = ["TEAM SHEET (keep private)", ""];
const codes = [`TEAM CODES ${first}-${last} (keep private)`, ""];
const keys = [`TEAM KEYS ${first}-${last} (keep private)`, ""];
for (let i = first; i <= last; i++) {
  const code = `T${i}-${word(4)}`; // code is what the team types to start
  const sig = group(3);            // 12 characters, typeable when there is no laptop
  cfg.teams[code] = `Team ${i}`;
  cfg.sigs[code] = sig;
  mkdirSync(new URL(`../data/drives/team-${i}/`, import.meta.url), { recursive: true });
  writeFileSync(new URL(`../data/drives/team-${i}/wellington.sig`, import.meta.url), sig + "\n");
  sheet.push(`Team ${i}: code ${code}   signature ${sig}`);
  codes.push(`Team ${i}: ${code}`);
  keys.push(`Team ${i}: ${sig}`);
}
writeFileSync(CONFIG, JSON.stringify(cfg, null, 2));
if (ADD) {
  writeFileSync(new URL(`../data/case-team-codes-${first}-${last}.txt`, import.meta.url), codes.join("\n") + "\n");
  writeFileSync(new URL(`../data/case-team-keys-${first}-${last}.txt`, import.meta.url), keys.join("\n") + "\n");
} else {
  writeFileSync(new URL("../data/case-team-sheet.txt", import.meta.url), sheet.join("\n") + "\n");
}
console.log(`Wrote teams ${first}-${last}. See data/ (sheets) and data/drives/.`);
