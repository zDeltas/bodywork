import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { WorkoutDateUtils } from '@/types/workout';
import { Workout } from '@/types/common';
import { useTranslation } from './useTranslation';
import { storageService } from '@/app/services';

export const useCSVExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { t } = useTranslation();

  const convertWorkoutsToCSV = (workouts: Workout[]) => {
    // CSV header
    let csvContent = 'ID,Date,Exercise,Weight (kg),Reps,Sets,RPE,Type,Note\n';

    // Add each workout as a row
    workouts.forEach((workout) => {
      const date = WorkoutDateUtils.getDatePart(workout.date);

      // Add each series as a separate row
      workout.series.forEach((series) => {
        const row = [
          workout.id,
          date,
          workout.exercise,
          series.weight,
          series.reps,
          1, // Each series is one set
          series.rpe || 'N/A',
          series.type,
          `"${series.note?.replace(/"/g, '""') || ''}"` // Escape quotes in notes
        ].join(',');

        csvContent += row + '\n';
      });
    });

    return csvContent;
  };

  // Export workouts data to a CSV file
  const exportWorkoutsToCSV = async () => {
    try {
      setIsExporting(true);

      // Get workouts from storage service
      const workouts = await storageService.getWorkouts();

      if (!workouts || workouts.length === 0) {
        console.log('No workouts found');
        setIsExporting(false);
        return { success: false, message: t('settings.noWorkoutsToExport') };
      }

      // Convert to CSV
      const csvContent = convertWorkoutsToCSV(workouts);

      // Create a temporary file
      const fileDate = new Date().toISOString().split('T')[0];
      const fileName = `gainizi_workouts_${fileDate}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      // Write CSV content to the file
      await FileSystem.writeAsStringAsync(filePath, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/csv',
          dialogTitle: t('settings.exportToCSV'),
          UTI: 'public.comma-separated-values-text'
        });

        setIsExporting(false);
        return { success: true, message: t('settings.exportSuccess') };
      } else {
        console.log('Sharing is not available');
        setIsExporting(false);
        return { success: false, message: t('settings.sharingNotAvailable') };
      }
    } catch (error) {
      console.error('Error exporting workouts:', error);
      setIsExporting(false);
      return { success: false, message: t('settings.exportError') };
    }
  };

  return {
    isExporting,
    exportWorkoutsToCSV
  };
};

// Add default export to fix the route warning
export default useCSVExport;
