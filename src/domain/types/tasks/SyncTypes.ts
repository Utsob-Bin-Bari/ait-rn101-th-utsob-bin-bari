export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  pendingCount: number;
  failedCount: number;
}

export interface SyncResult {
  success: boolean;
  processed: number;
  failed: number;
  error?: string;
}

export interface QueueStats {
  pending: number;
  completed: number;
  failed: number;
}

