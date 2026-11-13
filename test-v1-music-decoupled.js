const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=====================================================');
console.log('VERIFYING MUSIC & STUDY SESSION DECOUPLING (V1)');
console.log('=====================================================');

const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Verify startSection does not invoke playYouTubeStudyMusicIfAuto
const startSectionMatch = appJs.match(/function startSection\([^)]*\)\s*\{([\s\S]*?)\n  \}/);
assert(startSectionMatch, 'startSection must exist');
assert(!startSectionMatch[1].includes('playYouTubeStudyMusicIfAuto()'), 'startSection must not invoke playYouTubeStudyMusicIfAuto');
console.log('[PASS] V1-D1: startSection does not trigger playYouTubeStudyMusicIfAuto.');

// Verify autoPlayOnStudy defaults to false in ytPlayerState
assert(appJs.includes('autoPlayOnStudy: false'), 'ytPlayerState.autoPlayOnStudy must default to false');
console.log('[PASS] V1-D2: ytPlayerState.autoPlayOnStudy defaults to false.');

// Verify index.html does not check autoplay by default
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
assert(!indexHtml.includes('id="chk-yt-autoplay-study" checked'), 'chk-yt-autoplay-study must not be checked by default');
console.log('[PASS] V1-D3: HTML checkbox is unchecked by default.');

console.log('=====================================================');
console.log('ALL V1 MUSIC DECOUPLING TESTS PASSED!');
console.log('=====================================================');
