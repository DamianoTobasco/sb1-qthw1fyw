import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import Spline only on web
const Spline = Platform.OS === 'web' 
  ? require('@splinetool/react-spline').default 
  : null;

interface SplineBackgroundProps {
  url: string;
}

const { width, height } = Dimensions.get('window');

export const SplineBackground: React.FC<SplineBackgroundProps> = ({ url }) => {
  const splineRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  
  // On web, use the Spline component
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container} pointerEvents="none">
        <View style={styles.splineWrapper}>
          <Spline
            ref={splineRef}
            scene={url}
            onLoad={(spline: any) => {
              setLoaded(true);
              // Optional: Access the spline instance for additional control
              if (spline && splineRef.current) {
                // You can control the scene here if needed
                // Example: spline.setZoom(0.8);
              }
            }}
            style={styles.spline}
          />
        </View>
        
        {/* Overlay gradient to ensure readability of UI elements */}
        <View style={styles.overlay} />
      </View>
    );
  }
  
  // On native, use a fallback gradient background
  return (
    <View style={styles.fallbackContainer}>
      <LinearGradient
        colors={['#0F0817', '#1A1025', '#12101F']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.gradientCircle1} />
      <View style={styles.gradientCircle2} />
      <View style={styles.gradientCircle3} />
      <View style={styles.overlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  splineWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  spline: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Darken to improve readability
    backdropFilter: Platform.OS === 'web' ? 'blur(4px)' : undefined,
  },
  // Fallback styles for native platforms
  fallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F0817',
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300, 
    height: 300,
    borderRadius: 150,
    backgroundColor: '#581c87',
    opacity: 0.15,
  },
  gradientCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#7e22ce',
    opacity: 0.1,
  },
  gradientCircle3: {
    position: 'absolute',
    top: height * 0.4,
    left: width * 0.3,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#581c87',
    opacity: 0.08,
  },
});