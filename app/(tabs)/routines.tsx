import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { storageService } from '@/app/services/storage';
import { useRouter } from 'expo-router';
import { useTheme } from '@/app/hooks/useTheme';
import {
  ArrowRight,
  Clock,
  Dumbbell,
  Edit,
  MoreVertical,
  Play,
  Plus,
  Search,
  Star,
  Trash2,
  TrendingUp,
  X
} from 'lucide-react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Button from '@/app/components/ui/Button';
import FloatButtonAction from '@/app/components/ui/FloatButtonAction';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type Routine = {
  id: string;
  title: string;
  description: string;
  exercises: Array<{
    name: string;
    key: string;
    series: Array<{
      weight: number;
      reps: number;
      note: string;
      rest: string;
      type: 'warmUp' | 'workingSet';
    }>;
  }>;
  createdAt: string;
  lastUsed?: string;
  favorite?: boolean;
  usageCount?: number;
  totalTime?: number;
};

const PREMADE_ROUTINES = [
  {
    id: 'premade-1',
    title: 'Full Body',
    description: 'Entraînement complet du corps',
    exercises: [
      {
        name: 'Squat',
        key: 'squat',
        series: [
          { weight: 0, reps: 12, rest: '90', type: 'warmUp' as const, note: '' },
          { weight: 0, reps: 10, rest: '90', type: 'workingSet' as const, note: '' },
          { weight: 0, reps: 8, rest: '90', type: 'workingSet' as const, note: '' }
        ]
      },
      {
        name: 'Développé Couché',
        key: 'bench-press',
        series: [
          { weight: 0, reps: 12, rest: '90', type: 'warmUp' as const, note: '' },
          { weight: 0, reps: 10, rest: '90', type: 'workingSet' as const, note: '' },
          { weight: 0, reps: 8, rest: '90', type: 'workingSet' as const, note: '' }
        ]
      }
    ]
  },
  {
    id: 'premade-2',
    title: 'Push Pull Legs',
    description: 'Split classique PPL',
    exercises: [
      {
        name: 'Développé Couché',
        key: 'bench-press',
        series: [
          { weight: 0, reps: 12, rest: '90', type: 'warmUp' as const, note: '' },
          { weight: 0, reps: 10, rest: '90', type: 'workingSet' as const, note: '' },
          { weight: 0, reps: 8, rest: '90', type: 'workingSet' as const, note: '' }
        ]
      },
      {
        name: 'Tractions',
        key: 'pull-ups',
        series: [
          { weight: 0, reps: 8, rest: '90', type: 'workingSet' as const, note: '' },
          { weight: 0, reps: 8, rest: '90', type: 'workingSet' as const, note: '' },
          { weight: 0, reps: 8, rest: '90', type: 'workingSet' as const, note: '' }
        ]
      }
    ]
  }
];

