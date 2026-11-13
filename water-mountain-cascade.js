/**
 * ============================================================================
 * JLPT N4 Study Studio — Living Mountain Waterfall & Wave Cascade Engine (Mizu • 水)
 * Listening (聴解) — AAA High-Definition Mountain Waterfall Simulation
 *
 * Visual Architecture:
 * 1. Deep Mountain Chasm & Rocky Gorge:
 *    - Towering dark granite cliffs with tiered ledges, mossy crags, and alpine pines.
 *    - Misty atmospheric depth with multi-layered cliff silhouettes.
 * 2. Cascading Fluid Waterfall Torrents:
 *    - Continuous fluid waterfall streams cascading down rocky tiers.
 *    - 140+ cascading water droplets and spray beads tumbling with realistic gravity.
 *    - Volumetric billowing plunge mist swirling at the base basin.
 * 3. Deep Mountain Lake:
 *    - Undulating wave currents with light caustics and reflective surface.
 *    - Interactive expanding ripples on mouse movement and click.
 * 4. Completion Climax (Tidal Wave Surge & Prismatic Rainbow):
 *    - Brilliant multi-hue mist rainbow arcs across the gorge!
 *    - Giant curling tidal wave crest surges across the lake with bioluminescent glowing foam!
 * ============================================================================
 */

