class VitalsAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private activeOscillators: OscillatorNode[] = [];
  private beepInterval: number | undefined;
  private alarmInterval: number | undefined;

  constructor() {
    // Only initialize when unmuted to respect browser auto-play policies
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.initCtx();
    } else {
      this.stopAll();
    }
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }

  public stopAll() {
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // ignore already stopped
      }
    });
    this.activeOscillators = [];
    clearInterval(this.beepInterval);
    clearInterval(this.alarmInterval);
  }

  private playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.1) {
    if (this.isMuted || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    // Quick fade in to prevent clicking
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.01);
    
    // Quick fade out
    gainNode.gain.setValueAtTime(volume, this.ctx.currentTime + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);

    this.activeOscillators.push(osc);
    osc.onended = () => {
      this.activeOscillators = this.activeOscillators.filter(o => o !== osc);
    };
  }

  public playNormalBeep() {
    // Single short 880Hz tone
    this.playTone(880, 0.1, "sine", 0.05);
  }

  public startWarningAlarm() {
    this.stopAll();
    // Repeating two-tone pattern at 660hz and 880hz
    this.alarmInterval = window.setInterval(() => {
      this.playTone(660, 0.2, "sine", 0.08);
      setTimeout(() => this.playTone(880, 0.2, "sine", 0.08), 300);
    }, 1000);
  }

  public startCriticalAlarm() {
    this.stopAll();
    // Faster, louder repeating two-tone pattern
    this.alarmInterval = window.setInterval(() => {
      this.playTone(660, 0.15, "square", 0.05);
      setTimeout(() => this.playTone(880, 0.15, "square", 0.05), 200);
    }, 500);
  }

  public playFlatline() {
    this.stopAll();
    // Sustained 440Hz tone
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    osc.start();
    this.activeOscillators.push(osc);
  }
}

export const audioEngine = new VitalsAudioEngine();
