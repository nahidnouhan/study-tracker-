// test-zen-features.js
// Automated verification suite for:
// 1. Interactive Pond Feeding & Koi Nibbling AI
// 2. Procedural Zen Web Audio Soundscape
// 3. Automated Daily D:\ CSV Sync

const assert = require('assert');
const fs = require('fs');
const path = require('path');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
    testsFailed++;
  }
}

// Mock browser window & canvas environment for Node
global.window = global.window || {};
global.document = {
  getElementById: (id) => ({
    getContext: () => ({
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      lineTo: () => {},
      moveTo: () => {},
      quadraticCurveTo: () => {},
      closePath: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      clearRect: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {}
    }),
    addEventListener: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 500 }),
    width: 800,
    height: 500,
    style: {}
  }),
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, addEventListener: () => {} })
};
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock Web Audio API
class MockAudioNode {
  constructor() {
    this.gain = { value: 1, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} };
    this.frequency = { value: 440, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} };
    this.Q = { value: 1 };
  }
  connect() { return this; }
  disconnect() {}
  start() {}
  stop() {}
}

global.window.AudioContext = class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = new MockAudioNode();
  }
  createGain() { return new MockAudioNode(); }
  createOscillator() { return new MockAudioNode(); }
  createBiquadFilter() { return new MockAudioNode(); }
  createBuffer() {
    return {
      getChannelData: () => new Float32Array(44100)
    };
  }
  createBufferSource() {
    const src = new MockAudioNode();
    src.buffer = null;
    src.loop = false;
    return src;
  }
  resume() { return Promise.resolve(); }
};

console.log('=====================================================');
console.log('RUNNING ZEN FEATURES TEST SUITE');
console.log('=====================================================');

// Load modules
require('./elemental-koi-pond.js');
const ZenAudioModule = require('./zen-audio.js');

// -------------------------------------------------------------
// Test 1: Food Pellet Queue & Boundary Constraints
// -------------------------------------------------------------
runTest('Z1: ElementalKoiPond queues food pellets and enforces max capacity limit (<= 5)', () => {
  const pond = new window.ElementalKoiPond('mock-canvas');
  assert(Array.isArray(pond.foodPellets), 'foodPellets array must be initialized');
  assert.strictEqual(pond.foodPellets.length, 0);

  // Drop 3 pellets
  pond.dropFood(200, 150, 'pellet');
  pond.dropFood(250, 180, 'petal');
  pond.dropFood(300, 210, 'pellet');
  assert.strictEqual(pond.foodPellets.length, 3);
  assert.strictEqual(pond.foodPellets[0].type, 'pellet');
  assert.strictEqual(pond.foodPellets[1].type, 'petal');

  // Drop 5 more (total 8) -> should clamp to max 5
  for (let i = 0; i < 5; i++) {
    pond.dropFood(400 + i * 10, 200, 'pellet');
  }
  assert.strictEqual(pond.foodPellets.length, 5, 'Must clamp active food pellets to maximum 5');
  pond.stop();
});

// -------------------------------------------------------------
// Test 2: Koi Food Sensory Detection & Hunting State
// -------------------------------------------------------------
runTest('Z2: Koi fish detects nearby food within 260px and transitions into seeking_food', () => {
  const pond = new window.ElementalKoiPond('mock-canvas');
  const fish = pond.koiTui;
  fish.x = 200;
  fish.y = 200;

  // Drop food within sensory range (dist = 100px)
  pond.dropFood(280, 260, 'pellet');
  assert.strictEqual(pond.foodPellets.length, 1);

  // Update fish
  const bounds = { left: 40, right: 600, top: 40, bottom: 400, width: 560, height: 360 };
  fish.update(bounds, 'roam', null, pond.koiLa, null, pond);

  assert.strictEqual(fish.behaviorState, 'seeking_food', 'Fish should enter seeking_food state');
  pond.stop();
});

