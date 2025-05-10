import React from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { MeasurementKey } from './MeasurementBodyMap';
import { TranslationKey, MeasurementTranslationKey } from '@/translations';

interface Props {
  open: boolean;
  keyName: MeasurementKey | null;
  onClose: () => void;
  history: { date: string; value: number }[];
}

const MeasurementHistoryModal: React.FC<Props> = ({ open, keyName, onClose, history }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Détermine l'unité à afficher
  const getUnit = (keyName: string | null): string => {
    if (!keyName) return 'kg';
    return 'cm';
  };

  // Récupère le titre approprié
  const getTitle = (keyName: string | null): string => {
    if (!keyName) return t('workout.weight');
    return t(`measurements.${keyName}` as MeasurementTranslationKey);
  };

  // Formatage des valeurs pour éviter les valeurs extravagantes
  const formatValue = (value: number, keyName: string | null): number => {
    const decimals = keyName ? 0 : 1;
    return Number(value.toFixed(decimals));
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
          borderRadius: theme.borderRadius.lg
        }]}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {getTitle(keyName)} - {t('measurements.history')}
          </Text>
          <FlatList
            data={history}
            keyExtractor={item => item.date}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={{ color: theme.colors.text.primary }}>{item.date}</Text>
                <Text style={{ color: theme.colors.text.primary }}>
                  {formatValue(item.value, keyName)} {getUnit(keyName)}
                </Text>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: theme.colors.text.secondary }}>{t('measurements.noData')}</Text>}
          />
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={onClose}>
            <Text style={{ color: theme.colors.text.primary, textAlign: 'center' }}>{t('common.close')}</Text>
          </TouchableOpacity>
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
    width: '100%',
    maxWidth: 400,
    padding: 24
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  button: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10
  }
});

export default MeasurementHistoryModal; 
