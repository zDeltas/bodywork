import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import BodyMeasurements from '@/app/components/BodyMeasurements';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

SplashScreen.preventAutoHideAsync();

// Define styles using the current theme
const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main
    },
    header: {
      paddingTop: theme.spacing.xl * 2,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.background.card
    },
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary
    },
    saveButton: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.primary
    }
  });
};

export default function MeasurementsScreen() {
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mesures</Text>
        <TouchableOpacity style={styles.saveButton}>
          <Check color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>
      </View>

      <BodyMeasurements />
    </View>
  );
}
