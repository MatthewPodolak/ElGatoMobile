import { Animated } from 'react-native';

export const closeOptionsAnimation = (optionsAnimation, iconAnimation, setOptionsVisible) => {
  Animated.parallel([
    Animated.timing(optionsAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }),
    Animated.timing(iconAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }),
  ]).start(() => setOptionsVisible(false));
};

export const showOptionsAnimation = (optionsAnimation, iconAnimation, setOptionsVisible) => {
  setOptionsVisible(true);
  Animated.parallel([
    Animated.timing(optionsAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }),
    Animated.timing(iconAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }),
  ]).start();
};
