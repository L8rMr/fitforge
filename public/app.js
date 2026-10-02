const EQUIPMENT_OPTIONS = [
  { code: 'barbell', label: 'Barbell' },
  { code: 'dumbbell', label: 'Dumbbells' },
  { code: 'bench', label: 'Flat Bench' },
  { code: 'incline_bench', label: 'Incline Bench' },
  { code: 'squat_rack', label: 'Squat Rack' },
  { code: 'pull_up_bar', label: 'Pull-Up Bar' },
  { code: 'cable', label: 'Cable Machine' },
  { code: 'machine', label: 'Gym Machines' },
  { code: 'kettlebell', label: 'Kettlebells' },
  { code: 'resistance_band', label: 'Resistance Bands' },
  { code: 'dip_station', label: 'Dip Station' },
  { code: 'ez_bar', label: 'EZ Bar' },
  { code: 'smith_machine', label: 'Smith Machine' },
  { code: 'trap_bar', label: 'Trap Bar' }
];

const MUSCLE_LABELS = {
  chest: 'Chest', lats: 'Lats', traps: 'Traps', shoulders: 'Shoulders',
  biceps: 'Biceps', triceps: 'Triceps', quads: 'Quads', hamstrings: 'Hamstrings',
  glutes: 'Glutes', calves: 'Calves', abs: 'Abs', forearms: 'Forearms', lower_back: 'Lower Back'
};

let state = {
  selectedDuration: 60,
  selectedGoal: 'hypertrophy',
  currentWorkout: null,
  equipment: []
};

// ---------- Navigation ----------
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.screen));
});

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.screen === name));
  document.getElementById('topbar-eyebrow').textContent = name === 'today' ? 'Today' : name.charAt(0).toUpperCase() + name.slice(1);
  document.getElementById('topbar-title').textContent =
    name === 'today' ? 'FitForge' : name === 'recovery' ? 'Muscle Recovery' : name === 'progress' ? 'Progress' : 'Settings';
  if (name === 'recovery') loadRecovery();
  if (name === 'progress') loadHistory();
}

// ---------- Duration pills ----------
document.getElementById('duration-pills').addEventListener('click', e => {
  const btn = e.target.closest('.pill');
  if (!btn) return;
  document.querySelectorAll('#duration-pills .pill').forEach(p => p.classList.remove('selected'));
  btn.classList.add('selected');
  state.selectedDuration = parseInt(btn.dataset.min);
});

// ---------- Goal pills ----------
document.getElementById('goal-pills').addEventListener('click', async e => {
  const btn = e.target.closest('.pill');
  if (!btn) return;
  document.querySelectorAll('#goal-pills .pill').forEach(p => p.classList.remove('selected'));
  btn.classList.add('selected');
  state.selectedGoal = btn.dataset.goal;
  await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ goal: state.selectedGoal }) });
});

// ---------- Equipment ----------
function renderEquipmentGrid() {
  const grid = document.getElementById('equip-grid');
  grid.innerHTML = EQUIPMENT_OPTIONS.map(opt => `
    <label class="equip-item">
      <input type="checkbox" data-code="${opt.code}" ${state.equipment.includes(opt.code) ? 'checked' : ''}>
      ${opt.label}
    </label>
  `).join('');
  grid.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', saveEquipment);
  });
}

async function saveEquipment() {
  const checked = Array.from(document.querySelectorAll('#equip-grid input:checked')).map(cb => cb.dataset.code);
  state.equipment = checked;
  await fetch('/api/equipment', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ available: checked }) });
}

// ---------- Weekly review toggle ----------
document.getElementById('weekly-review-toggle').addEventListener('change', async e => {
  await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weeklyReviewEnabled: e.target.checked }) });
});

// ---------- Generate workout ----------
document.getElementById('generate-btn').addEventListener('click', generateWorkout);
document.getElementById('regen-btn').addEventListener('click', () => {
  document.getElementById('today-setup-card').style.display = 'block';
  document.getElementById('workout-container').innerHTML = '';
  document.getElementById('finish-container').style.display = 'none';
  state.currentWorkout = null;
});

