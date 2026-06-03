/**
 * Author: Mattia Tuor
 * Date: 02.06.2026
 * Version: 1.0
 * Description: Einstiegspunkt des Express-Backends, definiert den Server und Basis-Endpunkte
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test-Endpoint um zu prüfen ob der Server läuft
app.get('/health', (req, res) => {
  res.json({ status: 'Server läuft' });
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});