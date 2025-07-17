import config from '../../../Config';
import AuthService from '../../Auth/AuthService';
import { fetchWithTimeout } from '../../ApiCalls/fetchWithTimeout.js';

export default class DietDataService {
    
    static async getIngridientByEan(setIsAuthenticated, navigation, ean){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/GetIngridientByEan?ean=${ean}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
            (config.longTimeout)
          );

          return response;
    }
    
    static async getListOfCorrelatedItemByName(setIsAuthenticated, navigation, name, count, afterCode = null){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const params = new URLSearchParams({
          name,
          count: String(count),
        });

        if (afterCode != null) {
          params.append("afterCode", afterCode);
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/GetListOfCorrelatedItemByName?${params}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
            config.longTimeout
          );

        return response;
    }

    static async addMealFromSaved(setIsAuthenticated, navigation, requestBody){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/AddMealFromSaved`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            },
            config.timeout
        );

        return response;
    }

    static async removeMealFromSavedMeals(setIsAuthenticated, navigation, name){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/RemoveMealFromSavedMeals?mealName=${name}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
            config.timeout
        );

        return response;
    }

    static async addMealToSavedMeals(setIsAuthenticated, navigation, requestBody){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/AddMealToSavedMeals`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            },
            config.timeout
          );

          return response;
    }

    static async addIngriedientsToMeal(setIsAuthenticated, navigation, requestBody){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/AddIngriedientsToMeal`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            },
            config.timeout
          );

        return response;
    }

    static async removeIngridientFromMeal(setIsAuthenticated, navigation, requestBody){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/RemoveIngridientFromMeal`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            },
            config.timeout
          );

        return response;
    }

    static async updateIngridientWeightValue(setIsAuthenticated, navigation, requestBody){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/UpdateIngridientWeightValue`,
            {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            },
            config.timeout
        );

        return response;
    }

    static async UpdateMealName(setIsAuthenticated, navigation, requestBody){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/UpdateMealName`,
            {
              method: 'PATCH',
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

    static async DeleteMeal(setIsAuthenticated, navigation, requestBody){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/DeleteMeal`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            },
            config.timeout
          );

        return response;
    }

    static async AddNewMeal(setIsAuthenticated, navigation, requestBody){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/AddNewMeal`,
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
    }

    static async GetUserDietDay(setIsAuthenticated, navigation, date){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/GetUserDietDay?date=${date}`,
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

    static async DeleteMealsFromSaved(setIsAuthenticated, navigation, requestBody){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/DeleteMealsFromSaved`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody)
            },
            config.timeout
        );

        return response;
    }

    static async UpdateSavedMealIngridientWeight(setIsAuthenticated, navigation, requestBody){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/UpdateSavedMealIngridientWeight`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody)
            },
            config.timeout
        );

        return response;
    }

    static async GetSavedMeals(setIsAuthenticated, navigation){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/GetSavedMeals`,
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
}
