const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

const DEFAULT_STORE = {
  equipment: { available: ['bodyweight'] },
  settings: {
    units: 'lb',
    goal: 'hypertrophy', // 'strength' | 'hypertrophy' | 'endurance'
    weeklyReviewEnabled: true,
    lastReviewDate: null
  },
  sessions: [],       // completed workout logs
  planAdjustments: {  // populated by Claude review; multiplies generator behavior
    muscleVolumeMultiplier: {}, // e.g. { chest: 1.1, hamstrings: 0.8 }
    deloadMuscles: [],          // muscles flagged for a lighter week
    notes: [],                  // human-readable coach notes, most recent first
    exerciseOverrides: {}       // { exerciseName: { repRangeNote } }
  }
};

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2));
  }
}

function read() {
  ensureStore();
  const raw = fs.readFileSync(STORE_PATH, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Store corrupted, resetting to default.', e);
    fs.writeFileSync(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2));
    return JSON.parse(JSON.stringify(DEFAULT_STORE));
  }
}

function write(store) {
  ensureStore();
  // Write atomically: temp file then rename, avoids corruption on power loss.
  const tmp = STORE_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, STORE_PATH);
}

module.exports = { read, write, DEFAULT_STORE };
