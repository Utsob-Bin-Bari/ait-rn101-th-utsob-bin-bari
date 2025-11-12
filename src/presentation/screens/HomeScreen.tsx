import React, { useMemo } from 'react';
import { View, ScrollView, FlatList, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusStatusBar, STATUS_BAR_CONFIGS } from '../utils';
import Header from '../component/Header';
import ProfileIcon from '../component/svgs/ProfileIcon';
import FilterButtons from '../component/FilterButtons';
import HorizontalTaskList from '../component/HorizontalTaskList';
import { colors } from '../constants/colors';
import commonStyles from '../styles/commonStyles';
import { RootState } from '../../application/store/initialState';
import { useTasks } from '../hooks/useTasks';
import SwipeableSimpleTaskCard from '../component/SwipeableSimpleTaskCard';
import { Task } from '../../application/services/tasks/tasksSQLiteService';

const HomeScreen = ({ navigation }: any) => {
  useFocusStatusBar(STATUS_BAR_CONFIGS.home);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const userName = user?.name || 'Guest';
  const allTasksFromStore = useSelector((state: RootState) => state.tasks.tasks);

  const {
    tasks,
    loading,
    error,
    statusFilter,
    handleFilterStatus,
    handleTaskPressFromHome,
    handleCompleteTask,
    handleDeleteTask
  } = useTasks({ navigation });

  const inProgressTasks = useMemo(() => 
    allTasksFromStore.filter((task: Task) => task.status === 'in_progress'),
    [allTasksFromStore]
  );

  const handleProfilePress = () => {
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <SwipeableSimpleTaskCard
      task={item}
      onPress={handleTaskPressFromHome}
      onComplete={handleCompleteTask}
      onDelete={handleDeleteTask}
    />
  );

  return (
    <View style={commonStyles.container}>
      <Header
        leftText={userName}
        RightIcon={ProfileIcon}
        onRightIconPress={handleProfilePress}
        color={colors.blobBlue}
        showBorder={true}
      />
      <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
      
      <View style={{ paddingHorizontal: 16, paddingTop:20, width: '110%', alignSelf: 'center' }}>
        <FilterButtons
          statusFilter={statusFilter}
          onStatusChange={handleFilterStatus}
        />
      </View>

      <HorizontalTaskList
        tasks={tasks}
        loading={loading}
        error={error}
        emptyMessage="No tasks found. Create your first task!"
        onTaskPress={handleTaskPressFromHome}
      />

      <View style={{ paddingTop: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.blobBlue, marginBottom: 12, marginHorizontal: 20 }}>
          In Progress
        </Text>
        {inProgressTasks.length === 0 ? (
          <Text style={{ fontSize: 14, color: colors.blobBlue, opacity: 0.6, textAlign: 'center', paddingVertical: 20 }}>
            No tasks in progress
          </Text>
        ) : (
          <FlatList
            data={inProgressTasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.local_id}
            scrollEnabled={false}
            contentContainerStyle={{ gap: 0}}
      />
        )}
      </View>
    </ScrollView>
    </View>
    
  );
};

export default HomeScreen;