import config from '../../../Config';
import AuthService from '../../Auth/AuthService';
import { fetchWithTimeout } from '../../ApiCalls/fetchWithTimeout.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class CardioDataService {

      static async getCardioTrainingDay(setIsAuthenticated, navigation, date){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Cardio/GetTrainingDay?date=${encodeURIComponent(date)}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            },
            config.timeout
        );

        return response;
      };

      static async getActiveChallenges(setIsAuthenticated, navigation){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Cardio/GetActivChallenges`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            },
            config.timeout
        );

        return response;
      };
      
      static async getCurrentlyActiveChallanges(setIsAuthenticated, navigation){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Cardio/GetCurrentUserActiveChallanges`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            },
            config.timeout
        );

        return response;
      };

      static async joinChallenge(setIsAuthenticated, navigation, challengeId){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Cardio/JoinChallenge?challengeId=${encodeURIComponent(challengeId)}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,                   
                },
            },
            config.timeout
        );

        return response;
      };

      static async changeExerciseVisilibity(setIsAuthenticated, navigation, model){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Cardio/ChangeExerciseVisilibity`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,                   
                },
                body: JSON.stringify(model),
            },
            config.timeout
        );

        return response;
      }
}
