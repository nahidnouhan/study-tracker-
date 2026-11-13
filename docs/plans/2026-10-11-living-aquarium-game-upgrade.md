# Living Aquarium Game Upgrade Implementation Plan

> **For Antigravity:** REQUIRED SUB-SKILL: Load executing-plans to implement this plan task-by-task.

**Goal:** Transform JLPT N4 Study Studio into a playful, living aquarium game with responsive aquatic creatures (size & shape morphing across 3 stages), interactive pond physics, creature inspection, deduplicated study XP and milestone badges, polished card interactions, and robust performance/accessibility controls without altering the dark aesthetic or core timer mechanics.

**Architecture:** Extend `ElementalKoiFish` and `ElementalKoiPond` in `elemental-koi-pond.js` with behavioral AI states, dynamic sizing ($1.0\times \to 1.4\times \to 1.85\times$), stage-specific head and body geometry morphing, creature click hit-testing, and bounded particle systems. Connect study timer transitions in `app.js` to creature energy states, deduplicated XP awards, milestone celebrations, and an interactive creature inspection modal in `index.html` styled via `style.css`.

**Tech Stack:** Vanilla JavaScript (ES6+ Canvas 2D, Web Audio API, Web Storage API), Semantic HTML5, Vanilla CSS3 with CSS custom properties and `@media (prefers-reduced-motion)`. Node.js test runners.

---

### Task 1: Living Aquatic Creature Behavioral AI & Swimming Mechanics

**Files:**
- Modify: `elemental-koi-pond.js:150-450`
- Test: `test-evolution-engine.js`

**Step 1: Write the failing test**
In `test-evolution-engine.js`, add test asserting creature behavioral states (`cruising`, `darting`, `circling`, `curious_cursor`), swimming energy modulation based on study state (`setStudyActive(boolean)`), and swimming boundaries without NaN or clipping.

**Step 2: Run test to verify it fails**
Run: `node test-evolution-engine.js`
Expected: FAIL ("setStudyActive is not a function" or missing behavior state).

**Step 3: Write minimal implementation in `elemental-koi-pond.js`**
- In `ElementalKoiFish`:
  - Add `this.behaviorState = 'cruising'` ('cruising' | 'darting' | 'circling' | 'curious_cursor').
  - Add `this.behaviorTimer = 0`, `this.behaviorCooldown = 0`.
  - Add `this.isStudyActive = false`.
  - Implement `setStudyActive(active)` to adjust speed multiplier (1.28x when active, 0.78x when paused/idle) and fin flap frequency.
  - Enhance steering logic: smooth wandering with organic S-curves, periodic darting bursts or playful circling arcs, and soft attraction to gentle cursor proximity with evasion on fast mouse bursts or nearby clicks.
- In `ElementalKoiPond`:
  - Implement `setStudyActive(active)` delegating to both `koiTui` and `koiLa`.

**Step 4: Run test to verify it passes**
Run: `node test-evolution-engine.js`
Expected: PASS.

**Step 5: Commit**
`git add elemental-koi-pond.js test-evolution-engine.js && git commit -m "feat: add creature behavioral AI and study energy states"`

---

### Task 2: Creature Sizing Progression & Anatomical Shape Metamorphosis

**Files:**
- Modify: `elemental-koi-pond.js:155-350, 550-800`
- Test: `test-evolution-engine.js`

**Step 1: Write the failing test**
In `test-evolution-engine.js`, add test asserting:
1. `fish.currentScale` scales with `evolutionProgress`: Stage 1 $\approx 1.0$, Stage 2 $\approx 1.40$, Stage 3 $\approx 1.85$.
2. Head radii and body profile morph dynamically across stages.
3. Leaping 3D arc scales multiplicatively without resetting base scale to 1.0.

**Step 2: Run test to verify it fails**
Run: `node test-evolution-engine.js`
Expected: FAIL (scale remains 1.0).

**Step 3: Write minimal implementation in `elemental-koi-pond.js`**
- Replace hardcoded `this.scale = 1.0` with dynamic calculation:
  ```js
  const baseScale = 1.0 + (this.evolutionProgress - 1.0) * 0.425;
  this.currentScale = this.isLeaping ? baseScale * (1.0 + Math.sin(t * Math.PI) * 0.48) : baseScale;
  this.scale = this.currentScale;
  ```
- Anatomical Shape Morphing:
  - Dynamic `segmentRadii` calculated via stage interpolation:
    - Stage 1 Koi: Plump teardrop taper ($[9.5, 12.5, 12, 10.5, 9, 7.5, 6, 4.5, 3.2, 2.0]$).
    - Stage 2 Drake: Elongated serpentine torso (13 segments), muscular midsection, tapered snout.
    - Stage 3 Dragon: Sinuous celestial body (16 segments), sculpted dragon head profile with jaw flare, golden antler horns (`drawAntlerHorns`), 3-tiered winged fins (`drawSecondaryFins`), and stardust whiskers (`drawWhiskers`).
