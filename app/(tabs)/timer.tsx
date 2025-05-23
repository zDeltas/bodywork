import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Clock, Minus, Plus, Timer as TimerIcon } from 'lucide-react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { TimerPickerModal } from 'react-native-timer-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { TranslationKey } from '@/translations';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '../components/ui/Text';
import Header from '@/app/components/layout/Header';
import Timer from '@/app/components/timer/Timer';
import FloatButtonAction from '@/app/components/ui/FloatButtonAction';
import { useRouter } from 'expo-router';
import { useHaptics } from '@/src/hooks/useHaptics';

SplashScreen.preventAutoHideAsync();

const WORKOUT_TIMES = {
  'timer.quick': 30,
  'timer.standard': 60,
  'timer.long': 90,
  'timer.veryLong': 120
};

// Define styles using the current theme
const useStyles = (theme: any) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main
    },
    header: {
      paddingTop: theme.spacing.xl * 2,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.background.card
    },
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary
    },
    modeSelector: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background.button,
      borderRadius: theme.borderRadius.full,
      padding: theme.spacing.xs
    },
    modeButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 44
    },
    modeButtonActive: {
      backgroundColor: theme.colors.primary
    },
    modeText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary
    },
    modeTextActive: {
      color: theme.colors.text.primary
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xl * 2
    },
    timerContainer: {
      width: '100%',
      paddingHorizontal: 20
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.lg
    },
    timeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg
    },
    timeButton: {
      width: '48%',
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      alignItems: 'center',
      ...theme.shadows.sm
    },
    timeButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      borderWidth: 2
    },
    timeText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary
    },
    timeTextActive: {
      color: theme.colors.text.primary,
      fontWeight: 'bold'
    },
    timeValue: {
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text.primary
    },
    timeValueActive: {
      color: theme.colors.text.primary
    },
    customTimeButton: {
      width: '48%',
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      alignItems: 'center',
      ...theme.shadows.sm
    },
    customTimeButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      borderWidth: 2
    },
    customTimeText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary
    },
    customTimeTextActive: {
      color: theme.colors.text.primary
    },
    input: {
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base
    },
    setsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      marginBottom: 24,
      width: '100%'
    },
    setsButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background.card,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4
        },
        android: {
          elevation: 2
        }
      })
    },
    setsValue: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      minWidth: 30,
      textAlign: 'center'
    },
    startButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      ...theme.shadows.md
    },
    startButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.lg
    }
  });
};

