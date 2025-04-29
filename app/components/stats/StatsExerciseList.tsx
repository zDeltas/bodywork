import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import ExerciseList from '@/app/components/ExerciseList';

interface StatsExerciseListProps {
  selectedMuscle: string;
  setSelectedMuscle: (muscleGroup: string) => void;
  selectedExercise: string;
  setSelectedExercise: (exercise: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  exerciseOptions: string[];
  onExerciseSelect: (exercise: string) => void;
  onMuscleSelect: (muscleGroup: string) => void;
}

export default function StatsExerciseList({
  selectedMuscle,
  setSelectedMuscle,
  selectedExercise,
  setSelectedExercise,
  searchQuery,
  setSearchQuery,
  exerciseOptions,
  onExerciseSelect,
  onMuscleSelect
}: StatsExerciseListProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [filteredExercises, setFilteredExercises] = useState<string[]>([]);

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg
    },
    searchIcon: {
      marginRight: theme.spacing.sm
    },
    searchInput: {
      flex: 1,
      height: 44,
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular
    }
  });

  const getFilteredExercises = useCallback((query: string, options: string[]): string[] => {
    if (!query || !options || !Array.isArray(options)) return [];
    return options.filter(exercise =>
      exercise.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredExercises([]);
      return;
    }
    const filtered = getFilteredExercises(searchQuery, exerciseOptions);
    if (Array.isArray(filtered)) {
      setFilteredExercises(filtered);
    }
  }, [searchQuery, exerciseOptions, getFilteredExercises]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchExercise')}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <ExerciseList
        selectedMuscle={selectedMuscle}
        setSelectedMuscle={setSelectedMuscle}
        exercise={selectedExercise}
        setExercise={setSelectedExercise}
        onExerciseSelect={onExerciseSelect}
        onMuscleSelect={onMuscleSelect}
      />
    </View>
  );
} 