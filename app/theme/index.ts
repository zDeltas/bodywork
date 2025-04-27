/**
 * Theme index file
 * This file exports all theme-related files for easy importing
 */

import darkTheme, { 
  colors, 
  typography, 
  spacing, 
  borderRadius, 
  shadows, 
  zIndex, 
  layout as themeLayout 
} from './theme';

import lightTheme from './lightTheme';

import components, { 
  buttons, 
  cards, 
  inputs, 
  text, 
  layout as componentLayout 
} from './components';

import { useDynamicStyles } from './dynamicComponents';

// Export everything
export {
  // Theme variables
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  themeLayout,

  // Component styles
  buttons,
  cards,
  inputs,
  text,
  componentLayout,

  // Full objects
  darkTheme,
  lightTheme,
  components,

  // Theme hooks
  useDynamicStyles
};

// For backward compatibility, export darkTheme as the default theme
export default {
  ...darkTheme,
  components
};
