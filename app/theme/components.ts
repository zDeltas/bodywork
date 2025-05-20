/**
 * Component-specific styling based on the theme
 * This file provides pre-styled configurations for common UI components
 */

import { StyleSheet } from 'react-native';
import theme from './theme';

/**
 * Button styles
 */
export const buttons = StyleSheet.create({
  // Primary button (orange)
  primary: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.primary
  },
  primaryText: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg
  },

  // Secondary button (dark gray)
  secondary: {
    backgroundColor: theme.colors.background.button,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm
  },
  secondaryText: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.base
  },

  // Outline button (transparent with border)
  outline: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary
  },
  outlineText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.base
  },

  // Icon button (circular)
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background.button,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm
  },

  // Disabled state
  disabled: {
    opacity: 0.6
  }
});

/**
 * Card styles
 */
export const cards = StyleSheet.create({
  // Standard card
  default: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    ...theme.shadows.sm
  },

  // Highlighted card
  highlighted: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    ...theme.shadows.sm
  }
});

/**
 * Input styles
 */
export const inputs = StyleSheet.create({
  // Standard input
  default: {
    backgroundColor: theme.colors.background.input,
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing.base,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.base,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    ...theme.shadows.sm
  },

  // Compact input (smaller)
  compact: {
    backgroundColor: theme.colors.background.input,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    ...theme.shadows.sm,
    textAlign: 'center'
  },

  // Multiline input (for notes, etc.)
  multiline: {
    backgroundColor: theme.colors.background.input,
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing.base,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.base,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    ...theme.shadows.sm,
    minHeight: 80,
    textAlignVertical: 'top'
  }
});

/**
 * Typography styles
 */
export const text = StyleSheet.create({
  // Headings
  h1: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize['3xl'],
    color: theme.colors.text.primary
  },
  h2: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.text.primary
  },
  h3: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary
  },

  // Body text
  body: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.normal
  },
  bodySmall: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary
  },

  // Special text styles
  label: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm
  },
  accent: {
    color: theme.colors.text.accent,
    fontFamily: theme.typography.fontFamily.semiBold
  },
  secondary: {
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.regular
  }
});

/**
 * Layout styles
 */
export const layout = StyleSheet.create({
  // Screen container
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background.main
  },

  // Content container
  content: {
    flex: 1,
    padding: theme.layout.contentPadding
  },

  // Header
  header: {
    paddingTop: theme.layout.headerHeight - 20,
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.md
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  // Centered content
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Space between items
  spaceBetween: {
    justifyContent: 'space-between'
  }
});

/**
 * Export all component styles
 */
const components = {
  buttons,
  cards,
  inputs,
  text,
  layout
};

export default components;
