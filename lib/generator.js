const { computeRecovery } = require('./recovery');
const { recommend } = require('./progression');

// Rough time cost per set, by goal (work time + rest), in seconds.
const REST_SECONDS = {
  strength:    { compound: 150, isolation: 90 },
  hypertrophy: { compound: 100, isolation: 70 },
  endurance:   { compound: 60,  isolation: 45 }
};
const WORK_SECONDS_PER_SET = 40;
const TRANSITION_SECONDS = 60; // moving between exercises, loading plates, etc.
const WARMUP_BUFFER_MIN = 6;   // reserved for general warm-up

function exerciseFitsEquipment(exercise, available) {
  const availSet = new Set(['bodyweight', ...available]);
  return exercise.equipment.every(e => availSet.has(e));
}

function estimateExerciseMinutes(exercise, sets, goal) {
  const rest = REST_SECONDS[goal]?.[exercise.category] ?? REST_SECONDS.hypertrophy.isolation;
  const seconds = sets * (WORK_SECONDS_PER_SET + rest) + TRANSITION_SECONDS;
  return seconds / 60;
}

/**
 * @param {object} opts
 * @param {Array} opts.exerciseLibrary - full exercise list (from db/exercises.json)
 * @param {Array} opts.sessions - session history
 * @param {Array} opts.availableEquipment - equipment codes on hand
 * @param {number} opts.durationMinutes - target workout length
 * @param {string} opts.goal - 'strength' | 'hypertrophy' | 'endurance'
 * @param {object} opts.planAdjustments - from Claude review (volume multipliers, deloads, notes)
 * @param {string[]} [opts.focusMuscles] - optional explicit focus, overrides auto muscle selection
 */
// Major muscle groups anchor the session (compound lifts); minor ones fill remaining time.
// Without this split, small muscles that were never trained sit at 100% recovery and
// crowd out chest/back/legs that are merely "mostly" recovered.
const MAJOR_MUSCLES = ['quads', 'hamstrings', 'lats', 'chest', 'glutes', 'shoulders', 'traps'];
const MINOR_MUSCLES = ['biceps', 'triceps', 'calves', 'abs', 'forearms', 'lower_back'];

function generateWorkout({ exerciseLibrary, sessions, availableEquipment, durationMinutes, goal, planAdjustments = {}, focusMuscles }) {
  const recovery = computeRecovery(sessions, new Date());
  const deloadSet = new Set(planAdjustments.deloadMuscles || []);

  const readySort = (list) => list
    .filter(m => recovery[m] && recovery[m].recoveryPct >= 40)
    .sort((a, b) => (recovery[b].recoveryPct - recovery[a].recoveryPct) || ((recovery[b].hoursSinceTrained ?? 999) - (recovery[a].hoursSinceTrained ?? 999)));

  // Majors first (anchors the session around big compound lifts), then minors fill leftover time.
  let muscleOrder = [...readySort(MAJOR_MUSCLES), ...readySort(MINOR_MUSCLES)];

  if (focusMuscles && focusMuscles.length) {
    muscleOrder = focusMuscles.filter(m => recovery[m]);
  }

  const usableMinutes = Math.max(10, durationMinutes - WARMUP_BUFFER_MIN);
  const availableExercises = exerciseLibrary.filter(e => exerciseFitsEquipment(e, availableEquipment));

  // Avoid repeating the exact same exercise as the last 2 sessions for variety, when alternatives exist.
  const recentNames = new Set(
    sessions.slice(-2).flatMap(s => (s.exercises || []).map(e => e.exerciseName))
  );

  const picked = [];
  let minutesUsed = 0;
  const usedMuscles = new Set();

  for (const muscle of muscleOrder) {
    if (minutesUsed >= usableMinutes) break;

    let candidates = availableExercises.filter(e => e.primary === muscle && !picked.includes(e));
    if (!candidates.length) continue;

    // Prefer compounds first for a muscle, then isolation; prefer non-recently-used.
    candidates.sort((a, b) => {
      const compoundScore = (x) => (x.category === 'compound' ? 1 : 0);
      const freshScore = (x) => (recentNames.has(x.name) ? 0 : 1);
      return (compoundScore(b) - compoundScore(a)) || (freshScore(b) - freshScore(a));
    });

    const exercise = candidates[0];
    const deload = deloadSet.has(muscle);
    const rec = recommend(exercise, sessions, goal, planAdjustments, deload);
    const exMinutes = estimateExerciseMinutes(exercise, rec.sets, goal);

    if (minutesUsed + exMinutes > usableMinutes && picked.length > 0) continue; // skip if it would blow the budget, unless list still empty

    picked.push(exercise);
    minutesUsed += exMinutes;
    usedMuscles.add(muscle);

    // Allow a second exercise per muscle group if there's still ample time and it's a priority (top-ranked) muscle.
    const isTopPriority = muscleOrder.indexOf(muscle) < 4;
    if (isTopPriority && candidates[1] && minutesUsed + estimateExerciseMinutes(candidates[1], rec.sets, goal) <= usableMinutes) {
      const ex2 = candidates[1];
      const rec2 = recommend(ex2, sessions, goal, planAdjustments, deload);
      picked.push(ex2);
      minutesUsed += estimateExerciseMinutes(ex2, rec2.sets, goal);
    }
  }

  const workout = picked.map(exercise => {
    const deload = deloadSet.has(exercise.primary);
    const rec = recommend(exercise, sessions, goal, planAdjustments, deload);
    return {
      name: exercise.name,
      primary: exercise.primary,
      secondary: exercise.secondary,
      category: exercise.category,
      equipment: exercise.equipment,
      sets: rec.sets,
      targetReps: rec.targetReps,
      targetRpe: rec.targetRpe,
      weight: rec.weight,
      weightNote: rec.weightNote,
      progressionNote: rec.progressionNote,
      estimatedMinutes: Math.round(estimateExerciseMinutes(exercise, rec.sets, goal) * 10) / 10,
      recoveryPctAtGeneration: recovery[exercise.primary]?.recoveryPct ?? null
    };
  });

  return {
    goal,
    durationMinutes,
    estimatedMinutes: Math.round((minutesUsed + WARMUP_BUFFER_MIN) * 10) / 10,
    muscleRecoverySnapshot: recovery,
    exercises: workout
  };
}

module.exports = { generateWorkout };
