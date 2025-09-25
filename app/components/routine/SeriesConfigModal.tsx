import React, { useState, useCallback, useMemo } from 'react';
import { Modal, ScrollView, View, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { X, ChevronDown, Plus, FileText } from 'lucide-react-native';
import Text from '@/app/components/ui/Text';
import Button from '@/app/components/ui/Button';
import TimerPickerModal from '@/app/components/timer/TimerPickerModal';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { EditableSeries } from '@/types/common';
import { formatRestTime, formatDuration } from '@/app/utils/routineUtils';

import UnitTypeSelector from './UnitTypeSelector';
import SeriesTypeSelector from './SeriesTypeSelector';
import SeriesInput from './SeriesInput';
import RestTimeSelector from './RestTimeSelector';
import LoadToggle from './LoadToggle';

interface SeriesConfigModalProps {
  visible: boolean;
  exerciseName: string;
  series: EditableSeries[];
  globalUnitType: 'repsAndWeight' | 'reps' | 'time' | 'distance';
  globalSeriesType: 'warmUp' | 'workingSet';
  withLoad: boolean;
  globalRest: string;
  exerciseNote: string;
  exerciseRest: string;
  exerciseRestMode: 'beginner' | 'advanced';
  onClose: () => void;
  onExerciseSelect: () => void;
  onSeriesAdd: () => void;
  onSeriesRemove: (index: number) => void;
  onSeriesCopy: (index: number) => void;
  onSeriesUpdate: (index: number, field: keyof EditableSeries, value: string) => void;
  onGlobalUnitTypeChange: (type: 'repsAndWeight' | 'reps' | 'time' | 'distance') => void;
  onGlobalSeriesTypeChange: (type: 'warmUp' | 'workingSet') => void;
  onWithLoadToggle: () => void;
  onGlobalRestChange: (rest: string) => void;
  onExerciseNoteChange: (note: string) => void;
  onExerciseRestChange: (rest: string) => void;
  onSave: () => void;
  canSave: boolean;
}

const SeriesConfigModal: React.FC<SeriesConfigModalProps> = React.memo(({
  visible,
  exerciseName,
  series,
  globalUnitType,
  globalSeriesType,
  withLoad,
  globalRest,
  exerciseNote,
  exerciseRest,
  exerciseRestMode,
  onClose,
  onExerciseSelect,
  onSeriesAdd,
  onSeriesRemove,
  onSeriesCopy,
  onSeriesUpdate,
  onGlobalUnitTypeChange,
  onGlobalSeriesTypeChange,
  onWithLoadToggle,
  onGlobalRestChange,
  onExerciseNoteChange,
  onExerciseRestChange,
  onSave,
  canSave
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);

  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState<number | null>(null);

  const handleTimerConfirm = useCallback(({ minutes, seconds }: { minutes: number; seconds: number }) => {
    const formatted = formatRestTime(minutes, seconds);
    onGlobalRestChange(formatted);
    setShowTimerPicker(false);
  }, [onGlobalRestChange]);

  const handleDurationConfirm = useCallback(({ minutes, seconds }: { minutes: number; seconds: number }) => {
    if (currentSeriesIndex !== null) {
      const formattedDuration = formatDuration(minutes, seconds);
      onSeriesUpdate(currentSeriesIndex, 'duration', formattedDuration);
    }
    setShowDurationPicker(false);
    setCurrentSeriesIndex(null);
  }, [currentSeriesIndex, onSeriesUpdate]);

  const handleDurationPress = useCallback((index: number) => {
    setCurrentSeriesIndex(index);
    setShowDurationPicker(true);
  }, []);

  const handleSeriesUpdate = useCallback((index: number) => (field: keyof EditableSeries, value: string) => {
    onSeriesUpdate(index, field, value);
  }, [onSeriesUpdate]);

  const handleSeriesCopy = useCallback((index: number) => () => {
    onSeriesCopy(index);
  }, [onSeriesCopy]);

  const handleSeriesRemove = useCallback((index: number) => () => {
    onSeriesRemove(index);
  }, [onSeriesRemove]);

  const seriesElements = useMemo(() => {
    return series.map((item, index) => (
      <SeriesInput
        key={index}
        series={item}
        index={index}
        showLabels={index === 0}
        withLoad={withLoad && (globalUnitType === 'time' || globalUnitType === 'distance')}
        onUpdate={handleSeriesUpdate(index)}
        onCopy={handleSeriesCopy(index)}
        onRemove={handleSeriesRemove(index)}
        onDurationPress={globalUnitType === 'time' ? () => handleDurationPress(index) : undefined}
        canRemove={!(index === 0 && series.length === 1)}
      />
    ));
  }, [series, withLoad, globalUnitType, handleSeriesUpdate, handleSeriesCopy, handleSeriesRemove, handleDurationPress]);

  const showLoadToggle = globalUnitType === 'time' || globalUnitType === 'distance';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text variant="heading">{t('routine.configureSeries')}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.exerciseButton}
            onPress={onExerciseSelect}
          >
            <Text
              variant="body"
              style={[
                styles.exerciseButtonText,
                !exerciseName && { color: theme.colors.text.secondary }
              ]}
            >
              {exerciseName || t('stats.selectExercise')}
            </Text>
            <ChevronDown color={theme.colors.text.secondary} size={20} />
          </TouchableOpacity>

          <ScrollView style={{ flex: 1 }}>
            <View style={styles.configContainer}>
              <SeriesTypeSelector
                selectedType={globalSeriesType}
                onTypeChange={onGlobalSeriesTypeChange}
              />

              <UnitTypeSelector
                selectedType={globalUnitType}
                onTypeChange={onGlobalUnitTypeChange}
              />

              {showLoadToggle && (
                <LoadToggle
                  withLoad={withLoad}
                  onToggle={onWithLoadToggle}
                />
              )}

              <RestTimeSelector
                restTime={globalRest}
                onPress={() => setShowTimerPicker(true)}
              />

              <View style={styles.noteContainer}>
                <View style={styles.titleContainer}>
                  <FileText color={theme.colors.text.secondary} size={22} style={styles.titleIcon} />
                  <Text variant="body" style={styles.noteLabel}>
                    {t('common.note')}
                  </Text>
                </View>
                <TextInput
                  style={styles.noteInput}
                  value={exerciseNote}
                  onChangeText={onExerciseNoteChange}
                  placeholder={t('routine.optionalNote')}
                  placeholderTextColor={theme.colors.text.secondary}
                  multiline
                />
              </View>
            </View>

            <View style={styles.seriesSection}>
              <View style={styles.titleContainer}>
                <Plus color={theme.colors.text.secondary} size={22} style={styles.titleIcon} />
                <Text variant="body" style={styles.titleLabel}>
                  {t('workout.series')}
                </Text>
              </View>
              {seriesElements}
            </View>

            <TouchableOpacity
              style={styles.addSeriesButton}
              onPress={onSeriesAdd}
            >
              <View style={styles.addSeriesContent}>
                <Plus size={20} color={theme.colors.text.primary} />
                <Text style={styles.addSeriesText}>{t('workout.addSeries')}</Text>
              </View>
            </TouchableOpacity>

            <Button
              onPress={onSave}
              style={styles.saveButton}
              disabled={!canSave}
            >
              <Text style={{ color: theme.colors.text.primary }}>{t('common.save')}</Text>
            </Button>
          </ScrollView>
        </View>
      </View>

      <TimerPickerModal
        visible={showTimerPicker}
        onClose={() => setShowTimerPicker(false)}
        onConfirm={handleTimerConfirm}
        modalTitle={t('routine.selectRestTime')}
        hideHours
      />

      <TimerPickerModal
        visible={showDurationPicker}
        onClose={() => setShowDurationPicker(false)}
        onConfirm={handleDurationConfirm}
        modalTitle={t('routine.selectDuration')}
        hideHours
      />
    </Modal>
  );
});

