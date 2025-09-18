import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Clock, Minus, Plus, Settings, Timer as TimerIcon } from 'lucide-react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import TimerPickerModal from '@/app/components/timer/TimerPickerModal';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '../components/ui/Text';
import Header from '@/app/components/layout/Header';
import Timer from '@/app/components/timer/Timer';
import TimerSettings from '@/app/components/timer/TimerSettings';
import useHaptics from "@/app/hooks/useHaptics"

SplashScreen.preventAutoHideAsync();


function TimerScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const haptics = useHaptics();
  const styles = useStyles(theme);
  const [mode, setMode] = useState<'timer' | 'stopwatch'>('timer');
  const [selectedTime, setSelectedTime] = useState(60);
  const [selectedRestTime, setSelectedRestTime] = useState(60);
  const [selectedPrepTime, setSelectedPrepTime] = useState(10);
  const [sets, setSets] = useState(1);
  const [showCustomTimeModal, setShowCustomTimeModal] = useState(false);
  const [showCustomRestTimeModal, setShowCustomRestTimeModal] = useState(false);
  const [showCustomPrepTimeModal, setShowCustomPrepTimeModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleTimerComplete = () => {
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
  };

  const handleCustomRestTimeSave = (pickedDuration: {
    hours: number;
    minutes: number;
    seconds: number;
  }) => {
    const totalSeconds =
      pickedDuration.hours * 3600 + pickedDuration.minutes * 60 + pickedDuration.seconds;
    setSelectedRestTime(totalSeconds);
  };

  const handleCustomPrepTimeSave = (pickedDuration: {
    hours: number;
    minutes: number;
    seconds: number;
  }) => {
    const totalSeconds =
      pickedDuration.hours * 3600 + pickedDuration.minutes * 60 + pickedDuration.seconds;
    setSelectedPrepTime(totalSeconds);
  };

  return (
    <View style={styles.container}>
      <Header
        title={String(t('timer.title'))}
        showBackButton={false}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={() => {
                setShowSettings(true);
                haptics.impactMedium();
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 8
              }}
            >
              <Settings size={18} color={theme.colors.background.main} />
            </TouchableOpacity>
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
          </View>
        }
      />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {mode === 'timer' && (
          <>
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
            prepTime={selectedPrepTime}
          />
        </View>
      </ScrollView>

      <TimerSettings
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        prepTime={selectedPrepTime}
        workTime={selectedTime}
        restTime={selectedRestTime}
        sets={sets}
        onChangePrep={setSelectedPrepTime}
        onChangeWork={setSelectedTime}
        onChangeRest={setSelectedRestTime}
        onChangeSets={setSets}
      />

      <TimerPickerModal
        visible={showCustomTimeModal}
        onClose={() => setShowCustomTimeModal(false)}
        onConfirm={handleCustomTimeSave}
        modalTitle={String(t('timer.workTime'))}
      />

      <TimerPickerModal
        visible={showCustomRestTimeModal}
        onClose={() => setShowCustomRestTimeModal(false)}
        onConfirm={handleCustomRestTimeSave}
        modalTitle={String(t('timer.restTime'))}
      />

      <TimerPickerModal
        visible={showCustomPrepTimeModal}
        onClose={() => setShowCustomPrepTimeModal(false)}
        onConfirm={handleCustomPrepTimeSave}
        modalTitle={'Préparation'}
      />
    </View>
  );
}

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
    }
  });
};

export default TimerScreen;
