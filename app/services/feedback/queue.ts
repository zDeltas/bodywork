import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { FeedbackPayload } from './types';
import { sendFeedback } from './api';

const QUEUE_KEY = 'feedback_queue_v1';
let isProcessing = false;

async function loadQueue(): Promise<FeedbackPayload[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const q = raw ? JSON.parse(raw) : [];
    console.log('[Feedback][Queue] load', { size: Array.isArray(q) ? q.length : 0 });
    return q;
  } catch (e: any) {
    console.warn('[Feedback][Queue] load error', { message: e?.message });
    return [];
  }
}

async function saveQueue(queue: FeedbackPayload[]) {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log('[Feedback][Queue] save', { size: Array.isArray(queue) ? queue.length : 0 });
  } catch (e: any) {
    console.warn('[Feedback][Queue] save error', { message: e?.message });
  }
}

export async function enqueueFeedback(payload: FeedbackPayload) {
  console.log('[Feedback][Queue] enqueue', { hasPayload: !!payload, score: payload?.score });
  const queue = await loadQueue();
  queue.push(payload);
  await saveQueue(queue);
  // try immediate processing (non-blocking)
  processQueue();
}

export async function processQueue(): Promise<{ processed: number; remaining: number; online: boolean } | void> {
  if (isProcessing) {
    console.log('[Feedback][Queue] process -> already running, skip');
    return;
  }
  isProcessing = true;
  const queue = await loadQueue();
  if (!queue.length) {
    console.log('[Feedback][Queue] process -> empty');
    isProcessing = false;
    return { processed: 0, remaining: 0, online: true };
  }

  const state = await NetInfo.fetch();
  const online = !!state.isConnected;
  if (!online) {
    console.log('[Feedback][Queue] process -> offline, skip', { size: queue.length });
    isProcessing = false;
    return { processed: 0, remaining: queue.length, online };
  }

  console.log('[Feedback][Queue] process -> start', { size: queue.length });
  const remaining: FeedbackPayload[] = [];
  let processed = 0;
  for (const item of queue) {
    try {
      await sendFeedback(item);
      processed += 1;
    } catch (e: any) {
      console.warn('[Feedback][Queue] item failed, keep in queue');
      remaining.push(item);
    }
  }
  await saveQueue(remaining);
  console.log('[Feedback][Queue] process -> done', { processed, remaining: remaining.length });
  isProcessing = false;
  return { processed, remaining: remaining.length, online };
}

let unsubscribe: (() => void) | null = null;

export function setupFeedbackQueueHandlers() {
  // kickoff at startup
  processQueue();

  // listen to connectivity changes
  if (!unsubscribe) {
    unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        console.log('[Feedback][Queue] connectivity restored');
        // Avoid spamming: process only if not already running
        if (!isProcessing) {
          processQueue();
        }
      }
    });
  }

  return () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };
}
