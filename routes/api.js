const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const { generateWorkout } = require('../lib/generator');
const { computeRecovery } = require('../lib/recovery');
const { runWeeklyReview } = require('../lib/claudeReview');
const exerciseLibrary = require('../db/exercises.json');

// ---- Exercises & equipment ----

router.get('/exercises', (req, res) => {
  res.json(exerciseLibrary);
});

router.get('/equipment', (req, res) => {
  const store = db.read();
  res.json(store.equipment);
});

router.put('/equipment', (req, res) => {
  const store = db.read();
  const available = Array.isArray(req.body.available) ? req.body.available : [];
  if (!available.includes('bodyweight')) available.push('bodyweight');
  store.equipment.available = available;
  db.write(store);
  res.json(store.equipment);
});

// ---- Settings ----

router.get('/settings', (req, res) => {
  res.json(db.read().settings);
});

router.put('/settings', (req, res) => {
  const store = db.read();
  store.settings = { ...store.settings, ...req.body };
  db.write(store);
  res.json(store.settings);
});

// ---- Recovery snapshot ----

router.get('/recovery', (req, res) => {
  const store = db.read();
  res.json(computeRecovery(store.sessions, new Date()));
});

// ---- Workout generation ----

router.post('/workout/generate', (req, res) => {
  const store = db.read();
  const { durationMinutes, focusMuscles } = req.body;
  if (!durationMinutes || durationMinutes < 10) {
    return res.status(400).json({ error: 'durationMinutes must be at least 10.' });
  }
  const workout = generateWorkout({
    exerciseLibrary,
    sessions: store.sessions,
    availableEquipment: store.equipment.available,
    durationMinutes,
    goal: store.settings.goal,
    planAdjustments: store.planAdjustments,
    focusMuscles
  });
  res.json(workout);
});

// ---- Sessions (workout logs) ----

router.get('/sessions', (req, res) => {
  const store = db.read();
  const limit = parseInt(req.query.limit) || 50;
  res.json(store.sessions.slice(-limit).reverse());
});

router.post('/sessions', (req, res) => {
  const store = db.read();
  const session = {
    id: 's_' + Date.now(),
    date: req.body.date || new Date().toISOString(),
    durationMinutes: req.body.durationMinutes || null,
    exercises: req.body.exercises || []
  };
  store.sessions.push(session);
  db.write(store);
  res.status(201).json(session);
});

router.delete('/sessions/:id', (req, res) => {
  const store = db.read();
  store.sessions = store.sessions.filter(s => s.id !== req.params.id);
  db.write(store);
  res.status(204).end();
});

// ---- Progress: simple per-exercise history for charts ----

router.get('/progress/:exerciseName', (req, res) => {
  const store = db.read();
  const name = decodeURIComponent(req.params.exerciseName);
  const points = [];
  for (const s of store.sessions) {
    const ex = (s.exercises || []).find(e => e.exerciseName === name);
    if (ex && ex.sets && ex.sets.length) {
      const topSet = ex.sets.reduce((best, cur) => ((cur.weight || 0) * (cur.reps || 0) > (best.weight || 0) * (best.reps || 0) ? cur : best));
      points.push({ date: s.date, weight: topSet.weight, reps: topSet.reps, rpe: topSet.rpe, estOneRepMax: topSet.weight ? Math.round(topSet.weight * (1 + (topSet.reps || 0) / 30)) : null });
    }
  }
  res.json(points);
});

// ---- Claude periodic review ----

router.post('/review/run', async (req, res) => {
  const store = db.read();
  const result = await runWeeklyReview({ sessions: store.sessions, settings: store.settings });
  if (!result.skipped) {
    store.planAdjustments.muscleVolumeMultiplier = result.muscleVolumeMultiplier;
    store.planAdjustments.deloadMuscles = result.deloadMuscles;
    store.planAdjustments.notes = [{ date: result.date, notes: result.notes }, ...(store.planAdjustments.notes || [])].slice(0, 20);
    store.settings.lastReviewDate = result.date;
    db.write(store);
  }
  res.json(result);
});

router.get('/review/notes', (req, res) => {
  const store = db.read();
  res.json({
    lastReviewDate: store.settings.lastReviewDate,
    notes: store.planAdjustments.notes || [],
    deloadMuscles: store.planAdjustments.deloadMuscles || [],
    muscleVolumeMultiplier: store.planAdjustments.muscleVolumeMultiplier || {}
  });
});

module.exports = router;
