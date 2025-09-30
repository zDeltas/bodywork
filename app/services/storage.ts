import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, Workout, RoutineSession } from '@/types/common';

export enum StorageKeys {
  WORKOUTS = 'workouts',
  GOALS = 'goals',
  MEASUREMENTS = 'measurements',
  SETTINGS = 'bodywork_settings',
  FAVORITE_EXERCISES = 'favoriteExercises',
  RECENT_EXERCISES = 'recentExercises',
  STORAGE_VERSION = 'storage_version',
  ROUTINES = 'routines',
  ROUTINE_SESSIONS = 'routine_sessions',
  FEEDBACK_STATE = 'feedback_state',
}

const CURRENT_STORAGE_VERSION = '1.0';

export interface Settings {
  weightUnit: 'kg' | 'lb';
  gender: 'male' | 'female';
  language: 'en' | 'fr';
  theme: 'dark' | 'light';
  rpeMode: 'ask' | 'never';
}

export interface Measurement {
  id: string;
  date: string;
  type: string;
  value: number;
  unit: string;
}

export type StorageData = {
  [StorageKeys.WORKOUTS]: Workout[];
  [StorageKeys.GOALS]: Goal[];
  [StorageKeys.MEASUREMENTS]: Measurement[];
  [StorageKeys.SETTINGS]: Settings;
  [StorageKeys.FAVORITE_EXERCISES]: string[];
  [StorageKeys.RECENT_EXERCISES]: string[];
  [StorageKeys.STORAGE_VERSION]: string;
  [StorageKeys.ROUTINES]: any[];
  [StorageKeys.ROUTINE_SESSIONS]: RoutineSession[];
  [StorageKeys.FEEDBACK_STATE]: FeedbackState;
};

const defaultValues: StorageData = {
  [StorageKeys.WORKOUTS]: [],
  [StorageKeys.GOALS]: [],
  [StorageKeys.MEASUREMENTS]: [],
  [StorageKeys.SETTINGS]: {
    weightUnit: 'kg',
    gender: 'male',
    language: 'fr',
    theme: 'dark',
    rpeMode: 'ask'
  },
  [StorageKeys.FAVORITE_EXERCISES]: [],
  [StorageKeys.RECENT_EXERCISES]: [],
  [StorageKeys.STORAGE_VERSION]: CURRENT_STORAGE_VERSION,
  [StorageKeys.ROUTINES]: [],
  [StorageKeys.ROUTINE_SESSIONS]: [],
  [StorageKeys.FEEDBACK_STATE]: {
    completedCount: 0,
    promptedOnce: false,
    lastPromptAt: null
  }
};

export type FeedbackState = {
  completedCount: number;
  promptedOnce: boolean;
  lastPromptAt: string | null;
  pendingPrompt?: boolean;
};

