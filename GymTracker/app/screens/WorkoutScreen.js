/**
 * Author: Mattia Tuor
 * Date: 24.06.2026
 * Version: 6.0
 * Description: Screen für Workout-Übersicht und neues Workout erstellen. Erhält einen sichtbaren
 *              Fehlerzustand mit Retry-Möglichkeit und einen Schutz gegen Doppel-Submits (Issue #24).
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import globalStyles, { colors } from '../styles/globalStyles';

const API_URL = 'http://10.0.2.2:3000';

export default function WorkoutScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const [workoutName, setWorkoutName] = useState('');
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Alle Workouts beim ersten Laden abrufen
  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Workouts neu laden wenn man von der Detailansicht zurückkommt
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchWorkouts);
    return unsubscribe;
  }, [navigation]);

  // GET /workouts – alle Workouts vom Backend laden
  const fetchWorkouts = async () => {
    setLoadingWorkouts(true);
    setLoadError(false);
    try {
      const response = await fetch(`${API_URL}/workouts`);
      if (!response.ok) throw new Error('Fehler beim Laden');
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      setLoadError(true);
    } finally {
      setLoadingWorkouts(false);
    }
  };

  // POST /workouts – neues Workout erstellen und Liste aktualisieren
  const handleSaveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Fehler', 'Bitte einen Workout-Namen eingeben.');
      return;
    }

    // Schutz gegen Doppel-Submits, falls der Button mehrfach getippt wird
    if (isSaving) return;
    setIsSaving(true);

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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Neues Workout</Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Workout-Name"
        value={workoutName}
        onChangeText={setWorkoutName}
        editable={!isSaving}
      />

      <TouchableOpacity
        style={[globalStyles.button, isSaving && globalStyles.buttonDisabled]}
        onPress={handleSaveWorkout}
        disabled={isSaving}
        activeOpacity={0.7}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={colors.primaryText} />
        ) : (
          <Text style={globalStyles.buttonText}>Speichern</Text>
        )}
      </TouchableOpacity>

      <Text style={globalStyles.sectionTitle}>Meine Workouts</Text>

      {loadingWorkouts ? (
        <ActivityIndicator size="large" color={colors.primary} style={globalStyles.loader} />
      ) : loadError ? (
        <View style={globalStyles.errorContainer}>
          <Text style={globalStyles.errorText}>
            Workouts konnten nicht geladen werden. Läuft das Backend?
          </Text>
          <TouchableOpacity
            style={globalStyles.retryButton}
            onPress={fetchWorkouts}
            activeOpacity={0.7}
          >
            <Text style={globalStyles.retryButtonText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={globalStyles.workoutItem}
              onPress={() => navigation.navigate('WorkoutDetail', { workout: item })}
              activeOpacity={0.7}
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