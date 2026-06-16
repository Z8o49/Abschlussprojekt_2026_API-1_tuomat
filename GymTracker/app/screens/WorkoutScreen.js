/**
 * Author: Mattia Tuor
 * Date: 16.06.2026
 * Version: 5.0
 * Description: Screen für Workout-Übersicht und neues Workout erstellen
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
import globalStyles from '../styles/globalStyles';

const API_URL = 'http://10.0.2.2:3000';

export default function WorkoutScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const [workoutName, setWorkoutName] = useState('');
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

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
              onPress={() => navigation.navigate('WorkoutDetail', { workout: item })}
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