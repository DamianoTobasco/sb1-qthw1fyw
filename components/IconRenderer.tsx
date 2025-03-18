import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// Type for the icon family
type IconFamily = 'Ionicons' | 'FontAwesome' | 'MaterialIcons' | 'MaterialCommunity';

// Props for the IconRenderer component
interface IconRendererProps {
  name: string;
  family?: IconFamily;
  size?: number;
  color?: string;
  fallbackText?: string;
  style?: any;
}

// Common icons and their emoji fallbacks
const EMOJI_FALLBACKS = {
  'add': '➕',
  'flame': '🔥',
  'star': '⭐',
  'home': '🏠',
  'stats-chart': '📊',
  'leaf': '🍃',
  'barbell': '🏋️',
  'settings': '⚙️',
  'restaurant': '🍗',
  'nutrition': '🍚',
  'water': '🥑',
  'help-circle': '❓',
  'close': '✖️',
  'search': '🔍',
  'trash': '🗑️',
  'chevron-forward': '▶️',
  'calendar': '📅',
  'repeat': '🔄',
  'play': '▶️',
  'pause': '⏸️',
  'cloud-offline': '☁️❌'
};

/**
 * A cross-platform icon renderer component that handles fallbacks
 * and provides consistent behavior across platforms
 */
export function IconRenderer({
  name,
  family = 'Ionicons',
  size = 24,
  color = '#ffffff',
  fallbackText,
  style
}: IconRendererProps) {
  // Clean the icon name for lookup
  const baseIconName = name.replace('-outline', '').replace('-sharp', '');
  
  // Get automatic fallback if not provided
  const automaticFallback = EMOJI_FALLBACKS[baseIconName];
  const finalFallbackText = fallbackText || automaticFallback || '●';
  
  // Add platform-specific adjustments to icon names if needed
  const getAdjustedIconName = (iconName: string): string => {
    // For Ionicons, ensure proper naming conventions based on platform
    if (family === 'Ionicons') {
      // Some icons might need special handling
      const needsOutlineSuffix = !iconName.includes('-outline') && !iconName.includes('-sharp');
      
      // Add outline suffix for consistency if not already present
      if (needsOutlineSuffix && iconName.indexOf('-') === -1) {
        return `${iconName}${Platform.OS === 'ios' ? '-outline' : ''}`;
      }
    }
    
    return iconName;
  };

  // Adjusted icon name based on platform
  const iconName = getAdjustedIconName(name);
  
  // Render icon based on family with error handling
  try {
    switch (family) {
      case 'Ionicons':
        return <Ionicons name={iconName as any} size={size} color={color} style={style} />;
      case 'FontAwesome':
        return <FontAwesome name={iconName as any} size={size} color={color} style={style} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName as any} size={size} color={color} style={style} />;
      case 'MaterialCommunity':
        return <MaterialCommunityIcons name={iconName as any} size={size} color={color} style={style} />;
      default:
        return <Ionicons name={iconName as any} size={size} color={color} style={style} />;
    }
  } catch (error) {
    console.warn(`Failed to render icon: ${iconName} from family ${family}`, error);
    
    // Return fallback content
    return (
      <Text style={[
        styles.fallbackText, 
        { fontSize: size * 0.9, color: color },
        style
      ]}>
        {finalFallbackText}
      </Text>
    );
  }
}

// Styles for the fallback text
const styles = StyleSheet.create({
  fallbackText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});