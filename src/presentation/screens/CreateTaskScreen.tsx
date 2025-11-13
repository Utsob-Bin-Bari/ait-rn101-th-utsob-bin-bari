import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTaskEditor } from '../hooks/useTaskEditor';
import Header from '../component/Header';
import BackButton from '../component/svgs/BackButton';
import CustomTextInput from '../component/CustomTextInput';
import CustomButton from '../component/CustomButton';
import { colors } from '../constants/colors';
import { useFocusStatusBar, STATUS_BAR_CONFIGS } from '../utils';

const CreateTaskScreen = ({ navigation, route }: any) => {
  useFocusStatusBar(STATUS_BAR_CONFIGS.create);

  const {
    task,
    loading,
    saving,
    imageUri,
    errors,
    isEditMode,
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
  } = useTaskEditor({ navigation, taskId: route.params?.taskId });

  const showImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => handleImagePick('camera')
        },
        {
          text: 'Gallery',
          onPress: () => handleImagePick('gallery')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const formatDisplayDate = (dateString: string | null) => {
    if (!dateString) return 'Select date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDisplayTime = (dateString: string | null) => {
    if (!dateString) return 'Select time';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.pink, colors.purple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientSection}
      >
        <View style={styles.topRightCircle} />
        <View style={styles.bottomLeftCircle} />
        
        <Header 
          title={isEditMode ? 'Edit Task' : 'Create A Task'} 
          LeftIcon={BackButton} 
          onLeftIconPress={() => navigation.navigate('Tasks',{ screen: 'AllTasks' })} 
          color={colors.white}
        />
      </LinearGradient>

      <View style={styles.solidSection}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <CustomTextInput
              value={task.title}
              onChangeText={(text) => handleFieldChange('title', text)}
              placeholder="Enter task title"
            />

            <CustomTextInput
              label="Description"
              value={task.description}
              onChangeText={(text) => handleFieldChange('description', text)}
              placeholder="Enter task description"
              multiline
              numberOfLines={4}
              error={errors.description.join(', ')}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusButtons}>
                {['pending', 'in_progress', 'completed'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      task.status === status && styles.statusButtonActive
                    ]}
                    onPress={() => handleFieldChange('status', status)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        task.status === status && styles.statusButtonTextActive
                      ]}
                    >
                      {status.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.statusButtons}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.statusButton,
                      task.priority === priority && styles.statusButtonActive
                    ]}
                    onPress={() => handleFieldChange('priority', priority)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        task.priority === priority && styles.statusButtonTextActive
                      ]}
                    >
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.dateTimeContainer}>
              <Text style={styles.label}>Due Date & Time</Text>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={handleShowDatePicker}
                >
                  <Text style={styles.dateTimeLabel}>Date</Text>
                  <Text style={styles.dateTimeText}>{formatDisplayDate(task.due_date ?? null)}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={handleShowTimePicker}
                >
                  <Text style={styles.dateTimeLabel}>Time</Text>
                  <Text style={styles.dateTimeText}>{formatDisplayTime(task.due_date ?? null)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <CustomTextInput
              label="Tags (comma separated)"
              value={task.tags?.join(', ')}
              onChangeText={handleTagsChange}
              placeholder="work, urgent, meeting"
            />

            <View style={styles.imageContainer}>
              <Text style={styles.label}>Image Attachment</Text>
              {imageUri ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: imageUri }} style={styles.image} />
                  <TouchableOpacity style={styles.removeButton} onPress={handleImageRemove}>
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addImageButton} onPress={showImagePicker}>
                  <Text style={styles.addImageText}>+ Add Image</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <CustomButton
                text={isEditMode ? 'Update Task' : 'Create Task'}
                onPress={handleSave}
                loading={saving}
              />

              {isEditMode && (
                <CustomButton
                  text="Delete Task"
                  onPress={handleDelete}
                  loading={saving}
                  style={styles.deleteButton}
                />
              )}
            </View>
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  gradientSection: {
    height: 150,
    position: 'relative',
    overflow: 'hidden'
  },
  topRightCircle: {
    position: 'absolute',
    top: -150,
    right: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.blobBlue,
    opacity: 0.5
  },
  bottomLeftCircle: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.blobBlue,
    opacity: 0.5
  },
  solidSection: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -30
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 40
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  label: {
    fontSize: 14,
    color: colors.devider,
    marginBottom: 8,
    fontWeight: '500'
  },
  pickerContainer: {
    marginBottom: 16
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.devider,
    backgroundColor: colors.white,
    alignItems: 'center'
  },
  statusButtonActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple
  },
  statusButtonText: {
    fontSize: 14,
    color: colors.blobBlue,
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  statusButtonTextActive: {
    color: colors.white
  },
  imageContainer: {
    marginBottom: 16
  },
  imagePreview: {
    alignItems: 'center'
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12
  },
  removeButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  removeButtonText: {
    color: colors.white,
    fontWeight: '600'
  },
  addImageButton: {
    backgroundColor: colors.white,
    paddingVertical: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.devider,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addImageText: {
    fontSize: 16,
    color: colors.purple,
    fontWeight: '600'
  },
  buttonContainer: {
    marginTop: 20
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    marginTop: 12
  },
  dateTimeContainer: {
    marginBottom: 16
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  dateTimeButton: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.devider
  },
  dateTimeLabel: {
    fontSize: 12,
    color: colors.devider,
    marginBottom: 6,
    fontWeight: '500'
  },
  dateTimeText: {
    fontSize: 15,
    color: colors.blobBlue,
    fontWeight: '600'
  }
});

export default CreateTaskScreen;
