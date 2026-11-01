let audio: AudioContext | undefined;
export function primeMessageAudio() {
  try {
    if (typeof window === 'undefined' || !window.AudioContext) return;
    audio ??= new AudioContext();
    if (audio.state === 'suspended') void audio.resume().catch(() => {});
  } catch { /* Sound is optional when the browser blocks audio. */ }
}
export function whitehatPing() {
  primeMessageAudio();
  if (!audio || audio.state !== 'running') return;
  try {
    const now = audio.currentTime, tone = audio.createOscillator(), gain = audio.createGain();
    tone.type = 'sine'; tone.frequency.setValueAtTime(740, now); tone.frequency.setValueAtTime(990, now + .09);
    gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(.055, now + .015); gain.gain.exponentialRampToValueAtTime(.001, now + .38);
    tone.connect(gain); gain.connect(audio.destination); tone.start(); tone.stop(now + .4);
    tone.onended = () => { tone.disconnect(); gain.disconnect(); };
  } catch { /* Keep message delivery independent of sound. */ }
}
