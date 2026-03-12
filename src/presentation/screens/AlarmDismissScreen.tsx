import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../../application/store/initialState';
import { tasksService } from '../../application/services/tasks/tasksService';
import { notificationService } from '../../application/services/notifications/notificationService';
import { alarmAudioService } from '../../application/services/audio/alarmAudioService';
import { imageService } from '../../application/services/tasks/imageService';
import { photoComparisonService } from '../../application/services/photos/photoComparisonService';
import { Task } from '../../application/services/tasks/tasksSQLiteService';
import { colors } from '../constants/colors';

/** Which dismiss mode is active for this task's alarm. */
type DismissMode =
  | 'photo'      // photo_dismiss_enabled=1 + ref path present → camera comparison
  | 'no-ref'     // photo_dismiss_enabled=1 but no ref path → warning + simple dismiss
  | 'simple';    // photo_dismiss_enabled=0 → plain dismiss button

function getDismissMode(task: Task): DismissMode {
  if (task.photo_dismiss_enabled === 1) {
    return task.photo_dismiss_ref_path ? 'photo' : 'no-ref';
  }
  return 'simple';
}

const AlarmDismissScreen = ({ navigation, route }: any) => {
  const taskId: string = route?.params?.taskId ?? '';

  const taskFromStore = useSelector((state: RootState) =>
    state.tasks.tasks.find(
      (t: Task) => t.local_id === taskId || t.server_id === taskId
    )
  );

  const [task, setTask] = useState<Task | null>(taskFromStore ?? null);
  const [loading, setLoading] = useState(!taskFromStore);
  const [comparing, setComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskFromStore && taskId) {
      loadTask();
    }
  }, [taskId]);

  // Start looping alarm sound on mount; stop and release on unmount.
  useEffect(() => {
    alarmAudioService.start();
    return () => {
      alarmAudioService.stop();
    };
  }, []);

  const loadTask = async () => {
    try {
      setLoading(true);
      const result = await tasksService.getTaskById(taskId);
      if (result.success && result.data) {
        setTask(result.data);
      }
    } catch (err) {
      console.error('AlarmDismissScreen: failed to load task', err);
    } finally {
      setLoading(false);
    }
  };

  /** Called after a passing comparison or when photo-dismiss is disabled. */
  const dismissAlarm = async () => {
    alarmAudioService.stop();
    await notificationService.cancelAlarmNotification(taskId);
    navigation.goBack();
  };

  const handleSnooze = () => {
    alarmAudioService.stop();
    navigation.goBack();
  };

  /** AC1–AC3: Open camera, compare against ref photo, dismiss or show error. */
  const handleTakePhoto = async () => {
    if (!task?.photo_dismiss_ref_path) return;

    setCompareError(null);
    setComparing(true);

    try {
      // 1. Capture live photo
      const liveAsset = await imageService.pickImageFromCamera();
      if (!liveAsset) {
        setComparing(false);
        return; // user cancelled
      }

      if (!liveAsset.base64) {
        setCompareError('Could not read photo data. Please try again.');
        setComparing(false);
        return;
      }

      // 2. Load reference photo base64 from disk
      const refPath = task.photo_dismiss_ref_path as string;
      let refBase64: string | null = null;
      try {
        refBase64 = await imageService.getImageFromLocal(refPath);
      } catch {
        // Ref photo missing from disk → fall back to simple dismiss
        await dismissAlarm();
        return;
      }

      if (!refBase64) {
        // File existed but returned empty → fall back
        await dismissAlarm();
        return;
      }

      // 3. Compare
      const tolerance = task.photo_dismiss_tolerance ?? 0.7;
      const result = photoComparisonService.comparePhotos(
        liveAsset.base64,
        refBase64,
        tolerance
      );

      if (result.passed) {
        await dismissAlarm();
      } else {
        setCompareError(
          `Photo doesn't match — try again (score: ${(result.score * 100).toFixed(0)}%)`
        );
      }
    } catch (err: any) {
      console.error('AlarmDismissScreen: photo comparison error', err);
      setCompareError('Something went wrong. Please try again.');
    } finally {
      setComparing(false);
    }
  };

  const formatAlarmTime = (isoString: string | null | undefined) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Task not found.</Text>
        <TouchableOpacity style={styles.dismissButtonFallback} onPress={() => navigation.goBack()}>
          <Text style={styles.dismissFallbackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const mode = getDismissMode(task);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.pink, colors.purple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.topBlob} />
        <View style={styles.bottomBlob} />

        <View style={styles.content}>
          <Text style={styles.alarmEmoji}>⏰</Text>
          <Text style={styles.alarmLabel}>Alarm</Text>
          {task.alarm_time ? (
            <Text style={styles.alarmTime}>{formatAlarmTime(task.alarm_time)}</Text>
          ) : null}

          <Text style={styles.taskTitle} numberOfLines={3}>
            {task.title}
          </Text>

          {task.description ? (
            <Text style={styles.taskDescription} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}

          {/* ─── Mode A: photo compare ─────────────────────── */}
          {mode === 'photo' && (
            <>
              <View style={styles.photoBadge}>
                <Text style={styles.photoBadgeText}>📷  Photo required to dismiss</Text>
              </View>

              {compareError ? (
                <View style={styles.errorBadge}>
                  <Text style={styles.errorBadgeText}>{compareError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.dismissButton, comparing && styles.dismissButtonDisabled]}
                onPress={handleTakePhoto}
                disabled={comparing}
                activeOpacity={0.85}
              >
                {comparing ? (
                  <ActivityIndicator color={colors.purple} />
                ) : (
                  <Text style={styles.dismissButtonText}>
                    {compareError ? '📸 Retake Photo' : '📸 Take Photo to Dismiss'}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* ─── Mode B: no ref photo — simple dismiss with warning ─── */}
          {mode === 'no-ref' && (
            <>
              <View style={styles.warningBadge}>
                <Text style={styles.warningBadgeText}>⚠️  No reference photo set</Text>
              </View>

              <TouchableOpacity
                style={styles.dismissButton}
                onPress={dismissAlarm}
                activeOpacity={0.85}
              >
                <Text style={styles.dismissButtonText}>Dismiss Alarm</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ─── Mode C: photo-dismiss disabled — plain dismiss ─── */}
          {mode === 'simple' && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={dismissAlarm}
              activeOpacity={0.85}
            >
              <Text style={styles.dismissButtonText}>Dismiss Alarm</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.snoozeButton} onPress={handleSnooze}>
            <Text style={styles.snoozeText}>Snooze (go back)</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  topBlob: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.blobBlue,
    opacity: 0.3,
  },
  bottomBlob: {
    position: 'absolute',
    bottom: -120,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.blobBlue,
    opacity: 0.3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  alarmEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  alarmLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  alarmTime: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 24,
  },
  taskTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 34,
  },
  taskDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  photoBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  photoBadgeText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  warningBadge: {
    backgroundColor: 'rgba(255,149,0,0.25)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,149,0,0.5)',
  },
  warningBadgeText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  errorBadge: {
    backgroundColor: 'rgba(255,59,48,0.25)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.5)',
    width: '100%',
    alignItems: 'center',
  },
  errorBadgeText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  dismissButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
    minHeight: 54,
    justifyContent: 'center',
  },
  dismissButtonDisabled: {
    opacity: 0.7,
  },
  dismissButtonFallback: {
    marginTop: 20,
    backgroundColor: colors.purple,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  dismissButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.purple,
  },
  dismissFallbackText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  snoozeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  snoozeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.blobBlue,
    opacity: 0.6,
    marginBottom: 16,
  },
});

export default AlarmDismissScreen;
