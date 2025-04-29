import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/theme';

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

export const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({ measurements }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container}>
      {measurements.map((measurement, index) => (
        <View key={index} style={styles.measurementCard}>
          <Text style={styles.date}>{formatDate(measurement.date)}</Text>
          <View style={styles.measurementRow}>
            <Text style={styles.label}>Weight:</Text>
            <Text style={styles.value}>{measurement.weight} kg</Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.label}>Chest:</Text>
            <Text style={styles.value}>{measurement.measurements.chest} cm</Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.label}>Waist:</Text>
            <Text style={styles.value}>{measurement.measurements.waist} cm</Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.label}>Hips:</Text>
            <Text style={styles.value}>{measurement.measurements.hips} cm</Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.label}>Arms:</Text>
            <Text style={styles.value}>{measurement.measurements.arms} cm</Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.label}>Forearms:</Text>
            <Text style={styles.value}>{measurement.measurements.forearms} cm</Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.label}>Shoulders:</Text>
            <Text style={styles.value}>{measurement.measurements.shoulders} cm</Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.label}>Thighs:</Text>
            <Text style={styles.value}>{measurement.measurements.thighs} cm</Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.label}>Calves:</Text>
            <Text style={styles.value}>{measurement.measurements.calves} cm</Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.label}>Neck:</Text>
            <Text style={styles.value}>{measurement.measurements.neck} cm</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  measurementCard: {
    backgroundColor: colors.background.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: colors.text.secondary,
  },
  value: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
});

export default MeasurementHistory; 