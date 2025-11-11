import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Task } from '../../application/services/tasks/tasksSQLiteService';
import { colors } from '../constants/colors';

interface SimpleTaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onMenuPress?: (task: Task) => void;
}

const SimpleTaskCard: React.FC<SimpleTaskCardProps> = ({ task, onPress, onMenuPress }) => {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 Day ago';
    if (diffInDays < 7) return `${diffInDays} Days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} Weeks ago`;
    return `${Math.floor(diffInDays / 30)} Months ago`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
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
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={[colors.pink, colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          <Text style={styles.iconText}>📝</Text>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>
        <Text style={styles.timeAgo}>
          {getTimeAgo(task.updated_at || task.created_at)}
        </Text>
        
        <View style={styles.detailsRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getStatusLabel(task.status)}</Text>
          </View>
          <View style={[styles.badge, styles.priorityBadge]}>
            <Text style={styles.badgeText}>{task.priority.toUpperCase()}</Text>
          </View>
          {task.due_date && (
            <Text style={styles.dueDate}>📅 {formatDate(task.due_date)}</Text>
          )}
        </View>

        {task.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {task.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {task.tags.length > 2 && (
              <Text style={styles.moreText}>+{task.tags.length - 2}</Text>
            )}
          </View>
        )}

        {task.description && (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => onMenuPress && onMenuPress(task)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.menuDot} />
        <View style={styles.menuDot} />
        <View style={styles.menuDot} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  iconContainer: {
    marginRight: 14,
    marginTop: 2
  },
  iconGradient: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconText: {
    fontSize: 24
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.blobBlue,
    marginBottom: 4
  },
  timeAgo: {
    fontSize: 13,
    color: colors.blobBlue,
    opacity: 0.5,
    marginBottom: 8
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 6
  },
  badge: {
    backgroundColor: colors.purple,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
    opacity: 0.9
  },
  priorityBadge: {
    backgroundColor: colors.pink,
    opacity: 0.9
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase'
  },
  dueDate: {
    fontSize: 11,
    color: colors.blobBlue,
    fontWeight: '600',
    marginLeft: 2
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 6
  },
  tag: {
    backgroundColor: colors.grey,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
    opacity: 0.6
  },
  tagText: {
    fontSize: 10,
    color: colors.blobBlue,
    fontWeight: '600'
  },
  moreText: {
    fontSize: 10,
    color: colors.blobBlue,
    opacity: 0.6,
    fontWeight: '600'
  },
  description: {
    fontSize: 13,
    color: colors.blobBlue,
    opacity: 0.7,
    lineHeight: 18,
    marginTop: 4
  },
  menuButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2
  },
  menuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.blobBlue,
    opacity: 0.4,
    marginVertical: 1.5
  }
});

export default SimpleTaskCard;

