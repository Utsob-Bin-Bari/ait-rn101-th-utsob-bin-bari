import React from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Task } from '../../application/services/tasks/tasksSQLiteService';
import TaskItem from './TaskItem';
import { colors } from '../constants/colors';
import CustomButton from './CustomButton';

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  refreshing?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onTaskPress: (task: Task) => void;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading = false,
  refreshing = false,
  error,
  emptyMessage = 'No tasks found',
  onTaskPress,
  onRefresh,
  onLoadMore,
  hasMore = false
}) => {
  const renderItem = ({ item }: { item: Task }) => (
    <TaskItem task={item} onPress={onTaskPress} />
  );

  const renderEmpty = () => {
    if (loading && tasks.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📝</Text>
        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore || !onLoadMore) return null;

    return (
      <View style={styles.footerContainer}>
        <CustomButton
          text="Load More"
          onPress={onLoadMore}
        />  
      </View>
    );
  };

  return (
    <FlatList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={(item) => item.local_id || item.id}
      contentContainerStyle={[
        styles.listContent,
        tasks.length === 0 && styles.emptyListContent
      ]}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.purple]}
            tintColor={colors.purple}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.blobBlue,
    opacity: 0.6
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    paddingHorizontal: 32
  },
  footerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  loadMoreButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.purple
  }
});

export default TaskList;

