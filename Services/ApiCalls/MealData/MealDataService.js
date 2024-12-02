import config from '../../../Config';
import AuthService from '../../Auth/AuthService';
import { fetchWithTimeout } from '../../ApiCalls/fetchWithTimeout.js';

export default class MealDataService {
    
    static async deleteMeal(setIsAuthenticated, navigation, stringId) {
        const token = await AuthService.getToken();

        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Meal/DeleteMeal?mealId=${stringId}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            },
            config.longTimeout
        );

        return response;
    };

    static async likeMeal(setIsAuthenticated, navigation, id){
        const token = await AuthService.getToken();

        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Meal/LikeMeal?mealId=${id}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
            config.timeout
        );

        return response;
    };

    static async saveMeal(setIsAuthenticated, navigation, id){
        const token = await AuthService.getToken();

        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }
        
        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Meal/SaveMeal?mealId=${id}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
            config.timeout
          );

        return response;
    }

    static async getOwnRecipes(setIsAuthenticated, navigation){
        const token = await AuthService.getToken();

        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }
        
        const response = await fetchWithTimeout(
          `${config.ipAddress}/api/Meal/GetOwnRecipes`,
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

    static async getLikedMeals(setIsAuthenticated, navigation){
      const token = await AuthService.getToken();
      if (!token || AuthService.isTokenExpired(token)) {
        await AuthService.logout(setIsAuthenticated, navigation);
        return null;
      }

      const response = await fetchWithTimeout(
        `${config.ipAddress}/api/Meal/GetLikedMeals`,
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

    static async publishMeal(setIsAuthenticated, navigation, requestForm){
      const token = await AuthService.getToken();
      if (!token || AuthService.isTokenExpired(token)) {
        await AuthService.logout(setIsAuthenticated, navigation);
        return null;
      }

      const response = await fetchWithTimeout(
        `${config.ipAddress}/api/meal/publishMeal`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: requestForm
        },
        config.longTimeout
    );

      return response;
    }

    static async Search(setIsAuthenticated, navigation, requestBody){
      const token = await AuthService.getToken();
      if (!token || AuthService.isTokenExpired(token)) {
        await AuthService.logout(setIsAuthenticated, navigation);
        return null;
      }

      const response = await fetchWithTimeout(
        `${config.ipAddress}/api/Meal/Search`,
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

    static async GetStarters(setIsAuthenticated, navigation){
      const token = await AuthService.getToken();
      if (!token || AuthService.isTokenExpired(token)) {
        await AuthService.logout(setIsAuthenticated, navigation);
        return null;
      }

      const response = await fetchWithTimeout(
        `${config.ipAddress}/api/Meal/GetStarters`,
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

    static async GetExtendedStarters(setIsAuthenticated, navigation, requestBody){
      const token = await AuthService.getToken();
      if (!token || AuthService.isTokenExpired(token)) {
        await AuthService.logout(setIsAuthenticated, navigation);
        return null;
      }

      const response = await fetchWithTimeout(
        `${config.ipAddress}/api/Meal/GetExtendedStarters`,
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
}
