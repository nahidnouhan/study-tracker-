/**
 * Test Suite: Study History Breakdown & All-Time Study Stats
 * Validates session interval recording, lifetime stats calculation, and day breakdown extraction.
 */

const assert = require('assert');

// 5 Study Sections Configuration
const SECTIONS_CONFIG = [
  { id: 'vocabulary', title: 'Vocabulary', targetSeconds: 45 * 60 },
  { id: 'kanji', title: 'Kanji', targetSeconds: 45 * 60 },
  { id: 'grammar', title: 'Grammar', targetSeconds: 90 * 60 },
  { id: 'listening', title: 'Listening', targetSeconds: 30 * 60 },
  { id: 'reading', title: 'Reading & Timed Questions', targetSeconds: 30 * 60 }
];
const TOTAL_TARGET_SECONDS = 14400; // 4h = 240m = 14,400s

console.log('=====================================================');
console.log('RUNNING TEST SUITE: STUDY HISTORY BREAKDOWN & STATS');
console.log('=====================================================');

// -------------------------------------------------------------
// Test Helper Functions (mirroring app.js architecture)
// -------------------------------------------------------------
function calculateLifetimeStats(allRecords) {
  const dates = Object.keys(allRecords).sort();
  let totalSeconds = 0;
  let activeDays = 0;
  let goalsMet = 0;

  dates.forEach(dateKey => {
    const rec = allRecords[dateKey];
    let daySec = 0;
    if (rec && rec.sections) {
      SECTIONS_CONFIG.forEach(sec => {
        const s = rec.sections[sec.id];
        if (s) {
          daySec += Math.max(0, (s.timerSeconds || 0) + (s.manualAdjustmentSeconds || 0));
        }
      });
    }
    if (daySec > 0) {
      activeDays++;
      totalSeconds += daySec;
      if (daySec >= TOTAL_TARGET_SECONDS) {
        goalsMet++;
      }
    }
  });

  const dailyAvgSeconds = activeDays > 0 ? Math.round(totalSeconds / activeDays) : 0;

  // Streak calculation (consecutive days)
  let currentStreak = 0;
  if (dates.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);

    while (true) {
      const y = checkDate.getFullYear();
      const m = String(checkDate.getMonth() + 1).padStart(2, '0');
      const d = String(checkDate.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${d}`;

      const rec = allRecords[key];
      let daySec = 0;
      if (rec && rec.sections) {
        SECTIONS_CONFIG.forEach(sec => {
          const s = rec.sections[sec.id];
          if (s) daySec += Math.max(0, (s.timerSeconds || 0) + (s.manualAdjustmentSeconds || 0));
        });
      }

      if (daySec > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today has 0 study time yet, check yesterday to see if active streak continues
        if (checkDate.getTime() === today.getTime()) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
  }

  return {
    totalSeconds,
    activeDays,
    dailyAvgSeconds,
    goalsMet,
    currentStreak
  };
}

function extractDayBreakdown(dateKey, record) {
  if (!record || !record.sections) return null;

  let dayTotalSeconds = 0;
  const sections = {};

  SECTIONS_CONFIG.forEach(cfg => {
    const s = record.sections[cfg.id] || { timerSeconds: 0, manualAdjustmentSeconds: 0 };
    const timerSec = Math.max(0, s.timerSeconds || 0);
    const manualSec = s.manualAdjustmentSeconds || 0;
    const effectiveSec = Math.max(0, timerSec + manualSec);
    dayTotalSeconds += effectiveSec;

    sections[cfg.id] = {
      id: cfg.id,
      title: cfg.title,
      targetSeconds: cfg.targetSeconds,
      timerSeconds: timerSec,
      manualSeconds: manualSec,
      effectiveSeconds: effectiveSec,
      percentOfGoal: Math.round((effectiveSec / cfg.targetSeconds) * 100),
      isMet: effectiveSec >= cfg.targetSeconds
    };
  });

  // Calculate percentage of total day for spectrum bar
  Object.keys(sections).forEach(id => {
    sections[id].percentOfDay = dayTotalSeconds > 0 
      ? Math.round((sections[id].effectiveSeconds / dayTotalSeconds) * 100) 
      : 0;
  });

  const sessions = Array.isArray(record.sessions) ? [...record.sessions] : [];
  sessions.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));

  return {
    date: dateKey,
    totalSeconds: dayTotalSeconds,
    percentOfDailyGoal: Math.round((dayTotalSeconds / TOTAL_TARGET_SECONDS) * 100),
    isDailyGoalMet: dayTotalSeconds >= TOTAL_TARGET_SECONDS,
    sections,
    sessions,
    notes: record.notes || '',
    reflection: record.reflection || '',
    checklist: record.checklist || {}
  };
}

// -------------------------------------------------------------
// TESTS
// -------------------------------------------------------------

// Test 1: Lifetime Stats Calculation with multiple days
(function testLifetimeCalculation() {
  const records = {
    '2026-10-20': {
      sections: {
        vocabulary: { timerSeconds: 2700, manualAdjustmentSeconds: 0 }, // 45m
        kanji: { timerSeconds: 2700, manualAdjustmentSeconds: 0 },      // 45m
        grammar: { timerSeconds: 5400, manualAdjustmentSeconds: 0 },    // 90m
        listening: { timerSeconds: 1800, manualAdjustmentSeconds: 0 },  // 30m
        reading: { timerSeconds: 1800, manualAdjustmentSeconds: 0 }     // 30m -> Total 14400s (4h)
      }
    },
    '2026-10-21': {
      sections: {
        vocabulary: { timerSeconds: 1800, manualAdjustmentSeconds: 0 }, // 30m
        kanji: { timerSeconds: 1800, manualAdjustmentSeconds: 0 },      // 30m
        grammar: { timerSeconds: 3600, manualAdjustmentSeconds: 0 }     // 60m -> Total 7200s (2h)
      }
    },
    '2026-10-22': {
      sections: {
        vocabulary: { timerSeconds: 3000, manualAdjustmentSeconds: 600 }, // 60m
        grammar: { timerSeconds: 12000, manualAdjustmentSeconds: 0 }      // 200m -> Total 15600s
      }
    }
  };

  const stats = calculateLifetimeStats(records);
  assert.strictEqual(stats.activeDays, 3, 'Should identify 3 active study days');
  assert.strictEqual(stats.totalSeconds, 14400 + 7200 + 15600, 'Total lifetime seconds should match sum');
  assert.strictEqual(stats.goalsMet, 2, 'Should identify 2 days where 4h goal was met');
  assert.strictEqual(stats.dailyAvgSeconds, Math.round((14400 + 7200 + 15600) / 3), 'Daily average should match');
  console.log('[PASS] Test 1: Lifetime stats calculation calculates totals, active days, and goals met accurately');
})();

// Test 2: Day Breakdown Extraction
(function testDayBreakdownExtraction() {
  const record = {
    date: '2026-10-22',
    sections: {
      vocabulary: { timerSeconds: 2700, manualAdjustmentSeconds: 0 },
      kanji: { timerSeconds: 900, manualAdjustmentSeconds: 0 },
      grammar: { timerSeconds: 5400, manualAdjustmentSeconds: 0 },
      listening: { timerSeconds: 0, manualAdjustmentSeconds: 0 },
      reading: { timerSeconds: 1800, manualAdjustmentSeconds: 0 }
    },
    sessions: [
      { id: 's2', sectionId: 'grammar', startTime: 1729605000000, endTime: 1729610400000, durationSeconds: 5400, type: 'timer' },
      { id: 's1', sectionId: 'vocabulary', startTime: 1729600000000, endTime: 1729602700000, durationSeconds: 2700, type: 'timer' }
    ],
    notes: 'Completed Genki Chapter 15',
    reflection: 'Felt productive today',
    checklist: { vocabWords: true, grammarPoints: true }
  };

  const breakdown = extractDayBreakdown('2026-10-22', record);
  assert.strictEqual(breakdown.totalSeconds, 10800, 'Day total seconds should be 10,800s (3h)');
  assert.strictEqual(breakdown.percentOfDailyGoal, 75, '75% of 4h goal should be met');
  assert.strictEqual(breakdown.isDailyGoalMet, false, 'Goal not yet met');
  assert.strictEqual(breakdown.sections.grammar.percentOfGoal, 100, 'Grammar reached 100% of its target');
  assert.strictEqual(breakdown.sections.grammar.isMet, true, 'Grammar is marked met');
  assert.strictEqual(breakdown.sessions[0].id, 's1', 'Sessions should be sorted chronologically by startTime');
  assert.strictEqual(breakdown.notes, 'Completed Genki Chapter 15', 'Notes should be extracted');
  console.log('[PASS] Test 2: Day breakdown extracts per-subject status, sorted sessions, and notes');
})();

// Test 3: Backward Compatibility with Records Lacking Sessions
(function testBackwardCompatibility() {
  const oldRecord = {
    sections: {
      vocabulary: { timerSeconds: 1200, manualAdjustmentSeconds: 0 }
    }
  };

  const breakdown = extractDayBreakdown('2026-10-15', oldRecord);
  assert.ok(Array.isArray(breakdown.sessions), 'Sessions array should be initialized even if null in record');
  assert.strictEqual(breakdown.sessions.length, 0, 'Sessions length should be 0');
  assert.strictEqual(breakdown.totalSeconds, 1200, 'Total seconds should match');
  console.log('[PASS] Test 3: Backward compatibility works seamlessly for older records without sessions array');
})();

console.log('=====================================================');
console.log('ALL BREAKDOWN TESTS PASSED!');
console.log('=====================================================');
