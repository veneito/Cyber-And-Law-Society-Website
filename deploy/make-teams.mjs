// Generates 9 team codes and drive signatures into data/case-config.json, plus:
//   data/drives/team-N/wellington.sig   copy each folder's file onto flash drive N
//   data/case-team-sheet.txt            team, code and signature for you (never commit)
// Run: node deploy/make-teams.mjs [--force]   (refuses to replace real teams without --force)
import { randomInt } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const N = 9;
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L: easy to read aloud and type
const word = (n) => Array.from({ length: n }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
const group = (n) => word(n * 4).match(/.{4}/g).join("-");

const CONFIG = new URL("../data/case-config.json", import.meta.url);
const cfg = existsSync(CONFIG) ? JSON.parse(readFileSync(CONFIG, "utf8")) : {};
const real = Object.keys(cfg.teams ?? {}).some((c) => !c.startsWith("TEST-"));
if (real && !process.argv.includes("--force")) {
  console.error("Config already has real teams. Re-run with --force to replace them (drives would stop working).");
  process.exit(1);
}

cfg.teams = {};
cfg.sigs = {};
const sheet = ["TEAM SHEET (keep private)", ""];
for (let i = 1; i <= N; i++) {
  const code = `T${i}-${word(4)}`; // code is what the team types to start
  const sig = group(3);            // 12 characters, typeable when there is no laptop
  cfg.teams[code] = `Team ${i}`;
  cfg.sigs[code] = sig;
  mkdirSync(new URL(`../data/drives/team-${i}/`, import.meta.url), { recursive: true });
  writeFileSync(new URL(`../data/drives/team-${i}/wellington.sig`, import.meta.url), sig + "\n");
  sheet.push(`Team ${i}: code ${code}   signature ${sig}`);
}
writeFileSync(CONFIG, JSON.stringify(cfg, null, 2));
writeFileSync(new URL("../data/case-team-sheet.txt", import.meta.url), sheet.join("\n") + "\n");
console.log(`Wrote ${N} teams. See data/case-team-sheet.txt and data/drives/.`);
