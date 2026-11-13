/**
 * ============================================================================
 * JLPT N4 Study Studio — Living Active Volcano & Magma Eruption Engine (Hi • 火)
 * Reading (読解) — AAA High-Definition Volcanic Landscape Simulation
 *
 * Visual Architecture:
 * 1. Dramatic Volcanic Sky & Ash Atmosphere:
 *    - Deep twilight obsidian-to-crimson gradient with brooding storm clouds.
 *    - Ambient thermal heat distortion and drifting embers.
 * 2. Towering Basalt Caldera Mountain:
 *    - Monumental volcanic mountain peak with textured rock gullies and basalt ridges.
 *    - Boiling summit caldera with incandescent liquid lava lake and drifting crust plates.
 *    - Continuous billowing volumetric volcanic smoke columns rising into the sky.
 * 3. Organic Branching Magma Rivers:
 *    - Curving, branching dendritic lava flows snaking down rocky ravines.
 *    - Multi-layered glow: deep crimson bloom -> searing fiery orange -> incandescent white-hot core.
 * 4. Interactive Sparks:
 *    - Hovering and moving across the card scatters glowing sparks and thermal embers.
 * 5. Completion Climax (EPIC VOLCANIC ERUPTION):
 *    - Giant incandescent magma geysers rocket into the stratosphere!
 *    - Glowing lava bombs arc across the sky and shatter on impact!
 *    - Magma surges over the crater rim in glowing rivers with a radiant golden shockwave!
 * ============================================================================
 */

