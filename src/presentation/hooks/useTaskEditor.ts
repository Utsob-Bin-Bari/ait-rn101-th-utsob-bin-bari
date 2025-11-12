import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Alert } from 'react-native';
import { tasksService } from '../../application/services/tasks/tasksService';
import { taskEditorService } from '../../application/services/tasks/taskEditorService';
import { imageService } from '../../application/services/tasks/imageService';
import { userSessionStorage } from '../../infrastructure/storage/userSessionStorage';
import { addTask, updateTask as updateTaskAction } from '../../application/store/action/tasks';
import { CreateTaskPayload } from '../../domain/types/tasks/TaskType';

export const useTaskEditor = ({ navigation, taskId }: any) => {
  const dispatch = useDispatch();

  const [task, setTask] = useState<Partial<CreateTaskPayload>>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: null,
    tags: [],
    image_path: null,
    image_url: null
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [errors, setErrors] = useState<{
    title: string[];
    description: string[];
    due_date: string[];
  }>({
    title: [],
    description: [],
    due_date: []
  });

  useEffect(() => {
    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  useEffect(() => {
    if (task.due_date) {
      setSelectedDate(new Date(task.due_date));
    }
  }, [task.due_date]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const result = await tasksService.getTaskById(taskId);
      
      if (result.success && result.data) {
        setTask({
          title: result.data.title,
          description: result.data.description,
          status: result.data.status as 'pending' | 'in_progress' | 'completed',
          priority: result.data.priority as 'low' | 'medium' | 'high',
          due_date: result.data.due_date,
          tags: result.data.tags,
          image_path: result.data.image_path,
          image_url: result.data.image_url
        });
        
        if (result.data.image_path) {
          setImageUri(result.data.image_path);
        }
      }
    } catch (error) {
      console.error('Error loading task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = useCallback((field: string, value: any) => {
    setTask(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: [] }));
  }, []);

  const handleTagsChange = useCallback((tagsInput: string) => {
    const tags = taskEditorService.parseTagsInput(tagsInput);
    setTask(prev => ({ ...prev, tags }));
  }, []);

  const handleImagePick = useCallback(async (source: 'camera' | 'gallery') => {
    try {
      let imageAsset;
      
      if (source === 'camera') {
        imageAsset = await imageService.pickImageFromCamera();
      } else {
        imageAsset = await imageService.pickImageFromGallery();
      }

      if (imageAsset) {
        const compressed = await imageService.compressImage(imageAsset);
        if (compressed) {
          setImageUri(compressed.uri);
          setTask(prev => ({ ...prev, image_path: compressed.uri }));
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  }, []);

  const handleImageRemove = useCallback(() => {
    setImageUri(null);
    setTask(prev => ({ ...prev, image_path: null, image_url: null }));
  }, []);

  const handleDateChange = useCallback((event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      const currentDateTime = task.due_date ? new Date(task.due_date) : new Date();
      date.setHours(currentDateTime.getHours());
      date.setMinutes(currentDateTime.getMinutes());
      setSelectedDate(date);
      setTask(prev => ({ ...prev, due_date: date.toISOString() }));
    }
  }, [task.due_date]);

  const handleTimeChange = useCallback((event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      const dateToUpdate = task.due_date ? new Date(task.due_date) : new Date();
      dateToUpdate.setHours(time.getHours());
      dateToUpdate.setMinutes(time.getMinutes());
      setSelectedDate(dateToUpdate);
      setTask(prev => ({ ...prev, due_date: dateToUpdate.toISOString() }));
    }
  }, [task.due_date]);

  const handleShowDatePicker = useCallback(() => {
    setShowDatePicker(true);
  }, []);

  const handleShowTimePicker = useCallback(() => {
    setShowTimePicker(true);
  }, []);

  const validateTask = useCallback(() => {
    const validation = taskEditorService.validateTask(task);
    setErrors(validation.fieldErrors);
    return validation.isValid;
  }, [task]);

  const handleSave = useCallback(async () => {
    if (!validateTask()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    try {
      setSaving(true);

      const sessionResult = await userSessionStorage.get();
      if (!sessionResult.success || !sessionResult.data) {
        Alert.alert('Error', 'No active session');
        return;
      }

      const userId = sessionResult.data.id;

      if (taskId) {
        const updates = taskEditorService.prepareTaskForUpdate(task);
        const result = await tasksService.updateTask(taskId, updates);
        
        if (result.success) {
          dispatch(updateTaskAction(taskId, updates));
          navigation.goBack();
        } else {
          Alert.alert('Error', result.error || 'Failed to update task');
        }
      } else {
        const preparedTask = taskEditorService.prepareTaskForSave(task, userId);
        const result = await tasksService.createTask(preparedTask);
        
        if (result.success && result.data) {
          dispatch(addTask(result.data));
          navigation.goBack();
        } else {
          Alert.alert('Error', result.error || 'Failed to create task');
        }
      }
    } catch (error: any) {
      console.error('Error saving task:', error);
      Alert.alert('Error', error.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  }, [task, taskId, validateTask, navigation, dispatch]);

  const handleDelete = useCallback(async () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              const result = await tasksService.deleteTask(taskId);
              
              if (result.success) {
                navigation.goBack();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete task');
              }
            } catch (error: any) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', error.message || 'Failed to delete task');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  }, [taskId, navigation]);

  return {
    task,
    loading,
    saving,
    imageUri,
    errors,
    isEditMode: !!taskId,
    showDatePicker,
    showTimePicker,
    selectedDate,
    handleFieldChange,
    handleTagsChange,
    handleImagePick,
    handleImageRemove,
    handleDateChange,
    handleTimeChange,
    handleShowDatePicker,
    handleShowTimePicker,
    handleSave,
    handleDelete
  };
};

