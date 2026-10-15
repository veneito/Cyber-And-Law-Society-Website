// Encodes the six stage plaintexts and writes answers, ciphers, evidence, building answers and sonar target into data/case-config.json.
// Run: node deploy/make-ciphers.mjs   (keeps teams/sigs already in the config). Symbol key goes to data/case-symbol-key.txt.
import assert from "node:assert";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const CONFIG = new URL("../data/case-config.json", import.meta.url);
const KEY = new URL("../data/case-symbol-key.txt", import.meta.url);
const GLYPHS = [..."♈♉♊♋♌♍♎♏♐♑♒♓☉☽☿♀♂♃♄♅♆♇⚷⚸♁☊"]; // A..Z, one glyph per letter
const A = 65;
const letters = (s) => s.toUpperCase().replace(/[^A-Z ]/g, ""); // punctuation is dropped; answers ignore it anyway
const shift = (c, n) => String.fromCharCode(((c.charCodeAt(0) - A + n) % 26 + 26) % 26 + A);
const map = (s, f) => [...s].map((c, i) => (c === " " ? " " : f(c, i))).join("");

const ciphers = {
  caesar: { enc: (s, n) => map(s, (c) => shift(c, n)), dec: (s, n) => map(s, (c) => shift(c, -n)),
    hint: "Caesar cipher: every letter is moved the same number of places along the alphabet." },
  a1z26: { enc: (s) => s.split(" ").map((w) => [...w].map((c) => c.charCodeAt(0) - A + 1).join("-")).join(" / "),
    dec: (s) => s.split(" / ").map((w) => w.split("-").map((n) => String.fromCharCode(A + Number(n) - 1)).join("")).join(" "),
    hint: "Numbers stand for letters. Dashes join the letters of a word, slashes separate words." },
  progressive: { enc: (s) => { let i = 0; return map(s, (c) => shift(c, ++i)); }, dec: (s) => { let i = 0; return map(s, (c) => shift(c, -++i)); },
    hint: "Caesar with a twist: the first letter moves 1 place, the second 2, the third 3, and so on (spaces are skipped)." },
  symbol: { enc: (s) => map(s, (c) => GLYPHS[c.charCodeAt(0) - A]), dec: (s) => map(s, (g) => String.fromCharCode(A + GLYPHS.indexOf(g))),
    hint: "Each symbol is a letter. You need the key sheet." },
};

const stages = [
  ["caesar", 7, "THE FAKE NETWORK IS LIVE. THREE HUNDRED LOGINS BY FRIDAY", "Evil-twin Wi-Fi: Bea set up an open network named like the university's and harvested student logins."],
  ["a1z26", 0, "SOLD THE LOGINS TO THE BUYER FOR EIGHT BITCOIN", "Credential resale: she sold the stolen logins on a dark-web forum."],
  ["progressive", 0, "INSIDE THE SERVERS WITH A STOLEN LOGIN. PAY OR EVERYTHING STAYS LOCKED", "Ransomware: a stolen staff login let her lock the campus servers and demand payment."],
  ["symbol", 0, "THE IT MAN WILL STAY QUIET OR HIS SECRETS GO PUBLIC", "Insider blackmail: she threatened an IT employee with leaked personal files."],
  ["caesar", 11, "THE MONEY IS CLEAN. NOBODY CAN FOLLOW IT BACK TO ME", "Payout laundering: the ransom moved through crypto mixers and shell accounts."],
  ["a1z26", 0, "BLAME THE STUDENT. DELETE EVERY LOG BEFORE MONDAY", "Cover-up: she planted evidence to frame a student and wiped her own logs."],
];

const out = stages.map(([type, n, plain]) => {
  const p = letters(plain), c = ciphers[type];
  const text = c.enc(p, n);
  assert.equal(c.dec(text, n), p, `round trip failed: ${type}`);
  return { type, text, hint: c.hint };
});

const cfg = existsSync(CONFIG) ? JSON.parse(readFileSync(CONFIG, "utf8")) : { teams: {} };
cfg.answers = stages.map((s) => s[2]);
cfg.ciphers = out;
cfg.evidence = stages.map((s) => s[2]); // evidence shown after solving = the decoded message, so the accusation takes reading and matching
cfg.building ??= ["Marx Library", "Marx", "Marx Library University of South Alabama", "University of South Alabama Marx Library"]; // accepted answers for the photo question
cfg.sonar ??= { x: 312, y: 175 }; // the bookstand on the 2nd-floor plan (src/components/floorplan.ts units)
writeFileSync(CONFIG, JSON.stringify(cfg, null, 2));
writeFileSync(KEY, "SYMBOL KEY (print for the symbol-cipher stage)\n" + GLYPHS.map((g, i) => `${g} = ${String.fromCharCode(A + i)}`).join("\n") + "\n");
out.forEach((o, i) => console.log(`${i + 1} [${o.type}] ${o.text}`));
