/**
 * Main theme configuration for the Gainizi application
 * This file contains all the styling variables used throughout the app
 */

import { Platform } from 'react-native';

/**
 * Color palette
 */
export const colors = {
  // Primary colors
  primary: '#fd8f09', // Orange - main accent color
  primaryLight: 'rgba(253, 143, 9, 0.1)',
  primaryBorder: 'rgba(253, 143, 9, 0.3)',

  // Secondary colors
  secondary: '#a600e7', // Couleur secondaire
  secondaryLight: 'rgba(166, 0, 231, 0.1)',
  secondaryBorder: 'rgba(166, 0, 231, 0.3)',

  // Secondary colors
  success: '#22c55e', // Green - for success states, workout timer
  error: '#ef4444', // Red - for error states, rest timer
  warning: '#f59e0b', // Added warning color
  info: '#0ea5e9', // Added info color

  // Background colors
  background: {
    main: '#0a0a0a', // Main app background
    card: '#1a1a1a', // Card backgrounds
    input: '#1a1a1a', // Input backgrounds
    button: '#333', // Button backgrounds
    disabled: '#151515', // Disabled surfaces
    overlay: 'rgba(0, 0, 0, 0.5)' // Modal overlay
  },

  // Text colors
  text: {
    primary: '#fff', // Primary text
    secondary: '#999', // Secondary text
    disabled: '#666', // Disabled text
    accent: '#fd8f09', // Accent text (same as primary color)
    warning: '#f59e0b', // Added warning text color
    onPrimary: '#FFFFFF' // Text on primary color background
  },

  // Border colors
  border: {
    default: '#333', // Default borders
    focus: '#fd8f09' // Focused borders
  },

  // Measurement point colors
  measurement: {
    neck: '#0ea5e9', // Info color
    shoulders: '#22c55e', // Success color
    chest: '#22c55e', // Success color
    arms: '#a600e7', // Primary color
    forearms: '#a600e7', // Primary color
    waist: '#f59e0b', // Warning color
    hips: '#f59e0b', // Warning color
    thighs: '#ef4444', // Error color
    calves: '#ef4444' // Error color
  }
};

/**
 * Typography
 */
export const typography = {
  // Font families
  fontFamily: {
    regular: 'Inter-Regular',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold'
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.8
  }
};

/**
 * Spacing
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48
};

/**
 * Border radius
 */
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 10,
  base: 12,
  lg: 16,
  xl: 20,
  full: 9999
};

/**
 * Shadows
 */
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8
  },
  primary: {
    shadowColor: '#fd8f09',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3
  }
};

/**
 * Z-index values
 */
export const zIndex = {
  base: 1,
  dropdown: 10,
  modal: 50,
  toast: 100
};

/**
 * Layout
 */
export const layout = {
  screenPadding: spacing.lg,
  contentPadding: spacing.base,
  headerHeight: Platform.OS === 'ios' ? 90 : 70,
  buttonSize: {
    small: 40,
    medium: 50,
    large: 60
  }
};

/**
 * Export the entire theme
 */
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  layout
};

export default theme;
