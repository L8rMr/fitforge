// Recovery model
// Each set logged against a muscle contributes a "stimulus" that decays
// exponentially over time (half-life per muscle group, in hours). Recovery %
// is 100 minus the current normalized fatigue.

const HALF_LIFE_HOURS = {
  chest: 48,
  lats: 48,
  traps: 36,
  shoulders: 42,
  biceps: 36,
  triceps: 36,
  quads: 72,
  hamstrings: 72,
  glutes: 60,
  calves: 36,
  abs: 30,
  forearms: 30,
  lower_back: 60
};

const ALL_MUSCLES = Object.keys(HALF_LIFE_HOURS);

// RPE roughly maps to intensity fraction of effort; higher RPE = more stimulus per set.
function intensityFactor(rpe) {
  if (rpe == null) return 0.8; // assume moderate-hard if not logged
  return Math.min(1.2, Math.max(0.4, rpe / 10));
}

// Compound movements load the muscle for longer under tension -> slightly higher stimulus.
const CATEGORY_FACTOR = { compound: 1.15, isolation: 1.0 };

/**
 * @param {Array} sessions - array of {date, exercises:[{exerciseId, primary, secondary, category, sets:[{reps,weight,rpe}]}]}
 * @param {Date} now
 * @returns {{ [muscle]: { recoveryPct: number, hoursSinceTrained: number|null, fatigueUnits: number } }}
 */
function computeRecovery(sessions, now = new Date()) {
  const result = {};
  for (const m of ALL_MUSCLES) {
    result[m] = { recoveryPct: 100, hoursSinceTrained: null, fatigueUnits: 0 };
  }

  // Only look at the trailing 10 days; anything older has fully decayed for our half-lives.
  const cutoff = new Date(now.getTime() - 10 * 24 * 3600 * 1000);

  for (const session of sessions) {
    const sessionDate = new Date(session.date);
    if (sessionDate < cutoff || sessionDate > now) continue;
    const hoursAgo = (now - sessionDate) / 3600000;

    for (const ex of session.exercises || []) {
      const setCount = (ex.sets || []).length;
      if (!setCount) continue;
      const avgRpe = (ex.sets.reduce((s, st) => s + (st.rpe || 8), 0) / setCount);
      const catFactor = CATEGORY_FACTOR[ex.category] || 1.0;
      const baseStimulus = setCount * intensityFactor(avgRpe) * catFactor;

      const touches = [[ex.primary, 1.0], ...(ex.secondary || []).map(m => [m, 0.5])];
      for (const [muscle, weight] of touches) {
        if (!HALF_LIFE_HOURS[muscle]) continue;
        const halfLife = HALF_LIFE_HOURS[muscle];
        const decayed = baseStimulus * weight * Math.pow(0.5, hoursAgo / halfLife);
        result[muscle].fatigueUnits += decayed;
        if (result[muscle].hoursSinceTrained === null || hoursAgo < result[muscle].hoursSinceTrained) {
          result[muscle].hoursSinceTrained = Math.round(hoursAgo * 10) / 10;
        }
      }
    }
  }

  // Normalize fatigueUnits -> recovery%. A fatigueUnits value of ~6 (roughly a hard
  // 4-5 set session just finished) maps close to 0% recovered; decays back to 100%.
  const SATURATION = 6.0;
  for (const m of ALL_MUSCLES) {
    const f = result[m].fatigueUnits;
    const pct = 100 * (1 - Math.min(1, f / SATURATION));
    result[m].recoveryPct = Math.round(Math.max(0, Math.min(100, pct)));
  }

  return result;
}

function statusLabel(recoveryPct) {
  if (recoveryPct >= 75) return 'ready';
  if (recoveryPct >= 40) return 'recovering';
  return 'fatigued';
}

module.exports = { computeRecovery, statusLabel, ALL_MUSCLES, HALF_LIFE_HOURS };
