import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { Search, X, ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import useHaptics from '@/app/hooks/useHaptics';
import Text from '@/app/components/ui/Text';
import InteractiveMuscleMap, { MuscleGroupKey } from '@/app/components/exercises/InteractiveMuscleMap';
import { predefinedExercises, getMuscleGroups, muscleGroupKeys } from '@/app/components/exercises';

export default function ExerciseSelectionScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroupKey | undefined>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { impactLight, impactMedium } = useHaptics();
  const router = useRouter();
  const params = useLocalSearchParams();
  const styles = useStyles();

  const muscleGroups = useMemo(() => getMuscleGroups(t as (key: string) => string), [t]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      impactLight();
      // Naviguer vers la liste d'exercices avec le terme de recherche
      router.push({
        pathname: '/screens/exercise-list',
        params: { 
          search: searchQuery.trim(),
          from: params.from || 'exercise-selection'
        }
      });
    }
  }, [searchQuery, router, impactLight, params.from]);

  const handleMuscleSelect = useCallback((muscleGroup: MuscleGroupKey) => {
    setSelectedMuscle(muscleGroup);
    impactMedium();
    
    // Obtenir le nom traduit du muscle
    const muscleGroupName = getMuscleGroupName(muscleGroup);
    
    // Naviguer vers la liste d'exercices avec le muscle sélectionné
    router.push({
      pathname: '/screens/exercise-list',
      params: { 
        muscleGroup: muscleGroupName,
        from: params.from || 'exercise-selection'
      }
    });
  }, [router, impactMedium, params.from]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    impactLight();
  }, [impactLight]);

  const getMuscleGroupName = (muscleKey: MuscleGroupKey) => {
    const index = muscleGroupKeys.indexOf(muscleKey);
    return muscleGroups[index] || muscleKey;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            impactLight();
            router.back();
          }}
        >
          <ArrowLeft color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text variant="heading" style={styles.title}>
            {t('exerciseSelection.title')}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color={theme.colors.text.secondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('exerciseSelection.searchPlaceholder')}
            placeholderTextColor={theme.colors.text.secondary}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X color={theme.colors.text.secondary} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Muscle Map */}
      <Animated.View entering={FadeIn.duration(500).delay(200)} style={styles.muscleMapContainer}>
        <Text variant="subheading" style={styles.sectionTitle}>
          {t('exerciseSelection.selectByMuscle')}
        </Text>
        <InteractiveMuscleMap
          onMuscleSelect={handleMuscleSelect}
          selectedMuscle={selectedMuscle}
        />
      </Animated.View>

    </View>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
      marginBottom: theme.spacing.xl
    },
    backButton: {
      padding: theme.spacing.sm
    },
    headerContent: {
      flex: 1,
      alignItems: 'center'
    },
    headerRight: {
      width: 40
    },
    title: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      textAlign: 'center'
    },
    searchContainer: {
      marginBottom: theme.spacing.xl
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    searchIcon: {
      marginRight: theme.spacing.sm
    },
    searchInput: {
      flex: 1,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base
    },
    clearButton: {
      padding: theme.spacing.xs
    },
    muscleMapContainer: {
      flex: 1,
      marginBottom: theme.spacing.xl
    },
    sectionTitle: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
      textAlign: 'center'
    },
  });
};
