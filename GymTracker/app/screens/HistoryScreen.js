/**
 * Author: Mattia Tuor
 * Date: 17.06.2026
 * Version: 2.0
 * Description: Trainingshistorie mit chronologischer Workout-Liste und Datumsfilter
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import globalStyles from '../styles/globalStyles';

const API_URL = 'http://10.0.2.2:3000';

export default function HistoryScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  // Workouts neu laden wenn Screen fokussiert wird
  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, [])
  );

  // GET /workouts – alle Workouts laden und neueste zuerst sortieren
  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/workouts`);
      if (!response.ok) throw new Error('Fehler beim Laden');
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      console.error('Fehler beim Laden der Workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Deutsches Datum DD.MM.YYYY in Date-Objekt umwandeln
  function parseFilterDate(dateStr) {
    if (!dateStr || dateStr.length < 10) return null;
    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }

  // Liste nach Von/Bis-Datum filtern
  const getFilteredWorkouts = () => {
    const from = parseFilterDate(filterFrom);
    const to = parseFilterDate(filterTo);
    return workouts.filter((w) => {
      const workoutDate = new Date(w.createdAt);
      if (from && workoutDate < from) return false;
      if (to && workoutDate > to) return false;
      return true;
    });
  };

  const filtered = getFilteredWorkouts();

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Trainingshistorie</Text>

      {/* Datumsfilter */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TextInput
          style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Von (TT.MM.JJJJ)"
          value={filterFrom}
          onChangeText={setFilterFrom}
          maxLength={10}
        />
        <TextInput
          style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Bis (TT.MM.JJJJ)"
          value={filterTo}
          onChangeText={setFilterTo}
          maxLength={10}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={globalStyles.loader} />
      ) : (
        <FlatList
          data={filtered}
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
            <Text style={globalStyles.emptyText}>Keine Trainings gefunden.</Text>
          }
        />
      )}
    </View>
  );
}