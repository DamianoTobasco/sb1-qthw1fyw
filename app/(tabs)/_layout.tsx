import { Tabs } from 'expo-router';
import { FuturisticTabIcon } from '../../components/FuturisticTabIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet, Platform, Dimensions, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

const { width } = Dimensions.get('window');

// Calculate optimal tab bar width based on screen size
const getTabBarWidth = () => {
  // For phones, use a percentage of screen width
  if (width < 600) {
    return Math.min(width - 32, 340);
  }
  // For larger devices, use fixed width
  return 380;
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(50)).current; // Start off-screen
  const opacityAnim = useRef(new Animated.Value(0)).current; // Start transparent
  
  // Animate tab bar entrance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Calculate bottom inset for proper tab bar positioning
  const bottomInset = Platform.OS === 'ios' ? insets.bottom : 8;
  
  // Calculate the optimal width for our tab bar
  const tabBarWidth = getTabBarWidth();
  
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 10 + bottomInset,
          left: (width - tabBarWidth) / 2, // Center the tab bar
          width: tabBarWidth,
          height: 55,
          elevation: 0,
          borderTopWidth: 0,
          backgroundColor: 'rgba(15, 15, 15, 0.85)',
          borderRadius: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.08)',
          alignSelf: 'center',
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          paddingBottom: 5,
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          height: 55,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: string;

          switch (route.name) {
            case 'index':
              iconName = 'home';
              break;
            case 'analytics':
              iconName = 'analytics';
              break;
            case 'meditation':
              iconName = 'lotus';
              break;
            case 'fitness':
              iconName = 'fitness';
              break;
            case 'settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'circle';
              break;
          }

          // Return the enhanced TabBarIcon component
          return (
            <FuturisticTabIcon 
              name={iconName} 
              color={color}
              focused={focused}
            />
          );
        },
      })}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Stats',
        }}
      />
      <Tabs.Screen
        name="cardio"
        options={{
          title: 'Cardio',
          tabBarIcon: ({ color, focused }) => (
            <FuturisticTabIcon 
              name="bicycle" 
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="meditation"
        options={{
          title: 'Mind',
        }}
      />
      <Tabs.Screen
        name="fitness"
        options={{
          title: 'Fitness',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}