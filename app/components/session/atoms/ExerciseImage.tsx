import React, { useState } from 'react';
import { Image, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Maximize2, Minimize2 } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

export interface ExerciseImageProps {
  imageSource: any;
  exerciseName: string;
  musclesText: string;
  compact?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const ExerciseImage = React.memo<ExerciseImageProps>(({
  imageSource,
  exerciseName,
  musclesText,
  compact = false,
  isExpanded = false,
  onToggleExpand
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Image
          source={imageSource}
          style={styles.compactImage}
          resizeMode="contain"
        />
        <TouchableOpacity 
          style={styles.expandToggleSmall} 
          onPress={onToggleExpand}
        >
          <Maximize2 size={16} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>
    );
  }

  if (isExpanded) {
    return (
      <View style={styles.expandedContainer}>
        <View style={styles.expandedHeader}>
          <Text variant="heading" style={styles.exerciseTitle}>
            {exerciseName}
          </Text>
          {!!musclesText && (
            <Text style={styles.targetedMusclesText} numberOfLines={2} ellipsizeMode="tail">
              {musclesText}
            </Text>
          )}
        </View>
        <View style={styles.expandedImageWrapper}>
          <Image
            source={imageSource}
            style={styles.expandedImage}
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={styles.expandToggle} 
            onPress={onToggleExpand}
          >
            <Minimize2 size={18} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
});

const useStyles = (theme: any) => StyleSheet.create({
  compactContainer: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    position: 'relative',
    overflow: 'hidden'
  },
  compactImage: {
    width: '90%',
    height: '90%'
  },
  expandedContainer: {
    marginBottom: theme.spacing.lg
  },
  expandedHeader: {
    marginBottom: theme.spacing.sm
  },
  expandedImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: theme.colors.background.input,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.border.default
  },
  expandedImage: {
    width: '100%',
    height: '100%'
  },
  exerciseTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600'
  },
  targetedMusclesText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic'
  },
  expandToggle: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.background.main,
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: theme.colors.border.default
  },
  expandToggleSmall: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.background.main,
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border.default
  }
});

ExerciseImage.displayName = 'ExerciseImage';

export default ExerciseImage;
