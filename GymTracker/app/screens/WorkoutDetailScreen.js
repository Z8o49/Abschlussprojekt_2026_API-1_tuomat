/**
 * Author: Mattia Tuor
 * Date: 24.06.2026
 * Version: 3.0
 * Description: Detailansicht eines Workouts mit Übungen und Sets. Ergänzt um einen Loading-State
 *              beim initialen Laden der Übungen, einen Fehlerzustand mit Retry sowie Schutz gegen
 *              Doppel-Submits in beiden Modals (Issue #24).
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
import globalStyles, { colors } from '../styles/globalStyles';

const API_URL = 'http://10.0.2.2:3000';

export default function WorkoutDetailScreen({ route, navigation }) {
  // Workout wird von WorkoutScreen via Navigation übergeben
  const { workout } = route.params;

  const [exercises, setExercises] = useState([]);
  const [exerciseName, setExerciseName] = useState('');

  // Lade- und Fehlerzustand für das initiale Laden der Übungen
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Steuert welches Modal sichtbar ist: null | 'exercise' | 'set'
  const [activeModal, setActiveModal] = useState(null);

  // Die Übung für die gerade ein Set erfasst wird
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Eingabefelder für neues Set
  const [setWeight, setSetWeight] = useState('');
  const [setReps, setSetReps] = useState('');

  // Schutz gegen Doppel-Submits in den beiden Modals
  const [isSavingExercise, setIsSavingExercise] = useState(false);
  const [isSavingSet, setIsSavingSet] = useState(false);

  // Übungen beim Laden des Screens abrufen
  useEffect(() => {
    fetchExercises();
  }, []);

  // GET /workouts/:id/exercises – Übungen inkl. Sets laden
  const fetchExercises = async () => {
    setLoadingExercises(true);
    setLoadError(false);
    try {
      const response = await fetch(`${API_URL}/workouts/${workout.id}/exercises`);
      if (!response.ok) throw new Error('Fehler beim Laden');
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      setLoadError(true);
    } finally {
      setLoadingExercises(false);
    }
  };

  // POST /workouts/:id/exercises – Übung zum Workout hinzufügen
  const handleSaveExercise = async () => {
    if (!exerciseName.trim()) {
      Alert.alert('Fehler', 'Bitte einen Übungsnamen eingeben.');
      return;
    }

    if (isSavingExercise) return;
    setIsSavingExercise(true);

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
    } finally {
      setIsSavingExercise(false);
    }
  };

  // POST /exercises/:id/sets – Set zu einer Übung hinzufügen
  const handleSaveSet = async () => {
    if (!setWeight.trim() || !setReps.trim()) {
      Alert.alert('Fehler', 'Bitte Gewicht und Wiederholungen eingeben.');
      return;
    }

    if (isSavingSet) return;
    setIsSavingSet(true);

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
    } finally {
      setIsSavingSet(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={globalStyles.backButton}
        activeOpacity={0.7}
      >
        <Text style={globalStyles.backButtonText}>← Zurück</Text>
      </TouchableOpacity>

      <Text style={globalStyles.title}>{workout.name}</Text>
      <Text style={globalStyles.subtitle}>
        {new Date(workout.createdAt).toLocaleDateString('de-CH')}
      </Text>

      {loadingExercises ? (
        <ActivityIndicator size="large" color={colors.primary} style={globalStyles.loader} />
      ) : loadError ? (
        <View style={globalStyles.errorContainer}>
          <Text style={globalStyles.errorText}>
            Übungen konnten nicht geladen werden. Läuft das Backend?
          </Text>
          <TouchableOpacity
            style={globalStyles.retryButton}
            onPress={fetchExercises}
            activeOpacity={0.7}
          >
            <Text style={globalStyles.retryButtonText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id.toString()}
          style={globalStyles.list}
          ListEmptyComponent={
            <Text style={globalStyles.emptyText}>Noch keine Übungen. Füge eine hinzu!</Text>
          }
          renderItem={({ item, index }) => {
            const sets = item.sets || [];
            const maxWeight = sets.length > 0 ? Math.max(...sets.map((s) => s.weight)) : null;

            return (
              <View style={globalStyles.exerciseItem}>
                <View style={globalStyles.exerciseHeaderRow}>
                  <Text style={globalStyles.exerciseName}>
                    {index + 1}. {item.name}
                  </Text>
                  {sets.length > 0 && (
                    <Text style={globalStyles.exerciseSummary}>
                      {sets.length} {sets.length === 1 ? 'Satz' : 'Sätze'} · max. {maxWeight} kg
                    </Text>
                  )}
                </View>

                {/* Sets der Übung als Tabelle mit Spaltenköpfen anzeigen */}
                {sets.length > 0 && (
                  <View style={globalStyles.setTable}>
                    <View style={globalStyles.setHeaderRow}>
                      <Text style={globalStyles.setHeaderText}>Satz</Text>
                      <Text style={globalStyles.setHeaderText}>Gewicht</Text>
                      <Text style={globalStyles.setHeaderText}>Wdh.</Text>
                    </View>
                    {sets.map((set, setIndex) => (
                      <View
                        key={set.id}
                        style={[
                          globalStyles.setRow,
                          setIndex % 2 === 1 && globalStyles.setRowAlt,
                        ]}
                      >
                        <Text style={globalStyles.setText}>{setIndex + 1}</Text>
                        <Text style={globalStyles.setText}>{set.weight} kg</Text>
                        <Text style={globalStyles.setText}>{set.reps}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Button um Set zu dieser Übung hinzuzufügen */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedExercise(item);
                    setActiveModal('set');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={globalStyles.addSetText}>+ Satz hinzufügen</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => setActiveModal('exercise')}
        activeOpacity={0.7}
      >
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
              editable={!isSavingExercise}
            />

            <TouchableOpacity
              style={[globalStyles.button, isSavingExercise && globalStyles.buttonDisabled]}
              onPress={handleSaveExercise}
              disabled={isSavingExercise}
              activeOpacity={0.7}
            >
              {isSavingExercise ? (
                <ActivityIndicator size="small" color={colors.primaryText} />
              ) : (
                <Text style={globalStyles.buttonText}>Speichern</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={globalStyles.cancelButton}
              onPress={() => {
                setExerciseName('');
                setActiveModal(null);
              }}
              activeOpacity={0.7}
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
                editable={!isSavingSet}
              />
              <TextInput
                style={globalStyles.inputSmall}
                placeholder="Wdh."
                keyboardType="numeric"
                value={setReps}
                onChangeText={setSetReps}
                editable={!isSavingSet}
              />
            </View>

            <TouchableOpacity
              style={[globalStyles.button, isSavingSet && globalStyles.buttonDisabled]}
              onPress={handleSaveSet}
              disabled={isSavingSet}
              activeOpacity={0.7}
            >
              {isSavingSet ? (
                <ActivityIndicator size="small" color={colors.primaryText} />
              ) : (
                <Text style={globalStyles.buttonText}>Speichern</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={globalStyles.cancelButton}
              onPress={() => {
                setSetWeight('');
                setSetReps('');
                setActiveModal(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={globalStyles.cancelButtonText}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}