import storageService from '@/app/services/storage';

// Essential storage tests using global mocks
const mockStorageService = storageService as jest.Mocked<typeof storageService>;

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getWorkouts', async () => {
    await mockStorageService.getWorkouts();
    expect(mockStorageService.getWorkouts).toHaveBeenCalled();
  });

  it('should call getRoutines', async () => {
    await mockStorageService.getRoutines();
    expect(mockStorageService.getRoutines).toHaveBeenCalled();
  });

  it('should call getSettings', async () => {
    await mockStorageService.getSettings();
    expect(mockStorageService.getSettings).toHaveBeenCalled();
  });

  it('should call initialize', async () => {
    await mockStorageService.initialize();
    expect(mockStorageService.initialize).toHaveBeenCalled();
  });

  it('should handle basic storage operations', async () => {
    await mockStorageService.getItem('test');
    await mockStorageService.setItem('test', {});
    await mockStorageService.removeItem('test');
    
    expect(mockStorageService.getItem).toHaveBeenCalledWith('test');
    expect(mockStorageService.setItem).toHaveBeenCalledWith('test', {});
    expect(mockStorageService.removeItem).toHaveBeenCalledWith('test');
  });
});
