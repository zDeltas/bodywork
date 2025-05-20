import React from 'react';
import { Animated, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { VictoryLabel, VictoryPie } from 'victory-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { useHaptics } from '@/src/hooks/useHaptics';
import Text from '@/app/components/ui/Text';

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
  const haptics = useHaptics();

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
    chartSubtitle: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm
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
      backgroundColor: theme.colors.primary,
      color: 'white'
    },
    filterText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary
    },
    filterTextActive: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold
    },
    legendContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.sm
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: theme.spacing.xs
    },
    legendText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary
    },
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 200
    },
    emptyStateText: {
      color: theme.colors.text.secondary,
      textAlign: 'center'
    }
  });

  // Vérifier si des données sont disponibles
  const hasData = muscleGroups && muscleGroups.length > 0;

  return (
    <Animated.View
      ref={graphsSectionRef}
      style={[styles.chartContainer, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}
    >
      <View style={styles.chartTitleContainer}>
        <Text style={styles.chartTitle}>{t('stats.muscleDistribution')}</Text>
        <Text style={styles.chartSubtitle}>
          Répartition du volume d'entraînement par groupe musculaire
        </Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === '1m' && styles.filterButtonActive]}
            onPress={() => {
              setSelectedPeriod('1m');
              haptics.impactLight();
            }}
          >
            <Text style={[styles.filterText, selectedPeriod === '1m' && styles.filterTextActive]}>
              {t('periods.oneMonth')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === '3m' && styles.filterButtonActive]}
            onPress={() => {
              setSelectedPeriod('3m');
              haptics.impactLight();
            }}
          >
            <Text style={[styles.filterText, selectedPeriod === '3m' && styles.filterTextActive]}>
              {t('periods.threeMonths')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === '6m' && styles.filterButtonActive]}
            onPress={() => {
              setSelectedPeriod('6m');
              haptics.impactLight();
            }}
          >
            <Text style={[styles.filterText, selectedPeriod === '6m' && styles.filterTextActive]}>
              {t('periods.sixMonths')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {hasData ? (
        <>
          <VictoryPie
            data={muscleGroups}
            x="name"
            y="value"
            colorScale={muscleGroups.map((g) => g.color)}
            width={Dimensions.get('window').width - 40}
            height={300}
            innerRadius={70}
            labelRadius={100}
            style={{
              labels: {
                fill: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.sm,
                fontFamily: theme.typography.fontFamily.regular
              },
              data: {
                fill: ({ datum }) => datum.color,
                fillOpacity: 0.9,
                stroke: theme.colors.background.main,
                strokeWidth: 2
              }
            }}
            labelComponent={
              <VictoryLabel
                style={{
                  fill: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.sm,
                  fontFamily: theme.typography.fontFamily.regular
                }}
                text={({ datum }) => `${datum.name}\n${datum.value}%`}
              />
            }
          />
          <View style={styles.legendContainer}>
            {muscleGroups.map((group, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: group.color }]} />
                <Text style={styles.legendText}>
                  {group.name} ({group.value}%)
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>Aucune donnée disponible pour cette période</Text>
        </View>
      )}
    </Animated.View>
  );
};

export default MuscleDistribution;
