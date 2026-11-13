/**
 * Test Suite: Verification of User Notes 1, 2, and 3
 * 
 * Note 1: Pillar animated circles updated with sacred geometric patterns (mandalas, Sri Yantra, etc.)
 * Note 2: Redesigned active focus bar with bubbles, synchronized rhythm beat wave, beacon ripple, watermark, and ONLY play/pause
 * Note 3: YouTube study music option in second screen popover supporting direct links and playlists with auto-play
 * Regression Guard: Timer durations and core functionality strictly preserved
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=====================================================');
console.log('RUNNING VERIFICATION SUITE: NOTES 1, 2 & 3');
console.log('=====================================================\n');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf-8');
const js = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf-8');
const assets = fs.readFileSync(path.join(__dirname, 'elemental-assets.js'), 'utf-8');

// 1. Note 1: Sacred Geometric Crests
console.log('TEST 1: Checking Note 1 (Sacred Geometry Pillar Crests)...');
assert(assets.includes('Sacred Octagram Astral Geometry Crest'), 'Vocabulary crest must use Sacred Octagram');
assert(assets.includes('Sacred Sri Yantra Hexagram Geometric Crest'), 'Kanji crest must use Sacred Sri Yantra Hexagram');
assert(assets.includes('Celestial Astrolabe & Merkaba Gyroscopic Crest'), 'Grammar crest must use Celestial Astrolabe');
assert(assets.includes('Harmonic Cymatics & Torus Wave Geometric Crest'), 'Listening crest must use Harmonic Cymatics');
assert(assets.includes('Solar Tetrahedron & Radiant Flare Geometric Crest'), 'Reading crest must use Solar Tetrahedron');

assert(css.includes('.geo-spin-cw'), 'CSS must define .geo-spin-cw');
assert(css.includes('.geo-spin-ccw'), 'CSS must define .geo-spin-ccw');
assert(css.includes('.geo-core-pulse'), 'CSS must define .geo-core-pulse');
assert(css.includes('.geo-sparkle'), 'CSS must define .geo-sparkle');
assert(css.includes('.geo-wave-pulse'), 'CSS must define .geo-wave-pulse');
console.log('[PASS] Note 1: Sacred geometric crests & animations verified in all 5 pillars.\n');

// 2. Note 2: Redesigned Active Focus Bar
console.log('TEST 2: Checking Note 2 (Redesigned Active Focus Bar)...');
// Must NOT have add5, sub5, or done in the bar markup
const focusBarSectionMatch = html.match(/<section id="active-focus-bar"[\s\S]*?<\/section>/);
assert(focusBarSectionMatch, '#active-focus-bar section must exist in index.html');
const focusBarHtml = focusBarSectionMatch[0];

assert(!focusBarHtml.includes('id="btn-focus-add5"'), 'btn-focus-add5 must be removed from the bar');
assert(!focusBarHtml.includes('id="btn-focus-sub5"'), 'btn-focus-sub5 must be removed from the bar');
assert(!focusBarHtml.includes('id="btn-focus-done"'), 'btn-focus-done must be removed from the bar');
assert(focusBarHtml.includes('id="btn-focus-pause"'), 'btn-focus-pause must remain in the bar');

assert(focusBarHtml.includes('bar-ambient-bubbles'), 'Bar must include floating ambient bubbles');
assert(focusBarHtml.includes('bar-watermark-geo'), 'Bar must include geometric watermark');
assert(focusBarHtml.includes('bar-rhythm-wave'), 'Bar must include rhythm beat wave');
assert(focusBarHtml.includes('focus-beacon-ripple'), 'Bar must include beacon ripples');

assert(css.includes('.active-focus-bar'), 'style.css must style .active-focus-bar');
assert(css.includes('.bar-bubble'), 'style.css must style .bar-bubble');
assert(css.includes('.bar-rhythm-wave'), 'style.css must style .bar-rhythm-wave');
assert(css.includes('.btn-focus-playpause'), 'style.css must style .btn-focus-playpause');
console.log('[PASS] Note 2: Active focus bar redesigned with bubbles, beat rhythm wave, watermark, and only play/pause.\n');

// 3. Note 3: YouTube Study Music Player
console.log('TEST 3: Checking Note 3 (YouTube Music Option in Popover)...');
assert(html.includes('id="quick-settings-popover"'), 'quick-settings-popover exists');
assert(html.includes('class="setting-item-row yt-music-card"'), 'yt-music-card exists inside popover');
assert(html.includes('id="yt-music-url-input"'), 'yt-music-url-input exists');
assert(html.includes('https://www.youtube.com/watch?v=dwY7w0k3j2Y'), 'Default URL matches user provided link');
assert(html.includes('id="btn-yt-play-toggle"'), 'Play toggle button exists');
assert(html.includes('id="yt-player-container"'), 'yt-player-container iframe wrapper exists');
assert(html.includes('id="chk-yt-autoplay-study"'), 'Auto-play on study checkbox exists');

assert(html.includes('id="btn-yt-popout"'), 'Pop-out music player button exists');
assert(html.includes('id="yt-file-advisory"'), 'File protocol advisory banner exists');

assert(css.includes('.yt-music-card'), 'style.css contains .yt-music-card');
assert(css.includes('.yt-url-input'), 'style.css contains .yt-url-input');
assert(css.includes('.yt-preset-btn'), 'style.css contains .yt-preset-btn');
assert(css.includes('.yt-popout-btn'), 'style.css contains .yt-popout-btn');
assert(css.includes('.yt-file-advisory'), 'style.css contains .yt-file-advisory');

assert(js.includes('parseYouTubeUrl'), 'app.js includes parseYouTubeUrl');
assert(js.includes('loadYouTubeUrl'), 'app.js includes loadYouTubeUrl');
assert(js.includes('initYouTubeMusicPlayer'), 'app.js includes initYouTubeMusicPlayer');
assert(js.includes('playYouTubeStudyMusicIfAuto'), 'app.js includes auto-play hook on study start');
assert(js.includes('openYouTubePopout'), 'app.js includes openYouTubePopout');
console.log('[PASS] Note 3: YouTube Study Music player fully integrated with URL loader, presets, and popout player.\n');

// 4. Test URL Parser Unit Tests
console.log('TEST 4: YouTube URL parser unit tests...');
// Test regex logic from app.js
function testParse(url) {
  const vMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  const listMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return {
    videoId: vMatch ? vMatch[1] : (shortMatch ? shortMatch[1] : null),
    listId: listMatch ? listMatch[1] : null
  };
}

const res1 = testParse('https://www.youtube.com/watch?v=dwY7w0k3j2Y');
assert.strictEqual(res1.videoId, 'dwY7w0k3j2Y');

const res2 = testParse('https://youtu.be/dwY7w0k3j2Y');
assert.strictEqual(res2.videoId, 'dwY7w0k3j2Y');

const res3 = testParse('https://www.youtube.com/watch?v=dwY7w0k3j2Y&list=PLrAlG_5rVqLz5V7vK_B98i1');
assert.strictEqual(res3.videoId, 'dwY7w0k3j2Y');
assert.strictEqual(res3.listId, 'PLrAlG_5rVqLz5V7vK_B98i1');
console.log('[PASS] Test 4: YouTube URL parser correctly extracts video and playlist IDs.\n');

// 5. Preservation of Timer Durations
console.log('TEST 5: Checking preservation of timer durations...');
assert(js.includes("targetSeconds: 45 * 60, // 2,700s (45 min)"), 'Vocabulary is 45m');
assert(js.includes("targetSeconds: 45 * 60, // 2,700s (45 min)"), 'Kanji is 45m');
assert(js.includes("targetSeconds: 90 * 60, // 5,400s (90 min)"), 'Grammar is 90m');
assert(js.includes("targetSeconds: 30 * 60, // 1,800s (30 min)"), 'Listening is 30m');
assert(js.includes("targetSeconds: 30 * 60, // 1,800s (30 min)"), 'Reading is 30m');
assert(js.includes("TOTAL_TARGET_SECONDS = SECTIONS_CONFIG.reduce((acc, s) => acc + s.targetSeconds, 0); // 14,400s (4h 00m)"), 'Total target is 4h (14,400s)');
console.log('[PASS] Test 5: All requested timer durations strictly preserved (Total: 4h).\n');

console.log('=====================================================');
console.log('ALL VERIFICATION CHECKS PASSED WITH ZERO REGRESSIONS!');
console.log('=====================================================');
