import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { GestureHandlerRootView, LongPressGestureHandler } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { fetchWithTimeout } from '../../../Services/ApiCalls/fetchWithTimeout';
import AuthService from '../../../Services/Auth/AuthService.js';
import config from '../../../Config.js';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import SavedMeal from '../../../Components/Diet/SavedMeal.js';
import DeleteIcon from '../../../assets/main/Diet/trash3.svg';

function SavedMeals({ navigation }) {
const [isScreenLoading, setIsScreenLoading] = useState(false);
const [mealsData, setMealsData] = useState([]);

const [mealIndexesHold, setMealIndexesHold] = useState([]);
const [mealsToDelete, setMealsToDelete] = useState([]);

const NavigateBack = () => {
    navigation.goBack();
};

const handleLongPress = (index, meal) => {
  setMealIndexesHold((prev) => {
    if (prev.includes(index)) {
      return prev.filter((i) => i !== index);
    } else {
      return [...prev, index];
    }
  });

  setMealsToDelete((prev) =>{
    if(prev.includes(meal.name)) {
      return prev.filter((i) => i !== meal.name);
    }else{
      return [...prev, meal.name];
    }
  });
};

const deleteSavedMeals = async () => {
  setMealsData((prev) => prev.filter((meal) => !mealsToDelete.includes(meal.name)));
  try{
    const token = await AuthService.getToken();   
    if (!token || AuthService.isTokenExpired(token)) {
      await AuthService.logout(setIsAuthenticated, navigation);
      return;
    }

    const deleteModel = {
      savedMealsNames: mealsToDelete,
    };

    const res = await fetchWithTimeout(
      `${config.ipAddress}/api/Diet/DeleteMealsFromSaved`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteModel)
      },
      config.timeout
    );

    if(!res.ok){
      //ERROR
      console.log("Error");
      return;
    }

    //Ok.

  }catch(error){
    //ERROR
    console.log("Error while removing", error);
  }
};

const updateIngridientWeight = async (updateModel) => {
    try{
      const token = await AuthService.getToken();   
      if (!token || AuthService.isTokenExpired(token)) {
        await AuthService.logout(setIsAuthenticated, navigation);
        return;
      }

      const res = await fetchWithTimeout(
        `${config.ipAddress}/api/Diet/UpdateSavedMealIngridientWeight`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateModel)
        },
        config.timeout
      );

      if(!res.ok){
        //ERROR
        console.log("Error");
        return;
      }

      //ok.

    }catch(error){
      //ERROR
      console.log(error);
    }
};

const addMealFromSaved = (savedMealToAdd) => {
  navigation.navigate('DietHome', { savedMealToAdd });
};

useEffect(() => {
    const fetchSavedMeals = async () => {
        try {
            setIsScreenLoading(true);
            const token = await AuthService.getToken();   
            if (!token || AuthService.isTokenExpired(token)) {
                await AuthService.logout(setIsAuthenticated, navigation);
                return;
            }

            const res = await fetchWithTimeout(
                `${config.ipAddress}/api/Diet/GetSavedMeals`,
                {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                },
                config.timeout
            );

            if(!res.ok){
                console.log("error");
                return;
            }

            const data = await res.json();
            setMealsData(data);

        } catch (error) {
            console.error("Error", error);
        } finally {
            setIsScreenLoading(false);
        }
    };

    fetchSavedMeals();
}, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF8303" barStyle="light-content" />
        <View style={styles.titleCont}>
          <TouchableOpacity style = {styles.titleLeft} onPress={() => NavigateBack()}>
            <ChevronLeft width={28} height={28} fill={"#fff"} />
          </TouchableOpacity>
          <View style = {styles.titleMid}><Text style={[GlobalStyles.bold, GlobalStyles.text22]}>Saved meals</Text></View>
          <View style = {styles.titleRight}>
            {mealsToDelete.length != 0 &&(
              <TouchableOpacity style={styles.titleRight} onPress={() => deleteSavedMeals()}>
                <DeleteIcon width={26} height={26} fill={"#fff"} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isScreenLoading ? (
            <View style={[styles.container, GlobalStyles.center]}>
                <ActivityIndicator size="large" color="#FF8303" />
            </View>
        ):(
            <View style={styles.mainContainer}>
                {mealsData == null || mealsData.length == 0 ? (
                    <View style={styles.mainContainer}>
                        <View style={styles.elGatoContainer}>
                            {/*EL GATO */}
                        </View>
                        <View style={styles.elGatoTextContainer}>
                            <Text style = {[GlobalStyles.text18]}>You didn't save any yet?</Text>
                            <Text style = {[GlobalStyles.text18]}>Save yourself some time and do so.</Text>
                            <Text>🧡🧡🧡</Text>
                        </View>
                    </View>
                ):(
                    <ScrollView style={styles.mainContainer}>
                        {mealsData.map((meal, index) => (
                        <GestureHandlerRootView
                          key={index}
                        >
                          <LongPressGestureHandler                            
                            onHandlerStateChange={({ nativeEvent }) => {
                              if (nativeEvent.state === 4) {
                                handleLongPress(index, meal);
                              }
                            }}
                            minDurationMs={200}
                          >
                            <View>
                              <SavedMeal
                                meal={meal}
                                addMeal={addMealFromSaved}
                                updateIngridient={updateIngridientWeight}
                                isSetted={mealIndexesHold.includes(index)}
                              />
                            </View>
                          </LongPressGestureHandler>
                          </GestureHandlerRootView>
                        ))}
                    </ScrollView>
                )}
            </View>
        )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  titleCont: {
    width: '100%',
    height: '9%',
    backgroundColor: '#FF8303',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  titleLeft: {
    width: '12.5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRight: {
    width: '12.5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleMid: {
    width: '75%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainContainer: {
    flex: 1,
  },
  
  elGatoContainer: {
    height: '80%',
  },
  elGatoTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 20,
  }
});

export default SavedMeals;
