import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import AddIcon from '../../assets/main/Diet/plus-lg.svg';

import { GlobalStyles } from '../../Styles/GlobalStyles';

const LikedExercise = ({ indexx, exercise, isSetted, isPicked, pickExercise }) => {  
  const iconAnimation = useRef(new Animated.Value(isPicked ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(iconAnimation, {
      toValue: isPicked ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isPicked]);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <BlurView style={isPicked ? styles.pickedGlassEffect : isSetted ? styles.settedGlassEffect: styles.normalGlassEffect} intensity={125} tint="light">
          <View style={styles.topRow}>
            <View style={styles.headerText}>
              <Text style={GlobalStyles.text16}>{exercise.name}</Text>
            </View>
            <View style={styles.headerClose}>
              <TouchableOpacity style={{ marginRight: 5 }} onPress={() => pickExercise(indexx, exercise)}>
                <Animated.View
                    style={{
                      transform: [
                    {
                       rotate: iconAnimation.interpolate({
                       inputRange: [0, 1],
                       outputRange: ['0deg', '135deg'],
                      }),
                         },
                        ],
                      }}
                    >
                  <AddIcon width={26} height={26} fill={'#FF8303'} />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: 'whitesmoke',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  normalGlassEffect: {
    width: '90%',
    padding: 15,
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
  settedGlassEffect: {
    width: '90%',
    padding: 15,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'red',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  pickedGlassEffect: {
    width: '90%',
    padding: 15,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderWidth: 2,
    borderColor: '#FF8303',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  headerClose: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
});

export default LikedExercise;
