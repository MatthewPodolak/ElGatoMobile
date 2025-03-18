import config from '../../../Config';
import AuthService from '../../Auth/AuthService';
import { fetchWithTimeout } from '../../ApiCalls/fetchWithTimeout.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class CardioDataService {

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
}
