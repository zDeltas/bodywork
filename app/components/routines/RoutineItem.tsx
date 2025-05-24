import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Clock,
  Dumbbell,
  Edit,
  MoreVertical,
  Play,
  Share as ShareIcon,
  Star,
  Trash2,
  TrendingUp
} from 'lucide-react-native';
import { useHaptics } from '@/src/hooks/useHaptics';
import { Routine, RoutineStats } from '@/types/common';
import Modal from '@/app/components/ui/Modal';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';

type RoutineItemProps = {
  item: Routine;
  onStart: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onShare: (routine: Routine) => void;
};

const calculateStats = (routine: Routine): RoutineStats => {
  const totalSeries = routine.exercises.reduce((total, exercise) => total + exercise.series.length, 0);
  const estimatedTime = Math.ceil(routine.exercises.reduce((total, exercise) => {
    return total + exercise.series.reduce((seriesTotal, series) => {
      if (!series.rest) return seriesTotal;
      const [minutes, seconds] = series.rest.split(':').map(Number);
      return seriesTotal + (minutes * 60 + seconds);
    }, 0);
  }, 0) / 60);

  return {
    totalExercises: routine.exercises.length,
    totalSeries,
    estimatedTime
  };
};

const RoutineItem = React.memo(({
                                  item,
                                  onStart,
                                  onEdit,
                                  onDelete,
                                  onToggleFavorite,
                                  onShare
                                }: RoutineItemProps) => {
  const [showActionsModal, setShowActionsModal] = useState(false);
  const haptics = useHaptics();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);
  const stats = calculateStats(item);

  const handleAction = (action: () => void) => {
    setShowActionsModal(false);
    action();
  };

  const renderStats = () => {
    const statsArray = [
      {
        icon: <Dumbbell size={16} color={theme.colors.text.secondary} />,
        text: `${stats.totalExercises} ${stats.totalExercises > 1 ? t('routines.item.exercises') : t('routines.item.exercise')}`
      },
      {
        icon: <Clock size={16} color={theme.colors.text.secondary} />,
        text: `${stats.estimatedTime} ${t('routines.item.minutes')}`
      },
      {
        icon: <Text style={styles.statText}>{stats.totalSeries} {t('routines.item.series')}</Text>
      }
    ];

    if (item.usageCount) {
      statsArray.push({
        icon: <TrendingUp size={16} color={theme.colors.text.secondary} />,
        text: `${item.usageCount} ${item.usageCount > 1 ? t('routines.item.usages') : t('routines.item.usage')}`
      });
    }

    if (item.totalTime) {
      const hours = Math.floor(item.totalTime / 60);
      const minutes = item.totalTime % 60;
      statsArray.push({
        icon: <Clock size={16} color={theme.colors.text.secondary} />,
        text: hours > 0
          ? `${hours}${t('routines.item.hours')}${minutes > 0 ? ` ${minutes}${t('routines.item.minutes')}` : ''}`
          : `${minutes}${t('routines.item.minutes')}`
      });
    }

    return statsArray;
  };

  return (
    <>
      <TouchableOpacity
        onLongPress={() => haptics.impactMedium()}
        delayLongPress={200}
        style={styles.routineCard}
      >
        <View style={styles.routineHeader}>
          <View style={styles.routineTitleContainer}>
            <Text style={styles.routineTitle}>{item.title}</Text>
          </View>
          <TouchableOpacity onPress={() => onToggleFavorite(item.id)}>
            <Star
              size={20}
              color={item.favorite ? theme.colors.primary : theme.colors.text.secondary}
              fill={item.favorite ? theme.colors.primary : 'none'}
            />
          </TouchableOpacity>
        </View>

        {item.description && (
          <Text style={styles.routineDescription}>{item.description}</Text>
        )}

        <View style={styles.routineStats}>
          {renderStats().map((stat, index) => (
            <View key={index} style={styles.statItem}>
              {stat.icon}
              {stat.text && <Text style={styles.statText}>{stat.text}</Text>}
            </View>
          ))}
        </View>

        <View style={styles.routineFooter}>
          <Text style={styles.routineDate}>
            {item.lastUsed
              ? `${t('routines.item.lastUsed')} ${format(new Date(item.lastUsed), 'dd MMM yyyy', { locale: fr })}`
              : `${t('routines.item.createdOn')} ${format(new Date(item.createdAt), 'dd MMM yyyy', { locale: fr })}`}
          </Text>
          <View style={styles.routineActions}>
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => {
                haptics.impactLight();
                setShowActionsModal(true);
              }}
            >
              <MoreVertical size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => onStart(item.id)}
            >
              <Play size={20} color={theme.colors.text.primary} />
              <Text style={styles.startButtonText}>{t('routines.item.start')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showActionsModal}
        onClose={() => setShowActionsModal(false)}
        title={t('routines.item.actions')}
      >
        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.modalAction}
            onPress={() => handleAction(() => onEdit(item.id))}
          >
            <Edit size={24} color={theme.colors.text.primary} />
            <Text style={styles.modalActionText}>{t('routines.item.edit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalAction}
            onPress={() => handleAction(() => onShare(item))}
          >
            <ShareIcon size={24} color={theme.colors.text.primary} />
            <Text style={styles.modalActionText}>{t('routines.item.share')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalAction, styles.modalActionDelete]}
            onPress={() => handleAction(() => onDelete(item.id))}
          >
            <Trash2 size={24} color={theme.colors.error} />
            <Text style={[styles.modalActionText, styles.modalActionTextDelete]}>
              {t('routines.item.delete')}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  routineCard: {
    backgroundColor: theme.colors.background.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...theme.shadows.sm
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  routineTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary
  },
  routineDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 12
  },
  routineStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statText: {
    fontSize: 14,
    color: theme.colors.text.secondary
  },
  routineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  routineDate: {
    fontSize: 12,
    color: theme.colors.text.secondary
  },
  routineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  moreButton: {
    padding: 8
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs
  },
  startButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600'
  },
  modalActions: {
    gap: 16
  },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.background.button,
    gap: 12
  },
  modalActionDelete: {
    backgroundColor: theme.colors.error + '20'
  },
  modalActionText: {
    fontSize: 16,
    color: theme.colors.text.primary
  },
  modalActionTextDelete: {
    color: theme.colors.error
  }
});

export default RoutineItem; 
