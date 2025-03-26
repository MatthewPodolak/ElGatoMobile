import { Platform } from 'react-native';
import AppleHealthKit from 'react-native-health';
import { initialize, requestPermission, getGrantedPermissions } from 'react-native-health-connect';

// --- ANDROID --- //

export const checkHealthConnectPermissionsStatus = async (permissionType) => {
  if (Platform.OS !== 'android') {
    return false;
  }

  const isInitialized = await initialize();
  if (!isInitialized) {
    return false;
  }

  try{
    const permissions = await getGrantedPermissions();
    console.log("granted --> " + JSON.stringify(permissions));
    return permissions.some((perm) => perm.recordType === permissionType);
    
  } catch(error){
    return false;
  }
};

export const acessReadPermissionHealthConnect = async (permissionType) => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const isInitialized = await initialize();
    if (!isInitialized) {
      console.log("NOT INIT");
      return false;
    }

    const grantedPermissions = await requestPermission([
      { accessType: 'read', recordType: permissionType },
    ]);

    console.log("USER DID -> " + JSON.stringify(grantedPermissions));
    return grantedPermissions.some((perm) => perm.recordType === permissionType);

  } catch (error) {
    console.log("ERROR ??? " + error);
    return false;
  }
};


// --- END OF ANDROID HELPERS --- //
// --- IOS --- //

export const checkAndRequestHealthKitPermissions = async () => {
  if (Platform.OS !== 'ios') {
    return false;
  }

  const permissions = {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.StepCount,
        AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
        AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      ],
      write: []
    }
  };
  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(permissions, (error, results) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};