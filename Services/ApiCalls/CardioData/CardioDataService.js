import config from '../../../Config';
import AuthService from '../../Auth/AuthService';
import { fetchWithTimeout } from '../../ApiCalls/fetchWithTimeout.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class CardioDataService {

      static async getActiveChallenges(){

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Cardio/GetActivChallenges`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            config.timeout
        );

        return response;
      }
}