// -------------------------------------------------------------
// Test 3: Koi Consumption, Bloop Sound Trigger & Pellet Removal
// -------------------------------------------------------------
runTest('Z3: Koi consumes food upon arrival (< 16px), removes pellet, and celebrates', () => {
  const pond = new window.ElementalKoiPond('mock-canvas');
  const fish = pond.koiTui;
  fish.x = 200;
  fish.y = 200;

  // Food directly in mouth radius
  pond.dropFood(206, 204, 'pellet');
  assert.strictEqual(pond.foodPellets.length, 1);

  let bloopCalled = false;
  window.zenAudio = {
    playBloop: () => { bloopCalled = true; }
  };

  const bounds = { left: 40, right: 600, top: 40, bottom: 400, width: 560, height: 360 };
  fish.update(bounds, 'roam', null, pond.koiLa, null, pond);

  assert.strictEqual(pond.foodPellets.length, 0, 'Food pellet should be consumed and removed');
  assert.strictEqual(fish.behaviorState, 'celebrating', 'Fish should transition to celebrating state');
  assert.strictEqual(bloopCalled, true, 'playBloop audio trigger must be called');
  pond.stop();
});

// -------------------------------------------------------------
// Test 4: Procedural Zen Audio Engine
// -------------------------------------------------------------
runTest('Z4: ZenAudioEngine initializes procedural synthesis nodes and controls', () => {
  assert(ZenAudioModule, 'ZenAudioEngine class must exist');
  const audio = new ZenAudioModule();

  assert.strictEqual(typeof audio.playBloop, 'function');
  assert.strictEqual(typeof audio.playShishiOdoshi, 'function');
  assert.strictEqual(typeof audio.playSingingBowl, 'function');
  assert.strictEqual(typeof audio.setVolume, 'function');
  assert.strictEqual(typeof audio.toggleMute, 'function');

  // Verify non-throwing audio triggering
  audio.setVolume(0.25);
  assert.strictEqual(audio.masterVolume, 0.25);

  audio.toggleMute();
  assert.strictEqual(audio.isMuted, true);
  audio.toggleMute();
  assert.strictEqual(audio.isMuted, false);

  // Calling playback methods should execute without errors
  audio.playBloop();
  audio.playShishiOdoshi();
  audio.playSingingBowl(432);
});

// -------------------------------------------------------------
// Test 5: Daily CSV Sync Format Generation
// -------------------------------------------------------------
runTest('Z5: Daily CSV sync formatter generates exact RFC 4180 matching table structure', () => {
  const server = require('./server.js');
  assert(typeof server.formatHistoryCsvRow === 'function', 'formatHistoryCsvRow helper must exist in server.js');

  const mockPayload = {
    date: '2026-10-12',
    totalStudyMinutes: 75.5,
    targetGoalMinutes: 270,
    goalMet: false,
    vocabTimerMin: 25.0,
    vocabAdjMin: 0.0,
    vocabTotalMin: 25.0,
    kanjiTimerMin: 20.5,
    kanjiAdjMin: 0.0,
    kanjiTotalMin: 20.5,
    grammarTimerMin: 15.0,
    grammarAdjMin: 0.0,
    grammarTotalMin: 15.0,
    listeningTimerMin: 15.0,
    listeningAdjMin: 0.0,
    listeningTotalMin: 15.0,
    readingTimerMin: 0.0,
    readingAdjMin: 0.0,
    readingTotalMin: 0.0,
    studyNotes: 'Finished N4 Lesson 34',
    dailyReflection: 'Solid focus on kanji radicals'
  };

  const csvContent = server.formatHistoryCsvRow(mockPayload);
  assert(csvContent.includes('Date,Total_Study_Minutes,Target_Goal_Minutes'), 'Must contain header');
  assert(csvContent.includes('2026-10-12,75.5,270,NO,25.0,0.0,25.0'), 'Must contain properly formatted data line');
  assert(csvContent.includes('"Finished N4 Lesson 34"'), 'Must escape and quote text notes');
});

console.log('=====================================================');
console.log(`ZEN FEATURES TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log('=====================================================');

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