async function generateWorkout() {
  const genBtn = document.getElementById('generate-btn');
  genBtn.disabled = true;
  genBtn.textContent = 'Building...';
  try {
    const res = await fetch('/api/workout/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ durationMinutes: state.selectedDuration })
    });
    const workout = await res.json();
    if (!res.ok) throw new Error(workout.error || 'Failed to generate workout');
    state.currentWorkout = workout;
    renderWorkout(workout);
    document.getElementById('today-setup-card').style.display = 'none';
    document.getElementById('finish-container').style.display = 'block';
  } catch (err) {
    document.getElementById('workout-container').innerHTML = `<div class="empty-state">${err.message}</div>`;
  } finally {
    genBtn.disabled = false;
    genBtn.textContent = 'Generate Workout';
  }
}

function renderWorkout(workout) {
  const container = document.getElementById('workout-container');
  if (!workout.exercises.length) {
    container.innerHTML = `<div class="empty-state">No exercises fit your current equipment + recovery state. Try adding equipment in Settings, or a longer session.</div>`;
    return;
  }
  container.innerHTML = `
    <div class="card raised" style="text-align:center;">
      <span class="mono" style="color:var(--chalk-dim); font-size:0.8rem;">Estimated time</span>
      <div style="font-family:var(--font-display); font-size:1.6rem;">${workout.estimatedMinutes} min</div>
    </div>
  ` + workout.exercises.map((ex, i) => `
    <div class="card exercise-card" data-ex-index="${i}">
      <div class="ex-name">${ex.name}</div>
      <div class="ex-meta">${MUSCLE_LABELS[ex.primary] || ex.primary}${ex.secondary && ex.secondary.length ? ' · also ' + ex.secondary.map(m => MUSCLE_LABELS[m] || m).join(', ') : ''} · ${ex.recoveryPctAtGeneration}% recovered</div>
      <div class="ex-target">
        <div><div class="val">${ex.sets}</div><div class="lbl">Sets</div></div>
        <div><div class="val">${ex.targetReps}</div><div class="lbl">Reps</div></div>
        <div><div class="val">${ex.weightNote}</div><div class="lbl">Target</div></div>
        <div><div class="val">RPE ${ex.targetRpe}</div><div class="lbl">Effort</div></div>
      </div>
      <div class="progression-note">${ex.progressionNote}</div>
      <div class="set-log">
        ${Array.from({ length: ex.sets }).map((_, s) => `
          <div class="set-row">
            <div class="set-num">${s + 1}</div>
            <input type="number" placeholder="lb" class="log-weight" inputmode="decimal">
            <input type="number" placeholder="reps" class="log-reps" inputmode="numeric" value="${ex.targetReps}">
            <input type="number" placeholder="RPE" class="log-rpe" inputmode="numeric" min="1" max="10">
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ---------- Finish workout ----------
document.getElementById('finish-btn').addEventListener('click', async () => {
  if (!state.currentWorkout) return;
  const cards = document.querySelectorAll('.exercise-card');
  const exercises = [];
  cards.forEach(card => {
    const idx = parseInt(card.dataset.exIndex);
    const meta = state.currentWorkout.exercises[idx];
    const rows = card.querySelectorAll('.set-row');
    const sets = Array.from(rows).map(row => ({
      weight: parseFloat(row.querySelector('.log-weight').value) || null,
      reps: parseInt(row.querySelector('.log-reps').value) || null,
      rpe: parseFloat(row.querySelector('.log-rpe').value) || null
    })).filter(s => s.reps); // only keep sets where reps were logged
    if (sets.length) {
      exercises.push({
        exerciseName: meta.name,
        primary: meta.primary,
        secondary: meta.secondary,
        category: meta.category,
        sets
      });
    }
  });

  if (!exercises.length) {
    alert('Log at least one set before finishing.');
    return;
  }

  await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ durationMinutes: state.selectedDuration, exercises })
  });

  document.getElementById('workout-container').innerHTML = `<div class="empty-state">Workout logged. Nice work — recovery will update on the Recovery tab.</div>`;
  document.getElementById('finish-container').style.display = 'none';
  document.getElementById('today-setup-card').style.display = 'block';
  state.currentWorkout = null;
});

