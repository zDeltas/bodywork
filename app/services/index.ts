import storageService, { Measurement, Settings, StorageData, StorageKeys } from './storage';

export { storageService, StorageKeys, Settings, Measurement, StorageData };

// Export auth services
export * from './auth';

export default {
  storage: storageService
};
