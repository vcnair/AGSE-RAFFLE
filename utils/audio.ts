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
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(volume * this.settings.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
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

    const playNote = (freq: number, start: number, duration: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2 * this.settings.volume, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };

    const now = this.ctx.currentTime;
    // Triumphant C-Major chord sequence
    playNote(261.63, now, 0.4);       // C4
    playNote(329.63, now + 0.1, 0.4); // E4
    playNote(392.00, now + 0.2, 0.4); // G4
    playNote(523.25, now + 0.3, 1.0); // C5
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
        const audio = this.customTickAudio.cloneNode() as HTMLAudioElement;
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
        const audio = this.customWinAudio.cloneNode() as HTMLAudioElement;
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
