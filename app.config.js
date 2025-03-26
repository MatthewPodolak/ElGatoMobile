import 'dotenv/config';


export default {
  expo: {
    name: "elgatomobile",
    slug: "elgatomobile",
    newArchEnabled: true,
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#FF8303"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "Allow ElGatoMobile to access the camera to scan barcodes.",
        NSMotionUsageDescription: "Allow ElGatoMobile to access motion data to track your daily step count.",
        NSLocationWhenInUseUsageDescription: "Allow ElGatoMobile to access your location while you use the app.",
        NSLocationAlwaysUsageDescription: "Allow ElGatoMobile to access your location in the background."
      }
    },
    android: {
      permissions: [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.health.READ_STEPS",
        "android.permission.health.READ_ACTIVE_CALORIES_BURNED"
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.anonymous.ElGatoMobile",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    androidStatusBar: {
      barStyle: "light-content",
      backgroundColor: "#FF8303",
      translucent: false
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-font",
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(ElGatoFitness) to access your camera"
        }
      ],
      "expo-health-connect",
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            minSdkVersion: 26
          }
        }
      ],
      "./plugins/withHealthConnectPermissionDelegate",
      "./plugins/withGoogleMapsKey",
    ],
    extra: {
      eas: {
        projectId: process.env.EAS_PROJ_ID
      }
    }
  }
};