const RoutineItem = React.memo(({
                                  item,
                                  onStart,
                                  onEdit,
                                  onDelete,
                                  onToggleFavorite,
                                  onShare,
                                  theme,
                                  styles
                                }: {
  item: Routine;
  onStart: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onShare: (routine: Routine) => void;
  theme: any;
  styles: any;
}) => {
  const totalSeries = item.exercises.reduce((total, exercise) => total + exercise.series.length, 0);
  const estimatedTime = Math.ceil(item.exercises.reduce((total, exercise) => {
    return total + exercise.series.reduce((seriesTotal, series) => {
      const [minutes, seconds] = series.rest.split(':').map(Number);
      return seriesTotal + (minutes * 60 + seconds);
    }, 0);
  }, 0) / 60);
  const isRecent = new Date(item.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

  const stats = [];
  if (item.usageCount) {
    stats.push({
      icon: <TrendingUp size={16} color={theme.colors.text.secondary} />,
      text: `${item.usageCount} utilisation${item.usageCount > 1 ? 's' : ''}`
    });
  }

  if (item.totalTime) {
    const hours = Math.floor(item.totalTime / 60);
    const minutes = item.totalTime % 60;
    stats.push({
      icon: <Clock size={16} color={theme.colors.text.secondary} />,
      text: hours > 0
        ? `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
        : `${minutes}min`
    });
  }

  const renderLeftActions = () => {
    return (
      <View style={[styles.swipeAction, styles.startAction]}>
        <TouchableOpacity
          style={styles.swipeActionButton}
          onPress={() => onStart(item.id)}
        >
          <Play size={24} color={theme.colors.background.main} />
          <Text style={styles.swipeActionText}>Démarrer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRightActions = () => {
    return (
      <View style={styles.swipeActions}>
        <View style={[styles.swipeAction, styles.editAction]}>
          <TouchableOpacity
            style={styles.swipeActionButton}
            onPress={() => onEdit(item.id)}
          >
            <Edit size={24} color={theme.colors.background.main} />
            <Text style={styles.swipeActionText}>Modifier</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.swipeAction, styles.deleteAction]}>
          <TouchableOpacity
            style={styles.swipeActionButton}
            onPress={() => onDelete(item.id)}
          >
            <Trash2 size={24} color={theme.colors.background.main} />
            <Text style={styles.swipeActionText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      leftThreshold={40}
      rightThreshold={40}
      friction={2}
      overshootRight={false}
      overshootLeft={false}
    >
      <TouchableOpacity
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        delayLongPress={200}
        style={styles.routineCard}
      >
        <View style={styles.routineHeader}>
          <View style={styles.routineTitleContainer}>
            <Text style={styles.routineTitle}>{item.title}</Text>
            {isRecent && <View style={styles.newBadge}><Text style={styles.newBadgeText}>Nouveau</Text></View>}
          </View>
          <TouchableOpacity onPress={() => onToggleFavorite(item.id)}>
            <Star
              size={20}
              color={item.favorite ? theme.colors.primary : theme.colors.text.secondary}
              fill={item.favorite ? theme.colors.primary : 'none'}
            />
          </TouchableOpacity>
        </View>

        {item.description && <Text style={styles.routineDescription}>{item.description}</Text>}

        <View style={styles.routineStats}>
          <View style={styles.statItem}>
            <Dumbbell size={16} color={theme.colors.text.secondary} />
            <Text style={styles.statText}>{item.exercises.length} exo{item.exercises.length > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={16} color={theme.colors.text.secondary} />
            <Text style={styles.statText}>{estimatedTime} min</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statText}>{totalSeries} séries</Text>
          </View>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              {stat.icon}
              <Text style={styles.statText}>{stat.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.routineFooter}>
          <Text style={styles.routineDate}>
            {item.lastUsed
              ? `Dernière utilisation : ${format(new Date(item.lastUsed), 'dd MMM yyyy', { locale: fr })}`
              : `Créée le ${format(new Date(item.createdAt), 'dd MMM yyyy', { locale: fr })}`}
          </Text>
          <View style={styles.routineActions}>
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => {
                Alert.alert(
                  'Actions',
                  'Que souhaitez-vous faire ?',
                  [
                    {
                      text: 'Modifier',
                      onPress: () => onEdit(item.id)
                    },
                    {
                      text: 'Partager',
                      onPress: () => onShare(item)
                    },
                    {
                      text: 'Supprimer',
                      style: 'destructive',
                      onPress: () => onDelete(item.id)
                    },
                    {
                      text: 'Annuler',
                      style: 'cancel'
                    }
                  ]
                );
              }}
            >
              <MoreVertical size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => onStart(item.id)}
            >
              <Play size={20} color={theme.colors.text.primary} />
              <Text style={styles.startButtonText}>Démarrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
});

export default function RoutinesListScreen() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const [isDragging, setIsDragging] = useState(false);
  const dragY = useSharedValue(0);
  const scale = useSharedValue(1);
  const searchBarWidth = useSharedValue(0);
  const searchBarOpacity = useSharedValue(0);

  useEffect(() => {
    loadRoutines();
  }, []);

  const animateSearchBar = (show: boolean) => {
    searchBarWidth.value = withTiming(show ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });
    searchBarOpacity.value = withTiming(show ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    animateSearchBar(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    if (!searchQuery) {
      animateSearchBar(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    animateSearchBar(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const loadRoutines = async () => {
    const loadedRoutines = await storageService.getRoutines();
    setRoutines(loadedRoutines);
  };

  const handleStartRoutine = (routineId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/screens/workout/session',
      params: { routineId }
    });
  };

  const handleCreateRoutine = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/screens/routines/new'
    });
  };

  const toggleFavorite = async (routineId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedRoutines = routines.map(routine =>
      routine.id === routineId
        ? { ...routine, favorite: !routine.favorite }
        : routine
    );
    setRoutines(updatedRoutines);
    const updatedRoutine = updatedRoutines.find(r => r.id === routineId);
    if (updatedRoutine) {
      await storageService.saveRoutine(updatedRoutine);
    }
  };

  const handleEditRoutine = (routineId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/screens/routines/new',
      params: { routineId }
    });
  };

  const handleDeleteRoutine = async (routineId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Supprimer la routine',
      'Êtes-vous sûr de vouloir supprimer cette routine ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const updatedRoutines = routines.filter(r => r.id !== routineId);
            setRoutines(updatedRoutines);
            await storageService.deleteRoutine(routineId);
          }
        }
      ]
    );
  };

  const handleShareRoutine = async (routine: Routine) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const routineData = {
        title: routine.title,
        description: routine.description,
        exercises: routine.exercises.map(ex => ({
          name: ex.name,
          series: ex.series.map(s => ({
            weight: s.weight,
            reps: s.reps,
            rest: s.rest,
            type: s.type
          }))
        }))
      };

      const result = await Share.share({
        message: `Routine d'entraînement : ${routine.title}\n\n` +
          `${routine.description ? routine.description + '\n\n' : ''}` +
          `Exercices :\n${routineData.exercises.map(ex =>
            `- ${ex.name} (${ex.series.length} séries)`
          ).join('\n')}`,
        title: routine.title
      });

      if (result.action === Share.sharedAction) {
        // Mettre à jour les statistiques de partage
        const updatedRoutine = {
          ...routine,
          usageCount: (routine.usageCount || 0) + 1
        };
        await storageService.saveRoutine(updatedRoutine);
        setRoutines(routines.map(r => r.id === routine.id ? updatedRoutine : r));
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager la routine.');
    }
  };

  const getTotalSeries = (exercises: Routine['exercises']) => {
    return exercises.reduce((total, exercise) => total + exercise.series.length, 0);
  };

  const getEstimatedTime = (exercises: Routine['exercises']) => {
    const totalRestTime = exercises.reduce((total, exercise) => {
      return total + exercise.series.reduce((seriesTotal, series) => {
        const [minutes, seconds] = series.rest.split(':').map(Number);
        return seriesTotal + (minutes * 60 + seconds);
      }, 0);
    }, 0);

    const estimatedExerciseTime = exercises.length * 2 * 60; // 2 minutes par exercice
    return Math.ceil((totalRestTime + estimatedExerciseTime) / 60);
  };

  const getRoutineStats = (routine: Routine) => {
    const stats = [];

    if (routine.usageCount) {
      stats.push({
        icon: <TrendingUp size={16} color={theme.colors.text.secondary} />,
        text: `${routine.usageCount} utilisation${routine.usageCount > 1 ? 's' : ''}`
      });
    }

    if (routine.totalTime) {
      const hours = Math.floor(routine.totalTime / 60);
      const minutes = routine.totalTime % 60;
      stats.push({
        icon: <Clock size={16} color={theme.colors.text.secondary} />,
        text: hours > 0
          ? `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
          : `${minutes}min`
      });
    }

    return stats;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {/*<Image */}
      {/*  source={require('@/assets/images/empty-routines.png')} */}
      {/*  style={styles.emptyImage}*/}
      {/*  resizeMode="contain"*/}
      {/*/>*/}
      <Text style={styles.emptyTitle}>Aucune routine pour l'instant</Text>
      <Text style={styles.emptyText}>
        Créez votre première routine d'entraînement ou choisissez parmi nos suggestions
      </Text>
      <View style={styles.emptyActions}>
        <Button
          title="Créer ma première routine"
          onPress={handleCreateRoutine}
          style={styles.createButton}
          icon={<Plus size={20} color={theme.colors.background.main} />}
        />
        <Text style={styles.emptyOrText}>ou</Text>
        <View style={styles.premadeContainer}>
          <Text style={styles.premadeTitle}>Suggestions</Text>
          {PREMADE_ROUTINES.map((routine) => (
            <TouchableOpacity
              key={routine.id}
              style={styles.premadeCard}
              onPress={() => {
                const newRoutine = {
                  ...routine,
                  id: `routine-${Date.now()}`,
                  createdAt: new Date().toISOString()
                };
                storageService.saveRoutine(newRoutine);
                setRoutines([...routines, newRoutine]);
              }}
            >
              <View style={styles.premadeContent}>
                <Text style={styles.premadeCardTitle}>{routine.title}</Text>
                <Text style={styles.premadeCardDescription}>{routine.description}</Text>
                <View style={styles.premadeStats}>
                  <Text style={styles.premadeStat}>
                    {routine.exercises.length} exercices
                  </Text>
                  <Text style={styles.premadeStat}>
                    {routine.exercises.reduce((total, ex) => total + ex.series.length, 0)} séries
                  </Text>
                </View>
              </View>
              <ArrowRight size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderRoutine = ({ item }: { item: Routine }) => (
    <RoutineItem
      item={item}
      onStart={handleStartRoutine}
      onEdit={handleEditRoutine}
      onDelete={handleDeleteRoutine}
      onToggleFavorite={toggleFavorite}
      onShare={handleShareRoutine}
      theme={theme}
      styles={styles}
    />
  );

  const filteredRoutines = routines.filter(routine => {
    const matchesSearch = routine.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      routine.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || routine.favorite;
    return matchesSearch && matchesFavorite;
  });

  const renderSearchBar = () => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        width: `${interpolate(
          searchBarWidth.value,
          [0, 1],
          [0, 100]
        )}%`,
        opacity: searchBarOpacity.value
      };
    });

    return (
      <Animated.View style={[styles.searchContainer, animatedStyle]}>
        <Search size={20} color={theme.colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une routine..."
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <X size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        ) : null}
      </Animated.View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mes routines</Text>
          <View style={styles.headerActions}>
            {renderSearchBar()}
            <TouchableOpacity
              style={[styles.filterButton, showFavoritesOnly && styles.filterButtonActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowFavoritesOnly(!showFavoritesOnly);
              }}
            >
              <Star
                size={20}
                color={showFavoritesOnly ? theme.colors.primary : theme.colors.text.secondary}
                fill={showFavoritesOnly ? theme.colors.primary : 'none'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filteredRoutines}
          renderItem={renderRoutine}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
        />
        <FloatButtonAction
          icon={<Plus size={24} color={theme.colors.background.main} />}
          onPress={handleCreateRoutine}
          style={[isDragging && styles.fabHidden]}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background.main
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.text.primary
  },
  routineCard: {
    backgroundColor: theme.colors.background.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...theme.shadows.sm
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  routineTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary
  },
  newBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12
  },
  newBadgeText: {
    color: theme.colors.background.main,
    fontSize: 12,
    fontWeight: '600'
  },
  routineDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 12
  },
  routineStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statText: {
    fontSize: 14,
    color: theme.colors.text.secondary
  },
  routineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  routineDate: {
    fontSize: 12,
    color: theme.colors.text.secondary
  },
  routineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  moreButton: {
    padding: 8
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs
  },
  startButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 24
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32
  },
  emptyActions: {
    width: '100%',
    alignItems: 'center'
  },
  emptyOrText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginVertical: 16
  },
  premadeContainer: {
    width: '100%',
    paddingHorizontal: 16
  },
  premadeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12
  },
  premadeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    ...theme.shadows.sm
  },
  premadeContent: {
    flex: 1
  },
  premadeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4
  },
  premadeCardDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8
  },
  premadeStats: {
    flexDirection: 'row',
    gap: 12
  },
  premadeStat: {
    fontSize: 12,
    color: theme.colors.text.secondary
  },
  createButton: {
    backgroundColor: theme.colors.primary
  },
  fabHidden: {
    opacity: 0,
    transform: [{ scale: 0 }]
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background.button
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary + '20'
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  swipeAction: {
    width: 100,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  swipeActionButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  swipeActionText: {
    color: theme.colors.background.main,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4
  },
  startAction: {
    backgroundColor: theme.colors.primary
  },
  editAction: {
    backgroundColor: theme.colors.primary
  },
  deleteAction: {
    backgroundColor: theme.colors.error
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.button,
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    overflow: 'hidden'
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base
  },
  clearButton: {
    padding: 4
  },
  routineCardContainer: {
    marginBottom: 12
  }
}); 
