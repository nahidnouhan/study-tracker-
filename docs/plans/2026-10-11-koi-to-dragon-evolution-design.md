# Koi-to-Dragon Evolution Design Document

**Date:** 2026-10-11  
**Project:** JLPT N4 Study Studio  
**Status:** Approved by User  

---

## 1. Overview & Vision
The user requested an evolution system for the living pond creatures so that as their study time progresses towards their 60-minute session goals, the creatures do not simply change color, but physically mutate and evolve into legendary mythological beasts.

Based on the ancient Asian myth of the Koi swimming up the Yellow River waterfall and leaping the Dragon Gate (*Longmen*) to transform into a celestial dragon, the creature evolves across three distinct anatomical stages.

---

## 2. Evolution Stages & Anatomical Progression

```
[ Stage 1: Novice Koi ] ────(30 min)───► [ Stage 2: Ascending River Drake ] ────(60 min)───► [ Stage 3: Celestial Ascended Dragon ]
  • 8 Spine Segments                        • 12 Spine Segments                           • 16 Serpentine Spine Segments
  • 1 Pair Pectoral Fins                    • Trailing Ventral Ribbons                    • Golden Antler Horns
  • Sleek Translucent Tail                  • Undulating Dorsal Crest                     • 4 Whisker Streamers with Stardust
                                            • Flowing Chin Whiskers                       • 3 Tiers of Feathered Wings
                                                                                          • Celestial Harmony Pearl Orb
```

### Stage 1: Novice Koi (0 – 30 Minutes)
- **Anatomy**:
  - 8 spine vertebrae joints following Verlet spine physics.
  - Single pair of sleek, translucent pectoral fins.
  - Compact, graceful caudal fin tail.
  - Subtle bioluminescent spine illumination.
- **Behavior**: Nimble, agile darting and curving with minimal water disturbance.

### Stage 2: Ascending River Drake (30 – 60 Minutes)
- **Anatomy**:
  - 12 spine vertebrae joints (body lengthens and ripples with deeper sine waves).
  - Secondary pair of trailing ventral ribbons behind pectorals.
  - Undulating bioluminescent dorsal crest ridge running along the back.
  - Dual chin barbels (flowing whiskers) that sway with water currents.
- **Behavior**: Majestic sinuous gliding; trailing particle bubbles; wider turning arcs.

### Stage 3: Celestial Ascended Dragon (*Ryu*) (60+ Minutes / Target Met)
- **Anatomy**:
  - Full 16-segment serpentine dragon body.
  - Golden crystalline antler horns crowning the head.
  - Extended whisker streamers rippling with stardust particles.
  - Three tiers of feathered wing fins (pectoral, ventral, and imperial dorsal plumes).
  - Spawns a floating **Celestial Dragon Pearl Orb** in the center of the pond.
- **Behavior**: Imperial gliding; when a section is marked Done or target met, both dragons coil into a golden yin-yang spiral orbit around the pearl.

---

## 3. Real-Time Evolution Trigger & Morphing
When the timer crosses 30 minutes or 60 minutes:
1. **Shockwave Ripple**: A radiant circular water caustics ripple bursts from the creature's center.
2. **Smooth Anatomical Morphing**:
   - Spine length, fin lengths, horn scale, and whisker counts smoothly interpolate over 2.5 seconds using ease-out cubic transitions.
   - Bioluminescent particle sparks shed during the metamorphosis.
   - Zero hard sprite swapping or jarring visual pops.

---

## 4. Architecture & Technical Integration

### A. Procedural Engine (`elemental-koi-pond.js`)
- `ElementalKoiFish` class extended with:
  - `evolutionStage`: `1 | 2 | 3` (interpolated float `1.0 -> 2.0 -> 3.0` for smooth transition).
  - `drawDorsalCrest(ctx)`: Renders glowing dorsal spine ridge with height based on `evolutionStage`.
  - `drawWhiskers(ctx)`: Mathematical inverse-kinematics strand simulation for chin barbels.
  - `drawAntlerHorns(ctx)`: Branching vector antlers that grow on the head at Stage 3.
  - `drawSecondaryFins(ctx)`: Ventral streamer ribbons unfurling at Stage 2 and feathered wings at Stage 3.
  - `drawCelestialPearl(ctx)`: Radiant pearl orb drawn in the center of Stage 3 yin-yang orbit.

### B. State Integration (`app.js`)
- In `updateActiveCardTimers()` and `renderAllSectionStates()`:
  - Compute active section elapsed time (`timerSeconds + manualAdjustmentSeconds`).
  - Calculate stage:
    - `< 1800s` (30 min) -> Stage 1
    - `>= 1800s && < 3600s` (30-60 min) -> Stage 2
    - `>= 3600s` (60 min+) -> Stage 3
  - Notify `window.elementalKoiPond.setEvolutionStage(stage)`.

---

## 5. Verification & Testing
- Unit and integration tests verify:
  1. `ElementalKoiFish` correctly computes spine points and draws all anatomical tiers without NaN or canvas errors.
  2. Stage thresholds at 0s, 1800s (30m), and 3600s (60m) accurately map to stages 1, 2, and 3.
  3. No performance degradation (maintains 60 FPS requestAnimationFrame loop).
