import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Clock, ChevronRight, Dumbbell, Zap, Activity } from 'lucide-react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

interface LastSessionCardProps {
  date: string;
  duration: number; // en minutes
  muscleGroups: string[];
  totalVolume: number;
  onPress?: () => void;
}

const LastSessionCard: React.FC<LastSessionCardProps> = React.memo(({
  date,
  duration,
  muscleGroups,
  totalVolume,
  onPress
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  const formatDate = React.useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }, []);

  const formatDuration = React.useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  }, []);

  // Icônes pour les groupes musculaires
  const getMuscleIcon = (muscle: string) => {
    const muscleLower = muscle.toLowerCase();
    const iconColor = theme.colors.primary;
    const iconSize = 14;
    
    if (muscleLower.includes('chest') || muscleLower.includes('pectoraux')) {
      return <Dumbbell size={iconSize} color={iconColor} />;
    }
    if (muscleLower.includes('back') || muscleLower.includes('dos')) {
      return <Zap size={iconSize} color={iconColor} />;
    }
    if (muscleLower.includes('leg') || muscleLower.includes('jambe')) {
      return <Activity size={iconSize} color={iconColor} />;
    }
    if (muscleLower.includes('shoulder') || muscleLower.includes('épaule')) {
      return <Dumbbell size={iconSize} color={iconColor} />;
    }
    if (muscleLower.includes('arm') || muscleLower.includes('bras')) {
      return <Dumbbell size={iconSize} color={iconColor} />;
    }
    if (muscleLower.includes('core') || muscleLower.includes('abdominauxin')) {
      return <Zap size={iconSize} color={iconColor} />;
    }
    
    return <Dumbbell size={iconSize} color={iconColor} />;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text variant="subheading" style={styles.title}>
          {t('home.lastSession')}
        </Text>
        <ChevronRight size={20} color={theme.colors.text.secondary} />
      </View>
      
      <View style={styles.content}>
        {/* Date et durée */}
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTime}>
            <Calendar size={16} color={theme.colors.text.secondary} />
            <Text variant="caption" style={styles.dateText}>
              {formatDate(date)}
            </Text>
          </View>
          <View style={styles.dateTime}>
            <Clock size={16} color={theme.colors.text.secondary} />
            <Text variant="caption" style={styles.durationText}>
              {formatDuration(duration)}
            </Text>
          </View>
        </View>
        
        {/* Groupes musculaires */}
        <View style={styles.muscleGroupsContainer}>
          <Text variant="caption" style={styles.muscleLabel}>
            {t('home.muscleGroups')}
          </Text>
          <View style={styles.muscleGroups}>
            {muscleGroups.slice(0, 3).map((muscle, index) => (
              <View key={index} style={styles.muscleGroup}>
                {getMuscleIcon(muscle)}
                <Text variant="caption" style={styles.muscleText}>
                  {muscle}
                </Text>
              </View>
            ))}
            {muscleGroups.length > 3 && (
              <Text variant="caption" style={styles.moreText}>
                +{muscleGroups.length - 3}
              </Text>
            )}
          </View>
        </View>
        
        {/* Volume total */}
        <View style={styles.volumeContainer}>
          <Text variant="caption" style={styles.volumeLabel}>
            {t('home.volume')}
          </Text>
          <Text variant="body" style={styles.volumeValue}>
            {totalVolume}kg
          </Text>
        </View>
        
        {/* Bouton voir détails */}
        <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
          <Text variant="caption" style={styles.detailsText}>
            {t('home.seeDetails')}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background.card,
      borderRadius: 16,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    content: {
      gap: theme.spacing.md,
    },
    dateTimeContainer: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
    },
    dateTime: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    dateText: {
      color: theme.colors.text.secondary,
    },
    durationText: {
      color: theme.colors.text.secondary,
    },
    muscleGroupsContainer: {
      gap: theme.spacing.xs,
    },
    muscleLabel: {
      color: theme.colors.text.secondary,
      fontWeight: '500',
    },
    muscleGroups: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      flexWrap: 'wrap',
    },
    muscleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.background.input,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: 12,
    },
    muscleText: {
      color: theme.colors.text.primary,
      fontSize: 12,
    },
    moreText: {
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
    },
    volumeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    volumeLabel: {
      color: theme.colors.text.secondary,
      fontWeight: '500',
    },
    volumeValue: {
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    detailsButton: {
      alignSelf: 'flex-start',
      paddingVertical: theme.spacing.xs,
    },
    detailsText: {
      color: '#4CC9F0',
      fontWeight: '500',
    },
  });
};

LastSessionCard.displayName = 'LastSessionCard';

export default React.memo(LastSessionCard);
