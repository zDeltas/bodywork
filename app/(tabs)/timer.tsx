import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import Timer, { REST_TIMES } from '../components/Timer';
import { Minus, Plus } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { TimerPickerModal } from 'react-native-timer-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { TranslationKey } from '@/translations';

SplashScreen.preventAutoHideAsync();

const WORKOUT_TIMES = {
  'quick': 30,
  'standard': 60,
  'long': 90,
  'veryLong': 120
};

export default function TimerScreen() {
  const { t } = useTranslation();
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
    'Inter-Bold': Inter_700Bold
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleTimerComplete = () => {
    // Vous pouvez ajouter une notification ou un son ici
  };

  const handleCustomTimeSave = (pickedDuration: { hours: number, minutes: number, seconds: number }) => {
    const totalSeconds = (pickedDuration.hours * 3600) + (pickedDuration.minutes * 60) + pickedDuration.seconds;
    setSelectedTime(totalSeconds);
    setIsCustomTime(true);
    setShowCustomTimeModal(false);
  };

  const handleCustomRestTimeSave = (pickedDuration: { hours: number, minutes: number, seconds: number }) => {
    const totalSeconds = (pickedDuration.hours * 3600) + (pickedDuration.minutes * 60) + pickedDuration.seconds;
    setSelectedRestTime(totalSeconds);
    setIsCustomRestTime(true);
    setShowCustomRestTimeModal(false);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('timer')}</Text>
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'timer' && styles.modeButtonActive]}
            onPress={() => setMode('timer')}
          >
            <Text style={[styles.modeText, mode === 'timer' && styles.modeTextActive]}>
              {t('timer')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'stopwatch' && styles.modeButtonActive]}
            onPress={() => setMode('stopwatch')}
          >
            <Text style={[styles.modeText, mode === 'stopwatch' && styles.modeTextActive]}>
              {t('stopwatch')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {mode === 'timer' && (
          <>
            {/*<Text style={styles.sectionTitle}>{t('exerciseName')}</Text>*/}
            {/*<TextInput*/}
            {/*  style={styles.input}*/}
            {/*  value={exerciseName}*/}
            {/*  onChangeText={setExerciseName}*/}
            {/*  placeholder={t('enterExerciseName')}*/}
            {/*  placeholderTextColor="#666"*/}
            {/*/>*/}

            <Text style={styles.sectionTitle}>{t('workTime')}</Text>
            <View style={styles.timeGrid}>
              {Object.entries(WORKOUT_TIMES).map(([key, time]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.timeButton,
                    selectedTime === time && !isCustomTime && styles.timeButtonActive
                  ]}
                  onPress={() => {
                    setSelectedTime(time);
                    setIsCustomTime(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedTime === time && !isCustomTime && styles.timeTextActive
                    ]}
                  >
                    {t(key as TranslationKey)}
                  </Text>
                  <Text
                    style={[
                      styles.timeValue,
                      selectedTime === time && !isCustomTime && styles.timeValueActive
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
                  isCustomTime && styles.timeButtonActive
                ]}
                onPress={() => setShowCustomTimeModal(true)}
              >
                <Text
                  style={[
                    styles.timeText,
                    isCustomTime && styles.timeTextActive
                  ]}
                >
                  {t('custom')}
                </Text>
                <Text
                  style={[
                    styles.timeValue,
                    isCustomTime && styles.timeValueActive
                  ]}
                >
                  {selectedTime < 60
                    ? `${selectedTime}s`
                    : `${Math.floor(selectedTime / 60)}m ${selectedTime % 60}s`}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>{t('restTime')}</Text>
            <View style={styles.timeGrid}>
              {Object.entries(WORKOUT_TIMES).map(([key, time]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.timeButton,
                    selectedRestTime === time && !isCustomRestTime && styles.timeButtonActive
                  ]}
                  onPress={() => {
                    setSelectedRestTime(time);
                    setIsCustomRestTime(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedRestTime === time && !isCustomRestTime && styles.timeTextActive
                    ]}
                  >
                    {t(key as TranslationKey)}
                  </Text>
                  <Text
                    style={[
                      styles.timeValue,
                      selectedRestTime === time && !isCustomRestTime && styles.timeValueActive
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
                  isCustomRestTime && styles.timeButtonActive
                ]}
                onPress={() => setShowCustomRestTimeModal(true)}
              >
                <Text
                  style={[
                    styles.timeText,
                    isCustomRestTime && styles.timeTextActive
                  ]}
                >
                  {t('custom')}
                </Text>
                <Text
                  style={[
                    styles.timeValue,
                    isCustomRestTime && styles.timeValueActive
                  ]}
                >
                  {selectedRestTime < 60
                    ? `${selectedRestTime}s`
                    : `${Math.floor(selectedRestTime / 60)}m ${selectedRestTime % 60}s`}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>{t('sets')}</Text>
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
            exerciseName={exerciseName || t('exercise')}
          />
        </View>
      </ScrollView>

      <TimerPickerModal
        visible={showCustomTimeModal}
        setIsVisible={setShowCustomTimeModal}
        onCancel={() => setShowCustomTimeModal(false)}
        onConfirm={handleCustomTimeSave}
        cancelButtonText={t('cancel')}
        confirmButtonText={t('save')}
        closeOnOverlayPress={true}
        modalTitle={t('workTime')}
        styles={{
          backgroundColor: '#1a1a1a',
          pickerContainer: {
            backgroundColor: '#1a1a1a'
          },
          pickerItem: {
            color: '#fff',
            fontSize: 34
          },
          pickerLabel: {
            color: '#fff',
            fontSize: 26,
            right: -20
          },
          theme: 'dark',
          pickerLabelContainer: {
            width: 60
          },
          pickerItemContainer: {
            width: 150
          },
          confirmButton: {
            backgroundColor: '#fd8f09',
            borderColor: '#fd8f09'
          }
        }}
        hideHours={true}
        padWithNItems={1}
        minuteLabel="min"
        secondLabel="sec"
        LinearGradient={LinearGradient}
        Haptics={Haptics}
        Audio={Audio}
      />


      <TimerPickerModal
        visible={showCustomRestTimeModal}
        setIsVisible={setShowCustomRestTimeModal}
        onCancel={() => setShowCustomRestTimeModal(false)}
        onConfirm={handleCustomRestTimeSave}
        cancelButtonText={t('cancel')}
        confirmButtonText={t('save')}
        closeOnOverlayPress={true}
        modalTitle={t('restTime')}
        styles={{
          backgroundColor: '#1a1a1a',
          pickerContainer: {
            backgroundColor: '#1a1a1a'
          },
          pickerItem: {
            color: '#fff',
            fontSize: 34
          },
          pickerLabel: {
            color: '#fff',
            fontSize: 26,
            right: -20
          },
          theme: 'dark',
          pickerLabelContainer: {
            width: 60
          },
          pickerItemContainer: {
            width: 150
          },
          confirmButton: {
            backgroundColor: '#fd8f09',
            borderColor: '#fd8f09'
          }
        }}
        hideHours={true}
        padWithNItems={1}
        minuteLabel="min"
        secondLabel="sec"
        LinearGradient={LinearGradient}
        Haptics={Haptics}
        Audio={Audio}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a'
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a'
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 20
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 4
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center'
  },
  modeButtonActive: {
    backgroundColor: '#fd8f09'
  },
  modeText: {
    fontFamily: 'Inter-SemiBold',
    color: '#666',
    fontSize: 16
  },
  modeTextActive: {
    color: '#fff'
  },
  content: {
    flex: 1,
    padding: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 16,
    marginTop: 24
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginBottom: 24
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24
  },
  timeButton: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center'
  },
  timeButtonActive: {
    backgroundColor: '#fd8f09'
  },
  timeText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4
  },
  timeTextActive: {
    color: '#fff'
  },
  timeValue: {
    color: '#666',
    fontFamily: 'Inter-Regular',
    fontSize: 14
  },
  timeValueActive: {
    color: '#fff'
  },
  setsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24
  },
  setsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center'
  },
  setsValue: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    minWidth: 40,
    textAlign: 'center'
  },
  timerContainer: {
    marginTop: 20
  }
});
