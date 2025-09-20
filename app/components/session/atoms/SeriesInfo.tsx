import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Repeat, Clock, Dumbbell, Ruler } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import { Series } from '@/types/common';

export interface SeriesInfoProps {
  series: Series;
  showWeight?: boolean;
}

const SeriesInfo = React.memo<SeriesInfoProps>(({
  series,
  showWeight = false
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);

  const formatPrimary = () => {
    switch (series.unitType) {
      case 'reps':
      case 'repsAndWeight':
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

  return (
    <View style={styles.container}>
      <View style={styles.inline}>
        <Repeat size={16} color={theme.colors.primary} />
        <Text style={styles.primaryText}>{formatPrimary()}</Text>
      </View>

      {showWeight && (
        <View style={styles.weightChip}>
          <Dumbbell size={14} color={theme.colors.primary} />
          <Text style={styles.chipText}>{series.weight} kg</Text>
        </View>
      )}

      {!!series.rest && (
        <View style={styles.restInfo}>
          <Clock size={14} color={theme.colors.text.secondary} />
          <Text style={styles.restText}>{series.rest} {t('workout.restShort') || 'rest'}</Text>
        </View>
      )}
    </View>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  primaryText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text.primary
  },
  weightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10'
  },
  chipText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary
  },
  restInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto'
  },
  restText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm
  }
});

SeriesInfo.displayName = 'SeriesInfo';

export default SeriesInfo;
