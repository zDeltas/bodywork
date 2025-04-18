import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import Timer, { REST_TIMES } from '../components/Timer';
import { Plus, Minus, X } from 'lucide-react-native';

SplashScreen.preventAutoHideAsync();

const WORKOUT_TIMES = {
  'Quick': 30,
  'Standard': 60,
  'Long': 90,
  'Very Long': 120,
};

interface CustomTimeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (minutes: number, seconds: number) => void;
  initialMinutes?: number;
  initialSeconds?: number;
}

function CustomTimeModal({ visible, onClose, onSave, initialMinutes = 0, initialSeconds = 0 }: CustomTimeModalProps) {
  const [minutes, setMinutes] = useState(initialMinutes.toString());
  const [seconds, setSeconds] = useState(initialSeconds.toString());

  const handleSave = () => {
    const mins = parseInt(minutes) || 0;
    const secs = parseInt(seconds) || 0;
    onSave(mins, secs);
    onClose();
  };

  const updateTime = (type: 'minutes' | 'seconds', increment: boolean) => {
    const currentValue = type === 'minutes' ? minutes : seconds;
    const newValue = Math.max(0, (parseInt(currentValue) || 0) + (increment ? 1 : -1));
    if (type === 'minutes') {
      setMinutes(newValue.toString());
    } else {
      setSeconds(newValue.toString());
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Custom Time</Text>
            <TouchableOpacity onPress={onClose}>
              <X color="#fff" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.timeInputs}>
            <View style={styles.timeInputContainer}>
              <Text style={styles.timeLabel}>Minutes</Text>
              <View style={styles.timeInputControls}>
                <TouchableOpacity
                  style={styles.timeControlButton}
                  onPress={() => updateTime('minutes', false)}
                >
                  <Minus color="#fff" size={24} />
                </TouchableOpacity>
                <TextInput
                  style={styles.timeInput}
                  value={minutes}
                  onChangeText={setMinutes}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.timeControlButton}
                  onPress={() => updateTime('minutes', true)}
                >
                  <Plus color="#fff" size={24} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.timeInputContainer}>
              <Text style={styles.timeLabel}>Seconds</Text>
              <View style={styles.timeInputControls}>
                <TouchableOpacity
                  style={styles.timeControlButton}
                  onPress={() => updateTime('seconds', false)}
                >
                  <Minus color="#fff" size={24} />
                </TouchableOpacity>
                <TextInput
                  style={styles.timeInput}
                  value={seconds}
                  onChangeText={setSeconds}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.timeControlButton}
                  onPress={() => updateTime('seconds', true)}
                >
                  <Plus color="#fff" size={24} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.presetButtons}>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => {
                setMinutes('1');
                setSeconds('0');
              }}
            >
              <Text style={styles.presetButtonText}>1:00</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => {
                setMinutes('2');
                setSeconds('0');
              }}
            >
              <Text style={styles.presetButtonText}>2:00</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => {
                setMinutes('3');
                setSeconds('0');
              }}
            >
              <Text style={styles.presetButtonText}>3:00</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function TimerScreen() {
  const [mode, setMode] = useState<'timer' | 'stopwatch'>('timer');
  const [selectedTime, setSelectedTime] = useState(60);
  const [selectedRestTime, setSelectedRestTime] = useState(60);
  const [sets, setSets] = useState(1);
  const [exerciseName, setExerciseName] = useState('');
  const [showCustomTimeModal, setShowCustomTimeModal] = useState(false);
  const [showCustomRestTimeModal, setShowCustomRestTimeModal] = useState(false);
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [isCustomRestTime, setIsCustomRestTime] = useState(false);
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

  const handleTimerComplete = () => {
    // Vous pouvez ajouter une notification ou un son ici
  };

  const handleCustomTimeSave = (minutes: number, seconds: number) => {
    setSelectedTime(minutes * 60 + seconds);
    setIsCustomTime(true);
  };

  const handleCustomRestTimeSave = (minutes: number, seconds: number) => {
    setSelectedRestTime(minutes * 60 + seconds);
    setIsCustomRestTime(true);
  };

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
        {mode === 'timer' && (
          <>
            <Text style={styles.sectionTitle}>Exercise Name</Text>
            <TextInput
              style={styles.input}
              value={exerciseName}
              onChangeText={setExerciseName}
              placeholder="Enter exercise name"
              placeholderTextColor="#666"
            />

            <Text style={styles.sectionTitle}>Work Time</Text>
            <View style={styles.timeGrid}>
              {Object.entries(WORKOUT_TIMES).map(([label, time]) => (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.timeButton,
                    selectedTime === time && !isCustomTime && styles.timeButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedTime(time);
                    setIsCustomTime(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedTime === time && !isCustomTime && styles.timeTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                  <Text
                    style={[
                      styles.timeValue,
                      selectedTime === time && !isCustomTime && styles.timeValueActive,
                    ]}
                  >
                    {time < 60
                      ? `${time}s`
                      : `${Math.floor(time / 60)}m ${time % 60}s`}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.timeButton,
                  isCustomTime && styles.timeButtonActive,
                ]}
                onPress={() => setShowCustomTimeModal(true)}
              >
                <Text
                  style={[
                    styles.timeText,
                    isCustomTime && styles.timeTextActive,
                  ]}
                >
                  Custom
                </Text>
                <Text
                  style={[
                    styles.timeValue,
                    isCustomTime && styles.timeValueActive,
                  ]}
                >
                  {selectedTime < 60
                    ? `${selectedTime}s`
                    : `${Math.floor(selectedTime / 60)}m ${selectedTime % 60}s`}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Rest Time</Text>
            <View style={styles.timeGrid}>
              {Object.entries(REST_TIMES).map(([label, time]) => (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.timeButton,
                    selectedRestTime === time && !isCustomRestTime && styles.timeButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedRestTime(time);
                    setIsCustomRestTime(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedRestTime === time && !isCustomRestTime && styles.timeTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                  <Text
                    style={[
                      styles.timeValue,
                      selectedRestTime === time && !isCustomRestTime && styles.timeValueActive,
                    ]}
                  >
                    {time < 60
                      ? `${time}s`
                      : `${Math.floor(time / 60)}m ${time % 60}s`}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.timeButton,
                  isCustomRestTime && styles.timeButtonActive,
                ]}
                onPress={() => setShowCustomRestTimeModal(true)}
              >
                <Text
                  style={[
                    styles.timeText,
                    isCustomRestTime && styles.timeTextActive,
                  ]}
                >
                  Custom
                </Text>
                <Text
                  style={[
                    styles.timeValue,
                    isCustomRestTime && styles.timeValueActive,
                  ]}
                >
                  {selectedRestTime < 60
                    ? `${selectedRestTime}s`
                    : `${Math.floor(selectedRestTime / 60)}m ${selectedRestTime % 60}s`}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Sets</Text>
            <View style={styles.setsContainer}>
              <TouchableOpacity
                style={styles.setsButton}
                onPress={() => setSets(prev => Math.max(1, prev - 1))}
              >
                <Minus color="#fff" size={24} />
              </TouchableOpacity>
              <Text style={styles.setsValue}>{sets}</Text>
              <TouchableOpacity
                style={styles.setsButton}
                onPress={() => setSets(prev => prev + 1)}
              >
                <Plus color="#fff" size={24} />
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.timerContainer}>
          <Timer
            initialTime={mode === 'timer' ? selectedTime : 0}
            mode={mode}
            onComplete={handleTimerComplete}
            sets={sets}
            restTime={selectedRestTime}
            exerciseName={exerciseName || 'Exercise'}
          />
        </View>
      </ScrollView>

      <CustomTimeModal
        visible={showCustomTimeModal}
        onClose={() => setShowCustomTimeModal(false)}
        onSave={handleCustomTimeSave}
        initialMinutes={Math.floor(selectedTime / 60)}
        initialSeconds={selectedTime % 60}
      />

      <CustomTimeModal
        visible={showCustomRestTimeModal}
        onClose={() => setShowCustomRestTimeModal(false)}
        onSave={handleCustomRestTimeSave}
        initialMinutes={Math.floor(selectedRestTime / 60)}
        initialSeconds={selectedRestTime % 60}
      />
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
    backgroundColor: '#fd8f09',
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
    marginTop: 24,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  timeButton: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  timeButtonActive: {
    backgroundColor: '#fd8f09',
  },
  timeText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  timeTextActive: {
    color: '#fff',
  },
  timeValue: {
    color: '#666',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  timeValueActive: {
    color: '#fff',
  },
  setsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  setsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setsValue: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    minWidth: 40,
    textAlign: 'center',
  },
  timerContainer: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  timeInputs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeInputControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    fontSize: 18,
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  presetButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
  },
  presetButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#fd8f09',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  timeLabel: {
    color: '#666',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
});
