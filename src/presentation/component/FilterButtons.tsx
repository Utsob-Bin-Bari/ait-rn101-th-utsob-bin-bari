import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView, View } from 'react-native';
import StarIcon from './svgs/StarIcon';
import { colors } from '../constants/colors';

interface FilterButtonsProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  counts?: {
    all?: number;
    pending?: number;
    in_progress?: number;
    completed?: number;
    overdue?: number;
    favourite?: number;
  };
}

const FILTERS = [
  { key: 'all',         label: 'My Tasks',   type: 'default' },
  { key: 'pending',     label: 'Pending',    type: 'default' },
  { key: 'in_progress', label: 'In Progress', type: 'default' },
  { key: 'completed',   label: 'Completed',  type: 'default' },
  { key: 'overdue',     label: 'Overdue',    type: 'overdue'  },
  { key: 'favourite',   label: 'Favourite',  type: 'favourite' },
];

const FilterButtons: React.FC<FilterButtonsProps> = ({
  statusFilter,
  onStatusChange,
  counts,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((filter) => {
        const isActive = statusFilter === filter.key;
        const count = counts?.[filter.key as keyof typeof counts];

        return (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              isActive && styles.filterButtonActive,
              filter.type === 'overdue' && styles.filterButtonOverdue,
              filter.type === 'overdue' && isActive && styles.filterButtonOverdueActive,
              filter.type === 'favourite' && styles.filterButtonFavourite,
              filter.type === 'favourite' && isActive && styles.filterButtonFavouriteActive,
            ]}
            onPress={() => onStatusChange(filter.key)}
            activeOpacity={0.75}
          >
            <View style={styles.labelRow}>
              {filter.type === 'favourite' && (
                <StarIcon
                  width={12}
                  height={12}
                  color={isActive ? colors.warning : colors.blobBlue}
                  filled={isActive}
                />
              )}
              <Text
                style={[
                  styles.filterText,
                  isActive && styles.filterTextActive,
                  filter.type === 'overdue' && styles.filterTextOverdue,
                  filter.type === 'overdue' && isActive && styles.filterTextOverdueActive,
                ]}
              >
                {filter.label}
              </Text>
              {count !== undefined && count > 0 && (
                <View style={[
                  styles.badge,
                  filter.type === 'overdue' && styles.badgeOverdue,
                  filter.type === 'favourite' && styles.badgeFavourite,
                ]}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  filterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGrey,
    paddingHorizontal: 16,
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
  filterButtonOverdue: {
    backgroundColor: '#FFF0EF',
  },
  filterButtonOverdueActive: {
    backgroundColor: colors.white,
    shadowColor: colors.error,
    shadowOpacity: 0.25,
  },
  filterButtonFavourite: {
    backgroundColor: '#FFFBEE',
  },
  filterButtonFavouriteActive: {
    backgroundColor: colors.white,
    shadowColor: colors.warning,
    shadowOpacity: 0.25,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  filterText: {
    fontSize: 13,
    color: colors.blobBlue,
    fontWeight: '400',
  },
  filterTextActive: {
    fontWeight: '600',
  },
  filterTextOverdue: {
    color: colors.error,
  },
  filterTextOverdueActive: {
    color: colors.error,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.purple,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeOverdue: {
    backgroundColor: colors.error,
  },
  badgeFavourite: {
    backgroundColor: colors.warning,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
});

export default FilterButtons;
