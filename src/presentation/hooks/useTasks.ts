import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../application/store/initialState';
import { tasksService } from '../../application/services/tasks/tasksService';
import { searchFilterService } from '../../application/services/tasks/searchFilterService';
import { paginationService } from '../../application/services/tasks/paginationService';
import { setTasks, setTasksLoading, setSyncStatus } from '../../application/store/action/tasks';
import { Task } from '../../application/services/tasks/tasksSQLiteService';
import { syncProcessor, startSyncProcessor } from '../../application/services/tasks/syncProcessor';
import { syncQueueService } from '../../application/services/tasks/syncQueueService';
import NetInfo from '@react-native-community/netinfo';

export const useTasks = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { tasks: allTasks, loading, syncStatus } = useSelector((state: RootState) => state.tasks);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    return searchFilterService.searchTasks(
      allTasks,
      searchQuery,
      statusFilter,
      selectedTags
    );
  }, [allTasks, searchQuery, statusFilter, selectedTags]);

  const taskCounts = useMemo(() => {
    return searchFilterService.getTaskCounts(allTasks);
  }, [allTasks]);

  const uniqueTags = useMemo(() => {
    return searchFilterService.extractUniqueTags(allTasks);
  }, [allTasks]);

  const updateSyncStatus = useCallback(async (isOnline: boolean) => {
    const stats = await syncQueueService.getQueueStats();
    dispatch(setSyncStatus({
      isOnline,
      isSyncing: syncProcessor.processingCount > 0,
      lastSyncAt: null,
      pendingCount: stats.pending
    }));
  }, [dispatch]);

  const loadTasks = useCallback(async () => {
    try {
      dispatch(setTasksLoading(true));
      const result = await tasksService.fetchTasks();
      
      if (result.success && result.data) {
        dispatch(setTasks(result.data));
        setError(null);
      } else {
        setError(result.error || 'Failed to load tasks');
      }
    } catch (err: any) {
      console.error('Error loading tasks:', err);
      setError(err.message || 'Failed to load tasks');
    } finally {
      dispatch(setTasksLoading(false));
    }
  }, [dispatch]);

  const setupSyncProcessor = useCallback(async () => {
    await startSyncProcessor();
  }, []);

  const setupNetworkListener = useCallback(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      updateSyncStatus(state.isConnected || false);
    });
    return unsubscribe;
  }, [updateSyncStatus]);

  useEffect(() => {
    loadTasks();
    setupSyncProcessor();
    const unsubscribe = setupNetworkListener();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loadTasks, setupSyncProcessor, setupNetworkListener]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    const netState = await NetInfo.fetch();
    await updateSyncStatus(netState.isConnected || false);
    setRefreshing(false);
  }, [loadTasks, updateSyncStatus]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleFilterStatus = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  const handleFilterTags = useCallback((tags: string[]) => {
    setSelectedTags(tags);
  }, []);

  const handleTaskPress = useCallback((task: Task) => {
    navigation.navigate('CreateTask', { taskId: task.local_id });
  }, [navigation]);

  const handleCreateTask = useCallback(() => {
    navigation.navigate('CreateTask');
  }, [navigation]);

  const loadMore = useCallback(() => {
  }, []);

  return {
    tasks: filteredTasks,
    loading,
    refreshing,
    error,
    searchQuery,
    statusFilter,
    selectedTags,
    syncStatus,
    taskCounts,
    uniqueTags,
    handleSearch,
    handleClearSearch,
    handleFilterStatus,
    handleFilterTags,
    handleTaskPress,
    handleCreateTask,
    handleRefresh,
    loadMore,
    hasMore: false
  };
};

