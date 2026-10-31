export function playSolaceRelease(): () => void {
  let context: AudioContext;
  try { context = new AudioContext(); } catch { return () => {}; }
  const stop = () => { if (context.state !== 'closed') void context.close().catch(() => {}); };
  try {
    void context.resume().catch(stop);
    const duration = 9;
    const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
    const data = buffer.getChannelData(0);
    let sample = 0;
    for (let i = 0; i < data.length; i++) {
      if (i % 12 === 0) sample = Math.round((Math.random() * 2 - 1) * 7) / 7;
      const time = i / context.sampleRate;
      const gate = Math.sin(time * 23) > .2 ? 1 : .12;
      data[i] = sample * gate;
    }
    const noise = context.createBufferSource(); noise.buffer = buffer;
    const filter = context.createBiquadFilter(); filter.type = 'bandpass'; filter.Q.value = .8;
    const now = context.currentTime;
    filter.frequency.setValueAtTime(230, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 6);
    filter.frequency.exponentialRampToValueAtTime(180, now + duration);
    const master = context.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(.1, now + 1.2);
    master.gain.linearRampToValueAtTime(.075, now + 6.5);
    master.gain.linearRampToValueAtTime(0, now + duration);
    const drone = context.createOscillator(); drone.type = 'triangle';
    drone.frequency.setValueAtTime(55, now);
    drone.frequency.linearRampToValueAtTime(42, now + duration);
    const droneGain = context.createGain(); droneGain.gain.value = .3;
    noise.connect(filter); filter.connect(master);
    drone.connect(droneGain); droneGain.connect(master); master.connect(context.destination);
    noise.start(); drone.start(); drone.stop(now + duration);
    noise.onended = stop;
  } catch { stop(); }
  return stop;
}
