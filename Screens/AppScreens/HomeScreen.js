import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../Services/Auth/AuthContext.js';
import NavigationMenu from '../../Components/Navigation/NavigationMenu';
import { GlobalStyles } from '../../Styles/GlobalStyles';
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';

import WaterContainer from '../../Components/Main/WaterContainer';
import NutriContainer from '../../Components/Main/NutriContainer';
import BurntCalorieContainer from '../../Components/Main/BurntCalorieContainer';
import LinearChart from '../../Components/Main/LinearChart';
import CompareChart from '../../Components/Main/CompareChart.js';
import UserDataService from '../../Services/ApiCalls/UserData/UserDataService';
import HexagonalChart from '../../Components/Main/HexagonalChart.js';
import BarChart from '../../Components/Main/BarChart.js';
import { JsiSkImage } from '@shopify/react-native-skia';

function HomeScreen({ navigation }) {
  const { setIsAuthenticated } = useContext(AuthContext);
  const [systemType, setSystemType] = useState("metric");
  const [userLayoutData, setUserLayoutData] = useState(null);
  const [areAnimationsActive, setAreAnimationsActive] = useState(null);
  const [userLayoutError, setUserLayoutError] = useState(null);

  const [chartDataExercises, setChartDataExercises] = useState(null);
  const [chartDataLoading, setChartDataLoading] = useState(false);
  const [muscleUsageData, setMuscleUsageData] = useState(null);
  const [pastMakroData, setPastMakroData] = useState(null);

  let intakeData = {
    protein: 149,
    calories: 985,
    fat: 52,
    carbs: 112,
  };

  let dailyMaxData = {
    protein: 220,
    calories: 3005,
    fat: 129,
    carbs: 300,
  };

  useEffect(() => {
      getUserMetricSystem();
      getUserLayoutData();
  }, []);

  useEffect(() => {
      if (userLayoutData) {
          getChartsData();
      }
  }, [userLayoutData]);


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

    //here get the rest data based on layout.

    setChartDataLoading(false);
  };

  const getUserMetricSystem = async () => {
    try{
      const res = await UserDataService.getUserWeightType(setIsAuthenticated, navigation);
      const data = await res.json();
      setSystemType(data);
    }catch(error){
      //error
      console.log(error);
    }
  };

  const getUserLayoutData = async () => {
    try{
      const res = await UserDataService.getUserLayout(setIsAuthenticated, navigation);
      if(!res){
        //error
        //net
        console.log("error while getting layout.");
        setUserLayoutError("");
        return;
      }

      setAreAnimationsActive(res.animations);
      setUserLayoutData(res);
      console.log(JSON.stringify(res));

    }catch(error){
      //error 
      //throw -> fallback to normal
      setUserLayoutError("");
      console.log("error " + error);
    }
  };

  const getPastExerciseData = async (exerciseNames) => {
    try{
      let model = {
        exercisesNames: exerciseNames
      };

      const res = await UserDataService.getPastExerciseData(setIsAuthenticated, navigation, model);
      if(!res.ok){
        //error
        //net view.
        console.log("error");
        return;
      }

      const data = await res.json();
      setChartDataExercises(data);

    }catch(error){
      //error
      //net view.
      console.log(error);
    }
  };

  const getMuscleUsageData = async () => {
    try{
      const res = await UserDataService.getMuscleUsageData(setIsAuthenticated, navigation);
      if(!res){
        //error net view
        console.log("error");
        return;
      }

      const data = await res.json();
      setMuscleUsageData(data);

    }catch(error){
      //Error
      console.log(error);
    }
  };

  const getPastMakroData = async () => {
    try{
      const res = await UserDataService.getPastMakroData(setIsAuthenticated, navigation);
      if(!res){
        //error net view
        console.log("error");
        return;
      }

      const data = await res.json();
      setPastMakroData(data);

    }catch(error){
      //error
      console.log(error);
    }
  };

  const generateChartsContent = () => {
    let data = [];
    if (!chartDataExercises) {
      return null;
    }

    userLayoutData.chartStack.forEach((element, index) => {
      const key = `${index}`;
      switch(element.chartType){
        case "Linear":
          switch(element.chartDataType){
            case "Exercise":
              const exPastData = chartDataExercises.find(a=>a.exerciseName === element.name);
              if(exPastData){
                data.push(<LinearChart key={key} name={"Benchpress"} dataa={exPastData} isActive={true} settedPeriod={element.period} userSystem={systemType} />);
              }else{
                data.push(<LinearChart key={key} name={"Benchpress"} dataa={null} isActive={false} settedPeriod={null} />);
              }
              break;
            //OTHER CASES -- not possible for now.
          }
          break;

        case "Compare":
          switch(element.chartDataType){
            case "Exercise":
              const wholeExPast = chartDataExercises.find(a=>a.exerciseName === element.name);
              if(wholeExPast){
                data.push(<CompareChart key={key} name={"Benchpress"} dataa={wholeExPast} isActive={true} userSystem={systemType} />);
              }else{
                data.push(<CompareChart key={key} name={"Benchpress"} dataa={null} isActive={false}  />);
              }
              break;
            //OTHER DATA TYPE CASES
          }
          break;

        case "Hexagonal":
          if(muscleUsageData){
            data.push(<HexagonalChart key={key} data={muscleUsageData} isActive={true} settedPeriod={"All"}/>);
          }else{
            data.push(<HexagonalChart key={key} data={null} isActive={false} settedPeriod={"All"}/>);
          }
          break;

        case "Bar":
          switch(element.chartDataType){
            case "Calorie":
              const calorieData = pastMakroData.makroData.map(item => ({
                date: item.date,
                data: item.energyKcal
              }));
              if(calorieData){
                data.push(<BarChart key={key} data={calorieData} isActive={true} settedPeriod={"All"} system={systemType} name={element.name} color={"#FF6600"}/>);
              }else{
                data.push(<BarChart key={key} data={calorieData} isActive={false} settedPeriod={"All"} system={null} name={null}/>);
              }
              break;
            case "Makro":
              
              break;
            case "Protein":
              const proteinData = pastMakroData.makroData.map(item => ({
                date: item.date,
                data: item.proteins
              }));
              if(proteinData){
                data.push(<BarChart key={key} data={proteinData} isActive={true} settedPeriod={"All"} system={systemType} name={element.name} color={"#09a357"}/>);
              }else{
                data.push(<BarChart key={key} data={proteinData} isActive={false} settedPeriod={"All"} system={null} name={null}/>);
              }
              break;
            case "Fat":
              const fatData = pastMakroData.makroData.map(item => ({
                date: item.date,
                data: item.fats
              }));
              if(fatData){
                data.push(<BarChart key={key} data={fatData} isActive={true} settedPeriod={"All"} system={systemType} name={element.name} color={"#A35709"}/>);
              }else{
                data.push(<BarChart key={key} data={fatData} isActive={false} settedPeriod={"All"} system={null} name={null}/>);
              }
              break;
            case "Carbs":
              const carbsData = pastMakroData.makroData.map(item => ({
                date: item.date,
                data: item.carbs
              }));
              if(carbsData){
                data.push(<BarChart key={key} data={carbsData} isActive={true} settedPeriod={"All"} system={systemType} name={element.name} color={"#030eff"}/>);
              }else{
                data.push(<BarChart key={key} data={carbsData} isActive={false} settedPeriod={"All"} system={null} name={null}/>);
              }
              break;
          }
          break;
      }
    });

    return data;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView style={styles.container}>
    <StatusBar backgroundColor="#000" barStyle="light-content" />
        <ScrollView style={[GlobalStyles.flex, styles.paddingBorder]} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
            <View style={styles.wideBlockTop}>
              <NutriContainer intakeData={intakeData} dailyMax={dailyMaxData} system={"metric"}/>
            </View>
          </View>

          <View style={styles.row}>
              <View style={styles.block}>
                <BurntCalorieContainer totalBurnt={100} system={"metric"} canAnimate={areAnimationsActive} key={areAnimationsActive ? "just for" : "re-render purp."}/>
              </View>
              <View style={styles.block}>
                <WaterContainer initialValue={40}/>
              </View>
          </View>

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

          <TouchableOpacity style={[styles.bottomHintCont, GlobalStyles.center]}>
               <Text style={[GlobalStyles.text16, GlobalStyles.orange]}>personalize my home page</Text>
          </TouchableOpacity>

        </ScrollView>

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
  }
});

export default HomeScreen;