(function () {
  'use strict';

  class WaterMountainCascade {
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
      this.flowSpeed = 1.0;
      this.targetFlowSpeed = 1.0;
      this.time = 0;
      this.surgeProgress = 0;

      // Waterfall Cascading Stream Droplets
      this.droplets = [];
      for (let i = 0; i < 120; i++) {
        this.droplets.push(this.createDroplet(true));
      }

      // Plunge Mist Clouds
      this.mistPuffs = [];
      for (let i = 0; i < 20; i++) {
        this.mistPuffs.push({
          x: 0,
          y: 0,
          vx: (Math.random() - 0.5) * 0.9,
          vy: -0.8 - Math.random() * 1.2,
          radius: 18 + Math.random() * 24,
          alpha: Math.random() * 0.4,
          age: Math.random()
        });
      }

      // Interactive ripples
      this.ripples = [];
      this.mouse = { x: -1000, y: -1000, active: false };

      this.initEvents();
      this.resize();
      this.start();
    }

    createDroplet(randomY = false) {
      const topY = 0;
      const plungeY = this.height * 0.68 || 280;
      return {
        tier: Math.random() > 0.4 ? 1 : 2,
        x: (this.width * 0.44 || 220) + (Math.random() - 0.5) * ((this.width * 0.18) || 80),
        y: randomY ? Math.random() * plungeY : topY - Math.random() * 20,
        vy: 4.5 + Math.random() * 5.5,
        vx: (Math.random() - 0.5) * 0.8,
        length: 8 + Math.random() * 14,
        width: 1.5 + Math.random() * 2.0,
        alpha: 0.6 + Math.random() * 0.4
      };
    }

    initEvents() {
      if (!this.canvas) return;

      const onMove = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.mouse.active = true;

        if (Math.random() < 0.4 && this.ripples.length < 15) {
          this.ripples.push({
            x: this.mouse.x,
            y: Math.max(this.mouse.y, this.height * 0.58),
            radius: 3,
            maxRadius: 45 + Math.random() * 30,
            alpha: 0.8
          });
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
        this.ripples.push({
          x: mx,
          y: Math.max(my, this.height * 0.55),
          radius: 5,
          maxRadius: 90,
          alpha: 1.0
        });
      };

      this.canvas.addEventListener('mousemove', onMove);
      this.canvas.addEventListener('mouseleave', onLeave);
      this.canvas.addEventListener('click', onClick);

      window.addEventListener('resize', () => this.resize());
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
      this.targetFlowSpeed = this.isActive ? 2.2 : 1.0;
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
      this.flowSpeed += (this.targetFlowSpeed - this.flowSpeed) * 0.06;
      this.time += 0.02 * this.flowSpeed;

      if (this.isCompleted) {
        this.surgeProgress = Math.min(1.0, this.surgeProgress + 0.015);
      } else {
        this.surgeProgress = Math.max(0, this.surgeProgress - 0.02);
      }

      const plungeY = this.height * 0.68;
      const fallCenterX = this.width * 0.5;

      // Update cascading droplets
      for (let i = 0; i < this.droplets.length; i++) {
        const d = this.droplets[i];
        d.y += d.vy * this.flowSpeed;
        d.x += d.vx * this.flowSpeed;

        if (d.y >= plungeY) {
          // Splash into basin
          if (Math.random() < 0.15 && this.ripples.length < 15) {
            this.ripples.push({
              x: d.x,
              y: plungeY + (Math.random() - 0.5) * 8,
              radius: 2,
              maxRadius: 22,
              alpha: 0.6
            });
          }
          this.droplets[i] = this.createDroplet(false);
        }
      }

      // Update plunge mist puffs
      for (const puff of this.mistPuffs) {
        puff.age += 0.008 * this.flowSpeed;
        if (puff.age >= 1.0) {
          puff.age = 0;
          puff.x = fallCenterX + (Math.random() - 0.5) * (this.width * 0.25);
          puff.y = plungeY + (Math.random() - 0.5) * 12;
          puff.vx = (Math.random() - 0.5) * 1.2;
          puff.vy = -0.7 - Math.random() * 1.4;
        }
        puff.x += puff.vx;
        puff.y += puff.vy;
        puff.radius = 16 + puff.age * 55;
        puff.alpha = Math.sin(puff.age * Math.PI) * 0.35;
      }

      // Update interactive ripples
      for (let i = this.ripples.length - 1; i >= 0; i--) {
        const r = this.ripples[i];
        r.radius += 1.4 * this.flowSpeed;
        r.alpha -= 0.016;
        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          this.ripples.splice(i, 1);
        }
      }
    }

    render() {
      const { ctx, width: w, height: h } = this;
      if (!ctx || w === 0 || h === 0) return;

      ctx.clearRect(0, 0, w, h);

      // 1. Gorge Twilight Sky Backdrop
      this.drawGorgeSky(w, h);

      // 2. Far Misty Mountain Crags
      this.drawFarMountainRidges(w, h);

      // 3. Massive Dark Granite Cliff Faces
      this.drawCliffWalls(w, h);

      // 4. Multi-Tier Cascading Waterfall Sheet & Torrents
      this.drawWaterfallSheets(w, h);

      // 5. Cascading Droplets (Gravity Streaks)
      this.drawDroplets();

      // 6. Plunge Basin Mist Clouds
      this.drawPlungeMist();

      // 7. Deep Mountain Lake & Wave Currents
      this.drawLake(w, h);

      // 8. Interactive Ripples
      this.drawRipples();

      // 9. Completion Climax (Prismatic Mist Rainbow & Great Wave Surge)
      if (this.surgeProgress > 0.05) {
        this.drawCompletionSurge(w, h);
      }
    }

    drawGorgeSky(w, h) {
      const { ctx } = this;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#040d18');
      grad.addColorStop(0.35, '#081d33');
      grad.addColorStop(0.7, '#0c2c4d');
      grad.addColorStop(1, '#051626');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Soft ambient moonlight behind waterfall
      const moonGrad = ctx.createRadialGradient(w * 0.5, h * 0.22, 10, w * 0.5, h * 0.22, w * 0.5);
      moonGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      moonGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
      moonGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGrad;
      ctx.fillRect(0, 0, w, h);
    }

    drawFarMountainRidges(w, h) {
      const { ctx } = this;
      ctx.save();

      // Ridge 1 (Deep Blue-Grey Silhouette)
      ctx.fillStyle = '#061628';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.45);
      ctx.lineTo(w * 0.28, h * 0.26);
      ctx.lineTo(w * 0.48, h * 0.35);
      ctx.lineTo(w * 0.72, h * 0.24);
      ctx.lineTo(w, h * 0.38);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Ridge 2 (Closer, Darker)
      ctx.fillStyle = '#05111f';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.55);
      ctx.lineTo(w * 0.35, h * 0.38);
      ctx.lineTo(w * 0.52, h * 0.46);
      ctx.lineTo(w * 0.82, h * 0.32);
      ctx.lineTo(w, h * 0.48);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    drawCliffWalls(w, h) {
      const { ctx } = this;
      ctx.save();

      const fallLeft = w * 0.38;
      const fallRight = w * 0.62;

      // Left Giant Granite Cliff Wall
      const leftGrad = ctx.createLinearGradient(0, 0, fallLeft, 0);
      leftGrad.addColorStop(0, '#02070e');
      leftGrad.addColorStop(0.7, '#071626');
      leftGrad.addColorStop(1, '#0e2942');

      ctx.fillStyle = leftGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(fallLeft, 0);
      ctx.bezierCurveTo(fallLeft - 10, h * 0.25, fallLeft - 25, h * 0.5, fallLeft - 45, h * 0.72);
      ctx.lineTo(0, h * 0.76);
      ctx.closePath();
      ctx.fill();

      // Left Rock Strata & Ledge Highlights
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(w * 0.08, h * 0.18); ctx.lineTo(fallLeft - 15, h * 0.24);
      ctx.moveTo(w * 0.05, h * 0.42); ctx.lineTo(fallLeft - 30, h * 0.48);
      ctx.moveTo(w * 0.12, h * 0.62); ctx.lineTo(fallLeft - 50, h * 0.68);
      ctx.stroke();

      // Right Giant Granite Cliff Wall
      const rightGrad = ctx.createLinearGradient(w, 0, fallRight, 0);
      rightGrad.addColorStop(0, '#02070e');
      rightGrad.addColorStop(0.7, '#071626');
      rightGrad.addColorStop(1, '#0e2942');

      ctx.fillStyle = rightGrad;
      ctx.beginPath();
      ctx.moveTo(w, 0);
      ctx.lineTo(fallRight, 0);
      ctx.bezierCurveTo(fallRight + 10, h * 0.25, fallRight + 25, h * 0.5, fallRight + 45, h * 0.72);
      ctx.lineTo(w, h * 0.76);
      ctx.closePath();
      ctx.fill();

      // Right Rock Strata
      ctx.beginPath();
      ctx.moveTo(w * 0.92, h * 0.20); ctx.lineTo(fallRight + 15, h * 0.26);
      ctx.moveTo(w * 0.95, h * 0.45); ctx.lineTo(fallRight + 30, h * 0.50);
      ctx.moveTo(w * 0.88, h * 0.65); ctx.lineTo(fallRight + 50, h * 0.70);
      ctx.stroke();

      // Alpine Pine Silhouettes along cliff ridges
      this.drawPine(ctx, fallLeft - 45, h * 0.15, 20);
      this.drawPine(ctx, fallLeft - 70, h * 0.38, 16);
      this.drawPine(ctx, fallRight + 45, h * 0.18, 22);
      this.drawPine(ctx, fallRight + 65, h * 0.44, 15);

      ctx.restore();
    }

    drawPine(ctx, x, y, size) {
      ctx.fillStyle = '#01050a';
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x - size * 0.45, y - size * 0.35);
      ctx.lineTo(x - size * 0.2, y - size * 0.35);
      ctx.lineTo(x - size * 0.55, y);
      ctx.lineTo(x + size * 0.55, y);
      ctx.lineTo(x + size * 0.2, y - size * 0.35);
      ctx.lineTo(x + size * 0.45, y - size * 0.35);
      ctx.closePath();
      ctx.fill();
    }

    drawWaterfallSheets(w, h) {
      const { ctx, time } = this;
      ctx.save();

      const fallLeft = w * 0.39;
      const fallRight = w * 0.61;
      const fallW = fallRight - fallLeft;
      const plungeY = h * 0.68;

      // 1. Shaded Chute Backdrop (Deep Sapphire Water Column)
      const chuteGrad = ctx.createLinearGradient(fallLeft, 0, fallRight, 0);
      chuteGrad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      chuteGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.75)');
      chuteGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.75)');
      chuteGrad.addColorStop(1, 'rgba(6, 182, 212, 0.35)');

      ctx.fillStyle = chuteGrad;
      ctx.beginPath();
      ctx.moveTo(fallLeft, 0);
      ctx.lineTo(fallRight, 0);
      ctx.bezierCurveTo(fallRight + 12, plungeY * 0.5, fallRight + 20, plungeY * 0.8, fallRight + 25, plungeY);
      ctx.lineTo(fallLeft - 25, plungeY);
      ctx.bezierCurveTo(fallLeft - 20, plungeY * 0.8, fallLeft - 12, plungeY * 0.5, fallLeft, 0);
      ctx.closePath();
      ctx.fill();

      // 2. Flowing Water Ribbons with Natural Sine Wave S-Curves
      const ribbonCount = 14;
      for (let i = 0; i < ribbonCount; i++) {
        const rx = fallLeft + (fallW / (ribbonCount + 1)) * (i + 1);
        const wave = Math.sin(time * 4 + i * 1.2) * 4;

        ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(186, 230, 253, 0.65)';
        ctx.lineWidth = 2.4 + (i % 3) * 0.8;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(rx + wave, 0);
        ctx.bezierCurveTo(
          rx - wave * 1.5, plungeY * 0.35,
          rx + wave * 1.2, plungeY * 0.7,
          rx + (i - ribbonCount / 2) * 3, plungeY
        );
        ctx.stroke();
      }

      // 3. Foaming Rock Ledges (Tier 1 & Tier 2 Drops)
      const ledges = [plungeY * 0.32, plungeY * 0.62];
      for (const ly of ledges) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        for (let x = fallLeft - 10; x <= fallRight + 10; x += 10) {
          const foamH = 3.5 + Math.sin(time * 6 + x) * 2;
          ctx.ellipse(x, ly, 7, foamH, 0, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    }

    drawDroplets() {
      const { ctx } = this;
      ctx.save();

      for (const d of this.droplets) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${d.alpha})`;
        ctx.lineWidth = d.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.vx * 2, d.y + d.length);
        ctx.stroke();
      }

      ctx.restore();
    }

    drawPlungeMist() {
      const { ctx } = this;
      ctx.save();

      for (const puff of this.mistPuffs) {
        if (puff.alpha <= 0.01) continue;

        const mistGrad = ctx.createRadialGradient(
          puff.x, puff.y, 0,
          puff.x, puff.y, puff.radius
        );
        mistGrad.addColorStop(0, `rgba(255, 255, 255, ${puff.alpha * 1.2})`);
        mistGrad.addColorStop(0.4, `rgba(56, 189, 248, ${puff.alpha * 0.7})`);
        mistGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = mistGrad;
        ctx.beginPath();
        ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    drawLake(w, h) {
      const { ctx, time } = this;
      ctx.save();

      const lakeTop = h * 0.67;
      const lakeH = h - lakeTop;

      // Deep Lake Water Gradient
      const lakeGrad = ctx.createLinearGradient(0, lakeTop, 0, h);
      lakeGrad.addColorStop(0, '#062847');
      lakeGrad.addColorStop(0.4, '#041d33');
      lakeGrad.addColorStop(1, '#020d18');
      ctx.fillStyle = lakeGrad;
      ctx.fillRect(0, lakeTop, w, lakeH);

      // Undulating Wave Currents
      const lineCount = 8;
      for (let i = 0; i < lineCount; i++) {
        const ly = lakeTop + (lakeH / (lineCount + 1)) * (i + 1);
        const phase = time * 2.2 + i * 0.9;

        ctx.strokeStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        for (let x = 0; x <= w; x += 16) {
          const wy = ly + Math.sin(x * 0.02 + phase) * (3.5 + i * 0.9);
          if (x === 0) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.stroke();
      }

      ctx.restore();
    }

    drawRipples() {
      const { ctx } = this;
      ctx.save();

      for (const r of this.ripples) {
        ctx.strokeStyle = `rgba(186, 230, 253, ${r.alpha})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    drawCompletionSurge(w, h) {
      const { ctx, time, surgeProgress } = this;
      ctx.save();

      // 1. Prismatic Mist Rainbow Arc over Gorge
      const rainbowY = h * 0.30;
      const rColors = [
        'rgba(244, 63, 94, 0.4)',
        'rgba(245, 158, 11, 0.4)',
        'rgba(16, 185, 129, 0.4)',
        'rgba(56, 189, 248, 0.5)',
        'rgba(168, 85, 247, 0.45)'
      ];

      rColors.forEach((color, idx) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 7 * surgeProgress;
        ctx.beginPath();
        ctx.arc(w * 0.5, rainbowY + idx * 4, w * 0.32, Math.PI * 1.12, Math.PI * 1.88);
        ctx.stroke();
      });

      // 2. Great Wave Crest Surging Across Lake
      const waveY = h * 0.74 + Math.sin(time * 3) * 6;
      const waveGrad = ctx.createLinearGradient(0, waveY - 40, 0, waveY + 25);
      waveGrad.addColorStop(0, '#ffffff');
      waveGrad.addColorStop(0.3, '#38bdf8');
      waveGrad.addColorStop(1, 'rgba(6, 182, 212, 0.2)');

      ctx.fillStyle = waveGrad;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, waveY);

      for (let x = 0; x <= w; x += 18) {
        const cy = waveY + Math.sin(x * 0.015 + time * 4) * (18 * surgeProgress);
        ctx.lineTo(x, cy);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Luminous Foaming Wave Crest Claws
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 18) {
        const cy = waveY + Math.sin(x * 0.015 + time * 4) * (18 * surgeProgress);
        if (x === 0) ctx.moveTo(x, cy);
        else ctx.lineTo(x, cy);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.restore();
    }
  }

  window.WaterMountainCascade = WaterMountainCascade;
})();
