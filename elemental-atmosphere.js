/**
 * ============================================================================
 * JLPT N4 Study Studio — Elemental Atmosphere Engine
 * High-Vibrancy Animated Canvas Particle & Fluid Simulation for 5 Elements:
 * - Spirit / Void (Vocabulary - 語彙): Sumi-e Ink Smoke & Mystical Spirit Wisps
 * - Earth / Stone (Kanji - 漢字): Levitating Amber Crystals, Seismic Strata & Dust
 * - Air / Gale (Grammar - 文法): Swirling Vortex Currents & Aerodynamic Gale Wisps
 * - Water / Tide (Listening - 聴解): Undulating Ocean Waves & Buoyant Rising Droplets
 * - Fire / Blaze (Reading - 読解): Ascending Embers, Heat Distortion & Solar Flares
 * ============================================================================
 */

(function () {
  'use strict';

  class ElementalAtmosphere {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d', { alpha: true });
      this.width = 0;
      this.height = 0;
      this.particles = [];
      this.maxParticles = 120;
      
      // Theme State
      this.currentTheme = 'spirit'; // 'spirit' | 'earth' | 'air' | 'water' | 'fire'
      this.targetTheme = 'spirit';
      this.themeTransition = 1.0;
      
      // Interactive mouse deflection & wake
      this.mouseX = -1000;
      this.mouseY = -1000;
      this.mouseActive = false;
      this.mouseTrail = [];

      // Time & Animation
      this.lastTimestamp = performance.now();
      this.isRunning = false;
      this.animId = null;

      // Element Theme Configs (High Vibrancy)
      this.THEMES = {
        spirit: {
          name: 'Spirit & Void',
          primary: '#a855f7',
          secondary: '#6366f1',
          accent: '#c084fc',
          bgGlow: 'rgba(168, 85, 247, 0.22)',
          colors: ['#a855f7', '#c084fc', '#818cf8', '#e9d5ff', '#ffffff']
        },
        earth: {
          name: 'Earth & Stone',
          primary: '#f59e0b',
          secondary: '#d97706',
          accent: '#fbbf24',
          bgGlow: 'rgba(245, 158, 11, 0.22)',
          colors: ['#f59e0b', '#fbbf24', '#d97706', '#fef3c7', '#ffffff']
        },
        air: {
          name: 'Air & Gale',
          primary: '#3b82f6',
          secondary: '#0284c7',
          accent: '#60a5fa',
          bgGlow: 'rgba(59, 130, 246, 0.22)',
          colors: ['#3b82f6', '#60a5fa', '#38bdf8', '#dbeafe', '#ffffff']
        },
        water: {
          name: 'Water & Tide',
          primary: '#06b6d4',
          secondary: '#0ea5e9',
          accent: '#38bdf8',
          bgGlow: 'rgba(6, 182, 212, 0.22)',
          colors: ['#06b6d4', '#0ea5e9', '#38bdf8', '#cffafe', '#ffffff']
        },
        fire: {
          name: 'Fire & Blaze',
          primary: '#f43f5e',
          secondary: '#ea580c',
          accent: '#fb7185',
          bgGlow: 'rgba(244, 63, 94, 0.24)',
          colors: ['#f43f5e', '#ff4500', '#fb923c', '#ffd60a', '#ffffff']
        }
      };

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());

      // Mouse tracking for interactive elemental deflection & wake
      window.addEventListener('mousemove', e => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.mouseActive = true;
        this.mouseTrail.push({ x: e.clientX, y: e.clientY, life: 20 });
        if (this.mouseTrail.length > 25) this.mouseTrail.shift();
      });

      window.addEventListener('mouseleave', () => {
        this.mouseActive = false;
        this.mouseX = -1000;
        this.mouseY = -1000;
        this.mouseTrail = [];
      });

      // Pause when tab is backgrounded to save CPU/battery
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        } else {
          this.start();
        }
      });

      this.spawnInitialParticles();
      this.start();
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = Math.floor(this.width * dpr);
      this.canvas.height = Math.floor(this.height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (this.width < 768) {
        this.maxParticles = 65;
      } else {
        this.maxParticles = 120;
      }
    }

    setTheme(themeName) {
      if (!this.THEMES[themeName]) return;
      if (this.targetTheme === themeName && this.themeTransition >= 1.0) return;

      this.currentTheme = this.targetTheme;
      this.targetTheme = themeName;
      this.themeTransition = 0.0;

      const cfg = this.THEMES[themeName];

      // Instantly energize and morph existing particles to new element with vibrant burst
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.theme = themeName;
        p.color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
        p.alpha = Math.min(0.9, p.alpha * 1.3);

        if (themeName === 'fire') {
          p.vx = (Math.random() - 0.5) * 2.2;
          p.vy = -2.0 - Math.random() * 3.4;
          p.shape = 'circle';
        } else if (themeName === 'water') {
          p.vx = (Math.random() - 0.5) * 1.8;
          p.vy = -0.8 - Math.random() * 1.8;
          p.shape = 'circle';
        } else if (themeName === 'air') {
          p.vx = 2.4 + Math.random() * 4.2;
          p.vy = (Math.random() - 0.5) * 2.4;
          p.shape = 'circle';
        } else if (themeName === 'earth') {
          p.vx = (Math.random() - 0.5) * 1.0;
          p.vy = -0.5 - Math.random() * 1.2;
          p.shape = Math.random() > 0.4 ? 'polygon' : 'circle';
        } else { // spirit
          p.vx = (Math.random() - 0.5) * 1.4;
          p.vy = -0.7 - Math.random() * 1.3;
          p.shape = 'circle';
        }
      }
    }

    createParticle(themeName, customY = null) {
      const cfg = this.THEMES[themeName] || this.THEMES.spirit;
      const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
      
      const p = {
        theme: themeName,
        x: Math.random() * this.width,
        y: customY !== null ? customY : (themeName === 'fire' ? this.height + Math.random() * 40 : Math.random() * this.height),
        vx: 0,
        vy: 0,
        radius: 2.2 + Math.random() * 4.0,
        baseRadius: 2.2 + Math.random() * 4.0,
        alpha: 0.25 + Math.random() * 0.75,
        maxAlpha: 0.35 + Math.random() * 0.65,
        color: color,
        life: 0,
        maxLife: 140 + Math.random() * 180,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        phase: Math.random() * Math.PI * 2,
        shape: themeName === 'earth' ? (Math.random() > 0.4 ? 'polygon' : 'circle') : 'circle',
        points: 3 + Math.floor(Math.random() * 3)
      };

      if (themeName === 'fire') {
        p.vx = (Math.random() - 0.5) * 1.8;
        p.vy = -2.2 - Math.random() * 3.2;
        p.radius = 2.0 + Math.random() * 4.2;
      } else if (themeName === 'water') {
        p.vx = (Math.random() - 0.5) * 1.4;
        p.vy = -0.8 - Math.random() * 1.6;
        p.radius = 2.5 + Math.random() * 4.5;
      } else if (themeName === 'air') {
        p.vx = 2.4 + Math.random() * 4.0;
        p.vy = (Math.random() - 0.5) * 2.0;
        p.radius = 1.8 + Math.random() * 3.5;
      } else if (themeName === 'earth') {
        p.vx = (Math.random() - 0.5) * 0.9;
        p.vy = -0.5 - Math.random() * 1.1;
        p.radius = 2.5 + Math.random() * 5.0;
      } else { // spirit
        p.vx = (Math.random() - 0.5) * 1.3;
        p.vy = -0.6 - Math.random() * 1.2;
        p.radius = 3.0 + Math.random() * 5.5;
      }

      return p;
    }

    spawnInitialParticles() {
      this.particles = [];
      for (let i = 0; i < this.maxParticles; i++) {
        this.particles.push(this.createParticle(this.currentTheme, Math.random() * this.height));
      }
    }

    updateParticle(p, dt) {
      p.life++;
      
      // Elemental Physics
      if (p.theme === 'fire') {
        // Flickering rising embers with thermal turbulence
        p.x += p.vx + Math.sin(p.life * 0.07 + p.phase) * 1.1;
        p.y += p.vy;
        p.radius = Math.max(0.6, p.baseRadius * (1 - (p.life / p.maxLife) * 0.65));
        p.alpha = p.maxAlpha * (1 - (p.life / p.maxLife));
      } else if (p.theme === 'water') {
        // Fluid undulating wave currents
        p.x += p.vx + Math.sin(p.y * 0.016 + p.phase) * 1.8;
        p.y += p.vy;
        p.alpha = p.maxAlpha * (0.6 + Math.sin(p.life * 0.04 + p.phase) * 0.4);
      } else if (p.theme === 'air') {
        // Fast horizontal gale sweep with vertical vortex flutter
        p.x += p.vx;
        p.y += p.vy + Math.cos(p.x * 0.012 + p.phase) * 1.5;
        p.alpha = p.maxAlpha * (1 - (p.life / p.maxLife) * 0.5);
      } else if (p.theme === 'earth') {
        // Levitating geometric shards with slow rotation
        p.x += p.vx + Math.sin(p.life * 0.02 + p.phase) * 0.4;
        p.y += p.vy;
        p.angle += p.rotSpeed;
        p.alpha = p.maxAlpha * (0.7 + Math.sin(p.life * 0.03 + p.phase) * 0.3);
      } else { // spirit
        // Sumi-e ink smoke drift & diffusion
        p.x += p.vx + Math.sin(p.life * 0.025 + p.phase) * 0.9;
        p.y += p.vy;
        p.radius = p.baseRadius * (1 + (p.life / p.maxLife) * 0.5);
        p.alpha = p.maxAlpha * (1 - (p.life / p.maxLife));
      }

      // Interactive mouse deflection: particles scatter dynamically
      if (this.mouseActive) {
        const dx = p.x - this.mouseX;
        const dy = p.y - this.mouseY;
        const dist = Math.hypot(dx, dy);
        const radius = 140;
        if (dist < radius && dist > 1) {
          const force = (1 - dist / radius) * 2.8;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }

      // Respawn when expired or out of bounds
      if (p.life >= p.maxLife || p.y < -30 || p.y > this.height + 60 || p.x < -40 || p.x > this.width + 40) {
        Object.assign(p, this.createParticle(this.targetTheme));
      }
    }

    drawParticle(p) {
      if (p.alpha <= 0.02) return;

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

      if (p.shape === 'polygon') {
        // Geometric Earth Crystals & Shards
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.angle);
        this.ctx.beginPath();
        for (let i = 0; i < p.points; i++) {
          const a = (i * 2 * Math.PI) / p.points;
          const px = Math.cos(a) * p.radius;
          const py = Math.sin(a) * p.radius;
          if (i === 0) this.ctx.moveTo(px, py);
          else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 10;
        this.ctx.fill();
      } else {
        // Luminous Glowing Core
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = p.theme === 'fire' ? 16 : 10;
        this.ctx.fill();

        // Inner incandescent white hot core for fire/air
        if ((p.theme === 'fire' || p.theme === 'air' || p.theme === 'water') && p.radius > 2.6) {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.radius * 0.45, 0, Math.PI * 2);
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fill();
        }
      }

      this.ctx.restore();
    }

    drawElementalBackdropEffects() {
      const theme = this.targetTheme;
      const t = performance.now() * 0.001;

      this.ctx.save();

      if (theme === 'water') {
        // Vibrant Undulating Ocean Wave Bands Across Bottom Half (Note 3 & 5)
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height);
        for (let x = 0; x <= this.width; x += 25) {
          const y = this.height - 120 + Math.sin(x * 0.006 + t * 1.8) * 35 + Math.cos(x * 0.014 - t * 1.1) * 20;
          this.ctx.lineTo(x, y);
        }
        this.ctx.lineTo(this.width, this.height);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
        this.ctx.fill();

        // Secondary Froth Crest Ribbon
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height);
        for (let x = 0; x <= this.width; x += 25) {
          const y = this.height - 70 + Math.sin(x * 0.009 - t * 2.2) * 25 + Math.cos(x * 0.018 + t * 0.9) * 15;
          this.ctx.lineTo(x, y);
        }
        this.ctx.lineTo(this.width, this.height);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
        this.ctx.fill();

      } else if (theme === 'fire') {
        // Ascending Thermal Heat Aura Gradient & Bottom Embers (Note 3 & 5)
        const grad = this.ctx.createLinearGradient(0, this.height, 0, this.height - 280);
        grad.addColorStop(0, 'rgba(244, 63, 94, 0.20)');
        grad.addColorStop(0.4, 'rgba(249, 115, 22, 0.10)');
        grad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, this.height - 280, this.width, 280);

        // Flickering Heat Waves
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height);
        for (let x = 0; x <= this.width; x += 30) {
          const y = this.height - 80 + Math.sin(x * 0.012 + t * 3.5) * 18 + Math.cos(x * 0.024 - t * 2.5) * 10;
          this.ctx.lineTo(x, y);
        }
        this.ctx.lineTo(this.width, this.height);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(255, 69, 0, 0.12)';
        this.ctx.fill();

      } else if (theme === 'air') {
        // Dynamic Aerodynamic Gale Streamlines (Note 3 & 5)
        this.ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const baseY = this.height * 0.35 + i * 90;
          this.ctx.moveTo(0, baseY);
          for (let x = 0; x <= this.width; x += 40) {
            const y = baseY + Math.sin(x * 0.005 + t * 2.2 + i) * 22;
            this.ctx.lineTo(x, y);
          }
        }
        this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.14)';
        this.ctx.lineWidth = 2.5;
        this.ctx.stroke();

      } else if (theme === 'earth') {
        // Seismic Terracotta Base Strata Band (Note 3 & 5)
        const grad = this.ctx.createLinearGradient(0, this.height, 0, this.height - 240);
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
        grad.addColorStop(0.5, 'rgba(217, 119, 6, 0.08)');
        grad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, this.height - 240, this.width, 240);

      } else if (theme === 'spirit') {
        // Diffusing Sumi-e Violet Ink Smoke Clouds (Note 3 & 5)
        const grad = this.ctx.createRadialGradient(this.width * 0.5, this.height * 0.7, 50, this.width * 0.5, this.height * 0.7, 450);
        grad.addColorStop(0, 'rgba(168, 85, 247, 0.18)');
        grad.addColorStop(0.6, 'rgba(99, 102, 241, 0.08)');
        grad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);
      }

      this.ctx.restore();
    }

    animate(now) {
      if (!this.isRunning) return;

      const dt = Math.min((now - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = now;

      // Update transition progress
      if (this.themeTransition < 1.0) {
        this.themeTransition = Math.min(1.0, this.themeTransition + dt * 2.5);
        if (this.themeTransition >= 1.0) {
          this.currentTheme = this.targetTheme;
        }
      }

      // Clear canvas with soft fade trail
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Draw atmospheric backdrop effects (waves, fire glow, etc.)
      this.drawElementalBackdropEffects();

      // Update & Draw Particles
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        this.updateParticle(p, dt);
        this.drawParticle(p);
      }

      this.animId = requestAnimationFrame(this.animate.bind(this));
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.lastTimestamp = performance.now();
      this.animId = requestAnimationFrame(this.animate.bind(this));
    }

    stop() {
      this.isRunning = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }
  }

  // Export to window
  window.ElementalAtmosphere = ElementalAtmosphere;

})();
