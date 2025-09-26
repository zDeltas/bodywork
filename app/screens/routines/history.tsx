import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Header from '@/app/components/layout/Header';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { storageService } from '@/app/services/storage';
import { Routine, RoutineSession } from '@/types/common';
import { WorkoutDateUtils } from '@/types/workout';
import { Timer, ClipboardList, Dumbbell, FileText, ActivitySquare } from 'lucide-react-native';

const useStyles = () => {
  const { theme } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main
    },
    content: {
      padding: theme.spacing.lg,
      paddingBottom: 100
    },
    section: {
      marginBottom: theme.spacing.xl
    },
    dateTitle: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm
    },
    card: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      ...theme.shadows.sm
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm
    },
    rowIcon: {
      marginRight: theme.spacing.sm
    },
    label: {
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text.secondary,
      marginRight: theme.spacing.sm
    },
    value: {
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.primary
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap'
    },
    chip: {
      backgroundColor: theme.colors.background.button,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs
    },
    chipText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.semiBold
    },
    exerciseItem: {
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default
    },
    exerciseItemText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs
    },
    sectionHeaderText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold
    }
  });
};

const secondsToReadable = (sec: number, t: (k: any) => string): string => {
  if (sec <= 0) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
};

export default function RoutineHistoryScreen() {
  const { theme } = useTheme();
  const styles = useStyles();
  const { t, language } = useTranslation();
  const params = useLocalSearchParams<{ routineId: string; title?: string }>();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [sessions, setSessions] = useState<RoutineSession[]>([]);

  const loadData = useCallback(async () => {
    const [routines, storedSessions] = await Promise.all([
      storageService.getRoutines(),
      storageService.getRoutineSessionsByRoutineId(params.routineId)
    ]);
    const r = routines.find((x: Routine) => x.id === params.routineId) || null;
    setRoutine(r);
    setSessions(storedSessions || []);
  }, [params.routineId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <View style={styles.container}>
      <Header title={params.title || routine?.title || t('routineHistory.title')} showBackButton />
      <ScrollView contentContainerStyle={styles.content}>
        {sessions.length > 0 && sessions.map((s) => {
          const exercises = s.exercises || [];
          const muscles = (s.muscles || []).map(m => t(`muscleGroups.${m}` as any));
          const notes = s.notes || [];
          const durations = s.totals;

          return (
            <View key={s.id} style={styles.section}>
              <Text style={styles.dateTitle}>
                {WorkoutDateUtils.formatForDisplay((s.date || new Date().toISOString()), language)}
              </Text>
              <View style={styles.card}>
                <View style={styles.row}>
                  <ClipboardList size={20} color={theme.colors.text.secondary} style={styles.rowIcon} />
                  <Text style={styles.label}>{t('routineHistory.summary')}:</Text>
                  <Text style={styles.value}>{s.exerciseCount} {t('routineHistory.exercises')}</Text>
                </View>
                <View style={styles.row}>
                  <Timer size={20} color={theme.colors.text.secondary} style={styles.rowIcon} />
                  <Text style={styles.label}>{t('routineHistory.preparation')}:</Text>
                  <Text style={styles.value}>{secondsToReadable(durations.prepSeconds, t)}</Text>
                </View>
                <View style={styles.row}>
                  <Timer size={20} color={theme.colors.text.secondary} style={styles.rowIcon} />
                  <Text style={styles.label}>{t('routineHistory.rest')}:</Text>
                  <Text style={styles.value}>{secondsToReadable(durations.restSeriesSeconds + durations.restBetweenExercisesSeconds, t)}</Text>
                </View>
                <View style={styles.row}>
                  <Timer size={20} color={theme.colors.text.secondary} style={styles.rowIcon} />
                  <Text style={styles.label}>{t('routineHistory.work')}:</Text>
                  <Text style={styles.value}>{secondsToReadable(durations.workSeconds, t)}</Text>
                </View>

                <View style={styles.sectionHeader}>
                  <ActivitySquare size={18} color={theme.colors.text.secondary} style={styles.rowIcon} />
                  <Text style={styles.sectionHeaderText}>{t('routineHistory.muscles')}</Text>
                </View>
                <View style={styles.chipRow}>
                  {muscles.map(m => (
                    <View key={m} style={styles.chip}><Text style={styles.chipText}>{m}</Text></View>
                  ))}
                </View>

                <View style={styles.sectionHeader}>
                  <Dumbbell size={18} color={theme.colors.text.secondary} style={styles.rowIcon} />
                  <Text style={styles.sectionHeaderText}>{t('routineHistory.exerciseList')}</Text>
                </View>
                {exercises.map(ex => (
                  <TouchableOpacity
                    key={ex.id}
                    style={styles.exerciseItem}
                    onPress={() => router.push({ pathname: '/screens/ExerciseDetails', params: { exercise: ex.exercise } })}
                  >
                    <Text style={styles.exerciseItemText}>{t(ex.exercise as any)}</Text>
                  </TouchableOpacity>
                ))}

                {notes.length > 0 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <FileText size={18} color={theme.colors.text.secondary} style={styles.rowIcon} />
                      <Text style={styles.sectionHeaderText}>{t('routineHistory.notes')}</Text>
                    </View>
                    {notes.map((n, idx) => (
                      <Text key={`${s.id}-note-${idx}`} style={{ color: theme.colors.text.secondary, marginBottom: 4 }}>{n}</Text>
                    ))}
                  </>
                )}
              </View>
            </View>
          );
        })}

        {sessions.length === 0 && (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.text.secondary }}>{t('routineHistory.noHistory')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
