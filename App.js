import React, { useEffect, useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, AuthContext } from './Services/Auth/AuthContext';

import StartScreen from './Screens/Start/StartScreen';
import LoginScreen from './Screens/Auth/LoginScreen';
import QuestionaryScreen from './Screens/Questionary/QuestionaryScreen';
import QuestionaryFinalizationScreen from './Screens/Questionary/QuestionaryFinalizationScreen';

import HomeScreen from './Screens/AppScreens/Home/HomeScreen';
import AccountScreenMain from './Screens/AppScreens/Account/AccountHome';
import DietScreenMain from './Screens/AppScreens/Diet/DietHome';
import TrainingScreenMain from './Screens/AppScreens/Training/TrainingHome';
import MealsScreenMain from './Screens/AppScreens/Meals/MealsHome';
import StartersDisplayScreen from './Screens/AppScreens/Meals/StartersDisplay';
import AddMealScreen from './Screens/AppScreens/Meals/AddMealForm';
import AddIngredientScreen from './Screens/AppScreens/Diet/AddIngredient';
import SavedMealsScreen from './Screens/AppScreens/Diet/SavedMeals';
import AddExerciseScreen from './Screens/AppScreens/Training/AddExercise';
import InspectExerciseScreen from './Screens/AppScreens/Training/InspectExercise';
import LoadExercises from './Screens/AppScreens/Training/LoadExercises';
import CardioStartScreen from './Screens/AppScreens/Training/CardioStart';
import CardioSummaryScreen from './Screens/AppScreens/Training/CardioSummary';
import ProfileDisplayScreen from './Screens/AppScreens/Account/ProfileDisplay';
import EditProfileScreen from './Screens/AppScreens/Account/EditProfile';
import FollowerRequestScreen from './Screens/AppScreens/Account/FollowerRequestsDisplay';
import UserFollowersDisplay from './Screens/AppScreens/Account/UserFollowersDisplay';
import UserSearch from './Screens/AppScreens/Account/UserSearch';
import SettingsScreen from './Screens/AppScreens/Account/Settings';
import CompoControlScreen from './Screens/AppScreens/Home/CompControl';
import AddWeightScreen from './Screens/AppScreens/Home/AddWeight';
import Personalize from './Screens/AppScreens/Home/Personalize';

const AuthStack = createNativeStackNavigator();
function UnauthenticatedNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{ headerShown: false, animation: 'none' }}
    >
      <AuthStack.Screen name="Start" component={StartScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Questionary" component={QuestionaryScreen} />
      <AuthStack.Screen name="QuestionaryFinalization" component={QuestionaryFinalizationScreen} />
    </AuthStack.Navigator>
  );
}

const AppStack = createNativeStackNavigator();
function AuthenticatedNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      <AppStack.Screen name="Home" component={HomeScreen} />
      <AppStack.Screen name="AccountHome" component={AccountScreenMain} />
      <AppStack.Screen name="DietHome" component={DietScreenMain} />
      <AppStack.Screen name="TrainingHome" component={TrainingScreenMain} />
      <AppStack.Screen name="MealsHome" component={MealsScreenMain} />
      <AppStack.Screen name="StartersDisplay" component={StartersDisplayScreen} />
      <AppStack.Screen name="AddMeal" component={AddMealScreen} />
      <AppStack.Screen name="AddIngredient" component={AddIngredientScreen} />
      <AppStack.Screen name="SavedMeals" component={SavedMealsScreen} />
      <AppStack.Screen name="AddExercise" component={AddExerciseScreen} />
      <AppStack.Screen name="InspectExercise" component={InspectExerciseScreen} />
      <AppStack.Screen name="LoadExercises" component={LoadExercises} />
      <AppStack.Screen name="CardioStart" component={CardioStartScreen} />
      <AppStack.Screen name="CardioSummary" component={CardioSummaryScreen} />
      <AppStack.Screen name="ProfileDisplay" component={ProfileDisplayScreen} />
      <AppStack.Screen name="EditProfile" component={EditProfileScreen} />
      <AppStack.Screen name="FollowerRequests" component={FollowerRequestScreen} />
      <AppStack.Screen name="UserFollowersDisplay" component={UserFollowersDisplay} />
      <AppStack.Screen name="UserSearch" component={UserSearch} />
      <AppStack.Screen name="Settings" component={SettingsScreen} />
      <AppStack.Screen name="CompoControl" component={CompoControlScreen} />
      <AppStack.Screen name="AddWeight" component={AddWeightScreen} />
      <AppStack.Screen name="Personalize" component={Personalize} />
    </AppStack.Navigator>
  );
}

function App() {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF8303" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AuthenticatedNavigator /> : <UnauthenticatedNavigator />}
    </NavigationContainer>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}