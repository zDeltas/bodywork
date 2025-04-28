# Bodywork App Theme

This directory contains the styling configuration for the Bodywork application. It provides a consistent and reusable
styling system that can be used throughout the app.

## Structure

- `theme.ts`: Contains the base theme variables (colors, typography, spacing, etc.)
- `components.ts`: Provides pre-styled component configurations based on the theme
- `index.ts`: Exports all theme-related files for easy importing

## Usage

### Importing

You can import the entire theme:

```typescript
import theme from '@/app/theme';

// Use theme variables
const myStyle = {
  backgroundColor: theme.colors.background.main,
  padding: theme.spacing.base,
};
```

Or import specific parts:

```typescript
import { colors, spacing, buttons } from '@/app/theme';

// Use specific theme parts
const myStyle = {
  backgroundColor: colors.background.main,
  padding: spacing.base,
};
```

### Using Pre-styled Components

The theme provides pre-styled component configurations that you can use directly in your StyleSheet:

```typescript
import { StyleSheet } from 'react-native';
import { buttons, text, cards } from '@/app/theme';

const styles = StyleSheet.create({
  container: {
    ...cards.default,
    marginBottom: 20,
  },
  title: {
    ...text.h2,
  },
  button: {
    ...buttons.primary,
  },
  buttonText: {
    ...buttons.primaryText,
  },
});
```

## Theme Variables

### Colors

```typescript
colors.primary           // Main accent color (orange)
colors.primaryLight      // Light version of primary color
colors.success           // Success color (green)
colors.error             // Error color (red)
colors.background.main   // Main background color
colors.background.card   // Card background color
colors.text.primary      // Primary text color
colors.text.secondary    // Secondary text color
colors.border.default    // Default border color
```

### Typography

```typescript
typography.fontFamily.regular   // Regular font
typography.fontFamily.semiBold  // Semi-bold font
typography.fontFamily.bold      // Bold font
typography.fontSize.base        // Base font size (16)
typography.fontSize.sm          // Small font size (12)
typography.fontSize.lg          // Large font size (18)
```

### Spacing

```typescript
spacing.xs    // Extra small spacing (4)
spacing.sm    // Small spacing (8)
spacing.base  // Base spacing (16)
spacing.lg    // Large spacing (20)
spacing.xl    // Extra large spacing (24)
```

### Border Radius

```typescript
borderRadius.sm     // Small border radius (8)
borderRadius.base   // Base border radius (12)
borderRadius.lg     // Large border radius (16)
```

### Shadows

```typescript
shadows.sm      // Small shadow
shadows.md      // Medium shadow
shadows.lg      // Large shadow
shadows.primary // Primary color shadow
```

## Pre-styled Components

### Buttons

```typescript
buttons.primary       // Primary button (orange)
buttons.primaryText   // Primary button text
buttons.secondary     // Secondary button (dark gray)
buttons.secondaryText // Secondary button text
buttons.outline       // Outline button
buttons.outlineText   // Outline button text
buttons.icon          // Icon button (circular)
buttons.disabled      // Disabled state (apply with spread operator)
```

### Cards

```typescript
cards.default      // Standard card
cards.highlighted  // Highlighted card (with primary color border)
```

### Inputs

```typescript
inputs.default    // Standard input
inputs.compact    // Compact input (smaller)
inputs.multiline  // Multiline input (for notes, etc.)
```

### Typography

```typescript
text.h1           // Heading 1
text.h2           // Heading 2
text.h3           // Heading 3
text.body         // Body text
text.bodySmall    // Small body text
text.label        // Label text
text.accent       // Accent text (primary color)
text.secondary    // Secondary text (gray)
```

### Layout

```typescript
layout.screen       // Screen container
layout.content      // Content container
layout.header       // Header
layout.row          // Row layout
layout.center       // Centered content
layout.spaceBetween // Space between items
```

## Example

Here's an example of how to use the theme in a component:

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { cards, text, buttons, layout, spacing } from '@/app/theme';

const ExampleComponent = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Example Component</Text>
        <Text style={styles.description}>
          This is an example of using the theme system.
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Press Me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...layout.screen,
    padding: spacing.base,
  },
  card: {
    ...cards.default,
    marginBottom: spacing.lg,
  },
  title: {
    ...text.h2,
    marginBottom: spacing.sm,
  },
  description: {
    ...text.body,
    marginBottom: spacing.lg,
  },
  button: {
    ...buttons.primary,
  },
  buttonText: {
    ...buttons.primaryText,
  },
});

export default ExampleComponent;
```
