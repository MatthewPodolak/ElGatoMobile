import config from '../../../Config';
import AuthService from '../../Auth/AuthService';
import { fetchWithTimeout } from '../../ApiCalls/fetchWithTimeout.js';

export default class CommunityDataService {

    static async getFollowedList(setIsAuthenticated, navigation, state = true){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Community/GetUserFollowers?onlyFollowed=${state}`,
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

    static async withdrawFollowRequest(setIsAuthenticated, navigation, userToUnFollowId){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Community/RemoveFollowRequest?userIdToRemoveRequestFrom=${userToUnFollowId}`,
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

    static async getFriendsLeaderboard(setIsAuthenticated, navigation){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Community/GetFriendsLeaderboards`,
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

    static async getProfileData(setIsAuthenticated, navigation, userId = null){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

         const baseUrl = `${config.ipAddress}/api/Community/GetUserProfile`;
         const url = userId ? `${baseUrl}?userId=${encodeURIComponent(userId)}`: baseUrl;

          const response = await fetchWithTimeout(
            url,
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

    static async getFollowersRequests(setIsAuthenticated, navigation){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
          `${config.ipAddress}/api/Community/GetFollowersRequests`,
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

    static async respondToFollowRequest(setIsAuthenticated, navigation, model){
      const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
          `${config.ipAddress}/api/Community/RespondToFollowRequest`,
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

    static async blockUser(setIsAuthenticated, navigation, userId){
      const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
          `${config.ipAddress}/api/Community/BlockUser?userToBlockId=${userId}`,
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
}