- Dynamic pond boundary padding: `pad = 32 * this.scale` to prevent boundary clipping.

**Step 4: Run test to verify it passes**
Run: `node test-evolution-engine.js`
Expected: PASS.

**Step 5: Commit**
`git add elemental-koi-pond.js test-evolution-engine.js && git commit -m "feat: implement multi-stage creature sizing and anatomical shape morphing"`

---

### Task 3: Interactive Pond Physics, Concentric Ripples, Ambient Depth, & Visibility Handling

**Files:**
- Modify: `elemental-koi-pond.js:820-1180`
- Test: `test-evolution-engine.js`

**Step 1: Write the failing test**
In `test-evolution-engine.js`, add test verifying:
1. Multi-ring concentric ripple generation on pond click.
2. Ambient floating stardust particles with depth layers.
3. Clean memory bounds: ripples and particles pruned beyond limits.
4. `document.hidden` pause/resume lifecycle.

**Step 2: Run test to verify it fails**
Run: `node test-evolution-engine.js`
Expected: FAIL.

**Step 3: Implement pond enhancements in `elemental-koi-pond.js`**
- Concentric ripples: clicking or creature dashing creates 2-stage expanding harmonic wave rings.
- Passing creature interaction: fish body emits gentle micro-ripples and stardust particles every few frames.
- Layered ambient spores: background drifting embers + foreground sparkling stardust with gentle mouse-parallax offset.
- Visibility handling: attach `document.addEventListener('visibilitychange')` to halt `requestAnimationFrame` when tab is backgrounded and resume instantly on foregrounding.

**Step 4: Run test to verify it passes**
Run: `node test-evolution-engine.js`
Expected: PASS.

**Step 5: Commit**
`git add elemental-koi-pond.js test-evolution-engine.js && git commit -m "feat: add interactive pond ripples, ambient depth, and background pause handling"`

---

### Task 4: Creature Hit-Testing & Interactive Creature Inspection Modal

**Files:**
- Modify: `elemental-koi-pond.js:850-930`
- Modify: `index.html`
- Modify: `style.css`
- Modify: `app.js`
- Test: `test-ui-integration.js`

**Step 1: Write the failing test**
In `test-ui-integration.js`, assert:
1. `#creature-inspect-modal` exists in `index.html` with accessibility attributes (`role="dialog"`, `aria-modal="true"`).
2. `elementalKoiPond.hitTestCreature(x, y)` accurately identifies clicks on `koiTui` or `koiLa`.
3. Opening the modal displays stage, XP, and evolution milestones.

**Step 2: Run test to verify it fails**
Run: `node test-ui-integration.js`
Expected: FAIL.

**Step 3: Implement hit-testing and modal**
- In `elemental-koi-pond.js`:
  - Add `hitTestCreature(x, y)` checking proximity ($r < 32 \times \text{scale}$) along spine segments of `koiTui` and `koiLa`.
  - When creature clicked, dispatch `window.dispatchEvent(new CustomEvent('creature-clicked', { detail: { type, stage, progress } }))` and spawn celebratory sparkle ripple.
- In `index.html`:
  - Add `#creature-inspect-modal` with creature portrait avatar, species name, current stage badge, accumulated study XP, next evolution progress gauge, and unlocked mythological traits list.
- In `app.js`:
  - Listen for `'creature-clicked'` to populate and show `#creature-inspect-modal`.
- In `style.css`:
  - Style `#creature-inspect-modal` with glassmorphic aesthetic, glowing borders, close button, and backdrop blur.

**Step 4: Run test to verify it passes**
Run: `node test-ui-integration.js`
Expected: PASS.

**Step 5: Commit**
`git add elemental-koi-pond.js index.html style.css app.js test-ui-integration.js && git commit -m "feat: add creature click hit-testing and inspect modal"`

---

### Task 5: Study XP Engine, Milestone Badges, & Deduplicated Celebrations

**Files:**
- Modify: `app.js`
- Modify: `index.html`
- Modify: `style.css`
- Test: `test-acceptance.js`

**Step 1: Write the failing test**
In `test-acceptance.js`, add test asserting:
1. Study XP calculations: base XP ($1\text{s} = 1/6\text{ XP}$), target met bonus ($+250\text{ XP}$), daily target bonus ($+1000\text{ XP}$).
2. Strict XP deduplication: completing or toggling a section multiple times never awards duplicate completion XP.
3. Daily target celebration triggers once per day and records `dailyTargetCelebrated: true`.
4. Badges unlock strictly upon reaching genuine study thresholds.

