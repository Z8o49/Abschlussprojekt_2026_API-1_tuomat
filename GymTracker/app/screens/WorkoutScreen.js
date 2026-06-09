/**
 * Author: Mattia Tuor
 * Date: 05.06.2026
 * Version: 2.0
 * Description: Screen zum Erstellen eines neuen Workouts mit API-Anbindung
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const API_URL = 'http://10.0.2.2:3000';

export default function WorkoutScreen() {
  const [workoutName, setWorkoutName] = useState('');

  // Sendet das neue Workout ans Backend und speichert es in der Datenbank
  const handleSave = async () => {
    console.log('handleSave aufgerufen');
    if (!workoutName.trim()) {
      Alert.alert('Fehler', 'Bitte einen Workout-Namen eingeben.');
      return;
    }
    console.log('Name:', workoutName);
    console.log('Sende Request...');

    try {
      const response = await fetch(`${API_URL}/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workoutName }),
      });
      console.log('Response Status:', response.status);

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      const workout = await response.json();
      Alert.alert('Erfolg', `Workout "${workout.name}" wurde gespeichert!`);
      setWorkoutName('');
    } catch (error) {
      console.log('Fehler:', error.message);
      Alert.alert('Fehler', 'Das Workout konnte nicht gespeichert werden.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Neues Workout</Text>

      <TextInput
        style={styles.input}
        placeholder="Workout-Name"
        value={workoutName}
        onChangeText={setWorkoutName}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Speichern</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});