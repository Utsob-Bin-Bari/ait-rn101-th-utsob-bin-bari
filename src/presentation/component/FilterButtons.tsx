import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../constants/colors';

interface FilterButtonsProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  statusFilter,
  onStatusChange,
}) => {
  const filters = [
    { key: 'all', label: 'My Tasks' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In-progress' },
    { key: 'completed', label: 'Completed' }
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            statusFilter === filter.key && styles.filterButtonActive
          ]}
          onPress={() => onStatusChange(filter.key)}
        >
          <Text
            style={[
              styles.filterText,
              statusFilter === filter.key && styles.filterTextActive
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection:'row',
    height: 60,
    paddingHorizontal: 10,
  },
  filterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGrey,
    paddingHorizontal: 20,
    borderRadius: 27.5,
    marginRight: 8,
    height: 45,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonActive: {
    backgroundColor: colors.white,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  filterText: {
    fontSize: 13,
    color: colors.blobBlue,
    fontWeight: '400'
  },
  filterTextActive: {
    fontSize: 13,
    color: colors.blobBlue,
    fontWeight: '600'
  },
});

export default FilterButtons;

