import React, { createContext, useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import JWT from 'expo-jwt';
import secrets from '../../secrets.json';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  const secretKey = secrets.AuthKey;

  const isTokenExpired = (token) => {
    try {
      const decodedToken = JWT.decode(token, secretKey); 
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    } catch (error) {
      return true; //ret as expired as error handling ;p.
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (token && !isTokenExpired(token)) {
          setIsAuthenticated(true); 
        } else {
          setIsAuthenticated(false); 
          await AsyncStorage.removeItem('jwtToken');
        }
      } catch (error) {
        console.error('Error checking token:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF8303" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