// ---------- Recovery ----------
async function loadRecovery() {
  const res = await fetch('/api/recovery');
  const recovery = await res.json();
  const heatmap = document.getElementById('heatmap');
  const order = Object.entries(recovery).sort((a, b) => a[1].recoveryPct - b[1].recoveryPct === 0 ? 0 : b[1].recoveryPct - a[1].recoveryPct).reverse();
  // Sort fatigued-first so the muscles needing attention surface at the top.
  const sorted = Object.entries(recovery).sort((a, b) => a[1].recoveryPct - b[1].recoveryPct);
  heatmap.innerHTML = sorted.map(([muscle, d]) => {
    const status = d.recoveryPct >= 75 ? 'ready' : d.recoveryPct >= 40 ? 'recovering' : 'fatigued';
    return `
      <div class="muscle-tile status-${status}">
        <div class="name">${MUSCLE_LABELS[muscle] || muscle}</div>
        <div class="pct">${d.recoveryPct}%</div>
      </div>
    `;
  }).join('');

  const notesRes = await fetch('/api/review/notes');
  const notesData = await notesRes.json();
  document.getElementById('last-review-line').textContent = notesData.lastReviewDate
    ? `Last reviewed ${new Date(notesData.lastReviewDate).toLocaleDateString()}`
    : 'No AI review yet — runs weekly automatically once an API key is configured, or trigger one manually below.';
  const notesContainer = document.getElementById('coach-notes');
  if (notesData.notes && notesData.notes.length) {
    notesContainer.innerHTML = notesData.notes.slice(0, 3).map(entry => `
      <div class="coach-note">
        <span class="date">${new Date(entry.date).toLocaleDateString()}</span>
        ${entry.notes.join(' ')}
      </div>
    `).join('') + (notesData.deloadMuscles.length ? `<div class="chip-row">${notesData.deloadMuscles.map(m => `<span class="chip">Deload: ${MUSCLE_LABELS[m] || m}</span>`).join('')}</div>` : '');
  } else {
    notesContainer.innerHTML = '';
  }
}

document.getElementById('run-review-btn').addEventListener('click', async () => {
  const btn = document.getElementById('run-review-btn');
  btn.disabled = true;
  btn.textContent = 'Reviewing...';
  const res = await fetch('/api/review/run', { method: 'POST' });
  const result = await res.json();
  btn.disabled = false;
  btn.textContent = 'Run AI review now';
  if (result.skipped) {
    alert(result.reason);
  } else {
    await loadRecovery();
  }
});

// ---------- Progress / History ----------
async function loadHistory() {
  const res = await fetch('/api/sessions?limit=30');
  const sessions = await res.json();
  const list = document.getElementById('history-list');
  if (!sessions.length) {
    list.innerHTML = '<div class="empty-state">No workouts logged yet. Finish one from the Today tab to see it here.</div>';
    return;
  }
  list.innerHTML = sessions.map(s => `
    <div class="progress-row">
      <span>${new Date(s.date).toLocaleDateString()} · ${s.exercises.length} exercises</span>
      <span class="mono" style="color:var(--chalk-dim);">${s.durationMinutes ? s.durationMinutes + ' min' : ''}</span>
    </div>
  `).join('');
}

// ---------- Init ----------
async function init() {
  const [equipRes, settingsRes] = await Promise.all([
    fetch('/api/equipment'),
    fetch('/api/settings')
  ]);
  const equip = await equipRes.json();
  const settings = await settingsRes.json();
  state.equipment = equip.available || ['bodyweight'];
  state.selectedGoal = settings.goal || 'hypertrophy';

  renderEquipmentGrid();
  document.querySelectorAll('#goal-pills .pill').forEach(p => p.classList.toggle('selected', p.dataset.goal === state.selectedGoal));
  document.getElementById('weekly-review-toggle').checked = !!settings.weeklyReviewEnabled;

  if (state.equipment.length <= 1) {
    // First run: nudge the user to settings to pick their equipment.
    showScreen('settings');
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

init();
