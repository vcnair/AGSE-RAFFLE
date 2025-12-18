
class RaffleAudio {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public async playTick(volume = 0.1) {
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public async playWin() {
    this.init();
    if (!this.ctx) return;

    const playNote = (freq: number, start: number, duration: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
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
}

export const audioManager = new RaffleAudio();
