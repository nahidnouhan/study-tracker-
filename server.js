const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

function escapeCsvField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

function formatHistoryCsvRow(rec) {
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

  const date = rec.date || new Date().toISOString().split('T')[0];
  const totalMin = Number(rec.totalStudyMinutes || 0).toFixed(1);
  const targetMin = Number(rec.targetGoalMinutes || 240);
  const goalMet = rec.goalMet ? 'YES' : 'NO';

  const row = [
    date,
    totalMin,
    targetMin,
    goalMet,
    Number(rec.vocabTimerMin || 0).toFixed(1),
    Number(rec.vocabAdjMin || 0).toFixed(1),
    Number(rec.vocabTotalMin || 0).toFixed(1),
    Number(rec.kanjiTimerMin || 0).toFixed(1),
    Number(rec.kanjiAdjMin || 0).toFixed(1),
    Number(rec.kanjiTotalMin || 0).toFixed(1),
    Number(rec.grammarTimerMin || 0).toFixed(1),
    Number(rec.grammarAdjMin || 0).toFixed(1),
    Number(rec.grammarTotalMin || 0).toFixed(1),
    Number(rec.listeningTimerMin || 0).toFixed(1),
    Number(rec.listeningAdjMin || 0).toFixed(1),
    Number(rec.listeningTotalMin || 0).toFixed(1),
    Number(rec.readingTimerMin || 0).toFixed(1),
    Number(rec.readingAdjMin || 0).toFixed(1),
    Number(rec.readingTotalMin || 0).toFixed(1),
    escapeCsvField(rec.studyNotes || ''),
    escapeCsvField(rec.dailyReflection || '')
  ];

  return headers.join(',') + '\n' + row.join(',') + '\n';
}

function parseHistoryCsvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    if (lines.length < 2) return null;
    const headers = lines[0].split(',').map(h => h.trim());
    const values = lines[1].split(',').map(v => v.replace(/^"|"$/g, '').trim());
    const row = {};
    headers.forEach((h, i) => row[h] = values[i] || '');

    const date = row['Date'] || path.basename(filePath).replace(/^jlpt-n4-study-history-|\.csv$/g, '');
    const vocabTimer = Math.round(parseFloat(row['Vocab_Timer_Min'] || 0) * 60);
    const vocabAdj = Math.round(parseFloat(row['Vocab_Adj_Min'] || 0) * 60);
    const kanjiTimer = Math.round(parseFloat(row['Kanji_Timer_Min'] || 0) * 60);
    const kanjiAdj = Math.round(parseFloat(row['Kanji_Adj_Min'] || 0) * 60);
    const grammarTimer = Math.round(parseFloat(row['Grammar_Timer_Min'] || 0) * 60);
    const grammarAdj = Math.round(parseFloat(row['Grammar_Adj_Min'] || 0) * 60);
    const listeningTimer = Math.round(parseFloat(row['Listening_Timer_Min'] || 0) * 60);
    const listeningAdj = Math.round(parseFloat(row['Listening_Adj_Min'] || 0) * 60);
    const readingTimer = Math.round(parseFloat(row['Reading_Timer_Min'] || 0) * 60);
    const readingAdj = Math.round(parseFloat(row['Reading_Adj_Min'] || 0) * 60);

    return {
      date: date,
      sections: {
        vocabulary: { targetSeconds: 45 * 60, timerSeconds: vocabTimer, manualAdjustmentSeconds: vocabAdj, isUserCompleted: (vocabTimer + vocabAdj) >= 45 * 60 },
        kanji: { targetSeconds: 45 * 60, timerSeconds: kanjiTimer, manualAdjustmentSeconds: kanjiAdj, isUserCompleted: (kanjiTimer + kanjiAdj) >= 45 * 60 },
        grammar: { targetSeconds: 90 * 60, timerSeconds: grammarTimer, manualAdjustmentSeconds: grammarAdj, isUserCompleted: (grammarTimer + grammarAdj) >= 90 * 60 },
        listening: { targetSeconds: 30 * 60, timerSeconds: listeningTimer, manualAdjustmentSeconds: listeningAdj, isUserCompleted: (listeningTimer + listeningAdj) >= 30 * 60 },
        reading: { targetSeconds: 30 * 60, timerSeconds: readingTimer, manualAdjustmentSeconds: readingAdj, isUserCompleted: (readingTimer + readingAdj) >= 30 * 60 }
      },
      checklist: {},
      notes: row['Study_Notes'] || '',
      reflection: row['Daily_Reflection'] || ''
    };
  } catch (e) {
    return null;
  }
}

