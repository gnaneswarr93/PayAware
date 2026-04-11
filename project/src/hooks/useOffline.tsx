import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * Network Status Hook
 * Monitors online/offline state and provides reconnection handling
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Show reconnection message
        console.log('Back online! Syncing data...');
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
};

/**
 * Network Status Banner Component
 */
export const NetworkStatusBanner = () => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-xl text-sm font-bold transition-all duration-500 transform ${
        isOnline
          ? 'bg-emerald-500 text-white translate-y-0 opacity-100'
          : 'bg-rose-500 text-white translate-y-0 opacity-100 shadow-rose-200'
      }`}
    >
      <div className="flex items-center justify-center gap-2.5">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 animate-pulse" />
            <span>Offline Mode</span>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Offline Storage Service
 * Queues operations when offline and syncs when back online
 */
interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  timestamp: number;
  data: any;
}

class OfflineQueueService {
  private queue: QueuedOperation[] = [];
  private readonly STORAGE_KEY = 'payaware_offline_queue';

  constructor() {
    this.loadQueue();
    this.setupSyncListener();
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load offline queue:', e);
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error('Failed to save offline queue:', e);
    }
  }

  private setupSyncListener() {
    window.addEventListener('online', () => {
      this.processQueue();
    });
  }

  public addOperation(type: QueuedOperation['type'], data: any) {
    const operation: QueuedOperation = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      data,
    };

    this.queue.push(operation);
    this.saveQueue();
    return operation.id;
  }

  public async processQueue() {
    if (!navigator.onLine || this.queue.length === 0) return;

    console.log(`Processing ${this.queue.length} queued operations...`);
    const operations = [...this.queue];
    this.queue = [];
    this.saveQueue();

    for (const op of operations) {
      try {
        // Process each operation
        // This will be integrated with your actual API calls
        console.log('Processing operation:', op);
        // await api.syncOperation(op);
      } catch (error) {
        console.error('Failed to process operation:', op, error);
        // Re-queue failed operations
        this.queue.push(op);
      }
    }

    this.saveQueue();
  }

  public getQueueSize() {
    return this.queue.length;
  }

  public clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
}

export const offlineQueue = new OfflineQueueService();
