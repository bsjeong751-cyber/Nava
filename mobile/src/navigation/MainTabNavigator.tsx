import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import type { MainTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { MyPageScreen } from '../screens/MyPageScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICON: Record<keyof MainTabParamList, string> = {
  HomeTab: '🏠',
  CommunityTab: '🌍',
  MyPageTab: '👤',
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: () => <Text>{TAB_ICON[route.name as keyof MainTabParamList]}</Text>,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: '홈' }} />
      <Tab.Screen name="CommunityTab" component={CommunityScreen} options={{ tabBarLabel: '커뮤니티' }} />
      <Tab.Screen name="MyPageTab" component={MyPageScreen} options={{ tabBarLabel: '마이페이지' }} />
    </Tab.Navigator>
  );
}
