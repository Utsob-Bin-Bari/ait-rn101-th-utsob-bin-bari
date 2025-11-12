import React from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Task } from '../../application/services/tasks/tasksSQLiteService';
import TaskCard from './TaskCard';
import { colors } from '../constants/colors';

interface HorizontalTaskListProps {
  tasks: Task[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onTaskPress: (task: Task) => void;
}

const HorizontalTaskList: React.FC<HorizontalTaskListProps> = ({
  tasks,
  loading = false,
  error,
  emptyMessage = 'No tasks found',
  onTaskPress
}) => {
  const renderItem = ({ item }: { item: Task }) => (
    <TaskCard task={item} onPress={onTaskPress} />
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
        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={(item) => item.local_id || item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={renderEmpty}
      snapToInterval={344}
      decelerationRate="fast"
      snapToAlignment="start"
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    width: 328,
    height: 325,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.blobBlue,
    opacity: 0.6,
    textAlign: 'center'
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    paddingHorizontal: 32
  }
});

export default HorizontalTaskList;

