import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { questStyles } from '../../Styles/QuestionaryStyles.js';

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if(!email && !password){
      setErrorMessage('What dou you want to achive? Type in your credentiatls.');
      return;
    }else if(!password){
      setErrorMessage('Please enter your password.');
      return;
    }else if(!email){
      setErrorMessage('Please enter your email.');
      return;
    }

    const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));

    try {
      const response = await Promise.race([
        fetch('http://192.168.0.143:5094/api/Account/Login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }),
        timeout(10000),
      ]);
  
      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('jwtToken', data.token);
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
    }
  };
  
  return (
    <SafeAreaView style={questStyles.container}>
      <View style={styles.topContainer}></View>
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
        <Text style={styles.label}>Password:</Text>
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
      <Pressable style={questStyles.nextButton} onPress={handleLogin}>
        <Text style={questStyles.nextButtonText}>Log in!</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    width: '100%',
    height: '55%',
    backgroundColor: 'black',
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
});

export default LoginScreen;
