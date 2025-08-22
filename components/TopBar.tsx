import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, User, Search } from 'lucide-react-native';
import YatouLogo from './YatouLogo';

function TopBar() {
  const paddingTop = Platform.OS === 'android' 
    ? (StatusBar.currentHeight || 0) + 8 
    : 44;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      <LinearGradient
        colors={['#DC2626', '#B91C1C']}
        style={[styles.container, { paddingTop }]}
      >
        <View style={styles.content}>
          {/* Logo et titre */}
          <View style={styles.leftSection}>
            <YatouLogo size="small" showText={false} />
            <Text style={styles.appTitle}>Yatou</Text>
          </View>

          {/* Icônes de droite */}
          <View style={styles.rightSection}>
            <TouchableOpacity style={styles.iconButton}>
              <Search size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <User size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </>
  );
}

export default TopBar;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});