import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';

SplashScreen.preventAutoHideAsync();

const sampleData = [
  { x: 1, y: 100 },
  { x: 2, y: 120 },
  { x: 3, y: 115 },
  { x: 4, y: 130 },
  { x: 5, y: 140 },
];

export default function StatsScreen() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Volume Progress</Text>
          <VictoryChart
            theme={VictoryTheme.material}
            width={Dimensions.get('window').width - 40}
            height={300}
            padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
          >
            <VictoryAxis
              style={{
                axis: { stroke: '#666' },
                tickLabels: { fill: '#666', fontSize: 12 },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: '#666' },
                tickLabels: { fill: '#666', fontSize: 12 },
              }}
            />
            <VictoryLine
              data={sampleData}
              style={{
                data: { stroke: '#6366f1' },
              }}
            />
          </VictoryChart>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Volume</Text>
            <Text style={styles.statValue}>12,450 kg</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Workouts</Text>
            <Text style={styles.statValue}>24</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Days</Text>
            <Text style={styles.statValue}>18</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  chartContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
});