import { Driver, TestRecord, AuditLogEntry, User } from '../types';

export interface OfflineAction {
  id: string;
  type: 'GATE_CLEARANCE' | 'PREVENTIVE_BLOCK' | 'FIELD_TEST_TAKEN';
  driverId: string;
  driverName: string;
  driverRut: string;
  timestamp: string;
  operatorName: string;
  operatorRut: string;
  details: string;
  synced: boolean;
}

export interface OfflineCacheStats {
  driversCount: number;
  logsCount: number;
  lastCachedAt: string | null;
  pendingActionsCount: number;
}

const STORAGE_KEYS = {
  DRIVERS_CACHE: 'bv360_offline_drivers_snapshot_v1',
  LOGS_CACHE: 'bv360_offline_logs_snapshot_v1',
  ACTIONS_QUEUE: 'bv360_offline_actions_queue_v1',
  LAST_CACHE_TIME: 'bv360_offline_last_cached_time_v1',
};

// ============================================================================
// 1. Service Worker Registration
// ============================================================================
export function registerServiceWorker(onSuccess?: () => void, onUpdate?: () => void) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[ServiceWorker] Service workers not supported by this browser.');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[ServiceWorker] Registered with scope:', registration.scope);
        if (onSuccess) onSuccess();

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('[ServiceWorker] New content available; please refresh.');
                if (onUpdate) onUpdate();
              } else {
                console.log('[ServiceWorker] Content cached for offline use.');
              }
            }
          };
        };
      })
      .catch((error) => {
        console.warn('[ServiceWorker] Registration failed:', error);
      });
  });
}

// ============================================================================
// 2. Driver & Log Snapshot Caching
// ============================================================================
export function saveDriversOfflineSnapshot(drivers: Driver[]): void {
  try {
    if (typeof window === 'undefined' || !drivers || drivers.length === 0) return;
    localStorage.setItem(STORAGE_KEYS.DRIVERS_CACHE, JSON.stringify(drivers));
    localStorage.setItem(STORAGE_KEYS.LAST_CACHE_TIME, new Date().toISOString());
  } catch (e) {
    console.warn('[OfflineManager] Failed to cache drivers snapshot:', e);
  }
}

export function getCachedDriversSnapshot(): Driver[] | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEYS.DRIVERS_CACHE);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('[OfflineManager] Failed to read cached drivers snapshot:', e);
    return null;
  }
}

export function saveLogsOfflineSnapshot(logs: AuditLogEntry[]): void {
  try {
    if (typeof window === 'undefined' || !logs) return;
    // Keep the most recent 100 logs for ultra-fast local memory access
    const trimmed = logs.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.LOGS_CACHE, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('[OfflineManager] Failed to cache logs snapshot:', e);
  }
}

export function getCachedLogsSnapshot(): AuditLogEntry[] | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS_CACHE);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('[OfflineManager] Failed to read cached logs snapshot:', e);
    return null;
  }
}

// ============================================================================
// 3. Field Offline Queue
// ============================================================================
export function getOfflineActionQueue(): OfflineAction[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIONS_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function enqueueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>): OfflineAction {
  const queue = getOfflineActionQueue();
  const newAction: OfflineAction = {
    ...action,
    id: `off-act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' }) + ' CLT',
    synced: false
  };

  queue.push(newAction);
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIONS_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.warn('[OfflineManager] Failed to enqueue action:', e);
  }

  return newAction;
}

export function clearOfflineActionQueue(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIONS_QUEUE);
  } catch (e) {}
}

export function getOfflineCacheStats(): OfflineCacheStats {
  const drivers = getCachedDriversSnapshot();
  const logs = getCachedLogsSnapshot();
  const queue = getOfflineActionQueue();
  const lastTime = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.LAST_CACHE_TIME) : null;

  return {
    driversCount: drivers ? drivers.length : 0,
    logsCount: logs ? logs.length : 0,
    lastCachedAt: lastTime ? new Date(lastTime).toLocaleTimeString('es-CL') : null,
    pendingActionsCount: queue.length
  };
}
