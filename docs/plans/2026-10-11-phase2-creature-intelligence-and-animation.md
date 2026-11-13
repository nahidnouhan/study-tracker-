# Phase 2: Animation, Creature Intelligence & Immersive Polish — Implementation Plan

> **Goal:** Eliminate all creature movement defects (off-centering, synchronized overlap, teleporting section switches, boundary escapes), implement an organic skeletal kinematics system with stage-specific personalities, a 5-state transition engine (`IDLE → PREPARE → TRAVEL → ARRIVE → SETTLE`), robust predictive boundary containment, visual debug overlays, and extended automated tests.

---

## 1. Root Cause Summary & Targeted Fixes

| Problem | Root Cause | Architectural Solution |
|:---|:---|:---|
| **Problem 1: Off-Center Resting Position** | Arbitrary `0.58` and `0.52` offset ratios; head position used instead of full-body visual centroid; sampling during CSS flex transition animation. | 1. Calculate usable card pond interior (`usableRect`) after card layout settles.<br>2. Calculate creature visual centroid $\vec{C} = \frac{1}{N}\sum \vec{S}_i$.<br>3. Compute resting anchor such that the silhouette's centroid settles precisely in the center of the usable pond area. |
| **Problem 2: Synchronized Swimming & Overlap** | Identical base speeds, identical angular speeds, identical cruising sine formula, zero body-to-body collision separation. | 1. Assign unique phase offsets, speeds, angular accelerations, and turning bias to Tui and La.<br>2. Implement soft separation forces along entire vertebral spines ($r_{sep} = 2.2 \times r_i$).<br>3. Independent wander waypoints with randomized cooldowns. |
| **Problem 3: Teleporting & Abrupt Section Switches** | Direct `startLeap` with high out-of-screen parabolic arc; instant coordinate overrides without travel state machine; jarring snaps on rapid clicks. | 1. Implement 5-state transition machine: `IDLE → PREPARE → TRAVEL → ARRIVE → SETTLE`.<br>2. Smooth cubic Bézier / Catmull-Rom path within visible water corridor.<br>3. Continuous velocity and spine alignment along path tangent.<br>4. Rapid-click redirection without pose or stage resetting. |
| **Problem 4: Pond Boundary Escapes** | Angular turning rate (0.048 rad/frame) too slow to turn before hitting bounds; mouse attraction overrides bounds; full silhouette length ($>180\text{px}$) ignored. | 1. Multi-tier predictive steering: look-ahead vector $\vec{P}_{ahead} = \vec{x} + \vec{v} \cdot \Delta t_{lookahead}$.<br>2. Soft predictive deceleration + tangential turning when approaching boundary.<br>3. Hard silhouette-aware containment guard accounting for full spine and antler/fin bounds.<br>4. Cursor attraction strictly clamped inside interior safe envelope. |

---

## 2. Implementation Tasks

### Task 1: Coordinate System, Usable Pond Layout & Silhouette Visual Centroid
- **Files:** `elemental-koi-pond.js`
- **Tests:** `test-evolution-engine.js`
- Implement `getVisualCentroid()` and `getSilhouetteBoundingRadius()` on `ElementalKoiFish`.
- Implement `calculateUsablePondBounds()` on `ElementalKoiPond`:
  - Accurately computes CSS canvas coordinates vs physical dimensions.
  - Accounts for `.pillar-expanded-view` header (`.expanded-card-top`) and bottom controls pill (`.card-controls-container`) to isolate the true unobstructed water arena.
  - Provides reliable center point $(C_x, C_y)$.

### Task 2: Independent Creature AI & Vertebral Spine Separation
- **Files:** `elemental-koi-pond.js`
- **Tests:** `test-evolution-engine.js`
- Give `koiTui` (Yin) and `koiLa` (Yang) distinct parameters:
  - Tui: Serene, graceful swimmer, slightly larger turning radius, phase offset $\phi = 0$.
  - La: Spirited, slightly faster speed ($1.08\times$), tighter turns, phase offset $\phi = \pi$.
- Implement multi-segment body-to-body soft repulsion force (`applyCreatureSeparation`).
- Individual waypoints and decoupled cruising wander noise.

### Task 3: 5-State Transition Engine (`IDLE → PREPARE → TRAVEL → ARRIVE → SETTLE`)
- **Files:** `elemental-koi-pond.js`, `app.js`
- **Tests:** `test-evolution-engine.js`, `test-ui-integration.js`
- Replace primitive `startLeap` with structured `transitionState`:
  - `IDLE`: Natural autonomous swimming in current pond.
  - `PREPARE`: Aligns smoothly toward departure trajectory (frames 0–15).
  - `TRAVEL`: Glides along a smooth cubic Bézier curve connecting source and destination ponds within the canvas water layer, maintaining velocity and head/spine curvature along tangent (frames 15–55).
  - `ARRIVE`: Glides into destination pond, decelerating smoothly with welcoming ripple (frames 55–75).
  - `SETTLE`: Resumes independent cruising centered in the new pond (frames 75+).
- Support dynamic re-targeting if user clicks another section mid-transition.

### Task 4: Predictive Look-Ahead Boundary Containment & Active Study Safety
- **Files:** `elemental-koi-pond.js`
- **Tests:** `test-evolution-engine.js`
- Predictive look-ahead raycast: calculate future position $30$ frames ahead.
- Apply soft normal deflection forces proportional to boundary proximity.
- Account for creature scale ($1.0\times \to 1.85\times$) and maximum silhouette radius.
- Active study mode: reinforce containment walls so creatures stay 100% visible inside the active arena.

### Task 5: Skeletal Motion Refinement & Stage Personalities
- **Files:** `elemental-koi-pond.js`
- Smooth inverse kinematics: head steers, torso follows with damped spring, tail wave propagates naturally with phase lag.
- Stage-specific movement tunings:
  - Koi: Gentle, compact turns ($r=80$), soft tail swish.
  - Drake: Sinuous gliding, agile direction changes.
  - Dragon: Regal serpentine undulation, undulating antler and wing highlights, trailing stardust.

### Task 6: Visual Debug Overlay & Telemetry
- **Files:** `elemental-koi-pond.js`, `style.css`
- Toggleable dev overlay (`Ctrl+Shift+D` or `window.__TOGGLE_POND_DEBUG__()`):
  - Draws pond interior bounds and usable arena box.
  - Draws creature visual centroid, anchor point, and velocity vector.
  - Draws travel Bézier path during section switches.
  - Displays telemetry badge (state, scale, speed, FPS).

### Task 7: Comprehensive Verification & Regression Testing
- **Files:** `test-evolution-engine.js`, `test-acceptance.js`, `test-ui-integration.js`
- Verify all 38 existing tests continue passing.
- Add new automated tests verifying:
  - Silhouette visual centroid calculation.
  - Creature body separation (minimum distance maintained).
  - Transition state machine progression and mid-flight re-targeting.
  - Predictive boundary containment under stress testing.
  - Zero NaN values and bounded particle pools.