(function () {
  'use strict';

  class FireVolcanoEruption {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');

      this.width = 0;
      this.height = 0;
      this.isRunning = false;
      this.animId = null;

      // State
      this.isActive = false;
      this.isCompleted = false;
      this.pulseSpeed = 1.0;
      this.targetPulseSpeed = 1.0;
      this.time = 0;
      this.eruptionProgress = 0;

      // Volcanic Smoke Puffs (continuous organic smoke simulation)
      this.smokePuffs = [];
      for (let i = 0; i < 24; i++) {
        this.smokePuffs.push({
          x: 0,
          y: 0,
          vx: (Math.random() - 0.45) * 0.6,
          vy: -1.2 - Math.random() * 1.5,
          radius: 18 + Math.random() * 22,
          maxRadius: 65 + Math.random() * 35,
          alpha: Math.random() * 0.45,
          age: Math.random(),
          seed: Math.random() * 10
        });
      }

      // Interactive Embers
      this.embers = [];
      this.mouse = { x: -1000, y: -1000, active: false };

      // Lava Crust Plates (drifting in caldera)
      this.crusts = [
        { dx: -18, dy: -2, w: 14, h: 6, rot: 0.1 },
        { dx: 4, dy: 1, w: 18, h: 7, rot: -0.15 },
        { dx: -6, dy: 3, w: 12, h: 5, rot: 0.25 },
        { dx: 20, dy: -1, w: 11, h: 5, rot: -0.1 }
      ];

      // Eruption Magma Bombs
      this.bombs = [];

      this.initEvents();
      this.resize();
      this.start();
    }

    initEvents() {
      if (!this.canvas) return;

      const onMove = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.mouse.active = true;

        if (Math.random() < 0.5 && this.embers.length < 35) {
          this.addEmber(this.mouse.x, this.mouse.y, false);
        }
      };

      const onLeave = () => {
        this.mouse.active = false;
        this.mouse.x = -1000;
        this.mouse.y = -1000;
      };

      const onClick = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        for (let i = 0; i < 12; i++) {
          this.addEmber(mx, my, true);
        }
      };

      this.canvas.addEventListener('mousemove', onMove);
      this.canvas.addEventListener('mouseleave', onLeave);
      this.canvas.addEventListener('click', onClick);

      window.addEventListener('resize', () => this.resize());
    }

    addEmber(x, y, isBurst) {
      this.embers.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * (isBurst ? 5 : 2),
        vy: -1.5 - Math.random() * (isBurst ? 4.5 : 2.5),
        radius: 1.5 + Math.random() * (isBurst ? 2.5 : 1.5),
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.02,
        color: Math.random() > 0.35 ? '#ffd60a' : '#f43f5e'
      });
      if (this.embers.length > 50) this.embers.shift();
    }

    resize() {
      if (!this.canvas) return;
      const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : this.canvas.getBoundingClientRect();
      const w = rect && rect.width > 50 ? rect.width : (this.canvas.clientWidth || 640);
      const h = rect && rect.height > 50 ? rect.height : (this.canvas.clientHeight || 440);

      const dpr = Math.max(window.devicePixelRatio || 1, 2); // 1080p / Retina Crispness
      this.width = w;
      this.height = h;

      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setActive(active) {
      this.isActive = Boolean(active);
      this.targetPulseSpeed = this.isActive ? 2.2 : 1.0;
    }

    setCompleted(completed) {
      this.isCompleted = Boolean(completed);
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;

      const loop = () => {
        if (!this.isRunning) return;
        this.update();
        this.render();
        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    }

    stop() {
      this.isRunning = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }

    update() {
      this.pulseSpeed += (this.targetPulseSpeed - this.pulseSpeed) * 0.06;
      this.time += 0.02 * this.pulseSpeed;

      // Eruption transition
      if (this.isCompleted) {
        this.eruptionProgress = Math.min(1.0, this.eruptionProgress + 0.015);
      } else {
        this.eruptionProgress = Math.max(0, this.eruptionProgress - 0.02);
      }

      const calderaX = this.width * 0.5;
      const calderaY = this.height * 0.44;

      // Update smoke plumes
      for (const puff of this.smokePuffs) {
        puff.age += 0.007 * this.pulseSpeed;
        if (puff.age >= 1.0) {
          puff.age = 0;
          puff.x = calderaX + (Math.random() - 0.5) * 25;
          puff.y = calderaY;
          puff.vx = (Math.random() - 0.45) * 0.8;
          puff.vy = -1.2 - Math.random() * 1.6;
        }
        puff.x += puff.vx;
        puff.y += puff.vy;
        puff.radius = 16 + puff.age * 55;
        puff.alpha = Math.sin(puff.age * Math.PI) * 0.38;
      }

      // Update interactive embers
      for (let i = this.embers.length - 1; i >= 0; i--) {
        const em = this.embers[i];
        em.x += em.vx;
        em.y += em.vy;
        em.alpha -= em.decay;
        if (em.alpha <= 0 || em.y < 0) {
          this.embers.splice(i, 1);
        }
      }

      // Spawn Eruption Magma Bombs when completed
      if (this.isCompleted && Math.random() < 0.25 && this.bombs.length < 10) {
        const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 0.9;
        const speed = 7 + Math.random() * 5;
        this.bombs.push({
          x: calderaX + (Math.random() - 0.5) * 20,
          y: calderaY - 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.22,
          size: 3 + Math.random() * 3,
          trail: []
        });
      }

      // Update Magma Bombs
      for (let b = this.bombs.length - 1; b >= 0; b--) {
        const bomb = this.bombs[b];
        bomb.trail.push({ x: bomb.x, y: bomb.y });
        if (bomb.trail.length > 8) bomb.trail.shift();

        bomb.x += bomb.vx;
        bomb.y += bomb.vy;
        bomb.vy += bomb.gravity;

        if (bomb.y > this.height * 0.88) {
          // Explode into embers on landing
          for (let k = 0; k < 6; k++) {
            this.addEmber(bomb.x, bomb.y, true);
          }
          this.bombs.splice(b, 1);
        }
      }
    }

    render() {
      const { ctx, width: w, height: h } = this;
      if (!ctx || w === 0 || h === 0) return;

      ctx.clearRect(0, 0, w, h);

      const calderaX = w * 0.5;
      const calderaY = h * 0.44;

      // 1. Cinematic Volcanic Sky & Distant Smoke Horizon
      this.drawVolcanicSky(w, h, calderaX, calderaY);

      // 2. Distant Volcanic Ridges (Deep Depth Layers)
      this.drawFarRidges(w, h);

      // 3. Billowing Volcanic Smoke Plumes
      this.drawSmokeColumns();

      // 4. Main Volcanic Peak (Rich Textured Basalt Mountain)
      this.drawVolcanoMountain(w, h, calderaX, calderaY);

      // 5. Summit Caldera Lava Lake with Drifting Crust
      this.drawCalderaLava(calderaX, calderaY);

      // 6. Branching Organic Magma Rivers & Glowing Fissures
      this.drawMagmaRivers(w, h, calderaX, calderaY);

      // 7. Interactive Embers & Sparks
      this.drawEmbers();

      // 8. Eruption Climax (Magma Geysers & Flying Bombs)
      if (this.eruptionProgress > 0.05) {
        this.drawEruptionClimax(w, h, calderaX, calderaY);
      }
    }

    drawVolcanicSky(w, h, cx, cy) {
      const { ctx, time } = this;

      // Rich atmospheric dusk sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0a0305');
      skyGrad.addColorStop(0.3, '#1c080d');
      skyGrad.addColorStop(0.65, '#3b1016');
      skyGrad.addColorStop(0.85, '#22080c');
      skyGrad.addColorStop(1, '#0e0305');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Brooding crimson thermal atmospheric bloom from the crater
      const pulse = Math.sin(time * 2.5) * 0.08;
      const glowRad = Math.min(w, h) * 0.75;
      const glowGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, glowRad);
      glowGrad.addColorStop(0, `rgba(244, 63, 94, ${0.42 + pulse})`);
      glowGrad.addColorStop(0.4, `rgba(234, 88, 12, ${0.22 + pulse * 0.5})`);
      glowGrad.addColorStop(0.8, 'rgba(153, 27, 27, 0.08)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);
    }

    drawFarRidges(w, h) {
      const { ctx } = this;
      ctx.save();

      // Far Left Mountain Ridge (Dark Plum Silhouette)
      ctx.fillStyle = '#140609';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.72);
      ctx.lineTo(w * 0.22, h * 0.52);
      ctx.lineTo(w * 0.38, h * 0.64);
      ctx.lineTo(w * 0.45, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Far Right Mountain Ridge
      ctx.fillStyle = '#140609';
      ctx.beginPath();
      ctx.moveTo(w, h * 0.70);
      ctx.lineTo(w * 0.78, h * 0.50);
      ctx.lineTo(w * 0.62, h * 0.62);
      ctx.lineTo(w * 0.55, h);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    drawSmokeColumns() {
      const { ctx } = this;
      ctx.save();

      for (const puff of this.smokePuffs) {
        if (puff.alpha <= 0.01) continue;

        const smokeGrad = ctx.createRadialGradient(
          puff.x, puff.y, 0,
          puff.x, puff.y, puff.radius
        );
        smokeGrad.addColorStop(0, `rgba(45, 18, 24, ${puff.alpha * 1.3})`);
        smokeGrad.addColorStop(0.5, `rgba(28, 10, 15, ${puff.alpha * 0.8})`);
        smokeGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = smokeGrad;
        ctx.beginPath();
        ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    drawVolcanoMountain(w, h, cx, cy) {
      const { ctx } = this;
      ctx.save();

      const craterW = w * 0.16;
      const leftRimX = cx - craterW * 0.5;
      const rightRimX = cx + craterW * 0.5;

      // 1. Shaded Mountain Body (Deep Textured Basalt)
      const mtnGrad = ctx.createLinearGradient(cx, cy, cx, h);
      mtnGrad.addColorStop(0, '#220b10');
      mtnGrad.addColorStop(0.3, '#18070b');
      mtnGrad.addColorStop(0.7, '#100407');
      mtnGrad.addColorStop(1, '#080203');

      ctx.fillStyle = mtnGrad;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.85);
      ctx.bezierCurveTo(w * 0.18, h * 0.78, w * 0.32, h * 0.58, leftRimX, cy);
      // Caldera crater basin dip
      ctx.quadraticCurveTo(cx, cy + 9, rightRimX, cy);
      ctx.bezierCurveTo(w * 0.68, h * 0.58, w * 0.82, h * 0.78, w, h * 0.85);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // 2. Basalt Ridges & Rock Face Shading (Left sunlit / right shadow)
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.18)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      // Ridge 1
      ctx.moveTo(leftRimX + 8, cy + 4);
      ctx.quadraticCurveTo(w * 0.38, h * 0.62, w * 0.28, h * 0.88);
      // Ridge 2
      ctx.moveTo(cx - 8, cy + 8);
      ctx.quadraticCurveTo(cx - 24, h * 0.68, cx - 40, h * 0.92);
      // Ridge 3
      ctx.moveTo(cx + 8, cy + 8);
      ctx.quadraticCurveTo(cx + 28, h * 0.68, cx + 55, h * 0.92);
      // Ridge 4
      ctx.moveTo(rightRimX - 8, cy + 4);
      ctx.quadraticCurveTo(w * 0.62, h * 0.62, w * 0.72, h * 0.88);
      ctx.stroke();

      ctx.restore();
    }

    drawCalderaLava(cx, cy) {
      const { ctx, time } = this;
      ctx.save();

      const craterRx = this.width * 0.08;
      const craterRy = 8;
      const pulse = Math.sin(time * 3) * 0.15;

      // 1. Incandescent Molten Lava Lake Surface
      const lavaGrad = ctx.createRadialGradient(cx, cy + 3, 0, cx, cy + 3, craterRx);
      lavaGrad.addColorStop(0, '#ffffff');
      lavaGrad.addColorStop(0.25, '#ffd60a');
      lavaGrad.addColorStop(0.65, '#f97316');
      lavaGrad.addColorStop(1, '#dc2626');

      ctx.fillStyle = lavaGrad;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 18 + pulse * 10;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 3, craterRx, craterRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 2. Drifting Basalt Crust Plates on Lava Lake
      ctx.fillStyle = '#1c080b';
      for (const c of this.crusts) {
        ctx.save();
        ctx.translate(cx + c.dx, cy + 3 + c.dy);
        ctx.rotate(c.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, c.w * 0.5, c.h * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }

    drawMagmaRivers(w, h, cx, cy) {
      const { ctx, time } = this;
      ctx.save();

      const pulse = (Math.sin(time * 3.5) + 1) * 0.5;

      // 4 Organic Branching Lava Rivers
      const rivers = [
        // River 1: Cascading down left flank
        [
          { x: cx - 18, y: cy + 5 },
          { x: cx - 45, y: cy + 42 },
          { x: cx - 75, y: cy + 95 },
          { x: cx - 120, y: h * 0.85 }
        ],
        // River 2: Central steep fissure
        [
          { x: cx - 4, y: cy + 7 },
          { x: cx - 18, y: cy + 52 },
          { x: cx - 12, y: cy + 105 },
          { x: cx - 35, y: h * 0.88 }
        ],
        // River 3: Branching toward right ravine
        [
          { x: cx + 8, y: cy + 7 },
          { x: cx + 28, y: cy + 48 },
          { x: cx + 22, y: cy + 98 },
          { x: cx + 48, y: h * 0.86 }
        ],
        // River 4: Grand sweeping right cascade
        [
          { x: cx + 20, y: cy + 5 },
          { x: cx + 55, y: cy + 45 },
          { x: cx + 88, y: cy + 100 },
          { x: cx + 135, y: h * 0.84 }
        ]
      ];

      rivers.forEach((pts) => {
        // Outer Crimson Bloom
        ctx.strokeStyle = `rgba(244, 63, 94, ${0.55 + pulse * 0.35})`;
        ctx.lineWidth = 10 + pulse * 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Vivid Orange Molten Flow
        ctx.strokeStyle = `rgba(249, 115, 22, ${0.85 + pulse * 0.15})`;
        ctx.lineWidth = 4.5 + pulse * 1.5;
        ctx.stroke();

        // Incandescent White/Yellow Core
        ctx.strokeStyle = `rgba(255, 240, 160, ${0.9 + pulse * 0.1})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      });

      ctx.restore();
    }

    drawEmbers() {
      const { ctx } = this;
      ctx.save();

      for (const em of this.embers) {
        ctx.fillStyle = em.color;
        ctx.globalAlpha = em.alpha;
        ctx.shadowColor = em.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(em.x, em.y, em.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    drawEruptionClimax(w, h, cx, cy) {
      const { ctx, time, eruptionProgress } = this;
      ctx.save();

      const fH = h * 0.48 * eruptionProgress;

      // 1. Towering Pyroclastic Magma Fountain (Center Geyser)
      const fountainGrad = ctx.createLinearGradient(cx, cy, cx, cy - fH);
      fountainGrad.addColorStop(0, '#ffffff');
      fountainGrad.addColorStop(0.2, '#ffd60a');
      fountainGrad.addColorStop(0.6, '#f97316');
      fountainGrad.addColorStop(0.9, '#dc2626');
      fountainGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = fountainGrad;
      ctx.shadowColor = '#ffd60a';
      ctx.shadowBlur = 24 * eruptionProgress;

      // Swaying column
      const sway = Math.sin(time * 6) * 14;
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy);
      ctx.quadraticCurveTo(cx - 38, cy - fH * 0.5, cx + sway - 12, cy - fH);
      ctx.lineTo(cx + sway + 12, cy - fH);
      ctx.quadraticCurveTo(cx + 38, cy - fH * 0.5, cx + 24, cy);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // 2. Flying Magma Bombs with Trails
      for (const b of this.bombs) {
        if (b.trail.length > 1) {
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.6)';
          ctx.lineWidth = b.size * 0.7;
          ctx.beginPath();
          ctx.moveTo(b.trail[0].x, b.trail[0].y);
          for (let k = 1; k < b.trail.length; k++) {
            ctx.lineTo(b.trail[k].x, b.trail[k].y);
          }
          ctx.stroke();
        }

        // Bomb Core
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffd60a';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 3. Radiant Thermal Auroral Shockwave
      const shockGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.6);
      shockGrad.addColorStop(0, `rgba(255, 214, 10, ${0.45 * eruptionProgress})`);
      shockGrad.addColorStop(0.4, `rgba(244, 63, 94, ${0.28 * eruptionProgress})`);
      shockGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = shockGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
    }
  }

  window.FireVolcanoEruption = FireVolcanoEruption;
})();
