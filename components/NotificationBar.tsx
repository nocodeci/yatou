import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, X } from 'lucide-react-native';

interface NotificationBarProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onDismiss?: () => void;
}

export default function NotificationBar({ message, type = 'info', onDismiss }: NotificationBarProps) {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#ECFDF5';
      case 'warning':
        return '#FFFBEB';
      case 'error':
        return '#FEF2F2';
      default:
        return '#EFF6FF';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: getIconColor() }]}>
          <Bell size={16} color={getBackgroundColor()} />
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <X size={16} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  message: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  dismissButton: {
    padding: 4,
  },
});
