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

function tone(freq: number, at: number, dur: number, type: OscillatorType = "square", vol = 0.12, to = freq, force = false) {
  if (!force && !soundOn()) return;
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

// Phone ring for an incoming call: plays even when effects are muted (it is the call's own audio) and repeats until the returned stop is called.
function ring() {
  const once = () => { for (const at of [0, 0.5]) { tone(440, at, 0.4, "sine", 0.1, 440, true); tone(480, at, 0.4, "sine", 0.1, 480, true); } };
  once();
  const id = setInterval(once, 2400);
  return () => clearInterval(id);
}

export const sfx = {
  gavelHit: () => {
    tone(130, 0, 0.13, "triangle", 0.19, 55);
    tone(950, 0, 0.025, "square", 0.055, 300);
    tone(280, 0.018, 0.09, "sine", 0.08, 140);
  },
  circuitNode: (n: number) => { tone(340 + n * 65, 0, 0.075, "triangle", 0.08); tone(1800, 0, 0.018, "square", 0.025); },
  circuitBlocked: () => tone(110, 0, 0.1, "sawtooth", 0.05, 75),
  memoryPad: (pad: number) => tone([262, 330, 392, 523][pad] ?? 262, 0, 0.24, "sine", 0.13),
  memoryReady: () => { tone(660, 0, 0.07, "triangle", 0.07); tone(880, 0.1, 0.1, "triangle", 0.07); },
  wireSelect: () => tone(1400, 0, 0.04, "sine", 0.06, 1000),
  wireConnect: () => { tone(120, 0, 0.04, "sawtooth", 0.045, 600); tone(880, 0.045, 0.14, "sine", 0.08); },
  wireReject: () => { tone(160, 0, 0.06, "square", 0.045); tone(120, 0.08, 0.08, "square", 0.045); },
  firewallSwitch: (on: boolean) => { tone(1100, 0, 0.02, "square", 0.035); tone(on ? 240 : 180, 0.025, 0.11, "triangle", 0.09, on ? 480 : 90); },
  ringTurn: (aligned: boolean) => { tone(1700, 0, 0.025, "square", 0.035, 850); tone(180, 0.025, 0.06, "triangle", 0.07); if (aligned) tone(740, 0.07, 0.16, "sine", 0.075); },
  puzzleReset: () => tone(600, 0, 0.12, "triangle", 0.06, 220),
  lockCheck: () => { tone(180, 0, 0.05, "square", 0.045); tone(240, 0.08, 0.06, "triangle", 0.065); },
  unlock: () => {
    tone(1600, 0, 0.04, "square", 0.06, 700);
    tone(160, 0.22, 0.12, "triangle", 0.12, 70);
    [523, 659, 1047].forEach((f, i) => tone(f, 0.35 + i * 0.12, 0.28, "sine", 0.12));
  },
  accessDenied: () => {
    tone(440, 0, 0.12, "square", 0.07, 300);
    tone(280, 0.15, 0.18, "triangle", 0.12, 160);
  },
  errorSpread: () => { tone(780, 0, 0.05, "square", 0.05); tone(390, 0.07, 0.09, "triangle", 0.07); },
  dismissError: () => tone(900, 0, 0.045, "triangle", 0.06, 500),
  ring,
  beep: (high = false, volume = 0.12) => tone(high ? 880 : 440, 0, 0.18, "square", volume),
  glitch: () => { for (let i = 0; i < 8; i++) tone(120 + Math.random() * 900, i * 0.07, 0.06, "sawtooth", 0.1); },
  laugh: () => { // slow, low, descending "HA HA HA HA" with a growl at the end
    for (let i = 0; i < 7; i++) {
      tone(210 - i * 16, i * 0.28, 0.2, "sawtooth", 0.16, 130 - i * 12);
      tone(105 - i * 8, i * 0.28, 0.2, "square", 0.08, 65 - i * 5);
    }
    tone(80, 2, 0.9, "sawtooth", 0.18, 35);
  },
  siren: () => { for (let i = 0; i < 4; i++) tone(i % 2 ? 640 : 880, i * 0.3, 0.28, "triangle", 0.12); },
  type: () => { for (let i = 0; i < 14; i++) tone(1800 + Math.random() * 600, i * 0.12, 0.03, "square", 0.05); },
  approach: () => tone(300, 0, 1.4, "triangle", 0.04, 800), // distant siren swelling
  cuff: () => { tone(2200, 0, 0.05, "square", 0.12); tone(1500, 0.28, 0.07, "square", 0.14); },
  tick: () => { for (let i = 0; i < 4; i++) tone(1000 + i * 150, i * 0.22, 0.05, "square", 0.08); },
  slam: () => tone(90, 0, 0.35, "square", 0.25, 40),
  chime: (n = 0) => { [523, 659, 784].forEach((f, i) => tone(f * (1 + n * 0.12), i * 0.1, 0.22, "triangle", 0.14)); },
  jingle: () => { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.14, 0.25, "triangle", 0.15)); },
};
