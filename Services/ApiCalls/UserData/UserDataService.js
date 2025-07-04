import config from '../../../Config';
import AuthService from '../../Auth/AuthService';
import { fetchWithTimeout } from '../../ApiCalls/fetchWithTimeout.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class UserDataService {
    
    static async getUserCaloriesIntake(setIsAuthenticated, navigation) {
        const value = await AsyncStorage.getItem("calorieIntake");
        if(value != null){
            return JSON.parse(value);
        }

        const token = await AuthService.getToken();

        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetUserCaloriesIntake`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            },
            config.timeout
        );

        if(!response.ok){
            return null;
        }

        const data = await response.json();
        return data;
    };

    static async getCurrentUserMakroIntake(setIsAuthenticated, navigation, currentDate){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetUserCurrentDayCalorieIntake?date=${encodeURIComponent(currentDate)}`,
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

    static async getCurrentUserWeight(setIsAuthenticated, navigation){
        const value = await AsyncStorage.getItem("currentWeight");
        if(value != null){
            return value;
        }

        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetUserWeight`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            },
            config.timeout
        );

        if(!response.ok){
            return 0;
        }

        const weightValue = await response.json();
        await AsyncStorage.setItem("currentWeight", JSON.stringify(weightValue));

        return weightValue;
    };

    static async getUserWeightType(setIsAuthenticated, navigation){
        const value = await AsyncStorage.getItem("measureType");
        if(value != null){
            return value;
        }
        
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetUserMeasurmentsSystem`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            },
            config.timeout
        );

        if(!response.ok){
            return "metric";
        }

        const measureType = await response.json();
        await AsyncStorage.setItem("measureType", measureType);

        return measureType;
    };

    static async getDailyStepsGoal(){
        const stepsGoalValue = await AsyncStorage.getItem("dailyStepsGoal");
        if(stepsGoalValue != null){
            return JSON.parse(stepsGoalValue);
        }

        let basicGoal = 3000;
        await AsyncStorage.setItem("dailyStepsGoal", JSON.stringify(basicGoal));
        return basicGoal;
    }

    static async setDailyStepsGoal(value){
        await AsyncStorage.setItem("dailyStepsGoal", JSON.stringify(value));
    }

    static async getDailyWaterIntakeGoal(){
        const waterIntakeGoal = await AsyncStorage.getItem("dailyWaterIntakeGoal");
        if(waterIntakeGoal != null){
            return JSON.parse(waterIntakeGoal);
        }

        let basicWaterIntake = 2000;
        await AsyncStorage.setItem("dailyWaterIntakeGoal", JSON.stringify(basicWaterIntake));
        return basicWaterIntake;
    }

    static async setDailyWaterIntakeGoal(value) {
        await AsyncStorage.setItem("dailyWaterIntakeGoal", JSON.stringify(value));
    }

    static async setCaloriesSource(source){ //both or app
        if(source !== "both" && source !== "app"){ return; }

        await AsyncStorage.setItem("calorieSource", JSON.stringify(source));
    }

    static async getCalorieSource(){
        const calorieSource = await AsyncStorage.getItem("calorieSource");
        if(calorieSource != null){
            return JSON.parse(calorieSource);
        }

        await AsyncStorage.setItem("calorieSource", JSON.stringify("both"));
        return "both";
    }

    static async updateLayoutAnimationState(setIsAuthenticated, navigation, state){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        let layout = { animations: state, chartStack: [] };
        try {
            const json = await AsyncStorage.getItem("layoutData");
            if (json) {
            const parsed = JSON.parse(json);
            layout.chartStack = Array.isArray(parsed.chartStack) ? parsed.chartStack : [];
            }
        } catch {

        }

        let model = {
            animations: state
        };

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/UpdateUserLayout`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(model),
            },
            config.timeout
        );

        if (response.ok){
            await AsyncStorage.setItem("layoutData", JSON.stringify(layout));
        }

        return response;
    }

    static async getUserCurrentWaterIntake(setIsAuthenticated, navigation, currentDate){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetUserWaterIntake?date=${encodeURIComponent(currentDate)}`,
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

    static async addWaterToCurrentDay(setIsAuthenticated, navigation, data){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Diet/AddWater`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            },
            config.timeout
        );

        return response;
    };

    static async saveUserLayoutDataToAsyncStorage(data){
        await AsyncStorage.setItem("layoutData", JSON.stringify(data));
    };

    static async getUserLayout(setIsAuthenticated, navigation){
        const value = await AsyncStorage.getItem("layoutData");
        if(value != null){
            try {
                return JSON.parse(value);
            } catch (error) {
                return null;
            }
        }

        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetUserLayoutData`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            },
            config.timeout
        );

        if(response.ok){
            data = await response.json();
            await AsyncStorage.setItem("layoutData", JSON.stringify(data));
            return data;
        }

        return null;
    };

    static async getPastExerciseData(setIsAuthenticated, navigation, data){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
            await AuthService.logout(setIsAuthenticated, navigation);
            return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetPastDataForExercises`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            },
            config.timeout
        );

        return response;
    };

    static async getMuscleUsageData(setIsAuthenticated, navigation, period) {
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }
        
        const baseUrl = `${config.ipAddress}/api/UserData/GetTrainedMuscleData`;
        const url = period != null ? `${baseUrl}?period=${encodeURIComponent(period)}`: baseUrl;
        
        const response = await fetchWithTimeout(
          url,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          },
          config.timeout
        );
      
        return response;
      };
      
      static async getPastMakroData(setIsAuthenticated, navigation, period){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }
        
        const baseUrl = `${config.ipAddress}/api/UserData/GetPastMakroData`;
        const url = period != null ? `${baseUrl}?period=${encodeURIComponent(period)}`: baseUrl;
        
        const response = await fetchWithTimeout(
          url,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          },
          config.timeout
        );
      
        return response;
      };

      static async getUserDailyMakroDist(setIsAuthenticated, navigation, currentDate){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetCurrentDailyMakroDistribution?date=${encodeURIComponent(currentDate)}`,
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

      static async updateUserLayoutData(setIsAuthenticated, navigation, model){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/UpdateUserLayout`,
            {
                method: 'PATCH',
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

    static async updateProfileData(setIsAuthenticated, navigation, model){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const formData = new FormData();
        if (model.newName !== undefined && model.newName !== null) {
            formData.append('NewName', model.newName);
        }
        if (model.newDesc !== undefined && model.newDesc !== null) {
            formData.append('NewDesc', model.newDesc);
        }
        if (model.isVisible !== undefined && model.isVisible !== null) {
            formData.append('IsVisible', model.isVisible);
        }

        if (model.newImageUri) {
            const fileName = model.newImageUri.split('/').pop();
            const fileType = fileName.split('.').pop();

            formData.append('NewImage', {
                uri: model.newImageUri,
                name: fileName,
                type: `image/${fileType}`,
            });
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/UpdateProfileInformation`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              body: formData,
            },
            (config.timeout)
        );

        return response;
    }

    static async setNewProfilePictureForUser(newUserPfp){
        await AsyncStorage.setItem("currentPfp", newUserPfp);
    }

    static async getUserProfilePicture(setIsAuthenticated, navigation){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        let profilePicture = await AsyncStorage.getItem("currentPfp");
        if(profilePicture){
            return profilePicture;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/Community/GetUserProfilePicture`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            },
            config.timeout
        );

        if(response.ok){
            const data = await response.text();
            await this.setNewProfilePictureForUser(data);
            return data;
        }

        return null;
    }

    static async getCurrentlyBurntCalories(setIsAuthenticated, navigation, date){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetCurrentBurntCalories?date=${encodeURIComponent(date)}`,
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

    static async getUserWeightHistory(setIsAuthenticated, navigation){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/GetWeightHistory`,
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

    static async addWeightForToday(setIsAuthenticated, navigation, model){
        const token = await AuthService.getToken();
        if (!token || AuthService.isTokenExpired(token)) {
          await AuthService.logout(setIsAuthenticated, navigation);
          return null;
        }

        const response = await fetchWithTimeout(
            `${config.ipAddress}/api/UserData/AddWeight`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(model)
            },
            config.timeout
        );

        return response;
    }
}
