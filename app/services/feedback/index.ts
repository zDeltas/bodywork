export * from './types';
export { enqueueFeedback, processQueue, setupFeedbackQueueHandlers } from './queue';

// Export direct de FeedbackApiClient pour la compatibilité
export { FeedbackApiClient } from '@/app/services/api';
