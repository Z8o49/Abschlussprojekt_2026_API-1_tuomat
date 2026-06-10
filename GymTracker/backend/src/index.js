/**
 * Author: Mattia Tuor
 * Date: 10.06.2026
 * Version: 3.0
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

// Alle Workouts abrufen (Issue #11)
app.get('/workouts', (req, res) => {
  const workouts = db.prepare('SELECT * FROM Workout ORDER BY createdAt DESC').all();
  res.json(workouts);
});

// Workout erstellen (Issue #10)
app.post('/workouts', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name ist erforderlich' });
  }

  const stmt = db.prepare('INSERT INTO Workout (name, createdAt) VALUES (?, ?)');
  const result = stmt.run(name, new Date().toISOString());

  res.status(201).json({ id: result.lastInsertRowid, name, createdAt: new Date().toISOString() });
});

// Übungen eines Workouts abrufen (Issue #12)
app.get('/workouts/:id/exercises', (req, res) => {
  const { id } = req.params;
  const exercises = db.prepare('SELECT * FROM Exercise WHERE workoutId = ?').all(id);
  res.json(exercises);
});

// Übung zu einem Workout hinzufügen (Issue #12)
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

  res.status(201).json({ id: result.lastInsertRowid, name, workoutId: Number(id) });
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});