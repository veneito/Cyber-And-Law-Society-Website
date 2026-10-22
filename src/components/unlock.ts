import { LOCK_MARKUP } from "./CyberArt";
import { sfx } from "./sound";

// Independent of the puzzle lifetime: server polling may clear the hack immediately.
export async function playUnlock() {
  const overlay = document.createElement("div");
  overlay.className = " fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/95";
  overlay.setAttribute("role", "status");
  overlay.setAttribute("aria-label", "Access restored. Lock unlocked.");
  overlay.innerHTML = LOCK_MARKUP + `<p class="mt-5 font-mono text-lg tracking-widest text-green-400">ACCESS RESTORED</p>`;
  document.body.append(overlay);
  sfx.unlock();
  try { await new Promise(resolve => setTimeout(resolve, 1800)); }
  finally { overlay.remove(); }
}
