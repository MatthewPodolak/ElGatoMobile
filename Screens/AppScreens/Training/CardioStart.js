import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, StatusBar, Modal, TouchableWithoutFeedback, ScrollView, Image, AppState, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { UrlTile, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from "lottie-react-native";
import routeEncoder from '../../../Services/Helpers/Location/RouteEncoder.js';

import { AuthContext } from '../../../Services/Auth/AuthContext.js';
import { activities } from '../../../assets/Data/activities.js';
import { GlobalStyles } from '../../../Styles/GlobalStyles.js';
import {checkHealthConnectPermissionsStatus, acessReadPermissionHealthConnect} from '../../../Services/Helpers/Activity/ActivityPermissionHelper.js';
import { checkAndRequestLocationPermission } from '../../../Services/Helpers/Location/LocationPermissionHelper.js';
import { BACKGROUND_LOCATION_TASK } from '../../../Services/Tasks/Location/BackgroundLocationTask.js';
import { calculateBurntCalories } from '../../../Services/Conversion/TrainingDataToBurntCalories.js';
import { checkAndRequestBluetoothPermissionAndroid } from '../../../Services/Helpers/Bluetooth/BluetoothPermissionHelper.js';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

import ChevronLeft from '../../../assets/main/Diet/chevron-left.svg';
import PulseIcon from '../../../assets/main/Diet/heart-pulse.svg';
import GlobeIcon from '../../../assets/main/Diet/globe.svg';
import StartIcon from '../../../assets/main/Diet/play-fill.svg';
import StopIcon from '../../../assets/main/Diet/stop-fill.svg';
import CloseIcon from '../../../assets/main/Diet/x-lg.svg';
import MapLayers from '../../../assets/main/Diet/layer.svg';
import PointMap from '../../../assets/main/Diet/point.svg';
import MapMarkerStatic from '../../../assets/main/Navigation/gps_icon.png';
import UserDataService from '../../../Services/ApiCalls/UserData/UserDataService.js';

function CardioStart({ navigation }) {
  const { setIsAuthenticated } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null);
  const [mapLayer, setMapLayer] = useState("normal");
  const [invalidTrainingModal, setInvalidTrainingModalVisible] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [locationWarning, setLocationWarning] = useState(false);
  const [checkingLocationPermissions, setCheckingLocationPermissions] = useState(true);
  const [isLocationPermitted, setIsLocationPermitted] = useState(false);
  const [activityType, setActivityType] = useState("Running");
  const [activitySelectorModalVisible, setActivitySelectorModalVisible] = useState(false);
  const [trainingStartedHud, setTrainingStartedHud] = useState(false);
  const [trainingSessionActive, setTrainingSessionActive] = useState(false);
  const [trainingDataVisible, setTrainingDataVisible] = useState(false);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);

  //Timer
  const [startTime, setStartTime] = useState(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const intervalRef = useRef(null);

  //Routes
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const timerActiveRef = useRef();
  const trainingSessionActiveRef = useRef(trainingSessionActive);
  useEffect(() => {
    timerActiveRef.current = timerActive;
  }, [timerActive]);
  useEffect(() => {
    trainingSessionActiveRef.current = trainingSessionActive;
  }, [trainingSessionActive]);

  //devices
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [blePermissionEbabled, setBlePermissionEbabled] = useState(false);
  const [searchingForDevices, setSearchingForDevices] = useState(true);
  const [avbDevices, setAvbDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [connectedDeviceName, setConnectedDeviceName] = useState("device");
  const [connectingToDevice, setConntectingToDevice] = useState(false);
  const bleManagerRef = useRef(new BleManager());
  const heartRateSubscriptionRef = useRef(null);
  const [deviceConnectionError, setDeviceConnectionError] = useState(false);
  const [deviceConnectionErrorMsg, setDeviceConnectionErrorMsg] = useState(null);
  const [measureDeviceEnabled, setMeasureDeviceEnabled] = useState(false);

  //measuring
  const [caloriePermissionGranted, setCaloriePermissionGranted] = useState(false);
  const [heartRatePermissionGranted, setHeartRatePermissionGranted] = useState(false);
  const [userWeight, setUserWeight] = useState(80);
  const [caloriesBurnt, setCaloriesBurnt] = useState(0);
  const [currentHeartRate, setCurrentHeartRate] = useState(0);

  const trainingStartTimestampRef = useRef(null);
  const [heartRateTimeline, setHeartRateTimeline] = useState([]);
  const [speedTimeline, setSpeedTimeline] = useState([]);
  const lastLoggedHeartRateRef = useRef(null);
  const lastLoggedSpeedRef = useRef(null);

  const activeActivity = activities.find(activity => activity.name === activityType);
  const groupedActivities = activities.reduce((acc, activity) => {
    if (!acc[activity.Group]) {
      acc[activity.Group] = [];
    }
    acc[activity.Group].push(activity);
    return acc;
  }, {});

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const permissionsToCheck = [
          { type: "ActiveCaloriesBurned", setter: setCaloriePermissionGranted },
          { type: "HeartRate", setter: setHeartRatePermissionGranted }
        ];
  
        for (const { type, setter } of permissionsToCheck) {
          const granted = await checkHealthConnectPermissionsStatus(type);
          if (!granted) {
            const requested = await acessReadPermissionHealthConnect(type);
            setter(requested);
          } else {
            setter(true);
          }
        }
  
      } else if (Platform.OS === 'ios') {
        //TODO IOS impl. perm.
      }
    };

    const getUserWeight = async () => {
      try{
        const weightVal = await UserDataService.getCurrentUserWeight(setIsAuthenticated, navigation);
        setUserWeight(weightVal);
      }catch(error){
        setUserWeight(80);
      }
    };
  
    requestPermissions();
    getUserWeight();
  }, []);
  

  const handleDeviceModal = async () => {
    if (Platform.OS === 'android') {
      const granted = await checkAndRequestBluetoothPermissionAndroid();
      setBlePermissionEbabled(granted);
    }else if (Platform.OS === 'ios'){
      //TODO ios
    }

    setDeviceModalVisible(prev => !prev);
    if(!measureDeviceEnabled){
      scanForBleDevices();
    }
  };
  
  const scanForBleDevices = () => {
    setDeviceConnectionError(false);
    setDeviceConnectionErrorMsg(null);
    setSelectedDeviceId(null);
    setConntectingToDevice(false);
    setSearchingForDevices(true);
    setAvbDevices([]);
    
    bleManagerRef.current.startDeviceScan(null, null, (error, device) => {
      if (error) {
        return;
      }

      if (device && device.name) {
        setAvbDevices((prevDevices) => {
          if (!prevDevices.find((d) => d.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });

    setTimeout(() => {
      bleManagerRef.current.stopDeviceScan();
      setSearchingForDevices(false);
    }, 10000);
  };

  //dispose ble
  useEffect(() => {
    return () => {
      if (heartRateSubscriptionRef.current) {
        heartRateSubscriptionRef.current.remove();
      }
      bleManagerRef.current.destroy();
    };
  }, []);

  const handleDeviceConnect = async () => {
    setConntectingToDevice(true);
    try{
      const device = await bleManagerRef.current.connectToDevice(selectedDeviceId);
      const connectedDevice = await device.discoverAllServicesAndCharacteristics();
      if (!connectedDevice?.serviceUUIDs.find(uuid => uuid === "0000180d-0000-1000-8000-00805f9b34fb")) {
        bleManagerRef.current.cancelDeviceConnection(selectedDeviceId);
        setDeviceConnectionError(true);
        setDeviceConnectionErrorMsg("This device does not support heart rate measuring.");
        return;
      }else{
        subscribeToHeartRate(device);
      }

      setConnectedDeviceName(avbDevices.find((device) => device.id === selectedDeviceId)?.name);
      setMeasureDeviceEnabled(true);
    }catch(error){
      setDeviceConnectionError(true);
    }
  };

  const subscribeToHeartRate = async (device) => {
    const serviceUUID = "0000180d-0000-1000-8000-00805f9b34fb";
    const characteristicUUID = "00002a37-0000-1000-8000-00805f9b34fb";

    try {
      const subscription = device.monitorCharacteristicForService(serviceUUID, characteristicUUID,
        (error, characteristic) => {
          if (error) {
            if (error.message && error.message.includes("Operation was cancelled")) {
              return;
            }
            return;
          }

          const base64Value = characteristic.value;
          if (!base64Value) return;
          const decodedBytes = Buffer.from(base64Value, 'base64');
          const flags = decodedBytes[0];
          let heartRate;
          if ((flags & 0x01) === 0) {
            heartRate = decodedBytes[1];
          } else {
            heartRate = decodedBytes.readUInt16LE(1);
          }
          setCurrentHeartRate(heartRate);
          if (timerActiveRef.current && heartRate !== lastLoggedHeartRateRef.current) {
            const now = Date.now();
            const elapsedSinceStart = Math.floor((now - trainingStartTimestampRef.current) / 1000);
            const formattedTime = formatTime(elapsedSinceStart);

            setHeartRateTimeline(prev => [
              ...prev,
              { time: formattedTime, value: heartRate }
            ]);
            lastLoggedHeartRateRef.current = heartRate;
          }
        }
      );

      heartRateSubscriptionRef.current = subscription;

    } catch (error) {
      await bleManagerRef.current.cancelDeviceConnection(selectedDeviceId);
      setDeviceConnectionError(true);
      setDeviceConnectionErrorMsg("This device does not support heart rate measuring.");
    }
  };

  useEffect(() => {
    let subscription;
    (async () => {
      try {
        const permitted = await checkAndRequestLocationPermission();
        setIsLocationPermitted(permitted);
        setCheckingLocationPermissions(false);
        if (permitted) {
          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
              maximumAge: 10000,
              timeout: 15000,
            });
            const { latitude, longitude, heading } = location.coords;
            setCurrentLocation({
              latitude,
              longitude,
              heading: heading || 0,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          } catch (error) {
            setCurrentLocation({
              latitude: 37.78825,
              longitude: -122.4324,
              heading: 0,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
            setLocationError(true);
          }
          subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 2000,
              distanceInterval: 1,
            },
            (newLocation) => {
              const { latitude, longitude, heading, speed: rawSpeed } = newLocation.coords;
              setCurrentLocation({
                latitude,
                longitude,
                heading: heading || 0,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              });
          
              const speedKmH = rawSpeed ? rawSpeed * 3.6 : 0;
              setSpeed(speedKmH);
              if (timerActiveRef.current) {
                const elapsedSinceStart = Math.floor((newLocation.timestamp - trainingStartTimestampRef.current) / 1000);
                const formattedTime = formatTime(elapsedSinceStart);

                if (speedKmH !== lastLoggedSpeedRef.current) {
                  setSpeedTimeline(prev => [
                    ...prev,
                    { time: formattedTime, value: speedKmH }
                  ]);
                  lastLoggedSpeedRef.current = speedKmH;
                }
              }

              if (trainingSessionActiveRef.current) {
                const locationRecord = {
                  latitude: latitude,
                  longitude: longitude,
                  break: !timerActiveRef.current,
                  timestamp: newLocation.timestamp,
                };
          
                setRouteCoordinates((prevCoords) => {
                  if (timerActiveRef.current) {
                    const lastActive = getLastActiveCoord(prevCoords);
                    if (lastActive) {
                      const d = haversineDistance(
                        lastActive.latitude,
                        lastActive.longitude,
                        latitude,
                        longitude
                      );
                      setDistance((prevDistance) => prevDistance + d);
                    }
                  }
                  return [...prevCoords, locationRecord];
                });
              }
            }
          );
        }
      } catch (error) {
        setCheckingLocationPermissions(false);
        setLocationError(true);
      }
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if(trainingSessionActive){
      const timeInMinutes = displayTime / 60;
      const calculatedCalories = calculateBurntCalories(activityType, userWeight, distance, speed, timeInMinutes);
      setCaloriesBurnt(calculatedCalories);
    }
  }, [displayTime, distance, speed, activityType, trainingSessionActive]);

  useEffect(() => {
    if (timerActive && startTime !== null) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = accumulatedTime + (now - startTime) / 1000;
        setDisplayTime(Math.floor(elapsed));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerActive, startTime, accumulatedTime]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (nextAppState === "active" && timerActive && startTime) {
        const now = Date.now();
        const elapsed = accumulatedTime + (now - startTime) / 1000;
        setDisplayTime(Math.floor(elapsed));
      }
    });
    return () => subscription.remove();
  }, [timerActive, startTime, accumulatedTime]);

  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  //TODO background-location-task
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async nextAppState => {
      if (nextAppState === "active") {
        const stored = await AsyncStorage.getItem('routeLocations');
        if (stored) {
          const backgroundLocations = JSON.parse(stored);
          const newLocations = backgroundLocations.filter(bgLoc => {
            return !routeCoordinates.some(rc =>
              rc.timestamp === bgLoc.timestamp
            );
          });
          if (newLocations.length > 0) {
            setRouteCoordinates(prev => [...prev, ...newLocations]);
          }
          await AsyncStorage.removeItem('routeLocations');
        }
      }
    });
    return () => subscription.remove();
  }, [routeCoordinates]);
  

  const startTraining = async () => {
    setTrainingDataVisible(true);
    setTrainingStartedHud(true);
    setTrainingSessionActive(true);
    setHeartRateTimeline([]);
    setSpeedTimeline([]);
    lastLoggedHeartRateRef.current = null;
    lastLoggedSpeedRef.current = null;
    trainingStartTimestampRef.current = Date.now();

    //timer
    if (!startTime) {
      setStartTime(Date.now());
    }
    setTimerActive(true);

    //TODO background-location-task
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 2000,
      distanceInterval: 1,
      foregroundService: {
        notificationTitle: "Training in Progress",
        notificationBody: "Your location is being tracked in the background.",
        notificationColor: "#FF4500",
      },
    });
  };

  const pauseTraining = () => {
    setTrainingStartedHud(false);
    
    //timer
    setTimerActive(false);
    if (startTime) {
      const elapsed = (Date.now() - startTime) / 1000;
      setAccumulatedTime(prev => prev + elapsed);
      setStartTime(null);
    }

  };

  const endTraining = async () => {
    if(distance === 0 || accumulatedTime < 10){
      setInvalidTrainingModalVisible(true);
      return;
    }

    setTrainingDataVisible(false);
    setTrainingSessionActive(false);
    setTrainingStartedHud(false);

    const encodedRoute = routeEncoder(routeCoordinates.filter(coord => !coord.break));
    
    let data = {
      distance: distance,
      duration: displayTime,
      calories: caloriesBurnt,
      heartRateTimeline: heartRateTimeline,
      speedTimeline: speedTimeline,
      encodedRoute: encodedRoute,
      activityType: activityType
    };

    setRouteCoordinates([]);
    setTimerActive(false);
    setStartTime(null);
    setAccumulatedTime(0);
    setDisplayTime(0);
    setHeartRateTimeline([]);
    setSpeedTimeline([]);
    lastLoggedHeartRateRef.current = null;
    lastLoggedSpeedRef.current = null;
    setCaloriesBurnt(0);
    
    //TODO - background-location-task
    //check imp.
    try {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    } catch (e) {
      console.warn("Failed to stop location updates:", e);
    }

    navigation.navigate('CardioSummary', { data });
  };

  const navigateBack = () => {
    navigation.goBack();
  };
  
  //map settings
  const centerMap = () => {
    if (mapRef.current && currentLocation) {
      const zoomedInRegion = { ...currentLocation, latitudeDelta: 0.005, longitudeDelta: 0.005 };
      mapRef.current.animateToRegion(zoomedInRegion, 1000);
    }
  };
  
  const toggleMapLayer = () => {
    setMapLayer(prevLayer => (prevLayer === "normal" ? "satellite" : "normal"));
  };
  

  const getRouteSegments = (coords) => {
    if (!coords.length) return [];
    const segments = [];
    let currentSegment = [coords[0]];

    for (let i = 1; i < coords.length; i++) {
      if (coords[i].break !== coords[i - 1].break) {
        segments.push({
          coordinates: currentSegment,
          color: coords[i - 1].break ? 'black' : '#FF4500'
        });
        currentSegment = [coords[i]];
      } else {
        currentSegment.push(coords[i]);
      }
    }
    segments.push({
      coordinates: currentSegment,
      color: currentSegment[0].break ? 'black' : '#FF6600'
    });
    return segments;
  };

  const segments = getRouteSegments(routeCoordinates);

  //DIST HELPERS
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) *  Math.cos(toRad(lat2)) *  Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  
  const getLastActiveCoord = (coords) => {
    for (let i = coords.length - 1; i >= 0; i--) {
      if (!coords[i].break) return coords[i];
    }
    return null;
  };
  

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={{ height: insets.top, backgroundColor: "#FF8303" }} />
      <StatusBar style="light" backgroundColor="#fff" translucent={false} hidden={false} />

      <View style={styles.topAndMapContainer}>
        <View style={styles.topContainer}>
          <View style={styles.topContIngBack}>
            <TouchableOpacity style={styles.topBack} onPress={navigateBack}>
              <ChevronLeft width={28} height={28} />
            </TouchableOpacity>
          </View>
          <View style={styles.topContIngTitle}>
            <Text numberOfLines={2} ellipsizeMode="tail" style={styles.topNameText}>
              {activityType}
            </Text>
          </View>
          <View style={styles.topContIngReport}>

          </View>
        </View>

        <View style={styles.mapContainer}>
          {checkingLocationPermissions ? (
            <View style={[GlobalStyles.flex, GlobalStyles.center]}>
              <ActivityIndicator size="large" color="#FF8303" />
            </View>
          ) : (
            <>
              {isLocationPermitted ? (
                <>
                  {currentLocation ? (
                    <>
                      <MapView ref={mapRef} style={GlobalStyles.flex} initialRegion={currentLocation}>
                        <UrlTile
                          urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          maximumZ={19}
                          flipY={false}
                          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: mapLayer === "normal" ? 1 : 0 }}
                        />
                        <UrlTile
                          urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                          maximumZ={19}
                          flipY={false}
                          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: mapLayer === "satellite" ? 1 : 0 }}
                        />
                        <Marker coordinate={currentLocation}>
                          <Image
                            source={MapMarkerStatic}
                            style={{
                              width: 30,
                              height: 30,
                              transform: [{ rotate: `${currentLocation.heading}deg` }],
                            }}
                          />
                        </Marker>
                        {segments.map((segment, index) => (
                          <Polyline key={index} coordinates={segment.coordinates} strokeColor={segment.color} strokeWidth={6} />
                        ))}
                      </MapView>
                      {locationError && (
                        <View style={[styles.mapInfoContainer, styles.errorBackground]}>
                          <Text style={[GlobalStyles.text16, { textAlign: 'center' }]}> Unable to fetch location. Check your internet connection. </Text>
                        </View>
                      )}
                      {locationWarning && (
                        <View style={[styles.mapInfoContainer, styles.warningBackground]}>
                          <Text style={[GlobalStyles.text16, { textAlign: 'center' }]}> GPS SIGNAL LOST </Text>
                        </View>
                      )}
                      <TouchableOpacity onPress={toggleMapLayer} style={[styles.mapRoundButton, {bottom: 10}, GlobalStyles.center]}>
                        <MapLayers width={22} height={22} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={centerMap} style={[styles.mapRoundButton, {bottom: 60}, GlobalStyles.center]}>
                        <PointMap width={22} height={22} />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                      <ActivityIndicator size="large" color="#FF8303" />
                    </View>
                  )}
                </>
              ) : (
                <View style={[GlobalStyles.flex, GlobalStyles.column]}>
                  <View style={{ flex: 0.8 }}>
                    {/*EL - GATO ERROR VIEW - LOCATION OFF.  --- musi byc wzmianka ze potrzeba allow all the time. TODO */}
                  </View>
                  <View style={[{ flex: 0.2, padding: 10 }, GlobalStyles.center]}>
                    <Text style={[GlobalStyles.text18, {textAlign: 'center'}]}>We won't be able to track your training without <Text style={[GlobalStyles.orange]}>location permissions</Text>.</Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {trainingDataVisible && (
          <View style={styles.trainingDataContainer}>
            <View style={[styles.trainingDataRow, GlobalStyles.center]}>
              <Text style={[GlobalStyles.text16]}>TIME</Text>
              <Text style={[GlobalStyles.text48, GlobalStyles.bold]}>{formatTime(displayTime)}</Text>
            </View>

            <View style={[styles.trainingDataRow, GlobalStyles.center]}>
              <Text style={[GlobalStyles.text16]}>SPEED</Text>
              <Text style={[GlobalStyles.text72, GlobalStyles.bold]}>{Math.floor(speed)}</Text>
              <Text style={[GlobalStyles.text16]}>KM/H</Text>
            </View>

            <View style={[styles.trainingDataRow, GlobalStyles.center]}>
              <Text style={[GlobalStyles.text16]}>DISTANCE</Text>
              <Text style={[GlobalStyles.text48, GlobalStyles.bold]}>{Math.floor(distance)}</Text>
              <Text style={[GlobalStyles.text16]}>M</Text>
            </View>

            <View style={[styles.trainingDataRowDivided]}>
              <View style={[{flex: 0.5}, GlobalStyles.center]}>
                <Text style={[GlobalStyles.text16]}>CALORIES</Text>
                <Text style={[GlobalStyles.text32, GlobalStyles.bold, GlobalStyles.orange]}>{Math.floor(caloriesBurnt)}</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={[{flex: 0.5}, GlobalStyles.center]}>
                <Text style={[GlobalStyles.text16]}>PULSE</Text>
                {measureDeviceEnabled ? (
                  <Text style={[GlobalStyles.text32, GlobalStyles.bold]}>{currentHeartRate}</Text>
                ):(
                  <Text style={[GlobalStyles.text32, GlobalStyles.bold]}>--|--</Text>
                )}               
              </View>
            </View>

          </View>
        )}
      </View>

      <View style={styles.hudContainer}>
        {!trainingStartedHud && !trainingSessionActive && (
          <TouchableOpacity onPress={() => setActivitySelectorModalVisible(true)} style={styles.smallCircle}>
            {activeActivity && (
              <View style={styles.activityIconWrapper}>
                <activeActivity.Icon width={26} height={26} fill="#000" />
              </View>
            )}
          </TouchableOpacity>
        )}

        {!trainingStartedHud && trainingSessionActive && (
          <TouchableOpacity onPress={() => endTraining()} style={[styles.smallCircle, { backgroundColor: 'red' }]}>
            <View style={styles.activityIconWrapper}>
              <Text style={[GlobalStyles.bold, GlobalStyles.white, GlobalStyles.text18]}>END</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.largeCircle}>
          {!trainingStartedHud ? (
            <TouchableOpacity style={styles.iconWrapper} onPress={() => startTraining()}>
              <StartIcon width={64} height={64} fill="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => pauseTraining()}>
              <StopIcon width={64} height={64} fill="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {!trainingSessionActive ? (
          <TouchableOpacity style={[styles.smallCircleRight, GlobalStyles.center]} onPress={() => handleDeviceModal()}>
            <PulseIcon width={32} height={32} fill="#000" style={{ marginTop: 5 }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.smallCircleRight, GlobalStyles.center]}
            onPress={() => setTrainingDataVisible(!trainingDataVisible)}
          >
            <GlobeIcon width={32} height={32} fill="#000" style={{ marginTop: -2 }} />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={activitySelectorModalVisible}
        statusBarTranslucent
        onRequestClose={() => setActivitySelectorModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setActivitySelectorModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <ScrollView
                  style={GlobalStyles.flex}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                >
                  <View style={styles.activityInfoContainer}>
                    <Text style={GlobalStyles.text16}>Select activity</Text>
                    <TouchableOpacity onPress={() => setActivitySelectorModalVisible(false)}>
                      <CloseIcon width={20} height={20} fill="#000" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.activitySelectContainer}>
                    {Object.entries(groupedActivities).map(([groupName, activitiesInGroup]) => (
                      <View key={groupName}>
                        <Text style={[GlobalStyles.text18, styles.groupHeader]}>{groupName}:</Text>
                        <View style={styles.activitySelectContainer}>
                          {activitiesInGroup.map((activity, index) => {
                            const IconComponent = activity.Icon;
                            return (
                              <TouchableOpacity key={index} style={styles.activityItem} onPress={() => setActivityType(activity.name)}>
                                <IconComponent width={24} height={24} fill={activityType === activity.name ? "#FF6600" : "#000"} />
                                <Text style={[ styles.activityText, GlobalStyles.text16, activityType === activity.name && { color: "#FF6600" }, ]}>
                                  {activity.name}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal 
        animationType="slide"
        transparent={true}
        visible={deviceModalVisible}
        statusBarTranslucent
        onRequestClose={() => setDeviceModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDeviceModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View
                  style={GlobalStyles.flex}
                  contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                >
                 <View style={[GlobalStyles.center, {padding: 5,}]}>
                    <Text style={[GlobalStyles.text16]}>DEVICES</Text>
                 </View>
                 <View style={[styles.devicesDisplayContainer, GlobalStyles.center]}>
                    {blePermissionEbabled ? (
                      <>
                      {connectingToDevice ? (
                        <>                     
                          <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                          {(measureDeviceEnabled && !deviceConnectionError) ? (
                            <>
                              <LottieView
                                source={require("../../../assets/main/Lottie/ble_connected.json")}
                                autoPlay
                                loop={false}
                                style={[styles.lottie]}
                              />
                              <Text style={[GlobalStyles.text16, {marginTop: 15}]}>connected to <Text style={[GlobalStyles.bold]}>{connectedDeviceName}</Text></Text>
                            </>
                          ) : deviceConnectionError && !measureDeviceEnabled ? (
                            <>
                              <LottieView
                                source={require("../../../assets/main/Lottie/ble_cancelled.json")}
                                autoPlay
                                loop={false}
                                style={[styles.lottie]}
                              />
                              <Text style={[GlobalStyles.text18, {marginTop: 20}]}>Connection failed. <Text style={[GlobalStyles.orange]}>Try another device.</Text></Text>
                              <Text style={[GlobalStyles.text16, {marginTop: 5, textAlign: 'center'}]}>{deviceConnectionErrorMsg}</Text>
                            </>
                          ) : (
                            <>
                              <LottieView
                                source={require("../../../assets/main/Lottie/ble_connected.json")}
                                style={[styles.lottie]}
                              />
                              <Text style={[GlobalStyles.text16, {marginTop: 15}]}>connecting to {connectedDeviceName}</Text>
                            </>
                          )}                           
                          </View>
                        </>
                      ):(
                        <>
                          {searchingForDevices && avbDevices.length === 0 ? (
                            <View style={[GlobalStyles.flex, GlobalStyles.center]}>
                              <ActivityIndicator size="large" color="#FF8303" />
                            </View>
                          ):(
                            <>
                              <FlatList
                                data={avbDevices}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => {
                                  const isSelected = item.id === selectedDeviceId;
                                  return (
                                    <TouchableOpacity onPress={() => setSelectedDeviceId(item.id)}>
                                      <View
                                        style={{
                                          padding: 10,
                                          alignItems: 'flex-start',
                                          backgroundColor: isSelected ? '#FF8303' : 'transparent',
                                          borderRadius: 5,
                                          marginVertical: 5,
                                        }}
                                      >
                                        <Text
                                          style={[
                                            GlobalStyles.text16,
                                            { color: isSelected ? '#fff' : '#000' },
                                          ]}
                                        >
                                          {item.name}
                                        </Text>
                                      </View>
                                    </TouchableOpacity>
                                  );
                                }}
                                ListFooterComponent={searchingForDevices ? () => (<ActivityIndicator size="large" color="#FF8303" style={{ marginVertical: 20 }}/> ): null}
                              />
                            </>
                          )}
                        </>
                      )}                    
                      </>
                    ):(
                      <>
                        <Text>NOT ENABLED</Text>
                        {/* EL GATO ERROR VIEW - BLE NOT ENABLED */}
                      </>
                    )}
                 </View>

                 {(selectedDeviceId && !connectingToDevice) && (
                  <TouchableOpacity onPress={() => handleDeviceConnect()} style={[styles.connectButton, GlobalStyles.center]}>
                    <Text style={[GlobalStyles.text16, GlobalStyles.white]}>connect</Text>
                  </TouchableOpacity>
                 )}

                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent={true}
        visible={invalidTrainingModal}
        statusBarTranslucent
        onRequestClose={() => setInvalidTrainingModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setInvalidTrainingModalVisible(false)}>
        <View style={styles.invalidTrainingDataModalCont}>
                 <View style={styles.invalidTrainingDataModalContentCont}>
                    <Text style={[GlobalStyles.text18, GlobalStyles.bold]}>Are you done yet?</Text>
                    <Text style={[GlobalStyles.text14, {marginTop: 5}]}>ElGato needs more data to properly aknowladge your training. Just move a little or discard your current progress.</Text>
                    <View style={styles.invalidTrainingContentOptionRow}>
                      <TouchableOpacity onPress={() => navigateBack()}>
                        <Text style={[GlobalStyles.text14, GlobalStyles.bold]}>Discard</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setInvalidTrainingModalVisible(false)}>
                        <Text style={[GlobalStyles.text14, GlobalStyles.orange, GlobalStyles.bold]}>Continue</Text>
                      </TouchableOpacity>
                    </View>
                 </View>
        </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  topAndMapContainer: {
    flex: 0.8,
    position: 'relative',
  },
  topContainer: {
    width: '100%',
    height: '11%',
    backgroundColor: '#FF8303',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topContIngBack: {
    width: '15%',
    height: '100%',
  },
  topContIngTitle: {
    width: '70%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topContIngReport: {
    width: '15%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBack: {
    position: 'absolute',
    left: 10,
    height: '100%',
    justifyContent: 'center',
  },
  topNameText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  trainingDataContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'whitesmoke',
    zIndex: 1,
  },
  trainingDataRow: {
    flexDirection: 'column',
    borderBottomColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 25,
    borderBottomWidth: 0.8,
    marginTop: 5,
  },
  trainingDataRowDivided:{
    flexDirection: 'row',
    paddingVertical: 15,
  },
  hudContainer: {
    borderTopColor: 'rgba(0, 0, 0, 0.4)',
    borderTopWidth: 1,
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  smallCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'whitesmoke',
    position: 'absolute',
    borderColor: 'black',
    borderWidth: 1,
    left: 40,
    bottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  smallCircleRight: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'whitesmoke',
    position: 'absolute',
    borderColor: 'black',
    borderWidth: 1,
    right: 40,
    bottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  largeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff4500',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'black',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  mapRoundButton:{
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'whitesmoke',
    position: 'absolute',
    borderColor: 'black',
    borderWidth: 1,
    right: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  iconWrapper: {
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIconWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    height: '90%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  activityInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  activitySelectContainer: {
    flexDirection: 'column',
    paddingVertical: 5,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  activityText: {
    marginLeft: 10,
  },
  groupHeader: {
    fontSize: 18,
    fontFamily: 'Helvetica',
    marginTop: 10,
    marginBottom: 5,
  },
  mapInfoContainer: {
    minHeight: 50,
    backgroundColor: 'red',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    padding: 10,
  },
  errorBackground: {
    backgroundColor: 'red',
  },
  warningBackground: {
    backgroundColor: '#98D8EF',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'black',
    marginHorizontal: 10,
  },


  devicesDisplayContainer: {
    flex: 1,
    borderTopColor: 'gray',
    borderTopWidth: 1,
    marginTop: 10,
  },
  connectButton: {
    width: '90%',
    minHeight: 50,
    borderRadius: 25,
    backgroundColor: '#ff6600',
    marginLeft: '5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lottie: {
    width: 250, 
    height: 250,
    marginTop: -50,
    alignSelf: 'center'
  },
  
  invalidTrainingDataModalCont: {
  flex: 1,
  position: 'relative',
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
invalidTrainingDataModalContentCont: {
  width: '70%',
  height: '20%',
  minHeight: 100,
  backgroundColor: 'whitesmoke',
  position: 'absolute',
  padding: 15,
},
invalidTrainingContentOptionRow: {
  justifyContent: 'space-between',
  flexDirection: 'row',
  marginTop: 10,
}
});

export default CardioStart;
