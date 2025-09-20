import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import { Exercise, Series } from '@/types/common';
import SeriesCard from '@/app/components/session/atoms/SeriesCard';

export type CurrentSeriesProps = {
  exercise: Exercise;
  currentSeries: Series;
  currentSeriesIndex: number;
};

const CurrentSeries = React.memo<CurrentSeriesProps>(({ exercise, currentSeries, currentSeriesIndex }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);

  const formatPrimaryValue = (unitType: string, series: any) => {
    switch (unitType) {
      case 'repsAndWeight':
      case 'reps':
        return `${series.reps || 0} ${t('workout.reps')}`;
      case 'time': {
        const dur = series.duration || 0;
        const mm = Math.floor(dur / 60);
        const ss = (dur % 60).toString().padStart(2, '0');
        return `${mm}:${ss}`;
      }
      case 'distance':
        return `${series.distance} m`;
      default:
        return `${series.reps || 0} ${t('workout.reps')}`;
    }
  };

  const primary = formatPrimaryValue(currentSeries.unitType, currentSeries);
  const showWeight = currentSeries.unitType === 'repsAndWeight';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('workout.currentSeries') || 'Série en cours'}</Text>

      <SeriesCard indexNumber={currentSeriesIndex + 1} series={currentSeries} />
    </View>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  badge: {
    width: 34,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.input,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border.default,
  },
  badgeText: {
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  cardContent: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
  },
  weightChip: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  chipText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  primaryText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  restRow: {
    marginTop: 4,
  },
  restText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
});

CurrentSeries.displayName = 'CurrentSeries';

export default CurrentSeries;
