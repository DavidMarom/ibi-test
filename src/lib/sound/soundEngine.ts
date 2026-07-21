const MUTE_STORAGE_KEY = "dice-game-sound-muted";

let audioContext: AudioContext | null = null;

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioContextCtor =
    window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
  if (!AudioContextCtor) return null;

  if (!audioContext) {
    audioContext = new AudioContextCtor();
  }
  // Browsers can suspend the context until a user gesture resumes it —
  // every sound-triggering call site in this app already originates from a
  // button click, so this is safe to call unconditionally.
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

export function isSoundMuted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MUTE_STORAGE_KEY) === "true";
}

export function setSoundMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
}

interface ToneStep {
  frequency: number;
  duration: number;
  type?: OscillatorType;
}

function playTones(steps: ToneStep[]): void {
  if (isSoundMuted()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  let startTime = ctx.currentTime;
  for (const step of steps) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = step.type ?? "sine";
    oscillator.frequency.setValueAtTime(step.frequency, startTime);

    // Ramp gain up/down rather than jumping straight to/from silence —
    // avoids an audible click at the start/end of each tone.
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + step.duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + step.duration + 0.02);

    startTime += step.duration;
  }
}

export function playRollSound(): void {
  playTones([
    { frequency: 440, duration: 0.08 },
    { frequency: 550, duration: 0.08 },
  ]);
}

export function playHoldSound(): void {
  playTones([{ frequency: 660, duration: 0.14 }]);
}

export function playBustSound(): void {
  playTones([{ frequency: 180, duration: 0.28, type: "sawtooth" }]);
}

export function playWinSound(): void {
  playTones([
    { frequency: 523.25, duration: 0.12 },
    { frequency: 659.25, duration: 0.12 },
    { frequency: 783.99, duration: 0.22 },
  ]);
}
