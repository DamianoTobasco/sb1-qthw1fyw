import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface CircularProgressProps {
  size: number;
  width: number;
  fill: number;
  tintColor: string;
  backgroundColor: string;
  rotation?: number;
  children?: (fill: number) => React.ReactNode;
  onStartShouldSetResponder?: () => boolean;
  onResponderTerminationRequest?: () => boolean;
  onResponderGrant?: () => void;
  onResponderMove?: () => void;
  onResponderRelease?: () => void;
  onResponderTerminate?: () => void;
  onPress?: () => void;
}

const WebCircularProgress: React.FC<CircularProgressProps> = ({
  size,
  width,
  fill,
  tintColor,
  backgroundColor,
  children,
}) => {
  const radius = (size - width) / 2;
  const circumference = radius * 2 * Math.PI;
  const fillAmount = (circumference * (100 - fill)) / 100;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={tintColor} stopOpacity="1" />
            <Stop offset="1" stopColor={tintColor} stopOpacity="0.7" />
          </LinearGradient>
        </Defs>
        
        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={width}
          fill="none"
        />
        
        {/* Progress Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={width}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={fillAmount}
          transform={`rotate(-90 ${center} ${center})`}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.childrenContainer]}>
        {children && children(fill)}
      </View>
    </View>
  );
};

export const CustomCircularProgress: React.FC<CircularProgressProps> = (props) => {
  if (Platform.OS === 'web') {
    // Filter out native-only props for web version
    const {
      onStartShouldSetResponder,
      onResponderTerminationRequest,
      onResponderGrant,
      onResponderMove,
      onResponderRelease,
      onResponderTerminate,
      onPress,
      ...webProps
    } = props;
    return <WebCircularProgress {...webProps} />;
  }
  
  // Native implementation with shadow props
  return (
    <View style={styles.progressContainer}>
      <AnimatedCircularProgress 
        {...props}
        tintColor={props.tintColor}
        backgroundColor={props.backgroundColor}
        tension={30}
        friction={8}
        lineCap="round"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  childrenContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  }
});