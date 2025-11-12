import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Task } from '../../application/services/tasks/tasksSQLiteService';
import { colors } from '../constants/colors';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(task)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[colors.pink, colors.purple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.topRightBlob} />
        <View style={styles.bottomLeftBlob} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {task.title}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {getStatusLabel(task.status)}
              </Text>
            </View>
          </View>

          {task.description && (
            <Text style={styles.description} numberOfLines={4}>
              {task.description}
            </Text>
          )}

          <View style={styles.tagsContainer}>
            {task.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {task.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{task.tags.length - 3}</Text>
            )}
          </View>

          <View style={styles.footer}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Due Date</Text>
              <Text style={styles.dateText}>{formatDate(task.due_date)}</Text>
            </View>
            <View style={styles.priorityContainer}>
              <Text style={styles.priorityLabel}>Priority</Text>
              <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 328,
    height: 325,
    marginRight: 16,
    marginVertical: 8
  },
  gradient: {
    flex: 1,
    borderRadius: 19,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  },
  topRightBlob: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.blobBlue,
    opacity: 0.3
  },
  bottomLeftBlob: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.blobBlue,
    opacity: 0.3
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between'
  },
  header: {
    marginBottom: 12
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 12
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)'
  },
  statusText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  description: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
    opacity: 0.9,
    marginBottom: 12
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6
  },
  tagText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '600'
  },
  moreTagsText: {
    fontSize: 11,
    color: colors.white,
    opacity: 0.8,
    alignSelf: 'center',
    marginLeft: 4
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)'
  },
  dateContainer: {
    flex: 1
  },
  dateLabel: {
    fontSize: 10,
    color: colors.white,
    opacity: 0.7,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  dateText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '600'
  },
  priorityContainer: {
    flex: 1,
    alignItems: 'flex-end'
  },
  priorityLabel: {
    fontSize: 10,
    color: colors.white,
    opacity: 0.7,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  priorityText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '700'
  },
  syncIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(255, 165, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  syncText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600'
  }
});

export default TaskCard;

