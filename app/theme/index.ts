/**
 * Theme index file
 * This file exports all theme-related files for easy importing
 */

import theme, { 
  colors, 
  typography, 
  spacing, 
  borderRadius, 
  shadows, 
  zIndex, 
  layout as themeLayout 
} from './theme';

import components, { 
  buttons, 
  cards, 
  inputs, 
  text, 
  layout as componentLayout 
} from './components';

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
  theme,
  components
};

// Default export for importing everything at once
export default {
  ...theme,
  components
};
