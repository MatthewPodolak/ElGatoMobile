import config from '../../../Config';
import AuthService from '../../Auth/AuthService';
import { fetchWithTimeout } from '../../ApiCalls/fetchWithTimeout.js';

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
}
