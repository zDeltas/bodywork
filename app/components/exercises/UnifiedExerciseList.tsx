import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, FlatList } from 'react-native';
import { Search, X, Star, Plus, Filter, Grid, List, ChevronDown, ChevronUp } from 'lucide-react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import useHaptics from '@/app/hooks/useHaptics';
import { useExercises } from '@/app/hooks/useExercises';
import Text from '@/app/components/ui/Text';
import { predefinedExercises, getMuscleGroups, muscleGroupKeys, getExercisesByMuscleGroup, MuscleGroupKey, Exercise, ExerciseDefinition } from './index';
import ExerciseCard from './ExerciseCard';

export type ExerciseListMode = 'screen' | 'modal' | 'inline';
export type ExerciseListViewMode = 'grid' | 'list' | 'collapsible';

interface UnifiedExerciseListProps {
  mode?: ExerciseListMode;
  viewMode?: ExerciseListViewMode;

  selectedExercise?: string;
  onExerciseSelect?: (exercise: Exercise) => void;

  selectedMuscle?: string;
  onMuscleSelect?: (muscleGroup: string) => void;

  initialMuscleGroup?: string;
  initialSearchQuery?: string;

  showSearch?: boolean;
  showViewModeToggle?: boolean;
  showAddButton?: boolean;
  showFavorites?: boolean;

  onAddCustomExercise?: () => void;
  onClose?: () => void;

  isLoading?: boolean;

  containerStyle?: any;
}

