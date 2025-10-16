import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { RoutineSchedule, DayOfWeek } from '@/types/common';
import routineScheduleService from '@/app/services/routineSchedule';

export const useRoutineSchedule = () => {
  const [schedules, setSchedules] = useState<RoutineSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await routineScheduleService.getSchedules();
      setSchedules(data);
    } catch (err) {
      console.error('Error loading routine schedules:', err);
      setError('Failed to load routine schedules');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les données au montage et à chaque focus
  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  useFocusEffect(
    useCallback(() => {
      loadSchedules();
    }, [loadSchedules])
  );

  const saveSchedule = useCallback(async (schedule: RoutineSchedule) => {
    try {
      await routineScheduleService.saveSchedule(schedule);
      await loadSchedules(); // Recharger les données
    } catch (err) {
      console.error('Error saving routine schedule:', err);
      throw err;
    }
  }, [loadSchedules]);

  const deleteSchedule = useCallback(async (routineId: string) => {
    try {
      await routineScheduleService.deleteSchedule(routineId);
      await loadSchedules(); // Recharger les données
    } catch (err) {
      console.error('Error deleting routine schedule:', err);
      throw err;
    }
  }, [loadSchedules]);

  const toggleScheduleActive = useCallback(async (routineId: string, isActive: boolean) => {
    try {
      await routineScheduleService.toggleScheduleActive(routineId, isActive);
      await loadSchedules(); // Recharger les données
    } catch (err) {
      console.error('Error toggling schedule active:', err);
      throw err;
    }
  }, [loadSchedules]);

  const getScheduleByRoutineId = useCallback((routineId: string): RoutineSchedule | null => {
    return schedules.find(s => s.routineId === routineId) || null;
  }, [schedules]);

  const getScheduledRoutinesForDay = useCallback((dayOfWeek: DayOfWeek): RoutineSchedule[] => {
    return schedules.filter(s => 
      s.isActive && s.scheduledDays.includes(dayOfWeek)
    );
  }, [schedules]);

  const getTodayScheduledRoutines = useCallback((): RoutineSchedule[] => {
    const today = new Date();
    const dayOfWeek = routineScheduleService.getDayOfWeekFromDate(today);
    return getScheduledRoutinesForDay(dayOfWeek);
  }, [getScheduledRoutinesForDay]);

  return {
    schedules,
    loading,
    error,
    saveSchedule,
    deleteSchedule,
    toggleScheduleActive,
    getScheduleByRoutineId,
    getScheduledRoutinesForDay,
    getTodayScheduledRoutines,
    refresh: loadSchedules
  };
};

export default useRoutineSchedule;
