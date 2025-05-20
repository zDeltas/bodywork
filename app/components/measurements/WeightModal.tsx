import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { BarChart3 } from 'lucide-react-native';
import Modal from '@/app/components/ui/Modal';

interface Props {
  open: boolean;
  value: number;
  onClose: () => void;
  onSave: (value: number) => void;
  onShowHistory: () => void;
}

const WeightModal: React.FC<Props> = ({ open, value, onClose, onSave, onShowHistory }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [input, setInput] = useState(value > 0 ? value.toString() : '');

  useEffect(() => {
    setInput(value > 0 ? value.toString() : '');
  }, [value]);

  const handleInputChange = (text: string) => {
    setInput(text);
  };

  const handleSave = () => {
    onSave(parseFloat(input) || 0);
    onClose();
  };

  return (
    <Modal
      visible={open}
      onClose={onClose}
      title={t('workout.weight')}
      showCloseButton={true}
    >
      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text.primary,
                borderColor: theme.colors.border.default,
                backgroundColor: theme.colors.background.input
              }
            ]}
            value={input}
            onChangeText={handleInputChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={theme.colors.text.disabled}
            autoFocus
          />
          <Text style={[styles.unit, { color: theme.colors.text.secondary }]}>kg</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.historyButton, { backgroundColor: theme.colors.background.button }]}
          onPress={() => {
            onShowHistory();
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
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export default WeightModal;
