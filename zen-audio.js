/**
 * zen-audio.js
 * 100% Procedural Web Audio Soundscape Engine
 * Zero external audio assets, zero latency, lightweight synthesized acoustics.
 * 
 * Features:
 * - Babbling brook stream (procedural pink noise & resonant bandpass)
 * - Bamboo water fountain clack (Shishi-Odoshi hollow wooden resonance)
 * - Tibetan meditation singing bowl (432Hz harmonic chime)
 * - Water droplet feeding bloop
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ZenAudioEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  class ZenAudioEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.ambientGain = null;
      this.isMuted = false;
      this.masterVolume = 0.20;
      this.isAmbientActive = false;
      this.streamSource = null;
      this.shishiOdoshiTimer = null;
      this.isInitialized = false;

      this.loadPreferences();
    }

    loadPreferences() {
      try {
        if (typeof localStorage !== 'undefined') {
          const savedVol = localStorage.getItem('jlpt_zen_volume');
          if (savedVol !== null) this.masterVolume = Math.max(0, Math.min(1, parseFloat(savedVol)));

          const savedMute = localStorage.getItem('jlpt_zen_muted');
          if (savedMute !== null) this.isMuted = savedMute === 'true';

          // Ambient music disabled by user preference
          this.isAmbientActive = false;
        }
      } catch (e) {
        // Fallback to defaults
      }
    }

    savePreferences() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('jlpt_zen_volume', this.masterVolume.toString());
          localStorage.setItem('jlpt_zen_muted', this.isMuted.toString());
          localStorage.setItem('jlpt_zen_ambient', 'false');
        }
      } catch (e) {}
    }

    init() {
      if (this.isInitialized) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0;
      this.ambientGain.connect(this.masterGain);

      // Background ambient stream and repeating music loops removed as requested
      this.isInitialized = true;
    }

    ensureContext() {
      if (!this.isInitialized) {
        this.init();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    // -------------------------------------------------------------
    // Procedural Babbling Brook Stream (Removed)
    // -------------------------------------------------------------
    initStreamSynthesizer() {
      // Continuous stream music disabled per user request
    }

    // -------------------------------------------------------------
    // Bamboo Water Fountain (Shishi-Odoshi Clack)
    // -------------------------------------------------------------
    playShishiOdoshi() {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Woody dual harmonics
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(80, now + 0.075);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(410, now);
      osc2.frequency.exponentialRampToValueAtTime(140, now + 0.065);

      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.085);
      osc2.stop(now + 0.085);
    }

    startShishiOdoshiLoop() {
      // Background repeating music loop disabled per user request
    }

    // -------------------------------------------------------------
    // Meditation Singing Bowl Chime (Milestones & Completion)
    // -------------------------------------------------------------
    playSingingBowl(baseFreq = 432) {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      const harmonics = [1, 2.01, 3.02, 4.04];
      const gains = [0.45, 0.22, 0.12, 0.06];

      harmonics.forEach((ratio, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * ratio, now);

        gain.gain.setValueAtTime(gains[idx], now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 3.85);
      });
    }

    // -------------------------------------------------------------
    // Feeding Droplet "Bloop" (Feeding Interaction)
    // -------------------------------------------------------------
    playBloop() {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(1380, now + 0.07);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.085);
    }

    // -------------------------------------------------------------
    // Master Controls
    // -------------------------------------------------------------
    setVolume(val) {
      this.masterVolume = Math.max(0, Math.min(1, val));
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx ? this.ctx.currentTime : 0);
      }
      this.savePreferences();
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx ? this.ctx.currentTime : 0);
      }
      this.savePreferences();
      return this.isMuted;
    }

    toggleAmbient() {
      this.isAmbientActive = !this.isAmbientActive;
      if (this.ambientGain) {
        this.ambientGain.gain.setValueAtTime(this.isAmbientActive ? 0.35 : 0, this.ctx ? this.ctx.currentTime : 0);
      }
      this.savePreferences();
      return this.isAmbientActive;
    }
  }

  return ZenAudioEngine;
}));
