import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../../application/services/tasks/tasksSQLiteService';
import { colors } from '../constants/colors';

interface TaskItemProps {
  task: Task;
  onPress: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onPress }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF6B6B';
      case 'medium':
        return '#FFA500';
      case 'low':
        return '#4ECDC4';
      default:
        return colors.grey;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in_progress':
        return '#2196F3';
      case 'pending':
        return '#FFC107';
      default:
        return colors.grey;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(task)}>
      <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {task.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
            <Text style={styles.statusText}>
              {task.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {task.description && (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.dueDate}>{formatDate(task.due_date)}</Text>
          {task.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {task.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {task.tags.length > 2 && (
                <Text style={styles.moreTagsText}>+{task.tags.length - 2}</Text>
              )}
            </View>
          )}
        </View>

        {task.sync_status === 'pending' && (
          <View style={styles.syncIndicator}>
            <Text style={styles.syncText}>Pending sync</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  priorityIndicator: {
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12
  },
  content: {
    flex: 1,
    padding: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginRight: 8
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  description: {
    fontSize: 14,
    color: colors.blobBlue,
    marginBottom: 8,
    opacity: 0.8
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dueDate: {
    fontSize: 12,
    color: colors.blobBlue,
    opacity: 0.6
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 4
  },
  tagText: {
    fontSize: 10,
    color: colors.purple,
    fontWeight: '500'
  },
  moreTagsText: {
    fontSize: 10,
    color: colors.blobBlue,
    marginLeft: 4,
    opacity: 0.6
  },
  syncIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.devider
  },
  syncText: {
    fontSize: 11,
    color: '#FFA500',
    fontWeight: '500'
  }
});

export default TaskItem;

