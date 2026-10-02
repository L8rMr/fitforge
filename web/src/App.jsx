import { useState, useEffect, useCallback } from "react";

// ============ EXERCISE LIBRARY (153 exercises: [name, primary, secondary, equipment, isCompound, isUnilateral]) ============
const EX_RAW = [["Barbell Bench Press","chest",["triceps","shoulders"],["barbell","bench"],1,0],["Incline Barbell Bench Press","chest",["shoulders","triceps"],["barbell","incline_bench"],1,0],["Decline Barbell Bench Press","chest",["triceps"],["barbell","bench"],1,0],["Dumbbell Bench Press","chest",["triceps","shoulders"],["dumbbell","bench"],1,0],["Incline Dumbbell Press","chest",["shoulders","triceps"],["dumbbell","incline_bench"],1,0],["Decline Dumbbell Press","chest",["triceps"],["dumbbell","bench"],1,0],["Dumbbell Fly","chest",[],["dumbbell","bench"],0,0],["Incline Dumbbell Fly","chest",[],["dumbbell","incline_bench"],0,0],["Cable Fly","chest",[],["cable"],0,0],["Cable Crossover","chest",[],["cable"],0,0],["Push-Up","chest",["triceps","shoulders"],["bodyweight"],1,0],["Weighted Dip (Chest Lean)","chest",["triceps"],["dip_station"],1,0],["Machine Chest Press","chest",["triceps"],["machine"],1,0],["Pec Deck","chest",[],["machine"],0,0],["Pull-Up","lats",["biceps","traps"],["pull_up_bar"],1,0],["Chin-Up","lats",["biceps"],["pull_up_bar"],1,0],["Lat Pulldown","lats",["biceps"],["cable"],1,0],["Wide-Grip Lat Pulldown","lats",["biceps"],["cable"],1,0],["Close-Grip Lat Pulldown","lats",["biceps"],["cable"],1,0],["Straight-Arm Pulldown","lats",[],["cable"],0,0],["Barbell Bent-Over Row","lats",["traps","biceps"],["barbell"],1,0],["Single-Arm Dumbbell Row","lats",["traps","biceps"],["dumbbell","bench"],1,1],["T-Bar Row","lats",["traps","biceps"],["barbell"],1,0],["Seated Cable Row","lats",["traps","biceps"],["cable"],1,0],["Chest-Supported Row","lats",["traps"],["dumbbell","incline_bench"],1,0],["Inverted Row","lats",["biceps"],["pull_up_bar"],1,0],["Barbell Shrug","traps",[],["barbell"],0,0],["Dumbbell Shrug","traps",[],["dumbbell"],0,0],["Face Pull","traps",["shoulders"],["cable"],0,0],["Rear Delt Fly","shoulders",["traps"],["dumbbell"],0,0],["Reverse Pec Deck","shoulders",["traps"],["machine"],0,0],["Barbell Upright Row","traps",["shoulders"],["barbell"],1,0],["Overhead Barbell Press","shoulders",["triceps"],["barbell"],1,0],["Seated Dumbbell Shoulder Press","shoulders",["triceps"],["dumbbell","bench"],1,0],["Arnold Press","shoulders",["triceps"],["dumbbell","bench"],1,0],["Push Press","shoulders",["triceps","quads"],["barbell"],1,0],["Lateral Raise","shoulders",[],["dumbbell"],0,0],["Cable Lateral Raise","shoulders",[],["cable"],0,0],["Front Raise","shoulders",[],["dumbbell"],0,0],["Plate Front Raise","shoulders",[],["bodyweight"],0,0],["Machine Shoulder Press","shoulders",["triceps"],["machine"],1,0],["Landmine Press","shoulders",["triceps"],["barbell"],1,1],["Cuban Press","shoulders",["traps"],["dumbbell"],0,0],["Bradford Press","shoulders",["triceps"],["barbell"],1,0],["Barbell Curl","biceps",["forearms"],["barbell"],0,0],["EZ-Bar Curl","biceps",["forearms"],["ez_bar"],0,0],["Dumbbell Curl","biceps",["forearms"],["dumbbell"],0,0],["Hammer Curl","biceps",["forearms"],["dumbbell"],0,0],["Incline Dumbbell Curl","biceps",[],["dumbbell","incline_bench"],0,0],["Preacher Curl","biceps",[],["ez_bar","bench"],0,0],["Cable Curl","biceps",["forearms"],["cable"],0,0],["Concentration Curl","biceps",[],["dumbbell"],0,0],["Close-Grip Bench Press","triceps",["chest"],["barbell","bench"],1,0],["Skull Crusher","triceps",[],["ez_bar","bench"],0,0],["Overhead Triceps Extension","triceps",[],["dumbbell"],0,0],["Cable Triceps Pushdown","triceps",[],["cable"],0,0],["Rope Pushdown","triceps",[],["cable"],0,0],["Weighted Dip (Triceps Focus)","triceps",["chest"],["dip_station"],1,0],["Dumbbell Kickback","triceps",[],["dumbbell","bench"],0,0],["Diamond Push-Up","triceps",["chest"],["bodyweight"],1,0],["Barbell Back Squat","quads",["glutes","hamstrings"],["barbell","squat_rack"],1,0],["Front Squat","quads",["glutes"],["barbell","squat_rack"],1,0],["Leg Press","quads",["glutes"],["machine"],1,0],["Hack Squat","quads",["glutes"],["machine"],1,0],["Bulgarian Split Squat","quads",["glutes"],["dumbbell","bench"],1,1],["Walking Lunge","quads",["glutes"],["dumbbell"],1,1],["Goblet Squat","quads",["glutes"],["dumbbell"],1,0],["Leg Extension","quads",[],["machine"],0,0],["Smith Machine Squat","quads",["glutes"],["smith_machine"],1,0],["Step-Up","quads",["glutes"],["dumbbell","bench"],1,1],["Romanian Deadlift","hamstrings",["glutes","lower_back"],["barbell"],1,0],["Conventional Deadlift","hamstrings",["glutes","lower_back","traps"],["barbell"],1,0],["Stiff-Leg Deadlift","hamstrings",["glutes"],["barbell"],1,0],["Lying Leg Curl","hamstrings",[],["machine"],0,0],["Seated Leg Curl","hamstrings",[],["machine"],0,0],["Good Morning","hamstrings",["lower_back","glutes"],["barbell"],1,0],["Single-Leg Romanian Deadlift","hamstrings",["glutes"],["dumbbell"],1,1],["Nordic Curl","hamstrings",[],["bodyweight"],0,0],["Barbell Hip Thrust","glutes",["hamstrings"],["barbell","bench"],1,0],["Barbell Glute Bridge","glutes",["hamstrings"],["barbell"],1,0],["Cable Glute Kickback","glutes",[],["cable"],0,1],["Glute Bridge Machine","glutes",[],["machine"],0,0],["Sumo Deadlift","glutes",["hamstrings","quads"],["barbell"],1,0],["Cable Pull-Through","glutes",["hamstrings"],["cable"],1,0],["Curtsy Lunge","glutes",["quads"],["dumbbell"],1,1],["Donkey Kick","glutes",[],["bodyweight"],0,1],["Standing Calf Raise","calves",[],["machine"],0,0],["Seated Calf Raise","calves",[],["machine"],0,0],["Leg Press Calf Raise","calves",[],["machine"],0,0],["Single-Leg Calf Raise","calves",[],["dumbbell"],0,1],["Donkey Calf Raise","calves",[],["bodyweight"],0,0],["Hanging Leg Raise","abs",[],["pull_up_bar"],0,0],["Cable Crunch","abs",[],["cable"],0,0],["Ab Wheel Rollout","abs",["lower_back"],["bodyweight"],1,0],["Plank","abs",[],["bodyweight"],0,0],["Weighted Sit-Up","abs",[],["bodyweight"],0,0],["Decline Sit-Up","abs",[],["bench"],0,0],["Russian Twist","abs",[],["bodyweight"],0,0],["Cable Woodchopper","abs",[],["cable"],0,1],["Bicycle Crunch","abs",[],["bodyweight"],0,0],["Reverse Crunch","abs",[],["bodyweight"],0,0],["Dragon Flag","abs",[],["bench"],0,0],["Pallof Press","abs",[],["cable"],0,1],["Wrist Curl","forearms",[],["dumbbell"],0,0],["Reverse Wrist Curl","forearms",[],["dumbbell"],0,0],["Farmer's Carry","forearms",["traps","abs"],["dumbbell"],1,0],["Plate Pinch Hold","forearms",[],["bodyweight"],0,0],["Kettlebell Swing","glutes",["hamstrings","abs"],["kettlebell"],1,0],["Kettlebell Clean and Press","shoulders",["quads","abs"],["kettlebell"],1,1],["Turkish Get-Up","abs",["shoulders","glutes"],["kettlebell"],1,1],["Barbell Thruster","quads",["shoulders"],["barbell"],1,0],["Trap Bar Deadlift","quads",["glutes","hamstrings"],["trap_bar"],1,0],["Band Pull-Apart","shoulders",["traps"],["resistance_band"],0,0],["Band Bicep Curl","biceps",[],["resistance_band"],0,0],["Band Triceps Pushdown","triceps",[],["resistance_band"],0,0],["Band-Resisted Squat","quads",["glutes"],["resistance_band"],1,0],["Band Row","lats",["biceps"],["resistance_band"],1,0],["Svend Press","chest",[],["bodyweight"],0,0],["Floor Press","chest",["triceps"],["dumbbell"],1,0],["Single-Arm Cable Fly","chest",[],["cable"],0,1],["Machine Row","lats",["traps","biceps"],["machine"],1,0],["Meadows Row","lats",["traps","biceps"],["barbell"],1,1],["Renegade Row","lats",["abs"],["dumbbell"],1,1],["Behind-the-Neck Press","shoulders",["triceps"],["barbell"],1,0],["Single-Arm Dumbbell Press","shoulders",["triceps","abs"],["dumbbell"],1,1],["Lu Raise","shoulders",[],["dumbbell"],0,0],["Zottman Curl","biceps",["forearms"],["dumbbell"],0,0],["Spider Curl","biceps",[],["ez_bar","incline_bench"],0,0],["Drag Curl","biceps",[],["barbell"],0,0],["JM Press","triceps",["chest"],["barbell","bench"],1,0],["Tate Press","triceps",[],["dumbbell","bench"],0,0],["Bench Dip","triceps",["chest"],["bench"],1,0],["Zercher Squat","quads",["glutes","abs"],["barbell","squat_rack"],1,0],["Box Squat","quads",["glutes"],["barbell","squat_rack"],1,0],["Sissy Squat","quads",[],["bodyweight"],0,0],["Reverse Lunge","quads",["glutes"],["dumbbell"],1,1],["Lateral Lunge","quads",["glutes"],["dumbbell"],1,1],["Kettlebell Goblet Squat","quads",["glutes"],["kettlebell"],1,0],["Glute-Ham Raise","hamstrings",["glutes"],["bodyweight"],1,0],["Kettlebell Romanian Deadlift","hamstrings",["glutes"],["kettlebell"],1,0],["Frog Pump","glutes",[],["bodyweight"],0,0],["Single-Leg Hip Thrust","glutes",["hamstrings"],["bench"],1,1],["Banded Lateral Walk","glutes",[],["resistance_band"],0,0],["Jump Rope Calf Pump","calves",[],["bodyweight"],0,0],["Kettlebell Calf Raise","calves",[],["kettlebell"],0,0],["Toes-to-Bar","abs",[],["pull_up_bar"],0,0],["V-Up","abs",[],["bodyweight"],0,0],["Side Plank","abs",[],["bodyweight"],0,1],["Mountain Climber","abs",["quads"],["bodyweight"],0,0],["Landmine Rotation","abs",[],["barbell"],0,1],["Behind-Back Wrist Curl","forearms",[],["barbell"],0,0],["Kettlebell Farmer's Carry","forearms",["traps","abs"],["kettlebell"],1,0],["Dead Hang","forearms",["lats"],["pull_up_bar"],0,0]];
const LIBRARY = EX_RAW.map(([name, primary, secondary, equipment, comp, uni]) => ({ name, primary, secondary, equipment, category: comp ? "compound" : "isolation", unilateral: !!uni }));

