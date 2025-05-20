import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
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
        <Button
          title={confirmText || t('common.delete')}
          variant="primary"
          onPress={onConfirm}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: getVariantColor()
          }}
          textStyle={{ color: getVariantColor() }}
        />
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
  }
});

export default ConfirmModal; 
