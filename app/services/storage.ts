import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, Workout, Series, StatsData } from '../types/common';

// Énumérations pour les clés de stockage
export enum StorageKeys {
  WORKOUTS = 'workouts',
  GOALS = 'goals',
  MEASUREMENTS = 'measurements',
  SETTINGS = 'bodywork_settings',
  FAVORITE_EXERCISES = 'favoriteExercises',
  RECENT_EXERCISES = 'recentExercises',
  STORAGE_VERSION = 'storage_version',
}

// Version actuelle du stockage (pour les migrations futures)
const CURRENT_STORAGE_VERSION = '1.0';

// Interfaces pour les types de données stockées
export interface Settings {
  weightUnit: 'kg' | 'lb';
  gender: 'male' | 'female';
  language: 'en' | 'fr';
  theme: 'dark' | 'light';
}

export interface Measurement {
  id: string;
  date: string;
  type: string;
  value: number;
  unit: string;
}

// Types pour les données stockées
export type StorageData = {
  [StorageKeys.WORKOUTS]: Workout[];
  [StorageKeys.GOALS]: Goal[];
  [StorageKeys.MEASUREMENTS]: Measurement[];
  [StorageKeys.SETTINGS]: Settings;
  [StorageKeys.FAVORITE_EXERCISES]: string[];
  [StorageKeys.RECENT_EXERCISES]: string[];
  [StorageKeys.STORAGE_VERSION]: string;
};

// Valeurs par défaut
const defaultValues: StorageData = {
  [StorageKeys.WORKOUTS]: [],
  [StorageKeys.GOALS]: [],
  [StorageKeys.MEASUREMENTS]: [],
  [StorageKeys.SETTINGS]: {
    weightUnit: 'kg',
    gender: 'male',
    language: 'fr',
    theme: 'dark',
  },
  [StorageKeys.FAVORITE_EXERCISES]: [],
  [StorageKeys.RECENT_EXERCISES]: [],
  [StorageKeys.STORAGE_VERSION]: CURRENT_STORAGE_VERSION,
};

/**
 * Service de stockage centralisé
 */
