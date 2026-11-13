/**
 * ============================================================================
 * JLPT N4 Study Studio — Living Elemental Koi Pond Engine (Tui & La)
 * Multi-Element Roaming, Leaping, and Color-Morphing Koi Ecosystem
 *
 * Supported Elements:
 * - spirit: Vocabulary (語彙 / 霊) — Pearlescent Moon Pearl & Obsidian Amethyst
 * - air: Grammar (文法 / 気) — Sky Azure Breeze & Golden Sunburst
 * - earth: Kanji (漢字 / 土) — Resonant Amber & Sacred Honey-Gold Topaz
 * - water: Listening (聴解 / 水) — Crystalline Aquamarine & Deep Oceanic Torrent
 * - fire: Reading (読解 / 火) — Solar White Phoenix & Molten Gold Ruby
 * ============================================================================
 */

(function () {
  'use strict';

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpRgb(rgb1, rgb2, t) {
    return [
      Math.round(lerp(rgb1[0], rgb2[0], t)),
      Math.round(lerp(rgb1[1], rgb2[1], t)),
      Math.round(lerp(rgb1[2], rgb2[2], t))
    ];
  }

  function rgbToString(rgb, alpha = 1) {
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
  }

  // 5 Elemental Color Themes
  const THEMES = {
    spirit: {
      name: 'spirit',
      yin: {
        base: [255, 255, 255],
        accent: [192, 132, 252], // #c084fc
        glow: [192, 132, 252],
        fin: [233, 213, 255],
        eye: [255, 255, 255],
        trail: [216, 180, 254]
      },
      yang: {
        base: [34, 22, 58], // Luminous royal amethyst
        accent: [6, 182, 212], // #06b6d4
        glow: [6, 182, 212],
        fin: [168, 85, 247],
        eye: [56, 189, 248],
        trail: [6, 182, 212]
      },
      spore: [192, 132, 252],
      ripple: [192, 132, 252],
      ambientCenter: 'rgba(168, 85, 247, 0.16)'
    },
    air: {
      name: 'air',
      yin: {
        base: [255, 255, 255],
        accent: [56, 189, 248], // #38bdf8
        glow: [56, 189, 248],
        fin: [224, 242, 254],
        eye: [255, 255, 255],
        trail: [56, 189, 248]
      },
      yang: {
        base: [16, 48, 76], // Luminous celestial azure
        accent: [245, 158, 11], // #f59e0b
        glow: [245, 158, 11],
        fin: [254, 240, 138],
        eye: [254, 240, 138],
        trail: [245, 158, 11]
      },
      spore: [254, 240, 138],
      ripple: [56, 189, 248],
      ambientCenter: 'rgba(56, 189, 248, 0.16)'
    },
    earth: {
      name: 'earth',
      yin: {
        base: [255, 251, 235], // #fffbeb
        accent: [251, 191, 36], // #fbbf24
        glow: [251, 191, 36],
        fin: [254, 243, 199],
        eye: [255, 255, 255],
        trail: [251, 191, 36]
      },
      yang: {
        base: [48, 30, 14], // Luminous golden bronze
        accent: [245, 158, 11], // #f59e0b
        glow: [245, 158, 11],
        fin: [217, 119, 6],
        eye: [251, 191, 36],
        trail: [245, 158, 11]
      },
      spore: [251, 191, 36],
      ripple: [245, 158, 11],
      ambientCenter: 'rgba(245, 158, 11, 0.16)'
    },
    water: {
      name: 'water',
      yin: {
        base: [255, 255, 255],
        accent: [6, 182, 212], // #06b6d4
        glow: [6, 182, 212],
        fin: [207, 250, 254],
        eye: [255, 255, 255],
        trail: [6, 182, 212]
      },
      yang: {
        base: [12, 44, 66], // Luminous deep ocean indigo
        accent: [56, 189, 248], // #38bdf8
        glow: [56, 189, 248],
        fin: [14, 165, 233],
        eye: [56, 189, 248],
        trail: [56, 189, 248]
      },
      spore: [56, 189, 248],
      ripple: [6, 182, 212],
      ambientCenter: 'rgba(6, 182, 212, 0.18)'
    },
    fire: {
      name: 'fire',
      yin: {
        base: [255, 241, 242], // #fff1f2
        accent: [251, 113, 133], // #fb7185
        glow: [251, 113, 133],
        fin: [255, 228, 230],
        eye: [255, 255, 255],
        trail: [251, 113, 133]
      },
      yang: {
        base: [50, 14, 26], // Luminous royal ruby
        accent: [255, 214, 10], // #ffd60a
        glow: [244, 63, 94],
        fin: [253, 186, 116],
        eye: [255, 214, 10],
        trail: [255, 214, 10]
      },
      spore: [255, 214, 10],
      ripple: [244, 63, 94],
      ambientCenter: 'rgba(244, 63, 94, 0.18)'
    }
  };

  class ElementalKoiFish {
    constructor(type = 'yin', x = 240, y = 180, angle = 0, initialTheme = 'spirit') {
      this.type = type === 'yang' || type === 'la' ? 'yang' : 'yin';
      this.x = typeof x === 'number' && !Number.isNaN(x) ? x : 240;
      this.y = typeof y === 'number' && !Number.isNaN(y) ? y : 180;
      this.angle = typeof angle === 'number' && !Number.isNaN(angle) ? angle : 0;
      this.targetAngle = this.angle;
      this.scale = 1.0;
      this.currentScale = 1.0;

      // Phase 2: Decoupled Independent Movement Personalities (Problem 2)
      this.isYin = this.type === 'yin';
      this.swimPhase = (this.isYin ? 0 : Math.PI) + (Math.random() * 0.4 - 0.2);
      this.baseSpeed = this.isYin ? 1.55 : 1.75;
      this.speed = this.baseSpeed;
      this.angularSpeed = this.isYin ? 0.044 : 0.052;
      this.swimFrequency = this.isYin ? 0.125 : 0.145;
      this.swimAmplitude = 1.6;

      // Behavioral AI & Energy State (Priority 1)
      this.behaviorState = 'cruising'; // 'cruising' | 'darting' | 'circling' | 'curious_cursor'
      this.behaviorTimer = 0;
      this.behaviorDuration = 80 + Math.floor(Math.random() * 80);
      this.behaviorCooldown = 0;
      this.isStudyActive = false;
      this.targetSpeedMultiplier = 1.0;
      this.speedMultiplier = 1.0;

      // Phase 2: 5-State Transition Engine (Problem 3: IDLE -> PREPARE -> TRAVEL -> ARRIVE -> SETTLE)
      this.transitionState = 'IDLE';
      this.transitionTimer = 0;
      this.transitionTotalFrames = 58;
      this.travelPath = null;
      this.destPondCenter = null;
      this.isLeaping = false; // Kept for backwards compatibility
      this.leapFrame = 0;
      this.leapDuration = 58;
      this.leapStartX = this.x;
      this.leapStartY = this.y;
      this.leapTargetX = this.x;
      this.leapTargetY = this.y;
      this.leapHeight = 22; // Restrained water glide undulation

      // 3-Stage Koi-to-Dragon Evolution System
      this.evolutionStage = 1;
      this.targetEvolutionStage = 1;
      this.evolutionProgress = 1.0;

      // Master Vertebrae Spine Profiles for each Stage (Sleek, fluid, mythical proportions)
      this.stage1Distances = [11.5, 10.5, 9.8, 9.2, 8.6, 8.0, 7.5, 7.0, 6.5, 6.0];
      this.stage1Radii = [8.8, 11.5, 11.8, 10.6, 9.2, 7.6, 6.0, 4.6, 3.2, 2.0];

      this.stage2Distances = [12.5, 11.5, 11.0, 10.5, 10.0, 9.5, 9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 5.8];
      this.stage2Radii = [9.2, 12.0, 12.5, 11.8, 11.0, 10.0, 9.0, 8.0, 7.0, 5.8, 4.6, 3.4, 2.2];

      this.stage3Distances = [11.5, 11.0, 10.5, 10.0, 9.5, 9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.5, 5.0, 4.5, 4.0];
      this.stage3Radii = [9.8, 12.5, 13.0, 12.5, 11.8, 11.0, 10.0, 9.0, 8.0, 7.0, 6.0, 5.0, 4.0, 3.2, 2.4, 1.6];

      this.templateDistances = this.stage1Distances.slice();
      this.templateRadii = this.stage1Radii.slice();

      this.segmentCount = 10;
      this.segmentDistances = this.stage1Distances.slice();
      this.segmentRadii = this.stage1Radii.slice();

      this.segments = [];
      for (let i = 0; i < this.segmentCount; i++) {
        this.segments.push({
          x: this.x - Math.cos(this.angle) * (i * 9),
          y: this.y - Math.sin(this.angle) * (i * 9)
        });
      }

      // Wake ribbon history
      this.trailHistory = [];
      this.maxTrailLength = 26;

      // Color State & Morphing
      const defaultTheme = THEMES[initialTheme] || THEMES.spirit;
      const themeColors = defaultTheme[type] || defaultTheme.yin;
      this.currentColors = { ...themeColors };
      this.targetColors = { ...themeColors };
      this.colorMorphSpeed = 0.055;
    }

    get spinePoints() {
      return this.segments;
    }

    // Phase 2: Silhouette Visual Centroid & Safe Bounding Radius (Problem 1 & 4)
    getVisualCentroid() {
      if (!this.segments || this.segments.length === 0) {
        return { x: this.x, y: this.y };
      }
      let sumW = 0;
      let sumX = 0;
      let sumY = 0;
      for (let i = 0; i < this.segments.length; i++) {
        const w = (this.segmentRadii && this.segmentRadii[i]) ? this.segmentRadii[i] : 1;
        sumW += w;
        sumX += this.segments[i].x * w;
        sumY += this.segments[i].y * w;
      }
      return {
        x: sumW > 0 ? sumX / sumW : this.x,
        y: sumW > 0 ? sumY / sumW : this.y
      };
    }

    getSilhouetteBoundingRadius() {
      const baseRadius = this.evolutionStage === 3 ? 92 : (this.evolutionStage === 2 ? 64 : 42);
      return Math.max(38, baseRadius * this.scale);
    }

    centerOn(targetX, targetY) {
      const centroid = this.getVisualCentroid();
      const dx = targetX - centroid.x;
      const dy = targetY - centroid.y;
      this.x += dx;
      this.y += dy;
      for (let i = 0; i < this.segments.length; i++) {
        this.segments[i].x += dx;
        this.segments[i].y += dy;
      }
    }

    setEvolutionStage(stage) {
      this.targetEvolutionStage = Math.max(1, Math.min(3, stage));
    }

    setStudyActive(active) {
      this.isStudyActive = Boolean(active);
      this.targetSpeedMultiplier = this.isStudyActive ? 1.35 : 0.82;
      this.swimFrequency = this.isStudyActive ? 0.17 : 0.11;
      this.speed = this.baseSpeed * this.targetSpeedMultiplier;
    }

    setTargetTheme(themeName) {
      if (!THEMES[themeName]) return;
      this.targetColors = { ...THEMES[themeName][this.type] };
    }

    // Phase 2: Smooth 5-State Transition Engine (Problem 3: Replaces high unnatural jump)
    startPondTransition(targetX, targetY, delay = 0) {
      this.isLeaping = true; // Maintained for backwards compatibility
      this.destPondCenter = { x: targetX, y: targetY };
      this.transitionTimer = -delay;
      this.leapFrame = -delay;
      this.leapStartX = this.x;
      this.leapStartY = this.y;
      this.leapTargetX = targetX;
      this.leapTargetY = targetY;

      // Construct cubic Bézier trajectory within visible water corridor
      const dist = Math.hypot(targetX - this.x, targetY - this.y) || 1;
      const leadDist = Math.min(dist * 0.38, 200);

      const p0 = { x: this.x, y: this.y };
      const p1 = {
        x: this.x + Math.cos(this.angle) * leadDist,
        y: this.y + Math.sin(this.angle) * leadDist
      };
      const p3 = { x: targetX, y: targetY };
      const approachAngle = Math.atan2(targetY - p1.y, targetX - p1.x);
      const p2 = {
        x: targetX - Math.cos(approachAngle) * (leadDist * 0.75),
        y: targetY - Math.sin(approachAngle) * (leadDist * 0.75)
      };

      this.travelPath = { p0, p1, p2, p3 };
      this.transitionState = delay > 0 ? 'PREPARE' : 'TRAVEL';
      this.transitionTotalFrames = Math.max(46, Math.min(72, Math.floor(dist * 0.11) + 38));
      this.leapDuration = this.transitionTotalFrames;
      this.trailHistory = [];
    }

    startLeap(targetX, targetY, delay = 0) {
      this.startPondTransition(targetX, targetY, delay);
    }

    updateColors() {
      const keys = ['base', 'accent', 'glow', 'fin', 'eye', 'trail'];
      keys.forEach(k => {
        this.currentColors[k] = lerpRgb(this.currentColors[k], this.targetColors[k], this.colorMorphSpeed);
      });
    }

    // Phase 2: Multi-Segment Vertebrae Collision Separation (Problem 2)
    applyCreatureSeparation(companion) {
      if (!companion || !companion.segments || companion.segments.length === 0) return;
      if (!this.segments || this.segments.length === 0) return;

      const myScale = this.scale;
      const compScale = companion.scale;

      // 1. Head separation
      const headDist = Math.hypot(this.x - companion.x, this.y - companion.y);
      const minHeadDist = (26 * myScale + 26 * compScale);
      if (headDist < minHeadDist && headDist > 0.001) {
        const pushForce = ((minHeadDist - headDist) / minHeadDist) * 0.45;
        const pushAngle = Math.atan2(this.y - companion.y, this.x - companion.x);

        let angleDiff = pushAngle - this.targetAngle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        this.targetAngle += angleDiff * pushForce;

        this.x += Math.cos(pushAngle) * pushForce * 1.5;
        this.y += Math.sin(pushAngle) * pushForce * 1.5;
      }

      // 2. Spine-to-spine separation (check vertebrae)
      const myLen = Math.min(this.segments.length, 12);
      const compLen = Math.min(companion.segments.length, 12);

      for (let i = 1; i < myLen; i += 2) {
        const s1 = this.segments[i];
        const r1 = (this.segmentRadii[i] || 8) * myScale;

        for (let j = 1; j < compLen; j += 2) {
          const s2 = companion.segments[j];
          const r2 = (companion.segmentRadii[j] || 8) * compScale;
          const safeDist = (r1 + r2) * 1.2 + 8;

          const segDist = Math.hypot(s1.x - s2.x, s1.y - s2.y);
          if (segDist < safeDist && segDist > 0.001) {
            const overlap = safeDist - segDist;
            const repAngle = Math.atan2(s1.y - s2.y, s1.x - s2.x);
            this.targetAngle += (repAngle - this.targetAngle) * 0.035;
            break;
          }
        }
      }
    }

    // Phase 2: Predictive Look-Ahead Boundary Containment (Problem 4)
    applyBoundarySteering(bounds) {
      if (!bounds) return;

      const safeRadius = this.getSilhouetteBoundingRadius();
      const safeLeft = bounds.left + safeRadius;
      const safeRight = bounds.right - safeRadius;
      const safeTop = bounds.top + safeRadius;
      const safeBottom = bounds.bottom - safeRadius;

      if (safeRight <= safeLeft || safeBottom <= safeTop) {
        const cx = (bounds.left + bounds.right) / 2;
        const cy = (bounds.top + bounds.bottom) / 2;
        this.targetAngle = Math.atan2(cy - this.y, cx - this.x);
        return;
      }

      const lookAheadDist = Math.max(32, this.speed * 24);
      const futureX = this.x + Math.cos(this.angle) * lookAheadDist;
      const futureY = this.y + Math.sin(this.angle) * lookAheadDist;

      let repelX = 0;
      let repelY = 0;

      if (this.x < safeLeft) repelX += (safeLeft - this.x);
      else if (this.x > safeRight) repelX += (safeRight - this.x);

      if (this.y < safeTop) repelY += (safeTop - this.y);
      else if (this.y > safeBottom) repelY += (safeBottom - this.y);

      if (futureX < safeLeft) repelX += (safeLeft - futureX) * 1.4;
      else if (futureX > safeRight) repelX += (safeRight - futureX) * 1.4;

      if (futureY < safeTop) repelY += (safeTop - futureY) * 1.4;
      else if (futureY > safeBottom) repelY += (safeBottom - futureY) * 1.4;

      if (repelX !== 0 || repelY !== 0) {
        const desiredAngle = Math.atan2(repelY, repelX);
        let diff = desiredAngle - this.targetAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        const urgency = Math.min(1.0, Math.hypot(repelX, repelY) / (safeRadius * 1.1));
        this.targetAngle += diff * (0.22 + urgency * 0.42);
        this.speed *= Math.max(0.6, 1.0 - urgency * 0.4);
      }

      // Hard safety guard: shift whole creature together to prevent spine crumple
      const hardMargin = 16;
      let shiftX = 0;
      let shiftY = 0;
      const centerX = (bounds.left + bounds.right) * 0.5;
      const centerY = (bounds.top + bounds.bottom) * 0.5;

      if (this.x < bounds.left + hardMargin) {
        shiftX = (bounds.left + hardMargin) - this.x;
      } else if (this.x > bounds.right - hardMargin) {
        shiftX = (bounds.right - hardMargin) - this.x;
      }
      if (this.y < bounds.top + hardMargin) {
        shiftY = (bounds.top + hardMargin) - this.y;
      } else if (this.y > bounds.bottom - hardMargin) {
        shiftY = (bounds.bottom - hardMargin) - this.y;
      }

      if (shiftX !== 0 || shiftY !== 0) {
        this.x += shiftX;
        this.y += shiftY;
        if (this.segments) {
          for (let s = 0; s < this.segments.length; s++) {
            this.segments[s].x += shiftX;
            this.segments[s].y += shiftY;
          }
        }

        // Steer target angle toward open pond center
        this.targetAngle = Math.atan2(centerY - this.y, centerX - this.x);

        // Turn fish heading immediately away from wall barrier to prevent deadlock vibration
        let awayDiff = this.targetAngle - this.angle;
        while (awayDiff < -Math.PI) awayDiff += Math.PI * 2;
        while (awayDiff > Math.PI) awayDiff -= Math.PI * 2;
        this.angle += awayDiff * 0.42;
      }

      // Corner unjamming: if fish is trapped near any corner (close to both X and Y bounds)
      const nearLeft = this.x < bounds.left + 32;
      const nearRight = this.x > bounds.right - 32;
      const nearTop = this.y < bounds.top + 32;
      const nearBottom = this.y > bounds.bottom - 32;
      if ((nearLeft || nearRight) && (nearTop || nearBottom)) {
        const cornerEscapeAngle = Math.atan2(centerY - this.y, centerX - this.x);
        let cDiff = cornerEscapeAngle - this.angle;
        while (cDiff < -Math.PI) cDiff += Math.PI * 2;
        while (cDiff > Math.PI) cDiff -= Math.PI * 2;
        this.targetAngle = cornerEscapeAngle;
        this.angle += cDiff * 0.45;
        this.speed = Math.max(this.speed, this.baseSpeed * 1.2);
      }
    }

    update(bounds, mode, orbitCenter, companion, mousePos, pondEngine) {
      let normalizedBounds = null;
      if (bounds) {
        if (Array.isArray(bounds) && bounds.length >= 4) {
          normalizedBounds = {
            left: bounds[0],
            right: bounds[1],
            top: bounds[2],
            bottom: bounds[3],
            width: bounds[1] - bounds[0],
            height: bounds[3] - bounds[2]
          };
        } else if (typeof bounds.left === 'number') {
          normalizedBounds = bounds;
        }
      }
      this.currentBounds = normalizedBounds;
      bounds = normalizedBounds;

      this.swimPhase += this.swimFrequency;
      this.updateColors();

      // Advance evolution progress towards target
      if (Math.abs(this.targetEvolutionStage - this.evolutionProgress) > 0.001) {
        this.evolutionProgress += (this.targetEvolutionStage - this.evolutionProgress) * 0.08;
      } else {
        this.evolutionProgress = this.targetEvolutionStage;
      }
      this.evolutionStage = Math.round(this.evolutionProgress);

      // Base Scale Progression: 1.0 (St 1) -> 1.40 (St 2) -> 1.85 (St 3)
      const baseScale = 1.0 + (this.evolutionProgress - 1.0) * 0.425;

      // Dynamic Vertebrae count expansion: 10 (St 1) -> 13 (St 2) -> 16 (St 3)
      let targetCount = 10;
      if (this.evolutionProgress >= 2.3) targetCount = 16;
      else if (this.evolutionProgress >= 1.3) targetCount = 13;

      if (this.segmentCount !== targetCount) {
        this.segmentCount = targetCount;
        while (this.segments.length < this.segmentCount) {
          const last = this.segments[this.segments.length - 1];
          const prev = this.segments.length > 1 ? this.segments[this.segments.length - 2] : { x: this.x - 10, y: this.y };
          const a = Math.atan2(last.y - prev.y, last.x - prev.x);
          this.segments.push({
            x: last.x + Math.cos(a) * 8,
            y: last.y + Math.sin(a) * 8
          });
        }
        while (this.segments.length > this.segmentCount) {
          this.segments.pop();
        }
      }

      // Continuous Morphing of Vertebrae Radii & Distances
      this.segmentDistances = [];
      this.segmentRadii = [];
      for (let i = 0; i < this.segmentCount; i++) {
        let r, d;
        if (this.evolutionProgress <= 2.0) {
          const tMorph = Math.max(0, this.evolutionProgress - 1.0);
          const r1 = this.stage1Radii[Math.min(i, this.stage1Radii.length - 1)];
          const r2 = this.stage2Radii[Math.min(i, this.stage2Radii.length - 1)];
          const d1 = this.stage1Distances[Math.min(i, this.stage1Distances.length - 1)];
          const d2 = this.stage2Distances[Math.min(i, this.stage2Distances.length - 1)];
          r = lerp(r1, r2, tMorph);
          d = lerp(d1, d2, tMorph);
        } else {
          const tMorph = Math.min(1, this.evolutionProgress - 2.0);
          const r2 = this.stage2Radii[Math.min(i, this.stage2Radii.length - 1)];
          const r3 = this.stage3Radii[Math.min(i, this.stage3Radii.length - 1)];
          const d2 = this.stage2Distances[Math.min(i, this.stage2Distances.length - 1)];
          const d3 = this.stage3Distances[Math.min(i, this.stage3Distances.length - 1)];
          r = lerp(r2, r3, tMorph);
          d = lerp(d2, d3, tMorph);
        }
        this.segmentRadii.push(r);
        this.segmentDistances.push(d);
      }

      // Smooth study energy speed interpolation
      this.speedMultiplier += (this.targetSpeedMultiplier - this.speedMultiplier) * 0.06;

      // ======================================================================
      // 1. TRANSITION STATE MACHINE (IDLE -> PREPARE -> TRAVEL -> ARRIVE -> SETTLE)
      // ======================================================================
      if (this.isLeaping && this.travelPath) {
        this.transitionTimer++;
        this.leapFrame = this.transitionTimer;

        if (this.transitionTimer < 0) {
          this.transitionState = 'PREPARE';
          // Gently turn toward departure path
          const aimAngle = Math.atan2(this.travelPath.p1.y - this.y, this.travelPath.p1.x - this.x);
          let diff = aimAngle - this.angle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          this.angle += diff * 0.08;
          this.updateSpine();
          return;
        }

        this.transitionState = 'TRAVEL';
        const t = Math.min(1, Math.max(0, this.transitionTimer / this.transitionTotalFrames));
        // Hermite ease-in-out
        const u = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        // Departure splash at initial frame
        if (this.transitionTimer === 1 && pondEngine) {
          pondEngine.addRipple(this.travelPath.p0.x, this.travelPath.p0.y, rgbToString(this.currentColors.accent, 0.7), 55);
        }

        // Cubic Bézier curve position
        const p0 = this.travelPath.p0;
        const p1 = this.travelPath.p1;
        const p2 = this.travelPath.p2;
        const p3 = this.travelPath.p3;

        const invU = 1 - u;
        const nextX = invU * invU * invU * p0.x +
                      3 * invU * invU * u * p1.x +
                      3 * invU * u * u * p2.x +
                      u * u * u * p3.x;

        // Gentle surface undulation wave, contained within water
        const waveY = Math.sin(t * Math.PI) * this.leapHeight;
        const nextY = (invU * invU * invU * p0.y +
                       3 * invU * invU * u * p1.y +
                       3 * invU * u * u * p2.y +
                       u * u * u * p3.y) - waveY;

        // Tangent heading along curve
        const tangentX = 3 * invU * invU * (p1.x - p0.x) +
                         6 * invU * u * (p2.x - p1.x) +
                         3 * u * u * (p3.x - p2.x);
        const tangentY = 3 * invU * invU * (p1.y - p0.y) +
                         6 * invU * u * (p2.y - p1.y) +
                         3 * u * u * (p3.y - p2.y) - Math.cos(t * Math.PI) * this.leapHeight * 0.4;

        if (Math.hypot(tangentX, tangentY) > 0.01) {
          this.angle = Math.atan2(tangentY, tangentX);
        }

        this.x = nextX;
        this.y = nextY;

        // Natural water-glide scale
        this.scale = baseScale * (1.0 + Math.sin(t * Math.PI) * 0.18);
        this.currentScale = this.scale;

        if (pondEngine && Math.random() < 0.35) {
          pondEngine.addParticle(this.x, this.y, rgbToString(this.currentColors.accent, 0.75));
        }

        this.updateSpine();

        // ARRIVE -> SETTLE -> IDLE
        if (t >= 1) {
          this.transitionState = 'ARRIVE';
          this.isLeaping = false;
          this.scale = baseScale;
          this.currentScale = baseScale;
          this.speed = this.baseSpeed * this.speedMultiplier;

          if (pondEngine) {
            pondEngine.addRipple(this.x, this.y, rgbToString(this.currentColors.accent, 0.85), 65);
            pondEngine.addRipple(this.x, this.y, '#ffffff', 42);
          }

          setTimeout(() => {
            this.transitionState = 'SETTLE';
            setTimeout(() => {
              this.transitionState = 'IDLE';
            }, 300);
          }, 150);
        }
        return;
      }

      // Normal swimming scale
      this.scale = baseScale;
      this.currentScale = baseScale;

      // ======================================================================
      // 2. NORMAL SWIMMING & AUTONOMOUS BEHAVIORAL AI (Priority 1)
      // ======================================================================
      if (mode === 'yin-yang' && orbitCenter) {
        // Yin-Yang Harmony Orbit Mode with 180° Opposite Phase Locking
        // Generous, majestic orbit radius so creatures glide gracefully
        const targetRadius = Math.min(bounds ? bounds.width * 0.38 : 220, bounds ? bounds.height * 0.38 : 155);
        const dx = this.x - orbitCenter.x;
        const dy = this.y - orbitCenter.y;
        const currentDist = Math.hypot(dx, dy) || 1;
        const currentAngle = Math.atan2(dy, dx);

        let desiredPolarAngle = currentAngle;
        if (!this.isYin && companion) {
          // La stays strictly 180 degrees opposite Tui
          const tuiAngle = Math.atan2(companion.y - orbitCenter.y, companion.x - orbitCenter.x);
          const oppAngle = tuiAngle + Math.PI;
          let diff = oppAngle - currentAngle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          desiredPolarAngle = currentAngle + diff * 0.045;
        }

        const tangentAngle = desiredPolarAngle + Math.PI / 2;
        const radialCorrection = (targetRadius - currentDist) * 0.02;
        this.targetAngle = tangentAngle + (radialCorrection > 0 ? 0.28 : -0.28) * Math.min(1, Math.abs(radialCorrection));
        this.speed = (this.isYin ? 1.6 : 1.6) * this.speedMultiplier;
      } else {
        // Free Pond Roaming Mode with Decoupled Behavioral AI
        // Priority 0: Food Pellet Detection & Hunting AI (Enhanced Agility)
        let nearestFood = null;
        let nearestFoodDist = 320;
        if (pondEngine && Array.isArray(pondEngine.foodPellets) && pondEngine.foodPellets.length > 0) {
          for (let f = 0; f < pondEngine.foodPellets.length; f++) {
            const food = pondEngine.foodPellets[f];
            const d = Math.hypot(food.x - this.x, food.y - this.y);
            if (d < nearestFoodDist) {
              nearestFoodDist = d;
              nearestFood = food;
            }
          }
        }

        if (nearestFood) {
          this.behaviorState = 'seeking_food';
          const foodAngle = Math.atan2(nearestFood.y - this.y, nearestFood.x - this.x);
          let fDiff = foodAngle - this.angle;
          while (fDiff < -Math.PI) fDiff += Math.PI * 2;
          while (fDiff > Math.PI) fDiff -= Math.PI * 2;

          this.targetAngle = foodAngle;
          // Agile turning rate: turn sharply towards food to prevent looping/circling
          const turnRate = nearestFoodDist < 80 ? 0.35 : (nearestFoodDist < 160 ? 0.24 : 0.15);
          this.angle += fDiff * turnRate;

          // Natural approach speed: swift sprint when distant, smooth deceleration when close
          if (nearestFoodDist > 90) {
            this.speed = (this.baseSpeed * 1.4) * this.speedMultiplier;
          } else {
            this.speed = Math.max(0.85, (nearestFoodDist / 90) * this.baseSpeed * 1.15) * this.speedMultiplier;
          }
          this.swimFrequency = 0.18;

          // Snout / mouth coordinates ahead of head
          const snoutDist = 14 * (this.scale || 1.0);
          const snoutX = this.x + Math.cos(this.angle) * snoutDist;
          const snoutY = this.y + Math.sin(this.angle) * snoutDist;
          const mouthDist = Math.hypot(nearestFood.x - snoutX, nearestFood.y - snoutY);

          // Water suction vortex: as koi gets close (< 55px), food drifts naturally toward mouth
          if (nearestFoodDist < 55) {
            const pullAngle = Math.atan2(snoutY - nearestFood.y, snoutX - nearestFood.x);
            const pullForce = Math.min(2.5, (55 - nearestFoodDist) * 0.08);
            nearestFood.x += Math.cos(pullAngle) * pullForce;
            nearestFood.y += Math.sin(pullAngle) * pullForce;
            this.x += Math.cos(foodAngle) * 0.6;
            this.y += Math.sin(foodAngle) * 0.6;
          }

          // Dynamic eating reach based on creature scale (Stage 3/4 Drake has expansive mouth reach)
          const eatReach = Math.max(34, 28 * (this.scale || 1.0));
          const isAtMouth = mouthDist < eatReach || nearestFoodDist < (eatReach * 0.92);

          // Consumption check at snout or head
          if (isAtMouth) {
            const fIdx = pondEngine.foodPellets.indexOf(nearestFood);
            if (fIdx !== -1) {
              pondEngine.foodPellets.splice(fIdx, 1);
            }
            if (typeof pondEngine.addRipple === 'function') {
              pondEngine.addRipple(this.x, this.y, rgbToString(this.currentColors.accent, 0.9), 65);
            }
            if (typeof pondEngine.addParticle === 'function') {
              for (let k = 0; k < 8; k++) {
                pondEngine.addParticle(this.x, this.y, rgbToString(this.currentColors.accent, 0.85));
              }
            }
            if (typeof window !== 'undefined' && window.zenAudio && typeof window.zenAudio.playBloop === 'function') {
              window.zenAudio.playBloop();
            }
            this.behaviorState = 'celebrating';
            this.behaviorTimer = 0;
            this.behaviorDuration = 35;
          }
        } else if (this.behaviorState === 'celebrating') {
          this.behaviorTimer++;
          this.speed = (this.baseSpeed * 1.25) * this.speedMultiplier;
          this.targetAngle += (this.isYin ? 0.024 : -0.024);
          if (this.behaviorTimer >= this.behaviorDuration) {
            this.behaviorState = 'cruising';
          }
        } else {
          this.behaviorTimer++;
          if (this.behaviorCooldown > 0) this.behaviorCooldown--;

          if (this.behaviorTimer >= this.behaviorDuration) {
            this.behaviorTimer = 0;
            this.behaviorDuration = 80 + Math.floor(Math.random() * 80);
            const rand = Math.random();
            if (rand < 0.62) {
              this.behaviorState = 'cruising';
            } else if (rand < 0.85 && this.behaviorCooldown <= 0) {
              this.behaviorState = 'darting';
              this.behaviorCooldown = 110;
              this.behaviorDuration = 32 + Math.floor(Math.random() * 24);
            } else {
              this.behaviorState = 'circling';
              this.behaviorDuration = 50 + Math.floor(Math.random() * 30);
            }
          }

          // Distinct Steering based on behavior state
          if (this.behaviorState === 'darting') {
            this.speed = (this.baseSpeed * 1.55) * this.speedMultiplier;
            this.targetAngle += (Math.sin(this.swimPhase * 0.6) * 0.022);
            if (pondEngine && Math.random() < 0.25) {
              pondEngine.addParticle(this.x, this.y, rgbToString(this.currentColors.accent, 0.75));
            }
          } else if (this.behaviorState === 'circling') {
            this.speed = (this.baseSpeed * 1.05) * this.speedMultiplier;
            this.targetAngle += (this.isYin ? 0.014 : -0.014);
          } else {
            // 'cruising' default with decoupled wandering noise
            this.speed = (this.baseSpeed + Math.sin(this.swimPhase * 0.45) * 0.25) * this.speedMultiplier;
            if (this.isYin) {
              this.targetAngle += (Math.sin(this.swimPhase * 0.4) * 0.022) + (Math.cos(this.x * 0.012 + 1.1) * 0.012);
            } else {
              this.targetAngle += (Math.sin(this.swimPhase * 0.52 + 1.8) * 0.026) + (Math.cos(this.y * 0.014 - 0.7) * 0.014);
            }
          }
        }

        // Apply Predictive Boundary Steering (Problem 4)
        this.applyBoundarySteering(bounds);

        // Apply Multi-Segment Creature Separation (Problem 2)
        this.applyCreatureSeparation(companion);

        // Mouse interaction (constrained strictly inside safe envelope)
        if (mousePos && mousePos.active && bounds) {
          const safeRadius = this.getSilhouetteBoundingRadius();
          const safeLeft = bounds.left + safeRadius;
          const safeRight = bounds.right - safeRadius;
          const safeTop = bounds.top + safeRadius;
          const safeBottom = bounds.bottom - safeRadius;

          // Only react if cursor is inside safe pond area
          if (mousePos.x >= safeLeft && mousePos.x <= safeRight &&
              mousePos.y >= safeTop && mousePos.y <= safeBottom) {
            const mdx = this.x - mousePos.x;
            const mdy = this.y - mousePos.y;
            const mdist = Math.hypot(mdx, mdy);
            if (mdist < 55) {
              const steerAway = Math.atan2(mdy, mdx);
              this.targetAngle = steerAway;
              this.speed = this.baseSpeed * 1.5 * this.speedMultiplier;
            } else if (mdist < 115 && !this.isStudyActive) {
              this.behaviorState = 'curious_cursor';
              const curiousAngle = Math.atan2(mdy, mdx) + (this.isYin ? Math.PI / 2 : -Math.PI / 2);
              this.targetAngle += (curiousAngle - this.targetAngle) * 0.05;
            }
          }
        }
      }

      // Smooth angular interpolation
      if (this.behaviorState === 'seeking_food') {
        // If boundary steering modified targetAngle away from heading, steer agilely
        let boundaryDiff = this.targetAngle - this.angle;
        while (boundaryDiff < -Math.PI) boundaryDiff += Math.PI * 2;
        while (boundaryDiff > Math.PI) boundaryDiff -= Math.PI * 2;
        if (Math.abs(boundaryDiff) > 0.05) {
          this.angle += boundaryDiff * 0.22;
        }
      } else {
        let angleDiff = this.targetAngle - this.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        this.angle += angleDiff * this.angularSpeed;
      }

      // Anti-stuck deadlock watchdog: detect if fish is immobilized in corner
      if (!this._posWatch) this._posWatch = [];
      this._posWatch.push({ x: this.x, y: this.y });
      if (this._posWatch.length > 20) this._posWatch.shift();
      if (this._posWatch.length >= 20 && bounds) {
        const totalNetDist = Math.hypot(this.x - this._posWatch[0].x, this.y - this._posWatch[0].y);
        if (totalNetDist < 3.0) {
          // Fish is stuck in corner/barrier! Force unstick toward pond center
          const cX = (bounds.left + bounds.right) * 0.5;
          const cY = (bounds.top + bounds.bottom) * 0.5;
          const unstickAngle = Math.atan2(cY - this.y, cX - this.x);
          this.targetAngle = unstickAngle;
          this.angle = unstickAngle;
          this.speed = this.baseSpeed * 1.5 * this.speedMultiplier;
          this.x += Math.cos(unstickAngle) * 3.5;
          this.y += Math.sin(unstickAngle) * 3.5;

          // If stuck near a pellet, draw pellet into mouth and celebrate
          if (pondEngine && Array.isArray(pondEngine.foodPellets) && pondEngine.foodPellets.length > 0) {
            for (let pIdx = 0; pIdx < pondEngine.foodPellets.length; pIdx++) {
              const fp = pondEngine.foodPellets[pIdx];
              if (Math.hypot(fp.x - this.x, fp.y - this.y) < 75) {
                pondEngine.foodPellets.splice(pIdx, 1);
                if (typeof window !== 'undefined' && window.zenAudio && typeof window.zenAudio.playBloop === 'function') {
                  window.zenAudio.playBloop();
                }
                this.behaviorState = 'celebrating';
                this.behaviorTimer = 0;
                this.behaviorDuration = 35;
                break;
              }
            }
          }
          this._posWatch = [];
        }
      }

      // Advance head
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      this.updateSpine();
    }

    // Phase 2: Refined Skeletal Kinematics & Wave Propagation
    updateSpine() {
      this.segments[0].x = this.x;
      this.segments[0].y = this.y;

      const headBackAngle = this.angle + Math.PI;
      // Maximum allowed anatomical spine flexion relative to head heading
      // Even in a sharp turn, a koi/dragon spine gracefully arches without folding in half.
      const maxSpineFlexRad = (this.evolutionStage === 3 ? 0.65 : 0.58); // ~33° to ~37° max cumulative tail deflection

      for (let i = 1; i < this.segmentCount; i++) {
        const prev = this.segments[i - 1];
        const curr = this.segments[i];

        let dx = curr.x - prev.x;
        let dy = curr.y - prev.y;

        const targetDist = this.segmentDistances[i - 1] * this.scale;
        let jointAngle = Math.atan2(dy, dx);

        // Parent joint vector pointing backwards along spine:
        const parentAngle = i > 1
          ? Math.atan2(prev.y - this.segments[i - 2].y, prev.x - this.segments[i - 2].x)
          : headBackAngle;

        // 1. Inter-vertebral stiffness (prevents sudden local kinks between neighboring vertebrae)
        // Cranial/thoracic joints (i <= 3) are firm (max ~4.5° bend).
        // Posterior caudal joints (i > 3) flex progressively.
        const maxJointBend = i <= 3 ? 0.08 : (0.10 + (i / this.segmentCount) * 0.08);
        let diff = jointAngle - parentAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        if (diff > maxJointBend) jointAngle = parentAngle + maxJointBend;
        if (diff < -maxJointBend) jointAngle = parentAngle - maxJointBend;

        // 2. Global anatomical spine alignment (prevents cumulative looping/curling/U-turns)
        // Cumulative angle deviation from head axis is bounded proportional to distance down spine:
        const progressFrac = i / this.segmentCount;
        const maxGlobalDev = progressFrac * maxSpineFlexRad;
        let headDev = jointAngle - headBackAngle;
        while (headDev < -Math.PI) headDev += Math.PI * 2;
        while (headDev > Math.PI) headDev -= Math.PI * 2;
        if (headDev > maxGlobalDev) jointAngle = headBackAngle + maxGlobalDev;
        if (headDev < -maxGlobalDev) jointAngle = headBackAngle - maxGlobalDev;

        // 3. Lateral carangiform undulation wave (applied as an angular wave to maintain exact bone distance)
        const segPhase = this.swimPhase - i * (this.evolutionStage === 3 ? 0.36 : 0.44);
        const waveAngle = Math.sin(segPhase) * 0.16 * Math.pow(progressFrac, 1.3) * (this.swimAmplitude / 1.6);
        const finalAngle = jointAngle + waveAngle;

        curr.x = prev.x + Math.cos(finalAngle) * targetDist;
        curr.y = prev.y + Math.sin(finalAngle) * targetDist;
      }

      // Shift whole creature together if any vertebra breaches margin (preserves skeletal integrity)
      if (this.currentBounds) {
        const segMargin = 4;
        let pushX = 0;
        let pushY = 0;
        for (let i = 0; i < this.segmentCount; i++) {
          if (this.segments[i].x < this.currentBounds.left + segMargin) {
            pushX = Math.max(pushX, (this.currentBounds.left + segMargin) - this.segments[i].x);
          } else if (this.segments[i].x > this.currentBounds.right - segMargin) {
            pushX = Math.min(pushX, (this.currentBounds.right - segMargin) - this.segments[i].x);
          }
          if (this.segments[i].y < this.currentBounds.top + segMargin) {
            pushY = Math.max(pushY, (this.currentBounds.top + segMargin) - this.segments[i].y);
          } else if (this.segments[i].y > this.currentBounds.bottom - segMargin) {
            pushY = Math.min(pushY, (this.currentBounds.bottom - segMargin) - this.segments[i].y);
          }
        }
        if (pushX !== 0 || pushY !== 0) {
          this.x += pushX;
          this.y += pushY;
          for (let i = 0; i < this.segmentCount; i++) {
            this.segments[i].x += pushX;
            this.segments[i].y += pushY;
          }
        }
      }

      // Update trailing wake history from tail joint
      const tail = this.segments[this.segmentCount - 1];
      this.trailHistory.unshift({ x: tail.x, y: tail.y, age: 0 });
      if (this.trailHistory.length > this.maxTrailLength) {
        this.trailHistory.pop();
      }
    }

    draw(ctx) {
      ctx.save();

      const baseColorStr = rgbToString(this.currentColors.base, 1);
      const accentColorStr = rgbToString(this.currentColors.accent, 1);
      const glowColorStr = rgbToString(this.currentColors.glow, 0.78);
      const finColorStr = rgbToString(this.currentColors.fin, 0.48);
      const eyeColorStr = rgbToString(this.currentColors.eye, 1);
      const trailColorStr = rgbToString(this.currentColors.trail, 0.32);

      // 1. Draw glowing translucent fluid ribbon trail behind tail
      if (this.trailHistory.length > 2) {
        ctx.beginPath();
        ctx.moveTo(this.trailHistory[0].x, this.trailHistory[0].y);
        for (let i = 1; i < this.trailHistory.length - 1; i++) {
          const xc = (this.trailHistory[i].x + this.trailHistory[i + 1].x) * 0.5;
          const yc = (this.trailHistory[i].y + this.trailHistory[i + 1].y) * 0.5;
          ctx.quadraticCurveTo(this.trailHistory[i].x, this.trailHistory[i].y, xc, yc);
        }
        ctx.strokeStyle = trailColorStr;
        ctx.lineWidth = 5.5 * this.scale;
        ctx.lineCap = 'round';
        ctx.shadowColor = accentColorStr;
        ctx.shadowBlur = 12 * this.scale;
        ctx.stroke();

        // Secondary thin incandescent ribbon core
        ctx.beginPath();
        ctx.moveTo(this.trailHistory[0].x, this.trailHistory[0].y);
        for (let i = 1; i < this.trailHistory.length - 1; i++) {
          const xc = (this.trailHistory[i].x + this.trailHistory[i + 1].x) * 0.5;
          const yc = (this.trailHistory[i].y + this.trailHistory[i + 1].y) * 0.5;
          ctx.quadraticCurveTo(this.trailHistory[i].x, this.trailHistory[i].y, xc, yc);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
        ctx.lineWidth = 1.8 * this.scale;
        ctx.stroke();
      }

      // 2. Draw gossamer Chiffon Caudal (Tail) Fin (Butterfly Koi style)
      const tailRoot = this.segments[this.segmentCount - 1];
      const tailPre = this.segments[this.segmentCount - 2];
      const tailAngle = Math.atan2(tailRoot.y - tailPre.y, tailRoot.x - tailPre.x);
      const tailWave = Math.sin(this.swimPhase - 5.5) * 8 * this.scale;

      ctx.save();
      ctx.translate(tailRoot.x, tailRoot.y);
      ctx.rotate(tailAngle);
      ctx.scale(this.scale, this.scale);

      // Flowing double-lobed butterfly veil
      const finLen = 42 + (this.evolutionProgress - 1) * 14;
      const finSpread = 22 + (this.evolutionProgress - 1) * 6;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      // Top lobe
      ctx.quadraticCurveTo(finLen * 0.45 + tailWave * 0.3, -finSpread * 0.9, finLen + tailWave, -finSpread);
      ctx.quadraticCurveTo(finLen * 0.85 + tailWave * 0.6, -finSpread * 0.3, finLen * 0.68 + tailWave * 0.7, 0);
      // Bottom lobe
      ctx.quadraticCurveTo(finLen * 0.85 + tailWave * 0.6, finSpread * 0.3, finLen + tailWave, finSpread);
      ctx.quadraticCurveTo(finLen * 0.45 + tailWave * 0.3, finSpread * 0.9, 0, 0);
      ctx.closePath();

      ctx.fillStyle = finColorStr;
      ctx.shadowColor = accentColorStr;
      ctx.shadowBlur = 12 * this.scale;
      ctx.fill();

      // Delicate luminous fin rays
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 0.9;
      [-1, -0.5, 0, 0.5, 1].forEach(r => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
          finLen * 0.5, r * finSpread * 0.6 + tailWave * 0.4,
          finLen * (r === 0 ? 0.7 : 0.95) + tailWave, r * finSpread * 0.88
        );
        ctx.stroke();
      });

      ctx.restore();

      // 3. Draw Flapping Pectoral Fins (Left & Right of chest)
      const chest = this.segments[1];
      const chestPre = this.segments[0];
      const chestAngle = Math.atan2(chest.y - chestPre.y, chest.x - chestPre.x);
      const finFlap = Math.sin(this.swimPhase * 0.9) * 0.28;

      [-1, 1].forEach(side => {
        ctx.save();
        ctx.translate(chest.x, chest.y);
        ctx.rotate(chestAngle + (side * (Math.PI / 2.3 + finFlap)));
        ctx.scale(this.scale, this.scale);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(12, side * 6, 26, side * 10, 28, side * 18);
        ctx.quadraticCurveTo(14, side * 16, 0, 0);
        ctx.closePath();
        ctx.fillStyle = finColorStr;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      });

      // 4. Construct Smooth Segmented Body Shell with Splines
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

        const radius = this.segmentRadii[i] * this.scale;
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

      ctx.beginPath();
      // Sculpted head geometry
      const headRadius = this.segmentRadii[0] * this.scale;
      const snoutAngle = this.angle;
      const headX = this.segments[0].x;
      const headY = this.segments[0].y;

      if (this.evolutionProgress < 1.35) {
        // Stage 1: Round bullet koi head
        ctx.arc(headX, headY, headRadius, snoutAngle + Math.PI / 2, snoutAngle - Math.PI / 2);
      } else if (this.evolutionProgress < 2.3) {
        // Stage 2: Aerodynamic predatory wedge / tapered drake snout
        const snoutTipX = headX + Math.cos(snoutAngle) * (headRadius * 1.38);
        const snoutTipY = headY + Math.sin(snoutAngle) * (headRadius * 1.38);
        const rightCheekX = headX + Math.cos(snoutAngle + Math.PI / 2.1) * headRadius;
        const rightCheekY = headY + Math.sin(snoutAngle + Math.PI / 2.1) * headRadius;
        const leftCheekX = headX + Math.cos(snoutAngle - Math.PI / 2.1) * headRadius;
        const leftCheekY = headY + Math.sin(snoutAngle - Math.PI / 2.1) * headRadius;

        ctx.arc(headX, headY, headRadius, snoutAngle + Math.PI / 2, snoutAngle + Math.PI / 2.1, true);
        ctx.lineTo(rightCheekX, rightCheekY);
        ctx.quadraticCurveTo(headX + Math.cos(snoutAngle + 0.35) * (headRadius * 1.15), headY + Math.sin(snoutAngle + 0.35) * (headRadius * 1.15), snoutTipX, snoutTipY);
        ctx.quadraticCurveTo(headX + Math.cos(snoutAngle - 0.35) * (headRadius * 1.15), headY + Math.sin(snoutAngle - 0.35) * (headRadius * 1.15), leftCheekX, leftCheekY);
      } else {
        // Stage 3: Mythical Eastern Dragon Head with sculpted jaw and extended snout
        const snoutTipX = headX + Math.cos(snoutAngle) * (headRadius * 1.5);
        const snoutTipY = headY + Math.sin(snoutAngle) * (headRadius * 1.5);
        const jawRightX = headX + Math.cos(snoutAngle + Math.PI / 2.15) * (headRadius * 1.2);
        const jawRightY = headY + Math.sin(snoutAngle + Math.PI / 2.15) * (headRadius * 1.2);
        const jawLeftX = headX + Math.cos(snoutAngle - Math.PI / 2.15) * (headRadius * 1.2);
        const jawLeftY = headY + Math.sin(snoutAngle - Math.PI / 2.15) * (headRadius * 1.2);

        ctx.arc(headX, headY, headRadius, snoutAngle + Math.PI / 2, snoutAngle + Math.PI / 2.15, true);
        ctx.lineTo(jawRightX, jawRightY);
        ctx.quadraticCurveTo(headX + Math.cos(snoutAngle + 0.4) * (headRadius * 1.25), headY + Math.sin(snoutAngle + 0.4) * (headRadius * 1.25), snoutTipX, snoutTipY);
        ctx.quadraticCurveTo(headX + Math.cos(snoutAngle - 0.4) * (headRadius * 1.25), headY + Math.sin(snoutAngle - 0.4) * (headRadius * 1.25), jawLeftX, jawLeftY);
      }

      // Right flank to tail with smooth quadratic splines
      for (let i = 0; i < rightPoints.length - 1; i++) {
        const xc = (rightPoints[i].x + rightPoints[i + 1].x) * 0.5;
        const yc = (rightPoints[i].y + rightPoints[i + 1].y) * 0.5;
        ctx.quadraticCurveTo(rightPoints[i].x, rightPoints[i].y, xc, yc);
      }
      ctx.lineTo(this.segments[this.segmentCount - 1].x, this.segments[this.segmentCount - 1].y);

      // Left flank back to head with smooth quadratic splines
      for (let i = leftPoints.length - 1; i > 0; i--) {
        const xc = (leftPoints[i].x + leftPoints[i - 1].x) * 0.5;
        const yc = (leftPoints[i].y + leftPoints[i - 1].y) * 0.5;
        ctx.quadraticCurveTo(leftPoints[i].x, leftPoints[i].y, xc, yc);
      }
      ctx.closePath();

      // Fluid Body Gradient
      const bodyGrad = ctx.createLinearGradient(
        this.segments[0].x, this.segments[0].y,
        this.segments[this.segmentCount - 1].x, this.segments[this.segmentCount - 1].y
      );
      if (this.isYin) {
        bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        bodyGrad.addColorStop(0.4, 'rgba(245, 243, 255, 0.92)');
        bodyGrad.addColorStop(1, rgbToString(this.currentColors.fin, 0.65));
      } else {
        bodyGrad.addColorStop(0, rgbToString(this.currentColors.base, 0.95));
        bodyGrad.addColorStop(0.35, rgbToString(this.currentColors.accent, 0.75));
        bodyGrad.addColorStop(1, rgbToString(this.currentColors.fin, 0.65));
      }

      ctx.fillStyle = bodyGrad;
      ctx.shadowColor = glowColorStr;
      ctx.shadowBlur = 16 * this.scale;
      ctx.fill();

      ctx.strokeStyle = accentColorStr;
      ctx.lineWidth = 1.3 * this.scale;
      ctx.stroke();

      // 5. Dorsal Markings & Spine Crest
      ctx.beginPath();
      ctx.moveTo(this.segments[1].x, this.segments[1].y);
      for (let i = 2; i < Math.min(this.segmentCount, 8); i++) {
        ctx.lineTo(this.segments[i].x, this.segments[i].y);
      }
      ctx.strokeStyle = accentColorStr;
      ctx.lineWidth = 2.8 * this.scale;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Celestial Markings (Spiritual Enso / Yin-Yang dot on head)
      ctx.beginPath();
      ctx.arc(this.segments[0].x - Math.cos(this.angle) * (3 * this.scale), this.segments[0].y - Math.sin(this.angle) * (3 * this.scale), 2.8 * this.scale, 0, Math.PI * 2);
      ctx.fillStyle = accentColorStr;
      ctx.fill();

      // Luminous Eyes
      [-1, 1].forEach(side => {
        const eyeAngle = this.angle + (side * Math.PI / 2.8);
        const eyeX = this.segments[0].x + Math.cos(eyeAngle) * (5.5 * this.scale);
        const eyeY = this.segments[0].y + Math.sin(eyeAngle) * (5.5 * this.scale);

        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 1.4 * this.scale, 0, Math.PI * 2);
        ctx.fillStyle = eyeColorStr;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 6 * this.scale;
        ctx.fill();
      });

      // Secondary Ventral Ribbon Fins (Stage 2 & 3)
      this.drawSecondaryFins(ctx);

      // Undulating Dorsal Crest Ridge (Stage 2 & 3)
      this.drawDorsalCrest(ctx);

      // Flowing Chin Whiskers & Dragon Streamers
      this.drawWhiskers(ctx);

      // Golden Antler Horns (Stage 3)
      this.drawAntlerHorns(ctx);

      ctx.restore();
    }

    drawSecondaryFins(ctx) {
      if (this.evolutionProgress < 1.25 || this.segments.length < 5) return;
      const finColorStr = rgbToString(this.currentColors.fin, 0.55);
      const accentColorStr = rgbToString(this.currentColors.accent, 0.9);
      const midJoint = this.segments[Math.min(4, this.segments.length - 2)];
      const preJoint = this.segments[Math.min(3, this.segments.length - 3)];
      if (!midJoint || !preJoint) return;

      const segAngle = Math.atan2(midJoint.y - preJoint.y, midJoint.x - preJoint.x);
      const finLength = (16 + (this.evolutionProgress - 1.25) * 16) * this.scale;
      const wave = Math.sin(this.swimPhase * 1.1) * 0.28;

      [-1, 1].forEach(side => {
        ctx.save();
        ctx.translate(midJoint.x, midJoint.y);
        ctx.rotate(segAngle + (side * (Math.PI / 2.3 + wave)));

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(finLength * 0.5, side * 6 * this.scale, finLength, side * 12 * this.scale);
        ctx.quadraticCurveTo(finLength * 0.4, side * 8 * this.scale, 0, 0);
        ctx.closePath();

        ctx.fillStyle = finColorStr;
        ctx.shadowColor = accentColorStr;
        ctx.shadowBlur = 8 * this.scale;
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 0.9 * this.scale;
        ctx.stroke();

        ctx.restore();
      });
    }

    drawDorsalCrest(ctx) {
      if (this.evolutionProgress < 1.2 || this.segments.length < 5) return;
      const glowColorStr = rgbToString(this.currentColors.glow, 0.85);
      const finColorStr = rgbToString(this.currentColors.fin, 0.38);
      const crestHeight = (this.evolutionProgress - 1.2) * 6.5 * this.scale;
      const startIndex = 2;
      const endIndex = Math.min(this.segments.length - 2, 11);

      const crestPoints = [];
      for (let i = startIndex; i <= endIndex; i++) {
        const seg = this.segments[i];
        const prev = this.segments[i - 1];
        const segAngle = Math.atan2(seg.y - prev.y, seg.x - prev.x);
        const normal = segAngle + Math.PI / 2;
        const wave = Math.sin(this.swimPhase - i * 0.45) * 2.2 * this.scale;
        const h = crestHeight + wave;
        crestPoints.push({
          x: seg.x + Math.cos(normal) * h,
          y: seg.y + Math.sin(normal) * h,
          baseX: seg.x,
          baseY: seg.y
        });
      }

      if (crestPoints.length < 2) return;

      ctx.save();
      // Flowing fin membrane fill
      ctx.beginPath();
      ctx.moveTo(crestPoints[0].baseX, crestPoints[0].baseY);
      for (let i = 0; i < crestPoints.length; i++) {
        ctx.lineTo(crestPoints[i].x, crestPoints[i].y);
      }
      for (let i = crestPoints.length - 1; i >= 0; i--) {
        ctx.lineTo(crestPoints[i].baseX, crestPoints[i].baseY);
      }
      ctx.closePath();
      ctx.fillStyle = finColorStr;
      ctx.fill();

      // Luminous crest edge
      ctx.beginPath();
      ctx.moveTo(crestPoints[0].x, crestPoints[0].y);
      for (let i = 1; i < crestPoints.length; i++) {
        ctx.lineTo(crestPoints[i].x, crestPoints[i].y);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6 * this.scale;
      ctx.shadowColor = glowColorStr;
      ctx.shadowBlur = 8 * this.scale;
      ctx.stroke();

      ctx.restore();
    }

    drawWhiskers(ctx) {
      const head = this.segments[0];
      if (!head) return;
      const accentColorStr = rgbToString(this.currentColors.accent, 1);
      const whiskerLen = (14 + (this.evolutionProgress - 1) * 16) * this.scale;
      const whiskerCount = this.evolutionProgress >= 2.3 ? 2 : 1;

      for (let w = 0; w < whiskerCount; w++) {
        const offsetAngle = w === 0 ? 0.38 : 0.62;
        const waveFreq = w === 0 ? 0.7 : 0.95;
        const currentLen = w === 0 ? whiskerLen : whiskerLen * 0.75;

        [-1, 1].forEach(side => {
          const barbelAngle = this.angle + (side * offsetAngle);
          const bx = head.x + Math.cos(barbelAngle) * (7 * this.scale);
          const by = head.y + Math.sin(barbelAngle) * (7 * this.scale);

          const wave = Math.sin(this.swimPhase * waveFreq + side * 1.5) * (3.5 + (this.evolutionProgress - 1) * 5) * this.scale;

          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.quadraticCurveTo(
            bx - Math.cos(this.angle) * (currentLen * 0.5) + side * (6 * this.scale) + wave,
            by - Math.sin(this.angle) * (currentLen * 0.5) + wave,
            bx - Math.cos(this.angle) * currentLen + side * (10 * this.scale) + wave * 1.2,
            by - Math.sin(this.angle) * currentLen + wave * 1.0
          );
          ctx.strokeStyle = this.evolutionProgress >= 2.3 ? '#ffffff' : accentColorStr;
          ctx.lineWidth = (w === 0 ? 1.3 : 0.85) * this.scale;
          ctx.shadowColor = accentColorStr;
          ctx.shadowBlur = 8 * this.scale;
          ctx.stroke();
        });
      }
    }

    drawAntlerHorns(ctx) {
      if (this.evolutionProgress < 2.2) return;
      const head = this.segments[0];
      if (!head) return;

      const hornScale = Math.min(1.0, (this.evolutionProgress - 2.2) * 2.5) * this.scale;
      const goldGlow = 'rgba(251, 191, 36, 0.85)';

      [-1, 1].forEach(side => {
        ctx.save();
        // Rooted at rear temples of head, sweeping gracefully backward along neck
        const rootAngle = this.angle + Math.PI + (side * 0.42);
        const rx = head.x + Math.cos(rootAngle) * (6.5 * this.scale);
        const ry = head.y + Math.sin(rootAngle) * (6.5 * this.scale);

        ctx.translate(rx, ry);
        ctx.rotate(this.angle + Math.PI + (side * 0.18));

        ctx.beginPath();
        // Elegant sweeping main beam
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(8 * hornScale, side * 3 * hornScale, 18 * hornScale, side * 5 * hornScale);
        ctx.quadraticCurveTo(24 * hornScale, side * 7 * hornScale, 30 * hornScale, side * 8 * hornScale);

        // Delicate crystalline upper tine
        ctx.moveTo(12 * hornScale, side * 4 * hornScale);
        ctx.quadraticCurveTo(16 * hornScale, side * 8 * hornScale, 20 * hornScale, side * 11 * hornScale);

        // Subtle rear tine
        ctx.moveTo(20 * hornScale, side * 6 * hornScale);
        ctx.lineTo(25 * hornScale, side * 12 * hornScale);

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.8 * hornScale;
        ctx.lineCap = 'round';
        ctx.shadowColor = goldGlow;
        ctx.shadowBlur = 10 * hornScale;
        ctx.stroke();

        ctx.restore();
      });
    }
  }

  class ElementalKoiPond {
    constructor(canvasId = 'elemental-koi-canvas') {
      this.canvasId = canvasId;
      this.canvas = document.getElementById(canvasId);

      this.ctx = this.canvas ? this.canvas.getContext('2d', { alpha: true }) : null;
      this.width = 0;
      this.height = 0;

      this.currentElement = 'spirit';
      this.currentSectionId = 'vocabulary';
      this.mode = 'wander'; // 'wander' | 'yin-yang'

      // Pond Boundaries for current active card
      this.bounds = { left: 40, right: 600, top: 40, bottom: 440, width: 560, height: 400 };
      this.orbitCenter = { x: 320, y: 240 };

      // Phase 5: Debug Mode Overlay & Telemetry
      this.debugMode = false;

      // Particles & Ripples
      this.ripples = [];
      this.particles = [];
      this.foodPellets = [];

      // Mouse tracking
      this.mouse = { x: -1000, y: -1000, active: false };

      // Two Sacred Koi: Tui (Moon Yin) & La (Void/Ocean Yang)
      this.evolutionStage = 1;
      this.koiTui = new ElementalKoiFish('yin', 260, 200, 0.4, 'spirit');
      this.koiLa = new ElementalKoiFish('yang', 380, 260, 3.4, 'spirit');

      this.isRunning = false;
      this.animId = null;

      this.init();
    }

    dropFood(x, y, type = 'pellet') {
      const bounds = this.bounds || (typeof this.calculateUsablePondBounds === 'function' ? this.calculateUsablePondBounds() : null);
      let targetX = typeof x === 'number' && !isNaN(x) ? x : 300;
      let targetY;

      // If y is provided, use it; otherwise fall from the upper pond surface (like V2)
      if (typeof y === 'number' && !isNaN(y)) {
        targetY = y;
      } else {
        targetY = bounds && typeof bounds.top === 'number' ? bounds.top + 30 : 80;
      }

      // Clamp target coordinates inside usable swimming area so food never lands in unreachable margins
      if (bounds && typeof bounds.left === 'number' && typeof bounds.right === 'number') {
        const pad = 36;
        const minX = bounds.left + pad;
        const maxX = Math.max(minX, bounds.right - pad);
        const minY = bounds.top + pad;
        const maxY = Math.max(minY, bounds.bottom - pad);
        targetX = Math.min(maxX, Math.max(minX, targetX));
        targetY = Math.min(maxY, Math.max(minY, targetY));
      }

      const floorY = bounds && typeof bounds.bottom === 'number' ? bounds.bottom - 42 : 440;

      const pellet = {
        id: Math.random().toString(36).substring(2, 9),
        x: targetX,
        y: targetY,
        floorY: floorY,
        vy: 0.65 + Math.random() * 0.35, // Sinking downward velocity like V2
        type: type === 'petal' ? 'petal' : 'pellet',
        age: 0,
        maxAge: 1200,
        radius: type === 'petal' ? 7.5 : 4.5,
        bobPhase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2
      };
      this.foodPellets.push(pellet);
      if (this.foodPellets.length > 5) {
        this.foodPellets.shift();
      }
      this.addRipple(pellet.x, pellet.y, pellet.type === 'petal' ? 'rgba(244, 114, 182, 0.75)' : 'rgba(251, 191, 36, 0.85)', 48);
      if (typeof window !== 'undefined' && window.zenAudio && typeof window.zenAudio.playBloop === 'function') {
        window.zenAudio.playBloop();
      }
      return pellet;
    }

    init() {
      if (!this.canvas) {
        this.canvas = document.getElementById(this.canvasId);
        if (this.canvas) {
          this.ctx = this.canvas.getContext('2d', { alpha: true });
        }
      }

      this.resize();
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('resize', () => this.resize());
      }

      // Phase 5: Developer Debug Overlay Shortcut (Ctrl+Shift+D)
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('keydown', (e) => {
          if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
            this.debugMode = !this.debugMode;
            console.log(`[ElementalKoiPond] Debug Overlay: ${this.debugMode ? 'ACTIVE' : 'INACTIVE'}`);
          }
        });
      }
      if (typeof window !== 'undefined') {
        window.__TOGGLE_POND_DEBUG__ = () => {
          this.debugMode = !this.debugMode;
          return this.debugMode;
        };
      }

      // Priority 7: Tab Visibility Pause / Resume (Preserve battery and CPU when backgrounded)
      if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            this.stop();
          } else {
            this.start();
          }
        });
      }

      // Track mouse across the deck
      const deckWrapper = (typeof document !== 'undefined') ? (document.getElementById('pillars-deck-wrapper') || (this.canvas ? this.canvas.parentElement : null)) : null;
      if (deckWrapper) {
        deckWrapper.addEventListener('mousemove', e => {
          if (!this.canvas) return;
          const rect = this.canvas.getBoundingClientRect();
          this.mouse.x = e.clientX - rect.left;
          this.mouse.y = e.clientY - rect.top;
          this.mouse.active = true;

          if (Math.random() < 0.07) {
            const theme = THEMES[this.currentElement] || THEMES.spirit;
            this.addRipple(this.mouse.x, this.mouse.y, rgbToString(theme.ripple, 0.35), 45);
          }
        });

        deckWrapper.addEventListener('mouseleave', () => {
          this.mouse.active = false;
          this.mouse.x = -1000;
          this.mouse.y = -1000;
        });

        deckWrapper.addEventListener('click', e => {
          if (!this.canvas) return;
          const rect = this.canvas.getBoundingClientRect();
          const cx = e.clientX - rect.left;
          const cy = e.clientY - rect.top;
          const theme = THEMES[this.currentElement] || THEMES.spirit;

          // Priority 2: Creature Click Hit-Testing
          const hit = this.hitTestCreature(cx, cy);
          if (hit) {
            // Golden celebration ripple & sparkles around creature
            this.addRipple(cx, cy, 'rgba(251, 191, 36, 0.9)', 85);
            for (let i = 0; i < 9; i++) {
              this.addParticle(cx, cy, 'rgba(251, 191, 36, 0.95)');
            }
            // Agility burst response
            if (hit.creature) {
              hit.creature.behaviorState = 'darting';
              hit.creature.behaviorDuration = 45;
            }
            // Dispatch event for UI Creature Inspect Drawer/Modal
            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
              window.dispatchEvent(new CustomEvent('creature-clicked', {
                detail: {
                  type: hit.type,
                  stage: hit.stage,
                  progress: hit.progress,
                  scale: hit.scale
                }
              }));
            }
          } else {
            // Expanding interactive water ripple & food drop
            this.addRipple(cx, cy, rgbToString(theme.ripple, 0.75), 65);
            this.dropFood(cx, cy, Math.random() < 0.35 ? 'petal' : 'pellet');
          }
        });
      }

      this.start();
    }

    hitTestCreature(x, y) {
      const candidates = [this.koiTui, this.koiLa].filter(Boolean);
      for (const fish of candidates) {
        if (!fish.segments || fish.segments.length === 0) continue;
        const hitRadius = Math.max(30, 26 * fish.scale);
        for (let i = 0; i < Math.min(6, fish.segments.length); i++) {
          const seg = fish.segments[i];
          const dist = Math.hypot(seg.x - x, seg.y - y);
          if (dist <= hitRadius) {
            return {
              creature: fish,
              type: fish.type,
              stage: fish.evolutionStage,
              progress: fish.evolutionProgress,
              scale: fish.scale,
              x: seg.x,
              y: seg.y
            };
          }
        }
      }
      return null;
    }

    setStudyActive(active) {
      if (this.koiTui && typeof this.koiTui.setStudyActive === 'function') {
        this.koiTui.setStudyActive(active);
      }
      if (this.koiLa && typeof this.koiLa.setStudyActive === 'function') {
        this.koiLa.setStudyActive(active);
      }
    }

    resize() {
      if (!this.canvas) {
        if (typeof document !== 'undefined') {
          this.canvas = document.getElementById(this.canvasId);
          if (this.canvas) this.ctx = this.canvas.getContext('2d', { alpha: true });
        }
        if (!this.canvas) return;
      }

      const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : null;
      const w = rect && rect.width > 50 ? rect.width : (this.canvas.clientWidth || 1080);
      const h = rect && rect.height > 50 ? rect.height : (this.canvas.clientHeight || 440);

      const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      this.width = w;
      this.height = h;
      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);
      if (this.ctx && typeof this.ctx.setTransform === 'function') {
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      this.updateActivePondBounds();
    }

    // Phase 2: Reliable Coordinate System & True Usable Pond Bounds (Problem 1)
    calculateUsablePondBounds() {
      if (typeof document === 'undefined') {
        return {
          left: 40,
          right: (this.width || 1200) - 40,
          top: 40,
          bottom: (this.height || 600) - 40,
          width: (this.width || 1200) - 80,
          height: (this.height || 600) - 80,
          centerX: Math.floor((this.width || 1200) * 0.5),
          centerY: Math.floor((this.height || 600) * 0.5)
        };
      }

      const expandedCard = document.querySelector('.pillar-card.is-expanded') || document.getElementById(`card-${this.currentSectionId}`);
      if (expandedCard && this.canvas) {
        const cRect = this.canvas.getBoundingClientRect();
        const cardRect = expandedCard.getBoundingClientRect();

        // Only measure if DOM card is laid out and non-collapsed
        if (cardRect.width > 160 && cardRect.height > 140) {
          const cardLeft = cardRect.left - cRect.left;
          const cardTop = cardRect.top - cRect.top;
          const cardWidth = cardRect.width;
          const cardHeight = cardRect.height;

          // Reserve space for top header (~52px) and bottom controls pill (~54px)
          const padX = 26;
          const padTop = 52;
          const padBottom = 54;

          const left = Math.max(0, cardLeft + padX);
          const top = Math.max(0, cardTop + padTop);
          const width = Math.max(160, cardWidth - padX * 2);
          const height = Math.max(140, cardHeight - padTop - padBottom);
          const right = left + width;
          const bottom = top + height;

          const centerX = Math.floor(left + width * 0.5);
          const centerY = Math.floor(top + height * 0.5);

          return {
            left,
            right,
            top,
            bottom,
            width,
            height,
            centerX,
            centerY
          };
        }
      }

      // Safe centered default within canvas arena
      const w = this.width || 1200;
      const h = this.height || 600;
      const arenaW = Math.min(w * 0.6, 680);
      const arenaH = Math.min(h * 0.75, 420);
      const cX = Math.floor(w * 0.5);
      const cY = Math.floor(h * 0.5);

      return {
        left: cX - Math.floor(arenaW * 0.5),
        right: cX + Math.floor(arenaW * 0.5),
        top: cY - Math.floor(arenaH * 0.5),
        bottom: cY + Math.floor(arenaH * 0.5),
        width: arenaW,
        height: arenaH,
        centerX: cX,
        centerY: cY
      };
    }

    updateActivePondBounds() {
      const bounds = this.calculateUsablePondBounds();
      this.bounds = bounds;
      this.orbitCenter = { x: bounds.centerX, y: bounds.centerY };
    }

    // Phase 2: Deliberate Transition Engine (Problem 3: IDLE -> PREPARE -> TRAVEL -> ARRIVE -> SETTLE)
    jumpToPond(targetSectionId, targetElement) {
      if (!targetElement && typeof window !== 'undefined' && window.ELEMENTAL_DATA && window.ELEMENTAL_DATA[targetSectionId]) {
        targetElement = window.ELEMENTAL_DATA[targetSectionId].element;
      }
      targetElement = targetElement || 'spirit';

      this.currentSectionId = targetSectionId;
      this.currentElement = targetElement;

      // Update color targets on both fish for mid-air morphing!
      this.koiTui.setTargetTheme(targetElement);
      this.koiLa.setTargetTheme(targetElement);

      // Departure ripple at departure center
      if (this.orbitCenter) {
        this.addRipple(this.orbitCenter.x, this.orbitCenter.y, 'rgba(255, 255, 255, 0.65)', 50);
      }

      // Execute smooth continuous 5-state transition
      const executeTransition = () => {
        this.resize();
        this.updateActivePondBounds();

        const targetCenterX = this.orbitCenter.x;
        const targetCenterY = this.orbitCenter.y;

        // Tui glides smoothly toward slightly upper-left of center
        this.koiTui.startPondTransition(targetCenterX - 34, targetCenterY - 14, 0);
        // La glides with a graceful companion offset toward slightly lower-right
        this.koiLa.startPondTransition(targetCenterX + 34, targetCenterY + 14, 8);
      };

      executeTransition();

      // Keep bounds synchronized as card accordion settles
      setTimeout(() => this.updateActivePondBounds(), 180);
      setTimeout(() => this.updateActivePondBounds(), 420);
      setTimeout(() => this.updateActivePondBounds(), 700);
    }

    setMode(newMode) {
      if (this.mode === newMode) return;
      this.mode = newMode; // 'wander' | 'yin-yang'

      if (newMode === 'yin-yang') {
        const theme = THEMES[this.currentElement] || THEMES.spirit;
        this.addRipple(this.orbitCenter.x, this.orbitCenter.y, rgbToString(theme.ripple, 0.8), 95);
        this.addRipple(this.orbitCenter.x, this.orbitCenter.y, '#ffffff', 70);
      }
    }

    setEvolutionStage(stage) {
      const s = Math.max(1, Math.min(3, stage));
      if (this.evolutionStage !== s) {
        this.evolutionStage = s;
        // Metamorphosis shockwave ripple
        if (this.orbitCenter) {
          this.addRipple(this.orbitCenter.x, this.orbitCenter.y, '#ffffff', 90);
          this.addRipple(this.orbitCenter.x, this.orbitCenter.y, 'rgba(251, 191, 36, 0.8)', 130);
        }
      }
      if (this.koiTui) this.koiTui.setEvolutionStage(s);
      if (this.koiLa) this.koiLa.setEvolutionStage(s);
    }

    drawCelestialPearl(ctx) {
      if (!ctx || !this.orbitCenter) return;
      if (this.evolutionStage < 3 && (!this.koiTui || this.koiTui.evolutionProgress < 2.3)) return;

      const t = Date.now() * 0.002;
      const px = this.orbitCenter.x;
      const py = this.orbitCenter.y + Math.sin(t * 1.5) * 3;
      const pearlRadius = 7.5 + Math.sin(t * 2) * 1.0;

      ctx.save();
      const theme = THEMES[this.currentElement] || THEMES.spirit;
      // Soft mystical elemental halo
      const grad = ctx.createRadialGradient(px, py, 1.5, px, py, pearlRadius * 3.0);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.35, rgbToString(theme.ripple, 0.6));
      grad.addColorStop(0.7, rgbToString(theme.ripple, 0.18));
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(px, py, pearlRadius * 3.0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Incandescent pearl core
      ctx.beginPath();
      ctx.arc(px, py, pearlRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = rgbToString(theme.ripple, 1);
      ctx.shadowBlur = 14;
      ctx.fill();

      ctx.restore();
    }

    addRipple(x, y, color = 'rgba(192, 132, 252, 0.4)', maxRadius = 55) {
      this.ripples.push({
        x,
        y,
        radius: 4,
        maxRadius,
        alpha: 0.72,
        color
      });

      this.ripples.push({
        x,
        y,
        radius: 1,
        maxRadius: Math.max(16, maxRadius * 0.68),
        alpha: 0.45,
        color: color.includes('251') ? 'rgba(255, 255, 255, 0.6)' : color
      });

      if (this.ripples.length > 28) this.ripples.splice(0, 2);
    }

    addParticle(x, y, color) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.4 - Math.random() * 0.7,
        radius: 1.5 + Math.random() * 2.4,
        alpha: 0.8,
        color: color || '#c084fc',
        life: 0,
        maxLife: 55 + Math.random() * 45
      });
      if (this.particles.length > 60) this.particles.shift();
    }

    // Phase 5: Development Debug Overlay & Telemetry HUD
    drawDebugOverlay(ctx) {
      if (!this.debugMode || !ctx) return;
      ctx.save();

      // 1. Draw Usable Pond Bounds
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(this.bounds.left, this.bounds.top, this.bounds.width, this.bounds.height);

      // 2. Draw Orbit Center / Target Center
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(this.orbitCenter.x, this.orbitCenter.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // 3. For each fish, draw centroid, heading, and silhouette radius
      [this.koiTui, this.koiLa].forEach((fish, idx) => {
        if (!fish) return;
        const centroid = fish.getVisualCentroid();
        const safeR = fish.getSilhouetteBoundingRadius();

        // Centroid dot
        ctx.fillStyle = idx === 0 ? '#c084fc' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(centroid.x, centroid.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Silhouette safe envelope circle
        ctx.strokeStyle = idx === 0 ? 'rgba(192, 132, 252, 0.4)' : 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(centroid.x, centroid.y, safeR, 0, Math.PI * 2);
        ctx.stroke();

        // Heading vector from head
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(fish.x, fish.y);
        ctx.lineTo(fish.x + Math.cos(fish.angle) * 35, fish.y + Math.sin(fish.angle) * 35);
        ctx.stroke();

        // Bézier transition path if active
        if (fish.travelPath) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(fish.travelPath.p0.x, fish.travelPath.p0.y);
          ctx.bezierCurveTo(
            fish.travelPath.p1.x, fish.travelPath.p1.y,
            fish.travelPath.p2.x, fish.travelPath.p2.y,
            fish.travelPath.p3.x, fish.travelPath.p3.y
          );
          ctx.stroke();
        }
      });

      // 4. Debug Telemetry HUD
      ctx.fillStyle = 'rgba(10, 10, 16, 0.85)';
      ctx.fillRect(this.bounds.left + 10, this.bounds.top + 10, 260, 92);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.strokeRect(this.bounds.left + 10, this.bounds.top + 10, 260, 92);

      ctx.font = '11px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`POND DEBUG: ${this.currentSectionId} (${this.currentElement})`, this.bounds.left + 18, this.bounds.top + 28);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Tui State: ${this.koiTui ? this.koiTui.transitionState : '-'} (${this.koiTui ? this.koiTui.behaviorState : '-'})`, this.bounds.left + 18, this.bounds.top + 45);
      ctx.fillText(`La State:  ${this.koiLa ? this.koiLa.transitionState : '-'} (${this.koiLa ? this.koiLa.behaviorState : '-'})`, this.bounds.left + 18, this.bounds.top + 62);
      ctx.fillText(`Evolution: St.${this.evolutionStage} (Scale: ${this.koiTui ? this.koiTui.scale.toFixed(2) : '-'})`, this.bounds.left + 18, this.bounds.top + 79);

      ctx.restore();
    }

    animate() {
      if (!this.isRunning) return;

      if (!this.canvas) {
        if (typeof document !== 'undefined') {
          this.canvas = document.getElementById(this.canvasId);
          if (this.canvas) this.ctx = this.canvas.getContext('2d', { alpha: true });
        }
      }

      if (!this.ctx) {
        this.animId = requestAnimationFrame(this.animate.bind(this));
        return;
      }

      this.ctx.clearRect(0, 0, this.width, this.height);

      // Periodically keep bounds updated during card transitions
      if (!this.koiTui.isLeaping && Math.random() < 0.1) {
        this.updateActivePondBounds();
      }

      // 1. Draw Ambient Pond Water Atmosphere & Radial Caustics
      this.drawPondAtmosphere();

      // 2. Update & Draw Ripples
      for (let i = this.ripples.length - 1; i >= 0; i--) {
        const r = this.ripples[i];
        r.radius += 1.05;
        r.alpha -= 0.012;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          this.ripples.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = r.color.replace(/[\d.]+\)$/, `${Math.max(0, r.alpha)})`);
        this.ctx.lineWidth = 1.6;
        this.ctx.stroke();
        this.ctx.restore();
      }

      // 3. Update & Draw Bioluminescent Spores
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = Math.max(0, 0.8 * (1 - p.life / p.maxLife));

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

      // 3b. Update & Draw Floating Food Pellets & Petals
      const pondBounds = this.bounds || (typeof this.calculateUsablePondBounds === 'function' ? this.calculateUsablePondBounds() : null);
      for (let i = this.foodPellets.length - 1; i >= 0; i--) {
        const fp = this.foodPellets[i];

        // V2 Falling & Sinking Physics: Pellet sinks smoothly downward through the water
        if (fp.vy && fp.vy > 0) {
          fp.y += fp.vy;
          // Delicate falling stardust glimmer trail
          if (Math.random() < 0.35 && typeof this.addParticle === 'function') {
            this.addParticle(
              fp.x + (Math.random() * 4 - 2),
              fp.y,
              fp.type === 'petal' ? 'rgba(244, 114, 182, 0.55)' : 'rgba(251, 191, 36, 0.65)'
            );
          }
          const maxFloor = fp.floorY || (pondBounds ? pondBounds.bottom - 42 : 440);
          if (fp.y >= maxFloor) {
            fp.y = maxFloor;
            fp.vy = 0; // Settles onto the gentle pond floor
          }
        }

        // Inward gentle water drift current: keep floating petals/pellets away from edges and corners
        if (pondBounds && typeof pondBounds.left === 'number') {
          const edgePad = 48;
          if (fp.x < pondBounds.left + edgePad) {
            fp.x += 0.45;
          } else if (fp.x > pondBounds.right - edgePad) {
            fp.x -= 0.45;
          }
          if (fp.y < pondBounds.top + edgePad) {
            fp.y += 0.45;
          } else if (fp.y > pondBounds.bottom - edgePad) {
            fp.y -= 0.45;
          }
        }

        // Check if any koi is currently near or actively pursuing this pellet (< 260px)
        const isPursued = [this.koiTui, this.koiLa].some(fish => {
          if (!fish) return false;
          return Math.hypot(fish.x - fp.x, fish.y - fp.y) < 260;
        });

        // Do not expire food while koi is swimming toward it!
        if (!isPursued) {
          fp.age++;
        } else {
          // Extremely slow decay if pursued so food never vanishes under the fish's nose
          fp.age += 0.15;
        }
        fp.bobPhase += 0.06;

        if (fp.age >= fp.maxAge) {
          this.foodPellets.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, 1 - (fp.age / fp.maxAge) * 0.35);
        const bobY = Math.sin(fp.bobPhase) * 1.8;

        this.ctx.save();
        this.ctx.translate(fp.x, fp.y + bobY);

        if (fp.type === 'petal') {
          // Drifting Cherry Blossom / Lotus Petal
          this.ctx.rotate(fp.rotation + fp.age * 0.008);
          this.ctx.beginPath();
          this.ctx.moveTo(0, -fp.radius);
          this.ctx.quadraticCurveTo(fp.radius * 0.75, -fp.radius * 0.2, 0, fp.radius * 0.9);
          this.ctx.quadraticCurveTo(-fp.radius * 0.75, -fp.radius * 0.2, 0, -fp.radius);
          this.ctx.fillStyle = `rgba(244, 114, 182, ${alpha * 0.88})`;
          this.ctx.shadowColor = 'rgba(244, 114, 182, 0.8)';
          this.ctx.shadowBlur = 8;
          this.ctx.fill();
        } else {
          // Luminous Golden Spirit Food Pellet
          this.ctx.beginPath();
          this.ctx.arc(0, 0, fp.radius, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
          this.ctx.shadowColor = 'rgba(251, 191, 36, 0.95)';
          this.ctx.shadowBlur = 10;
          this.ctx.fill();

          // Core glimmer
          this.ctx.beginPath();
          this.ctx.arc(0, 0, fp.radius * 0.45, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
          this.ctx.fill();
        }

        this.ctx.restore();
      }

      // 4. Update Two Sacred Koi Fish
      this.koiTui.update(this.bounds, this.mode, this.orbitCenter, this.koiLa, this.mouse, this);
      this.koiLa.update(this.bounds, this.mode, this.orbitCenter, this.koiTui, this.mouse, this);

      // Emit occasional spirit spores from tail tips
      if (!this.koiTui.isLeaping && Math.random() < 0.28) {
        const tTail = this.koiTui.segments[this.koiTui.segments.length - 1];
        if (tTail) this.addParticle(tTail.x, tTail.y, rgbToString(this.koiTui.currentColors.fin, 0.85));
      }
      if (!this.koiLa.isLeaping && Math.random() < 0.28) {
        const lTail = this.koiLa.segments[this.koiLa.segments.length - 1];
        if (lTail) this.addParticle(lTail.x, lTail.y, rgbToString(this.koiLa.currentColors.accent, 0.85));
      }

      // Draw Fish
      this.koiLa.draw(this.ctx);
      this.koiTui.draw(this.ctx);

      // 5. Draw Debug Overlay if enabled
      if (this.debugMode) {
        this.drawDebugOverlay(this.ctx);
      }

      this.animId = requestAnimationFrame(this.animate.bind(this));
    }

    drawPondAtmosphere() {
      this.ctx.save();

      const theme = THEMES[this.currentElement] || THEMES.spirit;

      // Soft water depth gradient inside current pond
      const grad = this.ctx.createRadialGradient(
        this.orbitCenter.x, this.orbitCenter.y, 40,
        this.orbitCenter.x, this.orbitCenter.y, Math.max(160, this.bounds.width * 0.45)
      );
      grad.addColorStop(0, theme.ambientCenter);
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.04)');
      grad.addColorStop(1, 'transparent');

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(this.bounds.left - 20, this.bounds.top - 20, this.bounds.width + 40, this.bounds.height + 40);

      // When in Yin-Yang mode, harmony orbit
      if (this.mode === 'yin-yang') {
        const t = performance.now() * 0.0015;
        const targetRadius = Math.min(this.bounds.width * 0.38, this.bounds.height * 0.38);

        // Soft celestial water ambient vortex glow (zero harsh geometric stroke lines)
        const vortexGrad = this.ctx.createRadialGradient(
          this.orbitCenter.x, this.orbitCenter.y, targetRadius * 0.45,
          this.orbitCenter.x, this.orbitCenter.y, targetRadius * 1.3
        );
        vortexGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
        vortexGrad.addColorStop(0.65, rgbToString(theme.ripple, 0.05 + Math.sin(t) * 0.02));
        vortexGrad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = vortexGrad;
        this.ctx.beginPath();
        this.ctx.arc(this.orbitCenter.x, this.orbitCenter.y, targetRadius * 1.35, 0, Math.PI * 2);
        this.ctx.fill();

        this.drawCelestialPearl(this.ctx);
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

  // Expose to window both as ElementalKoiFish and ElementalKoiPond
  window.ElementalKoiFish = ElementalKoiFish;
  window.ElementalKoiPond = ElementalKoiPond;
  window.SpiritKoiPond = ElementalKoiPond;

})();

