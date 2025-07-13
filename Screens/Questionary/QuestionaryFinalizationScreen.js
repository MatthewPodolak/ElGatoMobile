import React, { useState, useContext, useEffect } from 'react';
import { CommonActions } from '@react-navigation/native';
import { View, Text, StyleSheet, StatusBar, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../../Styles/GlobalStyles';
import { AuthContext } from '../../Services/Auth/AuthContext.js';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GatoQuestLoad from '../../assets/Questionary/carLoad.png';
import { convertFeetInchesToCm } from '../../Services/Conversion/MetricConversions';
import config from '../../Config.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

function QuestionaryFinalizationScreen({ navigation }) {
  const route = useRoute();
  const { questionaryData = null } = route.params ?? {};
  const insets = useSafeAreaInsets();
  const { setIsAuthenticated } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorText, setErrorText] = useState(null);
  const [credentialsError, setCredentialsError] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-[\]{};':"\\|,.<>/?]).{8,}$/;

  const [loadCount, setLoadCount] = useState(0);
  const [calorieCount, setCalorieCount] = useState(0);
  const [xyzCount, setXyzCount] = useState(0);

  useEffect(() => {
    setCredentialsError(null);

    if(!questionaryData){
        setIsError(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) return;

    if (loadCount < 100) {
      const iv = setInterval(() => setLoadCount(c => Math.min(c + 4, 100)), 50);
      return () => clearInterval(iv);
    }
    if (calorieCount < 100) {
      const iv = setInterval(() => setCalorieCount(c => Math.min(c + 2, 100)), 50);
      return () => clearInterval(iv);
    }
    if (xyzCount < 100) {
      const iv = setInterval(() => setXyzCount(c => Math.min(c + 4, 100)), 50);
      return () => clearInterval(iv);
    }

    if (loadCount >= 100 && calorieCount >= 100 && xyzCount >= 100 && registerSuccess) {
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, [isLoading, loadCount, calorieCount, xyzCount, registerSuccess]);

  const registerClicked = async () => {
    if(!questionaryData) { setIsError(true); return; }
    if(!password || !email) { setCredentialsError("What do you want to achieve?"); return; }

    if (!emailRegex.test(email)) { setCredentialsError("Please enter a valid email address."); return; }
    if (!passwordRegex.test(password)) { setCredentialsError("Password must be at least 8 characters long, include an uppercase letter, a number, and a special character. \n Sorry." ); return; }

    setIsLoading(true);
    setIsError(false);
    setCredentialsError(null);

    try{        
        const answers = questionaryData.reduce((map, {id, ans}) => {map[id] = ans ?? ''; return map; }, {});
        const metric = answers[0] === "1";
        const name = answers[1];
        const age = parseInt(answers[2], 10) || 22;
        const weightRaw = parseFloat(answers[3]) || 0;
        const heightRaw = answers[4];
        const isWoman = answers[5] === "1";
        const goal = parseInt(answers[6], 10) || 0;
        const sleep = parseInt(answers[7], 10) || 0;
        const bodyType = parseInt(answers[8], 10) || 0;
        const workHrs = parseInt(answers[9], 10) || 0;
        const trainDays = parseInt(answers[10], 10) || 0;
        const jobType = parseInt(answers[11], 10) || 0;
        const weight = metric ? weightRaw.toFixed(2) : (weightRaw / 2.205).toFixed(2);
        const height = metric ? parseFloat(heightRaw) || 0 : convertFeetInchesToCm(heightRaw);  

        const model = {
            email,
            password,
            questionary: {
                name,
                age,
                weight,
                height,
                woman: isWoman,
                goal,
                bodyType,
                sleep,
                trainingDays: trainDays,
                dailyTimeSpendWorking: workHrs,
                jobType,
                metric,
            }
        };

        const timeout = (ms) =>
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Couldn't connect to the server. Please check your internet connection and try again.")), ms)
        ); 

        const res = await Promise.race([
            fetch(`${config.ipAddress}/api/Account/RegisterWithQuestionary`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(model),
            }),
            timeout(config.timeout),
        ]);

        if(!res.ok){
            if(res.status === 409){
                setIsLoading(false);
                setCredentialsError("E-mail already in use.")
                return;
            }

            setIsError(true);
            setIsLoading(false);
            return;
        }

        const data = await res.json();
        await AsyncStorage.setItem('jwtToken', data.jwt);
        setRegisterSuccess(true);

    }catch(error){
        setIsError(true);
        setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={{ height: insets.top, backgroundColor: '#ead9b6' }} />
      <StatusBar barStyle="light-content" backgroundColor="#ead9b6" translucent={false} hidden={false}/>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'position' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}
      >
        <View style={[GlobalStyles.flex, styles.inner]}>
          {isError ? (
            <>
              <View style={styles.gatoErrorImgContainer}>

              </View>
              <Text style={[GlobalStyles.text18, GlobalStyles.center, { textAlign: 'center', paddingHorizontal: 10, marginBottom: 25, }]}>
                <Text style={GlobalStyles.orange}>Upsss… </Text> {errorText ?? 'Something went horribly wrong. Try restarting the app.'}
              </Text>
            </>
          ) : isLoading ? (
            <View style={styles.loadingContainer}>
             <Image
                source={GatoQuestLoad}
                style={styles.loadingImage}
              />
              <Text style={styles.loadingText}>
                Creating account... {loadCount}%
             </Text>
              {loadCount >= 100 && (
               <Text style={styles.loadingText}>
                  Calculating calories... {calorieCount}%
               </Text>
              )}
              {calorieCount >= 100 && (
                <Text style={styles.loadingText}>
                 Coming up with a hype speech... {xyzCount}%
                </Text>
              )}
           </View>
          ) : (
            <View style={styles.credentialContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.floatingLabel}>Email:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  selectionColor="#FF8303"
                  onChangeText={setEmail}
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.floatingLabel}>Password:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  selectionColor="#FF8303"
                  onChangeText={setPassword}
                  value={password}
                  secureTextEntry
                />
              </View>

              {credentialsError && (
                <Text style={[GlobalStyles.text18, GlobalStyles.red, {textAlign: 'center'}]}>{credentialsError}</Text>
              )}

              <TouchableOpacity onPress={() => registerClicked()} style={styles.nextButton}>
                <Text style={styles.nextButtonText}> Start the journey! </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ead9b6',
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    backgroundColor: '#ead9b6',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  gatoErrorImgContainer: {
    flex: 0.95,
    backgroundColor: 'red',
  },
  credentialContainer: {
    width: '90%',
    alignItems: 'center',
  },
  inputWrapper: {
    width: '100%',
    position: 'relative',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    paddingVertical: 5,
    backgroundColor: '#ead9b6',
  },
  floatingLabel: {
    position: 'absolute',
    top: -8,
    left: 12,
    backgroundColor: '#ead9b6',
    paddingHorizontal: 4,
    fontSize: 14,
    fontFamily: 'Helvetica',
    color: '#000',
  },
  input: {
    height: 40,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Helvetica',
    color: '#000',
    textAlignVertical: 'center',
  },
  nextButton: {
    marginTop: 20,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#FF8303',
    marginBottom: 30,
  },
  nextButtonText: {
    color: '#1B1A17',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Helvetica',
  },
  loadingContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  loadingImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'contain',
  },
  loadingText: {
    fontSize: 18,
    color: '#1B1A17',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Helvetica',
  },
});

export default QuestionaryFinalizationScreen;