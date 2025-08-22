import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StatusBar } from 'react-native';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <>
      <Stack screenOptions={{ headerBackTitle: "Retour" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="new-delivery" 
          options={{ 
            presentation: "modal",
            headerShown: true,
            title: "Nouvelle livraison"
          }} 
        />
        <Stack.Screen 
          name="select-locations" 
          options={{ 
            presentation: "modal",
            headerShown: true,
            title: "Sélection des lieux"
          }} 
        />
        <Stack.Screen 
          name="delivery/[id]" 
          options={{ 
            headerShown: true,
            title: "Détails de la livraison"
          }} 
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <RootLayoutNav />
    </QueryClientProvider>
  );
}