const EQUIPMENT_OPTIONS = [["barbell","Barbell"],["dumbbell","Dumbbells"],["bench","Flat Bench"],["incline_bench","Incline Bench"],["squat_rack","Squat Rack"],["pull_up_bar","Pull-Up Bar"],["cable","Cable Machine"],["machine","Gym Machines"],["kettlebell","Kettlebells"],["resistance_band","Bands"],["dip_station","Dip Station"],["ez_bar","EZ Bar"],["smith_machine","Smith Machine"],["trap_bar","Trap Bar"]];
const MUSCLE_LABELS = { chest:"Chest", lats:"Lats", traps:"Traps", shoulders:"Shoulders", biceps:"Biceps", triceps:"Triceps", quads:"Quads", hamstrings:"Hamstrings", glutes:"Glutes", calves:"Calves", abs:"Abs", forearms:"Forearms", lower_back:"Lower Back" };
const HALF_LIFE = { chest:48, lats:48, traps:36, shoulders:42, biceps:36, triceps:36, quads:72, hamstrings:72, glutes:60, calves:36, abs:30, forearms:30, lower_back:60 };
const ALL_MUSCLES = Object.keys(HALF_LIFE);
const MAJORS = ["quads","hamstrings","lats","chest","glutes","shoulders","traps"];
const MINORS = ["biceps","triceps","calves","abs","forearms","lower_back"];
const GOAL_SCHEMES = {
  strength:    { compound:{sets:5,repRange:[3,6],targetRpe:8.5}, isolation:{sets:3,repRange:[6,10],targetRpe:8} },
  hypertrophy: { compound:{sets:4,repRange:[6,10],targetRpe:8}, isolation:{sets:3,repRange:[10,15],targetRpe:8.5} },
  endurance:   { compound:{sets:3,repRange:[12,15],targetRpe:7.5}, isolation:{sets:3,repRange:[15,20],targetRpe:7.5} }
};
// Shorter rests (v3): quicker pace throughout.
const REST_S = { strength:{compound:120,isolation:75}, hypertrophy:{compound:75,isolation:50}, endurance:{compound:45,isolation:30} };
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const STRETCH_MIN = 5; // added on top of workout time

// Stretch library: one go-to static stretch per muscle group.
const STRETCHES = {
  chest: "Doorway Pec Stretch — forearm on frame, lean through",
  lats: "Overhead Lat Stretch — grab a post, sit hips back",
  traps: "Upper Trap Stretch — ear to shoulder, gentle hand assist",
  shoulders: "Cross-Body Shoulder Stretch — pull arm across chest",
  biceps: "Wall Biceps Stretch — palm on wall behind you, turn away",
  triceps: "Overhead Triceps Stretch — elbow behind head",
  quads: "Standing Quad Stretch — heel to glute, knees together",
  hamstrings: "Standing Forward Fold — soft knees, hang heavy",
  glutes: "Figure-4 Stretch — ankle over knee, sit back",
  calves: "Wall Calf Stretch — back leg straight, heel down",
  abs: "Cobra Stretch — hips down, chest tall",
  forearms: "Wrist Flexor Stretch — palm up, fingers pulled back",
  lower_back: "Child's Pose — knees wide, arms long"
};

// ============ ENGINE ============
function computeRecovery(sessions, now = new Date()) {
  const result = {};
  ALL_MUSCLES.forEach(m => result[m] = { recoveryPct: 100, hoursSince: null, f: 0 });
  const cutoff = now.getTime() - 10 * 864e5;
  for (const s of sessions) {
    const t = new Date(s.date).getTime();
    if (t < cutoff || t > now.getTime()) continue;
    const hrs = (now.getTime() - t) / 36e5;
    for (const ex of s.exercises || []) {
      const n = (ex.sets || []).length;
      if (!n) continue;
      const avgRpe = ex.sets.reduce((a, st) => a + (st.rpe || 8), 0) / n;
      const stim = n * Math.min(1.2, Math.max(0.4, avgRpe / 10)) * (ex.category === "compound" ? 1.15 : 1);
      const touches = [[ex.primary, 1], ...(ex.secondary || []).map(m => [m, 0.5])];
      for (const [m, w] of touches) {
        if (!HALF_LIFE[m]) continue;
        result[m].f += stim * w * Math.pow(0.5, hrs / HALF_LIFE[m]);
        if (result[m].hoursSince === null || hrs < result[m].hoursSince) result[m].hoursSince = hrs;
      }
    }
  }
  for (const m of ALL_MUSCLES) result[m].recoveryPct = Math.round(Math.max(0, Math.min(100, 100 * (1 - Math.min(1, result[m].f / 6)))));
  return result;
}

function lastPerf(name, sessions) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const ex = (sessions[i].exercises || []).find(e => e.exerciseName === name);
    if (ex && ex.sets?.length) return ex.sets;
  }
  return null;
}

function recommend(ex, sessions, goal, adj = {}, deload = false) {
  const scheme = (GOAL_SCHEMES[goal] || GOAL_SCHEMES.hypertrophy)[ex.category];
  const [lo, hi] = scheme.repRange;
  const bw = ex.equipment.includes("bodyweight");
  const small = ["biceps","triceps","shoulders","calves","forearms","abs"].includes(ex.primary) || ex.equipment.includes("cable") || ex.equipment.includes("dumbbell");
  const inc = bw ? 0 : (ex.unilateral || small ? 2.5 : 5);
  let sets = scheme.sets;
  const vm = (adj.muscleVolumeMultiplier || {})[ex.primary];
  if (vm) sets = Math.max(2, Math.round(sets * vm));
  if (deload) sets = Math.max(2, Math.round(sets * 0.6));
  const last = lastPerf(ex.name, sessions);
  const rpeT = deload ? Math.max(6, scheme.targetRpe - 1.5) : scheme.targetRpe;
  if (!last) return { sets, reps: lo, rpe: rpeT, weight: null, note: "First time — start conservative, calibrate by feel." };
  const avgRpe = last.reduce((a, s) => a + (s.rpe || 8), 0) / last.length;
  const maxReps = Math.max(...last.map(s => s.reps || 0));
  const lastW = last[last.length - 1].weight ?? null;
  let w = lastW, reps = Math.max(lo, Math.min(hi, maxReps)), note;
  if (deload) { w = lastW != null ? Math.round(lastW * 0.85 / 2.5) * 2.5 : null; note = "Deload — lighter load, crisp form."; }
  else if (avgRpe <= scheme.targetRpe - 0.5 && maxReps >= hi) { w = lastW != null ? lastW + inc : null; reps = lo; note = `Easy last time (RPE ${avgRpe.toFixed(1)}) — adding ${inc || "reps"}${inc ? " lb" : ""}.`; }
  else if (avgRpe <= scheme.targetRpe && maxReps < hi) { reps = Math.min(hi, maxReps + 1); note = "Adding a rep — room left under target effort."; }
  else if (avgRpe >= scheme.targetRpe + 1.5) { w = lastW != null ? Math.max(0, lastW - inc) : null; note = `Ran hot last time (RPE ${avgRpe.toFixed(1)}) — backing off.`; }
  else note = "Hold steady — same target, beat your RPE.";
  return { sets, reps, rpe: rpeT, weight: w, note };
}

