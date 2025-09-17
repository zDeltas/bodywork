import { EditableSeries, Series } from '../../types/common';

/**
 * Converts editable series to final series format
 * @param series - Array of editable series
 * @param defaultRpe - Default RPE value to use when series RPE is not set
 * @returns Formatted series array
 */
export const formatSeries = (series: EditableSeries[], defaultRpe: string = '7'): Series[] => {
  return series.map((s) => ({
    unitType: s.unitType || 'reps',
    weight: parseFloat(s.weight) || 0,
    reps: (s.unitType || 'reps') === 'reps' ? (parseInt(s.reps || '0') || 0) : undefined,
    duration: s.unitType === 'time' ? (parseInt(s.duration || '0') || 0) : undefined,
    distance: s.unitType === 'distance' ? (parseFloat(s.distance || '0') || 0) : undefined,
    note: s.note,
    rest: s.rest ?? '',
    rpe: s.type === 'warmUp' ? 0 : parseInt(s.rpe || defaultRpe) || 7,
    type: s.type || 'workingSet'
  }));
};

/**
 * Validates if a series has valid data
 * @param series - Series to validate
 * @returns True if series has valid data
 */
export const isValidSeries = (series: EditableSeries): boolean => {
  const unit = series.unitType || 'reps';
  return (
    parseFloat(series.weight) > 0 ||
    (unit === 'reps' && parseInt(series.reps || '0') > 0) ||
    (unit === 'time' && parseInt(series.duration || '0') > 0) ||
    (unit === 'distance' && parseFloat(series.distance || '0') > 0)
  );
};

/**
 * Filters series to only include valid ones
 * @param series - Array of series to filter
 * @returns Array of valid series
 */
export const getValidSeries = (series: EditableSeries[]): EditableSeries[] => {
  return series.filter(isValidSeries);
};
