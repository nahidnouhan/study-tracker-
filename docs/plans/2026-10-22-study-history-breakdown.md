# Study History Breakdown & All-Time Study Stats Implementation Plan

> **For Antigravity:** REQUIRED SUB-SKILL: Load executing-plans to implement this plan task-by-task.

**Goal:** Implement an All-Time Lifetime Study Statistics Banner and an interactive Day & Time Breakdown Inspector inside the Study History & Data Management modal, allowing users to inspect exact study times, subject distributions, session timelines, and notes by clicking any date or chart bar.

**Architecture:** Extend the existing `dailyRecord` schema with an optional `sessions` array of timestamped study intervals (`{ id, sectionId, startTime, endTime, durationSeconds, type }`), calculate comprehensive lifetime statistics across all history, and provide a two-pane modal navigation (Overview vs Day Detail Inspector) styled with glowing dark glassmorphism.

**Tech Stack:** Vanilla JavaScript (ES2022), Semantic HTML5, Vanilla CSS3 with CSS Custom Properties, Node.js Test Runner.

---

### Task 1: Create Test Suite for Session Logging & Breakdown Data Logic

**Files:**
- Create: `test-history-breakdown.js`

**Step 1: Write test suite verifying session tracking, lifetime aggregation, and day breakdown metrics**
Write tests covering:
1. `recordSessionInterval` pushes valid session logs to `dailyRecord.sessions`.
2. Cross-midnight interval splitting creates properly timestamped session logs in both days.
3. Lifetime statistics calculator accurately computes total all-time seconds, active days count, daily average seconds, and streak count.
4. Day breakdown data extraction correctly aggregates subject seconds, percentage distributions, and sorts session timelines chronologically.

**Step 2: Run test suite to verify failures before implementation**
Run: `node test-history-breakdown.js`
Expected: FAIL or module missing functions.

---

### Task 2: Implement Granular Session Logging in app.js

**Files:**
- Modify: `app.js`

**Step 1: Update createFreshDailyRecord and loadState**
Initialize `sessions: []` for daily records, guaranteeing backward compatibility with existing stored records.

**Step 2: Update commitActiveSectionTime & manual adjustments**
When committing active timer elapsed seconds, push `{ id, sectionId, startTime, endTime, durationSeconds, type: 'timer' }` to `dailyRecord.sessions`. Handle cross-midnight interval slices.
When manual adjustments are applied, also record a session entry of type `'manual'`.

**Step 3: Run test suite to verify tests pass**
Run: `node test-history-breakdown.js`
Expected: PASS for session logging tests.

---

### Task 3: Build Modal HTML Structure for All-Time Banner & Day Detail View

**Files:**
- Modify: `index.html`

**Step 1: Add All-Time Lifetime Stats Banner to modal-history**
Insert `#history-all-time-banner` directly above `#history-chart-section`:
- Lifetime Total Study Time (`#stat-lifetime-study-time`)
- Days Active & Streak (`#stat-lifetime-days-streak`)
- Daily Average (`#stat-lifetime-daily-avg`)
- Goal Met Ratio (`#stat-lifetime-goals-met`)

**Step 2: Wrap Overview and Add Day Detail Container**
- Wrap the 7-day chart, historical table, and backup actions into `#history-overview-view`.
- Add `#history-day-detail-view` (hidden by default) with:
  - Header with Back button (`#btn-back-to-history`), date heading, today badge, and goal status.
  - Multi-colored subject distribution stacked bar (`#day-detail-distribution-bar`).
  - 5-subject breakdown cards grid (`#day-detail-subjects-grid`).
  - Chronological session intervals timeline (`#day-detail-timeline-container`).
  - Reflection and study notes container (`#day-detail-notes-card`).
  - Checklist tasks completed container (`#day-detail-checklist-card`).

---

### Task 4: Add Visual Styling in style.css

**Files:**
- Modify: `style.css`

**Step 1: Style the All-Time Stats Banner**
Add styles for `#history-all-time-banner`:
- 4-column responsive grid (collapsing gracefully on smaller screens).
- Glassmorphic card styling matching existing modal design.
- Glowing monospace metrics, subtle neon border accents.

**Step 2: Style Table Row & Chart Bar Interactivity**
- Hover styles on table rows (`cursor: pointer`, background transition, arrow badge `→`).
- Hover styles on 7-day chart bars (`cursor: pointer`, glow effect).

**Step 3: Style Day Detail Inspector**
- Back button with hover arrow movement.
- Segmented distribution progress bar with custom color stops.
- Category cards with kanji badges, progress bars, and overtime status.
- Timeline items with subject color dots, timestamp chips, and duration badges.
- Notes and reflection quotes.

---

### Task 5: Implement Rendering and View Switching in app.js

**Files:**
- Modify: `app.js`

**Step 1: Implement Lifetime Stats Calculation & Rendering**
In `renderHistoryModal`:
Calculate:
- Total study seconds across history + today.
- Active study days count (days with > 0 study seconds).
- Current consecutive days streak.
- Daily average seconds per active day.
- Number of days meeting the 14,400s (4h) target.
Populate `#history-all-time-banner`.

**Step 2: Attach Click Handlers to Table Rows and Chart Bars**
Update table row markup to include `data-date="${dateKey}"` and attach click handlers.
Update chart bars to include `data-date="${dateKey}"` and attach click handlers.
When clicked, invoke `openDayBreakdown(dateKey)`.

**Step 3: Implement openDayBreakdown(dateKey) and renderDayBreakdown(dateKey)**
- Hide `#history-overview-view`, show `#history-day-detail-view`.
- Format day title and goal progress badge.
- Render subject distribution bar and 5 subject breakdown cards.
- Render session intervals timeline: if no granular intervals recorded (historical days), show clean summary notice with subject breakdown.
- Render study notes, reflections, and checklist tasks.
- Attach `#btn-back-to-history` handler to switch back to overview.

---

### Task 6: End-to-End Verification and Acceptance Testing

**Files:**
- Run: `node test-history-breakdown.js`
- Run: `node test-acceptance.js`
- Run: `node test-ui-integration.js`

**Step 1: Execute all test suites**
Verify all automated tests pass without errors or regressions.

**Step 2: Interactive Browser Verification**
Open the application in the browser:
- Open Study History & Data Management modal.
- Verify All-Time Lifetime Overview Banner shows accurate cumulative study time and stats.
- Click a date row in the table: verify Day Detail Inspector opens smoothly.
- Inspect subject breakdown, percentage distribution bar, timeline, notes, and checklist.
- Click "← Back to History Records": verify modal switches back to overview table.
- Click a bar in the 7-day consistency chart: verify it also opens that day's breakdown.
