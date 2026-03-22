/**
 * Tactical sound design using Web Audio API.
 * All sounds are synthesized — no audio files needed.
 */

const STORAGE_KEY = 'sag-sounds-enabled';

let ctx: AudioContext | null = null;
let enabled = (() => {
  try { return localStorage.getItem(STORAGE_KEY) !== '0'; } catch { return true; }
})();

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function isSoundEnabled() { return enabled; }

export function toggleSound() {
  enabled = !enabled;
  try { localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0'); } catch { /* */ }
  if (enabled) playClick();
  return enabled;
}

function play(fn: (ctx: AudioContext, t: number) => void) {
  if (!enabled) return;
  try {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
    fn(c, c.currentTime);
  } catch { /* silence errors */ }
}

/** Short tactical click — button presses */
export function playClick() {
  play((c, t) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.03);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  });
}

/** Confirmation beep — save, success */
export function playSuccess() {
  play((c, t) => {
    [660, 880].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.1, t + i * 0.08 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.12);
      osc.connect(gain).connect(c.destination);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.12);
    });
  });
}

/** Warning tone — alerts */
export function playWarning() {
  play((c, t) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(220, t + 0.15);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}

/** Soft sweep — navigation transitions */
export function playNavigate() {
  play((c, t) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  });
}

/** Export/download confirmation */
export function playExport() {
  play((c, t) => {
    [523, 659, 784].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.07, t + i * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.15);
      osc.connect(gain).connect(c.destination);
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.15);
    });
  });
}

/** Subtle hover tick */
export function playHover() {
  play((c, t) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.02);
  });
}
