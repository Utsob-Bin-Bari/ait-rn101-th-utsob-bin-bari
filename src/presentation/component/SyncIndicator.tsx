import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface SyncIndicatorProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
}

const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  isOnline,
  isSyncing,
  pendingCount
}) => {
  const getStatusText = () => {
    if (isSyncing) return 'Syncing...';
    if (!isOnline) return 'Offline';
    if (pendingCount > 0) return `${pendingCount} pending`;
    return '✓ Synced';
  };

  const getStatusColor = () => {
    if (isSyncing) return '#2196F3';
    if (!isOnline) return '#FF6B6B';
    if (pendingCount > 0) return '#FFA500';
    return '#4CAF50';
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    alignItems: 'center'
  },
  text: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600'
  }
});

export default SyncIndicator;

