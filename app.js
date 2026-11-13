/**
 * JLPT N4 Study Studio — Core Application Controller & Engine
 * High-Reliability Timestamp Timer, Calendar Boundary Splitting, Offline-First Persistence
 */

(function () {
  'use strict';

  // ==========================================================================
  // CONSTANTS & STATIC DEFINITIONS
  // ==========================================================================

  const STORAGE_KEY = 'jlpt_n4_study_studio_v2';
  const SNAPSHOT_KEY = 'jlpt_n4_snapshot_pre_import';
  const EXAM_TARGET_DATE = new Date(2026, 11, 6, 9, 0, 0); // Dec 6, 2026 09:00 AM

  // 5 Study Sections Configuration (Total 300 min = 5h 00m = 18,000s)
  const SECTIONS_CONFIG = [
    {
      id: 'vocabulary',
      title: 'Vocabulary',
      kanji: '語彙',
      targetSeconds: 45 * 60, // 2,700s (45 min)
      themeColor: '#8b5cf6',
      guidance: 'Learn new words, review forgotten words, and test yourself without hints.'
    },
    {
      id: 'kanji',
      title: 'Kanji',
      kanji: '漢字',
      targetSeconds: 45 * 60, // 2,700s (45 min)
      themeColor: '#f59e0b',
      guidance: 'Practise on/kun readings and compound meanings through common vocabulary.'
    },
    {
      id: 'grammar',
      // Keep the id stable so all existing study history remains intact.
      title: 'Mock Test',
      kanji: '文法',
      targetSeconds: 90 * 60, // 5,400s (90 min)
      themeColor: '#06b6d4',
      guidance: 'Complete a timed mock test and review the questions you missed.'
    },
    {
      id: 'listening',
      title: 'Listening',
      kanji: '聴解',
      targetSeconds: 60 * 60, // 3,600s (60 min)
      themeColor: '#10b981',
      guidance: 'Use N4 audio questions and review why you missed each answer.'
    },
    {
      id: 'reading',
      title: 'Reading & Timed Questions',
      kanji: '読解',
      targetSeconds: 60 * 60, // 3,600s (60 min)
      themeColor: '#f43f5e',
      guidance: 'Practise short passages and exam-style questions, including a review of mistakes.'
    }
  ];

  const TOTAL_TARGET_SECONDS = SECTIONS_CONFIG.reduce((acc, s) => acc + s.targetSeconds, 0); // 18,000s (5h 00m)

  // ==========================================================================
  // UTILITY FUNCTIONS: DATE, TIME & FORMATTING
  // ==========================================================================

  function getLocalDateKey(dateObj = new Date()) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getNextLocalMidnight(timestamp) {
    const d = new Date(timestamp);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0).getTime();
  }

  function formatSecondsToHMS(totalSec) {
    const sec = Math.max(0, Math.floor(totalSec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function formatSecondsToFriendly(totalSec) {
    const sec = Math.max(0, Math.floor(totalSec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    }
    return `${m}m ${s}s`;
  }

  function formatShortDate(dateStr) {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  // ==========================================================================
  // INITIAL STATE FACTORY
  // ==========================================================================

  function createFreshDailyRecord(dateStr) {
    const sections = {};
    SECTIONS_CONFIG.forEach(sec => {
      sections[sec.id] = {
        targetSeconds: sec.targetSeconds,
        timerSeconds: 0,
        manualAdjustmentSeconds: 0,
        targetReachedNotified: false,
        isUserCompleted: false
      };
    });

    return {
      date: dateStr,
      sections,
      sessions: [],
      checklist: {
        vocabWords: false,
        kanjiReadings: false,
        grammarPoints: false,
        listeningAudio: false,
        readingPassages: false
      },
      completedXpAwarded: {},
      dailyTargetCelebrated: false,
      notes: '',
      reflection: ''
    };
  }

  function getRecordTargetSeconds(record) {
    if (!record || !record.sections) return TOTAL_TARGET_SECONDS;
    const storedTarget = SECTIONS_CONFIG.reduce((sum, cfg) => {
      const section = record.sections[cfg.id];
      return sum + (Number.isFinite(section?.targetSeconds) ? section.targetSeconds : cfg.targetSeconds);
    }, 0);
    return storedTarget || TOTAL_TARGET_SECONDS;
  }

  function getRecordTotalSeconds(record) {
    if (!record || !record.sections) return 0;
    return SECTIONS_CONFIG.reduce((sum, cfg) => {
      const section = record.sections[cfg.id];
      return sum + Math.max(0, (section?.timerSeconds || 0) + (section?.manualAdjustmentSeconds || 0));
    }, 0);
  }

  function createInitialState() {
    const todayStr = getLocalDateKey();
    return {
      schemaVersion: 1,
      currentDate: todayStr,
      activeSectionId: null,
      activeStartedAt: null,
      lastHeartbeatTimestamp: Date.now(),
      lastMonotonicTimestamp: performance.now(),
      evolutionMode: 'auto',
      manualEvolutionStage: 1,
      aquariumEffectsMode: 'full',
      settings: {
        soundEnabled: true,
        notificationsEnabled: false
      },
      dailyRecord: createFreshDailyRecord(todayStr),
      history: {} // date -> finalized dailyRecord
    };
  }

  // ==========================================================================
  // STORAGE SERVICE & SAFETY
  // ==========================================================================

  let isStorageHealthy = true;
  let syncDebounceTimer = null;

  function updateSyncBadge(status) {
    const dot = document.getElementById('sync-status-dot');
    const text = document.getElementById('sync-status-text');
    if (!dot || !text) return;

    if (status === 'synced') {
      dot.className = 'sync-dot sync-synced';
      text.textContent = 'D:\\ Synced';
    } else if (status === 'syncing') {
      dot.className = 'sync-dot sync-pending';
      text.textContent = 'Syncing...';
    } else {
      dot.className = 'sync-dot sync-offline';
      text.textContent = 'Local Cache';
    }
  }

  function triggerDailyCsvSync() {
    if (typeof fetch === 'undefined') return;
    clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(async () => {
      try {
        updateSyncBadge('syncing');
        const d = appState.dailyRecord;
        if (!d || !d.sections) return;
        const s = d.sections;
        const totalSec = typeof getTotalStudiedSeconds === 'function' ? getTotalStudiedSeconds(appState) : 0;

        const payload = {
          date: appState.currentDate,
          totalStudyMinutes: totalSec / 60,
          targetGoalMinutes: TOTAL_TARGET_SECONDS / 60,
          goalMet: totalSec >= TOTAL_TARGET_SECONDS,
          vocabTimerMin: (s.vocabulary ? s.vocabulary.timerSeconds : 0) / 60,
          vocabAdjMin: (s.vocabulary ? s.vocabulary.manualAdjustmentSeconds : 0) / 60,
          vocabTotalMin: ((s.vocabulary ? s.vocabulary.timerSeconds : 0) + (s.vocabulary ? s.vocabulary.manualAdjustmentSeconds : 0)) / 60,
          kanjiTimerMin: (s.kanji ? s.kanji.timerSeconds : 0) / 60,
          kanjiAdjMin: (s.kanji ? s.kanji.manualAdjustmentSeconds : 0) / 60,
          kanjiTotalMin: ((s.kanji ? s.kanji.timerSeconds : 0) + (s.kanji ? s.kanji.manualAdjustmentSeconds : 0)) / 60,
          grammarTimerMin: (s.grammar ? s.grammar.timerSeconds : 0) / 60,
          grammarAdjMin: (s.grammar ? s.grammar.manualAdjustmentSeconds : 0) / 60,
          grammarTotalMin: ((s.grammar ? s.grammar.timerSeconds : 0) + (s.grammar ? s.grammar.manualAdjustmentSeconds : 0)) / 60,
          listeningTimerMin: (s.listening ? s.listening.timerSeconds : 0) / 60,
          listeningAdjMin: (s.listening ? s.listening.manualAdjustmentSeconds : 0) / 60,
          listeningTotalMin: ((s.listening ? s.listening.timerSeconds : 0) + (s.listening ? s.listening.manualAdjustmentSeconds : 0)) / 60,
          readingTimerMin: (s.reading ? s.reading.timerSeconds : 0) / 60,
          readingAdjMin: (s.reading ? s.reading.manualAdjustmentSeconds : 0) / 60,
          readingTotalMin: ((s.reading ? s.reading.timerSeconds : 0) + (s.reading ? s.reading.manualAdjustmentSeconds : 0)) / 60,
          studyNotes: d.notes || '',
          dailyReflection: d.reflection || ''
        };

        const res = await fetch('http://localhost:3456/api/sync-history-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          updateSyncBadge('synced');
        } else {
          updateSyncBadge('offline');
        }
      } catch (err) {
        updateSyncBadge('offline');
      }
    }, 1500);
  }

  function safeSave(stateObj) {
    try {
      const json = JSON.stringify(stateObj);
      localStorage.setItem(STORAGE_KEY, json);
      if (!isStorageHealthy) {
        isStorageHealthy = true;
        updateStorageWarningUI(true);
      }
      triggerDailyCsvSync();
      return true;
    } catch (err) {
      console.error('Storage Save Failed:', err);
      isStorageHealthy = false;
      updateStorageWarningUI(false);
      return false;
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createInitialState();

      const parsed = JSON.parse(raw);
      if (!parsed || parsed.schemaVersion !== 1) {
        console.warn('Unknown schema version; initializing fresh state with existing backup.');
        return createInitialState();
      }

      // Ensure sections existence and data integrity
      const todayStr = getLocalDateKey();
      if (!parsed.dailyRecord || !parsed.dailyRecord.sections) {
        parsed.dailyRecord = createFreshDailyRecord(todayStr);
      }

      SECTIONS_CONFIG.forEach(cfg => {
        if (!parsed.dailyRecord.sections[cfg.id]) {
          parsed.dailyRecord.sections[cfg.id] = {
            targetSeconds: cfg.targetSeconds,
            timerSeconds: 0,
            manualAdjustmentSeconds: 0,
            targetReachedNotified: false,
            isUserCompleted: false
          };
        } else {
          parsed.dailyRecord.sections[cfg.id].targetSeconds = cfg.targetSeconds;
          const currentElapsed = (parsed.dailyRecord.sections[cfg.id].timerSeconds || 0) + (parsed.dailyRecord.sections[cfg.id].manualAdjustmentSeconds || 0);
          if (currentElapsed < cfg.targetSeconds) {
            parsed.dailyRecord.sections[cfg.id].targetReachedNotified = false;
          }
        }
      });

      if (!parsed.history) parsed.history = {};
      // Historical records retain their original daily target. Correct the one
      // four-second near-miss (3:59:56) so it counts as the completed 4h day.
      Object.values(parsed.history).forEach(record => {
        const target = getRecordTargetSeconds(record);
        const total = getRecordTotalSeconds(record);
        if (target === 14400 && total < target && target - total <= 4 && !record.fourHourNearMissCorrected) {
          const section = SECTIONS_CONFIG
            .map(cfg => record.sections[cfg.id])
            .filter(Boolean)
            .sort((a, b) => ((b.timerSeconds || 0) + (b.manualAdjustmentSeconds || 0)) - ((a.timerSeconds || 0) + (a.manualAdjustmentSeconds || 0)))[0];
          if (section) section.manualAdjustmentSeconds = (section.manualAdjustmentSeconds || 0) + (target - total);
          record.fourHourNearMissCorrected = true;
        }
      });
      if (!parsed.settings) parsed.settings = { soundEnabled: true, notificationsEnabled: false };
      if (!parsed.evolutionMode) parsed.evolutionMode = 'auto';
      if (!parsed.manualEvolutionStage) parsed.manualEvolutionStage = 1;
      if (!parsed.aquariumEffectsMode) parsed.aquariumEffectsMode = 'full';
      if (!parsed.dailyRecord.completedXpAwarded) parsed.dailyRecord.completedXpAwarded = {};
      if (typeof parsed.dailyRecord.dailyTargetCelebrated !== 'boolean') parsed.dailyRecord.dailyTargetCelebrated = false;
      if (!Array.isArray(parsed.dailyRecord.sessions)) parsed.dailyRecord.sessions = [];

      return parsed;
    } catch (err) {
      console.error('Failed to load state from localStorage:', err);
      return createInitialState();
    }
  }

  function updateStorageWarningUI(healthy) {
    const banner = document.getElementById('storage-warning-banner');
    if (!banner) return;
    if (healthy) {
      banner.classList.add('hidden');
    } else {
      banner.classList.remove('hidden');
    }
  }

  // ==========================================================================
  // AUDIO SYNTHESIZER (WEB AUDIO API)
  // ==========================================================================

  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playHarmonicChime() {
    if (!appState.settings.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Multi-tone chord: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const notes = [
        { freq: 523.25, time: 0 },
        { freq: 659.25, time: 0.12 },
        { freq: 783.99, time: 0.24 },
        { freq: 1046.50, time: 0.36 }
      ];

      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, now + n.time);

        // Smooth ADSR envelope
        gain.gain.setValueAtTime(0.0001, now + n.time);
        gain.gain.exponentialRampToValueAtTime(0.25, now + n.time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + n.time);
        osc.stop(now + n.time + 1.25);
      });
    } catch (e) {
      console.warn('Web Audio playback failed:', e);
    }
  }

  // ==========================================================================
  // DESKTOP NOTIFICATIONS
  // ==========================================================================

  function sendDesktopNotification(title, message) {
    if (!appState.settings.notificationsEnabled) return;
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: 'favicon.ico'
        });
      } catch (e) {
        console.warn('Desktop notification error:', e);
      }
    }
  }

  // ==========================================================================
  // APPLICATION STATE & TIMER CONTROLLER
  // ==========================================================================

  let appState = loadState();
  let isReconciling = false;
  let pendingRecoveryData = null;
  let pendingImportData = null;

  // Monotonic & Suspended Detection Anchors
  appState.lastHeartbeatTimestamp = Date.now();
  appState.lastMonotonicTimestamp = performance.now();

  // Active expanding pillar tracking (Fey-style accordion)
  let expandedSectionId = appState.activeSectionId || 'vocabulary';
  let isPondTransitioning = false;
  let pondTransitionTimer = null;

  /**
   * Prevents accidental timer start while a new pond is expanding and koi are leaping into it.
   * Keeps timer controls steady until the 720ms pillar transition settles.
   */
  function setPondSwitchingCooldown() {
    isPondTransitioning = true;
    if (pondTransitionTimer) clearTimeout(pondTransitionTimer);

    // Apply settling visual state to controls pill on the newly active card
    const activePill = document.querySelector(`.pillar-card.is-expanded .card-controls-pill`);
    if (activePill) {
      activePill.classList.add('is-settling');
    }

    pondTransitionTimer = setTimeout(() => {
      isPondTransitioning = false;
      const pill = document.querySelector(`.pillar-card.is-expanded .card-controls-pill`);
      if (pill) {
        pill.classList.remove('is-settling');
      }
    }, 760);
  }

  /**
   * Calculates the current effective elapsed seconds for a section.
   * Strictly enforces: timerSeconds + manualAdjustmentSeconds >= 0
   */
  function getSectionElapsedSeconds(sectionId, state = appState, now = Date.now()) {
    const sec = state.dailyRecord.sections[sectionId];
    if (!sec) return 0;

    let total = sec.timerSeconds + sec.manualAdjustmentSeconds;
    if (state.activeSectionId === sectionId && state.activeStartedAt !== null) {
      const deltaMs = Math.max(0, now - state.activeStartedAt);
      total += Math.floor(deltaMs / 1000);
    }
    return Math.max(0, total);
  }

  /**
   * Calculates the Koi-to-Dragon evolution stage (1: Novice Koi, 2: River Drake, 3: Celestial Dragon).
   * Supports automatic stage progression based on section elapsed study time, or manual preview override.
   */
  function getCalculatedEvolutionStage(sectionId = expandedSectionId, state = appState) {
    if (state.evolutionMode === 'manual') {
      return Math.max(1, Math.min(3, parseInt(state.manualEvolutionStage, 10) || 1));
    }
    // Auto Mode: 0-30m -> Stage 1, 30-60m -> Stage 2, 60m+ -> Stage 3
    const elapsed = getSectionElapsedSeconds(sectionId, state);
    if (elapsed < 1800) {
      return 1;
    } else if (elapsed < 3600) {
      return 2;
    } else {
      return 3;
    }
  }

  /**
   * Calculates the total effective studied seconds for the entire day.
   */
  function getTotalStudiedSeconds(state = appState, now = Date.now()) {
    return SECTIONS_CONFIG.reduce((acc, sec) => {
      return acc + getSectionElapsedSeconds(sec.id, state, now);
    }, 0);
  }

  /**
   * Calculates the cumulative study seconds across all recorded history plus today.
   */
  function getAllTimeStudiedSeconds(state = appState, now = Date.now()) {
    let allTime = getTotalStudiedSeconds(state, now);
    if (state.history) {
      Object.keys(state.history).forEach(dKey => {
        if (dKey !== state.currentDate) {
          const rec = state.history[dKey];
          if (rec && rec.sections) {
            SECTIONS_CONFIG.forEach(cfg => {
              const sec = rec.sections[cfg.id];
              if (sec) {
                allTime += Math.max(0, (sec.timerSeconds || 0) + (sec.manualAdjustmentSeconds || 0));
              }
            });
          }
        }
      });
    }
    return allTime;
  }

  /**
   * Calendar Boundary Splitting Algorithm:
   * Splits an interval [T_start, T_end] across local midnight boundaries.
   * Handles DST and multi-day spans cleanly.
   */
  function splitIntervalAcrossDays(tStart, tEnd) {
    const slices = [];
    let cursor = tStart;

    while (cursor < tEnd) {
      const curDateStr = getLocalDateKey(new Date(cursor));
      const nextMidnight = getNextLocalMidnight(cursor);
      const sliceEnd = Math.min(tEnd, nextMidnight);
      const sliceSeconds = Math.max(0, Math.floor((sliceEnd - cursor) / 1000));

      if (sliceSeconds > 0) {
        slices.push({ date: curDateStr, seconds: sliceSeconds });
      }
      cursor = sliceEnd;
    }
    return slices;
  }

  /**
   * Commits live elapsed time of the active section and performs day boundary distribution.
   */
  function commitActiveSectionTime(endTime = Date.now()) {
    if (!appState.activeSectionId || appState.activeStartedAt === null) return;

    const activeId = appState.activeSectionId;
    const startTime = appState.activeStartedAt;
    const slices = splitIntervalAcrossDays(startTime, endTime);

    let sliceCursor = startTime;
    slices.forEach(slice => {
      if (slice.seconds <= 0) return;
      const sliceStart = sliceCursor;
      const sliceEnd = Math.min(endTime, sliceStart + (slice.seconds * 1000));
      sliceCursor = sliceEnd;

      const sessionEntry = {
        id: 'sess_' + sliceStart + '_' + Math.random().toString(36).substring(2, 7),
        sectionId: activeId,
        startTime: sliceStart,
        endTime: sliceEnd,
        durationSeconds: slice.seconds,
        type: 'timer'
      };

      if (slice.date === appState.currentDate) {
        // Today's record
        appState.dailyRecord.sections[activeId].timerSeconds += slice.seconds;
        if (!Array.isArray(appState.dailyRecord.sessions)) appState.dailyRecord.sessions = [];
        appState.dailyRecord.sessions.push(sessionEntry);
      } else {
        // Past day (cross-midnight)
        if (!appState.history[slice.date]) {
          appState.history[slice.date] = createFreshDailyRecord(slice.date);
        }
        appState.history[slice.date].sections[activeId].timerSeconds += slice.seconds;
        if (!Array.isArray(appState.history[slice.date].sessions)) appState.history[slice.date].sessions = [];
        appState.history[slice.date].sessions.push(sessionEntry);
      }
    });

    // Reset active reference anchor
    appState.activeStartedAt = endTime;
  }

  /**
   * Daily Rollover Management:
   * Transitions from previous calendar day to new calendar day.
   */
  function checkAndHandleDailyRollover() {
    const actualToday = getLocalDateKey();
    if (appState.currentDate === actualToday) return;

    // First commit time up to now (this will split across boundaries)
    commitActiveSectionTime(Date.now());

    // Archive current record to history if it has study time or notes
    const pastRecord = appState.dailyRecord;
    appState.history[pastRecord.date] = JSON.parse(JSON.stringify(pastRecord));

    // Create fresh record for new day
    appState.currentDate = actualToday;
    if (appState.history[actualToday]) {
      // If a record already existed for today (e.g. from cross-midnight split)
      appState.dailyRecord = JSON.parse(JSON.stringify(appState.history[actualToday]));
      delete appState.history[actualToday];
    } else {
      appState.dailyRecord = createFreshDailyRecord(actualToday);
    }

    safeSave(appState);
    renderAll();
  }

  /**
   * Reconciliation Loop (Drift, Throttling & Interruption Detection)
   * Incorporates User Final Amendment.
   */
  function reconcile() {
    if (isReconciling) return;
    isReconciling = true;

    try {
      const nowWall = Date.now();
      const nowMono = performance.now();

      // Check for midnight rollover
      checkAndHandleDailyRollover();

      if (appState.activeSectionId && appState.activeStartedAt !== null) {
        const wallDeltaSec = (nowWall - appState.lastHeartbeatTimestamp) / 1000;
        const monoDeltaSec = (nowMono - appState.lastMonotonicTimestamp) / 1000;

        // Final Amendment: Ambiguous gap detection
        // If gap > 300s (5 mins) AND monotonic progression was < 50% of wall-clock time,
        // it indicates the OS was asleep or browser frozen/closed.
        if (wallDeltaSec > 300 && monoDeltaSec < (wallDeltaSec * 0.5)) {
          console.warn(`Interruption detected: Wall delta ${wallDeltaSec}s, Mono delta ${monoDeltaSec}s`);
          
          // Pause timer at last trustworthy checkpoint
          const checkpointTime = appState.lastHeartbeatTimestamp;
          commitActiveSectionTime(checkpointTime);

          const pausedSectionId = appState.activeSectionId;
          appState.activeSectionId = null;
          appState.activeStartedAt = null;

          safeSave(appState);
          renderAll();

          // Present Non-Destructive Recovery Dialog
          showInterruptionRecoveryDialog(pausedSectionId, checkpointTime, nowWall);
          isReconciling = false;
          return;
        }

        // Check if section reached target and should chime
        const currentElapsed = getSectionElapsedSeconds(appState.activeSectionId, appState, nowWall);
        const sectionConfig = SECTIONS_CONFIG.find(s => s.id === appState.activeSectionId);
        const secData = appState.dailyRecord.sections[appState.activeSectionId];

        if (sectionConfig && currentElapsed >= sectionConfig.targetSeconds && !secData.targetReachedNotified) {
          secData.targetReachedNotified = true;
          // Deduplicated +250 XP bonus (Priority 3)
          if (!appState.dailyRecord.completedXpAwarded) appState.dailyRecord.completedXpAwarded = {};
          if (!appState.dailyRecord.completedXpAwarded[appState.activeSectionId]) {
            appState.dailyRecord.completedXpAwarded[appState.activeSectionId] = true;
            showCelebrationToast(`${sectionConfig.title} Target Met!`, '+250 Study XP Earned! Keep going!', '🎉');
          }
          safeSave(appState);
          playHarmonicChime();
          if (window.elementalKoiPond) {
            window.elementalKoiPond.addRipple(window.elementalKoiPond.orbitCenter?.x || 300, window.elementalKoiPond.orbitCenter?.y || 200, '#fbbf24', 95);
          }
          sendDesktopNotification(
            `JLPT N4: ${sectionConfig.title} Target Reached!`,
            `Congratulations! You reached your ${sectionConfig.targetSeconds / 60} min target for ${sectionConfig.title}. The timer will continue tracking overtime.`
          );
          announceAria(`${sectionConfig.title} target reached! Continued tracking overtime.`);
        }

        // Daily Goal Milestone Celebration (Priority 3)
        const totalDaySec = getTotalStudiedSeconds();
        if (totalDaySec >= TOTAL_TARGET_SECONDS && !appState.dailyRecord.dailyTargetCelebrated) {
          appState.dailyRecord.dailyTargetCelebrated = true;
          safeSave(appState);
          playHarmonicChime();
          showCelebrationToast('🌟 Daily Study Target Reached!', 'Celestial Harmony Achieved! +1000 Master XP Bonus!', '🐉');
          if (window.elementalKoiPond) {
            window.elementalKoiPond.setMode('yin-yang');
            window.elementalKoiPond.addRipple(window.elementalKoiPond.orbitCenter?.x || 300, window.elementalKoiPond.orbitCenter?.y || 200, '#ffffff', 110);
            window.elementalKoiPond.addRipple(window.elementalKoiPond.orbitCenter?.x || 300, window.elementalKoiPond.orbitCenter?.y || 200, 'rgba(251, 191, 36, 0.9)', 140);
          }
        }
      }

      // Update heartbeat anchors
      appState.lastHeartbeatTimestamp = nowWall;
      appState.lastMonotonicTimestamp = nowMono;

    } catch (e) {
      console.error('Reconciliation error:', e);
    } finally {
      isReconciling = false;
    }
  }

  // ==========================================================================
  // SECTION CONTROLS & TIMERS
  // ==========================================================================

  function startSection(sectionId) {
    if (appState.activeSectionId === sectionId) return;

    expandedSectionId = sectionId;

    // Starting new section automatically pauses the current active section
    if (appState.activeSectionId) {
      commitActiveSectionTime(Date.now());
    }

    appState.activeSectionId = sectionId;
    appState.activeStartedAt = Date.now();
    appState.lastHeartbeatTimestamp = Date.now();
    appState.lastMonotonicTimestamp = performance.now();

    // Priority 1: Awaken active creature with energized swimming
    if (window.elementalKoiPond && typeof window.elementalKoiPond.setStudyActive === 'function') {
      window.elementalKoiPond.setStudyActive(true);
    }

    safeSave(appState);
    renderAll();
    announceAria(`Started timer for ${sectionId}`);

    // Study music is strictly manual and separated from study session timers
    // (playYouTubeStudyMusicIfAuto is decoupled)
  }

  function pauseActiveSection() {
    if (!appState.activeSectionId) return;

    const pausedId = appState.activeSectionId;
    commitActiveSectionTime(Date.now());
    appState.activeSectionId = null;
    appState.activeStartedAt = null;

    // Priority 1: Transition creature back into serene calm state
    if (window.elementalKoiPond && typeof window.elementalKoiPond.setStudyActive === 'function') {
      window.elementalKoiPond.setStudyActive(false);
    }

    safeSave(appState);
    renderAll();
    announceAria(`Paused timer for ${pausedId}`);
  }

  function toggleSectionTimer(sectionId) {
    expandedSectionId = sectionId;
    if (appState.activeSectionId === sectionId) {
      pauseActiveSection();
    } else {
      startSection(sectionId);
    }
  }

  /**
   * Applies manual time adjustment in seconds (+/-).
   * Enforces 0s minimum constraint.
   */
  function adjustSectionTime(sectionId, deltaSeconds) {
    const sec = appState.dailyRecord.sections[sectionId];
    if (!sec) return;

    // If currently running, commit first
    if (appState.activeSectionId === sectionId) {
      commitActiveSectionTime(Date.now());
    }

    const currentTotal = sec.timerSeconds + sec.manualAdjustmentSeconds;
    const newTotal = Math.max(0, currentTotal + deltaSeconds);
    const actualDelta = newTotal - currentTotal;
    sec.manualAdjustmentSeconds = newTotal - sec.timerSeconds;

    if (actualDelta !== 0) {
      if (!Array.isArray(appState.dailyRecord.sessions)) appState.dailyRecord.sessions = [];
      const now = Date.now();
      appState.dailyRecord.sessions.push({
        id: 'adj_' + now + '_' + Math.random().toString(36).substring(2, 7),
        sectionId: sectionId,
        startTime: now,
        endTime: now,
        durationSeconds: actualDelta,
        type: 'manual'
      });
    }

    safeSave(appState);
    renderAll();
    announceAria(`Adjusted ${sectionId} by ${deltaSeconds > 0 ? '+' : ''}${Math.round(deltaSeconds / 60)} minutes`);
  }

  function toggleSectionUserCompleted(sectionId) {
    const sec = appState.dailyRecord.sections[sectionId];
    if (!sec) return;

    sec.isUserCompleted = !sec.isUserCompleted;
    if (sec.isUserCompleted) {
      if (!appState.dailyRecord.completedXpAwarded) appState.dailyRecord.completedXpAwarded = {};
      if (!appState.dailyRecord.completedXpAwarded[sectionId]) {
        appState.dailyRecord.completedXpAwarded[sectionId] = true;
        const cfg = SECTIONS_CONFIG.find(s => s.id === sectionId);
        showCelebrationToast(`${cfg ? cfg.title : sectionId} Completed!`, '+250 Study XP Earned!', '✓');
      }
    }
    safeSave(appState);
    renderAll();
    announceAria(`${sectionId} marked as ${sec.isUserCompleted ? 'completed' : 'not completed'}`);
  }

  function resetSectionTime(sectionId) {
    const sec = appState.dailyRecord.sections[sectionId];
    if (!sec) return;

    if (appState.activeSectionId === sectionId) {
      appState.activeSectionId = null;
      appState.activeStartedAt = null;
    }

    sec.timerSeconds = 0;
    sec.manualAdjustmentSeconds = 0;
    sec.targetReachedNotified = false;
    sec.isUserCompleted = false;

    if (Array.isArray(appState.dailyRecord.sessions)) {
      appState.dailyRecord.sessions = appState.dailyRecord.sessions.filter(s => s.sectionId !== sectionId);
    }

    safeSave(appState);
    renderAll();
    announceAria(`Reset ${sectionId} timer to zero`);
  }

  function resetTodaySession() {
    if (appState.activeSectionId) {
      appState.activeSectionId = null;
      appState.activeStartedAt = null;
    }

    appState.dailyRecord = createFreshDailyRecord(appState.currentDate);
    safeSave(appState);
    renderAll();
    announceAria("Today's study session has been reset.");
  }

  // ==========================================================================
  // ARIA & ACCESSIBILITY HELPER
  // ==========================================================================

  function announceAria(message) {
    const el = document.getElementById('aria-announcer');
    if (el) {
      el.textContent = message;
    }
  }

  // ==========================================================================
  // UI RENDERING ENGINE
  // ==========================================================================

  function updateExamCountdown() {
    const badgeEl = document.getElementById('exam-countdown-text');
    if (!badgeEl) return;

    const now = new Date();
    const diffMs = EXAM_TARGET_DATE - now;

    if (diffMs <= 0) {
      badgeEl.textContent = 'Exam Day!';
      return;
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    badgeEl.textContent = `${days}d ${hours}h ${mins}m`;
  }

  function renderHero() {
    const todayStr = appState.currentDate;
    const dateDisplay = document.getElementById('daily-overview-heading');
    if (dateDisplay) {
      const parts = todayStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      dateDisplay.textContent = d.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    const totalSeconds = getTotalStudiedSeconds();
    const totalStudiedEl = document.getElementById('total-studied-display');
    if (totalStudiedEl) totalStudiedEl.textContent = formatSecondsToHMS(totalSeconds);

    // All-time total study time
    const allTimeSeconds = getAllTimeStudiedSeconds();
    const allTimeEl = document.getElementById('all-time-studied-display');
    if (allTimeEl) allTimeEl.textContent = formatSecondsToFriendly(allTimeSeconds);

    // Percentage of daily target (uncapped)
    const pct = ((totalSeconds / TOTAL_TARGET_SECONDS) * 100);
    const pctEl = document.getElementById('total-percentage-display');
    if (pctEl) pctEl.textContent = `${pct.toFixed(1)}%`;

    const targetCaptionEl = document.querySelector('.stat-target-caption');
    if (targetCaptionEl) {
      const targetMins = Math.round(TOTAL_TARGET_SECONDS / 60);
      const targetH = Math.floor(targetMins / 60);
      const targetRemM = targetMins % 60;
      targetCaptionEl.textContent = `/ ${targetH}h${targetRemM > 0 ? ` ${targetRemM}m` : ''} (${targetMins} min target)`;
    }

    // Compact Header Toggle Pill Real-Time Values
    const headerSummaryEl = document.getElementById('header-progress-summary');
    if (headerSummaryEl) headerSummaryEl.textContent = formatSecondsToHMS(totalSeconds);

    const headerPctEl = document.getElementById('header-progress-percent');
    if (headerPctEl) headerPctEl.textContent = `${pct.toFixed(0)}%`;

    const headerDotEl = document.getElementById('header-progress-dot');
    const headerToggleBtn = document.getElementById('btn-toggle-stats');
    if (appState.activeSectionId) {
      if (headerDotEl) headerDotEl.className = 'pill-dot active';
      if (headerToggleBtn) headerToggleBtn.classList.add('active');
    } else {
      if (headerDotEl) headerDotEl.className = 'pill-dot';
      if (headerToggleBtn) headerToggleBtn.classList.remove('active');
    }

    // Progress bar fill (0 - 100%)
    const fillEl = document.getElementById('total-progress-fill');
    if (fillEl) fillEl.style.width = `${Math.min(100, pct)}%`;

    // Overtime fill if > 100%
    const overtimeEl = document.getElementById('total-overtime-fill');
    if (overtimeEl) {
      if (pct > 100) {
        overtimeEl.classList.remove('hidden');
        overtimeEl.style.width = `${Math.min(100, pct - 100)}%`;
      } else {
        overtimeEl.classList.add('hidden');
      }
    }

    // Remaining Target Time or Overtime
    const remEl = document.getElementById('total-remaining-display');
    if (remEl) {
      if (totalSeconds < TOTAL_TARGET_SECONDS) {
        remEl.textContent = formatSecondsToFriendly(TOTAL_TARGET_SECONDS - totalSeconds);
      } else {
        remEl.textContent = `+${formatSecondsToFriendly(totalSeconds - TOTAL_TARGET_SECONDS)} overtime`;
      }
    }

    // Targets Reached Count (based on elapsed >= target)
    let reachedCount = 0;
    let completedCount = 0;
    SECTIONS_CONFIG.forEach(sec => {
      const elapsed = getSectionElapsedSeconds(sec.id);
      if (elapsed >= sec.targetSeconds) reachedCount++;
      if (appState.dailyRecord.sections[sec.id].isUserCompleted) completedCount++;
    });

    const targetsEl = document.getElementById('targets-reached-count');
    if (targetsEl) targetsEl.textContent = `${reachedCount} / 5`;

    const completedEl = document.getElementById('sections-completed-count');
    if (completedEl) completedEl.textContent = `${completedCount} / 5`;

    // Global Status Dot
    const dotEl = document.getElementById('global-status-dot');
    const textEl = document.getElementById('global-status-text');
    if (appState.activeSectionId) {
      if (dotEl) dotEl.classList.add('active');
      if (textEl) {
        const activeCfg = SECTIONS_CONFIG.find(s => s.id === appState.activeSectionId);
        textEl.textContent = `Active: ${activeCfg ? activeCfg.title : ''}`;
      }
    } else {
      if (dotEl) dotEl.classList.remove('active');
      if (textEl) textEl.textContent = 'All Timers Idle';
    }
  }

  // ==========================================================================
  // STUDY XP & MILESTONE BADGES ENGINE (Priorities 3 & 6)
  // ==========================================================================

  const STUDY_LEVELS = [
    { level: 1, title: 'Novice Koi', kanji: '初心', minXp: 0, tag: 'Tier I', desc: 'Tranquil beginnings in sacred crystal waters' },
    { level: 2, title: 'Pond Seeker', kanji: '求道', minXp: 300, tag: 'Tier II', desc: 'Deepening immersion, rhythm, and dedicated focus' },
    { level: 3, title: 'River Drake', kanji: '昇流', minXp: 800, tag: 'Tier III', desc: 'Gliding effortlessly through rapid mountain currents' },
    { level: 4, title: 'Drake Ascendant', kanji: '翔天', minXp: 1800, tag: 'Tier IV', desc: 'Harnessing lightning tempest energy and study discipline' },
    { level: 5, title: 'Dragon Gate Leaper', kanji: '登竜', minXp: 3500, tag: 'Tier V', desc: 'Leaping through the legendary waterfall gate' },
    { level: 6, title: 'Celestial Dragon', kanji: '天龍', minXp: 6000, tag: 'Tier VI', desc: 'Supreme mastery; commanding cosmic tides and wisdom' }
  ];

  function getCalculatedStudyXp(state = appState) {
    let totalSec = 0;
    // Cumulative today
    if (state.dailyRecord && state.dailyRecord.sections) {
      Object.values(state.dailyRecord.sections).forEach(s => {
        totalSec += Math.max(0, (s.timerSeconds || 0) + (s.manualAdjustmentSeconds || 0));
      });
    }
    // Plus running timer
    if (state.activeSectionId && state.activeStartedAt) {
      totalSec += Math.max(0, (Date.now() - state.lastHeartbeatTimestamp) / 1000);
    }
    // Past days history
    if (state.history) {
      Object.keys(state.history).forEach(dKey => {
        if (dKey !== state.currentDate) {
          const rec = state.history[dKey];
          if (rec && rec.sections) {
            Object.values(rec.sections).forEach(s => {
              totalSec += Math.max(0, (s.timerSeconds || 0) + (s.manualAdjustmentSeconds || 0));
            });
          }
        }
      });
    }

    // 10 XP per minute studied (1/6 XP per second)
    const baseTimeXp = Math.floor(totalSec / 6);

    // Section completion bonuses (+250 XP deduplicated per section)
    let bonusXp = 0;
    if (state.dailyRecord && state.dailyRecord.completedXpAwarded) {
      Object.keys(state.dailyRecord.completedXpAwarded).forEach(secId => {
        if (state.dailyRecord.completedXpAwarded[secId]) bonusXp += 250;
      });
    }
    if (state.dailyRecord && state.dailyRecord.dailyTargetCelebrated) {
      bonusXp += 1000;
    }

    return baseTimeXp + bonusXp;
  }

  function getStudyLevelInfo(xp) {
    for (let i = STUDY_LEVELS.length - 1; i >= 0; i--) {
      if (xp >= STUDY_LEVELS[i].minXp) {
        return STUDY_LEVELS[i];
      }
    }
    return STUDY_LEVELS[0];
  }

  function getStudyLevelProgress(xp) {
    const curLevel = getStudyLevelInfo(xp);
    const curIndex = STUDY_LEVELS.findIndex(l => l.level === curLevel.level);
    const isMax = curIndex >= STUDY_LEVELS.length - 1;
    const nextLevel = isMax ? null : STUDY_LEVELS[curIndex + 1];

    if (isMax) {
      return {
        current: curLevel,
        next: null,
        percent: 100,
        xpIntoLevel: xp - curLevel.minXp,
        xpForLevel: 0,
        remainingXp: 0,
        isMax: true
      };
    }

    const xpForLevel = nextLevel.minXp - curLevel.minXp;
    const xpIntoLevel = Math.max(0, xp - curLevel.minXp);
    const percent = Math.min(100, Math.floor((xpIntoLevel / xpForLevel) * 100));
    const remainingXp = Math.max(0, nextLevel.minXp - xp);

    return {
      current: curLevel,
      next: nextLevel,
      percent,
      xpIntoLevel,
      xpForLevel,
      remainingXp,
      isMax: false
    };
  }

  function getMasteryCrestSvg(level) {
    switch (level) {
      case 1:
        return `<svg viewBox="0 0 48 48" class="mastery-crest-svg" fill="none"><circle cx="24" cy="24" r="22" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.5" stroke-dasharray="4 2"/><circle cx="24" cy="24" r="18" fill="rgba(14, 165, 233, 0.12)" stroke="#38bdf8" stroke-width="1.2"/><path d="M16 28 C14 20, 22 14, 30 18 C33 22, 29 28, 22 28 C19 28, 17 31, 15 33" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/><circle cx="28" cy="19" r="1.8" fill="#e0f2fe"/><text x="24" y="38" text-anchor="middle" fill="#7dd3fc" font-size="7" font-weight="700" letter-spacing="1">初心</text></svg>`;
      case 2:
        return `<svg viewBox="0 0 48 48" class="mastery-crest-svg" fill="none"><circle cx="24" cy="24" r="22" stroke="rgba(45, 212, 191, 0.45)" stroke-width="1.5"/><circle cx="24" cy="24" r="18" fill="rgba(20, 184, 166, 0.14)" stroke="#2dd4bf" stroke-width="1.2"/><path d="M24 10 C32 10, 36 17, 34 24 C32 31, 25 35, 18 32 C12 29, 13 20, 20 18 C25 17, 27 22, 24 25" stroke="#2dd4bf" stroke-width="1.8" stroke-linecap="round"/><circle cx="24" cy="24" r="2.5" fill="#99f6e4"/><text x="24" y="38" text-anchor="middle" fill="#5eead4" font-size="7" font-weight="700" letter-spacing="1">求道</text></svg>`;
      case 3:
        return `<svg viewBox="0 0 48 48" class="mastery-crest-svg" fill="none"><circle cx="24" cy="24" r="22" stroke="rgba(96, 165, 250, 0.5)" stroke-width="1.5" stroke-dasharray="6 3"/><circle cx="24" cy="24" r="18" fill="rgba(59, 130, 246, 0.16)" stroke="#60a5fa" stroke-width="1.4"/><path d="M14 26 C17 17, 24 16, 27 21 C30 26, 35 24, 35 17" stroke="#60a5fa" stroke-width="2.2" stroke-linecap="round"/><path d="M13 20 C18 13, 27 12, 31 16" stroke="#93c5fd" stroke-width="1.4" stroke-linecap="round"/><circle cx="34" cy="18" r="2.2" fill="#dbeafe"/><text x="24" y="38" text-anchor="middle" fill="#93c5fd" font-size="7" font-weight="700" letter-spacing="1">昇流</text></svg>`;
      case 4:
        return `<svg viewBox="0 0 48 48" class="mastery-crest-svg" fill="none"><circle cx="24" cy="24" r="22" stroke="rgba(251, 191, 36, 0.6)" stroke-width="1.5"/><circle cx="24" cy="24" r="18" fill="rgba(245, 158, 11, 0.18)" stroke="#fbbf24" stroke-width="1.5"/><path d="M26 10 L17 24 L24 24 L20 36 L31 21 L24 21 Z" fill="rgba(254, 240, 138, 0.4)" stroke="#fde047" stroke-width="1.6" stroke-linejoin="round"/><circle cx="24" cy="24" r="2" fill="#fffbeb"/><text x="24" y="39" text-anchor="middle" fill="#fef08a" font-size="7" font-weight="700" letter-spacing="1">翔天</text></svg>`;
      case 5:
        return `<svg viewBox="0 0 48 48" class="mastery-crest-svg" fill="none"><circle cx="24" cy="24" r="22" stroke="rgba(192, 132, 252, 0.6)" stroke-width="1.5" stroke-dasharray="4 2"/><circle cx="24" cy="24" r="18" fill="rgba(168, 85, 247, 0.2)" stroke="#c084fc" stroke-width="1.5"/><path d="M14 14 L34 14 M17 14 L17 31 M31 14 L31 31 M13 18 L35 18" stroke="#e9d5ff" stroke-width="2" stroke-linecap="round"/><path d="M21 28 C23 23, 27 21, 27 15" stroke="#f472b6" stroke-width="2" stroke-linecap="round"/><circle cx="27" cy="15" r="2.2" fill="#fdf4ff"/><text x="24" y="39" text-anchor="middle" fill="#f0abfc" font-size="7" font-weight="700" letter-spacing="1">登竜</text></svg>`;
      case 6:
      default:
        return `<svg viewBox="0 0 48 48" class="mastery-crest-svg" fill="none"><circle cx="24" cy="24" r="22" stroke="rgba(253, 224, 71, 0.75)" stroke-width="1.8"/><circle cx="24" cy="24" r="18" fill="rgba(251, 191, 36, 0.25)" stroke="#fde047" stroke-width="1.8"/><path d="M14 26 L17 16 L24 21 L31 16 L34 26 Z" fill="rgba(254, 240, 138, 0.35)" stroke="#fef08a" stroke-width="1.6" stroke-linejoin="round"/><circle cx="24" cy="14" r="2.6" fill="#ffffff" stroke="#fbbf24" stroke-width="1"/><circle cx="17" cy="14" r="1.6" fill="#fef08a"/><circle cx="31" cy="14" r="1.6" fill="#fef08a"/><text x="24" y="39" text-anchor="middle" fill="#fef08a" font-size="7" font-weight="700" letter-spacing="1">天龍</text></svg>`;
    }
  }

  function getMilestoneBadgeSvg(id) {
    switch (id) {
      case 'first-steps':
        return `<svg viewBox="0 0 36 36" class="milestone-badge-svg" fill="none"><circle cx="18" cy="18" r="16" fill="rgba(244, 114, 182, 0.14)" stroke="rgba(244, 114, 182, 0.5)" stroke-width="1.2"/><path d="M18 10 C19 14, 23 15, 23 18 C23 21, 19 23, 18 26 C17 23, 13 21, 13 18 C13 15, 17 14, 18 10 Z" fill="rgba(244, 114, 182, 0.4)" stroke="#f472b6" stroke-width="1.2"/><circle cx="18" cy="18" r="2" fill="#fff"/></svg>`;
      case 'river-drake':
        return `<svg viewBox="0 0 36 36" class="milestone-badge-svg" fill="none"><circle cx="18" cy="18" r="16" fill="rgba(56, 189, 248, 0.14)" stroke="rgba(56, 189, 248, 0.5)" stroke-width="1.2"/><path d="M10 21 C14 13, 20 14, 22 18 C24 22, 27 20, 27 15" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/><circle cx="26" cy="15" r="2" fill="#e0f2fe"/></svg>`;
      case 'dragon-gate':
        return `<svg viewBox="0 0 36 36" class="milestone-badge-svg" fill="none"><circle cx="18" cy="18" r="16" fill="rgba(192, 132, 252, 0.16)" stroke="rgba(192, 132, 252, 0.5)" stroke-width="1.2"/><path d="M12 25 L18 11 L24 25 M14 20 L22 20" stroke="#c084fc" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="11" r="2.2" fill="#fdf4ff"/></svg>`;
      case 'daily-master':
        return `<svg viewBox="0 0 36 36" class="milestone-badge-svg" fill="none"><circle cx="18" cy="18" r="16" fill="rgba(251, 191, 36, 0.16)" stroke="rgba(251, 191, 36, 0.55)" stroke-width="1.2"/><path d="M18 8 L20 14 L26 14 L21 18 L23 24 L18 20 L13 24 L15 18 L10 14 L16 14 Z" fill="rgba(254, 240, 138, 0.35)" stroke="#fbbf24" stroke-width="1.2"/><circle cx="18" cy="18" r="2.2" fill="#fffbeb"/></svg>`;
      case 'grand-scholar':
        return `<svg viewBox="0 0 36 36" class="milestone-badge-svg" fill="none"><circle cx="18" cy="18" r="16" fill="rgba(249, 115, 22, 0.15)" stroke="rgba(249, 115, 22, 0.55)" stroke-width="1.2"/><path d="M10 13 L26 13 M13 13 L13 25 M23 13 L23 25 M9 16 L27 16" stroke="#fb923c" stroke-width="1.8" stroke-linecap="round"/><circle cx="18" cy="19" r="2.4" fill="#ffedd5"/></svg>`;
      default:
        return `<svg viewBox="0 0 36 36" class="milestone-badge-svg" fill="none"><circle cx="18" cy="18" r="16" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.3)" stroke-width="1.2"/><circle cx="18" cy="18" r="3" fill="#fff"/></svg>`;
    }
  }

  function renderXpBadge() {
    const totalXp = getCalculatedStudyXp();
    const lvlInfo = getStudyLevelInfo(totalXp);

    const lvlEl = document.getElementById('header-xp-level');
    if (lvlEl) lvlEl.textContent = `Lv. ${lvlInfo.level} ${lvlInfo.title}`;

    const ptsEl = document.getElementById('header-xp-pts');
    if (ptsEl) ptsEl.textContent = `${totalXp.toLocaleString()} XP`;
  }

  const MILESTONE_BADGES = [
    {
      id: 'first-steps',
      title: 'First Steps',
      kanji: '初歩',
      category: 'Daily Habit',
      desc: 'Study for at least 15 minutes today',
      isUnlocked: () => getTotalStudiedSeconds() >= 15 * 60,
      getProgressText: () => `${Math.min(15, Math.floor(getTotalStudiedSeconds() / 60))}m / 15m`
    },
    {
      id: 'river-drake',
      title: 'River Ascendant',
      kanji: '集注',
      category: 'Deep Focus',
      desc: 'Reach 30m continuous focus in any single study block',
      isUnlocked: () => {
        if (!appState.dailyRecord || !appState.dailyRecord.sections) return false;
        return Object.values(appState.dailyRecord.sections).some(s => (s.timerSeconds + s.manualAdjustmentSeconds) >= 1800);
      },
      getProgressText: () => {
        const maxSec = Math.max(0, ...Object.values(appState.dailyRecord?.sections || {}).map(s => (s.timerSeconds || 0) + (s.manualAdjustmentSeconds || 0)));
        return `${Math.min(30, Math.floor(maxSec / 60))}m / 30m`;
      }
    },
    {
      id: 'dragon-gate',
      title: 'Dragon Gate Leaper',
      kanji: '突破',
      category: 'Endurance',
      desc: 'Maintain 60m of deep focus in any section to leap the gate',
      isUnlocked: () => {
        if (!appState.dailyRecord || !appState.dailyRecord.sections) return false;
        return Object.values(appState.dailyRecord.sections).some(s => (s.timerSeconds + s.manualAdjustmentSeconds) >= 3600);
      },
      getProgressText: () => {
        const maxSec = Math.max(0, ...Object.values(appState.dailyRecord?.sections || {}).map(s => (s.timerSeconds || 0) + (s.manualAdjustmentSeconds || 0)));
        return `${Math.min(60, Math.floor(maxSec / 60))}m / 60m`;
      }
    },
    {
      id: 'daily-master',
      title: 'Daily Master',
      kanji: '極意',
      category: 'Goal Mastery',
      desc: 'Complete the entire 5-hour studio target in a single day',
      isUnlocked: () => getTotalStudiedSeconds() >= TOTAL_TARGET_SECONDS,
      getProgressText: () => `${formatMinutesOnly(getTotalStudiedSeconds())} / 5h 00m`
    },
    {
      id: 'grand-scholar',
      title: 'Grand Scholar',
      kanji: '皆伝',
      category: 'Perfection',
      desc: 'Complete all 5 study blocks today (Vocabulary, Grammar, Listening, Reading, Tasks)',
      isUnlocked: () => {
        if (!appState.dailyRecord || !appState.dailyRecord.sections) return false;
        return SECTIONS_CONFIG.every(sec => {
          const s = appState.dailyRecord.sections[sec.id];
          return s && (s.isUserCompleted || (s.timerSeconds + s.manualAdjustmentSeconds >= sec.targetSeconds));
        });
      },
      getProgressText: () => {
        const completedCount = SECTIONS_CONFIG.filter(sec => {
          const s = appState.dailyRecord?.sections?.[sec.id];
          return s && (s.isUserCompleted || (s.timerSeconds + s.manualAdjustmentSeconds >= sec.targetSeconds));
        }).length;
        return `${completedCount} / 5 blocks`;
      }
    }
  ];

  function renderBadgesModal() {
    const totalXp = getCalculatedStudyXp();
    const prog = getStudyLevelProgress(totalXp);
    const totalStudiedSec = getTotalStudiedSeconds();

    // 1. Render Hero Spotlight
    const heroSpotlight = document.getElementById('mastery-hero-spotlight');
    if (heroSpotlight) {
      const nextRankHtml = prog.isMax ? `
        <div class="hero-progress-info">
          <span class="hero-progress-label">Celestial Pinnacle</span>
          <span class="hero-progress-value monospace">Max Tier Achieved</span>
        </div>
        <div class="mastery-progress-track">
          <div class="mastery-progress-bar" style="width: 100%;"></div>
        </div>
        <p class="hero-progress-sub">You have mastered all celestial tiers in the studio.</p>
      ` : `
        <div class="hero-progress-info">
          <span class="hero-progress-label">Progress to Lv. ${prog.next.level} ${prog.next.title}</span>
          <span class="hero-progress-value monospace">${totalXp.toLocaleString()} / ${prog.next.minXp.toLocaleString()} XP (${prog.percent}%)</span>
        </div>
        <div class="mastery-progress-track">
          <div class="mastery-progress-bar" style="width: ${prog.percent}%;"></div>
        </div>
        <p class="hero-progress-sub"><strong>${prog.remainingXp.toLocaleString()} XP</strong> remaining until next rank evolution</p>
      `;

      heroSpotlight.innerHTML = `
        <div class="hero-spotlight-top">
          <div class="hero-crest-avatar tier-${prog.current.level}">
            ${getMasteryCrestSvg(prog.current.level)}
          </div>
          <div class="hero-details">
            <div class="hero-badge-chips">
              <span class="hero-tier-chip">${prog.current.tag}</span>
              <span class="hero-kanji-chip">${prog.current.kanji}</span>
            </div>
            <h3 class="hero-rank-title">Lv. ${prog.current.level} ${prog.current.title}</h3>
            <p class="hero-rank-desc">${prog.current.desc}</p>
            <div class="hero-stats-row">
              <span class="hero-stat-pill"><strong>${totalXp.toLocaleString()}</strong> Total XP</span>
              <span class="hero-stat-pill"><strong>${formatMinutesOnly(totalStudiedSec)}</strong> Studied Today</span>
            </div>
          </div>
        </div>
        <div class="hero-spotlight-bottom">
          ${nextRankHtml}
        </div>
      `;
    }

    // 2. Render Mastery Rank Ladder (Leaderboard)
    const ranksContainer = document.getElementById('mastery-ranks-container');
    if (ranksContainer) {
      ranksContainer.innerHTML = STUDY_LEVELS.map(lvl => {
        const isCurrent = lvl.level === prog.current.level;
        const isUnlocked = totalXp >= lvl.minXp;
        let statusBadge = '';
        if (isCurrent) {
          statusBadge = `<span class="rank-status-pill current">Current Rank ★</span>`;
        } else if (isUnlocked) {
          statusBadge = `<span class="rank-status-pill unlocked">Reached ✓</span>`;
        } else {
          statusBadge = `<span class="rank-status-pill locked">${lvl.minXp.toLocaleString()} XP</span>`;
        }

        return `
          <div class="mastery-tier-card tier-${lvl.level} ${isCurrent ? 'is-current' : (isUnlocked ? 'is-unlocked' : 'is-locked')}">
            <div class="tier-card-left">
              <div class="tier-crest-wrap">
                ${getMasteryCrestSvg(lvl.level)}
              </div>
              <div class="tier-info-wrap">
                <div class="tier-header-line">
                  <span class="tier-tag">${lvl.tag}</span>
                  <span class="tier-kanji">${lvl.kanji}</span>
                  <h4 class="tier-title">Lv. ${lvl.level} ${lvl.title}</h4>
                </div>
                <p class="tier-desc">${lvl.desc}</p>
              </div>
            </div>
            <div class="tier-card-right">
              <span class="tier-xp-threshold monospace">${lvl.minXp.toLocaleString()} XP</span>
              ${statusBadge}
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Render Daily Milestone Badges
    const gridContainer = document.getElementById('badges-grid-container');
    if (gridContainer) {
      gridContainer.innerHTML = MILESTONE_BADGES.map(b => {
        const unlocked = b.isUnlocked();
        const progressText = typeof b.getProgressText === 'function' ? b.getProgressText() : '';
        return `
          <div class="badge-card-item ${unlocked ? 'is-unlocked' : 'is-locked'}">
            <div class="badge-icon-wrap">
              ${getMilestoneBadgeSvg(b.id)}
            </div>
            <div class="badge-info-wrap">
              <div class="badge-card-header">
                <span class="badge-category-tag">${b.category || 'Study Merit'}</span>
                <span class="badge-kanji-tag">${b.kanji || ''}</span>
              </div>
              <h4>${b.title}</h4>
              <p>${b.desc}</p>
              <div class="badge-card-bottom">
                ${progressText ? `<span class="badge-progress-stat monospace">${progressText}</span>` : ''}
                <span class="badge-status-pill ${unlocked ? 'unlocked' : 'locked'}">
                  ${unlocked ? 'Unlocked ✓' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  let celebrationTimeout = null;
  function showCelebrationToast(title, msg, icon = '') {
    const toast = document.getElementById('celebration-toast');
    if (!toast) return;

    const titleEl = document.getElementById('celebration-toast-title');
    const msgEl = document.getElementById('celebration-toast-msg');
    const iconEl = document.getElementById('celebration-toast-icon');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = msg;
    if (icon && iconEl && typeof icon === 'string' && icon.startsWith('<svg')) {
      iconEl.innerHTML = icon;
    }

    toast.classList.remove('hidden');
    announceAria(`${title} - ${msg}`);

    if (celebrationTimeout) clearTimeout(celebrationTimeout);
    celebrationTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 4500);
  }

  function renderActiveFocusBar() {
    const barEl = document.getElementById('active-focus-bar');
    if (!barEl) return;

    // Show if there is an active running section OR an expanded focused section
    const currentSectionId = appState.activeSectionId || expandedSectionId;
    if (!currentSectionId) {
      barEl.classList.add('hidden');
      return;
    }

    const cfg = SECTIONS_CONFIG.find(s => s.id === currentSectionId);
    if (!cfg) {
      barEl.classList.add('hidden');
      return;
    }

    const isRunning = appState.activeSectionId === currentSectionId;

    barEl.classList.remove('hidden');
    barEl.classList.toggle('is-paused', !isRunning);
    barEl.setAttribute('data-section', cfg.id);
    const themeName = window.ELEMENTAL_DATA && window.ELEMENTAL_DATA[cfg.id] ? window.ELEMENTAL_DATA[cfg.id].element : 'spirit';
    barEl.setAttribute('data-theme', themeName);
    barEl.style.setProperty('--bar-theme-color', cfg.themeColor);

    const nameEl = document.getElementById('focus-section-name');
    if (nameEl) nameEl.textContent = `${cfg.title} (${cfg.kanji})`;

    const timerEl = document.getElementById('focus-timer-readout');
    if (timerEl) {
      const elapsed = getSectionElapsedSeconds(cfg.id);
      timerEl.textContent = formatSecondsToHMS(elapsed);
    }

    const pauseBtn = document.getElementById('btn-focus-pause');
    const playPauseIcon = document.getElementById('focus-playpause-icon');
    const playPauseText = document.getElementById('focus-playpause-text');

    if (pauseBtn) {
      if (isRunning) {
        pauseBtn.classList.remove('is-paused');
        pauseBtn.classList.add('is-running');
        if (playPauseIcon) playPauseIcon.textContent = '⏸';
        if (playPauseText) playPauseText.textContent = 'Pause';
        pauseBtn.setAttribute('aria-label', `Pause ${cfg.title} study timer`);
      } else {
        pauseBtn.classList.add('is-paused');
        pauseBtn.classList.remove('is-running');
        if (playPauseIcon) playPauseIcon.textContent = '▶';
        if (playPauseText) playPauseText.textContent = 'Resume';
        pauseBtn.setAttribute('aria-label', `Start or resume ${cfg.title} study timer`);
      }
    }
  }

  function syncElementalTheme() {
    const focusSectionId = expandedSectionId || appState.activeSectionId || 'vocabulary';
    let targetTheme = 'spirit';
    if (window.ELEMENTAL_DATA && window.ELEMENTAL_DATA[focusSectionId]) {
      targetTheme = window.ELEMENTAL_DATA[focusSectionId].element;
    }

    if (document.body.dataset.theme !== targetTheme) {
      document.body.dataset.theme = targetTheme;
    }

    if (window.elementalAtmosphere && typeof window.elementalAtmosphere.setTheme === 'function') {
      window.elementalAtmosphere.setTheme(targetTheme);
    }
  }


  function renderSectionCards() {
    const container = document.getElementById('cards-container');
    if (!container) return;

    // Render cards HTML if not already created
    if (container.children.length === 0) {
      container.innerHTML = SECTIONS_CONFIG.map(sec => {
        const elData = window.ELEMENTAL_DATA && window.ELEMENTAL_DATA[sec.id] ? window.ELEMENTAL_DATA[sec.id] : null;
        return `
          <article class="pillar-card" id="card-${sec.id}" data-section="${sec.id}" style="--card-fog-color: ${sec.themeColor}1a; --element-glow: ${sec.themeColor};">
            <!-- Atmospheric Fog / Smoky Aura (As seen in Reference Video) -->
            <div class="card-fog-aura"></div>
            <!-- Subtle Radial Spotlight Background -->
            <div class="pillar-ambient-glow" style="background: radial-gradient(circle at 50% 20%, ${sec.themeColor}22, transparent 70%);"></div>

            <!-- Living Light Current (Slow Animated Gradient Stream) -->
            <div class="pillar-light-current" aria-hidden="true"></div>

            <!-- Living Particles: Tiny Bubbles, Drifting Motes & Glowing Plankton -->
            <div class="pillar-particles-container" aria-hidden="true">
              <span class="pillar-bubble pb-1"></span>
              <span class="pillar-bubble pb-2"></span>
              <span class="pillar-bubble pb-3"></span>
              <span class="pillar-mote pm-1"></span>
              <span class="pillar-mote pm-2"></span>
              <span class="pillar-plankton pp-1"></span>
              <span class="pillar-plankton pp-2"></span>
              <span class="pillar-plankton pp-3"></span>
            </div>

            <!-- Animated Bottom Waterline Wave -->
            <div class="pillar-bottom-waterline" aria-hidden="true">
              <svg viewBox="0 0 120 28" class="pillar-waterline-svg" preserveAspectRatio="none">
                <path class="waterline-wave wave-back" d="M 0 12 C 30 5 60 19 90 12 C 105 8 115 15 120 12 L 120 28 L 0 28 Z" fill="var(--card-fog-color, rgba(255,255,255,0.1))" />
                <path class="waterline-wave wave-front" d="M 0 16 C 30 22 60 10 90 16 C 105 19 115 13 120 16 L 120 28 L 0 28 Z" fill="var(--element-glow, rgba(255,255,255,0.2))" opacity="0.38" />
              </svg>
            </div>

            <!-- Dynamic Elemental Martial Arts Backdrop (Expanded Combat Scene from Reference) -->
            <div class="expanded-bender-backdrop" aria-hidden="true">
              ${elData ? elData.expandedScene : ''}
            </div>

            <!-- COLLAPSED PILLAR VIEW (Reference 1 Bending Banner) -->
            <div class="pillar-collapsed-view" title="Click to focus on ${sec.title}">
              <div class="collapsed-top">
                <!-- Circular Crest with Instagram/Story Progress Ring (Note 2) -->
                <div class="story-crest-wrapper" style="--element-glow: ${sec.themeColor};">
                  <svg class="story-ring-svg" viewBox="0 0 100 100" aria-hidden="true">
                    <circle class="story-ring-track" cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="4.5" />
                    <circle class="story-ring-fill" id="story-ring-${sec.id}" cx="50" cy="50" r="45" fill="none" stroke="${sec.themeColor}" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="282.74" stroke-dashoffset="282.74" transform="rotate(-90 50 50)" />
                  </svg>
                  <div class="crest-center-content">
                    ${elData ? elData.crest : `<span class="collapsed-kanji-icon">${sec.kanji}</span>`}
                  </div>
                </div>
              </div>

              <div class="collapsed-center">
                <!-- Playful Martial Arts Shadow Silhouette (Note 6) -->
                <div class="collapsed-figure-container" aria-hidden="true">
                  ${elData ? elData.collapsedFigure : ''}
                </div>
                <span class="collapsed-vertical-title">${sec.title}</span>
              </div>

              <div class="collapsed-bottom">
                <!-- Decorative Elemental Tail Flow (Reference 1) -->
                <div class="collapsed-banner-tail" aria-hidden="true">
                  ${elData ? elData.bannerTail : ''}
                </div>
                <span class="collapsed-indicator">
                  <span class="collapsed-status-dot" id="collapsed-dot-${sec.id}"></span>
                  <span class="collapsed-min-label">${sec.targetSeconds / 60}m</span>
                </span>
              </div>
            </div>

            <!-- EXPANDED SQUARE VIEW (Living Focus Square) -->
            <div class="pillar-expanded-view">
              <!-- Accessible / Test-Preserving Hidden Data Indicators -->
              <div class="sr-only" aria-hidden="true">
                <span class="card-heading">${sec.title}</span>
                <span class="card-element-subtitle">${elData ? `${elData.romaji} • ${elData.martialTitle}` : ''}</span>
                <span class="status-badge badge-idle" id="badge-timer-${sec.id}">Not Started</span>
                <span class="status-badge badge-target-met hidden" id="badge-target-${sec.id}">Target Met ✓</span>
                <span class="status-badge badge-completed hidden" id="badge-completed-${sec.id}">Done ✓</span>
                <svg viewBox="0 0 100 100">
                  <circle id="story-ring-exp-${sec.id}" cx="50" cy="50" r="45" />
                </svg>
                <span id="audit-timer-${sec.id}"></span>
                <span id="audit-adj-${sec.id}"></span>
                <span id="audit-rem-${sec.id}"></span>
              </div>

              <!-- Sleek Floating Hero Timer Readout -->
              <div class="card-time-display element-time-${sec.id}">
                <span class="card-timer-digits monospace" id="timer-digits-${sec.id}">00:00:00</span>
                <span class="card-target-text hidden" id="target-subtext-${sec.id}"></span>
                <span class="card-overtime-label hidden" id="overtime-label-${sec.id}"></span>
              </div>

              <!-- Floating Glassmorphic Center-Bottom Controls Pill -->
              <div class="card-controls-container">
                <div class="card-controls-pill">
                  <button class="btn btn-primary btn-start-toggle" id="btn-toggle-${sec.id}" data-section="${sec.id}">
                    ▶ Start
                  </button>
                  <button class="btn-tools-toggle" data-section="${sec.id}" title="Adjust time & tools" aria-label="Toggle time tools">
                    ⋯
                  </button>
                </div>
                <!-- Smooth Floating Tools Popover (Reveals +5m, -5m, Adj, Done, Reset) -->
                <div class="card-tools-popover hidden" id="tools-popover-${sec.id}">
                  <button class="btn btn-sm btn-subtle" data-action="add5" data-section="${sec.id}" title="Add 5 minutes">+5m</button>
                  <button class="btn btn-sm btn-subtle" data-action="sub5" data-section="${sec.id}" title="Subtract 5 minutes">-5m</button>
                  <button class="btn btn-sm btn-subtle" data-action="custom" data-section="${sec.id}" title="Custom time adjustment">±Adj</button>
                  <button class="btn btn-sm btn-outline" data-action="toggle-complete" data-section="${sec.id}" title="Toggle Complete">✓ Done</button>
                  <button class="btn btn-sm btn-danger-outline" data-action="reset-section" data-section="${sec.id}" title="Reset Section Time">↺</button>
                </div>
              </div>
            </div>
          </article>
        `;
      }).join('');

      attachSectionCardListeners();

      // Initialize Universal Elemental Koi Pond Engine
      if (!window.elementalKoiPond && typeof window.ElementalKoiPond === 'function' && document.getElementById('elemental-koi-canvas')) {
        try {
          window.elementalKoiPond = new window.ElementalKoiPond('elemental-koi-canvas');
          window.spiritKoiPond = window.elementalKoiPond;
          if (typeof window.elementalKoiPond.setEvolutionStage === 'function') {
            window.elementalKoiPond.setEvolutionStage(getCalculatedEvolutionStage(expandedSectionId));
          }
        } catch (e) {
          console.warn('ElementalKoiPond init error:', e);
        }
      }
    }

    // Update real-time values for each card
    SECTIONS_CONFIG.forEach(sec => {
      const cardEl = document.getElementById(`card-${sec.id}`);
      const secData = appState.dailyRecord.sections[sec.id];
      if (!cardEl || !secData) return;

      const elapsed = getSectionElapsedSeconds(sec.id);
      const isActive = appState.activeSectionId === sec.id;
      const isExpanded = expandedSectionId === sec.id;
      const pct = (elapsed / sec.targetSeconds) * 100;
      const targetMet = elapsed >= sec.targetSeconds;
      const isDone = Boolean(secData.isUserCompleted || targetMet);

      // Real-time synchronization with active Elemental Koi Pond & Evolution Stage
      if (sec.id === expandedSectionId && window.elementalKoiPond) {
        if (typeof window.elementalKoiPond.setMode === 'function') {
          window.elementalKoiPond.setMode(isDone ? 'yin-yang' : 'wander');
        }
        if (typeof window.elementalKoiPond.setEvolutionStage === 'function') {
          const currentStage = getCalculatedEvolutionStage(sec.id);
          window.elementalKoiPond.setEvolutionStage(currentStage);
        }
      }

      // Expanded / Collapsed Pillar state

      if (isExpanded) {
        cardEl.classList.add('is-expanded');
      } else {
        cardEl.classList.remove('is-expanded');
      }

      // Active card border glow
      if (isActive) {
        cardEl.classList.add('is-active');
      } else {
        cardEl.classList.remove('is-active');
      }

      // Circular Story-Style Progress Ring around Crest (Note 2)
      const circumference = 282.74;
      const clampedPct = Math.min(100, pct);
      const ringOffset = circumference - (clampedPct / 100) * circumference;

      const ringCol = document.getElementById(`story-ring-${sec.id}`);
      if (ringCol) {
        ringCol.style.strokeDashoffset = ringOffset;
        if (targetMet) ringCol.classList.add('is-target-met');
        else ringCol.classList.remove('is-target-met');
      }

      const ringExp = document.getElementById(`story-ring-exp-${sec.id}`);
      if (ringExp) {
        ringExp.style.strokeDashoffset = ringOffset;
        if (targetMet) ringExp.classList.add('is-target-met');
        else ringExp.classList.remove('is-target-met');
      }

      const colDot = document.getElementById(`collapsed-dot-${sec.id}`);
      if (colDot) {
        if (isActive) {
          colDot.className = 'collapsed-status-dot active';
        } else if (elapsed > 0) {
          colDot.className = 'collapsed-status-dot paused';
        } else {
          colDot.className = 'collapsed-status-dot idle';
        }
      }

      // Digits
      const digitsEl = document.getElementById(`timer-digits-${sec.id}`);
      if (digitsEl) digitsEl.textContent = formatSecondsToHMS(elapsed);

      // Target Subtext & Overtime
      const subtextEl = document.getElementById(`target-subtext-${sec.id}`);
      if (subtextEl) subtextEl.textContent = `/ ${sec.targetSeconds / 60}m (${pct.toFixed(0)}%)`;

      const overtimeEl = document.getElementById(`overtime-label-${sec.id}`);
      if (overtimeEl) {
        if (elapsed > sec.targetSeconds) {
          overtimeEl.classList.remove('hidden');
          const extraSec = elapsed - sec.targetSeconds;
          overtimeEl.textContent = `+${formatSecondsToFriendly(extraSec)} overtime`;
        } else {
          overtimeEl.classList.add('hidden');
        }
      }

      // Progress Fill
      const fillEl = document.getElementById(`progress-fill-${sec.id}`);
      if (fillEl) fillEl.style.width = `${Math.min(100, pct)}%`;

      // Status Badges
      const timerBadge = document.getElementById(`badge-timer-${sec.id}`);
      if (timerBadge) {
        if (isActive) {
          timerBadge.className = 'status-badge badge-active';
          timerBadge.textContent = 'In Progress';
        } else if (elapsed > 0) {
          timerBadge.className = 'status-badge badge-paused';
          timerBadge.textContent = 'Paused';
        } else {
          timerBadge.className = 'status-badge badge-idle';
          timerBadge.textContent = 'Not Started';
        }
      }

      const targetBadge = document.getElementById(`badge-target-${sec.id}`);
      if (targetBadge) {
        if (targetMet) {
          targetBadge.classList.remove('hidden');
        } else {
          targetBadge.classList.add('hidden');
        }
      }

      const completeBadge = document.getElementById(`badge-completed-${sec.id}`);
      if (completeBadge) {
        if (secData.isUserCompleted) {
          completeBadge.classList.remove('hidden');
        } else {
          completeBadge.classList.add('hidden');
        }
      }

      // Primary Button Label
      const toggleBtn = document.getElementById(`btn-toggle-${sec.id}`);
      if (toggleBtn) {
        if (isActive) {
          toggleBtn.textContent = '⏸ Pause';
          toggleBtn.className = 'btn btn-sm btn-primary btn-start-toggle';
        } else {
          toggleBtn.textContent = '▶ Start';
          toggleBtn.className = 'btn btn-sm btn-secondary btn-start-toggle';
        }
      }

      // Time Audit Breakdown
      const auditTimer = document.getElementById(`audit-timer-${sec.id}`);
      if (auditTimer) auditTimer.textContent = `Focus: ${Math.floor(secData.timerSeconds / 60)}m`;

      const auditAdj = document.getElementById(`audit-adj-${sec.id}`);
      if (auditAdj) {
        const sign = secData.manualAdjustmentSeconds >= 0 ? '+' : '';
        auditAdj.textContent = `Adj: ${sign}${Math.round(secData.manualAdjustmentSeconds / 60)}m`;
      }

      const auditRem = document.getElementById(`audit-rem-${sec.id}`);
      if (auditRem) {
        if (elapsed < sec.targetSeconds) {
          auditRem.textContent = `Left: ${Math.ceil((sec.targetSeconds - elapsed) / 60)}m`;
        } else {
          auditRem.textContent = `Target Reached`;
        }
      }
    });

    if (!appState.activeSectionId) {
      const glowEl = document.getElementById('liquid-chrome-glow');
      if (glowEl) glowEl.style.setProperty('--active-theme-glow', 'rgba(255, 255, 255, 0.06)');
    }
  }

  function renderChecklistAndNotes() {
    // Checkboxes
    const checklist = appState.dailyRecord.checklist || {};
    Object.keys(checklist).forEach(key => {
      const chk = document.querySelector(`input[data-key="${key}"]`);
      if (chk) chk.checked = !!checklist[key];
    });

    // Notes
    const notesInput = document.getElementById('study-notes-input');
    if (notesInput && notesInput !== document.activeElement) {
      notesInput.value = appState.dailyRecord.notes || '';
    }

    // Reflection
    const reflectionInput = document.getElementById('study-reflection-input');
    if (reflectionInput && reflectionInput !== document.activeElement) {
      reflectionInput.value = appState.dailyRecord.reflection || '';
    }
  }

  function renderSettingsButtons() {
    // Sound Toggle
    const soundText = document.getElementById('sound-status-text');
    const soundIcon = document.getElementById('sound-icon');
    if (soundText && soundIcon) {
      if (appState.settings.soundEnabled) {
        soundText.textContent = 'Sound On';
        soundIcon.textContent = '🔔';
      } else {
        soundText.textContent = 'Muted';
        soundIcon.textContent = '🔕';
      }
    }

    // Notification Toggle
    const notifText = document.getElementById('notif-status-text');
    const notifIcon = document.getElementById('notif-icon');
    if (notifText && notifIcon) {
      if (appState.settings.notificationsEnabled) {
        notifText.textContent = 'Notifs On';
        notifIcon.textContent = '💬';
      } else {
        notifText.textContent = 'Notifs Off';
        notifIcon.textContent = '🔇';
      }
    }

    renderEvolutionButtons();
  }

  function renderEvolutionButtons() {
    const evoButtons = document.querySelectorAll('#evolution-btn-group button');
    if (!evoButtons || evoButtons.length === 0) return;

    const currentMode = appState.evolutionMode || 'auto';
    const currentManualStage = appState.manualEvolutionStage || 1;

    evoButtons.forEach(btn => {
      const stageAttr = btn.dataset.stage;
      if (currentMode === 'auto') {
        if (stageAttr === 'auto') {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      } else {
        if (stageAttr === String(currentManualStage)) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      }
    });
  }

  function openDayBreakdown(dateKey) {
    const overviewEl = document.getElementById('history-overview-view');
    const detailEl = document.getElementById('history-day-detail-view');
    if (!detailEl) return;

    renderDayBreakdown(dateKey);

    if (overviewEl) overviewEl.classList.add('hidden');
    detailEl.classList.remove('hidden');

    const modalBody = document.querySelector('#modal-history .modal-body');
    if (modalBody) modalBody.scrollTop = 0;
  }

  function renderDayBreakdown(dateKey) {
    const allRecords = { ...appState.history };
    allRecords[appState.currentDate] = appState.dailyRecord;
    const rec = allRecords[dateKey];
    if (!rec) return;

    const isToday = dateKey === appState.currentDate;
    
    // Format full date title
    let formattedDate = dateKey;
    try {
      const parts = dateKey.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      formattedDate = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {}

    const titleEl = document.getElementById('day-detail-date-title');
    if (titleEl) titleEl.textContent = formattedDate;

    // Badges
    const badgeGroupEl = document.getElementById('day-detail-badge-group');
    if (badgeGroupEl) {
      badgeGroupEl.innerHTML = isToday ? '<span class="target-badge">Today</span>' : '';
    }

    // Calculate Section Totals
    let dayTotalSec = 0;
    const sectionData = {};
    SECTIONS_CONFIG.forEach(sec => {
      const s = rec.sections && rec.sections[sec.id] ? rec.sections[sec.id] : { timerSeconds: 0, manualAdjustmentSeconds: 0 };
      const timerSec = Math.max(0, s.timerSeconds || 0);
      const adjSec = s.manualAdjustmentSeconds || 0;
      const el = Math.max(0, timerSec + adjSec);
      sectionData[sec.id] = {
        timerSec,
        adjSec,
        totalSec: el,
        cfg: sec,
        pctOfTarget: Math.round((el / sec.targetSeconds) * 100),
        isMet: el >= sec.targetSeconds
      };
      dayTotalSec += el;
    });

    const recordTargetSeconds = getRecordTargetSeconds(rec);
    const isGoalMet = dayTotalSec >= recordTargetSeconds;
    const dayGoalPct = ((dayTotalSec / recordTargetSeconds) * 100).toFixed(0);

    if (badgeGroupEl) {
      badgeGroupEl.innerHTML += isGoalMet
        ? `<span class="status-badge badge-target-met">Goal Met (${dayGoalPct}%)</span>`
        : `<span class="status-badge badge-idle">${dayGoalPct}% of Goal</span>`;
    }

    // Summary Card
    const totalTimeEl = document.getElementById('day-detail-total-time');
    const targetPctEl = document.getElementById('day-detail-target-pct');
    const progressFillEl = document.getElementById('day-detail-progress-fill');
    if (totalTimeEl) totalTimeEl.textContent = formatSecondsToFriendly(dayTotalSec);
    if (targetPctEl) targetPctEl.textContent = `${dayGoalPct}% (${(dayTotalSec / 3600).toFixed(1)}h / ${(recordTargetSeconds / 3600).toFixed(1)}h target)`;
    if (progressFillEl) progressFillEl.style.width = `${Math.min(100, (dayTotalSec / recordTargetSeconds) * 100)}%`;

    // Category Distribution Spectrum Bar & Legend
    const distBarEl = document.getElementById('day-detail-distribution-bar');
    const distLegendEl = document.getElementById('day-detail-dist-legend');
    if (distBarEl) {
      if (dayTotalSec === 0) {
        distBarEl.innerHTML = `<div class="dist-segment" style="width: 100%; background: rgba(255,255,255,0.06);" title="No study recorded"></div>`;
      } else {
        distBarEl.innerHTML = SECTIONS_CONFIG.map(sec => {
          const s = sectionData[sec.id];
          const pct = ((s.totalSec / dayTotalSec) * 100);
          if (pct <= 0) return '';
          return `<div class="dist-segment" style="width: ${pct.toFixed(1)}%; background: ${sec.themeColor};" title="${sec.title}: ${Math.round(s.totalSec / 60)}m (${pct.toFixed(0)}%)"></div>`;
        }).join('');
      }
    }

    if (distLegendEl) {
      distLegendEl.innerHTML = SECTIONS_CONFIG.map(sec => {
        const s = sectionData[sec.id];
        const pct = dayTotalSec > 0 ? Math.round((s.totalSec / dayTotalSec) * 100) : 0;
        return `
          <div class="dist-legend-item">
            <span class="dist-legend-dot" style="background: ${sec.themeColor};"></span>
            <span>${sec.title} (${pct}%)</span>
          </div>
        `;
      }).join('');
    }

    // 5 Category Cards Grid
    const gridEl = document.getElementById('day-detail-subjects-grid');
    if (gridEl) {
      gridEl.innerHTML = SECTIONS_CONFIG.map(sec => {
        const s = sectionData[sec.id];
        const sign = s.adjSec >= 0 ? '+' : '';
        const barPct = Math.min(100, (s.totalSec / sec.targetSeconds) * 100);

        return `
          <div class="day-subject-card ${s.isMet ? 'is-met' : ''}">
            <div class="day-subject-header">
              <div class="day-subject-title-row">
                <span class="day-subject-kanji" style="background: ${sec.themeColor};">${sec.kanji}</span>
                <span class="day-subject-name">${sec.title}</span>
              </div>
              ${s.isMet ? '<span class="status-badge badge-target-met" style="font-size:0.65rem;">✓ Target</span>' : ''}
            </div>
            <div class="day-subject-time monospace">${formatSecondsToFriendly(s.totalSec)}</div>
            <div class="day-subject-target-row">
              <span>Goal: ${Math.round(sec.targetSeconds / 60)}m</span>
              <span>${s.pctOfTarget}%</span>
            </div>
            <div class="day-subject-bar-wrap">
              <div class="day-subject-bar-fill" style="width: ${barPct}%; background: ${sec.themeColor};"></div>
            </div>
            <div class="day-subject-split">
              <span>Timer: ${Math.round(s.timerSec / 60)}m</span>
              <span>Adj: ${sign}${Math.round(s.adjSec / 60)}m</span>
            </div>
          </div>
        `;
      }).join('');
    }

    // Sessions Timeline
    const timelineListEl = document.getElementById('day-detail-timeline-list');
    if (timelineListEl) {
      const sessions = Array.isArray(rec.sessions) ? [...rec.sessions] : [];
      sessions.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));

      if (sessions.length === 0) {
        timelineListEl.innerHTML = `
          <div class="timeline-empty-notice">
            ${dayTotalSec > 0 
              ? `Aggregated study recorded: <strong>${formatSecondsToFriendly(dayTotalSec)}</strong> across categories. Individual interval timestamps are recorded for live sessions.` 
              : 'No study sessions recorded for this day.'}
          </div>
        `;
      } else {
        timelineListEl.innerHTML = sessions.map(sess => {
          const cfg = SECTIONS_CONFIG.find(s => s.id === sess.sectionId) || { title: sess.sectionId, kanji: '', themeColor: '#6366f1' };
          let timeRangeStr = '';
          if (sess.startTime && sess.endTime) {
            const startD = new Date(sess.startTime);
            const endD = new Date(sess.endTime);
            const opts = { hour: '2-digit', minute: '2-digit', hour12: true };
            if (sess.type === 'manual') {
              timeRangeStr = `Adjusted at ${startD.toLocaleTimeString(undefined, opts)}`;
            } else {
              timeRangeStr = `${startD.toLocaleTimeString(undefined, opts)} – ${endD.toLocaleTimeString(undefined, opts)}`;
            }
          }

          const isTimer = sess.type !== 'manual';
          const durStr = sess.durationSeconds ? formatSecondsToFriendly(Math.abs(sess.durationSeconds)) : '0m';

          return `
            <div class="day-timeline-item">
              <div class="timeline-left">
                <span class="timeline-color-dot" style="background: ${cfg.themeColor};"></span>
                <span class="timeline-badge" style="background: ${cfg.themeColor};">${cfg.kanji} ${cfg.title}</span>
                <span class="timeline-type-pill">${isTimer ? 'Live Timer' : 'Manual Adjustment'}</span>
                <span class="timeline-time monospace">${timeRangeStr}</span>
              </div>
              <div class="timeline-duration monospace">${sess.durationSeconds < 0 ? '-' : ''}${durStr}</div>
            </div>
          `;
        }).join('');
      }
    }

    // Study Notes & Reflection
    const notesTextEl = document.getElementById('day-detail-notes-text');
    const reflectionTextEl = document.getElementById('day-detail-reflection-text');
    if (notesTextEl) notesTextEl.textContent = rec.notes || 'No study notes recorded for this date.';
    if (reflectionTextEl) reflectionTextEl.textContent = rec.reflection || 'No reflection recorded for this date.';

    // Checklist Chips
    const checklistChipsEl = document.getElementById('day-detail-checklist-chips');
    if (checklistChipsEl) {
      const items = [
        { key: 'vocabWords', label: 'Vocab Words', kanji: '語彙' },
        { key: 'kanjiReadings', label: 'Kanji Readings', kanji: '漢字' },
        { key: 'grammarPoints', label: 'Grammar Points', kanji: '文法' },
        { key: 'listeningAudio', label: 'Listening Audio', kanji: '聴解' },
        { key: 'readingPassages', label: 'Reading Passages', kanji: '読解' }
      ];

      const cl = rec.checklist || {};
      checklistChipsEl.innerHTML = items.map(item => {
        const checked = !!cl[item.key];
        return `
          <div class="checklist-chip ${checked ? 'is-checked' : ''}">
            <span>${checked ? '✓' : '○'}</span>
            <span>${item.kanji} ${item.label}</span>
          </div>
        `;
      }).join('');
    }
  }

  function renderHistoryModal() {
    const tableBody = document.getElementById('history-table-body');
    const chartContainer = document.getElementById('history-chart-container');
    if (!tableBody || !chartContainer) return;

    // Gather all records (today + history)
    const allRecords = { ...appState.history };
    allRecords[appState.currentDate] = appState.dailyRecord;

    const dates = Object.keys(allRecords).sort().reverse();

    // 1. Calculate Lifetime All-Time Stats across all history + today
    let lifetimeTotalSeconds = 0;
    let lifetimeActiveDays = 0;
    let lifetimeGoalsMet = 0;

    dates.forEach(dKey => {
      const rec = allRecords[dKey];
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
        lifetimeActiveDays++;
        lifetimeTotalSeconds += daySec;
        if (daySec >= getRecordTargetSeconds(rec)) {
          lifetimeGoalsMet++;
        }
      }
    });

    // Consecutive study streak calculation
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
          // If today has 0 seconds so far, check if streak continued through yesterday
          if (checkDate.getTime() === today.getTime()) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
          break;
        }
      }
    }

    const lifetimeAvgSec = lifetimeActiveDays > 0 ? Math.round(lifetimeTotalSeconds / lifetimeActiveDays) : 0;
    const goalsPct = lifetimeActiveDays > 0 ? Math.round((lifetimeGoalsMet / lifetimeActiveDays) * 100) : 0;

    // Populate Lifetime Banner elements
    const statLifetimeStudyTime = document.getElementById('stat-lifetime-study-time');
    const statLifetimeDays = document.getElementById('stat-lifetime-days');
    const statLifetimeStreakSub = document.getElementById('stat-lifetime-streak-sub');
    const statLifetimeDailyAvg = document.getElementById('stat-lifetime-daily-avg');
    const statLifetimeGoalsMet = document.getElementById('stat-lifetime-goals-met');
    const statLifetimeGoalsPct = document.getElementById('stat-lifetime-goals-pct');

    if (statLifetimeStudyTime) statLifetimeStudyTime.textContent = formatSecondsToFriendly(lifetimeTotalSeconds);
    if (statLifetimeDays) statLifetimeDays.textContent = `${lifetimeActiveDays} Day${lifetimeActiveDays === 1 ? '' : 's'}`;
    if (statLifetimeStreakSub) statLifetimeStreakSub.textContent = `${currentStreak}-Day Active Streak`;
    if (statLifetimeDailyAvg) statLifetimeDailyAvg.textContent = formatSecondsToFriendly(lifetimeAvgSec);
    if (statLifetimeGoalsMet) statLifetimeGoalsMet.textContent = `${lifetimeGoalsMet} / ${lifetimeActiveDays}`;
    if (statLifetimeGoalsPct) statLifetimeGoalsPct.textContent = `${goalsPct}% Success Rate`;

    // Sync all-time study pill in hero
    const allTimeHeroEl = document.getElementById('all-time-studied-display');
    if (allTimeHeroEl) allTimeHeroEl.textContent = formatSecondsToFriendly(lifetimeTotalSeconds);

    // 2. Render Table
    if (dates.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 24px;">No study records logged yet.</td></tr>`;
    } else {
      tableBody.innerHTML = dates.map(dateKey => {
        const rec = allRecords[dateKey];
        const isToday = dateKey === appState.currentDate;
        
        let dayTotal = 0;
        const secSummaries = {};
        SECTIONS_CONFIG.forEach(sec => {
          const s = rec.sections && rec.sections[sec.id] ? rec.sections[sec.id] : { timerSeconds: 0, manualAdjustmentSeconds: 0 };
          const el = Math.max(0, s.timerSeconds + s.manualAdjustmentSeconds);
          secSummaries[sec.id] = el;
          dayTotal += el;
        });

        const recordTargetSeconds = getRecordTargetSeconds(rec);
        const goalMet = dayTotal >= recordTargetSeconds;
        const goalBadge = goalMet 
          ? `<span class="status-badge badge-target-met">Met (${((dayTotal / recordTargetSeconds) * 100).toFixed(0)}%)</span>`
          : `<span class="status-badge badge-idle">${((dayTotal / recordTargetSeconds) * 100).toFixed(0)}%</span>`;

        return `
          <tr data-date="${dateKey}" tabindex="0" role="button" aria-label="View breakdown for ${dateKey}">
            <td><strong>${dateKey}</strong> ${isToday ? '<span class="target-badge">Today</span>' : ''}</td>
            <td class="monospace">${formatSecondsToFriendly(dayTotal)}</td>
            <td>${goalBadge}</td>
            <td class="monospace">${Math.round(secSummaries['vocabulary'] / 60)}m</td>
            <td class="monospace">${Math.round(secSummaries['kanji'] / 60)}m</td>
            <td class="monospace">${Math.round(secSummaries['grammar'] / 60)}m</td>
            <td class="monospace">${Math.round(secSummaries['listening'] / 60)}m</td>
            <td class="monospace">${Math.round(secSummaries['reading'] / 60)}m</td>
            <td style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${rec.notes || rec.reflection || ''}">
              ${rec.notes || rec.reflection || '<span style="color: var(--text-muted);">-</span>'}
            </td>
            <td>
              <button class="history-row-btn" data-date="${dateKey}" type="button" title="View ${dateKey} breakdown">Details &rarr;</button>
            </td>
          </tr>
        `;
      }).join('');

      // Attach row click and keyboard events
      tableBody.querySelectorAll('tr[data-date]').forEach(row => {
        const dKey = row.dataset.date;
        row.addEventListener('click', () => openDayBreakdown(dKey));
        row.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openDayBreakdown(dKey);
          }
        });
      });
    }

    // 3. Render 7-Day Chart (last 7 calendar dates)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(getLocalDateKey(d));
    }

    chartContainer.innerHTML = last7Days.map(dateKey => {
      const rec = allRecords[dateKey];
      let daySec = 0;
      if (rec && rec.sections) {
        SECTIONS_CONFIG.forEach(s => {
          const secObj = rec.sections[s.id];
          if (secObj) {
            daySec += Math.max(0, secObj.timerSeconds + secObj.manualAdjustmentSeconds);
          }
        });
      }

      const recordTargetSeconds = getRecordTargetSeconds(rec);
      const pctOfGoal = Math.min(100, (daySec / recordTargetSeconds) * 100);
      const isTargetMet = daySec >= recordTargetSeconds;
      const hrs = (daySec / 3600).toFixed(1);

      return `
        <div class="chart-bar-col" data-date="${dateKey}" tabindex="0" role="button" aria-label="View breakdown for ${dateKey}">
          <span class="chart-bar-val">${hrs}h</span>
          <div class="chart-bar-fill ${isTargetMet ? 'target-met' : ''}" style="height: ${Math.max(4, pctOfGoal)}%;" title="${dateKey}: ${formatSecondsToFriendly(daySec)} (Click to view breakdown)"></div>
          <span class="chart-bar-label">${formatShortDate(dateKey)}</span>
        </div>
      `;
    }).join('');

    // Attach chart click events
    chartContainer.querySelectorAll('.chart-bar-col').forEach(col => {
      const dKey = col.dataset.date;
      col.addEventListener('click', () => openDayBreakdown(dKey));
      col.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDayBreakdown(dKey);
        }
      });
    });
  }

  function renderAll() {
    renderHero();
    renderActiveFocusBar();
    renderSectionCards();
    renderChecklistAndNotes();
    renderSettingsButtons();
    syncElementalTheme();
    renderXpBadge();
  }

  // ==========================================================================
  // EVENT LISTENERS & MODAL MANAGEMENT
  // ==========================================================================

  function showPopToast(targetBtn, text) {
    if (!targetBtn) return;
    const existing = targetBtn.querySelector('.feedback-pop-toast');
    if (existing) existing.remove();
    const toast = document.createElement('span');
    toast.className = 'feedback-pop-toast';
    toast.textContent = text;
    targetBtn.style.position = 'relative';
    targetBtn.appendChild(toast);
    setTimeout(() => toast.remove(), 850);
  }

  function attachSectionCardListeners() {
    const container = document.getElementById('cards-container');
    if (!container) return;

    // Dynamic Mouse-Tracking Spotlight (Linear / Aceternity Style)
    container.addEventListener('mousemove', e => {
      const cards = container.querySelectorAll('.pillar-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });

    // Fluid pointer ripple spreading on hover and interaction
    const pillarCards = container.querySelectorAll('.pillar-card');
    pillarCards.forEach(card => {
      const spawnRipple = (e) => {
        const rect = card.getBoundingClientRect();
        const x = (typeof e.clientX === 'number' && e.clientX ? e.clientX : (rect.left + rect.width / 2)) - rect.left;
        const y = (typeof e.clientY === 'number' && e.clientY ? e.clientY : (rect.top + rect.height / 2)) - rect.top;

        const ripple = document.createElement('span');
        ripple.className = 'pillar-pointer-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        card.appendChild(ripple);

        ripple.addEventListener('animationend', () => {
          ripple.remove();
        });
      };

      card.addEventListener('pointerenter', spawnRipple);
      card.addEventListener('pointerdown', spawnRipple);
    });

    container.addEventListener('click', e => {
      const card = e.target.closest('.pillar-card');
      if (!card) return;

      const cardSectionId = card.dataset.section;

      // 1. If clicking ANY part of a collapsed pillar, ONLY expand and switch ponds!
      // Never start or pause timers when switching between ponds.
      if (cardSectionId && cardSectionId !== expandedSectionId) {
        expandedSectionId = cardSectionId;
        renderSectionCards();
        syncElementalTheme();
        renderActiveFocusBar();
        setPondSwitchingCooldown();

        // Let the live fish pond follow the card's eased transition into focus.
        if (window.elementalKoiPond && typeof window.elementalKoiPond.jumpToPond === 'function') {
          const elData = window.ELEMENTAL_DATA && window.ELEMENTAL_DATA[cardSectionId] ? window.ELEMENTAL_DATA[cardSectionId] : null;
          window.elementalKoiPond.jumpToPond(cardSectionId, elData ? elData.element : null);
          if (typeof window.elementalKoiPond.setEvolutionStage === 'function') {
            window.elementalKoiPond.setEvolutionStage(getCalculatedEvolutionStage(cardSectionId));
          }
        }
        return;
      }

      // 2. If pond is currently transitioning/settling, block start/pause clicks until loaded
      const button = e.target.closest('button');
      if (isPondTransitioning && button && button.classList.contains('btn-start-toggle')) {
        return;
      }

      // 3. Handle buttons within the already expanded card
      if (button) {
        const sectionId = button.dataset.section || cardSectionId;
        const action = button.dataset.action;

        if (button.classList.contains('btn-tools-toggle')) {
          const pop = document.getElementById(`tools-popover-${sectionId}`);
          if (pop) pop.classList.toggle('hidden');
          return;
        }

        if (button.classList.contains('btn-start-toggle')) {
          toggleSectionTimer(sectionId);
        } else if (action === 'add5') {
          showPopToast(button, '+5m');
          adjustSectionTime(sectionId, 5 * 60);
        } else if (action === 'sub5') {
          showPopToast(button, '-5m');
          adjustSectionTime(sectionId, -5 * 60);
        } else if (action === 'custom') {
          openCustomAdjustModal(sectionId);
        } else if (action === 'toggle-complete') {
          showPopToast(button, '✓ Saved');
          toggleSectionUserCompleted(sectionId);
        } else if (action === 'reset-section') {
          openResetSectionModal(sectionId);
        }

        // Close popover if an action inside was clicked
        if (action && action !== 'add5' && action !== 'sub5') {
          const pop = document.getElementById(`tools-popover-${sectionId}`);
          if (pop) pop.classList.add('hidden');
        }
      }
    });
  }

  function setupGlobalEventListeners() {
    // Header Daily Stats & Quick Settings Dropdown (Note 2 & Note 5)
    const toggleStatsBtn = document.getElementById('btn-toggle-stats');
    const settingsPopover = document.getElementById('quick-settings-popover');
    const statsPanel = document.getElementById('hero-stats-panel');

    if (toggleStatsBtn && settingsPopover) {
      toggleStatsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = settingsPopover.classList.toggle('hidden');
        toggleStatsBtn.classList.toggle('is-open', !isHidden);
        toggleStatsBtn.setAttribute('aria-expanded', (!isHidden).toString());
      });

      document.addEventListener('click', (e) => {
        if (!settingsPopover.contains(e.target) && !toggleStatsBtn.contains(e.target)) {
          settingsPopover.classList.add('hidden');
          toggleStatsBtn.classList.remove('is-open');
          toggleStatsBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    const toggleBreakdownBtn = document.getElementById('btn-toggle-full-breakdown');
    if (toggleBreakdownBtn && statsPanel) {
      toggleBreakdownBtn.addEventListener('click', () => {
        const isCollapsed = statsPanel.classList.toggle('is-collapsed');
        if (!isCollapsed) {
          statsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }

    // Daily Checklist Toggle Drawer
    const toggleChkBtn = document.getElementById('btn-toggle-checklist');
    const chkGridContainer = document.getElementById('checklist-grid-container');
    if (toggleChkBtn && chkGridContainer) {
      toggleChkBtn.addEventListener('click', () => {
        const isCollapsed = chkGridContainer.classList.toggle('is-collapsed');
        toggleChkBtn.classList.toggle('is-open', !isCollapsed);
        toggleChkBtn.setAttribute('aria-expanded', (!isCollapsed).toString());
      });
    }

    // Sound Toggle & Test
    document.getElementById('btn-toggle-sound')?.addEventListener('click', () => {
      appState.settings.soundEnabled = !appState.settings.soundEnabled;
      safeSave(appState);
      renderSettingsButtons();
      announceAria(`Sound chime ${appState.settings.soundEnabled ? 'enabled' : 'muted'}`);
    });

    document.getElementById('btn-test-chime')?.addEventListener('click', () => {
      getAudioContext();
      playHarmonicChime();
      announceAria('Playing test chime');
    });

    // Notifications Toggle
    document.getElementById('btn-toggle-notifications')?.addEventListener('click', async () => {
      if (!('Notification' in window)) {
        alert('Desktop notifications are not supported by your browser.');
        return;
      }

      if (!appState.settings.notificationsEnabled) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          appState.settings.notificationsEnabled = true;
          safeSave(appState);
          renderSettingsButtons();
          sendDesktopNotification('JLPT N4 Study Studio', 'Desktop notifications enabled for timer milestones.');
          announceAria('Desktop notifications enabled.');
        } else {
          alert('Notification permission was denied. You can enable them in your browser site settings.');
        }
      } else {
        appState.settings.notificationsEnabled = false;
        safeSave(appState);
        renderSettingsButtons();
        announceAria('Desktop notifications disabled.');
      }
    });

    // Zen Atmosphere Audio Controls
    if (typeof window !== 'undefined' && window.ZenAudioEngine && !window.zenAudio) {
      window.zenAudio = new window.ZenAudioEngine();
    }

    const btnToggleZen = document.getElementById('btn-toggle-zen-audio');
    const zenAudioIcon = document.getElementById('zen-audio-icon');
    const zenAudioStatus = document.getElementById('zen-audio-status');
    const zenSlider = document.getElementById('zen-volume-slider');

    if (btnToggleZen && window.zenAudio) {
      const updateZenUI = () => {
        const active = window.zenAudio.isAmbientActive && !window.zenAudio.isMuted;
        if (zenAudioIcon) zenAudioIcon.textContent = active ? '🌊' : '🔇';
        if (zenAudioStatus) zenAudioStatus.textContent = active ? 'On' : 'Muted';
        if (zenSlider) zenSlider.value = window.zenAudio.masterVolume;
      };
      updateZenUI();

      btnToggleZen.addEventListener('click', () => {
        window.zenAudio.toggleAmbient();
        updateZenUI();
      });

      if (zenSlider) {
        zenSlider.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          window.zenAudio.setVolume(val);
          updateZenUI();
        });
      }
    }

    // Evolution Preview Buttons (Auto, St. 1, St. 2, St. 3)
    const evoBtnGroup = document.getElementById('evolution-btn-group');
    if (evoBtnGroup) {
      evoBtnGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const stage = btn.dataset.stage;
        if (stage === 'auto') {
          appState.evolutionMode = 'auto';
        } else {
          const stageNum = parseInt(stage, 10);
          if (stageNum >= 1 && stageNum <= 3) {
            appState.evolutionMode = 'manual';
            appState.manualEvolutionStage = stageNum;
          }
        }
        safeSave(appState);
        renderEvolutionButtons();
        if (window.elementalKoiPond && typeof window.elementalKoiPond.setEvolutionStage === 'function') {
          window.elementalKoiPond.setEvolutionStage(getCalculatedEvolutionStage(expandedSectionId));
        }
        announceAria(`Dragon form set to ${stage === 'auto' ? 'Auto' : `Stage ${stage}`}`);
      });
    }

    // Aquarium Effects Selector (Priority 7)
    const effectsSelect = document.getElementById('select-aquarium-effects');
    if (effectsSelect) {
      effectsSelect.value = appState.aquariumEffectsMode || 'full';
      effectsSelect.addEventListener('change', () => {
        appState.aquariumEffectsMode = effectsSelect.value;
        safeSave(appState);
        announceAria(`Aquarium effects set to ${effectsSelect.value}`);
      });
    }

    // Milestone Badges & Leaderboard Modal (Priority 6)
    const openBadges = () => {
      renderBadgesModal();
      document.getElementById('badges-modal')?.classList.remove('hidden');
    };
    document.getElementById('header-xp-badge')?.addEventListener('click', openBadges);
    document.getElementById('btn-open-badges')?.addEventListener('click', openBadges);
    document.getElementById('btn-close-badges-modal')?.addEventListener('click', () => {
      document.getElementById('badges-modal')?.classList.add('hidden');
    });
    document.getElementById('btn-close-badges-ok')?.addEventListener('click', () => {
      document.getElementById('badges-modal')?.classList.add('hidden');
    });

    // Leaderboard & Badges Modal Tab Switching
    const tabBtnRanks = document.getElementById('tab-btn-ranks');
    const tabBtnMilestones = document.getElementById('tab-btn-milestones');
    const tabPaneRanks = document.getElementById('mastery-tab-ranks');
    const tabPaneMilestones = document.getElementById('mastery-tab-milestones');

    tabBtnRanks?.addEventListener('click', () => {
      tabBtnRanks.classList.add('active');
      tabBtnRanks.setAttribute('aria-selected', 'true');
      tabBtnMilestones?.classList.remove('active');
      tabBtnMilestones?.setAttribute('aria-selected', 'false');
      tabPaneRanks?.classList.remove('hidden');
      tabPaneMilestones?.classList.add('hidden');
    });

    tabBtnMilestones?.addEventListener('click', () => {
      tabBtnMilestones.classList.add('active');
      tabBtnMilestones.setAttribute('aria-selected', 'true');
      tabBtnRanks?.classList.remove('active');
      tabBtnRanks?.setAttribute('aria-selected', 'false');
      tabPaneMilestones?.classList.remove('hidden');
      tabPaneRanks?.classList.add('hidden');
    });

    // Creature Inspection Modal (Priority 2 & 4)
    window.addEventListener('creature-clicked', (e) => {
      const detail = e.detail || {};
      const modal = document.getElementById('creature-inspect-modal');
      if (!modal) return;

      const titleEl = document.getElementById('creature-inspect-title');
      const speciesEl = document.getElementById('creature-inspect-species');
      const iconEl = document.getElementById('creature-inspect-icon');
      const emojiEl = document.getElementById('creature-inspect-emoji');
      const stageTag = document.getElementById('creature-inspect-stage-tag');
      const headline = document.getElementById('creature-inspect-stage-headline');
      const desc = document.getElementById('creature-inspect-stage-desc');
      const progressText = document.getElementById('creature-inspect-progress-text');
      const progressBar = document.getElementById('creature-inspect-progress-bar');

      const stage = detail.stage || 1;
      const isYin = detail.type === 'yin';

      if (titleEl) titleEl.textContent = isYin ? 'Tui — Moon Spirit' : 'La — Ocean Dragon';
      if (speciesEl) speciesEl.textContent = stage === 1 ? 'Sacred Novice Koi' : stage === 2 ? 'Ascending River Drake' : 'Celestial Ascended Dragon';
      if (iconEl) iconEl.innerHTML = getMasteryCrestSvg(stage === 1 ? 1 : stage === 2 ? 3 : 6);
      if (emojiEl) emojiEl.innerHTML = getMasteryCrestSvg(stage === 1 ? 1 : stage === 2 ? 4 : 6);

      const activeElapsed = getSectionElapsedSeconds(expandedSectionId);
      const activeMins = Math.floor(activeElapsed / 60);

      if (stage === 1) {
        if (stageTag) stageTag.textContent = 'Stage 1: Novice Koi';
        if (headline) headline.textContent = 'Peaceful River Wanderer';
        if (desc) desc.textContent = 'Swimming gracefully in the dark pond. Reach 30 minutes of focused study in a session to awaken River Drake traits.';
        const pct = Math.min(100, (activeElapsed / 1800) * 100);
        if (progressText) progressText.textContent = `${activeMins}m / 30m (${pct.toFixed(0)}%)`;
        if (progressBar) progressBar.style.width = `${pct}%`;

        document.getElementById('trait-drake-fins')?.classList.add('locked');
        document.getElementById('trait-drake-crest')?.classList.add('locked');
        document.getElementById('trait-dragon-antlers')?.classList.add('locked');
        document.getElementById('trait-dragon-wings')?.classList.add('locked');
      } else if (stage === 2) {
        if (stageTag) stageTag.textContent = 'Stage 2: River Drake';
        if (headline) headline.textContent = 'Swift Current Ascendant';
        if (desc) desc.textContent = 'Body elongated into a serpentine river drake with undulating dorsal crest and chin whiskers. Reach 60 minutes to leap the Dragon Gate!';
        const pct = Math.min(100, Math.max(0, ((activeElapsed - 1800) / 1800) * 100));
        if (progressText) progressText.textContent = `${activeMins}m / 60m (${pct.toFixed(0)}%)`;
        if (progressBar) progressBar.style.width = `${pct}%`;

        const trFins = document.getElementById('trait-drake-fins');
        if (trFins) { trFins.classList.remove('locked'); trFins.classList.add('active'); }
        const trCrest = document.getElementById('trait-drake-crest');
        if (trCrest) { trCrest.classList.remove('locked'); trCrest.classList.add('active'); }
        document.getElementById('trait-dragon-antlers')?.classList.add('locked');
        document.getElementById('trait-dragon-wings')?.classList.add('locked');
      } else {
        if (stageTag) stageTag.textContent = 'Stage 3: Celestial Dragon';
        if (headline) headline.textContent = 'Ascended Mythological Ryu';
        if (desc) desc.textContent = 'Fully leaped the Dragon Gate! Crowned with golden antler horns, tiered imperial wing-fins, and guarding the radiant Harmony Pearl.';
        if (progressText) progressText.textContent = `${activeMins}m / Target Mastered (100%)`;
        if (progressBar) progressBar.style.width = '100%';

        document.querySelectorAll('#creature-inspect-traits-list li').forEach(li => {
          li.classList.remove('locked');
          li.classList.add('active');
        });
      }

      modal.classList.remove('hidden');
      announceAria(`Opened creature sanctuary for ${isYin ? 'Tui' : 'La'}`);
    });

    document.getElementById('btn-close-inspect-modal')?.addEventListener('click', () => {
      document.getElementById('creature-inspect-modal')?.classList.add('hidden');
    });
    document.getElementById('btn-close-inspect-ok')?.addEventListener('click', () => {
      document.getElementById('creature-inspect-modal')?.classList.add('hidden');
    });
    document.getElementById('btn-inspect-feed')?.addEventListener('click', () => {
      if (window.elementalKoiPond) {
        const bounds = window.elementalKoiPond.bounds || (typeof window.elementalKoiPond.calculateUsablePondBounds === 'function' ? window.elementalKoiPond.calculateUsablePondBounds() : null);
        const ox = bounds ? (bounds.left + bounds.right) / 2 : (window.elementalKoiPond.orbitCenter?.x || 300);
        const rx = ox + (Math.random() * 80 - 40);
        const topY = bounds ? bounds.top + 28 : 80;
        window.elementalKoiPond.dropFood(rx, topY, 'pellet');
        for (let i = 0; i < 8; i++) {
          window.elementalKoiPond.addParticle(rx, topY, '#fef08a');
        }
      }
      playHarmonicChime();
      showCelebrationToast('Spirit Stardust Released', 'Your celestial fish are swimming towards the nourishment!');
    });

    // Active Focus Bar Actions (Play / Pause toggle - Note 2)
    document.getElementById('btn-focus-pause')?.addEventListener('click', () => {
      const targetId = appState.activeSectionId || expandedSectionId || 'vocabulary';
      toggleSectionTimer(targetId);
    });

    document.getElementById('btn-focus-add5')?.addEventListener('click', () => {
      if (appState.activeSectionId) adjustSectionTime(appState.activeSectionId, 5 * 60);
    });

    document.getElementById('btn-focus-sub5')?.addEventListener('click', () => {
      if (appState.activeSectionId) adjustSectionTime(appState.activeSectionId, -5 * 60);
    });

    document.getElementById('btn-focus-done')?.addEventListener('click', () => {
      if (appState.activeSectionId) toggleSectionUserCompleted(appState.activeSectionId);
    });

    // Checklist changes
    document.getElementById('daily-checklist-items')?.addEventListener('change', e => {
      const chk = e.target;
      const key = chk.dataset.key;
      if (key && appState.dailyRecord.checklist) {
        appState.dailyRecord.checklist[key] = chk.checked;
        safeSave(appState);
      }
    });

    // Notes & Reflection autosave on input
    const notesInput = document.getElementById('study-notes-input');
    if (notesInput) {
      notesInput.addEventListener('input', () => {
        appState.dailyRecord.notes = notesInput.value;
        safeSave(appState);
      });
    }

    const reflectionInput = document.getElementById('study-reflection-input');
    if (reflectionInput) {
      reflectionInput.addEventListener('input', () => {
        appState.dailyRecord.reflection = reflectionInput.value;
        safeSave(appState);
      });
    }

    // Reset Today Modal
    document.getElementById('btn-reset-today')?.addEventListener('click', () => {
      document.getElementById('modal-confirm-reset')?.classList.remove('hidden');
    });

    document.getElementById('btn-close-reset-modal')?.addEventListener('click', () => {
      document.getElementById('modal-confirm-reset')?.classList.add('hidden');
    });

    document.getElementById('btn-cancel-reset')?.addEventListener('click', () => {
      document.getElementById('modal-confirm-reset')?.classList.add('hidden');
    });

    document.getElementById('btn-confirm-reset-today')?.addEventListener('click', () => {
      document.getElementById('modal-confirm-reset')?.classList.add('hidden');
      resetTodaySession();
    });

    // History Modal
    document.getElementById('btn-open-history')?.addEventListener('click', () => {
      document.getElementById('history-day-detail-view')?.classList.add('hidden');
      document.getElementById('history-overview-view')?.classList.remove('hidden');
      renderHistoryModal();
      document.getElementById('modal-history')?.classList.remove('hidden');
    });

    document.getElementById('btn-close-history')?.addEventListener('click', () => {
      document.getElementById('modal-history')?.classList.add('hidden');
    });

    document.getElementById('btn-history-done')?.addEventListener('click', () => {
      document.getElementById('modal-history')?.classList.add('hidden');
    });

    document.getElementById('btn-back-to-history')?.addEventListener('click', () => {
      document.getElementById('history-day-detail-view')?.classList.add('hidden');
      document.getElementById('history-overview-view')?.classList.remove('hidden');
      renderHistoryModal();
    });

    // JSON & CSV Export
    document.getElementById('btn-export-json')?.addEventListener('click', exportJSONBackup);
    document.getElementById('btn-emergency-export')?.addEventListener('click', exportJSONBackup);
    document.getElementById('btn-export-csv')?.addEventListener('click', exportCSVReport);

    // JSON Import Trigger
    document.getElementById('file-import-json')?.addEventListener('change', handleFileImportSelect);

    // Visibility & Focus Reconcile Handlers
    window.addEventListener('focus', reconcile);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        reconcile();
      }
    });

    // Storage retry
    document.getElementById('btn-retry-storage')?.addEventListener('click', () => {
      safeSave(appState);
    });
  }

  // ==========================================================================
  // CUSTOM ADJUSTMENT MODAL
  // ==========================================================================

  let currentAdjustSectionId = null;

  function openCustomAdjustModal(sectionId) {
    currentAdjustSectionId = sectionId;
    const cfg = SECTIONS_CONFIG.find(s => s.id === sectionId);
    const titleEl = document.getElementById('adjust-section-name');
    if (titleEl && cfg) titleEl.textContent = cfg.title;

    const input = document.getElementById('adjust-minutes-input');
    if (input) input.value = '10';

    document.getElementById('modal-adjust-time')?.classList.remove('hidden');
  }

  document.getElementById('btn-close-adjust')?.addEventListener('click', () => {
    document.getElementById('modal-adjust-time')?.classList.add('hidden');
  });
  document.getElementById('btn-cancel-adjust')?.addEventListener('click', () => {
    document.getElementById('modal-adjust-time')?.classList.add('hidden');
  });
  document.getElementById('btn-apply-adjust')?.addEventListener('click', () => {
    const input = document.getElementById('adjust-minutes-input');
    const mins = parseInt(input ? input.value : '0', 10);
    if (!isNaN(mins) && currentAdjustSectionId) {
      adjustSectionTime(currentAdjustSectionId, mins * 60);
    }
    document.getElementById('modal-adjust-time')?.classList.add('hidden');
  });

  // ==========================================================================
  // RESET SECTION MODAL
  // ==========================================================================

  let currentResetSectionId = null;

  function openResetSectionModal(sectionId) {
    currentResetSectionId = sectionId;
    const cfg = SECTIONS_CONFIG.find(s => s.id === sectionId);
    const nameEl = document.getElementById('section-reset-target-name');
    if (nameEl && cfg) nameEl.textContent = cfg.title;

    document.getElementById('modal-confirm-section-reset')?.classList.remove('hidden');
  }

  document.getElementById('btn-close-section-reset')?.addEventListener('click', () => {
    document.getElementById('modal-confirm-section-reset')?.classList.add('hidden');
  });
  document.getElementById('btn-cancel-section-reset')?.addEventListener('click', () => {
    document.getElementById('modal-confirm-section-reset')?.classList.add('hidden');
  });
  document.getElementById('btn-confirm-section-reset')?.addEventListener('click', () => {
    if (currentResetSectionId) resetSectionTime(currentResetSectionId);
    document.getElementById('modal-confirm-section-reset')?.classList.add('hidden');
  });

  // ==========================================================================
  // SESSION INTERRUPTION RECOVERY DIALOG (Point 2 & Amendment)
  // ==========================================================================

  function showInterruptionRecoveryDialog(sectionId, checkpointTime, resumeTime) {
    const modal = document.getElementById('modal-recovery');
    if (!modal) return;

    const cfg = SECTIONS_CONFIG.find(s => s.id === sectionId);
    const nameEl = document.getElementById('recovery-section-name');
    if (nameEl && cfg) nameEl.textContent = cfg.title;

    const checkDate = new Date(checkpointTime);
    const resumeDate = new Date(resumeTime);
    const gapSec = Math.floor((resumeTime - checkpointTime) / 1000);
    const gapMin = Math.round(gapSec / 60);

    document.getElementById('recovery-checkpoint-time').textContent = checkDate.toLocaleTimeString();
    document.getElementById('recovery-current-time').textContent = resumeDate.toLocaleTimeString();
    document.getElementById('recovery-gap-duration').textContent = `${gapMin} min (${formatSecondsToFriendly(gapSec)})`;

    pendingRecoveryData = {
      sectionId,
      checkpointTime,
      resumeTime,
      gapSec
    };

    modal.classList.remove('hidden');
  }

  document.getElementById('btn-confirm-recovery')?.addEventListener('click', () => {
    if (!pendingRecoveryData) {
      document.getElementById('modal-recovery')?.classList.add('hidden');
      return;
    }

    const { sectionId, checkpointTime, resumeTime, gapSec } = pendingRecoveryData;
    const selected = document.querySelector('input[name="recovery-action"]:checked')?.value || 'checkpoint';

    if (selected === 'full') {
      // Credit full wall-clock duration
      const slices = splitIntervalAcrossDays(checkpointTime, resumeTime);
      slices.forEach(slice => {
        if (slice.date === appState.currentDate) {
          appState.dailyRecord.sections[sectionId].timerSeconds += slice.seconds;
        } else {
          if (!appState.history[slice.date]) {
            appState.history[slice.date] = createFreshDailyRecord(slice.date);
          }
          appState.history[slice.date].sections[sectionId].timerSeconds += slice.seconds;
        }
      });
      announceAria(`Credited full ${Math.round(gapSec / 60)} minutes to ${sectionId}`);
    } else if (selected === 'custom') {
      const customMin = parseInt(document.getElementById('recovery-custom-minutes')?.value || '0', 10);
      if (!isNaN(customMin) && customMin > 0) {
        appState.dailyRecord.sections[sectionId].timerSeconds += (customMin * 60);
        announceAria(`Added ${customMin} custom minutes to ${sectionId}`);
      }
    } else {
      // 'checkpoint': Already committed up to checkpointTime, nothing extra added
      announceAria(`Retained verified study time for ${sectionId}`);
    }

    pendingRecoveryData = null;
    document.getElementById('modal-recovery')?.classList.add('hidden');
    safeSave(appState);
    renderAll();
  });

  // ==========================================================================
  // EXPORT & BACKUP SYSTEM (JSON & CSV)
  // ==========================================================================

  function exportJSONBackup() {
    commitActiveSectionTime(Date.now());
    safeSave(appState);

    const exportPayload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      currentDate: appState.currentDate,
      settings: appState.settings,
      dailyRecord: appState.dailyRecord,
      history: appState.history
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jlpt-n4-study-backup-${appState.currentDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    announceAria('Downloaded JSON study backup file.');
  }

  function exportCSVReport() {
    commitActiveSectionTime(Date.now());
    safeSave(appState);

    const allRecords = { ...appState.history };
    allRecords[appState.currentDate] = appState.dailyRecord;

    const dates = Object.keys(allRecords).sort();

    // Headers with transparent distinction between timer time, adjustments, and effective total
    const headers = [
      'Date',
      'Total_Study_Minutes',
      'Target_Goal_Minutes',
      'Goal_Met',
      'Vocab_Timer_Min',
      'Vocab_Adj_Min',
      'Vocab_Total_Min',
      'Kanji_Timer_Min',
      'Kanji_Adj_Min',
      'Kanji_Total_Min',
      'Grammar_Timer_Min',
      'Grammar_Adj_Min',
      'Grammar_Total_Min',
      'Listening_Timer_Min',
      'Listening_Adj_Min',
      'Listening_Total_Min',
      'Reading_Timer_Min',
      'Reading_Adj_Min',
      'Reading_Total_Min',
      'Study_Notes',
      'Daily_Reflection'
    ];

    const rows = [headers.join(',')];

    dates.forEach(dKey => {
      const rec = allRecords[dKey];
      const s = rec.sections || {};

      function getSecCols(id) {
        const sec = s[id] || { timerSeconds: 0, manualAdjustmentSeconds: 0 };
        const timerMin = (sec.timerSeconds / 60).toFixed(1);
        const adjMin = (sec.manualAdjustmentSeconds / 60).toFixed(1);
        const totalMin = (Math.max(0, sec.timerSeconds + sec.manualAdjustmentSeconds) / 60).toFixed(1);
        return [timerMin, adjMin, totalMin];
      }

      let totalDailyMin = 0;
      SECTIONS_CONFIG.forEach(cfg => {
        const sec = s[cfg.id] || { timerSeconds: 0, manualAdjustmentSeconds: 0 };
        totalDailyMin += Math.max(0, sec.timerSeconds + sec.manualAdjustmentSeconds) / 60;
      });

      const goalMet = totalDailyMin >= (TOTAL_TARGET_SECONDS / 60) ? 'YES' : 'NO';
      const cleanNotes = (rec.notes || '').replace(/[\r\n,"]/g, ' ');
      const cleanReflection = (rec.reflection || '').replace(/[\r\n,"]/g, ' ');

      const row = [
        dKey,
        totalDailyMin.toFixed(1),
        (TOTAL_TARGET_SECONDS / 60).toFixed(0),
        goalMet,
        ...getSecCols('vocabulary'),
        ...getSecCols('kanji'),
        ...getSecCols('grammar'),
        ...getSecCols('listening'),
        ...getSecCols('reading'),
        `"${cleanNotes}"`,
        `"${cleanReflection}"`
      ];

      rows.push(row.join(','));
    });

    const csvContent = rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jlpt-n4-study-history-${appState.currentDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    announceAria('Downloaded CSV study report.');
  }

  // ==========================================================================
  // JSON IMPORT ENGINE (Point 5 - Validation, Preview, Safety Snapshot)
  // ==========================================================================

  function handleFileImportSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const text = event.target.result;
        const parsed = JSON.parse(text);

        // Deep Schema Validation
        if (!parsed || parsed.schemaVersion !== 1) {
          throw new Error('Invalid or unsupported schema version in backup file.');
        }

        if (!parsed.dailyRecord && !parsed.history) {
          throw new Error('Backup file contains no study records.');
        }

        // Preview incoming data
        const incomingHistory = parsed.history || {};
        const incomingDates = Object.keys(incomingHistory);
        if (parsed.dailyRecord && parsed.dailyRecord.date && !incomingDates.includes(parsed.dailyRecord.date)) {
          incomingDates.push(parsed.dailyRecord.date);
        }

        incomingDates.sort();

        // Calculate conflicting dates with current storage
        const currentDates = Object.keys(appState.history);
        currentDates.push(appState.currentDate);

        let conflictCount = 0;
        let totalImportSeconds = 0;

        incomingDates.forEach(d => {
          if (currentDates.includes(d)) conflictCount++;
          const rec = incomingHistory[d] || (parsed.dailyRecord && parsed.dailyRecord.date === d ? parsed.dailyRecord : null);
          if (rec && rec.sections) {
            SECTIONS_CONFIG.forEach(cfg => {
              const sec = rec.sections[cfg.id];
              if (sec) totalImportSeconds += Math.max(0, (sec.timerSeconds || 0) + (sec.manualAdjustmentSeconds || 0));
            });
          }
        });

        // Populate Preview Modal
        document.getElementById('import-preview-count').textContent = `${incomingDates.length} days`;
        document.getElementById('import-preview-range').textContent = incomingDates.length > 0 
          ? `${incomingDates[0]} to ${incomingDates[incomingDates.length - 1]}` 
          : 'None';
        document.getElementById('import-preview-hours').textContent = `${(totalImportSeconds / 3600).toFixed(1)} hrs`;
        document.getElementById('import-preview-conflicts').textContent = `${conflictCount} dates`;

        pendingImportData = parsed;
        document.getElementById('modal-import-preview')?.classList.remove('hidden');

      } catch (err) {
        alert(`Failed to import file: ${err.message}`);
      } finally {
        // Reset file input so user can re-select same file if desired
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  document.getElementById('btn-cancel-import')?.addEventListener('click', () => {
    pendingImportData = null;
    document.getElementById('modal-import-preview')?.classList.add('hidden');
  });
  document.getElementById('btn-cancel-import-x')?.addEventListener('click', () => {
    pendingImportData = null;
    document.getElementById('modal-import-preview')?.classList.add('hidden');
  });

  document.getElementById('btn-confirm-import')?.addEventListener('click', () => {
    if (!pendingImportData) return;

    try {
      // 1. Safety snapshot before applying changes
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(appState));
      exportJSONBackup(); // Trigger immediate safety download as well

      const strategy = document.querySelector('input[name="import-strategy"]:checked')?.value || 'merge';
      const incoming = pendingImportData;

      if (strategy === 'replace') {
        // Replace entire state
        appState.history = incoming.history || {};
        if (incoming.dailyRecord && incoming.dailyRecord.date === appState.currentDate) {
          appState.dailyRecord = incoming.dailyRecord;
        } else {
          appState.dailyRecord = createFreshDailyRecord(appState.currentDate);
        }
        if (incoming.settings) appState.settings = incoming.settings;
      } else {
        // Merge records
        const incomingHistory = incoming.history || {};
        Object.keys(incomingHistory).forEach(d => {
          if (!appState.history[d]) {
            appState.history[d] = incomingHistory[d];
          } else {
            // For conflicting past dates, keep higher study time
            const localSec = calculateRecordTotalSeconds(appState.history[d]);
            const incomingSec = calculateRecordTotalSeconds(incomingHistory[d]);
            if (incomingSec > localSec) {
              appState.history[d] = incomingHistory[d];
            }
          }
        });

        // Merge today's record if incoming has today
        if (incoming.dailyRecord && incoming.dailyRecord.date === appState.currentDate) {
          SECTIONS_CONFIG.forEach(cfg => {
            const locSec = appState.dailyRecord.sections[cfg.id];
            const incSec = incoming.dailyRecord.sections[cfg.id];
            if (incSec) {
              locSec.timerSeconds = Math.max(locSec.timerSeconds, incSec.timerSeconds || 0);
              locSec.manualAdjustmentSeconds = Math.max(locSec.manualAdjustmentSeconds, incSec.manualAdjustmentSeconds || 0);
              locSec.isUserCompleted = locSec.isUserCompleted || incSec.isUserCompleted;
            }
          });
          if (incoming.dailyRecord.notes && !appState.dailyRecord.notes) {
            appState.dailyRecord.notes = incoming.dailyRecord.notes;
          }
          if (incoming.dailyRecord.reflection && !appState.dailyRecord.reflection) {
            appState.dailyRecord.reflection = incoming.dailyRecord.reflection;
          }
        }
      }

      safeSave(appState);
      renderAll();
      renderHistoryModal();
      document.getElementById('modal-import-preview')?.classList.add('hidden');
      alert('Data imported successfully! A safety backup of your previous data was saved.');
      announceAria('Data import completed successfully.');

    } catch (e) {
      alert(`Import error: ${e.message}`);
    } finally {
      pendingImportData = null;
    }
  });

  function calculateRecordTotalSeconds(record) {
    if (!record || !record.sections) return 0;
    let total = 0;
    SECTIONS_CONFIG.forEach(cfg => {
      const s = record.sections[cfg.id];
      if (s) total += Math.max(0, (s.timerSeconds || 0) + (s.manualAdjustmentSeconds || 0));
    });
    return total;
  }

  // ==========================================================================
  // YOUTUBE STUDY MUSIC ENGINE (Note 3)
  // ==========================================================================
  const DEFAULT_YT_URL = 'https://www.youtube.com/watch?v=dwY7w0k3j2Y';
  const YT_STORAGE_KEY = 'jlpt_n4_yt_settings';

  let ytPlayerState = {
    url: DEFAULT_YT_URL,
    videoId: 'dwY7w0k3j2Y',
    listId: null,
    isPlaying: false,
    volume: 50,
    autoPlayOnStudy: false // Strictly manual: music separated from study sessions
  };

  function parseYouTubeUrl(urlStr) {
    if (!urlStr || typeof urlStr !== 'string') return null;
    const trimmed = urlStr.trim();
    let videoId = null;
    let listId = null;

    try {
      const listMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
      if (listMatch) listId = listMatch[1];

      const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      if (vMatch) {
        videoId = vMatch[1];
      } else {
        const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (shortMatch) {
          videoId = shortMatch[1];
        } else {
          const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
          if (embedMatch) {
            videoId = embedMatch[1];
          }
        }
      }
    } catch (e) {
      console.warn('YouTube URL parse warning:', e);
    }

    if (!videoId && !listId) {
      if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
        videoId = trimmed;
      }
    }

    if (!videoId && !listId) return null;
    return { videoId, listId };
  }

  function getYouTubeEmbedSrc(parsed, autoplay = true) {
    if (!parsed) return '';
    const autoVal = autoplay ? '1' : '0';
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null')
      ? window.location.origin
      : 'http://localhost:3456';
    const originParam = `&origin=${encodeURIComponent(origin)}`;

    if (parsed.listId && !parsed.videoId) {
      return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(parsed.listId)}&enablejsapi=1&autoplay=${autoVal}${originParam}`;
    }
    if (parsed.listId && parsed.videoId) {
      return `https://www.youtube.com/embed/${encodeURIComponent(parsed.videoId)}?list=${encodeURIComponent(parsed.listId)}&enablejsapi=1&autoplay=${autoVal}${originParam}`;
    }
    return `https://www.youtube.com/embed/${encodeURIComponent(parsed.videoId)}?enablejsapi=1&autoplay=${autoVal}&loop=1&playlist=${encodeURIComponent(parsed.videoId)}${originParam}`;
  }

  function saveYouTubeSettings() {
    try {
      localStorage.setItem(YT_STORAGE_KEY, JSON.stringify({
        url: ytPlayerState.url,
        volume: ytPlayerState.volume,
        autoPlayOnStudy: ytPlayerState.autoPlayOnStudy
      }));
    } catch (e) {
      // LocalStorage fallback
    }
  }

  function loadSavedYouTubeSettings() {
    try {
      const raw = localStorage.getItem(YT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.url) ytPlayerState.url = parsed.url;
        if (typeof parsed.volume === 'number') ytPlayerState.volume = Math.max(0, Math.min(100, parsed.volume));
        ytPlayerState.autoPlayOnStudy = false; // Decoupled from study sessions
      }
    } catch (e) {
      // Ignore parse failure
    }
  }

  function postToYouTubePlayer(command, args = []) {
    const iframe = document.getElementById('yt-player-iframe');
    if (!iframe || !iframe.contentWindow) return;
    try {
      const message = JSON.stringify({
        event: 'command',
        func: command,
        args: args
      });
      iframe.contentWindow.postMessage(message, '*');
    } catch (e) {
      console.warn('postMessage to YouTube failed:', e);
    }
  }

  function updateYouTubeUI() {
    const playBtn = document.getElementById('btn-yt-play-toggle');
    const playIcon = document.getElementById('yt-play-icon');
    const playLabel = document.getElementById('yt-play-label');
    const volDisplay = document.getElementById('yt-volume-display');
    const volSlider = document.getElementById('yt-volume-slider');
    const urlInput = document.getElementById('yt-music-url-input');
    const autoChk = document.getElementById('chk-yt-autoplay-study');

    if (playIcon) playIcon.textContent = ytPlayerState.isPlaying ? '⏸' : '▶';
    if (playLabel) playLabel.textContent = ytPlayerState.isPlaying ? 'Pause' : 'Play';
    if (playBtn) playBtn.classList.toggle('is-playing', ytPlayerState.isPlaying);

    if (volDisplay) volDisplay.textContent = `${ytPlayerState.volume}%`;
    if (volSlider) volSlider.value = ytPlayerState.volume;
    if (urlInput && urlInput.value !== ytPlayerState.url) urlInput.value = ytPlayerState.url;
    if (autoChk) autoChk.checked = ytPlayerState.autoPlayOnStudy;

    // Highlight matching preset button if any
    document.querySelectorAll('.yt-preset-btn').forEach(btn => {
      const btnUrl = btn.dataset.url;
      btn.classList.toggle('is-active', btnUrl === ytPlayerState.url);
    });
  }

  function openYouTubePopout(customUrl) {
    const url = customUrl || ytPlayerState.url || DEFAULT_YT_URL;
    let popout = null;
    try {
      popout = window.open(
        url,
        'jlpt_study_music_window',
        'width=540,height=420,menubar=no,toolbar=no,location=no,status=no'
      );
    } catch (e) {}

    if (!popout || popout.closed || typeof popout.closed === 'undefined') {
      window.open(url, '_blank');
    }

    ytPlayerState.isPlaying = true;
    updateYouTubeUI();
    showCelebrationToast('🎵 Streaming YouTube Music', 'Playing in background music tab/window.');
  }

  function loadYouTubeUrl(rawUrl, autoStart = true) {
    const parsed = parseYouTubeUrl(rawUrl);
    if (!parsed) {
      showCelebrationToast('Invalid YouTube Link', 'Please enter a valid YouTube video or playlist URL.');
      return false;
    }

    ytPlayerState.url = rawUrl;
    ytPlayerState.videoId = parsed.videoId;
    ytPlayerState.listId = parsed.listId;
    ytPlayerState.isPlaying = autoStart;

    const iframe = document.getElementById('yt-player-iframe');
    if (iframe) {
      iframe.src = getYouTubeEmbedSrc(parsed, autoStart);
    }

    saveYouTubeSettings();
    updateYouTubeUI();
    return true;
  }

  function playYouTubeMusic() {
    const isFile = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
    ytPlayerState.isPlaying = true;

    if (isFile) {
      // On file:// protocol, YouTube rejects embedded iframes with Error 150.
      // Launch pop-out background player directly so user hears music immediately!
      openYouTubePopout();
      return;
    }

    postToYouTubePlayer('playVideo');
    postToYouTubePlayer('unMute');
    postToYouTubePlayer('setVolume', [ytPlayerState.volume]);
    updateYouTubeUI();
  }

  function pauseYouTubeMusic() {
    ytPlayerState.isPlaying = false;
    postToYouTubePlayer('pauseVideo');
    updateYouTubeUI();
  }

  function toggleYouTubeMusic() {
    if (ytPlayerState.isPlaying) {
      pauseYouTubeMusic();
    } else {
      playYouTubeMusic();
    }
  }

  function playYouTubeStudyMusicIfAuto() {
    // Music is strictly separated from study sessions — manual control only
    return;
  }

  function initYouTubeMusicPlayer() {
    loadSavedYouTubeSettings();

    // Check if running on file:// protocol
    const isFile = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
    const advisoryEl = document.getElementById('yt-file-advisory');
    if (advisoryEl) {
      if (isFile) {
        advisoryEl.classList.remove('hidden');
      } else {
        advisoryEl.classList.add('hidden');
      }
    }

    document.getElementById('btn-yt-popout')?.addEventListener('click', () => {
      openYouTubePopout();
    });

    document.getElementById('btn-yt-popout-advisory')?.addEventListener('click', () => {
      openYouTubePopout();
    });

    const urlInput = document.getElementById('yt-music-url-input');
    const loadBtn = document.getElementById('btn-yt-load-url');
    const playToggleBtn = document.getElementById('btn-yt-play-toggle');
    const volSlider = document.getElementById('yt-volume-slider');
    const autoChk = document.getElementById('chk-yt-autoplay-study');

    if (urlInput) {
      urlInput.value = ytPlayerState.url;
      urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          loadYouTubeUrl(urlInput.value.trim(), true);
        }
      });
    }

    loadBtn?.addEventListener('click', () => {
      if (urlInput) {
        loadYouTubeUrl(urlInput.value.trim(), true);
      }
    });

    playToggleBtn?.addEventListener('click', () => {
      toggleYouTubeMusic();
    });

    volSlider?.addEventListener('input', (e) => {
      const vol = parseInt(e.target.value, 10);
      ytPlayerState.volume = isNaN(vol) ? 50 : vol;
      postToYouTubePlayer('setVolume', [ytPlayerState.volume]);
      const volDisplay = document.getElementById('yt-volume-display');
      if (volDisplay) volDisplay.textContent = `${ytPlayerState.volume}%`;
      saveYouTubeSettings();
    });

    autoChk?.addEventListener('change', (e) => {
      ytPlayerState.autoPlayOnStudy = e.target.checked;
      saveYouTubeSettings();
    });

    document.querySelectorAll('.yt-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetUrl = btn.dataset.url;
        if (targetUrl) {
          if (urlInput) urlInput.value = targetUrl;
          loadYouTubeUrl(targetUrl, true);
        }
      });
    });

    const parsed = parseYouTubeUrl(ytPlayerState.url);
    const iframe = document.getElementById('yt-player-iframe');
    if (parsed && iframe) {
      iframe.src = getYouTubeEmbedSrc(parsed, false);
    }

    updateYouTubeUI();
  }

  // ==========================================================================
  // CONTINUOUS ANIMATION LOOP (rAF) & HEARTBEAT
  // ==========================================================================

  function animationLoop() {
    if (appState.activeSectionId) {
      // Re-render live readouts smoothly without DOM rebuild
      renderHero();
      renderActiveFocusBar();
      renderSectionCards();
    }
    requestAnimationFrame(animationLoop);
  }

  // Authoritative Reconciliation & Heartbeat Interval (Every 1s)
  setInterval(() => {
    reconcile();
    updateExamCountdown();
  }, 1000);

  // Periodic Safe Save Interval (Every 5s)
  setInterval(() => {
    if (appState.activeSectionId) {
      commitActiveSectionTime(Date.now());
      safeSave(appState);
    }
  }, 5000);

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  function init() {
    // Initialize elemental atmosphere canvas engine
    try {
      if (typeof window.ElementalAtmosphere === 'function') {
        window.elementalAtmosphere = new window.ElementalAtmosphere('elemental-canvas');
      }
    } catch (e) {
      console.warn('ElementalAtmosphere initialization deferred:', e);
    }

    checkAndHandleDailyRollover();
    // Persist any target updates and the historical near-miss correction.
    safeSave(appState);
    renderAll();
    setupGlobalEventListeners();
    initYouTubeMusicPlayer();
    updateExamCountdown();
    syncElementalTheme();
    requestAnimationFrame(animationLoop);
    console.log('JLPT N4 Study Studio initialized successfully.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose test hooks for automated verification if running under testing harness
  window.__JLPT_TEST_API__ = {
    getState: () => appState,
    startSection,
    pauseActiveSection,
    adjustSectionTime,
    resetSectionTime,
    resetTodaySession,
    splitIntervalAcrossDays,
    reconcile,
    getSectionElapsedSeconds,
    getTotalStudiedSeconds,
    getCalculatedEvolutionStage,
    exportJSONBackup,
    exportCSVReport,
    SECTIONS_CONFIG,
    TOTAL_TARGET_SECONDS,
    parseYouTubeUrl,
    loadYouTubeUrl,
    playYouTubeMusic,
    pauseYouTubeMusic,
    toggleYouTubeMusic,
    openYouTubePopout,
    getYouTubePlayerState: () => ytPlayerState
  };

})();
