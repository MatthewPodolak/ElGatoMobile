import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { useFocusEffect } from '@react-navigation/native';
import { closeOptionsAnimation, showOptionsAnimation } from '../../../Animations/ButtonAnimation.js';
import TrainingDataService from '../../../Services/ApiCalls/TrainingData/TrainingDataService.js';
import UserDataService from '../../../Services/ApiCalls/UserData/UserDataService.js';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import TrainingDayExerciseDisplay from '../../../Components/Training/TrainingDayExerciseDisplay.js';
import CardioTrainingDayDisplay from '../../../Components/Training/CardioTrainingDayDisplay.js';
import Calendar from '../../../Components/Diet/Calendar';
import PlusIcon from '../../../assets/main/Diet/plus-lg.svg';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import CardioDataService from '../../../Services/ApiCalls/CardioData/CardioDataService.js';


function TrainingHome({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { setIsAuthenticated } = useContext(AuthContext);

  const [refreshing, setRefreshing] = useState(false);
  const lastRefreshRef = useRef(0);
  const REFRESH_INTERVAL = 5000;

  const [activeTab, setActiveTab] = useState("Gym");
  const [measureType, setMeasureType] = useState("metric");
  const [isGymLoading, setIsGymLoading] = useState(false);
  const [isCardioLoading, setIsCarioLoading] = useState(false);
  const [isTrainingBeingSaved, setIsTrainingBeingSaved] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [trainingData, setTrainingData] = useState(null);
  const hasAssignedLikes = useRef(false);
  const [likedExercises, setLikedExercises] = useState([]);
  const [editedExercisesList, setEditedExercisesList] = useState([]);
  
  const [seriesAddingList, setSeriesAddingList] = useState([]);
  const [serieRemovalList, setSeriesRemovalList] = useState([]);
  const [temporarlyRemovedSeries, setTemporarlyRemovedSeries] = useState([]);

  //cardio variables
  const [cardioTrainingData, setCardioTrainingData] = useState(null);

  const [optionsVisible, setOptionsVisible] = useState(false);
  const optionsAnimation = useRef(new Animated.Value(0)).current;
  const iconAnimation = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);
  const timeoutRefRemoval = useRef(null);
  const timeoutRefUpdate = useRef(null);

  const onRefresh = useCallback(async () => {
      setRefreshing(true);
  
      const now = Date.now();
      const sinceLast = now - lastRefreshRef.current;
  
      if (sinceLast >= REFRESH_INTERVAL){
        lastRefreshRef.current = now;
        
        switch(activeTab){
          case "Gym":
            await getTrainingDay(selectedDate);
            break;
          case "Cardio":
            await getTrainingDayCardio(selectedDate);
            break;
        }

      }
  
      setRefreshing(false);
  }, [activeTab, selectedDate, getTrainingDay, getTrainingDayCardio]);

  const setActiveTabFunc = async (value) => {
    setActiveTab(value);
    if(value !== activeTab){
      if(value === 'Gym'){
        await getTrainingDay(selectedDate);
      }else{
        await getTrainingDayCardio(selectedDate);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (route.params?.shouldReload) {
        if(activeTab === 'Gym'){
          getTrainingDay(selectedDate);
        }else{
          getTrainingDayCardio(selectedDate);
        }

        navigation.setParams({ shouldReload: false });
      }
    }, [route.params?.shouldReload])
  );

  const saveTraining = async () => {
    setIsTrainingBeingSaved(true);

    try{
      let exerciseNames = [];

      trainingData.exercises.forEach(element => {
        exerciseNames.push(element.exercise.name);
      });

      let data = {
        name: "New training",
        exerciseNames: exerciseNames
      };

      const res = await TrainingDataService.saveTraining(setIsAuthenticated, navigation, data);
      if(!res.ok){
        //error
      }

    }catch(error){
      //Error
      console.log(error);
    }finally{
      setIsTrainingBeingSaved(false);
    }
  };

  const likeExerciseRequest = async (exerciseName, muscleType) => {
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
      const newExercise = { name: exerciseName, own: false, id: 0, muscleType: muscleType };
      setLikedExercises([...likedExercises, newExercise]);
    }
  
    try {
      const res = await TrainingDataService.likeExercise(setIsAuthenticated, navigation, exerciseName, muscleType);
  
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

  const updateSerie = (data) => {    
    if (timeoutRefUpdate.current) {
      clearTimeout(timeoutRefUpdate.current);
    }
    data.date = selectedDate;

    const targeted = editedExercisesList.find(a=>a.exerciseId === data.exerciseId);
    if(targeted){
      const targetedSerie = targeted.seriesToUpdate.find(a=>a.serieId === data.serieId);
      if(targetedSerie){
            targetedSerie.newWeightKg = data.newWeightKg;
            targetedSerie.newWeightLbs = data.newWeightLbs;
            targetedSerie.newRepetitions = data.newRepetitions;
      }else{
        targeted.seriesToUpdate.push({
          serieId: data.serieId,
          newWeightKg: data.newWeightKg,
          newWeightLbs: data.newWeightLbs,
          newRepetitions: data.newRepetitions
        });
      }
    }else{
      editedExercisesList.push({
        exerciseId: data.exerciseId,
        exerciseName: data.exerciseName,
        seriesToUpdate: [{
            serieId: data.serieId,
            newWeightKg: data.newWeightKg,
            newWeightLbs: data.newWeightLbs,
            newRepetitions: data.newRepetitions
        }],
        fallBackData: {
          oldWeightKg: data.oldWeightKg,
          oldWeightLbs: data.oldWeightLbs,
          oldRepetitions: data.oldRepetitions
        },
        date: data.date,
      });
    }

    timeoutRefUpdate.current = setTimeout(() => {
      updateSerieRequest(updateListRef.current);
    }, 3000);
  };

  const updateSerieRequest = async (currentList) => {
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
      ExercisePublicId: element.exerciseId,
      SeriesToUpdate: element.seriesToUpdate,
      historyUpdate: groupedPastForExercises.find(ex => ex.exerciseName === element.exerciseName)??[],
    }));

    try{
      const res = await TrainingDataService.updateExerciseSeriesData(setIsAuthenticated, navigation, finalModel);
      if(!res.ok){
        //ERROR
        seriesUpdateThrowback(currentList);
      }

    }catch(error){
      //ERROR
      console.log(error);
    }finally{
      setEditedExercisesList([]);
    }

  };

  const seriesUpdateThrowback = (data) => {  
    const updatedTrainingData = {
      ...trainingData,
      exercises: trainingData.exercises.map((exercise) => ({
        ...exercise,
        exercise: {
          ...exercise.exercise,
          series: exercise.exercise.series.map((serie) => ({ ...serie })),
        },
      })),
    };
  
    data.forEach((element) => {
      const targetedExercise = updatedTrainingData.exercises.find(
        (exercise) => exercise.exercise.publicId === element.exerciseId
      );
  
      if (!targetedExercise) return;
  
      element.seriesToUpdate.forEach((serie) => {
        const targetedSerie = targetedExercise.exercise.series.find(
          (s) => s.publicId === serie.serieId
        );
  
        if (targetedSerie && element.fallBackData) {
          targetedSerie.weightKg = element.fallBackData.oldWeightKg ?? targetedSerie.weightKg;
          targetedSerie.weightLbs = element.fallBackData.oldWeightLbs ?? targetedSerie.weightLbs;
          targetedSerie.repetitions = element.fallBackData.oldRepetitions ?? targetedSerie.repetitions;
        }
      });
    });
  
    setTrainingData(updatedTrainingData);
  };


  const removeExerciseFromTrainingDat = async (exerciseData, pastExerciseData) => {   

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
        date: selectedDate
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

  const updateListRef = useRef(editedExercisesList);
  useEffect(() => {
    updateListRef.current = editedExercisesList;
  }, [editedExercisesList]);
  
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
      if(activeTab === 'Gym'){
        await getTrainingDay(date + 'T00:00:00Z');
      }else{
        await getTrainingDayCardio(date + 'T00:00:00Z');
      }
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
        if(activeTab === 'Gym'){
          getTrainingDay();
        }else{
          getTrainingDayCardio();
        }
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
        element.exercise.muscleType = match.muscleType;
      }
    });
  };
  

  const getMeasureType = async () => {
    try{
      const res = await UserDataService.getUserWeightType(setIsAuthenticated, navigation);
      const data = await res.json();
      setMeasureType(data);
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
      setIsGymLoading(true);
    }

    try{
      const res = await TrainingDataService.getTrainingDay(setIsAuthenticated, navigation, dates);
      if(!res.ok){
        //Error
        return;
      }

      const data = await res.json();
      setIsGymLoading(false);
      setTrainingData(data);

    }catch(error){
      console.log(error);
      //Error -> display no net
    }
  };

  const getTrainingDayCardio = async (specifiedDate, canBeBlocked = true) => {
    let dates;

    if(specifiedDate){
      dates = specifiedDate;
    }else{
      let date = new Date();
      dates = date.toISOString().split("T")[0] + "T00:00:00Z";
    }
    
    if(canBeBlocked){
      setIsCarioLoading(true);
    }

    try{
      const res = await CardioDataService.getCardioTrainingDay(setIsAuthenticated, navigation, dates);
      if(!res.ok){
        //Error
        return;
      }

      const data = await res.json();
      setIsCarioLoading(false);
      setCardioTrainingData(data);

    }catch(error){
      console.log(error);
      //Error -> display no net
    }
  };

  const changeVisilibity = async (exerciseId, newStatus) => {
    let model = {
      date: selectedDate,
      state: newStatus,
      exerciseId: exerciseId,
    };

    try{
      const res = await CardioDataService.changeExerciseVisilibity(setIsAuthenticated, navigation, model);
      if(!res.ok){
        //error
        return;
      }

    }catch(error){
      //error
    }
  };

  const removeCardioExercise = async (exercise) => {
  let removedEntry;

  setCardioTrainingData(prev => {
    if (!prev?.exercises) return prev;

    removedEntry = prev.exercises.find(
      entry => entry.exerciseData.publicId === exercise.publicId
    );

    const filtered = prev.exercises.filter(
      entry => entry.exerciseData.publicId !== exercise.publicId
    );
    return { ...prev, exercises: filtered };
  });

  const model = {
    date: selectedDate,
    exercisesIdToRemove: [exercise.publicId],
  };

  try {
    const res = await CardioDataService.removeCardioExercises(setIsAuthenticated, navigation, model);

    if (!res.ok) {
      setCardioTrainingData(prev => ({
        ...prev,
        exercises: removedEntry
          ? [...prev.exercises, removedEntry]
          : prev.exercises
      }));
      return;
    }

  } catch (error) {
    setCardioTrainingData(prev => ({
      ...prev,
      exercises: removedEntry
        ? [...prev.exercises, removedEntry]
        : prev.exercises
    }));
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

  const navigateToLoadPlans = () => {
    navigation.navigate('LoadExercises', { recivedDate: selectedDate });
  };

  const navigateToStartCardio = () => {
    navigation.navigate('CardioStartScreen');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={{ height: insets.top, backgroundColor: "#FF8303" }} />
      <StatusBar style="light"  backgroundColor="#fff" translucent={false} hidden={false} />

      <Calendar onDateSelect={handleDateSelect} />  
      <View style={styles.categoryContainer}>
        <TouchableOpacity style={styles.option} onPress={() => setActiveTabFunc("Gym")} ><Text style={[styles.optionTextSecondary, activeTab === "Gym" && styles.activeTab]}>Gym</Text></TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => setActiveTabFunc("Cardio")} ><Text style={[styles.optionTextSecondary, activeTab === "Cardio" && styles.activeTab]}>Cardio</Text></TouchableOpacity>
      </View>  
      {activeTab === "Gym" ? (
        <>
          {isGymLoading ? (
            <View style={[GlobalStyles.center, GlobalStyles.flex]}>
              <ActivityIndicator size="large" color="#FF8303" />
            </View>
          ) : (
            trainingData?.exercises && trainingData.exercises.length > 0 ? (
              <ScrollView style={[GlobalStyles.flex]} 
                showsVerticalScrollIndicator={false} 
                showsHorizontalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#FF8303"
                    colors={['#FF8303']}
                    title={refreshing ? 'Refreshing...' : null}
                  />
                }
              >            

                <View style={styles.topMargin}></View>
                {trainingData.exercises.map((model, index) => (
                  <TrainingDayExerciseDisplay key={index} exercise={model.exercise} pastExerciseData={model.pastData} measureType={measureType} serieAddition={serieAddition} serieRemoval={serieRemoval} removeExerciseFromTrainingDat={removeExerciseFromTrainingDat} stopRemovalTimeout={stopRemovalTimeout} likeExerciseRequest={likeExerciseRequest} updateSerie={updateSerie}/>
                ))}
                <View style={styles.saveBottomRow}>
                  {isTrainingBeingSaved ? (
                    <>
                    <View style={styles.saveLimiter}>
                      <ActivityIndicator size="small" color="#FF8303" />
                    </View>
                    </>
                  ):(
                    <>
                    <TouchableOpacity onPress={() => saveTraining()}>
                      <Text style={[GlobalStyles.text16, GlobalStyles.orange]}>Save training</Text>
                    </TouchableOpacity>
                    </>
                  )}               
                </View>
                <View style={styles.bottomMargin}></View>
              </ScrollView>
            ) : (
              <ScrollView style={[GlobalStyles.flex]} 
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false} 
                showsHorizontalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#FF8303"
                    colors={['#FF8303']}
                    title={refreshing ? 'Refreshing...' : null}
                  />
                } 
              >
                <View style={styles.emptyGatoLottie}></View>
                <View style={styles.emptySearchText}>
                  <Text style={styles.emptySearchTxt}>
                    <Text style={[GlobalStyles.orange]}>Nothing? </Text>Get yo ass to work
                  </Text>
                </View>
              </ScrollView>
            )
          )}
        </>
      ):(
        <>
          {isCardioLoading ? (
            <View style={[GlobalStyles.center, GlobalStyles.flex]}>
              <ActivityIndicator size="large" color="#FF8303" />
            </View>
          ):(
            cardioTrainingData?.exercises && cardioTrainingData.exercises.length > 0 ? (
              <ScrollView style={[GlobalStyles.flex]} 
                showsVerticalScrollIndicator={false} 
                showsHorizontalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#FF8303"
                    colors={['#FF8303']}
                    title={refreshing ? 'Refreshing...' : null}
                  />
                }             
              >            
                {cardioTrainingData.exercises.map((training, index) => (
                  <CardioTrainingDayDisplay key={training.exerciseData.publicId} exercise={training} measureType={measureType} changeVisilibity={changeVisilibity} removeCardioExercise={removeCardioExercise}/>
                ))}
                <View style={styles.cardioSpacing}></View>
              </ScrollView>
            ) : (
              <ScrollView style={[GlobalStyles.flex]} 
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false} 
                showsHorizontalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#FF8303"
                    colors={['#FF8303']}
                    title={refreshing ? 'Refreshing...' : null}
                  />
                } 
              >
                <View style={styles.emptyGatoLottie}></View>
                <View style={styles.emptySearchText}>
                  <Text style={styles.emptySearchTxt}>
                    <Text style={[GlobalStyles.orange]}>Nothing? </Text>Get yo ass to work
                  </Text>
                </View>
              </ScrollView>
            )
          )}
        </>
      )}
                
        <Animated.View
          pointerEvents={optionsVisible ? 'auto' : 'none'}
          style={[
            styles.buttonOptionContainer,
            { opacity: optionsAnimation, transform: [{ translateY: optionsAnimation.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] },
          ]}
        >
          {activeTab === "Gym" ? (
              <>
                <TouchableOpacity style={styles.expOptionRow} onPress={navigateToAddExercise}>
                  <Text style={[GlobalStyles.text16]}>Add new</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.expOptionRow} onPress={navigateToLoadPlans} >
                  <Text style={[GlobalStyles.text16]}>Load plan</Text>
                </TouchableOpacity>
              </>
          ):(
              <>
                <TouchableOpacity style={styles.expOptionRow} onPress={navigateToStartCardio} >
                  <Text style={[GlobalStyles.text16]}>Start activity</Text>
                </TouchableOpacity>
              </>
          )}
          
        </Animated.View>

        <TouchableOpacity style={styles.addExerciseButton} onPress={optionButtonPressed}>
        <Animated.View
          pointerEvents={optionsVisible ? 'auto' : 'none'}
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
    height: '85%',
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
    bottom: 85,
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
    bottom: 150,
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
  },
  saveBottomRow: {
    marginLeft: 25,
  },
  saveLimiter: {
    width: '10%',
  },

  categoryContainer: {
    marginTop: 15,
    width: '100%',
    flexDirection: 'row',
  },
  option: {
    marginLeft: 15,
  },
  optionText: {
    fontSize: 18,
    fontFamily: 'Helvetica',
  },
  optionTextSecondary: {
    fontSize: 14,
    fontFamily: 'Helvetica',
  },
  activeTab: {
    color: '#FF8303',
    borderBottomColor: '#FF8303', 
    borderBottomWidth: 2,
    paddingBottom: 5,
  },
  cardioSpacing: {
    height: 75,
  }
});

export default TrainingHome;