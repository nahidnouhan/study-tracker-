/**
 * ============================================================================
 * JLPT N4 Study Studio — Living Rising Mountain & Crystal Citadel Engine (Tsuchi • 土)
 * Kanji (漢字) — AAA High-Definition Ancient Mountain & Crystal Monolith Simulation
 *
 * Visual Architecture:
 * 1. Ancient Monumental Granite & Quartz Spires:
 *    - Deep amber-to-obsidian canyon chasm with step-faceted geological strata.
 *    - Subterranean golden quartz veins pulsing with warm resonance.
 * 2. True 3D-Faceted Levitating Crystal Monoliths:
 *    - Solid polygonal crystal monoliths with light specular highlights, internal refraction,
 *      and glowing radiant amber crystal cores.
 *    - Gravitational buoyancy: authentic magnetic bobbing and slow angular drift.
 *    - Floating orbiting quartz shards.
 * 3. Interactive Seismic Resonance:
 *    - Mouse movement and clicks emit concentric golden seismic shockwave rings.
 * 4. Completion Climax (MOUNTAIN RAISING FROM EARTH):
 *    - Monumental stone pillars and crystal towers erupt and ascend from subterranean depths!
 *    - Radiant golden sunburst bloom and expanding seismic rings!
 * ============================================================================
 */

