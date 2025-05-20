import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useHaptics } from '@/src/hooks/useHaptics';
import Text from '@/app/components/ui/Text';
import Modal from '@/app/components/ui/Modal';
import { Button } from '@/app/components/ui/Button';
import { useTranslation } from '@/app/hooks/useTranslation';

type RpeModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  rpe: string;
  onRpeChange: (value: string) => void;
};

const RpeModal = React.memo(({
                               visible,
                               onClose,
                               onSave,
                               rpe,
                               onRpeChange
                             }: RpeModalProps) => {
  const { t } = useTranslation();
  const haptics = useHaptics();
  const styles = useStyles();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('workout.rpe')}
      showCloseButton={true}
    >
      <View style={styles.rpeContainer}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.rpeButton,
              rpe === value.toString() && styles.rpeButtonSelected
            ]}
            onPress={() => {
              onRpeChange(value.toString());
              haptics.impactLight();
            }}
          >
            <Text
              style={[
                styles.rpeButtonText,
                rpe === value.toString() && styles.rpeButtonTextSelected
              ]}
            >
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title={t('common.save')}
        onPress={onSave}
        style={styles.saveButton}
        disabled={!rpe}
        size="large"
      />
    </Modal>
  );
});

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    rpeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg
    },
    rpeButton: {
      width: theme.layout.buttonSize.large,
      height: theme.layout.buttonSize.large,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.button,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.sm
    },
    rpeButtonSelected: {
      backgroundColor: theme.colors.primary
    },
    rpeButtonText: {
      fontSize: theme.typography.fontSize.xl,
      color: theme.colors.text.primary
    },
    rpeButtonTextSelected: {
      color: theme.colors.text.onPrimary
    },
    saveButton: {
      backgroundColor: theme.colors.primary
    }
  });
};

export default RpeModal;
