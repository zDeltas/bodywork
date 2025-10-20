import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput, Modal, ScrollView } from 'react-native';
import { Calendar, ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';

interface DatePickerProps {
  value: Date | null;
  onValueChange: (date: Date) => void;
  placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onValueChange, placeholder }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();
  const [showPicker, setShowPicker] = useState(false);
  const [tempDay, setTempDay] = useState(value?.getDate().toString() || '');
  const [tempMonth, setTempMonth] = useState(value ? (value.getMonth() + 1).toString() : '');
  const [tempYear, setTempYear] = useState(value?.getFullYear().toString() || '');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleConfirm = () => {
    const day = parseInt(tempDay);
    const month = parseInt(tempMonth) - 1; // Month is 0-indexed
    const year = parseInt(tempYear);
    
    if (day && month >= 0 && year && day <= 31 && month <= 11 && year >= 1900 && year <= new Date().getFullYear()) {
      const newDate = new Date(year, month, day);
      if (newDate.getDate() === day) { // Validate the date is real
        onValueChange(newDate);
      }
    }
    setShowPicker(false);
  };

  const handleCancel = () => {
    // Reset to current value
    setTempDay(value?.getDate().toString() || '');
    setTempMonth(value ? (value.getMonth() + 1).toString() : '');
    setTempYear(value?.getFullYear().toString() || '');
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.background.input,
            borderColor: theme.colors.border.default,
          }
        ]}
        onPress={() => setShowPicker(true)}
      >
        <Calendar size={20} color={theme.colors.text.secondary} />
        <Text
          style={[
            styles.inputText,
            {
              color: value ? theme.colors.text.primary : theme.colors.text.secondary,
            }
          ]}
        >
          {value ? formatDate(value) : (placeholder || t('onboarding.basicProfile.selectDate'))}
        </Text>
        <ChevronDown size={16} color={theme.colors.text.secondary} />
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              {t('onboarding.basicProfile.selectDate')}
            </Text>
            
            <View style={styles.dateInputContainer}>
              <View style={styles.dateInputGroup}>
                <Text style={[styles.dateLabel, { color: theme.colors.text.secondary }]}>
                  {t('common.day')}
                </Text>
                <TextInput
                  style={[styles.dateInput, { 
                    backgroundColor: theme.colors.background.input,
                    borderColor: theme.colors.border.default,
                    color: theme.colors.text.primary
                  }]}
                  value={tempDay}
                  onChangeText={setTempDay}
                  placeholder="DD"
                  placeholderTextColor={theme.colors.text.secondary}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              
              <View style={styles.dateInputGroup}>
                <Text style={[styles.dateLabel, { color: theme.colors.text.secondary }]}>
                  {t('common.month')}
                </Text>
                <TextInput
                  style={[styles.dateInput, { 
                    backgroundColor: theme.colors.background.input,
                    borderColor: theme.colors.border.default,
                    color: theme.colors.text.primary
                  }]}
                  value={tempMonth}
                  onChangeText={setTempMonth}
                  placeholder="MM"
                  placeholderTextColor={theme.colors.text.secondary}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              
              <View style={styles.dateInputGroup}>
                <Text style={[styles.dateLabel, { color: theme.colors.text.secondary }]}>
                  {t('common.year')}
                </Text>
                <TextInput
                  style={[styles.dateInput, { 
                    backgroundColor: theme.colors.background.input,
                    borderColor: theme.colors.border.default,
                    color: theme.colors.text.primary
                  }]}
                  value={tempYear}
                  onChangeText={setTempYear}
                  placeholder="YYYY"
                  placeholderTextColor={theme.colors.text.secondary}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.colors.border.default }]}
                onPress={handleCancel}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text.secondary }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleConfirm}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text.onPrimary }]}>
                  {t('common.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      width: '100%',
    },
    input: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      gap: theme.spacing.sm,
    },
    inputText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    modalContent: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      width: '100%',
      maxWidth: 400,
      ...theme.shadows.md,
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.semiBold,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    dateInputContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    dateInputGroup: {
      flex: 1,
    },
    dateLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },
    dateInput: {
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    modalButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmButton: {
      borderWidth: 0,
      ...theme.shadows.sm,
    },
    modalButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
  });
};

export default DatePicker;
