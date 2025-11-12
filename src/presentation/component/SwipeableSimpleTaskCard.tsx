import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import SimpleTaskCard from './SimpleTaskCard';
import { Task } from '../../application/services/tasks/tasksSQLiteService';
import { colors } from '../constants/colors';

interface SwipeableSimpleTaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const SWIPE_THRESHOLD = 100;

const SwipeableSimpleTaskCard: React.FC<SwipeableSimpleTaskCardProps> = ({
  task,
  onPress,
  onComplete,
  onDelete,
}) => {
  const translateX = useSharedValue(0);

  const handleComplete = () => {
    onComplete(task);
  };

  const handleDelete = () => {
    onDelete(task);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(0);
        runOnJS(handleComplete)();
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(0);
        runOnJS(handleDelete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const leftBackgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: colors.success,
      opacity: translateX.value > 0 ? Math.min(translateX.value / SWIPE_THRESHOLD, 1) : 0,
    };
  });

  const rightBackgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: colors.red,
      opacity: translateX.value < 0 ? Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1) : 0,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.background, leftBackgroundStyle]}>
        <View style={styles.leftAction}>
          <Text style={styles.actionText}>✓ Complete</Text>
        </View>
      </Animated.View>
      
      <Animated.View style={[styles.background, rightBackgroundStyle]}>
        <View style={styles.rightAction}>
          <Text style={styles.actionText}>✗ Delete</Text>
        </View>
      </Animated.View>
      
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>
          <SimpleTaskCard task={task} onPress={onPress} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 6,
    justifyContent: 'center',
  },
  leftAction: {
    justifyContent: 'center',
    paddingLeft: 30,
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 30,
  },
  actionText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});

export default SwipeableSimpleTaskCard;

