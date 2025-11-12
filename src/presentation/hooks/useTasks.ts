import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../application/store/initialState';
import { tasksService } from '../../application/services/tasks/tasksService';
import { searchFilterService } from '../../application/services/tasks/searchFilterService';
import { setTasks, setTasksLoading, setSyncStatus } from '../../application/store/action/tasks';
import { Task } from '../../application/services/tasks/tasksSQLiteService';
import { syncProcessor, startSyncProcessor } from '../../application/services/tasks/syncProcessor';
import { syncQueueService } from '../../application/services/tasks/syncQueueService';
import { syncCleanupService } from '../../application/services/tasks/syncCleanupService';
import { syncDebugService } from '../../application/services/tasks/syncDebugService';
import { NetworkService } from '../../infrastructure/utils';

export const useTasks = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { tasks: allTasks, loading, syncStatus } = useSelector((state: RootState) => state.tasks);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [displayedTasks, setDisplayedTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  const filteredTasks = useMemo(() => 
    searchFilterService.searchTasks(
      allTasks,
      searchQuery,
      statusFilter,
      selectedTags
    ),
    [allTasks, searchQuery, statusFilter, selectedTags]
  );

  const taskCounts = useMemo(() => 
    searchFilterService.getTaskCounts(allTasks),
    [allTasks]
  );
  const uniqueTags = useMemo(() => 
    searchFilterService.extractUniqueTags(allTasks),
    [allTasks]
  );

  useEffect(() => {
    syncCleanupService.performInitialCleanup();
    loadTasks();
    setupSyncProcessor();
    setupNetworkListener();
  }, []);

  useEffect(() => {
    setDisplayedTasks(filteredTasks);
  }, [filteredTasks]);

  const setupSyncProcessor = async () => {
    await startSyncProcessor();
    setTimeout(async () => {
      await syncDebugService.logSyncStatus();
    }, 3000);
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetworkService.subscribeToNetworkState((isConnected) => {
      updateSyncStatus(isConnected);
    });
    return unsubscribe;
  };
  useEffect(() => {
    loadTasks();
    setupSyncProcessor();
    const unsubscribe = setupNetworkListener();
    
    return () => {
      unsubscribe();
    };
  }, []);

  const updateSyncStatus = async (isOnline: boolean) => {
    const stats = await syncQueueService.getQueueStats();
    dispatch(setSyncStatus({
      isOnline,
      isSyncing: syncProcessor.processingCount > 0,
      lastSyncAt: null,
      pendingCount: stats.pending
    }));
  };

  const loadTasks = async () => {
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
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    const networkState = await NetworkService.getCurrentNetworkState();
    await updateSyncStatus(networkState.isConnected || false);
    setRefreshing(false);
  }, []);

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

  const handleTaskPressFromHome = useCallback((task: Task) => {
    navigation.navigate('Tasks', { screen: 'CreateTask', params: { taskId: task.local_id } });
  }, [navigation]);

  const handleCreateTask = useCallback(() => {
    navigation.navigate('CreateTask');
  }, [navigation]);

  const loadMore = useCallback(() => {
  }, []);

  const handleCompleteTask = useCallback(async (task: Task) => {
    if (task.status === 'completed') return;
    
    try {
      const result = await tasksService.updateTask(task.local_id, { status: 'completed' });
      if (result.success) {
        await loadTasks();
      }
    } catch (err: any) {
      console.error('Error completing task:', err);
    }
  }, []);

  const handleDeleteTask = useCallback(async (task: Task) => {
    try {
      const result = await tasksService.deleteTask(task.local_id);
      if (result.success) {
        await loadTasks();
      }
    } catch (err: any) {
      console.error('Error deleting task:', err);
    }
  }, []);

  return {
    tasks: displayedTasks,
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
    handleTaskPressFromHome,
    handleCreateTask,
    handleRefresh,
    handleCompleteTask,
    handleDeleteTask,
    loadMore,
    hasMore: false
  };
};

