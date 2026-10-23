// ==========================================
// DENCKER PAN — CROSS-TAB & REALTIME SYNC BUS
// Sub-millisecond communication between tabs
// ==========================================

export type SyncEventType =
  | 'NEW_ORDER'
  | 'WAITER_CALL'
  | 'ITEM_READY'
  | 'ORDER_READY'
  | 'PAYMENT_COMPLETED'
  | 'TABLE_STATUS_CHANGED';

export interface SyncMessage {
  type: SyncEventType;
  payload: any;
  timestamp: number;
}

const processedEventKeys = new Set<string>();

/**
 * Checks if an event key has already been handled recently.
 * Returns true if this is the first time (and marks it), false if duplicate.
 */
export function markEventHandled(key: string, ttlMs: number = 15000): boolean {
  if (!key) return true;
  if (processedEventKeys.has(key)) return false;
  processedEventKeys.add(key);
  setTimeout(() => {
    processedEventKeys.delete(key);
  }, ttlMs);
  return true;
}

let channelInstance: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!('BroadcastChannel' in window)) return null;
  if (!channelInstance) {
    channelInstance = new BroadcastChannel('dencker_pan_realtime_bus');
  }
  return channelInstance;
}

export function broadcastSync(type: SyncEventType, payload: any) {
  if (typeof window === 'undefined') return;
  try {
    const ch = getChannel();
    if (ch) {
      ch.postMessage({
        type,
        payload,
        timestamp: Date.now(),
      } as SyncMessage);
    }
  } catch (err) {
    console.warn('BroadcastChannel error:', err);
  }
}

export function subscribeToSync(handler: (msg: SyncMessage) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  try {
    const ch = getChannel();
    if (!ch) return () => {};

    const onMessage = (event: MessageEvent<SyncMessage>) => {
      if (event.data && event.data.type) {
        handler(event.data);
      }
    };

    ch.addEventListener('message', onMessage);
    return () => {
      ch.removeEventListener('message', onMessage);
    };
  } catch (err) {
    console.warn('subscribeToSync error:', err);
    return () => {};
  }
}
