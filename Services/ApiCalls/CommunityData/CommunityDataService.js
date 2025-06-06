import config from '../../../Config';
import AuthService from '../../Auth/AuthService';
import { fetchWithTimeout } from '../../ApiCalls/fetchWithTimeout.js';

export default class CommunityDataService {

    static async getFollowedList(setIsAuthenticated, navigation){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Community/GetUserFollowers?onlyFollowed=${true}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
            (config.timeout)
          );

          return response;
    }

    static async followUser(setIsAuthenticated, navigation, userToFollowId){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Community/FollowUser?userToFollowId=${userToFollowId}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
            (config.timeout)
          );

          return response;
    }

    static async unfollowUser(setIsAuthenticated, navigation, userToUnFollowId){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Community/UnFollowUser?userToUnfollowId=${userToUnFollowId}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
            (config.timeout)
          );

          return response;
    }
}
