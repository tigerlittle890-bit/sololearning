let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return null;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(freq: number, dur = 0.12, type: OscillatorType = 'sine', gain = 0.05, delay = 0, enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(g);
    g.connect(ctx.destination);

    const t = ctx.currentTime + delay;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.start(t);
    osc.stop(t + dur + 0.03);
  } catch {
    // audio context silenced or not allowed
  }
}

export const sound = {
  click: (enabled = true) => playTone(640, 0.07, 'square', 0.028, 0, enabled),
  add: (enabled = true) => {
    playTone(720, 0.1, 'sine', 0.045, 0, enabled);
    playTone(1080, 0.14, 'sine', 0.04, 0.07, enabled);
  },
  done: (enabled = true) => {
    [660, 880, 1320].forEach((f, i) => playTone(f, 0.18, 'triangle', 0.05, i * 0.07, enabled));
  },
  level: (enabled = true) => {
    [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => playTone(f, 0.3, 'triangle', 0.06, i * 0.085, enabled));
  },
  error: (enabled = true) => {
    playTone(190, 0.18, 'sawtooth', 0.045, 0, enabled);
    playTone(120, 0.24, 'sawtooth', 0.04, 0.1, enabled);
  },
  log: (enabled = true) => {
    playTone(900, 0.06, 'square', 0.022, 0, enabled);
    playTone(1200, 0.08, 'square', 0.018, 0.05, enabled);
  },
  sync: (enabled = true) => {
    playTone(580, 0.09, 'sine', 0.03, 0, enabled);
    playTone(870, 0.12, 'triangle', 0.04, 0.06, enabled);
    playTone(1160, 0.15, 'sine', 0.04, 0.12, enabled);
  }
};
