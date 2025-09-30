import React from 'react';
import { Modal as RNModal, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { X } from 'lucide-react-native';
import Text from '@/app/components/ui/Text';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
  animationType?: 'none' | 'slide' | 'fade';
  transparent?: boolean;
  style?: any;
  contentStyle?: any;
}

export default function Modal({
                                visible,
                                onClose,
                                title,
                                showCloseButton = true,
                                children,
                                animationType = 'fade',
                                transparent = true,
                                style,
                                contentStyle
                              }: ModalProps) {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <RNModal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, style]}>
        <View style={[styles.modalContent, contentStyle]}>
          {(title || showCloseButton) && (
            <View style={styles.modalHeader}>
              {title && <Text variant="heading" style={styles.modalTitle}>{title}</Text>}
              {showCloseButton && (
                <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
                  <X color={theme.colors.text.primary} size={24} />
                </TouchableOpacity>
              )}
            </View>
          )}
          <ScrollView
            style={{ maxHeight: '90%' }}
            contentContainerStyle={{ paddingBottom: theme.spacing.sm }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

const useStyles = (theme: any) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg
  },
  modalContent: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    ...theme.shadows.lg
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.button,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm
  }
}); 
