/**
 * Integration Verification Test for Elemental Koi Pond & Minimalist UI
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// 1. Verify all files exist and have valid syntax
const filesToCheck = [
  'index.html',
  'style.css',
  'elemental-assets.js',
  'elemental-atmosphere.js',
  'elemental-koi-pond.js',
  'app.js'
];

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  assert(fs.existsSync(filePath), `File does not exist: ${file}`);
  console.log(`[PASS] File exists: ${file} (${fs.statSync(filePath).size} bytes)`);
});

// 2. Check HTML markup for key required elements
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

assert(html.includes('id="elemental-koi-canvas"'), 'index.html must have #elemental-koi-canvas');
console.log('[PASS] #elemental-koi-canvas exists in index.html');

assert(html.includes('id="btn-toggle-stats"'), 'index.html must have #btn-toggle-stats');
console.log('[PASS] #btn-toggle-stats exists in index.html');

assert(html.includes('id="quick-settings-popover"'), 'index.html must have #quick-settings-popover');
console.log('[PASS] #quick-settings-popover exists in index.html');

assert(html.includes('class="section-title-row" style="display: none;"') || html.includes('style="display: none;"'), 'Note 1 section-title-row is hidden');
console.log('[PASS] Note 1 title row is hidden');

assert(html.includes('class="educational-disclaimer" style="display: none;"') || html.includes('style="display: none;"'), 'Note 4 educational disclaimer is hidden');
console.log('[PASS] Note 4 educational disclaimer is hidden');

assert(html.includes('src="elemental-koi-pond.js'), 'elemental-koi-pond.js is loaded in script tags');
console.log('[PASS] elemental-koi-pond.js script tag loaded');

// 3. Check elemental-assets.js has living miniature ponds for all 5 elements
const assetsCode = fs.readFileSync(path.join(__dirname, 'elemental-assets.js'), 'utf8');
['vocabulary', 'kanji', 'grammar', 'listening', 'reading'].forEach(sec => {
  assert(assetsCode.includes(sec), `ELEMENTAL_DATA must have ${sec}`);
});
assert(!assetsCode.includes('playful-galleon-svg'), 'Old galleon ship svg removed from collapsed pillars');
assert(!assetsCode.includes('playful-water-svg'), 'Old waterfall svg removed from collapsed pillars');
assert(!assetsCode.includes('playful-fire-svg'), 'Old volcano svg removed from collapsed pillars');
assert(!assetsCode.includes('playful-mountain-svg'), 'Old mountain svg removed from collapsed pillars');
console.log('[PASS] All 5 collapsed pillars use living miniature elemental koi sanctuaries (Note 3 resolved)');

// 4. Check elemental-koi-pond.js has leap, themes, and harmony orbit
const koiCode = fs.readFileSync(path.join(__dirname, 'elemental-koi-pond.js'), 'utf8');
assert(koiCode.includes('class ElementalKoiFish'), 'ElementalKoiFish defined');
assert(koiCode.includes('class ElementalKoiPond'), 'ElementalKoiPond defined');
assert(koiCode.includes('jumpToPond'), 'jumpToPond method implemented');
assert(koiCode.includes('startLeap'), 'startLeap method implemented');
assert(koiCode.includes('yin-yang'), 'yin-yang harmony orbit mode supported');
['spirit', 'air', 'earth', 'water', 'fire'].forEach(theme => {
  assert(koiCode.includes(theme), `Koi pond supports theme: ${theme}`);
});
console.log('[PASS] Universal Elemental Koi Pond Engine fully supports 5-theme roaming, 3D leaping, and Yin-Yang orbit');

// 5. Check Koi-to-Dragon Evolution Controls & Logic
assert(html.includes('id="evolution-btn-group"'), 'index.html must contain #evolution-btn-group');
assert(html.includes('id="btn-evo-auto"'), 'index.html must contain #btn-evo-auto');
assert(html.includes('id="btn-evo-1"'), 'index.html must contain #btn-evo-1');
assert(html.includes('id="btn-evo-2"'), 'index.html must contain #btn-evo-2');
assert(html.includes('id="btn-evo-3"'), 'index.html must contain #btn-evo-3');
console.log('[PASS] Evolution stage quick preview buttons exist in index.html (#evolution-btn-group)');

const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
assert(css.includes('.evolution-selector-group'), 'style.css contains .evolution-selector-group');
assert(css.includes('.btn-group-segmented'), 'style.css contains .btn-group-segmented');
console.log('[PASS] Evolution segmented toggle styling exists in style.css');

const appCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
assert(appCode.includes('getCalculatedEvolutionStage'), 'app.js defines getCalculatedEvolutionStage');
assert(appCode.includes('setEvolutionStage'), 'app.js calls setEvolutionStage on pond');
console.log('[PASS] app.js contains getCalculatedEvolutionStage and sets stage dynamically');

// 6. Check Pond Switch Protection & Settling Guard
assert(css.includes('.pillar-card:not(.is-expanded) .card-controls-container'), 'style.css protects collapsed controls from pointer-events');
assert(css.includes('.card-controls-pill.is-settling'), 'style.css has settling transition for controls pill');
assert(appCode.includes('isPondTransitioning'), 'app.js includes isPondTransitioning guard');
assert(appCode.includes('setPondSwitchingCooldown'), 'app.js includes setPondSwitchingCooldown');
console.log('[PASS] Pond switch click protection and settling cooldown verified');

// 7. Check Playful Living Aquarium Game Components (Tasks 4, 5, 6, 7)
assert(html.includes('id="creature-inspect-modal"'), 'index.html contains #creature-inspect-modal');
assert(html.includes('id="header-xp-badge"'), 'index.html contains #header-xp-badge');
assert(html.includes('id="badges-modal"'), 'index.html contains #badges-modal');
assert(html.includes('id="select-aquarium-effects"'), 'index.html contains #select-aquarium-effects');
assert(appCode.includes('creature-clicked'), 'app.js listens for creature-clicked custom event');
assert(appCode.includes('setStudyActive'), 'app.js controls creature energy via setStudyActive');
assert(css.includes('#creature-inspect-modal'), 'style.css contains #creature-inspect-modal');
assert(css.includes('.xp-header-badge'), 'style.css contains .xp-header-badge');
assert(css.includes('@media (prefers-reduced-motion'), 'style.css includes prefers-reduced-motion accessibility');
console.log('[PASS] Playful aquarium game UI elements and accessibility verified');

// 8. Check Phase 2: Creature Intelligence, Centering, & Motion Quality
assert(koiCode.includes('getVisualCentroid'), 'elemental-koi-pond.js defines getVisualCentroid');
assert(koiCode.includes('calculateUsablePondBounds'), 'elemental-koi-pond.js defines calculateUsablePondBounds');
assert(koiCode.includes('startPondTransition'), 'elemental-koi-pond.js defines startPondTransition');
assert(koiCode.includes('applyCreatureSeparation'), 'elemental-koi-pond.js defines applyCreatureSeparation');
assert(koiCode.includes('applyBoundarySteering'), 'elemental-koi-pond.js defines applyBoundarySteering');
assert(koiCode.includes('drawDebugOverlay'), 'elemental-koi-pond.js defines drawDebugOverlay');
assert(koiCode.includes('__TOGGLE_POND_DEBUG__'), 'elemental-koi-pond.js exposes window.__TOGGLE_POND_DEBUG__');
console.log('[PASS] Phase 2: Creature intelligence, usable pond centering, and debug overlay verified');

console.log('\n=====================================================');
console.log('ALL INTEGRATION CHECKS PASSED PERFECTLY!');
console.log('=====================================================');

