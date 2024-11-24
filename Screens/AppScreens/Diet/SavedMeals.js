import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import { fetchWithTimeout } from '../../../Services/ApiCalls/fetchWithTimeout';
import AuthService from '../../../Services/Auth/AuthService.js';
import config from '../../../Config.js';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import SavedMeal from '../../../Components/Diet/SavedMeal.js';

function SavedMeals({ navigation }) {
const [isScreenLoading, setIsScreenLoading] = useState(false);
const [mealsData, setMealsData] = useState([]);

const NavigateBack = () => {
    navigation.goBack();
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
                         <SavedMeal
                            key={index}
                            meal={meal}
                            addMeal={addMealFromSaved}
                         />
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
