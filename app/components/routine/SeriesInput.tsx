import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Copy, X } from 'lucide-react-native';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { EditableSeries } from '@/types/common';

interface SeriesInputProps {
  series: EditableSeries;
  index: number;
  showLabels: boolean;
  withLoad?: boolean;
  onUpdate: (field: keyof EditableSeries, value: string) => void;
  onCopy: () => void;
  onRemove: () => void;
  onDurationPress?: () => void;
  canRemove: boolean;
}

const SeriesInput: React.FC<SeriesInputProps> = React.memo(({
  series,
  index,
  showLabels,
  withLoad = false,
  onUpdate,
  onCopy,
  onRemove,
  onDurationPress,
  canRemove
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);

  const renderRepsAndWeightInputs = () => (
    <>
      <View style={[styles.column, { flex: 2 }]}>
        {showLabels && <Text style={styles.inputLabel}>{t('workout.weightKg')}</Text>}
        <TextInput
          style={styles.compactInput}
          value={series.weight}
          onChangeText={(value) => onUpdate('weight', value)}
          placeholder="0"
          placeholderTextColor={theme.colors.text.secondary}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
      </View>
      <View style={[styles.column, { flex: 2 }]}>
        {showLabels && <Text style={styles.inputLabel}>{t('workout.reps')}</Text>}
        <TextInput
          style={styles.compactInput}
          value={series.reps}
          onChangeText={(value) => onUpdate('reps', value)}
          placeholder="0"
          placeholderTextColor={theme.colors.text.secondary}
          keyboardType="number-pad"
          returnKeyType="done"
        />
      </View>
    </>
  );

  const renderRepsInput = () => (
    <View style={[styles.column, { flex: 3 }]}>
      {showLabels && <Text style={styles.inputLabel}>{t('workout.reps')}</Text>}
      <TextInput
        style={styles.compactInput}
        value={series.reps}
        onChangeText={(value) => onUpdate('reps', value)}
        placeholder="0"
        placeholderTextColor={theme.colors.text.secondary}
        keyboardType="numeric"
      />
    </View>
  );

  const renderTimeInput = () => (
    <View style={[styles.column, { flex: withLoad ? 2 : 3 }]}>
      {showLabels && <Text style={styles.inputLabel}>{t('workout.duration')} (mm:ss)</Text>}
      <TouchableOpacity
        style={[styles.compactInput, { justifyContent: 'center', alignItems: 'center' }]}
        onPress={onDurationPress}
      >
        <Text style={[styles.timeText, { width: '100%' }]}>
          {series.duration || '00:00'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderDistanceInput = () => (
    <View style={[styles.column, { flex: withLoad ? 2 : 3 }]}>
      {showLabels && <Text style={styles.inputLabel}>{t('workout.distance')} (m)</Text>}
      <TextInput
        style={styles.compactInput}
        value={series.distance}
        onChangeText={(value) => onUpdate('distance', value)}
        placeholder="0"
        placeholderTextColor={theme.colors.text.secondary}
        keyboardType="numeric"
      />
    </View>
  );

  const renderWeightInput = () => (
    <View style={[styles.column, { flex: 2 }]}>
      {showLabels && <Text style={styles.inputLabel}>{t('workout.weightKg')}</Text>}
      <TextInput
        style={styles.compactInput}
        value={series.weight}
        onChangeText={(value) => onUpdate('weight', value)}
        placeholder="0"
        placeholderTextColor={theme.colors.text.secondary}
        keyboardType="decimal-pad"
      />
    </View>
  );

  const renderMainInputs = () => {
    switch (series.unitType) {
      case 'repsAndWeight':
        return renderRepsAndWeightInputs();
      case 'reps':
        return renderRepsInput();
      case 'time':
        return (
          <>
            {renderTimeInput()}
            {withLoad && renderWeightInput()}
          </>
        );
      case 'distance':
        return (
          <>
            {renderDistanceInput()}
            {withLoad && renderWeightInput()}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.column, { maxWidth: 40, alignItems: 'center' }]}>
          <Text style={styles.seriesNumber}>{index + 1}</Text>
        </View>

        {renderMainInputs()}

        <View style={styles.actionsColumn}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onCopy}
          >
            <Copy size={18} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { opacity: canRemove ? 1 : 0.3 }]}
            onPress={onRemove}
            disabled={!canRemove}
          >
            <X size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

SeriesInput.displayName = 'SeriesInput';

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    padding: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    gap: 8
  },
  column: {
    flex: 1
  },
  compactInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: theme.colors.background.input,
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.medium,
    height: 40,
    borderStyle: 'solid'
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.medium
  },
  seriesNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    lineHeight: 40,
    height: 40,
    overflow: 'hidden',
    backgroundColor: theme.colors.background.input,
    color: theme.colors.text.primary
  },
  actionsColumn: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    flex: 0,
    width: 80
  },
  actionButton: {
    width: 36,
    height: 40,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.input,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderStyle: 'solid',
    alignSelf: 'center'
  },
  timeText: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false
  }
});

export default SeriesInput;
