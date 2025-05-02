import React from 'react';
import { StyleSheet, View } from 'react-native';
import { VictoryAxis, VictoryChart, VictoryLine } from 'victory-native';
import { colors } from '../../theme/theme';

interface HistoryData {
  date: string;
  value: number;
}

interface MeasurementChartProps {
  data: HistoryData[];
  title: string;
}

export const MeasurementChart: React.FC<MeasurementChartProps> = ({ data, title }) => {
  return (
    <View style={styles.container}>
      <VictoryChart
        theme={{
          axis: {
            style: {
              tickLabels: {
                fill: colors.text.primary
              },
              grid: {
                stroke: colors.border.default
              }
            }
          }
        }}
      >
        <VictoryAxis
          dependentAxis
          style={{
            tickLabels: { fill: colors.text.primary },
            grid: { stroke: colors.border.default }
          }}
        />
        <VictoryAxis
          style={{
            tickLabels: { fill: colors.text.primary },
            grid: { stroke: colors.border.default }
          }}
        />
        <VictoryLine
          data={data}
          x="date"
          y="value"
          style={{
            data: { stroke: colors.primary }
          }}
        />
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  }
});

export default MeasurementChart; 
