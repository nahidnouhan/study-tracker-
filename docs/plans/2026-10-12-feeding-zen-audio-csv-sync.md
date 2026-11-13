# Interactive Feeding, Zen Soundscape & Daily CSV Sync Implementation Plan

> **For Antigravity:** REQUIRED SUB-SKILL: Load executing-plans to implement this plan task-by-task.

**Goal:** Implement interactive pond feeding with koi food-hunting AI, procedural Web Audio zen ambient soundscapes, and automatic daily study history CSV synchronization to `D:\`.

**Architecture:** Extend the canvas engine in `elemental-koi-pond.js` with food pellets and hunting/nibbling states; create a zero-dependency procedural synthesizer in `zen-audio.js` for tranquil stream, bamboo water-fountain, and singing bowl chimes; integrate background sync in `app.js` and `server.js` to persist daily CSV stats to `D:\`.

**Tech Stack:** Vanilla JavaScript (HTML5 Canvas 2D, Web Audio API), Node.js HTTP server, CSS3 Glassmorphism.

---

### Task 1: Write Automated Test Suite for New Features

**Files:**
- Create: `test-zen-features.js`

**Step 1: Write failing tests**
Cover:
1. `ElementalKoiPond.dropFood(x, y, type)` queues pellets and clamps to max 5 items.
2. `ElementalKoiFish` switches to `'seeking_food'` when food is within detection radius and consumes pellet upon arrival.
3. `ZenAudioEngine` initializes audio nodes and provides `playBloop()`, `playShishiOdoshi()`, and `playSingingBowl()`.
4. CSV sync generator produces valid RFC 4180 CSV matching `d:\jlpt-n4-study-history-2026-10-11.csv` format.

**Step 2: Run test to verify it fails**
Run: `node test-zen-features.js`
Expected: FAIL (modules not yet implemented).

---

### Task 2: Implement Procedural Zen Web Audio Soundscape

**Files:**
- Create: `zen-audio.js`
- Modify: `index.html`
- Modify: `style.css`

**Step 1: Implement `zen-audio.js`**
- Procedural pink-noise buffer generator for continuous gentle stream water flow.
- Biquad bandpass filter with slow sinusoidal modulation for babbling brook acoustics.
- Physical modeling synthesis for bamboo water-fountain (*shishi-odoshi*) clacks.
- Multi-harmonic meditation singing bowl chime for study milestones.
- Water droplet pitch sweep (`playBloop()`) for feeding clicks.
- Master volume controls, mute state, and persistent `localStorage` preferences.

**Step 2: Add audio controls to Quick Settings in `index.html` and `style.css`**
- Add Zen Sound toggle and volume slider inside `#quick-settings-popover`.

**Step 3: Run test to verify audio component**
Run: `node test-zen-features.js`
Expected: Passes audio engine unit tests.

---

### Task 3: Implement Interactive Pond Feeding & Nibbling

**Files:**
- Modify: `elemental-koi-pond.js`

**Step 1: Implement feeding mechanics in `ElementalKoiPond`**
- Canvas click/tap listener spawning floating golden pellets and glowing lotus petals.
- Food pellet rendering with gentle buoyant bobbing and concentric water ripples.
- Food decay lifespan (8 seconds) and maximum capacity limit (5 pellets).

**Step 2: Implement food-hunting AI in `ElementalKoiFish`**
- In `update()`, scan for nearest available food pellet within $260\text{px}$.
- If found, enter `'seeking_food'` behavior state:
  - Steer target heading smoothly toward pellet coordinates.
  - Temporarily accelerate swim frequency and emit celebratory bubble particles.
- Collision check at $14\text{px}$:
  - Consume pellet, trigger micro splash ripple, emit golden XP spores, and call `window.zenAudio?.playBloop()`.
  - Enter brief `'celebrating'` flourish state before returning to normal roam/orbit.

**Step 3: Run test to verify feeding engine**
Run: `node test-zen-features.js`
Expected: Passes feeding and hunting AI tests.

---

### Task 4: Implement Automatic D:\ CSV Sync

**Files:**
- Modify: `server.js`
- Modify: `app.js`
- Modify: `index.html`

**Step 1: Add `/api/sync-history-csv` endpoint in `server.js`**
- Accept JSON body with date, section minutes, target goal, adjustments, and reflections.
- Construct standard header and data row matching user's CSV format.
- Write safely to `D:\jlpt-n4-study-history-YYYY-MM-DD.csv` (fallback to local `./data/` if D: unavailable).

**Step 2: Add auto-sync triggers and status badge in `app.js`**
- Debounced auto-sync (3 seconds) triggered on timer pause, manual adjustment, or midnight rollover.
- Add live visual status badge in the studio header/footer: `☁️ Synced to D:\` (green) or `⚠️ Offline Cache` (amber).

**Step 3: Run test to verify sync**
Run: `node test-zen-features.js`
Expected: Passes CSV formatting and sync verification.

---

### Task 5: Final Verification Across All Test Suites

**Files:**
- Test: `test-zen-features.js`
- Test: `test-evolution-engine.js`
- Test: `test-ui-integration.js`
- Test: `test-acceptance.js`

**Step 1: Run complete test suite**
Run: `powershell -NoProfile -Command "node test-zen-features.js; node test-evolution-engine.js; node test-ui-integration.js; node test-acceptance.js"`
Expected: ALL SUITES PASS (100% success).

---

### Task 6: Git Commit & Game Hard Drive (`D:\`) Backup Sync

**Files:**
- Sync: `D:\JLPT-Study-Studio-Backup`
- Sync: `D:\JLPT-Study-Studio-Backup-2026-10-12.zip`

**Step 1: Commit to Git repository**
Run: `git add . && git commit -m "feat: implement interactive feeding, procedural zen audio, and daily D: drive CSV sync"`

**Step 2: Synchronize backup to Game harddrive (`D:\`)**
Copy updated files to `D:\JLPT-Study-Studio-Backup` and refresh archive `D:\JLPT-Study-Studio-Backup-2026-10-12.zip`.
