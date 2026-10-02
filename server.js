require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./lib/db');
const { runWeeklyReview } = require('./lib/claudeReview');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 4477;

app.use(express.json());
app.use('/api', apiRouter);
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Weekly review scheduler ---
// Checks once an hour whether 7+ days have passed since the last Claude review.
// If ANTHROPIC_API_KEY isn't set, runWeeklyReview() no-ops gracefully.
const CHECK_INTERVAL_MS = 60 * 60 * 1000;
async function maybeRunWeeklyReview() {
  const store = db.read();
  if (!store.settings.weeklyReviewEnabled) return;
  const last = store.settings.lastReviewDate ? new Date(store.settings.lastReviewDate) : null;
  const dueForReview = !last || (Date.now() - last.getTime()) >= 7 * 24 * 3600 * 1000;
  if (!dueForReview) return;

  const result = await runWeeklyReview({ sessions: store.sessions, settings: store.settings });
  if (!result.skipped) {
    const fresh = db.read();
    fresh.planAdjustments.muscleVolumeMultiplier = result.muscleVolumeMultiplier;
    fresh.planAdjustments.deloadMuscles = result.deloadMuscles;
    fresh.planAdjustments.notes = [{ date: result.date, notes: result.notes }, ...(fresh.planAdjustments.notes || [])].slice(0, 20);
    fresh.settings.lastReviewDate = result.date;
    db.write(fresh);
    console.log('[review] Weekly AI review completed:', result.notes.join(' '));
  }
}
setInterval(maybeRunWeeklyReview, CHECK_INTERVAL_MS);
// Also check shortly after boot in case the server was off when it was due.
setTimeout(maybeRunWeeklyReview, 30 * 1000);

app.listen(PORT, () => {
  console.log(`FitForge running at http://localhost:${PORT}`);
  console.log(process.env.ANTHROPIC_API_KEY ? 'AI weekly review: enabled' : 'AI weekly review: disabled (set ANTHROPIC_API_KEY in .env to enable)');
});
