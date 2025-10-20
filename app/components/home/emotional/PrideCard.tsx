import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Medal, Clock, Dumbbell, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import BaseCard from '@/app/components/home/BaseCard';

interface PrideCardProps {
  date: string;
  duration: number;
  totalVolume: number;
  muscleGroups: string[];
  personalRecord?: boolean;
  onPress?: () => void;
}

const PrideCard: React.FC<PrideCardProps> = ({
  date,
  duration,
  totalVolume,
  muscleGroups,
  personalRecord = false,
  onPress
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getPrideMessage = () => {
    if (personalRecord) {
      return t('home.emotional.pride.record');
    } else if (totalVolume > 5000) {
      return t('home.emotional.pride.exceptional');
    } else if (totalVolume > 3000) {
      return t('home.emotional.pride.strong');
    } else if (totalVolume > 1500) {
      return t('home.emotional.pride.solid');
    } else {
      return t('home.emotional.pride.progress');
    }
  };

  const getPerformanceLevel = () => {
    if (personalRecord) return 'record';
    if (totalVolume > 5000) return 'exceptional';
    if (totalVolume > 3000) return 'strong';
    if (totalVolume > 1500) return 'solid';
    return 'building';
  };

  const performanceColor = {
    record: theme.colors.success,
    exceptional: theme.colors.primary,
    strong: '#4CC9F0',
    solid: theme.colors.warning,
    building: theme.colors.secondary
  }[getPerformanceLevel()];

  return (
    <BaseCard
      title={t('home.emotional.lastPerformance')}
      icon={<Medal size={24} color={performanceColor} />}
      headerRight={personalRecord ? <TrendingUp size={20} color={theme.colors.success} /> : undefined}
      onPress={onPress}
    >
      <View style={styles.dateContainer}>
        <Text variant="caption" style={styles.dateText}>
          {new Date(date).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Clock size={16} color={theme.colors.text.secondary} />
          <Text variant="caption" style={styles.statText}>
            {formatDuration(duration)}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Dumbbell size={16} color={theme.colors.text.secondary} />
          <Text variant="caption" style={styles.statText}>
            {totalVolume.toLocaleString()} kg
          </Text>
        </View>
      </View>

      <View style={styles.muscleContainer}>
        <Text variant="caption" style={styles.muscleLabel}>
          {t('home.emotional.musclesWorked')}:
        </Text>
        <Text variant="caption" style={styles.muscleText}>
          {muscleGroups.join(' • ')}
        </Text>
      </View>

      <View style={styles.prideSection}>
        <Text variant="body" style={[styles.prideMessage, { color: performanceColor }]}>
          {getPrideMessage()}
        </Text>
        
        <View style={[styles.prideBadge, { backgroundColor: performanceColor + '20' }]}>
          <Text variant="caption" style={[styles.prideText, { color: performanceColor }]}>
            {t(`home.emotional.performance.${getPerformanceLevel()}`)}
          </Text>
        </View>
      </View>

      {personalRecord && (
        <View style={styles.recordBanner}>
          <Text variant="caption" style={styles.recordText}>
            {t('home.emotional.newRecord')}
          </Text>
        </View>
      )}
    </BaseCard>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    dateContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    dateText: {
      color: theme.colors.text.secondary,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statText: {
      marginLeft: theme.spacing.xs,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
    },
    muscleContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    muscleLabel: {
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    muscleText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
    },
    prideSection: {
      alignItems: 'center',
    },
    prideMessage: {
      textAlign: 'center',
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.md,
      marginBottom: theme.spacing.sm,
    },
    prideBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
    },
    prideText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    recordBanner: {
      position: 'absolute',
      top: -8,
      right: theme.spacing.md,
      backgroundColor: theme.colors.success,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
    },
    recordText: {
      color: 'white',
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: 12,
    },
  });
};

export default React.memo(PrideCard);
