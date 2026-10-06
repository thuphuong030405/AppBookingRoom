// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BookingProvider, useBooking } from './src/context/BookingContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';

// Thành phần điều phối Root dựa trên state Auth
function NavigationRoot() {
  const { user } = useBooking();

  // Kiểm tra người dùng đã đăng nhập hay chưa
  const isAuthenticated = !!user;

  return isAuthenticated ? <AppNavigator /> : <AuthScreen />;
}

// App Component chính
export default function App() {
  return (
    <SafeAreaProvider>
      <BookingProvider>
        <NavigationContainer>
          <NavigationRoot />
        </NavigationContainer>
      </BookingProvider>
    </SafeAreaProvider>
  );
}