export default function TimerScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const haptics = useHaptics();
  const styles = useStyles(theme);
  const [mode, setMode] = useState<'timer' | 'stopwatch'>('timer');
  const [selectedTime, setSelectedTime] = useState(60);
  const [selectedRestTime, setSelectedRestTime] = useState(60);
  const [sets, setSets] = useState(1);
  const [exerciseName, setExerciseName] = useState('');
  const [showCustomTimeModal, setShowCustomTimeModal] = useState(false);
  const [showCustomRestTimeModal, setShowCustomRestTimeModal] = useState(false);
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [isCustomRestTime, setIsCustomRestTime] = useState(false);
  const router = useRouter();

  const handleTimerComplete = () => {
    // Vous pouvez ajouter une notification ou un son ici
    setShowCustomRestTimeModal(false);
  };

  const handleCustomTimeSave = (pickedDuration: {
    hours: number;
    minutes: number;
    seconds: number;
  }) => {
    const totalSeconds =
      pickedDuration.hours * 3600 + pickedDuration.minutes * 60 + pickedDuration.seconds;
    setSelectedTime(totalSeconds);
    setIsCustomTime(true);
    setShowCustomTimeModal(false);
  };

  const handleCustomRestTimeSave = (pickedDuration: {
    hours: number;
    minutes: number;
    seconds: number;
  }) => {
    const totalSeconds =
      pickedDuration.hours * 3600 + pickedDuration.minutes * 60 + pickedDuration.seconds;
    setSelectedRestTime(totalSeconds);
    setIsCustomRestTime(true);
    setShowCustomRestTimeModal(false);
  };

  return (
    <View style={styles.container}>
      <Header
        title={String(t('timer.title'))}
        showBackButton={false}
        rightComponent={
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'timer' && styles.modeButtonActive]}
              onPress={() => setMode('timer')}
            >
              <TimerIcon
                size={20}
                color={mode === 'timer' ? theme.colors.text.primary : theme.colors.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'stopwatch' && styles.modeButtonActive]}
              onPress={() => setMode('stopwatch')}
            >
              <Clock
                size={20}
                color={
                  mode === 'stopwatch' ? theme.colors.text.primary : theme.colors.text.secondary
                }
              />
            </TouchableOpacity>
          </View>
        }
      />

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

            <Text style={styles.sectionTitle}>{String(t('timer.workTime'))}</Text>
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
                    {typeof t(key as TranslationKey) === 'string'
                      ? String(t(key as TranslationKey))
                      : key}
                  </Text>
                  <Text
                    style={[
                      styles.timeValue,
                      selectedTime === time && !isCustomTime && styles.timeValueActive
                    ]}
                  >
                    {time < 60 ? `${time}s` : `${Math.floor(time / 60)}m ${time % 60}s`}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.timeButton, isCustomTime && styles.timeButtonActive]}
                onPress={() => setShowCustomTimeModal(true)}
              >
                <Text style={[styles.timeText, isCustomTime && styles.timeTextActive]}>
                  {String(t('common.custom'))}
                </Text>
                <Text style={[styles.timeValue, isCustomTime && styles.timeValueActive]}>
                  {selectedTime < 60
                    ? `${selectedTime}s`
                    : `${Math.floor(selectedTime / 60)}m ${selectedTime % 60}s`}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>{String(t('timer.restTime'))}</Text>
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
                    {typeof t(key as TranslationKey) === 'string'
                      ? String(t(key as TranslationKey))
                      : key}
                  </Text>
                  <Text
                    style={[
                      styles.timeValue,
                      selectedRestTime === time && !isCustomRestTime && styles.timeValueActive
                    ]}
                  >
                    {time < 60 ? `${time}s` : `${Math.floor(time / 60)}m ${time % 60}s`}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.timeButton, isCustomRestTime && styles.timeButtonActive]}
                onPress={() => setShowCustomRestTimeModal(true)}
              >
                <Text style={[styles.timeText, isCustomRestTime && styles.timeTextActive]}>
                  {String(t('common.custom'))}
                </Text>
                <Text style={[styles.timeValue, isCustomRestTime && styles.timeValueActive]}>
                  {selectedRestTime < 60
                    ? `${selectedRestTime}s`
                    : `${Math.floor(selectedRestTime / 60)}m ${selectedRestTime % 60}s`}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>{String(t('timer.series'))}</Text>
            <View style={styles.setsContainer}>
              <TouchableOpacity
                style={[styles.setsButton, { opacity: sets <= 1 ? 0.5 : 1 }]}
                onPress={() => setSets((prev) => Math.max(1, prev - 1))}
                disabled={sets <= 1}
              >
                <Minus size={20} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.setsValue}>{sets}</Text>
              <TouchableOpacity
                style={styles.setsButton}
                onPress={() => setSets((prev) => prev + 1)}
              >
                <Plus size={20} color={theme.colors.text.primary} />
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
            onSetsChange={setSets}
            exerciseName={exerciseName || String(t('timer.exercise'))}
          />
        </View>
      </ScrollView>

      <TimerPickerModal
        visible={showCustomTimeModal}
        setIsVisible={setShowCustomTimeModal}
        onCancel={() => setShowCustomTimeModal(false)}
        onConfirm={handleCustomTimeSave}
        cancelButtonText={String(t('common.cancel'))}
        confirmButtonText={String(t('common.save'))}
        closeOnOverlayPress={true}
        modalTitle={String(t('timer.workTime'))}
        styles={{
          backgroundColor: theme.colors.background.card,
          pickerContainer: {
            backgroundColor: theme.colors.background.card
          },
          pickerItem: {
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize['3xl']
          },
          pickerLabel: {
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize.xl,
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
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary
          }
        }}
        hideHours={true}
        padWithNItems={1}
        minuteLabel="min"
        secondLabel="sec"
        LinearGradient={LinearGradient}
        Haptics={haptics}
      />

      <TimerPickerModal
        visible={showCustomRestTimeModal}
        setIsVisible={setShowCustomRestTimeModal}
        onCancel={() => setShowCustomRestTimeModal(false)}
        onConfirm={handleCustomRestTimeSave}
        cancelButtonText={String(t('common.cancel'))}
        confirmButtonText={String(t('common.save'))}
        closeOnOverlayPress={true}
        modalTitle={String(t('timer.restTime'))}
        styles={{
          backgroundColor: theme.colors.background.card,
          pickerContainer: {
            backgroundColor: theme.colors.background.card
          },
          pickerItem: {
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize['3xl']
          },
          pickerLabel: {
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize.xl,
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
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary
          }
        }}
        hideHours={true}
        padWithNItems={1}
        minuteLabel="min"
        secondLabel="sec"
        LinearGradient={LinearGradient}
        Haptics={haptics}
      />
      <FloatButtonAction
        icon={<Plus size={24} color={theme.colors.background.main} />}
        onPress={() => router.push('/screens/workout/new')}
      />
    </View>
  );
}
