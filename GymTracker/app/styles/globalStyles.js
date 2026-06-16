/**
 * Author: Mattia Tuor
 * Date: 16.06.2026
 * Version: 1.0
 * Description: Globale Styles für alle Screens der GymTracker App
 */

import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#fff',
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  // Texte
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  titleLarge: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  subtitleLarge: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 24,
    fontSize: 14,
  },

  // Eingabefeld
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    flex: 1,
  },

  // Buttons
  button: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },

  // Listen-Einträge
  workoutItem: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
  },
  workoutDate: {
    fontSize: 13,
    color: '#888',
  },
  exerciseItem: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },

  // Sets
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  setText: {
    fontSize: 14,
    color: '#555',
  },
  setInputRow: {
    flexDirection: 'row',
    gap: 12,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  // Sonstiges
  list: {
    flex: 1,
  },
  loader: {
    marginTop: 32,
  },
});

export default globalStyles;