import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/theme';
import { MeasurementForm } from '../../components/measurements/MeasurementForm';
import { MeasurementChart } from '../../components/measurements/MeasurementChart';
import { MeasurementBodyMap } from '../../components/measurements/MeasurementBodyMap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slug } from 'react-native-body-highlighter';
import Text from '../../components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import MeasurementHistory from '@/app/components/measurements/MeasurementHistory';

interface Measurement {
  date: string;
  weight: number;
  measurements: {
    chest: number;
    waist: number;
    hips: number;
    arms: number;
    forearms: number;
    shoulders: number;
    thighs: number;
    calves: number;
    neck: number;
  };
}

type MeasurementKey = keyof Measurement['measurements'];

interface MeasurementPoint {
  label: string;
  key: keyof typeof measurementSlugs;
  color: string;
  position: {
    x: number;
    y: number;
    side: 'left' | 'right';
    labelX?: number;
    labelY?: number;
    measurementLine?: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
  };
}

const measurementSlugs: Record<string, Slug> = {
  CHEST: 'chest' as Slug,
  WAIST: 'abs' as Slug,
  HIPS: 'gluteal' as Slug,
  ARMS: 'biceps' as Slug,
  FOREARMS: 'forearm' as Slug,
  SHOULDERS: 'deltoids' as Slug,
  THIGHS: 'quadriceps' as Slug,
  CALVES: 'calves' as Slug,
  NECK: 'neck' as Slug
};

const STORAGE_KEY = '@measurements';

export default function MeasurementsScreen() {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<Measurement>({
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    measurements: {
      chest: 0,
      waist: 0,
      hips: 0,
      arms: 0,
      forearms: 0,
      shoulders: 0,
      thighs: 0,
      calves: 0,
      neck: 0
    }
  });

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    try {
      const storedMeasurements = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedMeasurements) {
        setMeasurements(JSON.parse(storedMeasurements));
      }
    } catch (error) {
      console.error('Error loading measurements:', error);
    }
  };

  const saveMeasurements = async (updatedMeasurements: Measurement[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMeasurements));
    } catch (error) {
      console.error('Error saving measurements:', error);
    }
  };

  const handleMeasurementChange = (key: MeasurementKey, value: string) => {
    setCurrentMeasurement((prev) => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [key]: parseFloat(value) || 0
      }
    }));
  };

  const handleWeightChange = (value: string) => {
    setCurrentMeasurement((prev) => ({
      ...prev,
      weight: parseFloat(value) || 0
    }));
  };

  const handleDateChange = (date: string) => {
    setCurrentMeasurement((prev) => ({
      ...prev,
      date
    }));
  };

  const handleSave = () => {
    const updatedMeasurements = [...measurements, currentMeasurement];
    setMeasurements(updatedMeasurements);
    saveMeasurements(updatedMeasurements);
    setCurrentMeasurement({
      date: new Date().toISOString().split('T')[0],
      weight: 0,
      measurements: {
        chest: 0,
        waist: 0,
        hips: 0,
        arms: 0,
        forearms: 0,
        shoulders: 0,
        thighs: 0,
        calves: 0,
        neck: 0
      }
    });
  };

  const measurementPoints: MeasurementPoint[] = [
    {
      label: 'Chest',
      key: 'CHEST',
      color: colors.primary,
      position: { x: 50, y: 30, side: 'right' as const, labelX: 60, labelY: 30 }
    },
    {
      label: 'Waist',
      key: 'WAIST',
      color: colors.primary,
      position: { x: 50, y: 45, side: 'right' as const, labelX: 60, labelY: 45 }
    },
    {
      label: 'Hips',
      key: 'HIPS',
      color: colors.primary,
      position: { x: 50, y: 60, side: 'right' as const, labelX: 60, labelY: 60 }
    },
    {
      label: 'Arms',
      key: 'ARMS',
      color: colors.primary,
      position: { x: 25, y: 35, side: 'left' as const, labelX: 15, labelY: 35 }
    },
    {
      label: 'Forearms',
      key: 'FOREARMS',
      color: colors.primary,
      position: { x: 20, y: 45, side: 'left' as const, labelX: 10, labelY: 45 }
    },
    {
      label: 'Shoulders',
      key: 'SHOULDERS',
      color: colors.primary,
      position: { x: 30, y: 25, side: 'left' as const, labelX: 20, labelY: 25 }
    },
    {
      label: 'Thighs',
      key: 'THIGHS',
      color: colors.primary,
      position: { x: 45, y: 70, side: 'right' as const, labelX: 55, labelY: 70 }
    },
    {
      label: 'Calves',
      key: 'CALVES',
      color: colors.primary,
      position: { x: 45, y: 85, side: 'right' as const, labelX: 55, labelY: 85 }
    },
    {
      label: 'Neck',
      key: 'NECK',
      color: colors.primary,
      position: { x: 50, y: 15, side: 'right' as const, labelX: 60, labelY: 15 }
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading">Mesures</Text>
      </View>
      <ScrollView style={styles.content}>
        <MeasurementForm
          measurement={currentMeasurement}
          onMeasurementChange={handleMeasurementChange}
          onWeightChange={handleWeightChange}
          onDateChange={handleDateChange}
          onSave={handleSave}
        />
        {measurements.length > 0 && (
          <>
            <Text variant="subheading">Historique</Text>
            <MeasurementHistory measurements={measurements} />
            <Text variant="subheading">Graphique</Text>
            <MeasurementChart
              data={measurements.map((m) => ({
                date: m.date,
                value: m.weight
              }))}
              title="Weight Progress"
            />
            <Text variant="subheading">Carte corporelle</Text>
            <MeasurementBodyMap
              points={measurementPoints}
              onPointPress={(point: MeasurementPoint) => {
                // Handle point press if needed
              }}
            />
          </>
        )}
      </ScrollView>
    </ScrollView>
  );
}

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main
  },
  header: {
    padding: 16,
    marginBottom: 16
  },
  content: {
    padding: 16
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  },
  saveButtonText: {
    textAlign: 'center'
  }
}); 
