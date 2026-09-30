const NOTES = [880, 1108.73, 1318.51];
const NOTE_DURATION = 0.28;
const NOTE_GAP = 0.22;

let audioContext = null;

const getContext = () => {
  if (audioContext) return audioContext;

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return null;

  audioContext = new AudioContextClass();
  return audioContext;
};

export const unlockAudio = () => {
  const context = getContext();
  if (context && context.state === "suspended") {
    context.resume().catch(() => {});
  }
};

export const playReminderSound = () => {
  const context = getContext();
  if (!context) return;

  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }

  const startAt = context.currentTime;

  NOTES.forEach((frequency, index) => {
    const at = startAt + index * NOTE_GAP;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, at);

    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.25, at + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + NOTE_DURATION);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(at);
    oscillator.stop(at + NOTE_DURATION);
  });
};
