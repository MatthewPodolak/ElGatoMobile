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
  const hasAssignedLikes = useRef(false);
  const [likedExercises, setLikedExercises] = useState([]);
  
  const [seriesAddingList, setSeriesAddingList] = useState([]);
  const [serieRemovalList, setSeriesRemovalList] = useState([]);
  const [temporarlyRemovedSeries, setTemporarlyRemovedSeries] = useState([]);

  const [optionsVisible, setOptionsVisible] = useState(false);
  const optionsAnimation = useRef(new Animated.Value(0)).current;
  const iconAnimation = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);
  const timeoutRefRemoval = useRef(null);

  const likeExerciseRequest = async (exerciseName) => {
    const existingExercise = likedExercises.find(
      (exercise) => exercise.name === exerciseName
    );
  
    const isLiked = !!existingExercise;
    let tempExerciseRecord = null;
  
    if (isLiked) {
      setLikedExercises(
        likedExercises.filter((exercise) => exercise.name !== exerciseName)
      );
      tempExerciseRecord = existingExercise;
    } else {
      const newExercise = { name: exerciseName, own: false, id: 0 };
      setLikedExercises([...likedExercises, newExercise]);
    }
  
    try {
      const res = await TrainingDataService.likeExercise(setIsAuthenticated, navigation, exerciseName);
  
      if (res.ok) {
        if (isLiked) {
          setLikedExercises((prevExercises) => [...prevExercises, tempExerciseRecord]);
        } else {
          setLikedExercises((prevExercises) => prevExercises.filter((exercise) => exercise.name !== exerciseName));
        }
      }
    } catch (error) {
      console.log(error);
      if (isLiked) {
        setLikedExercises((prevExercises) => [...prevExercises, tempExerciseRecord]);
      } else {
        setLikedExercises((prevExercises) => prevExercises.filter((exercise) => exercise.name !== exerciseName));
      }
    }
  }; 


  const removeExerciseFromTrainingDat = async (exerciseData, pastExerciseData) => {
    exerciseData.date = selectedDate;

    setTrainingData((prevData) => {
      if (!prevData) return prevData;
  
      const updatedExercises = prevData.exercises.filter(
        (item) => item.exercise.publicId !== exerciseData.publicId
      );
  
      return {
        ...prevData,
        exercises: updatedExercises,
      };
    });

    let data = [
      {
        exerciseId: exerciseData.publicId,
        date: exerciseData.date
      }
    ];

    try{
      var res = await TrainingDataService.removeExerciseFromTrainingDay(setIsAuthenticated, navigation, data);
      if(!res.ok){
        //ERROR
        exerciseRemovalThrowback(exerciseData, pastExerciseData);
      }

    }catch(error){
      //ERROR
      console.log(error);
      exerciseRemovalThrowback(exerciseData, pastExerciseData);
    }
  };
  
  const exerciseRemovalThrowback = (exerciseData, pastExerciseData) => {
    const newExerciseEntry = {
      exercise: exerciseData,
      pastData: pastExerciseData,
    };
  
    setTrainingData((prevData) => {
      if (!prevData) return prevData;
  
      const updatedExercises = [...prevData.exercises, newExerciseEntry];
      updatedExercises.sort(
        (a, b) => a.exercise.publicId - b.exercise.publicId
      );
  
      return {
        ...prevData,
        exercises: updatedExercises,
      };
    });
  };
  

  const serieRemoval = (data, tempData) => {
    data.date = selectedDate;

    if (timeoutRefRemoval.current) {
      clearTimeout(timeoutRefRemoval.current);
    }

    temporarlyRemovedSeries.push(tempData);

    setSeriesRemovalList((prevList) => {
      const index = prevList.findIndex(
        (item) =>
          item.exerciseName === data.exerciseName &&
          item.exerciseId === data.exerciseId
      );
  
      if (index === -1) {
        const newRecord = {
          exerciseName: data.exerciseName,
          exerciseId: data.exerciseId,
          date: data.date,
          seriesToRemoveId: [data.serieId],
        };
        return [...prevList, newRecord];
      } else {
        const updatedRecord = {
          ...prevList[index],
          seriesToRemoveId: [
            ...prevList[index].seriesToRemoveId,
            data.serieId,
          ],
        };
  
        return [
          ...prevList.slice(0, index),
          updatedRecord,
          ...prevList.slice(index + 1),
        ];
      }
    });

    timeoutRefRemoval.current = setTimeout(() => {
      removeSeriesRequest(serieRemovalListRef.current);
    }, 3000);

  };
  
  const stopRemovalTimeout = (exercisePublicId) => {
    if (timeoutRefRemoval.current) {
      clearTimeout(timeoutRefRemoval.current);
    }

    setSeriesRemovalList((prevList) => {
      const updatedList = prevList.filter(
        (item) => item.exerciseId !== exercisePublicId
      );
      serieRemovalListRef.current = updatedList;
      return updatedList;
    });

    if(serieRemovalListRef.current.length > 0){
      timeoutRefRemoval.current = setTimeout(() => {
        removeSeriesRequest(serieRemovalListRef.current);
      }, 1000);
    }
  };

  const removeSeriesRequest = async (currentList) => {
    const sortedList = [...currentList].sort((a, b) => a.exerciseId - b.exerciseId);
    let groupedPastForExercises = [];

    sortedList.forEach(record => {
      let existingPastData = groupedPastForExercises.find((ex) => ex.exerciseName === record.exerciseName);
      if (!existingPastData) {
        const exercisesFound = trainingData.exercises.filter(item =>
          item.exercise.name.toLowerCase() === record.exerciseName.toLowerCase()
        );

        let pastDataSeries = [];
        let counter = 0;

        exercisesFound.forEach(ex => {
          ex.exercise.series.forEach(serie => {
            let pastDataSerie = {
              publicId: counter,
              repetitions: serie.repetitions,
              weightKg: serie.weightKg,
              weightLbs: serie.weightLbs,
            };
            pastDataSeries.push(pastDataSerie);
            counter++;
          });
        });
        
        let pastExData = {
          date: selectedDate,
          series: pastDataSeries,
        };

        let exercisePastDataModel = {
          exerciseName: record.exerciseName,
          exerciseData: pastExData
        };

        groupedPastForExercises.push(exercisePastDataModel);
      }
    });

    const finalModel = sortedList.map((element) => ({
      date: element.date,
      exercisePublicId: element.exerciseId,
      historyUpdate: groupedPastForExercises.find(ex => ex.exerciseName === element.exerciseName)??[],
      seriesIdToRemove: element.seriesToRemoveId,
    }));

    try{
      const res = await TrainingDataService.removeSeriesFromExercisses(setIsAuthenticated, navigation, finalModel);
      if(!res.ok){
        //error
        addRemovedSeriesDueToUpdateError();
        console.log("error");
      }

    }
    catch(error){
      //error
      addRemovedSeriesDueToUpdateError();
      console.log("error");
    }
    finally{
      setTemporarlyRemovedSeries([]);
      setSeriesRemovalList([]);
    }
  };

  const serieAddition = (data) => {
    data.date = selectedDate;
  
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  
    setSeriesAddingList((prevList) => {
      const updatedList = prevList.map((record) => ({
        ...record,
        series: [...record.series],
      }));
  
      const existingIndex = updatedList.findIndex(
        (record) =>
          record.exerciseName === data.exerciseName &&
          record.publicId === data.higherId
      );
  
      if (existingIndex !== -1) {
        updatedList[existingIndex] = {
          ...updatedList[existingIndex],
          series: [
            ...updatedList[existingIndex].series,
            {
              repetitions: data.repetitions,
              weightKg: data.weightKg,
              weightLbs: data.weightLbs,
            },
          ],
        };
      } else {
        updatedList.push({
          exerciseName: data.exerciseName,
          publicId: data.higherId,
          date: data.date,
          series: [
            {
              repetitions: data.repetitions,
              weightKg: data.weightKg,
              weightLbs: data.weightLbs,
            },
          ],
        });
      }
  
      return updatedList;
    });
  
    timeoutRef.current = setTimeout(() => {
      addSeriesRequest(seriesAddingListRef.current);
    }, 3000);
  };
  
  //rem 
  const seriesAddingListRef = useRef(seriesAddingList);
  useEffect(() => {
    seriesAddingListRef.current = seriesAddingList;
  }, [seriesAddingList]);

  const serieRemovalListRef = useRef(serieRemovalList);
  useEffect(() => {
    serieRemovalListRef.current = serieRemovalList;
  }, [serieRemovalList]);
  
  const addSeriesRequest = async (currentList) => {
    const sortedList = [...currentList].sort((a, b) => a.publicId - b.publicId);
  
    let groupedPastForExercises = [];
  
    sortedList.forEach((record) => {
      let existingExercise = groupedPastForExercises.find((ex) => ex.exerciseName === record.exerciseName);
  
      if (!existingExercise) {
        const exercisesFound = trainingData.exercises.filter(item =>
          item.exercise.name.toLowerCase() === record.exerciseName.toLowerCase()
        );

        let pastDataSeries = [];
        let counter = 0;

        exercisesFound.forEach(ex => {
          ex.exercise.series.forEach(serie => {
            let pastDataSerie = {
              publicId: counter,
              repetitions: serie.repetitions,
              weightKg: serie.weightKg,
              weightLbs: serie.weightLbs,
            };
            pastDataSeries.push(pastDataSerie);
            counter++;
          });
        });
        
        let pastExData = {
          date: selectedDate,
          series: pastDataSeries,
        };

        let exercisePastDataModel = {
          exerciseName: record.exerciseName,
          exerciseData: pastExData
        };

        groupedPastForExercises.push(exercisePastDataModel);
      }
    });
  
    const finalModel = sortedList.map((element) => ({
      date: element.date,
      publicId: element.publicId,
      historyUpdate: groupedPastForExercises.find(ex => ex.exerciseName === element.exerciseName)??[],
      series: element.series,
    }));
  
  
    try {
      const res = await TrainingDataService.addSeriesToExercisses(setIsAuthenticated, navigation, finalModel);
      if (!res.ok) {
        //ERROR
        removeInsertedSeriesDueToUpdateError(finalModel);
      }
    } catch (error) {
      //ERROR
      console.log(error);
      removeInsertedSeriesDueToUpdateError(finalModel);
    } finally {
      setSeriesAddingList([]);
    }
  };
  

  const removeInsertedSeriesDueToUpdateError = (finalModel) => {
    finalModel.forEach(element => {
      let id = element.publicId;
      let removeCount = element.series.length;

      let target = trainingData.exercises.find(ex => ex.exercise.publicId === id);

      if (target) {
          let series = target.exercise.series;
            
          if (series.length >= removeCount) {
            target.exercise.series = series.slice(0, series.length - removeCount);
          }
      }

    });
  };

  const addRemovedSeriesDueToUpdateError = () => {
    temporarlyRemovedSeries.forEach(record => {
      let targetedExercise = trainingData.exercises.find(ex => ex.exercise.publicId === record.exerciseId && ex.exercise.name === record.exerciseName);
      
      if(targetedExercise){
        targetedExercise.exercise.series.push(record.exerciseData);
        targetedExercise.exercise.series.sort((a, b) => a.publicId - b.publicId);
      }
    });
  };

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
    if (seriesAddingList.length > 0) {
      clearTimeout(timeoutRef.current);
      addSeriesRequest();
    }
  }, [selectedDate]);
  

  useEffect(() => {
      getMeasureType();

      if(likedExercises.length === 0){
        getLikedExercises();
      }

      if (!selectedDate) {
        getTrainingDay();
      }
      
  }, []);

  useEffect(() => {
    if (
      trainingData &&
      trainingData.exercises &&
      trainingData.exercises.length > 0 &&
      likedExercises &&
      likedExercises.length > 0 &&
      !hasAssignedLikes.current
    ) {
      assignLikesToExercises();
      hasAssignedLikes.current = true;
    }
  }, [trainingData, likedExercises]);
  
   

  const getLikedExercises = async () => {
    try{
      const res = await TrainingDataService.getLikedExercises(setIsAuthenticated, navigation);
      if(res.ok){
        const data = await res.json();
        setLikedExercises(data);
      }else{
        setLikedExercises([]);
      }
    }catch(error){
      //ERROR
      setLikedExercises([]);
      console.log("Error getting liked exercises");
    }
  };

  useEffect(() => {
    hasAssignedLikes.current = false;
  }, [trainingData]);
  
  const assignLikesToExercises = () => {
    if (!trainingData || !trainingData.exercises || likedExercises.length === 0) {
      return;
    }
        
    trainingData.exercises.forEach(element => {
      const match = likedExercises.find(a => a.name === element.exercise.name);
      if (match) {
        element.exercise.isLiked = true;
      }
    });
  };
  

  const getMeasureType = async () => {
    try{
      const res = await UserDataService.getUserWeightType(setIsAuthenticated, navigation);
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
                <TrainingDayExerciseDisplay key={index} exercise={model.exercise} pastExerciseData={model.pastData} measureType={measureType} serieAddition={serieAddition} serieRemoval={serieRemoval} removeExerciseFromTrainingDat={removeExerciseFromTrainingDat} stopRemovalTimeout={stopRemovalTimeout} likeExerciseRequest={likeExerciseRequest}/>
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