export default function UnifiedExerciseList({
  mode = 'screen',
  viewMode = 'grid',
  selectedExercise,
  onExerciseSelect,
  selectedMuscle,
  onMuscleSelect,
  initialMuscleGroup,
  initialSearchQuery,
  showSearch = true,
  showViewModeToggle = true,
  showAddButton = true,
  showFavorites = true,
  onAddCustomExercise,
  onClose,
  isLoading = false,
  containerStyle
}: UnifiedExerciseListProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(initialMuscleGroup || selectedMuscle || '');
  const [currentViewMode, setCurrentViewMode] = useState<ExerciseListViewMode>(viewMode);
  const [expandedMuscleGroups, setExpandedMuscleGroups] = useState<string[]>([]);
  
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { impactLight, impactMedium } = useHaptics();
  const { isFavorite, toggleFavorite } = useExercises();
  const styles = useStyles();

  const muscleGroups = useMemo(() => getMuscleGroups(t as (key: string) => string), [t]);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (initialMuscleGroup !== undefined) {
      setSelectedMuscleGroup(initialMuscleGroup);
    }
  }, [initialMuscleGroup]);

  const allExercises = useMemo(() => {
    return predefinedExercises.map(exercise => ({
      name: t(exercise.key as any),
      key: exercise.key,
      translationKey: exercise.key,
      series: [],
      primaryMuscle: exercise.primaryMuscle,
      secondaryMuscles: exercise.secondaryMuscles
    }));
  }, [t]);

  const filteredExercises = useMemo(() => {
    let exercises: Exercise[] = [];

    if (selectedMuscleGroup) {
      const muscleKey = muscleGroupKeys.find(
        key => muscleGroups[muscleGroupKeys.indexOf(key)] === selectedMuscleGroup
      ) as MuscleGroupKey;
      
      if (muscleKey) {
        const allMuscleExercises = getExercisesByMuscleGroup(muscleKey).map(exercise => ({
          name: t(exercise.key as any),
          key: exercise.key,
          translationKey: exercise.key,
          series: [],
          primaryMuscle: exercise.primaryMuscle,
          secondaryMuscles: exercise.secondaryMuscles
        }));

        const primaryExercises = allMuscleExercises.filter(exercise => exercise.primaryMuscle === muscleKey);
        const secondaryExercises = allMuscleExercises.filter(exercise => exercise.primaryMuscle !== muscleKey);

        primaryExercises.sort((a, b) => a.name.localeCompare(b.name));
        secondaryExercises.sort((a, b) => a.name.localeCompare(b.name));

        exercises = [...primaryExercises, ...secondaryExercises];
      }
    } else {
      exercises = allExercises;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      exercises = exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(query)
      );
    }

    return exercises;
  }, [selectedMuscleGroup, searchQuery, allExercises, muscleGroups, t]);

  const handleSearch = useCallback((query: string) => {
    if (query !== searchQuery) {
      setSearchQuery(query);
      if (query.trim()) {
        setSelectedMuscleGroup('');
      }
    }
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    if (searchQuery) {
      setSearchQuery('');
      impactLight();
    }
  }, [searchQuery, impactLight]);

  const clearFilters = useCallback(() => {
    if (selectedMuscleGroup || searchQuery) {
      setSelectedMuscleGroup('');
      setSearchQuery('');
      impactLight();
    }
  }, [selectedMuscleGroup, searchQuery, impactLight]);

  const handleExerciseSelect = useCallback((exercise: Exercise) => {
    if (onExerciseSelect) {
      onExerciseSelect(exercise);
    }
    impactMedium();

    if (mode === 'modal' && onClose) {
      onClose();
    }
  }, [onExerciseSelect, impactMedium, mode, onClose]);

  const handleMuscleGroupSelect = useCallback((muscleGroup: string) => {
    if (muscleGroup !== selectedMuscleGroup) {
      setSelectedMuscleGroup(muscleGroup);
      if (onMuscleSelect) {
        onMuscleSelect(muscleGroup);
      }
      impactLight();
    }
  }, [onMuscleSelect, impactLight, selectedMuscleGroup]);

  const toggleMuscleGroupExpanded = useCallback((muscleGroup: string) => {
    setExpandedMuscleGroups(prev => 
      prev.includes(muscleGroup) 
        ? prev.filter(group => group !== muscleGroup)
        : [...prev, muscleGroup]
    );
    impactLight();
  }, [impactLight]);

  const toggleViewMode = useCallback(() => {
    const newMode = currentViewMode === 'grid' ? 'list' : 'grid';
    setCurrentViewMode(newMode);
    impactLight();
  }, [currentViewMode, impactLight]);

  const renderExerciseItem = ({ item }: { item: Exercise }) => {
    if (currentViewMode === 'grid') {
      return (
        <ExerciseCard
          exercise={item}
          isFavorite={showFavorites ? isFavorite(item.name) : false}
          onToggleFavorite={showFavorites ? toggleFavorite : () => {}}
          onSelect={handleExerciseSelect}
        />
      );
    }
    
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.exerciseItem}>
        <TouchableOpacity
          style={styles.exerciseContent}
          onPress={() => handleExerciseSelect(item)}
          activeOpacity={0.7}
        >
          <View style={styles.exerciseInfo}>
            <Text variant="body" style={styles.exerciseName}>
              {item.name}
            </Text>
          </View>
          
          {showFavorites && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item.name)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Star
                size={20}
                color={isFavorite(item.name) ? theme.colors.warning : theme.colors.text.secondary}
                fill={isFavorite(item.name) ? theme.colors.warning : 'transparent'}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCollapsibleMuscleGroups = () => {
    return muscleGroups.map((muscleGroup, index) => {
      const muscleKey = muscleGroupKeys[index] as MuscleGroupKey;
      const isExpanded = expandedMuscleGroups.includes(muscleGroup);
      const isSelected = selectedMuscleGroup === muscleGroup;
      const exercisesToDisplay = getExercisesByMuscleGroup(muscleKey);

      return (
        <Animated.View
          key={muscleGroup}
          entering={FadeIn.duration(400).delay(100 + index * 50)}
          style={styles.collapsibleSection}
        >
          <TouchableOpacity
            style={[styles.collapsibleHeader, isSelected && styles.collapsibleHeaderSelected]}
            onPress={() => {
              toggleMuscleGroupExpanded(muscleGroup);
              handleMuscleGroupSelect(muscleGroup);
            }}
          >
            <Text variant="body" style={styles.muscleButtonText}>
              {muscleGroup}
            </Text>
            {isExpanded ? (
              <ChevronUp
                color={isSelected ? theme.colors.text.primary : theme.colors.primary}
                size={20}
              />
            ) : (
              <ChevronDown
                color={isSelected ? theme.colors.text.primary : theme.colors.primary}
                size={20}
              />
            )}
          </TouchableOpacity>

          {isExpanded && (
            <Animated.View entering={SlideInRight.duration(300)}>
              {exercisesToDisplay.map((exercise) => {
                const translatedExercise = allExercises.find(ex => ex.key === exercise.key);
                if (!translatedExercise) return null;

                return (
                  <TouchableOpacity
                    key={exercise.key}
                    style={[
                      styles.exerciseItem,
                      selectedExercise === translatedExercise.name && styles.selectedExerciseItem
                    ]}
                    onPress={() => handleExerciseSelect(translatedExercise)}
                  >
                    <Text variant="body" style={styles.exerciseName}>
                      {translatedExercise.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          )}
        </Animated.View>
      );
    });
  };

  const getHeaderTitle = () => {
    if (selectedMuscleGroup) {
      const exerciseCount = filteredExercises.length;
      return `${t('exerciseList.exercisesFor')} ${selectedMuscleGroup} (${exerciseCount})`;
    }
    if (searchQuery.trim()) {
      return `${t('exerciseList.searchResults')} (${filteredExercises.length})`;
    }
    return t('exerciseList.allExercises');
  };

  if (currentViewMode === 'collapsible') {
    return (
      <View style={[styles.container, containerStyle]}>
        {mode === 'modal' && onClose && (
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color={theme.colors.text.primary} size={24} />
            </TouchableOpacity>
            <Text variant="heading" style={styles.modalTitle}>
              {t('exerciseList.selectExercise' as any)}
            </Text>
            <View style={styles.modalHeaderRight} />
          </View>
        )}
        
        {showSearch && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search color={theme.colors.text.secondary} size={20} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder={t('exerciseList.searchPlaceholder')}
                placeholderTextColor={theme.colors.text.secondary}
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
        )}

        {renderCollapsibleMuscleGroups()}
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {mode === 'screen' && (
        <View style={styles.header}>
          <Text variant="heading" style={styles.headerTitle}>
            {getHeaderTitle()}
          </Text>
          {showViewModeToggle && (
            <TouchableOpacity
              style={styles.viewModeButton}
              onPress={toggleViewMode}
            >
              {currentViewMode === 'grid' ? (
                <List color={theme.colors.text.primary} size={20} />
              ) : (
                <Grid color={theme.colors.text.primary} size={20} />
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {showSearch && (
        <Animated.View entering={FadeIn.duration(500)} style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search color={theme.colors.text.secondary} size={20} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder={t('exerciseList.searchPlaceholder')}
              placeholderTextColor={theme.colors.text.secondary}
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
      )}

      {(selectedMuscleGroup || searchQuery) && (
        <Animated.View entering={SlideInRight.duration(300)} style={styles.filtersContainer}>
          <View style={styles.activeFilters}>
            {selectedMuscleGroup && (
              <View style={styles.filterChip}>
                <Text variant="caption" style={styles.filterChipText}>
                  {selectedMuscleGroup}
                </Text>
                <TouchableOpacity
                  style={styles.filterChipClose}
                  onPress={() => setSelectedMuscleGroup('')}
                >
                  <X size={14} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>
            )}
            {searchQuery && (
              <View style={styles.filterChip}>
                <Text variant="caption" style={styles.filterChipText}>
                  "{searchQuery}"
                </Text>
                <TouchableOpacity
                  style={styles.filterChipClose}
                  onPress={() => setSearchQuery('')}
                >
                  <X size={14} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={clearFilters} style={styles.clearAllButton}>
            <Filter color={theme.colors.text.secondary} size={16} />
            <Text variant="caption" style={styles.clearAllText}>
              {t('exerciseList.clearAll')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <FlatList
        key={`exercise-list-${currentViewMode}`}
        data={filteredExercises}
        renderItem={renderExerciseItem}
        keyExtractor={(item) => item.key}
        numColumns={currentViewMode === 'grid' ? 2 : 1}
        contentContainerStyle={[
          styles.listContainer,
          currentViewMode === 'grid' && styles.gridContainer
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="body" style={styles.emptyText}>
              {t('exerciseList.noExercisesFound')}
            </Text>
          </View>
        }
      />

      {showAddButton && onAddCustomExercise && (
        <Animated.View entering={FadeIn.duration(500).delay(200)} style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={onAddCustomExercise}>
            <Plus color={theme.colors.primary} size={20} />
            <Text variant="body" style={styles.addButtonText}>
              {t('exerciseList.addCustomExercise')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
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
    headerTitle: {
      flex: 1,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginHorizontal: theme.spacing.md
    },
    viewModeButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background.card
    },
    searchContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md
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
    filtersContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default
    },
    activeFilters: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      flex: 1
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.xs
    },
    filterChipText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      marginRight: theme.spacing.xs
    },
    filterChipClose: {
      padding: 2
    },
    clearAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs
    },
    clearAllText: {
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.xs
    },
    listContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl
    },
    gridContainer: {
      paddingHorizontal: theme.spacing.md
    },
    exerciseItem: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    exerciseContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md
    },
    exerciseInfo: {
      flex: 1
    },
    exerciseName: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold
    },
    favoriteButton: {
      padding: theme.spacing.xs
    },
    selectedExerciseItem: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.xl
    },
    emptyText: {
      color: theme.colors.text.secondary,
      textAlign: 'center'
    },
    addButtonContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.card,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    addButtonText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      marginLeft: theme.spacing.sm
    },
    collapsibleSection: {
      marginBottom: theme.spacing.sm
    },
    collapsibleHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background.card,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    collapsibleHeaderSelected: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary
    },
    muscleButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
      marginBottom: theme.spacing.lg
    },
    closeButton: {
      padding: theme.spacing.sm
    },
    modalTitle: {
      flex: 1,
      textAlign: 'center',
      color: theme.colors.text.primary
    },
    modalHeaderRight: {
      width: 40
    }
  });
};
