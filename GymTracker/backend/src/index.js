/**
 * Author: Mattia Tuor
 * Date: 23.06.2026
 * Version: 6.0
 * Description: Einstiegspunkt des Express-Backends – definiert Server und alle REST-Endpunkte
 */

import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../dev.db');
console.log('DB Pfad:', dbPath);
const db = new Database(dbPath);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test-Endpoint um zu prüfen ob der Server läuft
app.get('/health', (req, res) => {
  res.json({ status: 'Server läuft' });
});

// ── Workouts ──────────────────────────────────────────────

// GET /workouts – alle Workouts abrufen (Issue #11)
app.get('/workouts', (req, res) => {
  const workouts = db.prepare('SELECT * FROM Workout ORDER BY createdAt DESC').all();
  res.json(workouts);
});

// POST /workouts – neues Workout erstellen (Issue #10)
app.post('/workouts', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name ist erforderlich' });
  }

  const stmt = db.prepare('INSERT INTO Workout (name, createdAt) VALUES (?, ?)');
  const result = stmt.run(name, new Date().toISOString());

  res.status(201).json({ id: result.lastInsertRowid, name, createdAt: new Date().toISOString() });
});

// ── Exercises ─────────────────────────────────────────────

// GET /workouts/:id/exercises – alle Übungen eines Workouts laden (Issue #12)
app.get('/workouts/:id/exercises', (req, res) => {
  const { id } = req.params;

  const exercises = db.prepare('SELECT * FROM Exercise WHERE workoutId = ?').all(id);

  // Sets zu jeder Übung dazuladen
  const exercisesWithSets = exercises.map((exercise) => {
    const sets = db.prepare('SELECT * FROM "Set" WHERE exerciseId = ?').all(exercise.id);
    return { ...exercise, sets };
  });

  res.json(exercisesWithSets);
});

// POST /workouts/:id/exercises – Übung zu einem Workout hinzufügen (Issue #13)
app.post('/workouts/:id/exercises', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name ist erforderlich' });
  }

  // Prüfen ob das Workout existiert
  const workout = db.prepare('SELECT * FROM Workout WHERE id = ?').get(id);
  if (!workout) {
    return res.status(404).json({ error: 'Workout nicht gefunden' });
  }

  const stmt = db.prepare('INSERT INTO Exercise (name, workoutId) VALUES (?, ?)');
  const result = stmt.run(name, id);

  res.status(201).json({ id: result.lastInsertRowid, name, workoutId: Number(id), sets: [] });
});

// ── Sets ──────────────────────────────────────────────────

// POST /exercises/:id/sets – Set zu einer Übung hinzufügen (Issue #14)
app.post('/exercises/:id/sets', (req, res) => {
  const { id } = req.params;
  const { weight, reps } = req.body;

  if (weight === undefined || !reps) {
    return res.status(400).json({ error: 'weight und reps sind erforderlich' });
  }

  // Prüfen ob die Übung existiert
  const exercise = db.prepare('SELECT * FROM Exercise WHERE id = ?').get(id);
  if (!exercise) {
    return res.status(404).json({ error: 'Übung nicht gefunden' });
  }

  const stmt = db.prepare('INSERT INTO "Set" (weight, reps, exerciseId) VALUES (?, ?, ?)');
  const result = stmt.run(weight, reps, id);

  res.status(201).json({ id: result.lastInsertRowid, weight, reps, exerciseId: Number(id) });
});

// ── Statistiken ───────────────────────────────────────────

// GET /stats/total-workouts – Gesamtanzahl der absolvierten Trainings (Issue #20)
app.get('/stats/total-workouts', (req, res) => {
  const result = db.prepare('SELECT COUNT(*) AS total FROM Workout').get();
  res.json({ total: result.total });
});

// GET /stats/workouts-per-week – Trainings pro Woche der letzten 8 Wochen (Issue #21)
app.get('/stats/workouts-per-week', (req, res) => {
  const workouts = db.prepare('SELECT createdAt FROM Workout ORDER BY createdAt ASC').all();

  // Hilfsfunktion: Montag der Woche eines Datums als ISO-String (YYYY-MM-DD) ermitteln
  function getWeekStart(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDay(); // 0 = Sonntag
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  }

  // Workouts nach Kalenderwoche (Montag-Start) gruppieren
  const countsByWeek = {};
  workouts.forEach((w) => {
    const weekStart = getWeekStart(w.createdAt);
    countsByWeek[weekStart] = (countsByWeek[weekStart] || 0) + 1;
  });

  // Nur die letzten 8 Wochen zurückgeben, chronologisch sortiert
  const sortedWeeks = Object.keys(countsByWeek).sort();
  const lastWeeks = sortedWeeks.slice(-8);

  const weeklyData = lastWeeks.map((weekStart) => ({
    weekStart,
    count: countsByWeek[weekStart],
  }));

  // Durchschnitt über alle vorhandenen Wochen berechnen
  const totalCount = workouts.length;
  const totalWeeks = sortedWeeks.length || 1;
  const average = totalCount / totalWeeks;

  res.json({ weeklyData, average: Math.round(average * 10) / 10 });
});

// GET /stats/weight-progress – Liste aller Übungsnamen mit Gewichtsverlauf (Issue #22)
app.get('/stats/exercise-names', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT name FROM Exercise ORDER BY name ASC').all();
  res.json(rows.map((r) => r.name));
});

// GET /stats/weight-progress/:exerciseName – Gewichtsverlauf einer bestimmten Übung über die Zeit (Issue #22)
app.get('/stats/weight-progress/:exerciseName', (req, res) => {
  const { exerciseName } = req.params;

  // Alle Sets der Übung mit dem zugehörigen Workout-Datum laden
  const rows = db.prepare(`
    SELECT "Set".weight AS weight, "Set".reps AS reps, Workout.createdAt AS createdAt
    FROM "Set"
    JOIN Exercise ON "Set".exerciseId = Exercise.id
    JOIN Workout ON Exercise.workoutId = Workout.id
    WHERE Exercise.name = ?
    ORDER BY Workout.createdAt ASC
  `).all(exerciseName);

  // Pro Trainingstag das höchste verwendete Gewicht ermitteln
  const maxByDate = {};
  rows.forEach((row) => {
    const dateKey = row.createdAt.split('T')[0];
    if (!maxByDate[dateKey] || row.weight > maxByDate[dateKey]) {
      maxByDate[dateKey] = row.weight;
    }
  });

  const progress = Object.keys(maxByDate)
    .sort()
    .map((date) => ({ date, maxWeight: maxByDate[date] }));

  res.json(progress);
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});