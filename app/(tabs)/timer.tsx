import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import Timer from '../components/Timer';

SplashScreen.preventAutoHideAsync();

const PRESET_TIMES = [30, 60, 90, 120, 180, 300]; // en secondes

export default function TimerScreen() {
  const [mode, setMode] = useState<'timer' | 'stopwatch'>('timer');
  const [selectedTime, setSelectedTime] = useState(60);
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
        <Text style={styles.title}>Timer</Text>
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'timer' && styles.modeButtonActive]}
            onPress={() => setMode('timer')}
          >
            <Text style={[styles.modeText, mode === 'timer' && styles.modeTextActive]}>
              Timer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'stopwatch' && styles.modeButtonActive]}
            onPress={() => setMode('stopwatch')}
          >
            <Text style={[styles.modeText, mode === 'stopwatch' && styles.modeTextActive]}>
              Stopwatch
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {mode === 'timer' ? (
          <>
            <Text style={styles.sectionTitle}>Preset Times</Text>
            <View style={styles.presetGrid}>
              {PRESET_TIMES.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.presetButton,
                    selectedTime === time && styles.presetButtonActive,
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      selectedTime === time && styles.presetTextActive,
                    ]}
                  >
                    {time < 60
                      ? `${time}s`
                      : `${Math.floor(time / 60)}m ${time % 60}s`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.timerContainer}>
          <Timer
            initialTime={mode === 'timer' ? selectedTime : 0}
            mode={mode}
            onComplete={() => {
              // Vous pouvez ajouter une notification ou un son ici
            }}
          />
        </View>
      </ScrollView>
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
    marginBottom: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#6366f1',
  },
  modeText: {
    fontFamily: 'Inter-SemiBold',
    color: '#666',
    fontSize: 16,
  },
  modeTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 16,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  presetButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  presetButtonActive: {
    backgroundColor: '#6366f1',
  },
  presetText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  presetTextActive: {
    fontFamily: 'Inter-SemiBold',
  },
  timerContainer: {
    marginTop: 20,
  },
});
