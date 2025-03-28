import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_LOCATION_TASK = 'background-location-task';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    return;
  }
  if (data) {
    const { locations } = data;
    const transformedLocations = locations.map(loc => ({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      break: true,
      timestamp: loc.timestamp || Date.now(),
    }));
    
    const stored = await AsyncStorage.getItem('routeLocations');
    let routeLocations = stored ? JSON.parse(stored) : [];
    
    routeLocations = routeLocations.concat(transformedLocations);
    await AsyncStorage.setItem('routeLocations', JSON.stringify(routeLocations));
  }
});

export { BACKGROUND_LOCATION_TASK };
