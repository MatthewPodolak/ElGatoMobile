import React, { useState } from 'react';
import { Text, StyleSheet, View, Dimensions } from 'react-native';
import { withSpring } from 'react-native-reanimated';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';
import { PanGestureHandler, LongPressGestureHandler, State } from 'react-native-gesture-handler';

const { height: screenHeight } = Dimensions.get('window');

const DraggableItem = ({ children, onDragEnd, onDelete, autoScrollDown, autoScrollUp, scrollOffsetSV, borderRadius = 20 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const longPressHandler = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      setDragActive(true);
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
      ctx.startScrollOffset = scrollOffsetSV.value;
    },
    onActive: (event, ctx) => {
      const scrollDelta = scrollOffsetSV.value - ctx.startScrollOffset;
      const baseY = ctx.startY + event.translationY + scrollDelta;
      translateX.value = ctx.startX + event.translationX;
      
      const bottomThreshold = screenHeight - 150;
      const topThreshold = 150;
      
      if (event.absoluteY > bottomThreshold && autoScrollDown) {
        runOnJS(autoScrollDown)();
        const extraOffset = (event.absoluteY - bottomThreshold) * 0.05;
        const targetY = baseY + extraOffset;
        translateY.value = withSpring(targetY, { damping: 20, stiffness: 100 });
      } else if (event.absoluteY < topThreshold && autoScrollUp) {
        runOnJS(autoScrollUp)();
        const extraOffset = (topThreshold - event.absoluteY) * 0.05;
        const targetY = baseY - extraOffset;
        translateY.value = withSpring(targetY, { damping: 20, stiffness: 100 });
      } else {
        translateY.value = baseY;
      }
    },
    onEnd: () => {
      if (Math.abs(translateX.value) >= 50) {
        if (onDelete) runOnJS(onDelete)();
      } else {
        if (onDragEnd) runOnJS(onDragEnd)({ x: translateX.value, y: translateY.value });
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        runOnJS(setDragActive)(false);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: Math.abs(translateX.value) >= 50 ? 'red' : 'rgba(0,0,0,0.5)',
  }));

  const onContentLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  const renderContent = () => (
    <View style={styles.contentContainer} onLayout={onContentLayout}>
      {children}
      {dragActive && (
        <Animated.View
          style={[
            styles.overlay,
            {
              width: dimensions.width,
              height: dimensions.height - 10,
              borderRadius: borderRadius,
            },
            overlayAnimatedStyle,
          ]}
        >
          <Text style={styles.overlayText}>
            Drag me around{'\n'}to change my place or delete.
          </Text>
        </Animated.View>
      )}
    </View>
  );

  return (
    <LongPressGestureHandler onHandlerStateChange={longPressHandler} minDurationMs={600}>
      <Animated.View style={dragActive ? [{ zIndex: 1000, elevation: 1000 }, animatedStyle] : animatedStyle}>
        {dragActive ? (
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={animatedStyle}>
              {renderContent()}
            </Animated.View>
          </PanGestureHandler>
        ) : (
          <Animated.View>{renderContent()}</Animated.View>
        )}
      </Animated.View>
    </LongPressGestureHandler>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#FF6600',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DraggableItem;
