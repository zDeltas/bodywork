import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
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

export const RpeModal = React.memo(({
  visible,
  onClose,
  onSave,
  rpe,
  onRpeChange
}: RpeModalProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const haptics = useHaptics();
  const styles = useStyles(theme);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('workout.rpe')}
      showCloseButton={true}
    >
      <View style={styles.rpeContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
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

const useStyles = (theme: any) => StyleSheet.create({
  rpeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg
  },
  rpeButton: {
    width: 60,
    height: 60,
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
    color: theme.colors.text.primary
  },
  saveButton: {
    backgroundColor: theme.colors.primary
  }
}); 