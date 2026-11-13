/**
 * Verification Test Suite for Living Pillar Cards Enhancements
 * 1. Animated gradient / light current
 * 2. Tiny bubbles, drifting particles, glowing plankton
 * 3. Animated bottom waterline wave
 * 4. Emblem pulsing with soft halo
 * 5. Hover rise and brighten with pointer ripple
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=====================================================');
console.log('RUNNING LIVING PILLAR CARDS VERIFICATION SUITE');
console.log('=====================================================');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// 1. Slow, animated gradient or light current
assert(appJs.includes('class="pillar-light-current"'), 'app.js must render .pillar-light-current in pillar cards');
assert(css.includes('.pillar-light-current'), 'style.css must define .pillar-light-current');
assert(css.includes('pillarLightCurrentFlow'), 'style.css must define @keyframes pillarLightCurrentFlow');
console.log('[PASS] Feature 1: Slow animated gradient & luminous light current configured');

// 2. Tiny bubbles, drifting particles, and glowing plankton
assert(appJs.includes('class="pillar-particles-container"'), 'app.js must render .pillar-particles-container');
assert(appJs.includes('class="pillar-bubble'), 'app.js must render .pillar-bubble elements');
assert(appJs.includes('class="pillar-mote'), 'app.js must render .pillar-mote elements');
assert(appJs.includes('class="pillar-plankton'), 'app.js must render .pillar-plankton elements');
assert(css.includes('.pillar-bubble'), 'style.css must style .pillar-bubble');
assert(css.includes('pillarBubbleFloat'), 'style.css must define @keyframes pillarBubbleFloat');
assert(css.includes('.pillar-mote'), 'style.css must style .pillar-mote');
assert(css.includes('pillarMoteDrift'), 'style.css must define @keyframes pillarMoteDrift');
assert(css.includes('.pillar-plankton'), 'style.css must style .pillar-plankton');
assert(css.includes('planktonBiolum'), 'style.css must define @keyframes planktonBiolum');
console.log('[PASS] Feature 2: Tiny bubbles, drifting motes, and glowing bioluminescent plankton active');

// 3. Animate bottom waterline with gentle wave
assert(appJs.includes('class="pillar-bottom-waterline"'), 'app.js must render .pillar-bottom-waterline');
assert(appJs.includes('class="pillar-waterline-svg"'), 'app.js must include .pillar-waterline-svg');
assert(css.includes('.pillar-bottom-waterline'), 'style.css must define .pillar-bottom-waterline');
assert(css.includes('waterlineWaveDriftBack'), 'style.css must define @keyframes waterlineWaveDriftBack');
assert(css.includes('waterlineWaveDriftFront'), 'style.css must define @keyframes waterlineWaveDriftFront');
assert(css.includes('bannerWavePulse1'), 'style.css must define @keyframes bannerWavePulse1');
console.log('[PASS] Feature 3: Bottom waterline with dual animated gentle waves active');

// 4. Emblem pulses slowly with a soft halo
assert(css.includes('emblemHaloPulse'), 'style.css must define @keyframes emblemHaloPulse');
assert(css.includes('emblemSoftHalo'), 'style.css must define @keyframes emblemSoftHalo');
assert(css.includes('.story-crest-wrapper::before'), 'style.css must style .story-crest-wrapper::before for soft halo');
console.log('[PASS] Feature 4: Emblem slow pulse with soft glowing halo active');

// 5. Hover rise, brighten, and pointer ripple
assert(css.includes('.pillar-card:hover'), 'style.css must define .pillar-card:hover');
assert(css.includes('transform: translateY(-6px)'), 'style.css must rise slightly on hover');
assert(css.includes('filter: brightness(1.14)'), 'style.css must brighten on hover');
assert(css.includes('.pillar-pointer-ripple'), 'style.css must style .pillar-pointer-ripple');
assert(css.includes('pillarRippleExpand'), 'style.css must define @keyframes pillarRippleExpand');
assert(appJs.includes('pillar-pointer-ripple'), 'app.js must spawn .pillar-pointer-ripple on hover/interaction');
console.log('[PASS] Feature 5: Hover rise, brighten, and fluid pointer ripple active');

console.log('\n=====================================================');
console.log('ALL 5 LIVING PILLAR FEATURES VERIFIED AND PASSING!');
console.log('=====================================================');
