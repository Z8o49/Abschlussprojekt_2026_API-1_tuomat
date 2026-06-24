/**
 * Author: Mattia Tuor
 * Date: 24.06.2026
 * Version: 4.0
 * Description: Hauptnavigation mit Bottom Tab Navigator und Stack Navigatoren für Workout und
 *              Historie. Tabs erhalten Icons und ein einheitliches Farbschema.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatsScreen from '../screens/StatsScreen';
import { colors } from '../styles/globalStyles';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Ordnet jedem Tab-Namen das passende Ionicons-Icon zu (gefüllt = aktiv, outline = inaktiv)
const TAB_ICONS = {
  Home: { active: 'home', inactive: 'home-outline' },
  Workout: { active: 'barbell', inactive: 'barbell-outline' },
  Historie: { active: 'time', inactive: 'time-outline' },
  Statistiken: { active: 'stats-chart', inactive: 'stats-chart-outline' },
};

// Stack Navigator für Workout-Tab (Liste + Detailansicht)
function WorkoutStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkoutList" component={WorkoutScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
    </Stack.Navigator>
  );
}

// Stack Navigator für Historie-Tab (Liste + Detailansicht)
function HistorieStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HistorieList" component={HistoryScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
    </Stack.Navigator>
  );
}

// Hauptnavigation mit vier Tabs
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            borderTopColor: colors.border,
          },
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            const iconName = focused ? icons.active : icons.inactive;
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Workout" component={WorkoutStack} />
        <Tab.Screen name="Historie" component={HistorieStack} />
        <Tab.Screen name="Statistiken" component={StatsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}