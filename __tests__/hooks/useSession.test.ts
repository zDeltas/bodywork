import { renderHook, act } from '@testing-library/react-native';
import useSession from '@/app/hooks/useSession';
import storageService from '@/app/services/storage';

// Essential useSession tests using global mocks
const mockStorageService = storageService as jest.Mocked<typeof storageService>;

describe('useSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageService.getRoutines.mockResolvedValue([]);
    mockStorageService.saveRoutineSession.mockResolvedValue();
  });

  it('should initialize useSession hook', async () => {
    const { result } = renderHook(() => useSession('routine_123'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.sessionState).toBeDefined();
    expect(mockStorageService.getRoutines).toHaveBeenCalled();
  });

  it('should handle session state updates', async () => {
    const { result } = renderHook(() => useSession('routine_123'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(typeof result.current.sessionState.currentExerciseIndex).toBe('number');
    expect(typeof result.current.sessionState.currentSeriesIndex).toBe('number');
  });

  it('should provide session methods', async () => {
    const { result } = renderHook(() => useSession('routine_123'));

    expect(typeof result.current.handleNext).toBe('function');
    expect(typeof result.current.handlePrevious).toBe('function');
    expect(typeof result.current.setSessionState).toBe('function');
  });

  it('should handle basic functionality', async () => {
    const { result } = renderHook(() => useSession('routine_123'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Just verify basic functionality works
    expect(result.current.sessionState).toBeDefined();
    expect(typeof result.current.sessionState.restTime).toBe('number');
  });

  it('should handle storage service calls', async () => {
    const { result } = renderHook(() => useSession('routine_123'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockStorageService.getRoutines).toHaveBeenCalled();
  });
});
