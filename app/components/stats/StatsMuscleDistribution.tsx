import React, { Dispatch, SetStateAction } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import MuscleDistribution from '@/app/components/MuscleDistribution';

type Period = '1m' | '3m' | '6m';

interface StatsMuscleDistributionProps {
  fadeAnim: Animated.Value;
  selectedPeriod: Period;
  setSelectedPeriod: Dispatch<SetStateAction<Period>>;
  graphsSectionRef: React.RefObject<View>;
}

export default function StatsMuscleDistribution({
  fadeAnim,
  selectedPeriod,
  setSelectedPeriod,
  graphsSectionRef
}: StatsMuscleDistributionProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.xl
    }
  });

  return (
    <View style={styles.container}>
      <MuscleDistribution
        fadeAnim={fadeAnim}
        muscleGroups={[]}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        graphsSectionRef={graphsSectionRef}
      />
    </View>
  );
} 