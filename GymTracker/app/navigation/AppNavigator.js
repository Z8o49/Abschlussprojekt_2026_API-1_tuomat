/**
 * Author: Mattia Tuor
 * Date: 02.06.2026
 * Version: 1.0
 * Description: Hauptnavigation der App mit Bottom Tab Navigator
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatsScreen from '../screens/StatsScreen';

const Tab = createBottomTabNavigator();

// Hauptnavigation mit vier Tabs
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Workout" component={WorkoutScreen} />
        <Tab.Screen name="Historie" component={HistoryScreen} />
        <Tab.Screen name="Statistiken" component={StatsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}