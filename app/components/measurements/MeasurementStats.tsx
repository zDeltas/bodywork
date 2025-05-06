import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';

interface MeasurementStatsProps {
  stats: {
    totalMeasurements: number;
    averageWeight: number;
    weightChange: number;
    lastMeasurementDate: string;
  };
}

const MeasurementStats: React.FC<MeasurementStatsProps> = ({ stats }) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <Text variant="heading" style={styles.statValue}>
          {stats.totalMeasurements}
        </Text>
        <Text variant="caption">Total Measurements</Text>
      </View>
      <View style={styles.statItem}>
        <Text variant="heading" style={styles.statValue}>
          {stats.averageWeight.toFixed(1)}kg
        </Text>
        <Text variant="caption">Average Weight</Text>
      </View>
      <View style={styles.statItem}>
        <Text variant="heading" style={styles.statValue}>
          {stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)}kg
        </Text>
        <Text variant="caption">Weight Change</Text>
      </View>
      <View style={styles.statItem}>
        <Text variant="heading" style={styles.statValue}>
          {new Date(stats.lastMeasurementDate).toLocaleDateString()}
        </Text>
        <Text variant="caption">Last Measurement</Text>
      </View>
    </View>
  );
};

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.colors.background.card,
    borderRadius: 8,
    marginBottom: 16
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    color: theme.colors.primary,
    marginBottom: 4
  }
});

export default MeasurementStats; 
