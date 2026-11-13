# Study History Breakdown & All-Time Study Stats Design

## Overview
This design implements two major user-facing enhancements to the JLPT N4 Study Studio:
1. **All-Time Lifetime Study Statistics Banner**: Displayed at the top of the Study History & Data Management modal, showcasing cumulative app study time, total active study days, daily study average, and daily targets achieved.
2. **Interactive Day & Time Breakdown Inspector**: Allows users to click on any date record in the historical table or any day bar in the 7-day consistency chart to open a dedicated, drilldown view revealing exact subject times, percentage distributions, live session interval timelines (when sessions started and ended), daily reflection, and checklist completion.

---

## 1. UI & Visual Architecture

### A. All-Time Lifetime Overview Banner
Located at the top of the `modal-history` body (above the 7-day consistency chart):
- **Grid Layout**: 4 cohesive stats cards styled with glowing dark glassmorphism:
  - **Lifetime Study Time**: Formatted in large monospace text (e.g. `24h 15m 32s`), tracking total elapsed seconds across all days ever recorded.
  - **Days Active & Streak**: Showing total logged days (e.g. `8 Days Active`) along with current consecutive study streak.
  - **Daily Average Time**: Average time per active day (e.g. `2h 45m / day`).
  - **Daily Goal Success Rate**: Percentage and count of days meeting the 4-hour daily goal (e.g. `5 / 8 Days (63%)`).

### B. Interactive History Table & Chart Rows
- In `Historical Study Records` table:
  - Table rows have `cursor: pointer`, smooth hover elevation, and an interactive chevron affordance (`→`).
  - Tooltip hint: "Click to inspect day breakdown & timeline".
- In `Recent Consistency (Last 7 Days)` chart:
  - Bars have `cursor: pointer` with hover scale effects.
  - Tooltip and click handler to immediately inspect that day.

### C. Dedicated Day Breakdown Inspector View
A slide/view transition inside the modal that replaces the table list with an in-depth day inspector, complete with a clean `← Back to History Records` button:
- **Header**: Full date formatting (e.g. `Thursday, October 22, 2026`), `Today` pill if applicable, and total study time vs target (`4h 34m 38s / 4h 00m`).
- **Goal Badge**: Visual pill indicating target status (e.g., `Met (114%)` or `% of target`).
- **Subject Distribution Bar**: Multi-colored stacked bar depicting relative study time across the 5 categories (Vocabulary: purple `#8b5cf6`, Kanji: amber `#f59e0b`, Grammar: cyan `#06b6d4`, Listening: green `#10b981`, Reading: rose `#f43f5e`).
- **Category Progress Cards (5 Cards)**:
  - Kanji symbol and title (`語彙 Vocabulary`, `文法 Kanji`, etc.).
  - Time elapsed vs target time with percentage.
  - Overtime glowing progress bar.
  - Timer vs manual adjustment breakdown (`Live: 120m | Adjusted: +5m`).
- **Session Activity Timeline & Intervals**:
  - Displays chronological study intervals for that day (e.g., `09:15 AM – 10:45 AM: Grammar (1h 30m)`).
  - Clean timestamp badge, subject pill, and duration.
  - For historical days prior to granular session logging, a clean summary notice explaining aggregate totals.
- **Daily Reflection & Study Notes**:
  - Displays study reflection text and notes written for that day.
- **Checklist Items**:
  - Shows which JLPT daily tasks were marked completed for that day.

---

## 2. Data Model & Session Logging

### A. Granular Session Intervals
`dailyRecord` objects will track `sessions: []`:
```typescript
interface StudySessionLog {
  id: string;              // Unique session ID
  sectionId: string;       // "vocabulary" | "kanji" | "grammar" | "listening" | "reading"
  startTime: number;       // Epoch milliseconds when session started
  endTime: number;         // Epoch milliseconds when session paused/stopped/switched
  durationSeconds: number; // Elapsed seconds in this session
  type: 'timer' | 'manual' // Live timer or manual time adjustment
}
```

### B. Timer Integration
When:
- A running section is paused,
- A user switches to a different section,
- A section timer is stopped, or
- Midnight rollover occurs,
a new `StudySessionLog` is pushed to `dailyRecord.sessions`.

### C. Backward Compatibility
- Existing history records without `sessions` arrays will default gracefully to `sessions: []`.
- All-time totals, table rendering, CSV synchronization, and export/import functionality remain 100% compatible.

---

## 3. Testing & Verification
- Unit & acceptance verification for all-time seconds calculation.
- Browser interactive testing verifying:
  - All-time stats card renders with correct totals.
  - Clicking a date row in the table opens the day breakdown view.
  - Clicking a bar in the 7-day chart opens the day breakdown view.
  - "← Back to History Records" returns to the table without modal dismissal.
  - Running a timer creates a session entry visible in the day's timeline.