(function () {
  'use strict';

  class EarthMountainRise {
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
      this.seismicSpeed = 1.0;
      this.targetSeismicSpeed = 1.0;
      this.time = 0;
      this.riseProgress = 0;

      // 3D-Faceted Levitating Monoliths
      this.monoliths = [
        { bx: 0.22, by: 0.52, size: 32, bobPhase: 0.0, rotSpeed: 0.008, shards: [] },
        { bx: 0.78, by: 0.48, size: 38, bobPhase: 2.2, rotSpeed: -0.006, shards: [] },
        { bx: 0.50, by: 0.36, size: 48, bobPhase: 4.4, rotSpeed: 0.010, isGrand: true, shards: [] }
      ];

      // Generate orbiting shards around each monolith
      this.monoliths.forEach(m => {
        const count = m.isGrand ? 5 : 3;
        for (let i = 0; i < count; i++) {
          m.shards.push({
            orbitRad: m.size * (1.3 + Math.random() * 0.8),
            angle: Math.random() * Math.PI * 2,
            speed: 0.015 + Math.random() * 0.02,
            size: 3 + Math.random() * 4
          });
        }
      });

      // Interactive Seismic Shockwaves
      this.shockwaves = [];
      this.mouse = { x: -1000, y: -1000, active: false };

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

        if (Math.random() < 0.35 && this.shockwaves.length < 8) {
          this.shockwaves.push({
            x: this.mouse.x,
            y: Math.max(this.mouse.y, this.height * 0.48),
            radius: 4,
            maxRadius: 65,
            alpha: 0.85
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
        this.shockwaves.push({
          x: mx,
          y: my,
          radius: 6,
          maxRadius: 110,
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
      this.targetSeismicSpeed = this.isActive ? 2.2 : 1.0;
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
      this.seismicSpeed += (this.targetSeismicSpeed - this.seismicSpeed) * 0.06;
      this.time += 0.02 * this.seismicSpeed;

      if (this.isCompleted) {
        this.riseProgress = Math.min(1.0, this.riseProgress + 0.015);
      } else {
        this.riseProgress = Math.max(0, this.riseProgress - 0.02);
      }

      // Update orbiting shards
      this.monoliths.forEach(m => {
        m.shards.forEach(sh => {
          sh.angle += sh.speed * this.seismicSpeed;
        });
      });

      // Update shockwaves
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.radius += 2.2 * this.seismicSpeed;
        sw.alpha -= 0.018;
        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          this.shockwaves.splice(i, 1);
        }
      }
    }

    render() {
      const { ctx, width: w, height: h } = this;
      if (!ctx || w === 0 || h === 0) return;

      ctx.clearRect(0, 0, w, h);

      // 1. Warm Amber Cosmic Sky Backdrop
      this.drawAmberSky(w, h);

      // 2. Far Jagged Canyon Ridges (Distant Layers)
      this.drawFarCanyonRidges(w, h);

      // 3. Central Monumental Mountain Spire & Geological Strata
      this.drawMountainSpire(w, h);

      // 4. Solid 3D-Faceted Levitating Crystal Monoliths & Orbiting Shards
      this.drawFacetedMonoliths(w, h);

      // 5. Interactive Seismic Shockwaves
      this.drawShockwaves();

      // 6. Completion Climax (Monumental Spires Ascending from Earth)
      if (this.riseProgress > 0.05) {
        this.drawMountainAscension(w, h);
      }
    }

    drawAmberSky(w, h) {
      const { ctx, time } = this;

      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0c0702');
      skyGrad.addColorStop(0.35, '#1a1005');
      skyGrad.addColorStop(0.7, '#331e08');
      skyGrad.addColorStop(1, '#140c03');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Deep subterranean resonant core glow
      const pulse = Math.sin(time * 2.2) * 0.08;
      const coreGrad = ctx.createRadialGradient(w * 0.5, h * 0.65, 10, w * 0.5, h * 0.65, w * 0.6);
      coreGrad.addColorStop(0, `rgba(245, 158, 11, ${0.35 + pulse})`);
      coreGrad.addColorStop(0.4, `rgba(217, 119, 6, ${0.18 + pulse * 0.5})`);
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, w, h);
    }

    drawFarCanyonRidges(w, h) {
      const { ctx } = this;
      ctx.save();

      // Far Ridge 1 (Deep Ochre Silhouette)
      ctx.fillStyle = '#140c04';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.52);
      ctx.lineTo(w * 0.26, h * 0.35);
      ctx.lineTo(w * 0.44, h * 0.45);
      ctx.lineTo(w * 0.74, h * 0.28);
      ctx.lineTo(w, h * 0.45);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Far Ridge 2 (Step-Faceted Closer)
      ctx.fillStyle = '#1e1206';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.64);
      ctx.lineTo(w * 0.32, h * 0.48);
      ctx.lineTo(w * 0.52, h * 0.55);
      ctx.lineTo(w * 0.82, h * 0.42);
      ctx.lineTo(w, h * 0.55);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    drawMountainSpire(w, h) {
      const { ctx, time, riseProgress } = this;
      ctx.save();

      const riseOffset = riseProgress * (h * 0.16);
      const spireX = w * 0.5;
      const spireY = h * 0.32 - riseOffset;

      // 1. Shaded Granite Mountain Mass
      const mtnGrad = ctx.createLinearGradient(spireX, spireY, spireX, h);
      mtnGrad.addColorStop(0, '#2e1c0a');
      mtnGrad.addColorStop(0.4, '#1c1106');
      mtnGrad.addColorStop(1, '#0c0702');

      ctx.fillStyle = mtnGrad;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.82);
      ctx.lineTo(w * 0.26, h * 0.58 - riseOffset * 0.5);
      ctx.lineTo(spireX, spireY);
      ctx.lineTo(w * 0.74, h * 0.58 - riseOffset * 0.5);
      ctx.lineTo(w, h * 0.82);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // 2. Central Vertical Cleavage Ridge (Light on left, shadow on right)
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(spireX, spireY);
      ctx.lineTo(spireX, h);
      ctx.stroke();

      // 3. Step-Faceted Geological Strata (Glowing Amber Quartz Fissures)
      const pulse = (Math.sin(time * 3) + 1) * 0.5;
      const strata = [
        spireY + 32,
        spireY + 75,
        spireY + 125,
        spireY + 180
      ];

      for (let i = 0; i < strata.length; i++) {
        const sy = strata[i];
        if (sy > h) continue;
        const spread = (sy - spireY) * 0.65;

        // Glowing fissure outer
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.5 + pulse * 0.4})`;
        ctx.lineWidth = 3.5 + pulse;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(spireX - spread, sy);
        ctx.lineTo(spireX, sy - 8);
        ctx.lineTo(spireX + spread, sy);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Incandescent inner line
        ctx.strokeStyle = 'rgba(254, 243, 199, 0.9)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      ctx.restore();
    }

    drawFacetedMonoliths(w, h) {
      const { ctx, time } = this;
      ctx.save();

      this.monoliths.forEach(m => {
        const bob = Math.sin(time * 2.2 + m.bobPhase) * 8;
        const mx = w * m.bx;
        const my = h * m.by + bob;
        const s = m.size;

        // Draw Orbiting Quartz Shards first (background)
        m.shards.forEach(sh => {
          const sx = mx + Math.cos(sh.angle) * sh.orbitRad;
          const sy = my + Math.sin(sh.angle) * (sh.orbitRad * 0.4);

          ctx.fillStyle = '#fef3c7';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.ellipse(sx, sy, sh.size, sh.size * 0.6, sh.angle, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // ====================================================================
        // TRUE 3D FACETED CRYSTAL MONOLITH
        // ====================================================================
        // Facet 1: Top Apex Pyramid (Sunlit Specular Highlight)
        const topGrad = ctx.createLinearGradient(mx, my - s, mx, my);
        topGrad.addColorStop(0, '#fef08a');
        topGrad.addColorStop(1, '#f59e0b');

        ctx.fillStyle = topGrad;
        ctx.beginPath();
        ctx.moveTo(mx, my - s);
        ctx.lineTo(mx + s * 0.6, my - s * 0.2);
        ctx.lineTo(mx, my + s * 0.1);
        ctx.lineTo(mx - s * 0.6, my - s * 0.2);
        ctx.closePath();
        ctx.fill();

        // Facet 2: Left Flank (Rich Amber Mid-Tone)
        const leftGrad = ctx.createLinearGradient(mx - s * 0.6, my, mx, my);
        leftGrad.addColorStop(0, '#d97706');
        leftGrad.addColorStop(1, '#b45309');

        ctx.fillStyle = leftGrad;
        ctx.beginPath();
        ctx.moveTo(mx, my + s * 0.1);
        ctx.lineTo(mx - s * 0.6, my - s * 0.2);
        ctx.lineTo(mx - s * 0.4, my + s * 0.8);
        ctx.lineTo(mx, my + s);
        ctx.closePath();
        ctx.fill();

        // Facet 3: Right Flank (Deep Golden Shadow)
        const rightGrad = ctx.createLinearGradient(mx, my, mx + s * 0.6, my);
        rightGrad.addColorStop(0, '#92400e');
        rightGrad.addColorStop(1, '#78350f');

        ctx.fillStyle = rightGrad;
        ctx.beginPath();
        ctx.moveTo(mx, my + s * 0.1);
        ctx.lineTo(mx + s * 0.6, my - s * 0.2);
        ctx.lineTo(mx + s * 0.4, my + s * 0.8);
        ctx.lineTo(mx, my + s);
        ctx.closePath();
        ctx.fill();

        // Glowing Crystal Outline & Edges
        ctx.strokeStyle = m.isGrand ? '#fbbf24' : '#f59e0b';
        ctx.lineWidth = 2.0;
        ctx.stroke();

        // Glowing Core in Grand Central Monolith
        if (m.isGrand) {
          const coreGrad = ctx.createRadialGradient(mx, my, 0, mx, my, s * 0.65);
          coreGrad.addColorStop(0, '#ffffff');
          coreGrad.addColorStop(0.35, '#fbbf24');
          coreGrad.addColorStop(1, 'transparent');

          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(mx, my, s * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.restore();
    }

    drawShockwaves() {
      const { ctx } = this;
      ctx.save();

      for (const sw of this.shockwaves) {
        ctx.strokeStyle = `rgba(251, 191, 36, ${sw.alpha})`;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(sw.x, sw.y, sw.radius, sw.radius * 0.42, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    }

    drawMountainAscension(w, h) {
      const { ctx, riseProgress } = this;
      ctx.save();

      const cx = w * 0.5;
      const cy = h * 0.35;

      // 1. Massive Ancient Monolithic Towers Ascending
      const pillars = [-2, -1, 0, 1, 2];
      pillars.forEach(p => {
        const px = cx + p * (w * 0.17);
        const pH = (h * 0.55) * riseProgress;
        const py = h - pH;
        const pW = 24 + Math.abs(p) * 6;

        const pGrad = ctx.createLinearGradient(px, py, px, h);
        pGrad.addColorStop(0, '#fef08a');
        pGrad.addColorStop(0.25, '#fbbf24');
        pGrad.addColorStop(0.7, '#d97706');
        pGrad.addColorStop(1, '#78350f');

        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + pW * 0.5, py + pW * 0.6);
        ctx.lineTo(px + pW * 0.5, h);
        ctx.lineTo(px - pW * 0.5, h);
        ctx.lineTo(px - pW * 0.5, py + pW * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      });

      // 2. Concentric Golden Seismic Shockwaves
      for (let r = 1; r <= 3; r++) {
        const rad = (w * 0.18 * r) * riseProgress;
        ctx.strokeStyle = `rgba(254, 243, 199, ${0.75 - r * 0.2})`;
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 40, rad, rad * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Radiant Golden Sunburst Bloom
      const bloomGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.6);
      bloomGrad.addColorStop(0, `rgba(251, 191, 36, ${0.5 * riseProgress})`);
      bloomGrad.addColorStop(0.5, `rgba(217, 119, 6, ${0.25 * riseProgress})`);
      bloomGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bloomGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
    }
  }

  window.EarthMountainRise = EarthMountainRise;
})();
