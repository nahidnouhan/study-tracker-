# Koi-to-Dragon Evolution Implementation Plan

> **For Antigravity:** REQUIRED SUB-SKILL: Load executing-plans to implement this plan task-by-task.

**Goal:** Implement the 3-stage procedural Koi-to-Dragon Evolution system where pond fish sprout extra fins, flowing whiskers, dorsal crests, golden antler horns, and celestial dragon pearls as study time progresses towards 60-minute targets.

**Architecture:** Extend the procedural mathematical canvas engine in `elemental-koi-pond.js` with dynamic spine vertebrae scaling (8 to 16 joints), multi-tiered fin ribs, inverse-kinematics chin barbels, branching golden antlers, and celestial pearl orbit, driven dynamically by study timer duration in `app.js`.

**Tech Stack:** Vanilla JavaScript (HTML5 Canvas 2D procedural spline math), CSS Glassmorphism, Node.js test harness.

---

### Task 1: Write Automated Evolution Engine Tests

**Files:**
- Create: `test-evolution-engine.js`

**Step 1: Write the failing test**
Create `test-evolution-engine.js` verifying:
1. `ElementalKoiFish` supports `setEvolutionStage(1 | 2 | 3)`.
2. Spine vertebrae count dynamically expands from 8 to 12 (Stage 2) and 16 (Stage 3).
3. Whisker barbels, dorsal crests, and antler horns are rendered without NaN or canvas context errors.
4. Spawning celestial dragon pearl in yin-yang harmony mode at Stage 3.

**Step 2: Run test to verify it fails**
Run: `node test-evolution-engine.js`
Expected: FAIL (methods and properties not yet implemented in `ElementalKoiFish`).

---

### Task 2: Implement Dynamic Spine Scaling & Stage Lerp in `elemental-koi-pond.js`

**Files:**
- Modify: `elemental-koi-pond.js`

**Step 1: Implement minimal code**
- Add `evolutionStage: 1`, `targetEvolutionStage: 1`, `evolutionProgress: 1.0` to `ElementalKoiFish`.
- Implement smooth interpolation (`lerp`) so stages morph continuously over 2.5 seconds.
- Scale vertebrae count dynamically from 8 up to 16 joints based on `evolutionProgress`.
- Add `setEvolutionStage(stage)` on `ElementalKoiPond` which delegates to both fish (`koiTui` and `koiLa`).

**Step 2: Run test to verify progress**
Run: `node test-evolution-engine.js`
Expected: Passes spine vertebrae test.

---

### Task 3: Implement Stage 2 Anatomy (Dorsal Crest, Flowing Ribbons & Chin Whiskers)

**Files:**
- Modify: `elemental-koi-pond.js`

**Step 1: Implement Stage 2 anatomy methods**
- `drawDorsalCrest(ctx)`: Undulating glowing dorsal spine ridge running along vertebrae joints 3 to 10 with height proportional to `evolutionProgress >= 1.5`.
- `drawWhiskers(ctx)`: Flowing chin barbels extending from the snout using trailing sine wave physics.
- `drawSecondaryFins(ctx)`: Trailing ventral silk ribbon fins extending behind the main pectorals.

**Step 2: Run test to verify Stage 2**
Run: `node test-evolution-engine.js`
Expected: Stage 2 anatomy tests pass.

---

### Task 4: Implement Stage 3 Anatomy (Golden Antler Horns, Wing Tiers & Dragon Pearl)

**Files:**
- Modify: `elemental-koi-pond.js`

**Step 1: Implement Stage 3 anatomy methods**
- `drawAntlerHorns(ctx)`: Branching golden crystalline antlers crowning the head at Stage 3 (`evolutionProgress >= 2.5`).
- Multi-tier feathered wing fins at pectoral, ventral, and dorsal positions.
- `drawCelestialPearl(ctx)`: Luminous floating dragon pearl orb in the center of the pond during Stage 3 yin-yang harmony orbit.
- Metamorphosis particle shockwave trigger on stage transition.

**Step 2: Run test to verify Stage 3**
Run: `node test-evolution-engine.js`
Expected: Stage 3 anatomy and pearl tests pass.

---

### Task 5: Connect Study Timer Duration to Evolution in `app.js` & Add Quick Preview

**Files:**
- Modify: `app.js`
- Modify: `index.html`

**Step 1: Implement timer stage calculation**
- In `updateActiveCardTimers()` and `renderAllSectionStates()`:
  - Calculate active section study time: `const elapsed = secState.timerSeconds + secState.manualAdjustmentSeconds;`
  - Determine stage: `< 1800s` (30m) = Stage 1; `>= 1800s && < 3600s` (30-60m) = Stage 2; `>= 3600s` (60m+) = Stage 3.
  - Call `window.elementalKoiPond.setEvolutionStage(stage)`.
- Add an interactive evolution stage preview selector in Studio Quick Settings (`#quick-settings-popover`) so the user can test/preview all 3 stages instantly.

**Step 2: Run UI integration and acceptance tests**
Run: `node test-ui-integration.js && node test-acceptance.js`
Expected: PASS all tests.

---

### Task 6: Final Verification, Git Commit & Game Hard Drive (`D:\`) Backup Sync

**Files:**
- Modify: `D:\JLPT-Study-Studio-Backup`
- Modify: `D:\JLPT-Study-Studio-Backup-2026-10-11.zip`

**Step 1: Verify all tests**
Run: `node test-evolution-engine.js && node test-ui-integration.js && node test-acceptance.js`
Expected: All suites PASS.

**Step 2: Commit to Git repository**
Run: `git add . && git commit -m "feat: complete Koi-to-Dragon 3-stage evolution system"`

**Step 3: Synchronize backup to Game harddrive (`D:\`)**
Copy updated files to `D:\JLPT-Study-Studio-Backup` and refresh `D:\JLPT-Study-Studio-Backup-2026-10-11.zip`.
