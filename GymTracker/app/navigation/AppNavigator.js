/**
 * Author: Mattia Tuor
 * Date: 16.06.2026
 * Version: 2.0
 * Description: Hauptnavigation der App mit Bottom Tab Navigator und Stack Navigator für Workout-Details
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatsScreen from '../screens/StatsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack Navigator für Workout-Tab (Liste + Detailansicht)
function WorkoutStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkoutList" component={WorkoutScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
    </Stack.Navigator>
  );
}

// Hauptnavigation mit vier Tabs
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Workout" component={WorkoutStack} />
        <Tab.Screen name="Historie" component={HistoryScreen} />
        <Tab.Screen name="Statistiken" component={StatsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}