/**
 * Senior-Friendly Voice TTS & Sound Effects Helper
 */

let cachedVoices: SpeechSynthesisVoice[] = [];

// Initialize voices
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const updateVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  updateVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }
}

export function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (!cachedVoices.length) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  
  // Prefer natural US/UK English voices
  const preferred = cachedVoices.find(
    (v) => (v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Ava') || v.name.includes('Karen'))
  );
  if (preferred) return preferred;

  return cachedVoices.find((v) => v.lang.startsWith('en')) || null;
}

interface SpeakOptions {
  rate?: number; // default 0.8 for senior clarity
  pitch?: number;
  repeatTimes?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let repeatTimeoutId: any = null;

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (repeatTimeoutId) {
      clearTimeout(repeatTimeoutId);
      repeatTimeoutId = null;
    }
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function speakEnglish(
  text: string,
  options: SpeakOptions = {}
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    stopSpeaking();

    const rate = options.rate ?? 0.8;
    const repeatTimes = options.repeatTimes ?? 1;
    let currentRepeat = 0;

    const playOnce = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate; // 0.8 is crystal clear and relaxed for seniors
      utterance.pitch = options.pitch ?? 1.0;

      const voice = getEnglishVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        if (currentRepeat === 0 && options.onStart) {
          options.onStart();
        }
      };

      utterance.onend = () => {
        currentRepeat++;
        if (currentRepeat < repeatTimes) {
          repeatTimeoutId = setTimeout(() => {
            playOnce();
          }, 600); // comfortable 600ms pause between repeats
        } else {
          activeUtterance = null;
          if (options.onEnd) options.onEnd();
          resolve();
        }
      };

      utterance.onerror = () => {
        activeUtterance = null;
        if (options.onEnd) options.onEnd();
        resolve();
      };

      activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    };

    playOnce();
  });
}

// Gentle Web Audio feedback sounds (cheerful ding-dong, gentle click, encouragement)
export function playSound(type: 'correct' | 'try-again' | 'click' | 'cheer') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'correct') {
      // Pleasant two-tone "Ding-Dong!" (E5 -> G#5)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc1.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      setTimeout(() => {
        try {
          const now2 = ctx.currentTime;
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(830.61, now2); // G#5
          const gain2 = ctx.createGain();
          gain2.gain.setValueAtTime(0.2, now2);
          gain2.gain.exponentialRampToValueAtTime(0.01, now2 + 0.5);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(now2);
          osc2.stop(now2 + 0.5);
        } catch {}
      }, 150);
    } else if (type === 'try-again') {
      // Gentle encouraging soft double hum
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(392, now + 0.15); // G4
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'click') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'cheer') {
      // Fanfare arpeggio (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.4);
          } catch {}
        }, idx * 110);
      });
    }
  } catch (e) {
    // Graceful fallback if audio context blocked
  }
}
