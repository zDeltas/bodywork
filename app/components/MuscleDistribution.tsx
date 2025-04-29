import React from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VictoryLabel, VictoryPie } from 'victory-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';

interface MuscleGroupData {
  name: string;
  value: number;
  color: string;
}

type Period = '1m' | '3m' | '6m';

interface MuscleDistributionProps {
  fadeAnim: Animated.Value;
  muscleGroups: MuscleGroupData[];
  selectedPeriod: Period;
  setSelectedPeriod: React.Dispatch<React.SetStateAction<Period>>;
  graphsSectionRef: React.RefObject<View>;
}

const MuscleDistribution: React.FC<MuscleDistributionProps> = ({
  fadeAnim,
  muscleGroups,
  selectedPeriod,
  setSelectedPeriod,
  graphsSectionRef
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    chartContainer: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      ...theme.shadows.sm
    },
    chartTitleContainer: {
      flexDirection: 'column',
      marginBottom: theme.spacing.lg
    },
    chartTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      marginBottom: theme.spacing.xs,
      color: theme.colors.text.primary
    },
    filterContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background.main,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xs
    },
    filterButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg
    },
    filterButtonActive: {
      backgroundColor: theme.colors.background.card,
      ...theme.shadows.sm
    },
    filterText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary
    },
    filterTextActive: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold
    }
  });

  return (
    <Animated.View
      ref={graphsSectionRef}
      style={[
        styles.chartContainer,
        { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
      ]}
    >
      <View style={styles.chartTitleContainer}>
        <Text style={styles.chartTitle}>{t('muscleDistribution')}</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === '1m' && styles.filterButtonActive]}
            onPress={() => {
              setSelectedPeriod('1m');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text
              style={[styles.filterText, selectedPeriod === '1m' && styles.filterTextActive]}>{t('oneMonth')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === '3m' && styles.filterButtonActive]}
            onPress={() => {
              setSelectedPeriod('3m');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text
              style={[styles.filterText, selectedPeriod === '3m' && styles.filterTextActive]}>{t('threeMonths')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === '6m' && styles.filterButtonActive]}
            onPress={() => {
              setSelectedPeriod('6m');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text
              style={[styles.filterText, selectedPeriod === '6m' && styles.filterTextActive]}>{t('sixMonths')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <VictoryPie
        data={muscleGroups}
        x="name"
        y="value"
        colorScale={muscleGroups.map(g => g.color)}
        width={Dimensions.get('window').width - 40}
        height={300}
        innerRadius={70}
        labelRadius={100}
        style={{
          labels: { fill: theme.colors.text.primary, fontSize: theme.typography.fontSize.sm }
        }}
        labelComponent={
          <VictoryLabel
            style={{ fill: theme.colors.text.primary, fontSize: theme.typography.fontSize.sm }}
            text={({ datum }) => `${datum.name}\n${datum.value}kg`}
          />
        }
      />
    </Animated.View>
  );
};

export default MuscleDistribution;
