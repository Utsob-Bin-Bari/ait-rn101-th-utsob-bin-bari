import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface WeekCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({ selectedDate, onDateSelect }) => {
  const getWeekDates = (date: Date) => {
    const current = new Date(date);
    const dayOfWeek = current.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(current);
    monday.setDate(current.getDate() + diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDates.push(day);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(selectedDate);
  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  return (
    <View style={styles.container}>
      {weekDates.map((date, index) => {
        const isSelected = isSameDay(date, selectedDate);
        const dayName = dayNames[index];
        const dayNumber = date.getDate();

        return (
          <TouchableOpacity
            key={index}
            style={styles.dayContainer}
            onPress={() => onDateSelect(date)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.dayName,
              isSelected && styles.selectedDayName
            ]}>
              {dayName}
            </Text>
            <View style={[
              styles.dateCircle,
              isSelected && styles.selectedDateCircle
            ]}>
              <Text style={[
                styles.dateNumber,
                isSelected && styles.selectedDateNumber
              ]}>
                {dayNumber}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    marginTop: -1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10
  },
  dayContainer: {
    alignItems: 'center',
    width: 45
  },
  dayName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.blobBlue,
    marginBottom: 8
  },
  selectedDayName: {
    color: colors.purple,
    fontWeight: '700'
  },
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  selectedDateCircle: {
    backgroundColor: colors.purple,
    opacity: 0.15
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.blobBlue
  },
  selectedDateNumber: {
    color: colors.purple,
    fontWeight: '700'
  }
});

export default WeekCalendar;

