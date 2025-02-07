import React, { useState, useRef, useEffect, useContext } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { closeOptionsAnimation, showOptionsAnimation } from '../../../Animations/ButtonAnimation.js';
import TrainingDataService from '../../../Services/ApiCalls/TrainingData/TrainingDataService.js';
import UserDataService from '../../../Services/ApiCalls/UserData/UserDataService.js';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import TrainingDayExerciseDisplay from '../../../Components/Training/TrainingDayExerciseDisplay.js';
import Calendar from '../../../Components/Diet/Calendar';
import PlusIcon from '../../../assets/main/Diet/plus-lg.svg';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';


function TrainingHome({ navigation, route }) {
  const { setIsAuthenticated } = useContext(AuthContext);
  const [measureType, setMeasureType] = useState("metric");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [trainingData, setTrainingData] = useState(null);

  const [optionsVisible, setOptionsVisible] = useState(false);
  const optionsAnimation = useRef(new Animated.Value(0)).current;
  const iconAnimation = useRef(new Animated.Value(0)).current;

  const handleDateSelect = async (date) => {
    if((date + 'T00:00:00Z') === selectedDate){
      return;
    }

    setSelectedDate(date + 'T00:00:00Z');
    
    if (selectedDate !== null) {
      await getTrainingDay(date + 'T00:00:00Z');
    }
  }

  useEffect(() => {
    if (route.params?.updatedExercises) {
        const receivedExercisesNames = route.params.updatedExercises.name;
        const receivedDate = route.params.updatedExercises.date;

        if (selectedDate === receivedDate) {

            setTrainingData(prevData => {
                const maxPublicId = prevData?.exercises?.reduce(
                    (max, exercise) => Math.max(max, exercise.exercise.publicId), 0
                ) || 0;

                const newExercises = receivedExercisesNames.map((name, index) => ({
                    exercise: {
                        name: name,
                        publicId: maxPublicId + 1 + index,
                        series: []
                    },
                    pastData: null
                }));

                return {
                    ...prevData,
                    exercises: [...(prevData?.exercises || []), ...newExercises]
                };
            });

            (async () => {
                try {
                    const updatedData = await getTrainingDay(receivedDate, false);
                    if (updatedData) {
                        setTrainingData(updatedData);
                    }
                } catch (error) {
                    console.error("Error fetching training day", error);
                    //Error
                }
            })();
        }
    }
  }, [route.params?.updatedExercises]);


  useEffect(() => {
      getMeasureType();

      if (!selectedDate) {
        getTrainingDay();
      }
      
  }, []);

  const getMeasureType = async () => {
    try{
      var res = await UserDataService.getUserWeightType(setIsAuthenticated, navigation);
      setMeasureType(res);
    }catch(ex){
      console.log(ex);
      //error
    }
  };

  const getTrainingDay = async (specifiedDate, canBeBlocked = true) => {
    let dates;

    if(specifiedDate){
      dates = specifiedDate;
    }else{
      let date = new Date();
      dates = date.toISOString().split("T")[0] + "T00:00:00Z";
    }
    
    if(canBeBlocked){
      setIsLoading(true);
    }

    try{
      const res = await TrainingDataService.getTrainingDay(setIsAuthenticated, navigation, dates);
      if(!res.ok){
        //Error
        return;
      }

      const data = await res.json();
      setIsLoading(false);
      setTrainingData(data);

    }catch(error){
      console.log(error);
      //Error
    }
  };

  const optionButtonPressed = () => {
    if (optionsVisible) {
      closeOptionsAnimation(optionsAnimation, iconAnimation, setOptionsVisible);
    } else {
      showOptionsAnimation(optionsAnimation, iconAnimation, setOptionsVisible);
    }
  };

  const navigateToAddExercise = () => {
    navigation.navigate('AddExercise', { selectedDate });
  };


  return (
    <SafeAreaView style={styles.container}>
      <Calendar onDateSelect={handleDateSelect} />     
      {isLoading ? (
          <View style={[GlobalStyles.center, GlobalStyles.flex]}>
            <ActivityIndicator size="large" color="#FF8303" />
          </View>
        ) : (
          trainingData?.exercises && trainingData.exercises.length > 0 ? (
            <ScrollView style={[GlobalStyles.flex]} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
              <View style={styles.topMargin}></View>
              {trainingData.exercises.map((model, index) => (
                <TrainingDayExerciseDisplay key={index} exercise={model.exercise} pastExerciseData={model.pastData} measureType={measureType} />
              ))}
              <View style={styles.bottomMargin}></View>
            </ScrollView>
          ) : (
            <View style={[GlobalStyles.center, GlobalStyles.flex]}>
              <View style={styles.emptyGatoLottie}></View>
              <View style={styles.emptySearchText}>
                <Text style={styles.emptySearchTxt}>
                  <Text style={[GlobalStyles.orange]}>Nothing? </Text>Get yo ass to work
                </Text>
              </View>
            </View>
          )
        )}
        
        <Animated.View
          style={[
            styles.buttonOptionContainer,
            { opacity: optionsAnimation, transform: [{ translateY: optionsAnimation.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] },
          ]}
        >
          <TouchableOpacity style={styles.expOptionRow} onPress={navigateToAddExercise}>
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
    fontSize: 18,
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
  topMargin: {
    height: 15,
  },
  bottomMargin: {
    height: 80,
  }
});

export default TrainingHome;
