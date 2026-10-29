import { LIBRARY_AUDIO } from './libraryAudioAssets.ts';

type Sound = keyof typeof LIBRARY_AUDIO;
type HunterPosition = { right: number; up: number; ahead: number; occluded: boolean };
export function hunterAcoustics(distance: number, floorGap: number, occluded: boolean) {
  const muffled = occluded || floorGap > 1;
  return { volume: (0.09 + 0.15 / (1 + (Math.max(0, distance) / 12) ** 2)) * (muffled ? 0.8 : 1),
    cutoff: muffled ? 900 : 5000 / (1 + Math.max(0, distance) / 70) };
}
export class LibraryAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers = new Map<Sound, AudioBuffer>();
  private voices = new Set<AudioBufferSourceNode>();
  private hunterMix = { ...hunterAcoustics(100, 0, false), right: 0, up: 0, ahead: 1 };
  private roars = new Set<{ gain: GainNode; filter: BiquadFilterNode; panner: PannerNode }>();
  private abort = new AbortController();
  private disposed = false;
  private growlIn = 7;
  private nearIn = 5;
  private humanStride = 0;
  private dogStride = 0;
  private lastGrowl = -1;
  private enabled: () => boolean;
  constructor(enabled: () => boolean) { this.enabled = enabled; }

  // Called from Begin / sound toggle so the browser can unlock audio.
  start() {
    if (this.disposed || !this.enabled()) return;
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain(); this.master.gain.value = 0.7;
        const limiter = this.ctx.createDynamicsCompressor();
        limiter.threshold.value = -12; limiter.ratio.value = 8;
        this.master.connect(limiter).connect(this.ctx.destination);
        const ctx = this.ctx;
        for (const [key, url] of Object.entries(LIBRARY_AUDIO)) {
          void fetch(url, { signal: this.abort.signal }).then(r => {
            if (!r.ok) throw new Error('Audio unavailable');
            return r.arrayBuffer();
          }).then(bytes => ctx.decodeAudioData(bytes)).then(buffer => {
            if (this.disposed) return;
            // The supplied human footsteps are much quieter than the growls.
            let peak = 0;
            for (let c = 0; c < buffer.numberOfChannels; c++) for (const sample of buffer.getChannelData(c)) peak = Math.max(peak, Math.abs(sample));
            const scale = peak > 0 ? Math.min(24, 0.75 / peak) : 1;
            for (let c = 0; c < buffer.numberOfChannels; c++) {
              const samples = buffer.getChannelData(c);
              for (let i = 0; i < samples.length; i++) samples[i] *= scale;
            }
            this.buffers.set(key as Sound, buffer);
          }).catch(() => { /* Missing audio must never block the game. */ });
        }
      }
      void this.ctx.resume().catch(() => {});
    } catch { /* Silent gameplay still works without Web Audio. */ }
  }

  play(key: Sound, volume: number, pan = 0, rate = 1, delay = 0) {
    const ctx = this.ctx, buffer = this.buffers.get(key);
    if (!ctx || !buffer || !this.master || this.disposed || !this.enabled() || this.voices.size >= 12) return;
    const source = ctx.createBufferSource(), gain = ctx.createGain(), stereo = ctx.createStereoPanner();
    source.buffer = buffer; source.playbackRate.value = rate;
    stereo.pan.value = Math.max(-1, Math.min(1, pan));
    const at = ctx.currentTime + delay, duration = Math.min(2.8 - delay, buffer.duration / rate);
    const spatial = key.startsWith('growl');
    gain.gain.setValueAtTime(spatial ? this.hunterMix.volume : volume, at);
    const envelope = spatial ? ctx.createGain() : gain;
    envelope.gain.setValueAtTime(spatial ? 1 : volume, at);
    envelope.gain.setValueAtTime(spatial ? 1 : volume, at + Math.max(0, duration - 0.12));
    envelope.gain.linearRampToValueAtTime(0, at + duration);
    let roar: { gain: GainNode; filter: BiquadFilterNode; panner: PannerNode } | undefined;
    if (spatial) {
      const filter = ctx.createBiquadFilter(), panner = ctx.createPanner();
      filter.type = 'lowpass'; filter.Q.value = 0.7; filter.frequency.value = this.hunterMix.cutoff;
      panner.panningModel = 'HRTF'; panner.rolloffFactor = 0;
      panner.positionX.value = this.hunterMix.right; panner.positionY.value = this.hunterMix.up; panner.positionZ.value = -this.hunterMix.ahead;
      source.connect(envelope).connect(gain).connect(filter).connect(panner).connect(this.master);
      roar = { gain, filter, panner }; this.roars.add(roar);
    } else source.connect(gain).connect(stereo).connect(this.master);
    this.voices.add(source);
    source.onended = () => { if (roar) { this.roars.delete(roar); roar.filter.disconnect(); roar.panner.disconnect(); } this.voices.delete(source); source.disconnect(); envelope.disconnect(); gain.disconnect(); stereo.disconnect(); };
    source.start(at); source.stop(at + duration);
  }

  update(dt: number, humanTravel: number, dogTravel: number, distance: number, floorGap: number, pan: number, sprint: boolean, hunter?: HunterPosition) {
    if (!this.enabled()) { this.stop(); return; }
    this.hunterMix = { ...hunterAcoustics(distance, floorGap, hunter?.occluded ?? false),
      right: hunter?.right ?? pan * distance, up: hunter?.up ?? floorGap, ahead: hunter?.ahead ?? Math.sqrt(Math.max(0, 1 - pan * pan)) * distance };
    if (this.ctx) for (const roar of this.roars) {
      const at = this.ctx.currentTime;
      // Follow player turns and hunter movement without sudden volume changes.
      roar.gain.gain.setTargetAtTime(this.hunterMix.volume, at, 0.08);
      roar.filter.frequency.setTargetAtTime(this.hunterMix.cutoff, at, 0.12);
      roar.panner.positionX.setTargetAtTime(this.hunterMix.right, at, 0.05);
      roar.panner.positionY.setTargetAtTime(this.hunterMix.up, at, 0.05);
      roar.panner.positionZ.setTargetAtTime(-this.hunterMix.ahead, at, 0.05);
    }
    this.growlIn -= dt; this.nearIn -= dt;
    if (this.growlIn <= 0) {
      // Vary the recording while positioning it at the hunter.
      const next = (this.lastGrowl + 1 + Math.floor(Math.random() * 3)) % 4;
      this.lastGrowl = next; this.play((['growl1', 'growl2', 'growl3', 'growl4'] as const)[next], this.hunterMix.volume, pan);
      this.growlIn = 12 + Math.random() * 14;
    }
    if (distance < 9 && floorGap < 1 && this.nearIn <= 0) {
      this.play('near', 0.28, pan * 0.6); this.nearIn = 12 + Math.random() * 12;
    }
    this.humanStride = humanTravel > 0.001 ? this.humanStride + humanTravel : 0;
    this.dogStride = dogTravel > 0.001 ? this.dogStride + dogTravel : 0;
    const humanStep = sprint ? 1.55 : 1.15;
    if (this.humanStride >= humanStep) { this.humanStride %= humanStep; this.play('humanStep', 0.035, 0, sprint ? 1 : 0.85); }
    if (this.dogStride >= 1.25) {
      this.dogStride %= 1.25;
      if (distance < 22) this.play('dogStep', 0.055 * Math.max(0, 1 - distance / 22) * (floorGap > 1 ? 0.25 : 1), pan, 0.9);
    }
  }

  caught() {
    this.stop();
    // Five quiet, staggered pitches around the listener create the whisper chorus.
    for (const [delay, rate, pan, volume] of [[0, 1, 0, 0.25], [0.12, 0.82, -0.8, 0.12], [0.26, 1.13, 0.8, 0.12], [0.48, 0.92, -0.4, 0.09], [0.7, 1.06, 0.4, 0.09]]) {
      this.play('caught', volume, pan, rate, delay);
    }
  }
  stop() { for (const voice of this.voices) { try { voice.stop(); } catch { /* Already ended. */ } } this.voices.clear(); this.roars.clear(); }
  reset() { this.stop(); this.humanStride = 0; this.dogStride = 0; this.growlIn = 7 + Math.random() * 5; this.nearIn = 5; }
  dispose() { this.disposed = true; this.abort.abort(); this.stop(); this.buffers.clear(); void this.ctx?.close().catch(() => {}); }
}
