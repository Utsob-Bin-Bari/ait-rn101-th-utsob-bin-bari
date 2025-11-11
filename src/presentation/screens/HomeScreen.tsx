import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusStatusBar, STATUS_BAR_CONFIGS } from '../utils';
import Header from '../component/Header';
import ProfileIcon from '../component/svgs/ProfileIcon';
import FilterButtons from '../component/FilterButtons';
import HorizontalTaskList from '../component/HorizontalTaskList';
import { colors } from '../constants/colors';
import commonStyles from '../styles/commonStyles';
import { RootState } from '../../domain/types/store/AuthState';
import { useTasks } from '../hooks/useTasks';

const HomeScreen = ({ navigation }: any) => {
  useFocusStatusBar(STATUS_BAR_CONFIGS.home);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const userName = user?.name || 'Guest';

  const {
    tasks,
    loading,
    error,
    statusFilter,
    handleFilterStatus,
    handleTaskPress
  } = useTasks({ navigation });

  const handleProfilePress = () => {
  };

  return (
    <ScrollView style={commonStyles.container}>
      <Header
        leftText={userName}
        RightIcon={ProfileIcon}
        onRightIconPress={handleProfilePress}
        color={colors.blobBlue}
        showBorder={true}
      />
      
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
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
        onTaskPress={handleTaskPress}
      />
    </ScrollView>
  );
};

export default HomeScreen;