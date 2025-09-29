import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { VictoryLabel, VictoryPie } from 'victory-native';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/app/components/layout/Header';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { storageService } from '@/app/services/storage';
import { Routine, RoutineSession } from '@/types/common';
import { WorkoutDateUtils } from '@/types/workout';
import { Calendar, ChevronLeft, ChevronRight, Clock, Dumbbell, FileText, ActivitySquare, Target } from 'lucide-react-native';
import { getExerciseImage } from '@/app/components/exercises';
import MuscleMap from '@/app/components/muscles/MuscleMap';

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
    },
    navigationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm
    },
    navButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.input
    },
    navButtonDisabled: {
      backgroundColor: theme.colors.background.disabled
    },
    sessionCounter: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center'
    },
    sessionCounterText: {
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.xs
    },
    // Nouveaux styles pour la carte améliorée
    sessionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.base,
      paddingHorizontal: theme.spacing.xs
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1
    },
    sessionDate: {
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.sm,
      fontWeight: '600'
    },
    durationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.input,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    durationText: {
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.xs,
      fontWeight: '500'
    },
    summarySection: {
      marginBottom: theme.spacing.lg
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.base
    },
    summaryTitle: {
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.sm,
      fontWeight: '600'
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between'
    },
    statItem: {
      width: '48%',
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.base,
      marginBottom: theme.spacing.sm,
      alignItems: 'center',
      ...theme.shadows.xs
    },
    statItemWide: {
      width: '48%'
    },
    statIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.background.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
      ...theme.shadows.xs
    },
    statLabel: {
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs
    },
    statValue: {
      color: theme.colors.text.primary,
      fontWeight: '600',
      textAlign: 'center'
    },
    musclesSection: {
      marginBottom: theme.spacing.lg
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.base
    },
    sectionTitle: {
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.sm,
      fontWeight: '600'
    },
    muscleGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs
    },
    muscleChip: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.primary + '20'
    },
    muscleText: {
      color: theme.colors.primary,
      fontWeight: '500'
    },
    exercisesSection: {
      marginBottom: theme.spacing.lg
    },
    exercisesList: {
      gap: theme.spacing.xs
    },
    exerciseCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
    },
    exerciseThumbWrapper: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      backgroundColor: theme.colors.background.card,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      marginRight: theme.spacing.base
    },
    exerciseThumb: {
      width: '100%',
      height: '100%'
    },
    exerciseInfo: {
      flex: 1
    },
    exerciseName: {
      color: theme.colors.text.primary,
      fontWeight: '500',
      marginBottom: theme.spacing.xs
    },
    exerciseDetails: {
      color: theme.colors.text.secondary
    },
    notesSection: {
      marginBottom: theme.spacing.base
    },
    notesContainer: {
      gap: theme.spacing.sm
    },
    noteItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.base,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary
    },
    noteBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
      marginTop: 6,
      marginRight: theme.spacing.sm
    },
    noteText: {
      color: theme.colors.text.primary,
      flex: 1,
      lineHeight: 20
    },
    // Styles supplémentaires pour les améliorations UI/UX
    exerciseMetrics: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xs
    },
    metricBadge: {
      backgroundColor: theme.colors.background.card,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    metricText: {
      color: theme.colors.text.secondary,
      fontSize: 11,
      fontWeight: '500'
    },
    exerciseArrow: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.background.card,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.xs
    },
    noteIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
      marginTop: 2
    },
    // Styles pour la section des temps d'entraînement avec Donut
    timingSection: {
      marginBottom: theme.spacing.lg
    },
    donutContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    legendContainer: {
      flex: 1,
      marginLeft: theme.spacing.lg,
      gap: theme.spacing.base,
      minWidth: 120
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: theme.spacing.sm
    },
    legendText: {
      flex: 1,
      minWidth: 80
    },
    legendLabel: {
      color: theme.colors.text.secondary,
      marginBottom: 2
    },
    legendValue: {
      fontWeight: '600'
    }
  });
};

const secondsToReadable = (sec: number, t: (k: any) => string): string => {
  if (sec <= 0) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
};

