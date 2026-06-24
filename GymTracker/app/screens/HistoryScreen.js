/**
 * Author: Mattia Tuor
 * Date: 24.06.2026
 * Version: 3.0
 * Description: Trainingshistorie mit chronologischer Workout-Liste und Datumsfilter. Lade-Fehler
 *              werden jetzt sichtbar mit Retry-Möglichkeit angezeigt statt nur in der Konsole (Issue #24).
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import globalStyles, { colors } from '../styles/globalStyles';

const API_URL = 'http://10.0.2.2:3000';

export default function HistoryScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
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
      setLoadError(false);
      const response = await fetch(`${API_URL}/workouts`);
      if (!response.ok) throw new Error('Fehler beim Laden');
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      setLoadError(true);
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
        <ActivityIndicator size="large" color={colors.primary} style={globalStyles.loader} />
      ) : loadError ? (
        <View style={globalStyles.errorContainer}>
          <Text style={globalStyles.errorText}>
            Trainingshistorie konnte nicht geladen werden. Läuft das Backend?
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
          data={filtered}
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
            <Text style={globalStyles.emptyText}>Keine Trainings gefunden.</Text>
          }
        />
      )}
    </View>
  );
}