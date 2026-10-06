// Tiny static server for the built site (dist/). No dependencies.
// Used on the Mint PC behind the Cloudflare Tunnel.
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT || 3001);
const ROOT = fileURLToPath(new URL("../dist/", import.meta.url));
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".json": "application/json", ".txt": "text/plain",
};

function fileFor(urlPath) {
  let p;
  try {
    p = normalize(join(ROOT, decodeURIComponent(urlPath)));
  } catch {
    return null;
  }
  if (!p.startsWith(normalize(ROOT))) return null; // block ../ escapes
  try {
    const s = statSync(p);
    if (s.isFile()) return p;
    if (s.isDirectory()) return fileFor(join(urlPath, "index.html"));
  } catch {}
  return null;
}

createServer((req, res) => {
  const path = new URL(req.url, "http://x").pathname;
  // Unknown paths fall back to the page itself (single-page app).
  const file = fileFor(path) ?? join(ROOT, "index.html");
  const type = TYPES[extname(file)] ?? "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": path.startsWith("/assets/") && type !== "image/webp" ? "public, max-age=31536000, immutable" : "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  if (req.method === "HEAD") return res.end();
  createReadStream(file).on("error", () => res.end()).pipe(res);
}).listen(PORT, "127.0.0.1", () => console.log(`Club site on http://127.0.0.1:${PORT}`));
