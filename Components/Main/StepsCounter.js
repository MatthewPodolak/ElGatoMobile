import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlobalStyles } from '../../Styles/GlobalStyles';

import feetImg from '../../assets/main/Photos/steps.png';

function StepsCounter({ dailyGoal = 2500, currentSteps = 0, permissionsGranted = true }) {
  return (
    <BlurView style={styles.container} intensity={125} tint="light">
      <View style={[styles.content, GlobalStyles.center]}>
        <Text style={[GlobalStyles.text18, GlobalStyles.bold]}>
          {permissionsGranted ? (
            <>
              <Text style={styles.orangeHighlitgh}>{currentSteps} / {dailyGoal}</Text>
              <Text style={styles.blackHighligth}> steps made!</Text>
            </>
          ):(
            <Text style={styles.orangeHighlitgh}>gato needs permission to track!</Text>
          )}
        </Text>
      </View>
      <View style={[styles.imageContainer, GlobalStyles.center]}>
        <Image source={feetImg} style={styles.image} />
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    minHeight: 50,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    flexDirection: 'row',
  },
  content: {
    flex: 0.9,
    marginLeft: 25,
  },
  imageContainer: {
    flex: 0.2,
  },
  image: {
    height: 45,
    margin: 5,
    width: 45,
    resizeMode: 'contain',
  },
  blackHighligth: {
    color: 'black',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  orangeHighlitgh: {
    color: '#ff6600',
    textShadowColor: 'black',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
});

export default StepsCounter;