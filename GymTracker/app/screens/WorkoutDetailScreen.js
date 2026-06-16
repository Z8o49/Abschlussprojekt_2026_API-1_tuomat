/**
 * Author: Mattia Tuor
 * Date: 16.06.2026
 * Version: 1.0
 * Description: Detailansicht eines Workouts mit Übungen und Sets
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
} from 'react-native';
import globalStyles from '../styles/globalStyles';

const API_URL = 'http://10.0.2.2:3000';

export default function WorkoutDetailScreen({ route, navigation }) {
  // Workout wird von WorkoutScreen via Navigation übergeben
  const { workout } = route.params;

  const [exercises, setExercises] = useState([]);
  const [exerciseName, setExerciseName] = useState('');

  // Steuert welches Modal sichtbar ist: null | 'exercise' | 'set'
  const [activeModal, setActiveModal] = useState(null);

  // Die Übung für die gerade ein Set erfasst wird
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Eingabefelder für neues Set
  const [setWeight, setSetWeight] = useState('');
  const [setReps, setSetReps] = useState('');

  // Übungen beim Laden des Screens abrufen
  useEffect(() => {
    fetchExercises();
  }, []);

  // GET /workouts/:id/exercises – Übungen inkl. Sets laden
  const fetchExercises = async () => {
    try {
      const response = await fetch(`${API_URL}/workouts/${workout.id}/exercises`);
      if (!response.ok) throw new Error('Fehler beim Laden');
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      Alert.alert('Fehler', 'Übungen konnten nicht geladen werden.');
    }
  };

  // POST /workouts/:id/exercises – Übung zum Workout hinzufügen
  const handleSaveExercise = async () => {
    if (!exerciseName.trim()) {
      Alert.alert('Fehler', 'Bitte einen Übungsnamen eingeben.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/workouts/${workout.id}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: exerciseName }),
      });

      if (!response.ok) throw new Error('Fehler beim Speichern');

      const newExercise = await response.json();
      setExercises([...exercises, { ...newExercise, sets: [] }]);
      setExerciseName('');
      setActiveModal(null);
    } catch (error) {
      Alert.alert('Fehler', 'Die Übung konnte nicht gespeichert werden.');
    }
  };

  // POST /exercises/:id/sets – Set zu einer Übung hinzufügen
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

  return (
    <View style={globalStyles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={globalStyles.backButton}>
        <Text style={globalStyles.backButtonText}>← Zurück</Text>
      </TouchableOpacity>

      <Text style={globalStyles.title}>{workout.name}</Text>
      <Text style={globalStyles.subtitle}>
        {new Date(workout.createdAt).toLocaleDateString('de-CH')}
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

      {/* Modal: Neues Set */}
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