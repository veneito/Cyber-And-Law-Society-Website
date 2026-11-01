export function playDeniedBeep() {
  let context: AudioContext;
  try { context = new AudioContext(); } catch { return; }
  const stop = () => { void context.close().catch(() => {}); };
  try {
    void context.resume().catch(stop);
    const oscillator = context.createOscillator(), gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(390, now);
    oscillator.frequency.exponentialRampToValueAtTime(95, now + .18);
    oscillator.frequency.setValueAtTime(230, now + .2);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(.065, now + .012);
    gain.gain.exponentialRampToValueAtTime(.001, now + .38);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(); oscillator.stop(now + .4); oscillator.onended = stop;
  } catch { stop(); }
}