function setMinutes(sets, restS) { return (sets * (40 + restS) + 60) / 60; }

// v3 generator: always 4-5 exercises, difficulty tiers, and fits within ±5 min of target.
function generateWorkout({ sessions, equipment, minutes, goal, adj = {}, now = new Date() }) {
  const recovery = computeRecovery(sessions, now);
  const deloadSet = new Set(adj.deloadMuscles || []);
  const avail = new Set(["bodyweight", ...equipment]);
  const fits = e => e.equipment.every(q => avail.has(q));
  const rank = list => list.filter(m => recovery[m].recoveryPct >= 40).sort((a, b) => (recovery[b].recoveryPct - recovery[a].recoveryPct) || ((recovery[b].hoursSince ?? 999) - (recovery[a].hoursSince ?? 999)));
  const order = [...rank(MAJORS), ...rank(MINORS)];
  const pool = LIBRARY.filter(fits);
  const recent = new Set(sessions.slice(-2).flatMap(s => (s.exercises || []).map(e => e.exerciseName)));
  const targetCount = minutes >= 55 ? 5 : 4;

  // Pick exercises: cycle muscle order, allowing a 2nd pick per top muscle if we run short.
  const picked = [];
  const perMuscle = {};
  let pass = 0;
  while (picked.length < targetCount && pass < 3) {
    for (const muscle of order) {
      if (picked.length >= targetCount) break;
      if ((perMuscle[muscle] || 0) > pass) continue;
      const cands = pool.filter(e => e.primary === muscle && !picked.includes(e))
        .sort((a, b) => ((b.category === "compound") - (a.category === "compound")) || ((!recent.has(b.name)) - (!recent.has(a.name))));
      if (!cands.length) continue;
      picked.push(cands[0]);
      perMuscle[muscle] = (perMuscle[muscle] || 0) + 1;
    }
    pass++;
  }

  // Order for the session: compounds first (heavy work while fresh), isolation after.
  picked.sort((a, b) => ((b.category === "compound") - (a.category === "compound")));

  // Base recommendations + difficulty tiers relative to this workout:
  // first ~40% = Heavy, last exercise = Light, middle = Moderate.
  const items = picked.map((ex, i) => {
    const deload = deloadSet.has(ex.primary);
    const r = recommend(ex, sessions, goal, adj, deload);
    const frac = picked.length > 1 ? i / (picked.length - 1) : 0;
    const tier = frac < 0.4 ? "Heavy" : frac < 0.99 ? "Moderate" : "Light";
    const rpeAdj = tier === "Heavy" ? 0 : tier === "Moderate" ? -0.5 : -1;
    return {
      ...ex, ...r,
      tier,
      rpe: Math.max(6, r.rpe + rpeAdj),
      restSeconds: REST_S[goal]?.[ex.category] ?? 50,
      recPct: recovery[ex.primary].recoveryPct
    };
  });

  // Fit total time into [minutes-5, minutes+5] (warm-up 6 min included in estimate;
  // stretching is on top and not counted here).
  const WARMUP = 6;
  const total = () => WARMUP + items.reduce((a, it) => a + setMinutes(it.sets, it.restSeconds), 0);
  let guard = 40;
  // Too long: trim sets from the end (lightest work first), floor of 2 sets each.
  while (total() > minutes + 5 && guard-- > 0) {
    const cut = [...items].reverse().find(it => it.sets > 2);
    if (!cut) { if (items.length > 4) items.pop(); else break; }
    else cut.sets -= 1;
  }
  // Too short: add sets to the heaviest work first, cap +2 over base scheme.
  guard = 40;
  while (total() < minutes - 5 && guard-- > 0) {
    const capFor = it => (GOAL_SCHEMES[goal] || GOAL_SCHEMES.hypertrophy)[it.category].sets + 2;
    const grow = items.find(it => it.sets < capFor(it));
    if (!grow) break;
    grow.sets += 1;
  }

  // Cool-down stretches: 5 stretches, 60s each, targeting what was trained (fill from secondaries).
  const trained = [...new Set(items.flatMap(it => [it.primary, ...(it.secondary || [])]))].filter(m => STRETCHES[m]);
  const stretches = trained.slice(0, 5);
  while (stretches.length < 5) {
    const filler = ["hamstrings","chest","lats","quads","glutes","shoulders"].find(m => !stretches.includes(m));
    if (!filler) break;
    stretches.push(filler);
  }

  return {
    estimatedMinutes: Math.round(total() * 10) / 10,
    stretchMinutes: STRETCH_MIN,
    stretches: stretches.map(m => ({ muscle: m, name: STRETCHES[m], seconds: 60 })),
    exercises: items
  };
}

function generatePlan({ sessions, equipment, minutes, goal, adj, daysPerWeek }) {
  const sim = [...sessions];
  const days = [];
  const today = new Date();
  for (let i = 0; i < daysPerWeek; i++) {
    const offset = Math.round(i * 7 / daysPerWeek);
    const date = new Date(today.getTime() + offset * 864e5);
    const w = generateWorkout({ sessions: sim, equipment, minutes, goal, adj, now: date });
    days.push({ offset, date, ...w });
    sim.push({
      id: "sim_" + i, date: date.toISOString(),
      exercises: w.exercises.map(ex => ({
        exerciseName: ex.name, primary: ex.primary, secondary: ex.secondary, category: ex.category,
        sets: Array.from({ length: ex.sets }, () => ({ weight: ex.weight, reps: ex.reps, rpe: 8 }))
      }))
    });
  }
  return days;
}

// ============ EXERCISE PICTOGRAMS ============
// Every exercise maps to a movement pattern; each pattern gets a small
// stick-figure preview drawn in chalk strokes.
function patternFor(ex) {
  const n = ex.name.toLowerCase();
  if (/(plank|crunch|sit-up|situp|twist|rollout|leg raise|toes-to-bar|v-up|dragon|woodchop|pallof|get-up|mountain|climber|rotation)/.test(n)) return "core";
  if (/(calf|jump rope)/.test(n)) return "calf";
  if (/(hip thrust|glute bridge|frog pump|bridge|kickback.*glute|donkey kick|pull-through|swing)/.test(n)) return "bridge";
  if (/(lunge|split squat|step-up|curtsy)/.test(n)) return "lunge";
  if (/(squat|leg press|thruster)/.test(n)) return "squat";
  if (/(deadlift|rdl|romanian|good morning|stiff-leg|hinge)/.test(n)) return "hinge";
  if (/(leg curl|nordic|glute-ham)/.test(n)) return "legcurl";
  if (/(leg extension|sissy)/.test(n)) return "legext";
  if (/(pull-up|chin-up|pulldown|dead hang)/.test(n)) return "pullup";
  if (/(row|face pull)/.test(n)) return "row";
  if (/(shrug|carry|pinch)/.test(n)) return "carry";
  if (/(curl)/.test(n)) return "curl";
  if (/(pushdown|skull|triceps|kickback|dip|jm press|tate)/.test(n)) return "tricep";
  if (/(lateral raise|front raise|pull-apart|rear delt|reverse pec|lu raise|cuban)/.test(n)) return "raise";
  if (/(overhead|shoulder press|arnold|push press|landmine|military|behind-the-neck|bradford|clean and press)/.test(n)) return "ohp";
  if (/(bench|chest press|push-up|pushup|fly|crossover|pec deck|svend|floor press)/.test(n)) return "bench";
  if (ex.primary === "chest") return "bench";
  if (ex.primary === "lats") return "row";
  if (ex.primary === "shoulders") return "ohp";
  if (ex.primary === "quads") return "squat";
  if (ex.primary === "hamstrings") return "hinge";
  if (ex.primary === "glutes") return "bridge";
  if (ex.primary === "abs") return "core";
  return "carry";
}

