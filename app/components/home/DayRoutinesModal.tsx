import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Clock, Play, X } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { router } from 'expo-router';
import Text from '@/app/components/ui/Text';
import Modal from '@/app/components/ui/Modal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface DayRoutineData {
  id: string;
  name: string;
  mainMuscleGroup: string;
  estimatedDuration: number;
  isCompleted: boolean;
  isMissed: boolean;
}

export interface DayRoutinesModalProps {
  visible: boolean;
  onClose: () => void;
  date: string; // YYYY-MM-DD format
  routines: DayRoutineData[];
}

const DayRoutinesModal: React.FC<DayRoutinesModalProps> = ({
  visible,
  onClose,
  date,
  routines
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return format(date, 'EEEE d MMMM', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const handleStartRoutine = (routineId: string) => {
    onClose();
    router.push(`/screens/workout/session?routineId=${routineId}`);
  };

  const getStatusIcon = (routine: DayRoutineData) => {
    if (routine.isCompleted) return '✅';
    if (routine.isMissed) return '❌';
    return '⚪';
  };

  const getStatusColor = (routine: DayRoutineData) => {
    if (routine.isCompleted) return theme.colors.success;
    if (routine.isMissed) return theme.colors.error;
    return theme.colors.text.secondary;
  };

  const totalDuration = routines.reduce((sum, routine) => sum + routine.estimatedDuration, 0);
  const completedCount = routines.filter(r => r.isCompleted).length;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={formatDate(date)}
    >
      <View style={styles.container}>
        {/* Résumé du jour */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t('home.weeklyRoutines.progress')}:
            </Text>
            <Text style={styles.summaryValue}>
              {completedCount}/{routines.length} {t('common.exercises')}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Clock size={16} color={theme.colors.text.secondary} />
            <Text style={styles.summaryValue}>
              {totalDuration} min {t('home.dailyRoutine.estimatedDuration')}
            </Text>
          </View>
        </View>

        {/* Liste des routines */}
        <View style={styles.routinesList}>
          {routines.map((routine, index) => (
            <View key={routine.id} style={styles.routineItem}>
              <View style={styles.routineHeader}>
                <View style={styles.routineInfo}>
                  <Text style={styles.statusIcon}>
                    {getStatusIcon(routine)}
                  </Text>
                  <View style={styles.routineDetails}>
                    <Text 
                      style={[
                        styles.routineName,
                        { color: getStatusColor(routine) }
                      ]}
                    >
                      {routine.name}
                    </Text>
                    <Text style={styles.routineMeta}>
                      {routine.mainMuscleGroup} • {routine.estimatedDuration} min
                    </Text>
                  </View>
                </View>
                
                {!routine.isCompleted && (
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => handleStartRoutine(routine.id)}
                    activeOpacity={0.7}
                  >
                    <Play size={16} color="white" fill="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Message selon l'état */}
        <View style={styles.messageContainer}>
          {routines.length === 0 ? (
            <Text style={styles.restMessage}>
              {t('home.weeklyRoutines.restDay')}
            </Text>
          ) : completedCount === routines.length ? (
            <Text style={styles.completedMessage}>
              🎉 {t('home.dailyRoutine.allCompleted')}
            </Text>
          ) : (
            <Text style={styles.motivationMessage}>
              {completedCount === 0 
                ? t('home.dailyRoutine.motivationalReady')
                : `${routines.length - completedCount} routine${routines.length - completedCount > 1 ? 's' : ''} restante${routines.length - completedCount > 1 ? 's' : ''} 💪`
              }
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      gap: theme.spacing.lg
    },
    summaryContainer: {
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      gap: theme.spacing.sm
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm
    },
    summaryLabel: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium
    },
    summaryValue: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      flex: 1
    },
    routinesList: {
      gap: theme.spacing.md
    },
    routineItem: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.background.input
    },
    routineHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    routineInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.md
    },
    statusIcon: {
      fontSize: 20
    },
    routineDetails: {
      flex: 1
    },
    routineName: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.semiBold,
      marginBottom: 2
    },
    routineMeta: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm
    },
    playButton: {
      backgroundColor: '#4CC9F0',
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm
    },
    messageContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.md
    },
    restMessage: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.md,
      fontStyle: 'italic',
      textAlign: 'center'
    },
    completedMessage: {
      color: theme.colors.success,
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.semiBold,
      textAlign: 'center'
    },
    motivationMessage: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.md,
      textAlign: 'center'
    }
  });
};

DayRoutinesModal.displayName = 'DayRoutinesModal';

export default React.memo(DayRoutinesModal);
