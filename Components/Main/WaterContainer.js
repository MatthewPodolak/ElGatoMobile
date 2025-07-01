import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const generateSineWavePath = (totalWidth, height, cycles, numPoints = 100) => {
  const amplitude = height / 2;
  const baseline = height / 2;
  let d = '';
  for (let i = 0; i <= numPoints; i++) {
    const x = (totalWidth * i) / numPoints;
    const y = baseline + amplitude * Math.sin((2 * Math.PI * cycles * x) / totalWidth);
    d += i === 0 ? `M ${x},${y} ` : `L ${x},${y} `;
  }
  d += `L ${totalWidth},${height} L 0,${height} Z`;
  return d;
};

const WaterContainer = ({ waterIntakeGoal = 2000, initialValue = 0, addWaterFunc, compoControlFunc }) => {
  const [waterValue, setWaterValue] = useState(initialValue);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [waveCycle, setWaveCycle] = useState(0);

  const translateY = useRef(new Animated.Value(0)).current;
  const tiltAnim   = useRef(new Animated.Value(0)).current;
  const cycleAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setWaterValue(initialValue);
  }, [initialValue]);

  const onContainerLayout = ({ nativeEvent: { layout } }) => {
    setDims(layout);
    translateY.setValue(layout.height);
  };

  useEffect(() => {
    if (!dims.height) return;

    const currentMl = waterValue * 10;
    const frac = Math.min(Math.max(currentMl / waterIntakeGoal, 0), 1);

    const toValue = dims.height * (1 - frac);
    Animated.timing(translateY, {
      toValue,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [waterValue, dims.height, waterIntakeGoal]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x }) => {
      Animated.timing(tiltAnim, {
        toValue: x,
        duration: 100,
        useNativeDriver: true,
      }).start();

      let cycles = 0;
      if (x > 0.2)  cycles = -2;
      if (x < -0.2) cycles =  2;

      Animated.timing(cycleAnim, {
        toValue: cycles,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    const id = cycleAnim.addListener(({ value }) => setWaveCycle(value));
    return () => {
      sub && sub.remove();
      cycleAnim.removeListener(id);
    };
  }, []);

  const tiltRotation = tiltAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['22deg', '-22deg'],
  });

  return (
    <TouchableOpacity
      style={styles.outerContainer}
      activeOpacity={1}
      onPress={addWaterFunc}
      onLongPress={compoControlFunc}
      delayLongPress={200}
    >
      <BlurView
        style={styles.glassEffect}
        intensity={125}
        tint="light"
        onLayout={onContainerLayout}
      >
        <Animated.View
          style={[
            styles.water,
            {
              transform: [
                { translateY },
                { rotate: tiltRotation },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#2193b0', '#6dd5ed']}
            style={StyleSheet.absoluteFill}
          />
          {dims.width > 0 && (
            <View style={{ width: dims.width * 2, height: 20, overflow: 'hidden' }}>
              <Svg
                width={dims.width * 2}
                height={20}
                viewBox={`0 0 ${dims.width * 2} 20`}
                style={{ transform: [{ scaleY: -1 }] }}
              >
                <Path
                  d={generateSineWavePath(dims.width * 2, 20, waveCycle, 150)}
                  fill="#F5F5F5"
                />
              </Svg>
            </View>
          )}
        </Animated.View>
      </BlurView>

      <View style={styles.absoluteContiner}>
        <Svg height="100%" width="100%" viewBox="0 0 300 100">
          <SvgText
            fill="transparent"
            stroke="#000"
            strokeWidth="1.5"
            fontSize="60"
            fontWeight="bold"
            x="50%"
            y="20%"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {waterValue * 10 + " ml"}
          </SvgText>
        </Svg>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassEffect: {
    width: '100%',
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  water: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: '200%',
    height: '150%',
  },
  absoluteContiner: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WaterContainer;