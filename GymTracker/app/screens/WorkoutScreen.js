/**
 * Author: Mattia Tuor
 * Date: 10.06.2026
 * Version: 3.0
 * Description: Screen für Workout-Übersicht, Workout erstellen und Übungen hinzufügen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';

const API_URL = 'http://10.0.2.2:3000';

export default function WorkoutScreen() {
  // Aktuell ausgewähltes Workout (für Detailansicht)
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

  // Steuert die Sichtbarkeit des Modals für neue Übungen
  const [modalVisible, setModalVisible] = useState(false);

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

  // GET /workouts/:id/exercises – Übungen eines Workouts laden
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
      setExercises([...exercises, newExercise]);
      setExerciseName('');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Fehler', 'Die Übung konnte nicht gespeichert werden.');
    }
  };

  // Detailansicht eines Workouts mit Übungsliste und Modal
  if (selectedWorkout) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setSelectedWorkout(null)} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Zurück</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{selectedWorkout.name}</Text>
        <Text style={styles.subtitle}>
          {new Date(selectedWorkout.createdAt).toLocaleDateString('de-CH')}
        </Text>

        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.exerciseItem}>
              <Text style={styles.exerciseName}>{item.name}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Noch keine Übungen. Füge eine hinzu!</Text>
          }
          style={styles.list}
        />

        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>+ Übung hinzufügen</Text>
        </TouchableOpacity>

        {/* Modal für neue Übung */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Neue Übung</Text>

              <TextInput
                style={styles.input}
                placeholder="Übungsname (z.B. Bankdrücken)"
                value={exerciseName}
                onChangeText={setExerciseName}
              />

              <TouchableOpacity style={styles.button} onPress={handleSaveExercise}>
                <Text style={styles.buttonText}>Speichern</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setExerciseName('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Hauptansicht: Workout erstellen + Liste aller Workouts
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Neues Workout</Text>

      <TextInput
        style={styles.input}
        placeholder="Workout-Name"
        value={workoutName}
        onChangeText={setWorkoutName}
      />

      <TouchableOpacity style={styles.button} onPress={handleSaveWorkout}>
        <Text style={styles.buttonText}>Speichern</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Meine Workouts</Text>

      {loadingWorkouts ? (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.workoutItem}
              onPress={() => setSelectedWorkout(item)}
            >
              <Text style={styles.workoutName}>{item.name}</Text>
              <Text style={styles.workoutDate}>
                {new Date(item.createdAt).toLocaleDateString('de-CH')}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Noch keine Workouts gespeichert.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
  },
  workoutItem: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
  },
  workoutDate: {
    fontSize: 13,
    color: '#888',
  },
  exerciseItem: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 24,
    fontSize: 14,
  },
  loader: {
    marginTop: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});