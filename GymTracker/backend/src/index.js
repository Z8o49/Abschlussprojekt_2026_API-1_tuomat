/**
 * Author: Mattia Tuor
 * Date: 16.06.2026
 * Version: 4.0
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

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});