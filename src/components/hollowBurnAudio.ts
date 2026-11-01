export function playInitiationBurn(duration = 11, volume = .025): () => void {
  let context: AudioContext;
  try { context = new AudioContext(); } catch { return () => {}; }
  const stop = () => { if (context.state !== 'closed') void context.close().catch(() => {}); };
  try {
    void context.resume().catch(stop);
    const now = context.currentTime;
    const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) {
      const time = i / context.sampleRate;
      const flutter = .55 + .2 * Math.sin(time * 7) + .15 * Math.sin(time * 19);
      samples[i] = (Math.random() * 2 - 1) * flutter;
    }
    const source = context.createBufferSource(); source.buffer = buffer;
    const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 800;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + duration * .27);
    gain.gain.linearRampToValueAtTime(volume * .72, now + duration * .64);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    source.connect(filter); filter.connect(gain); gain.connect(context.destination);
    source.onended = stop; source.start();
  } catch { stop(); }
  return stop;
}

