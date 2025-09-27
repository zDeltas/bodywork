import { formatSeries, isValidSeries, getValidSeries } from '@/app/utils/seriesUtils';
import { EditableSeries, Series } from '@/types/common';

describe('seriesUtils', () => {
  describe('formatSeries', () => {
    it('should format repsAndWeight series correctly', () => {
      const editableSeries: EditableSeries[] = [
        {
          unitType: 'repsAndWeight',
          weight: '80',
          reps: '10',
          duration: '60',
          distance: '100',
          note: 'Test note',
          rest: '90',
          rpe: '7',
          type: 'workingSet'
        }
      ];

      const result = formatSeries(editableSeries);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        unitType: 'repsAndWeight',
        weight: 80,
        reps: 10,
        duration: undefined,
        distance: undefined,
        note: 'Test note',
        rest: '90',
        rpe: 7,
        type: 'workingSet'
      });
    });

    it('should format reps series correctly without weight', () => {
      const editableSeries: EditableSeries[] = [
        {
          unitType: 'reps',
          weight: '80',
          reps: '15',
          duration: '60',
          distance: '100',
          note: '',
          rest: '60',
          rpe: '6',
          type: 'workingSet'
        }
      ];

      const result = formatSeries(editableSeries);

      expect(result[0]).toEqual({
        unitType: 'reps',
        weight: 0,
        reps: 15,
        duration: undefined,
        distance: undefined,
        note: '',
        rest: '60',
        rpe: 6,
        type: 'workingSet'
      });
    });

    it('should format time series with withLoad correctly', () => {
      const editableSeries: EditableSeries[] = [
        {
          unitType: 'time',
          weight: '20',
          reps: '10',
          duration: '120',
          distance: '500',
          note: 'Timed exercise',
          rest: '45',
          rpe: '8',
          type: 'workingSet'
        }
      ];

      const resultWithLoad = formatSeries(editableSeries, true);
      const resultWithoutLoad = formatSeries(editableSeries, false);

      expect(resultWithLoad[0]).toEqual({
        unitType: 'time',
        weight: 20,
        reps: undefined,
        duration: 120,
        distance: undefined,
        note: 'Timed exercise',
        rest: '45',
        rpe: 8,
        type: 'workingSet'
      });

      expect(resultWithoutLoad[0]).toEqual({
        unitType: 'time',
        weight: 0,
        reps: undefined,
        duration: 120,
        distance: undefined,
        note: 'Timed exercise',
        rest: '45',
        rpe: 8,
        type: 'workingSet'
      });
    });

    it('should format distance series with withLoad correctly', () => {
      const editableSeries: EditableSeries[] = [
        {
          unitType: 'distance',
          weight: '15',
          reps: '8',
          duration: '180',
          distance: '1000',
          note: 'Distance exercise',
          rest: '120',
          rpe: '9',
          type: 'workingSet'
        }
      ];

      const resultWithLoad = formatSeries(editableSeries, true);
      const resultWithoutLoad = formatSeries(editableSeries, false);

      expect(resultWithLoad[0]).toEqual({
        unitType: 'distance',
        weight: 15,
        reps: undefined,
        duration: undefined,
        distance: 1000,
        note: 'Distance exercise',
        rest: '120',
        rpe: 9,
        type: 'workingSet'
      });

      expect(resultWithoutLoad[0].weight).toBe(0);
    });

    it('should handle warmUp series with RPE 0', () => {
      const editableSeries: EditableSeries[] = [
        {
          unitType: 'repsAndWeight',
          weight: '40',
          reps: '12',
          duration: '',
          distance: '',
          note: 'Warm up set',
          rest: '60',
          rpe: '5',
          type: 'warmUp'
        }
      ];

      const result = formatSeries(editableSeries);

      expect(result[0].rpe).toBe(0);
      expect(result[0].type).toBe('warmUp');
    });

    it('should handle invalid numeric values gracefully', () => {
      const editableSeries: EditableSeries[] = [
        {
          unitType: 'repsAndWeight',
          weight: 'invalid',
          reps: '',
          duration: 'abc',
          distance: 'xyz',
          note: '',
          rest: '',
          rpe: 'invalid',
          type: 'workingSet'
        }
      ];

      const result = formatSeries(editableSeries);

      expect(result[0]).toEqual({
        unitType: 'repsAndWeight',
        weight: 0,
        reps: 0,
        duration: undefined,
        distance: undefined,
        note: '',
        rest: '',
        rpe: 5, // Default RPE
        type: 'workingSet'
      });
    });

    it('should handle missing unitType with default', () => {
      const editableSeries: EditableSeries[] = [
        {
          weight: '50',
          reps: '8',
          duration: '',
          distance: '',
          note: '',
          rest: '90',
          rpe: '6',
          type: 'workingSet'
        } as EditableSeries
      ];

      const result = formatSeries(editableSeries);

      expect(result[0].unitType).toBe('reps');
    });
  });

  describe('isValidSeries', () => {
    it('should validate repsAndWeight series correctly', () => {
      const validSeries: EditableSeries = {
        unitType: 'repsAndWeight',
        weight: '80',
        reps: '10',
        duration: '',
        distance: '',
        note: '',
        rest: '',
        type: 'workingSet'
      };

      const invalidSeries: EditableSeries = {
        unitType: 'repsAndWeight',
        weight: '0',
        reps: '0',
        duration: '',
        distance: '',
        note: '',
        rest: '',
        type: 'workingSet'
      };

      expect(isValidSeries(validSeries)).toBe(true);
      expect(isValidSeries(invalidSeries)).toBe(false);
    });

    it('should validate reps series correctly', () => {
      const validSeries: EditableSeries = {
        unitType: 'reps',
        weight: '0',
        reps: '15',
        duration: '',
        distance: '',
        note: '',
        rest: '',
        type: 'workingSet'
      };

      const invalidSeries: EditableSeries = {
        unitType: 'reps',
        weight: '0',
        reps: '0',
        duration: '',
        distance: '',
        note: '',
        rest: '',
        type: 'workingSet'
      };

      expect(isValidSeries(validSeries)).toBe(true);
      expect(isValidSeries(invalidSeries)).toBe(false);
    });

    it('should validate time series correctly', () => {
      const validSeries: EditableSeries = {
        unitType: 'time',
        weight: '0',
        reps: '',
        duration: '120',
        distance: '',
        note: '',
        rest: '',
        type: 'workingSet'
      };

      const invalidSeries: EditableSeries = {
        unitType: 'time',
        weight: '0',
        reps: '',
        duration: '0',
        distance: '',
        note: '',
        rest: '',
        type: 'workingSet'
      };

      expect(isValidSeries(validSeries)).toBe(true);
      expect(isValidSeries(invalidSeries)).toBe(false);
    });

    it('should validate distance series correctly', () => {
      const validSeries: EditableSeries = {
        unitType: 'distance',
        weight: '0',
        reps: '',
        duration: '',
        distance: '1000',
        note: '',
        rest: '',
        type: 'workingSet'
      };

      const invalidSeries: EditableSeries = {
        unitType: 'distance',
        weight: '0',
        reps: '',
        duration: '',
        distance: '0',
        note: '',
        rest: '',
        type: 'workingSet'
      };

      expect(isValidSeries(validSeries)).toBe(true);
      expect(isValidSeries(invalidSeries)).toBe(false);
    });

    it('should consider series valid if weight is positive', () => {
      const seriesWithWeight: EditableSeries = {
        unitType: 'reps',
        weight: '50',
        reps: '0',
        duration: '',
        distance: '',
        note: '',
        rest: '',
        type: 'workingSet'
      };

      expect(isValidSeries(seriesWithWeight)).toBe(true);
    });
  });

  describe('getValidSeries', () => {
    it('should filter out invalid series', () => {
      const mixedSeries: EditableSeries[] = [
        {
          unitType: 'repsAndWeight',
          weight: '80',
          reps: '10',
          duration: '',
          distance: '',
          note: '',
          rest: '',
          type: 'workingSet'
        },
        {
          unitType: 'reps',
          weight: '0',
          reps: '0',
          duration: '',
          distance: '',
          note: '',
          rest: '',
          type: 'workingSet'
        },
        {
          unitType: 'time',
          weight: '0',
          reps: '',
          duration: '120',
          distance: '',
          note: '',
          rest: '',
          type: 'workingSet'
        }
      ];

      const result = getValidSeries(mixedSeries);

      expect(result).toHaveLength(2);
      expect(result[0].unitType).toBe('repsAndWeight');
      expect(result[1].unitType).toBe('time');
    });

    it('should return empty array when no valid series', () => {
      const invalidSeries: EditableSeries[] = [
        {
          unitType: 'reps',
          weight: '0',
          reps: '0',
          duration: '',
          distance: '',
          note: '',
          rest: '',
          type: 'workingSet'
        }
      ];

      const result = getValidSeries(invalidSeries);

      expect(result).toHaveLength(0);
    });

    it('should return all series when all are valid', () => {
      const validSeries: EditableSeries[] = [
        {
          unitType: 'repsAndWeight',
          weight: '80',
          reps: '10',
          duration: '',
          distance: '',
          note: '',
          rest: '',
          type: 'workingSet'
        },
        {
          unitType: 'time',
          weight: '0',
          reps: '',
          duration: '120',
          distance: '',
          note: '',
          rest: '',
          type: 'workingSet'
        }
      ];

      const result = getValidSeries(validSeries);

      expect(result).toHaveLength(2);
    });
  });
});