const getTotalDuration = (durations: any): number => {
  return (durations.prepSeconds || 0) + (durations.workSeconds || 0) +
    (durations.restSeriesSeconds || 0) + (durations.restBetweenExercisesSeconds || 0);
};

const formatTotalDuration = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return '0s';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

// Composant Donut Chart pour les temps d'entraînement utilisant VictoryPie
const TimeDonutChart: React.FC<{
  prepTime: number;
  workTime: number;
  restTime: number;
  theme: any;
  t: (key: string) => string;
}> = ({ prepTime, workTime, restTime, theme, t }) => {
  const total = prepTime + workTime + restTime;
  if (total === 0) return null;

  // Préparation des données pour VictoryPie
  const timeData = [
    {
      name: 'Préparation',
      value: Math.round((prepTime / total) * 100),
      seconds: prepTime,
      color: theme.colors.info
    },
    {
      name: 'Exécution',
      value: Math.round((workTime / total) * 100),
      seconds: workTime,
      color: theme.colors.success
    },
    {
      name: 'Repos',
      value: Math.round((restTime / total) * 100),
      seconds: restTime,
      color: theme.colors.warning
    }
  ].filter(item => item.seconds > 0); // Filtrer les temps à 0

  return (
    <View style={{ alignItems: 'center', position: 'relative' }}>
      <VictoryPie
        data={timeData}
        x="name"
        y="value"
        colorScale={timeData.map(item => item.color)}
        width={200}
        height={200}
        innerRadius={60}
        padAngle={2}
        style={{
          data: {
            fillOpacity: 0.9,
            stroke: theme.colors.background.card,
            strokeWidth: 2
          }
        }}
        labelComponent={<VictoryLabel style={{ display: 'none' }} />}
      />

      {/* Durée totale au centre */}
      <View style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -40 }, { translateY: -20 }],
        alignItems: 'center',
        width: 80
      }}>
        <Text variant="subheading" style={{
          color: theme.colors.text.primary,
          fontWeight: '700',
          textAlign: 'center'
        }}>
          {formatTotalDuration(total)}
        </Text>
        <Text variant="caption" style={{
          color: theme.colors.text.secondary,
          textAlign: 'center'
        }}>
          Total
        </Text>
      </View>
    </View>
  );
};

