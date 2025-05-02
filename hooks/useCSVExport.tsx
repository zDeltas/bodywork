import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout } from '@/app/types/workout';
import { useTranslation } from './useTranslation';

export const useCSVExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { t } = useTranslation();

  // Convert workouts data to CSV format
  const convertWorkoutsToCSV = (workouts: Workout[]) => {
    // CSV header
    let csvContent = 'ID,Date,Exercise,Weight (kg),Reps,Sets,RPE,Type,Note\n';

    // Add each workout as a row
    workouts.forEach(workout => {
      const date = new Date(workout.date).toISOString().split('T')[0];
      
      // Add each series as a separate row
      workout.series.forEach(series => {
        const row = [
          workout.id,
          date,
          workout.exercise,
          series.weight,
          series.reps,
          1, // Each series is one set
          series.rpe || 'N/A',
          series.type,
          `"${series.note?.replace(/"/g, '""') || ''}"`  // Escape quotes in notes
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
      
      // Get workouts from AsyncStorage
      const storedWorkouts = await AsyncStorage.getItem('workouts');
      if (!storedWorkouts) {
        console.log('No workouts found');
        setIsExporting(false);
        return { success: false, message: t('noWorkoutsToExport') };
      }
      
      const workouts: Workout[] = JSON.parse(storedWorkouts);
      
      // Convert to CSV
      const csvContent = convertWorkoutsToCSV(workouts);
      
      // Create a temporary file
      const fileDate = new Date().toISOString().split('T')[0];
      const fileName = `bodywork_workouts_${fileDate}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      // Write CSV content to the file
      await FileSystem.writeAsStringAsync(filePath, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/csv',
          dialogTitle: t('exportToCSV'),
          UTI: 'public.comma-separated-values-text'
        });
        
        setIsExporting(false);
        return { success: true, message: t('exportSuccess') };
      } else {
        console.log('Sharing is not available');
        setIsExporting(false);
        return { success: false, message: t('sharingNotAvailable') };
      }
    } catch (error) {
      console.error('Error exporting workouts:', error);
      setIsExporting(false);
      return { success: false, message: t('exportError') };
    }
  };

  return {
    isExporting,
    exportWorkoutsToCSV
  };
};
