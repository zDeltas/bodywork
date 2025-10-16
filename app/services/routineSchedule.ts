import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoutineSchedule, DayOfWeek, Routine } from '@/types/common';

const ROUTINE_SCHEDULES_KEY = 'routine_schedules';

class RoutineScheduleService {
  /**
   * Obtenir tous les horaires de routines
   */
  async getSchedules(): Promise<RoutineSchedule[]> {
    try {
      const data = await AsyncStorage.getItem(ROUTINE_SCHEDULES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading routine schedules:', error);
      return [];
    }
  }

  /**
   * Sauvegarder un horaire de routine
   */
  async saveSchedule(schedule: RoutineSchedule): Promise<void> {
    try {
      const schedules = await this.getSchedules();
      const existingIndex = schedules.findIndex(s => s.routineId === schedule.routineId);
      
      if (existingIndex >= 0) {
        schedules[existingIndex] = { ...schedule, updatedAt: new Date().toISOString() };
      } else {
        schedules.push(schedule);
      }
      
      await AsyncStorage.setItem(ROUTINE_SCHEDULES_KEY, JSON.stringify(schedules));
    } catch (error) {
      console.error('Error saving routine schedule:', error);
      throw error;
    }
  }

  /**
   * Supprimer un horaire de routine
   */
  async deleteSchedule(routineId: string): Promise<void> {
    try {
      const schedules = await this.getSchedules();
      const filteredSchedules = schedules.filter(s => s.routineId !== routineId);
      await AsyncStorage.setItem(ROUTINE_SCHEDULES_KEY, JSON.stringify(filteredSchedules));
    } catch (error) {
      console.error('Error deleting routine schedule:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'horaire d'une routine spécifique
   */
  async getScheduleByRoutineId(routineId: string): Promise<RoutineSchedule | null> {
    try {
      const schedules = await this.getSchedules();
      return schedules.find(s => s.routineId === routineId) || null;
    } catch (error) {
      console.error('Error getting routine schedule:', error);
      return null;
    }
  }

  /**
   * Obtenir les routines planifiées pour un jour donné
   */
  async getScheduledRoutinesForDay(dayOfWeek: DayOfWeek): Promise<RoutineSchedule[]> {
    try {
      const schedules = await this.getSchedules();
      return schedules.filter(s => 
        s.isActive && s.scheduledDays.includes(dayOfWeek)
      );
    } catch (error) {
      console.error('Error getting scheduled routines for day:', error);
      return [];
    }
  }

  /**
   * Obtenir les routines planifiées pour aujourd'hui
   */
  async getTodayScheduledRoutines(): Promise<RoutineSchedule[]> {
    const today = new Date();
    const dayOfWeek = this.getDayOfWeekFromDate(today);
    return this.getScheduledRoutinesForDay(dayOfWeek);
  }

  /**
   * Convertir une date en jour de la semaine
   */
  getDayOfWeekFromDate(date: Date): DayOfWeek {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  /**
   * Obtenir le numéro du jour de la semaine (0 = dimanche, 1 = lundi, etc.)
   */
  getDayNumber(dayOfWeek: DayOfWeek): number {
    const dayMap: Record<DayOfWeek, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };
    return dayMap[dayOfWeek];
  }

  /**
   * Créer un nouvel horaire de routine
   */
  createSchedule(routineId: string, routineTitle: string, scheduledDays: DayOfWeek[]): RoutineSchedule {
    return {
      routineId,
      routineTitle,
      scheduledDays,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
  }

  /**
   * Activer/désactiver un horaire de routine
   */
  async toggleScheduleActive(routineId: string, isActive: boolean): Promise<void> {
    try {
      const schedules = await this.getSchedules();
      const scheduleIndex = schedules.findIndex(s => s.routineId === routineId);
      
      if (scheduleIndex >= 0) {
        schedules[scheduleIndex].isActive = isActive;
        schedules[scheduleIndex].updatedAt = new Date().toISOString();
        await AsyncStorage.setItem(ROUTINE_SCHEDULES_KEY, JSON.stringify(schedules));
      }
    } catch (error) {
      console.error('Error toggling schedule active:', error);
      throw error;
    }
  }
}

export default new RoutineScheduleService();
