// Tiny synthesized sound effects (no audio files). Muted until the player turns sound on; browsers need that click anyway.
const KEY = "case-sound";
let ctx: AudioContext | null = null;

export const soundOn = () => {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
};

export function setSound(on: boolean) {
  try { localStorage.setItem(KEY, on ? "1" : "0"); } catch { /* storage unavailable */ }
  if (on) {
    ctx ??= new AudioContext();
    void ctx.resume();
  }
}

function tone(freq: number, at: number, dur: number, type: OscillatorType = "square", vol = 0.12, to = freq) {
  if (!soundOn()) return;
  ctx ??= new AudioContext(); // sound can be on from an earlier visit, before this page load had a click
  if (ctx.state === "suspended") void ctx.resume();
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.frequency.linearRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur);
}

export const sfx = {
  beep: (high = false) => tone(high ? 880 : 440, 0, 0.18),
  glitch: () => { for (let i = 0; i < 8; i++) tone(120 + Math.random() * 900, i * 0.07, 0.06, "sawtooth", 0.1); },
  laugh: () => { for (let i = 0; i < 4; i++) tone(260 - i * 25, i * 0.26, 0.16, "sawtooth", 0.14, 190 - i * 25); }, // ha ha ha ha
  siren: () => { for (let i = 0; i < 4; i++) tone(i % 2 ? 640 : 880, i * 0.3, 0.28, "triangle", 0.12); },
  type: () => { for (let i = 0; i < 14; i++) tone(1800 + Math.random() * 600, i * 0.12, 0.03, "square", 0.05); },
  approach: () => tone(300, 0, 1.4, "triangle", 0.04, 800), // distant siren swelling
  cuff: () => { tone(2200, 0, 0.05, "square", 0.12); tone(1500, 0.28, 0.07, "square", 0.14); },
  tick: () => { for (let i = 0; i < 4; i++) tone(1000 + i * 150, i * 0.22, 0.05, "square", 0.08); },
  slam: () => tone(90, 0, 0.35, "square", 0.25, 40),
  chime: (n = 0) => { [523, 659, 784].forEach((f, i) => tone(f * (1 + n * 0.12), i * 0.1, 0.22, "triangle", 0.14)); },
  jingle: () => { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.14, 0.25, "triangle", 0.15)); },
};
