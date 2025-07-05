import React, { useRef, useState } from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import RemoveSvg from '../assets/main/Diet/x-lg.svg';

export default function PersonalizeToggle({ initial = false, onToggle, size = 20, fill = '#000' }) {
  const [toggled, setToggled] = useState(initial);
  const anim = useRef(new Animated.Value(initial ? 0 : 1)).current;

  const rotation = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });

  const handlePress = () => {
    const nextState = !toggled;
    const toValue = nextState ? 0 : 1;
    Animated.spring(anim, { toValue, friction: 6, useNativeDriver: true }).start();
    setToggled(nextState);
    onToggle && onToggle(nextState);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <RemoveSvg width={size} height={size} fill={fill} />
      </Animated.View>
    </TouchableOpacity>
  );
}