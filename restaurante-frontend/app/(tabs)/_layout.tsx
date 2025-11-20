import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#FA7F08',
  background: '#FFFFFF',
  gray: '#E0E0E0',
  inactive: '#A0A0A0',
};

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        unmountOnBlur: false,
        lazy: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopWidth: 0.5,
          borderTopColor: COLORS.gray,
          height: 60 + bottom,
          paddingBottom: bottom > 0 ? bottom - 5 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Menú',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrito',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="orders/index"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}