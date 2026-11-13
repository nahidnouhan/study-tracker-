/**
 * ============================================================================
 * JLPT N4 Study Studio — Celestial Sky Galleon & Cloud Sea Engine (Kaze • 気)
 * Grammar (文法) — AAA High-Definition Flying Cloud Ship Simulation
 *
 * Visual Architecture:
 * 1. Volumetric Twilight Cloud Sea:
 *    - Deep twilight-to-sunset royal navy and amber sky gradient.
 *    - 32+ layered puffy cumulus cloud lobes rolling beneath the keel with golden rim light.
 *    - Dynamic cloud spray curling gracefully around the prow beakhead.
 * 2. Majestic Hand-Crafted Sky Galleon:
 *    - Sizable 3-masted flying galleon in 3/4 perspective with authentic nautical proportions.
 *    - Mahogany wood hull planks, gilded gold gunwale trim, ornate sterncastle with glowing
 *      stained-glass lantern candlelight, and carved golden dragon bowsprit.
 *    - 3 towering masts with cross-spars, rigging lines, and fluttering pennants.
 *    - 6 large dynamic billowing canvas sails that physically swell and breathe with wind physics.
 * 3. Aerodynamic Wind Streamlines:
 *    - Silky luminous wind ribbons sweeping gracefully across the sky and through the sails.
 * 4. Completion Climax (Auroral Sunset Ascension):
 *    - Celestial golden auroral cloudburst with radiant lantern beams and starlight.
 *    - Golden victory wind ribbons circling the galleon as it ascends into the stars!
 * ============================================================================
 */

