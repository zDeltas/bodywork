import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import BodyMeasurements from '@/app/components/BodyMeasurements';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Header } from '../components/Header';

SplashScreen.preventAutoHideAsync();

// Define styles using the current theme
const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main
    },
    saveButton: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.primary
    },
    content: {
      flex: 1,
    }
  });
};

export default function MeasurementsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Header title={t('measurements.title')} showBackButton={false} rightComponent={
        <TouchableOpacity style={styles.saveButton}>
          <Check color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>
      } />
      <ScrollView style={styles.content}>
        <BodyMeasurements />
      </ScrollView>
    </View>
  );
}
