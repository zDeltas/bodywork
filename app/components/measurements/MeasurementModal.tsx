import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { MeasurementKey } from './MeasurementBodyMap';
import { MeasurementTranslationKey } from '@/translations';
import { BarChart3, Ruler, X } from 'lucide-react-native';

interface Props {
  open: boolean;
  keyName: MeasurementKey | null;
  value: number;
  onClose: () => void;
  onSave: (key: MeasurementKey, value: number) => void;
  onShowHistory: (key: MeasurementKey) => void;
}

const MeasurementModal: React.FC<Props> = ({ open, keyName, value, onClose, onSave, onShowHistory }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [input, setInput] = useState(value > 0 ? value.toString() : '');

  useEffect(() => {
    setInput(value > 0 ? value.toString() : '');
  }, [value, keyName]);

  if (!keyName) return null;

  const measurementKey = `measurements.${keyName}` as MeasurementTranslationKey;

  const handleInputChange = (text: string) => {
    setInput(text);
  };

  const handleSave = () => {
    onSave(keyName, parseFloat(input) || 0);
    onClose();
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
        <View style={[styles.content, {
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.borderRadius.lg,
          ...theme.shadows.lg
        }]}>
          <View style={styles.header}>
            <Ruler size={22} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              {t(measurementKey)}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, {
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border.default,
                  backgroundColor: theme.colors.background.input
                }]}
                value={input}
                onChangeText={handleInputChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={theme.colors.text.disabled}
                autoFocus
              />
              <Text style={[styles.unit, { color: theme.colors.text.secondary }]}>cm</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.historyButton, { backgroundColor: theme.colors.background.button }]}
              onPress={() => {
                onShowHistory(keyName);
                onClose();
              }}
            >
              <BarChart3 size={18} color={theme.colors.text.primary} />
              <Text style={{ color: theme.colors.text.primary, marginLeft: 8 }}>
                {t('measurements.history')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSave}
            >
              <Text style={{ color: theme.colors.text.primary, fontWeight: 'bold' }}>
                {t('common.save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  content: {
    width: '90%',
    maxWidth: 400,
    padding: 0,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 10
  },
  closeButton: {
    padding: 4
  },
  inputSection: {
    padding: 24
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 24,
    textAlign: 'center'
  },
  unit: {
    marginLeft: 12,
    fontSize: 18
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)'
  },
  historyButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)'
  },
  saveButton: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default MeasurementModal; 