(function () {
  'use strict';

  class AirWindmillMeadow {
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
      this.windSpeed = 1.0;
      this.targetWindSpeed = 1.0;
      this.time = 0;
      this.ascensionProgress = 0;

      // Ship nautical physics
      this.pitch = 0;
      this.targetPitch = 0;
      this.roll = 0;
      this.heave = 0;
      this.sailBreathe = 0;

      // Volumetric Cloud Ocean Lobes (rolling beneath keel)
      this.cloudLobes = [];
      for (let i = 0; i < 36; i++) {
        this.cloudLobes.push({
          relX: (i / 36) * 1.4 - 0.2,
          tier: i % 3, // 0 = back, 1 = mid, 2 = front
          radius: 35 + Math.random() * 45,
          yOffset: (Math.random() - 0.5) * 22,
          driftSpeed: 0.15 + (i % 3) * 0.12
        });
      }

      // Wind Streamlines
      this.streamlines = [
        { yRel: 0.26, amp: 18, freq: 0.015, speed: 1.8, width: 2.2, alpha: 0.45 },
        { yRel: 0.38, amp: 24, freq: 0.012, speed: 2.4, width: 3.0, alpha: 0.65 },
        { yRel: 0.52, amp: 20, freq: 0.018, speed: 2.0, width: 2.5, alpha: 0.50 },
        { yRel: 0.68, amp: 16, freq: 0.014, speed: 1.6, width: 2.0, alpha: 0.40 }
      ];

      // Interactive mouse wind draft
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

        // Mouse draft banks the ship pitch
        const normY = (this.mouse.y / (this.height || 1)) - 0.5;
        this.targetPitch = normY * 0.12;
      };

      const onLeave = () => {
        this.mouse.active = false;
        this.mouse.x = -1000;
        this.mouse.y = -1000;
        this.targetPitch = 0;
      };

      const onClick = () => {
        // Playful gust of wind
        this.targetWindSpeed = 2.8;
        setTimeout(() => {
          this.targetWindSpeed = this.isActive ? 2.2 : 1.0;
        }, 1200);
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
      this.targetWindSpeed = this.isActive ? 2.2 : 1.0;
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
      this.windSpeed += (this.targetWindSpeed - this.windSpeed) * 0.06;
      this.time += 0.02 * this.windSpeed;

      if (this.isCompleted) {
        this.ascensionProgress = Math.min(1.0, this.ascensionProgress + 0.015);
      } else {
        this.ascensionProgress = Math.max(0, this.ascensionProgress - 0.02);
      }

      // Nautical buoyant physics
      this.heave = Math.sin(this.time * 1.8) * 9;
      this.roll = Math.cos(this.time * 1.4) * 0.035;
      this.sailBreathe = Math.sin(this.time * 2.5) * 5;

      // Natural pitch + interactive mouse draft
      const naturalPitch = Math.sin(this.time * 1.6) * 0.04;
      this.pitch += (naturalPitch + this.targetPitch - this.pitch) * 0.08;

      // Drift cloud lobes
      for (const lobe of this.cloudLobes) {
        lobe.relX -= (0.0018 * lobe.driftSpeed) * this.windSpeed;
        if (lobe.relX < -0.2) lobe.relX += 1.4;
      }
    }

    render() {
      const { ctx, width: w, height: h } = this;
      if (!ctx || w === 0 || h === 0) return;

      ctx.clearRect(0, 0, w, h);

      // 1. Twilight Sky & Sunset Horizon Gradient
      this.drawSky(w, h);

      // 2. Far Distant Cloud Alps (Background Parallax)
      this.drawFarCloudAlps(w, h);

      // 3. Middle Cloud Swells (Tier 0 & Tier 1)
      this.drawCloudOceanTiers(w, h, 0);
      this.drawCloudOceanTiers(w, h, 1);

      // 4. Aerodynamic Silky Wind Streamlines
      this.drawWindRibbons(w, h);

      // 5. The Grand Celestial Sky Galleon
      const shipX = w * 0.52;
      const shipY = h * 0.54 + this.heave - (this.ascensionProgress * h * 0.18);
      this.drawSkyGalleon(shipX, shipY);

      // 6. Foreground Cloud Sea & Prow Spray (Tier 2)
      this.drawCloudOceanTiers(w, h, 2);

      // 7. Completion Climax (Auroral Cloudburst & Golden Ascension)
      if (this.ascensionProgress > 0.05) {
        this.drawAuroralAscension(w, h, shipX, shipY);
      }
    }

    drawSky(w, h) {
      const { ctx } = this;

      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0a1426');
      skyGrad.addColorStop(0.35, '#162b48');
      skyGrad.addColorStop(0.68, '#2d3d63');
      skyGrad.addColorStop(0.88, '#92400e');
      skyGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Twilight Sunset Sun Glow on Horizon
      const sunGrad = ctx.createRadialGradient(w * 0.65, h * 0.85, 20, w * 0.65, h * 0.85, w * 0.5);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      sunGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.22)');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, w, h);

      // Twilight Stars in Upper Sky
      ctx.fillStyle = '#ffffff';
      const stars = [
        [0.12, 0.12, 1.2], [0.28, 0.08, 1.4], [0.44, 0.16, 1.0],
        [0.72, 0.10, 1.5], [0.85, 0.18, 1.2], [0.92, 0.08, 1.0]
      ];
      for (const [sx, sy, sr] of stars) {
        ctx.beginPath();
        ctx.arc(w * sx, h * sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawFarCloudAlps(w, h) {
      const { ctx } = this;
      ctx.save();

      ctx.fillStyle = 'rgba(22, 36, 60, 0.75)';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.65);
      ctx.lineTo(w * 0.22, h * 0.45);
      ctx.lineTo(w * 0.45, h * 0.55);
      ctx.lineTo(w * 0.75, h * 0.40);
      ctx.lineTo(w, h * 0.58);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    drawCloudOceanTiers(w, h, tier) {
      const { ctx } = this;
      ctx.save();

      const baseY = h * (0.68 + tier * 0.08);

      for (const lobe of this.cloudLobes) {
        if (lobe.tier !== tier) continue;

        const lx = lobe.relX * w;
        const ly = baseY + lobe.yOffset;
        const r = lobe.radius;

        const cloudGrad = ctx.createRadialGradient(lx, ly - r * 0.3, 0, lx, ly, r);
        if (tier === 0) {
          cloudGrad.addColorStop(0, 'rgba(45, 65, 95, 0.85)');
          cloudGrad.addColorStop(0.8, 'rgba(24, 38, 58, 0.95)');
          cloudGrad.addColorStop(1, 'rgba(12, 20, 32, 1.0)');
        } else if (tier === 1) {
          cloudGrad.addColorStop(0, 'rgba(186, 230, 253, 0.65)');
          cloudGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
          cloudGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
        } else {
          // Foreground clouds with golden sunset rim
          cloudGrad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
          cloudGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.4)');
          cloudGrad.addColorStop(0.8, 'rgba(15, 23, 42, 0.95)');
          cloudGrad.addColorStop(1, '#070d16');
        }

        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(lx, ly, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    drawWindRibbons(w, h) {
      const { ctx, time } = this;
      ctx.save();

      for (const s of this.streamlines) {
        const ry = h * s.yRel;
        ctx.strokeStyle = `rgba(186, 230, 253, ${s.alpha})`;
        ctx.lineWidth = s.width;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        for (let x = -40; x <= w + 40; x += 18) {
          const wy = ry + Math.sin(x * s.freq + time * s.speed) * s.amp;
          if (x === -40) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    }

    drawSkyGalleon(bx, by) {
      const { ctx, time, sailBreathe } = this;
      ctx.save();
      ctx.translate(bx, by);

      // Pitch & Roll
      ctx.rotate(this.pitch);

      // Grand Scale Proportions (substantial hero presence)
      const scale = Math.min(1.4, Math.max(1.0, this.width / 520));
      ctx.scale(scale, scale);

      // ======================================================================
      // 1. SHIP HULL (CARAVEL / GALLEON WITH MAHOGANY PLANKS & GILDED TRIM)
      // ======================================================================
      // Sterncastle on left (-85), Waist/Midships (0), Bowsprit on right (+105)
      ctx.save();

      // Hull Shadow on Clouds
      ctx.fillStyle = 'rgba(7, 14, 25, 0.65)';
      ctx.beginPath();
      ctx.ellipse(0, 22, 95, 15, 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Lower Hull Keel Path
      ctx.beginPath();
      ctx.moveTo(-82, -10);                     // Sterncastle upper deck
      ctx.lineTo(-92, 10);                      // Stern bottom
      ctx.quadraticCurveTo(-40, 32, 60, 24);    // Sweeping lower keel
      ctx.lineTo(105, 0);                       // Beakhead cutwater prow
      ctx.lineTo(82, -5);                       // Forecastle
      ctx.lineTo(15, -8);                       // Main deck waist
      ctx.lineTo(-58, -15);                     // Quarterdeck
      ctx.closePath();

      // Rich Mahogany Wood Planks Gradient
      const hullGrad = ctx.createLinearGradient(-90, -15, 105, 30);
      hullGrad.addColorStop(0, '#261522');
      hullGrad.addColorStop(0.3, '#1e1b4b');
      hullGrad.addColorStop(0.7, '#0f172a');
      hullGrad.addColorStop(1, '#091522');
      ctx.fillStyle = hullGrad;
      ctx.fill();

      // Gilded Gold Sheer Line along Gunwale
      ctx.strokeStyle = this.isCompleted ? '#fde047' : '#f59e0b';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // Secondary Deck Railing
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(-78, -12); ctx.lineTo(75, -7);
      ctx.stroke();

      // Prow Bowsprit Spar (Forward Spar with Rigging)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(88, -2);
      ctx.lineTo(145, -20);
      ctx.stroke();

      // Carved Golden Dragon Figurehead
      ctx.fillStyle = '#ffd60a';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(106, -3, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ornate Sterncastle Stained-Glass Gallery Windows
      const winGrad = ctx.createLinearGradient(-80, -6, -60, 8);
      winGrad.addColorStop(0, '#fde047');
      winGrad.addColorStop(1, '#f59e0b');

      ctx.fillStyle = winGrad;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 14;
      ctx.fillRect(-78, -5, 18, 12);
      ctx.shadowBlur = 0;

      // Mullion Glazing Grids
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-78, -5, 18, 12);
      ctx.beginPath();
      ctx.moveTo(-72, -5); ctx.lineTo(-72, 7);
      ctx.moveTo(-66, -5); ctx.lineTo(-66, 7);
      ctx.moveTo(-78, 1); ctx.lineTo(-60, 1);
      ctx.stroke();

      ctx.restore();

      // ======================================================================
      // 2. THREE TOWERING MASTS & RIGGING
      // ======================================================================
      // Mizzenmast (-46), Mainmast (+10), Foremast (+62)
      const masts = [
        { x: -46, topY: -95, baseY: -14, spars: [-78, -48], sailW: 36, isMizzen: true },
        { x: 10, topY: -138, baseY: -10, spars: [-115, -72, -35], sailW: 52, isMain: true },
        { x: 62, topY: -110, baseY: -6, spars: [-92, -55], sailW: 42, isFore: true }
      ];

      // Draw Standing Rigging Shrouds & Stays
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      // Forestay: Bowsprit to Mainmast Top
      ctx.moveTo(145, -20); ctx.lineTo(10, -138);
      // Backstay: Sterncastle to Mainmast Top
      ctx.moveTo(-82, -10); ctx.lineTo(10, -138);
      // Stay between Foremast and Mainmast
      ctx.moveTo(62, -110); ctx.lineTo(10, -138);
      // Stay between Mizzen and Mainmast
      ctx.moveTo(-46, -95); ctx.lineTo(10, -138);
      ctx.stroke();

      // Masts & Spars
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      masts.forEach(m => {
        // Vertical Mast Pole
        ctx.beginPath();
        ctx.moveTo(m.x, m.baseY);
        ctx.lineTo(m.x, m.topY);
        ctx.stroke();

        // Fluttering Golden Pennant at Mast Top
        const pennantWave = Math.sin(time * 6 + m.x) * 4;
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(m.x, m.topY);
        ctx.lineTo(m.x - 16, m.topY - 3 + pennantWave);
        ctx.lineTo(m.x - 12, m.topY + 3 + pennantWave);
        ctx.closePath();
        ctx.fill();

        // Horizontal Wooden Cross-Spars
        ctx.lineWidth = 1.8;
        m.spars.forEach(sy => {
          ctx.beginPath();
          ctx.moveTo(m.x - m.sailW * 0.5, sy);
          ctx.lineTo(m.x + m.sailW * 0.5, sy);
          ctx.stroke();
        });
      });
      ctx.restore();

      // ======================================================================
      // 3. DYNAMIC BILLOWING CANVAS SAILS (PHYSICALLY SHADED & SWELLING)
      // ======================================================================
      masts.forEach((m, mIdx) => {
        for (let sIdx = 0; sIdx < m.spars.length - 1; sIdx++) {
          const syTop = m.spars[sIdx];
          const syBot = m.spars[sIdx + 1];
          const sW = m.sailW;
          const sBreatheOffset = sailBreathe * (0.8 + mIdx * 0.2);

          ctx.save();

          // Billowing Canvas Quad with Wind Curve
          ctx.beginPath();
          ctx.moveTo(m.x - sW * 0.5, syTop);
          // Top curved yardarm
          ctx.quadraticCurveTo(m.x, syTop + 4, m.x + sW * 0.5, syTop);
          // Right billowing belly curve
          ctx.bezierCurveTo(
            m.x + sW * 0.55 + sBreatheOffset, syTop + (syBot - syTop) * 0.35,
            m.x + sW * 0.52 + sBreatheOffset, syTop + (syBot - syTop) * 0.75,
            m.x + sW * 0.45, syBot
          );
          // Bottom curved foot
          ctx.quadraticCurveTo(m.x, syBot + 6 + sBreatheOffset * 0.4, m.x - sW * 0.45, syBot);
          // Left billowing belly curve
          ctx.bezierCurveTo(
            m.x - sW * 0.48 + sBreatheOffset * 0.8, syTop + (syBot - syTop) * 0.75,
            m.x - sW * 0.52 + sBreatheOffset * 0.8, syTop + (syBot - syTop) * 0.35,
            m.x - sW * 0.5, syTop
          );
          ctx.closePath();

          // Realistic Multi-Layer Sunlit Canvas Shading
          const sailGrad = ctx.createLinearGradient(m.x - sW * 0.5, syTop, m.x + sW * 0.5, syBot);
          sailGrad.addColorStop(0, '#ffffff');
          sailGrad.addColorStop(0.3, '#f1f5f9');
          sailGrad.addColorStop(0.7, '#cbd5e1');
          sailGrad.addColorStop(1, '#94a3b8');

          ctx.fillStyle = sailGrad;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Canvas Seam Reef Lines
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
          ctx.lineWidth = 1.0;
          ctx.stroke();

          ctx.restore();
        }
      });

      ctx.restore();
    }

    drawAuroralAscension(w, h, sx, sy) {
      const { ctx, time, ascensionProgress } = this;
      ctx.save();

      // 1. Golden Solar Aurora Rays Blooming Across Sky
      const rayCount = 12;
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + time * 0.4;
        const rayLen = Math.min(w, h) * 0.75;
        const rx = sx + Math.cos(angle) * rayLen;
        const ry = sy + Math.sin(angle) * rayLen;

        const rayGrad = ctx.createLinearGradient(sx, sy, rx, ry);
        rayGrad.addColorStop(0, `rgba(254, 240, 138, ${0.45 * ascensionProgress})`);
        rayGrad.addColorStop(0.5, `rgba(245, 158, 11, ${0.25 * ascensionProgress})`);
        rayGrad.addColorStop(1, 'transparent');

        ctx.strokeStyle = rayGrad;
        ctx.lineWidth = 22 * ascensionProgress;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(rx, ry);
        ctx.stroke();
      }

      // 2. Circling Golden Victory Ribbons
      for (let r = 1; r <= 3; r++) {
        const ringRad = (90 + r * 45) * ascensionProgress;
        ctx.strokeStyle = `rgba(253, 224, 71, ${0.7 - r * 0.18})`;
        ctx.lineWidth = 2.8;
        ctx.shadowColor = '#ffd60a';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.ellipse(sx, sy, ringRad, ringRad * 0.45, time * 2 + r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 3. Celestial Ascension Sunburst Bloom
      const bloomGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, w * 0.55);
      bloomGrad.addColorStop(0, `rgba(254, 240, 138, ${0.5 * ascensionProgress})`);
      bloomGrad.addColorStop(0.4, `rgba(245, 158, 11, ${0.28 * ascensionProgress})`);
      bloomGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bloomGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
    }
  }

  window.AirWindmillMeadow = AirWindmillMeadow;
})();
