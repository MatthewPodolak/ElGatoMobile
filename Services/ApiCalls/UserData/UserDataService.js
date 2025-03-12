import config from '../../../Config';
import AuthService from '../../Auth/AuthService';
import { fetchWithTimeout } from '../../ApiCalls/fetchWithTimeout.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class UserDataService {
    
    static async getUserCaloriesIntake(setIsAuthenticated, navigation) {
        const value = await AsyncStorage.getItem("calorieIntake");
        if(value != null){
            return JSON.parse(value);;
        }

        const token = await AuthService.getToken();

        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetUserCaloriesIntake`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            },
            config.timeout
        );

        if(!response.ok){
            return null;
        }

        const data = await response.json();
        return data;
    };

    static async getCurrentUserMakroIntake(setIsAuthenticated, navigation, currentDate){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetUserCurrentDayCalorieIntake?date=${encodeURIComponent(currentDate)}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            },
            config.timeout
        );

        return response;
    };

    static async getUserWeightType(setIsAuthenticated, navigation){
        const value = await AsyncStorage.getItem("measureType");
        if(value != null){
            return value;
        }
        
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetUserMeasurmentsSystem`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            },
            config.timeout
        );

        if(!response.ok){
            return "metric";
        }

        const measureType = await response.json();
        await AsyncStorage.setItem("measureType", measureType);

        return measureType;
    };

    static async getUserCurrentWaterIntake(setIsAuthenticated, navigation, currentDate){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetUserWaterIntake?date=${encodeURIComponent(currentDate)}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            },
            config.timeout
        );

        return response;
    }

    static async addWaterToCurrentDay(setIsAuthenticated, navigation, data){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/AddWater`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            },
            config.timeout
        );

        return response;
    };

    static async saveUserLayoutDataToAsyncStorage(data){
        await AsyncStorage.setItem("layoutData", JSON.stringify(data));
    };

    static async getUserLayout(setIsAuthenticated, navigation){
        const value = await AsyncStorage.getItem("layoutData");
        if(value != null){
            try {
                return JSON.parse(value);
            } catch (error) {
                return null;
            }
        }

        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetUserLayoutData`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            },
            config.timeout
        );

        if(response.ok){
            data = await response.json();
            await AsyncStorage.setItem("layoutData", JSON.stringify(data));
            return data;
        }

        return null;
    };

    static async getPastExerciseData(setIsAuthenticated, navigation, data){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetPastDataForExercises`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            },
            config.timeout
        );

        return response;
    };

    static async getMuscleUsageData(setIsAuthenticated, navigation, period) {
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }
        
        const baseUrl = `${config.ipAddress}/api/UserData/GetTrainedMuscleData`;
        const url = period != null ? `${baseUrl}?period=${encodeURIComponent(period)}`: baseUrl;
        
        const response = await fetchWithTimeout(
          url,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          },
          config.timeout
        );
      
        return response;
      };
      
      static async getPastMakroData(setIsAuthenticated, navigation, period){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }
        
        const baseUrl = `${config.ipAddress}/api/UserData/GetPastMakroData`;
        const url = period != null ? `${baseUrl}?period=${encodeURIComponent(period)}`: baseUrl;
        
        const response = await fetchWithTimeout(
          url,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          },
          config.timeout
        );
      
        return response;
      };

      static async getUserDailyMakroDist(setIsAuthenticated, navigation, currentDate){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetCurrentDailyMakroDistribution?date=${encodeURIComponent(currentDate)}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            },
            config.timeout
        );

        return response;
      };
}
