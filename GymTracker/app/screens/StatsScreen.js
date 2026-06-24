/**
 * Author: Mattia Tuor
 * Date: 24.06.2026
 * Version: 4.0
 * Description: Statistik-Screen mit Gesamtanzahl Workouts, Trainings pro Woche und
 *              Gewichtsfortschritt pro Übung. Zeigt jetzt einen sichtbaren Fehlerzustand mit
 *              Retry an, falls das Laden der Statistiken fehlschlägt (Issue #24).
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import globalStyles, { colors } from '../styles/globalStyles';

const API_URL = 'http://10.0.2.2:3000';

export default function StatsScreen() {
  const [totalWorkouts, setTotalWorkouts] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyAverage, setWeeklyAverage] = useState(0);

  const [exerciseNames, setExerciseNames] = useState([]);
  const [selectedExerciseName, setSelectedExerciseName] = useState(null);
  const [weightProgress, setWeightProgress] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Alle Statistiken neu laden, wenn der Screen fokussiert wird
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  // Sammelt alle benötigten Statistik-Daten beim Laden des Screens
  const loadStats = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      await Promise.all([
        fetchTotalWorkouts(),
        fetchWorkoutsPerWeek(),
        fetchExerciseNames(),
      ]);
    } catch (error) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  // GET /stats/total-workouts – Gesamtanzahl Trainings laden (Issue #20)
  const fetchTotalWorkouts = async () => {
    const response = await fetch(`${API_URL}/stats/total-workouts`);
    if (!response.ok) throw new Error('Fehler beim Laden der Statistik');
    const data = await response.json();
    setTotalWorkouts(data.total);
  };

  // GET /stats/workouts-per-week – Trainings pro Woche laden (Issue #21)
  const fetchWorkoutsPerWeek = async () => {
    const response = await fetch(`${API_URL}/stats/workouts-per-week`);
    if (!response.ok) throw new Error('Fehler beim Laden der Wochenstatistik');
    const data = await response.json();
    setWeeklyData(data.weeklyData || []);
    setWeeklyAverage(data.average || 0);
  };

  // GET /stats/exercise-names – verfügbare Übungen für den Gewichtsfortschritt laden (Issue #22)
  const fetchExerciseNames = async () => {
    const response = await fetch(`${API_URL}/stats/exercise-names`);
    if (!response.ok) throw new Error('Fehler beim Laden der Übungsnamen');
    const names = await response.json();
    setExerciseNames(names);

    // Erste Übung automatisch auswählen, falls noch keine ausgewählt ist
    if (names.length > 0 && !selectedExerciseName) {
      setSelectedExerciseName(names[0]);
      fetchWeightProgress(names[0]);
    }
  };

  // GET /stats/weight-progress/:exerciseName – Gewichtsverlauf einer Übung laden (Issue #22)
  const fetchWeightProgress = async (exerciseName) => {
    try {
      const response = await fetch(
        `${API_URL}/stats/weight-progress/${encodeURIComponent(exerciseName)}`
      );
      if (!response.ok) throw new Error('Fehler beim Laden des Gewichtsfortschritts');
      const data = await response.json();
      setWeightProgress(data);
    } catch (error) {
      console.error('Fehler beim Laden des Gewichtsfortschritts:', error);
      setWeightProgress([]);
    }
  };

  const handleSelectExercise = (name) => {
    setSelectedExerciseName(name);
    fetchWeightProgress(name);
  };

  if (loading) {
    return (
      <View style={globalStyles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary} style={globalStyles.loader} />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={globalStyles.centeredContainer}>
        <View style={globalStyles.errorContainer}>
          <Text style={globalStyles.errorText}>
            Statistiken konnten nicht geladen werden. Läuft das Backend?
          </Text>
          <TouchableOpacity
            style={globalStyles.retryButton}
            onPress={loadStats}
            activeOpacity={0.7}
          >
            <Text style={globalStyles.retryButtonText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const maxWeeklyCount = Math.max(1, ...weeklyData.map((w) => w.count));
  const maxProgressWeight = Math.max(1, ...weightProgress.map((p) => p.maxWeight));

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>Statistiken</Text>

      {/* Gesamtanzahl Workouts (Issue #20) */}
      <View style={globalStyles.statBlock}>
        <Text style={globalStyles.titleLarge}>{totalWorkouts ?? '–'}</Text>
        <Text style={globalStyles.subtitleLarge}>
          {totalWorkouts === 1 ? 'absolviertes Training' : 'absolvierte Trainings'}
        </Text>
      </View>

      {/* Trainings pro Woche (Issue #21) */}
      <Text style={globalStyles.sectionTitle}>Trainings pro Woche</Text>
      <Text style={globalStyles.subtitle}>
        Durchschnitt: {weeklyAverage} {weeklyAverage === 1 ? 'Training' : 'Trainings'} / Woche
      </Text>

      {weeklyData.length === 0 ? (
        <Text style={globalStyles.emptyText}>Noch keine Daten vorhanden.</Text>
      ) : (
        <View style={globalStyles.barChartRow}>
          {weeklyData.map((week) => (
            <View key={week.weekStart} style={globalStyles.barColumn}>
              <View
                style={[
                  globalStyles.bar,
                  { height: Math.max(4, (week.count / maxWeeklyCount) * 100) },
                ]}
              />
              <Text style={globalStyles.barValue}>{week.count}</Text>
              <Text style={globalStyles.barLabel}>
                {new Date(week.weekStart).toLocaleDateString('de-CH', {
                  day: '2-digit',
                  month: '2-digit',
                })}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Gewichtsfortschritt pro Übung (Issue #22) */}
      <Text style={globalStyles.sectionTitle}>Gewichtsfortschritt</Text>

      {exerciseNames.length === 0 ? (
        <Text style={globalStyles.emptyText}>Noch keine Übungen erfasst.</Text>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {exerciseNames.map((name) => (
                <TouchableOpacity
                  key={name}
                  style={[
                    globalStyles.exerciseChip,
                    selectedExerciseName === name && globalStyles.exerciseChipActive,
                  ]}
                  onPress={() => handleSelectExercise(name)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      globalStyles.exerciseChipText,
                      selectedExerciseName === name && globalStyles.exerciseChipTextActive,
                    ]}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {weightProgress.length === 0 ? (
            <Text style={globalStyles.emptyText}>
              Noch keine Sätze für diese Übung erfasst.
            </Text>
          ) : (
            <View style={globalStyles.barChartRow}>
              {weightProgress.map((entry) => (
                <View key={entry.date} style={globalStyles.barColumn}>
                  <View
                    style={[
                      globalStyles.bar,
                      { height: Math.max(4, (entry.maxWeight / maxProgressWeight) * 100) },
                    ]}
                  />
                  <Text style={globalStyles.barValue}>{entry.maxWeight} kg</Text>
                  <Text style={globalStyles.barLabel}>
                    {new Date(entry.date).toLocaleDateString('de-CH', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}