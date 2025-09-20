import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useExerciseData } from '@/app/hooks/useExerciseData';
import Text from '@/app/components/ui/Text';
import { Exercise, Routine } from '@/types/common';
import SeriesCard from '@/app/components/session/atoms/SeriesCard';
import ExerciseImage from '@/app/components/session/atoms/ExerciseImage';
import ExerciseInfo from '@/app/components/session/atoms/ExerciseInfo';

export type UpcomingSectionProps = {
  routine: Routine;
  currentExerciseIndex: number;
  currentSeriesIndex: number;
};

const UpcomingSection: React.FC<UpcomingSectionProps> = ({ 
  routine, 
  currentExerciseIndex, 
  currentSeriesIndex 
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);

  const currentExercise = routine.exercises[currentExerciseIndex];
  
  // Prochaines séries de l'exercice en cours (toutes les séries restantes)
  const upcomingSeries = currentExercise.series.slice(currentSeriesIndex + 1);
  
  // Prochains exercices (tous les exercices restants)
  const upcomingExercises = routine.exercises.slice(currentExerciseIndex + 1);
  

  // Fonction pour formater une série selon son type d'unité
  // Composant pour afficher un prochain exercice simplifié
  const UpcomingExerciseCard = ({ exercise }: { exercise: Exercise }) => {
    const { exerciseImage, musclesText } = useExerciseData(exercise);
    const seriesCount = exercise.series.length;
    
    return (
      <View style={styles.upcomingExerciseCard}>
        <View style={styles.exerciseContent}>
          {/* Image non agrandissable */}
          <View style={styles.exerciseImageContainer}>
            <Image
              source={exerciseImage}
              style={styles.exerciseImage}
              resizeMode="contain"
            />
          </View>
          
          {/* Informations de l'exercice */}
          <View style={styles.exerciseDetails}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            {!!musclesText && (
              <Text style={styles.musclesText}>{musclesText}</Text>
            )}
            
            {/* Nombre de séries simplifié */}
            <Text style={styles.seriesCount}>
              {seriesCount} {seriesCount > 1 ? 'séries' : 'série'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Prochaines séries de l'exercice en cours */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('workout.nextSeries')}</Text>
        {upcomingSeries.length > 0 ? (
          <View style={styles.list}>
            {upcomingSeries.map((series, idx) => {
              const absoluteIndex = currentSeriesIndex + idx + 2;
              return (
                <SeriesCard key={idx} indexNumber={absoluteIndex} series={series} />
              );
            })}
          </View>
        ) : (
          <View style={styles.completionCard}>
            <Text style={styles.completionTitle}>{t('workout.almostDone')}</Text>
            <Text style={styles.completionText}>{t('workout.lastSeriesMessage')}</Text>
          </View>
        )}
      </View>

      {/* Prochains exercices - Affichage toujours visible */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('workout.upcomingExercises')}</Text>
        {upcomingExercises.length > 0 ? (
          <View style={styles.exercisesList}>
            {upcomingExercises.map((exercise, idx) => (
              <UpcomingExerciseCard 
                key={idx} 
                exercise={exercise}
              />
            ))}
          </View>
        ) : (
          <View style={styles.noUpcomingCard}>
            <Text style={styles.noUpcomingText}>
              {currentExerciseIndex === routine.exercises.length - 1 
                ? t('workout.lastExerciseMessage')
                : t('workout.noMoreExercises')
              }
            </Text>
          </View>
        )}
      </View>

    </View>
  );
};

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    marginTop: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  list: {
    gap: theme.spacing.sm,
  },
  exercisesList: {
    gap: theme.spacing.md,
  },
  upcomingExerciseCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  exerciseImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.background.input,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  exerciseImage: {
    width: '90%',
    height: '90%',
  },
  exerciseDetails: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  exerciseName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  musclesText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.xs,
  },
  seriesCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  completionCard: {
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  completionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  noUpcomingCard: {
    backgroundColor: theme.colors.background.input,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  noUpcomingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default UpcomingSection;
