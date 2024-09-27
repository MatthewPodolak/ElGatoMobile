import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu';
import MakroMenu from '../../../Components/Diet/MakroMenu';
import Calendar from '../../../Components/Diet/DietCalendar';
import Meal from '../../../Components/Diet/Meal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

import PlusIcon from '../../../assets/main/Diet/plus-lg.svg';


import { fetchWithTimeout } from '../../../Services/ApiCalls/fetchWithTimeout';
import { TouchableOpacity } from 'react-native';

function DietHome({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dietData, setDietData] = useState(null);
  const [error, setError] = useState(null);

  const { params } = useRoute();

  const getIdCounter = () => {
    if (!dietData || !dietData.meals) {
      return 0;
    }
  
    console.log(dietData.meals);
  
    const numbers = dietData.meals.map(meal => {
      const mealName = meal.name;
    
      const match = mealName.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
  
    const highestNumber = Math.max(...numbers);
  
    return (highestNumber+1);
  };
  

  useEffect(() => {
    if (params?.selectedItemsData && params?.mealId) {
      const { mealId, selectedItemsData } = params;
  
      const addIngredients = async () => {
        try {
          selectedItemsData.forEach((ingredient) => {
            addIngredientToMeal(mealId, ingredient);
          });
  
          const token = await AsyncStorage.getItem('jwtToken');
          const mealDate = selectedDate + 'T00:00:00Z';
  
          const ingredientsToSend = selectedItemsData.map((ingredient) => ({
            name: ingredient.name,
            carbs: ingredient.carbs,
            proteins: ingredient.proteins,
            weightValue : ingredient.weightValue,
            fats: ingredient.fats,
            kcal: ingredient.energyKcal,
            prep_For: ingredient.prep_For || 100,
            id: String(ingredient.id) || "123"
          }));
  
          console.log('Payload:', {
            mealId: mealId,
            date: mealDate,
            ingridient: ingredientsToSend
          });

          const pushIngRes = await fetchWithTimeout(
            `http://192.168.0.143:5094/api/Diet/AddIngriedientsToMeal`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                mealId: mealId,
                date: mealDate,
                ingridient: ingredientsToSend,
              }),
            },
            10000
          );
  
          if (!pushIngRes.ok) {
            //error
            throw new Error(`Failed to push ingredients`);
          }else{
            //good
          }
          
        } catch (error) {
          //error
          console.error('Error while adding ingredients to meal:', error);
        }
      };
  
      addIngredients();
    }
  }, [params]);
  

  const removeIngredientFromMeal = async (publicId, id, name, weightValue) => {  

    setDietData(prevDietData => {
      const updatedMeals = prevDietData.meals.map(meal => {
        if (meal.publicId === publicId) {
          const updatedIngredients = [...meal.ingridient];
  
          const ingredientIndex = updatedIngredients.findIndex(
            ingredient => ingredient.name === name && ingredient.weightValue === weightValue
          );
  
          if (ingredientIndex !== -1) {
            updatedIngredients.splice(ingredientIndex, 1);
          }
  
          return {
            ...meal,
            ingridient: updatedIngredients,
            calorieCounter: {
              kcal: totalKcal,
              protein: totalProtein,
              fats: totalFats,
              carbs: totalCarbs,
            },
          };
        }
  
        return meal; 
      });
  
      let totalKcal = 0;
      let totalProtein = 0;
      let totalFats = 0;
      let totalCarbs = 0;
  
      updatedMeals.forEach(meal => {
        meal.ingridient.forEach(ingredient => {
          totalKcal += (ingredient.energyKcal * (ingredient.weightValue / 100));
          totalProtein += (ingredient.proteins * (ingredient.weightValue / 100));
          totalFats += (ingredient.fats * (ingredient.weightValue / 100));
          totalCarbs += (ingredient.carbs * (ingredient.weightValue / 100));
        });
      });
  
      return {
        ...prevDietData,
        meals: updatedMeals,
        calorieCounter: {
          kcal: totalKcal,
          protein: totalProtein,
          fats: totalFats,
          carbs: totalCarbs,
        },
      };
    });

    //API CALL!
    try{
      const token = await AsyncStorage.getItem('jwtToken');
      const mealDate = selectedDate + 'T00:00:00Z';

      const removeIngredientFromMeal = await fetchWithTimeout(
        `http://192.168.0.143:5094/api/Diet/RemoveIngridientFromMeal`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mealPublicId: publicId,
            ingridientId: id,
            ingridientName: name,
            weightValue: weightValue,
            date: mealDate          
          }),
        },
        10000
      );

      if(!removeIngredientFromMeal.ok){
        //error handling
        console.log('NOT REMOVED - ERROR');
      }

    }catch(error){
      //throew error int.
    }

  };
  
  const changeIngredientWieghtValue = async (mealId, publicId, name, oldWeight, newWeightValue) => {
    setDietData(prevDietData => {
      const updatedMeals = prevDietData.meals.map(meal => {
        if (meal.publicId === mealId) {
          const updatedIngredients = [...meal.ingridient];
  
          const ingredientIndex = updatedIngredients.findIndex(
            ingredient => ingredient.name === name && ingredient.weightValue === oldWeight && ingredient.publicId === publicId
          );
  
          if (ingredientIndex !== -1) {
            updatedIngredients[ingredientIndex] = {
              ...updatedIngredients[ingredientIndex],
              weightValue: newWeightValue
            };
          }
  
          let mealKcal = 0;
          let mealProtein = 0;
          let mealFats = 0;
          let mealCarbs = 0;
  
          updatedIngredients.forEach(ingredient => {
            mealKcal += (ingredient.energyKcal * (ingredient.weightValue / 100));
            mealProtein += (ingredient.proteins * (ingredient.weightValue / 100));
            mealFats += (ingredient.fats * (ingredient.weightValue / 100));
            mealCarbs += (ingredient.carbs * (ingredient.weightValue / 100));
          });
  
          return {
            ...meal,
            ingridient: updatedIngredients,
            calorieCounter: {
              kcal: mealKcal,
              protein: mealProtein,
              fats: mealFats,
              carbs: mealCarbs,
            },
          };
        }
  
        return meal;
      });
  
      let totalKcal = 0;
      let totalProtein = 0;
      let totalFats = 0;
      let totalCarbs = 0;
  
      updatedMeals.forEach(meal => {
        meal.ingridient.forEach(ingredient => {
          totalKcal += (ingredient.energyKcal * (ingredient.weightValue / 100));
          totalProtein += (ingredient.proteins * (ingredient.weightValue / 100));
          totalFats += (ingredient.fats * (ingredient.weightValue / 100));
          totalCarbs += (ingredient.carbs * (ingredient.weightValue / 100));
        });
      });
  
      return {
        ...prevDietData,
        meals: updatedMeals,
        calorieCounter: {
          kcal: totalKcal,
          protein: totalProtein,
          fats: totalFats,
          carbs: totalCarbs,
        },
      };
    });
  
    //API
    try{
      const token = await AsyncStorage.getItem('jwtToken');
      const mealDate = selectedDate + 'T00:00:00Z';

      const patchIngredientWeight = await fetchWithTimeout(
        `http://192.168.0.143:5094/api/Diet/UpdateIngridientWeightValue`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mealPublicId: mealId,
            ingridientName: name,
            ingridientId: publicId,
            ingridientWeightOld: oldWeight,
            ingridientWeightNew: newWeightValue,
            date: mealDate          
          }),
        },
        10000
      );

      if(!patchIngredientWeight.ok){
        //error handle
        console.log('error patching new weight');
      }

    }catch(error){
      //error int
      console.log('hitted error');
    }

  };

  const addIngredientToMeal = (mealId, ingredient) => {
    setDietData(prevDietData => {

      const updatedCalorieCounter = {
        kcal: prevDietData.calorieCounter.kcal + (ingredient.energyKcal * (ingredient.weightValue / 100)),
        protein: prevDietData.calorieCounter.protein + ingredient.proteins * (ingredient.weightValue / 100),
        fats: prevDietData.calorieCounter.fats + ingredient.fats * (ingredient.weightValue / 100),
        carbs: prevDietData.calorieCounter.carbs + ingredient.carbs * (ingredient.weightValue / 100),
      };
  
      const updatedMeals = prevDietData.meals.map(meal =>
        meal.publicId === mealId
          ? { ...meal, ingridient: [...meal.ingridient, ingredient] }
          : meal
      );
  
      return {
        ...prevDietData,
        meals: updatedMeals,
        calorieCounter: updatedCalorieCounter,
      };
    });
    
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
    setDietData(prevDietData => {
      const updatedMeals = prevDietData.meals.filter(meal => meal.publicId !== mealId);
      
      let totalKcal = 0;
      let totalProtein = 0;
      let totalFats = 0;
      let totalCarbs = 0;
  
      updatedMeals.forEach(meal => {
        meal.ingridient.forEach(ingredient => {
          totalKcal += (ingredient.energyKcal * (ingredient.weightValue / 100));
          totalProtein += (ingredient.proteins * (ingredient.weightValue / 100));
          totalFats += (ingredient.fats * (ingredient.weightValue / 100));
          totalCarbs += (ingredient.carbs * (ingredient.weightValue / 100));
        });
      });
  
      return {
        ...prevDietData,
        meals: updatedMeals,
        calorieCounter: { 
          kcal: totalKcal,
          protein: totalProtein,
          fats: totalFats,
          carbs: totalCarbs,
        }
      };
    });

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
    const counter = getIdCounter(); //id counter
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
      }
    } catch (error) {
      console.log("Error while adding newMeal");
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
        {/*<Text>SELECTED DATE : {dietData.date}</Text>
        <Text>Water Intake: {dietData.water} ml</Text> */}
        <View style = {styles.topMargin}></View>
        {dietData.meals.map((meal, index) => (
          <Meal key={index} meal={meal} onRemoveMeal={onRemoveMeal} onChangeMealName={handleMealNameChange} navigation={navigation}
            addIngredientToMeal={addIngredientToMeal}
            onRemoveIngredientFromMeal = {removeIngredientFromMeal}
            onChangeIngredientWeightValue = {changeIngredientWieghtValue}
            />
        ))}
        <View style={styles.bottomSpacing}></View>
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
      <TouchableOpacity style={styles.addMealButton} onPress={newMealPress}>
        <PlusIcon style={styles.plusText} fill={'#fff'} width={27} height={27} />
      </TouchableOpacity>
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
  topMargin: {
    height: 15,
  },
  scrollContainer: {
    width: '100%',
    backgroundColor: 'whitesmoke',
    flex: 1,
  },
  addMealButton: {
    position: 'absolute',
    bottom: 130,
    right: 10,
    width: 60,
    height: 60,
    backgroundColor: '#FF8303',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  bottomSpacing: {
    flex: 1,
    height: 80,
  },

});

export default DietHome;
