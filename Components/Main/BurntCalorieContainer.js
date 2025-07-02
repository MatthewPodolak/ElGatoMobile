import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalStyles } from '../../Styles/GlobalStyles';
import { BlurView } from 'expo-blur';
import LottieView from "lottie-react-native";

const BurntCalorieContainer = ({ totalBurnt = 0, system, canAnimate, permissionsGranted }) => {
  const [isActive, setIsActive] = useState(canAnimate??false);

  const unit = system === 'metric' ? 'kcal' : 'cal.';
  
  return (
    <View style={styles.outerContainer}>
      <BlurView
        style={styles.glassEffect}
        intensity={125}
        tint="light"
      >
        <LinearGradient 
          colors={['#E85C0D', '#C7253E']}
          style={StyleSheet.absoluteFill}
        />
        {isActive ? (
          <LottieView
            source={require("../../assets/main/Lottie/fireLottieJson.json")}
            autoPlay
            loop
            style={[styles.lottie]}
          />
        ):(
          <LottieView
            source={require("../../assets/main/Lottie/fireLottieJson.json")}
            style={[styles.lottie]}
          />
        )}       
      </BlurView>

      <View style={styles.absoluteContiner}>
        <Svg height="100%" width="100%" viewBox="0 0 300 100">
            <SvgText
              fill="#000"
              stroke="#000"
              strokeWidth="1.5"
              fontSize="60"
              fontWeight="bold"
              x="50%"
              y="20%"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
            {totalBurnt +' '+ unit}
          </SvgText>
        </Svg>
      </View>
    </View>
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
  lottie: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  absoluteContiner: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

});

export default BurntCalorieContainer;