export default function RoutineHistoryScreen() {
  const { theme } = useTheme();
  const styles = useStyles();
  const { t, language } = useTranslation();
  const params = useLocalSearchParams<{ routineId: string; title?: string; sessionDate?: string }>();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [allSessions, setAllSessions] = useState<RoutineSession[]>([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);

  const loadData = useCallback(async () => {
    const [routines, storedSessions] = await Promise.all([
      storageService.getRoutines(),
      storageService.getRoutineSessionsByRoutineId(params.routineId)
    ]);
    const r = routines.find((x: Routine) => x.id === params.routineId) || null;
    setRoutine(r);

    // Trier les sessions par date (plus récente en premier)
    const sortedSessions = (storedSessions || []).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setAllSessions(sortedSessions);

    // Si une date de session spécifique est fournie, trouver l'index correspondant
    if (params.sessionDate && sortedSessions.length > 0) {
      const sessionIndex = sortedSessions.findIndex(session =>
        WorkoutDateUtils.getDatePart(session.date) === WorkoutDateUtils.getDatePart(params.sessionDate!)
      );
      setCurrentSessionIndex(sessionIndex >= 0 ? sessionIndex : 0);
    } else {
      setCurrentSessionIndex(0);
    }
  }, [params.routineId, params.sessionDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <View style={styles.container}>
      <Header title={params.title || routine?.title || t('routineHistory.title')} showBackButton />
      <ScrollView contentContainerStyle={styles.content}>
        {allSessions.length > 0 && (
          <>
            {/* Navigation entre sessions */}
            {allSessions.length > 1 && (
              <View style={styles.navigationContainer}>
                <TouchableOpacity
                  style={[styles.navButton, currentSessionIndex === 0 && styles.navButtonDisabled]}
                  onPress={() => setCurrentSessionIndex(Math.max(0, currentSessionIndex - 1))}
                  disabled={currentSessionIndex === 0}
                >
                  <ChevronLeft size={20}
                               color={currentSessionIndex === 0 ? theme.colors.text.disabled : theme.colors.primary} />
                </TouchableOpacity>

                <View style={styles.sessionCounter}>
                  <Calendar size={16} color={theme.colors.text.secondary} />
                  <Text variant="body" style={styles.sessionCounterText}>
                    Session {currentSessionIndex + 1} / {allSessions.length}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.navButton, currentSessionIndex === allSessions.length - 1 && styles.navButtonDisabled]}
                  onPress={() => setCurrentSessionIndex(Math.min(allSessions.length - 1, currentSessionIndex + 1))}
                  disabled={currentSessionIndex === allSessions.length - 1}
                >
                  <ChevronRight size={20}
                                color={currentSessionIndex === allSessions.length - 1 ? theme.colors.text.disabled : theme.colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            {/* Affichage de la session courante */}
            {(() => {
              const s = allSessions[currentSessionIndex];
              const exercises = s.exercises || [];
              const muscles = (s.muscles || []).map(m => t(`muscleGroups.${m}` as any));
              const notes = s.notes || [];
              const durations = s.totals;

              return (
                <View key={s.id} style={styles.section}>
                  {/* En-tête avec date */}
                  <View style={styles.sessionHeader}>
                    <View style={styles.dateContainer}>
                      <Calendar size={20} color={theme.colors.primary} />
                      <Text variant="heading" style={styles.sessionDate}>
                        {WorkoutDateUtils.formatForDisplay((s.date || new Date().toISOString()), language)}
                      </Text>
                    </View>

                  </View>

                  <View style={styles.card}>
                    {/* Résumé de l'entraînement */}
                    <View style={styles.summarySection}>
                      <View style={styles.summaryHeader}>
                        <Target size={18} color={theme.colors.primary} />
                        <Text variant="subheading" style={styles.summaryTitle}>
                          {t('routineHistory.summary')}
                        </Text>
                      </View>

                      <View style={styles.statsGrid}>
                        <View style={[styles.statItem, styles.statItemWide, {
                          backgroundColor: theme.colors.primary + '10',
                          borderColor: theme.colors.primary + '20',
                          borderWidth: 1
                        }]}>
                          <View style={[styles.statIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                            <Dumbbell size={16} color={theme.colors.primary} />
                          </View>
                          <Text variant="caption" style={styles.statLabel}>Exercices</Text>
                          <Text variant="subheading"
                                style={[styles.statValue, { color: theme.colors.primary }]}>{s.exerciseCount}</Text>
                        </View>

                        <View style={[styles.statItem, styles.statItemWide, {
                          backgroundColor: theme.colors.success + '10',
                          borderColor: theme.colors.success + '20',
                          borderWidth: 1
                        }]}>
                          <View style={[styles.statIcon, { backgroundColor: theme.colors.success + '15' }]}>
                            <Target size={16} color={theme.colors.success} />
                          </View>
                          <Text variant="caption" style={styles.statLabel}>Muscles</Text>
                          <Text variant="subheading"
                                style={[styles.statValue, { color: theme.colors.success }]}>{muscles.length}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Détail des temps d'entraînement avec Donut Chart */}
                    <View style={styles.timingSection}>
                      <View style={styles.sectionHeader}>
                        <Clock size={18} color={theme.colors.primary} />
                        <Text variant="subheading" style={styles.sectionTitle}>
                          Temps d'entraînement
                        </Text>
                      </View>

                      <View style={styles.donutContainer}>
                        {/* Donut Chart */}
                        <TimeDonutChart
                          prepTime={durations.prepSeconds}
                          workTime={durations.workSeconds}
                          restTime={durations.restSeriesSeconds + durations.restBetweenExercisesSeconds}
                          theme={theme}
                          t={t}
                        />

                        {/* Légende */}
                        <View style={styles.legendContainer}>
                          <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: theme.colors.info }]} />
                            <View style={styles.legendText}>
                              <Text variant="caption" style={styles.legendLabel}>Préparation</Text>
                              <Text variant="body" style={[styles.legendValue, { color: theme.colors.info }]}>
                                {secondsToReadable(durations.prepSeconds, t)}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
                            <View style={styles.legendText}>
                              <Text variant="caption" style={styles.legendLabel}>Exécution</Text>
                              <Text variant="body" style={[styles.legendValue, { color: theme.colors.success }]}>
                                {secondsToReadable(durations.workSeconds, t)}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
                            <View style={styles.legendText}>
                              <Text variant="caption" style={styles.legendLabel}>Repos</Text>
                              <Text variant="body" style={[styles.legendValue, { color: theme.colors.warning }]}>
                                {secondsToReadable(durations.restSeriesSeconds + durations.restBetweenExercisesSeconds, t)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* (Section décalée en bas après la liste des exercices) */}

                    {/* Liste des exercices */}
                    {exercises.length > 0 && (
                      <View style={styles.exercisesSection}>
                        <View style={styles.sectionHeader}>
                          <Dumbbell size={18} color={theme.colors.primary} />
                          <Text variant="subheading" style={styles.sectionTitle}>
                            {t('routineHistory.exerciseList')} ({exercises.length})
                          </Text>
                        </View>
                        <View style={styles.exercisesList}>
                          {exercises.map((ex, index) => (
                            <TouchableOpacity
                              key={ex.id}
                              style={[
                                styles.exerciseCard,
                              ]}
                              activeOpacity={0.8}
                              onPress={() => router.push({
                                pathname: '/screens/ExerciseDetails',
                                params: { exercise: ex.exercise }
                              })}
                            >
                              <View style={styles.exerciseThumbWrapper}>
                                <Image
                                  source={getExerciseImage(ex.exercise)}
                                  style={styles.exerciseThumb}
                                  resizeMode="contain"
                                />
                              </View>
                              <View style={styles.exerciseInfo}>
                                <Text variant="body" style={styles.exerciseName}>{t(ex.exercise as any)}</Text>
                                {ex.sets && (
                                  <View style={styles.exerciseMetrics}>
                                    <View style={styles.metricBadge}>
                                      <Text variant="caption" style={styles.metricText}>{ex.sets} séries</Text>
                                    </View>
                                    <View style={styles.metricBadge}>
                                      <Text variant="caption" style={styles.metricText}>{ex.reps || '—'} reps</Text>
                                    </View>
                                  </View>
                                )}
                              </View>
                              <View style={styles.exerciseArrow}>
                                <ChevronRight size={16} color={theme.colors.primary} />
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Notes */}
                    {notes.length > 0 && (
                      <View style={styles.notesSection}>
                        <View style={styles.sectionHeader}>
                          <FileText size={18} color={theme.colors.primary} />
                          <Text variant="subheading" style={styles.sectionTitle}>
                            {t('routineHistory.notes')} ({notes.length})
                          </Text>
                        </View>
                        <View style={styles.notesContainer}>
                          {notes.map((note, idx) => (
                            <View key={`${s.id}-note-${idx}`} style={[
                              styles.noteItem,
                              {
                                backgroundColor: theme.colors.background.input,
                                ...theme.shadows.xs
                              }
                            ]}>
                              <View style={[
                                styles.noteIcon,
                                { backgroundColor: theme.colors.primary + '15' }
                              ]}>
                                <FileText size={12} color={theme.colors.primary} />
                              </View>
                              <Text variant="body" style={styles.noteText}>{note}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Muscles travaillés sur cette routine (placé en fin de carte) */}
                    {s.exercises && s.exercises.length > 0 && (
                      <View style={styles.musclesSection}>
                        <View style={styles.sectionHeader}>
                          <ActivitySquare size={18} color={theme.colors.primary} />
                          <Text variant="subheading" style={styles.sectionTitle}>
                            Muscles travaillés sur cette routine
                          </Text>
                        </View>
                        <MuscleMap workouts={s.exercises} />
                      </View>
                    )}
                  </View>
                </View>
              );
            })()}
          </>
        )}

        {allSessions.length === 0 && (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.text.secondary }}>{t('routineHistory.noHistory')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
