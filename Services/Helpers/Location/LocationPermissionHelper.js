import * as Location from 'expo-location';

export const checkAndRequestLocationPermission = async () => {
  const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Location.requestForegroundPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus === 'granted') {
    const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') {
      const { status: requestedBgStatus } = await Location.requestBackgroundPermissionsAsync();
      finalStatus = requestedBgStatus;
    }
  }

  return finalStatus === 'granted';
};