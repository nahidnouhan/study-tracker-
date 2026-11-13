/**
 * Test Suite: Elemental Koi-to-Dragon Evolution Engine
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock Canvas 2D Context
class MockCanvasRenderingContext2D {
  constructor() {
    this.calls = [];
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.lineWidth = 1;
    this.globalAlpha = 1;
    this.shadowColor = 'transparent';
    this.shadowBlur = 0;
  }
  save() { this.calls.push('save'); }
  restore() { this.calls.push('restore'); }
  beginPath() { this.calls.push('beginPath'); }
  closePath() { this.calls.push('closePath'); }
  moveTo(x, y) {
    assert(!Number.isNaN(x) && !Number.isNaN(y), `moveTo received NaN: (${x}, ${y})`);
    this.calls.push(`moveTo(${x},${y})`);
  }
  lineTo(x, y) {
    assert(!Number.isNaN(x) && !Number.isNaN(y), `lineTo received NaN: (${x}, ${y})`);
    this.calls.push(`lineTo(${x},${y})`);
  }
  quadraticCurveTo(cpx, cpy, x, y) {
    assert(!Number.isNaN(cpx) && !Number.isNaN(cpy) && !Number.isNaN(x) && !Number.isNaN(y), 'quadraticCurveTo received NaN');
    this.calls.push('quadraticCurveTo');
  }
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    assert(!Number.isNaN(cp1x) && !Number.isNaN(cp1y) && !Number.isNaN(cp2x) && !Number.isNaN(cp2y) && !Number.isNaN(x) && !Number.isNaN(y), 'bezierCurveTo received NaN');
    this.calls.push('bezierCurveTo');
  }
  arc(x, y, r, sa, ea) {
    assert(!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(r), `arc received NaN: (${x}, ${y}, r=${r})`);
    this.calls.push('arc');
  }
  stroke() { this.calls.push('stroke'); }
  fill() { this.calls.push('fill'); }
  fillRect(x, y, w, h) { this.calls.push('fillRect'); }
  clearRect(x, y, w, h) { this.calls.push('clearRect'); }
  translate(x, y) {
    assert(!Number.isNaN(x) && !Number.isNaN(y), `translate received NaN: (${x}, ${y})`);
    this.calls.push('translate');
  }
  rotate(a) {
    assert(!Number.isNaN(a), `rotate received NaN: ${a}`);
    this.calls.push('rotate');
  }
  scale(sx, sy) {
    assert(!Number.isNaN(sx) && !Number.isNaN(sy), `scale received NaN: (${sx}, ${sy})`);
    this.calls.push('scale');
  }
  setLineDash() {}
  createLinearGradient() { return { addColorStop: () => {} }; }
  createRadialGradient() { return { addColorStop: () => {} }; }
  setTransform() {}
}

global.requestAnimationFrame = (fn) => setTimeout(fn, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Setup global mock DOM
global.window = {
  devicePixelRatio: 1,
  addEventListener: () => {},
  removeEventListener: () => {},
  requestAnimationFrame: global.requestAnimationFrame,
  cancelAnimationFrame: global.cancelAnimationFrame
};
global.document = {
  getElementById: (id) => {
    return {
      id,
      getContext: () => new MockCanvasRenderingContext2D(),
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 600 }),
      parentElement: {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 600 })
      },
      addEventListener: () => {},
      clientWidth: 1200,
      clientHeight: 600,
      width: 1200,
      height: 600
    };
  },
  querySelector: () => ({
    getBoundingClientRect: () => ({ left: 200, top: 50, width: 750, height: 500 })
  })
};

// Load elemental-koi-pond.js
const code = fs.readFileSync(path.join(__dirname, 'elemental-koi-pond.js'), 'utf8');
eval(code);

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(err.message);
    throw err;
  }
}

console.log('=====================================================');
console.log('RUNNING KOI-TO-DRAGON EVOLUTION SUITE');
console.log('=====================================================');

// Test 1: Evolution Stage Property and Setter on Fish
runTest('E1: ElementalKoiFish initializes at Stage 1 and supports setEvolutionStage', () => {
  const fish = new window.ElementalKoiFish('tui', { primary: [168, 85, 247], secondary: [192, 132, 252] });
  assert.strictEqual(fish.evolutionStage, 1, 'Initial evolution stage should be 1');
  
  fish.setEvolutionStage(2);
  assert.strictEqual(fish.targetEvolutionStage, 2, 'targetEvolutionStage should be 2');
  
  fish.setEvolutionStage(3);
  assert.strictEqual(fish.targetEvolutionStage, 3, 'targetEvolutionStage should be 3');
});

// Test 2: Spine Vertebrae Count Scales with Evolution Stage
runTest('E2: Spine vertebrae count scales dynamically (Stage 1 >= 8, Stage 2 >= 12, Stage 3 >= 16)', () => {
  const fish = new window.ElementalKoiFish('tui', { primary: [168, 85, 247], secondary: [192, 132, 252] });
  assert(fish.spinePoints.length >= 8, `Stage 1 should have >= 8 spine points, got ${fish.spinePoints.length}`);

  fish.setEvolutionStage(2);
  // Simulate ticks to complete lerp
  for (let i = 0; i < 40; i++) fish.update([20, 1180, 20, 580], null, null, 'wander');
  assert(fish.spinePoints.length >= 12, `Stage 2 should expand to >= 12 spine points, got ${fish.spinePoints.length}`);

  fish.setEvolutionStage(3);
  for (let i = 0; i < 40; i++) fish.update([20, 1180, 20, 580], null, null, 'wander');
  assert(fish.spinePoints.length >= 16, `Stage 3 should expand to >= 16 spine points, got ${fish.spinePoints.length}`);
});

// Test 3: Stage 2 Features (Dorsal Ridge, Secondary Ventral Ribbons, Flowing Chin Whiskers)
runTest('E3: Stage 2 renders dorsal crest, chin whiskers and secondary fins without errors', () => {
  const fish = new window.ElementalKoiFish('la', { primary: [245, 158, 11], secondary: [251, 191, 36] });
  fish.setEvolutionStage(2);
  for (let i = 0; i < 40; i++) fish.update([20, 1180, 20, 580], null, null, 'wander');
  
  const ctx = new MockCanvasRenderingContext2D();
  assert.doesNotThrow(() => {
    fish.draw(ctx);
  }, 'Drawing Stage 2 fish should not throw');
  
  assert(typeof fish.drawWhiskers === 'function', 'fish must have drawWhiskers method');
  assert(typeof fish.drawDorsalCrest === 'function', 'fish must have drawDorsalCrest method');
});

// Test 4: Stage 3 Features (Golden Antlers, Wing Plumes, Celestial Pearl)
runTest('E4: Stage 3 renders antler horns, multi-tier wings, and pearl in yin-yang orbit', () => {
  const pond = new window.ElementalKoiPond('mock-canvas');
  pond.setEvolutionStage(3);
  pond.setMode('yin-yang');

  const ctx = new MockCanvasRenderingContext2D();
  assert.doesNotThrow(() => {
    pond.koiTui.draw(ctx);
    pond.koiLa.draw(ctx);
    pond.drawCelestialPearl(ctx);
  }, 'Stage 3 drawing fish and pearl should not throw');

  assert(typeof pond.koiTui.drawAntlerHorns === 'function', 'fish must have drawAntlerHorns method');
  assert(typeof pond.drawCelestialPearl === 'function', 'pond must have drawCelestialPearl method');
  pond.stop();
});

// Test 5: Behavioral AI States & Study Energy (Task 1)
runTest('E5: Creature supports behavioral states and study active energy modulation', () => {
  const pond = new window.ElementalKoiPond('mock-canvas');
  const fish = pond.koiTui;
  assert(typeof fish.setStudyActive === 'function', 'fish must have setStudyActive');
  assert(typeof pond.setStudyActive === 'function', 'pond must have setStudyActive');

  fish.setStudyActive(false);
  assert.strictEqual(fish.isStudyActive, false);
  const idleSpeed = fish.speed;

  fish.setStudyActive(true);
  assert.strictEqual(fish.isStudyActive, true);
  assert(fish.speed > idleSpeed || fish.targetSpeedMultiplier > 1.0, 'Active study should increase creature energy/speed');

  assert(['cruising', 'darting', 'circling', 'curious_cursor'].includes(fish.behaviorState), `Invalid behavior state: ${fish.behaviorState}`);
  pond.stop();
});

// Test 6: Dynamic Size Progression & Anatomical Radii Scaling (Task 2)
runTest('E6: Dynamic scale progression (1.0 -> 1.4 -> 1.85) and anatomical shape morphing', () => {
  const fish = new window.ElementalKoiFish('tui', 'spirit');
  assert.strictEqual(fish.evolutionStage, 1);
  assert(Math.abs(fish.currentScale - 1.0) < 0.05, `Stage 1 base scale should be ~1.0, got ${fish.currentScale}`);

  fish.setEvolutionStage(2);
  for (let i = 0; i < 50; i++) fish.update({ left: 20, right: 1180, top: 20, bottom: 580, width: 1160, height: 560 }, 'wander', null, null, null, null);
  assert(fish.currentScale >= 1.35 && fish.currentScale <= 1.48, `Stage 2 scale should reach ~1.40, got ${fish.currentScale}`);

  fish.setEvolutionStage(3);
  for (let i = 0; i < 50; i++) fish.update({ left: 20, right: 1180, top: 20, bottom: 580, width: 1160, height: 560 }, 'wander', null, null, null, null);
  assert(fish.currentScale >= 1.78 && fish.currentScale <= 1.95, `Stage 3 scale should reach ~1.85, got ${fish.currentScale}`);
});

// Test 7: Pond Ripple Rings, Hit Testing, and Bounded Particle Cleanup (Task 3 & 4)
runTest('E7: Concentric ripples, hit testing, and bounded particle systems', () => {
  const pond = new window.ElementalKoiPond('mock-canvas');
  pond.addRipple(300, 200, 'rgba(168, 85, 247, 0.8)', 70);
  assert(pond.ripples.length >= 1, 'addRipple should create ripple');

  // Hit test checking head proximity
  pond.koiTui.x = 250;
  pond.koiTui.y = 200;
  const hit = pond.hitTestCreature(252, 202);
  assert(hit !== null, 'hitTestCreature should detect creature near head');
  assert.strictEqual(hit.type, 'yin');

  const miss = pond.hitTestCreature(900, 900);
  assert.strictEqual(miss, null, 'hitTestCreature should return null for distant coordinates');
  pond.stop();
});

// Phase 2: Test 8: Silhouette Visual Centroid & Usable Pond Coordinate System (Problem 1)
runTest('E8: Visual centroid calculation and usable pond centering', () => {
  const pond = new window.ElementalKoiPond('mock-canvas');
  const fish = pond.koiTui;

  const centroid = fish.getVisualCentroid();
  assert(!Number.isNaN(centroid.x) && !Number.isNaN(centroid.y), 'Visual centroid should not be NaN');
  assert(typeof centroid.x === 'number' && typeof centroid.y === 'number');

  // Test centerOn
  fish.centerOn(500, 300);
  const newCentroid = fish.getVisualCentroid();
  assert(Math.abs(newCentroid.x - 500) < 1.0, `Centroid X should align with target 500, got ${newCentroid.x}`);
  assert(Math.abs(newCentroid.y - 300) < 1.0, `Centroid Y should align with target 300, got ${newCentroid.y}`);

  // Test usable bounds calculation
  const bounds = pond.calculateUsablePondBounds();
  assert(bounds.width > 100, `Pond width should be > 100, got ${bounds.width}`);
  assert(bounds.height > 100, `Pond height should be > 100, got ${bounds.height}`);
  assert(bounds.centerX > bounds.left && bounds.centerX < bounds.right, 'centerX must lie strictly inside bounds');
  assert(bounds.centerY > bounds.top && bounds.centerY < bounds.bottom, 'centerY must lie strictly inside bounds');

  pond.stop();
});

// Phase 2: Test 9: Independent Movement & Multi-Segment Creature Separation (Problem 2)
runTest('E9: Multi-creature independent movement and vertebral spine separation', () => {
  const pond = new window.ElementalKoiPond('mock-canvas');
  const tui = pond.koiTui;
  const la = pond.koiLa;

  assert(tui.baseSpeed !== la.baseSpeed, 'Tui and La must have distinct base speeds');
  assert(tui.angularSpeed !== la.angularSpeed, 'Tui and La must have distinct angular speeds');
  assert(Math.abs(tui.swimPhase - la.swimPhase) > 0.5, 'Tui and La must start with decoupled phase offsets');

  // Place them at overlapping coordinates to verify separation forces
  tui.x = 300;
  tui.y = 200;
  la.x = 305;
  la.y = 202;
  tui.updateSpine();
  la.updateSpine();

  const initialDist = Math.hypot(tui.x - la.x, tui.y - la.y);
  assert(initialDist < 10, 'Initially placed overlapping');

  // Run separation
  tui.applyCreatureSeparation(la);
  la.applyCreatureSeparation(tui);

  const separatedDist = Math.hypot(tui.x - la.x, tui.y - la.y);
  assert(separatedDist > initialDist, `Creatures should push apart: initial ${initialDist}, separated ${separatedDist}`);

  pond.stop();
});

// Phase 2: Test 10: 5-State Transition Engine & Smooth Path (Problem 3)
runTest('E10: 5-state transition engine (IDLE -> PREPARE -> TRAVEL -> ARRIVE -> SETTLE)', () => {
  const fish = new window.ElementalKoiFish('yin', 100, 100, 0, 'spirit');
  assert.strictEqual(fish.transitionState, 'IDLE');

  // Start transition to destination (600, 350) with delay 5 frames
  fish.startPondTransition(600, 350, 5);
  assert.strictEqual(fish.transitionState, 'PREPARE');
  assert(fish.travelPath !== null, 'Travel path Bézier must be initialized');

  // Run 10 frames to advance past PREPARE into TRAVEL
  const mockPond = { addRipple: () => {}, addParticle: () => {} };
  for (let i = 0; i < 10; i++) {
    fish.update({ left: 40, right: 1000, top: 40, bottom: 600, width: 960, height: 560 }, 'wander', null, null, null, mockPond);
  }
  assert.strictEqual(fish.transitionState, 'TRAVEL', 'Should advance to TRAVEL state');

  // Run remainder of transition until ARRIVE
  for (let i = 0; i < 70; i++) {
    fish.update({ left: 40, right: 1000, top: 40, bottom: 600, width: 960, height: 560 }, 'wander', null, null, null, mockPond);
  }

  // Verify fish arrived in close proximity to destination
  const distToDest = Math.hypot(fish.x - 600, fish.y - 350);
  assert(distToDest < 35, `Fish should arrive near destination (600, 350), got (${fish.x.toFixed(1)}, ${fish.y.toFixed(1)}), dist=${distToDest.toFixed(1)}`);
});

// Phase 2: Test 11: Predictive Boundary Containment Under Stress (Problem 4)
runTest('E11: Predictive boundary containment & silhouette safety under stress testing', () => {
  const fish = new window.ElementalKoiFish('yang', 200, 200, 0, 'fire');
  fish.setEvolutionStage(3); // Largest form (Stage 3 Celestial Dragon)
  fish.setStudyActive(true);  // High energetic study speed

  const bounds = { left: 50, right: 500, top: 50, bottom: 400, width: 450, height: 350 };

  // Run 350 frames of high-speed movement heading towards boundaries
  for (let frame = 0; frame < 350; frame++) {
    // Introduce random angular jitter to stress-test corner steering
    if (frame % 30 === 0) {
      fish.targetAngle += (Math.random() - 0.5) * 2.5;
    }
    fish.update(bounds, 'wander', null, null, null, null);

    // Verify all vertebrae remain strictly inside hard bounds
    for (let s = 0; s < fish.segments.length; s++) {
      const seg = fish.segments[s];
      assert(!Number.isNaN(seg.x) && !Number.isNaN(seg.y), `Vertebra ${s} has NaN coordinates`);
      assert(seg.x >= bounds.left - 5 && seg.x <= bounds.right + 5,
        `Vertebra ${s} escaped horizontal bounds: x=${seg.x.toFixed(1)} not in [${bounds.left}, ${bounds.right}] at frame ${frame}`);
      assert(seg.y >= bounds.top - 5 && seg.y <= bounds.bottom + 5,
        `Vertebra ${s} escaped vertical bounds: y=${seg.y.toFixed(1)} not in [${bounds.top}, ${bounds.bottom}] at frame ${frame}`);
    }
  }
});

// Phase 2: Test 12: Rapid Section Switching Redirection Without Jarring Teleports
runTest('E12: Rapid section switching redirection without coordinate jumps or NaN', () => {
  const pond = new window.ElementalKoiPond('mock-canvas');

  // Trigger rapid consecutive switches
  pond.jumpToPond('vocabulary', 'spirit');
  const tuiX1 = pond.koiTui.x;
  const tuiY1 = pond.koiTui.y;

  pond.jumpToPond('kanji', 'earth');
  const tuiX2 = pond.koiTui.x;
  const tuiY2 = pond.koiTui.y;

  // Verify positions are continuous (no sudden 500px teleport jump between consecutive calls)
  const jumpDist = Math.hypot(tuiX2 - tuiX1, tuiY2 - tuiY1);
  assert(jumpDist < 5.0, `Consecutive jumpToPond calls should not teleport position instantly: jumpDist=${jumpDist}`);

  pond.jumpToPond('grammar', 'air');
  pond.jumpToPond('listening', 'water');
  pond.jumpToPond('reading', 'fire');

  assert(!Number.isNaN(pond.koiTui.x) && !Number.isNaN(pond.koiTui.y), 'Coordinates must remain valid numbers');
  assert(!Number.isNaN(pond.koiLa.x) && !Number.isNaN(pond.koiLa.y), 'Coordinates must remain valid numbers');

  pond.stop();
});

// Test 13: Natural Anatomical Spine Kinematics & Bend Safety
runTest('E13: Natural anatomical spine kinematics without unnatural bend, folding, or joint kinks', () => {
  const fish = new window.ElementalKoiFish('yin', 300, 200, 0, 'spirit');
  const bounds = { left: 50, right: 550, top: 40, bottom: 360, width: 500, height: 320 };
  const orbitCenter = { x: 300, y: 200 };

  for (const mode of ['yin-yang', 'roam']) {
    for (const stage of [1, 2, 3]) {
      fish.setEvolutionStage(stage);

      for (let f = 0; f < 200; f++) {
        fish.update(bounds, mode, orbitCenter, null, null, null);

        const headAngle = fish.angle;
        const tail = fish.segments[fish.segments.length - 1];
        const penult = fish.segments[fish.segments.length - 2];
        const tailJointAngle = Math.atan2(tail.y - penult.y, tail.x - penult.x);
        const tailFwdAngle = tailJointAngle + Math.PI;

        let totalBend = Math.abs(tailFwdAngle - headAngle);
        while (totalBend > Math.PI) totalBend = Math.abs(totalBend - Math.PI * 2);
        const totalBendDeg = totalBend * (180 / Math.PI);

        // Entire spine must not bend past 48 degrees (natural fish biomechanics)
        assert(totalBendDeg <= 48,
          `Mode ${mode} Stage ${stage}: Unnatural spine bend of ${totalBendDeg.toFixed(1)}° detected at frame ${f} (must be <= 48°)`);

        for (let i = 1; i < fish.segments.length; i++) {
          const prev = fish.segments[i - 1];
          const curr = fish.segments[i];
          const dx = curr.x - prev.x;
          const dy = curr.y - prev.y;

          // Segment alignment with forward heading
          const segLen = Math.hypot(dx, dy) || 1;
          const fwdX = -dx / segLen;
          const fwdY = -dy / segLen;
          const dot = Math.cos(fish.angle) * fwdX + Math.sin(fish.angle) * fwdY;

          // Must point forward in swimming direction (no reverse folding / origami)
          assert(dot >= 0.65,
            `Mode ${mode} Stage ${stage}: Segment ${i} folded backward (heading dot = ${dot.toFixed(2)} < 0.65) at frame ${f}`);
        }
      }
    }
  }
});

console.log('=====================================================');
console.log('ALL EVOLUTION TESTS PASSED!');
console.log('=====================================================');
process.exit(0);