const server = http.createServer((req, res) => {
  // CORS support for local web app fetching
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlPath = req.url.split('?')[0];

  // API Endpoint: Automated Daily D:\ CSV Sync
  if (req.method === 'POST' && urlPath === '/api/sync-history-csv') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) req.destroy();
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const csvContent = formatHistoryCsvRow(payload);
        const dateStr = payload.date || new Date().toISOString().split('T')[0];

        // Target path on D:\ drive with fallback to local ./data directory
        const dDrivePath = `D:\\jlpt-n4-study-history-${dateStr}.csv`;
        let targetPath = dDrivePath;

        try {
          fs.writeFileSync(dDrivePath, csvContent, 'utf8');
        } catch (dErr) {
          // If D: is inaccessible, write to local fallback directory
          const fallbackDir = path.join(__dirname, 'data');
          if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
          targetPath = path.join(fallbackDir, `jlpt-n4-study-history-${dateStr}.csv`);
          fs.writeFileSync(targetPath, csvContent, 'utf8');
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, path: targetPath, date: dateStr }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API Endpoint: Load Historical Records from D:\ drive and fallback
  if (req.method === 'GET' && (urlPath === '/api/load-history' || urlPath === '/api/get-history')) {
    const history = {};

    // 1. Scan D:\ drive for all jlpt-n4-study-history-*.csv files
    try {
      if (fs.existsSync('D:\\')) {
        const dFiles = fs.readdirSync('D:\\').filter(f => f.startsWith('jlpt-n4-study-history-') && f.endsWith('.csv'));
        dFiles.forEach(f => {
          const rec = parseHistoryCsvFile(path.join('D:\\', f));
          if (rec && rec.date) history[rec.date] = rec;
        });
      }
    } catch (e) {}

    // 2. Scan local ./data directory
    try {
      const localDir = path.join(__dirname, 'data');
      if (fs.existsSync(localDir)) {
        const localFiles = fs.readdirSync(localDir).filter(f => f.startsWith('jlpt-n4-study-history-') && f.endsWith('.csv'));
        localFiles.forEach(f => {
          const rec = parseHistoryCsvFile(path.join(localDir, f));
          if (rec && rec.date && !history[rec.date]) history[rec.date] = rec;
        });
      }
    } catch (e) {}

    // 3. Scan central state snapshot
    try {
      const stateFile = fs.existsSync('D:\\jlpt-n4-study-state.json') 
        ? 'D:\\jlpt-n4-study-state.json' 
        : path.join(__dirname, 'data', 'study-state.json');
      if (fs.existsSync(stateFile)) {
        const stateObj = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        if (stateObj && stateObj.history) {
          Object.keys(stateObj.history).forEach(d => {
            history[d] = stateObj.history[d];
          });
        }
      }
    } catch (e) {}

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: Object.keys(history).length, history }));
    return;
  }

  // API Endpoint: Sync and Retrieve Full State Across Origins (file:// and localhost)
  if (req.method === 'POST' && urlPath === '/api/sync-full-state') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5e6) req.destroy();
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const jsonStr = JSON.stringify(payload, null, 2);

        try {
          fs.writeFileSync('D:\\jlpt-n4-study-state.json', jsonStr, 'utf8');
        } catch (e) {}

        const fallbackDir = path.join(__dirname, 'data');
        if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
        fs.writeFileSync(path.join(fallbackDir, 'study-state.json'), jsonStr, 'utf8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'GET' && urlPath === '/api/get-full-state') {
    try {
      const statePath = fs.existsSync('D:\\jlpt-n4-study-state.json')
        ? 'D:\\jlpt-n4-study-state.json'
        : path.join(__dirname, 'data', 'study-state.json');
      if (fs.existsSync(statePath)) {
        const data = fs.readFileSync(statePath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
        return;
      }
    } catch (e) {}

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'No stored state yet' }));
    return;
  }

  // Static File Serving
  let reqPath = urlPath;
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  
  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
}

module.exports = {
  server,
  formatHistoryCsvRow
};