function ExercisePic({ pattern, size = 58 }) {
  const s = { stroke: "#EDEEF0", strokeWidth: 4, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
  const w = { stroke: "#E23D28", strokeWidth: 5, strokeLinecap: "round", fill: "none" };
  const bench = { stroke: "#5A6172", strokeWidth: 5, strokeLinecap: "round", fill: "none" };
  const floor = { stroke: "#5A6172", strokeWidth: 3, strokeLinecap: "round", fill: "none" };
  const DUR = "1.7s";
  const SPL = { calcMode: "spline", keyTimes: "0;0.5;1", keySplines: "0.42 0 0.58 1;0.42 0 0.58 1" };

  // Morph: path that eases between pose a and pose b (same command structure required).
  const Mo = ({ a, b, st }) => (
    <path d={a} style={st}>
      <animate attributeName="d" values={`${a};${b};${a}`} dur={DUR} repeatCount="indefinite" {...SPL} />
    </path>
  );
  // Dot: circle that eases between position a=[x,y] and b=[x,y].
  const Dot = ({ a, b, r = 5, st = w }) => (
    <circle cx={a[0]} cy={a[1]} r={r} style={st}>
      <animate attributeName="cx" values={`${a[0]};${b[0]};${a[0]}`} dur={DUR} repeatCount="indefinite" {...SPL} />
      <animate attributeName="cy" values={`${a[1]};${b[1]};${a[1]}`} dur={DUR} repeatCount="indefinite" {...SPL} />
    </circle>
  );
  const Head = ({ a, b }) => <Dot a={a} b={b || a} r={6} st={{ ...s, strokeWidth: 3.5 }} />;

  const art = {
    // Lying press: bar descends to chest and drives up, elbows flaring.
    bench: <g>
      <line x1="15" y1="70" x2="85" y2="70" style={bench} />
      <Head a={[30,58]} />
      <line x1="38" y1="60" x2="72" y2="60" style={s} />
      <Mo st={s} a="M50,58 L49,46 L50,35" b="M50,58 L44,52 L47,46" />
      <Mo st={s} a="M62,58 L61,46 L62,35" b="M62,58 L56,52 L59,46" />
      <Mo st={w} a="M34,33 L78,33" b="M31,45 L75,45" />
    </g>,
    // Overhead press: bar from chin to lockout.
    ohp: <g>
      <Head a={[50,42]} />
      <line x1="50" y1="48" x2="50" y2="68" style={s} />
      <path d="M50,68 L42,88 M50,68 L58,88" style={s} />
      <Mo st={s} a="M50,54 L41,46 L42,36" b="M50,54 L44,38 L43,24" />
      <Mo st={s} a="M50,54 L59,46 L58,36" b="M50,54 L56,38 L57,24" />
      <Mo st={w} a="M30,34 L70,34" b="M28,22 L72,22" />
    </g>,
    // Squat: whole body sinks and rises with the bar.
    squat: <g>
      <Head a={[48,20]} b={[46,32]} />
      <Mo st={s} a="M48,26 L48,52" b="M46,38 L45,56" />
      <Mo st={s} a="M48,52 L45,68 L44,86" b="M45,56 L34,62 L38,86" />
      <Mo st={s} a="M48,52 L53,68 L56,86" b="M45,56 L57,64 L54,86" />
      <Mo st={s} a="M48,34 L38,29" b="M46,44 L37,40" />
      <Mo st={s} a="M48,34 L58,29" b="M46,44 L56,41" />
      <Mo st={w} a="M26,26 L70,26" b="M24,38 L68,38" />
    </g>,
    // Hinge: torso pivots from bottom to lockout.
    hinge: <g>
      <Head a={[34,36]} b={[52,20]} />
      <Mo st={s} a="M38,41 L58,50" b="M54,26 L58,50" />
      <path d="M58,50 L57,84" style={s} />
      <line x1="58" y1="66" x2="68" y2="84" style={s} />
      <Mo st={s} a="M42,44 L40,64" b="M55,32 L54,52" />
      <Mo st={s} a="M48,47 L46,64" b="M58,34 L58,52" />
      <Mo st={w} a="M28,66 L58,66" b="M40,54 L70,54" />
    </g>,
    // Bent row: bar pulls from hang to ribs.
    row: <g>
      <Head a={[32,32]} />
      <path d="M36,37 L58,44 L59,84" style={s} />
      <line x1="59" y1="62" x2="71" y2="84" style={s} />
      <Mo st={s} a="M42,42 L40,62" b="M42,42 L42,50" />
      <Mo st={s} a="M48,44 L46,62" b="M48,44 L48,52" />
      <Mo st={w} a="M28,64 L58,64" b="M30,52 L60,52" />
    </g>,
    // Pull-up: body rises to the fixed bar.
    pullup: <g>
      <line x1="20" y1="16" x2="80" y2="16" style={w} />
      <Head a={[50,46]} b={[50,30]} />
      <Mo st={s} a="M50,52 L50,70" b="M50,36 L50,58" />
      <Mo st={s} a="M50,54 L38,32 L36,18" b="M50,40 L38,26 L36,18" />
      <Mo st={s} a="M50,54 L62,32 L64,18" b="M50,40 L62,26 L64,18" />
      <Mo st={s} a="M50,70 L44,86 M50,70 L56,86" b="M50,58 L44,72 M50,58 L56,72" />
    </g>,
    // Curl: forearms swing from extended to contracted.
    curl: <g>
      <Head a={[50,24]} />
      <line x1="50" y1="30" x2="50" y2="62" style={s} />
      <path d="M50,62 L42,86 M50,62 L58,86" style={s} />
      <line x1="50" y1="40" x2="42" y2="52" style={s} />
      <line x1="50" y1="40" x2="58" y2="52" style={s} />
      <Mo st={s} a="M42,52 L41,68" b="M42,52 L45,38" />
      <Mo st={s} a="M58,52 L59,68" b="M58,52 L55,38" />
      <Dot a={[41,72]} b={[46,34]} />
      <Dot a={[59,72]} b={[54,34]} />
    </g>,
    // Overhead triceps extension: forearm hinges at the elbow.
    tricep: <g>
      <Head a={[48,26]} />
      <line x1="48" y1="32" x2="48" y2="64" style={s} />
      <path d="M48,64 L40,86 M48,64 L56,86" style={s} />
      <line x1="48" y1="40" x2="62" y2="32" style={s} />
      <Mo st={s} a="M62,32 L56,18" b="M62,32 L66,14" />
      <Dot a={[54,15]} b={[67,10]} />
    </g>,
    // Lateral raise: arms sweep from sides to shoulder height.
    raise: <g>
      <Head a={[50,24]} />
      <line x1="50" y1="30" x2="50" y2="62" style={s} />
      <path d="M50,62 L42,86 M50,62 L58,86" style={s} />
      <Mo st={s} a="M50,40 L40,58" b="M50,40 L26,38" />
      <Mo st={s} a="M50,40 L60,58" b="M50,40 L74,38" />
      <Dot a={[38,62]} b={[21,38]} />
      <Dot a={[62,62]} b={[79,38]} />
    </g>,
    // Lunge: descent into the split stance and back up.
    lunge: <g>
      <Head a={[48,20]} b={[48,30]} />
      <Mo st={s} a="M48,26 L48,50" b="M48,36 L48,56" />
      <Mo st={s} a="M48,50 L36,64 L34,86" b="M48,56 L32,66 L32,86" />
      <Mo st={s} a="M48,50 L60,66 L72,86" b="M48,56 L64,72 L74,86" />
      <Dot a={[38,42]} b={[38,50]} />
      <Dot a={[58,42]} b={[58,50]} />
      <Mo st={s} a="M48,36 L40,44" b="M48,44 L40,52" />
      <Mo st={s} a="M48,36 L56,44" b="M48,44 L56,52" />
    </g>,
    // Hip thrust: hips drive up to the bar.
    bridge: <g>
      <line x1="14" y1="82" x2="86" y2="82" style={floor} />
      <Head a={[24,66]} />
      <Mo st={s} a="M30,68 L48,66 L64,68 L68,82" b="M30,68 L48,50 L64,58 L68,82" />
      <Mo st={w} a="M40,58 L64,58" b="M40,42 L64,42" />
    </g>,
    // Calf raise: whole body lifts onto the toes.
    calf: <g>
      <line x1="36" y1="90" x2="64" y2="90" style={floor} />
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur={DUR} repeatCount="indefinite" {...SPL} />
        <Head a={[50,22]} />
        <line x1="50" y1="28" x2="50" y2="58" style={s} />
        <line x1="50" y1="36" x2="42" y2="46" style={s} />
        <line x1="50" y1="36" x2="58" y2="46" style={s} />
        <path d="M50,58 L45,74 L45,84 M50,58 L55,74 L55,84" style={s} />
      </g>
    </g>,
    // Lying leg curl: heel sweeps toward the glutes.
    legcurl: <g>
      <line x1="14" y1="74" x2="86" y2="74" style={bench} />
      <Head a={[26,62]} />
      <path d="M34,64 L58,64" style={s} />
      <Mo st={s} a="M58,64 L76,62" b="M58,64 L68,46" />
      <Dot a={[80,61]} b={[70,42]} />
    </g>,
    // Leg extension: shin kicks from hanging to horizontal.
    legext: <g>
      <Head a={[40,22]} />
      <path d="M40,28 L40,58" style={s} />
      <path d="M40,58 L58,58" style={s} />
      <path d="M40,58 L40,84" style={floor} />
      <Mo st={s} a="M58,58 L60,76" b="M58,58 L78,52" />
      <Dot a={[60,80]} b={[82,50]} />
    </g>,
    // Crunch: shoulders curl off the floor.
    core: <g>
      <line x1="14" y1="82" x2="86" y2="82" style={floor} />
      <Head a={[28,62]} b={[36,48]} />
      <Mo st={s} a="M34,66 L52,72" b="M41,53 L52,72" />
      <path d="M52,72 L58,82 M52,72 L70,72 L78,82" style={s} />
      <Mo st={s} a="M36,68 L44,58" b="M43,56 L50,48" />
    </g>,
    // Farmer's carry: steady bob with weights in hand.
    carry: <g>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -2.5;0 0" dur="0.9s" repeatCount="indefinite" {...SPL} />
        <Head a={[50,20]} />
        <line x1="50" y1="26" x2="50" y2="60" style={s} />
        <line x1="50" y1="36" x2="37" y2="52" style={s} />
        <line x1="50" y1="36" x2="63" y2="52" style={s} />
        <Dot a={[35,58]} b={[35,58]} r={6} />
        <Dot a={[65,58]} b={[65,58]} r={6} />
      </g>
      <Mo st={s} a="M50,60 L41,72 L40,86" b="M50,60 L45,74 L48,86" />
      <Mo st={s} a="M50,60 L59,74 L62,86" b="M50,60 L55,72 L54,86" />
    </g>
  };
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size, background: "#262B35", border: "1px solid #323844", borderRadius: 10, flexShrink: 0 }}>
      {art[pattern] || art.carry}
    </svg>
  );
}

