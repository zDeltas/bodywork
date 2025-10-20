import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  TrendingUp,
  Calendar
} from 'lucide-react-native';
import useHaptics from '@/app/hooks/useHaptics';
import { Routine, RoutineStats } from '@/types/common';
import Modal from '@/app/components/ui/Modal';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useRoutineSchedule } from '@/app/hooks/useRoutineSchedule';
import routineScheduleService from '@/app/services/routineSchedule';
import { DayOfWeek } from '@/types/common';

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
  const { getScheduleByRoutineId } = useRoutineSchedule();
  const schedule = getScheduleByRoutineId(item.id);
  const scaleAnim = useState(new Animated.Value(0))[0];

  // Animation d'entrée
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true
    }).start();
  }, []);

  const getDayShortLabel = (day: DayOfWeek) => {
    switch (day) {
      case 'monday': return t('schedule.days.mondayShort');
      case 'tuesday': return t('schedule.days.tuesdayShort');
      case 'wednesday': return t('schedule.days.wednesdayShort');
      case 'thursday': return t('schedule.days.thursdayShort');
      case 'friday': return t('schedule.days.fridayShort');
      case 'saturday': return t('schedule.days.saturdayShort');
      case 'sunday': return t('schedule.days.sundayShort');
    }
  };

  const renderScheduledDays = () => {
    if (!schedule || !schedule.isActive || schedule.scheduledDays.length === 0) return null;
    const ordered = [...schedule.scheduledDays].sort(
      (a, b) => routineScheduleService.getDayNumber(a) - routineScheduleService.getDayNumber(b)
    );
    const label = ordered.map((d) => getDayShortLabel(d)).join(', ');
    return (
      <View style={styles.scheduledRow}>
        <Calendar size={16} color={theme.colors.text.secondary} />
        <Text style={styles.scheduledText}>{label}</Text>
      </View>
    );
  };

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
      <Animated.View
        style={[styles.routineCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.routineHeader}>
          <View style={styles.routineTitleContainer}>
            <Text style={styles.routineTitle}>{item.title}</Text>
          </View>
          <TouchableOpacity onPress={() => onToggleFavorite(item.id)} activeOpacity={0.7}>
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

        {renderScheduledDays()}

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
              activeOpacity={0.7}
            >
              <MoreVertical size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => onStart(item.id)}
              activeOpacity={0.7}
            >
              <Play size={20} color={theme.colors.text.primary} />
              <Text style={styles.startButtonText}>{t('routines.item.start')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <Modal
        visible={showActionsModal}
        onClose={() => setShowActionsModal(false)}
        title={item.title}
      >
        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.modalAction}
            onPress={() => handleAction(() => onEdit(item.id))}
            activeOpacity={0.7}
          >
            <Edit size={24} color={theme.colors.text.primary} />
            <Text style={styles.modalActionText}>{t('routines.item.edit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalAction}
            onPress={() => handleAction(() => onShare(item))}
            activeOpacity={0.7}
          >
            <ShareIcon size={24} color={theme.colors.text.primary} />
            <Text style={styles.modalActionText}>{t('routines.item.share')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalAction, styles.modalActionDelete]}
            onPress={() => handleAction(() => onDelete(item.id))}
            activeOpacity={0.7}
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
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  routineTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  routineTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary
  },
  routineDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm
  },
  routineStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md
  },
  scheduledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start'
  },
  scheduledText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text.primary
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2
  },
  statText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary
  },
  routineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default
  },
  routineDate: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.tertiary
  },
  routineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.button,
    alignItems: 'center',
    justifyContent: 'center'
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
    ...theme.shadows.sm
  },
  startButtonText: {
    color: theme.colors.text.onPrimary,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.semiBold
  },
  modalActions: {
    gap: theme.spacing.md
  },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.button,
    gap: theme.spacing.md
  },
  modalActionDelete: {
    backgroundColor: theme.colors.error + '15'
  },
  modalActionText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text.primary
  },
  modalActionTextDelete: {
    color: theme.colors.error
  }
});

export default RoutineItem; 
