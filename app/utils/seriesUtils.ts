import { EditableSeries, Series } from '../../types/common';

const UNIT_TYPE_CONFIG = {
  repsAndWeight: { weight: true, reps: true, duration: false, distance: false },
  reps: { weight: false, reps: true, duration: false, distance: false },
  time: { weight: 'withLoad', reps: false, duration: true, distance: false },
  distance: { weight: 'withLoad', reps: false, duration: false, distance: true }
} as const;

export const formatSeries = (series: EditableSeries[], withLoad: boolean = false): Series[] => {
  return series.map((s) => {
    const unitType = s.unitType || 'reps';
    const config = UNIT_TYPE_CONFIG[unitType as keyof typeof UNIT_TYPE_CONFIG];

    const getRpe = () => {
      return s.type === 'warmUp' ? 0 : (() => {
        const rpeValue = parseInt(s.rpe || '5') || 5;
        return rpeValue >= 1 && rpeValue <= 10 ? rpeValue : 5;
      })();
    };

    return {
      unitType,
      note: s.note,
      rest: s.rest ?? '',
      rpe: getRpe(),
      type: s.type || 'workingSet',
      weight: config.weight === true ? (parseFloat(s.weight) || 0) :
        config.weight === 'withLoad' && withLoad ? (parseFloat(s.weight) || 0) : 0,
      reps: config.reps ? (parseInt(s.reps || '0') || 0) : undefined,
      duration: config.duration ? (parseInt(s.duration || '0') || 0) : undefined,
      distance: config.distance ? (parseFloat(s.distance || '0') || 0) : undefined
    };
  });
};

export const isValidSeries = (series: EditableSeries): boolean => {
  const unit = series.unitType || 'reps';
  return (
    parseFloat(series.weight) > 0 ||
    ((unit === 'reps' || unit === 'repsAndWeight') && parseInt(series.reps || '0') > 0) ||
    (unit === 'time' && parseInt(series.duration || '0') > 0) ||
    (unit === 'distance' && parseFloat(series.distance || '0') > 0)
  );
};

export const getValidSeries = (series: EditableSeries[]): EditableSeries[] => {
  return series.filter(isValidSeries);
};

// Default export to satisfy Expo Router
export default function SeriesUtilsIndex() {
  // Empty function to satisfy Expo Router requirement
}
