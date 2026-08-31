/**
 * Web Audio API Acoustic Dispatcher & Emergency SOS Whistle Generator
 * Completely offline capable, zero external MP3 dependencies.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (err) {
    return null;
  }
}

/**
 * Plays emergency notification chime
 */
export function playAlertChime(severity: 'info' | 'warning' | 'critical' = 'warning') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (severity === 'critical') {
      // Urgent dual-tone pulse
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(1174.66, now + 0.12); // D6
      osc.frequency.setValueAtTime(880, now + 0.24);
      osc.frequency.setValueAtTime(1174.66, now + 0.36);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.start(now);
      osc.stop(now + 0.6);
    } else if (severity === 'warning') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    // Audio policy muted
  }
}

let sosInterval: any = null;

/**
 * Emergency SOS Acoustic Transmitter (Repeated high decibel whistle)
 */
export function startSosBeacon(onStateChange?: (active: boolean) => void) {
  if (sosInterval) {
    stopSosBeacon();
    if (onStateChange) onStateChange(false);
    return false;
  }

  const ctx = getAudioContext();
  if (!ctx) return false;

  const playBeep = (freq: number, duration: number) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  };

  // Standard Morse SOS pattern (... --- ...)
  let step = 0;
  const runSosPattern = () => {
    // 3 short, 3 long, 3 short
    if (step < 3 || step >= 6) {
      playBeep(2400, 0.15); // High piercing short beep
    } else {
      playBeep(2400, 0.45); // High piercing long beep
    }
    step = (step + 1) % 9;
  };

  runSosPattern();
  sosInterval = setInterval(runSosPattern, 400);
  if (onStateChange) onStateChange(true);
  return true;
}

export function stopSosBeacon() {
  if (sosInterval) {
    clearInterval(sosInterval);
    sosInterval = null;
  }
}

export function isSosActive(): boolean {
  return sosInterval !== null;
}
