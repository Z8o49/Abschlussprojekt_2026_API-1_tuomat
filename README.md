# GymTracker

Eine mobile App zum Erfassen und Auswerten von Krafttraining – ohne Werbung, Abos oder unnötige Funktionen. Workouts erstellen, Übungen und Sätze (Gewicht & Wiederholungen) erfassen, Trainingshistorie einsehen und Fortschritt per Statistiken verfolgen.

Entwickelt als Abschlussprojekt (BLJ) von Mattia Tuor.

## Tech-Stack

- **Frontend:** React Native (Expo), JavaScript
- **Backend:** Node.js mit Express
- **Datenbank:** SQLite (`better-sqlite3`)
- **Navigation:** React Navigation (Bottom Tabs + Stack)

## Projektstruktur

```Projektstruktur
GymTracker/
├── app/
│   ├── screens/        # Alle Screens der App
│   ├── navigation/      # Tab- und Stack-Navigation
│   └── styles/          # Globale Styles
├── backend/
│   └── src/index.js    # Express-Server mit REST-Endpunkten
└── App.js
```

## Setup

### Voraussetzungen

- Node.js
- Android Studio mit eingerichtetem Emulator (oder physisches Android-Gerät)

### Backend starten

```bash
cd backend
npm install
npm run dev
```

Der Server läuft danach auf `http://localhost:3000`.

### Frontend starten

```bash
npm install
npx expo start
```

Anschliessend im Terminal `a` drücken, um die App im Android-Emulator zu öffnen.

> **Hinweis:** Im Android-Emulator wird das Backend über `http://10.0.2.2:3000` angesprochen (nicht `localhost`), da dies die spezielle Adresse des Emulators für den Host-Rechner ist.

## Features

- Workouts erstellen und in einer Liste anzeigen
- Übungen und Sätze (Gewicht/Wiederholungen) pro Workout erfassen
- Trainingshistorie mit Datumsfilter
- Statistiken: Gesamtanzahl Workouts, Trainings pro Woche, Gewichtsfortschritt pro Übung
