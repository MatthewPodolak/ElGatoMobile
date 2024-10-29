import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { questStyles } from '../../Styles/QuestionaryStyles.js';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { convertFeetInchesToCm } from '../../Services/Conversion/MetricConversions';
import GatoQuestError from '../../assets/Questionary/carCrash.png';
import GatoQuestLoad from '../../assets/Questionary/carLoad.png';
import { Dimensions } from 'react-native';
import ErrorPopup from '../../Components/Error/ErrorPopup';
import config from '../../Config.js';
import { AuthContext } from '../../Services/Auth/AuthContext';

const screenWidth = Dimensions.get('window').width;

function FinalQuestScreen({navigation}) {
    const [loading, setLoading] = useState(true);
    const [errorView, setErrorView] = useState(false);
    const [isErrorVisible, setIsErrorVisible] = useState(true);
    const [isMetric, setIsMetric] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [loadCount, setLoadCount] = useState(0);
    const [calorieCount, setCalorieCount] = useState(0);
    const [xyzCount, setXyzCount] = useState(0);
    const [countDone, setCountDone] = useState(false);
    const [regComplete, setRegComplete] = useState(false);

    const { setIsAuthenticated } = useContext(AuthContext);

    useEffect(() => {
      if (loadCount < 100) {
          const interval = setInterval(() => {
              setLoadCount(prevCount => prevCount + 4);
          }, 50);
          return () => clearInterval(interval);
      } else if (calorieCount < 100) {
          const interval = setInterval(() => {
              setCalorieCount(prevCount => prevCount + 2);
          }, 50);
          return () => clearInterval(interval);
      } else if (xyzCount < 100) {
          const interval = setInterval(() => {
              setXyzCount(prevCount => prevCount + 4);
          }, 50);
          return () => clearInterval(interval);
      } else if (loadCount >= 100 && calorieCount >= 100 && xyzCount >= 100) {
          setCountDone(true);
      }
    }, [loadCount, calorieCount, xyzCount]);

    useEffect(() => {
      const fetchMetricSetting = async () => {
        const metricValue = await AsyncStorage.getItem('metric');
        setIsMetric(metricValue !== '0');
      };
    
      const fetchData = async () => {
        try {
          const nickname = await AsyncStorage.getItem('questName');
          const age = await AsyncStorage.getItem('questAge');
          let weight = await AsyncStorage.getItem('questWeight');
          let height = await AsyncStorage.getItem('questHeight');
          const goal = await AsyncStorage.getItem('questGoal');
          const gender = await AsyncStorage.getItem('questGender');
          const bodyType = await AsyncStorage.getItem('questBody');
          const sleep = await AsyncStorage.getItem('questSleep');
          const trainingDays = await AsyncStorage.getItem('questTrainingDays');
          const walking = await AsyncStorage.getItem('questWalking');
          const jobType = await AsyncStorage.getItem('questJob');
          const userEmail = await AsyncStorage.getItem('userEmail');
          const userPassword = await AsyncStorage.getItem('userPassword');
    
          if (!isMetric) {
            weight = (parseFloat(weight) / 2.205).toFixed(2);
            height = convertFeetInchesToCm(height);
          }
    
          const registerPost = {
            email: userEmail || '',
            password: userPassword || '',
            questionary: {
              name: nickname || '',
              age: parseInt(age) || 0,
              weight: parseFloat(weight) || 0,
              height: parseFloat(height) || 0,
              woman: gender === true,
              goal: parseInt(goal) || 0,
              bodyType: parseInt(bodyType) || 0,
              sleep: parseInt(sleep) || 0,
              trainingDays: parseInt(trainingDays) || 0,
              dailyTimeSpendWorking: parseInt(walking) || 0,
              jobType: parseInt(jobType) || 0,
              metric: isMetric,
            },
          };
    
          const timeout = (ms) =>
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Couldn't connect to the server. Please check your internet connection and try again.")), ms)
            );    
    
          const response = await Promise.race([
            fetch(`${config.ipAddress}/api/Account/RegisterWithQuestionary`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(registerPost),
            }),
            timeout(config.timeout),
          ]);
    
          if (response.ok) {
            
            const data = await response.json();
            await AsyncStorage.setItem('jwtToken', data.jwt);
       
            setLoading(false);
            setRegComplete(true);

          } else if (response.status === 409) {
            const errorMsg = 'E-mail address already in use';
            setErrorMessage(errorMsg);
            await AsyncStorage.setItem('finalQuestEmailError', errorMsg);
            navigation.navigate('Credentials');
          } else {
            setErrorMessage('Internal server error. Check your internet connection and try again.');
            setErrorView(true);
            setIsErrorVisible(true);
          }
        } catch (error) {
          setErrorMessage(error.message || 'Internal server error. Check your internet connection and try again.');
          setErrorView(true);
          setIsErrorVisible(true);
        }
      };
    
      fetchMetricSetting();
      fetchData();
    }, []);
    
  
    useEffect(() => {
      if (!loading && countDone === true && regComplete === true) {
          setIsAuthenticated(true);  
          navigation.navigate('Home');
      }
    }, [loading, navigation, countDone]);

    const hideError = () => {
      setIsErrorVisible(false);
    };

    const tryAgain = () => {
      navigation.navigate('Credentials'); 
    };

    if (errorView) {
      return (
        <SafeAreaView style={styles.container}>
          <Image source={GatoQuestError} style={styles.errorImage} />
          <Text style={styles.errorTextMain}>Upss... something went wrong.</Text>
          <ErrorPopup
            visible={isErrorVisible}
            message={JSON.stringify(errorMessage)}
            onClose={hideError}
          />
          <Pressable style={questStyles.nextButton} onPress={tryAgain}>
            <Text style={questStyles.nextButtonText}>Try again.</Text>
          </Pressable>
        </SafeAreaView>
      );
    }
  
    return (    
      <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
            <Image source={GatoQuestLoad} style={styles.errorImage} />
      </View>
      <View style={styles.bottomContainer}>
        <Text style={loadCount < 100 ? styles.loadingText : styles.doneText}>
          Creating account... {loadCount}%
        </Text>
        {loadCount >= 100 && (
          <Text style={calorieCount < 100 ? styles.loadingText : styles.doneText}>
            Calculating calories... {calorieCount}%
          </Text>
        )}
        {calorieCount >= 100 && (
          <Text style={xyzCount < 100 ? styles.loadingText : styles.doneText}>
            Coming up with a hype speech... {xyzCount}%
          </Text>
        )}
        {xyzCount >= 100 && <Text style={styles.done}>Done.</Text>}
      </View>    
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F0E3CA',
    padding: 10,
  },
  secondaryText: {
    fontSize: 36,
    fontFamily: 'Helvetica',
    color: 'whitesmoke',
  },
  errorTextMain: {
    padding: 10,
    marginTop: 20,
    fontSize: 32,
    fontFamily: 'Helvetica',
    color: '#1B1A17',
    textAlign: 'center',
  },
  loadingText: {
    padding: 5,
    fontSize: 20,
    color: '#1B1A17',
    textAlign: 'center',
    fontFamily: 'Helvetica',
  },
  done: {
    padding: 5,
    fontSize: 20,
    color: '#FF8303',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  doneText: {
    fontFamily: 'Helvetica',
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  errorImage: {
    marginTop: 20,
    width: screenWidth,
    height: screenWidth,
  },
  topContainer: {
    width: '100%',
    height: '80%',
  },
  bottomContainer: {
    width: '100%',
    height: '20%',
  },
});

export default FinalQuestScreen;
