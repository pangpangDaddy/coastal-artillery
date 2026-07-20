// Procedural WebAudio sound effects — no audio assets needed.
export class Sound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  muted = false;

  private ensure(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.35;
        this.master.connect(this.ctx.destination);
      } catch { return null; }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  private noise(ctx: AudioContext, dur: number, filterFreq: number, gain: number, type: BiquadFilterType = 'lowpass') {
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = filterFreq;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(this.master!);
    src.start();
  }

  private tone(ctx: AudioContext, freq: number, dur: number, gain: number, type: OscillatorType = 'sine', slide = 0) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), ctx.currentTime + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(this.master!);
    o.start();
    o.stop(ctx.currentTime + dur);
  }

  fire(heavy = false) {
    const ctx = this.ensure(); if (!ctx) return;
    this.noise(ctx, heavy ? 0.35 : 0.15, heavy ? 500 : 900, heavy ? 0.8 : 0.4);
    this.tone(ctx, heavy ? 70 : 120, 0.2, 0.3, 'sine', -40);
  }

  mg() {
    const ctx = this.ensure(); if (!ctx) return;
    this.noise(ctx, 0.06, 1800, 0.18, 'highpass');
  }

  explosion(big = false) {
    const ctx = this.ensure(); if (!ctx) return;
    this.noise(ctx, big ? 0.9 : 0.5, big ? 300 : 420, big ? 1 : 0.6);
    this.tone(ctx, big ? 45 : 60, big ? 0.7 : 0.4, 0.5, 'sine', -25);
  }

  splash() {
    const ctx = this.ensure(); if (!ctx) return;
    this.noise(ctx, 0.25, 1200, 0.15);
  }

  click() {
    const ctx = this.ensure(); if (!ctx) return;
    this.tone(ctx, 800, 0.05, 0.15, 'square');
  }

  alarm() {
    const ctx = this.ensure(); if (!ctx) return;
    this.tone(ctx, 520, 0.16, 0.2, 'square');
  }

  launch() {
    const ctx = this.ensure(); if (!ctx) return;
    this.noise(ctx, 0.4, 2000, 0.2, 'bandpass');
    this.tone(ctx, 200, 0.35, 0.15, 'sawtooth', 260);
  }

  win() {
    const ctx = this.ensure(); if (!ctx) return;
    [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.tone(ctx, f, 0.25, 0.25, 'triangle'), i * 130));
  }

  lose() {
    const ctx = this.ensure(); if (!ctx) return;
    [330, 262, 196, 131].forEach((f, i) => setTimeout(() => this.tone(ctx, f, 0.3, 0.25, 'triangle'), i * 160));
  }
}
