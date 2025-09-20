import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Clock, Dumbbell, Repeat } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import { Series } from '@/types/common';

export type SeriesCardProps = {
  indexNumber: number;
  series: Series;
};

const SeriesCard: React.FC<SeriesCardProps> = ({ indexNumber, series }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);

  const formatPrimaryValue = (unitType: string, s: any) => {
    switch (unitType) {
      case 'repsAndWeight':
      case 'reps':
        return `${s.reps || 0} ${t('workout.reps')}`;
      case 'time': {
        const dur = s.duration || 0;
        const mm = Math.floor(dur / 60);
        const ss = (dur % 60).toString().padStart(2, '0');
        return `${mm}:${ss}`;
      }
      case 'distance':
        return `${s.distance} m`;
      default:
        return `${s.reps || 0} ${t('workout.reps')}`;
    }
  };

  const primary = formatPrimaryValue(series.unitType as any, series);
  const showWeight = series.unitType === 'repsAndWeight';

  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{indexNumber}</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <View style={styles.inline}>
            <Repeat size={16} color={theme.colors.primary} />
            <Text style={styles.primaryText}>{primary}</Text>
          </View>
          {showWeight && (
            <View style={[styles.chip, styles.weightChip]}>
              <Dumbbell size={14} color={theme.colors.primary} />
              <Text style={styles.chipText}>{series.weight} kg</Text>
            </View>
          )}
        </View>
        {!!series.rest && (
          <View style={[styles.inline, styles.restRow]}>
            <Clock size={14} color={theme.colors.text.secondary} />
            <Text style={styles.restText}>{series.rest} {t('workout.restShort') || 'rest'}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const useStyles = (theme: any) => StyleSheet.create({
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

export default SeriesCard;
