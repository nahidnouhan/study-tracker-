# Elemental Living Worlds & Minimalist Deck Implementation Plan

> **For Antigravity:** REQUIRED SUB-SKILL: Load executing-plans to implement this plan task-by-task.

**Goal:** Transform the JLPT N4 Study Studio into a cinematic, clutter-free elemental experience with the Majestic Sky Galleon for Air and clean glassmorphic floating controls.

**Architecture:** 
- Strip out secondary paragraph guidance, audit rows, and cluttered button rows from the expanded cards.
- Implement a floating glassmorphic control pill (`▶ Start` + compact `⋯` popover for time adjustments/completion).
- Deploy a high-fidelity HTML5 Canvas engine for Air (Majestic Sky Galleon sailing on twilight cloud seas with billowing sails, wind ribbon aerodynamics, and a golden auroral victory climax).
- Prepare modular hooks for Water, Fire, and Earth elemental living canvases.

**Tech Stack:** HTML5 Canvas, Vanilla JavaScript (ES6+), Vanilla CSS (glassmorphism & spring animations), Node.js server.

---

### Task 1: Redesign Expanded Card Controls & Remove UI Clutter
**Files:**
- Modify: `app.js`
- Modify: `style.css`

**Actions:**
1. In `app.js` (`renderSectionCards` template):
   - Remove `.guidance-snippet`, `.time-audit-text`, and `.badges-row` from expanded view.
   - Structure `.card-controls` into a unified glassmorphic pill:
     - Primary button: `#btn-toggle-${sec.id}` (`▶ Start` / `⏸ Pause`).
     - Tool toggle: `.btn-tools-toggle` with icon `⋯` or `±`.
     - Collapsible tools popover: `.card-tools-popover` containing `+5m`, `-5m`, `±Adj`, `✓ Done`, `↺`.
2. In `app.js` (`attachSectionCardListeners`):
   - Wire toggle logic for `.card-tools-popover` so clicking outside or clicking the toggle smoothly toggles it.
   - Maintain all button `data-action` and `data-section` attributes to ensure 100% test compatibility.
3. In `style.css`:
   - Style `.card-controls` as a floating center-bottom glassmorphic bar.
   - Style `.card-tools-popover` with blurred backdrop and spring pop animation.

---

### Task 2: Build the Majestic Sky Galleon Canvas Engine for Air
**Files:**
- Modify/Replace: `air-windmill-meadow.js`
- Modify: `elemental-assets.js`

**Actions:**
1. In `air-windmill-meadow.js`:
   - Render a high-detail sailing sky ship (wooden hull, carved prow, glowing deck lanterns, 3 masts with billowing wind sails).
   - Render rolling volumetric cloud banks across the bottom and midground with nautical wake drift.
   - Render flowing wind streamlines flowing over the sails and circulating across the card.
   - Gentle nautical buoyant pitch and roll physics.
   - Completion Climax: Auroral sunset cloudburst with glowing ship lanterns and golden victory wind vortex.
2. In `elemental-assets.js`:
   - Update `grammar` crest, collapsed figure, and titles to `Celestial Sky Galleon • Majestic Cloud Voyager`.

---

### Task 3: Verification & Browser Check
**Files:**
- Verify: `test-acceptance.js`
- Check in browser at `http://localhost:3456/`
