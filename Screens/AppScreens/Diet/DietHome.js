import React, { useState, useEffect,useContext, useRef, useCallback } from 'react';
import { Animated, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationMenu from '../../../Components/Navigation/NavigationMenu.js';
import MakroMenu from '../../../Components/Diet/MakroMenu.js';
import Calendar from '../../../Components/Diet/Calendar';
import Meal from '../../../Components/Diet/Meal.js';
import { useRoute } from '@react-navigation/native';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { closeOptionsAnimation, showOptionsAnimation } from '../../../Animations/ButtonAnimation.js';

import PlusIcon from '../../../assets/main/Diet/plus-lg.svg';

import { DietHomeStyles } from '../../../Styles/Diet/DietHomeStyles.js';

import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import ErrorPopup from '../../../Components/Error/ErrorPopup.js';

import DietDataService from '../../../Services/ApiCalls/DietData/DietDataService.js';

function DietHome({ navigation }) {
  const insets = useSafeAreaInsets();
  const { setIsAuthenticated } = useContext(AuthContext);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const optionsAnimation = useRef(new Animated.Value(0)).current;
  const iconAnimation = useRef(new Animated.Value(0)).current;

  const [refreshing, setRefreshing] = useState(false);
  const lastRefreshRef = useRef(0);
  const REFRESH_INTERVAL = 5000;

  const [selectedDate, setSelectedDate] = useState(null);
  const [dietData, setDietData] = useState(null);
  const [error, setError] = useState(false);

  const { params } = useRoute();

  const [errorMsg, setErrorMsg] = useState("Something went wrong, please check your internet connection.");
  const [isErrorModalVibile, setIsErrorModalVisible] = useState(false);
  const closeErrorPopup = () => {
      setIsErrorModalVisible(false);
  };

  const onRefresh = useCallback(async () => {
      setRefreshing(true);
  
      const now = Date.now();
      const sinceLast = now - lastRefreshRef.current;
  
      if (sinceLast >= REFRESH_INTERVAL){
        lastRefreshRef.current = now;
        try{
          await handleDateSelect(selectedDate);
        }catch(error){

        }
      }
  
      setRefreshing(false);
  }, [selectedDate, handleDateSelect]);

  const addFromFavouritesClick = () => {
    navigation.navigate('SavedMeals');
  };

  const addMealFromSaved = async (savedMealName) => {
    try{     
      const date = selectedDate + 'T00:00:00Z';
      const requestBody = {
        date: date,
        name: savedMealName,
      };

      const res = await DietDataService.addMealFromSaved(setIsAuthenticated, navigation, requestBody);

      if(!res.ok){
        return;
      }

    }catch(error){
      console.log("ERROR WHILE ADDING FROM SAVED -> " + error);
    }
  };

  const removeMealSaved = async (name) => {
    try{
      const res = await DietDataService.removeMealFromSavedMeals(setIsAuthenticated, navigation, name);

      if(!res.ok){
        console.log("ERROR removing");
        return;
      }

      console.log("removed");

    }catch(error){
      console.log("Error while removing meal " + error);
    }
  };

  const saveMealSaved = async (addIngredientToSavedModal) => {
    try{
      const res = await DietDataService.addMealToSavedMeals(setIsAuthenticated, navigation, addIngredientToSavedModal);

      if(!res.ok){
        const errorText = await res.text(); 
        const errorResponse = JSON.parse(errorText); 

        switch(errorResponse.errorCode){
          case "AlreadyExists":
            setErrorMsg("Meal with this name is already saved.");
            setIsErrorModalVisible(true);
            break;
        }
        return false;
      }

      return true;

    }catch(error){
      return false;
    }
  };

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
    if (params?.savedMealToAdd) {
      const savedMeal = { ...params.savedMealToAdd, isSaved: true };
  
      setDietData((prevDietData) => {
        const mealMacros = savedMeal.ingridient.reduce(
          (acc, ingredient) => {
            const weightRatio = ingredient.weightValue / ingredient.prepedFor;
            acc.kcal += ingredient.energyKcal * weightRatio;
            acc.protein += ingredient.proteins * weightRatio;
            acc.fats += ingredient.fats * weightRatio;
            acc.carbs += ingredient.carbs * weightRatio;
            return acc;
          },
          { kcal: 0, protein: 0, fats: 0, carbs: 0 }
        );
  
        const updatedCalorieCounter = {
          kcal: prevDietData.calorieCounter.kcal + mealMacros.kcal,
          protein: prevDietData.calorieCounter.protein + mealMacros.protein,
          fats: prevDietData.calorieCounter.fats + mealMacros.fats,
          carbs: prevDietData.calorieCounter.carbs + mealMacros.carbs,
        };
  
        const updatedMeals = [...prevDietData.meals, savedMeal];
  
        return {
          ...prevDietData,
          meals: updatedMeals,
          calorieCounter: updatedCalorieCounter,
        };
      });
      addMealFromSaved(params.savedMealToAdd.name);
    }
  }, [params]);
  

  useEffect(() => {    
    if (params?.selectedItemsData && params?.mealId != null) {
      const { mealId, selectedItemsData } = params;
  
      const addIngredients = async () => {
        try {
          selectedItemsData.forEach((ingredient) => {
            addIngredientToMeal(mealId, ingredient);
          });
  
          const mealDate = selectedDate + 'T00:00:00Z';
  
          const ingredientsToSend = selectedItemsData.map((ingredient) => ({
            name: ingredient.name,
            carbs: ingredient.carbs,
            proteins: ingredient.proteins,
            weightValue : ingredient.weightValue,
            fats: ingredient.fats,
            servings: ingredient.servings,
            kcal: ingredient.energyKcal,
            prep_For: ingredient.prep_For || 100,
            id: String(ingredient.id) || "123"
          }));
  
          let requestBodyPushIng = {
            mealId: mealId,
            date: mealDate,
            ingridient: ingredientsToSend,
          };

          const pushIngRes = await DietDataService.addIngriedientsToMeal(setIsAuthenticated, navigation, requestBodyPushIng);
          if (!pushIngRes.ok) {
            //error
            return;
          }
          
        } catch (error) {
          //error
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

    try{
      const mealDate = selectedDate + 'T00:00:00Z';

      let requestBodyRemoveIng = {
        mealPublicId: publicId,
        ingridientId: id,
        ingridientName: name??"",
        weightValue: weightValue,
        date: mealDate 
      };

      const removeIngredientFromMeal = await DietDataService.removeIngridientFromMeal(setIsAuthenticated, navigation, requestBodyRemoveIng);

      if(!removeIngredientFromMeal.ok){
        return;
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
  
    try{
      const mealDate = selectedDate + 'T00:00:00Z';
      let requestBodyPatchWeight = {
        mealPublicId: mealId,
        ingridientName: name,
        ingridientId: publicId,
        ingridientWeightOld: oldWeight,
        ingridientWeightNew: newWeightValue,
        date: mealDate
      };

      const patchIngredientWeight = await DietDataService.updateIngridientWeightValue(setIsAuthenticated, navigation, requestBodyPatchWeight);

      if(!patchIngredientWeight.ok){
        //error handle
        return;
      }

    }catch(error){
      //error int
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

    try{
      let requestBodyChangeName = {
        name: newName??"Meal",
        mealPublicId: mealId,
        date: changeMealDate,
      };
      const mealChangeRes = await DietDataService.UpdateMealName(setIsAuthenticated, navigation, requestBodyChangeName);

      if(!mealChangeRes.ok){
        //error internet prob
        return;
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

    try{
      const mealRemoveModel = {
        publicId: mealId,
        date: delMealDate
      };

      const mealRemoveRes = await DietDataService.DeleteMeal(setIsAuthenticated, navigation, mealRemoveModel);

      if(!mealRemoveRes.ok){
        //error.
        return;
      }

    }catch(error){
      //could just do none.
    }

  };

  const optionButtonPressed = () => {
    if (optionsVisible) {
      closeOptionsAnimation(optionsAnimation, iconAnimation, setOptionsVisible);
    } else {
      showOptionsAnimation(optionsAnimation, iconAnimation, setOptionsVisible);
    }
  };

  const newMealPress = async () => {
    closeOptionsAnimation(optionsAnimation, iconAnimation, setOptionsVisible);
    const newMealDate = selectedDate + 'T00:00:00Z';
    console.log(newMealDate);
    const counter = getIdCounter(); //id counter

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

    const addNewMealModel = {
      MealName: newMeal.name,
      Date: newMealDate,
    };

    try {
      const mealAddRes = await DietDataService.AddNewMeal(setIsAuthenticated, navigation, addNewMealModel);
      if(!mealAddRes.ok){
        return;
      }

    } catch (error) {
      console.log("Error while adding newMeal");
    }
  };


  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setError(false);
    setDietData(null);

    try {
      date = date + 'T00:00:00Z';
      const response = await DietDataService.GetUserDietDay(setIsAuthenticated, navigation, date);

      if (!response.ok) {
        let currentDate = new Date();
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        currentDate.toISOString();
      
        if (currentDate > new Date(date)) {
          setError(true);
          return;
        }
        else if(currentDate <= new Date(date)) {          
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

          const addNewMealModel = {
            MealName: meal.name,
            Date: dietDayVMO.date,
          };

          try{
            const mealAddRes = await DietDataService.AddNewMeal(setIsAuthenticated, navigation, addNewMealModel);           

            if(!mealAddRes.ok){
              setError(true);
              return;
            }
          }catch(error){
             setError(true);
          }

        }else{
          setError(true);
        }     
      }else if(response.ok){
        const data = await response.json();
        if(data?.meals.length === 0){
          setDietData(null);
          setError(true);
          return
        }
        setDietData(data);
      }else{
        setError(true);
      }
      
    } catch (error) {
      setError(true);
    }
  };

  const generateContentForDate = () => {
    if (!dietData && !error) {
      return (
        <View style={DietHomeStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8303" />
        </View>
      );
    }

    if(error && !dietData){
      return (
        <View style={[GlobalStyles.flex, GlobalStyles.center]}>
          {/**GATO - EMPTY ERROR */}
          <View style={DietHomeStyles.emptyGatoContainer}>

          </View>
          <View style={[{textAlign: 'center'}, {marginTop: 25}]}>
            <Text style={[GlobalStyles.text18, { textAlign: 'center' }]}>Upps... Looks like there is nothing here! Add new <Text style={[GlobalStyles.orange]}>meals</Text> and start counting your calories.</Text>
          </View>
        </View>
      );
    }

    return (
      <View>       
        <View style = {DietHomeStyles.topMargin}></View>
        {dietData.meals.map((meal, index) => (      
          <Meal key={index} meal={meal} onRemoveMeal={onRemoveMeal} onChangeMealName={handleMealNameChange} navigation={navigation}
            addIngredientToMeal={addIngredientToMeal}
            onRemoveIngredientFromMeal = {removeIngredientFromMeal}
            onChangeIngredientWeightValue = {changeIngredientWieghtValue}
            saveMeal = {saveMealSaved}
            removeMeal = {removeMealSaved}
            />
        ))}
        <View style={DietHomeStyles.bottomSpacing}></View>
      </View>
    );
  };

  return (
    <SafeAreaView style={DietHomeStyles.container} edges={['left', 'right', 'bottom', 'top']}>
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0,
          height: insets.top,
          backgroundColor: '#FF8303',
          zIndex: 100,
        }}
      />
      <StatusBar style="light"  backgroundColor="#FF8303" translucent={false} hidden={false} />

      <Calendar onDateSelect={handleDateSelect} />
      <ScrollView
        style={DietHomeStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
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
        {selectedDate ? generateContentForDate() : <Text>Select a date to see meals.</Text>}
      </ScrollView>

      <Animated.View
          pointerEvents={optionsVisible ? 'auto' : 'none'}
          style={[
            DietHomeStyles.buttonOptionContainer,
            { opacity: optionsAnimation, transform: [{ translateY: optionsAnimation.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] },
          ]}
        >
          <TouchableOpacity style={[DietHomeStyles.expOptionRow, GlobalStyles.elevated]} onPress={newMealPress}>
            <Text style={[GlobalStyles.text16]}>Add new</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[DietHomeStyles.expOptionRow, GlobalStyles.elevated]} onPress={addFromFavouritesClick}>
            <Text style={[GlobalStyles.text16]}>Load saved</Text>
          </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity style={[DietHomeStyles.addMealButton, GlobalStyles.elevated]} onPress={optionButtonPressed}>
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

      <ErrorPopup
        visible={isErrorModalVibile}
        message={errorMsg}
        onClose={closeErrorPopup}
      />
      <MakroMenu CalorieCounter={dietData ? dietData.calorieCounter : []} navigation={navigation} />
      <NavigationMenu navigation={navigation} currentScreen="DietHome" />
    </SafeAreaView>
  );
}

export default DietHome;