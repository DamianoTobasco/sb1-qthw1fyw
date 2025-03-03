import React, { useEffect } from 'react';
import { Platform, Text, StyleSheet, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabBarIconProps {
  name: string;
  color: string;
  size: number;
  focused: boolean;
}

// Emoji fallbacks for tab bar icons
const ICON_FALLBACKS = {
  'home': '🏠',
  'stats-chart': '📊',
  'leaf': '🍃',
  'barbell': '🏋️',
  'settings': '⚙️',
  'default': '📱'
};

/**
 * Enhanced TabBar icon component that ensures consistent
 * rendering across all platforms with fallbacks and animations
 */
export function TabBarIcon({ name, color, size, focused, ...props }: TabBarIconProps) {
  // Animation value for scale and opacity
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animate icon scale and position
    Animated.spring(animatedValue, {
      toValue: focused ? 1 : 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [focused]);
  
  // Generate the correct icon name based on platform and focused state
  const getIconName = () => {
    const baseName = name.replace('-outline', '').replace('-sharp', '');
    
    // Don't use outline for active icons - keeps them solid for better visibility
    const suffix = focused ? '' : '-outline';
    
    return Platform.select({
      ios: `${baseName}${suffix}`,
      android: `${baseName}${suffix}`,
      web: `${baseName}${suffix}`,
      default: `${baseName}${suffix}`,
    });
  };

  const iconName = getIconName();
  
  // Get appropriate fallback emoji if needed
  const getFallbackEmoji = () => {
    const baseName = name.replace('-outline', '').replace('-sharp', '');
    return ICON_FALLBACKS[baseName] || ICON_FALLBACKS.default;
  };
  
  // Transform and scale effects for the icon
  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });
  
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  try {
    return (
      <View style={styles.container}>
        {/* Icon with focused effect */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale }, { translateY }],
            }
          ]}
        >
          <Ionicons
            name={iconName as any}
            size={size}
            color={color}
            style={focused ? { 
              textShadowColor: '#ffffff',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 4
            } : undefined}
            {...props}
          />
        </Animated.View>
      </View>
    );
  } catch (error) {
    console.warn(`Error rendering icon ${iconName}:`, error);
    
    // Render emoji fallback
    return (
      <View style={styles.container}>
        <Animated.Text style={[
          styles.fallbackText,
          { 
            fontSize: size * 0.8, 
            color: color,
            transform: [{ scale }, { translateY }],
            textShadowColor: focused ? '#ffffff' : 'transparent',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: focused ? 4 : 0
          }
        ]}>
          {getFallbackEmoji()}
        </Animated.Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 32,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  fallbackText: {
    textAlign: 'center',
  }
});