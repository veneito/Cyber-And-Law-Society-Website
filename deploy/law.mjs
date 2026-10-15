// Law logic puzzles asked after each cipher, three per crime (stage 0..5, same order as the ciphers).
// The puzzles live in law.json so the organizer dashboard can read them too. Each gives a simplified GAME rule
// plus facts; the answer follows from the rule alone (not legal advice). `answer` is the index into `options`.
// Kept server-side so the answers never reach the players' browsers.
import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("./law.json", import.meta.url), "utf8"));

export const LAW = data.map((stage) =>
  stage.map((p) => ({ q: `Rule: ${p.rule}\nFacts: ${p.facts}\n${p.ask}`, options: p.options, answer: p.answer })));
