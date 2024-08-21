import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { convertFeetInchesToCm } from '../../Services/Conversion/MetricConversions';
import GatoQuestError from '../../assets/Questionary/carCrash.png';
import GatoQuestLoad from '../../assets/Questionary/carLoad.png';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

function FinalQuestScreen({navigation}) {
    const [loading, setLoading] = useState(true);
    const [errorView, setErrorView] = useState(false);
    const [isMetric, setIsMetric] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [loadCount, setLoadCount] = useState(0);
    const [calorieCount, setCalorieCount] = useState(0);
    const [xyzCount, setXyzCount] = useState(0);
    const [countDone, setCountDone] = useState(false);

    useEffect(() => {
      if (loadCount < 100) {
          const interval = setInterval(() => {
              setLoadCount(prevCount => prevCount + 2);
          }, 50);
          return () => clearInterval(interval);
      } else if (calorieCount < 100) {
          const interval = setInterval(() => {
              setCalorieCount(prevCount => prevCount + 2);
          }, 50);
          return () => clearInterval(interval);
      } else if (xyzCount < 100) {
          const interval = setInterval(() => {
              setXyzCount(prevCount => prevCount + 2);
          }, 50);
          return () => clearInterval(interval);
      } else if (loadCount >= 100 && calorieCount >= 100 && xyzCount >= 100) {
          setCountDone(true);
      }
    }, [loadCount, calorieCount, xyzCount])

    useEffect(() => {

      const fetchMetricSetting = async () => {
        const metricValue = await AsyncStorage.getItem('metric');
        setIsMetric(metricValue !== '0');
      };

      const fetchData = async () => {
        try {
          const nickname = await AsyncStorage.getItem('questName');
          const age = await AsyncStorage.getItem('questAge');
          const weight = await AsyncStorage.getItem('questWeight');
          const height = await AsyncStorage.getItem('questHeight');
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
              metric: isMetric
            }
          };
    
          try{
            const response = await fetch('http://192.168.0.143:5094/api/Account/RegisterWithQuestionary', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(registerPost),
            });

            if (response.ok) {

              const data = await response.json();
              await AsyncStorage.setItem('jwtToken', data.jwt);
              await AsyncStorage.setItem('calorieInfo', JSON.stringify(data.calorieIntake));        
              setLoading(false);    
              console.log('ok ');

            } else if(response.status === 409) {
              const errorMsg = 'E-mail address already in use';
              setErrorMessage(errorMsg);
              console.log('wrong e-mail res');
              //pass error ret to cred.
              await AsyncStorage.setItem('finalQuestEmailError', errorMsg);
              navigation.navigate('Credentials');
            }else{
              setErrorMessage('Internal server error. Check your internet connection and try again.');
              setErrorView(true);
            }

          }catch(error){
            setErrorMessage('Internal server error. Check your internet connection and try again.');
            setErrorView(true);
          }


        } catch (error) {
          setErrorMessage('There was an issue while processing the data from the questionary, please try again later.');
          setErrorView(true);
        }
      };
  
      fetchMetricSetting();
      fetchData();
    }, []);
  
    useEffect(() => {
      if (!loading && countDone === true) {
          navigation.navigate('Promise');
      }
    }, [loading, navigation, countDone]);

    if (errorView) {
      return (
        <SafeAreaView style={styles.container}>
          <Image source={GatoQuestError} style={styles.errorImage} />
          <Text style={styles.errorTextMain}>Upss... something went wrong.</Text>
          {errorMessage ? <Text style={styles.secondaryText}>{JSON.stringify(errorMessage)}</Text>
          : null}
        </SafeAreaView>
      );
    }
  
    return (    
      <SafeAreaView style={styles.container}>
        <Image source={GatoQuestLoad} style={styles.errorImage} />
        <Text style={styles.loadText}>Creating account... {loadCount}%</Text>
        {loadCount >= 100 && <Text style={styles.loadText}>Calculating calories... {calorieCount}%</Text>}
        {calorieCount >= 100 && <Text style={styles.loadText}>Coming up with a hype speech... {xyzCount}%</Text>}
        {xyzCount >= 100 && <Text style={styles.loadText}>Done.</Text>}
      </SafeAreaView>
    );
  }
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'black',
        padding: 10,
      },
      secondaryText: {
        fontSize: 36,
        color: 'whitesmoke',
      },
      errorTextMain: {
        padding: 10,
        marginTop: 20,
        fontSize: 32,
        color: 'whitesmoke',
        textAlign: 'center',
      },
      loadText: {
        padding: 5,
        fontSize: 16,
        color: 'whitesmoke',
        textAlign: 'center',
      },
      errorImage: {
        marginTop: 20,
        width: screenWidth,
        height: screenWidth,
      },
    });

export default FinalQuestScreen;
