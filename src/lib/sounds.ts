

class SoundManager {
    private audioContext: AudioContext | null = null;
    private isMuted: boolean = false;

    constructor() {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    private initContext() {
        if (this.audioContext?.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    // Synthesize sounds using oscillators to avoid external assets
    play(type: 'click' | 'success' | 'delete' | 'error' | 'levelUp') {
        if (this.isMuted || !this.audioContext) return;
        this.initContext();

        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (type) {
            case 'click':
                // High, short blip
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;

            case 'success':
                // Upward pleasant chime
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now); // A4
                osc.frequency.setValueAtTime(554.37, now + 0.1); // C#5
                osc.frequency.setValueAtTime(659.25, now + 0.2); // E5

                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.linearRampToValueAtTime(0.1, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

                osc.start(now);
                osc.stop(now + 0.6);

                // Add a second harmonic for richness
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(880, now);
                gain2.gain.setValueAtTime(0.02, now);
                gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc2.start(now);
                osc2.stop(now + 0.4);
                break;

            case 'delete':
                // Low, quick thud
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'error':
                // Buzz
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.2);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;

            case 'levelUp':
                // Fanfare-ish
                osc.type = 'triangle';
                // Arpeggio
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(554, now + 0.1);
                osc.frequency.setValueAtTime(659, now + 0.2);
                osc.frequency.setValueAtTime(880, now + 0.3);

                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.setValueAtTime(0.1, now + 0.3);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

                osc.start(now);
                osc.stop(now + 1.5);
                break;
        }
    }
}

export const soundManager = new SoundManager();

export const playSound = (type: 'click' | 'success' | 'delete' | 'error' | 'levelUp') => {
    soundManager.play(type);
};
