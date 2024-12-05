import React, { useState, useRef } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { closeOptionsAnimation, showOptionsAnimation } from '../../../Animations/ButtonAnimation.js';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import Calendar from '../../../Components/Diet/Calendar';
import PlusIcon from '../../../assets/main/Diet/plus-lg.svg';

function TrainingHome({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [trainingData, setTrainingData] = useState(null);

  const [optionsVisible, setOptionsVisible] = useState(false);
  const optionsAnimation = useRef(new Animated.Value(0)).current;
  const iconAnimation = useRef(new Animated.Value(0)).current;

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    console.log(date);
  }

  const optionButtonPressed = () => {
    if (optionsVisible) {
      closeOptionsAnimation(optionsAnimation, iconAnimation, setOptionsVisible);
    } else {
      showOptionsAnimation(optionsAnimation, iconAnimation, setOptionsVisible);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Calendar onDateSelect={handleDateSelect} />     
        {isLoading ? (
          <View style={[GlobalStyles.center, GlobalStyles.flex]}>
            <ActivityIndicator size="large" color="#FF8303" />
          </View>
        ) : (trainingData == null && !isLoading) ? (
          <View style={[GlobalStyles.center, GlobalStyles.flex]}>
            {/* EL GATO BASED ON THIS WEEK ALRD FINISHED TRAINIGNS */}
            <View style = {styles.emptyGatoLottie}></View>
            <View style = {styles.emptySearchText}>
                <Text style = {styles.emptySearchTxt}><Text style = {[GlobalStyles.orange, GlobalStyles.bold]}>Nothing? </Text>Get yo ass to work</Text>
            </View>
          </View>
        ) : (
          <View style={[GlobalStyles.center, GlobalStyles.flex]}>
          </View>
        )}
        
        <Animated.View
          style={[
            styles.buttonOptionContainer,
            { opacity: optionsAnimation, transform: [{ translateY: optionsAnimation.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] },
          ]}
        >
          <TouchableOpacity style={styles.expOptionRow}>
            <Text style={[GlobalStyles.text16]}>Add new</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.expOptionRow} >
            <Text style={[GlobalStyles.text16]}>Load plan</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={styles.addExerciseButton} onPress={optionButtonPressed}>
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
          <PlusIcon fill={'#fff'} width={27} height={27} />
        </Animated.View>
      </TouchableOpacity>
      
      <NavigationMenu navigation={navigation} currentScreen="TrainingHome" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },

  emptyGatoLottie: {
    height: '80%',
    width: '100%',
  },
  emptySearchText: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 20,
  },
  emptySearchTxt: {
    fontSize: 20,
    fontFamily: 'Helvetica',
    fontWeight: '500',
    textAlign: 'center',
  },

  addExerciseButton: {
    position: 'absolute',
    bottom: 65,
    right: 10,
    width: 60,
    height: 60,
    backgroundColor: '#FF8303',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  buttonOptionContainer: {
    height: 80,
    position: 'absolute',
    paddingLeft: 15,
    paddingRight: 15,
    bottom: 130,
    right: 0,
    justifyContent: 'space-around',
    alignItems: 'flex-end',   
  },
  expOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF8303',
    borderRadius: 15,
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 2,
    paddingBottom: 2,
  },

});

export default TrainingHome;
