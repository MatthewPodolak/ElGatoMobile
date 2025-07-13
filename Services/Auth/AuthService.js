import AsyncStorage from '@react-native-async-storage/async-storage';
import JWT from 'expo-jwt';
import secrets from '../../secrets.json';

const secretKey = secrets.AuthKey;

const AuthService = {
  async getToken() {
    return await AsyncStorage.getItem('jwtToken');
  },

  async setToken(token) {
    return await AsyncStorage.setItem('jwtToken', token);
  },

  async removeToken() {
    return await AsyncStorage.removeItem('jwtToken');
  },

  isTokenExpired(token) {
    try {
      const decodedToken = JWT.decode(token, secretKey);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  async logout(setIsAuthenticated) {
    await this.removeToken();
    await this.removeAsyncStorageData();

    setIsAuthenticated(false);
  },

  async removeAsyncStorageData(){
    await AsyncStorage.clear();
  },
};

export default AuthService;