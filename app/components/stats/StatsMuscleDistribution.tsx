import React, { Dispatch, SetStateAction } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import MuscleDistribution from '@/app/components/muscles/MuscleDistribution';

type Period = '1m' | '3m' | '6m';

interface MuscleGroupData {
  name: string;
  value: number;
  color: string;
}

interface StatsMuscleDistributionProps {
  fadeAnim: Animated.Value;
  selectedPeriod: Period;
  setSelectedPeriod: Dispatch<SetStateAction<Period>>;
  graphsSectionRef: React.RefObject<View>;
  muscleGroups: MuscleGroupData[];
}

export default function StatsMuscleDistribution({
                                                  fadeAnim,
                                                  selectedPeriod,
                                                  setSelectedPeriod,
                                                  graphsSectionRef,
                                                  muscleGroups
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
        muscleGroups={muscleGroups}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        graphsSectionRef={graphsSectionRef}
      />
    </View>
  );
} 
