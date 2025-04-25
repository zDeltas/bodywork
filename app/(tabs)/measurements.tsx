import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import BodyMeasurements from '@/app/components/BodyMeasurements';
import { Check } from 'lucide-react-native';
import theme, { colors, typography, spacing, borderRadius } from '@/app/theme/theme';

SplashScreen.preventAutoHideAsync();

export default function MeasurementsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mesures</Text>
        <TouchableOpacity style={styles.saveButton}>
          <Check color={colors.text.primary} size={24} />
        </TouchableOpacity>
      </View>

      <BodyMeasurements />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    paddingTop: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.card,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.primary,
  },
}); 
