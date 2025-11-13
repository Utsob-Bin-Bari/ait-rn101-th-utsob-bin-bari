import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, RefreshControl } from 'react-native';
import { useFocusStatusBar, STATUS_BAR_CONFIGS } from '../utils';
import { useSyncManagement } from '../hooks/useSyncManagement';
import { QueueOperation } from '../../application/services/tasks/syncQueueService';
import { colors } from '../constants/colors';
import commonStyles from '../styles/commonStyles';
import { SyncIcon, CheckIcon, BinIcon, HardDriveIcon } from '../component/svgs';
import Header from '../component/Header';
import BackButton from '../component/svgs/BackButton';

const SyncManagementScreen = ({ navigation }: any) => {
  useFocusStatusBar(STATUS_BAR_CONFIGS.home);
  
  const {
    loading,
    error,
    allOperations,
    failedOperations,
    realQueueStatus,
    operationStates,
    handleDeleteOperation,
    handleSyncOperation,
    handleSyncAll,
    loadSyncData,
  } = useSyncManagement();

  const syncAllRotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      const rotateAnimation = Animated.loop(
        Animated.timing(syncAllRotateValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();
      return () => rotateAnimation.stop();
    } else {
      syncAllRotateValue.setValue(0);
    }
  }, [loading]);

  const syncAllRotate = syncAllRotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderRightIcon = (state: 'idle' | 'loading' | 'completed' | 'failed', rotateValue: Animated.AnimatedInterpolation<string | number>) => {
    if (state === 'loading') {
      return (
        <Animated.View style={{ transform: [{ rotate: rotateValue }] }}>
          <SyncIcon color={colors.warning} width={20} height={20} />
        </Animated.View>
      );
    } else if (state === 'completed') {
      return <CheckIcon color={colors.success} width={20} height={20} />;
    } else if (state === 'failed') {
      return <SyncIcon color={colors.error} width={20} height={20} />;
    }
    return null;
  };

  const formatPayload = (payload: string | null): string => {
    if (!payload) return 'No data';
    
    try {
      const parsed = JSON.parse(payload);
      if (parsed.title) {
        return `"${parsed.title.substring(0, 30)}${parsed.title.length > 30 ? '...' : ''}"`;
      }
      return 'Task data';
    } catch {
      return 'Invalid data';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'failed': return colors.error;
      case 'completed': return colors.success;
      default: return colors.black;
    }
  };


  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const renderOperationItem = (item: QueueOperation) => {
    const currentState = operationStates[item.id] || 'idle';
    const statusColor = getStatusColor(item.status);
    
    return (
      <View key={item.id} style={{
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderLeftWidth: 4,
        borderLeftColor: statusColor,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={[
              commonStyles.text,
              {
                fontSize: 16,
                fontWeight: '600',
                color: colors.black,
                flex: 1,
              }
            ]}>
              {item.operation_type.toUpperCase()} {item.entity_type}
            </Text>
            <View style={{
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: statusColor,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
            }}>
              <Text style={[
                commonStyles.text,
                {
                  fontSize: 12,
                  color: statusColor,
                  fontWeight: '600',
                }
              ]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={{ marginBottom: 8 }}>
          <Text style={[
            commonStyles.text,
            {
              fontSize: 14,
              color: colors.darkGrey,
              marginBottom: 4,
            }
          ]}>
            ID: {item.entity_id.length > 20 ? 
              `${item.entity_id.substring(0, 20)}...` : 
              item.entity_id
            }
          </Text>
          
          <Text style={[
            commonStyles.text,
            {
              fontSize: 14,
              color: colors.darkGrey,
              marginBottom: 4,
            }
          ]}>
            Content: {formatPayload(item.payload)}
          </Text>
          
          <Text style={[
            commonStyles.text,
            {
              fontSize: 12,
              color: colors.darkGrey,
              opacity: 0.7,
            }
          ]}>
            Created: {formatDate(item.created_at)} • Retries: {item.retry_count}/{item.max_retries}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: colors.error,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
            onPress={() => handleDeleteOperation(item.id)}
            disabled={currentState === 'loading'}
          >
            <BinIcon color={colors.error} width={14} height={14} />
            <Text style={[
              commonStyles.text,
              {
                fontSize: 12,
                color: colors.error,
                marginLeft: 4,
                fontWeight: '600',
              }
            ]}>
              Delete
            </Text>
          </TouchableOpacity>
          
          {item.status === 'failed' && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.white,
                borderWidth: 1,
                borderColor: colors.purple,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
              onPress={() => handleSyncOperation(item.id)}
              disabled={currentState === 'loading'}
            >
              <SyncIcon color={colors.purple} width={14} height={14} />
              <Text style={[
                commonStyles.text,
                {
                  fontSize: 12,
                  color: colors.purple,
                  marginLeft: 4,
                  fontWeight: '600',
                }
              ]}>
                Retry
              </Text>
            </TouchableOpacity>
          )}
          
          {currentState !== 'idle' && renderRightIcon(currentState, syncAllRotate)}
        </View>
      </View>
    );
  };

  return (
    <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Sync"
        LeftIcon={BackButton}
        onLeftIconPress={() => navigation.goBack()}
        color={colors.blobBlue}
        showBorder={true}
      />
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadSyncData}
            tintColor={colors.purple}
            colors={[colors.purple]}
          />
        }
      >
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: 20,
          marginBottom: 15,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <HardDriveIcon color={colors.purple} width={20} height={20} />
            <Text style={[
              commonStyles.text,
              {
                fontSize: 18,
                fontWeight: '600',
                color: colors.purple,
                marginLeft: 8,
              }
            ]}>
              Queue Status
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={[commonStyles.text, { fontSize: 16, color: colors.warning }]}>
              Pending: {realQueueStatus.pending}
            </Text>
            <Text style={[commonStyles.text, { fontSize: 16, color: colors.error }]}>
              Failed: {realQueueStatus.failed}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[commonStyles.text, { fontSize: 16, color: colors.success }]}>
              Completed: {realQueueStatus.completed}
            </Text>
            <Text style={[commonStyles.text, { fontSize: 16, color: colors.purple }]}>
              Total: {realQueueStatus.total}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 20,
            marginBottom: 15,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          onPress={handleSyncAll}
          disabled={loading || failedOperations.length === 0}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <SyncIcon color={colors.purple} width={24} height={24} />
              <Text style={[
                commonStyles.text,
                {
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.purple,
                  marginLeft: 12,
                }
              ]}>
                Retry All Failed Operations
              </Text>
            </View>
            {renderRightIcon(loading ? 'loading' : 'idle', syncAllRotate)}
          </View>
          
          <Text style={[
            commonStyles.text,
            {
              fontSize: 16,
              color: colors.black,
              lineHeight: 24,
              opacity: 0.8,
            }
          ]}>
            Retry all failed sync operations. This will attempt to sync them again.
          </Text>
        </TouchableOpacity>

        {allOperations.length === 0 && !loading && (
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 30,
            marginBottom: 15,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
          }}>
            <Text style={[
              commonStyles.text,
              {
                fontSize: 18,
                fontWeight: '600',
                color: colors.black,
                textAlign: 'center',
                marginBottom: 8,
              }
            ]}>
              No Operations Found
            </Text>
            <Text style={[
              commonStyles.text,
              {
                fontSize: 14,
                color: colors.darkGrey,
                textAlign: 'center',
              }
            ]}>
              Create, update, or delete tasks to see sync operations here
            </Text>
          </View>
        )}

        {allOperations.length > 0 && (
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={[
              commonStyles.text,
              {
                fontSize: 18,
                fontWeight: '600',
                color: colors.black,
                textAlign: 'center',
              }
            ]}>
              📋 All Operations ({allOperations.length})
            </Text>
            <Text style={[
              commonStyles.text,
              {
                fontSize: 14,
                color: colors.darkGrey,
                textAlign: 'center',
                marginTop: 4,
              }
            ]}>
              Direct from database • Pull to refresh
            </Text>
          </View>
        )}

        {error ? (
          <Text style={[commonStyles.text, { color: colors.error, marginTop: 10, textAlign: 'center', marginBottom: 20 }]}>
            {error}
          </Text>
        ) : null}

        {allOperations.map(operation => renderOperationItem(operation))}
      </ScrollView>
    </View>
  );
};

export default SyncManagementScreen;

