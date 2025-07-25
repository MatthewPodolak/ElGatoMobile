import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu.js';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableItem from '../../../Components/Main/DraggableItem.js';
import { useSharedValue } from 'react-native-reanimated';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { acessReadPermissionHealthConnect, checkHealthConnectPermissionsStatus } from '../../../Services/Helpers/Activity/ActivityPermissionHelper.js';
import { readStepsToday } from '../../../Services/Helpers/Activity/HealthConnect/HealthConnectMethods.js';
import { readRecordPeriod } from '../../../Services/Helpers/Activity/HealthConnect/HealthConnectMethods.js';
import { truncate } from '../../../Services/Helpers/Utils/Utils.js';

import AchievmentModal from '../../../Components/ElGato/AchievmentModal.js';

import WaterContainer from '../../../Components/Main/WaterContainer.js';
import NutriContainer from '../../../Components/Main/NutriContainer.js';
import BurntCalorieContainer from '../../../Components/Main/BurntCalorieContainer.js';
import LinearChart from '../../../Components/Main/LinearChart.js';
import CompareChart from '../../../Components/Main/CompareChart.js';
import UserDataService from '../../../Services/ApiCalls/UserData/UserDataService.js';
import HexagonalChart from '../../../Components/Main/HexagonalChart.js';
import BarChart from '../../../Components/Main/BarChart.js';
import CircleChartDist from '../../../Components/Main/CircleChartDist.js';
import WeightChart from '../../../Components/Main/WeightChart.js';
import StepsCounter from '../../../Components/Main/StepsCounter.js';
import UserRequestService from '../../../Services/ApiCalls/RequestData/UserRequestService.js';
import StepsChart from '../../../Components/Main/StepsChart.js';

