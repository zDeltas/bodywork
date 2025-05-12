import { useState, useEffect, useCallback } from 'react';
import storageService, { StorageKeys } from '../services/storage';

export function useExercises() {
  const [favoriteExercises, setFavoriteExercises] = useState<string[]>([]);
  const [recentExercises, setRecentExercises] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Charger les exercices au montage du composant
  useEffect(() => {
    const loadExercises = async () => {
      try {
        setLoading(true);
        const [favorites, recents] = await Promise.all([
          storageService.getFavoriteExercises(),
          storageService.getRecentExercises()
        ]);
        
        setFavoriteExercises(favorites);
        setRecentExercises(recents);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue lors du chargement des exercices'));
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, []);

  // Fonctions pour les exercices favoris
  const addFavoriteExercise = useCallback(async (exercise: string) => {
    try {
      const updatedFavorites = await storageService.addFavoriteExercise(exercise);
      setFavoriteExercises(updatedFavorites);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue lors de l\'ajout aux favoris'));
      return false;
    }
  }, []);

  const removeFavoriteExercise = useCallback(async (exercise: string) => {
    try {
      const updatedFavorites = await storageService.removeFavoriteExercise(exercise);
      setFavoriteExercises(updatedFavorites);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue lors de la suppression des favoris'));
      return false;
    }
  }, []);

  const isFavorite = useCallback((exercise: string) => {
    return favoriteExercises.includes(exercise);
  }, [favoriteExercises]);

  const toggleFavorite = useCallback(async (exercise: string) => {
    if (isFavorite(exercise)) {
      return removeFavoriteExercise(exercise);
    } else {
      return addFavoriteExercise(exercise);
    }
  }, [isFavorite, addFavoriteExercise, removeFavoriteExercise]);

  // Fonctions pour les exercices récents
  const addRecentExercise = useCallback(async (exercise: string) => {
    try {
      const updatedRecents = await storageService.addRecentExercise(exercise);
      setRecentExercises(updatedRecents);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue lors de l\'ajout aux récents'));
      return false;
    }
  }, []);

  return {
    favoriteExercises,
    recentExercises,
    loading,
    error,
    addFavoriteExercise,
    removeFavoriteExercise,
    isFavorite,
    toggleFavorite,
    addRecentExercise
  };
}

export default useExercises; 