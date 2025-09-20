import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { AlertTriangle, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Modal from './Modal';
import Text from './Text';
import { Button } from './Button';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
                                                     visible,
                                                     onClose,
                                                     onConfirm,
                                                     title,
                                                     message,
                                                     confirmText,
                                                     cancelText,
                                                     variant = 'warning'
                                                   }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);

  const getVariantColor = () => {
    switch (variant) {
      case 'danger':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.warning;
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      showCloseButton={true}
    >
      <AlertTriangle size={40} color={getVariantColor()} style={styles.modalIcon} />
      <Text style={styles.modalMessage}>
        {message}
      </Text>
      <View style={styles.modalButtons}>
        <Button
          title={cancelText || t('common.cancel')}
          variant="secondary"
          onPress={onClose}
          style={styles.modalButton}
        />
        {variant === 'danger' ? (
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: getVariantColor() }]}
            onPress={onConfirm}
          >
            <Trash2 size={20} color={theme.colors.text.onPrimary} />
            <Text style={[styles.deleteButtonText, { color: theme.colors.text.onPrimary }]}>
              {confirmText || t('common.delete')}
            </Text>
          </TouchableOpacity>
        ) : (
          <Button
            title={confirmText || t('common.delete')}
            onPress={onConfirm}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: getVariantColor()
            }}
            textStyle={{ color: getVariantColor() }}
          />
        )}
      </View>
    </Modal>
  );
};

const useStyles = (theme: any) => StyleSheet.create({
  modalIcon: {
    alignSelf: 'center',
    marginBottom: theme.spacing.lg
  },
  modalMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md
  },
  modalButton: {
    flex: 1
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  deleteButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.semiBold,
  }
});

export default ConfirmModal; 
