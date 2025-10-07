import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';
import UnifiedExerciseList from '@/app/components/exercises/UnifiedExerciseList';

export default function ExerciseListScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const styles = useStyles();

  const handleExerciseSelect = (exercise: any) => {
    router.push({
      pathname: '/screens/exercise-tutorial',
      params: {
        name: exercise.name,
        key: exercise.translationKey || exercise.key,
        primaryMuscle: exercise.primaryMuscle,
        secondaryMuscles: Array.isArray(exercise.secondaryMuscles) ? exercise.secondaryMuscles.join(',') : ''
      }
    });
  };

  const handleAddCustomExercise = () => {
    router.push({
      pathname: '/screens/exercise-custom-edit',
      params: { muscleGroupLabel: (params.muscleGroup as string) || '' }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      {/* Unified Exercise List */}
      <UnifiedExerciseList
        mode="screen"
        viewMode="grid"
        initialMuscleGroup={params.muscleGroup as string}
        initialSearchQuery={params.search as string}
        onExerciseSelect={handleExerciseSelect}
        onAddCustomExercise={handleAddCustomExercise}
        showSearch={true}
        showViewModeToggle={true}
        showAddButton={true}
        showFavorites={true}
      />
    </View>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default
    },
    backButton: {
      padding: theme.spacing.sm
    },
    headerRight: {
      width: 40
    }
  });
};