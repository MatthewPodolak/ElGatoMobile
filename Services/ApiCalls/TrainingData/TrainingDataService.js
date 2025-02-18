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

    static async getTrainingDay(setIsAuthenticated, navigation, date){
      const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        var response = await fetchWithTimeout(
          `${config.ipAddress}/api/Training/GetTrainingDay?date=${date}`,
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

    static async addExercisesToTrainingDay(setIsAuthenticated, navigation, data){
      const token = await AuthService.getToken();
      if(!token || AuthService.isTokenExpired(token)){
        await AuthService.logout(setIsAuthenticated, navigation);
        return null;
      }

      var response = await fetchWithTimeout(
        `${config.ipAddress}/api/Training/AddExercisesToTrainingDay`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
        config.longTimeout
    );

    return response;
    }

    static async addSeriesToExercisses(setIsAuthenticated, navigation, data){
      const token = await AuthService.getToken();
      if(!token || AuthService.isTokenExpired(token)){
        await AuthService.logout(setIsAuthenticated, navigation);
        return null;
      }

      var response = await fetchWithTimeout(
        `${config.ipAddress}/api/Training/AddSeriesToAnExercise`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
        config.longTimeout
      );

      return response;
    };

    static async removeSeriesFromExercisses(setIsAuthenticated, navigation, data){
      const token = await AuthService.getToken();
      if(!token || AuthService.isTokenExpired(token)){
        await AuthService.logout(setIsAuthenticated, navigation);
        return null;
      }

      var response = await fetchWithTimeout(
        `${config.ipAddress}/api/Training/RemoveSeriesFromAnExercise`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
        config.longTimeout
      );

      return response;
    };

    static async removeExerciseFromTrainingDay(setIsAuthenticated, navigation, data){
      const token = await AuthService.getToken();
      if(!token || AuthService.isTokenExpired(token)){
        await AuthService.logout(setIsAuthenticated, navigation);
        return null;
      }

      var response = await fetchWithTimeout(
        `${config.ipAddress}/api/Training/RemoveExercisesFromTrainingDay`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
        config.longTimeout
      );

      return response;
    };

    static async likeExercise(setIsAuthenticated, navigation, exerciseName){
      const token = await AuthService.getToken();
      if(!token || AuthService.isTokenExpired(token)){
        await AuthService.logout(setIsAuthenticated, navigation);
        return null;
      }

      var response = await fetchWithTimeout(
        `${config.ipAddress}/api/Training/UpdateExerciseLikedStatus?exerciseName=${exerciseName}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        config.longTimeout
      );

      return response;
    };

    static async updateExerciseSeriesData(setIsAuthenticated, navigation, data){
      const token = await AuthService.getToken();
      if(!token || AuthService.isTokenExpired(token)){
        await AuthService.logout(setIsAuthenticated, navigation);
        return null;
      }

      var response = await fetchWithTimeout(
        `${config.ipAddress}/api/Training/UpdateExerciseSeries`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
        config.longTimeout
      );

      return response;
    }
}
