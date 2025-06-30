import config from '../../../Config';
import AuthService from '../../Auth/AuthService';
import { fetchWithTimeout } from '../../ApiCalls/fetchWithTimeout.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class UserRequestService {
    
    static async reportMealRequest(setIsAuthenticated, navigation, requestBody) {
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        var response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserRequest/ReportMealRequest`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            },
            config.timeout
        );

        return response;
    };
    
    static async addIngredientRequest(setIsAuthenticated, navigation, requestBody){
      const token = await AuthService.getToken();
      if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
      }

      var response = await fetchWithTimeout(
        `${config.ipAddress}/api/UserRequest/AddIngredientRequest`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
        config.timeout
      );

      return response;
    };

    static async reportIngredientRequest(setIsAuthenticated, navigation, requestBody){
      const token = await AuthService.getToken();
      if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
      }

      const response = await fetchWithTimeout(
        `${config.ipAddress}/api/UserRequest/ReportIngredientRequest`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
        config.timeout
      );

      return response;
    };

    static async reportUser(setIsAuthenticated, navigation, model){
      const token = await AuthService.getToken();
      if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
      }

      const response = await fetchWithTimeout(
        `${config.ipAddress}/api/UserRequest/ReportUser`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(model),
        },
        config.timeout
      );

      return response;
    }

    static async saveUserSteps(setIsAuthenticated, navigation, model) {
      const token = await AuthService.getToken();
      if (!token || AuthService.isTokenExpired(token)) {
        await AuthService.logout(setIsAuthenticated, navigation);
        return null;
      }

      model.date = model.date instanceof Date ? model.date.toISOString() : new Date(model.date).toISOString();

      const key = 'userDailyStepsRc';
      const previousValue = await AsyncStorage.getItem(key);

      const pushAndSave = async () => {
        const res = await this.addStepsRequest(setIsAuthenticated, navigation, model);
        if (!res) return null;

        const body = await res.json();
        const { achievment, status } = body;

        if (status.success) {
          await AsyncStorage.setItem(key, JSON.stringify(model));
        }

        if(achievment){
          return achievment;
        }

        return null;
      };

      if (!previousValue) {
        return await pushAndSave();
      }

      const parsed = JSON.parse(previousValue);

      const savedDate = new Date(parsed.date);
      const modelDate = new Date(model.date);

      const isSameDay = savedDate.toDateString() === modelDate.toDateString();
      const isHigher = model.steps > parsed.steps;

      if (!isSameDay) {
        return await pushAndSave();
      }

      if (isSameDay && isHigher) {
        return await pushAndSave();
      }

      return null;
    }


    static async addStepsRequest(setIsAuthenticated, navigation, model){
      const token = await AuthService.getToken();
      if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
      }

      const response = await fetchWithTimeout(
        `${config.ipAddress}/api/UserData/AddSteps`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(model),
        },
        config.timeout
      );

      return response;
    }
}
