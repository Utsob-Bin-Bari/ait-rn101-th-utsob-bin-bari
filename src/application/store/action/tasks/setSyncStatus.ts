export const setSyncStatus = (status: {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  pendingCount: number;
}) => ({
  type: 'SET_SYNC_STATUS' as const,
  payload: status
});

