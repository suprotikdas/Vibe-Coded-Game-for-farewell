/**
 * Web Audio API Synthesizer for high-quality, lightweight atmospheric 8-bit/16-bit game sound effects.
 * Fails gracefully if Web Audio is unsupported or blocked by autoplay policies.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const playSound = {
  /**
   * Classic retro laser sweep transition sound of a paper airplane catching the wind.
   * Utilizes an 8-bit square wave with dramatic rising filter sweep!
   */
  launch: () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "square";
      const now = ctx.currentTime;
      
      // Chiptune laser whoosh sweep
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.45);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.8);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {
      console.warn("Audio Context launch playback failed:", e);
    }
  },

  /**
   * Super cute, highly precise square-wave micro blip for flight sparkle trails
   */
  sparkle: () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "square";
      const now = ctx.currentTime;
      const pitch = 1350 + Math.random() * 500; // crystalline high register
      
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.setValueAtTime(pitch * 1.5, now + 0.04);

      gainNode.gain.setValueAtTime(0.03, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      // Ignore audio failure
    }
  },

  /**
   * Epic 8-bit level completion/room unlock major arpeggio fanfare chord sequence.
   * Plays a blazing fast, crisp chiptune melody!
   */
  unlock: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      // Energetic game arpeggio: C5 -> E5 -> G5 -> C6 -> E6 -> G6 -> C7
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = "square";
        const startTime = now + idx * 0.05; // rapid sequential notes
        
        osc.frequency.setValueAtTime(freq, startTime);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.06, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.22);
      });
    } catch (e) {
      console.warn("Audio Context unlock playback failed:", e);
    }
  },

  /**
   * Retro descending triangle bubble pop click sound
   */
  close: () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);

      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      // Ignore audio failure
    }
  },

  /**
   * Nostalgic 8-bit Coin "ping-ling!" sound trigger
   * Classic NES style dual note (B5 -> E6)
   */
  coin: () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = "square";
      osc.frequency.setValueAtTime(987.77, now); // B5 note
      osc.frequency.setValueAtTime(1318.51, now + 0.075); // E6 note

      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.setValueAtTime(0.08, now + 0.075);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      // Ignore audio failure
    }
  },

  /**
   * Short, crisp 8-bit UI tick sound when hovering or changing options
   */
  tick: () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = "square";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.setValueAtTime(220, now + 0.015);

      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      // Ignore audio failure
    }
  },

  /**
   * Retro 16-bit computer sweep/scramble randomized laser glisses
   */
  scramble: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Cascade 5 extremely fast randomized retro sweep square voices in quick succession
      for (let i = 0; i < 5; i++) {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "square";
        
        const startTime = now + i * 0.045;
        const notePitch = 300 + Math.random() * 850;
        
        osc.frequency.setValueAtTime(notePitch, startTime);
        osc.frequency.exponentialRampToValueAtTime(notePitch / 1.8, startTime + 0.07);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.05, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.07);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.07);
      }
    } catch (e) {
      // Ignore audio failure
    }
  },

  /**
   * Mechanical physical light switch toggle sound
   */
  toggleLight: () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(750, now + 0.035);

      gainNode.gain.setValueAtTime(0.07, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      // Ignore audio failure
    }
  }
};
