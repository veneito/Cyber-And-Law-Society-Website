// Prints one slip per team for teams with no flash drive, as two separate pages:
//   data/sig-papers.html   the wellington.sig signature
//   data/code-papers.html  the team code they type to start
// Run: node deploy/make-sig-papers.mjs [from] [to]   (default: every team)
// Open each file, print (A4, 8 slips per page). Never commit (data/ is ignored).
import { readFileSync, writeFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync(new URL("../data/case-config.json", import.meta.url), "utf8"));
const [from = 1, to = 1e9] = process.argv.slice(2).map(Number);
const teams = Object.entries(cfg.teams)
  .filter(([code]) => !code.startsWith("TEST-"))
  .map(([code, name]) => ({ n: Number(name.split(" ")[1]), name, code, sig: cfg.sigs[code] }))
  .filter((t) => t.n >= from && t.n <= to)
  .sort((a, b) => a.n - b.n);

const slip = (t, file, value, note) => `<div class="slip"><b>${t.name}</b><small>${file}</small><code>${value}</code><small>${note}</small></div>`;
// Flash-drive outline to cut out: metal plug on the left, rounded body, lanyard hole on the right.
const usbStyle = `<style>.usb{float:left;box-sizing:border-box;width:95mm;height:26mm;margin:3mm 5mm;display:flex;align-items:stretch;break-inside:avoid}
.usb i{width:18mm;margin:4mm 0;background:#ccc;border:1px solid #666;border-right:0}
.usb div{flex:1;border:1.5px solid #000;border-radius:3mm 9mm 9mm 3mm;padding:2mm 4mm;display:flex;flex-direction:column;justify-content:center}
.usb u{position:absolute;margin:10mm 0 0 83mm;width:4mm;height:4mm;border:1px solid #000;border-radius:50%}
.usb b{font-size:15px}.usb code{font-size:20px}</style>`;
const pages = {
  "sig-papers": (t) => `<div class="usb"><i></i><div><b>${t.name}</b><small>wellington.sig</small><code>${t.sig}</code></div><u></u></div>`,
  "code-papers": (t) => slip(t, "team code", t.code, "Type this team code to start the case."),
};
for (const [file, make] of Object.entries(pages)) {
  writeFileSync(new URL(`../data/${file}.html`, import.meta.url), `<!doctype html><meta charset="utf-8"><title>${file}</title>
<style>@page{size:A4;margin:10mm}body{margin:0;font:14px sans-serif}
.slip{box-sizing:border-box;float:left;width:50%;height:67mm;padding:8mm;border:1px dashed #888;break-inside:avoid;display:flex;flex-direction:column;justify-content:center;gap:4mm}
b{font-size:22px}code{font:700 28px monospace;letter-spacing:2px}small{color:#555}</style>${file === "sig-papers" ? usbStyle : ""}${teams.map(make).join("")}`);
}
console.log(`Wrote ${teams.length} slips each to data/sig-papers.html and data/code-papers.html`);
