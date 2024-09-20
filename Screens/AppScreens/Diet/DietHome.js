import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import MakroMenu from '../../../Components/Diet/MakroMenu';
import Calendar from '../../../Components/Diet/DietCalendar';
import Meal from '../../../Components/Diet/Meal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

import { fetchWithTimeout } from '../../../Services/ApiCalls/fetchWithTimeout';
import { TouchableOpacity } from 'react-native';

function DietHome({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dietData, setDietData] = useState(null);
  const [error, setError] = useState(null);
  const [idCounter, setIdCounter] = useState(0);

  const { params } = useRoute();

  useEffect(() => {
    if (params?.newIngredient && params?.mealId) {
      const { mealId, newIngredient } = params;

      addIngredientToMeal(mealId, newIngredient);

      //API CALL
    }
  }, [params]);

  const addIngredientToMeal = (mealId, ingredient) => {
    console.log("hitted");
    console.log(ingredient);
    
    setDietData(prevDietData => ({
      ...prevDietData,
      meals: prevDietData.meals.map(meal =>
        meal.publicId === mealId
          ? { ...meal, ingridient: [...meal.ingridient, ingredient] }
          : meal
      ),
    }));
  };

  const handleMealNameChange = async (mealId, newName) => {
    const currentMeal = dietData.meals.find(meal => meal.publicId === mealId);
    if (!currentMeal || currentMeal.name === newName || !newName) {
      return;
    }

    setDietData(prevDietData => ({
      ...prevDietData,
      meals: prevDietData.meals.map(meal =>
        meal.publicId === mealId ? { ...meal, name: newName } : meal
      ),
    }));

    const changeMealDate = selectedDate + 'T00:00:00Z';
    const token = await AsyncStorage.getItem('jwtToken');

    try{
      const mealChangeRes = await fetchWithTimeout(
        `http://192.168.0.143:5094/api/Diet/UpdateMealName`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newName??"Meal",
            mealPublicId: mealId,
            date: changeMealDate,
          }),
        },
        5000
      );

      if(!mealChangeRes.ok){
        //error internet prob
      }

    }catch(error){
      //catched -> can do non bsc 
    }
  };

  const onRemoveMeal = async (mealId) => {
    setDietData(prevDietData => ({
      ...prevDietData,
      meals: prevDietData.meals.filter(meal => meal.publicId !== mealId),
    }));

    const delMealDate = selectedDate + 'T00:00:00Z';
    const token = await AsyncStorage.getItem('jwtToken');

    try{
      const mealRemoveRes = await fetchWithTimeout(
        `http://192.168.0.143:5094/api/Diet/DeleteMeal?publicId=${mealId}&date=${delMealDate}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        5000
      );

      if(!mealRemoveRes.ok){
        //error.
      }

    }catch(error){
      //could just do none.
    }

  };

  const newMealPress = async () => {
    const newMealDate = selectedDate + 'T00:00:00Z';
    console.log(newMealDate);
    const counter = idCounter; //id counter
    const token = await AsyncStorage.getItem('jwtToken');

    const newMeal = {
      name: `Meal${counter}`,
      publicId: counter,
      ingridient: [],
    };

    const updatedMeals = [...dietData.meals, newMeal];

    setDietData(prevDietData => ({
      ...prevDietData,
      meals: updatedMeals
    }));

    setIdCounter(idCounter+1);

    try {
      const mealAddRes = await fetchWithTimeout(
        `http://192.168.0.143:5094/api/Diet/AddNewMeal?mealName=${newMeal.name}&date=${newMealDate}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        5000
      );
      if(!mealAddRes.ok){
        //set error popup no internet - meal could not be saved.
        console.log('err while adding');
        setIdCounter(idCounter-1);
      }
    } catch (error) {
      console.log("Error while adding newMeal");
      setIdCounter(idCounter-1);
      //set error popup no internet - meal could not be saved.
    }
  };


  const handleDateSelect = async (date) => {
    setSelectedDate(date);

    try {
      setDietData(null);
      const token = await AsyncStorage.getItem('jwtToken');
      console.log(token);
      date = date + 'T00:00:00Z';
      console.log(date);

      const response = await fetchWithTimeout(
        `http://192.168.0.143:5094/api/Diet/GetUserDietDay?date=${date}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        10000
      );

      if (!response.ok) {
        let currentDate = new Date();
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        currentDate.toISOString();
      
        if (currentDate > new Date(date)) {
          console.log('OLD DAY - no info!');
          setError("STARY BEZ DATY!");
        }
        else if(currentDate <= new Date(date)) {
          console.log('NEW DAY - no info!');
          
          const dailyCalorieCount = {
            kcal: 0,
            protein: 0,
            fats: 0,
            carbs: 0
          };
          
          const meal = {
            name: 'Meal0',
            publicId: '0',
            ingridient: [],
          };

          const dietDayVMO = {
            date: date,
            water: 0,
            meals: [meal],
            calorieCounter: dailyCalorieCount
          };
          const data = dietDayVMO;
          setDietData(data);
          setIdCounter(idCounter+1);

          try{
            console.log(date);
            console.log(dietDayVMO.date);
            const mealAddRes = await fetchWithTimeout(
              `http://192.168.0.143:5094/api/Diet/AddNewMeal?mealName=${meal.name}&date=${date}`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              },
              5000
            );
            

            if(!mealAddRes.ok){
              console.log("ERROR HIT");
              setError("throw net");
            }
            console.log("HIT");
          }catch(error){
             setError("diff error - throw net");
          }

        }else{
          setError("failed to load - internet!");
          throw new Error('Failed to fetch diet data');
        }     
      }else if(response.ok){
        const data = await response.json();
        setDietData(data);
      }else{
        setError("COS INNEGO ERROR TYPE S!");
      }
      
    } catch (error) {
      if (error.message === 'Request timed out') {
        setError("Request timed out - INTERNET");
      }else{
        setError("COS INNEGO ERROR TYPE S!");
      }
      console.log(error);
    }
  };

  const generateContentForDate = () => {
    if (!dietData && error == null) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8303" />
        </View>
      );
    }

    if(error != null && !dietData){
      return (
        <SafeAreaView>
          <Text>ERROR VIEW!</Text>
          <Text>{error}</Text>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView>
        <Text>SELECTED DATE : {dietData.date}</Text>
        <Text>Water Intake: {dietData.water} ml</Text>
        {dietData.meals.map((meal, index) => (
          <Meal key={index} meal={meal} onRemoveMeal={onRemoveMeal} onChangeMealName={handleMealNameChange} navigation={navigation}
            addIngredientToMeal={addIngredientToMeal}/>
        ))}
        <View style={styles.newMealRow}>
          <TouchableOpacity onPress={newMealPress}><Text style={styles.newMealRowText}>Add new meal</Text></TouchableOpacity>  
        </View>
      </SafeAreaView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Calendar onDateSelect={handleDateSelect} />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {selectedDate ? generateContentForDate() : <Text>Select a date to see meals.</Text>}
      </ScrollView>
      <MakroMenu CalorieCounter={dietData ? dietData.calorieCounter : []} />
      <NavigationMenu navigation={navigation} currentScreen="DietHome" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'whitesmoke',
    alignItems: 'center',
  },
  scrollContainer: {
    width: '100%',
    backgroundColor: 'whitesmoke',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  newMealRow: {
    flex: 1,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  newMealRowText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF8303',
    fontFamily: 'Helvetica',
  },
});

export default DietHome;
