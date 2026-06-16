/**
 * Author: Mattia Tuor
 * Date: 16.06.2026
 * Version: 4.0
 * Description: Screen für Workout-Übersicht, Workout erstellen, Übungen und Sets hinzufügen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import globalStyles from '../styles/globalStyles';

const API_URL = 'http://10.0.2.2:3000';

export default function WorkoutScreen() {
  // Aktuell ausgewähltes Workout (für Detailansicht)
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

  // Steuert welches Modal sichtbar ist: null | 'exercise' | 'set'
  const [activeModal, setActiveModal] = useState(null);

  // Die Übung für die gerade ein Set erfasst wird
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Eingabefelder für neues Set
  const [setWeight, setSetWeight] = useState('');
  const [setReps, setSetReps] = useState('');

  // Alle Workouts beim ersten Laden abrufen
  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Übungen laden wenn ein Workout ausgewählt wird
  useEffect(() => {
    if (selectedWorkout) {
      fetchExercises(selectedWorkout.id);
    }
  }, [selectedWorkout]);

  // GET /workouts – alle Workouts vom Backend laden
  const fetchWorkouts = async () => {
    setLoadingWorkouts(true);
    try {
      const response = await fetch(`${API_URL}/workouts`);
      if (!response.ok) throw new Error('Fehler beim Laden');
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      Alert.alert('Fehler', 'Workouts konnten nicht geladen werden.');
    } finally {
      setLoadingWorkouts(false);
    }
  };

  // GET /workouts/:id/exercises – Übungen eines Workouts laden (inkl. Sets)
  const fetchExercises = async (workoutId) => {
    try {
      const response = await fetch(`${API_URL}/workouts/${workoutId}/exercises`);
      if (!response.ok) throw new Error('Fehler beim Laden');
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      Alert.alert('Fehler', 'Übungen konnten nicht geladen werden.');
    }
  };

  // POST /workouts – neues Workout erstellen und Liste aktualisieren
  const handleSaveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Fehler', 'Bitte einen Workout-Namen eingeben.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workoutName }),
      });

      if (!response.ok) throw new Error('Fehler beim Speichern');

      const newWorkout = await response.json();
      setWorkouts([newWorkout, ...workouts]);
      setWorkoutName('');
      Alert.alert('Erfolg', `Workout "${newWorkout.name}" wurde gespeichert!`);
    } catch (error) {
      Alert.alert('Fehler', 'Das Workout konnte nicht gespeichert werden.');
    }
  };

  // POST /workouts/:id/exercises – Übung zum ausgewählten Workout hinzufügen
  const handleSaveExercise = async () => {
    if (!exerciseName.trim()) {
      Alert.alert('Fehler', 'Bitte einen Übungsnamen eingeben.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/workouts/${selectedWorkout.id}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: exerciseName }),
      });

      if (!response.ok) throw new Error('Fehler beim Speichern');

      const newExercise = await response.json();
      // Neues Exercise mit leerem Sets-Array einfügen
      setExercises([...exercises, { ...newExercise, sets: [] }]);
      setExerciseName('');
      setActiveModal(null);
    } catch (error) {
      Alert.alert('Fehler', 'Die Übung konnte nicht gespeichert werden.');
    }
  };

  // POST /exercises/:id/sets – Set zu einer Übung hinzufügen (NEU – Issue #14)
  const handleSaveSet = async () => {
    if (!setWeight.trim() || !setReps.trim()) {
      Alert.alert('Fehler', 'Bitte Gewicht und Wiederholungen eingeben.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/exercises/${selectedExercise.id}/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: parseFloat(setWeight),
          reps: parseInt(setReps, 10),
        }),
      });

      if (!response.ok) throw new Error('Fehler beim Speichern');

      const newSet = await response.json();

      // Set lokal zur richtigen Übung hinzufügen
      setExercises(exercises.map((ex) =>
        ex.id === selectedExercise.id
          ? { ...ex, sets: [...(ex.sets || []), newSet] }
          : ex
      ));

      setSetWeight('');
      setSetReps('');
      setActiveModal(null);
    } catch (error) {
      Alert.alert('Fehler', 'Das Set konnte nicht gespeichert werden.');
    }
  };

  // Detailansicht eines Workouts mit Übungsliste und Modals
  if (selectedWorkout) {
    return (
      <View style={globalStyles.container}>
        <TouchableOpacity onPress={() => setSelectedWorkout(null)} style={globalStyles.backButton}>
          <Text style={globalStyles.backButtonText}>← Zurück</Text>
        </TouchableOpacity>

        <Text style={globalStyles.title}>{selectedWorkout.name}</Text>
        <Text style={globalStyles.subtitle}>
          {new Date(selectedWorkout.createdAt).toLocaleDateString('de-CH')}
        </Text>

        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id.toString()}
          style={globalStyles.list}
          ListEmptyComponent={
            <Text style={globalStyles.emptyText}>Noch keine Übungen. Füge eine hinzu!</Text>
          }
          renderItem={({ item }) => (
            <View style={globalStyles.exerciseItem}>
              <Text style={globalStyles.exerciseName}>{item.name}</Text>

              {/* Sets der Übung anzeigen */}
              {(item.sets || []).map((set, index) => (
                <View key={set.id} style={globalStyles.setRow}>
                  <Text style={globalStyles.setText}>Satz {index + 1}</Text>
                  <Text style={globalStyles.setText}>{set.weight} kg</Text>
                  <Text style={globalStyles.setText}>{set.reps} Wdh.</Text>
                </View>
              ))}

              {/* Button um Set zu dieser Übung hinzuzufügen */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedExercise(item);
                  setActiveModal('set');
                }}
              >
                <Text style={{ color: '#888', fontSize: 13, marginTop: 8 }}>+ Satz hinzufügen</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <TouchableOpacity style={globalStyles.button} onPress={() => setActiveModal('exercise')}>
          <Text style={globalStyles.buttonText}>+ Übung hinzufügen</Text>
        </TouchableOpacity>

        {/* Modal: Neue Übung */}
        <Modal
          visible={activeModal === 'exercise'}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setActiveModal(null)}
        >
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContainer}>
              <Text style={globalStyles.modalTitle}>Neue Übung</Text>

              <TextInput
                style={globalStyles.input}
                placeholder="Übungsname (z.B. Bankdrücken)"
                value={exerciseName}
                onChangeText={setExerciseName}
              />

              <TouchableOpacity style={globalStyles.button} onPress={handleSaveExercise}>
                <Text style={globalStyles.buttonText}>Speichern</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={globalStyles.cancelButton}
                onPress={() => {
                  setExerciseName('');
                  setActiveModal(null);
                }}
              >
                <Text style={globalStyles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal: Neues Set (NEU – Issue #14) */}
        <Modal
          visible={activeModal === 'set'}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setActiveModal(null)}
        >
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContainer}>
              <Text style={globalStyles.modalTitle}>
                Satz hinzufügen{selectedExercise ? ` – ${selectedExercise.name}` : ''}
              </Text>

              <View style={globalStyles.setInputRow}>
                <TextInput
                  style={globalStyles.inputSmall}
                  placeholder="Gewicht (kg)"
                  keyboardType="numeric"
                  value={setWeight}
                  onChangeText={setSetWeight}
                />
                <TextInput
                  style={globalStyles.inputSmall}
                  placeholder="Wdh."
                  keyboardType="numeric"
                  value={setReps}
                  onChangeText={setSetReps}
                />
              </View>

              <TouchableOpacity style={globalStyles.button} onPress={handleSaveSet}>
                <Text style={globalStyles.buttonText}>Speichern</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={globalStyles.cancelButton}
                onPress={() => {
                  setSetWeight('');
                  setSetReps('');
                  setActiveModal(null);
                }}
              >
                <Text style={globalStyles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Hauptansicht: Workout erstellen + Liste aller Workouts
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Neues Workout</Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Workout-Name"
        value={workoutName}
        onChangeText={setWorkoutName}
      />

      <TouchableOpacity style={globalStyles.button} onPress={handleSaveWorkout}>
        <Text style={globalStyles.buttonText}>Speichern</Text>
      </TouchableOpacity>

      <Text style={globalStyles.sectionTitle}>Meine Workouts</Text>

      {loadingWorkouts ? (
        <ActivityIndicator size="large" color="#000" style={globalStyles.loader} />
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={globalStyles.workoutItem}
              onPress={() => setSelectedWorkout(item)}
            >
              <Text style={globalStyles.workoutName}>{item.name}</Text>
              <Text style={globalStyles.workoutDate}>
                {new Date(item.createdAt).toLocaleDateString('de-CH')}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={globalStyles.emptyText}>Noch keine Workouts gespeichert.</Text>
          }
        />
      )}
    </View>
  );
}