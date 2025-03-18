import { create } from 'zustand';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

// Define types for the audio store
export interface AudioTrack {
  id: string;
  title: string;
  description?: string;
  duration: number;
  imageUrl: string;
  audioUrl: string;
  category?: string;
}

interface AudioState {
  // Audio player state
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isLooping: boolean;
  isLoaded: boolean;
  duration: number;
  position: number;
  
  // Audio element reference (web only)
  audioElement: HTMLAudioElement | null;
  
  // Audio object (native only)
  soundObject: Audio.Sound | null;
  
  // Actions
  setTrack: (track: AudioTrack) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  toggleLoop: () => void;
  seekTo: (position: number) => void;
  updatePosition: (position: number) => void;
  updateDuration: (duration: number) => void;
  reset: () => void;
}

// Create global store for audio state
export const useAudioStore = create<AudioState>((set, get) => ({
  // Initial state
  currentTrack: null,
  isPlaying: false,
  isLooping: false,
  isLoaded: false,
  duration: 0,
  position: 0,
  audioElement: null,
  soundObject: null,
  
  // Methods to manage audio state
  setTrack: async (track: AudioTrack) => {
    const { audioElement, soundObject } = get();
    
    // Clean up existing audio resources first
    if (audioElement && Platform.OS === 'web') {
      audioElement.pause();
      audioElement.src = '';
      audioElement.load();
    }
    
    if (soundObject && Platform.OS !== 'web') {
      try {
        await soundObject.unloadAsync();
      } catch (error) {
        console.error('Error unloading sound:', error);
      }
    }
    
    // Create appropriate audio object based on platform
    if (Platform.OS === 'web') {
      // Web implementation
      const newAudioElement = new window.Audio(track.audioUrl);
      newAudioElement.preload = 'auto';
      
      // Set up event listeners
      newAudioElement.addEventListener('loadedmetadata', () => {
        set({ 
          duration: newAudioElement?.duration || 0,
          isLoaded: true
        });
      });
      
      newAudioElement.addEventListener('timeupdate', () => {
        set({ position: newAudioElement?.currentTime || 0 });
      });
      
      newAudioElement.addEventListener('ended', () => {
        if (!get().isLooping) {
          set({ isPlaying: false });
        }
      });
      
      // Set looping based on current state
      newAudioElement.loop = get().isLooping;
      
      // Start loading the audio
      newAudioElement.load();
      
      set({ 
        currentTrack: track,
        audioElement: newAudioElement,
        soundObject: null,
        isLoaded: false,
        position: 0
      });
    } else {
      // Native implementation
      try {
        set({ isLoaded: false });
        
        // Configure audio mode
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
        
        // Create and load the sound
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: track.audioUrl },
          { shouldPlay: false, isLooping: get().isLooping },
          (status) => {
            if (status.isLoaded) {
              set({ 
                position: status.positionMillis / 1000,
                duration: status.durationMillis ? status.durationMillis / 1000 : 0,
                isPlaying: status.isPlaying,
              });
            }
          }
        );
        
        set({ 
          currentTrack: track,
          soundObject: newSound,
          audioElement: null,
          isLoaded: true,
          position: 0
        });
      } catch (error) {
        console.error('Error loading audio:', error);
        set({ isLoaded: false });
      }
    }
  },
  
  play: async () => {
    const { audioElement, soundObject, isLoaded, isPlaying } = get();
    
    if (isPlaying) return;
    
    if (Platform.OS === 'web' && audioElement) {
      // Web implementation
      const playPromise = audioElement.play();
      
      // Handle play promise rejection (common in browsers)
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing audio:', error);
          set({ isPlaying: false });
        });
      }
      
      set({ isPlaying: true });
    } else if (Platform.OS !== 'web' && soundObject && isLoaded) {
      // Native implementation
      try {
        await soundObject.playAsync();
        set({ isPlaying: true });
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  },
  
  pause: async () => {
    const { audioElement, soundObject } = get();
    
    if (Platform.OS === 'web' && audioElement) {
      audioElement.pause();
      set({ isPlaying: false });
    } else if (Platform.OS !== 'web' && soundObject) {
      try {
        await soundObject.pauseAsync();
        set({ isPlaying: false });
      } catch (error) {
        console.error('Error pausing audio:', error);
      }
    }
  },
  
  togglePlayPause: async () => {
    const { isPlaying } = get();
    
    if (isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },
  
  toggleLoop: async () => {
    const { isLooping, audioElement, soundObject } = get();
    const newLoopState = !isLooping;
    
    if (Platform.OS === 'web' && audioElement) {
      audioElement.loop = newLoopState;
      set({ isLooping: newLoopState });
    } else if (Platform.OS !== 'web' && soundObject) {
      try {
        await soundObject.setIsLoopingAsync(newLoopState);
        set({ isLooping: newLoopState });
      } catch (error) {
        console.error('Error setting loop state:', error);
      }
    } else {
      // Just update the state if no player is active
      set({ isLooping: newLoopState });
    }
  },
  
  seekTo: async (position: number) => {
    const { audioElement, soundObject, duration } = get();
    
    // Make sure we're seeking to a valid position
    const validPosition = Math.min(Math.max(0, position), duration);
    
    if (Platform.OS === 'web' && audioElement) {
      audioElement.currentTime = validPosition;
      set({ position: validPosition });
    } else if (Platform.OS !== 'web' && soundObject) {
      try {
        await soundObject.setPositionAsync(validPosition * 1000); // Convert to milliseconds
        set({ position: validPosition });
      } catch (error) {
        console.error('Error seeking audio:', error);
      }
    }
  },
  
  updatePosition: (position: number) => {
    set({ position });
  },
  
  updateDuration: (duration: number) => {
    set({ duration });
  },
  
  reset: async () => {
    const { audioElement, soundObject } = get();
    
    if (Platform.OS === 'web' && audioElement) {
      audioElement.pause();
      audioElement.src = '';
      audioElement.load();
    } else if (Platform.OS !== 'web' && soundObject) {
      try {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
      } catch (error) {
        console.error('Error unloading audio:', error);
      }
    }
    
    set({
      currentTrack: null,
      isPlaying: false,
      isLooping: false,
      isLoaded: false,
      duration: 0,
      position: 0,
      audioElement: null,
      soundObject: null
    });
  }
}));