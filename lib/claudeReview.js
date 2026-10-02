// Calls the Anthropic API to review recent training history and produce
// coach-style adjustments: per-muscle volume multipliers, deload flags, and
// a short human-readable note. Runs weekly (see server.js scheduler) or on demand.
//
// Requires ANTHROPIC_API_KEY to be set in the environment (.env). Never hardcode
// the key. If it's missing, review is skipped gracefully.

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

function summarizeSessions(sessions, days = 14) {
  const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000);
  const recent = sessions.filter(s => new Date(s.date) >= cutoff);

  const byMuscle = {};
  for (const s of recent) {
    for (const ex of s.exercises || []) {
      const m = ex.primary;
      if (!byMuscle[m]) byMuscle[m] = { sets: 0, avgRpe: [], exercises: new Set() };
      byMuscle[m].sets += (ex.sets || []).length;
      byMuscle[m].exercises.add(ex.exerciseName);
      for (const st of ex.sets || []) if (st.rpe) byMuscle[m].avgRpe.push(st.rpe);
    }
  }

  const summary = Object.entries(byMuscle).map(([muscle, d]) => ({
    muscle,
    totalSets: d.sets,
    avgRpe: d.avgRpe.length ? Math.round((d.avgRpe.reduce((a, b) => a + b, 0) / d.avgRpe.length) * 10) / 10 : null,
    distinctExercises: d.exercises.size
  }));

  return { sessionCount: recent.length, windowDays: days, byMuscle: summary };
}

async function runWeeklyReview({ sessions, settings }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { skipped: true, reason: 'No ANTHROPIC_API_KEY set in environment — periodic AI review is disabled. Daily recommendations still work via the built-in algorithm.' };
  }

  const summary = summarizeSessions(sessions, 14);
  if (summary.sessionCount === 0) {
    return { skipped: true, reason: 'No sessions logged in the last 14 days — nothing to review yet.' };
  }

  const systemPrompt = `You are a strength coach reviewing a lifter's last two weeks of training data.
Return ONLY valid JSON, no prose, no markdown fences, matching exactly this shape:
{
  "muscleVolumeMultiplier": { "<muscle>": <number between 0.7 and 1.3> },
  "deloadMuscles": ["<muscle>", ...],
  "notes": ["<short human-readable coaching note>", ...]
}
Guidance:
- Flag a muscle for deload only if avgRpe is consistently high (>=9) across many sets, suggesting accumulated fatigue/plateau risk.
- Increase multiplier (up to 1.3) for muscles trained with very few sets/session relative to others (undertrained).
- Decrease multiplier (down to 0.7) for muscles trained with excessive sets and high RPE (overreaching).
- Keep notes short: 1-3 sentences each, plain language, max 3 notes.
- The lifter's stated goal is: ${settings.goal || 'hypertrophy'}.`;

  const userPrompt = `Training summary for the last ${summary.windowDays} days (${summary.sessionCount} sessions):\n${JSON.stringify(summary.byMuscle, null, 2)}`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    return { skipped: true, reason: `Anthropic API error (${response.status}): ${errText.slice(0, 200)}` };
  }

  const data = await response.json();
  const textBlock = (data.content || []).find(c => c.type === 'text');
  if (!textBlock) return { skipped: true, reason: 'No text content returned from review.' };

  let parsed;
  try {
    const clean = textBlock.text.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch (e) {
    return { skipped: true, reason: 'Could not parse review response as JSON.' };
  }

  return {
    skipped: false,
    date: new Date().toISOString(),
    muscleVolumeMultiplier: parsed.muscleVolumeMultiplier || {},
    deloadMuscles: parsed.deloadMuscles || [],
    notes: parsed.notes || []
  };
}

module.exports = { runWeeklyReview, summarizeSessions };
