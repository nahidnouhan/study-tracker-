// scratch/test-corner-feeding.js
// Reproduction script for corner feeding deadlock
const assert = require('assert');
global.window = global.window || {};
global.document = {
  getElementById: (id) => ({
    getContext: () => ({
      save: () => {}, restore: () => {}, beginPath: () => {}, arc: () => {},
      fill: () => {}, stroke: () => {}, lineTo: () => {}, moveTo: () => {},
      quadraticCurveTo: () => {}, closePath: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      clearRect: () => {}, translate: () => {}, rotate: () => {}, scale: () => {}
    }),
    addEventListener: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 500 }),
    width: 800, height: 500, style: {}
  }),
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, addEventListener: () => {} })
};
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

require('./elemental-koi-pond.js');

const pond = new window.ElementalKoiPond('mock-canvas');
const fish = pond.koiTui;
// Set fish to Stage 3 / 4 (large size)
fish.setEvolutionStage(3);
// Fast forward evolution progress to 3.0
fish.evolutionProgress = 3.0;

// Set bounds similar to study card
const bounds = { left: 50, right: 750, top: 60, bottom: 440, width: 700, height: 380 };

// Drop food outside or far in the corner margin
pond.dropFood(20, 460, 'petal');

// Position fish near bottom left approaching the corner
fish.x = 90;
fish.y = 400;
fish.angle = Math.atan2(435 - fish.y, 45 - fish.x); // pointing into bottom-left corner

console.log('Initial setup:');
console.log('Food pellet at:', pond.foodPellets[0]);
console.log('Fish at:', fish.x, fish.y, 'angle:', fish.angle, 'scale:', fish.scale);

let stuckFrames = 0;
let lastX = fish.x;
let lastY = fish.y;

for (let frame = 0; frame < 500; frame++) {
  fish.update(bounds, 'roam', null, pond.koiLa, null, pond);
  const movement = Math.hypot(fish.x - lastX, fish.y - lastY);
  if (movement < 0.2) {
    stuckFrames++;
  }
  lastX = fish.x;
  lastY = fish.y;
}

console.log('After 100 frames:');
console.log('Food pellets remaining:', pond.foodPellets.length);
console.log('Fish state:', fish.behaviorState, 'position:', fish.x, fish.y, 'angle:', fish.angle);
console.log('Stuck frames (movement < 0.2px):', stuckFrames);

if (pond.foodPellets.length > 0 && stuckFrames > 40) {
  console.log('RESULT: REPRODUCED BUG! Fish is stuck and could not reach or eat food.');
} else {
  console.log('RESULT: Fish consumed food or did not get stuck.');
}
pond.stop();
