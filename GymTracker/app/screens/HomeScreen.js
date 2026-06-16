/**
 * Author: Mattia Tuor
 * Date: 01.06.2026
 * Version: 1.1
 * Description: Home Screen - Main Seite der GymTracker App
 */

import { View, Text } from 'react-native';
import globalStyles from '../styles/globalStyles';

export default function HomeScreen() {
  return (
    <View style={globalStyles.centeredContainer}>
      <Text style={globalStyles.titleLarge}>GymTracker</Text>
      <Text style={globalStyles.subtitleLarge}>Willkommen!</Text>
    </View>
  );
}