SeriesConfigModal.displayName = 'SeriesConfigModal';

const useStyles = (theme: any) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    flex: 1,
    backgroundColor: theme.colors.background.card,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    ...theme.shadows.lg
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg
  },
  exerciseButton: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  exerciseButtonText: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
    flex: 1,
    marginLeft: theme.spacing.sm
  },
  configContainer: {
    marginBottom: theme.spacing.lg
  },
  noteContainer: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  titleIcon: {
    marginRight: theme.spacing.sm
  },
  titleLabel: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.base
  },
  noteLabel: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.base
  },
  seriesSection: {
    marginBottom: theme.spacing.lg
  },
  noteInput: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing.base,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
    marginBottom: theme.spacing.base,
    fontSize: theme.typography.fontSize.base,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  addSeriesButton: {
    marginTop: theme.spacing.base,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder
  },
  addSeriesContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  addSeriesText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    marginVertical: theme.spacing.lg,
    paddingVertical: theme.spacing.base
  },
  // Exercise Rest Configuration Styles
  exerciseRestContainer: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.background.input,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default
  },
  exerciseRestLabel: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.base,
    marginBottom: theme.spacing.sm
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    backgroundColor: theme.colors.background.main,
    color: theme.colors.text.primary,
    textAlign: 'center'
  },
  timeUnit: {
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.medium
  }
});

export default SeriesConfigModal;