function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { setIsAuthenticated } = useContext(AuthContext);

  const [refreshing, setRefreshing] = useState(false);
  const lastRefreshRef = useRef(0);
  const REFRESH_INTERVAL = 5000;

  const [systemType, setSystemType] = useState("metric");
  const [currentSteps, setCurrentSteps] = useState(0); //per 24
  const [currentCaloriesBurnt, setCurrentCaloriesBurnt] = useState(0); //per 24
  const [dailyStepsGoal, setDailyStepsGoal] = useState(0);
  const [dailyWaterIntakeGoal, setDailyWaterIntakeGoal] = useState(0);
  const [isPedometerAvaliable, setIsPedometerAvaliable] = useState(true); //If not used in further pedometer kt impl. remove, and update comp vis.
  const [stepsPermissionsGranted, setStepsPermissionsGranted] = useState(true);
  const [caloriePermissionGranted, setCaloriePermissionGranted] = useState(false);

  const [dailyMaxIntake, setDailyMaxIntake] = useState(null);
  const [currentDailyIntake, setCurrentDailyIntake] = useState(null);
  const [userWaterIntake, setUserWaterIntake] = useState(null);
  const userWaterRef = useRef(userWaterIntake);
  const [waterAddCounter, setWaterAddCounter] = useState(0);
  const waterTimeoutRef = useRef(null);

  const [userLayoutData, setUserLayoutData] = useState(null);
  const [areAnimationsActive, setAreAnimationsActive] = useState(null);
  const [userLayoutError, setUserLayoutError] = useState(null);

  const [chartDataExercises, setChartDataExercises] = useState(null);
  const [chartDataLoading, setChartDataLoading] = useState(false);
  const [muscleUsageData, setMuscleUsageData] = useState(null);
  const [pastMakroData, setPastMakroData] = useState(null);
  const [dailyMakroDist, setDailyMakroDist] = useState(null);
  const [weightHistoryData, setWeightHistoryData] = useState(null);
  const [stepsHistoryData, setStepsHistoryData] = useState(null);

  const [mainErrors, setMainErrors] = useState(false);
  const scrollViewRef = useRef(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollOffsetSV = useSharedValue(0);

  const [achievmentData, setAchievmentData] = useState(null);
  const [achievmentModalVisible, setAchievmentModalVisible] = useState(false);
  const closeAchievmentModal = () => { setAchievmentData(null); setAchievmentModalVisible(false); }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    const now = Date.now();
    const sinceLast = now - lastRefreshRef.current;

    if (sinceLast >= REFRESH_INTERVAL){
      lastRefreshRef.current = now;
      
      try{
        if (userLayoutData) {
          await getChartsData();
        }

        await getCurrentDailyIntake();
      }catch(error){
        
      }
    }

    setRefreshing(false);
  }, [getChartsData, getCurrentDailyIntake]);

  useEffect(() => {
    if (route.params?.needsRefresh) {
      navigation.setParams({ needsRefresh: false });
      getUserLayoutData();
    }
  }, [route.params?.needsRefresh]);

  const navigateToCompoControl = (type) => {
    if(!type) { return; }

    navigation?.navigate('CompoControl', {
      type: type ?? null,
      canAnimate: areAnimationsActive
    });
  }

  const personalizePressed = () => {
    navigation?.navigate('Personalize');
  }

  useEffect(() => {
      getMaxDailyIntake();
      getCurrentDailyIntake();
      getDailyStepsGoal();
      getDailyWaterIntakeGoal();
      getUserMetricSystem();
      getWaterIntake();
      getUserLayoutData();
  }, []);

  useEffect(() => {
      if (userLayoutData) {
          getChartsData();
      }
  }, [userLayoutData]);


  useEffect(() => {
      const requestPermissions = async () => {
        if (Platform.OS === 'android') {
          const permissionsToCheck = [
            { type: "ActiveCaloriesBurned", setter: setCaloriePermissionGranted },
            { type: "Steps", setter: setStepsPermissionsGranted }
          ];
    
          for (const { type, setter } of permissionsToCheck) {
            const granted = await checkHealthConnectPermissionsStatus(type);
            if (!granted) {
              const requested = await acessReadPermissionHealthConnect(type);
              setter(requested);
            } else {
              setter(true);
            }
          }
    
        } else if (Platform.OS === 'ios') {
          //TODO IOS impl. perm.
        }
      };
      
      requestPermissions(); 
    }, []);
  
    useEffect(() => { 
      
      //TO DO -- FALBACK TO OWN PEDOMETER BACKGROUND (PSB)
      
      const getCurrentSteps = async () => {
        if (Platform.OS === 'ios') {
          //TODO IOS IMP.
          return;
        } 
        else if (Platform.OS === 'android') {
          if(stepsPermissionsGranted){
            const todaySteps = await readStepsToday();

            setCurrentSteps(todaySteps);
            const now = new Date();
            const currentDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}T00:00:00.000+00:00`;
            let model = { date: currentDate, steps: todaySteps};
            const stepsRes = await UserRequestService.saveUserSteps(setIsAuthenticated, navigation, model);

            if(stepsRes != null){
              setAchievmentData(stepsRes);
              setAchievmentModalVisible(true);
            }
            return;
          }
        }
      };

      const getCurrentBurntCalories = async () => {
        const calorieSource = await UserDataService.getCalorieSource();

        if (Platform.OS === 'ios') {
          //TODO IOS IMP.
          return;
        } 
        else if (Platform.OS === 'android') {
   
          if(calorieSource === "both" && caloriePermissionGranted){
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const todayCalories = await readRecordPeriod('ActiveCaloriesBurned', startOfDay, new Date());
            let gatoCalories = 0;

            const now = new Date();
            const currentDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}T00:00:00.000+00:00`;
            const gatoCaloriesRes = await UserDataService.getCurrentlyBurntCalories(setIsAuthenticated, navigation, currentDate);
            if(gatoCaloriesRes.ok){
               gatoCalories = await gatoCaloriesRes.json();      
            }

            setCurrentCaloriesBurnt((todayCalories + gatoCalories));
            return;           
          }else if(calorieSource === "app"){
            let gatoCalories = 0;
            
            const now = new Date();
            const currentDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}T00:00:00.000+00:00`;
            const gatoCaloriesRes = await UserDataService.getCurrentlyBurntCalories(setIsAuthenticated, navigation, currentDate);
            if(gatoCaloriesRes.ok){
               gatoCalories = await gatoCaloriesRes.json();      
            }

            setCurrentCaloriesBurnt((gatoCalories));
            return;
          }

          setCurrentCaloriesBurnt(0);
        }
      };

      getCurrentSteps();
      getCurrentBurntCalories();
    }, [caloriePermissionGranted, stepsPermissionsGranted]);
  

  const getChartsData = async () => {
    setChartDataLoading(true);

    let exerciseNames = [];

    if (userLayoutData && Array.isArray(userLayoutData.chartStack)) {     
      userLayoutData.chartStack.forEach(element => {
        if (element.chartDataType === "Exercise") {
          exerciseNames.push(element.name);
        }
      });
    }
    exerciseNames = [...new Set(exerciseNames)];
    if (exerciseNames.length > 0) {
      await getPastExerciseData(exerciseNames);
    }

    if(userLayoutData.chartStack.find(a=>a.chartType === "Hexagonal")){
      await getMuscleUsageData();
    }

    if(userLayoutData.chartStack.find(a => ["Calorie", "Makro", "Protein", "Fat", "Carbs"].includes(a.chartDataType))){
      await getPastMakroData();
    }

    if(userLayoutData.chartStack.find(a=>a.chartType === "Circle" && a.chartDataType === "MakroDist")){
      await getMakroDailyDistData();
    }

    if (userLayoutData.chartStack.find(a => a.chartDataType === "Weight")){
      await getWeightData();
    }

    if(userLayoutData.chartStack.find(a => a.chartDataType === "Steps")){
      await getStepsData();
    }

    //here get the rest data based on layout.

    setChartDataLoading(false);
  };

  const getUserMetricSystem = async () => {
    try{
      const res = await UserDataService.getUserWeightType(setIsAuthenticated, navigation);
      if (typeof res === "string") {
        setSystemType(res);
      } else if (res && res.ok) {
        const data = await res.json();
        setSystemType(data);
      } else {
        setSystemType("metric");
      }
    }catch(error){
      setSystemType("metric");
    }
  };

  const getDailyStepsGoal = async () => {
    try{
      const res = await UserDataService.getDailyStepsGoal();
      setDailyStepsGoal(res);
    }catch(error){
      setMainErrors(true);
    }
  };

  const getDailyWaterIntakeGoal = async () => {
    try{
      const res = await UserDataService.getDailyWaterIntakeGoal();
      setDailyWaterIntakeGoal(res);
    }catch(error){
      setMainErrors(true);
    }
  };

  const getWaterIntake = async () => {
    try{
      const now = new Date();
      const currentDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}T00:00:00.000+00:00`;
      const res = await UserDataService.getUserCurrentWaterIntake(setIsAuthenticated, navigation, currentDate);
      if(!res.ok){
        setMainErrors(true);
        return;
      }

      const waterIntake = await res.json();
      setUserWaterIntake(waterIntake);

    }catch(error){
      setMainErrors(true);
    }
  };

  const getMaxDailyIntake = async () => {
    try{
      const data = await UserDataService.getUserCaloriesIntake(setIsAuthenticated, navigation);
      if(!data){
        setMainErrors(true);
        return;
      }

      setDailyMaxIntake(data);

    }catch(error){
      setMainErrors(true);
    }
  };

  const getCurrentDailyIntake = async () => {
    try{
      const now = new Date();
      const currentDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}T00:00:00.000+00:00`;

      const res = await UserDataService.getCurrentUserMakroIntake(setIsAuthenticated, navigation, currentDate);
      if(!res.ok){
        setMainErrors(true);
        return;
      }

      const data = await res.json();
      setCurrentDailyIntake(data);

    }catch(error){
      setMainErrors(true);
    }
  };

  const getUserLayoutData = async () => {
    try{
      const res = await UserDataService.getUserLayout(setIsAuthenticated, navigation);
      if(!res){        
        setMainErrors(true);
        setUserLayoutError("");
        return;
      }

      setAreAnimationsActive(res.animations);
      setUserLayoutData(res);

    }catch(error){
      setMainErrors(true);
      setUserLayoutError("");
    }
  };

  const getPastExerciseData = async (exerciseNames) => {
    try{
      let model = {
        exercisesNames: exerciseNames
      };

      const res = await UserDataService.getPastExerciseData(setIsAuthenticated, navigation, model);
      if(!res.ok){
        setMainErrors(true);
        return;
      }

      const data = await res.json();
      setChartDataExercises(data);

    }catch(error){
      setMainErrors(true);
    }
  };

  const getMuscleUsageData = async () => {
    try{
      const res = await UserDataService.getMuscleUsageData(setIsAuthenticated, navigation);
      if(!res){
        setMainErrors(true);
        return;
      }

      const data = await res.json();
      setMuscleUsageData(data);

    }catch(error){
      setMainErrors(true);
    }
  };

  const getPastMakroData = async () => {
    try{
      const res = await UserDataService.getPastMakroData(setIsAuthenticated, navigation);
      if(!res){
        setMainErrors(true);
        return;
      }

      const data = await res.json();
      setPastMakroData(data);

    }catch(error){
      setMainErrors(true);
    }
  };

  const getMakroDailyDistData = async () => {
    try{
      const now = new Date();
      const currentDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}T00:00:00.000+00:00`;
      const res = await UserDataService.getUserDailyMakroDist(setIsAuthenticated, navigation, currentDate);

      if(!res.ok){
        setMainErrors(true);
        return;
      }

      const data = await res.json();
      setDailyMakroDist(data);

    }catch(error){
      setMainErrors(true);
    }
  };

  const getWeightData = async () => {
    try{
      const res = await UserDataService.getUserWeightHistory(setIsAuthenticated, navigation);
      if(!res.ok){
        setMainErrors(true);
        return;
      }

      const data = await res.json();
      setWeightHistoryData(data);

    }catch(error){
      setMainErrors(true);
    }
  }

  const getStepsData = async () => {
    try{
      const res = await UserDataService.getUserStepsHistory(setIsAuthenticated, navigation);
      if(!res.ok){
        setMainErrors(true);
        return;
      }

      const data = await res.json();
      setStepsHistoryData(data);

    }catch(error){
      setMainErrors(true);
    }
  }

  const addWaterFunc = () => {
    if (waterTimeoutRef.current) {
      clearTimeout(waterTimeoutRef.current);
    }

    setUserWaterIntake(prev => prev + 250);
    setWaterAddCounter(prev => prev + 1);

    waterTimeoutRef.current = setTimeout(() => {
      addWaterCall(waterCouner.current);
    }, 3000);
  };
  
  const addWaterCall = async (counter) => {
    try{
      const now = new Date();
      const currentDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}T00:00:00.000+00:00`;
      let model = {
        water: (counter * 250),
        date: currentDate
      };
      const res = await UserDataService.addWaterToCurrentDay(setIsAuthenticated, navigation, model);
      if(!res.ok){
        addWaterCallBack(counter);
        return;
      }
      
    }catch(error){
      //error - normal
      console.log(error);
    }finally{
      setWaterAddCounter(0);
    }
  };

  const addWaterCallBack = (counter) => {
    let old = userWaterRef.current - (counter * 250);
    setUserWaterIntake(old);
  };

  const waterCouner = useRef(waterAddCounter);
    useEffect(() => {
      waterCouner.current = waterAddCounter;
    }, [waterAddCounter]);

    useEffect(() => {
      userWaterRef.current = userWaterIntake;
    }, [userWaterIntake]);

    const handleDragEnd = (position, index) => {    
      const compCount = userLayoutData.chartStack.length;
      const shift = Math.round(position.y / 200);

      let newIndex = index + shift;
      newIndex = Math.max(0, Math.min(newIndex, compCount - 1));
        
      if (newIndex !== index) {
        const updatedStack = [...userLayoutData.chartStack];
        const [movedItem] = updatedStack.splice(index, 1);
        updatedStack.splice(newIndex, 0, movedItem);
        setUserLayoutData(prev => {
          const newLayout = { ...prev, chartStack: updatedStack };
          saveLayoutInAsyncStorage(newLayout);
          return newLayout;
        });
      }
    };
     
    const onDeleteChartComp = (index) => {
      setUserLayoutData((prevLayout) => {
        if (!prevLayout) return prevLayout;
        const newStack = prevLayout.chartStack.filter((_, i) => i !== index);
        const newLayout = { ...prevLayout, chartStack: newStack };
        saveLayoutInAsyncStorage(newLayout);
        return newLayout;
      });
    };
    
    const saveLayoutInAsyncStorage = async (data) => {
      await UserDataService.saveUserLayoutDataToAsyncStorage(data);
    };

    const onScrollHandler = (event) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      setScrollOffset(offsetY);
      scrollOffsetSV.value = offsetY;
    };
  
    const autoScrollDown = () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: scrollOffset + 150,
          animated: true,
        });
      }
    };
  
    const autoScrollUp = () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: scrollOffset - 150,
          animated: true,
        });
      }
    };
    
    const generateChartsContent = () => {
      let data = [];
      if (!chartDataExercises) {
        return (
          <View style={[GlobalStyles.flex, GlobalStyles.center, { height: 250 }]}>
            <Text>EL GATO ERROR - CHARTS LOADING.</Text>
          </View>
        );
      }

      if (!userLayoutData.chartStack || userLayoutData.chartStack === 0) {
        return (
          <View style={[GlobalStyles.flex, GlobalStyles.center, { height: 250 }]}>
            <Text>EL GATO ERROR - CHARTS STACK EMPTY - NO CHARTAS.</Text>
          </View>
        );
      }
    
      userLayoutData.chartStack.forEach((element, index) => {
        const key = `${index}`;
        let chartComponent = null;
    
        switch (element.chartType) {
          case "Linear":
            if (element.chartDataType === "Exercise") {
              const exPastData = chartDataExercises.find(a => a.exerciseName === element.name);
              const displayName = truncate(element.name, 11);
              chartComponent = exPastData ? (
                <LinearChart
                  key={key}
                  name={displayName}
                  dataa={exPastData}
                  isActive={true}
                  settedPeriod={element.period}
                  userSystem={systemType}
                />
              ) : (
                <LinearChart key={key} name={displayName} dataa={null} isActive={false} settedPeriod={null} />
              );
            }

            if (element.chartDataType === "Weight") {
              chartComponent = (!weightHistoryData || weightHistoryData.length === 0)
                ? (
                  <WeightChart key={key} name="Weight" dataa={null} isActive={true} navigation={navigation} system={systemType}/>
                )
                : (
                  <WeightChart key={key} name="Weight" dataa={weightHistoryData} isActive={true} settedPeriod={"All"} navigation={navigation} system={systemType}/>
                );
            }
            break;
    
          case "Compare":
            if (element.chartDataType === "Exercise") {
              const wholeExPast = chartDataExercises.find(a => a.exerciseName === element.name);
              const displayName = truncate(element.name, 9);
              chartComponent = wholeExPast ? (
                <CompareChart
                  key={key}
                  name={displayName}
                  dataa={wholeExPast}
                  isActive={true}
                  userSystem={systemType}
                />
              ) : (
                <CompareChart key={key} name={displayName} dataa={null} isActive={false} />
              );
            }
            break;
    
          case "Hexagonal":
            chartComponent = muscleUsageData ? (
              <HexagonalChart key={key} data={muscleUsageData} isActive={true} settedPeriod={"All"} />
            ) : (
              <HexagonalChart key={key} data={null} isActive={false} settedPeriod={"All"} />
            );
            break;
    
          case "Bar":
            if (element.chartDataType === "Calorie") {
              const calorieData = pastMakroData.makroData.map(item => ({
                date: item.date,
                data: item.energyKcal,
              }));
              chartComponent = calorieData ? (
                <BarChart
                  key={key}
                  data={calorieData}
                  isActive={true}
                  settedPeriod={"All"}
                  system={systemType}
                  name={element.name}
                  color={"#FF6600"}
                />
              ) : (
                <BarChart key={key} data={calorieData} isActive={false} settedPeriod={"All"} system={null} name={null} />
              );
            }  
            
            if (element.chartDataType === "Carbs") {
              const carbsData = pastMakroData.makroData.map(item => ({
                date: item.date,
                data: item.carbs,
              }));
              chartComponent = carbsData ? (
                <BarChart
                  key={key}
                  data={carbsData}
                  isActive={true}
                  settedPeriod={"All"}
                  system={systemType}
                  name={element.name}
                  color={"#030eff"}
                />
              ) : (
                <BarChart key={key} data={carbsData} isActive={false} settedPeriod={"All"} system={null} name={null} />
              );
            }  

            if (element.chartDataType === "Fat") {
              const fatData = pastMakroData.makroData.map(item => ({
                date: item.date,
                data: item.fats,
              }));
              chartComponent = fatData ? (
                <BarChart
                  key={key}
                  data={fatData}
                  isActive={true}
                  settedPeriod={"All"}
                  system={systemType}
                  name={element.name}
                  color={"#A35709"}
                />
              ) : (
                <BarChart key={key} data={fatData} isActive={false} settedPeriod={"All"} system={null} name={null} />
              );
            }  

            if (element.chartDataType === "Protein") {
              const proteinData = pastMakroData.makroData.map(item => ({
                date: item.date,
                data: item.proteins,
              }));
              chartComponent = proteinData ? (
                <BarChart
                  key={key}
                  data={proteinData}
                  isActive={true}
                  settedPeriod={"All"}
                  system={systemType}
                  name={element.name}
                  color={"#09a357"}
                />
              ) : (
                <BarChart key={key} data={proteinData} isActive={false} settedPeriod={"All"} system={null} name={null} />
              );
            }  

            if(element.chartDataType === "Steps"){
              chartComponent = (!stepsHistoryData || stepsHistoryData.length === 0)
                ? (
                  <StepsChart key={key} name={element.name} dataa={null} isActive={true} stepsGoalDaily={dailyStepsGoal}/>
                )
                : (
                  <StepsChart key={key} name={element.name} dataa={stepsHistoryData} isActive={true} settedPeriod={element.period} stepsGoalDaily={dailyStepsGoal}/>
                );
            }

            break;
    
          case "Circle":
            if (element.chartDataType === "MakroDist") {
              chartComponent = dailyMakroDist ? (
                <CircleChartDist
                  key={key}
                  name={element.name}
                  data={dailyMakroDist}
                  isActive={true}
                  system={systemType}
                  maxMakroData={dailyMaxIntake}
                />
              ) : (
                <CircleChartDist key={key} name={element.name} data={null} isActive={false} system={null} />
              );
            }
            break;
        }
    
        if (chartComponent) {
          data.push(
            <DraggableItem key={key} onDragEnd={(position) => handleDragEnd(position, index)} onDelete={() => onDeleteChartComp(index)} autoScrollDown={autoScrollDown} autoScrollUp={autoScrollUp} scrollOffsetSV={scrollOffsetSV}>
              {chartComponent}
            </DraggableItem>
          );
        }
      });
    
      return data;
    };
    

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={{ height: insets.top, backgroundColor: "#FF8303" }} />
      <StatusBar style="light"  backgroundColor="#fff" translucent={false} hidden={false} />
        {mainErrors ? (
          <>
            <View style={[GlobalStyles.flex, GlobalStyles.center]}>
              <View style={styles.emptyGatoContainer}>
      
              </View>
              <View style={[styles.centerText, {marginTop: 25}]}>
                  <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Something went horribly <Text style={[GlobalStyles.orange]}>wrong</Text>. Check your internet connection and try to restart the app.</Text>
              </View>
            </View>
          </>
        ):(
          <>
            <ScrollView style={[GlobalStyles.flex, styles.paddingBorder]} 
              showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} 
              ref={scrollViewRef} 
              onScroll={onScrollHandler} 
              scrollEventThrottle={1}
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
              <View style={styles.row}>
                <View style={styles.wideBlockTop}>
                  {dailyMaxIntake && currentDailyIntake ? (
                    <NutriContainer intakeData={currentDailyIntake} dailyMax={dailyMaxIntake} system={systemType}/>
                  ):(
                    <ActivityIndicator size="small" color="#FF8303" />
                  )}
                </View>
              </View>

              <View style={styles.row}>
                  <TouchableOpacity onPress={() => navigateToCompoControl("calories")}  activeOpacity={1} style={styles.block}>
                    <BurntCalorieContainer totalBurnt={currentCaloriesBurnt} system={systemType} canAnimate={areAnimationsActive} key={areAnimationsActive ? "just for" : "re-render purp."} permissionsGranted={caloriePermissionGranted}/>
                  </TouchableOpacity>
                  <View style={styles.block}>
                    {userWaterIntake ? (
                      <WaterContainer waterIntakeGoal={dailyWaterIntakeGoal} initialValue={userWaterIntake / 10} addWaterFunc={addWaterFunc} compoControlFunc={() => navigateToCompoControl("water")}/>
                    ):(
                      <WaterContainer waterIntakeGoal={dailyWaterIntakeGoal} addWaterFunc={addWaterFunc} compoControlFunc={() => navigateToCompoControl("water")}/>
                    )}
                  </View>
              </View>

              {isPedometerAvaliable && (
                <>
                  <TouchableOpacity onPress={() => navigateToCompoControl("steps")}  activeOpacity={1} style={styles.row}>
                    <StepsCounter dailyGoal={dailyStepsGoal} currentSteps={currentSteps} permissionsGranted={stepsPermissionsGranted} />
                  </TouchableOpacity>
                </>
              )}

              {userLayoutData ? (
                <>
                  {chartDataLoading ? (
                      <>
                        <View style={[styles.emptyLayoutContiner, GlobalStyles.center]}>
                          <ActivityIndicator size="small" color="#FF8303" />
                          <Text style={[GlobalStyles.text16, {marginTop: 10}]}>setting up your awesome charts...</Text>
                        </View>
                      </>
                  ): (
                    <>
                      {generateChartsContent()}
                    </>
                  )}              
                </>
              ):(
                <>
                  <View style={[styles.emptyLayoutContiner, GlobalStyles.center]}>
                    {userLayoutError ? (
                      <>
                        {/* EL GATO error view - TODO  */}
                        <Text style={[GlobalStyles.orange, GlobalStyles.text16]}>SOMETHING WENT WRONG</Text>
                      </>
                    ):(
                      <>
                        <ActivityIndicator size="small" color="#FF8303" />
                        <Text style={[GlobalStyles.text16, {marginTop: 10}]}>please wait we are setting up your layout...</Text>
                      </>
                    )}
                  </View>
                </>
              )}         

              <TouchableOpacity style={[styles.bottomHintCont, GlobalStyles.center]} onPress={() => personalizePressed()}>
                  <Text style={[GlobalStyles.text16, GlobalStyles.orange]}>personalize my home page</Text>
              </TouchableOpacity>

            </ScrollView>
          </>
        )}     

        <AchievmentModal
          visible={achievmentModalVisible}
          onRequestClose={closeAchievmentModal}
          data={achievmentData}
        />

      <NavigationMenu navigation={navigation} currentScreen="Home" />
    </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  paddingBorder: {
    padding: 10,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  block: {
    width: '49%',
    height: '180',
  },
  wideBlockTop: {
    width: '100%',
    height: '200',
  },
  bottomHintCont: {
    height: 50,
    marginBottom: 20,
  },

  emptyLayoutContiner: {
    height: 400,
    backgroundColor: 'yeelow',
  },
  emptyGatoContainer: {
    minHeight: 600,
  },
});

export default HomeScreen;