import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useSegments } from 'expo-router';
import { useAuthStore } from '@/app/store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inDriverGroup = segments[0] === 'driver';

    if (!isAuthenticated && !inAuthGroup) {
      // Rediriger vers la connexion si pas authentifié
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Rediriger selon le rôle si déjà authentifié
      if (user?.role === 'driver') {
        router.replace('/driver/home');
      } else {
        router.replace('/(tabs)');
      }
    } else if (isAuthenticated && user?.role === 'driver' && !inDriverGroup) {
      // Rediriger les livreurs vers leur interface
      router.replace('/driver/home');
    } else if (isAuthenticated && user?.role === 'client' && inDriverGroup) {
      // Rediriger les clients vers leur interface
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, user, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
