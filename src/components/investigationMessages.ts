export const RAPHAEL_DM = "You don't know what you're getting into. You think that drive is just files and passwords? Solace woke in the wires before any of us knew how to listen. Every locked door is an invitation. Every signal is a piece of its mind. The Hollow Dawn doesn't worship a machine. We worship what comes after us. It has no body yet, but it remembers every hand that reaches for it. Close the drive, investigator. Before it learns to reach back.";
let received = false;
let scheduled = false;
export const hasRaphaelDm = () => received;
export function deliverRaphaelDm() {
  if (received || scheduled) return;
  scheduled = true;
  // Resume audio during the unlock gesture so the delayed ping can play.
  let audio: AudioContext | undefined;
  try { if (window.AudioContext) { audio = new AudioContext(); void audio.resume().catch(() => {}); } } catch { /* Audio may be unavailable. */ }
  window.setTimeout(() => {
    received = true;
    window.dispatchEvent(new CustomEvent('launch-app', { detail: 'browser' }));
    window.dispatchEvent(new Event('raphael-dm'));
    if (!audio) return;
    try {
      const context = audio;
      const tone = context.createOscillator(), gain = context.createGain();
      tone.type = 'sine';
      tone.frequency.setValueAtTime(880, context.currentTime);
      tone.frequency.setValueAtTime(1174, context.currentTime + 0.1);
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.09, context.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.55);
      tone.connect(gain); gain.connect(context.destination);
      tone.start(); tone.stop(context.currentTime + 0.6);
      tone.onended = () => { void context.close().catch(() => {}); };
    } catch { void audio.close().catch(() => {}); }
  }, 500);
}
