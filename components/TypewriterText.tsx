import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Animated, Easing } from 'react-native';

interface TypewriterTextProps {
  staticText: string;
  words: string[];
  style?: any;
  typingSpeed?: number;
  deletingSpeed?: number;
  delayAfterWord?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  staticText,
  words,
  style,
  typingSpeed = 80,
  deletingSpeed = 50,
  delayAfterWord = 2000,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Animated values for cursor
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  
  // Start cursor blinking animation
  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    
    blinkAnimation.start();
    
    return () => {
      blinkAnimation.stop();
    };
  }, []);
  
  // Typewriter effect logic
  useEffect(() => {
    const currentWord = words[currentWordIndex];
    
    // If we're not on the last character and not deleting, type the next character
    if (!isDeleting && currentText !== currentWord) {
      const timeout = setTimeout(() => {
        setCurrentText(currentWord.substring(0, currentText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timeout);
    }
    
    // If we've completed typing the word, wait a bit then start deleting
    if (!isDeleting && currentText === currentWord) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, delayAfterWord);
      return () => clearTimeout(timeout);
    }
    
    // If we're deleting and there's still text, delete the next character
    if (isDeleting && currentText !== '') {
      const timeout = setTimeout(() => {
        setCurrentText(currentText.substring(0, currentText.length - 1));
      }, deletingSpeed);
      return () => clearTimeout(timeout);
    }
    
    // If we've finished deleting, move to the next word
    if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIndex((currentWordIndex + 1) % words.length);
    }
  }, [currentText, currentWordIndex, isDeleting, words]);
  
  return (
    <View style={styles.container}>
      <Text style={style}>
        {staticText}
        <Text style={[styles.dynamicText, style]}>{currentText}</Text>
        <Animated.Text 
          style={[
            styles.cursor, 
            { opacity: cursorOpacity }
          ]}
        >
          |
        </Animated.Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  dynamicText: {
    color: '#A163F6',
  },
  cursor: {
    color: '#A163F6',
    fontWeight: '500',
  },
});