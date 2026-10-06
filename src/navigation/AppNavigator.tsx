// src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootTabParamList = {
  'Trang chủ': undefined;
  'Đã đặt': undefined;
  'Cá nhân': undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Component riêng cho Tab Icon có hiệu ứng Scale Nảy Nhẹ khi được bấm vào
const AnimatedTabIcon = ({
  focused,
  name,
  size,
  color,
}: {
  focused: boolean;
  name: keyof typeof Ionicons.glyphMap;
  size: number;
  color: string;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(focused ? 1.15 : 1)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.18 : 1,
      friction: 4,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [focused, scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',

        // Hiệu ứng Fade & Shift nhẹ nhàng khi chuyển màn hình
        animation: 'fade', // Hoặc dùng 'shift' tùy thuộc phiên bản React Navigation
        
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Trang chủ') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Đã đặt') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Cá nhân') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <AnimatedTabIcon
              focused={focused}
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Trang chủ" component={HomeScreen} />
      <Tab.Screen name="Đã đặt" component={HistoryScreen} />
      <Tab.Screen name="Cá nhân" component={ProfileScreen} />
    </Tab.Navigator>
  );
}