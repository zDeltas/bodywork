import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';

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

interface MeasurementHistoryProps {
  measurements: Measurement[];
}

const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({ measurements }) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <ScrollView style={styles.container}>
      {measurements.map((measurement, index) => (
        <View key={index} style={styles.measurementItem}>
          <Text variant="subheading">{new Date(measurement.date).toLocaleDateString()}</Text>
          <Text variant="body">Weight: {measurement.weight}kg</Text>
          <View style={styles.measurementsContainer}>
            {Object.entries(measurement.measurements).map(([key, value]) => (
              <View key={key} style={styles.measurementDetail}>
                <Text variant="caption">{key}:</Text>
                <Text variant="body">{value}cm</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1
  },
  measurementItem: {
    padding: 16,
    backgroundColor: theme.colors.background.card,
    borderRadius: 8,
    marginBottom: 16
  },
  measurementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  measurementDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8
  }
});

export default MeasurementHistory; 
