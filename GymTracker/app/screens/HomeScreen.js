/**
 * Author: Mattia Tuor
 * Date: 24.06.2026
 * Version: 2.0
 * Description: Home Screen - Main Seite der GymTracker App. Erhält ein Icon und eine kurze
 *              Beschreibung, damit der Screen nicht mehr leer wirkt (Issue #23).
 */

import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import globalStyles, { colors, spacing } from '../styles/globalStyles';

export default function HomeScreen() {
  return (
    <View style={globalStyles.centeredContainer}>
      <Ionicons name="barbell" size={56} color={colors.primary} style={{ marginBottom: spacing.md }} />
      <Text style={globalStyles.titleLarge}>GymTracker</Text>
      <Text style={globalStyles.subtitleLarge}>Willkommen!</Text>
      <Text style={[globalStyles.subtitle, { marginTop: spacing.sm, textAlign: 'center' }]}>
        Erfasse deine Workouts, behalte deine Historie im Blick und verfolge deinen Fortschritt.
      </Text>
    </View>
  );
}