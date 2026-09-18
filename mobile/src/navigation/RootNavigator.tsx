import React, { useEffect, useRef, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useAuth } from '../context/AuthContext';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { NewTripFlowScreen } from '../screens/NewTripFlowScreen';
import { RouteCompareScreen } from '../screens/RouteCompareScreen';
import { TripGuidebookScreen } from '../screens/TripGuidebookScreen';
import { TripEditScreen } from '../screens/TripEditScreen';
import { CommunityPostDetailScreen } from '../screens/CommunityPostDetailScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

const MIN_SPLASH_MS = 600;

export function RootNavigator() {
  const { isReady, isAuthenticated } = useAuth();
  const [splashElapsed, setSplashElapsed] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    const remaining = Math.max(0, MIN_SPLASH_MS - (Date.now() - startedAt.current));
    const timer = setTimeout(() => setSplashElapsed(true), remaining);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady || !splashElapsed) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="AuthFlow" component={AuthNavigator} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="NewTripFlow" component={NewTripFlowScreen} options={{ title: '새 지도 만들기' }} />
          <Stack.Screen name="RouteCompare" component={RouteCompareScreen} options={{ title: '루트 비교' }} />
          <Stack.Screen name="TripGuidebook" component={TripGuidebookScreen} options={{ title: '가이드북' }} />
          <Stack.Screen name="TripEdit" component={TripEditScreen} options={{ title: '루트 편집' }} />
          <Stack.Screen name="CommunityPostDetail" component={CommunityPostDetailScreen} options={{ title: '여행 지도' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