class StorageService {
  async initialize(): Promise<void> {
    try {
      const version = await this.getItem<string>(StorageKeys.STORAGE_VERSION);

      if (!version) {
        await this.setItem(StorageKeys.STORAGE_VERSION, CURRENT_STORAGE_VERSION);
      } else if (version !== CURRENT_STORAGE_VERSION) {
        await this.migrateStorage(version, CURRENT_STORAGE_VERSION);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du stockage:', error);
    }
  }

  async resetAllData(): Promise<void> {
    try {
      const keysToReset: StorageKeys[] = [
        StorageKeys.WORKOUTS,
        StorageKeys.GOALS,
        StorageKeys.MEASUREMENTS,
        StorageKeys.FAVORITE_EXERCISES,
        StorageKeys.RECENT_EXERCISES,
        StorageKeys.ROUTINES,
        StorageKeys.ROUTINE_SESSIONS,
        StorageKeys.FEEDBACK_STATE,
        StorageKeys.SETTINGS,
        StorageKeys.STORAGE_VERSION
      ];

      await AsyncStorage.multiRemove(keysToReset);

      for (const key of keysToReset) {
        if (key === StorageKeys.STORAGE_VERSION) {
          await this.setItem(StorageKeys.STORAGE_VERSION, CURRENT_STORAGE_VERSION);
        } else if (key === StorageKeys.SETTINGS) {
          await this.setItem(StorageKeys.SETTINGS, defaultValues[StorageKeys.SETTINGS]);
        } else if (key === StorageKeys.FEEDBACK_STATE) {
          await this.setItem(StorageKeys.FEEDBACK_STATE, defaultValues[StorageKeys.FEEDBACK_STATE]);
        } else {
          await this.setItem(key, (defaultValues as any)[key]);
        }
      }

      console.log('Toutes les données (y compris paramètres et sessions) ont été réinitialisées avec succès');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des données:', error);
      throw error;
    }
  }

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

  async setItem<T>(key: StorageKeys, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement de ${key}:`, error);
    }
  }

  async removeItem(key: StorageKeys): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Erreur lors de l\'effacement du stockage:', error);
    }
  }

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

  async getRecentExercises(): Promise<string[]> {
    const recents = await this.getItem<string[]>(StorageKeys.RECENT_EXERCISES);
    return recents || defaultValues[StorageKeys.RECENT_EXERCISES];
  }

  async addRecentExercise(exercise: string): Promise<string[]> {
    const recents = await this.getRecentExercises();
    const filteredRecents = recents.filter((e) => e !== exercise);
    const updatedRecents = [exercise, ...filteredRecents].slice(0, 10);
    await this.setItem(StorageKeys.RECENT_EXERCISES, updatedRecents);
    return updatedRecents;
  }

  async getRoutines(): Promise<any[]> {
    const routines = await this.getItem<any[]>(StorageKeys.ROUTINES);
    return routines || defaultValues[StorageKeys.ROUTINES];
  }

  async saveRoutine(routine: any): Promise<void> {
    const routines = await this.getRoutines();
    const index = routines.findIndex((r) => r.id === routine.id);
    if (index !== -1) {
      routines[index] = routine;
    } else {
      routines.push(routine);
    }
    await this.setItem(StorageKeys.ROUTINES, routines);
  }

  async deleteRoutine(id: string): Promise<void> {
    const routines = await this.getRoutines();
    const filteredRoutines = routines.filter((r) => r.id !== id);
    await this.setItem(StorageKeys.ROUTINES, filteredRoutines);
  }

  async getRoutineSessions(): Promise<RoutineSession[]> {
    const sessions = await this.getItem<RoutineSession[]>(StorageKeys.ROUTINE_SESSIONS);
    return sessions || defaultValues[StorageKeys.ROUTINE_SESSIONS];
  }

  async getRoutineSessionsByRoutineId(routineId: string): Promise<RoutineSession[]> {
    const sessions = await this.getRoutineSessions();
    return sessions.filter(s => s.routineId === routineId);
  }

  async saveRoutineSession(session: RoutineSession): Promise<void> {
    const sessions = await this.getRoutineSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index !== -1) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    await this.setItem(StorageKeys.ROUTINE_SESSIONS, sessions);
  }

  async getFeedbackState(): Promise<FeedbackState> {
    const state = await this.getItem<FeedbackState>(StorageKeys.FEEDBACK_STATE);
    return state || (defaultValues[StorageKeys.FEEDBACK_STATE] as FeedbackState);
  }

  async setFeedbackState(newState: FeedbackState): Promise<void> {
    await this.setItem<FeedbackState>(StorageKeys.FEEDBACK_STATE, newState);
  }

  async incrementFeedbackCompletedAndMaybeSchedulePrompt(): Promise<FeedbackState> {
    const current = await this.getFeedbackState();
    const completedCount = (current.completedCount || 0) + 1;
    let next: FeedbackState = { ...current, completedCount };
    if (!current.promptedOnce && completedCount >= 5) {
      next = {
        ...next,
        promptedOnce: true,
        pendingPrompt: true,
        lastPromptAt: new Date().toISOString(),
      };
    }
    await this.setFeedbackState(next);
    return next;
  }

  async clearFeedbackPendingPrompt(): Promise<FeedbackState> {
    const current = await this.getFeedbackState();
    const next: FeedbackState = { ...current, pendingPrompt: false, lastPromptAt: new Date().toISOString() };
    await this.setFeedbackState(next);
    return next;
  }

  private async migrateStorage(fromVersion: string, toVersion: string): Promise<void> {
    console.log(`Migration du stockage de la version ${fromVersion} vers ${toVersion}`);

    await this.setItem(StorageKeys.STORAGE_VERSION, toVersion);
  }
}

export const storageService = new StorageService();
export default storageService;
