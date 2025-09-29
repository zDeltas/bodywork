import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Modal from '@/app/components/ui/Modal';

interface Props {
  open: boolean;
  value?: number;
  onClose: () => void;
  onSave: (value: number) => void;
}

const HeightModal: React.FC<Props> = ({ open, value, onClose, onSave }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [input, setInput] = useState<string>(value && value > 0 ? String(value) : '');

  useEffect(() => {
    setInput(value && value > 0 ? String(value) : '');
  }, [value]);

  const handleSave = () => {
    const v = parseFloat(input);
    onSave(!isNaN(v) ? v : 0);
    onClose();
  };

  return (
    <Modal visible={open} onClose={onClose} title={t('measurements.height') || 'Taille'} showCloseButton>
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
            onChangeText={setInput}
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
  inputSection: { padding: 24 },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 24, textAlign: 'center' },
  unit: { marginLeft: 12, fontSize: 18 },
  buttonContainer: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  saveButton: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }
});

export default HeightModal;
