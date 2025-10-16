export function setupFeedbackQueueHandlers(): () => void {
  console.log('[Feedback] setupFeedbackQueueHandlers initialized');
  return () => {
    console.log('[Feedback] setupFeedbackQueueHandlers teardown');
  };
}