class StorageService {
  /**
   * Initialise le stockage avec la version actuelle
   */
  async initialize(): Promise<void> {
    try {
      const version = await this.getItem<string>(StorageKeys.STORAGE_VERSION);

      if (!version) {
        // Premier lancement, initialiser la version
        await this.setItem(StorageKeys.STORAGE_VERSION, CURRENT_STORAGE_VERSION);
      } else if (version !== CURRENT_STORAGE_VERSION) {
        // Migration nécessaire
        await this.migrateStorage(version, CURRENT_STORAGE_VERSION);
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation du stockage:", error);
    }
  }

  /**
   * Réinitialise toutes les données utilisateur
   * tout en préservant les paramètres et la version du stockage
   */
  async resetAllData(): Promise<void> {
    try {
      // Sauvegarder les paramètres et la version actuels
      const settings = await this.getSettings();
      const version = await this.getItem<string>(StorageKeys.STORAGE_VERSION);

      // Clés à réinitialiser
      const keysToReset = [
        StorageKeys.WORKOUTS,
        StorageKeys.GOALS,
        StorageKeys.MEASUREMENTS,
        StorageKeys.FAVORITE_EXERCISES,
        StorageKeys.RECENT_EXERCISES,
      ];

      // Supprimer les données
      await AsyncStorage.multiRemove(keysToReset);

      // Réinitialiser avec les valeurs par défaut
      for (const key of keysToReset) {
        await this.setItem(key, defaultValues[key]);
      }

      // Vérifier que les données ont bien été réinitialisées
      const allReset = await Promise.all(
        keysToReset.map(async (key) => {
          const value = await this.getItem(key);
          return Array.isArray(value) && value.length === 0;
        }),
      );

      if (!allReset.every((reset) => reset)) {
        throw new Error("Certaines données n'ont pas été correctement réinitialisées");
      }

      console.log('Toutes les données ont été réinitialisées avec succès');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des données:', error);
      throw error;
    }
  }

  /**
   * Méthode générique pour récupérer un élément
   */
  async getItem<T>(key: StorageKeys): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${key}:`, error);
      return null;
    }
  }

  /**
   * Méthode générique pour stocker un élément
   */
  async setItem<T>(key: StorageKeys, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement de ${key}:`, error);
    }
  }

  /**
   * Méthode générique pour supprimer un élément
   */
  async removeItem(key: StorageKeys): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
    }
  }

  /**
   * Méthode pour effacer tout le stockage
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Erreur lors de l'effacement du stockage:", error);
    }
  }

  /**
   * Méthode pour migrer le stockage d'une version à une autre
   */
  private async migrateStorage(fromVersion: string, toVersion: string): Promise<void> {
    console.log(`Migration du stockage de la version ${fromVersion} vers ${toVersion}`);

    // Implémentez ici la logique de migration entre les versions
    // Par exemple:
    // if (fromVersion === '1.0' && toVersion === '1.1') {
    //   // Migration spécifique de 1.0 à 1.1
    // }

    // Mettre à jour la version
    await this.setItem(StorageKeys.STORAGE_VERSION, toVersion);
  }

  // Méthodes spécifiques pour les workouts
  async getWorkouts(): Promise<Workout[]> {
    const workouts = await this.getItem<Workout[]>(StorageKeys.WORKOUTS);
    return workouts || defaultValues[StorageKeys.WORKOUTS];
  }

  async saveWorkout(workout: Workout): Promise<void> {
    const workouts = await this.getWorkouts();
    const index = workouts.findIndex((w) => w.id === workout.id);

    if (index !== -1) {
      workouts[index] = workout;
    } else {
      workouts.push(workout);
    }

    await this.setItem(StorageKeys.WORKOUTS, workouts);
  }

  async deleteWorkout(id: string): Promise<void> {
    const workouts = await this.getWorkouts();
    const filteredWorkouts = workouts.filter((w) => w.id !== id);
    await this.setItem(StorageKeys.WORKOUTS, filteredWorkouts);
  }

  // Méthodes spécifiques pour les goals
  async getGoals(): Promise<Goal[]> {
    const goals = await this.getItem<Goal[]>(StorageKeys.GOALS);
    return goals || defaultValues[StorageKeys.GOALS];
  }

  async saveGoal(goal: Goal): Promise<void> {
    const goals = await this.getGoals();
    const index = goals.findIndex((g) => g.exercise === goal.exercise);

    if (index !== -1) {
      goals[index] = goal;
    } else {
      goals.push(goal);
    }

    await this.setItem(StorageKeys.GOALS, goals);
  }

  async deleteGoal(exercise: string): Promise<void> {
    const goals = await this.getGoals();
    const filteredGoals = goals.filter((g) => g.exercise !== exercise);
    await this.setItem(StorageKeys.GOALS, filteredGoals);
  }

  // Méthodes spécifiques pour les measurements
  async getMeasurements(): Promise<Measurement[]> {
    const measurements = await this.getItem<Measurement[]>(StorageKeys.MEASUREMENTS);
    return measurements || defaultValues[StorageKeys.MEASUREMENTS];
  }

  async saveMeasurement(measurement: Measurement): Promise<void> {
    const measurements = await this.getMeasurements();
    const index = measurements.findIndex((m) => m.id === measurement.id);

    if (index !== -1) {
      measurements[index] = measurement;
    } else {
      measurements.push(measurement);
    }

    await this.setItem(StorageKeys.MEASUREMENTS, measurements);
  }

  async deleteMeasurement(id: string): Promise<void> {
    const measurements = await this.getMeasurements();
    const filteredMeasurements = measurements.filter((m) => m.id !== id);
    await this.setItem(StorageKeys.MEASUREMENTS, filteredMeasurements);
  }

  // Méthodes spécifiques pour les settings
  async getSettings(): Promise<Settings> {
    const settings = await this.getItem<Settings>(StorageKeys.SETTINGS);
    return settings || defaultValues[StorageKeys.SETTINGS];
  }

  async updateSettings(newSettings: Partial<Settings>): Promise<Settings> {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await this.setItem(StorageKeys.SETTINGS, updatedSettings);
    return updatedSettings;
  }

  // Méthodes spécifiques pour les exercices favoris
  async getFavoriteExercises(): Promise<string[]> {
    const favorites = await this.getItem<string[]>(StorageKeys.FAVORITE_EXERCISES);
    return favorites || defaultValues[StorageKeys.FAVORITE_EXERCISES];
  }

  async addFavoriteExercise(exercise: string): Promise<string[]> {
    const favorites = await this.getFavoriteExercises();
    if (!favorites.includes(exercise)) {
      favorites.push(exercise);
      await this.setItem(StorageKeys.FAVORITE_EXERCISES, favorites);
    }
    return favorites;
  }

  async removeFavoriteExercise(exercise: string): Promise<string[]> {
    const favorites = await this.getFavoriteExercises();
    const updatedFavorites = favorites.filter((e) => e !== exercise);
    await this.setItem(StorageKeys.FAVORITE_EXERCISES, updatedFavorites);
    return updatedFavorites;
  }

  // Méthodes spécifiques pour les exercices récents
  async getRecentExercises(): Promise<string[]> {
    const recents = await this.getItem<string[]>(StorageKeys.RECENT_EXERCISES);
    return recents || defaultValues[StorageKeys.RECENT_EXERCISES];
  }

  async addRecentExercise(exercise: string): Promise<string[]> {
    const recents = await this.getRecentExercises();
    // Supprimer l'exercice s'il existe déjà pour le mettre en tête de liste
    const filteredRecents = recents.filter((e) => e !== exercise);
    // Limiter à 10 exercices récents
    const updatedRecents = [exercise, ...filteredRecents].slice(0, 10);
    await this.setItem(StorageKeys.RECENT_EXERCISES, updatedRecents);
    return updatedRecents;
  }
}

// Export d'une instance unique du service
export const storageService = new StorageService();
export default storageService;
