import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { TimerPickerModal as RNTimerPickerModal } from 'react-native-timer-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import useHaptics from '@/app/hooks/useHaptics';

const createModalStyles = (theme: any) => StyleSheet.create({
  modal: {
    backgroundColor: theme.colors.background.card,
  },
  pickerContainer: {
    backgroundColor: theme.colors.background.card
  },
  pickerItem: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize['3xl']
  },
  pickerLabel: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.xl,
    right: -20
  },
  pickerLabelContainer: {
    width: 60
  },
  pickerItemContainer: {
    width: 150
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  }
});

export interface TimeDuration {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface TimerPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (pickedDuration: TimeDuration) => void;
  modalTitle: string;
  hideHours?: boolean;
  minuteLabel?: string;
  secondLabel?: string;
  hourLabel?: string;
  closeOnOverlayPress?: boolean;
  padWithNItems?: number;
}

const TimerPickerModal: React.FC<TimerPickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  modalTitle,
  hideHours = true,
  minuteLabel = 'min',
  secondLabel = 'sec',
  hourLabel = 'h',
  closeOnOverlayPress = true,
  padWithNItems = 1
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const haptics = useHaptics();

  const handleConfirm = useCallback((pickedDuration: TimeDuration) => {
    onConfirm(pickedDuration);
    onClose();
  }, [onConfirm, onClose]);

  const styles = useMemo(() => createModalStyles(theme), [theme]);

  return (
    <RNTimerPickerModal
      visible={visible}
      setIsVisible={onClose}
      onCancel={onClose}
      onConfirm={handleConfirm}
      cancelButtonText={String(t('common.cancel'))}
      confirmButtonText={String(t('common.save'))}
      closeOnOverlayPress={closeOnOverlayPress}
      modalTitle={modalTitle}
      styles={{
        backgroundColor: styles.modal.backgroundColor,
        pickerContainer: styles.pickerContainer,
        pickerItem: styles.pickerItem,
        pickerLabel: styles.pickerLabel,
        theme: 'dark' as const,
        pickerLabelContainer: styles.pickerLabelContainer,
        pickerItemContainer: styles.pickerItemContainer,
        confirmButton: styles.confirmButton
      }}
      hideHours={hideHours}
      padWithNItems={padWithNItems}
      minuteLabel={minuteLabel}
      secondLabel={secondLabel}
      hourLabel={hourLabel}
      LinearGradient={LinearGradient}
      Haptics={haptics}
    />
  );
};

export default TimerPickerModal;
