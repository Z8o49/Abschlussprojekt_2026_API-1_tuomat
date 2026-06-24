/**
 * Author: Mattia Tuor
 * Date: 24.06.2026
 * Version: 4.0
 * Description: Globale Styles für alle Screens der GymTracker App. Enthält eine zentrale
 *              Farbpalette sowie Styles für Lade- und Fehlerzustände.
 */

import { StyleSheet } from 'react-native';

// Zentrale Farbpalette – sorgt für konsistente Farben über die gesamte App (Issue #23)
export const colors = {
  background: '#fff',
  text: '#000',
  textMuted: '#888',
  textFaint: '#aaa',
  border: '#eee',
  borderInput: '#ccc',
  surfaceAlt: '#fafafa',
  primary: '#000',
  primaryText: '#fff',
  danger: '#d32f2f',
  dangerBackground: '#fdecea',
};

// Zentrale Abstände – einheitliche Spacing-Skala statt verstreuter Magic-Numbers (Issue #23)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Einheitlicher Radius für Cards, Buttons und Inputs (Issue #23)
const radius = {
  sm: 8,
  md: 16,
  lg: 20,
};

const globalStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: 48,
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },

  // Texte
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.text,
  },
  titleLarge: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  subtitleLarge: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: spacing.xl,
    marginBottom: 12,
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textFaint,
    marginTop: spacing.lg,
    fontSize: 14,
  },

  // Eingabefeld
  input: {
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 16,
    marginBottom: spacing.md,
    color: colors.text,
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 16,
    marginBottom: spacing.md,
    flex: 1,
    color: colors.text,
  },

  // Buttons
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: radius.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 14,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  retryButton: {
    borderWidth: 1,
    borderColor: colors.text,
    padding: 12,
    borderRadius: radius.sm,
    alignItems: 'center',
    marginTop: spacing.md,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  retryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },

  // Listen-Einträge
  workoutItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  workoutDate: {
    fontSize: 13,
    color: colors.textMuted,
  },
  exerciseItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 14,
    marginBottom: spacing.sm,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  exerciseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  exerciseSummary: {
    fontSize: 12,
    color: colors.textMuted,
  },
  addSetText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.sm,
  },

  // Sets
  setTable: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 6,
  },
  setHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  setHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textFaint,
    flex: 1,
    textAlign: 'left',
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  setRowAlt: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 4,
  },
  setText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    textAlign: 'left',
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
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    padding: spacing.lg,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.text,
  },

  // Sonstiges
  list: {
    flex: 1,
  },
  loader: {
    marginTop: spacing.xl,
  },

  // Fehlerzustände (Issue #24)
  errorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  inlineErrorBanner: {
    backgroundColor: colors.dangerBackground,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  inlineErrorBannerText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
  },

  // Statistiken
  statBlock: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    marginBottom: spacing.lg,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 18,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  barValue: {
    fontSize: 11,
    color: '#555',
    marginTop: 6,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textFaint,
    marginTop: 2,
  },
  exerciseChip: {
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  exerciseChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  exerciseChipText: {
    fontSize: 14,
    color: '#555',
  },
  exerciseChipTextActive: {
    color: colors.primaryText,
    fontWeight: '600',
  },
});

export default globalStyles;