**Step 2: Run test to verify it fails**
Run: `node test-acceptance.js`
Expected: FAIL.

**Step 3: Implement XP engine and celebrations in `app.js` & `index.html`**
- In `appState`:
  - Add `studyXp: 0`, `unlockedBadges: []`, `completedXpAwarded: {}` in `dailyRecord`.
  - Backwards-compatible load migration preserving existing user study records.
- Implement XP calculation and deduplicated awards:
  - `awardStudyXp(amount, reason)` with sound chime and subtle floating XP badge indicator.
  - Deduplicated target completion check in `reconcile()` and `toggleSectionUserCompleted()`.
  - Daily goal celebration with Yin-Yang dragon spiral orbit and congratulations banner.
- In `index.html`:
  - Header compact XP and Level badge (`#header-xp-badge`).
  - Milestone Badges drawer / popover (`#badges-modal`).
- In `style.css`:
  - Badge icons, level pill, and celebratory keyframe animations.

**Step 4: Run test to verify it passes**
Run: `node test-acceptance.js`
Expected: PASS.

**Step 5: Commit**
`git add app.js index.html style.css test-acceptance.js && git commit -m "feat: add study XP engine, milestone badges, and deduplicated celebrations"`

---

### Task 6: Interactive Study Card States, Visual Polish, & Micro-Interactions

**Files:**
- Modify: `style.css`
- Modify: `app.js`
- Test: `test-ui-integration.js`

**Step 1: Write the failing test**
In `test-ui-integration.js`, assert card state classes: `.is-active`, `.is-paused`, `.is-completed`, `.is-target-met` have valid styles and smooth transitions without card jitter.

**Step 2: Run test to verify it fails**
Run: `node test-ui-integration.js`
Expected: FAIL.

**Step 3: Implement CSS card polish and interactions**
- Subtle elevation lift and glowing elemental border aura on hover/focus.
- Active card distinct breathing animation (`--element-glow` pulse).
- Smooth button press ripple feedback (`:active` transform scale 0.96).
- Clear, distinct visual indicator for paused (warm amber glow) vs active (radiant neon) vs completed (harmonious jade/gold shimmer).

**Step 4: Run test to verify it passes**
Run: `node test-ui-integration.js`
Expected: PASS.

**Step 5: Commit**
`git add style.css app.js test-ui-integration.js && git commit -m "feat: enhance study card interactive states and micro-interactions"`

---

### Task 7: Accessibility, Reduced-Motion, Low-Effects Setting, & Test Suite

**Files:**
- Modify: `style.css`
- Modify: `index.html`
- Modify: `app.js`
- Modify: `elemental-koi-pond.js`
- Test: `test-acceptance.js`, `test-evolution-engine.js`, `test-ui-integration.js`

**Step 1: Write the failing test**
In `test-ui-integration.js`, assert:
1. In-app effects selector (`#select-aquarium-effects`) with options: `full`, `reduced`, `minimal`.
2. `@media (prefers-reduced-motion: reduce)` disables heavy transform animations and dials down particles.
3. Keyboard accessibility: all interactive elements focusable with visible focus rings.

**Step 2: Run test to verify it fails**
Run: `node test-ui-integration.js`
Expected: FAIL.

**Step 3: Implement effects modes and accessibility**
- In `index.html`: Add Aquarium Effects selector inside `#quick-settings-popover`.
- In `app.js` & `elemental-koi-pond.js`: Wire `aquariumEffectsMode` ('full' | 'reduced' | 'minimal') to throttle particles and disable leaping if requested.
- In `style.css`: Comprehensive `@media (prefers-reduced-motion: reduce)` rules and high-contrast visible focus rings.

**Step 4: Run all test suites to verify they pass**
Run:
- `node test-acceptance.js`
- `node test-evolution-engine.js`
- `node test-ui-integration.js`
Expected: ALL PASS.

**Step 5: Commit**
`git add style.css index.html app.js elemental-koi-pond.js test-ui-integration.js && git commit -m "feat: add aquarium effects quality toggle and accessibility support"`

---

### Task 8: Live Browser Verification, Artifact Recording, & Walkthrough

**Files:**
- Test: Live web browser validation using `browser_subagent`
- Deliverable: Screenshot / video walkthrough and summary artifact.

**Step 1: Start dev server or inspect via browser**
Verify at desktop resolution ($1200\times 800$).
**Step 2: Test core flows with `browser_subagent`**
- Idle swimming state.
- Timer start (wake up/active creature).
- Pond water click ripple.
- Creature click inspect modal.
- Evolution preview switching (St. 1 -> St. 2 -> St. 3 size & shape).
- Study target completion celebration.
**Step 3: Document results and finalize**
Update plans and summary notes.
