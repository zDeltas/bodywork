import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Timer from '../components/Timer';
import { Minus, Plus } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { TimerPickerModal } from 'react-native-timer-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { TranslationKey } from '@/translations';
import theme, { colors, typography, spacing, borderRadius } from '@/app/theme/theme';

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

  const handleTimerComplete = () => {
    // Vous pouvez ajouter une notification ou un son ici
    setShowCustomRestTimeModal(false);
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

  return (
    <View style={styles.container}>
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
                <Minus color={colors.text.primary} size={24} />
              </TouchableOpacity>
              <Text style={styles.setsValue}>{sets}</Text>
              <TouchableOpacity
                style={styles.setsButton}
                onPress={() => setSets(prev => prev + 1)}
              >
                <Plus color={colors.text.primary} size={24} />
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
          backgroundColor: colors.background.card,
          pickerContainer: {
            backgroundColor: colors.background.card,
          },
          pickerItem: {
            color: colors.text.primary,
            fontSize: typography.fontSize['3xl'],
          },
          pickerLabel: {
            color: colors.text.primary,
            fontSize: typography.fontSize.xl,
            right: -20,
          },
          theme: 'dark',
          pickerLabelContainer: {
            width: 60,
          },
          pickerItemContainer: {
            width: 150,
          },
          confirmButton: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          },
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
          backgroundColor: colors.background.card,
          pickerContainer: {
            backgroundColor: colors.background.card,
          },
          pickerItem: {
            color: colors.text.primary,
            fontSize: typography.fontSize['3xl'],
          },
          pickerLabel: {
            color: colors.text.primary,
            fontSize: typography.fontSize.xl,
            right: -20,
          },
          theme: 'dark',
          pickerLabelContainer: {
            width: 60,
          },
          pickerItemContainer: {
            width: 150,
          },
          confirmButton: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          },
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
    backgroundColor: colors.background.main,
  },
  header: {
    paddingTop: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background.card,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background.button,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeText: {
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
  },
  modeTextActive: {
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.base,
    marginTop: spacing.xl,
  },
  input: {
    backgroundColor: colors.background.input,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    marginBottom: spacing.xl,
    fontSize: typography.fontSize.base,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  timeButton: {
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  timeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.xs,
  },
  timeTextActive: {
    color: colors.text.primary,
  },
  timeValue: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
  timeValueActive: {
    color: colors.text.primary,
  },
  setsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  setsButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setsValue: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  timerContainer: {
    marginTop: spacing.lg,
  },
});
