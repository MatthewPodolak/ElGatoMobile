import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
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
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { setIsAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const backPress = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Start');
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

    setErrorMessage('');
    setLoading(true);
    const timeout = ms =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), ms)
      );

    try {
      const response = await Promise.race([
        fetch(`${config.ipAddress}/api/Account/Login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }),
        timeout(config.timeout),
      ]);

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('jwtToken', data.token);
        setIsAuthenticated(true);
      } else {
        const err = await response.json();
        const msg =
          typeof err.errors === 'string' ? err.errors : err.errors?.Email?.[0] ?? 'Login failed';
        setErrorMessage(msg);
      }
    } catch (e) {
      setErrorMessage(
        e.message === 'Request timed out' ? 'Something went wrong. Please try again later.' : 'Please try again later.'
      );
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

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={[
              styles.formContainer,
              keyboardVisible && styles.formPinnedToTop,
            ]}
          >
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

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Pressable
        style={questStyles.nextButton}
        onPress={handleLogin}
        disabled={loading}
      >
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
    height: '60%',
  },
  questionaryBackImg: {
    width: 32,
    height: 32,
    marginLeft: 10,
    marginTop: 5,
  },
  keyboardContainer: {
    flex: 1,
    width: '100%',
  },
  formContainer: {
    flex: 1,
    width: '100%',
    padding: 16,
    justifyContent: 'center',
  },
  formPinnedToTop: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 0 : 20,
    left: 0,
    right: 0,
    paddingTop: 8,
  },
  inputWrapper: {
    position: 'relative',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    paddingVertical: 5,
    backgroundColor: '#F0E3CA',
  },
  floatingLabel: {
    position: 'absolute',
    top: -8,
    left: 12,
    backgroundColor: '#F0E3CA',
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
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default LoginScreen;