import config from '../../../Config';
import AuthService from '../../Auth/AuthService';
import { fetchWithTimeout } from '../../ApiCalls/fetchWithTimeout.js';

export default class TrainingDataService {
    
    static async getAllExerciseData(setIsAuthenticated, navigation) {
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        var response = await fetchWithTimeout(
            `${config.ipAddress}/api/Training/GetAllExercises`,
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
    
    static async getLikedExercises(setIsAuthenticated, navigation){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        var response = await fetchWithTimeout(
          `${config.ipAddress}/api/Training/GetLikedExercises`,
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

    static async removeExercisesFromLiked(setIsAuthenticated, navigation, model){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        var response = await fetchWithTimeout(
          `${config.ipAddress}/api/Training/RemoveExercisesFromFavourites`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(model),
          },
          config.timeout
      );

      return response;
    };

    static async addExerciseToLiked(setIsAuthenticated, navigation, model){
      const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        var response = await fetchWithTimeout(
          `${config.ipAddress}/api/Training/AddExerciseToFavourites`,
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
    };

}
