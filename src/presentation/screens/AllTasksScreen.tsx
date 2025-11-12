import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTasks } from '../hooks/useTasks';
import CustomButton from '../component/CustomButton';
import { colors } from '../constants/colors';
import BackButton from '../component/svgs/BackButton';
import SearchButton from '../component/svgs/SearchButton';
import WeekCalendar from '../component/WeekCalendar';
import SimpleTaskCard from '../component/SimpleTaskCard';
import SearchBar from '../component/SearchBar';

const AllTasksScreen = ({ navigation }: any) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterByDate, setFilterByDate] = useState<boolean>(false);
  const [ showSearchBar, setShowSearchBar ] = useState<boolean>(false);
  const {
    tasks,
    loading,
    searchQuery,
    handleSearch,
    handleCreateTask,
    handleTaskPress
  } = useTasks({ navigation });

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setFilterByDate(true);
  };

  const getFilteredTasks = () => {
    if (!filterByDate) return tasks;
    
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate.getDate() === selectedDate.getDate() &&
             taskDate.getMonth() === selectedDate.getMonth() &&
             taskDate.getFullYear() === selectedDate.getFullYear();
    });
  };

  const filteredTasks = getFilteredTasks();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton 
          onPress={() => navigation.navigate('Main',{ screen: 'Home' })}
          color={colors.blobBlue}
        />
        <SearchButton 
          onPress={() => setShowSearchBar(!showSearchBar)}
          color={colors.blobBlue}
        />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.monthYear}>{formatMonthYear(selectedDate)}</Text>
        <View style={styles.addButtonContainer}>
          <CustomButton
            text="+ Add Task"
            onPress={handleCreateTask}
            height={40}
          />
        </View>
      </View>

      <WeekCalendar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />

      {showSearchBar && (
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onClear={() => handleSearch('')}
        />
      )}

      <View style={styles.tasksHeader}>
        <Text style={styles.tasksTitle}>
          {filterByDate ? `Tasks for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'All Tasks'}
        </Text>
        {filterByDate && (
          <TouchableOpacity onPress={() => setFilterByDate(false)}>
            <Text style={styles.clearFilter}>Show All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.tasksList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.tasksContent}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filterByDate ? 'No tasks for this date' : 'No tasks found. Create your first task!'}
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <SimpleTaskCard
              key={task.id}
              task={task}
              onPress={handleTaskPress}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
    marginTop: -1
  },
  monthYear: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.blobBlue
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: colors.background,
    marginTop: 4
  },
  tasksTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.blobBlue
  },
  clearFilter: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.purple
  },
  tasksList: {
    flex: 1,
    backgroundColor: colors.background
  },
  tasksContent: {
    paddingBottom: 24
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: colors.blobBlue,
    opacity: 0.5
  },
  addButtonContainer: {
    width: 100,
    alignItems: 'flex-end'
  }
});

export default AllTasksScreen;
