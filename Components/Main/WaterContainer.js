import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalStyles } from '../../Styles/GlobalStyles';
import { BlurView } from 'expo-blur';

const generateSineWavePath = (totalWidth, height, cycles, numPoints = 100) => {
  const amplitude = height / 2;
  const baseline = height / 2;
  let d = '';
  for (let i = 0; i <= numPoints; i++) {
    const x = (totalWidth * i) / numPoints;
    const y = baseline + amplitude * Math.sin((2 * Math.PI * cycles * x) / totalWidth);
    if (i === 0) {
      d += `M ${x},${y} `;
    } else {
      d += `L ${x},${y} `;
    }
  }

  d += `L ${totalWidth},${height} L 0,${height} Z`;
  return d;
};

const WaterContainer = ({ initialValue = 0, addWaterFunc }) => {
  const [waterValue, setWaterValue] = useState(initialValue);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [currentWaveCycle, setCurrentWaveCycle] = useState(0);

  const waterTranslate = useRef(new Animated.Value(0)).current;
  const tiltAnim = useRef(new Animated.Value(0)).current;
  const waveCycleAnim = useRef(new Animated.Value(0)).current;

  const addWater = () => {
    if(addWaterFunc){
      addWaterFunc();
    }
  };

  useEffect(() => {
    setWaterValue(initialValue);
  }, [initialValue]);

  const onContainerLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
    waterTranslate.setValue(height);
  };

  useEffect(() => {
    if (dimensions.height === 0) return;
    
    if(waterValue <= 225){
      const targetTranslate = dimensions.height - (waterValue / 200) * dimensions.height;
      Animated.timing(waterTranslate, {
        toValue: targetTranslate,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }

    
  }, [waterValue, dimensions.height, waterTranslate]);

  useEffect(() => {
    const id = waveCycleAnim.addListener(({ value }) => {
      setCurrentWaveCycle(value);
    });
    return () => waveCycleAnim.removeListener(id);
  }, [waveCycleAnim]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener((data) => {
      Animated.timing(tiltAnim, {
        toValue: data.x,
        duration: 100,
        useNativeDriver: true,
      }).start();

      const threshold = 0.2;
      let targetCycle = 0;
      if (data.x > threshold) {
        targetCycle = -2;
      } else if (data.x < -threshold) {
        targetCycle = 2;
      }

      Animated.timing(waveCycleAnim, {
        toValue: targetCycle,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
    return () => subscription && subscription.remove();
  }, [tiltAnim, waveCycleAnim]);

  const tiltRotation = tiltAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['22deg', '-22deg'],
  });

  return (
    <TouchableOpacity style={styles.outerContainer} activeOpacity={1} onPress={addWater}>
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
                { translateY: waterTranslate },
                { rotate: tiltRotation },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#2193b0', '#6dd5ed']}
            style={StyleSheet.absoluteFill}
          />
          {dimensions.width > 0 && (
            <View style={{ width: dimensions.width * 2, height: 20, overflow: 'hidden' }}>
              <Svg
                width={dimensions.width * 2}
                height={20}
                viewBox={`0 0 ${dimensions.width * 2} 20`}
                style={{ transform: [{ scaleY: -1 }] }}
              >
                <Path
                  d={generateSineWavePath(dimensions.width * 2, 20, currentWaveCycle, 150)}
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
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
