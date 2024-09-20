import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import StartScreen from './Screens/Start/StartScreen';
import LoginScreen from './Screens/Auth/LoginScreen';
import RegisterScreen from './Screens/Auth/RegisterScreen';
import HomeScreen from './Screens/AppScreens/HomeScreen';
import QuestAgeScreen from './Screens/Questionary/QuestAgeScreen';
import QuestWeightScreen from './Screens/Questionary/QuestWeightScreen';
import QuestGoalScreen from './Screens/Questionary/QuestGoalScreen';
import QuestGenderScreen from './Screens/Questionary/QuestGenderScreen';
import QuestBodyTypeScreen from './Screens/Questionary/QuestBodyTypeScreen';
import QuestSleepScreen from './Screens/Questionary/QuestSleepScreen';
import QuestTrainingDaysScreen from './Screens/Questionary/QuestTrainingDaysScreen';
import QuestWalkingScreen from './Screens/Questionary/QuestWalkingScreen';
import QuestJobTypeScreen from './Screens/Questionary/QuestJobTypeScreen';
import MetricScreen from './Screens/Questionary/MetricScreen';
import QuestHightScreen from './Screens/Questionary/QuestHightScreen';
import CredentialsScreen from './Screens/Questionary/CredentialsScreen';
import FinalQuestScreen from './Screens/Questionary/FinalQuestScreen';

import AccountScreenMain from './Screens/AppScreens/Account/AccountHome';
import DietScreenMain from './Screens/AppScreens/Diet/DietHome';
import TrainingScreenMain from './Screens/AppScreens/Training/TrainingHome';
import MealsScreenMain from './Screens/AppScreens/Meals/MealsHome';

import AddIngredientScreen from './Screens/AppScreens/Diet/AddIngredient';

import * as Font from 'expo-font';
import { populateDb } from './Services/Database/populateDatabase';

const Stack = createNativeStackNavigator();

function App() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await Font.loadAsync({
          Helvetica: require('./assets/fonts/Helvetica.ttf'),
          HelveticaBold: require('./assets/fonts/Helvetica-Bold.ttf'),
        });

        await populateDb();

        const token = await AsyncStorage.getItem('jwtToken');
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Error during app preparation', error);
      } finally {
        setIsReady(true);
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
        <ActivityIndicator size="large" color="#FF8303" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Home' : 'Start'}
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Start" component={StartScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Metric" component={MetricScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="QuestAge" component={QuestAgeScreen}/>
            <Stack.Screen name="QuestWeight" component={QuestWeightScreen}/>
            <Stack.Screen name="QuestGoal" component={QuestGoalScreen}/>
            <Stack.Screen name="QuestGender" component={QuestGenderScreen}/>
            <Stack.Screen name="QuestBody" component={QuestBodyTypeScreen}/>
            <Stack.Screen name="QuestSleep" component={QuestSleepScreen}/>
            <Stack.Screen name="QuestTraining" component={QuestTrainingDaysScreen}/>
            <Stack.Screen name="QuestWalking" component={QuestWalkingScreen}/>
            <Stack.Screen name="QuestJob" component={QuestJobTypeScreen}/>
            <Stack.Screen name="QuestHeight" component={QuestHightScreen}/>
            <Stack.Screen name="Credentials" component={CredentialsScreen}/>
            <Stack.Screen name="Final" component={FinalQuestScreen}/>
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Start" component={StartScreen} />
            <Stack.Screen name="AccountHome" component={AccountScreenMain} />
            <Stack.Screen name="DietHome" component={DietScreenMain} />
            <Stack.Screen name="TrainingHome" component={TrainingScreenMain} />
            <Stack.Screen name="MealsHome" component={MealsScreenMain} />
            <Stack.Screen name="AddIngredient" component={AddIngredientScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
