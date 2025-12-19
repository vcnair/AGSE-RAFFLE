export type AudioMode = 'procedural' | 'classic' | 'custom' | 'silent';

export interface AudioSettings {
  mode: AudioMode;
  volume: number;
  customTickUrl?: string;
  customWinUrl?: string;
}

const AUDIO_SETTINGS_KEY = 'agse_raffle_audio_settings';

class RaffleAudio {
  private ctx: AudioContext | null = null;
  private settings: AudioSettings = {
    mode: 'procedural',
    volume: 1.0
  };
  private customTickAudio: HTMLAudioElement | null = null;
  private customWinAudio: HTMLAudioElement | null = null;

  constructor() {
    this.loadSettings();
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
        this.loadCustomAudio();
      }
    } catch (e) {
      console.error('Failed to load audio settings:', e);
    }
  }

  public saveSettings(settings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(this.settings));
    this.loadCustomAudio();
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  private loadCustomAudio() {
    // Clean up previous Audio objects
    if (this.customTickAudio) {
      this.customTickAudio.pause();
      this.customTickAudio.src = '';
      this.customTickAudio = null;
    }
    if (this.customWinAudio) {
      this.customWinAudio.pause();
      this.customWinAudio.src = '';
      this.customWinAudio = null;
    }
    
    // Create new Audio objects
    if (this.settings.customTickUrl) {
      this.customTickAudio = new Audio(this.settings.customTickUrl);
      this.customTickAudio.volume = this.settings.volume;
    }
    if (this.settings.customWinUrl) {
      this.customWinAudio = new Audio(this.settings.customWinUrl);
      this.customWinAudio.volume = this.settings.volume;
    }
  }

  private playProceduralTick(volume = 0.1) {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const duration = 0.08;
    
    // Create a filter for shaping the sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + duration);
    filter.Q.setValueAtTime(2, now);
    
    // Main oscillator - sine wave for smoothness
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1200, now);
    osc1.frequency.exponentialRampToValueAtTime(600, now + duration);
    
    // ADSR envelope for main oscillator
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(volume * this.settings.volume * 0.4, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    // Harmonic layer - triangle wave for richness
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2400, now);
    osc2.frequency.exponentialRampToValueAtTime(1200, now + duration);
    
    // Softer envelope for harmonic
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(volume * this.settings.volume * 0.15, now + 0.005);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    // Sub-bass layer for depth
    const osc3 = this.ctx.createOscillator();
    const gain3 = this.ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(400, now);
    osc3.frequency.exponentialRampToValueAtTime(200, now + duration);
    
    gain3.gain.setValueAtTime(0, now);
    gain3.gain.linearRampToValueAtTime(volume * this.settings.volume * 0.2, now + 0.008);
    gain3.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    // Connect everything
    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);
    gain1.connect(filter);
    gain2.connect(filter);
    gain3.connect(this.ctx.destination); // Bass bypasses filter
    filter.connect(this.ctx.destination);
    
    // Start and stop all oscillators
    [osc1, osc2, osc3].forEach(osc => {
      osc.start(now);
      osc.stop(now + duration);
    });
  }

  private playClassicTick(volume = 0.1) {
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume * this.settings.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  private playProceduralWin() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Helper to create a rich note with multiple oscillators
    const playRichNote = (baseFreq: number, start: number, duration: number, volumeMult = 1) => {
      // Main melody oscillator
      const osc1 = this.ctx!.createOscillator();
      const gain1 = this.ctx!.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, start);
      
      gain1.gain.setValueAtTime(0, start);
      gain1.gain.linearRampToValueAtTime(0.15 * this.settings.volume * volumeMult, start + 0.02);
      gain1.gain.linearRampToValueAtTime(0.12 * this.settings.volume * volumeMult, start + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.01, start + duration);
      
      // Harmonic layer (slightly detuned for warmth)
      const osc2 = this.ctx!.createOscillator();
      const gain2 = this.ctx!.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 1.005, start); // Slight detune
      
      gain2.gain.setValueAtTime(0, start);
      gain2.gain.linearRampToValueAtTime(0.08 * this.settings.volume * volumeMult, start + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.01, start + duration);
      
      // Sparkle layer (octave higher)
      const osc3 = this.ctx!.createOscillator();
      const gain3 = this.ctx!.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(baseFreq * 2, start);
      
      gain3.gain.setValueAtTime(0, start);
      gain3.gain.linearRampToValueAtTime(0.06 * this.settings.volume * volumeMult, start + 0.01);
      gain3.gain.exponentialRampToValueAtTime(0.01, start + duration * 0.7);
      
      // Connect all
      osc1.connect(gain1).connect(this.ctx!.destination);
      osc2.connect(gain2).connect(this.ctx!.destination);
      osc3.connect(gain3).connect(this.ctx!.destination);
      
      [osc1, osc2, osc3].forEach(osc => {
        osc.start(start);
        osc.stop(start + duration);
      });
    };
    
    // Helper for bass notes
    const playBass = (freq: number, start: number, duration: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12 * this.settings.volume, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      
      osc.connect(gain).connect(this.ctx!.destination);
      osc.start(start);
      osc.stop(start + duration);
    };
    
    // Bass foundation
    playBass(130.81, now, 0.5);        // C3
    playBass(130.81, now + 0.3, 0.7);  // C3 (sustained)
    
    // Rising arpeggio with rich harmonics
    playRichNote(261.63, now, 0.3, 0.9);         // C4
    playRichNote(329.63, now + 0.08, 0.35, 0.95); // E4
    playRichNote(392.00, now + 0.16, 0.4, 1.0);   // G4
    playRichNote(523.25, now + 0.24, 0.5, 1.05);  // C5
    playRichNote(659.25, now + 0.32, 0.6, 1.1);   // E5
    
    // Final triumphant chord (starts at 0.4s)
    playRichNote(523.25, now + 0.4, 0.9, 1.0);   // C5
    playRichNote(659.25, now + 0.42, 0.88, 0.95); // E5
    playRichNote(783.99, now + 0.44, 0.86, 0.9);  // G5
    
    // High sparkle cascade for excitement
    const sparkleFreqs = [1046.50, 1318.51, 1568.00, 2093.00]; // C6, E6, G6, C7
    sparkleFreqs.forEach((freq, i) => {
      const start = now + 0.5 + (i * 0.06);
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.05 * this.settings.volume, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);
      
      osc.connect(gain).connect(this.ctx!.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  private playClassicWin() {
    this.init();
    if (!this.ctx) return;

    const playNote = (freq: number, start: number, duration: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3 * this.settings.volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };

    const now = this.ctx.currentTime;
    // Classic arcade-style fanfare
    playNote(523.25, now, 0.15);        // C5
    playNote(659.25, now + 0.15, 0.15); // E5
    playNote(783.99, now + 0.3, 0.3);   // G5
    playNote(1046.50, now + 0.6, 0.6);  // C6
  }

  public async playTick(volume = 0.1) {
    if (this.settings.mode === 'silent') return;

    if (this.settings.mode === 'custom' && this.customTickAudio) {
      try {
        const audio = new Audio(this.customTickAudio.src);
        audio.volume = volume * this.settings.volume;
        await audio.play();
      } catch (e) {
        console.warn('Custom tick audio failed, falling back to procedural:', e);
        this.playProceduralTick(volume);
      }
    } else if (this.settings.mode === 'classic') {
      this.playClassicTick(volume);
    } else {
      this.playProceduralTick(volume);
    }
  }

  public async playWin() {
    if (this.settings.mode === 'silent') return;

    if (this.settings.mode === 'custom' && this.customWinAudio) {
      try {
        const audio = new Audio(this.customWinAudio.src);
        audio.volume = this.settings.volume;
        await audio.play();
      } catch (e) {
        console.warn('Custom win audio failed, falling back to procedural:', e);
        this.playProceduralWin();
      }
    } else if (this.settings.mode === 'classic') {
      this.playClassicWin();
    } else {
      this.playProceduralWin();
    }
  }
}

export const audioManager = new RaffleAudio();
