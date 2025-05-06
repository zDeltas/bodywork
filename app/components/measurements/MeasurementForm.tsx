import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { colors } from '@/app/theme';
import Text from '@/app/components/ui/Text';


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

interface MeasurementFormProps {
  measurement: Measurement;
  onMeasurementChange: (key: MeasurementKey, value: string) => void;
  onWeightChange: (value: string) => void;
  onDateChange: (date: string) => void;
  onSave: () => void;
}

export const MeasurementForm: React.FC<MeasurementFormProps> = ({
                                                                  measurement,
                                                                  onMeasurementChange,
                                                                  onWeightChange,
                                                                  onDateChange,
                                                                  onSave
                                                                }) => {
  const { isDarkMode } = useTheme();

  const measurementPoints: { label: string; key: MeasurementKey }[] = [
    { label: 'Chest', key: 'chest' },
    { label: 'Waist', key: 'waist' },
    { label: 'Hips', key: 'hips' },
    { label: 'Arms', key: 'arms' },
    { label: 'Forearms', key: 'forearms' },
    { label: 'Shoulders', key: 'shoulders' },
    { label: 'Thighs', key: 'thighs' },
    { label: 'Calves', key: 'calves' },
    { label: 'Neck', key: 'neck' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text variant="body">Date</Text>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text.primary,
              borderColor: colors.border.default,
              backgroundColor: colors.background.input
            }
          ]}
          value={measurement.date}
          onChangeText={onDateChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.text.secondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text variant="body">Weight (kg)</Text>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text.primary,
              borderColor: colors.border.default,
              backgroundColor: colors.background.input
            }
          ]}
          value={measurement.weight.toString()}
          onChangeText={onWeightChange}
          keyboardType="numeric"
          placeholder="Enter weight"
          placeholderTextColor={colors.text.secondary}
        />
      </View>

      {measurementPoints.map((point) => (
        <View key={point.key} style={styles.inputGroup}>
          <Text variant="body">{point.label}</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text.primary,
                borderColor: colors.border.default,
                backgroundColor: colors.background.input
              }
            ]}
            value={measurement.measurements[point.key].toString()}
            onChangeText={(value) => onMeasurementChange(point.key, value)}
            keyboardType="numeric"
            placeholder={`Enter ${point.label.toLowerCase()}`}
            placeholderTextColor={colors.text.secondary}
          />
        </View>
      ))}

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={onSave}
      >
        <Text variant="body" style={styles.saveButtonText}>Save Measurements</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  inputGroup: {
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    color: colors.text.primary
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  },
  saveButtonText: {
    color: colors.text.primary,
    fontWeight: 'bold'
  }
});

export default MeasurementForm; 
