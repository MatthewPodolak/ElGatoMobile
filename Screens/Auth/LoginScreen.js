import React, { useState, useContext  } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { questStyles } from '../../Styles/QuestionaryStyles.js';
import BackArrow from '../../assets/Questionary/arrow-left.png';

import { AuthContext } from '../../Services/Auth/AuthContext';
import config from '../../Config.js';


function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { setIsAuthenticated } = useContext(AuthContext); 

  const backPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Start');
    }       
  };

  const handleLogin = async () => {
    if (!email && !password) {
      setErrorMessage('What do you want to achieve? Type in your credentials.');
      return;
    } else if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    } else if (!email) {
      setErrorMessage('Please enter your email.');
      return;
    }

    setLoading(true);

    const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));

    try {
      const response = await Promise.race([
        fetch(`${config.ipAddress}/api/Account/Login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }),
        timeout(config.timeout),
      ]);
  
      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('jwtToken', data.token);

        setIsAuthenticated(true);
        navigation.navigate('Home');
      } else {
        const errorData = await response.json();
        const errorMsg = typeof errorData.errors === 'string' 
          ? errorData.errors 
          : (errorData.errors && errorData.errors.Email ? errorData.errors.Email[0] : 'Login failed');
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      setErrorMessage(error.message === 'Request timed out' ? 'Something went wrong. Please try again later.' : 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={questStyles.container}>
      <View style={styles.topContainer}>
        <Pressable onPress={backPress}>
          <Image source={BackArrow} style={styles.questionaryBackImg} />
        </Pressable>
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          selectionColor="#FF8303"
          onChangeText={(text) => setEmail(text)}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={[styles.label, {marginTop: 15,}]}>Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          selectionColor="#FF8303"
          onChangeText={(text) => setPassword(text)}
          value={password}
          placeholderTextColor="#999"
          secureTextEntry
        />
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>
      <Pressable style={questStyles.nextButton} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={questStyles.nextButtonText}>Log in!</Text>
        )}
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    width: '100%',
    height: '55%',
  },
  formContainer: {
    width: '100%',
    height: '35%',
    padding: 10,
  },
  label: {
    fontSize: 20,
    color: '#000',
    fontFamily: 'Helvetica',
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#F0E3CA',
    borderBottomColor: 'black',
    borderBottomWidth: 2,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginTop: 15,
  },
  questionaryBackImg: {
    width: 32,
    height: 32,
    marginLeft: 10,
    marginTop: 5,
  }
});

export default LoginScreen;
