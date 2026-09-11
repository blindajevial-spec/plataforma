import { useState, useEffect, useCallback } from 'react';
import {
  getOfflineActionQueue,
  clearOfflineActionQueue,
  getOfflineCacheStats,
  OfflineAction,
  OfflineCacheStats
} from '../utils/offlineSyncManager';
import { useApp } from '../context/AppContext';

export function useNetworkAndOffline() {
  const { logAction, showToast, toggleDriverStatus } = useApp();

  const [realOnline, setRealOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  // Optional manual simulation toggle for testing offline field operations
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);

  // Queue of pending actions
  const [pendingQueue, setPendingQueue] = useState<OfflineAction[]>([]);
  const [cacheStats, setCacheStats] = useState<OfflineCacheStats>(getOfflineCacheStats());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Effective online status (false if real offline OR manually simulated offline)
  const isOnline = realOnline && !simulatedOffline;

  // Refresh queue and cache stats
  const refreshStats = useCallback(() => {
    setPendingQueue(getOfflineActionQueue());
    setCacheStats(getOfflineCacheStats());
  }, []);

  // Listen to browser network changes
  useEffect(() => {
    const handleOnline = () => {
      setRealOnline(true);
      showToast('Conexión restaurada. Sincronizando eventos de garita...');
    };

    const handleOffline = () => {
      setRealOnline(false);
      showToast('Modo Terreno Fuera de Línea: Se ha activado la memoria caché local.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshStats();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast, refreshStats]);

  // Synchronize offline queue to system audit logs and state
  const syncOfflineQueue = useCallback(async () => {
    const queue = getOfflineActionQueue();
    if (queue.length === 0) {
      showToast('No hay eventos pendientes de sincronización.');
      return 0;
    }

    setIsSyncing(true);
    let syncedCount = 0;

    try {
      for (const item of queue) {
        if (item.type === 'GATE_CLEARANCE') {
          logAction(
            'SINCRONIZACION_OFFLINE_GARITA',
            'Driver',
            item.driverId,
            `[OFFLINE SINCRONIZADO] ${item.details} (Registrado localmente: ${item.timestamp}) por ${item.operatorName} (${item.operatorRut})`
          );
          syncedCount++;
        } else if (item.type === 'PREVENTIVE_BLOCK') {
          toggleDriverStatus(item.driverId, item.details);
          logAction(
            'SINCRONIZACION_OFFLINE_BLOQUEO',
            'Driver',
            item.driverId,
            `[OFFLINE SINCRONIZADO] Bloqueo preventivo de conductor ${item.driverName} (${item.driverRut}) registrado fuera de línea a las ${item.timestamp}`
          );
          syncedCount++;
        }
      }

      clearOfflineActionQueue();
      refreshStats();
      showToast(`¡Sincronización exitosa! Se han consolidado ${syncedCount} eventos en la bitácora.`);
    } catch (e) {
      console.error('Error syncing offline queue:', e);
      showToast('Error al sincronizar la cola fuera de línea.');
    } finally {
      setIsSyncing(false);
    }

    return syncedCount;
  }, [logAction, toggleDriverStatus, showToast, refreshStats]);

  // Auto-sync when transitioning back to online
  useEffect(() => {
    if (isOnline) {
      const queue = getOfflineActionQueue();
      if (queue.length > 0) {
        syncOfflineQueue();
      }
    }
  }, [isOnline, syncOfflineQueue]);

  return {
    isOnline,
    realOnline,
    simulatedOffline,
    setSimulatedOffline,
    pendingQueue,
    cacheStats,
    isSyncing,
    syncOfflineQueue,
    refreshStats
  };
}
