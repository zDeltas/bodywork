import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { storageService } from '@/app/services/storage';
import { useRouter } from 'expo-router';
import { useTheme } from '@/app/hooks/useTheme';
import { Plus, Star } from 'lucide-react-native';
import FloatButtonAction from '@/app/components/ui/FloatButtonAction';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useHaptics from '@/app/hooks/useHaptics';
import { Routine } from '@/types/common';
import RoutineItem from '@/app/components/routines/RoutineItem';
import EmptyState from '@/app/components/routines/EmptyState';
import Header from '@/app/components/layout/Header';
import { useTranslation } from '@/app/hooks/useTranslation';
import { TranslationKey } from '@/translations';

export default function RoutinesListScreen() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const haptics = useHaptics();
  const { t } = useTranslation();

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    const loadedRoutines = await storageService.getRoutines();
    setRoutines(loadedRoutines);
  };

  const handleStartRoutine = (routineId: string) => {
    haptics.impactMedium();
    router.push({
      pathname: '/screens/workout/session',
      params: { routineId }
    });
  };

  const handleCreateRoutine = () => {
    haptics.impactMedium();
    router.push({
      pathname: '/screens/routines/new'
    });
  };

  const toggleFavorite = async (routineId: string) => {
    haptics.impactLight();
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
    haptics.impactLight();
    router.push({
      pathname: '/screens/routines/new',
      params: { id: routineId }
    });
  };

  const handleDeleteRoutine = async (routineId: string) => {
    haptics.impactMedium();
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
    haptics.impactLight();
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

  const handleAddPremadeRoutine = async (routine: Routine) => {
    const newRoutine = {
      ...routine,
      id: `routine-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    await storageService.saveRoutine(newRoutine);
    setRoutines([...routines, newRoutine]);
  };

  const filteredRoutines = routines.filter(routine => {
    return !showFavoritesOnly || routine.favorite;
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header
          title={t('routines.title' as TranslationKey)}
          showBackButton={false}
          rightComponent={
            <TouchableOpacity
              style={[styles.filterButton, showFavoritesOnly && styles.filterButtonActive]}
              onPress={() => {
                haptics.impactLight();
                setShowFavoritesOnly(!showFavoritesOnly);
              }}
            >
              <Star
                size={20}
                color={showFavoritesOnly ? theme.colors.primary : theme.colors.text.secondary}
                fill={showFavoritesOnly ? theme.colors.primary : 'none'}
              />
            </TouchableOpacity>
          }
        />

        <FlatList
          data={filteredRoutines}
          renderItem={({ item }) => (
            <RoutineItem
              item={item}
              onStart={handleStartRoutine}
              onEdit={handleEditRoutine}
              onDelete={handleDeleteRoutine}
              onToggleFavorite={toggleFavorite}
              onShare={handleShareRoutine}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              onCreateRoutine={handleCreateRoutine}
              isFavoritesEmpty={showFavoritesOnly && routines.length > 0}
            />
          }
        />
        <FloatButtonAction
          icon={<Plus size={24} color={theme.colors.background.main} />}
          onPress={handleCreateRoutine}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main
  },
  listContent: {
    flexGrow: 1,
    padding: 16
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background.button
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary + '20'
  }
});
