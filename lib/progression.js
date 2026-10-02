// Progression model
// For each exercise, looks at the most recent time it was performed and applies
// simple, well-established progressive-overload rules based on RPE feedback.

const GOAL_SCHEMES = {
  strength:    { compound: { sets: 5, repRange: [3, 6],  targetRpe: 8.5 }, isolation: { sets: 3, repRange: [6, 10],  targetRpe: 8 } },
  hypertrophy: { compound: { sets: 4, repRange: [6, 10], targetRpe: 8   }, isolation: { sets: 3, repRange: [10, 15], targetRpe: 8.5 } },
  endurance:   { compound: { sets: 3, repRange: [12, 15],targetRpe: 7.5 }, isolation: { sets: 3, repRange: [15, 20], targetRpe: 7.5 } }
};

// Reasonable plate-loading increments by exercise class.
function incrementFor(exercise) {
  const smallMuscles = ['biceps', 'triceps', 'shoulders', 'calves', 'forearms', 'abs'];
  const isUnilateral = !!exercise.unilateral;
  const isSmall = smallMuscles.includes(exercise.primary) || exercise.equipment.includes('cable') || exercise.equipment.includes('dumbbell');
  if (exercise.equipment.includes('bodyweight')) return 0; // progress via reps, not weight
  if (isUnilateral || isSmall) return 2.5;
  return 5;
}

function lastPerformance(exerciseName, sessions) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const ex = (sessions[i].exercises || []).find(e => e.exerciseName === exerciseName);
    if (ex && ex.sets && ex.sets.length) {
      return { date: sessions[i].date, sets: ex.sets };
    }
  }
  return null;
}

/**
 * @param {object} exercise - exercise definition (name, primary, secondary, equipment, category, unilateral)
 * @param {Array} sessions - full session history
 * @param {string} goal - 'strength' | 'hypertrophy' | 'endurance'
 * @param {object} adjustments - planAdjustments.exerciseOverrides / muscleVolumeMultiplier from Claude review
 * @param {boolean} deload - true if this muscle is currently flagged for a deload week
 */
function recommend(exercise, sessions, goal = 'hypertrophy', adjustments = {}, deload = false) {
  const scheme = (GOAL_SCHEMES[goal] || GOAL_SCHEMES.hypertrophy)[exercise.category] || GOAL_SCHEMES.hypertrophy.isolation;
  const [repLow, repHigh] = scheme.repRange;
  const increment = incrementFor(exercise);
  const last = lastPerformance(exercise.name, sessions);

  let sets = scheme.sets;
  const volMult = (adjustments.muscleVolumeMultiplier || {})[exercise.primary];
  if (volMult) sets = Math.max(2, Math.round(sets * volMult));
  if (deload) sets = Math.max(2, Math.round(sets * 0.6));

  if (!last) {
    // No history: conservative starting point, let the lifter self-select weight via RPE.
    return {
      sets,
      targetReps: repLow,
      targetRpe: deload ? Math.max(6, scheme.targetRpe - 1.5) : scheme.targetRpe,
      weight: null,
      weightNote: exercise.equipment.includes('bodyweight') ? 'bodyweight' : 'pick a weight that hits target RPE',
      progressionNote: 'First time logging this — start conservative and calibrate from RPE.'
    };
  }

  const lastAvgRpe = last.sets.reduce((s, st) => s + (st.rpe || 8), 0) / last.sets.length;
  const lastMaxReps = Math.max(...last.sets.map(s => s.reps || 0));
  const lastWeight = last.sets[last.sets.length - 1].weight || null;

  let nextWeight = lastWeight;
  let nextReps = Math.max(repLow, Math.min(repHigh, lastMaxReps));
  let note;

  if (deload) {
    nextWeight = lastWeight != null ? Math.round((lastWeight * 0.85) / 2.5) * 2.5 : null;
    note = 'Deload week for this muscle group — lighter load, same movement quality.';
  } else if (lastAvgRpe <= scheme.targetRpe - 0.5 && lastMaxReps >= repHigh) {
    // Was too easy at the top of the rep range -> add weight, drop to bottom of range.
    nextWeight = lastWeight != null ? lastWeight + increment : null;
    nextReps = repLow;
    note = `Last session was easy (RPE ${lastAvgRpe.toFixed(1)}) at ${repHigh}+ reps — adding ${increment ? increment + (exercise.equipment.includes('bodyweight') ? '' : ' lb') : 'reps'}.`;
  } else if (lastAvgRpe <= scheme.targetRpe && lastMaxReps < repHigh) {
    // Room left — add a rep before adding weight.
    nextReps = Math.min(repHigh, lastMaxReps + 1);
    note = `Adding a rep — still under target RPE at ${lastMaxReps} reps.`;
  } else if (lastAvgRpe >= scheme.targetRpe + 1.5) {
    // Was too hard — back off slightly.
    nextWeight = lastWeight != null ? Math.max(0, lastWeight - increment) : null;
    note = `Last session ran hot (RPE ${lastAvgRpe.toFixed(1)}) — backing off slightly to protect form.`;
  } else {
    note = 'Holding steady — repeat this weight/rep target and aim to beat your RPE.';
  }

  return {
    sets,
    targetReps: nextReps,
    targetRpe: deload ? Math.max(6, scheme.targetRpe - 1.5) : scheme.targetRpe,
    weight: nextWeight,
    weightNote: exercise.equipment.includes('bodyweight') ? 'bodyweight' : (nextWeight != null ? `${nextWeight} lb` : 'pick a weight that hits target RPE'),
    progressionNote: note
  };
}

module.exports = { recommend, GOAL_SCHEMES, lastPerformance };
