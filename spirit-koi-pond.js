/**
 * ============================================================================
 * JLPT N4 Study Studio — Spirit Koi Pond Engine (Tui & La)
 * Living, Organic Ethereal Koi Pond for Vocabulary (Spirit Element 霊)
 *
 * Behaviors:
 * - Free Pond Roaming: Two celestial Yin-Yang Koi fish (Moon Spirit Tui & Void Spirit La)
 *   swim gracefully across the whole card bounds with lifelike multi-jointed spine
 *   undulations, fluttering gossamer fins, trailing glowing wakes, and water ripples.
 * - Task Complete Harmony: When the study task is complete (target reached or marked done),
 *   the fish gracefully converge and circle each other in an eternal Yin-Yang orbit!
 * ============================================================================
 */

(function () {
  'use strict';

  class KoiFish {
    constructor(type, x, y, angle) {
      this.type = type; // 'yin' (Tui - Moon Spirit) or 'yang' (La - Void/Ocean Spirit)
      this.x = x;
      this.y = y;
      this.angle = angle;
      this.targetAngle = angle;
      this.speed = 1.6;
      this.baseSpeed = 1.6;
      this.angularSpeed = 0.045;
      
      // Spine Segments (10 vertebrae following the head)
      this.segmentCount = 10;
      this.segmentDistances = [12, 11, 10, 9, 8, 7, 6, 6, 5, 5];
      this.segmentRadii = [9.5, 12, 11.5, 10, 8.5, 7, 5.5, 4.5, 3.5, 2.5];
      
      this.segments = [];
      for (let i = 0; i < this.segmentCount; i++) {
        this.segments.push({
          x: this.x - Math.cos(angle) * (i * 9),
          y: this.y - Math.sin(angle) * (i * 9)
        });
      }

      // Kinematics and swim oscillation
      this.swimPhase = Math.random() * Math.PI * 2;
      this.swimFrequency = 0.14;
      this.swimAmplitude = 1.8;
      
      // Wake ribbon history (tail path points)
      this.trailHistory = [];
      this.maxTrailLength = 26;

      // Color Palette
      if (this.type === 'yin') {
        // Tui (Moon Spirit) - Pearlescent white with sacred violet & lavender glow
        this.baseColor = '#ffffff';
        this.accentColor = '#c084fc';
        this.glowColor = 'rgba(192, 132, 252, 0.75)';
        this.finColor = 'rgba(233, 213, 255, 0.45)';
        this.eyeColor = '#ffffff';
        this.trailColor = 'rgba(216, 180, 254, 0.28)';
      } else {
        // La (Ocean / Void Spirit) - Deep obsidian-amethyst with electric cyan markings
        this.baseColor = '#120b22';
        this.accentColor = '#06b6d4';
        this.glowColor = 'rgba(6, 182, 212, 0.75)';
        this.finColor = 'rgba(168, 85, 247, 0.42)';
        this.eyeColor = '#38bdf8';
        this.trailColor = 'rgba(6, 182, 212, 0.28)';
      }
    }

    update(width, height, mode, orbitCenter, companion, mousePos) {
      this.swimPhase += this.swimFrequency;
      
      // Steering behavior based on mode
      if (mode === 'yin-yang' && orbitCenter) {
        // Yin-Yang Orbit Mode: Orbit smoothly around orbitCenter in 180° opposition
        const targetRadius = Math.min(width, height) * 0.26;
        const dx = this.x - orbitCenter.x;
        const dy = this.y - orbitCenter.y;
        const currentDist = Math.hypot(dx, dy) || 1;
        const currentAngle = Math.atan2(dy, dx);
        
        // Desired circular tangent angle (counter-clockwise)
        const tangentAngle = currentAngle + Math.PI / 2;
        
        // Radial steering to stay locked on targetRadius
        const radialCorrection = (targetRadius - currentDist) * 0.025;
        this.targetAngle = tangentAngle + (radialCorrection > 0 ? 0.35 : -0.35) * Math.min(1, Math.abs(radialCorrection));
        this.speed = 1.9;
      } else {
        // Free Pond Roaming Mode: Smooth wandering across the entire card
        this.speed = this.baseSpeed + Math.sin(this.swimPhase * 0.5) * 0.3;

        // Gentle boundary avoidance to keep fish inside pond with soft cushion
        const pad = 42;
        let repelX = 0;
        let repelY = 0;
        if (this.x < pad) repelX = (pad - this.x) / pad;
        if (this.x > width - pad) repelX = -(this.x - (width - pad)) / pad;
        if (this.y < pad) repelY = (pad - this.y) / pad;
        if (this.y > height - pad) repelY = -(this.y - (height - pad)) / pad;

        if (repelX !== 0 || repelY !== 0) {
          const repelAngle = Math.atan2(repelY, repelX);
          this.targetAngle = repelAngle;
        } else {
          // Autonomous organic meandering
          this.targetAngle += (Math.sin(this.swimPhase * 0.45) * 0.04) + (Math.cos(this.x * 0.01 + this.y * 0.01) * 0.02);
          
          // Gentle interaction with companion: avoid colliding, but cruise nearby
          if (companion) {
            const cdx = companion.x - this.x;
            const cdy = companion.y - this.y;
            const cdist = Math.hypot(cdx, cdy);
            if (cdist < 65) {
              // Steer slightly away from collision
              const awayAngle = Math.atan2(this.y - companion.y, this.x - companion.x);
              this.targetAngle += (awayAngle - this.targetAngle) * 0.1;
            } else if (cdist > 320) {
              // Drift gently back toward companion
              const towardAngle = Math.atan2(cdy, cdx);
              this.targetAngle += (towardAngle - this.targetAngle) * 0.015;
            }
          }
        }

        // Gentle interactive mouse deflection/curiosity
        if (mousePos && mousePos.active) {
          const mdx = this.x - mousePos.x;
          const mdy = this.y - mousePos.y;
          const mdist = Math.hypot(mdx, mdy);
          if (mdist < 95 && mdist > 5) {
            const steerAway = Math.atan2(mdy, mdx);
            this.targetAngle = steerAway;
            this.speed = this.baseSpeed * 1.5; // Little playful burst!
          }
        }
      }

      // Smooth angular interpolation
      let angleDiff = this.targetAngle - this.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      this.angle += angleDiff * this.angularSpeed;

      // Advance head
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      // Update spine joints (inverse kinematics with traveling sinusoidal wave)
      this.segments[0].x = this.x;
      this.segments[0].y = this.y;

      for (let i = 1; i < this.segmentCount; i++) {
        const prev = this.segments[i - 1];
        const curr = this.segments[i];
        
        let dx = curr.x - prev.x;
        let dy = curr.y - prev.y;
        let dist = Math.hypot(dx, dy) || 1;
        
        const targetDist = this.segmentDistances[i - 1];
        curr.x = prev.x + (dx / dist) * targetDist;
        curr.y = prev.y + (dy / dist) * targetDist;

        // Apply lateral undulation wave for lifelike fish spine
        const wave = Math.sin(this.swimPhase - i * 0.55) * this.swimAmplitude * (i / this.segmentCount);
        const segAngle = Math.atan2(curr.y - prev.y, curr.x - prev.x);
        curr.x += Math.cos(segAngle + Math.PI / 2) * wave * 0.4;
        curr.y += Math.sin(segAngle + Math.PI / 2) * wave * 0.4;
      }

      // Update trailing wake history from the tail joint
      const tail = this.segments[this.segmentCount - 1];
      this.trailHistory.unshift({ x: tail.x, y: tail.y, age: 0 });
      if (this.trailHistory.length > this.maxTrailLength) {
        this.trailHistory.pop();
      }
    }

    draw(ctx) {
      ctx.save();

      // 1. Draw glowing translucent fluid ribbon trail behind tail
      if (this.trailHistory.length > 2) {
        ctx.beginPath();
        ctx.moveTo(this.trailHistory[0].x, this.trailHistory[0].y);
        for (let i = 1; i < this.trailHistory.length - 1; i++) {
          const xc = (this.trailHistory[i].x + this.trailHistory[i + 1].x) * 0.5;
          const yc = (this.trailHistory[i].y + this.trailHistory[i + 1].y) * 0.5;
          ctx.quadraticCurveTo(this.trailHistory[i].x, this.trailHistory[i].y, xc, yc);
        }
        ctx.strokeStyle = this.trailColor;
        ctx.lineWidth = 5.5;
        ctx.lineCap = 'round';
        ctx.shadowColor = this.accentColor;
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Secondary thin incandescent ribbon core
        ctx.beginPath();
        ctx.moveTo(this.trailHistory[0].x, this.trailHistory[0].y);
        for (let i = 1; i < this.trailHistory.length - 1; i++) {
          const xc = (this.trailHistory[i].x + this.trailHistory[i + 1].x) * 0.5;
          const yc = (this.trailHistory[i].y + this.trailHistory[i + 1].y) * 0.5;
          ctx.quadraticCurveTo(this.trailHistory[i].x, this.trailHistory[i].y, xc, yc);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // 2. Draw gossamer Chiffon Caudal (Tail) Fin (Butterfly Koi style)
      const tailRoot = this.segments[this.segmentCount - 1];
      const tailPre = this.segments[this.segmentCount - 2];
      const tailAngle = Math.atan2(tailRoot.y - tailPre.y, tailRoot.x - tailPre.x);
      const tailWave = Math.sin(this.swimPhase - 5.5) * 8;

      ctx.save();
      ctx.translate(tailRoot.x, tailRoot.y);
      ctx.rotate(tailAngle);

      // Trailing veil fin lobes
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(16 + tailWave * 0.4, -14, 38 + tailWave, -18);
      ctx.quadraticCurveTo(28 + tailWave * 0.5, 0, 44 + tailWave * 1.2, 0);
      ctx.quadraticCurveTo(28 + tailWave * 0.5, 0, 38 + tailWave, 18);
      ctx.quadraticCurveTo(16 + tailWave * 0.4, 14, 0, 0);
      ctx.closePath();

      ctx.fillStyle = this.finColor;
      ctx.shadowColor = this.accentColor;
      ctx.shadowBlur = 10;
      ctx.fill();

      // Delicate luminous fin rays
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(38 + tailWave, -18);
      ctx.moveTo(0, 0); ctx.lineTo(44 + tailWave * 1.2, 0);
      ctx.moveTo(0, 0); ctx.lineTo(38 + tailWave, 18);
      ctx.stroke();

      ctx.restore();

      // 3. Draw Flapping Pectoral Fins (Left & Right of chest)
      const chest = this.segments[1];
      const chestPre = this.segments[0];
      const chestAngle = Math.atan2(chest.y - chestPre.y, chest.x - chestPre.x);
      const finFlap = Math.sin(this.swimPhase * 0.9) * 0.28;

      [-1, 1].forEach(side => {
        ctx.save();
        ctx.translate(chest.x, chest.y);
        ctx.rotate(chestAngle + (side * (Math.PI / 2.4 + finFlap)));
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(14, side * 7, 24, side * 14);
        ctx.quadraticCurveTo(10, side * 10, 0, 0);
        ctx.closePath();
        ctx.fillStyle = this.finColor;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      });

      // 4. Construct Smooth Segmented Body Shell
      const leftPoints = [];
      const rightPoints = [];

      for (let i = 0; i < this.segmentCount; i++) {
        const seg = this.segments[i];
        let angle;
        if (i < this.segmentCount - 1) {
          angle = Math.atan2(this.segments[i + 1].y - seg.y, this.segments[i + 1].x - seg.x);
        } else {
          angle = Math.atan2(seg.y - this.segments[i - 1].y, seg.x - this.segments[i - 1].x);
        }

        const radius = this.segmentRadii[i];
        const normal = angle + Math.PI / 2;

        leftPoints.push({
          x: seg.x + Math.cos(normal) * radius,
          y: seg.y + Math.sin(normal) * radius
        });
        rightPoints.push({
          x: seg.x - Math.cos(normal) * radius,
          y: seg.y - Math.sin(normal) * radius
        });
      }

      // Draw Main Body Path
      ctx.beginPath();
      // Round head
      ctx.arc(this.segments[0].x, this.segments[0].y, this.segmentRadii[0], this.angle + Math.PI / 2, this.angle - Math.PI / 2);
      
      // Right flank to tail
      for (let i = 0; i < rightPoints.length; i++) {
        ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
      }
      // Tail tip
      ctx.lineTo(this.segments[this.segmentCount - 1].x, this.segments[this.segmentCount - 1].y);
      // Left flank back to head
      for (let i = leftPoints.length - 1; i >= 0; i--) {
        ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
      }
      ctx.closePath();

      // Body Gradient & Glowing Silhouette
      ctx.fillStyle = this.baseColor;
      ctx.shadowColor = this.glowColor;
      ctx.shadowBlur = 18;
      ctx.fill();

      ctx.strokeStyle = this.accentColor;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // 5. Dorsal Markings & Spine Crest
      ctx.beginPath();
      ctx.moveTo(this.segments[1].x, this.segments[1].y);
      for (let i = 2; i < 7; i++) {
        ctx.lineTo(this.segments[i].x, this.segments[i].y);
      }
      ctx.strokeStyle = this.accentColor;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Celestial Markings (Spiritual Enso / Yin-Yang dot on head)
      ctx.beginPath();
      ctx.arc(this.segments[0].x - Math.cos(this.angle) * 3, this.segments[0].y - Math.sin(this.angle) * 3, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = this.accentColor;
      ctx.fill();

      // Luminous Eyes
      [-1, 1].forEach(side => {
        const eyeAngle = this.angle + (side * Math.PI / 2.8);
        const eyeX = this.segments[0].x + Math.cos(eyeAngle) * 6;
        const eyeY = this.segments[0].y + Math.sin(eyeAngle) * 6;

        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = this.eyeColor;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.fill();
      });

      // Whisker Barbels (Flowing gracefully from mouth)
      [-1, 1].forEach(side => {
        const barbelAngle = this.angle + (side * 0.4);
        const bx = this.segments[0].x + Math.cos(barbelAngle) * 8;
        const by = this.segments[0].y + Math.sin(barbelAngle) * 8;
        
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(
          bx - Math.cos(this.angle) * 6 + side * 4,
          by - Math.sin(this.angle) * 6,
          bx - Math.cos(this.angle) * 12 + side * 6,
          by - Math.sin(this.angle) * 12
        );
        ctx.strokeStyle = this.accentColor;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      });

      ctx.restore();
    }
  }

  class SpiritKoiPond {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d', { alpha: true });
      this.width = 0;
      this.height = 0;
      
      // Mode: 'wander' (freely explore whole card) or 'yin-yang' (circling harmony on completion)
      this.mode = 'wander';
      this.orbitCenter = { x: 0, y: 0 };

      // Particles & Ripples
      this.ripples = [];
      this.particles = [];

      // Mouse tracking on vocabulary card
      this.mouse = { x: -1000, y: -1000, active: false };

      // Two Sacred Koi: Tui (Moon Yin) & La (Ocean/Void Yang)
      this.koiTui = new KoiFish('yin', 140, 150, 0.4);
      this.koiLa = new KoiFish('yang', 360, 260, 3.5);

      this.isRunning = false;
      this.animId = null;

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());

      // Track mouse on Vocabulary card
      const card = document.getElementById('card-vocabulary');
      if (card) {
        card.addEventListener('mousemove', e => {
          const rect = this.canvas.getBoundingClientRect();
          this.mouse.x = e.clientX - rect.left;
          this.mouse.y = e.clientY - rect.top;
          this.mouse.active = true;

          // Occasional gentle mouse ripple
          if (Math.random() < 0.08) {
            this.addRipple(this.mouse.x, this.mouse.y, 'rgba(192, 132, 252, 0.35)');
          }
        });

        card.addEventListener('mouseleave', () => {
          this.mouse.active = false;
          this.mouse.x = -1000;
          this.mouse.y = -1000;
        });

        card.addEventListener('click', e => {
          const rect = this.canvas.getBoundingClientRect();
          const cx = e.clientX - rect.left;
          const cy = e.clientY - rect.top;
          this.addRipple(cx, cy, 'rgba(255, 255, 255, 0.65)', 55);
        });
      }

      this.start();
    }

    resize() {
      if (!this.canvas) return;
      const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : null;
      const w = rect && rect.width > 50 ? rect.width : (this.canvas.clientWidth || 540);
      const h = rect && rect.height > 50 ? rect.height : (this.canvas.clientHeight || 420);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = w;
      this.height = h;
      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Orbit center sits gracefully in the open right-hand area of the card
      this.orbitCenter = {
        x: Math.floor(this.width * 0.68),
        y: Math.floor(this.height * 0.52)
      };
    }

    setMode(newMode) {
      if (this.mode === newMode) return;
      this.mode = newMode; // 'wander' | 'yin-yang'

      if (newMode === 'yin-yang') {
        // Trigger celebratory ripples in the center
        this.addRipple(this.orbitCenter.x, this.orbitCenter.y, 'rgba(255, 255, 255, 0.7)', 90);
        this.addRipple(this.orbitCenter.x, this.orbitCenter.y, 'rgba(168, 85, 247, 0.5)', 70);
      }
    }

    addRipple(x, y, color = 'rgba(192, 132, 252, 0.3)', maxRadius = 40) {
      this.ripples.push({
        x,
        y,
        radius: 4,
        maxRadius,
        alpha: 0.6,
        color
      });
      if (this.ripples.length > 18) this.ripples.shift();
    }

    addParticle(x, y, color) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.4 - Math.random() * 0.6,
        radius: 1.5 + Math.random() * 2.2,
        alpha: 0.75,
        color: color || '#c084fc',
        life: 0,
        maxLife: 60 + Math.random() * 50
      });
      if (this.particles.length > 55) this.particles.shift();
    }

    animate() {
      if (!this.isRunning) return;

      // Check if vocabulary card is currently expanded
      const card = document.getElementById('card-vocabulary');
      const isExpanded = card && card.classList.contains('is-expanded');

      if (!isExpanded) {
        // Pause animation loop while card is collapsed to save CPU
        this.animId = requestAnimationFrame(this.animate.bind(this));
        return;
      }

      // Ensure dimensions match current expanded layout
      if (this.canvas.clientWidth > 0 && Math.abs(this.width - this.canvas.clientWidth) > 10) {
        this.resize();
      }

      this.ctx.clearRect(0, 0, this.width, this.height);

      // 1. Draw Ambient Pond Glow & Water Caustics
      this.drawPondAtmosphere();

      // 2. Update & Draw Ripples
      for (let i = this.ripples.length - 1; i >= 0; i--) {
        const r = this.ripples[i];
        r.radius += 0.85;
        r.alpha -= 0.012;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          this.ripples.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = r.color.replace(/[\d.]+\)$/, `${Math.max(0, r.alpha)})`);
        this.ctx.lineWidth = 1.4;
        this.ctx.stroke();
        this.ctx.restore();
      }

      // 3. Update & Draw Particles (Bioluminescent Pond Spores)
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = Math.max(0, 0.75 * (1 - p.life / p.maxLife));

        if (p.life >= p.maxLife) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
        this.ctx.restore();
      }

      // 4. Update & Draw Two Sacred Koi Fish
      this.koiTui.update(this.width, this.height, this.mode, this.orbitCenter, this.koiLa, this.mouse);
      this.koiLa.update(this.width, this.height, this.mode, this.orbitCenter, this.koiTui, this.mouse);

      // Emit occasional spirit particles from their tails
      if (Math.random() < 0.35) {
        const tTail = this.koiTui.segments[9];
        this.addParticle(tTail.x, tTail.y, '#e9d5ff');
      }
      if (Math.random() < 0.35) {
        const lTail = this.koiLa.segments[9];
        this.addParticle(lTail.x, lTail.y, '#38bdf8');
      }

      // Draw fish (render under/over naturally)
      this.koiLa.draw(this.ctx);
      this.koiTui.draw(this.ctx);

      this.animId = requestAnimationFrame(this.animate.bind(this));
    }

    drawPondAtmosphere() {
      this.ctx.save();

      // Soft water depth gradient in the center
      const grad = this.ctx.createRadialGradient(
        this.orbitCenter.x, this.orbitCenter.y, 40,
        this.orbitCenter.x, this.orbitCenter.y, 220
      );
      grad.addColorStop(0, 'rgba(168, 85, 247, 0.14)');
      grad.addColorStop(0.6, 'rgba(99, 102, 241, 0.05)');
      grad.addColorStop(1, 'transparent');

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // When in Yin-Yang mode, render subtle ambient vortex glow (zero harsh stroke lines)
      if (this.mode === 'yin-yang') {
        const t = performance.now() * 0.0015;
        const targetRadius = Math.min(this.width, this.height) * 0.26;

        const vortexGrad = this.ctx.createRadialGradient(
          this.orbitCenter.x, this.orbitCenter.y, targetRadius * 0.45,
          this.orbitCenter.x, this.orbitCenter.y, targetRadius * 1.3
        );
        vortexGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
        vortexGrad.addColorStop(0.65, `rgba(168, 85, 247, ${0.05 + Math.sin(t) * 0.02})`);
        vortexGrad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = vortexGrad;
        this.ctx.beginPath();
        this.ctx.arc(this.orbitCenter.x, this.orbitCenter.y, targetRadius * 1.35, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
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
  window.SpiritKoiPond = SpiritKoiPond;

})();
