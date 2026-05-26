// Web Audio Chess Sound Synthesizer
// Synthesizes premium, realistic chess sounds entirely in the browser.

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
};

// Make sure context is running (browsers block autoplay until interaction)
const resumeContext = async (ctx: AudioContext) => {
  if (ctx.state === 'suspended') {
    await ctx.resume().catch((err) => console.log('AudioContext resume failed:', err));
  }
};

export const playChessSound = async (type: 'move' | 'capture' | 'castle' | 'check' | 'gameover') => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    await resumeContext(ctx);

    const now = ctx.currentTime;

    switch (type) {
      case 'move': {
        // Warm, wooden "plop" sound of a chess piece
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        // Fast pitch slide down (simulating piece impact)
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.08);

        // Low pass filter to make it sound warm and woody
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.08);

        // Volume envelope
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }

      case 'capture': {
        // Sharp, snappy wood capture click mixed with a high frequency burst
        const osc = ctx.createOscillator();
        const noise = ctx.createOscillator(); // detuned alternative for white noise
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);

        // Subtly detuned oscillator to create a crisp "crushing" impact noise
        noise.type = 'sawtooth';
        noise.frequency.setValueAtTime(1500, now);
        noise.frequency.exponentialRampToValueAtTime(100, now + 0.03);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, now);

        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.setValueAtTime(0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gainNode);
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.07);
        noise.stop(now + 0.04);
        break;
      }

      case 'castle': {
        // Castle is a double move sound! King moving, then Rook sliding in.
        // We synthesize a move, and schedule another one slightly later.
        const playOneMove = (delay: number, pitchOffset: number) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(170 + pitchOffset, now + delay);
          osc.frequency.exponentialRampToValueAtTime(70 + pitchOffset, now + delay + 0.07);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(300, now + delay);

          gainNode.gain.setValueAtTime(0.2, now + delay);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);

          osc.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(now + delay);
          osc.stop(now + delay + 0.08);
        };

        // First click (king)
        playOneMove(0, 0);
        // Second click (rook, slightly higher pitch and 110ms later)
        playOneMove(0.11, 20);
        break;
      }

      case 'check': {
        // High-pitched detuned alert chime to signify danger
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(520, now);
        osc1.frequency.linearRampToValueAtTime(580, now + 0.15);

        // Detuned sibling for bell-like thickness
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(524, now);
        osc2.frequency.linearRampToValueAtTime(584, now + 0.15);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.19);
        osc2.stop(now + 0.19);
        break;
      }

      case 'gameover': {
        // Somber or rich descending major-minor triad chord
        const notes = [220, 277.18, 329.63, 440]; // A3, C#4, E4, A4
        const oscillators: OscillatorNode[] = [];
        const gainNode = ctx.createGain();

        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.25, now + 0.05); // Smooth attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2); // Slow decay

        notes.forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.linearRampToValueAtTime(freq * 0.98, now + 1.2); // Very subtle pitch drop
          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 1.3);
          oscillators.push(osc);
        });

        gainNode.connect(ctx.destination);
        break;
      }
    }
  } catch (error) {
    console.error('Failed to play synthesized sound:', error);
  }
};
