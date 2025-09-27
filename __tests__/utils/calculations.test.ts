import calculations from '@/app/utils/calculations';

describe('calculations', () => {
  describe('calculateEstimated1RM', () => {
    it('should calculate estimated 1RM correctly', () => {
      // Test with common weight/rep combinations
      expect(calculations.calculateEstimated1RM(100, 10)).toBe(133); // 100 * (1 + 10/30) = 133.33 -> 133
      expect(calculations.calculateEstimated1RM(80, 5)).toBe(93); // 80 * (1 + 5/30) = 93.33 -> 93
      expect(calculations.calculateEstimated1RM(60, 15)).toBe(90); // 60 * (1 + 15/30) = 90
    });

    it('should handle edge cases', () => {
      expect(calculations.calculateEstimated1RM(100, 0)).toBe(100); // 1RM with 0 reps = weight itself
      expect(calculations.calculateEstimated1RM(0, 10)).toBe(0); // 0 weight = 0 1RM
      expect(calculations.calculateEstimated1RM(50, 1)).toBe(52); // 50 * (1 + 1/30) = 51.67 -> 52
    });

    it('should round to nearest integer', () => {
      expect(calculations.calculateEstimated1RM(75, 8)).toBe(95); // 75 * (1 + 8/30) = 95
      expect(calculations.calculateEstimated1RM(90, 3)).toBe(99); // 90 * (1 + 3/30) = 99
    });
  });

  describe('calculateVolume', () => {
    it('should calculate volume correctly', () => {
      expect(calculations.calculateVolume(80, 10, 3)).toBe(2400); // 80 * 10 * 3 = 2400
      expect(calculations.calculateVolume(100, 5, 4)).toBe(2000); // 100 * 5 * 4 = 2000
      expect(calculations.calculateVolume(60, 12, 2)).toBe(1440); // 60 * 12 * 2 = 1440
    });

    it('should handle edge cases', () => {
      expect(calculations.calculateVolume(0, 10, 3)).toBe(0); // 0 weight = 0 volume
      expect(calculations.calculateVolume(80, 0, 3)).toBe(0); // 0 reps = 0 volume
      expect(calculations.calculateVolume(80, 10, 0)).toBe(0); // 0 sets = 0 volume
    });

    it('should handle decimal weights', () => {
      expect(calculations.calculateVolume(82.5, 8, 3)).toBe(1980); // 82.5 * 8 * 3 = 1980
      expect(calculations.calculateVolume(67.5, 10, 2)).toBe(1350); // 67.5 * 10 * 2 = 1350
    });
  });

  describe('module structure', () => {
    it('should export both calculation functions', () => {
      expect(typeof calculations.calculateEstimated1RM).toBe('function');
      expect(typeof calculations.calculateVolume).toBe('function');
    });

    it('should have correct function signatures', () => {
      expect(calculations.calculateEstimated1RM.length).toBe(2); // 2 parameters
      expect(calculations.calculateVolume.length).toBe(3); // 3 parameters
    });
  });
});