// ============ STORAGE ============
const KEY = "fitforge-state";
async function loadState() { try { const r = await window.storage.get(KEY); return r ? JSON.parse(r.value) : null; } catch { return null; } }
async function saveState(s) { try { await window.storage.set(KEY, JSON.stringify(s)); } catch (e) { console.error("save failed", e); } }

// ============ STYLES ============
const C = { bg:"#14161A", panel:"#1E222A", raised:"#262B35", line:"#323844", chalk:"#EDEEF0", dim:"#9AA1AD", red:"#E23D28", amber:"#F4B400", green:"#4C9A6A", blue:"#4C8DFF" };
const font = { display: "'Oswald', 'Arial Narrow', sans-serif", body: "'Inter', system-ui, sans-serif", mono: "'JetBrains Mono', 'Courier New', monospace" };
const card = { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 16, marginBottom: 14 };
const h3s = { fontFamily: font.display, textTransform: "uppercase", letterSpacing: "0.03em", fontSize: "0.95rem", margin: "0 0 4px", fontWeight: 600 };
const pillStyle = sel => ({ border: `1px solid ${sel ? C.red : C.line}`, background: sel ? "rgba(226,61,40,0.12)" : C.raised, color: sel ? C.chalk : C.dim, borderRadius: 999, padding: "8px 14px", fontSize: "0.85rem", fontFamily: font.mono, cursor: "pointer" });
const inputStyle = { background: C.bg, border: `1px solid ${C.line}`, color: C.chalk, borderRadius: 6, padding: "8px 4px", fontFamily: font.mono, width: "100%", textAlign: "center", fontSize: "0.9rem" };
const btnPrimary = { background: C.red, color: "#fff", border: "none", borderRadius: 8, padding: "14px 20px", fontFamily: font.display, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.04em", width: "100%", cursor: "pointer" };

const TIER_COLORS = { Heavy: "#E23D28", Moderate: "#F4B400", Light: "#4C8DFF" };
function recColor(pct) { return pct >= 75 ? C.green : pct >= 40 ? C.amber : C.red; }
function fmtRest(s) { return s >= 60 ? `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}` : `0:${String(s).padStart(2,"0")}`; }

// ============ BODY MAP (v4: Fitbod-style paneled figure) ============
// One large figure per view with a flip control. Muscles are rounded panels
// separated by dark seams. Color runs from slate gray (fresh) to red (fatigued).
function lerpColor(pct) {
  const t = Math.max(0, Math.min(1, (100 - pct) / 100));
  const g = [126, 134, 152], r = [210, 84, 96];
  const c = g.map((v, i) => Math.round(v + (r[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function BodyMap({ recovery, onSelect, selected, view, setView }) {
  const BG = "#14161A";
  const bodyFill = "#31364200";
  const silhouette = { fill: "#343A48", stroke: "#4A5164", strokeWidth: 2 };
  const panel = m => ({
    fill: lerpColor(recovery[m]?.recoveryPct ?? 100),
    stroke: selected === m ? "#EDEEF0" : BG,
    strokeWidth: selected === m ? 2.5 : 3,
    strokeLinejoin: "round",
    cursor: "pointer",
    opacity: 0.95
  });
  const seam = { stroke: BG, strokeWidth: 2, fill: "none", opacity: 0.85, pointerEvents: "none" };
  const P = ({ d, m }) => <path d={d} style={panel(m)} onClick={() => onSelect(m)} />;
  const Pe = ({ cx, cy, rx, ry, m }) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} style={panel(m)} onClick={() => onSelect(m)} />;

  // Shared body silhouette: half path mirrored around x=150.
  const halfBody = "M150,86 C138,86 128,90 122,96 C104,104 90,114 84,128 C76,140 72,158 70,178 C68,198 64,222 60,248 C57,268 54,286 53,300 C50,312 52,322 58,326 C66,330 72,322 74,312 C78,296 82,276 85,256 C88,238 90,222 92,208 C94,196 97,186 100,178 C100,196 100,214 101,232 C102,252 104,270 108,284 C104,300 100,320 98,342 C96,368 96,396 98,420 C99,442 102,462 106,480 C109,500 112,522 114,542 C114,554 112,564 106,570 C112,578 124,580 134,577 C138,570 139,558 139,546 C140,524 141,500 141,478 C141,456 141,432 142,410 C143,384 144,360 146,338 C148,326 150,318 150,312 L150,86 Z";

  const Silhouette = () => (
    <g>
      <ellipse cx="150" cy="54" rx="24" ry="30" style={silhouette} />
      <path d="M134,76 C136,90 164,90 166,76 L162,68 L138,68 Z" style={silhouette} />
      <path d={halfBody} style={silhouette} />
      <g transform="scale(-1,1) translate(-300,0)"><path d={halfBody} style={silhouette} /></g>
    </g>
  );

  // Panels present on both sides get mirrored via a transform group.
  const BackPanels = () => (
    <g>
      {/* trapezius — center shield down the spine */}
      <P m="traps" d="M150,90 C164,94 178,102 188,112 C184,138 173,168 161,198 C157,210 152,220 150,226 C148,220 143,210 139,198 C127,168 116,138 112,112 C122,102 136,94 150,90 Z" />
      <path d="M150,94 L150,222" style={seam} />
      {[0,1].map(side => (
        <g key={side} transform={side ? "scale(-1,1) translate(-300,0)" : undefined}>
          {/* rear deltoid cap */}
          <P m="shoulders" d="M88,120 C77,128 72,144 75,160 C84,167 97,166 105,157 C107,142 103,127 96,119 C93,117 90,118 88,120 Z" />
          {/* triceps panel with seam */}
          <P m="triceps" d="M76,166 C71,183 69,201 71,218 C76,228 85,229 91,222 C95,205 95,186 93,170 C88,161 80,160 76,166 Z" />
          <path d="M83,169 C81,187 81,205 85,220" style={seam} />
          {/* forearm */}
          <P m="forearms" d="M64,234 C59,253 56,274 55,292 C57,301 64,303 69,297 C73,279 76,258 77,240 C74,231 67,229 64,234 Z" />
          {/* latissimus fan */}
          <P m="lats" d="M108,144 C120,157 133,167 143,173 L144,182 C143,205 139,227 130,244 C117,237 107,220 103,197 C101,179 103,160 108,144 Z" />
          {/* erector column */}
          <P m="lower_back" d="M140,236 L148,238 L148,292 L137,289 C135,272 136,253 140,236 Z" />
          {/* glute — big rounded panel */}
          <P m="glutes" d="M117,298 C106,304 101,317 103,334 C106,351 118,360 135,358 C145,353 149,340 148,323 C146,306 132,294 117,298 Z" />
          {/* hamstring panel with two seams */}
          <P m="hamstrings" d="M104,366 C114,359 129,359 137,366 C139,393 139,421 135,447 C132,463 126,474 118,478 C110,472 104,457 101,438 C98,413 99,388 104,366 Z" />
          <path d="M114,364 C112,396 112,430 115,464 M127,363 C127,396 127,430 126,462" style={seam} />
          {/* gastrocnemius — twin heads */}
          <Pe m="calves" cx="117" cy="516" rx="13" ry="37" />
          <Pe m="calves" cx="138" cy="509" rx="9" ry="30" />
        </g>
      ))}
    </g>
  );

  const FrontPanels = () => (
    <g>
      {/* upper trap slopes visible from the front */}
      {[0,1].map(side => (
        <g key={side} transform={side ? "scale(-1,1) translate(-300,0)" : undefined}>
          <P m="traps" d="M122,96 C130,91 140,88 148,88 L148,98 C138,100 128,105 120,112 C118,106 119,100 122,96 Z" />
          {/* front deltoid */}
          <P m="shoulders" d="M88,120 C77,128 72,144 75,160 C84,167 97,166 105,157 C107,142 103,127 96,119 C93,117 90,118 88,120 Z" />
          {/* pectoral fan */}
          <P m="chest" d="M110,118 C124,109 140,106 148,108 L148,158 C140,172 122,174 110,163 C103,148 104,131 110,118 Z" />
          {/* biceps */}
          <P m="biceps" d="M76,166 C71,183 69,201 71,218 C76,228 85,229 91,222 C95,205 95,186 93,170 C88,161 80,160 76,166 Z" />
          {/* forearm */}
          <P m="forearms" d="M64,234 C59,253 56,274 55,292 C57,301 64,303 69,297 C73,279 76,258 77,240 C74,231 67,229 64,234 Z" />
          {/* oblique strip */}
          <P m="abs" d="M122,192 C127,189 130,192 130,198 C129,222 129,246 133,266 C126,260 119,247 116,231 C115,217 118,202 122,192 Z" />
          {/* quad panel with seams */}
          <P m="quads" d="M102,326 C113,317 130,317 138,326 C141,355 141,388 136,416 C133,436 127,450 118,455 C109,448 102,432 99,411 C96,382 97,352 102,326 Z" />
          <path d="M112,322 C110,358 110,398 113,442 M126,321 C126,358 126,398 124,440" style={seam} />
        </g>
      ))}
      {/* rectus abdominis — center block with 6-pack seams */}
      <P m="abs" d="M133,176 L167,176 C170,206 170,240 166,268 C162,288 157,302 150,308 C143,302 138,288 134,268 C130,240 130,206 133,176 Z" />
      <path d="M150,178 L150,304 M134,204 L166,204 M133,230 L167,230 M134,256 L166,256" style={seam} />
    </g>
  );

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox="0 0 300 600" style={{ width: "100%", maxWidth: 300, display: "block", margin: "0 auto" }}>
        <Silhouette />
        {view === "back" ? <BackPanels /> : <FrontPanels />}
      </svg>
      <button onClick={() => setView(view === "back" ? "front" : "back")}
        title="Flip view"
        style={{ position: "absolute", left: 4, bottom: 4, width: 46, height: 46, borderRadius: "50%", background: "#262B35", border: "1px solid #323844", color: "#9AA1AD", fontSize: "1.2rem", cursor: "pointer" }}>
        &#10561;
      </button>
      <div style={{ position: "absolute", right: 4, bottom: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#9AA1AD", textTransform: "uppercase", letterSpacing: "0.1em" }}>{view}</div>
    </div>
  );
}

// ============ REST TIMER ============
function RestTimer({ seconds, label, onDismiss }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    const t = setInterval(() => setLeft(p => (p <= 1 ? (clearInterval(t), 0) : p - 1)), 1000);
    return () => clearInterval(t);
  }, [seconds, label]);
  const pct = seconds ? (left / seconds) * 100 : 0;
  return (
    <div style={{ position: "fixed", bottom: 78, left: 12, right: 12, maxWidth: 536, margin: "0 auto", background: C.raised, border: `1px solid ${left === 0 ? C.green : C.line}`, borderRadius: 12, padding: "12px 16px", zIndex: 30, boxShadow: "0 6px 24px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: font.mono, fontSize: "0.65rem", color: C.dim, textTransform: "uppercase", letterSpacing: "0.08em" }}>{left === 0 ? "Rest complete — go" : "Resting"}</div>
          <div style={{ fontSize: "0.8rem", color: C.chalk }}>{label}</div>
        </div>
        <div style={{ fontFamily: font.mono, fontSize: "1.7rem", fontWeight: 600, color: left === 0 ? C.green : C.chalk }}>{fmtRest(left)}</div>
        <button onClick={onDismiss} style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.dim, borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>{left === 0 ? "Done" : "Skip"}</button>
      </div>
      <div style={{ height: 4, background: C.line, borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: left === 0 ? C.green : C.red, transition: "width 1s linear" }} />
      </div>
    </div>
  );
}

// ============ APP ============
export default function FitForge() {
  const [screen, setScreen] = useState("today");
  const [duration, setDuration] = useState(60);
  const [goal, setGoal] = useState("hypertrophy");
  const [equipment, setEquipment] = useState(["dumbbell", "bench"]);
  const [sessions, setSessions] = useState([]);
  const [adj, setAdj] = useState({ muscleVolumeMultiplier: {}, deloadMuscles: [], notes: [] });
  const [workout, setWorkout] = useState(null);
  const [logs, setLogs] = useState({});
  const [done, setDone] = useState({});
  const [plan, setPlan] = useState(null);
  const [planDays, setPlanDays] = useState(4);
  const [loaded, setLoaded] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [toast, setToast] = useState(null);
  const [timer, setTimer] = useState(null);
  const [selMuscle, setSelMuscle] = useState(null);
  const [bodyView, setBodyView] = useState("front");
  const [elapsed, setElapsed] = useState(0);        // workout stopwatch, seconds
  const [running, setRunning] = useState(false);

  // Workout stopwatch tick
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    loadState().then(s => {
      if (s) {
        setGoal(s.goal || "hypertrophy"); setEquipment(s.equipment || ["dumbbell","bench"]);
        setSessions(s.sessions || []); setAdj(s.adj || { muscleVolumeMultiplier: {}, deloadMuscles: [], notes: [] });
        if (s.plan) setPlan(s.plan.map(d => ({ ...d, date: new Date(d.date) })));
        if (s.planDays) setPlanDays(s.planDays);
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((patch) => {
    saveState({ goal, equipment, sessions, adj, plan: plan ? plan.map(d => ({ ...d, date: (d.date instanceof Date ? d.date : new Date(d.date)).toISOString() })) : null, planDays, ...patch });
  }, [goal, equipment, sessions, adj, plan, planDays]);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const startWorkout = (w) => {
    setWorkout(w);
    const init = {}, d = {};
    w.exercises.forEach((ex, i) => {
      init[i] = Array.from({ length: ex.sets }, () => ({ weight: ex.weight ?? "", reps: ex.reps, rpe: "" }));
      d[i] = Array.from({ length: ex.sets }, () => false);
    });
    setLogs(init); setDone(d); setScreen("today");
    setElapsed(0); setRunning(true);
  };

  const gen = () => startWorkout(generateWorkout({ sessions, equipment, minutes: duration, goal, adj }));

  const genPlan = () => {
    const p = generatePlan({ sessions, equipment, minutes: duration, goal, adj, daysPerWeek: planDays });
    setPlan(p);
    persist({ plan: p.map(d => ({ ...d, date: d.date.toISOString() })) });
  };

  const completeSet = (exIdx, setIdx, ex) => {
    const wasDone = done[exIdx]?.[setIdx];
    setDone(p => { const n = { ...p, [exIdx]: [...p[exIdx]] }; n[exIdx][setIdx] = !n[exIdx][setIdx]; return n; });
    if (!wasDone) setTimer({ seconds: ex.restSeconds, label: `${ex.name} — set ${setIdx + 1} done`, key: Date.now() });
  };

  const finish = () => {
    const exercises = [];
    (workout?.exercises || []).forEach((ex, i) => {
      const sets = (logs[i] || []).map(s => ({ weight: parseFloat(s.weight) || null, reps: parseInt(s.reps) || null, rpe: parseFloat(s.rpe) || null })).filter(s => s.reps);
      if (sets.length) exercises.push({ exerciseName: ex.name, primary: ex.primary, secondary: ex.secondary, category: ex.category, sets });
    });
    if (!exercises.length) { showToast("Log at least one set first."); return; }
    const actualMinutes = elapsed >= 60 ? Math.round(elapsed / 60) : duration;
    const next = [...sessions, { id: "s_" + Date.now(), date: new Date().toISOString(), durationMinutes: actualMinutes, exercises }];
    setSessions(next); setWorkout(null); setLogs({}); setDone({}); setTimer(null);
    setRunning(false); setElapsed(0);
    persist({ sessions: next });
    showToast("Workout logged. Recovery updated.");
  };

  const runReview = async () => {
    const cutoff = Date.now() - 14 * 864e5;
    const recent = sessions.filter(s => new Date(s.date).getTime() >= cutoff);
    if (!recent.length) { showToast("No sessions in the last 14 days to review."); return; }
    setReviewing(true);
    try {
      const byM = {};
      recent.forEach(s => (s.exercises || []).forEach(ex => {
        byM[ex.primary] = byM[ex.primary] || { sets: 0, rpes: [] };
        byM[ex.primary].sets += ex.sets.length;
        ex.sets.forEach(st => st.rpe && byM[ex.primary].rpes.push(st.rpe));
      }));
      const summary = Object.entries(byM).map(([m, d]) => ({ muscle: m, totalSets: d.sets, avgRpe: d.rpes.length ? +(d.rpes.reduce((a,b)=>a+b,0)/d.rpes.length).toFixed(1) : null }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 800,
          system: `You are a strength coach. Return ONLY valid JSON, no markdown: {"muscleVolumeMultiplier":{"<muscle>":<0.7-1.3>},"deloadMuscles":[],"notes":["<short note>"]}. Deload only if avgRpe>=9 consistently. Raise multiplier for undertrained muscles, lower for overreached. Max 3 short notes. Goal: ${goal}.`,
          messages: [{ role: "user", content: `Last 14 days (${recent.length} sessions):\n${JSON.stringify(summary)}` }] })
      });
      const data = await res.json();
      const text = (data.content || []).map(c => c.type === "text" ? c.text : "").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      const nextAdj = {
        muscleVolumeMultiplier: parsed.muscleVolumeMultiplier || {},
        deloadMuscles: parsed.deloadMuscles || [],
        notes: [{ date: new Date().toISOString(), notes: parsed.notes || [] }, ...(adj.notes || [])].slice(0, 10)
      };
      setAdj(nextAdj); persist({ adj: nextAdj });
      showToast("AI review complete — plan adjusted.");
    } catch (e) { showToast("Review failed — try again."); }
    finally { setReviewing(false); }
  };

  const toggleEquip = code => {
    const next = equipment.includes(code) ? equipment.filter(c => c !== code) : [...equipment, code];
    setEquipment(next); persist({ equipment: next });
  };

  const recovery = computeRecovery(sessions);

  if (!loaded) return <div style={{ background: C.bg, color: C.dim, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.body }}>Loading…</div>;

  const StretchCard = ({ w }) => (
    <div style={{ ...card, borderLeft: `3px solid ${C.green}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={h3s}>Cool-down stretching</h3>
        <span style={{ fontFamily: font.mono, color: C.green, fontSize: "0.8rem" }}>+{w.stretchMinutes} min</span>
      </div>
      <p style={{ color: C.dim, fontSize: "0.78rem", margin: "2px 0 8px" }}>On top of your workout time. Hold each ~60 seconds, easy breathing.</p>
      {w.stretches.map((st, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "6px 0", borderBottom: i < w.stretches.length - 1 ? `1px solid ${C.line}` : "none", fontSize: "0.83rem" }}>
          <span>{st.name}</span>
          <span style={{ fontFamily: font.mono, color: C.dim, whiteSpace: "nowrap" }}>{MUSCLE_LABELS[st.muscle]}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ background: C.bg, color: C.chalk, minHeight: "100vh", fontFamily: font.body, paddingBottom: 100 }}>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px 4px" }}>
        <div style={{ fontFamily: font.mono, fontSize: "0.7rem", letterSpacing: "0.12em", color: C.red, textTransform: "uppercase" }}>{screen}</div>
        <h1 style={{ fontFamily: font.display, textTransform: "uppercase", fontSize: "1.5rem", margin: "0 0 12px", fontWeight: 600 }}>
          {screen === "today" ? "FitForge" : screen === "plan" ? "Weekly Routine" : screen === "recovery" ? "Muscle Recovery" : screen === "progress" ? "Progress" : "Settings"}
        </h1>

        {/* ============ TODAY ============ */}
        {screen === "today" && !workout && (
          <div style={card}>
            <h3 style={h3s}>Build a single workout</h3>
            <p style={{ color: C.dim, fontSize: "0.85rem", margin: "4px 0 10px" }}>How much time do you have? (Final plan lands within ±5 min, plus 5 min of stretching.)</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[20,30,45,60,75,90].map(m => <button key={m} style={pillStyle(duration === m)} onClick={() => setDuration(m)}>{m} min</button>)}
            </div>
            <button onClick={gen} style={{ ...btnPrimary, marginTop: 14 }}>Generate Workout</button>
            <p style={{ color: C.dim, fontSize: "0.78rem", marginTop: 10 }}>Want a full week? Head to the <b>Plan</b> tab.</p>
          </div>
        )}

        {screen === "today" && workout && (
          <>
            <div style={{ ...card, background: C.raised, display: "flex", justifyContent: "space-around", textAlign: "center" }}>
              <div>
                <span style={{ fontFamily: font.mono, color: C.dim, fontSize: "0.72rem" }}>Workout</span>
                <div style={{ fontFamily: font.display, fontSize: "1.5rem" }}>{Math.round(workout.estimatedMinutes)} min</div>
              </div>
              <div>
                <span style={{ fontFamily: font.mono, color: C.dim, fontSize: "0.72rem" }}>+ Stretch</span>
                <div style={{ fontFamily: font.display, fontSize: "1.5rem", color: C.green }}>{workout.stretchMinutes} min</div>
              </div>
              <div>
                <span style={{ fontFamily: font.mono, color: C.dim, fontSize: "0.72rem" }}>Exercises</span>
                <div style={{ fontFamily: font.display, fontSize: "1.5rem" }}>{workout.exercises.length}</div>
              </div>
            </div>
            <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderLeft: `3px solid ${running ? C.green : C.amber}` }}>
              <div>
                <div style={{ fontFamily: font.mono, fontSize: "0.62rem", color: C.dim, textTransform: "uppercase", letterSpacing: "0.1em" }}>{running ? "Workout in progress" : elapsed > 0 ? "Paused" : "Timer ready"}</div>
                <div style={{ fontFamily: font.mono, fontSize: "2rem", fontWeight: 600, color: running ? C.chalk : C.dim }}>
                  {String(Math.floor(elapsed / 3600)).padStart(1, "0") !== "0" ? String(Math.floor(elapsed / 3600)) + ":" : ""}{String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setRunning(r => !r)} style={{ width: 54, height: 54, borderRadius: "50%", border: `1px solid ${running ? C.amber : C.green}`, background: running ? "rgba(244,180,0,0.12)" : "rgba(76,154,106,0.15)", color: running ? C.amber : C.green, fontSize: "1.15rem", cursor: "pointer" }}>{running ? "❚❚" : "▶"}</button>
                <button onClick={() => { if (elapsed === 0 || confirm("Stop and reset the workout timer?")) { setRunning(false); setElapsed(0); } }} style={{ width: 54, height: 54, borderRadius: "50%", border: `1px solid ${C.red}`, background: "rgba(226,61,40,0.12)", color: C.red, fontSize: "1rem", cursor: "pointer" }}>■</button>
              </div>
            </div>
            {workout.exercises.length === 0 && <div style={{ ...card, color: C.dim, textAlign: "center" }}>Nothing fits your equipment + recovery right now. Add equipment in Settings.</div>}
            {workout.exercises.map((ex, i) => (
              <div key={i} style={{ ...card, borderLeft: `3px solid ${TIER_COLORS[ex.tier]}` }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <ExercisePic pattern={patternFor(ex)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                      <div style={{ fontFamily: font.display, fontSize: "1.05rem" }}>{ex.name}</div>
                      <span style={{ fontFamily: font.mono, fontSize: "0.65rem", color: TIER_COLORS[ex.tier], border: `1px solid ${TIER_COLORS[ex.tier]}`, borderRadius: 999, padding: "2px 8px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{ex.tier}</span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: C.dim, marginTop: 2 }}>{MUSCLE_LABELS[ex.primary]}{ex.secondary?.length ? " · also " + ex.secondary.map(m => MUSCLE_LABELS[m]).join(", ") : ""} · {ex.recPct}% recovered</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 10, fontFamily: font.mono, flexWrap: "wrap" }}>
                  {[["Sets", ex.sets],["Reps", ex.reps],["Target", ex.weight != null ? ex.weight + " lb" : (ex.equipment.includes("bodyweight") ? "BW" : "by feel")],["Effort", "RPE " + ex.rpe],["Rest", fmtRest(ex.restSeconds)]].map(([l,v]) => (
                    <div key={l} style={{ textAlign: "center" }}><div style={{ fontSize: "1.0rem", fontWeight: 600 }}>{v}</div><div style={{ fontSize: "0.6rem", color: C.dim, textTransform: "uppercase" }}>{l}</div></div>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: "0.8rem", color: C.dim, borderTop: `1px dashed ${C.line}`, paddingTop: 8 }}>{ex.note}</div>
                {(logs[i] || []).map((s, si) => (
                  <div key={si} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 1fr 42px", gap: 6, alignItems: "center", marginTop: 8 }}>
                    <div style={{ color: C.dim, fontFamily: font.mono, textAlign: "center", fontSize: "0.85rem" }}>{si + 1}</div>
                    <input style={inputStyle} type="number" placeholder="lb" value={s.weight} onChange={e => setLogs(p => { const n = { ...p, [i]: [...p[i]] }; n[i][si] = { ...n[i][si], weight: e.target.value }; return n; })} />
                    <input style={inputStyle} type="number" placeholder="reps" value={s.reps} onChange={e => setLogs(p => { const n = { ...p, [i]: [...p[i]] }; n[i][si] = { ...n[i][si], reps: e.target.value }; return n; })} />
                    <input style={inputStyle} type="number" placeholder="RPE" min="1" max="10" value={s.rpe} onChange={e => setLogs(p => { const n = { ...p, [i]: [...p[i]] }; n[i][si] = { ...n[i][si], rpe: e.target.value }; return n; })} />
                    <button onClick={() => completeSet(i, si, ex)} title="Mark set done, start rest timer"
                      style={{ height: 36, borderRadius: 6, border: `1px solid ${done[i]?.[si] ? C.green : C.line}`, background: done[i]?.[si] ? "rgba(76,154,106,0.2)" : "transparent", color: done[i]?.[si] ? C.green : C.dim, cursor: "pointer", fontSize: "1rem" }}>✓</button>
                  </div>
                ))}
              </div>
            ))}
            {workout.exercises.length > 0 && <StretchCard w={workout} />}
            {workout.exercises.length > 0 && <button onClick={finish} style={btnPrimary}>Finish & Log Workout</button>}
            <button onClick={() => { setWorkout(null); setTimer(null); setRunning(false); setElapsed(0); }} style={{ background: "none", border: "none", color: C.dim, textDecoration: "underline", display: "block", margin: "12px auto 0", cursor: "pointer", fontSize: "0.85rem" }}>Start over</button>
          </>
        )}

        {/* ============ PLAN ============ */}
        {screen === "plan" && (
          <>
            <div style={card}>
              <h3 style={h3s}>Generate a full week</h3>
              <p style={{ color: C.dim, fontSize: "0.82rem", margin: "4px 0 8px" }}>Days per week:</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[2,3,4,5,6].map(d => <button key={d} style={pillStyle(planDays === d)} onClick={() => setPlanDays(d)}>{d} days</button>)}
              </div>
              <p style={{ color: C.dim, fontSize: "0.82rem", margin: "12px 0 8px" }}>Minutes per session (±5, stretching extra):</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[30,45,60,75,90].map(m => <button key={m} style={pillStyle(duration === m)} onClick={() => setDuration(m)}>{m}</button>)}
              </div>
              <button onClick={genPlan} style={{ ...btnPrimary, marginTop: 14 }}>Build Weekly Routine</button>
              <p style={{ color: C.dim, fontSize: "0.75rem", marginTop: 10 }}>Each day is planned with simulated recovery from the previous days, so muscle groups rotate like a real split. Every session runs 4–5 exercises from heavy to light.</p>
            </div>
            {plan && plan.map((day, di) => (
              <div key={di} style={{ ...card, borderTop: `3px solid ${C.red}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <div style={{ fontFamily: font.mono, fontSize: "0.65rem", color: C.red, textTransform: "uppercase", letterSpacing: "0.1em" }}>Day {di + 1} · {DAY_NAMES[new Date(day.date).getDay()]}</div>
                    <div style={{ fontFamily: font.display, fontSize: "1.05rem", textTransform: "uppercase" }}>
                      {[...new Set(day.exercises.map(e => MUSCLE_LABELS[e.primary]))].slice(0, 3).join(" · ") || "Rest"}
                    </div>
                  </div>
                  <span style={{ fontFamily: font.mono, color: C.dim, fontSize: "0.78rem", textAlign: "right" }}>~{Math.round(day.estimatedMinutes)} min<br/><span style={{ color: C.green }}>+{day.stretchMinutes} stretch</span></span>
                </div>
                <div style={{ marginTop: 10 }}>
                  {day.exercises.map((ex, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.line}`, fontSize: "0.85rem", gap: 8, alignItems: "center" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}><ExercisePic pattern={patternFor(ex)} size={34} /><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: TIER_COLORS[ex.tier], flexShrink: 0 }} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.name}</span></span>
                      <span style={{ fontFamily: font.mono, color: C.dim, whiteSpace: "nowrap" }}>{ex.sets}×{ex.reps}{ex.weight != null ? ` @ ${ex.weight}` : ""} · r {fmtRest(ex.restSeconds)}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: "0.85rem", color: C.green }}>
                    <span>Cool-down stretches ({day.stretches.map(s => MUSCLE_LABELS[s.muscle]).slice(0,3).join(", ")}…)</span>
                    <span style={{ fontFamily: font.mono }}>5 min</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: "0.7rem", fontFamily: font.mono, color: C.dim }}>
                  {["Heavy","Moderate","Light"].map(t => <span key={t}><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: TIER_COLORS[t], marginRight: 4 }} />{t}</span>)}
                </div>
                <button onClick={() => startWorkout(day)} style={{ marginTop: 12, width: "100%", background: "transparent", color: C.chalk, border: `1px solid ${C.line}`, borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Start this workout</button>
              </div>
            ))}
          </>
        )}

        {/* ============ RECOVERY ============ */}
        {screen === "recovery" && (
          <>
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", textAlign: "center", marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: font.display, fontSize: "2rem", fontStyle: "italic", fontWeight: 600 }}>{(() => { if (!sessions.length) return "—"; const last = Math.max(...sessions.map(s => new Date(s.date).getTime())); return Math.floor((Date.now() - last) / 864e5); })()}</div>
                  <div style={{ fontFamily: font.mono, fontSize: "0.62rem", color: C.dim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Days since your<br/>last workout</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: font.display, fontSize: "2rem", fontStyle: "italic", fontWeight: 600 }}>{Object.values(recovery).filter(d => d.recoveryPct >= 75).length}</div>
                  <div style={{ fontFamily: font.mono, fontSize: "0.62rem", color: C.dim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Fresh muscle<br/>groups</div>
                </div>
              </div>
              <BodyMap recovery={recovery} selected={selMuscle} onSelect={m => setSelMuscle(m === selMuscle ? null : m)} view={bodyView} setView={setBodyView} />
              <p style={{ color: C.dim, fontSize: "0.75rem", margin: "10px 0 0", textAlign: "center" }}>Tap a muscle for details · gray = fresh, red = fatigued · flip with the button</p>
              {selMuscle && (
                <div style={{ marginTop: 12, background: C.raised, border: `1px solid ${recColor(recovery[selMuscle].recoveryPct)}`, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: font.display, textTransform: "uppercase", fontSize: "0.95rem" }}>{MUSCLE_LABELS[selMuscle]}</div>
                    <div style={{ fontSize: "0.78rem", color: C.dim }}>
                      {recovery[selMuscle].hoursSince != null ? `Last trained ${Math.round(recovery[selMuscle].hoursSince)}h ago` : "Not trained recently"}
                      {" · "}{recovery[selMuscle].recoveryPct >= 75 ? "ready to train" : recovery[selMuscle].recoveryPct >= 40 ? "recovering" : "needs rest"}
                    </div>
                  </div>
                  <div style={{ fontFamily: font.mono, fontSize: "1.5rem", fontWeight: 600, color: recColor(recovery[selMuscle].recoveryPct) }}>{recovery[selMuscle].recoveryPct}%</div>
                </div>
              )}
            </div>
            <div style={card}>
              <h3 style={h3s}>Coach notes</h3>
              {(adj.notes || []).slice(0, 3).map((n, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${C.amber}`, padding: "10px 12px", background: "rgba(244,180,0,0.08)", borderRadius: 6, marginTop: 8, fontSize: "0.85rem" }}>
                  <span style={{ fontFamily: font.mono, fontSize: "0.68rem", color: C.dim, display: "block", marginBottom: 4 }}>{new Date(n.date).toLocaleDateString()}</span>
                  {n.notes.join(" ")}
                </div>
              ))}
              {(adj.deloadMuscles || []).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {adj.deloadMuscles.map(m => <span key={m} style={{ fontFamily: font.mono, fontSize: "0.68rem", border: `1px solid ${C.red}`, color: C.red, borderRadius: 999, padding: "3px 9px" }}>Deload: {MUSCLE_LABELS[m]}</span>)}
                </div>
              )}
              {!(adj.notes || []).length && <p style={{ color: C.dim, fontSize: "0.8rem", marginTop: 6 }}>No AI review yet. Log a few workouts, then run one.</p>}
              <button onClick={runReview} disabled={reviewing} style={{ marginTop: 10, width: "100%", background: "transparent", color: C.chalk, border: `1px solid ${C.line}`, borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>{reviewing ? "Reviewing…" : "Run AI review now"}</button>
            </div>
          </>
        )}

        {/* ============ PROGRESS ============ */}
        {screen === "progress" && (
          <div style={card}>
            <h3 style={h3s}>History</h3>
            {!sessions.length && <p style={{ color: C.dim, fontSize: "0.85rem", textAlign: "center", padding: "24px 0" }}>No workouts logged yet — finish one from the Today tab.</p>}
            {[...sessions].reverse().slice(0, 30).map(s => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.line}`, fontSize: "0.85rem" }}>
                <span>{new Date(s.date).toLocaleDateString()} · {s.exercises.length} exercises · {s.exercises.reduce((a, e) => a + e.sets.length, 0)} sets</span>
                <span style={{ fontFamily: font.mono, color: C.dim }}>{s.durationMinutes} min</span>
              </div>
            ))}
          </div>
        )}

        {/* ============ SETTINGS ============ */}
        {screen === "settings" && (
          <>
            <div style={card}>
              <h3 style={h3s}>Goal</h3>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {["strength","hypertrophy","endurance"].map(g => <button key={g} style={pillStyle(goal === g)} onClick={() => { setGoal(g); persist({ goal: g }); }}>{g[0].toUpperCase() + g.slice(1)}</button>)}
              </div>
            </div>
            <div style={card}>
              <h3 style={h3s}>Equipment on hand</h3>
              <p style={{ color: C.dim, fontSize: "0.8rem", margin: "4px 0 10px" }}>Workouts only use what you check here.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {EQUIPMENT_OPTIONS.map(([code, label]) => (
                  <label key={code} style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${equipment.includes(code) ? C.red : C.line}`, borderRadius: 8, padding: 10, background: C.raised, fontSize: "0.85rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={equipment.includes(code)} onChange={() => toggleEquip(code)} style={{ width: 18, height: 18, accentColor: C.red }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div style={card}>
              <h3 style={h3s}>Data</h3>
              <p style={{ color: C.dim, fontSize: "0.8rem", margin: "4px 0 10px" }}>{sessions.length} workout{sessions.length === 1 ? "" : "s"} saved. Data persists between visits.</p>
              <button onClick={() => { if (confirm("Delete all logged workouts, plan, and settings?")) { setSessions([]); setPlan(null); setAdj({ muscleVolumeMultiplier: {}, deloadMuscles: [], notes: [] }); saveState({ goal, equipment, sessions: [], adj: { muscleVolumeMultiplier: {}, deloadMuscles: [], notes: [] }, plan: null, planDays }); showToast("All data cleared."); } }} style={{ background: "transparent", color: C.red, border: `1px solid ${C.red}`, borderRadius: 8, padding: "10px 16px", cursor: "pointer", width: "100%" }}>Clear all data</button>
            </div>
          </>
        )}
      </div>

      {toast && <div style={{ position: "fixed", bottom: 140, left: "50%", transform: "translateX(-50%)", background: C.raised, border: `1px solid ${C.line}`, borderRadius: 8, padding: "10px 18px", fontSize: "0.85rem", zIndex: 40, whiteSpace: "nowrap" }}>{toast}</div>}
      {timer && <RestTimer key={timer.key} seconds={timer.seconds} label={timer.label} onDismiss={() => setTimer(null)} />}

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.panel, borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-around", padding: "8px 0 14px", zIndex: 10 }}>
        {["today","plan","recovery","progress","settings"].map(s => (
          <button key={s} onClick={() => setScreen(s)} style={{ background: "none", border: "none", color: screen === s ? C.red : C.dim, display: "flex", flexDirection: "column", alignItems: "center", fontSize: "0.65rem", gap: 3, textTransform: "uppercase", letterSpacing: "0.02em", padding: "4px 6px", cursor: "pointer", fontFamily: font.body }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: screen === s ? C.red : "transparent" }} />
            {s}
          </button>
        ))}
      </nav>
    </div>
  );
}
